// @vitest-environment jsdom
import {describe, test, assert} from 'vitest';
import {RoiFactory} from '../../../src/tools/shapes/roi.js';
import {RoiAnnotator} from '../../../src/tools/shapes/shapeAnnotators.js';
import {ROI} from '../../../src/math/roi.js';
import {Rectangle} from '../../../src/math/rectangle.js';
import {Point2D} from '../../../src/math/point.js';
import {makeAnnotation} from './utils.js';

/**
 * @param {number} x X.
 * @param {number} y Y.
 * @returns {Point2D} Point.
 */
function p(x, y) {
  return new Point2D(x, y);
}

describe('tools/shapes/roi', () => {

  test('RoiFactory.supports matches RoiAnnotator.supports', () => {
    const poly = new ROI([p(0, 0), p(1, 0), p(0, 1)]);
    assert.equal(
      RoiFactory.supports(poly),
      RoiAnnotator.supports(poly));
    assert.equal(
      RoiFactory.supports(new Rectangle(p(0, 0), p(1, 1))),
      RoiAnnotator.supports(new Rectangle(p(0, 0), p(1, 1))));
    assert.equal(
      RoiFactory.supports(undefined),
      RoiAnnotator.supports(undefined));
  });

  test('metadata', () => {
    const f = new RoiFactory();
    const a = new RoiAnnotator();
    assert.equal(f.getName(), a.getName());
    assert.equal(f.getGroupName(), a.getGroupName());
    assert.equal(f.getNPoints(), a.getNPoints());
  });

  test('setAnnotationMathShape sets ROI from points like annotator', () => {
    const f = new RoiFactory();
    const annotation = makeAnnotation(undefined);
    const pts = [p(0, 0), p(4, 0), p(2, 3)];
    f.setAnnotationMathShape(annotation, pts);
    assert.ok(annotation.mathShape instanceof ROI);
    assert.equal(annotation.mathShape.getLength(), 3);
    assert.equal(annotation.mathShape.getPoint(1).getX(), 4);
    assert.equal(annotation.setTextExpr.mock.calls[0][0]['*'], '');
    assert.equal(annotation.updateQuantification.mock.calls.length, 1);
  });

  test('updateAnnotationOnTranslation delegates to annotator', () => {
    const f = new RoiFactory();
    const annotation = makeAnnotation(
      new ROI([p(1, 2), p(5, 6), p(9, 1)]));
    f.updateAnnotationOnTranslation(annotation, {x: 3, y: -1});
    assert.equal(annotation.mathShape.getPoint(0).getX(), 4);
    assert.equal(annotation.mathShape.getPoint(0).getY(), 1);
    assert.equal(annotation.mathShape.getPoint(2).getX(), 12);
    assert.equal(annotation.mathShape.getPoint(2).getY(), 0);
    assert.equal(annotation.updateQuantification.mock.calls.length, 1);
  });

});
