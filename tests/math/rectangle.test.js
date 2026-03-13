import {describe, test, assert} from 'vitest';
import {Point2D} from '../../src/math/point.js';
import {Index} from '../../src/math/index.js';
import {
  Rectangle,
  getRectangleIndices
} from '../../src/math/rectangle.js';

/**
 * Tests for the 'math/rectangle.js' file.
 */

describe('math', () => {

  /**
   * Tests for {@link Rectangle}.
   *
   * @function module:tests/math~rectangle-class
   */
  test('Rectangle class - #DWV-REQ-UI-07-006 Draw rectangle',
    () => {
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
      // getCentroid
      const centroid = r00.getCentroid();
      const theoCentroid = new Point2D(-2, -2);
      assert.ok(centroid.equals(theoCentroid), 'getCentroid');
    }
  );

  /**
   * Tests for {@link Rectangle} quantification.
   *
   * @function module:tests/math~rectangle-quantification
   */
  test('Rectangle quantification - #DWV-REQ-UI-07-006 Draw rectangle',
    () => {
      const p00 = new Point2D(0, 0);
      const p01 = new Point2D(4, 4);
      const r00 = new Rectangle(p00, p01);
      // view controller
      const mockVc0 = {
        canQuantifyImage() {
          return true;
        },
        get2DSpacing() {
          return {x: 1, y: 1};
        },
        getImageRegionValues() {
          return [0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0];
        },
        getPixelUnit() {
          return '';
        },
        getLengthUnit() {
          return 'unit.mm';
        }
      };
      const theoQuant0 = {
        min: {value: 0, unit: ''},
        max: {value: 1, unit: ''},
        mean: {value: 0.25, unit: ''},
        stdDev: {value: 0.4330127018922193, unit: ''},
        surface: {value: 0.16, unit: undefined}
      };
      const index0 = new Index([0, 0, 0]);
      const resQuant0 = r00.quantify(mockVc0, index0);
      assert.equal(resQuant0.min.value, theoQuant0.min.value, 'quant min');
      assert.equal(resQuant0.max.value, theoQuant0.max.value, 'quant max');
      assert.equal(resQuant0.mean.value, theoQuant0.mean.value, 'quant mean');
      assert.equal(resQuant0.stdDev.value,
        theoQuant0.stdDev.value, 'quant stdDev');
      assert.equal(
        resQuant0.surface.value, theoQuant0.surface.value, 'quant surface');
    }
  );

  /**
   * Tests for {@link Rectangle} getRectangleIndices.
   *
   * @function module:tests/math~rectangle-getrectangleindices
   */
  test('Rectangle getRectangleIndices',
    () => {
      const center0 = new Index([1, 1]);
      const size0 = [2, 2];
      const dir0 = [0, 1];
      const indicesTheo0 = [
        new Index([0, 0]),
        new Index([0, 1]),
        new Index([1, 0]),
        new Index([1, 1])
      ];
      const indices0 = getRectangleIndices(center0, size0, dir0);
      assert.deepEqual(indices0, indicesTheo0, 'Get indices #0');
    }
  );

});
