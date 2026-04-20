import {describe, test, assert} from 'vitest';
import {Point2D} from '../../src/math/point.js';
import {Protractor} from '../../src/math/protractor.js';

/**
 * Tests for the 'math/protractor.js' file.
 */

describe('math', () => {

  /**
   * Tests for {@link Protractor}.
   *
   * @function module:tests/math~protractorClass
   */
  test('Protractor class - #DWV-REQ-UI-07-005 Draw protractor',
    () => {
      const p00 = new Point2D(1, 0);
      const p01 = new Point2D(0, 0);
      const p02 = new Point2D(0, 1);
      const pro00 = new Protractor([p00, p01, p02]);
      // getPoint
      assert.ok(pro00.getPoint(0).equals(p00), 'getPoint #0');
      assert.ok(pro00.getPoint(1).equals(p01), 'getPoint #1');
      assert.ok(pro00.getPoint(2).equals(p02), 'getPoint #2');

      // getLength
      assert.equal(pro00.getLength(0), 3, 'getLength');

      // getCentroid
      assert.ok(pro00.getCentroid().equals(p01), 'getCentroid');
    }
  );

  /**
   * Tests for {@link Rectangle} quantification.
   *
   * @function module:tests/math~protractorQuantification
   */
  test('Protractor quantification - #DWV-REQ-UI-07-005 Draw protractor',
    () => {
      const p00 = new Point2D(1, 0);
      const p01 = new Point2D(0, 0);
      const p02 = new Point2D(0, 1);
      const pro00 = new Protractor([p00, p01, p02]);
      const theoQuant0 = {
        angle: {value: 90, unit: 'unit.degree'},
      };
      const resQuant0 = pro00.quantify();
      assert.equal(resQuant0.angle.value, theoQuant0.angle.value,
        'quant angle');
    }
  );

});
