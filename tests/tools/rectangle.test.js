// @vitest-environment jsdom
import {describe, test, assert, beforeEach} from 'vitest';
import {RectangleFactory} from '../../src/tools/rectangle.js';
import {Rectangle} from '../../src/math/rectangle.js';
import {Point2D} from '../../src/math/point.js';
import Konva from 'konva';
import {
  makeStyle,
  makeAnnotation,
  makeShapeGroupWithAnchors,
} from './utils/toolTestHelpers.js';

/**
 * Convenience: build a Rectangle from four plain numbers.
 *
 * @param {number} x0 Begin x.
 * @param {number} y0 Begin y.
 * @param {number} x1 End x.
 * @param {number} y1 End y.
 * @returns {Rectangle} The rectangle.
 */
function makeRect(x0, y0, x1, y1) {
  return new Rectangle(new Point2D(x0, y0), new Point2D(x1, y1));
}

describe('tools', () => {
  describe('RectangleFactory', () => {

    // -----------------------------------------------------------------------
    // Tier 1 – pure annotation logic, no Konva shape rendering
    // -----------------------------------------------------------------------
    describe('Tier 1 - annotation logic', () => {

      test('supports returns true only for Rectangle instances', () => {
        assert.ok(RectangleFactory.supports(makeRect(0, 0, 10, 10)));
        assert.notOk(RectangleFactory.supports(new Point2D(0, 0)));
        assert.notOk(RectangleFactory.supports({}));
        assert.notOk(RectangleFactory.supports(undefined));
      });

      test('getName, getGroupName, getNPoints, getTimeout', () => {
        const f = new RectangleFactory();
        assert.equal(f.getName(), 'rectangle');
        assert.equal(f.getGroupName(), 'rectangle-group');
        assert.equal(f.getNPoints(), 2);
        assert.equal(f.getTimeout(), 0);
      });

      test('constrainAnchorMove is a no-op', () => {
        const f = new RectangleFactory();
        assert.doesNotThrow(() => f.constrainAnchorMove({}));
        assert.doesNotThrow(() => f.constrainAnchorMove(undefined));
      });

      test('setAnnotationMathShape creates Rectangle from 2 points', () => {
        const f = new RectangleFactory();
        const ann = makeAnnotation(undefined);
        const p0 = new Point2D(10, 20);
        const p1 = new Point2D(50, 80);

        f.setAnnotationMathShape(ann, [p0, p1]);

        assert.ok(ann.mathShape instanceof Rectangle, 'mathShape is Rectangle');
        assert.equal(ann.mathShape.getBegin().getX(), 10, 'begin x');
        assert.equal(ann.mathShape.getBegin().getY(), 20, 'begin y');
        assert.equal(ann.mathShape.getEnd().getX(), 50, 'end x');
        assert.equal(ann.mathShape.getEnd().getY(), 80, 'end y');
      });

      test('setAnnotationMathShape normalises flipped coordinates', () => {
        const f = new RectangleFactory();
        const ann = makeAnnotation(undefined);

        // pass end before begin – Rectangle constructor normalises
        f.setAnnotationMathShape(
          ann, [new Point2D(50, 80), new Point2D(10, 20)]);

        assert.equal(ann.mathShape.getBegin().getX(), 10, 'begin x normalised');
        assert.equal(ann.mathShape.getBegin().getY(), 20, 'begin y normalised');
      });

      test('setAnnotationMathShape calls hooks', () => {
        const f = new RectangleFactory();
        const ann = makeAnnotation(undefined);

        f.setAnnotationMathShape(
          ann, [new Point2D(0, 0), new Point2D(10, 10)]);

        assert.equal(
          ann.setTextExpr.mock.calls.length, 1, 'setTextExpr called once');
        assert.equal(
          ann.updateQuantification.mock.calls.length, 1,
          'updateQuantification called once');
      });

      test('setAnnotationMathShape passes default rectangle label', () => {
        const f = new RectangleFactory();
        const ann = makeAnnotation(undefined);

        f.setAnnotationMathShape(
          ann, [new Point2D(0, 0), new Point2D(10, 10)]);

        const labelArg = ann.setTextExpr.mock.calls[0][0];
        assert.equal(typeof labelArg, 'object', 'label is an object');
        assert.ok('*' in labelArg, 'label has wildcard key');
        assert.equal(
          labelArg['*'], '{surface}', 'rectangle default label is {surface}');
      });

      test('updateAnnotationOnTranslation shifts the rectangle', () => {
        const f = new RectangleFactory();
        const ann = makeAnnotation(makeRect(10, 20, 50, 80));

        f.updateAnnotationOnTranslation(ann, {x: 5, y: 10});

        const rect = ann.mathShape;
        assert.equal(rect.getBegin().getX(), 15, 'begin.x + 5');
        assert.equal(rect.getBegin().getY(), 30, 'begin.y + 10');
        assert.equal(rect.getEnd().getX(), 55, 'end.x + 5');
        assert.equal(rect.getEnd().getY(), 90, 'end.y + 10');
        assert.equal(
          ann.updateQuantification.mock.calls.length, 1,
          'updateQuantification called');
      });

      test('updateAnnotationOnTranslation zero is a no-op', () => {
        const f = new RectangleFactory();
        const ann = makeAnnotation(makeRect(10, 20, 50, 80));

        f.updateAnnotationOnTranslation(ann, {x: 0, y: 0});

        const rect = ann.mathShape;
        assert.equal(rect.getBegin().getX(), 10);
        assert.equal(rect.getBegin().getY(), 20);
        assert.equal(rect.getEnd().getX(), 50);
        assert.equal(rect.getEnd().getY(), 80);
      });

    }); // Tier 1

    // -----------------------------------------------------------------------
    // Tier 2 – Konva shape group creation and update (requires jsdom)
    // -----------------------------------------------------------------------
    describe('Tier 2 - Konva shape group', () => {

      let factory;
      let style;

      beforeEach(() => {
        factory = new RectangleFactory();
        style = makeStyle();
      });

      test('createShapeGroup returns Konva.Group with metadata', () => {
        const ann = makeAnnotation(makeRect(10, 20, 50, 80));
        const group = factory.createShapeGroup(ann, style);

        assert.ok(group instanceof Konva.Group, 'returns Konva.Group');
        assert.equal(group.name(), 'rectangle-group', 'group name');
        assert.equal(group.id(), 'test-uid', 'group id from trackingUid');
      });

      test('createShapeGroup has shape, label, connector children', () => {
        const ann = makeAnnotation(makeRect(10, 20, 50, 80));
        const group = factory.createShapeGroup(ann, style);

        const names = group.getChildren().map((c) => c.name());
        assert.ok(names.includes('shape'), 'has shape');
        assert.ok(names.includes('label'), 'has label');
        assert.ok(names.includes('connector'), 'has connector');
        assert.notOk(names.includes('shape-triangle'), 'no triangle');
      });

      test('createShapeGroup shape is Konva.Rect with correct geometry', () => {
        const ann = makeAnnotation(makeRect(10, 20, 50, 80));
        const group = factory.createShapeGroup(ann, style);

        const shape = group.getChildren((n) => n.name() === 'shape')[0];
        assert.ok(shape instanceof Konva.Rect, 'shape is Konva.Rect');
        assert.equal(shape.x(), 10, 'x = begin.x');
        assert.equal(shape.y(), 20, 'y = begin.y');
        assert.equal(shape.width(), 40, 'width = end.x - begin.x');
        assert.equal(shape.height(), 60, 'height = end.y - begin.y');
      });

      test('getAnchors returns 4 Ellipse anchors at the four corners', () => {
        const ann = makeAnnotation(makeRect(10, 20, 50, 80));
        const group = factory.createShapeGroup(ann, style);
        const shape = group.getChildren((n) => n.name() === 'shape')[0];

        const anchors = factory.getAnchors(shape, style);

        assert.equal(anchors.length, 4, '4 anchors');
        for (const a of anchors) {
          assert.ok(a instanceof Konva.Ellipse, 'each anchor is Ellipse');
        }
        // topLeft, topRight, bottomRight, bottomLeft
        assert.equal(anchors[0].x(), 10, 'anchor0 x = topLeft.x');
        assert.equal(anchors[0].y(), 20, 'anchor0 y = topLeft.y');
        assert.equal(anchors[1].x(), 50, 'anchor1 x = topRight.x');
        assert.equal(anchors[1].y(), 20, 'anchor1 y = topRight.y');
        assert.equal(anchors[2].x(), 50, 'anchor2 x = bottomRight.x');
        assert.equal(anchors[2].y(), 80, 'anchor2 y = bottomRight.y');
        assert.equal(anchors[3].x(), 10, 'anchor3 x = bottomLeft.x');
        assert.equal(anchors[3].y(), 80, 'anchor3 y = bottomLeft.y');
      });

      test('getAnchors assigns ids anchor0..anchor3', () => {
        const ann = makeAnnotation(makeRect(0, 0, 10, 10));
        const group = factory.createShapeGroup(ann, style);
        const shape = group.getChildren((n) => n.name() === 'shape')[0];

        const anchors = factory.getAnchors(shape, style);

        for (let i = 0; i < 4; ++i) {
          assert.equal(anchors[i].id(), `anchor${i}`, `anchor${i} id`);
        }
      });

      test('updateAnnotationOnAnchorMove builds Rectangle from corners', () => {
        const ann = makeAnnotation(makeRect(10, 20, 50, 80));
        const {anchors} = makeShapeGroupWithAnchors(factory, ann, style);

        // Move topLeft (anchor0) to a new position
        anchors[0].x(15);
        anchors[0].y(25);
        factory.updateAnnotationOnAnchorMove(ann, anchors[0]);

        const rect = ann.mathShape;
        assert.ok(rect instanceof Rectangle, 'mathShape is Rectangle');
        assert.equal(rect.getBegin().getX(), 15, 'topLeft.x = anchor0.x');
        assert.equal(rect.getBegin().getY(), 25, 'topLeft.y = anchor0.y');
        assert.equal(rect.getEnd().getX(), 50, 'bottomRight.x unchanged');
        assert.equal(rect.getEnd().getY(), 80, 'bottomRight.y unchanged');
        assert.equal(
          ann.updateQuantification.mock.calls.length, 1,
          'updateQuantification called');
      });

      test('updateAnnotationOnAnchorMove ignores orphaned anchor', () => {
        const ann = makeAnnotation(makeRect(10, 20, 50, 80));
        const orphan = new Konva.Ellipse({x: 5, y: 5, id: 'anchor0'});

        factory.updateAnnotationOnAnchorMove(ann, orphan);

        assert.equal(ann.updateQuantification.mock.calls.length, 0,
          'updateQuantification not called');
        assert.equal(
          ann.mathShape.getBegin().getX(), 10, 'mathShape unchanged');
      });

      // anchor0 = topLeft, anchor1 = topRight,
      // anchor2 = bottomRight, anchor3 = bottomLeft.
      //
      // For diagonal anchors (0, 2) the rect maps directly:
      //   anchor0 → begin, anchor2 → end.
      // For edge anchors (1, 3) #updateShape propagates the moved axis to the
      // two sibling anchors that share it; the rect is rebuilt from the
      // updated annotation.mathShape.

      test('updateShapeGroupOnAnchorMove: anchor0 (topLeft)', () => {
        const ann = makeAnnotation(makeRect(10, 20, 50, 80));
        const {group, anchors} = makeShapeGroupWithAnchors(factory, ann, style);

        anchors[0].x(15);
        anchors[0].y(25);
        ann.mathShape = makeRect(15, 25, 50, 80);
        factory.updateShapeGroupOnAnchorMove(ann, anchors[0], style);

        const shape = group.getChildren((n) => n.name() === 'shape')[0];
        assert.equal(shape.x(), 15, 'rect x');
        assert.equal(shape.y(), 25, 'rect y');
        assert.equal(shape.width(), 35, 'rect width');
        assert.equal(shape.height(), 55, 'rect height');
        // sibling anchors share the moved axes
        assert.equal(anchors[1].y(), 25, 'topRight.y = topLeft.y');
        assert.equal(anchors[3].x(), 15, 'bottomLeft.x = topLeft.x');
      });

      test('updateShapeGroupOnAnchorMove: anchor1 (topRight)', () => {
        const ann = makeAnnotation(makeRect(10, 20, 50, 80));
        const {group, anchors} = makeShapeGroupWithAnchors(factory, ann, style);

        // topRight moves to (60, 15): row shifts up, column shifts right
        anchors[1].x(60);
        anchors[1].y(15);
        ann.mathShape = makeRect(10, 15, 60, 80);
        factory.updateShapeGroupOnAnchorMove(ann, anchors[1], style);

        const shape = group.getChildren((n) => n.name() === 'shape')[0];
        assert.equal(shape.x(), 10, 'rect x');
        assert.equal(shape.y(), 15, 'rect y');
        assert.equal(shape.width(), 50, 'rect width');
        assert.equal(shape.height(), 65, 'rect height');
        // sibling anchors share the moved axes
        assert.equal(anchors[0].y(), 15, 'topLeft.y = topRight.y');
        assert.equal(anchors[2].x(), 60, 'bottomRight.x = topRight.x');
      });

      test('updateShapeGroupOnAnchorMove: anchor2 (bottomRight)', () => {
        const ann = makeAnnotation(makeRect(10, 20, 50, 80));
        const {group, anchors} = makeShapeGroupWithAnchors(factory, ann, style);

        // bottomRight moves to (60, 90): row shifts down, column shifts right
        anchors[2].x(60);
        anchors[2].y(90);
        ann.mathShape = makeRect(10, 20, 60, 90);
        factory.updateShapeGroupOnAnchorMove(ann, anchors[2], style);

        const shape = group.getChildren((n) => n.name() === 'shape')[0];
        assert.equal(shape.x(), 10, 'rect x');
        assert.equal(shape.y(), 20, 'rect y');
        assert.equal(shape.width(), 50, 'rect width');
        assert.equal(shape.height(), 70, 'rect height');
        // sibling anchors share the moved axes
        assert.equal(anchors[3].y(), 90, 'bottomLeft.y = bottomRight.y');
        assert.equal(anchors[1].x(), 60, 'topRight.x = bottomRight.x');
      });

      test('updateShapeGroupOnAnchorMove: anchor3 (bottomLeft)', () => {
        const ann = makeAnnotation(makeRect(10, 20, 50, 80));
        const {group, anchors} = makeShapeGroupWithAnchors(factory, ann, style);

        // bottomLeft moves to (5, 90): row shifts down, column shifts left
        anchors[3].x(5);
        anchors[3].y(90);
        ann.mathShape = makeRect(5, 20, 50, 90);
        factory.updateShapeGroupOnAnchorMove(ann, anchors[3], style);

        const shape = group.getChildren((n) => n.name() === 'shape')[0];
        assert.equal(shape.x(), 5, 'rect x');
        assert.equal(shape.y(), 20, 'rect y');
        assert.equal(shape.width(), 45, 'rect width');
        assert.equal(shape.height(), 70, 'rect height');
        // sibling anchors share the moved axes
        assert.equal(anchors[2].y(), 90, 'bottomRight.y = bottomLeft.y');
        assert.equal(anchors[0].x(), 5, 'topLeft.x = bottomLeft.x');
      });

      test('updateLabelContent updates the label text node', () => {
        const ann = makeAnnotation(makeRect(0, 0, 10, 10));
        const group = factory.createShapeGroup(ann, style);

        ann.getText = () => '40 cm²';
        factory.updateLabelContent(ann, group, style);

        const klabel = group.getChildren((n) => n.name() === 'label')[0];
        assert.equal(
          klabel.getText().text(), '40 cm²', 'label text updated');
      });

      test('updateConnector does not throw', () => {
        const ann = makeAnnotation(makeRect(0, 0, 10, 10));
        const group = factory.createShapeGroup(ann, style);

        assert.doesNotThrow(() => factory.updateConnector(group));

        const names = group.getChildren().map((c) => c.name());
        assert.ok(names.includes('connector'), 'connector still present');
      });

    }); // Tier 2

  }); // RectangleFactory
}); // tools
