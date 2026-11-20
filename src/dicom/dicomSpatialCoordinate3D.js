import {
  GraphicTypes,
  getScoordFromShape
} from './dicomSpatialCoordinate.js';
import {Point2D} from '../math/point.js';
import {Circle} from '../math/circle.js';
import {Ellipse} from '../math/ellipse.js';

/**
 * @import {DataElement} from './dataElement.js';
 * @import {SimpleTagValues} from './types.js';
 * @import {Point3D} from '../math/point.js';
 */

/**
 * DICOM 3D graphic types.
 *
 * Ref: {@link https://dicom.nema.org/medical/dicom/2024a/output/chtml/part03/sect_C.18.9.html#sect_C.18.9.1.2}.
 */
export const GraphicTypes3D = {
  point: 'POINT',
  multipoint: 'MULTIPOINT',
  polyline: 'POLYLINE',
  polygon: 'POLYGON',
  ellipse: 'ELLIPSE',
  ellipsoid: 'ELLIPSOID'
};

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
 * Ref: {@link https://dicom.nema.org/medical/dicom/2024a/output/chtml/part03/sect_C.18.9.html#table_C.18.9-1}.
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
    return `${this.graphicType} {${this.graphicData}}`;
  };
};

/**
 * Get a scoord3d object from a dicom element.
 *
 * @param {Record<string, DataElement>} dataElements The dicom element.
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
 * @returns {SimpleTagValues} The item as a list of (key, value) pairs.
 */
export function getDicomSpatialCoordinate3DItem(scoord) {
  // dicom item (tags are in group/element order)
  /** @type {SimpleTagValues} */
  const item = {};

  if (typeof scoord.graphicData !== 'undefined') {
    item.GraphicData = scoord.graphicData;
  }
  if (typeof scoord.graphicType !== 'undefined') {
    item.GraphicType = scoord.graphicType;
  }
  if (typeof scoord.referencedFrameofReferenceUID !== 'undefined') {
    item.ReferencedFrameOfReferenceUID =
      scoord.referencedFrameofReferenceUID;
  }
  if (typeof scoord.fiducialUID !== 'undefined') {
    item.FiducialUID = scoord.fiducialUID;
  }

  // return
  return item;
}
/**
 * Get the 4 plane points of the axes of a circle or an ellipse:
 * x axis end points followed by y axis end points.
 *
 * @param {Circle|Ellipse} shape The shape.
 * @returns {Point2D[]} The 4 points.
 */
function getAxesPoints(shape) {
  const center = shape.getCenter();
  let radiusX;
  let radiusY;
  if (shape instanceof Circle) {
    radiusX = shape.getRadius();
    radiusY = radiusX;
  } else {
    radiusX = shape.getA();
    radiusY = shape.getB();
  }
  return [
    new Point2D(center.getX() - radiusX, center.getY()),
    new Point2D(center.getX() + radiusX, center.getY()),
    new Point2D(center.getX(), center.getY() - radiusY),
    new Point2D(center.getX(), center.getY() + radiusY)
  ];
}

/**
 * Get a DICOM 3D spatial coordinate (SCOORD3D) from a plane
 * mathematical shape.
 *
 * The shape points are converted to patient coordinates
 * with the input function. Graphic types follow C.18.9.1.2:
 * - a circle is an ELLIPSE with equal axes (there is no 3D circle),
 *   the plane spacing can make it a real ellipse,
 * - an ellipse is an ELLIPSE with the major axis (in mm) first,
 * - a closed polyline (first point = last point) is a POLYGON.
 *
 * Ref: {@link https://dicom.nema.org/medical/dicom/2024a/output/chtml/part03/sect_C.18.9.html}.
 *
 * @param {object} shape The plane math shape, see
 *   getScoordFromShape for the supported shapes.
 * @param {function(Point2D[]): Point3D[]} toPatient Function to convert
 *   plane points to patient coordinates (mm).
 * @param {string} frameOfReferenceUID The frame of reference UID of
 *   the patient coordinates.
 * @returns {SpatialCoordinate3D} The DICOM scoord3d.
 */
export function getScoord3DFromShape(shape, toPatient, frameOfReferenceUID) {
  let points2D;
  let graphicType;
  if (shape instanceof Circle || shape instanceof Ellipse) {
    points2D = getAxesPoints(shape);
    graphicType = GraphicTypes3D.ellipse;
  } else {
    const scoord = getScoordFromShape(shape);
    points2D = [];
    for (let i = 0; i < scoord.graphicData.length; i += 2) {
      points2D.push(new Point2D(
        parseFloat(scoord.graphicData[i]),
        parseFloat(scoord.graphicData[i + 1])
      ));
    }
    graphicType = scoord.graphicType;
    if (graphicType === GraphicTypes.polyline &&
      points2D.length > 2 &&
      points2D[0].equals(points2D[points2D.length - 1])) {
      graphicType = GraphicTypes3D.polygon;
    }
  }

  let points3D = toPatient(points2D);

  // major axis first for ellipses
  if (graphicType === GraphicTypes3D.ellipse) {
    const axis1 = points3D[0].getDistance(points3D[1]);
    const axis2 = points3D[2].getDistance(points3D[3]);
    if (axis2 > axis1) {
      points3D = [points3D[2], points3D[3], points3D[0], points3D[1]];
    }
  }

  const scoord3d = new SpatialCoordinate3D();
  scoord3d.graphicType = graphicType;
  scoord3d.graphicData = [];
  for (const point of points3D) {
    scoord3d.graphicData.push(
      point.getX().toString(),
      point.getY().toString(),
      point.getZ().toString()
    );
  }
  scoord3d.referencedFrameofReferenceUID = frameOfReferenceUID;
  return scoord3d;
}
