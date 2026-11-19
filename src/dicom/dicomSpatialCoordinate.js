import {Point2D} from '../math/point.js';
import {Line, areOrthogonal} from '../math/line.js';
import {Protractor} from '../math/protractor.js';
import {ROI} from '../math/roi.js';
import {Circle} from '../math/circle.js';
import {Ellipse} from '../math/ellipse.js';
import {Rectangle} from '../math/rectangle.js';
import {logger} from '../utils/logger.js';
import {BidimensionalLine} from '../math/bidimensionalLine.js';

/**
 * @import {DataElement} from './dataElement.js';
 * @import {SimpleTagValues} from './types.js';
 */

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
 *
 * Ref: {@link https://dicom.nema.org/medical/dicom/2024a/output/chtml/part03/sect_C.18.6.html#sect_C.18.6.1.2}.
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
 * Ref: {@link https://dicom.nema.org/medical/dicom/2024a/output/chtml/part03/sect_C.18.6.html#table_C.18.6-1}.
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
    return `${this.graphicType} {${this.graphicData}}`;
  };
};

/**
 * Get a scoord object from a dicom element.
 *
 * @param {Record<string, DataElement>} dataElements The dicom element.
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
 * @returns {SimpleTagValues} The item as a list of (key, value) pairs.
 */
export function getDicomSpatialCoordinateItem(scoord) {
  // dicom item (tags are in group/element order)
  /** @type {SimpleTagValues} */
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
 * Supports all standard shapes, including BidimensionalLine (exported as a
 * polyline with 4 points, deprecated: use
 * {@link getScoordsFromBidimensional}).
 *
 * The shape coordinates are image plane coordinates in pixel units where
 * pixel i covers [i, i+1): 0,0 is the top left corner of the top left pixel,
 * which is the SCOORD Graphic Data convention, so no offset is applied.
 * Ref: {@link https://dicom.nema.org/medical/dicom/2024a/output/chtml/part03/sect_C.18.6.html#sect_C.18.6.1.1}.
 *
 * @param {Point2D|Line|Protractor|ROI|Circle|Ellipse|Rectangle|
 *   BidimensionalLine} shape
 *   The math shape, including BidimensionalLine.
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
    const xAxis = [
      center.getX() - radiusX,
      center.getY(),
      center.getX() + radiusX,
      center.getY()
    ];
    const yAxis = [
      center.getX(),
      center.getY() - radiusY,
      center.getX(),
      center.getY() + radiusY
    ];
    // major axis first (C.18.6.1.2)
    const axes = radiusY > radiusX
      ? yAxis.concat(xAxis) : xAxis.concat(yAxis);
    scoord.graphicData = axes.map(function (value) {
      return value.toString();
    });
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
  } else if (shape instanceof BidimensionalLine) {
    const scoords = getScoordsFromBidimensional(shape);
    scoord.graphicData =
      scoords.longAxis.graphicData.concat(scoords.shortAxis.graphicData);
    scoord.graphicType = GraphicTypes.polyline;
  }
  return scoord;
};

/**
 * Get a mathematical shape from a DICOM spatial coordinate (SCOORD).
 * Supports all standard shapes, including BidimensionalLine
 * (polyline with 4 points).
 *
 * @param {SpatialCoordinate} scoord The DICOM scoord.
 * @returns {Point2D|Line|Protractor|ROI|Circle|Ellipse|Rectangle|
 *   BidimensionalLine|undefined}
 *   The reconstructed math shape, including BidimensionalLine if applicable.
 */
export function getShapeFromScoord(scoord) {
  // no shape if no graphic data
  if (typeof scoord.graphicData === 'undefined') {
    return;
  }
  // extract points
  const dataLength = scoord.graphicData.length;
  if (dataLength === 0) {
    throw new Error('No coordinates in scoord data');
  }
  if (dataLength % 2 !== 0) {
    throw new Error('Expecting even number of coordinates in scoord data');
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
    if (points.length > 1) {
      logger.warn(`Expecting 1 point for point, got ${numberOfPoints}`);
    }
    shape = points[0];
  } else if (scoord.graphicType === GraphicTypes.circle) {
    if (points.length < 2) {
      throw new Error(`Expecting 2 points for circles, got ${numberOfPoints}`);
    }
    if (points.length > 2) {
      logger.warn(`Expecting 2 points for circles, got ${numberOfPoints}`);
    }
    const center = points[0];
    const pointPerimeter = points[1];
    const radius = pointPerimeter.getDistance(center);
    shape = new Circle(center, radius);
  } else if (scoord.graphicType === GraphicTypes.ellipse) {
    if (points.length < 4) {
      throw new Error(`Expecting 4 points for ellipses, got ${numberOfPoints}`);
    }
    if (points.length > 4) {
      logger.warn(`Expecting 4 points for ellipses, got ${numberOfPoints}`);
    }
    shape = getEllipseFromPoints(points);
  } else if (scoord.graphicType === GraphicTypes.polyline) {
    if (!isClosed) {
      if (points.length === 2) {
        shape = new Line(points[0], points[1]);
      } else if (points.length === 3) {
        shape = new Protractor([points[0], points[1], points[2]]);
      } else if (points.length === 4) {
        // BidimensionalLine: points 0,1 = main axis; 2,3 = short axis
        // (dwv up to v0.37)
        shape = getBidimensionalFromPoints(points);
      }
    } else if (points.length === 5) {
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

  return shape;
};
/**
 * Get an ellipse from the 4 points of a SCOORD ELLIPSE: the end points of
 * the major axis followed by the end points of the minor axis.
 * Ref: {@link https://dicom.nema.org/medical/dicom/2024a/output/chtml/part03/sect_C.18.6.html#sect_C.18.6.1.2}.
 *
 * Only axis aligned ellipses are supported: a rotated ellipse
 * is approximated with the axis closest to horizontal as x axis.
 *
 * @param {Point2D[]} points The 4 points.
 * @returns {Ellipse} The ellipse.
 */
function getEllipseFromPoints(points) {
  const axis1Dx = points[1].getX() - points[0].getX();
  const axis1Dy = points[1].getY() - points[0].getY();
  const radius1 = points[0].getDistance(points[1]) / 2;
  const radius2 = points[2].getDistance(points[3]) / 2;
  const center = new Point2D(
    (points[0].getX() + points[1].getX()) / 2,
    (points[0].getY() + points[1].getY()) / 2
  );
  const isAxis1Horizontal = Math.abs(axis1Dx) >= Math.abs(axis1Dy);
  const tolerance = 1e-6 * Math.max(radius1, 1);
  if (Math.min(Math.abs(axis1Dx), Math.abs(axis1Dy)) > tolerance) {
    logger.warn('Rotated ellipses are not supported, ' +
      'using an axis aligned approximation');
  }
  let radiusX = radius1;
  let radiusY = radius2;
  if (!isAxis1Horizontal) {
    radiusX = radius2;
    radiusY = radius1;
  }
  return new Ellipse(center, radiusX, radiusY);
}

/**
 * Get the long and short axis SCOORDs of a bidimensional line:
 * each axis is a 2 points POLYLINE.
 *
 * @param {BidimensionalLine} shape The bidimensional line.
 * @returns {{longAxis: SpatialCoordinate, shortAxis: SpatialCoordinate}}
 *   The long and short axis SCOORDs.
 */
export function getScoordsFromBidimensional(shape) {
  let perpUnitX = 0;
  let perpUnitY = 0;
  const mainAxisStart = shape.getBegin();
  const mainAxisEnd = shape.getEnd();

  // use the actual short axis center if available, otherwise the centroid
  const shortAxisCenter =
    shape.shortAxisCenter instanceof Point2D
      ? shape.shortAxisCenter
      : shape.getCentroid();

  const mainDx = mainAxisEnd.getX() - mainAxisStart.getX();
  const mainDy = mainAxisEnd.getY() - mainAxisStart.getY();
  const mainLength = Math.sqrt(mainDx * mainDx + mainDy * mainDy);

  // perpendicular unit vector to main axis
  if (mainLength !== 0) {
    perpUnitX = -mainDy / mainLength;
    perpUnitY = mainDx / mainLength;
  }

  const shortAxisL1 = shape.shortAxisL1 ?? (shape.shortAxisLength / 2);
  const shortAxisL2 = shape.shortAxisL2 ?? (shape.shortAxisLength / 2);

  const shortAxisEnd1 = new Point2D(
    shortAxisCenter.getX() + perpUnitX * shortAxisL1,
    shortAxisCenter.getY() + perpUnitY * shortAxisL1
  );
  const shortAxisEnd2 = new Point2D(
    shortAxisCenter.getX() - perpUnitX * shortAxisL2,
    shortAxisCenter.getY() - perpUnitY * shortAxisL2
  );

  const longAxis = getScoordFromShape(new Line(mainAxisStart, mainAxisEnd));
  const shortAxis = getScoordFromShape(new Line(shortAxisEnd1, shortAxisEnd2));
  return {longAxis, shortAxis};
}

/**
 * Get a bidimensional line from its long axis end points
 * followed by its short axis end points.
 *
 * @param {Point2D[]} points The 4 points.
 * @returns {BidimensionalLine} The bidimensional line.
 */
function getBidimensionalFromPoints(points) {
  const mainAxisStart = points[0];
  const mainAxisEnd = points[1];
  const shortAxisEnd1 = points[2];
  const shortAxisEnd2 = points[3];

  const shape = new BidimensionalLine(mainAxisStart, mainAxisEnd);

  const mainDx = mainAxisEnd.getX() - mainAxisStart.getX();
  const mainDy = mainAxisEnd.getY() - mainAxisStart.getY();
  const mainLength2 = mainDx * mainDx + mainDy * mainDy;

  // short axis center: projection of the short axis on the main axis
  // (the axes are perpendicular), midpoint if the main axis is empty
  let shortAxisT = 0.5;
  let shortAxisCenter = new Point2D(
    (shortAxisEnd1.getX() + shortAxisEnd2.getX()) / 2,
    (shortAxisEnd1.getY() + shortAxisEnd2.getY()) / 2
  );
  if (mainLength2 !== 0) {
    const centerVx = shortAxisCenter.getX() - mainAxisStart.getX();
    const centerVy = shortAxisCenter.getY() - mainAxisStart.getY();
    const projection = (centerVx * mainDx + centerVy * mainDy) / mainLength2;
    shortAxisT = Math.max(0, Math.min(1, projection));
    shortAxisCenter = new Point2D(
      mainAxisStart.getX() + projection * mainDx,
      mainAxisStart.getY() + projection * mainDy
    );
  }

  const shortAxisL1 = shortAxisEnd1.getDistance(shortAxisCenter);
  const shortAxisL2 = shortAxisEnd2.getDistance(shortAxisCenter);

  shape.shortAxisLength = shortAxisL1 + shortAxisL2;
  shape.shortAxisT = shortAxisT;
  shape.shortAxisL1 = shortAxisL1;
  shape.shortAxisL2 = shortAxisL2;
  shape.shortAxisCenter = shortAxisCenter;
  shape.hasShortAxisInteraction = true;

  return shape;
}

/**
 * Get a bidimensional line from its long and short axis SCOORDs
 * (2 points POLYLINEs).
 *
 * @param {SpatialCoordinate} longAxis The long axis SCOORD.
 * @param {SpatialCoordinate} shortAxis The short axis SCOORD.
 * @returns {BidimensionalLine} The bidimensional line.
 */
export function getBidimensionalFromScoords(longAxis, shortAxis) {
  const longShape = getShapeFromScoord(longAxis);
  const shortShape = getShapeFromScoord(shortAxis);
  if (!(longShape instanceof Line) || !(shortShape instanceof Line)) {
    throw new Error('Expecting 2 points polylines for bidimensional axes');
  }
  return getBidimensionalFromPoints([
    longShape.getBegin(),
    longShape.getEnd(),
    shortShape.getBegin(),
    shortShape.getEnd()
  ]);
}
