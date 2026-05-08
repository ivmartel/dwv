// @vitest-environment jsdom
import {describe, test, assert} from 'vitest';
import {ArrowFactory} from '../../../src/tools/shapes/arrow.js';
import {ArrowAnnotator} from '../../../src/tools/shapes/shapeAnnotators.js';
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

/**
 * Arrow annotation mock: mathShape = tip, referencePoints[0] = tail.
 *
 * @param {Point2D} [tip] Tip.
 * @param {Point2D} [tail] Tail.
 * @returns {object} Annotation-like object.
 */
function makeArrowAnnotation(tip, tail) {
  const ann = makeAnnotation(tip);
  ann.referencePoints = tail !== undefined ? [tail] : [];
  return ann;
}

describe('tools/shapes/arrow', () => {

  test('ArrowFactory.supports matches ArrowAnnotator.supports', () => {
    assert.equal(
      ArrowFactory.supports(p(0, 0)),
      ArrowAnnotator.supports(p(0, 0)));
    assert.equal(
      ArrowFactory.supports(new Rectangle(p(0, 0), p(10, 10))),
      ArrowAnnotator.supports(new Rectangle(p(0, 0), p(10, 10))));
    assert.equal(
      ArrowFactory.supports(undefined),
      ArrowAnnotator.supports(undefined));
  });

  test('metadata', () => {
    const f = new ArrowFactory();
    const a = new ArrowAnnotator();
    assert.equal(f.getName(), a.getName());
    assert.equal(f.getGroupName(), a.getGroupName());
    assert.equal(f.getNPoints(), a.getNPoints());
  });

  test('setAnnotationMathShape sets tip and tail like annotator', () => {
    const f = new ArrowFactory();
    const annotation = makeArrowAnnotation(undefined, undefined);
    const tip = p(10, 20);
    const tail = p(30, 40);
    f.setAnnotationMathShape(annotation, [tip, tail]);
    assert.equal(annotation.mathShape, tip);
    assert.equal(annotation.referencePoints[0], tail);
    assert.equal(annotation.setTextExpr.mock.calls[0][0]['*'], '');
  });

  test('updateAnnotationOnTranslation delegates to annotator', () => {
    const f = new ArrowFactory();
    const annotation = makeArrowAnnotation(p(10, 20), p(30, 40));
    f.updateAnnotationOnTranslation(annotation, {x: 5, y: 10});
    assert.equal(annotation.mathShape.getX(), 15);
    assert.equal(annotation.mathShape.getY(), 30);
    assert.equal(annotation.referencePoints[0].getX(), 35);
    assert.equal(annotation.referencePoints[0].getY(), 50);
  });

});
