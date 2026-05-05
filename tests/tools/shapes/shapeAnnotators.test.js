import {describe, test, assert} from 'vitest';
import {
  RectangleAnnotator,
  CircleAnnotator,
  EllipseAnnotator,
  RulerAnnotator,
  ArrowAnnotator,
  RoiAnnotator,
  ProtractorAnnotator,
} from '../../../src/tools/shapes/shapeAnnotators.js';
import {Anchor} from '../../../src/tools/shapes/anchor.js';
import {Rectangle} from '../../../src/math/rectangle.js';
import {Circle} from '../../../src/math/circle.js';
import {Ellipse} from '../../../src/math/ellipse.js';
import {Line} from '../../../src/math/line.js';
import {ROI} from '../../../src/math/roi.js';
import {Protractor} from '../../../src/math/protractor.js';
import {Point2D} from '../../../src/math/point.js';
import {makeAnnotation as _makeAnnotation} from './utils.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Create a Point2D.
 *
 * @param {number} x X coordinate.
 * @param {number} y Y coordinate.
 * @returns {Point2D} A new Point2D.
 */
function p(x, y) {
  return new Point2D(x, y);
}

/**
 * Standard annotation mock (mathShape + mocked hooks).
 *
 * @param {object} [mathShape] The math shape.
 * @returns {object} The annotation mock.
 */
function makeAnnotation(mathShape) {
  return _makeAnnotation(mathShape);
}

/**
 * Arrow annotation mock: mathShape = tip Point2D, referencePoints[0] = tail.
 *
 * @param {Point2D} [tip] The tip point (mathShape).
 * @param {Point2D} [tail] The tail point (referencePoints[0]).
 * @returns {object} The annotation mock.
 */
function makeArrowAnnotation(tip, tail) {
  const ann = _makeAnnotation(tip);
  ann.referencePoints = tail !== undefined ? [tail] : [];
  return ann;
}

// ---------------------------------------------------------------------------
// RectangleAnnotator
// ---------------------------------------------------------------------------

describe('tools', () => {
  describe('RectangleAnnotator', () => {

    const ann = () => makeAnnotation(undefined);
    const rect = (x0, y0, x1, y1) =>
      new Rectangle(p(x0, y0), p(x1, y1));

    test('supports: true for Rectangle, false for others', () => {
      assert.ok(RectangleAnnotator.supports(rect(0, 0, 10, 10)));
      assert.notOk(RectangleAnnotator.supports(p(0, 0)));
      assert.notOk(RectangleAnnotator.supports({}));
      assert.notOk(RectangleAnnotator.supports(undefined));
    });

    test('metadata', () => {
      const a = new RectangleAnnotator();
      assert.equal(a.getName(), 'rectangle');
      assert.equal(a.getGroupName(), 'rectangle-group');
      assert.equal(a.getNPoints(), 2);
      assert.equal(a.getTimeout(), 0);
    });

    test('isComplete always true', () => {
      const a = new RectangleAnnotator();
      assert.ok(a.isComplete(makeAnnotation(rect(0, 0, 10, 10))));
    });

    test('setAnnotationMathShape creates Rectangle from 2 points', () => {
      const a = new RectangleAnnotator();
      const annotation = ann();
      a.setAnnotationMathShape(annotation, [p(10, 20), p(50, 80)]);
      assert.ok(annotation.mathShape instanceof Rectangle);
      assert.equal(annotation.mathShape.getBegin().getX(), 10);
      assert.equal(annotation.mathShape.getBegin().getY(), 20);
      assert.equal(annotation.mathShape.getEnd().getX(), 50);
      assert.equal(annotation.mathShape.getEnd().getY(), 80);
    });

    test('setAnnotationMathShape normalises flipped coords', () => {
      const a = new RectangleAnnotator();
      const annotation = ann();
      a.setAnnotationMathShape(annotation, [p(50, 80), p(10, 20)]);
      assert.equal(annotation.mathShape.getBegin().getX(), 10);
      assert.equal(annotation.mathShape.getBegin().getY(), 20);
    });

    test('setAnnotationMathShape calls hooks', () => {
      const a = new RectangleAnnotator();
      const annotation = ann();
      a.setAnnotationMathShape(annotation, [p(0, 0), p(10, 10)]);
      assert.equal(annotation.setTextExpr.mock.calls.length, 1);
      assert.equal(annotation.updateQuantification.mock.calls.length, 1);
    });

    test('setAnnotationMathShape sets default label {surface}', () => {
      const a = new RectangleAnnotator();
      const annotation = ann();
      a.setAnnotationMathShape(annotation, [p(0, 0), p(10, 10)]);
      assert.equal(annotation.setTextExpr.mock.calls[0][0]['*'], '{surface}');
    });

    test('updateAnnotationOnTranslation shifts both corners', () => {
      const a = new RectangleAnnotator();
      const annotation = makeAnnotation(rect(10, 20, 50, 80));
      a.updateAnnotationOnTranslation(annotation, {x: 5, y: 10});
      assert.equal(annotation.mathShape.getBegin().getX(), 15);
      assert.equal(annotation.mathShape.getBegin().getY(), 30);
      assert.equal(annotation.mathShape.getEnd().getX(), 55);
      assert.equal(annotation.mathShape.getEnd().getY(), 90);
      assert.equal(annotation.updateQuantification.mock.calls.length, 1);
    });

    test('constrainAnchorMove is a no-op', () => {
      const a = new RectangleAnnotator();
      assert.doesNotThrow(() => a.constrainAnchorMove({}));
      assert.doesNotThrow(() => a.constrainAnchorMove(undefined));
    });

    test('updateAnnotationOnAnchorMove rebuilds Rectangle from corners', () => {
      const a = new RectangleAnnotator();
      const annotation = makeAnnotation(rect(10, 20, 50, 80));

      // move anchor0 (topLeft) to (15, 25)
      a.updateAnnotationOnAnchorMove(
        annotation, Anchor.fromIndex(0, 15, 25));

      assert.ok(annotation.mathShape instanceof Rectangle);
      assert.equal(annotation.mathShape.getBegin().getX(), 15);
      assert.equal(annotation.mathShape.getBegin().getY(), 25);
      assert.equal(annotation.mathShape.getEnd().getX(), 50, 'end unchanged');
      assert.equal(annotation.mathShape.getEnd().getY(), 80, 'end unchanged');
      assert.equal(annotation.updateQuantification.mock.calls.length, 1);
    });

    test('getAnchors returns 4 corners', () => {
      const a = new RectangleAnnotator();
      const annotation = makeAnnotation(rect(10, 20, 50, 80));
      const anchors = a.getAnchors(annotation);
      assert.equal(anchors.length, 4);
      // topLeft, topRight, bottomRight, bottomLeft
      assert.equal(anchors[0].getX(), 10);
      assert.equal(anchors[0].getY(), 20);
      assert.equal(anchors[2].getX(), 50);
      assert.equal(anchors[2].getY(), 80);
    });

  }); // RectangleAnnotator

  // ---------------------------------------------------------------------------
  // CircleAnnotator
  // ---------------------------------------------------------------------------

  describe('CircleAnnotator', () => {

    const ann = () => makeAnnotation(undefined);
    const circle = (cx, cy, r) => new Circle(p(cx, cy), r);

    test('supports: true for Circle, false for others', () => {
      assert.ok(CircleAnnotator.supports(circle(0, 0, 5)));
      assert.notOk(CircleAnnotator.supports(p(0, 0)));
      assert.notOk(CircleAnnotator.supports({}));
      assert.notOk(CircleAnnotator.supports(undefined));
    });

    test('metadata', () => {
      const a = new CircleAnnotator();
      assert.equal(a.getName(), 'circle');
      assert.equal(a.getGroupName(), 'circle-group');
      assert.equal(a.getNPoints(), 2);
      assert.equal(a.getTimeout(), 0);
    });

    test('setAnnotationMathShape from center + edge point', () => {
      const a = new CircleAnnotator();
      const annotation = ann();
      a.setAnnotationMathShape(annotation, [p(10, 20), p(10, 27)]);
      assert.ok(annotation.mathShape instanceof Circle);
      assert.equal(annotation.mathShape.getCenter().getX(), 10);
      assert.equal(annotation.mathShape.getCenter().getY(), 20);
      assert.equal(annotation.mathShape.getRadius(), 7);
    });

    test('setAnnotationMathShape radius is Euclidean distance (3-4-5)', () => {
      const a = new CircleAnnotator();
      const annotation = ann();
      a.setAnnotationMathShape(annotation, [p(0, 0), p(3, 4)]);
      assert.equal(annotation.mathShape.getRadius(), 5);
    });

    test('setAnnotationMathShape calls hooks', () => {
      const a = new CircleAnnotator();
      const annotation = ann();
      a.setAnnotationMathShape(annotation, [p(0, 0), p(0, 5)]);
      assert.equal(annotation.setTextExpr.mock.calls.length, 1);
      assert.equal(annotation.updateQuantification.mock.calls.length, 1);
    });

    test('setAnnotationMathShape sets default label {surface}', () => {
      const a = new CircleAnnotator();
      const annotation = ann();
      a.setAnnotationMathShape(annotation, [p(0, 0), p(0, 5)]);
      assert.equal(annotation.setTextExpr.mock.calls[0][0]['*'], '{surface}');
    });

    test('updateAnnotationOnTranslation shifts center, keeps radius', () => {
      const a = new CircleAnnotator();
      const annotation = makeAnnotation(circle(30, 40, 20));
      a.updateAnnotationOnTranslation(annotation, {x: 5, y: 10});
      assert.equal(annotation.mathShape.getCenter().getX(), 35);
      assert.equal(annotation.mathShape.getCenter().getY(), 50);
      assert.equal(annotation.mathShape.getRadius(), 20);
      assert.equal(annotation.updateQuantification.mock.calls.length, 1);
    });

    test('constrainAnchorMove locks horizontal anchors to same y', () => {
      // circle(30,40,20): anchor0=(10,40), anchor1=(50,40)
      // dragging anchor0 up to y=35 → y should snap back to 40
      const a = new CircleAnnotator();
      const annotation = makeAnnotation(circle(30, 40, 20));
      const anchor = Anchor.fromIndex(0, 10, 35);
      a.constrainAnchorMove(anchor, annotation);
      assert.equal(anchor.getY(), 40);
    });

    test('constrainAnchorMove locks vertical anchors to same x', () => {
      // circle(30,40,20): anchor2=(30,60), anchor3=(30,20)
      // dragging anchor2 sideways to x=38 → x should snap back to 30
      const a = new CircleAnnotator();
      const annotation = makeAnnotation(circle(30, 40, 20));
      const anchor = Anchor.fromIndex(2, 38, 60);
      a.constrainAnchorMove(anchor, annotation);
      assert.equal(anchor.getX(), 30);
    });

    test('updateAnnotationOnAnchorMove updates radius', () => {
      const a = new CircleAnnotator();
      const annotation = makeAnnotation(circle(30, 40, 20));
      a.updateAnnotationOnAnchorMove(
        annotation, Anchor.fromIndex(1, 55, 40));
      assert.equal(annotation.mathShape.getRadius(), 25);
      assert.equal(annotation.mathShape.getCenter().getX(), 30);
      assert.equal(annotation.updateQuantification.mock.calls.length, 1);
    });

    test('getAnchors returns 4 cardinal points', () => {
      const a = new CircleAnnotator();
      const annotation = makeAnnotation(circle(30, 40, 20));
      const anchors = a.getAnchors(annotation);
      assert.equal(anchors.length, 4);
      assert.equal(anchors[0].getX(), 10); // left
      assert.equal(anchors[1].getX(), 50); // right
      assert.equal(anchors[2].getY(), 60); // bottom
      assert.equal(anchors[3].getY(), 20); // top
    });

  }); // CircleAnnotator

  // ---------------------------------------------------------------------------
  // EllipseAnnotator
  // ---------------------------------------------------------------------------

  describe('EllipseAnnotator', () => {

    const ann = () => makeAnnotation(undefined);
    const ellipse = (cx, cy, a, b) => new Ellipse(p(cx, cy), a, b);

    test('supports: true for Ellipse, false for others', () => {
      assert.ok(EllipseAnnotator.supports(ellipse(0, 0, 5, 3)));
      assert.notOk(EllipseAnnotator.supports(p(0, 0)));
      assert.notOk(EllipseAnnotator.supports(undefined));
    });

    test('metadata', () => {
      const a = new EllipseAnnotator();
      assert.equal(a.getName(), 'ellipse');
      assert.equal(a.getGroupName(), 'ellipse-group');
      assert.equal(a.getNPoints(), 2);
      assert.equal(a.getTimeout(), 0);
    });

    test('setAnnotationMathShape computes a and b from two points', () => {
      const a = new EllipseAnnotator();
      const annotation = ann();
      a.setAnnotationMathShape(annotation, [p(10, 20), p(40, 55)]);
      assert.ok(annotation.mathShape instanceof Ellipse);
      assert.equal(annotation.mathShape.getCenter().getX(), 10);
      assert.equal(annotation.mathShape.getCenter().getY(), 20);
      assert.equal(annotation.mathShape.getA(), 30);
      assert.equal(annotation.mathShape.getB(), 35);
    });

    test('setAnnotationMathShape calls hooks', () => {
      const a = new EllipseAnnotator();
      const annotation = ann();
      a.setAnnotationMathShape(annotation, [p(0, 0), p(10, 5)]);
      assert.equal(annotation.setTextExpr.mock.calls.length, 1);
      assert.equal(annotation.updateQuantification.mock.calls.length, 1);
    });

    test('setAnnotationMathShape sets default label {surface}', () => {
      const a = new EllipseAnnotator();
      const annotation = ann();
      a.setAnnotationMathShape(annotation, [p(0, 0), p(10, 5)]);
      assert.equal(annotation.setTextExpr.mock.calls[0][0]['*'], '{surface}');
    });

    test('updateAnnotationOnTranslation shifts center, keeps radii', () => {
      const a = new EllipseAnnotator();
      const annotation = makeAnnotation(ellipse(30, 40, 20, 15));
      a.updateAnnotationOnTranslation(annotation, {x: 5, y: 10});
      assert.equal(annotation.mathShape.getCenter().getX(), 35);
      assert.equal(annotation.mathShape.getCenter().getY(), 50);
      assert.equal(annotation.mathShape.getA(), 20);
      assert.equal(annotation.mathShape.getB(), 15);
    });

    test('constrainAnchorMove locks horizontal anchors', () => {
      // ellipse(30,40,20,15): anchor0=(10,40), anchor1=(50,40)
      // dragging anchor0 up to y=35 → y should snap back to 40
      const a = new EllipseAnnotator();
      const annotation = makeAnnotation(ellipse(30, 40, 20, 15));
      const anchor = Anchor.fromIndex(0, 10, 35);
      a.constrainAnchorMove(anchor, annotation);
      assert.equal(anchor.getY(), 40);
    });

    test('constrainAnchorMove locks vertical anchors', () => {
      // ellipse(30,40,20,15): anchor2=(30,55), anchor3=(30,25)
      // dragging anchor2 sideways to x=38 → x should snap back to 30
      const a = new EllipseAnnotator();
      const annotation = makeAnnotation(ellipse(30, 40, 20, 15));
      const anchor = Anchor.fromIndex(2, 38, 55);
      a.constrainAnchorMove(anchor, annotation);
      assert.equal(anchor.getX(), 30);
    });

    test('updateAnnotationOnAnchorMove anchor0 updates radiusX', () => {
      const a = new EllipseAnnotator();
      const annotation = makeAnnotation(ellipse(30, 40, 20, 15));
      a.updateAnnotationOnAnchorMove(
        annotation, Anchor.fromIndex(0, 5, 40));
      assert.equal(annotation.mathShape.getA(), 25);
      assert.equal(annotation.mathShape.getB(), 15);
    });

    test('updateAnnotationOnAnchorMove anchor2 updates radiusY', () => {
      const a = new EllipseAnnotator();
      const annotation = makeAnnotation(ellipse(30, 40, 20, 15));
      a.updateAnnotationOnAnchorMove(
        annotation, Anchor.fromIndex(2, 30, 65));
      assert.equal(annotation.mathShape.getA(), 20);
      assert.equal(annotation.mathShape.getB(), 25);
    });

    test('getAnchors returns 4 cardinal points', () => {
      const a = new EllipseAnnotator();
      const annotation = makeAnnotation(ellipse(30, 40, 20, 15));
      const anchors = a.getAnchors(annotation);
      assert.equal(anchors.length, 4);
      assert.equal(anchors[0].getX(), 10); // left
      assert.equal(anchors[1].getX(), 50); // right
      assert.equal(anchors[2].getY(), 55); // bottom
      assert.equal(anchors[3].getY(), 25); // top
    });

  }); // EllipseAnnotator

  // ---------------------------------------------------------------------------
  // RulerAnnotator
  // ---------------------------------------------------------------------------

  describe('RulerAnnotator', () => {

    const ann = () => makeAnnotation(undefined);
    const line = (x0, y0, x1, y1) =>
      new Line(p(x0, y0), p(x1, y1));

    test('supports: true for Line, false for others', () => {
      assert.ok(RulerAnnotator.supports(line(0, 0, 10, 0)));
      assert.notOk(RulerAnnotator.supports(p(0, 0)));
      assert.notOk(RulerAnnotator.supports(undefined));
    });

    test('metadata', () => {
      const a = new RulerAnnotator();
      assert.equal(a.getName(), 'ruler');
      assert.equal(a.getGroupName(), 'ruler-group');
      assert.equal(a.getNPoints(), 2);
      assert.equal(a.getTimeout(), 0);
    });

    test('setAnnotationMathShape stores a Line from 2 points', () => {
      const a = new RulerAnnotator();
      const annotation = ann();
      a.setAnnotationMathShape(annotation, [p(0, 0), p(30, 0)]);
      assert.ok(annotation.mathShape instanceof Line);
      assert.equal(annotation.mathShape.getEnd().getX(), 30);
    });

    test('setAnnotationMathShape sets default label {length}', () => {
      const a = new RulerAnnotator();
      const annotation = ann();
      a.setAnnotationMathShape(annotation, [p(0, 0), p(30, 0)]);
      assert.equal(annotation.setTextExpr.mock.calls[0][0]['*'], '{length}');
    });

    test('constrainAnchorMove is a no-op', () => {
      const a = new RulerAnnotator();
      assert.doesNotThrow(() => a.constrainAnchorMove({}));
    });

    test('updateAnnotationOnTranslation shifts both endpoints', () => {
      const a = new RulerAnnotator();
      const annotation = makeAnnotation(line(0, 0, 30, 0));
      a.updateAnnotationOnTranslation(annotation, {x: 5, y: 10});
      assert.equal(annotation.mathShape.getBegin().getX(), 5);
      assert.equal(annotation.mathShape.getEnd().getX(), 35);
      assert.equal(annotation.mathShape.getEnd().getY(), 10);
    });

    test('updateAnnotationOnAnchorMove: anchor1 updates end', () => {
      const a = new RulerAnnotator();
      const annotation = makeAnnotation(line(0, 0, 30, 0));
      a.updateAnnotationOnAnchorMove(
        annotation, Anchor.fromIndex(1, 40, 10));
      assert.equal(
        annotation.mathShape.getBegin().getX(), 0, 'begin unchanged');
      assert.equal(annotation.mathShape.getEnd().getX(), 40);
      assert.equal(annotation.mathShape.getEnd().getY(), 10);
      assert.equal(annotation.updateQuantification.mock.calls.length, 1);
    });

    test('updateAnnotationOnAnchorMove: anchor0 updates begin', () => {
      const a = new RulerAnnotator();
      const annotation = makeAnnotation(line(0, 0, 30, 0));
      a.updateAnnotationOnAnchorMove(
        annotation, Anchor.fromIndex(0, 5, 15));
      assert.equal(annotation.mathShape.getBegin().getX(), 5);
      assert.equal(annotation.mathShape.getBegin().getY(), 15);
      assert.equal(annotation.mathShape.getEnd().getX(), 30, 'end unchanged');
    });

    test('getAnchors returns [begin, end]', () => {
      const a = new RulerAnnotator();
      const annotation = makeAnnotation(line(0, 0, 30, 20));
      const anchors = a.getAnchors(annotation);
      assert.equal(anchors.length, 2);
      assert.equal(anchors[0].getX(), 0);
      assert.equal(anchors[1].getX(), 30);
      assert.equal(anchors[1].getY(), 20);
    });

  }); // RulerAnnotator

  // ---------------------------------------------------------------------------
  // ArrowAnnotator
  // ---------------------------------------------------------------------------

  describe('ArrowAnnotator', () => {

    const ann = (tip, tail) => makeArrowAnnotation(tip, tail);

    test('supports: true for Point2D, false for others', () => {
      assert.ok(ArrowAnnotator.supports(p(0, 0)));
      assert.notOk(ArrowAnnotator.supports({}));
      assert.notOk(ArrowAnnotator.supports(undefined));
    });

    test('metadata', () => {
      const a = new ArrowAnnotator();
      assert.equal(a.getName(), 'arrow');
      assert.equal(a.getGroupName(), 'arrow-group');
      assert.equal(a.getNPoints(), 2);
      assert.equal(a.getTimeout(), 0);
    });

    test('setAnnotationMathShape sets mathShape and referencePoints', () => {
      const a = new ArrowAnnotator();
      const annotation = ann(undefined, undefined);
      const tip = p(10, 20);
      const tail = p(30, 40);
      a.setAnnotationMathShape(annotation, [tip, tail]);
      assert.equal(annotation.mathShape, tip);
      assert.equal(annotation.referencePoints[0], tail);
    });

    test('setAnnotationMathShape sets default label empty string', () => {
      const a = new ArrowAnnotator();
      const annotation = ann(undefined, undefined);
      a.setAnnotationMathShape(annotation, [p(0, 0), p(1, 1)]);
      assert.equal(annotation.setTextExpr.mock.calls[0][0]['*'], '');
    });

    test('constrainAnchorMove is a no-op', () => {
      const a = new ArrowAnnotator();
      assert.doesNotThrow(() => a.constrainAnchorMove({}));
    });

    test('updateAnnotationOnTranslation shifts both endpoints', () => {
      const a = new ArrowAnnotator();
      const annotation = ann(p(10, 20), p(30, 40));
      a.updateAnnotationOnTranslation(annotation, {x: 5, y: 10});
      assert.equal(annotation.mathShape.getX(), 15);
      assert.equal(annotation.mathShape.getY(), 30);
      assert.equal(annotation.referencePoints[0].getX(), 35);
      assert.equal(annotation.referencePoints[0].getY(), 50);
    });

    test('updateAnnotationOnAnchorMove: anchor0 updates tip', () => {
      const a = new ArrowAnnotator();
      const annotation = ann(p(10, 20), p(50, 60));
      a.updateAnnotationOnAnchorMove(
        annotation, Anchor.fromIndex(0, 15, 25));
      assert.equal(annotation.mathShape.getX(), 15);
      assert.equal(annotation.mathShape.getY(), 25);
      assert.equal(annotation.referencePoints[0].getX(), 50, 'tail unchanged');
    });

    test('updateAnnotationOnAnchorMove: anchor1 updates tail', () => {
      const a = new ArrowAnnotator();
      const annotation = ann(p(10, 20), p(50, 60));
      a.updateAnnotationOnAnchorMove(
        annotation, Anchor.fromIndex(1, 55, 65));
      assert.equal(annotation.mathShape.getX(), 10, 'tip unchanged');
      assert.equal(annotation.referencePoints[0].getX(), 55);
      assert.equal(annotation.referencePoints[0].getY(), 65);
    });

    test('getAnchors returns [tip, tail]', () => {
      const a = new ArrowAnnotator();
      const annotation = ann(p(10, 20), p(50, 60));
      const anchors = a.getAnchors(annotation);
      assert.equal(anchors.length, 2);
      assert.equal(anchors[0].getX(), 10);
      assert.equal(anchors[0].getY(), 20);
      assert.equal(anchors[1].getX(), 50);
      assert.equal(anchors[1].getY(), 60);
    });

  }); // ArrowAnnotator

  // ---------------------------------------------------------------------------
  // RoiAnnotator
  // ---------------------------------------------------------------------------

  describe('RoiAnnotator', () => {

    const ann = () => makeAnnotation(undefined);
    const roi = (pts) => new ROI(pts);
    const triRoi = () => roi([p(0, 0), p(30, 0), p(15, 20)]);

    test('supports: true for ROI, false for others', () => {
      assert.ok(RoiAnnotator.supports(roi([])));
      assert.notOk(RoiAnnotator.supports(p(0, 0)));
      assert.notOk(RoiAnnotator.supports(undefined));
    });

    test('metadata', () => {
      const a = new RoiAnnotator();
      assert.equal(a.getName(), 'roi');
      assert.equal(a.getGroupName(), 'roi-group');
      assert.equal(a.getNPoints(), undefined);
      assert.equal(a.getTimeout(), 100);
    });

    test('setAnnotationMathShape stores all points as ROI', () => {
      const a = new RoiAnnotator();
      const annotation = ann();
      a.setAnnotationMathShape(annotation, [p(0, 0), p(30, 0), p(15, 20)]);
      assert.ok(annotation.mathShape instanceof ROI);
      assert.equal(annotation.mathShape.getLength(), 3);
    });

    test('setAnnotationMathShape sets default label empty string', () => {
      const a = new RoiAnnotator();
      const annotation = ann();
      a.setAnnotationMathShape(
        annotation, [p(0, 0), p(10, 0), p(5, 8)]);
      assert.equal(annotation.setTextExpr.mock.calls[0][0]['*'], '');
    });

    test('constrainAnchorMove is a no-op', () => {
      const a = new RoiAnnotator();
      assert.doesNotThrow(() => a.constrainAnchorMove({}));
    });

    test('updateAnnotationOnTranslation shifts all points', () => {
      const a = new RoiAnnotator();
      const annotation = makeAnnotation(triRoi());
      a.updateAnnotationOnTranslation(annotation, {x: 5, y: 10});
      assert.equal(annotation.mathShape.getPoint(0).getX(), 5);
      assert.equal(annotation.mathShape.getPoint(1).getX(), 35);
      assert.equal(annotation.mathShape.getPoint(2).getY(), 30);
    });

    test('updateAnnotationOnAnchorMove updates only the moved vertex', () => {
      const a = new RoiAnnotator();
      const annotation = makeAnnotation(triRoi());
      a.updateAnnotationOnAnchorMove(
        annotation, Anchor.fromIndex(1, 35, 5));
      assert.equal(annotation.mathShape.getPoint(0).getX(), 0, 'p0 unchanged');
      assert.equal(annotation.mathShape.getPoint(1).getX(), 35);
      assert.equal(annotation.mathShape.getPoint(1).getY(), 5);
      assert.equal(
        annotation.mathShape.getPoint(2).getX(), 15, 'p2 unchanged');
      assert.equal(annotation.updateQuantification.mock.calls.length, 1);
    });

    test('getAnchors returns one position per vertex', () => {
      const a = new RoiAnnotator();
      const annotation = makeAnnotation(triRoi());
      const anchors = a.getAnchors(annotation);
      assert.equal(anchors.length, 3);
      assert.equal(anchors[0].getX(), 0);
      assert.equal(anchors[1].getX(), 30);
      assert.equal(anchors[2].getX(), 15);
    });

  }); // RoiAnnotator

  // ---------------------------------------------------------------------------
  // ProtractorAnnotator
  // ---------------------------------------------------------------------------

  describe('ProtractorAnnotator', () => {

    const ann = () => makeAnnotation(undefined);
    const protractor = (x0, y0, x1, y1, x2, y2) =>
      new Protractor([p(x0, y0), p(x1, y1), p(x2, y2)]);

    test('supports: true for Protractor, false for others', () => {
      assert.ok(ProtractorAnnotator.supports(protractor(0, 30, 0, 0, 30, 0)));
      assert.notOk(ProtractorAnnotator.supports(p(0, 0)));
      assert.notOk(ProtractorAnnotator.supports(undefined));
    });

    test('metadata', () => {
      const a = new ProtractorAnnotator();
      assert.equal(a.getName(), 'protractor');
      assert.equal(a.getGroupName(), 'protractor-group');
      assert.equal(a.getNPoints(), 3);
      assert.equal(a.getTimeout(), 500);
    });

    test('isComplete: true for 3 points, false for 2', () => {
      const a = new ProtractorAnnotator();
      const full = makeAnnotation(protractor(0, 30, 0, 0, 30, 0));
      const partial = makeAnnotation(
        new Protractor([p(0, 30), p(0, 0)]));
      assert.ok(a.isComplete(full));
      assert.notOk(a.isComplete(partial));
    });

    test('setAnnotationMathShape stores all 3 points', () => {
      const a = new ProtractorAnnotator();
      const annotation = ann();
      a.setAnnotationMathShape(annotation, [p(0, 30), p(0, 0), p(30, 0)]);
      assert.ok(annotation.mathShape instanceof Protractor);
      assert.equal(annotation.mathShape.getPoint(0).getY(), 30);
      assert.equal(annotation.mathShape.getPoint(1).getX(), 0);
      assert.equal(annotation.mathShape.getPoint(2).getX(), 30);
    });

    test('setAnnotationMathShape sets default label {angle}', () => {
      const a = new ProtractorAnnotator();
      const annotation = ann();
      a.setAnnotationMathShape(
        annotation, [p(0, 30), p(0, 0), p(30, 0)]);
      assert.equal(
        annotation.setTextExpr.mock.calls[0][0]['*'], '{angle}');
    });

    test('constrainAnchorMove is a no-op', () => {
      const a = new ProtractorAnnotator();
      assert.doesNotThrow(() => a.constrainAnchorMove({}));
    });

    test('updateAnnotationOnTranslation shifts all 3 points', () => {
      const a = new ProtractorAnnotator();
      const annotation = makeAnnotation(protractor(0, 30, 0, 0, 30, 0));
      a.updateAnnotationOnTranslation(annotation, {x: 5, y: 10});
      assert.equal(annotation.mathShape.getPoint(0).getX(), 5);
      assert.equal(annotation.mathShape.getPoint(0).getY(), 40);
      assert.equal(annotation.mathShape.getPoint(1).getX(), 5);
      assert.equal(annotation.mathShape.getPoint(2).getX(), 35);
    });

    test('updateAnnotationOnAnchorMove: anchor0 updates point 0', () => {
      const a = new ProtractorAnnotator();
      const annotation = makeAnnotation(protractor(0, 30, 0, 0, 30, 0));
      a.updateAnnotationOnAnchorMove(
        annotation, Anchor.fromIndex(0, 10, 40));
      assert.equal(annotation.mathShape.getPoint(0).getX(), 10);
      assert.equal(annotation.mathShape.getPoint(0).getY(), 40);
      assert.equal(
        annotation.mathShape.getPoint(1).getX(), 0, 'p1 unchanged');
      assert.equal(
        annotation.mathShape.getPoint(2).getX(), 30, 'p2 unchanged');
    });

    test('getAnchors returns 3 points', () => {
      const a = new ProtractorAnnotator();
      const annotation = makeAnnotation(protractor(0, 30, 0, 0, 30, 0));
      const anchors = a.getAnchors(annotation);
      assert.equal(anchors.length, 3);
      assert.equal(anchors[0].getY(), 30);
      assert.equal(anchors[1].getX(), 0);
      assert.equal(anchors[2].getX(), 30);
    });

  }); // ProtractorAnnotator

}); // tools
