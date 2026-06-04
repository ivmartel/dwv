import {getRTStructFromElements} from '../dicom/dicomRTStruct.js';
import {MaskSegment} from '../dicom/dicomSegment.js';
import {safeGet} from '../dicom/dataElement.js';
import {Image} from './image.js';
import {ColourMap} from './luts.js';
import {SegmentCollection} from './segmentCollection.js';
import {RGB} from '../utils/colour.js';
import {Point} from '../math/point.js';
import {Index} from '../math/index.js';

/**
 * @import {DataElement} from '../dicom/dataElement.js';
 */

/**
 * Patient/study/series tags to copy into mask meta.
 */
const MetaTagKeys = {
  PatientName: '00100010',
  PatientID: '00100020',
  PatientBirthDate: '00100030',
  PatientSex: '00100040',
  StudyDate: '00080020',
  StudyInstanceUID: '0020000D',
  StudyID: '00200010',
  SeriesInstanceUID: '0020000E',
  SeriesNumber: '00200011',
  FrameOfReferenceUID: '00200052'
};

/**
 * Fill a closed polygon into a flat Uint8Array slice using a scanline
 * even-odd rule.
 *
 * @param {Uint8Array} buffer The mask buffer (all slices).
 * @param {number} sliceOffset Byte offset of the current slice in buffer.
 * @param {number} width Slice width in pixels.
 * @param {number} height Slice height in pixels.
 * @param {{x: number, y: number}[]} pts Polygon vertices in pixel coords.
 * @param {number} value Segment number to write.
 */
function fillPolygon(buffer, sliceOffset, width, height, pts, value) {
  const n = pts.length;
  if (n < 3) {
    return;
  }

  const yMin = Math.max(0,
    Math.floor(Math.min(...pts.map((p) => p.y))));
  const yMax = Math.min(height - 1,
    Math.ceil(Math.max(...pts.map((p) => p.y))));

  for (let y = yMin; y <= yMax; ++y) {
    // find x-intersections at scanline y
    const xs = [];
    for (let i = 0; i < n; ++i) {
      const p1 = pts[i];
      const p2 = pts[(i + 1) % n];
      if ((p1.y <= y && p2.y > y) || (p2.y <= y && p1.y > y)) {
        xs.push(p1.x + (y - p1.y) / (p2.y - p1.y) * (p2.x - p1.x));
      }
    }
    xs.sort((a, b) => a - b);
    // fill pairs
    for (let k = 0; k + 1 < xs.length; k += 2) {
      const xStart = Math.max(0, Math.round(xs[k]));
      const xEnd = Math.min(width - 1, Math.round(xs[k + 1]));
      for (let x = xStart; x <= xEnd; ++x) {
        buffer[sliceOffset + y * width + x] = value;
      }
    }
  }
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
   * Get a mask {@link Image} from RTSTRUCT DICOM elements.
   *
   * Contours are rasterized into a Uint8Array whose voxel values are
   * segment numbers (0 = background, 1..N = ROI index).
   * A PALETTE COLOR colour map maps each segment number to the ROI's
   * display colour.
   *
   * @param {Record<string, DataElement>} dataElements The DICOM data elements.
   * @param {Image} refImage The reference image (CT/MR) that was loaded first.
   * @returns {Image} The mask image.
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

      const segment = new MaskSegment(segNum, roi.name, 'MANUAL');
      segment.displayRGBValue = new RGB(
        roi.colour.r, roi.colour.g, roi.colour.b);
      segments.push(segment);

      redLut[segNum] = roi.colour.r;
      greenLut[segNum] = roi.colour.g;
      blueLut[segNum] = roi.colour.b;

      for (const contour of roi.contours) {
        if (contour.type !== 'CLOSED_PLANAR') {
          continue;
        }
        const raw = contour.points3D;
        if (raw.length < 9) {
          // need at least 3 points (9 values)
          continue;
        }

        // convert 3D patient coords to image indices
        const pts2D = [];
        for (let i = 0; i < raw.length; i += 3) {
          const idx = geo.worldToIndex(
            new Point([raw[i], raw[i + 1], raw[i + 2]]));
          pts2D.push({x: idx.get(0), y: idx.get(1), z: idx.get(2)});
        }

        // all points of a planar contour share the same z index
        const z = Math.round(pts2D[0].z);
        if (z < 0 || z >= nSlices) {
          continue;
        }

        // rasterize into a per-slice binary buffer then hand off to collection
        const tmpSlice = new Uint8Array(sliceSize);
        fillPolygon(tmpSlice, 0, width, height, pts2D, 1);
        collection.addFrame(segNum, tmpSlice, 0, z, sliceSize, segNum);
      }
    }

    // build image UIDs (simple sequential, matching slice order)
    const uids = [];
    for (let k = 0; k < nSlices; ++k) {
      uids.push(refImage.getImageUid(new Index([0, 0, k])));
    }

    // create mask image from the merged label map
    const image = new Image(geo, collection.getLabelMap(), uids);
    image.setSegmentCollection(collection);
    image.setPhotometricInterpretation('PALETTE COLOR');
    image.setPaletteColourMap(new ColourMap(redLut, greenLut, blueLut));

    // build meta
    const safeGetLocal = (key) => safeGet(dataElements, key);
    const meta = {Modality: 'RTSTRUCT', custom: {segments}};
    for (const key of Object.keys(MetaTagKeys)) {
      const val = safeGetLocal(MetaTagKeys[key]);
      if (typeof val !== 'undefined') {
        meta[key] = val;
      }
    }
    // carry length unit from reference image when available
    const refMeta = refImage.getMeta();
    if (typeof refMeta.lengthUnit !== 'undefined') {
      meta.lengthUnit = refMeta.lengthUnit;
    }
    image.setMeta(meta);

    return image;
  }
}
