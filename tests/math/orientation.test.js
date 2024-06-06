import {
  Matrix33,
  getIdentityMat33,
} from '../../src/math/matrix';
import {
  getMatrixFromName,
  getOrientationStringLPS,
  Orientation,
  getOrientationFromCosines
} from '../../src/math/orientation';

/**
 * Tests for the 'math/point.js' file.
 */

/* global QUnit */
QUnit.module('math');

/**
 * Tests for {@link Matrix33} factories.
 *
 * @function module:tests/math~orientation-matrix-factories
 */
QUnit.test('orientation matrix factories', function (assert) {
  const theo00 = new Matrix33([
    1, 0, 0, 0, 1, 0, 0, 0, 1
  ]);

  // test #01
  const m01 = getMatrixFromName(Orientation.Axial);
  assert.ok(m01.equals(theo00), 'Matrix33 factory axial');

  // test #02
  const m02 = getMatrixFromName(Orientation.Coronal);
  const theo02 = new Matrix33([
    1, 0, 0, 0, 0, 1, 0, -1, 0
  ]);
  assert.ok(m02.equals(theo02), 'Matrix33 factory coronal');

  // test #03
  const m03 = getMatrixFromName(Orientation.Sagittal);
  const theo03 = new Matrix33([
    0, 0, -1, 1, 0, 0, 0, -1, 0
  ]);
  assert.ok(m03.equals(theo03), 'Matrix33 factory sagittal');

  // test #04
  const m04 = getMatrixFromName('godo');
  assert.equal(m04, null, 'Matrix33 factory unknown name');
});

/**
 * Tests for {@link Matrix33} getOrientationStringLPS.
 *
 * @function module:tests/math~getOrientationStringLPS
 */
QUnit.test('getOrientationStringLPS', function (assert) {
  // axial
  const m00 = getIdentityMat33(); // [1, 0, 0, 0, 1, 0]
  const code00 = getOrientationStringLPS(m00);
  assert.equal(code00, 'LPS', 'LPS matrix');
  const m01 = getOrientationFromCosines([1, 0, 0, 0, -1, 0]);
  const code01 = getOrientationStringLPS(m01);
  assert.equal(code01, 'LAI', 'LAI matrix');
  const m02 = getOrientationFromCosines([-1, 0, 0, 0, -1, 0]);
  const code02 = getOrientationStringLPS(m02);
  assert.equal(code02, 'RAS', 'RAS matrix');
  const m03 = getOrientationFromCosines([-1, 0, 0, 0, 1, 0]);
  const code03 = getOrientationStringLPS(m03);
  assert.equal(code03, 'RPI', 'RPI matrix');

  // coronal
  const m10 = getMatrixFromName(Orientation.Coronal); // [1, 0, 0, 0, 0, -1]
  const code10 = getOrientationStringLPS(m10);
  assert.equal(code10, 'LIP', 'LIP matrix');
  const m11 = getOrientationFromCosines([1, 0, 0, 0, 0, 1]);
  const code11 = getOrientationStringLPS(m11);
  assert.equal(code11, 'LSA', 'LSA matrix');
  const m12 = getOrientationFromCosines([-1, 0, 0, 0, 0, -1]);
  const code12 = getOrientationStringLPS(m12);
  assert.equal(code12, 'RIA', 'RIA matrix');
  const m13 = getOrientationFromCosines([-1, 0, 0, 0, 0, 1]);
  const code13 = getOrientationStringLPS(m13);
  assert.equal(code13, 'RSP', 'RSP matrix');

  // sagittal
  const m20 = getMatrixFromName(Orientation.Sagittal); // [0, 1, 0, 0, 0, -1]
  const code20 = getOrientationStringLPS(m20);
  assert.equal(code20, 'PIR', 'PIR matrix');
  const m21 = getOrientationFromCosines([0, 1, 0, 0, 0, 1]);
  const code21 = getOrientationStringLPS(m21);
  assert.equal(code21, 'PSL', 'PSL matrix');
  const m22 = getOrientationFromCosines([0, -1, 0, 0, 0, -1]);
  const code22 = getOrientationStringLPS(m22);
  assert.equal(code22, 'AIL', 'AIL matrix');
  const m23 = getOrientationFromCosines([0, -1, 0, 0, 0, 1]);
  const code23 = getOrientationStringLPS(m23);
  assert.equal(code23, 'ASR', 'ASR matrix');
});
