// @vitest-environment jsdom
import {describe, test, assert, beforeEach} from 'vitest';
import {EllipseFactory} from '../../src/tools/ellipse.js';
import {Ellipse} from '../../src/math/ellipse.js';
import {Point2D} from '../../src/math/point.js';
import Konva from 'konva';
import {
  makeStyle,
  makeAnnotation,
  makeShapeGroupWithAnchors,
} from './utils/toolTestHelpers.js';

/**
 * Convenience: build an Ellipse from plain numbers.
 *
 * @param {number} cx Centre x.
 * @param {number} cy Centre y.
 * @param {number} a Horizontal semi-axis (radiusX).
 * @param {number} b Vertical semi-axis (radiusY).
 * @returns {Ellipse} The ellipse.
 */
function makeEllipse(cx, cy, a, b) {
  return new Ellipse(new Point2D(cx, cy), a, b);
}

describe('tools', () => {
  describe('EllipseFactory', () => {

    // -----------------------------------------------------------------------
    // Tier 1 – pure annotation logic, no Konva shape rendering
    // -----------------------------------------------------------------------
    describe('Tier 1 - annotation logic', () => {

      test('supports returns true only for Ellipse instances', () => {
        assert.ok(EllipseFactory.supports(makeEllipse(0, 0, 5, 3)));
        assert.notOk(EllipseFactory.supports(new Point2D(0, 0)));
        assert.notOk(EllipseFactory.supports({}));
        assert.notOk(EllipseFactory.supports(undefined));
      });

      test('getName, getGroupName, getNPoints, getTimeout', () => {
        const f = new EllipseFactory();
        assert.equal(f.getName(), 'ellipse');
        assert.equal(f.getGroupName(), 'ellipse-group');
        assert.equal(f.getNPoints(), 2);
        assert.equal(f.getTimeout(), 0);
      });

      test('setAnnotationMathShape sets center to points[0]', () => {
        const f = new EllipseFactory();
        const ann = makeAnnotation(undefined);
        const center = new Point2D(10, 20);
        const edge = new Point2D(40, 55); // a=30, b=35

        f.setAnnotationMathShape(ann, [center, edge]);

        assert.ok(ann.mathShape instanceof Ellipse, 'mathShape is Ellipse');
        assert.equal(ann.mathShape.getCenter().getX(), 10, 'center x');
        assert.equal(ann.mathShape.getCenter().getY(), 20, 'center y');
      });

      test('setAnnotationMathShape computes a and b independently', () => {
        const f = new EllipseFactory();
        const ann = makeAnnotation(undefined);
        // a = |10 - 40| = 30, b = |20 - 55| = 35
        f.setAnnotationMathShape(
          ann, [new Point2D(10, 20), new Point2D(40, 55)]);

        assert.equal(ann.mathShape.getA(), 30, 'a = |dx|');
        assert.equal(ann.mathShape.getB(), 35, 'b = |dy|');
      });

      test('setAnnotationMathShape accepts flipped point order', () => {
        const f = new EllipseFactory();
        const ann = makeAnnotation(undefined);
        // p1 is to the upper-left of p0 → |dx|, |dy| still positive
        f.setAnnotationMathShape(
          ann, [new Point2D(40, 55), new Point2D(10, 20)]);

        assert.equal(ann.mathShape.getA(), 30, 'a = |dx| (abs)');
        assert.equal(ann.mathShape.getB(), 35, 'b = |dy| (abs)');
      });

      test('setAnnotationMathShape calls hooks', () => {
        const f = new EllipseFactory();
        const ann = makeAnnotation(undefined);

        f.setAnnotationMathShape(
          ann, [new Point2D(0, 0), new Point2D(10, 5)]);

        assert.equal(
          ann.setTextExpr.mock.calls.length, 1, 'setTextExpr called once');
        assert.equal(
          ann.updateQuantification.mock.calls.length, 1,
          'updateQuantification called once');
      });

      test('setAnnotationMathShape passes default ellipse label', () => {
        const f = new EllipseFactory();
        const ann = makeAnnotation(undefined);

        f.setAnnotationMathShape(
          ann, [new Point2D(0, 0), new Point2D(10, 5)]);

        const labelArg = ann.setTextExpr.mock.calls[0][0];
        assert.equal(typeof labelArg, 'object', 'label is an object');
        assert.ok('*' in labelArg, 'label has wildcard key');
        assert.equal(
          labelArg['*'], '{surface}',
          'ellipse default label is {surface}');
      });

      test('updateAnnotationOnTranslation shifts center, keeps radii', () => {
        const f = new EllipseFactory();
        const ann = makeAnnotation(makeEllipse(30, 40, 20, 15));

        f.updateAnnotationOnTranslation(ann, {x: 5, y: 10});

        assert.equal(ann.mathShape.getCenter().getX(), 35, 'center.x + 5');
        assert.equal(ann.mathShape.getCenter().getY(), 50, 'center.y + 10');
        assert.equal(ann.mathShape.getA(), 20, 'a unchanged');
        assert.equal(ann.mathShape.getB(), 15, 'b unchanged');
        assert.equal(
          ann.updateQuantification.mock.calls.length, 1,
          'updateQuantification called');
      });

      test('updateAnnotationOnTranslation zero is a no-op', () => {
        const f = new EllipseFactory();
        const ann = makeAnnotation(makeEllipse(30, 40, 20, 15));

        f.updateAnnotationOnTranslation(ann, {x: 0, y: 0});

        assert.equal(ann.mathShape.getCenter().getX(), 30);
        assert.equal(ann.mathShape.getCenter().getY(), 40);
        assert.equal(ann.mathShape.getA(), 20);
        assert.equal(ann.mathShape.getB(), 15);
      });

      // updateAnnotationOnAnchorMove: anchor id determines which axis changes;
      // center is always preserved from annotation.mathShape (no group needed).
      test('updateAnnotationOnAnchorMove anchor0 updates radiusX', () => {
        const f = new EllipseFactory();
        const ann = makeAnnotation(makeEllipse(30, 40, 20, 15));
        // anchor0 (left) dragged to x=5: radiusX = center.x - anchor.x = 25
        const anchor = new Konva.Ellipse({x: 5, y: 40, id: 'anchor0'});

        f.updateAnnotationOnAnchorMove(ann, anchor);

        assert.equal(ann.mathShape.getA(), 25, 'radiusX = 30 - 5 = 25');
        assert.equal(ann.mathShape.getB(), 15, 'radiusY unchanged');
        assert.equal(ann.mathShape.getCenter().getX(), 30, 'center preserved');
      });

      test('updateAnnotationOnAnchorMove anchor1 updates radiusX', () => {
        const f = new EllipseFactory();
        const ann = makeAnnotation(makeEllipse(30, 40, 20, 15));
        // anchor1 (right) dragged to x=55: radiusX = anchor.x - center.x = 25
        const anchor = new Konva.Ellipse({x: 55, y: 40, id: 'anchor1'});

        f.updateAnnotationOnAnchorMove(ann, anchor);

        assert.equal(ann.mathShape.getA(), 25, 'radiusX = 55 - 30 = 25');
        assert.equal(ann.mathShape.getB(), 15, 'radiusY unchanged');
      });

      test('updateAnnotationOnAnchorMove anchor2 updates radiusY', () => {
        const f = new EllipseFactory();
        const ann = makeAnnotation(makeEllipse(30, 40, 20, 15));
        // anchor2 (bottom) dragged to y=65: radiusY = anchor.y - center.y = 25
        const anchor = new Konva.Ellipse({x: 30, y: 65, id: 'anchor2'});

        f.updateAnnotationOnAnchorMove(ann, anchor);

        assert.equal(ann.mathShape.getA(), 20, 'radiusX unchanged');
        assert.equal(ann.mathShape.getB(), 25, 'radiusY = 65 - 40 = 25');
      });

      test('updateAnnotationOnAnchorMove anchor3 updates radiusY', () => {
        const f = new EllipseFactory();
        const ann = makeAnnotation(makeEllipse(30, 40, 20, 15));
        // anchor3 (top) dragged to y=15: radiusY = center.y - anchor.y = 25
        const anchor = new Konva.Ellipse({x: 30, y: 15, id: 'anchor3'});

        f.updateAnnotationOnAnchorMove(ann, anchor);

        assert.equal(ann.mathShape.getA(), 20, 'radiusX unchanged');
        assert.equal(ann.mathShape.getB(), 25, 'radiusY = 40 - 15 = 25');
      });

      test('updateAnnotationOnAnchorMove uses abs for mirrored anchors', () => {
        const f = new EllipseFactory();
        const ann = makeAnnotation(makeEllipse(30, 40, 20, 15));
        // anchor1 dragged past center (x=20 < center.x=30):
        // raw radiusX = 20 - 30 = -10, stored as abs = 10
        const anchor = new Konva.Ellipse({x: 20, y: 40, id: 'anchor1'});

        f.updateAnnotationOnAnchorMove(ann, anchor);

        assert.equal(ann.mathShape.getA(), 10, 'radiusX = |20 - 30| = 10');
      });

      test('updateAnnotationOnAnchorMove calls updateQuantification', () => {
        const f = new EllipseFactory();
        const ann = makeAnnotation(makeEllipse(30, 40, 20, 15));
        const anchor = new Konva.Ellipse({x: 55, y: 40, id: 'anchor1'});

        f.updateAnnotationOnAnchorMove(ann, anchor);

        assert.equal(
          ann.updateQuantification.mock.calls.length, 1,
          'updateQuantification called');
      });

    }); // Tier 1

    // -----------------------------------------------------------------------
    // Tier 2 – Konva shape group creation and update (requires jsdom)
    // -----------------------------------------------------------------------
    describe('Tier 2 - Konva shape group', () => {

      let factory;
      let style;

      beforeEach(() => {
        factory = new EllipseFactory();
        style = makeStyle();
      });

      test('createShapeGroup returns Konva.Group with metadata', () => {
        const ann = makeAnnotation(makeEllipse(30, 40, 20, 15));
        const group = factory.createShapeGroup(ann, style);

        assert.ok(group instanceof Konva.Group, 'returns Konva.Group');
        assert.equal(group.name(), 'ellipse-group', 'group name');
        assert.equal(group.id(), 'test-uid', 'group id from trackingUid');
      });

      test('createShapeGroup has shape, label, connector children', () => {
        const ann = makeAnnotation(makeEllipse(30, 40, 20, 15));
        const group = factory.createShapeGroup(ann, style);

        const names = group.getChildren().map((c) => c.name());
        assert.ok(names.includes('shape'), 'has shape');
        assert.ok(names.includes('label'), 'has label');
        assert.ok(names.includes('connector'), 'has connector');
      });

      test('createShapeGroup adds exactly 3 children', () => {
        const ann = makeAnnotation(makeEllipse(30, 40, 20, 15));
        const group = factory.createShapeGroup(ann, style);

        assert.equal(group.getChildren().length, 3);
      });

      test('createShapeGroup shape is Konva.Ellipse with radii', () => {
        const ann = makeAnnotation(makeEllipse(30, 40, 20, 15));
        const group = factory.createShapeGroup(ann, style);

        const shape = group.getChildren((n) => n.name() === 'shape')[0];
        assert.ok(shape instanceof Konva.Ellipse, 'shape is Konva.Ellipse');
        assert.equal(shape.x(), 30, 'x = center.x');
        assert.equal(shape.y(), 40, 'y = center.y');
        assert.equal(shape.radiusX(), 20, 'radiusX = a');
        assert.equal(shape.radiusY(), 15, 'radiusY = b');
      });

      test('getAnchors returns 4 Ellipse anchors at cardinal points', () => {
        const ann = makeAnnotation(makeEllipse(30, 40, 20, 15));
        const group = factory.createShapeGroup(ann, style);
        const shape = group.getChildren((n) => n.name() === 'shape')[0];

        const anchors = factory.getAnchors(shape, style);

        assert.equal(anchors.length, 4, '4 anchors');
        for (const a of anchors) {
          assert.ok(a instanceof Konva.Ellipse, 'each anchor is Ellipse');
        }
        // left, right, bottom, top
        assert.equal(anchors[0].x(), 10, 'anchor0 x = center.x - a');
        assert.equal(anchors[0].y(), 40, 'anchor0 y = center.y');
        assert.equal(anchors[1].x(), 50, 'anchor1 x = center.x + a');
        assert.equal(anchors[1].y(), 40, 'anchor1 y = center.y');
        assert.equal(anchors[2].x(), 30, 'anchor2 x = center.x');
        assert.equal(anchors[2].y(), 55, 'anchor2 y = center.y + b');
        assert.equal(anchors[3].x(), 30, 'anchor3 x = center.x');
        assert.equal(anchors[3].y(), 25, 'anchor3 y = center.y - b');
      });

      test('getAnchors assigns ids anchor0..anchor3', () => {
        const ann = makeAnnotation(makeEllipse(0, 0, 10, 5));
        const group = factory.createShapeGroup(ann, style);
        const shape = group.getChildren((n) => n.name() === 'shape')[0];

        const anchors = factory.getAnchors(shape, style);

        for (let i = 0; i < 4; ++i) {
          assert.equal(anchors[i].id(), `anchor${i}`, `anchor${i} id`);
        }
      });

      test('constrainAnchorMove locks left anchor to horizontal axis', () => {
        const ann = makeAnnotation(makeEllipse(30, 40, 20, 15));
        const {anchors} = makeShapeGroupWithAnchors(factory, ann, style);
        // drag anchor0 (left) upward
        anchors[0].y(35);

        factory.constrainAnchorMove(anchors[0]);

        assert.equal(
          anchors[0].y(), anchors[1].y(), 'left.y locked to right.y');
      });

      test('constrainAnchorMove locks right anchor to horizontal axis', () => {
        const ann = makeAnnotation(makeEllipse(30, 40, 20, 15));
        const {anchors} = makeShapeGroupWithAnchors(factory, ann, style);
        anchors[1].y(45);

        factory.constrainAnchorMove(anchors[1]);

        assert.equal(
          anchors[1].y(), anchors[0].y(), 'right.y locked to left.y');
      });

      test('constrainAnchorMove locks bottom anchor to vertical axis', () => {
        const ann = makeAnnotation(makeEllipse(30, 40, 20, 15));
        const {anchors} = makeShapeGroupWithAnchors(factory, ann, style);
        anchors[2].x(38);

        factory.constrainAnchorMove(anchors[2]);

        assert.equal(
          anchors[2].x(), anchors[3].x(), 'bottom.x locked to top.x');
      });

      test('constrainAnchorMove locks top anchor to vertical axis', () => {
        const ann = makeAnnotation(makeEllipse(30, 40, 20, 15));
        const {anchors} = makeShapeGroupWithAnchors(factory, ann, style);
        anchors[3].x(22);

        factory.constrainAnchorMove(anchors[3]);

        assert.equal(
          anchors[3].x(), anchors[2].x(), 'top.x locked to bottom.x');
      });

      test('constrainAnchorMove ignores orphaned anchor', () => {
        const orphan = new Konva.Ellipse({x: 5, y: 5, id: 'anchor0'});
        assert.doesNotThrow(() => factory.constrainAnchorMove(orphan));
      });

      // Ellipse center=(30,40) a=20 b=15. Initial anchors:
      //   left=(10,40), right=(50,40), bottom=(30,55), top=(30,25).
      // Dragging a horizontal anchor changes a; vertical changes b.
      // #updateShape mirrors the opposite anchor and repositions all four.

      test('updateShapeGroupOnAnchorMove: anchor0 (left, widens a)', () => {
        const ann = makeAnnotation(makeEllipse(30, 40, 20, 15));
        const {group, anchors} = makeShapeGroupWithAnchors(factory, ann, style);

        anchors[0].x(5); // left dragged to x=5: a = 30 - 5 = 25
        factory.updateAnnotationOnAnchorMove(ann, anchors[0]);
        factory.updateShapeGroupOnAnchorMove(ann, anchors[0], style);

        const shape = group.getChildren((n) => n.name() === 'shape')[0];
        assert.equal(shape.radiusX(), 25, 'a updated to 25');
        assert.equal(shape.radiusY(), 15, 'b unchanged');
        assert.equal(anchors[0].x(), 5, 'left.x = self');
        assert.equal(anchors[1].x(), 55, 'right.x = cx + a');
        assert.equal(anchors[2].y(), 55, 'bottom.y unchanged');
        assert.equal(anchors[3].y(), 25, 'top.y unchanged');
      });

      test('updateShapeGroupOnAnchorMove: anchor1 (right, widens a)', () => {
        const ann = makeAnnotation(makeEllipse(30, 40, 20, 15));
        const {group, anchors} = makeShapeGroupWithAnchors(factory, ann, style);

        anchors[1].x(55); // right dragged to x=55: a = 55 - 30 = 25
        factory.updateAnnotationOnAnchorMove(ann, anchors[1]);
        factory.updateShapeGroupOnAnchorMove(ann, anchors[1], style);

        const shape = group.getChildren((n) => n.name() === 'shape')[0];
        assert.equal(shape.radiusX(), 25, 'a updated to 25');
        assert.equal(shape.radiusY(), 15, 'b unchanged');
        assert.equal(anchors[0].x(), 5, 'left.x = cx - a');
        assert.equal(anchors[1].x(), 55, 'right.x = self');
        assert.equal(anchors[2].y(), 55, 'bottom.y unchanged');
        assert.equal(anchors[3].y(), 25, 'top.y unchanged');
      });

      test('updateShapeGroupOnAnchorMove: anchor2 (bottom, tallens b)', () => {
        const ann = makeAnnotation(makeEllipse(30, 40, 20, 15));
        const {group, anchors} = makeShapeGroupWithAnchors(factory, ann, style);

        anchors[2].y(65); // bottom dragged to y=65: b = 65 - 40 = 25
        factory.updateAnnotationOnAnchorMove(ann, anchors[2]);
        factory.updateShapeGroupOnAnchorMove(ann, anchors[2], style);

        const shape = group.getChildren((n) => n.name() === 'shape')[0];
        assert.equal(shape.radiusX(), 20, 'a unchanged');
        assert.equal(shape.radiusY(), 25, 'b updated to 25');
        assert.equal(anchors[0].x(), 10, 'left.x unchanged');
        assert.equal(anchors[1].x(), 50, 'right.x unchanged');
        assert.equal(anchors[2].y(), 65, 'bottom.y = self');
        assert.equal(anchors[3].y(), 15, 'top.y = cy - b');
      });

      test('updateShapeGroupOnAnchorMove: anchor3 (top, tallens b)', () => {
        const ann = makeAnnotation(makeEllipse(30, 40, 20, 15));
        const {group, anchors} = makeShapeGroupWithAnchors(factory, ann, style);

        anchors[3].y(15); // top dragged to y=15: b = 40 - 15 = 25
        factory.updateAnnotationOnAnchorMove(ann, anchors[3]);
        factory.updateShapeGroupOnAnchorMove(ann, anchors[3], style);

        const shape = group.getChildren((n) => n.name() === 'shape')[0];
        assert.equal(shape.radiusX(), 20, 'a unchanged');
        assert.equal(shape.radiusY(), 25, 'b updated to 25');
        assert.equal(anchors[0].x(), 10, 'left.x unchanged');
        assert.equal(anchors[1].x(), 50, 'right.x unchanged');
        assert.equal(anchors[2].y(), 65, 'bottom.y = cy + b');
        assert.equal(anchors[3].y(), 15, 'top.y = self');
      });

      test('updateLabelContent updates the label text node', () => {
        const ann = makeAnnotation(makeEllipse(0, 0, 10, 5));
        const group = factory.createShapeGroup(ann, style);

        ann.getText = () => '314 cm²';
        factory.updateLabelContent(ann, group, style);

        const klabel = group.getChildren((n) => n.name() === 'label')[0];
        assert.equal(
          klabel.getText().text(), '314 cm²', 'label text updated');
      });

      test('updateConnector does not throw', () => {
        const ann = makeAnnotation(makeEllipse(0, 0, 10, 5));
        const group = factory.createShapeGroup(ann, style);

        assert.doesNotThrow(() => factory.updateConnector(group));

        const names = group.getChildren().map((c) => c.name());
        assert.ok(names.includes('connector'), 'connector still present');
      });

    }); // Tier 2

  }); // EllipseFactory
}); // tools
