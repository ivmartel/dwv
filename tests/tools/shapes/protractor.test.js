// @vitest-environment jsdom
import {describe, test, assert} from 'vitest';
import {ProtractorFactory} from '../../../src/tools/shapes/protractor.js';
import {
  ProtractorAnnotator
} from '../../../src/tools/shapes/shapeAnnotators.js';
import {Protractor} from '../../../src/math/protractor.js';
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

describe('tools/shapes/protractor', () => {

  test(
    'ProtractorFactory.supports matches ProtractorAnnotator.supports',
    () => {
      const good = new Protractor([p(0, 0), p(1, 0), p(1, 1)]);
      assert.equal(
        ProtractorFactory.supports(good),
        ProtractorAnnotator.supports(good));
      assert.equal(
        ProtractorFactory.supports(new Circle(p(0, 0), 2)),
        ProtractorAnnotator.supports(new Circle(p(0, 0), 2)));
      assert.equal(
        ProtractorFactory.supports(undefined),
        ProtractorAnnotator.supports(undefined));
    }
  );

  test('metadata', () => {
    const f = new ProtractorFactory();
    const a = new ProtractorAnnotator();
    assert.equal(f.getName(), a.getName());
    assert.equal(f.getGroupName(), a.getGroupName());
    assert.equal(f.getNPoints(), a.getNPoints());
  });

  test(
    'setAnnotationMathShape sets protractor from points like annotator',
    () => {
      const f = new ProtractorFactory();
      const annotation = makeAnnotation(undefined);
      const pts = [p(1, 2), p(5, 3), p(4, 9)];
      f.setAnnotationMathShape(annotation, pts);
      assert.ok(annotation.mathShape instanceof Protractor);
      assert.equal(annotation.mathShape.getLength(), 3);
      assert.equal(annotation.mathShape.getPoint(0).getX(), 1);
      assert.equal(annotation.mathShape.getPoint(2).getY(), 9);
      assert.equal(annotation.setTextExpr.mock.calls[0][0]['*'], '{angle}');
      assert.equal(annotation.updateQuantification.mock.calls.length, 1);
    }
  );

  test('updateAnnotationOnTranslation delegates to annotator', () => {
    const f = new ProtractorFactory();
    const annotation = makeAnnotation(
      new Protractor([p(0, 0), p(10, 0), p(10, 10)]));
    f.updateAnnotationOnTranslation(annotation, {x: -1, y: 3});
    assert.equal(annotation.mathShape.getPoint(0).getX(), -1);
    assert.equal(annotation.mathShape.getPoint(0).getY(), 3);
    assert.equal(annotation.mathShape.getPoint(1).getX(), 9);
    assert.equal(annotation.mathShape.getPoint(2).getY(), 13);
    assert.equal(annotation.updateQuantification.mock.calls.length, 1);
  });

});
