import {getRTStructFromElements} from '../dicom/dicomRTStruct.js';
import {MaskSegment} from '../dicom/dicomSegment.js';
import {safeGet, safeGetAll} from '../dicom/dataElement.js';
import {
  dateToDateObj,
  getDicomDate,
  dateToTimeObj,
  getDicomTime,
} from '../dicom/dicomDate.js';
import {getReferencedSeriesUIDFromRTStruct} from '../dicom/dicomImage.js';
import {
  getElementsFromSimpleTagValues,
  mergeTagValues
} from '../dicom/simpleTagValues.js';
import {transferSyntaxKeywords} from '../dicom/dictionary.js';
import {getDwvVersion} from '../dicom/dicomParser.js';
import {getUID} from '../dicom/dicomWriter.js';
import {MaskImage} from './maskImage.js';
import {ColourMap} from './luts.js';
import {SegmentCollection} from './segmentCollection.js';
import {
  bufferToPolygons,
  findHolePolygons,
  fillPolygons
} from './maskPolygons.js';
import {RGB} from '../utils/colour.js';
import {Point} from '../math/point.js';
import {Index} from '../math/index.js';
import {logger} from '../utils/logger.js';

/**
 * @import {Image} from './image.js';
 * @import {DataElement} from '../dicom/dataElement.js';
 * @import {SimpleTagValues} from '../dicom/types.js';
 */

/**
 * Related DICOM tag keys.
 */
const TagKeys = {
  ReferencedFrameOfReferenceSequence: '30060010'
};

/**
 * Meta tag keys: tags copied into the mask meta at load and
 *   written back at save.
 */
const MetaTagKeys = {
  // patient
  PatientName: '00100010',
  PatientID: '00100020',
  PatientBirthDate: '00100030',
  PatientSex: '00100040',
  // general study
  StudyDate: '00080020',
  StudyTime: '00080030',
  StudyInstanceUID: '0020000D',
  StudyID: '00200010',
  ReferringPhysicianName: '00080090',
  AccessionNumber: '00080050',
  // rt series
  SeriesDate: '00080021',
  SeriesTime: '00080031',
  SeriesInstanceUID: '0020000E',
  SeriesNumber: '00200011',
  OperatorsName: '00081070',
  // frame of reference
  FrameOfReferenceUID: '00200052',
  PositionReferenceIndicator: '00201040',
  // general equipment
  Manufacturer: '00080070',
  ManufacturerModelName: '00081090',
  DeviceSerialNumber: '00181000',
  SoftwareVersions: '00181020',
  // structure set
  InstanceNumber: '00200013',
  StructureSetLabel: '30060002',
  StructureSetName: '30060004',
  StructureSetDescription: '30060006'
};

/**
 * Type 2 tags of the RT Structure Set IOD modules filled by dwv:
 *   they are written with an empty value if not set.
 *
 * Ref: {@link https://dicom.nema.org/medical/dicom/2024a/output/chtml/part03/sect_A.19.3.html}.
 */
const Type2TagNames = [
  // patient
  'PatientName',
  'PatientID',
  'PatientBirthDate',
  'PatientSex',
  // general study
  'StudyDate',
  'StudyTime',
  'ReferringPhysicianName',
  'StudyID',
  'AccessionNumber',
  // rt series
  'SeriesNumber',
  'OperatorsName',
  // frame of reference
  'PositionReferenceIndicator'
];

/**
 * Detached Study Management SOP Class UID (retired), the study SOP class
 *   used in the RT Referenced Study Sequence.
 *
 * Ref: {@link https://dicom.nema.org/medical/dicom/2024a/output/chtml/part03/sect_C.8.8.5.4.html}.
 */
const StudySOPClassUID = '1.2.840.10008.3.1.2.3.1';

/**
 * Get the referenced frame of reference UID from an RT Structure Set.
 *
 * Path: ReferencedFrameOfReferenceSequence (3006,0010) →
 *   FrameOfReferenceUID (0020,0052), first item.
 *
 * Ref: {@link https://dicom.nema.org/medical/dicom/2024a/output/chtml/part03/sect_C.8.8.5.html}.
 *
 * @param {Record<string, DataElement>} dataElements The data elements.
 * @returns {string|undefined} The frame of reference UID.
 */
function getReferencedFrameOfReferenceUIDFromRTStruct(dataElements) {
  const refForSeq = safeGetAll(
    dataElements, TagKeys.ReferencedFrameOfReferenceSequence);
  if (typeof refForSeq === 'undefined') {
    return undefined;
  }
  return safeGet(refForSeq[0], MetaTagKeys.FrameOfReferenceUID);
}

/**
 * Required DICOM tags for RT Structure Set Storage.
 *
 * @type {Array<{name: string, enum: Array}>}
 */
const RTStructRequiredTags = [
  {
    name: 'TransferSyntaxUID',
    enum: [transferSyntaxKeywords.ExplicitVRLittleEndian]
  },
  {name: 'MediaStorageSOPClassUID', enum: ['1.2.840.10008.5.1.4.1.1.481.3']},
  {name: 'SOPClassUID', enum: ['1.2.840.10008.5.1.4.1.1.481.3']},
  {name: 'Modality', enum: ['RTSTRUCT']},
  {name: 'StructureSetLabel', enum: ['RT Structure Set']}
];

/**
 * Get the default DICOM RT Structure Set tags as an object.
 *
 * @returns {SimpleTagValues} The default tags.
 */
export function getDefaultDicomRTStructJson() {
  /** @type {SimpleTagValues} */
  const tags = {};
  for (const tag of RTStructRequiredTags) {
    tags[tag.name] = tag.enum[0];
  }
  return tags;
}

/**
 * {@link Image} factory for DICOM RT Structure Set (RTSTRUCT).
 *
 * Rasterizes ROI contour polygons into a PALETTE COLOR mask image using
 * the same geometry as the reference CT/MR image so that the result can
 * be rendered by the existing mask pipeline.
 */
export class RtStructFactory {

  /**
   * Possible warning created by checkElements.
   *
   * @type {string|undefined}
   */
  #warning;

  /**
   * Get a warning string if elements are not as expected.
   *
   * @returns {string|undefined} The warning.
   */
  getWarning() {
    return this.#warning;
  }

  /**
   * Check dicom elements.
   *
   * @param {Record<string, DataElement>} _dataElements The DICOM data elements.
   * @returns {string|undefined} A possible warning.
   */
  checkElements(_dataElements) {
    this.#warning = undefined;
    return this.#warning;
  }

  /**
   * Get a {@link MaskImage} from RTSTRUCT DICOM elements.
   *
   * Contours are rasterized into a Uint8Array whose voxel values are
   * segment numbers (0 = background, 1..N = ROI index).
   * A PALETTE COLOR colour map maps each segment number to the ROI's
   * display colour.
   *
   * @param {Record<string, DataElement>} dataElements The DICOM data elements.
   * @param {Image} refImage The reference image (CT/MR) that was loaded first.
   * @returns {MaskImage} The mask image.
   * @throws {Error} If the reference image geometry cannot be used.
   */
  create(dataElements, refImage) {
    const rois = getRTStructFromElements(dataElements);

    const geo = refImage.getGeometry();
    const size = geo.getSize();
    const width = size.get(0);
    const height = size.get(1);
    const nSlices = size.get(2);
    const sliceSize = width * height;

    const collection = new SegmentCollection(geo);

    // build segments and palette luts
    const segments = [];
    const redLut = [0];
    const greenLut = [0];
    const blueLut = [0];

    for (let roiIndex = 0; roiIndex < rois.length; ++roiIndex) {
      const roi = rois[roiIndex];
      const segNum = roiIndex + 1; // 1-based segment number

      const segment = new MaskSegment(
        segNum, roi.name, roi.generationAlgorithm ?? 'MANUAL');
      segment.interpretedType = roi.interpretedType;
      segment.roiInterpreter = roi.roiInterpreter;
      segment.displayRGBValue = new RGB(
        roi.colour.r, roi.colour.g, roi.colour.b);
      segments.push(segment);

      redLut[segNum] = roi.colour.r;
      greenLut[segNum] = roi.colour.g;
      blueLut[segNum] = roi.colour.b;

      // group this ROI's contours by slice: a slice can hold several
      // contours (outer boundary plus nested hole boundaries) that must be
      // rasterized together with an even-odd rule, not one by one, or a
      // hole contour would just add more filled area instead of punching
      // one out. CLOSED_PLANAR relies on this being an implicit convention
      // (containment/even-odd); CLOSEDPLANAR_XOR makes the same combination
      // explicit (PS3.3 C.8.8.6) - treat both the same way.
      const polygonsByZ = new Map();
      for (const contour of roi.contours) {
        if (contour.type !== 'CLOSED_PLANAR' &&
          contour.type !== 'CLOSEDPLANAR_XOR') {
          continue;
        }
        const raw = contour.points3D;
        if (raw.length < 9) {
          // need at least 3 points (9 values)
          continue;
        }

        // convert 3D patient coords to continuous pixel coords using
        // worldToPoint (unlike worldToIndex, it does not apply Math.floor,
        // preserving sub-pixel positions needed for correct rasterization)
        const pts2D = [];
        for (let i = 0; i < raw.length; i += 3) {
          const p = geo.worldToPoint(
            new Point([raw[i], raw[i + 1], raw[i + 2]]));
          pts2D.push({x: p.getX(), y: p.getY(), z: p.getZ()});
        }

        // all points of a planar contour share the same z index
        const z = Math.round(pts2D[0].z);
        if (z < 0 || z >= nSlices) {
          continue;
        }

        if (!polygonsByZ.has(z)) {
          polygonsByZ.set(z, []);
        }
        polygonsByZ.get(z).push(pts2D);
      }

      // rasterize each slice's contours together into a binary buffer
      // then hand off to the collection
      for (const [z, polygons] of polygonsByZ) {
        const tmpSlice = new Uint8Array(sliceSize);
        fillPolygons(tmpSlice, 0, width, height, polygons, 1);
        collection.addFrame(segNum, tmpSlice, 0, z, sliceSize, segNum);
      }
    }

    // build image UIDs (simple sequential, matching slice order)
    const uids = [];
    for (let k = 0; k < nSlices; ++k) {
      uids.push(refImage.getImageUid(new Index([0, 0, k])));
    }

    // create mask image from the merged label map
    const image = new MaskImage(
      geo, collection.getLabelMap(), uids, collection);
    image.setPhotometricInterpretation('PALETTE COLOR');
    image.setPaletteColourMap(new ColourMap(redLut, greenLut, blueLut));

    // build meta
    const safeGetLocal = (key) => safeGet(dataElements, key);
    const meta = {Modality: 'RTSTRUCT'};
    for (const key of Object.keys(MetaTagKeys)) {
      const val = safeGetLocal(MetaTagKeys[key]);
      if (typeof val !== 'undefined') {
        meta[key] = val;
      }
    }
    // the Frame of Reference module is optional in the RT Structure Set IOD,
    // fallback to the (first) referenced frame of reference
    if (typeof meta.FrameOfReferenceUID === 'undefined') {
      meta.FrameOfReferenceUID =
        getReferencedFrameOfReferenceUIDFromRTStruct(dataElements);
    }
    if (typeof meta.FrameOfReferenceUID === 'undefined') {
      logger.warn('Loaded RT STRUCT has no FrameOfReferenceUID.');
    }

    // custom
    meta.custom = {
      segments,
      referencedSeriesUID: getReferencedSeriesUIDFromRTStruct(dataElements)
    };

    // carry length unit from reference image when available
    const refMeta = refImage.getMeta();
    if (typeof refMeta.lengthUnit !== 'undefined') {
      meta.lengthUnit = refMeta.lengthUnit;
    }
    image.setMeta(meta);

    return image;
  }

  /**
   * Convert a {@link MaskImage} into DICOM RT Structure Set elements.
   *
   * Traces each segment's pixel regions (and their holes) per slice along
   * the pixel edges, then maps the 2D pixel coordinates back to 3D
   * patient-space coordinates. The contours go around the pixels: loading
   * the result gives back the same mask.
   *
   * The image meta is not modified.
   *
   * @param {MaskImage} image The mask image.
   * @param {MaskSegment[]|undefined} segments The mask segments, defaults
   *   to the image meta segments if undefined.
   * @param {Image} sourceImage The source image, used for the references
   *   to the contoured study, series and images.
   * @param {SimpleTagValues} [extraTags] Optional list of extra tags,
   *   for example the equipment tags (Manufacturer, ManufacturerModelName,
   *   DeviceSerialNumber, SoftwareVersions) of the embedding application,
   *   they default to dwv ones.
   * @returns {Record<string, DataElement>} The DICOM data elements.
   */
  toDicom(image, segments, sourceImage, extraTags) {
    // the referenced series is needed to load the result
    if (typeof sourceImage === 'undefined') {
      throw new Error('Cannot create DICOM RTSTRUCT without source image');
    }
    const sourceMeta = sourceImage.getMeta();

    const tags = getDefaultDicomRTStructJson();

    // copy patient/study/series tags from image meta
    const meta = image.getMeta();
    for (const key of Object.keys(MetaTagKeys)) {
      const val = meta[key];
      if (typeof val !== 'undefined') {
        tags[key] = val;
      }
    }

    // use image segments if not provided
    if (typeof segments === 'undefined') {
      segments = meta.custom?.segments ?? [];
    }

    // keep source image StudyInstanceUID
    tags.StudyInstanceUID = sourceMeta.StudyInstanceUID;

    // equipment: the one that produces this instance, not the one
    //   of an input mask, the embedding application can set its own
    //   via the extra tags
    // https://dicom.nema.org/medical/dicom/2024a/output/chtml/part03/sect_C.7.5.html#sect_C.7.5.1
    tags.Manufacturer = 'dwv';
    tags.ManufacturerModelName = 'DWV';
    tags.DeviceSerialNumber = '1';
    tags.SoftwareVersions = getDwvVersion();

    // frame of reference: shared with the source image
    if (typeof tags.PositionReferenceIndicator === 'undefined') {
      tags.PositionReferenceIndicator = sourceMeta.PositionReferenceIndicator;
    }

    // instance: each call creates a new SOP instance
    tags.SOPInstanceUID = getUID();
    // series: the mask one if it is an RTSTRUCT one (for ex the one of
    //   a loaded RTSTRUCT, a series has a single modality) or a new one
    if (meta.Modality !== 'RTSTRUCT' ||
      typeof tags.SeriesInstanceUID === 'undefined' ||
      tags.SeriesInstanceUID === '') {
      tags.SeriesInstanceUID = getUID();
      tags.SeriesNumber = '1';
    }
    if (typeof tags.SeriesNumber === 'undefined' ||
      tags.SeriesNumber === '') {
      tags.SeriesNumber = '1';
    }

    // structure set: label is type 1, instance number type 3
    // https://dicom.nema.org/medical/dicom/2024a/output/chtml/part03/sect_C.8.8.5.html
    if (typeof tags.StructureSetLabel === 'undefined' ||
      tags.StructureSetLabel === '') {
      tags.StructureSetLabel = getDefaultDicomRTStructJson().StructureSetLabel;
    }
    if (typeof tags.InstanceNumber === 'undefined' ||
      tags.InstanceNumber === '') {
      tags.InstanceNumber = '1';
    }

    // type 2: present, possibly empty
    for (const name of Type2TagNames) {
      if (typeof tags[name] === 'undefined') {
        tags[name] = '';
      }
    }

    // content date/time
    const now = new Date();
    tags.StructureSetDate = getDicomDate(dateToDateObj(now));
    tags.StructureSetTime = getDicomTime(dateToTimeObj(now));

    const geometry = image.getGeometry();
    const sourceGeometry = sourceImage.getGeometry();

    /**
     * Get the source image SOP reference of a mask slice.
     *
     * @param {number} k The mask slice index.
     * @returns {object} The SOP reference item.
     */
    const getSourceReference = function (k) {
      const posPat = geometry.getOrigins()[k];
      const sourceIndex = sourceGeometry.worldToIndex(
        new Point([posPat.getX(), posPat.getY(), posPat.getZ()])
      );
      return {
        ReferencedSOPClassUID: sourceMeta.SOPClassUID,
        ReferencedSOPInstanceUID: sourceImage.getImageUid(sourceIndex)
      };
    };

    // referenced study, series and images: the contour image sequence
    //   lists all the source images
    // https://dicom.nema.org/medical/dicom/2024a/output/chtml/part03/sect_C.8.8.5.html
    const contourImages = [];
    const sourceSize = sourceGeometry.getSize();
    for (let k = 0; k < sourceSize.get(2); ++k) {
      contourImages.push({
        ReferencedSOPClassUID: sourceMeta.SOPClassUID,
        ReferencedSOPInstanceUID:
          sourceImage.getImageUid(new Index([0, 0, k]))
      });
    }
    tags.ReferencedFrameOfReferenceSequence = {
      value: [{
        FrameOfReferenceUID: tags.FrameOfReferenceUID ?? '',
        RTReferencedStudySequence: {
          value: [{
            ReferencedSOPClassUID: StudySOPClassUID,
            ReferencedSOPInstanceUID: sourceMeta.StudyInstanceUID ?? '',
            RTReferencedSeriesSequence: {
              value: [{
                SeriesInstanceUID: sourceMeta.SeriesInstanceUID ?? '',
                ContourImageSequence: {value: contourImages}
              }]
            }
          }]
        }
      }]
    };

    const size = geometry.getSize();
    const width = size.get(0);
    const height = size.get(1);
    const nSlices = size.get(2);
    const sliceSize = width * height;
    const buffer = /** @type {Uint8Array} */ (image.getBuffer());
    const hasOverlap = image.getHasOverlap();
    const allSegmentFrames = hasOverlap
      ? image.getSegmentCollection()?.getAll()
      : undefined;

    const roiItems = [];
    const contourItems = [];
    const obsItems = [];

    for (const segment of segments) {
      const segNum = segment.number;
      const colour = segment.displayRGBValue ?? {r: 255, g: 0, b: 0};

      roiItems.push({
        ROINumber: segNum,
        ROIName: segment.label,
        ReferencedFrameOfReferenceUID: tags.FrameOfReferenceUID ?? '',
        ROIGenerationAlgorithm: segment.algorithmType ?? 'MANUAL'
      });

      obsItems.push({
        ObservationNumber: segNum,
        ReferencedROINumber: segNum,
        RTROIInterpretedType: segment.interpretedType ?? 'ORGAN',
        ROIInterpreter: segment.roiInterpreter ?? ''
      });

      // collect contour sequences across all slices
      const contourSeq = [];
      let hasHole = false;
      const segFrames = allSegmentFrames?.get(segNum);
      for (let z = 0; z < nSlices; z++) {
        const useOverlapFrame = hasOverlap && segFrames?.has(z);
        const sliceBuffer = useOverlapFrame ? segFrames.get(z) : buffer;
        const sliceOffset = useOverlapFrame ? 0 : z * sliceSize;
        const outerPolygons = bufferToPolygons(
          sliceBuffer, sliceOffset, width, height, segNum);
        // enclosed background regions are written as their own nested
        // contours in the same ContourSequence
        const holePolygons = outerPolygons.length > 0
          ? findHolePolygons(sliceBuffer, sliceOffset, width, height, segNum)
          : [];
        const polygons = outerPolygons.concat(holePolygons);
        if (holePolygons.length > 0) {
          hasHole = true;
        }
        // the polygons go around the pixels, they are exact:
        //   no simplification
        for (const polygon of polygons) {
          // convert 2D pixel coords to 3D patient-space coords
          const points3D = [];
          for (const pt of polygon) {
            const world = geometry.indexToWorld(new Index([pt.x, pt.y, z]));
            points3D.push(world.get(0), world.get(1), world.get(2));
          }
          contourSeq.push({
            ContourImageSequence: {value: [getSourceReference(z)]},
            ContourGeometricType: undefined,
            NumberOfContourPoints: polygon.length,
            ContourData: points3D
          });
        }
      }
      // with a hole, tag the contours as CLOSEDPLANAR_XOR so readers
      // combine them via an explicit XOR rule instead of relying on
      // the older CLOSED_PLANAR containment convention; without,
      // keep the more broadly supported CLOSED_PLANAR. The type is
      // the same for all the contours of an ROI: 'If any of the Contours
      // within an ROI is of Contour Geometric Type CLOSEDPLANAR_XOR, all
      // Contours of that ROI shall be of the same type.'
      // https://dicom.nema.org/medical/dicom/2024a/output/chtml/part03/sect_C.8.8.6.html#sect_C.8.8.6.1
      const geometricType = hasHole ? 'CLOSEDPLANAR_XOR' : 'CLOSED_PLANAR';
      for (const contour of contourSeq) {
        contour.ContourGeometricType = geometricType;
      }

      contourItems.push({
        ReferencedROINumber: segNum,
        ROIDisplayColor: [colour.r, colour.g, colour.b],
        ContourSequence: {value: contourSeq}
      });
    }

    tags.StructureSetROISequence = {value: roiItems};
    tags.ROIContourSequence = {value: contourItems};
    tags.RTROIObservationsSequence = {value: obsItems};

    // merge extra tags if provided
    if (typeof extraTags !== 'undefined') {
      mergeTagValues(tags, extraTags);
    }
    // file meta: same instance as the dataset
    tags.MediaStorageSOPInstanceUID = tags.SOPInstanceUID;

    return getElementsFromSimpleTagValues(tags);
  }
}
