import {Point2D} from '../math/point';
import {Line, areOrthogonal} from '../math/line';
import {Protractor} from '../math/protractor';
import {ROI} from '../math/roi';
import {Circle} from '../math/circle';
import {Ellipse} from '../math/ellipse';
import {Rectangle} from '../math/rectangle';

// doc imports
/* eslint-disable no-unused-vars */
import {DataElement} from './dataElement';
/* eslint-enable no-unused-vars */

/**
 * Related DICOM tag keys.
 */
const TagKeys = {
  PixelOriginInterpretation: '00480301',
  GraphicData: '00700022',
  GraphicType: '00700023',
  FiducialUID: '0070031A'
};

/**
 * DICOM graphic types.
 */
export const GraphicTypes = {
  point: 'POINT',
  multipoint: 'MULTIPOINT',
  polyline: 'POLYLINE',
  circle: 'CIRCLE',
  ellipse: 'ELLIPSE'
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

  if (typeof dataElements[TagKeys.GraphicData] !== 'undefined') {
    scoord.graphicData = dataElements[TagKeys.GraphicData].value;
  }
  if (typeof dataElements[TagKeys.GraphicType] !== 'undefined') {
    scoord.graphicType = dataElements[TagKeys.GraphicType].value[0];
  }
  if (typeof dataElements[TagKeys.PixelOriginInterpretation] !== 'undefined') {
    scoord.pixelOriginInterpretation =
      dataElements[TagKeys.PixelOriginInterpretation].value[0];
  }
  if (typeof dataElements[TagKeys.FiducialUID] !== 'undefined') {
    scoord.fiducialUID = dataElements[TagKeys.FiducialUID].value[0];
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

/**
 * Get a DICOM spatial coordinate (SCOORD) from a mathematical shape.
 *
 * @param {Point2D|Line|Protractor|ROI|Circle|Ellipse|Rectangle} shape
 *   The math shape.
 * @returns {SpatialCoordinate} The DICOM scoord.
 */
export function getScoordFromShape(shape) {
  const scoord = new SpatialCoordinate();

  if (shape instanceof Point2D) {
    scoord.graphicData = [
      shape.getX().toString(),
      shape.getY().toString(),
    ];
    scoord.graphicType = GraphicTypes.point;
  } else if (shape instanceof Line) {
    scoord.graphicData = [
      shape.getBegin().getX().toString(),
      shape.getBegin().getY().toString(),
      shape.getEnd().getX().toString(),
      shape.getEnd().getY().toString(),
    ];
    scoord.graphicType = GraphicTypes.polyline;
  } else if (shape instanceof Protractor) {
    scoord.graphicData = [];
    for (let i = 0; i < 3; ++i) {
      scoord.graphicData.push(shape.getPoint(i).getX().toString());
      scoord.graphicData.push(shape.getPoint(i).getY().toString());
    }
    scoord.graphicType = GraphicTypes.polyline;
  } else if (shape instanceof ROI) {
    scoord.graphicData = [];
    for (let i = 0; i < shape.getLength(); ++i) {
      scoord.graphicData.push(shape.getPoint(i).getX().toString());
      scoord.graphicData.push(shape.getPoint(i).getY().toString());
    }
    // repeat first point to close shape
    const firstPoint = shape.getPoint(0);
    scoord.graphicData.push(firstPoint.getX().toString());
    scoord.graphicData.push(firstPoint.getY().toString());

    scoord.graphicType = GraphicTypes.polyline;
  } else if (shape instanceof Circle) {
    const center = shape.getCenter();
    const pointPerimeter = new Point2D(
      center.getX() + shape.getRadius(), center.getY()
    );
    scoord.graphicData = [
      center.getX().toString(),
      center.getY().toString(),
      pointPerimeter.getX().toString(),
      pointPerimeter.getY().toString(),
    ];
    scoord.graphicType = GraphicTypes.circle;
  } else if (shape instanceof Ellipse) {
    const center = shape.getCenter();
    const radiusX = shape.getA();
    const radiusY = shape.getB();
    scoord.graphicData = [
      (center.getX() - radiusX).toString(),
      center.getY().toString(),
      (center.getX() + radiusX).toString(),
      center.getY().toString(),
      center.getX().toString(),
      (center.getY() - radiusY).toString(),
      center.getX().toString(),
      (center.getY() + radiusY).toString()
    ];
    scoord.graphicType = GraphicTypes.ellipse;
  } else if (shape instanceof Rectangle) {
    const begin = shape.getBegin();
    const end = shape.getEnd();
    // begin as first and last point to close shape
    scoord.graphicData = [
      begin.getX().toString(),
      begin.getY().toString(),
      begin.getX().toString(),
      end.getY().toString(),
      end.getX().toString(),
      end.getY().toString(),
      end.getX().toString(),
      begin.getY().toString(),
      begin.getX().toString(),
      begin.getY().toString()
    ];
    scoord.graphicType = GraphicTypes.polyline;
  }

  return scoord;
};

/**
 * Get a mathematical shape from a DICOM spatial coordinate (SCOORD).
 *
 * @param {SpatialCoordinate} scoord The DICOM scoord.
 * @returns {Point2D|Line|Protractor|ROI|Circle|Ellipse|Rectangle}
 *   The math shape.
 */
export function getShapeFromScoord(scoord) {
  // extract points
  const dataLength = scoord.graphicData.length;
  if (dataLength % 2 !== 0) {
    throw new Error('Expecting even number of coordinates in scroord data');
  }
  const points = [];
  for (let i = 0; i < dataLength; i += 2) {
    points.push(new Point2D(
      parseFloat(scoord.graphicData[i]),
      parseFloat(scoord.graphicData[i + 1])
    ));
  }
  let isClosed = false;
  const numberOfPoints = points.length;
  if (numberOfPoints > 2) {
    const firstPoint = points[0];
    const lastPoint = points[numberOfPoints - 1];
    isClosed = firstPoint.equals(lastPoint);
  }

  // create math shape
  let shape;
  if (scoord.graphicType === GraphicTypes.point) {
    if (points.length !== 1) {
      throw new Error('Expecting 1 point for point');
    }
    shape = points[0];
  } else if (scoord.graphicType === GraphicTypes.circle) {
    if (points.length !== 2) {
      throw new Error('Expecting 2 points for circles');
    }
    const center = points[0];
    const pointPerimeter = points[1];
    const radius = pointPerimeter.getDistance(center);
    shape = new Circle(center, radius);
  } else if (scoord.graphicType === GraphicTypes.ellipse) {
    if (points.length !== 4) {
      throw new Error('Expecting 4 points for ellipses');
    }
    // TODO: make more generic
    const radiusX = points[0].getDistance(points[1]) / 2;
    const radiusY = points[2].getDistance(points[3]) / 2;
    const center = new Point2D(
      points[0].getX() + radiusX,
      points[0].getY()
    );
    shape = new Ellipse(center, radiusX, radiusY);
  } else if (scoord.graphicType === GraphicTypes.polyline) {
    if (!isClosed) {
      if (points.length === 2) {
        shape = new Line(points[0], points[1]);
      } else if (points.length === 3) {
        shape = new Protractor([points[0], points[1], points[2]]);
      }
    } else {
      if (points.length === 5) {
        const line0 = new Line(points[0], points[1]);
        const line1 = new Line(points[1], points[2]);
        const line2 = new Line(points[2], points[3]);
        const line3 = new Line(points[3], points[4]);
        if (areOrthogonal(line0, line1) &&
          areOrthogonal(line1, line2) &&
          areOrthogonal(line2, line3)) {
          shape = new Rectangle(points[0], points[2]);
        } else {
          // remove last=first point for closed shape
          shape = new ROI(points.slice(0, -1));
        }
      } else {
        // remove last=first point for closed shape
        shape = new ROI(points.slice(0, -1));
      }
    }
  }

  return shape;
};