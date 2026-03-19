// @vitest-environment jsdom
import {describe, test, assert, beforeEach} from 'vitest';
import {RulerFactory} from '../../src/tools/ruler.js';
import {Line} from '../../src/math/line.js';
import {Point2D} from '../../src/math/point.js';
import Konva from 'konva';
import {
  makeStyle,
  makeAnnotation,
  makeShapeGroupWithAnchors,
} from './utils/toolTestHelpers.js';

/**
 * Build a ruler Line from (x0,y0) to (x1,y1).
 *
 * @param {number} x0 X of the begin point.
 * @param {number} y0 Y of the begin point.
 * @param {number} x1 X of the end point.
 * @param {number} y1 Y of the end point.
 * @returns {Line} The Line.
 */
function makeLine(x0, y0, x1, y1) {
  return new Line(new Point2D(x0, y0), new Point2D(x1, y1));
}

describe('tools', () => {
  describe('RulerFactory', () => {

    // -----------------------------------------------------------------------
    // Tier 1 – pure annotation logic, no Konva shape rendering
    // -----------------------------------------------------------------------
    describe('Tier 1 - annotation logic', () => {

      test('supports returns true only for Line instances', () => {
        assert.ok(RulerFactory.supports(makeLine(0, 0, 10, 0)));
        assert.notOk(RulerFactory.supports(new Point2D(0, 0)));
        assert.notOk(RulerFactory.supports({}));
        assert.notOk(RulerFactory.supports(undefined));
      });

      test('getName, getGroupName, getNPoints, getTimeout', () => {
        const f = new RulerFactory();
        assert.equal(f.getName(), 'ruler');
        assert.equal(f.getGroupName(), 'ruler-group');
        assert.equal(f.getNPoints(), 2);
        assert.equal(f.getTimeout(), 0);
      });

      test('setAnnotationMathShape stores a Line from two points', () => {
        const f = new RulerFactory();
        const ann = makeAnnotation(undefined);
        const pts = [new Point2D(0, 0), new Point2D(30, 0)];

        f.setAnnotationMathShape(ann, pts);

        assert.ok(ann.mathShape instanceof Line, 'mathShape is a Line');
        assert.equal(ann.mathShape.getBegin().getX(), 0, 'begin.x');
        assert.equal(ann.mathShape.getBegin().getY(), 0, 'begin.y');
        assert.equal(ann.mathShape.getEnd().getX(), 30, 'end.x');
        assert.equal(ann.mathShape.getEnd().getY(), 0, 'end.y');
      });

      test('setAnnotationMathShape calls hooks', () => {
        const f = new RulerFactory();
        const ann = makeAnnotation(undefined);

        f.setAnnotationMathShape(
          ann, [new Point2D(0, 0), new Point2D(30, 0)]);

        assert.equal(
          ann.setTextExpr.mock.calls.length, 1, 'setTextExpr called once');
        assert.equal(
          ann.updateQuantification.mock.calls.length, 1,
          'updateQuantification called once');
      });

      test('setAnnotationMathShape passes default ruler label', () => {
        const f = new RulerFactory();
        const ann = makeAnnotation(undefined);

        f.setAnnotationMathShape(
          ann, [new Point2D(0, 0), new Point2D(30, 0)]);

        const labelArg = ann.setTextExpr.mock.calls[0][0];
        assert.equal(typeof labelArg, 'object', 'label is an object');
        assert.ok('*' in labelArg, 'label has wildcard key');
        assert.equal(labelArg['*'], '{length}', 'default label is {length}');
      });

      test('constrainAnchorMove is a no-op', () => {
        const f = new RulerFactory();
        assert.doesNotThrow(() => f.constrainAnchorMove({}));
        assert.doesNotThrow(() => f.constrainAnchorMove(undefined));
      });

      test('updateAnnotationOnTranslation shifts both endpoints', () => {
        const f = new RulerFactory();
        const ann = makeAnnotation(makeLine(0, 0, 30, 0));

        f.updateAnnotationOnTranslation(ann, {x: 5, y: 10});

        assert.equal(
          ann.mathShape.getBegin().getX(), 5, 'begin.x + 5');
        assert.equal(
          ann.mathShape.getBegin().getY(), 10, 'begin.y + 10');
        assert.equal(ann.mathShape.getEnd().getX(), 35, 'end.x + 5');
        assert.equal(ann.mathShape.getEnd().getY(), 10, 'end.y + 10');
        assert.equal(
          ann.updateQuantification.mock.calls.length, 1,
          'updateQuantification called');
      });

      test('updateAnnotationOnTranslation zero is a no-op', () => {
        const f = new RulerFactory();
        const ann = makeAnnotation(makeLine(0, 0, 30, 0));

        f.updateAnnotationOnTranslation(ann, {x: 0, y: 0});

        assert.equal(ann.mathShape.getBegin().getX(), 0);
        assert.equal(ann.mathShape.getEnd().getX(), 30);
      });

    }); // Tier 1

    // -----------------------------------------------------------------------
    // Tier 2 – Konva shape group creation and update (requires jsdom)
    // -----------------------------------------------------------------------
    describe('Tier 2 - Konva shape group', () => {

      let factory;
      let style;

      beforeEach(() => {
        factory = new RulerFactory();
        style = makeStyle();
      });

      test('createShapeGroup returns Konva.Group with metadata', () => {
        const ann = makeAnnotation(makeLine(0, 0, 30, 0));
        const group = factory.createShapeGroup(ann, style);

        assert.ok(group instanceof Konva.Group, 'returns Konva.Group');
        assert.equal(group.name(), 'ruler-group', 'group name');
        assert.equal(group.id(), 'test-uid', 'group id from trackingUid');
      });

      // The ruler adds: shape, tick0, tick1, label, connector = 5 children.
      test('createShapeGroup adds exactly 5 children', () => {
        const ann = makeAnnotation(makeLine(0, 0, 30, 0));
        const group = factory.createShapeGroup(ann, style);

        assert.equal(group.getChildren().length, 5,
          '5 children: shape, tick0, tick1, label, connector');
      });

      test('createShapeGroup has shape, tick marks, label, connector', () => {
        const ann = makeAnnotation(makeLine(0, 0, 30, 0));
        const group = factory.createShapeGroup(ann, style);

        const names = group.getChildren().map((c) => c.name());
        assert.ok(names.includes('shape'), 'has shape');
        assert.ok(names.includes('shape-tick0'), 'has tick0');
        assert.ok(names.includes('shape-tick1'), 'has tick1');
        assert.ok(names.includes('label'), 'has label');
        assert.ok(names.includes('connector'), 'has connector');
      });

      test('createShapeGroup shape is Konva.Line with correct points', () => {
        const ann = makeAnnotation(makeLine(0, 0, 30, 20));
        const group = factory.createShapeGroup(ann, style);

        const shape = group.getChildren((n) => n.name() === 'shape')[0];
        assert.ok(shape instanceof Konva.Line, 'shape is Konva.Line');
        assert.deepEqual(
          shape.points(), [0, 0, 30, 20],
          'flat points: [begin.x, begin.y, end.x, end.y]');
      });

      test('createShapeGroup tick marks are Konva.Lines with 4 points', () => {
        const ann = makeAnnotation(makeLine(0, 0, 30, 0));
        const group = factory.createShapeGroup(ann, style);

        const tick0 = group.getChildren(
          (n) => n.name() === 'shape-tick0')[0];
        const tick1 = group.getChildren(
          (n) => n.name() === 'shape-tick1')[0];

        assert.ok(tick0 instanceof Konva.Line, 'tick0 is Konva.Line');
        assert.ok(tick1 instanceof Konva.Line, 'tick1 is Konva.Line');
        assert.equal(tick0.points().length, 4, 'tick0 has 4 point values');
        assert.equal(tick1.points().length, 4, 'tick1 has 4 point values');
      });

      test('getAnchors returns 2 Ellipses at begin and end', () => {
        const ann = makeAnnotation(makeLine(0, 0, 30, 20));
        const group = factory.createShapeGroup(ann, style);
        const shape = group.getChildren((n) => n.name() === 'shape')[0];

        const anchors = factory.getAnchors(shape, style);

        assert.equal(anchors.length, 2, '2 anchors');
        for (const a of anchors) {
          assert.ok(a instanceof Konva.Ellipse, 'each anchor is Ellipse');
        }
        assert.equal(anchors[0].id(), 'anchor0', 'anchor0 id');
        assert.equal(anchors[1].id(), 'anchor1', 'anchor1 id');
        assert.equal(anchors[0].x(), 0, 'anchor0 at begin.x');
        assert.equal(anchors[0].y(), 0, 'anchor0 at begin.y');
        assert.equal(anchors[1].x(), 30, 'anchor1 at end.x');
        assert.equal(anchors[1].y(), 20, 'anchor1 at end.y');
      });

      // updateAnnotationOnAnchorMove reads BOTH anchor positions to build the
      // new Line — moving anchor1 updates the end while begin stays in place.
      test('updateAnnotationOnAnchorMove: move anchor1 updates end', () => {
        const ann = makeAnnotation(makeLine(0, 0, 30, 0));
        const {anchors} = makeShapeGroupWithAnchors(factory, ann, style);

        anchors[1].x(40);
        anchors[1].y(10);
        factory.updateAnnotationOnAnchorMove(ann, anchors[1]);

        assert.equal(ann.mathShape.getBegin().getX(), 0, 'begin.x unchanged');
        assert.equal(ann.mathShape.getBegin().getY(), 0, 'begin.y unchanged');
        assert.equal(ann.mathShape.getEnd().getX(), 40, 'end.x updated');
        assert.equal(ann.mathShape.getEnd().getY(), 10, 'end.y updated');
        assert.equal(
          ann.updateQuantification.mock.calls.length, 1,
          'updateQuantification called');
      });

      test('updateAnnotationOnAnchorMove: move anchor0 updates begin', () => {
        const ann = makeAnnotation(makeLine(0, 0, 30, 0));
        const {anchors} = makeShapeGroupWithAnchors(factory, ann, style);

        anchors[0].x(5);
        anchors[0].y(15);
        factory.updateAnnotationOnAnchorMove(ann, anchors[0]);

        assert.equal(
          ann.mathShape.getBegin().getX(), 5, 'begin.x updated');
        assert.equal(
          ann.mathShape.getBegin().getY(), 15, 'begin.y updated');
        assert.equal(ann.mathShape.getEnd().getX(), 30, 'end.x unchanged');
        assert.equal(ann.mathShape.getEnd().getY(), 0, 'end.y unchanged');
      });

      test('updateAnnotationOnAnchorMove ignores orphaned anchor', () => {
        const ann = makeAnnotation(makeLine(0, 0, 30, 0));
        const orphan = new Konva.Ellipse({x: 5, y: 5, id: 'anchor1'});

        factory.updateAnnotationOnAnchorMove(ann, orphan);

        assert.equal(ann.updateQuantification.mock.calls.length, 0,
          'updateQuantification not called');
        assert.equal(
          ann.mathShape.getEnd().getX(), 30, 'mathShape unchanged');
      });

      test('updateShapeGroupOnAnchorMove updates main shape points', () => {
        const ann = makeAnnotation(makeLine(0, 0, 30, 0));
        const {group, anchors} = makeShapeGroupWithAnchors(factory, ann, style);

        anchors[1].x(40);
        anchors[1].y(10);
        factory.updateAnnotationOnAnchorMove(ann, anchors[1]);
        factory.updateShapeGroupOnAnchorMove(ann, anchors[1], style);

        const shape = group.getChildren((n) => n.name() === 'shape')[0];
        assert.deepEqual(
          shape.points(), [0, 0, 40, 10],
          'shape points updated to new endpoint');
      });

      test('updateShapeGroupOnAnchorMove updates tick positions', () => {
        const ann = makeAnnotation(makeLine(0, 0, 30, 0));
        const {group, anchors} = makeShapeGroupWithAnchors(factory, ann, style);
        const tick0before = group.getChildren(
          (n) => n.name() === 'shape-tick0')[0].points().slice();
        const tick1before = group.getChildren(
          (n) => n.name() === 'shape-tick1')[0].points().slice();

        // move end point, update math shape then Konva group
        anchors[1].x(50);
        anchors[1].y(0);
        factory.updateAnnotationOnAnchorMove(ann, anchors[1]);
        factory.updateShapeGroupOnAnchorMove(ann, anchors[1], style);

        const tick0after = group.getChildren(
          (n) => n.name() === 'shape-tick0')[0].points();
        const tick1after = group.getChildren(
          (n) => n.name() === 'shape-tick1')[0].points();

        // tick0 is at begin (0,0) which hasn't moved – stays the same
        assert.deepEqual(tick0after, tick0before, 'tick0 unchanged');
        // tick1 moved with the end point
        assert.notDeepEqual(tick1after, tick1before, 'tick1 updated');
      });

      test('updateLabelContent updates the label text node', () => {
        const ann = makeAnnotation(makeLine(0, 0, 30, 0));
        const group = factory.createShapeGroup(ann, style);

        ann.getText = () => '30 mm';
        factory.updateLabelContent(ann, group, style);

        const klabel = group.getChildren((n) => n.name() === 'label')[0];
        assert.equal(klabel.getText().text(), '30 mm', 'label text updated');
      });

      test('updateConnector does not throw', () => {
        const ann = makeAnnotation(makeLine(0, 0, 30, 0));
        const group = factory.createShapeGroup(ann, style);

        assert.doesNotThrow(() => factory.updateConnector(group));

        const names = group.getChildren().map((c) => c.name());
        assert.ok(names.includes('connector'), 'connector still present');
      });

    }); // Tier 2

  }); // RulerFactory
}); // tools
