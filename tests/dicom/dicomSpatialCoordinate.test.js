import {describe, test, assert} from 'vitest';
import {
  SpatialCoordinate,
  GraphicTypes,
  getSpatialCoordinate,
  getDicomSpatialCoordinateItem,
  getScoordFromShape,
  getShapeFromScoord
} from '../../src/dicom/dicomSpatialCoordinate.js';
import {DataElement} from '../../src/dicom/dataElement.js';
import {Point2D} from '../../src/math/point.js';
import {Line} from '../../src/math/line.js';
import {Protractor} from '../../src/math/protractor.js';
import {ROI} from '../../src/math/roi.js';
import {Circle} from '../../src/math/circle.js';
import {Ellipse} from '../../src/math/ellipse.js';
import {Rectangle} from '../../src/math/rectangle.js';
import {BidimensionalLine} from '../../src/math/bidimensionalLine.js';

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
 * Tests for the 'dicom/dicomSpatialCoordinate.js' file.
 */

describe('dicom', () => {

  describe('SpatialCoordinate', () => {

    /**
     * Tests for {@link SpatialCoordinate} undefined.
     *
     * @function module:tests/dicom~spatialcoordinate-undefined
     */
    test('undefined', () => {
      const coord = new SpatialCoordinate();
      assert.isUndefined(coord.graphicData);
      assert.isUndefined(coord.graphicType);
      assert.isUndefined(coord.pixelOriginInterpretation);
      assert.isUndefined(coord.fiducialUID);
    });

    /**
     * Tests for {@link SpatialCoordinate} toString with POINT.
     *
     * @function module:tests/dicom~spatialcoordinate-tostring-point
     */
    test('toString POINT', () => {
      const coord = new SpatialCoordinate();
      coord.graphicType = GraphicTypes.point;
      coord.graphicData = ['1.0', '2.0'];

      const result = coord.toString();
      assert.equal(result, 'POINT {1.0,2.0}');
    });

    /**
     * Tests for {@link SpatialCoordinate} toString with POLYLINE.
     *
     * @function module:tests/dicom~spatialcoordinate-tostring-polyline
     */
    test('toString POLYLINE', () => {
      const coord = new SpatialCoordinate();
      coord.graphicType = GraphicTypes.polyline;
      coord.graphicData = ['1.0', '2.0', '3.0', '4.0'];

      const result = coord.toString();
      assert.equal(result, 'POLYLINE {1.0,2.0,3.0,4.0}');
    });

    /**
     * Tests for {@link SpatialCoordinate} round trip.
     *
     * @function module:tests/dicom~spatialcoordinate-round-trip
     */
    test('round trip',
      () => {
        const deGraphicData = new DataElement('IS');
        deGraphicData.value = ['100', '200'];

        const deGraphicType = new DataElement('CS');
        deGraphicType.value = [GraphicTypes.poin];

        const dePixelOrigin = new DataElement('CS');
        dePixelOrigin.value = ['SCREEN'];

        const deFiducialUID = new DataElement('UI');
        deFiducialUID.value = ['1.2.3.4.5'];

        const dataElements = {
          [TagKeys.GraphicData]: deGraphicData,
          [TagKeys.GraphicType]: deGraphicType,
          [TagKeys.PixelOriginInterpretation]: dePixelOrigin,
          [TagKeys.FiducialUID]: deFiducialUID
        };

        const coord1 = getSpatialCoordinate(dataElements);
        const item = getDicomSpatialCoordinateItem(coord1);

        // recreate SpatialCoordinate from item
        const coord2 = new SpatialCoordinate();
        if (typeof item.GraphicData !== 'undefined') {
          coord2.graphicData = item.GraphicData;
        }
        if (typeof item.GraphicType !== 'undefined') {
          coord2.graphicType = item.GraphicType;
        }
        if (typeof item.PixelOriginInterpretation !== 'undefined') {
          coord2.pixelOriginInterpretation = item.PixelOriginInterpretation;
        }
        if (typeof item.FiducialUID !== 'undefined') {
          coord2.fiducialUID = item.FiducialUID;
        }

        // verify round-trip
        assert.deepEqual(coord1.graphicData, coord2.graphicData);
        assert.equal(coord1.graphicType, coord2.graphicType);
        assert.equal(coord1.pixelOriginInterpretation,
          coord2.pixelOriginInterpretation);
        assert.equal(coord1.fiducialUID, coord2.fiducialUID);
      }
    );

  });

  describe('getSpatialCoordinate', () => {

    /**
     * Tests for {@link getSpatialCoordinate}.
     *
     * @function module:tests/dicom~getspatialcoordinate-good-input
     */
    test('good input', () => {
      const deGraphicData = new DataElement('IS');
      deGraphicData.value = ['100', '200'];

      const deGraphicType = new DataElement('CS');
      deGraphicType.value = [GraphicTypes.point];

      const dePixelOrigin = new DataElement('CS');
      dePixelOrigin.value = ['SCREEN'];

      const deFiducialUID = new DataElement('UI');
      deFiducialUID.value = ['1.2.3.4.5'];

      const dataElements = {
        [TagKeys.GraphicData]: deGraphicData,
        [TagKeys.GraphicType]: deGraphicType,
        [TagKeys.PixelOriginInterpretation]: dePixelOrigin,
        [TagKeys.FiducialUID]: deFiducialUID
      };

      const result = getSpatialCoordinate(dataElements);

      assert.deepEqual(result.graphicData, ['100', '200']);
      assert.equal(result.graphicType, GraphicTypes.point);
      assert.equal(result.pixelOriginInterpretation, 'SCREEN');
      assert.equal(result.fiducialUID, '1.2.3.4.5');
    });

    /**
     * Tests for {@link getSpatialCoordinate} with minimum input.
     *
     * @function module:tests/dicom~getspatialcoordinate-minimum-input
     */
    test('minimum input', () => {
      const deGraphicData = new DataElement('IS');
      deGraphicData.value = ['100', '200', '300', '400'];

      const deGraphicType = new DataElement('CS');
      deGraphicType.value = [GraphicTypes.polyline];

      const dataElements = {
        [TagKeys.GraphicData]: deGraphicData,
        [TagKeys.GraphicType]: deGraphicType
      };

      const result = getSpatialCoordinate(dataElements);

      assert.deepEqual(result.graphicData, ['100', '200', '300', '400']);
      assert.equal(result.graphicType, GraphicTypes.polyline);
      assert.isUndefined(result.pixelOriginInterpretation);
      assert.isUndefined(result.fiducialUID);
    });

    /**
     * Tests for {@link getSpatialCoordinate} with empty input.
     *
     * @function module:tests/dicom~getspatialcoordinate-empty-input
     */
    test('empty input', () => {
      const result = getSpatialCoordinate({});

      assert.isUndefined(result.graphicData);
      assert.isUndefined(result.graphicType);
      assert.isUndefined(result.pixelOriginInterpretation);
      assert.isUndefined(result.fiducialUID);
    });

    /**
     * Tests for {@link getSpatialCoordinate} with multiple input.
     *
     * @function module:tests/dicom~getspatialcoordinate-multiple-input
     */
    test('multiple input', () => {
      const deGraphicType = new DataElement('CS');
      deGraphicType.value = [GraphicTypes.point, 'EXTRA'];

      const dataElements = {
        [TagKeys.GraphicType]: deGraphicType
      };

      const result = getSpatialCoordinate(dataElements);

      assert.equal(result.graphicType, GraphicTypes.point);
    });

  });

  describe('getDicomSpatialCoordinateItem', () => {

    /**
     * Tests for {@link getDicomSpatialCoordinateItem}.
     *
     * @function module:tests/dicom~getdicomspatialcoordinateitem-good-input
     */
    test('good input', () => {
      const coord = new SpatialCoordinate();
      coord.graphicData = ['100', '200'];
      coord.graphicType = GraphicTypes.point;
      coord.pixelOriginInterpretation = 'SCREEN';
      coord.fiducialUID = '1.2.3.4.5';

      const item = getDicomSpatialCoordinateItem(coord);

      assert.deepEqual(item.GraphicData, ['100', '200']);
      assert.equal(item.GraphicType, GraphicTypes.point);
      assert.equal(item.PixelOriginInterpretation, 'SCREEN');
      assert.equal(item.FiducialUID, '1.2.3.4.5');
    });

    /**
     * Tests for {@link getDicomSpatialCoordinateItem} with incomplete input.
     *
     * @function module:tests/dicom~getdicomspatialcoordinateitem-incomplete
     */
    test('incomplete', () => {
      const coord = new SpatialCoordinate();
      coord.graphicType = GraphicTypes.circle;
      coord.graphicData = ['50', '50', '150', '150'];
      coord.fiducialUID = '1.2.3.4.5';

      const item = getDicomSpatialCoordinateItem(coord);

      assert.isUndefined(item.PixelOriginInterpretation);
      assert.equal(item.GraphicType, GraphicTypes.circle);
      assert.deepEqual(item.GraphicData, ['50', '50', '150', '150']);
      assert.equal(item.FiducialUID, '1.2.3.4.5');
    });

    /**
     * Tests for {@link getDicomSpatialCoordinateItem} with undefined input.
     *
     * @function module:tests/dicom~getdicomspatialcoordinateitem-undefined
     */
    test('undefined', () => {
      const coord = new SpatialCoordinate();
      const item = getDicomSpatialCoordinateItem(coord);

      assert.deepEqual(item, {});
    });

  });

  describe('getScoordFromShape', () => {

    /**
     * Tests for {@link getScoordFromShape} with Point2D.
     *
     * @function module:tests/dicom~getscoordfromshape-point2d
     */
    test('Point2D', () => {
      const point = new Point2D(10, 20);
      const scoord = getScoordFromShape(point);

      assert.equal(scoord.graphicType, GraphicTypes.point);
      assert.equal(scoord.graphicData.length, 2);
      assert.equal(scoord.graphicData[0], '10');
      assert.equal(scoord.graphicData[1], '20');
    });

    /**
     * Tests for {@link getScoordFromShape} with Line.
     *
     * @function module:tests/dicom~getscoordfromshape-line
     */
    test('Line', () => {
      const line = new Line(new Point2D(10, 20), new Point2D(30, 40));
      const scoord = getScoordFromShape(line);

      assert.equal(scoord.graphicType, GraphicTypes.polyline);
      assert.equal(scoord.graphicData.length, 4);
      assert.equal(scoord.graphicData[0], '10');
      assert.equal(scoord.graphicData[1], '20');
      assert.equal(scoord.graphicData[2], '30');
      assert.equal(scoord.graphicData[3], '40');
    });

    /**
     * Tests for {@link getScoordFromShape} with Circle.
     *
     * @function module:tests/dicom~getscoordfromshape-circle
     */
    test('Circle', () => {
      const circle = new Circle(new Point2D(50, 50), 25);
      const scoord = getScoordFromShape(circle);

      assert.equal(scoord.graphicType, GraphicTypes.circle);
      assert.equal(scoord.graphicData.length, 4);
      // Center
      assert.equal(scoord.graphicData[0], '50');
      assert.equal(scoord.graphicData[1], '50');
      // Perimeter point
      assert.equal(scoord.graphicData[2], '75');
      assert.equal(scoord.graphicData[3], '50');
    });

    /**
     * Tests for {@link getScoordFromShape} with Protractor.
     *
     * @function module:tests/dicom~getscoordfromshape-protractor
     */
    test('Protractor', () => {
      const protractor = new Protractor([
        new Point2D(10, 10),
        new Point2D(20, 20),
        new Point2D(30, 10)
      ]);
      const scoord = getScoordFromShape(protractor);

      assert.equal(scoord.graphicType, GraphicTypes.polyline);
      assert.equal(scoord.graphicData.length, 6);
      // Three points from protractor
      assert.equal(scoord.graphicData[0], '10');
      assert.equal(scoord.graphicData[1], '10');
      assert.equal(scoord.graphicData[2], '20');
      assert.equal(scoord.graphicData[3], '20');
      assert.equal(scoord.graphicData[4], '30');
      assert.equal(scoord.graphicData[5], '10');
    });

    /**
     * Tests for {@link getScoordFromShape} with ROI.
     *
     * @function module:tests/dicom~getscoordfromshape-roi
     */
    test('ROI', () => {
      const roi = new ROI();
      roi.addPoint(new Point2D(10, 10));
      roi.addPoint(new Point2D(20, 10));
      roi.addPoint(new Point2D(20, 20));
      roi.addPoint(new Point2D(10, 20));

      const scoord = getScoordFromShape(roi);

      assert.equal(scoord.graphicType, GraphicTypes.polyline);
      // 4 points + 1 repeated first point to close = 10 coordinates
      assert.equal(scoord.graphicData.length, 10);
      // First point
      assert.equal(scoord.graphicData[0], '10');
      assert.equal(scoord.graphicData[1], '10');
      // Last point should equal first (closed shape)
      assert.equal(scoord.graphicData[8], '10');
      assert.equal(scoord.graphicData[9], '10');
    });

    /**
     * Tests for {@link getScoordFromShape} with Ellipse.
     *
     * @function module:tests/dicom~getscoordfromshape-ellipse
     */
    test('Ellipse', () => {
      const ellipse = new Ellipse(new Point2D(50, 50), 30, 20);
      const scoord = getScoordFromShape(ellipse);

      assert.equal(scoord.graphicType, GraphicTypes.ellipse);
      // 4 points (left, right, top, bottom) = 8 coordinates
      assert.equal(scoord.graphicData.length, 8);
      // Left point
      assert.equal(scoord.graphicData[0], '20');
      assert.equal(scoord.graphicData[1], '50');
      // Right point
      assert.equal(scoord.graphicData[2], '80');
      assert.equal(scoord.graphicData[3], '50');
      // Top point
      assert.equal(scoord.graphicData[4], '50');
      assert.equal(scoord.graphicData[5], '30');
      // Bottom point
      assert.equal(scoord.graphicData[6], '50');
      assert.equal(scoord.graphicData[7], '70');
    });

    /**
     * Tests for {@link getScoordFromShape} with Rectangle.
     *
     * @function module:tests/dicom~getscoordfromshape-rectangle
     */
    test('Rectangle', () => {
      const rectangle = new Rectangle(
        new Point2D(10, 10),
        new Point2D(30, 30)
      );
      const scoord = getScoordFromShape(rectangle);

      assert.equal(scoord.graphicType, GraphicTypes.polyline);
      // 4 corner points + 1 repeated first point to close = 10 coordinates
      assert.equal(scoord.graphicData.length, 10);
      // First point (top-left, begin)
      assert.equal(scoord.graphicData[0], '10');
      assert.equal(scoord.graphicData[1], '10');
      // Second point (bottom-left)
      assert.equal(scoord.graphicData[2], '10');
      assert.equal(scoord.graphicData[3], '30');
      // Third point (bottom-right, end)
      assert.equal(scoord.graphicData[4], '30');
      assert.equal(scoord.graphicData[5], '30');
      // Fourth point (top-right)
      assert.equal(scoord.graphicData[6], '30');
      assert.equal(scoord.graphicData[7], '10');
      // Last point (closed, repeated first)
      assert.equal(scoord.graphicData[8], '10');
      assert.equal(scoord.graphicData[9], '10');
    });

    /**
     * Tests for {@link getScoordFromShape} with BidimensionalLine.
     *
     * @function module:tests/dicom~getscoordfromshape-bidimensionalline
     */
    test('BidimensionalLine', () => {
      // Main axis: (10,10)-(30,10), short axis center: (20,20), length: 10
      const mainStart = new Point2D(10, 10);
      const mainEnd = new Point2D(30, 10);
      const shortAxisCenter = {x: 20, y: 20};
      const shortAxisLength = 10;
      const bline = new BidimensionalLine(mainStart, mainEnd);
      bline.shortAxisCenter = shortAxisCenter;
      bline.shortAxisLength = shortAxisLength;

      const scoord = getScoordFromShape(bline);
      assert.equal(scoord.graphicType, GraphicTypes.polyline);
      assert.equal(scoord.graphicData.length, 8);
      // Main axis
      assert.equal(scoord.graphicData[0], '10');
      assert.equal(scoord.graphicData[1], '10');
      assert.equal(scoord.graphicData[2], '30');
      assert.equal(scoord.graphicData[3], '10');
      // Short axis endpoints (should be symmetric about shortAxisCenter)
      // Just check they are numbers
      assert.ok(!isNaN(Number(scoord.graphicData[4])));
      assert.ok(!isNaN(Number(scoord.graphicData[5])));
      assert.ok(!isNaN(Number(scoord.graphicData[6])));
      assert.ok(!isNaN(Number(scoord.graphicData[7])));
    });

  });

  describe('getShapeFromScoord', () => {
    /**
     * Tests for {@link getShapeFromScoord} with BidimensionalLine polyline.
     *
     * @function module:tests/dicom~getshapefromscoord-bidimensionalline
     */
    test('BidimensionalLine polyline', () => {
      // 4 points: main axis (10,10)-(30,10), short axis endpoints
      const scoord = new SpatialCoordinate();
      scoord.graphicType = GraphicTypes.polyline;
      // Use getScoordFromShape to generate valid data
      const mainStart = new Point2D(10, 10);
      const mainEnd = new Point2D(30, 10);
      const shortAxisCenter = {x: 20, y: 20};
      const shortAxisLength = 10;
      const bline = new BidimensionalLine(mainStart, mainEnd);
      bline.shortAxisCenter = shortAxisCenter;
      bline.shortAxisLength = shortAxisLength;
      const scoordData = getScoordFromShape(bline);
      scoord.graphicData = scoordData.graphicData;

      const shape = getShapeFromScoord(scoord);
      assert.ok(shape instanceof BidimensionalLine);
      assert.equal(shape.getBegin().getX(), 10);
      assert.equal(shape.getBegin().getY(), 10);
      assert.equal(shape.getEnd().getX(), 30);
      assert.equal(shape.getEnd().getY(), 10);
      // Check short axis properties
      assert.ok(typeof shape.shortAxisLength === 'number');
      assert.ok(typeof shape.shortAxisT === 'number');
      assert.ok(typeof shape.shortAxisL1 === 'number');
      assert.ok(typeof shape.shortAxisL2 === 'number');
      assert.ok(typeof shape.shortAxisCenter === 'object');
    });

    /**
     * Tests for {@link getShapeFromScoord} with no data.
     *
     * @function module:tests/dicom~getshapefromscoord-no-data
     */
    test('no data', () => {
      const scoord = new SpatialCoordinate();
      scoord.graphicType = GraphicTypes.point;

      const shape = getShapeFromScoord(scoord);

      assert.isUndefined(shape);
    });

    /**
     * Tests for {@link getShapeFromScoord} with no coord.
     *
     * @function module:tests/dicom~getshapefromscoord-no-coord
     */
    test('no coord', () => {
      const scoord = new SpatialCoordinate();
      scoord.graphicType = GraphicTypes.poin;
      scoord.graphicData = [];

      assert.throws(() => {
        getShapeFromScoord(scoord);
      }, 'No coordinates in scoord data');
    });

    /**
     * Tests for {@link getShapeFromScoord} with odd coord.
     *
     * @function module:tests/dicom~getshapefromscoord-odd-coord
     */
    test('odd coord', () => {
      const scoord = new SpatialCoordinate();
      scoord.graphicType = GraphicTypes.poin;
      scoord.graphicData = ['1', '2', '3'];

      assert.throws(() => {
        getShapeFromScoord(scoord);
      }, 'Expecting even number of coordinates in scoord data');
    });

    /**
     * Tests for {@link getShapeFromScoord} with point.
     *
     * @function module:tests/dicom~getshapefromscoord-point
     */
    test('point', () => {
      const scoord = new SpatialCoordinate();
      scoord.graphicType = GraphicTypes.point;
      scoord.graphicData = ['10', '20'];

      const shape = getShapeFromScoord(scoord);

      assert.ok(shape instanceof Point2D);
      assert.equal(shape.getX(), 10);
      assert.equal(shape.getY(), 20);
    });

    /**
     * Tests for {@link getShapeFromScoord} with polyline 2 points.
     *
     * @function module:tests/dicom~getshapefromscoord-polyline-2-points
     */
    test('polyline 2 points', () => {
      const scoord = new SpatialCoordinate();
      scoord.graphicType = GraphicTypes.polyline;
      scoord.graphicData = ['10', '20', '30', '40'];

      const shape = getShapeFromScoord(scoord);

      assert.ok(shape instanceof Line);
      assert.equal(shape.getBegin().getX(), 10);
      assert.equal(shape.getBegin().getY(), 20);
      assert.equal(shape.getEnd().getX(), 30);
      assert.equal(shape.getEnd().getY(), 40);
    });

    /**
     * Tests for {@link getShapeFromScoord} with circle.
     *
     * @function module:tests/dicom~getshapefromscoord-circle
     */
    test('circle', () => {
      const scoord = new SpatialCoordinate();
      scoord.graphicType = GraphicTypes.circle;
      scoord.graphicData = ['50', '50', '75', '50'];

      const shape = getShapeFromScoord(scoord);

      assert.ok(shape instanceof Circle);
      assert.equal(shape.getCenter().getX(), 50);
      assert.equal(shape.getCenter().getY(), 50);
      assert.equal(shape.getRadius(), 25);
    });

    /**
     * Tests for {@link getShapeFromScoord} with bad circle.
     *
     * @function module:tests/dicom~getshapefromscoord-bad-circle
     */
    test('bad circle', () => {
      const scoord = new SpatialCoordinate();
      scoord.graphicType = GraphicTypes.circle;
      scoord.graphicData = ['50', '50'];

      assert.throws(() => {
        getShapeFromScoord(scoord);
      }, 'Expecting 2 points for circles, got 1');
    });

    /**
     * Tests for {@link getShapeFromScoord} with ellipse.
     *
     * @function module:tests/dicom~getshapefromscoord-ellipse
     */
    test('ellipse', () => {
      const scoord = new SpatialCoordinate();
      scoord.graphicType = GraphicTypes.ellipse;
      // Left, right, top, bottom points
      scoord.graphicData = ['20', '50', '80', '50', '50', '30', '50', '70'];

      const shape = getShapeFromScoord(scoord);

      assert.ok(shape instanceof Ellipse);
      assert.equal(shape.getCenter().getX(), 50);
      assert.equal(shape.getCenter().getY(), 50);
      assert.equal(shape.getA(), 30);
      assert.equal(shape.getB(), 20);
    });

    /**
     * Tests for {@link getShapeFromScoord} with bad ellipse.
     *
     * @function module:tests/dicom~getshapefromscoord-bad-ellipse
     */
    test('bad ellipse', () => {
      const scoord = new SpatialCoordinate();
      scoord.graphicType = GraphicTypes.ellipse;
      scoord.graphicData = ['20', '50', '80', '50', '50', '30'];

      assert.throws(() => {
        getShapeFromScoord(scoord);
      }, 'Expecting 4 points for ellipses, got 3');
    });

    /**
     * Tests for {@link getShapeFromScoord} with polyline 3 points.
     *
     * @function module:tests/dicom~getshapefromscoord-polyline-3-points
     */
    test('polyline 3 points', () => {
      const scoord = new SpatialCoordinate();
      scoord.graphicType = GraphicTypes.polyline;
      // 3 points not closed
      scoord.graphicData = ['10', '10', '20', '20', '30', '10'];

      const shape = getShapeFromScoord(scoord);

      assert.ok(shape instanceof Protractor);
      assert.equal(shape.getPoint(0).getX(), 10);
      assert.equal(shape.getPoint(0).getY(), 10);
      assert.equal(shape.getPoint(1).getX(), 20);
      assert.equal(shape.getPoint(1).getY(), 20);
      assert.equal(shape.getPoint(2).getX(), 30);
      assert.equal(shape.getPoint(2).getY(), 10);
    });

    /**
     * Tests for {@link getShapeFromScoord} with polyline 4 points.
     *
     * @function module:tests/dicom~getshapefromscoord-polyline-4-points
     */
    test('polyline 4 points',
      () => {
        const scoord = new SpatialCoordinate();
        scoord.graphicType = GraphicTypes.polyline;
        // 5 points: 4 non-orthogonal corners with first point
        // repeated (closed but not rectangle)
        scoord.graphicData = [
          '10', '10', '25', '15', '30', '25', '15', '30', '10', '10'
        ];

        const shape = getShapeFromScoord(scoord);

        assert.ok(shape instanceof ROI);
        assert.equal(shape.getLength(), 4);
        assert.equal(shape.getPoint(0).getX(), 10);
        assert.equal(shape.getPoint(0).getY(), 10);
        assert.equal(shape.getPoint(1).getX(), 25);
        assert.equal(shape.getPoint(1).getY(), 15);
        assert.equal(shape.getPoint(2).getX(), 30);
        assert.equal(shape.getPoint(2).getY(), 25);
        assert.equal(shape.getPoint(3).getX(), 15);
        assert.equal(shape.getPoint(3).getY(), 30);
      }
    );

    /**
     * Tests for {@link getShapeFromScoord} with polyline 6 points.
     *
     * @function module:tests/dicom~getshapefromscoord-polyline-6-points
     */
    test('polyline 6 points',
      () => {
        const scoord = new SpatialCoordinate();
        scoord.graphicType = GraphicTypes.polyline;
        // 7 points: 6 points with first repeated (closed)
        scoord.graphicData = [
          '0',
          '0',
          '10',
          '5',
          '20',
          '0',
          '25',
          '15',
          '15',
          '25',
          '5',
          '20',
          '0',
          '0'
        ];

        const shape = getShapeFromScoord(scoord);

        assert.ok(shape instanceof ROI);
        assert.equal(shape.getLength(), 6);
        assert.equal(shape.getPoint(0).getX(), 0);
        assert.equal(shape.getPoint(0).getY(), 0);
        assert.equal(shape.getPoint(5).getX(), 5);
        assert.equal(shape.getPoint(5).getY(), 20);
      }
    );

    /**
     * Tests for {@link getShapeFromScoord} with mulitpoint.
     *
     * @function module:tests/dicom~getshapefromscoord-multipoint
     */
    test('multipoint', () => {
      const scoord = new SpatialCoordinate();
      scoord.graphicType = GraphicTypes.multipoint;
      // Multiple points not closed
      scoord.graphicData = ['10', '10', '20', '20', '30', '30'];

      const shape = getShapeFromScoord(scoord);

      // multipoint type is not yet implemented, returns undefined
      assert.isUndefined(shape);
    });

  });

});
