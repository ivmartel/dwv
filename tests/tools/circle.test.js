// @vitest-environment jsdom
import {describe, test, assert, beforeEach} from 'vitest';
import {CircleFactory} from '../../src/tools/circle.js';
import {Circle} from '../../src/math/circle.js';
import {Point2D} from '../../src/math/point.js';
import Konva from 'konva';
import {
  makeStyle,
  makeAnnotation,
  makeShapeGroupWithAnchors,
} from './utils/toolTestHelpers.js';

/**
 * Convenience: build a Circle from plain numbers.
 *
 * @param {number} cx Centre x.
 * @param {number} cy Centre y.
 * @param {number} r Radius.
 * @returns {Circle} The circle.
 */
function makeCircle(cx, cy, r) {
  return new Circle(new Point2D(cx, cy), r);
}

describe('tools', () => {
  describe('CircleFactory', () => {

    // -----------------------------------------------------------------------
    // Tier 1 – pure annotation logic, no Konva shape rendering
    // -----------------------------------------------------------------------
    describe('Tier 1 - annotation logic', () => {

      test('supports returns true only for Circle instances', () => {
        assert.ok(CircleFactory.supports(makeCircle(0, 0, 5)));
        assert.notOk(CircleFactory.supports(new Point2D(0, 0)));
        assert.notOk(CircleFactory.supports({}));
        assert.notOk(CircleFactory.supports(undefined));
      });

      test('getName, getGroupName, getNPoints, getTimeout', () => {
        const f = new CircleFactory();
        assert.equal(f.getName(), 'circle');
        assert.equal(f.getGroupName(), 'circle-group');
        assert.equal(f.getNPoints(), 2);
        assert.equal(f.getTimeout(), 0);
      });

      test('setAnnotationMathShape sets center to points[0]', () => {
        const f = new CircleFactory();
        const ann = makeAnnotation(undefined);
        const center = new Point2D(10, 20);
        const edge = new Point2D(10, 27); // straight down → radius 7

        f.setAnnotationMathShape(ann, [center, edge]);

        assert.ok(ann.mathShape instanceof Circle, 'mathShape is Circle');
        assert.equal(ann.mathShape.getCenter().getX(), 10, 'center x');
        assert.equal(ann.mathShape.getCenter().getY(), 20, 'center y');
        assert.equal(ann.mathShape.getRadius(), 7, 'radius = distance');
      });

      test('setAnnotationMathShape radius is Euclidean distance', () => {
        const f = new CircleFactory();
        const ann = makeAnnotation(undefined);
        // 3-4-5 right triangle → radius = 5
        f.setAnnotationMathShape(
          ann, [new Point2D(0, 0), new Point2D(3, 4)]);

        assert.equal(ann.mathShape.getRadius(), 5, 'radius = sqrt(9+16) = 5');
      });

      test('setAnnotationMathShape rounds the radius', () => {
        const f = new CircleFactory();
        const ann = makeAnnotation(undefined);
        // distance = sqrt(2) ≈ 1.414 → rounds to 1
        f.setAnnotationMathShape(
          ann, [new Point2D(0, 0), new Point2D(1, 1)]);

        assert.equal(ann.mathShape.getRadius(), 1, 'radius is rounded');
      });

      test('setAnnotationMathShape calls hooks', () => {
        const f = new CircleFactory();
        const ann = makeAnnotation(undefined);

        f.setAnnotationMathShape(
          ann, [new Point2D(0, 0), new Point2D(0, 5)]);

        assert.equal(
          ann.setTextExpr.mock.calls.length, 1, 'setTextExpr called once');
        assert.equal(
          ann.updateQuantification.mock.calls.length, 1,
          'updateQuantification called once');
      });

      test('setAnnotationMathShape passes default circle label', () => {
        const f = new CircleFactory();
        const ann = makeAnnotation(undefined);

        f.setAnnotationMathShape(
          ann, [new Point2D(0, 0), new Point2D(0, 5)]);

        const labelArg = ann.setTextExpr.mock.calls[0][0];
        assert.equal(typeof labelArg, 'object', 'label is an object');
        assert.ok('*' in labelArg, 'label has wildcard key');
        assert.equal(
          labelArg['*'], '{surface}', 'circle default label is {surface}');
      });

      test('updateAnnotationOnTranslation shifts center, keeps radius', () => {
        const f = new CircleFactory();
        const ann = makeAnnotation(makeCircle(30, 40, 20));

        f.updateAnnotationOnTranslation(ann, {x: 5, y: 10});

        assert.equal(ann.mathShape.getCenter().getX(), 35, 'center.x + 5');
        assert.equal(ann.mathShape.getCenter().getY(), 50, 'center.y + 10');
        assert.equal(ann.mathShape.getRadius(), 20, 'radius unchanged');
        assert.equal(
          ann.updateQuantification.mock.calls.length, 1,
          'updateQuantification called');
      });

      test('updateAnnotationOnTranslation zero is a no-op', () => {
        const f = new CircleFactory();
        const ann = makeAnnotation(makeCircle(30, 40, 20));

        f.updateAnnotationOnTranslation(ann, {x: 0, y: 0});

        assert.equal(ann.mathShape.getCenter().getX(), 30);
        assert.equal(ann.mathShape.getCenter().getY(), 40);
        assert.equal(ann.mathShape.getRadius(), 20);
      });

      test('updateAnnotationOnAnchorMove uses center from annotation', () => {
        const f = new CircleFactory();
        const ann = makeAnnotation(makeCircle(30, 40, 20));
        // anchor moved to (55, 40): distance from center = 25
        const anchor = new Konva.Ellipse({x: 55, y: 40, id: 'anchor1'});

        f.updateAnnotationOnAnchorMove(ann, anchor);

        assert.equal(
          ann.mathShape.getCenter().getX(), 30, 'center.x preserved');
        assert.equal(
          ann.mathShape.getCenter().getY(), 40, 'center.y preserved');
        assert.equal(ann.mathShape.getRadius(), 25, 'radius = distance');
        assert.equal(
          ann.updateQuantification.mock.calls.length, 1,
          'updateQuantification called');
      });

      test('updateAnnotationOnAnchorMove from any anchor direction', () => {
        const f = new CircleFactory();
        const ann = makeAnnotation(makeCircle(30, 40, 20));
        // bottom anchor dragged down: distance from (30,40) to (30,65) = 25
        const anchor = new Konva.Ellipse({x: 30, y: 65, id: 'anchor2'});

        f.updateAnnotationOnAnchorMove(ann, anchor);

        assert.equal(ann.mathShape.getRadius(), 25, 'radius = 25');
      });

    }); // Tier 1

    // -----------------------------------------------------------------------
    // Tier 2 – Konva shape group creation and update (requires jsdom)
    // -----------------------------------------------------------------------
    describe('Tier 2 - Konva shape group', () => {

      let factory;
      let style;

      beforeEach(() => {
        factory = new CircleFactory();
        style = makeStyle();
      });

      test('createShapeGroup returns Konva.Group with metadata', () => {
        const ann = makeAnnotation(makeCircle(30, 40, 20));
        const group = factory.createShapeGroup(ann, style);

        assert.ok(group instanceof Konva.Group, 'returns Konva.Group');
        assert.equal(group.name(), 'circle-group', 'group name');
        assert.equal(group.id(), 'test-uid', 'group id from trackingUid');
      });

      test('createShapeGroup has shape, label, connector children', () => {
        const ann = makeAnnotation(makeCircle(30, 40, 20));
        const group = factory.createShapeGroup(ann, style);

        const names = group.getChildren().map((c) => c.name());
        assert.ok(names.includes('shape'), 'has shape');
        assert.ok(names.includes('label'), 'has label');
        assert.ok(names.includes('connector'), 'has connector');
      });

      test('createShapeGroup adds exactly 3 children', () => {
        const ann = makeAnnotation(makeCircle(30, 40, 20));
        const group = factory.createShapeGroup(ann, style);

        assert.equal(
          group.getChildren().length, 3,
          '3 children: shape, label, connector');
      });

      test('createShapeGroup shape is Konva.Circle with center/radius', () => {
        const ann = makeAnnotation(makeCircle(30, 40, 20));
        const group = factory.createShapeGroup(ann, style);

        const shape = group.getChildren((n) => n.name() === 'shape')[0];
        assert.ok(shape instanceof Konva.Circle, 'shape is Konva.Circle');
        assert.equal(shape.x(), 30, 'x = center.x');
        assert.equal(shape.y(), 40, 'y = center.y');
        assert.equal(shape.radius(), 20, 'radius');
      });

      test('getAnchors returns 4 Ellipse anchors at cardinal points', () => {
        const ann = makeAnnotation(makeCircle(30, 40, 20));
        const group = factory.createShapeGroup(ann, style);
        const shape = group.getChildren((n) => n.name() === 'shape')[0];

        const anchors = factory.getAnchors(shape, style);

        assert.equal(anchors.length, 4, '4 anchors');
        for (const a of anchors) {
          assert.ok(a instanceof Konva.Ellipse, 'each anchor is Ellipse');
        }
        // left, right, bottom, top
        assert.equal(anchors[0].x(), 10, 'anchor0 x = center.x - radius');
        assert.equal(anchors[0].y(), 40, 'anchor0 y = center.y');
        assert.equal(anchors[1].x(), 50, 'anchor1 x = center.x + radius');
        assert.equal(anchors[1].y(), 40, 'anchor1 y = center.y');
        assert.equal(anchors[2].x(), 30, 'anchor2 x = center.x');
        assert.equal(anchors[2].y(), 60, 'anchor2 y = center.y + radius');
        assert.equal(anchors[3].x(), 30, 'anchor3 x = center.x');
        assert.equal(anchors[3].y(), 20, 'anchor3 y = center.y - radius');
      });

      test('getAnchors assigns ids anchor0..anchor3', () => {
        const ann = makeAnnotation(makeCircle(0, 0, 10));
        const group = factory.createShapeGroup(ann, style);
        const shape = group.getChildren((n) => n.name() === 'shape')[0];

        const anchors = factory.getAnchors(shape, style);

        for (let i = 0; i < 4; ++i) {
          assert.equal(anchors[i].id(), `anchor${i}`, `anchor${i} id`);
        }
      });

      test('constrainAnchorMove locks left anchor to horizontal axis', () => {
        const ann = makeAnnotation(makeCircle(30, 40, 20));
        const {anchors} = makeShapeGroupWithAnchors(factory, ann, style);
        // anchor0 (left) is at (10, 40); drag it upward to y=35
        anchors[0].y(35);

        factory.constrainAnchorMove(anchors[0]);

        // left.y must equal right.y (horizontal constraint)
        assert.equal(
          anchors[0].y(), anchors[1].y(), 'left.y locked to right.y');
      });

      test('constrainAnchorMove locks right anchor to horizontal axis', () => {
        const ann = makeAnnotation(makeCircle(30, 40, 20));
        const {anchors} = makeShapeGroupWithAnchors(factory, ann, style);
        // anchor1 (right) is at (50, 40); drag it down to y=45
        anchors[1].y(45);

        factory.constrainAnchorMove(anchors[1]);

        assert.equal(
          anchors[1].y(), anchors[0].y(), 'right.y locked to left.y');
      });

      test('constrainAnchorMove locks bottom anchor to vertical axis', () => {
        const ann = makeAnnotation(makeCircle(30, 40, 20));
        const {anchors} = makeShapeGroupWithAnchors(factory, ann, style);
        // anchor2 (bottom) is at (30, 60); drag it right to x=38
        anchors[2].x(38);

        factory.constrainAnchorMove(anchors[2]);

        // bottom.x must equal top.x (vertical constraint)
        assert.equal(
          anchors[2].x(), anchors[3].x(), 'bottom.x locked to top.x');
      });

      test('constrainAnchorMove locks top anchor to vertical axis', () => {
        const ann = makeAnnotation(makeCircle(30, 40, 20));
        const {anchors} = makeShapeGroupWithAnchors(factory, ann, style);
        // anchor3 (top) is at (30, 20); drag it left to x=22
        anchors[3].x(22);

        factory.constrainAnchorMove(anchors[3]);

        assert.equal(
          anchors[3].x(), anchors[2].x(), 'top.x locked to bottom.x');
      });

      test('constrainAnchorMove ignores orphaned anchor', () => {
        const orphan = new Konva.Ellipse({x: 5, y: 5, id: 'anchor0'});
        // no parent group → must return without throwing
        assert.doesNotThrow(
          () => factory.constrainAnchorMove(orphan));
      });

      // All 4 anchor cases use center=(30,40) with radius growing 20→25.
      // #updateShape places every anchor at the new cardinal positions:
      //   left=(5,40), right=(55,40), bottom=(30,65), top=(30,15).

      test('updateShapeGroupOnAnchorMove: anchor0 (left)', () => {
        const ann = makeAnnotation(makeCircle(30, 40, 20));
        const {group, anchors} = makeShapeGroupWithAnchors(factory, ann, style);

        anchors[0].x(5); // drag left anchor inward: r = 30 - 5 = 25
        factory.updateAnnotationOnAnchorMove(ann, anchors[0]);
        factory.updateShapeGroupOnAnchorMove(ann, anchors[0], style);

        const shape = group.getChildren((n) => n.name() === 'shape')[0];
        assert.equal(shape.radius(), 25, 'radius updated');
        assert.equal(anchors[0].x(), 5, 'left.x = self');
        assert.equal(anchors[1].x(), 55, 'right.x = cx + r');
        assert.equal(anchors[2].y(), 65, 'bottom.y = cy + r');
        assert.equal(anchors[3].y(), 15, 'top.y = cy - r');
      });

      test('updateShapeGroupOnAnchorMove: anchor1 (right)', () => {
        const ann = makeAnnotation(makeCircle(30, 40, 20));
        const {group, anchors} = makeShapeGroupWithAnchors(factory, ann, style);

        anchors[1].x(55); // drag right anchor outward: r = 55 - 30 = 25
        factory.updateAnnotationOnAnchorMove(ann, anchors[1]);
        factory.updateShapeGroupOnAnchorMove(ann, anchors[1], style);

        const shape = group.getChildren((n) => n.name() === 'shape')[0];
        assert.equal(shape.radius(), 25, 'radius updated');
        assert.equal(anchors[0].x(), 5, 'left.x = cx - r');
        assert.equal(anchors[1].x(), 55, 'right.x = self');
        assert.equal(anchors[2].y(), 65, 'bottom.y = cy + r');
        assert.equal(anchors[3].y(), 15, 'top.y = cy - r');
      });

      test('updateShapeGroupOnAnchorMove: anchor2 (bottom)', () => {
        const ann = makeAnnotation(makeCircle(30, 40, 20));
        const {group, anchors} = makeShapeGroupWithAnchors(factory, ann, style);

        anchors[2].y(65); // drag bottom anchor down: r = 65 - 40 = 25
        factory.updateAnnotationOnAnchorMove(ann, anchors[2]);
        factory.updateShapeGroupOnAnchorMove(ann, anchors[2], style);

        const shape = group.getChildren((n) => n.name() === 'shape')[0];
        assert.equal(shape.radius(), 25, 'radius updated');
        assert.equal(anchors[0].x(), 5, 'left.x = cx - r');
        assert.equal(anchors[1].x(), 55, 'right.x = cx + r');
        assert.equal(anchors[2].y(), 65, 'bottom.y = self');
        assert.equal(anchors[3].y(), 15, 'top.y = cy - r');
      });

      test('updateShapeGroupOnAnchorMove: anchor3 (top)', () => {
        const ann = makeAnnotation(makeCircle(30, 40, 20));
        const {group, anchors} = makeShapeGroupWithAnchors(factory, ann, style);

        anchors[3].y(15); // drag top anchor up: r = 40 - 15 = 25
        factory.updateAnnotationOnAnchorMove(ann, anchors[3]);
        factory.updateShapeGroupOnAnchorMove(ann, anchors[3], style);

        const shape = group.getChildren((n) => n.name() === 'shape')[0];
        assert.equal(shape.radius(), 25, 'radius updated');
        assert.equal(anchors[0].x(), 5, 'left.x = cx - r');
        assert.equal(anchors[1].x(), 55, 'right.x = cx + r');
        assert.equal(anchors[2].y(), 65, 'bottom.y = cy + r');
        assert.equal(anchors[3].y(), 15, 'top.y = self');
      });

      test('updateLabelContent updates the label text node', () => {
        const ann = makeAnnotation(makeCircle(0, 0, 5));
        const group = factory.createShapeGroup(ann, style);

        ann.getText = () => '78.5 cm²';
        factory.updateLabelContent(ann, group, style);

        const klabel = group.getChildren((n) => n.name() === 'label')[0];
        assert.equal(
          klabel.getText().text(), '78.5 cm²', 'label text updated');
      });

      test('updateConnector does not throw', () => {
        const ann = makeAnnotation(makeCircle(0, 0, 5));
        const group = factory.createShapeGroup(ann, style);

        assert.doesNotThrow(() => factory.updateConnector(group));

        const names = group.getChildren().map((c) => c.name());
        assert.ok(names.includes('connector'), 'connector still present');
      });

    }); // Tier 2

  }); // CircleFactory
}); // tools
