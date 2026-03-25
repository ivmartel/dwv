// @vitest-environment jsdom
import {describe, test, assert, beforeEach} from 'vitest';
import {BidimensionalFactory} from '../../src/tools/shapes/bidimensional.js';
import {BidimensionalLine} from '../../src/math/bidimensionalLine.js';
import {Point2D} from '../../src/math/point.js';
import Konva from 'konva';
import {
  makeStyle,
  makeAnnotation,
  makeShapeGroupWithAnchors,
} from './utils/toolTestHelpers.js';

/**
 * Build a horizontal BidimensionalLine annotation via the factory.
 * The short axis is fully initialised by setAnnotationMathShape.
 *
 * @param {number} x0 X of begin point.
 * @param {number} y0 Y of begin point.
 * @param {number} x1 X of end point.
 * @param {number} y1 Y of end point.
 * @returns {object} Annotation mock with mathShape set.
 */
function makeBiDimAnnotation(x0, y0, x1, y1) {
  const factory = new BidimensionalFactory();
  const ann = makeAnnotation();
  factory.setAnnotationMathShape(
    ann, [new Point2D(x0, y0), new Point2D(x1, y1)]
  );
  return ann;
}

describe('tools', () => {
  describe('BidimensionalFactory', () => {

    let factory;
    let style;

    beforeEach(() => {
      factory = new BidimensionalFactory();
      style = makeStyle();
    });

    // -----------------------------------------------------------------------
    // Tier 1 – pure annotation logic, no Konva shape rendering
    // -----------------------------------------------------------------------
    describe('Tier 1 - annotation logic', () => {

      test('supports returns true only for BidimensionalLine', () => {
        assert.ok(
          BidimensionalFactory.supports(
            new BidimensionalLine(new Point2D(0, 0), new Point2D(1, 0))
          )
        );
        assert.notOk(BidimensionalFactory.supports({}));
        assert.notOk(BidimensionalFactory.supports(undefined));
      });

      test('getName, getGroupName, getNPoints, getTimeout', () => {
        assert.equal(factory.getName(), 'bidimensional');
        assert.equal(factory.getGroupName(), 'bidimensional-group');
        assert.equal(factory.getNPoints(), 2);
        assert.equal(factory.getTimeout(), 0);
      });

      test('setAnnotationMathShape stores a BidimensionalLine', () => {
        const ann = makeAnnotation();
        factory.setAnnotationMathShape(
          ann, [new Point2D(0, 0), new Point2D(100, 0)]
        );
        assert.ok(ann.mathShape instanceof BidimensionalLine);
        assert.equal(ann.mathShape.getBegin().getX(), 0);
        assert.equal(ann.mathShape.getEnd().getX(), 100);
      });

      test('setAnnotationMathShape initialises short axis to half length',
        () => {
          const ann = makeAnnotation();
          factory.setAnnotationMathShape(
            ann, [new Point2D(0, 0), new Point2D(100, 0)]
          );
          const shape = ann.mathShape;
          // Long axis length = 100; each half = 50
          assert.equal(shape.shortAxisL1, 50);
          assert.equal(shape.shortAxisL2, 50);
          assert.equal(shape.shortAxisLength, 100);
        });

      test('setAnnotationMathShape sets shortAxisT = 0.5', () => {
        const ann = makeAnnotation();
        factory.setAnnotationMathShape(
          ann, [new Point2D(0, 0), new Point2D(100, 0)]
        );
        assert.equal(ann.mathShape.shortAxisT, 0.5);
      });

      test('setAnnotationMathShape sets shortAxisCenter to midpoint', () => {
        const ann = makeAnnotation();
        factory.setAnnotationMathShape(
          ann, [new Point2D(0, 0), new Point2D(100, 0)]
        );
        const center = ann.mathShape.shortAxisCenter;
        assert.ok(center instanceof Point2D);
        assert.equal(center.getX(), 50);
        assert.equal(center.getY(), 0);
      });

      test('setAnnotationMathShape calls setTextExpr and updateQuantification',
        () => {
          const ann = makeAnnotation();
          factory.setAnnotationMathShape(
            ann, [new Point2D(0, 0), new Point2D(100, 0)]
          );
          assert.equal(ann.setTextExpr.mock.calls.length, 1);
          assert.equal(ann.updateQuantification.mock.calls.length, 1);
        });

      test('getPointAlongLine: t=0 returns begin, t=1 returns end', () => {
        const line = new BidimensionalLine(
          new Point2D(10, 20), new Point2D(110, 20)
        );
        const p0 = factory.getPointAlongLine(line, 0);
        const p1 = factory.getPointAlongLine(line, 1);
        assert.equal(p0.getX(), 10);
        assert.equal(p0.getY(), 20);
        assert.equal(p1.getX(), 110);
        assert.equal(p1.getY(), 20);
      });

      test('getPointAlongLine: t=0.5 returns midpoint', () => {
        const line = new BidimensionalLine(
          new Point2D(0, 0), new Point2D(100, 0)
        );
        const mid = factory.getPointAlongLine(line, 0.5);
        assert.equal(mid.getX(), 50);
        assert.equal(mid.getY(), 0);
      });

      test('getShortAxisEndpoints: symmetric perpendicular endpoints', () => {
        // Horizontal line (0,0)-(100,0): perp direction = (0,1)
        // sa1 = (50, +50), sa2 = (50, -50)
        const ann = makeBiDimAnnotation(0, 0, 100, 0);
        const [sa1, sa2] = factory.getShortAxisEndpoints(ann);
        assert.equal(sa1.getX(), 50);
        assert.equal(sa1.getY(), 50);
        assert.equal(sa2.getX(), 50);
        assert.equal(sa2.getY(), -50);
      });

      test('getShortAxisEndpoints: asymmetric L1/L2', () => {
        const ann = makeBiDimAnnotation(0, 0, 100, 0);
        ann.mathShape.shortAxisL1 = 30;
        ann.mathShape.shortAxisL2 = 10;
        // clear center so the T-based path is used
        ann.mathShape.shortAxisCenter = undefined;
        const [sa1, sa2] = factory.getShortAxisEndpoints(ann);
        assert.equal(sa1.getY(), 30);
        assert.equal(sa2.getY(), -10);
      });

      test('getShortAxisEndpoints: zero-length line returns mid,mid', () => {
        const ann = makeAnnotation(
          new BidimensionalLine(new Point2D(5, 5), new Point2D(5, 5))
        );
        // No short axis props yet - should not throw
        const [sa1, sa2] = factory.getShortAxisEndpoints(ann);
        assert.ok(sa1 instanceof Point2D);
        assert.ok(sa2 instanceof Point2D);
        assert.equal(sa1.getX(), sa2.getX());
        assert.equal(sa1.getY(), sa2.getY());
      });

      test('updateAnnotationOnTranslation shifts begin, end and center', () => {
        const ann = makeBiDimAnnotation(0, 0, 100, 0);
        factory.updateAnnotationOnTranslation(ann, {x: 10, y: 20});
        const shape = ann.mathShape;
        assert.equal(shape.getBegin().getX(), 10);
        assert.equal(shape.getBegin().getY(), 20);
        assert.equal(shape.getEnd().getX(), 110);
        assert.equal(shape.getEnd().getY(), 20);
        // shortAxisCenter (50,0) translated by (10,20) → (60,20)
        assert.equal(shape.shortAxisCenter.getX(), 60);
        assert.equal(shape.shortAxisCenter.getY(), 20);
      });

      test('updateAnnotationOnTranslation preserves short axis scalars', () => {
        const ann = makeBiDimAnnotation(0, 0, 100, 0);
        factory.updateAnnotationOnTranslation(ann, {x: 5, y: 5});
        assert.equal(ann.mathShape.shortAxisT, 0.5);
        assert.equal(ann.mathShape.shortAxisL1, 50);
        assert.equal(ann.mathShape.shortAxisL2, 50);
        assert.equal(ann.mathShape.shortAxisLength, 100);
      });

    }); // Tier 1

    // -----------------------------------------------------------------------
    // Tier 2 – Konva shape rendering
    // -----------------------------------------------------------------------
    describe('Tier 2 - Konva rendering', () => {

      test('createShapeGroup has correct name, id and visibility', () => {
        const ann = makeBiDimAnnotation(0, 0, 100, 0);
        const group = factory.createShapeGroup(ann, style);
        assert.equal(group.name(), 'bidimensional-group');
        assert.equal(group.id(), ann.trackingUid);
        assert.ok(group.visible());
      });

      test('createShapeGroup has 8 children', () => {
        // shape + tick0 + tick1 + SA + sa-tick0 + sa-tick1 + label + connector
        const ann = makeBiDimAnnotation(0, 0, 100, 0);
        const group = factory.createShapeGroup(ann, style);
        assert.equal(group.getChildren().length, 8);
      });

      test('createShapeGroup contains all named child shapes', () => {
        const ann = makeBiDimAnnotation(0, 0, 100, 0);
        const group = factory.createShapeGroup(ann, style);
        assert.ok(group.findOne('.shape') instanceof Konva.Line);
        assert.ok(group.findOne('.shape-tick0') instanceof Konva.Line);
        assert.ok(group.findOne('.shape-tick1') instanceof Konva.Line);
        assert.ok(
          group.findOne('.bidimensional-short-axis') instanceof Konva.Line
        );
        assert.ok(group.findOne('.short-axis-tick0') instanceof Konva.Line);
        assert.ok(group.findOne('.short-axis-tick1') instanceof Konva.Line);
      });

      test('createShapeGroup main axis has correct points', () => {
        const ann = makeBiDimAnnotation(0, 0, 100, 0);
        const group = factory.createShapeGroup(ann, style);
        const pts = group.findOne('.shape').points();
        assert.equal(pts[0], 0);
        assert.equal(pts[1], 0);
        assert.equal(pts[2], 100);
        assert.equal(pts[3], 0);
      });

      test('createShapeGroup short axis has correct initial points', () => {
        // Horizontal (0,0)-(100,0): short axis at t=0.5
        // sa1 = (50, 50), sa2 = (50, -50)
        const ann = makeBiDimAnnotation(0, 0, 100, 0);
        const group = factory.createShapeGroup(ann, style);
        const pts = group.findOne('.bidimensional-short-axis').points();
        assert.equal(pts[0], 50);
        assert.equal(pts[1], 50);
        assert.equal(pts[2], 50);
        assert.equal(pts[3], -50);
      });

      test('short axis is dashed before any interaction', () => {
        const ann = makeBiDimAnnotation(0, 0, 100, 0);
        const group = factory.createShapeGroup(ann, style);
        const sa = group.findOne('.bidimensional-short-axis');
        assert.deepEqual(sa.dash(), [8, 8]);
      });

      test('short axis is solid after hasShortAxisInteraction is true', () => {
        const ann = makeBiDimAnnotation(0, 0, 100, 0);
        ann.mathShape.hasShortAxisInteraction = true;
        const group = factory.createShapeGroup(ann, style);
        const sa = group.findOne('.bidimensional-short-axis');
        assert.deepEqual(sa.dash(), []);
      });

      test('getAnchors returns 4 anchors', () => {
        const ann = makeBiDimAnnotation(0, 0, 100, 0);
        const {anchors} = makeShapeGroupWithAnchors(factory, ann, style);
        assert.equal(anchors.length, 4);
      });

      test('getAnchors anchor0/anchor1 are at long axis endpoints', () => {
        const ann = makeBiDimAnnotation(0, 0, 100, 0);
        const {anchors} = makeShapeGroupWithAnchors(factory, ann, style);
        const a0 = anchors.find((a) => a.id() === 'anchor0');
        const a1 = anchors.find((a) => a.id() === 'anchor1');
        assert.equal(a0.x(), 0);
        assert.equal(a0.y(), 0);
        assert.equal(a1.x(), 100);
        assert.equal(a1.y(), 0);
      });

      test('getAnchors anchor2/anchor3 are at short axis endpoints', () => {
        // Horizontal (0,0)-(100,0): sa1=(50,50), sa2=(50,-50)
        const ann = makeBiDimAnnotation(0, 0, 100, 0);
        const {anchors} = makeShapeGroupWithAnchors(factory, ann, style);
        const a2 = anchors.find((a) => a.id() === 'anchor2');
        const a3 = anchors.find((a) => a.id() === 'anchor3');
        assert.equal(a2.x(), 50);
        assert.equal(a2.y(), 50);
        assert.equal(a3.x(), 50);
        assert.equal(a3.y(), -50);
      });

      test('constrainAnchorMove is no-op for long axis anchors', () => {
        const ann = makeBiDimAnnotation(0, 0, 100, 0);
        const {anchors} = makeShapeGroupWithAnchors(factory, ann, style);
        const a0 = anchors.find((a) => a.id() === 'anchor0');
        a0.x(15);
        a0.y(25);
        factory.constrainAnchorMove(a0, ann);
        // position is not changed by the factory
        assert.equal(a0.x(), 15);
        assert.equal(a0.y(), 25);
      });

      test('constrainAnchorMove updates shortAxisT and L1 for anchor2', () => {
        // Horizontal (0,0)-(100,0), move anchor2 to (20, 70):
        //   tWorld = 20 → T = 0.2; distFromLongAxis = 70 → L1 = 70
        const ann = makeBiDimAnnotation(0, 0, 100, 0);
        const {anchors} = makeShapeGroupWithAnchors(factory, ann, style);
        const a2 = anchors.find((a) => a.id() === 'anchor2');
        a2.x(20);
        a2.y(70);
        factory.constrainAnchorMove(a2, ann);
        assert.closeTo(ann.mathShape.shortAxisT, 0.2, 1e-10);
        assert.closeTo(ann.mathShape.shortAxisL1, 70, 1e-10);
      });

      test('constrainAnchorMove updates L2 for anchor3', () => {
        // Horizontal (0,0)-(100,0), move anchor3 to (80, -30):
        //   tWorld=80 → T=0.8; distFromLongAxis for anchor3 = -(-30)=30 → L2=30
        const ann = makeBiDimAnnotation(0, 0, 100, 0);
        const {anchors} = makeShapeGroupWithAnchors(factory, ann, style);
        const a3 = anchors.find((a) => a.id() === 'anchor3');
        a3.x(80);
        a3.y(-30);
        factory.constrainAnchorMove(a3, ann);
        assert.closeTo(ann.mathShape.shortAxisT, 0.8, 1e-10);
        assert.closeTo(ann.mathShape.shortAxisL2, 30, 1e-10);
      });

      test('updateAnnotationOnAnchorMove updates long axis from anchors',
        () => {
          const ann = makeBiDimAnnotation(0, 0, 100, 0);
          const {anchors} = makeShapeGroupWithAnchors(factory, ann, style);
          const a0 = anchors.find((a) => a.id() === 'anchor0');
          // Move begin point
          a0.x(20);
          a0.y(0);
          factory.updateAnnotationOnAnchorMove(ann, a0);
          assert.equal(ann.mathShape.getBegin().getX(), 20);
          assert.equal(ann.mathShape.getEnd().getX(), 100);
        });

      test('updateAnnotationOnAnchorMove preserves short axis L1/L2', () => {
        const ann = makeBiDimAnnotation(0, 0, 100, 0);
        const {anchors} = makeShapeGroupWithAnchors(factory, ann, style);
        const a0 = anchors.find((a) => a.id() === 'anchor0');
        a0.x(10);
        a0.y(0);
        factory.updateAnnotationOnAnchorMove(ann, a0);
        // L1/L2 from the original line are preserved
        assert.equal(ann.mathShape.shortAxisL1, 50);
        assert.equal(ann.mathShape.shortAxisL2, 50);
      });

      test('updateAnnotationOnAnchorMove ignores orphaned anchor', () => {
        const ann = makeBiDimAnnotation(0, 0, 100, 0);
        const orphan = new Konva.Ellipse({id: 'anchor0', x: 5, y: 5});
        // No parent group → should bail silently
        factory.updateAnnotationOnAnchorMove(ann, orphan);
        // mathShape is unchanged
        assert.equal(ann.mathShape.getBegin().getX(), 0);
      });

      test('updateShapeGroupOnAnchorMove updates main axis after anchor0 move',
        () => {
          const ann = makeBiDimAnnotation(0, 0, 100, 0);
          const {anchors} = makeShapeGroupWithAnchors(factory, ann, style);
          const a0 = anchors.find((a) => a.id() === 'anchor0');
          a0.x(10);
          a0.y(0);
          factory.updateAnnotationOnAnchorMove(ann, a0);
          factory.updateShapeGroupOnAnchorMove(ann, a0, style);
          const group = a0.getParent();
          const pts = group.findOne('.shape').points();
          assert.equal(pts[0], 10);
          assert.equal(pts[1], 0);
          assert.equal(pts[2], 100);
          assert.equal(pts[3], 0);
        });

      test('updateShortAxisToSolid removes the dash from short axis', () => {
        const ann = makeBiDimAnnotation(0, 0, 100, 0);
        const group = factory.createShapeGroup(ann, style);
        const sa = group.findOne('.bidimensional-short-axis');
        // Initially dashed
        assert.deepEqual(sa.dash(), [8, 8]);
        factory.updateShortAxisToSolid(group);
        assert.deepEqual(sa.dash(), []);
      });

      test('updateLabelContent delegates to labelFactory', () => {
        // createShapeGroup already calls updateLabelContent indirectly;
        // calling it explicitly should not throw
        const ann = makeBiDimAnnotation(0, 0, 100, 0);
        const group = factory.createShapeGroup(ann, style);
        factory.updateLabelContent(ann, group, style);
      });

      test('updateConnector updates the connector line', () => {
        const ann = makeBiDimAnnotation(0, 0, 100, 0);
        const group = factory.createShapeGroup(ann, style);
        // Should not throw when connector node exists
        factory.updateConnector(ann, group);
      });

    }); // Tier 2

  }); // BidimensionalFactory
}); // tools
