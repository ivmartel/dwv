// @vitest-environment jsdom
import {describe, test, assert} from 'vitest';
import {RulerFactory} from '../../../src/tools/shapes/ruler.js';
import {RulerAnnotator} from '../../../src/tools/shapes/shapeAnnotators.js';
import {Line} from '../../../src/math/line.js';
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

describe('tools/shapes/ruler', () => {

  test('RulerFactory.supports matches RulerAnnotator.supports', () => {
    assert.equal(
      RulerFactory.supports(new Line(p(0, 0), p(3, 4))),
      RulerAnnotator.supports(new Line(p(0, 0), p(3, 4))));
    assert.equal(
      RulerFactory.supports(new Rectangle(p(0, 0), p(1, 1))),
      RulerAnnotator.supports(new Rectangle(p(0, 0), p(1, 1))));
    assert.equal(
      RulerFactory.supports(undefined),
      RulerAnnotator.supports(undefined));
  });

  test('metadata', () => {
    const f = new RulerFactory();
    const a = new RulerAnnotator();
    assert.equal(f.getName(), a.getName());
    assert.equal(f.getGroupName(), a.getGroupName());
    assert.equal(f.getNPoints(), a.getNPoints());
  });

  test(
    'setAnnotationMathShape sets line from two points like annotator',
    () => {
      const f = new RulerFactory();
      const annotation = makeAnnotation(undefined);
      f.setAnnotationMathShape(annotation, [p(1, 2), p(7, 10)]);
      assert.ok(annotation.mathShape instanceof Line);
      assert.equal(annotation.mathShape.getBegin().getX(), 1);
      assert.equal(annotation.mathShape.getEnd().getY(), 10);
      assert.equal(annotation.setTextExpr.mock.calls[0][0]['*'], '{length}');
      assert.equal(annotation.updateQuantification.mock.calls.length, 1);
    }
  );

  test('updateAnnotationOnTranslation delegates to annotator', () => {
    const f = new RulerFactory();
    const annotation = makeAnnotation(new Line(p(0, 0), p(10, 20)));
    f.updateAnnotationOnTranslation(annotation, {x: 5, y: -3});
    assert.equal(annotation.mathShape.getBegin().getX(), 5);
    assert.equal(annotation.mathShape.getBegin().getY(), -3);
    assert.equal(annotation.mathShape.getEnd().getX(), 15);
    assert.equal(annotation.mathShape.getEnd().getY(), 17);
    assert.equal(annotation.updateQuantification.mock.calls.length, 1);
  });

});
