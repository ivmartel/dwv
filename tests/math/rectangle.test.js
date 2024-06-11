import {Point2D} from '../../src/math/point';
import {Index} from '../../src/math/index';
import {Rectangle} from '../../src/math/rectangle';

/**
 * Tests for the 'math/rectangle.js' file.
 */

/* global QUnit */
QUnit.module('math');

/**
 * Tests for {@link Rectangle}.
 *
 * @function module:tests/math~rectangle-class
 */
QUnit.test('Rectangle class - #DWV-REQ-UI-07-006 Draw rectangle',
  function (assert) {
    const p00 = new Point2D(0, 0);
    const p01 = new Point2D(-4, -4);
    const r00 = new Rectangle(p00, p01);
    // getBegin
    assert.equal(r00.getBegin().equals(p01), true, 'getBegin');
    // getEnd
    assert.equal(r00.getEnd().equals(p00), true, 'getEnd');

    // equals: true
    const r01 = new Rectangle(p00, p01);
    assert.ok(r00.equals(r01), 'equal rectangles');
    // equals: false end
    const p02 = new Point2D(0, -4);
    const r02 = new Rectangle(p00, p02);
    assert.notOk(r00.equals(r02), 'non equal rectangles end');
    // equals: false begin
    const r03 = new Rectangle(p02, p01);
    assert.notOk(r00.equals(r03), 'non equal rectangles begin');

    // getRealWidth
    assert.equal(r00.getRealWidth(), 4, 'getRealWidth');
    // getRealHeight
    assert.equal(r00.getRealHeight(), 4, 'getRealHeight');
    // getWidth
    assert.equal(r00.getWidth(), 4, 'getWidth');
    // getHeight
    assert.equal(r00.getHeight(), 4, 'getHeight');
    // getSurface
    assert.equal(r00.getSurface(), 16, 'getSurface');
    // getWorldSurface
    const spacing2D = {x: 0.5, y: 0.5};
    assert.equal(r00.getWorldSurface(spacing2D), 4, 'getWorldSurface');
  }
);

/**
 * Tests for {@link Rectangle} quantification.
 *
 * @function module:tests/math~rectangle-quantification
 */
QUnit.test('Rectangle quantification - #DWV-REQ-UI-07-006 Draw rectangle',
  function (assert) {
    const p00 = new Point2D(0, 0);
    const p01 = new Point2D(4, 4);
    const r00 = new Rectangle(p00, p01);
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
      getImageRegionValues: function () {
        return [0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0];
      },
      getPixelUnit: function () {
        return '';
      }
    };
    const theoQuant0 = {
      min: {value: 0, unit: ''},
      max: {value: 1, unit: ''},
      mean: {value: 0.25, unit: ''},
      stdDev: {value: 0.4330127018922193, unit: ''},
      surface: {value: 0.16, unit: undefined}
    };
    const resQuant0 = r00.quantify(mockVc0);
    assert.equal(resQuant0.min.value, theoQuant0.min.value, 'quant min');
    assert.equal(resQuant0.max.value, theoQuant0.max.value, 'quant max');
    assert.equal(resQuant0.mean.value, theoQuant0.mean.value, 'quant mean');
    assert.equal(resQuant0.stdDev.value,
      theoQuant0.stdDev.value, 'quant stdDev');
    assert.equal(
      resQuant0.surface.value, theoQuant0.surface.value, 'quant surface');
  }
);
