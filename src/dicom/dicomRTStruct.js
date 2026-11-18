import {safeGet, safeGetAll} from './dataElement.js';
import {
  cielabToSrgb,
  uintLabToLab
} from '../utils/colour.js';
import {logger} from '../utils/logger.js';
import {getDefaultColour} from '../utils/colour.js';

/**
 * @import {DataElement} from './dataElement.js';
 */

/**
 * Related DICOM tag keys.
 */
const TagKeys = {
  RecommendedDisplayCIELabValue: '0062000D',
  // Structure Set ROI Sequence (3006,0020)
  StructureSetROISequence: '30060020',
  ROINumber: '30060022',
  ROIName: '30060026',
  ROIGenerationAlgorithm: '30060036',
  // ROI Contour Sequence (3006,0039)
  ROIContourSequence: '30060039',
  ReferencedROINumber: '30060084',
  ROIDisplayColor: '3006002A',
  ContourSequence: '30060040',
  ContourGeometricType: '30060042',
  NumberOfContourPoints: '30060046',
  ContourData: '30060050',
  // RT ROI Observations Sequence (3006,0080)
  RTROIObservationsSequence: '30060080',
  RTROIInterpretedType: '300600A4',
  ROIInterpreter: '300600A6'
};

/**
 * A single planar contour of an RT ROI.
 */
export class RTROIContour {
  /**
   * Contour geometric type (e.g. 'CLOSED_PLANAR').
   *
   * @type {string}
   */
  type;

  /**
   * Flat array of 3D patient-space coordinates in mm:
   *   [x0,y0,z0, x1,y1,z1, ...].
   *
   * @type {number[]}
   */
  points3D;
}

/**
 * An RT Region of Interest with its display colour and contours.
 */
export class RTROI {
  /**
   * ROI number as stored in the DICOM file.
   *
   * @type {number}
   */
  number;

  /**
   * ROI name.
   *
   * @type {string}
   */
  name;

  /**
   * Display colour as {r, g, b} values in [0, 255].
   *
   * @type {{r: number, g: number, b: number}}
   */
  colour;

  /**
   * ROI generation algorithm (e.g. 'MANUAL', 'SEMIAUTOMATIC', 'AUTOMATIC').
   *
   * @type {string|undefined}
   */
  generationAlgorithm;

  /**
   * RT ROI interpreted type (e.g. 'GTV', 'CTV', 'PTV', 'ORGAN').
   *
   * @type {string|undefined}
   */
  interpretedType;

  /**
   * Name of the person who interpreted the ROI.
   *
   * @type {string|undefined}
   */
  roiInterpreter;

  /**
   * List of contours belonging to this ROI.
   *
   * @type {RTROIContour[]}
   */
  contours;
}

/**
 * Get a list of {@link RTROI} objects from RTSTRUCT DICOM elements.
 *
 * @param {Record<string, DataElement>} dataElements The DICOM data elements.
 * @returns {RTROI[]} The list of RT ROIs.
 */
export function getRTStructFromElements(dataElements) {
  // build ROINumber → name/algorithm maps from StructureSetROISequence
  const roiNameMap = {};
  const roiGenerationAlgorithmMap = {};
  const roiSeq = safeGetAll(dataElements, TagKeys.StructureSetROISequence);
  if (typeof roiSeq !== 'undefined') {
    for (const roiItem of roiSeq) {
      const num = safeGet(roiItem, TagKeys.ROINumber);
      const name = safeGet(roiItem, TagKeys.ROIName);
      const generationAlgorithm =
        safeGet(roiItem, TagKeys.ROIGenerationAlgorithm);
      if (typeof num !== 'undefined') {
        roiNameMap[num] = name ?? `ROI ${num}`;
        roiGenerationAlgorithmMap[num] = generationAlgorithm;
      }
    }
  }

  // build ReferencedROINumber → interpreted type/interpreter map
  // from RTROIObservationsSequence
  const roiObservationMap = {};
  const obsSeq = safeGetAll(
    dataElements, TagKeys.RTROIObservationsSequence);
  if (typeof obsSeq !== 'undefined') {
    for (const obsItem of obsSeq) {
      const num = safeGet(obsItem, TagKeys.ReferencedROINumber);
      if (typeof num !== 'undefined') {
        roiObservationMap[num] = {
          interpretedType: safeGet(obsItem, TagKeys.RTROIInterpretedType),
          roiInterpreter: safeGet(obsItem, TagKeys.ROIInterpreter)
        };
      }
    }
  }

  const rois = [];

  const contourSeq = safeGetAll(dataElements, TagKeys.ROIContourSequence);
  if (typeof contourSeq === 'undefined') {
    return rois;
  }

  for (const contourItem of contourSeq) {
    const roiNum = safeGet(contourItem, TagKeys.ReferencedROINumber);

    // parse display colour
    const colorValues = safeGetAll(contourItem, TagKeys.ROIDisplayColor);
    const cielabValues = safeGetAll(
      contourItem, TagKeys.RecommendedDisplayCIELabValue
    );
    let colour;
    if (typeof colorValues !== 'undefined' && colorValues.length === 3) {
      colour = {
        r: parseInt(colorValues[0], 10),
        g: parseInt(colorValues[1], 10),
        b: parseInt(colorValues[2], 10)
      };
    } else if (typeof cielabValues !== 'undefined' &&
      cielabValues.length === 3) {
      colour = cielabToSrgb(uintLabToLab({
        l: cielabValues[0],
        a: cielabValues[1],
        b: cielabValues[2]
      }));
    } else {
      logger.warn('No recommended colour for contour, using default');
      colour = getDefaultColour(roiNum);
    }

    // parse contours
    const contours = [];
    const contourDataSeq = safeGetAll(contourItem, TagKeys.ContourSequence);
    if (typeof contourDataSeq !== 'undefined') {
      for (const contourDataItem of contourDataSeq) {
        const geomType =
          safeGet(contourDataItem, TagKeys.ContourGeometricType);
        const rawData = safeGetAll(contourDataItem, TagKeys.ContourData);
        if (typeof rawData === 'undefined') {
          continue;
        }
        const contour = new RTROIContour();
        contour.type = geomType ?? 'CLOSED_PLANAR';
        contour.points3D = rawData.map((v) => parseFloat(v));
        contours.push(contour);
      }
    }

    const roi = new RTROI();
    roi.number = typeof roiNum !== 'undefined' ? parseInt(roiNum, 10) : 0;
    roi.name = roiNameMap[roi.number] ?? `ROI ${roi.number}`;
    roi.generationAlgorithm = roiGenerationAlgorithmMap[roi.number];
    roi.interpretedType = roiObservationMap[roi.number]?.interpretedType;
    roi.roiInterpreter = roiObservationMap[roi.number]?.roiInterpreter;
    roi.colour = colour;
    roi.contours = contours;
    rois.push(roi);
  }

  return rois;
}
