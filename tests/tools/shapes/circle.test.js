// @vitest-environment jsdom
import {describe, test, assert} from 'vitest';
import {CircleFactory} from '../../../src/tools/shapes/circle.js';
import {CircleAnnotator} from '../../../src/tools/shapes/shapeAnnotators.js';
import {Circle} from '../../../src/math/circle.js';
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

describe('tools/shapes/circle', () => {

  test('CircleFactory.supports matches CircleAnnotator.supports', () => {
    assert.equal(
      CircleFactory.supports(new Circle(p(0, 0), 5)),
      CircleAnnotator.supports(new Circle(p(0, 0), 5)));
    assert.equal(
      CircleFactory.supports(new Rectangle(p(0, 0), p(10, 10))),
      CircleAnnotator.supports(new Rectangle(p(0, 0), p(10, 10))));
    assert.equal(
      CircleFactory.supports(undefined),
      CircleAnnotator.supports(undefined));
  });

  test('metadata', () => {
    const f = new CircleFactory();
    const a = new CircleAnnotator();
    assert.equal(f.getName(), a.getName());
    assert.equal(f.getGroupName(), a.getGroupName());
    assert.equal(f.getNPoints(), a.getNPoints());
  });

  test(
    'setAnnotationMathShape sets circle from two points like annotator',
    () => {
      const f = new CircleFactory();
      const annotation = makeAnnotation(undefined);
      const center = p(2, 3);
      const rim = p(6, 6);
      f.setAnnotationMathShape(annotation, [center, rim]);
      assert.ok(annotation.mathShape instanceof Circle);
      assert.equal(annotation.mathShape.getCenter().getX(), 2);
      assert.equal(annotation.mathShape.getCenter().getY(), 3);
      assert.equal(annotation.mathShape.getRadius(), 5);
      assert.equal(annotation.setTextExpr.mock.calls[0][0]['*'], '{surface}');
      assert.equal(annotation.updateQuantification.mock.calls.length, 1);
    }
  );

  test('updateAnnotationOnTranslation delegates to annotator', () => {
    const f = new CircleFactory();
    const annotation = makeAnnotation(new Circle(p(10, 20), 7));
    f.updateAnnotationOnTranslation(annotation, {x: 4, y: -3});
    assert.equal(annotation.mathShape.getCenter().getX(), 14);
    assert.equal(annotation.mathShape.getCenter().getY(), 17);
    assert.equal(annotation.mathShape.getRadius(), 7);
    assert.equal(annotation.updateQuantification.mock.calls.length, 1);
  });

});
