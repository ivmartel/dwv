// doc imports
/* eslint-disable no-unused-vars */
import {DataElement} from './dataElement';
/* eslint-enable no-unused-vars */

/**
 * Related DICOM tag keys.
 */
const TagKeys = {
  GraphicData: '00700022',
  GraphicType: '00700023',
  ReferencedFrameofReferenceUID: '30060024',
  FiducialUID: '0070031A'
};

/**
 * DICOM spatial coordinate 3D (SCOORD3D): item of a SR content sequence.
 *
 * Ref: {@link https://dicom.nema.org/medical/dicom/2022a/output/chtml/part03/sect_C.18.9.html#table_C.18.9-1}.
 */
export class SpatialCoordinate3D {
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
  referencedFrameofReferenceUID;

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
      '{' + this.graphicData + '}';
  };
};

/**
 * Get a scoord3d object from a dicom element.
 *
 * @param {Object<string, DataElement>} dataElements The dicom element.
 * @returns {SpatialCoordinate3D} A scoord3d object.
 */
export function getSpatialCoordinate3D(dataElements) {
  const scoord = new SpatialCoordinate3D();

  if (typeof dataElements[TagKeys.GraphicData] !== 'undefined') {
    scoord.graphicData = dataElements[TagKeys.GraphicData].value;
  }
  if (typeof dataElements[TagKeys.GraphicType] !== 'undefined') {
    scoord.graphicType = dataElements[TagKeys.GraphicType].value[0];
  }
  if (typeof dataElements[TagKeys.ReferencedFrameofReferenceUID] !==
    'undefined') {
    scoord.referencedFrameofReferenceUID =
      dataElements[TagKeys.ReferencedFrameofReferenceUID].value[0];
  }
  if (typeof dataElements[TagKeys.FiducialUID] !== 'undefined') {
    scoord.fiducialUID = dataElements[TagKeys.FiducialUID].value[0];
  }
  return scoord;
};

/**
 * Get a simple dicom element item from a scoord3d object.
 *
 * @param {SpatialCoordinate3D} scoord The scoord3d object.
 * @returns {Object<string, any>} The item as a list of (key, value) pairs.
 */
export function getDicomSpatialCoordinate3DItem(scoord) {
  // dicom item (tags are in group/element order)
  const item = {};

  if (typeof scoord.graphicData !== 'undefined') {
    item.GraphicData = scoord.graphicData;
  }
  if (typeof scoord.graphicType !== 'undefined') {
    item.GraphicType = scoord.graphicType;
  }
  if (typeof scoord.referencedFrameofReferenceUID !== 'undefined') {
    item.ReferencedFrameofReferenceUID =
      scoord.referencedFrameofReferenceUID;
  }
  if (typeof scoord.fiducialUID !== 'undefined') {
    item.FiducialUID = scoord.fiducialUID;
  }

  // return
  return item;
}