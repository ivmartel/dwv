// doc imports
/* eslint-disable no-unused-vars */
import {DataElement} from './dataElement';
/* eslint-enable no-unused-vars */

/**
 * Related DICOM tag keys.
 */
const tagKeys = {
  PixelOriginInterpretation: '00480301',
  GraphicData: '00700022',
  GraphicType: '00700023',
  FiducialUID: '0070031A'
};

/**
 * DICOM spatial coordinate (SCOORD): item of a SR content sequence.
 *
 * Ref: {@link https://dicom.nema.org/medical/dicom/2022a/output/chtml/part03/sect_C.18.6.html#table_C.18.6-1}.
 */
export class SpatialCoordinate {
  /**
   * @type {string[]}
   */
  graphicData;

  /**
   * @type {string}
   */
  graphicType;

  /**
   * @type {string}
   */
  pixelOriginInterpretation;

  /**
   * @type {string}
   */
  fiducialUID;

  /**
   * Get a string representation of this object.
   *
   * @returns {string} The object as string.
   */
  toString() {
    return this.graphicType +
      ' {' + this.graphicData + '}';
  };
};

/**
 * Get a scoord object from a dicom element.
 *
 * @param {Object<string, DataElement>} dataElements The dicom element.
 * @returns {SpatialCoordinate} A scoord object.
 */
export function getSpatialCoordinate(dataElements) {
  const scoord = new SpatialCoordinate();

  if (typeof dataElements[tagKeys.GraphicData] !== 'undefined') {
    scoord.graphicData = dataElements[tagKeys.GraphicData].value;
  }
  if (typeof dataElements[tagKeys.GraphicType] !== 'undefined') {
    scoord.graphicType = dataElements[tagKeys.GraphicType].value[0];
  }
  if (typeof dataElements[tagKeys.PixelOriginInterpretation] !== 'undefined') {
    scoord.pixelOriginInterpretation =
      dataElements[tagKeys.PixelOriginInterpretation].value[0];
  }
  if (typeof dataElements[tagKeys.FiducialUID] !== 'undefined') {
    scoord.fiducialUID = dataElements[tagKeys.FiducialUID].value[0];
  }
  return scoord;
};

/**
 * Get a simple dicom element item from a scoord object.
 *
 * @param {SpatialCoordinate} scoord The scoord object.
 * @returns {Object<string, any>} The item as a list of (key, value) pairs.
 */
export function getDicomSpatialCoordinateItem(scoord) {
  // dicom item (tags are in group/element order)
  const item = {};

  if (typeof scoord.pixelOriginInterpretation !== 'undefined') {
    item.PixelOriginInterpretation = scoord.pixelOriginInterpretation;
  }
  if (typeof scoord.graphicData !== 'undefined') {
    item.GraphicData = scoord.graphicData;
  }
  if (typeof scoord.graphicType !== 'undefined') {
    item.GraphicType = scoord.graphicType;
  }
  if (typeof scoord.fiducialUID !== 'undefined') {
    item.FiducialUID = scoord.fiducialUID;
  }

  // return
  return item;
}
