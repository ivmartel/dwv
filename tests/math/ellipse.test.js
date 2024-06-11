import {Point2D} from '../../src/math/point';
import {Index} from '../../src/math/index';
import {Ellipse, getEllipseIndices} from '../../src/math/ellipse';

/**
 * Tests for the 'math/ellipse.js' file.
 */

/* global QUnit */
QUnit.module('math');

/**
 * Tests for {@link Ellipse}.
 *
 * @function module:tests/math~ellipse-class
 */
QUnit.test('Ellipse class - #DWV-REQ-UI-07-003 Draw ellipse',
  function (assert) {
    const center0 = new Point2D(0, 0);
    const e0 = new Ellipse(center0, 2, 4);
    // getCenter
    assert.equal(e0.getCenter(), center0, 'getCenter');
    // getA
    assert.equal(e0.getA(), 2, 'getA');
    // getB
    assert.equal(e0.getB(), 4, 'getB');

    // equals: true
    const e1 = new Ellipse(center0, 2, 4);
    assert.ok(e0.equals(e1), 'equal ellipses');
    // equals: false a
    const e20 = new Ellipse(center0, 3, 4);
    assert.notOk(e0.equals(e20), 'non equal ellipses a');
    // equals: false b
    const e21 = new Ellipse(center0, 2, 5);
    assert.notOk(e0.equals(e21), 'non equal ellipses b');
    // equals: false radius
    const center22 = new Point2D(1, 1);
    const e22 = new Ellipse(center22, 2, 4);
    assert.notOk(e0.equals(e22), 'non equal ellipses center');

    // getSurface
    assert.equal(e0.getSurface(), Math.PI * 2 * 4, 'getSurface');
    // equals: true
    const spacing2D = {x: 0.5, y: 0.25};
    assert.equal(e0.getWorldSurface(spacing2D), Math.PI, 'getWorldSurface');
  }
);

/**
 * Tests for {@link Ellipse} quantification.
 *
 * @function module:tests/math~ellipse-quantification
 */
QUnit.test('Ellipse quantification - #DWV-REQ-UI-07-003 Draw ellipse',
  function (assert) {
    const center0 = new Point2D(2, 2);
    const e0 = new Ellipse(center0, 1, 2);
    // view controller
    const mockVc0 = {
      canQuantifyImage: function () {
        return true;
      },
      get2DSpacing: function () {
        return {x: 1, y: 1};
      },
      getCurrentPosition: function () {
        return new Index([0, 0, 0]);
      },
      getImageVariableRegionValues: function () {
        return [0, 1, 1, 0, 0, 1, 1, 0];
      },
      getPixelUnit: function () {
        return '';
      }
    };
    const theoQuant0 = {
      min: {value: 0, unit: ''},
      max: {value: 1, unit: ''},
      mean: {value: 0.5, unit: ''},
      stdDev: {value: 0.5, unit: ''},
      surface: {value: 0.06283185307179587, unit: undefined}
    };
    const resQuant0 = e0.quantify(mockVc0);
    assert.equal(resQuant0.min.value, theoQuant0.min.value, 'quant min');
    assert.equal(resQuant0.max.value, theoQuant0.max.value, 'quant max');
    assert.equal(resQuant0.mean.value, theoQuant0.mean.value, 'quant mean');
    assert.equal(
      resQuant0.stdDev.value, theoQuant0.stdDev.value, 'quant stdDev');
    assert.equal(
      resQuant0.surface.value, theoQuant0.surface.value, 'quant surface');
  }
);

/**
 * Tests for getEllipseIndices.
 *
 * @function module:tests/math~getEllipseIndices
 */
QUnit.test('Test getEllipseIndices', function (assert) {
  const center00 = new Index([1, 1]);
  const radius00 = [2, 2];
  const dir00 = [0, 1];
  const theoRes = [];
  for (let i = 0; i <= radius00[0]; ++i) {
    for (let j = 0; j <= radius00[1]; ++j) {
      theoRes.push(new Index([i, j]));
    }
  }
  let indices00 = getEllipseIndices(center00, radius00, dir00);
  // sort
  indices00.sort();
  // filter duplicates
  indices00 = indices00.filter(function (item, index, arr) {
    return !item.equals(arr[index - 1]);
  });

  assert.ok(indices00.length, theoRes.length,
    'index list and theo result have same size');
  let isEqual = true;
  for (let k = 0; k < indices00.length; ++k) {
    if (!indices00[k].equals(theoRes[k])) {
      isEqual = false;
      break;
    }
  }
  assert.ok(isEqual,
    'index list and theo result have same values');
});
