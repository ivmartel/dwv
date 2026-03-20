// @vitest-environment jsdom
import {describe, test, assert, beforeEach} from 'vitest';
import {getPainter} from '../../src/tools/shapePainters.js';
import {RectangleFactory} from '../../src/tools/rectangle.js';
import {CircleFactory} from '../../src/tools/circle.js';
import {EllipseFactory} from '../../src/tools/ellipse.js';
import {RulerFactory} from '../../src/tools/ruler.js';
import {ArrowFactory} from '../../src/tools/arrow.js';
import {RoiFactory} from '../../src/tools/roi.js';
import {ProtractorFactory} from '../../src/tools/protractor.js';
import {Rectangle} from '../../src/math/rectangle.js';
import {Circle} from '../../src/math/circle.js';
import {Ellipse} from '../../src/math/ellipse.js';
import {Line} from '../../src/math/line.js';
import {ROI} from '../../src/math/roi.js';
import {Protractor} from '../../src/math/protractor.js';
import {Point2D} from '../../src/math/point.js';
import Konva from 'konva';
import {
  makeStyle,
  makeAnnotation as _makeAnnotation,
  makeShapeGroupWithAnchors,
} from './utils/toolTestHelpers.js';

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
 * Standard annotation mock.
 *
 * @param {object} [mathShape] The math shape.
 * @returns {object} The annotation mock.
 */
function makeAnnotation(mathShape) {
  return _makeAnnotation(mathShape);
}

/**
 * Arrow annotation mock (mathShape = Point2D, referencePoints[0] = Point2D).
 *
 * @param {Point2D} [tip] The tip point.
 * @param {Point2D} [tail] The tail point.
 * @returns {object} The annotation mock.
 */
function makeArrowAnnotation(tip, tail) {
  const ann = _makeAnnotation(tip);
  ann.referencePoints = tail !== undefined ? [tail] : [];
  return ann;
}

// ---------------------------------------------------------------------------
// Direct painter tests  (via getPainter)
// ---------------------------------------------------------------------------

describe('tools', () => {
  describe('shapePainters', () => {

    let style;
    beforeEach(() => {
      style = makeStyle();
    });

    // -----------------------------------------------------------------------
    // RectanglePainter
    // -----------------------------------------------------------------------
    describe('RectanglePainter', () => {

      test('createShape returns Konva.Rect with geometry', () => {
        const painter = getPainter('rectangle');
        const ann = makeAnnotation(
          new Rectangle(p(10, 20), p(50, 80)));
        const node = painter.createShape(ann, style);

        assert.ok(node instanceof Konva.Rect);
        assert.equal(node.x(), 10, 'x = begin.x');
        assert.equal(node.y(), 20, 'y = begin.y');
        assert.equal(node.width(), 40, 'width');
        assert.equal(node.height(), 60, 'height');
      });

      test('updateShape updates position and size', () => {
        const painter = getPainter('rectangle');
        const ann = makeAnnotation(new Rectangle(p(10, 20), p(50, 80)));
        const node = painter.createShape(ann, style);

        const ann2 = makeAnnotation(new Rectangle(p(5, 5), p(30, 35)));
        painter.updateShape(node, ann2, style);

        assert.equal(node.x(), 5);
        assert.equal(node.y(), 5);
        assert.equal(node.width(), 25);
        assert.equal(node.height(), 30);
      });

      test('createExtras returns empty array', () => {
        const painter = getPainter('rectangle');
        const ann = makeAnnotation(new Rectangle(p(0, 0), p(10, 10)));
        assert.deepEqual(painter.createExtras(ann, style), []);
      });

    }); // RectanglePainter

    // -----------------------------------------------------------------------
    // CirclePainter
    // -----------------------------------------------------------------------
    describe('CirclePainter', () => {

      test('createShape returns Konva.Circle with center/radius', () => {
        const painter = getPainter('circle');
        const ann = makeAnnotation(new Circle(p(30, 40), 20));
        const node = painter.createShape(ann, style);

        assert.ok(node instanceof Konva.Circle);
        assert.equal(node.x(), 30);
        assert.equal(node.y(), 40);
        assert.equal(node.radius(), 20);
      });

      test('updateShape updates radius (center is immutable)', () => {
        const painter = getPainter('circle');
        const ann = makeAnnotation(new Circle(p(30, 40), 20));
        const node = painter.createShape(ann, style);

        // updateShape only refreshes the radius; center stays at creation time
        painter.updateShape(node, makeAnnotation(new Circle(p(30, 40), 5)));

        assert.equal(node.radius(), 5);
        assert.equal(node.x(), 30, 'center.x preserved');
        assert.equal(node.y(), 40, 'center.y preserved');
      });

      test('createExtras returns empty array', () => {
        const painter = getPainter('circle');
        const ann = makeAnnotation(new Circle(p(0, 0), 5));
        assert.deepEqual(painter.createExtras(ann, style), []);
      });

    }); // CirclePainter

    // -----------------------------------------------------------------------
    // EllipsePainter
    // -----------------------------------------------------------------------
    describe('EllipsePainter', () => {

      test('createShape returns Konva.Ellipse with radii', () => {
        const painter = getPainter('ellipse');
        const ann = makeAnnotation(new Ellipse(p(30, 40), 20, 15));
        const node = painter.createShape(ann, style);

        assert.ok(node instanceof Konva.Ellipse);
        assert.equal(node.x(), 30);
        assert.equal(node.y(), 40);
        assert.equal(node.radiusX(), 20);
        assert.equal(node.radiusY(), 15);
      });

      test('updateShape updates radii', () => {
        const painter = getPainter('ellipse');
        const ann = makeAnnotation(new Ellipse(p(30, 40), 20, 15));
        const node = painter.createShape(ann, style);

        painter.updateShape(
          node, makeAnnotation(new Ellipse(p(30, 40), 10, 8)));

        assert.equal(node.radiusX(), 10);
        assert.equal(node.radiusY(), 8);
      });

      test('createExtras returns empty array', () => {
        const painter = getPainter('ellipse');
        const ann = makeAnnotation(new Ellipse(p(0, 0), 5, 3));
        assert.deepEqual(painter.createExtras(ann, style), []);
      });

    }); // EllipsePainter

    // -----------------------------------------------------------------------
    // RulerPainter
    // -----------------------------------------------------------------------
    describe('RulerPainter', () => {

      test('createShape returns Konva.Line with 4 flat point values', () => {
        const painter = getPainter('ruler');
        const ann = makeAnnotation(new Line(p(0, 0), p(30, 20)));
        const node = painter.createShape(ann, style);

        assert.ok(node instanceof Konva.Line);
        assert.deepEqual(node.points(), [0, 0, 30, 20]);
      });

      test('updateShape updates line points', () => {
        const painter = getPainter('ruler');
        const ann = makeAnnotation(new Line(p(0, 0), p(30, 20)));
        const node = painter.createShape(ann, style);

        painter.updateShape(
          node, makeAnnotation(new Line(p(5, 5), p(40, 40))), style);

        assert.deepEqual(node.points(), [5, 5, 40, 40]);
      });

      test('createExtras returns 2 tick Konva.Lines', () => {
        const painter = getPainter('ruler');
        const ann = makeAnnotation(new Line(p(0, 0), p(30, 0)));
        const extras = painter.createExtras(ann, style);

        assert.equal(extras.length, 2);
        assert.ok(extras[0] instanceof Konva.Line, 'tick0 is Line');
        assert.ok(extras[1] instanceof Konva.Line, 'tick1 is Line');
        assert.equal(extras[0].name(), 'shape-tick0');
        assert.equal(extras[1].name(), 'shape-tick1');
        assert.equal(extras[0].points().length, 4, 'tick0 has 4 coords');
        assert.equal(extras[1].points().length, 4, 'tick1 has 4 coords');
      });

      test('updateExtras repositions ticks in group', () => {
        const painter = getPainter('ruler');
        const ann = makeAnnotation(new Line(p(0, 0), p(30, 0)));
        const extras = painter.createExtras(ann, style);
        const group = new Konva.Group();
        for (const e of extras) {
          group.add(e);
        }
        const tick1before = group.getChildren(
          (n) => n.name() === 'shape-tick1')[0].points().slice();

        painter.updateExtras(
          group, makeAnnotation(new Line(p(0, 0), p(50, 0))), style);

        const tick1after = group.getChildren(
          (n) => n.name() === 'shape-tick1')[0].points();
        assert.notDeepEqual(tick1after, tick1before, 'tick1 moved');
      });

    }); // RulerPainter

    // -----------------------------------------------------------------------
    // ArrowPainter
    // -----------------------------------------------------------------------
    describe('ArrowPainter', () => {

      test('createShape returns Konva.Line with tip and tail', () => {
        const painter = getPainter('arrow');
        const ann = makeArrowAnnotation(p(10, 20), p(50, 60));
        const node = painter.createShape(ann, style);

        assert.ok(node instanceof Konva.Line);
        assert.deepEqual(node.points(), [10, 20, 50, 60]);
      });

      test('updateShape updates line points', () => {
        const painter = getPainter('arrow');
        const ann = makeArrowAnnotation(p(10, 20), p(50, 60));
        const node = painter.createShape(ann, style);

        painter.updateShape(
          node, makeArrowAnnotation(p(0, 0), p(30, 30)), style);

        assert.deepEqual(node.points(), [0, 0, 30, 30]);
      });

      test('createExtras returns 1 triangle Konva.Line', () => {
        const painter = getPainter('arrow');
        const ann = makeArrowAnnotation(p(10, 20), p(50, 60));
        const extras = painter.createExtras(ann, style);

        assert.equal(extras.length, 1);
        assert.ok(extras[0] instanceof Konva.Line, 'triangle is Line');
        assert.equal(extras[0].name(), 'shape-triangle');
      });

    }); // ArrowPainter

    // -----------------------------------------------------------------------
    // RoiPainter
    // -----------------------------------------------------------------------
    describe('RoiPainter', () => {

      test('createShape returns closed Konva.Line with vertex coords', () => {
        const painter = getPainter('roi');
        const ann = makeAnnotation(
          new ROI([p(0, 0), p(30, 0), p(15, 20)]));
        const node = painter.createShape(ann, style);

        assert.ok(node instanceof Konva.Line);
        assert.ok(node.closed(), 'polygon is closed');
        assert.deepEqual(node.points(), [0, 0, 30, 0, 15, 20]);
      });

      test('updateShape updates points', () => {
        const painter = getPainter('roi');
        const ann = makeAnnotation(
          new ROI([p(0, 0), p(30, 0), p(15, 20)]));
        const node = painter.createShape(ann, style);

        painter.updateShape(
          node, makeAnnotation(new ROI([p(5, 5), p(35, 5), p(20, 25)])));

        assert.deepEqual(node.points(), [5, 5, 35, 5, 20, 25]);
      });

      test('createExtras returns empty array', () => {
        const painter = getPainter('roi');
        const ann = makeAnnotation(new ROI([p(0, 0), p(10, 0), p(5, 8)]));
        assert.deepEqual(painter.createExtras(ann, style), []);
      });

    }); // RoiPainter

    // -----------------------------------------------------------------------
    // ProtractorPainter
    // -----------------------------------------------------------------------
    describe('ProtractorPainter', () => {

      test('createShape with 2 points returns Konva.Line (partial)', () => {
        const painter = getPainter('protractor');
        const ann = makeAnnotation(
          new Protractor([p(0, 30), p(0, 0)]));
        const node = painter.createShape(ann, style);

        assert.ok(node instanceof Konva.Line);
        assert.deepEqual(node.points(), [0, 30, 0, 0]);
      });

      test('createShape with 3 points returns 6-coord Konva.Line', () => {
        const painter = getPainter('protractor');
        const ann = makeAnnotation(
          new Protractor([p(0, 30), p(0, 0), p(30, 0)]));
        const node = painter.createShape(ann, style);

        assert.ok(node instanceof Konva.Line);
        assert.deepEqual(node.points(), [0, 30, 0, 0, 30, 0]);
      });

      test('updateShape updates line points', () => {
        const painter = getPainter('protractor');
        const ann = makeAnnotation(
          new Protractor([p(0, 30), p(0, 0), p(30, 0)]));
        const node = painter.createShape(ann, style);

        painter.updateShape(
          node,
          makeAnnotation(new Protractor([p(0, 40), p(0, 0), p(40, 0)])));

        assert.deepEqual(node.points(), [0, 40, 0, 0, 40, 0]);
      });

      test('createExtras with 2-point protractor returns empty array', () => {
        const painter = getPainter('protractor');
        const ann = makeAnnotation(
          new Protractor([p(0, 30), p(0, 0)]));
        assert.deepEqual(painter.createExtras(ann, style), []);
      });

      test('createExtras with 3-point protractor returns arc', () => {
        const painter = getPainter('protractor');
        const ann = makeAnnotation(
          new Protractor([p(0, 30), p(0, 0), p(30, 0)]));
        const extras = painter.createExtras(ann, style);

        assert.equal(extras.length, 1);
        assert.ok(extras[0] instanceof Konva.Arc, 'arc is Konva.Arc');
        assert.equal(extras[0].name(), 'shape-arc');
      });

    }); // ProtractorPainter

  }); // shapePainters

  // ---------------------------------------------------------------------------
  // ShapeRenderer integration tests  (via factory thin adapters)
  // ---------------------------------------------------------------------------

  describe('ShapeRenderer (via factory)', () => {

    let style;
    beforeEach(() => {
      style = makeStyle();
    });

    // -----------------------------------------------------------------------
    // Rectangle
    // -----------------------------------------------------------------------
    describe('Rectangle', () => {

      const makeAnn = (x0, y0, x1, y1) =>
        makeAnnotation(new Rectangle(p(x0, y0), p(x1, y1)));

      test('createShapeGroup returns Konva.Group with name and id', () => {
        const f = new RectangleFactory();
        const group = f.createShapeGroup(makeAnn(10, 20, 50, 80), style);
        assert.ok(group instanceof Konva.Group);
        assert.equal(group.name(), 'rectangle-group');
        assert.equal(group.id(), 'test-uid');
      });

      test('createShapeGroup has shape, label, connector', () => {
        const f = new RectangleFactory();
        const names = f.createShapeGroup(makeAnn(10, 20, 50, 80), style)
          .getChildren().map((c) => c.name());
        assert.ok(names.includes('shape'));
        assert.ok(names.includes('label'));
        assert.ok(names.includes('connector'));
      });

      test('createShapeGroup shape is Konva.Rect with correct geometry', () => {
        const f = new RectangleFactory();
        const group = f.createShapeGroup(makeAnn(10, 20, 50, 80), style);
        const shape = group.getChildren((n) => n.name() === 'shape')[0];
        assert.ok(shape instanceof Konva.Rect);
        assert.equal(shape.x(), 10);
        assert.equal(shape.y(), 20);
        assert.equal(shape.width(), 40);
        assert.equal(shape.height(), 60);
      });

      test('getAnchors returns 4 corner Ellipses in order', () => {
        const f = new RectangleFactory();
        const ann = makeAnn(10, 20, 50, 80);
        const anchors = f.getAnchors(ann, style);
        assert.equal(anchors.length, 4);
        for (const a of anchors) {
          assert.ok(a instanceof Konva.Ellipse);
        }
        assert.equal(anchors[0].x(), 10); // topLeft
        assert.equal(anchors[0].y(), 20);
        assert.equal(anchors[2].x(), 50); // bottomRight
        assert.equal(anchors[2].y(), 80);
      });

      test('updateShapeGroupOnAnchorMove: anchor0 updates rect', () => {
        const f = new RectangleFactory();
        const ann = makeAnn(10, 20, 50, 80);
        const {group, anchors} = makeShapeGroupWithAnchors(f, ann, style);
        anchors[0].x(15);
        anchors[0].y(25);
        ann.mathShape = new Rectangle(p(15, 25), p(50, 80));
        f.updateShapeGroupOnAnchorMove(ann, anchors[0], style);
        const shape = group.getChildren((n) => n.name() === 'shape')[0];
        assert.equal(shape.x(), 15);
        assert.equal(shape.y(), 25);
        assert.equal(shape.width(), 35);
        assert.equal(shape.height(), 55);
      });

      test('updateLabelContent updates label text', () => {
        const f = new RectangleFactory();
        const ann = makeAnn(0, 0, 10, 10);
        const group = f.createShapeGroup(ann, style);
        ann.getText = () => '100 cm²';
        f.updateLabelContent(ann, group, style);
        const label = group.getChildren((n) => n.name() === 'label')[0];
        assert.equal(label.getText().text(), '100 cm²');
      });

      test('updateConnector does not throw', () => {
        const f = new RectangleFactory();
        const ann = makeAnn(0, 0, 10, 10);
        const group = f.createShapeGroup(makeAnn(0, 0, 10, 10), style);
        assert.doesNotThrow(() => f.updateConnector(ann, group));
      });

    }); // Rectangle ShapeRenderer

    // -----------------------------------------------------------------------
    // Circle
    // -----------------------------------------------------------------------
    describe('Circle', () => {

      const makeAnn = (cx, cy, r) =>
        makeAnnotation(new Circle(p(cx, cy), r));

      test('createShapeGroup shape is Konva.Circle with center/radius', () => {
        const f = new CircleFactory();
        const group = f.createShapeGroup(makeAnn(30, 40, 20), style);
        const shape = group.getChildren((n) => n.name() === 'shape')[0];
        assert.ok(shape instanceof Konva.Circle);
        assert.equal(shape.x(), 30);
        assert.equal(shape.y(), 40);
        assert.equal(shape.radius(), 20);
      });

      test('getAnchors returns 4 cardinal Ellipses', () => {
        const f = new CircleFactory();
        const anchors = f.getAnchors(makeAnn(30, 40, 20), style);
        assert.equal(anchors.length, 4);
        assert.equal(anchors[0].x(), 10); // left
        assert.equal(anchors[1].x(), 50); // right
        assert.equal(anchors[2].y(), 60); // bottom
        assert.equal(anchors[3].y(), 20); // top
      });

      test('updateShapeGroupOnAnchorMove: anchor1 updates radius', () => {
        const f = new CircleFactory();
        const ann = makeAnn(30, 40, 20);
        const {group, anchors} = makeShapeGroupWithAnchors(f, ann, style);
        anchors[1].x(55);
        f.updateAnnotationOnAnchorMove(ann, anchors[1]);
        f.updateShapeGroupOnAnchorMove(ann, anchors[1], style);
        const shape = group.getChildren((n) => n.name() === 'shape')[0];
        assert.equal(shape.radius(), 25);
      });

      test('updateLabelContent updates label text', () => {
        const f = new CircleFactory();
        const ann = makeAnn(0, 0, 5);
        const group = f.createShapeGroup(ann, style);
        ann.getText = () => '78 cm²';
        f.updateLabelContent(ann, group, style);
        assert.equal(
          group.getChildren((n) => n.name() === 'label')[0].getText().text(),
          '78 cm²');
      });

    }); // Circle ShapeRenderer

    // -----------------------------------------------------------------------
    // Ellipse
    // -----------------------------------------------------------------------
    describe('Ellipse', () => {

      const makeAnn = (cx, cy, a, b) =>
        makeAnnotation(new Ellipse(p(cx, cy), a, b));

      test('createShapeGroup shape is Konva.Ellipse with radii', () => {
        const f = new EllipseFactory();
        const group = f.createShapeGroup(makeAnn(30, 40, 20, 15), style);
        const shape = group.getChildren((n) => n.name() === 'shape')[0];
        assert.ok(shape instanceof Konva.Ellipse);
        assert.equal(shape.radiusX(), 20);
        assert.equal(shape.radiusY(), 15);
      });

      test('getAnchors returns 4 cardinal Ellipses', () => {
        const f = new EllipseFactory();
        const anchors = f.getAnchors(makeAnn(30, 40, 20, 15), style);
        assert.equal(anchors.length, 4);
        assert.equal(anchors[0].x(), 10); // left
        assert.equal(anchors[2].y(), 55); // bottom
      });

      test('updateShapeGroupOnAnchorMove: anchor2 (bottom) updates b', () => {
        const f = new EllipseFactory();
        const ann = makeAnn(30, 40, 20, 15);
        const {group, anchors} = makeShapeGroupWithAnchors(f, ann, style);
        anchors[2].y(65);
        f.updateAnnotationOnAnchorMove(ann, anchors[2]);
        f.updateShapeGroupOnAnchorMove(ann, anchors[2], style);
        const shape = group.getChildren((n) => n.name() === 'shape')[0];
        assert.equal(shape.radiusY(), 25);
        assert.equal(shape.radiusX(), 20);
      });

    }); // Ellipse ShapeRenderer

    // -----------------------------------------------------------------------
    // Ruler
    // -----------------------------------------------------------------------
    describe('Ruler', () => {

      const makeAnn = (x0, y0, x1, y1) =>
        makeAnnotation(new Line(p(x0, y0), p(x1, y1)));

      test('createShapeGroup has shape, tick0, tick1, label, connector', () => {
        const f = new RulerFactory();
        const names = f.createShapeGroup(makeAnn(0, 0, 30, 0), style)
          .getChildren().map((c) => c.name());
        assert.ok(names.includes('shape'));
        assert.ok(names.includes('shape-tick0'));
        assert.ok(names.includes('shape-tick1'));
        assert.ok(names.includes('label'));
        assert.ok(names.includes('connector'));
      });

      test('createShapeGroup shape is Konva.Line with 4 flat coords', () => {
        const f = new RulerFactory();
        const group = f.createShapeGroup(makeAnn(0, 0, 30, 20), style);
        const shape = group.getChildren((n) => n.name() === 'shape')[0];
        assert.ok(shape instanceof Konva.Line);
        assert.deepEqual(shape.points(), [0, 0, 30, 20]);
      });

      test('getAnchors returns 2 Ellipses at begin and end', () => {
        const f = new RulerFactory();
        const anchors = f.getAnchors(makeAnn(0, 0, 30, 20), style);
        assert.equal(anchors.length, 2);
        assert.equal(anchors[0].x(), 0);
        assert.equal(anchors[1].x(), 30);
        assert.equal(anchors[1].y(), 20);
      });

      test('updateShapeGroupOnAnchorMove updates shape points', () => {
        const f = new RulerFactory();
        const ann = makeAnn(0, 0, 30, 0);
        const {group, anchors} = makeShapeGroupWithAnchors(f, ann, style);
        anchors[1].x(40);
        anchors[1].y(10);
        f.updateAnnotationOnAnchorMove(ann, anchors[1]);
        f.updateShapeGroupOnAnchorMove(ann, anchors[1], style);
        const shape = group.getChildren((n) => n.name() === 'shape')[0];
        assert.deepEqual(shape.points(), [0, 0, 40, 10]);
      });

      test('updateShapeGroupOnAnchorMove updates tick positions', () => {
        const f = new RulerFactory();
        const ann = makeAnn(0, 0, 30, 0);
        const {group, anchors} = makeShapeGroupWithAnchors(f, ann, style);
        const tick1before = group.getChildren(
          (n) => n.name() === 'shape-tick1')[0].points().slice();
        anchors[1].x(50);
        anchors[1].y(0);
        f.updateAnnotationOnAnchorMove(ann, anchors[1]);
        f.updateShapeGroupOnAnchorMove(ann, anchors[1], style);
        const tick1after = group.getChildren(
          (n) => n.name() === 'shape-tick1')[0].points();
        assert.notDeepEqual(tick1after, tick1before);
      });

      test('updateLabelContent updates label text', () => {
        const f = new RulerFactory();
        const ann = makeAnn(0, 0, 30, 0);
        const group = f.createShapeGroup(ann, style);
        ann.getText = () => '30 mm';
        f.updateLabelContent(ann, group, style);
        assert.equal(
          group.getChildren((n) => n.name() === 'label')[0].getText().text(),
          '30 mm');
      });

    }); // Ruler ShapeRenderer

    // -----------------------------------------------------------------------
    // Arrow
    // -----------------------------------------------------------------------
    describe('Arrow', () => {

      const makeAnn = (tx, ty, tlx, tly) =>
        makeArrowAnnotation(p(tx, ty), p(tlx, tly));

      test('createShapeGroup has shape, triangle, label, connector', () => {
        const f = new ArrowFactory();
        const names = f.createShapeGroup(makeAnn(10, 20, 50, 60), style)
          .getChildren().map((c) => c.name());
        assert.ok(names.includes('shape'));
        assert.ok(names.includes('shape-triangle'));
        assert.ok(names.includes('label'));
        assert.ok(names.includes('connector'));
      });

      test('createShapeGroup shape is Konva.Line with 4 flat coords', () => {
        const f = new ArrowFactory();
        const group = f.createShapeGroup(makeAnn(10, 20, 50, 60), style);
        const shape = group.getChildren((n) => n.name() === 'shape')[0];
        assert.ok(shape instanceof Konva.Line);
        assert.deepEqual(shape.points(), [10, 20, 50, 60]);
      });

      test('getAnchors returns 2 Ellipses at tip and tail', () => {
        const f = new ArrowFactory();
        const anchors = f.getAnchors(makeAnn(10, 20, 50, 60), style);
        assert.equal(anchors.length, 2);
        assert.equal(anchors[0].x(), 10);
        assert.equal(anchors[0].y(), 20);
        assert.equal(anchors[1].x(), 50);
        assert.equal(anchors[1].y(), 60);
      });

      test('updateShapeGroupOnAnchorMove updates shape points', () => {
        const f = new ArrowFactory();
        const ann = makeAnn(10, 20, 50, 60);
        const {group, anchors} = makeShapeGroupWithAnchors(f, ann, style);
        ann.mathShape = p(15, 25);
        anchors[0].x(15);
        anchors[0].y(25);
        f.updateShapeGroupOnAnchorMove(ann, anchors[0], style);
        const shape = group.getChildren((n) => n.name() === 'shape')[0];
        assert.deepEqual(shape.points(), [15, 25, 50, 60]);
      });

    }); // Arrow ShapeRenderer

    // -----------------------------------------------------------------------
    // ROI
    // -----------------------------------------------------------------------
    describe('ROI', () => {

      const makeAnn = (pts) => makeAnnotation(new ROI(pts));

      test('createShapeGroup shape is closed Konva.Line', () => {
        const f = new RoiFactory();
        const group = f.createShapeGroup(
          makeAnn([p(0, 0), p(30, 0), p(15, 20)]), style);
        const shape = group.getChildren((n) => n.name() === 'shape')[0];
        assert.ok(shape instanceof Konva.Line);
        assert.ok(shape.closed());
        assert.deepEqual(shape.points(), [0, 0, 30, 0, 15, 20]);
      });

      test('getAnchors returns one Ellipse per vertex', () => {
        const f = new RoiFactory();
        const anchors = f.getAnchors(
          makeAnn([p(0, 0), p(30, 0), p(15, 20)]), style);
        assert.equal(anchors.length, 3);
        assert.equal(anchors[0].x(), 0);
        assert.equal(anchors[1].x(), 30);
        assert.equal(anchors[2].x(), 15);
      });

      test('updateShapeGroupOnAnchorMove updates vertex', () => {
        const f = new RoiFactory();
        const ann = makeAnn([p(0, 0), p(30, 0), p(15, 20)]);
        const {group, anchors} = makeShapeGroupWithAnchors(f, ann, style);
        anchors[1].x(35);
        anchors[1].y(5);
        f.updateAnnotationOnAnchorMove(ann, anchors[1]);
        f.updateShapeGroupOnAnchorMove(ann, anchors[1], style);
        const shape = group.getChildren((n) => n.name() === 'shape')[0];
        assert.deepEqual(shape.points(), [0, 0, 35, 5, 15, 20]);
      });

    }); // ROI ShapeRenderer

    // -----------------------------------------------------------------------
    // Protractor
    // -----------------------------------------------------------------------
    describe('Protractor', () => {

      const makeAnn3 = (x0, y0, x1, y1, x2, y2) =>
        makeAnnotation(new Protractor([p(x0, y0), p(x1, y1), p(x2, y2)]));

      test('createShapeGroup with 3 pts: shape, arc, label, connector', () => {
        const f = new ProtractorFactory();
        const names = f.createShapeGroup(makeAnn3(0, 30, 0, 0, 30, 0), style)
          .getChildren().map((c) => c.name());
        assert.ok(names.includes('shape'));
        assert.ok(names.includes('shape-arc'));
        assert.ok(names.includes('label'));
        assert.ok(names.includes('connector'));
        assert.equal(names.length, 4);
      });

      test('createShapeGroup with 2 pts has only shape child', () => {
        const f = new ProtractorFactory();
        const partial = makeAnnotation(
          new Protractor([p(0, 30), p(0, 0)]));
        const group = f.createShapeGroup(partial, style);
        const names = group.getChildren().map((c) => c.name());
        assert.ok(names.includes('shape'));
        assert.notOk(names.includes('shape-arc'));
        assert.equal(group.getChildren().length, 1);
      });

      test('createShapeGroup shape has 6 flat point coords', () => {
        const f = new ProtractorFactory();
        const group = f.createShapeGroup(makeAnn3(0, 30, 0, 0, 30, 0), style);
        const shape = group.getChildren((n) => n.name() === 'shape')[0];
        assert.deepEqual(shape.points(), [0, 30, 0, 0, 30, 0]);
      });

      test('getAnchors returns 3 Ellipses at the 3 points', () => {
        const f = new ProtractorFactory();
        const anchors = f.getAnchors(makeAnn3(0, 30, 0, 0, 30, 0), style);
        assert.equal(anchors.length, 3);
        assert.equal(anchors[0].y(), 30);
        assert.equal(anchors[1].x(), 0);
        assert.equal(anchors[2].x(), 30);
      });

      test('updateShapeGroupOnAnchorMove updates shape line', () => {
        const f = new ProtractorFactory();
        const ann = makeAnn3(0, 30, 0, 0, 30, 0);
        const {group, anchors} = makeShapeGroupWithAnchors(f, ann, style);
        anchors[1].x(5);
        anchors[1].y(5);
        f.updateAnnotationOnAnchorMove(ann, anchors[1]);
        f.updateShapeGroupOnAnchorMove(ann, anchors[1], style);
        const shape = group.getChildren((n) => n.name() === 'shape')[0];
        assert.deepEqual(shape.points(), [0, 30, 5, 5, 30, 0]);
      });

      test('updateLabelContent updates label text', () => {
        const f = new ProtractorFactory();
        const ann = makeAnn3(0, 30, 0, 0, 30, 0);
        const group = f.createShapeGroup(ann, style);
        ann.getText = () => '90°';
        f.updateLabelContent(ann, group, style);
        assert.equal(
          group.getChildren((n) => n.name() === 'label')[0].getText().text(),
          '90°');
      });

    }); // Protractor ShapeRenderer

  }); // ShapeRenderer (via factory)

}); // tools
