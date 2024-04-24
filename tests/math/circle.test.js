import {Point2D} from '../../src/math/point';
import {Index} from '../../src/math/index';
import {Circle} from '../../src/math/circle';

/**
 * Tests for the 'math/circle.js' file.
 */

/* global QUnit */
QUnit.module('math');

/**
 * Tests for {@link Circle}.
 *
 * @function module:tests/math~circle-class
 */
QUnit.test('Circle class - #DWV-REQ-UI-07-002 Draw circle', function (assert) {
  const center0 = new Point2D(0, 0);
  const c0 = new Circle(center0, 2);
  // getCenter
  assert.equal(c0.getCenter(), center0, 'getCenter');
  // getRadius
  assert.equal(c0.getRadius(), 2, 'getRadius');

  // equals: true
  const c1 = new Circle(center0, 2);
  assert.ok(c0.equals(c1), 'equal circles');
  // equals: false radius
  const c20 = new Circle(center0, 3);
  assert.notOk(c0.equals(c20), 'non equal circles radius');
  // equals: false center
  const center21 = new Point2D(1, 1);
  const c21 = new Circle(center21, 2);
  assert.notOk(c0.equals(c21), 'non equal circles center');

  // getSurface
  assert.equal(c0.getSurface(), Math.PI * 2 * 2, 'getSurface');
  // getWorldSurface
  const spacing2D = {x: 0.5, y: 0.5};
  assert.equal(c0.getWorldSurface(spacing2D), Math.PI, 'getWorldSurface');
});

/**
 * Tests for {@link Circle} quantification.
 *
 * @function module:tests/math~circle-quantification
 */
QUnit.test('Circle quantication - #DWV-REQ-UI-07-002 Draw circle',
  function (assert) {
    const center0 = new Point2D(2, 2);
    const c0 = new Circle(center0, 2);
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
      surface: {value: 0.12566370614359174, unit: undefined}
    };
    const resQuant0 = c0.quantify(mockVc0);
    assert.equal(resQuant0.min.value, theoQuant0.min.value, 'quant min');
    assert.equal(resQuant0.max.value, theoQuant0.max.value, 'quant max');
    assert.equal(resQuant0.mean.value, theoQuant0.mean.value, 'quant mean');
    assert.equal(
      resQuant0.stdDev.value, theoQuant0.stdDev.value, 'quant stdDev');
    assert.equal(
      resQuant0.surface.value, theoQuant0.surface.value, 'quant surface');
  }
);
