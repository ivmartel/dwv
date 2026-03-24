// @vitest-environment jsdom
import {describe, test, assert, beforeEach} from 'vitest';
import {getPainter} from '../../src/tools/shapePainters.js';
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
  makeAnnotation as _makeAnnotation
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

}); // tools
