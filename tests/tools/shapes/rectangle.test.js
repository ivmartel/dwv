// @vitest-environment jsdom
import {describe, test, assert} from 'vitest';
import {RectangleFactory} from '../../../src/tools/shapes/rectangle.js';
import {RectangleAnnotator} from '../../../src/tools/shapes/shapeAnnotators.js';
import {Rectangle} from '../../../src/math/rectangle.js';
import {Circle} from '../../../src/math/circle.js';
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

describe('tools/shapes/rectangle', () => {

  test('RectangleFactory.supports matches RectangleAnnotator.supports', () => {
    assert.equal(
      RectangleFactory.supports(new Rectangle(p(0, 0), p(5, 6))),
      RectangleAnnotator.supports(new Rectangle(p(0, 0), p(5, 6))));
    assert.equal(
      RectangleFactory.supports(new Circle(p(0, 0), 1)),
      RectangleAnnotator.supports(new Circle(p(0, 0), 1)));
    assert.equal(
      RectangleFactory.supports(undefined),
      RectangleAnnotator.supports(undefined));
  });

  test('metadata', () => {
    const f = new RectangleFactory();
    const a = new RectangleAnnotator();
    assert.equal(f.getName(), a.getName());
    assert.equal(f.getGroupName(), a.getGroupName());
    assert.equal(f.getNPoints(), a.getNPoints());
  });

  test(
    'setAnnotationMathShape sets rectangle from two corners like annotator',
    () => {
      const f = new RectangleFactory();
      const annotation = makeAnnotation(undefined);
      f.setAnnotationMathShape(annotation, [p(10, 20), p(4, 8)]);
      assert.ok(annotation.mathShape instanceof Rectangle);
      assert.equal(annotation.mathShape.getBegin().getX(), 4);
      assert.equal(annotation.mathShape.getBegin().getY(), 8);
      assert.equal(annotation.mathShape.getEnd().getX(), 10);
      assert.equal(annotation.mathShape.getEnd().getY(), 20);
      assert.equal(annotation.setTextExpr.mock.calls[0][0]['*'], '{surface}');
      assert.equal(annotation.updateQuantification.mock.calls.length, 1);
    }
  );

  test('updateAnnotationOnTranslation delegates to annotator', () => {
    const f = new RectangleFactory();
    const annotation = makeAnnotation(new Rectangle(p(1, 2), p(7, 9)));
    f.updateAnnotationOnTranslation(annotation, {x: 3, y: -2});
    assert.equal(annotation.mathShape.getBegin().getX(), 4);
    assert.equal(annotation.mathShape.getBegin().getY(), 0);
    assert.equal(annotation.mathShape.getEnd().getX(), 10);
    assert.equal(annotation.mathShape.getEnd().getY(), 7);
    assert.equal(annotation.updateQuantification.mock.calls.length, 1);
  });

});
