// @vitest-environment jsdom
import {describe, test, assert} from 'vitest';
import {EllipseFactory} from '../../../src/tools/shapes/ellipse.js';
import {EllipseAnnotator} from '../../../src/tools/shapes/shapeAnnotators.js';
import {Ellipse} from '../../../src/math/ellipse.js';
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

describe('tools/shapes/ellipse', () => {

  test('EllipseFactory.supports matches EllipseAnnotator.supports', () => {
    assert.equal(
      EllipseFactory.supports(new Ellipse(p(1, 2), 4, 5)),
      EllipseAnnotator.supports(new Ellipse(p(1, 2), 4, 5)));
    assert.equal(
      EllipseFactory.supports(new Circle(p(0, 0), 3)),
      EllipseAnnotator.supports(new Circle(p(0, 0), 3)));
    assert.equal(
      EllipseFactory.supports(undefined),
      EllipseAnnotator.supports(undefined));
  });

  test('metadata', () => {
    const f = new EllipseFactory();
    const a = new EllipseAnnotator();
    assert.equal(f.getName(), a.getName());
    assert.equal(f.getGroupName(), a.getGroupName());
    assert.equal(f.getNPoints(), a.getNPoints());
  });

  test(
    'setAnnotationMathShape sets ellipse from two points like annotator',
    () => {
      const f = new EllipseFactory();
      const annotation = makeAnnotation(undefined);
      const corner = p(2, 3);
      const opposite = p(10, 8);
      f.setAnnotationMathShape(annotation, [corner, opposite]);
      assert.ok(annotation.mathShape instanceof Ellipse);
      assert.equal(annotation.mathShape.getCenter().getX(), 2);
      assert.equal(annotation.mathShape.getCenter().getY(), 3);
      assert.equal(annotation.mathShape.getA(), 8);
      assert.equal(annotation.mathShape.getB(), 5);
      assert.equal(annotation.setTextExpr.mock.calls[0][0]['*'], '{surface}');
      assert.equal(annotation.updateQuantification.mock.calls.length, 1);
    }
  );

  test('updateAnnotationOnTranslation delegates to annotator', () => {
    const f = new EllipseFactory();
    const annotation = makeAnnotation(new Ellipse(p(10, 20), 3, 7));
    f.updateAnnotationOnTranslation(annotation, {x: 2, y: -4});
    assert.equal(annotation.mathShape.getCenter().getX(), 12);
    assert.equal(annotation.mathShape.getCenter().getY(), 16);
    assert.equal(annotation.mathShape.getA(), 3);
    assert.equal(annotation.mathShape.getB(), 7);
    assert.equal(annotation.updateQuantification.mock.calls.length, 1);
  });

});
