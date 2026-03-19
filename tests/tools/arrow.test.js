// @vitest-environment jsdom
import {describe, test, assert, beforeEach} from 'vitest';
import {ArrowFactory} from '../../src/tools/arrow.js';
import {Point2D} from '../../src/math/point.js';
import Konva from 'konva';
import {
  makeStyle,
  makeAnnotation as _makeAnnotation,
  makeShapeGroupWithAnchors,
} from './utils/toolTestHelpers.js';

/**
 * Create an Arrow annotation mock.
 * Extends the shared mock with the ArrowFactory-specific
 * `referencePoints` field (arrow tail point).
 *
 * @param {Point2D} [begin] The begin (mathShape) point.
 * @param {Point2D} [end] The end (referencePoints[0]) point.
 * @returns {object} The annotation mock.
 */
function makeAnnotation(begin, end) {
  const ann = _makeAnnotation(begin);
  ann.referencePoints = end !== undefined ? [end] : undefined;
  return ann;
}

describe('tools', () => {
  describe('ArrowFactory', () => {

    // -----------------------------------------------------------------------
    // Tier 1 – pure annotation logic, no Konva shape rendering
    // -----------------------------------------------------------------------
    describe('Tier 1 - annotation logic', () => {

      test('supports returns true only for Point2D instances', () => {
        assert.ok(ArrowFactory.supports(new Point2D(0, 0)));
        assert.notOk(ArrowFactory.supports({}));
        assert.notOk(ArrowFactory.supports(undefined));
        assert.notOk(ArrowFactory.supports(new Date()));
        assert.notOk(ArrowFactory.supports(42));
      });

      test('getName, getGroupName, getNPoints, getTimeout', () => {
        const f = new ArrowFactory();
        assert.equal(f.getName(), 'arrow');
        assert.equal(f.getGroupName(), 'arrow-group');
        assert.equal(f.getNPoints(), 2);
        assert.equal(f.getTimeout(), 0);
      });

      test('constrainAnchorMove is a no-op', () => {
        const f = new ArrowFactory();
        assert.doesNotThrow(() => f.constrainAnchorMove({}));
        assert.doesNotThrow(() => f.constrainAnchorMove(undefined));
      });

      test('setAnnotationMathShape sets mathShape and referencePoints', () => {
        const f = new ArrowFactory();
        const begin = new Point2D(10, 20);
        const end = new Point2D(30, 40);
        const ann = makeAnnotation(undefined, undefined);

        f.setAnnotationMathShape(ann, [begin, end]);

        assert.equal(ann.mathShape, begin, 'mathShape = begin point');
        assert.equal(
          ann.referencePoints[0], end, 'referencePoints[0] = end point');
      });

      test('setAnnotationMathShape calls hooks', () => {
        const f = new ArrowFactory();
        const ann = makeAnnotation(undefined, undefined);

        f.setAnnotationMathShape(ann, [new Point2D(0, 0), new Point2D(1, 1)]);

        assert.equal(
          ann.setTextExpr.mock.calls.length, 1, 'setTextExpr called once');
        assert.equal(
          ann.updateQuantification.mock.calls.length, 1,
          'updateQuantification called once');
      });

      test('setAnnotationMathShape passes default arrow label', () => {
        const f = new ArrowFactory();
        const ann = makeAnnotation(undefined, undefined);

        f.setAnnotationMathShape(ann, [new Point2D(0, 0), new Point2D(1, 1)]);

        const labelArg = ann.setTextExpr.mock.calls[0][0];
        assert.equal(typeof labelArg, 'object', 'label is an object');
        assert.ok('*' in labelArg, 'label has wildcard key');
        assert.equal(labelArg['*'], '', 'arrow default label is empty string');
      });

      test('updateAnnotationOnTranslation shifts both endpoints', () => {
        const f = new ArrowFactory();
        const begin = new Point2D(10, 20);
        const end = new Point2D(30, 40);
        const ann = makeAnnotation(begin, end);

        f.updateAnnotationOnTranslation(ann, {x: 5, y: 10});

        assert.equal(ann.mathShape.getX(), 15, 'begin.x + 5');
        assert.equal(ann.mathShape.getY(), 30, 'begin.y + 10');
        assert.equal(ann.referencePoints[0].getX(), 35, 'end.x + 5');
        assert.equal(ann.referencePoints[0].getY(), 50, 'end.y + 10');
        assert.equal(
          ann.updateQuantification.mock.calls.length, 1,
          'updateQuantification called');
      });

      test('updateAnnotationOnTranslation zero translation is a no-op', () => {
        const f = new ArrowFactory();
        const begin = new Point2D(10, 20);
        const end = new Point2D(30, 40);
        const ann = makeAnnotation(begin, end);

        f.updateAnnotationOnTranslation(ann, {x: 0, y: 0});

        assert.equal(ann.mathShape.getX(), 10, 'begin.x unchanged');
        assert.equal(ann.mathShape.getY(), 20, 'begin.y unchanged');
        assert.equal(ann.referencePoints[0].getX(), 30, 'end.x unchanged');
        assert.equal(ann.referencePoints[0].getY(), 40, 'end.y unchanged');
      });

    }); // Tier 1

    // -----------------------------------------------------------------------
    // Tier 2 – Konva shape group creation and update (requires jsdom)
    // -----------------------------------------------------------------------
    describe('Tier 2 - Konva shape group', () => {

      let factory;
      let style;

      beforeEach(() => {
        factory = new ArrowFactory();
        style = makeStyle();
      });

      test('createShapeGroup returns Konva.Group with metadata', () => {
        const ann = makeAnnotation(new Point2D(10, 20), new Point2D(50, 60));
        const group = factory.createShapeGroup(ann, style);

        assert.ok(group instanceof Konva.Group, 'returns Konva.Group');
        assert.equal(group.name(), 'arrow-group', 'group name');
        assert.equal(group.id(), 'test-uid', 'group id from trackingUid');
      });

      test('createShapeGroup has shape, triangle, label, connector', () => {
        const ann = makeAnnotation(new Point2D(10, 20), new Point2D(50, 60));
        const group = factory.createShapeGroup(ann, style);

        const names = group.getChildren().map((c) => c.name());
        assert.ok(names.includes('shape'), 'has shape child');
        assert.ok(names.includes('shape-triangle'), 'has shape-triangle child');
        assert.ok(names.includes('label'), 'has label child');
        assert.ok(names.includes('connector'), 'has connector child');
      });

      test('createShapeGroup shape points match annotation coords', () => {
        const begin = new Point2D(10, 20);
        const end = new Point2D(50, 60);
        const ann = makeAnnotation(begin, end);
        const group = factory.createShapeGroup(ann, style);

        const shape = group.getChildren((n) => n.name() === 'shape')[0];
        assert.ok(shape instanceof Konva.Line, 'shape is a Konva.Line');
        assert.deepEqual(
          shape.points(),
          [10, 20, 50, 60],
          'shape points match begin and end coordinates');
      });

      test('getAnchors returns 2 Ellipse anchors at begin and end', () => {
        const begin = new Point2D(10, 20);
        const end = new Point2D(50, 60);
        const ann = makeAnnotation(begin, end);
        const group = factory.createShapeGroup(ann, style);
        const shape = group.getChildren((n) => n.name() === 'shape')[0];

        const anchors = factory.getAnchors(shape, style);

        assert.equal(anchors.length, 2, '2 anchors returned');
        assert.ok(anchors[0] instanceof Konva.Ellipse, 'anchor0 is Ellipse');
        assert.ok(anchors[1] instanceof Konva.Ellipse, 'anchor1 is Ellipse');
        assert.equal(anchors[0].x(), 10, 'anchor0 x = begin.x');
        assert.equal(anchors[0].y(), 20, 'anchor0 y = begin.y');
        assert.equal(anchors[1].x(), 50, 'anchor1 x = end.x');
        assert.equal(anchors[1].y(), 60, 'anchor1 y = end.y');
      });

      test('getAnchors assigns ids anchor0 and anchor1', () => {
        const ann = makeAnnotation(new Point2D(0, 0), new Point2D(10, 10));
        const group = factory.createShapeGroup(ann, style);
        const shape = group.getChildren((n) => n.name() === 'shape')[0];

        const anchors = factory.getAnchors(shape, style);

        assert.equal(anchors[0].id(), 'anchor0', 'first anchor id');
        assert.equal(anchors[1].id(), 'anchor1', 'second anchor id');
      });

      test('updateAnnotationOnAnchorMove with anchor0 updates begin', () => {
        const begin = new Point2D(10, 20);
        const end = new Point2D(50, 60);
        const ann = makeAnnotation(begin, end);
        const {anchors} = makeShapeGroupWithAnchors(factory, ann, style);

        anchors[0].x(15);
        anchors[0].y(25);
        factory.updateAnnotationOnAnchorMove(ann, anchors[0]);

        assert.equal(ann.mathShape.getX(), 15, 'begin.x updated');
        assert.equal(ann.mathShape.getY(), 25, 'begin.y updated');
        assert.equal(ann.referencePoints[0].getX(), 50, 'end.x unchanged');
        assert.equal(ann.referencePoints[0].getY(), 60, 'end.y unchanged');
        assert.equal(
          ann.updateQuantification.mock.calls.length, 1,
          'updateQuantification called');
      });

      test('updateAnnotationOnAnchorMove with anchor1 updates end', () => {
        const begin = new Point2D(10, 20);
        const end = new Point2D(50, 60);
        const ann = makeAnnotation(begin, end);
        const {anchors} = makeShapeGroupWithAnchors(factory, ann, style);

        anchors[1].x(55);
        anchors[1].y(65);
        factory.updateAnnotationOnAnchorMove(ann, anchors[1]);

        assert.equal(ann.mathShape.getX(), 10, 'begin.x unchanged');
        assert.equal(ann.mathShape.getY(), 20, 'begin.y unchanged');
        assert.equal(ann.referencePoints[0].getX(), 55, 'end.x updated');
        assert.equal(ann.referencePoints[0].getY(), 65, 'end.y updated');
      });

      test('updateAnnotationOnAnchorMove ignores orphaned anchor', () => {
        const ann = makeAnnotation(new Point2D(0, 0), new Point2D(1, 1));
        // orphaned anchor – no parent group
        const orphan = new Konva.Ellipse({x: 5, y: 5, id: 'anchor0'});

        factory.updateAnnotationOnAnchorMove(ann, orphan);

        // annotation should remain unmodified
        assert.equal(ann.mathShape.getX(), 0, 'mathShape unchanged');
        assert.equal(ann.updateQuantification.mock.calls.length, 0,
          'updateQuantification not called');
      });

      test(
        'updateShapeGroupOnAnchorMove updates shape points from annotation',
        () => {
          const begin = new Point2D(10, 20);
          const end = new Point2D(50, 60);
          const ann = makeAnnotation(begin, end);
          const {group, anchors} = makeShapeGroupWithAnchors(
            factory, ann, style);

          // Simulate a prior updateAnnotationOnAnchorMove result
          ann.mathShape = new Point2D(15, 25);
          anchors[0].x(15);
          anchors[0].y(25);

          factory.updateShapeGroupOnAnchorMove(ann, anchors[0], style);

          const shape = group.getChildren((n) => n.name() === 'shape')[0];
          assert.deepEqual(
            shape.points(),
            [15, 25, 50, 60],
            'shape line points reflect new begin');
        });

      test('updateLabelContent updates the label text node', () => {
        const ann = makeAnnotation(new Point2D(0, 0), new Point2D(10, 10));
        const group = factory.createShapeGroup(ann, style);

        ann.getText = () => 'my label';
        factory.updateLabelContent(ann, group, style);

        const klabel = group.getChildren((n) => n.name() === 'label')[0];
        assert.equal(
          klabel.getText().text(), 'my label', 'label text updated');
      });

      test('updateConnector does not throw', () => {
        const ann = makeAnnotation(new Point2D(0, 0), new Point2D(10, 10));
        const group = factory.createShapeGroup(ann, style);

        assert.doesNotThrow(() => factory.updateConnector(group));

        const names = group.getChildren().map((c) => c.name());
        assert.ok(names.includes('connector'), 'connector still present');
      });

    }); // Tier 2

  }); // ArrowFactory
}); // tools
