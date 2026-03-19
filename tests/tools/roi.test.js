// @vitest-environment jsdom
import {describe, test, assert, beforeEach} from 'vitest';
import {RoiFactory} from '../../src/tools/roi.js';
import {ROI} from '../../src/math/roi.js';
import {Point2D} from '../../src/math/point.js';
import Konva from 'konva';
import {
  makeStyle,
  makeAnnotation,
  makeShapeGroupWithAnchors,
} from './utils/toolTestHelpers.js';

/**
 * Convenience: build a triangular ROI from 3 plain number pairs.
 *
 * @param {number} x0 @param {number} y0
 * @param {number} x1 @param {number} y1
 * @param {number} x2 @param {number} y2
 * @returns {ROI} The ROI.
 */
function makeTriangleRoi(x0, y0, x1, y1, x2, y2) {
  return new ROI([
    new Point2D(x0, y0),
    new Point2D(x1, y1),
    new Point2D(x2, y2),
  ]);
}

describe('tools', () => {
  describe('RoiFactory', () => {

    // -----------------------------------------------------------------------
    // Tier 1 – pure annotation logic, no Konva shape rendering
    // -----------------------------------------------------------------------
    describe('Tier 1 - annotation logic', () => {

      test('supports returns true only for ROI instances', () => {
        assert.ok(RoiFactory.supports(new ROI()));
        assert.notOk(RoiFactory.supports(new Point2D(0, 0)));
        assert.notOk(RoiFactory.supports({}));
        assert.notOk(RoiFactory.supports(undefined));
      });

      test('getName, getGroupName, getNPoints, getTimeout', () => {
        const f = new RoiFactory();
        assert.equal(f.getName(), 'roi');
        assert.equal(f.getGroupName(), 'roi-group');
        // ROI accepts any number of points – ended by double-click
        assert.equal(f.getNPoints(), undefined);
        // 100 ms inter-point timeout
        assert.equal(f.getTimeout(), 100);
      });

      test('setAnnotationMathShape stores a ROI with all points', () => {
        const f = new RoiFactory();
        const ann = makeAnnotation(undefined);
        const pts = [
          new Point2D(0, 0), new Point2D(30, 0), new Point2D(15, 20)
        ];

        f.setAnnotationMathShape(ann, pts);

        assert.ok(ann.mathShape instanceof ROI, 'mathShape is ROI');
        assert.equal(ann.mathShape.getLength(), 3, '3 points stored');
        assert.equal(ann.mathShape.getPoint(0).getX(), 0, 'p0.x');
        assert.equal(ann.mathShape.getPoint(1).getX(), 30, 'p1.x');
        assert.equal(ann.mathShape.getPoint(2).getX(), 15, 'p2.x');
      });

      test('setAnnotationMathShape works for any point count', () => {
        const f = new RoiFactory();
        const ann = makeAnnotation(undefined);
        const pts = [0, 1, 2, 3, 4].map((i) => new Point2D(i * 10, 0));

        f.setAnnotationMathShape(ann, pts);

        assert.equal(ann.mathShape.getLength(), 5, '5 points stored');
      });

      test('setAnnotationMathShape calls hooks', () => {
        const f = new RoiFactory();
        const ann = makeAnnotation(undefined);

        f.setAnnotationMathShape(
          ann, [new Point2D(0, 0), new Point2D(10, 0), new Point2D(5, 8)]);

        assert.equal(
          ann.setTextExpr.mock.calls.length, 1, 'setTextExpr called once');
        assert.equal(
          ann.updateQuantification.mock.calls.length, 1,
          'updateQuantification called once');
      });

      test('setAnnotationMathShape passes default roi label', () => {
        const f = new RoiFactory();
        const ann = makeAnnotation(undefined);

        f.setAnnotationMathShape(
          ann, [new Point2D(0, 0), new Point2D(10, 0), new Point2D(5, 8)]);

        const labelArg = ann.setTextExpr.mock.calls[0][0];
        assert.equal(typeof labelArg, 'object', 'label is an object');
        assert.ok('*' in labelArg, 'label has wildcard key');
        // ROI default label is an empty string (no automatic quantification)
        assert.equal(labelArg['*'], '', 'roi default label is empty');
      });

      test('constrainAnchorMove is a no-op', () => {
        const f = new RoiFactory();
        assert.doesNotThrow(() => f.constrainAnchorMove({}));
        assert.doesNotThrow(() => f.constrainAnchorMove(undefined));
      });

      test('updateAnnotationOnTranslation shifts all points', () => {
        const f = new RoiFactory();
        const ann = makeAnnotation(makeTriangleRoi(0, 0, 30, 0, 15, 20));

        f.updateAnnotationOnTranslation(ann, {x: 5, y: 10});

        assert.equal(ann.mathShape.getPoint(0).getX(), 5, 'p0.x + 5');
        assert.equal(ann.mathShape.getPoint(0).getY(), 10, 'p0.y + 10');
        assert.equal(ann.mathShape.getPoint(1).getX(), 35, 'p1.x + 5');
        assert.equal(ann.mathShape.getPoint(1).getY(), 10, 'p1.y + 10');
        assert.equal(ann.mathShape.getPoint(2).getX(), 20, 'p2.x + 5');
        assert.equal(ann.mathShape.getPoint(2).getY(), 30, 'p2.y + 10');
        assert.equal(
          ann.updateQuantification.mock.calls.length, 1,
          'updateQuantification called');
      });

      test('updateAnnotationOnTranslation zero is a no-op', () => {
        const f = new RoiFactory();
        const ann = makeAnnotation(makeTriangleRoi(0, 0, 30, 0, 15, 20));

        f.updateAnnotationOnTranslation(ann, {x: 0, y: 0});

        assert.equal(ann.mathShape.getPoint(0).getX(), 0);
        assert.equal(ann.mathShape.getPoint(1).getX(), 30);
        assert.equal(ann.mathShape.getPoint(2).getX(), 15);
      });

    }); // Tier 1

    // -----------------------------------------------------------------------
    // Tier 2 – Konva shape group creation and update (requires jsdom)
    // -----------------------------------------------------------------------
    describe('Tier 2 - Konva shape group', () => {

      let factory;
      let style;

      beforeEach(() => {
        factory = new RoiFactory();
        style = makeStyle();
      });

      test('createShapeGroup returns Konva.Group with metadata', () => {
        const ann = makeAnnotation(makeTriangleRoi(0, 0, 30, 0, 15, 20));
        const group = factory.createShapeGroup(ann, style);

        assert.ok(group instanceof Konva.Group, 'returns Konva.Group');
        assert.equal(group.name(), 'roi-group', 'group name');
        assert.equal(group.id(), 'test-uid', 'group id from trackingUid');
      });

      test('createShapeGroup has shape, label, connector children', () => {
        const ann = makeAnnotation(makeTriangleRoi(0, 0, 30, 0, 15, 20));
        const group = factory.createShapeGroup(ann, style);

        const names = group.getChildren().map((c) => c.name());
        assert.ok(names.includes('shape'), 'has shape');
        assert.ok(names.includes('label'), 'has label');
        assert.ok(names.includes('connector'), 'has connector');
      });

      test('createShapeGroup adds exactly 3 children', () => {
        const ann = makeAnnotation(makeTriangleRoi(0, 0, 30, 0, 15, 20));
        const group = factory.createShapeGroup(ann, style);

        assert.equal(group.getChildren().length, 3,
          '3 children: shape, label, connector');
      });

      test('createShapeGroup shape is closed Konva.Line', () => {
        const ann = makeAnnotation(makeTriangleRoi(0, 0, 30, 0, 15, 20));
        const group = factory.createShapeGroup(ann, style);

        const shape = group.getChildren((n) => n.name() === 'shape')[0];
        assert.ok(shape instanceof Konva.Line, 'shape is Konva.Line');
        assert.ok(shape.closed(), 'shape is closed (polygon)');
        assert.deepEqual(
          shape.points(), [0, 0, 30, 0, 15, 20],
          'flat coords: [p0.x,p0.y, p1.x,p1.y, p2.x,p2.y]');
      });

      test('getAnchors returns one Ellipse per ROI vertex', () => {
        const ann = makeAnnotation(makeTriangleRoi(0, 0, 30, 0, 15, 20));
        const group = factory.createShapeGroup(ann, style);
        const shape = group.getChildren((n) => n.name() === 'shape')[0];

        const anchors = factory.getAnchors(shape, style);

        assert.equal(anchors.length, 3, '3 anchors for 3-vertex ROI');
        for (const a of anchors) {
          assert.ok(a instanceof Konva.Ellipse, 'each anchor is Ellipse');
        }
        assert.equal(anchors[0].x(), 0, 'anchor0 x = p0.x');
        assert.equal(anchors[0].y(), 0, 'anchor0 y = p0.y');
        assert.equal(anchors[1].x(), 30, 'anchor1 x = p1.x');
        assert.equal(anchors[1].y(), 0, 'anchor1 y = p1.y');
        assert.equal(anchors[2].x(), 15, 'anchor2 x = p2.x');
        assert.equal(anchors[2].y(), 20, 'anchor2 y = p2.y');
      });

      test('getAnchors scales with number of ROI points', () => {
        const pts = [0, 1, 2, 3, 4].map((i) => new Point2D(i * 10, 0));
        const ann = makeAnnotation(new ROI(pts));
        const group = factory.createShapeGroup(ann, style);
        const shape = group.getChildren((n) => n.name() === 'shape')[0];

        const anchors = factory.getAnchors(shape, style);

        assert.equal(anchors.length, 5, '5 anchors for 5-vertex ROI');
      });

      test('getAnchors assigns sequential anchor ids', () => {
        const ann = makeAnnotation(makeTriangleRoi(0, 0, 30, 0, 15, 20));
        const group = factory.createShapeGroup(ann, style);
        const shape = group.getChildren((n) => n.name() === 'shape')[0];

        const anchors = factory.getAnchors(shape, style);

        for (let i = 0; i < 3; ++i) {
          assert.equal(anchors[i].id(), `anchor${i}`, `anchor${i} id`);
        }
      });

      // updateAnnotationOnAnchorMove replaces only the single point whose
      // index is encoded in the anchor id (e.g. "anchor1" → index 1).
      test('updateAnnotationOnAnchorMove updates only the moved vertex', () => {
        const ann = makeAnnotation(makeTriangleRoi(0, 0, 30, 0, 15, 20));
        const {anchors} = makeShapeGroupWithAnchors(factory, ann, style);

        anchors[1].x(35);
        anchors[1].y(5);
        factory.updateAnnotationOnAnchorMove(ann, anchors[1]);

        const roi = ann.mathShape;
        assert.equal(roi.getPoint(0).getX(), 0, 'p0 unchanged');
        assert.equal(roi.getPoint(0).getY(), 0, 'p0 unchanged');
        assert.equal(roi.getPoint(1).getX(), 35, 'p1.x updated');
        assert.equal(roi.getPoint(1).getY(), 5, 'p1.y updated');
        assert.equal(roi.getPoint(2).getX(), 15, 'p2 unchanged');
        assert.equal(roi.getPoint(2).getY(), 20, 'p2 unchanged');
        assert.equal(
          ann.updateQuantification.mock.calls.length, 1,
          'updateQuantification called');
      });

      test('updateAnnotationOnAnchorMove updates anchor0 vertex', () => {
        const ann = makeAnnotation(makeTriangleRoi(0, 0, 30, 0, 15, 20));
        const {anchors} = makeShapeGroupWithAnchors(factory, ann, style);

        anchors[0].x(5);
        anchors[0].y(10);
        factory.updateAnnotationOnAnchorMove(ann, anchors[0]);

        assert.equal(ann.mathShape.getPoint(0).getX(), 5, 'p0.x updated');
        assert.equal(ann.mathShape.getPoint(0).getY(), 10, 'p0.y updated');
        assert.equal(ann.mathShape.getPoint(1).getX(), 30, 'p1 unchanged');
      });

      test('updateAnnotationOnAnchorMove ignores orphaned anchor', () => {
        const ann = makeAnnotation(makeTriangleRoi(0, 0, 30, 0, 15, 20));
        const orphan = new Konva.Ellipse({x: 5, y: 5, id: 'anchor1'});

        factory.updateAnnotationOnAnchorMove(ann, orphan);

        assert.equal(ann.updateQuantification.mock.calls.length, 0,
          'updateQuantification not called');
        assert.equal(
          ann.mathShape.getPoint(1).getX(), 30, 'mathShape unchanged');
      });

      test('updateShapeGroupOnAnchorMove updates shape at moved index', () => {
        const ann = makeAnnotation(makeTriangleRoi(0, 0, 30, 0, 15, 20));
        const {group, anchors} = makeShapeGroupWithAnchors(factory, ann, style);

        anchors[1].x(35);
        anchors[1].y(5);
        factory.updateAnnotationOnAnchorMove(ann, anchors[1]);
        factory.updateShapeGroupOnAnchorMove(ann, anchors[1], style);

        const shape = group.getChildren((n) => n.name() === 'shape')[0];
        assert.deepEqual(
          shape.points(), [0, 0, 35, 5, 15, 20],
          'flat coords updated at index 1');
      });

      test('updateLabelContent updates the label text node', () => {
        const ann = makeAnnotation(makeTriangleRoi(0, 0, 30, 0, 15, 20));
        const group = factory.createShapeGroup(ann, style);

        ann.getText = () => 'my region';
        factory.updateLabelContent(ann, group, style);

        const klabel = group.getChildren((n) => n.name() === 'label')[0];
        assert.equal(
          klabel.getText().text(), 'my region', 'label text updated');
      });

      test('updateConnector does not throw', () => {
        const ann = makeAnnotation(makeTriangleRoi(0, 0, 30, 0, 15, 20));
        const group = factory.createShapeGroup(ann, style);

        assert.doesNotThrow(() => factory.updateConnector(group));

        const names = group.getChildren().map((c) => c.name());
        assert.ok(names.includes('connector'), 'connector still present');
      });

    }); // Tier 2

  }); // RoiFactory
}); // tools
