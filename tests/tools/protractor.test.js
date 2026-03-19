// @vitest-environment jsdom
import {describe, test, assert, beforeEach} from 'vitest';
import {ProtractorFactory} from '../../src/tools/protractor.js';
import {Protractor} from '../../src/math/protractor.js';
import {Point2D} from '../../src/math/point.js';
import Konva from 'konva';
import {
  makeStyle,
  makeAnnotation,
  makeShapeGroupWithAnchors,
} from './utils/toolTestHelpers.js';

/**
 * Convenience: build a full 3-point Protractor.
 * The vertex (angle point) is p1.
 *
 * @param {number} x0 Begin x.
 * @param {number} y0 Begin y.
 * @param {number} x1 Vertex x.
 * @param {number} y1 Vertex y.
 * @param {number} x2 End x.
 * @param {number} y2 End y.
 * @returns {Protractor} The protractor.
 */
function makeProtractor(x0, y0, x1, y1, x2, y2) {
  return new Protractor([
    new Point2D(x0, y0),
    new Point2D(x1, y1),
    new Point2D(x2, y2),
  ]);
}


describe('tools', () => {
  describe('ProtractorFactory', () => {

    // -----------------------------------------------------------------------
    // Tier 1 – pure annotation logic, no Konva shape rendering
    // -----------------------------------------------------------------------
    describe('Tier 1 - annotation logic', () => {

      test('supports returns true only for Protractor instances', () => {
        assert.ok(
          ProtractorFactory.supports(makeProtractor(0, 0, 10, 0, 10, 10)));
        assert.notOk(ProtractorFactory.supports(new Point2D(0, 0)));
        assert.notOk(ProtractorFactory.supports({}));
        assert.notOk(ProtractorFactory.supports(undefined));
      });

      test('getName, getGroupName, getNPoints, getTimeout', () => {
        const f = new ProtractorFactory();
        assert.equal(f.getName(), 'protractor');
        assert.equal(f.getGroupName(), 'protractor-group');
        // Unlike other factories: 3 points and 500 ms inter-point timeout
        assert.equal(f.getNPoints(), 3);
        assert.equal(f.getTimeout(), 500);
      });

      test('setAnnotationMathShape stores all 3 points', () => {
        const f = new ProtractorFactory();
        const ann = makeAnnotation(undefined);
        const p0 = new Point2D(0, 30);
        const p1 = new Point2D(0, 0);
        const p2 = new Point2D(30, 0);

        f.setAnnotationMathShape(ann, [p0, p1, p2]);

        assert.ok(
          ann.mathShape instanceof Protractor, 'mathShape is Protractor');
        assert.equal(ann.mathShape.getPoint(0).getX(), 0, 'point0 x');
        assert.equal(ann.mathShape.getPoint(0).getY(), 30, 'point0 y');
        assert.equal(ann.mathShape.getPoint(1).getX(), 0, 'point1 x');
        assert.equal(ann.mathShape.getPoint(1).getY(), 0, 'point1 y');
        assert.equal(ann.mathShape.getPoint(2).getX(), 30, 'point2 x');
        assert.equal(ann.mathShape.getPoint(2).getY(), 0, 'point2 y');
      });

      test('setAnnotationMathShape calls hooks', () => {
        const f = new ProtractorFactory();
        const ann = makeAnnotation(undefined);

        f.setAnnotationMathShape(ann, [
          new Point2D(0, 30), new Point2D(0, 0), new Point2D(30, 0)
        ]);

        assert.equal(
          ann.setTextExpr.mock.calls.length, 1, 'setTextExpr called once');
        assert.equal(
          ann.updateQuantification.mock.calls.length, 1,
          'updateQuantification called once');
      });

      test('setAnnotationMathShape passes default protractor label', () => {
        const f = new ProtractorFactory();
        const ann = makeAnnotation(undefined);

        f.setAnnotationMathShape(ann, [
          new Point2D(0, 30), new Point2D(0, 0), new Point2D(30, 0)
        ]);

        const labelArg = ann.setTextExpr.mock.calls[0][0];
        assert.equal(typeof labelArg, 'object', 'label is an object');
        assert.ok('*' in labelArg, 'label has wildcard key');
        assert.equal(
          labelArg['*'], '{angle}',
          'protractor default label is {angle}');
      });

      test('constrainAnchorMove is a no-op', () => {
        const f = new ProtractorFactory();
        assert.doesNotThrow(() => f.constrainAnchorMove({}));
        assert.doesNotThrow(() => f.constrainAnchorMove(undefined));
      });

      test('updateAnnotationOnTranslation shifts all 3 points', () => {
        const f = new ProtractorFactory();
        const ann = makeAnnotation(makeProtractor(0, 30, 0, 0, 30, 0));

        f.updateAnnotationOnTranslation(ann, {x: 5, y: 10});

        const p = ann.mathShape;
        assert.equal(p.getPoint(0).getX(), 5, 'p0.x + 5');
        assert.equal(p.getPoint(0).getY(), 40, 'p0.y + 10');
        assert.equal(p.getPoint(1).getX(), 5, 'p1.x + 5');
        assert.equal(p.getPoint(1).getY(), 10, 'p1.y + 10');
        assert.equal(p.getPoint(2).getX(), 35, 'p2.x + 5');
        assert.equal(p.getPoint(2).getY(), 10, 'p2.y + 10');
        assert.equal(
          ann.updateQuantification.mock.calls.length, 1,
          'updateQuantification called');
      });

      test('updateAnnotationOnTranslation zero is a no-op', () => {
        const f = new ProtractorFactory();
        const ann = makeAnnotation(makeProtractor(0, 30, 0, 0, 30, 0));

        f.updateAnnotationOnTranslation(ann, {x: 0, y: 0});

        const p = ann.mathShape;
        assert.equal(p.getPoint(0).getX(), 0);
        assert.equal(p.getPoint(0).getY(), 30);
        assert.equal(p.getPoint(1).getX(), 0);
        assert.equal(p.getPoint(1).getY(), 0);
        assert.equal(p.getPoint(2).getX(), 30);
        assert.equal(p.getPoint(2).getY(), 0);
      });

    }); // Tier 1

    // -----------------------------------------------------------------------
    // Tier 2 – Konva shape group creation and update (requires jsdom)
    // -----------------------------------------------------------------------
    describe('Tier 2 - Konva shape group', () => {

      let factory;
      let style;

      beforeEach(() => {
        factory = new ProtractorFactory();
        style = makeStyle();
      });

      test('createShapeGroup returns Konva.Group with metadata', () => {
        const ann = makeAnnotation(makeProtractor(0, 30, 0, 0, 30, 0));
        const group = factory.createShapeGroup(ann, style);

        assert.ok(group instanceof Konva.Group, 'returns Konva.Group');
        assert.equal(group.name(), 'protractor-group', 'group name');
        assert.equal(group.id(), 'test-uid', 'group id from trackingUid');
      });

      // With a fully defined 3-point protractor the group gets shape + arc +
      // label + connector.  With fewer points only the partial shape is added.
      test('createShapeGroup with 3 points adds shape, arc, label, connector',
        () => {
          const ann = makeAnnotation(makeProtractor(0, 30, 0, 0, 30, 0));
          const group = factory.createShapeGroup(ann, style);

          const names = group.getChildren().map((c) => c.name());
          assert.ok(names.includes('shape'), 'has shape');
          assert.ok(names.includes('shape-arc'), 'has shape-arc');
          assert.ok(names.includes('label'), 'has label');
          assert.ok(names.includes('connector'), 'has connector');
          assert.equal(group.getChildren().length, 4, '4 children total');
        });

      test('createShapeGroup with 2 points adds only shape', () => {
        // Protractor with 2 points: incomplete – no arc/label/connector yet
        const partial = new Protractor([
          new Point2D(0, 30), new Point2D(0, 0)
        ]);
        const ann = makeAnnotation(partial);
        const group = factory.createShapeGroup(ann, style);

        const names = group.getChildren().map((c) => c.name());
        assert.ok(names.includes('shape'), 'has shape');
        assert.notOk(names.includes('shape-arc'), 'no arc yet');
        assert.notOk(names.includes('label'), 'no label yet');
        assert.equal(group.getChildren().length, 1, 'only shape child');
      });

      test('createShapeGroup shape is Konva.Line with 6 point coords', () => {
        const ann = makeAnnotation(makeProtractor(0, 30, 0, 0, 30, 0));
        const group = factory.createShapeGroup(ann, style);

        const shape = group.getChildren((n) => n.name() === 'shape')[0];
        assert.ok(shape instanceof Konva.Line, 'shape is Konva.Line');
        assert.deepEqual(
          shape.points(), [0, 30, 0, 0, 30, 0],
          'points = [p0.x,p0.y, p1.x,p1.y, p2.x,p2.y]');
      });

      test('getAnchors returns 3 Ellipse anchors at the 3 protractor points',
        () => {
          const ann = makeAnnotation(makeProtractor(0, 30, 0, 0, 30, 0));
          const group = factory.createShapeGroup(ann, style);
          const shape = group.getChildren((n) => n.name() === 'shape')[0];

          const anchors = factory.getAnchors(shape, style);

          assert.equal(anchors.length, 3, '3 anchors');
          for (const a of anchors) {
            assert.ok(a instanceof Konva.Ellipse, 'each anchor is Ellipse');
          }
          assert.equal(anchors[0].x(), 0, 'anchor0 x = p0.x');
          assert.equal(anchors[0].y(), 30, 'anchor0 y = p0.y');
          assert.equal(anchors[1].x(), 0, 'anchor1 x = p1.x (vertex)');
          assert.equal(anchors[1].y(), 0, 'anchor1 y = p1.y (vertex)');
          assert.equal(anchors[2].x(), 30, 'anchor2 x = p2.x');
          assert.equal(anchors[2].y(), 0, 'anchor2 y = p2.y');
        });

      test('getAnchors assigns ids anchor0..anchor2', () => {
        const ann = makeAnnotation(makeProtractor(0, 30, 0, 0, 30, 0));
        const group = factory.createShapeGroup(ann, style);
        const shape = group.getChildren((n) => n.name() === 'shape')[0];

        const anchors = factory.getAnchors(shape, style);

        for (let i = 0; i < 3; ++i) {
          assert.equal(anchors[i].id(), `anchor${i}`, `anchor${i} id`);
        }
      });

      // updateAnnotationOnAnchorMove reads ALL 3 anchors from the group, so
      // any moved anchor is immediately reflected (no one-frame lag).
      test('updateAnnotationOnAnchorMove updates from anchor0 move', () => {
        const ann = makeAnnotation(makeProtractor(0, 30, 0, 0, 30, 0));
        const {anchors} = makeShapeGroupWithAnchors(factory, ann, style);

        anchors[0].x(10);
        anchors[0].y(40);
        factory.updateAnnotationOnAnchorMove(ann, anchors[0]);

        const p = ann.mathShape;
        assert.equal(p.getPoint(0).getX(), 10, 'p0.x updated');
        assert.equal(p.getPoint(0).getY(), 40, 'p0.y updated');
        assert.equal(p.getPoint(1).getX(), 0, 'p1 unchanged');
        assert.equal(p.getPoint(1).getY(), 0, 'p1 unchanged');
        assert.equal(p.getPoint(2).getX(), 30, 'p2 unchanged');
        assert.equal(p.getPoint(2).getY(), 0, 'p2 unchanged');
      });

      test('updateAnnotationOnAnchorMove updates from anchor1 move', () => {
        const ann = makeAnnotation(makeProtractor(0, 30, 0, 0, 30, 0));
        const {anchors} = makeShapeGroupWithAnchors(factory, ann, style);

        anchors[1].x(5);
        anchors[1].y(5);
        factory.updateAnnotationOnAnchorMove(ann, anchors[1]);

        const p = ann.mathShape;
        assert.equal(p.getPoint(0).getX(), 0, 'p0 unchanged');
        assert.equal(p.getPoint(1).getX(), 5, 'p1.x updated');
        assert.equal(p.getPoint(1).getY(), 5, 'p1.y updated');
        assert.equal(p.getPoint(2).getX(), 30, 'p2 unchanged');
        assert.equal(
          ann.updateQuantification.mock.calls.length, 1,
          'updateQuantification called');
      });

      test('updateAnnotationOnAnchorMove ignores orphaned anchor', () => {
        const ann = makeAnnotation(makeProtractor(0, 30, 0, 0, 30, 0));
        const orphan = new Konva.Ellipse({x: 5, y: 5, id: 'anchor1'});

        factory.updateAnnotationOnAnchorMove(ann, orphan);

        assert.equal(
          ann.updateQuantification.mock.calls.length, 0,
          'updateQuantification not called');
        assert.equal(
          ann.mathShape.getPoint(1).getX(), 0, 'mathShape unchanged');
      });

      test('updateShapeGroupOnAnchorMove updates shape line points', () => {
        const ann = makeAnnotation(makeProtractor(0, 30, 0, 0, 30, 0));
        const {group, anchors} = makeShapeGroupWithAnchors(factory, ann, style);

        // Move vertex (anchor1) and update annotation then visual
        anchors[1].x(5);
        anchors[1].y(5);
        factory.updateAnnotationOnAnchorMove(ann, anchors[1]);
        factory.updateShapeGroupOnAnchorMove(ann, anchors[1], style);

        const shape = group.getChildren((n) => n.name() === 'shape')[0];
        assert.deepEqual(
          shape.points(), [0, 30, 5, 5, 30, 0],
          'shape line points updated');
      });

      test('updateLabelContent updates the label text node', () => {
        const ann = makeAnnotation(makeProtractor(0, 30, 0, 0, 30, 0));
        const group = factory.createShapeGroup(ann, style);

        ann.getText = () => '90°';
        factory.updateLabelContent(ann, group, style);

        const klabel = group.getChildren((n) => n.name() === 'label')[0];
        assert.equal(
          klabel.getText().text(), '90°', 'label text updated');
      });

      test('updateConnector does not throw', () => {
        const ann = makeAnnotation(makeProtractor(0, 30, 0, 0, 30, 0));
        const group = factory.createShapeGroup(ann, style);

        assert.doesNotThrow(() => factory.updateConnector(group));

        const names = group.getChildren().map((c) => c.name());
        assert.ok(names.includes('connector'), 'connector still present');
      });

    }); // Tier 2

  }); // ProtractorFactory
}); // tools
