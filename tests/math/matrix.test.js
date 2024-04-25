import {Vector3D} from '../../src/math/vector';
import {Index} from '../../src/math/index';
import {
  BIG_EPSILON,
  Matrix33,
  getIdentityMat33,
  isIdentityMat33
} from '../../src/math/matrix';

/**
 * Tests for the 'math/point.js' file.
 */

/* global QUnit */
QUnit.module('math');

/**
 * Tests for {@link Matrix33}.
 *
 * @function module:tests/math~matrix33-class
 */
QUnit.test('Matrix33 class', function (assert) {
  const m0 = new getIdentityMat33();
  const m1 = new getIdentityMat33();
  /* eslint-disable array-element-newline */
  const m2 = new Matrix33([
    1, 2, 3,
    4, 5, 6,
    7, 8, 9
  ]);
  const m3 = new Matrix33([
    1.001, 2.001, 3.001,
    4.001, 5.001, 6.001,
    7.001, 8.001, 9.001
  ]);
  const m4 = new Matrix33([
    1.002, 2.002, 3.002,
    4.002, 5.002, 6.002,
    7.002, 8.002, 9.002
  ]);
  /* eslint-enable array-element-newline */

  // equals
  assert.equal(m0.equals(m1), true, 'equals true');
  assert.equal(m0.equals(m2), false, 'equals false');

  // get
  assert.equal(m2.get(0, 0), 1, 'get(0,0)');
  assert.equal(m2.get(0, 1), 2, 'get(0,1)');
  assert.equal(m2.get(0, 2), 3, 'get(0,2)');
  assert.equal(m2.get(1, 0), 4, 'get(1,0)');
  assert.equal(m2.get(1, 1), 5, 'get(1,1)');
  assert.equal(m2.get(1, 2), 6, 'get(1,2)');

  // equals with precision
  assert.equal(m3.equals(m4, 0.01), true, 'equals true');
  assert.equal(m3.equals(m4, 0.001), false, 'equals false');
});

/**
 * Tests for {@link Matrix33} toString.
 *
 * @function module:tests/math~matrix33-tostring
 */
QUnit.test('Matrix33 tostring', function (assert) {
  /* eslint-disable array-element-newline */
  const m0 = new Matrix33([
    1, 2, 3,
    4, 5, 6,
    7, 8, 9
  ]);
  /* eslint-enable array-element-newline */
  const str0 = '[1, 2, 3, \n 4, 5, 6, \n 7, 8, 9]';
  assert.equal(m0.toString(), str0, 'Matrix toString');
});

/**
 * Tests for {@link Matrix33} vector multiplication.
 *
 * @function module:tests/math~matrix33-multiply-vector
 */
QUnit.test('Matrix33 multiply vector', function (assert) {
  // id
  const id = getIdentityMat33();
  const arr00 = [1, 2, 3];
  const resArr00 = [1, 2, 3];
  assert.deepEqual(id.multiplyArray3D(arr00), resArr00, 'id multiply array');
  const v00 = new Vector3D(1, 2, 3);
  const resV00 = new Vector3D(1, 2, 3);
  assert.ok(id.multiplyVector3D(v00).equals(resV00), 'id multiply vector');
  const i00 = new Index(arr00);
  const resI00 = new Index(resArr00);
  assert.ok(id.multiplyIndex3D(i00).equals(resI00), 'id multiply index');

  // zero
  const m00 = new Matrix33([
    0, 0, 0, 0, 0, 0, 0, 0, 0
  ]);
  const resArr01 = [0, 0, 0];
  assert.deepEqual(m00.multiplyArray3D(arr00), resArr01, 'zero multiply array');
  const v01 = new Vector3D(1, 2, 3);
  const resV01 = new Vector3D(0, 0, 0);
  assert.ok(m00.multiplyVector3D(v01).equals(resV01), 'zero multiply vector');
  const i01 = new Index(arr00);
  const resI01 = new Index(resArr01);
  assert.ok(m00.multiplyIndex3D(i01).equals(resI01), 'zero multiply index');

  // test #10
  const m10 = new Matrix33([
    1, 2, 3, 4, 5, 6, 7, 8, 9
  ]);
  const resArr10 = [14, 32, 50];
  assert.deepEqual(m10.multiplyArray3D(arr00), resArr10, 'multiply array #10');
  const v10 = new Vector3D(1, 2, 3);
  const resV10 = new Vector3D(14, 32, 50);
  assert.ok(m10.multiplyVector3D(v10).equals(resV10), 'multiply vector #10');
  const i10 = new Index(arr00);
  const resI10 = new Index(resArr10);
  assert.ok(m10.multiplyIndex3D(i10).equals(resI10), 'multiply index #10');
});

/**
 * Tests for {@link Matrix33} multiplication.
 *
 * @function module:tests/math~Matrix33-multiply
 */
QUnit.test('Matrix33 multiply', function (assert) {
  // id
  const id = getIdentityMat33();
  const idid = id.multiply(id);
  assert.ok(idid.equals(id), 'multiply id');

  // zero
  const m00 = new Matrix33([
    0, 0, 0, 0, 0, 0, 0, 0, 0
  ]);
  const m00id = m00.multiply(id);
  assert.ok(m00id.equals(m00), 'multiply #0');

  // test #10
  const m10 = new Matrix33([
    1, 2, 3, 4, 5, 6, 7, 8, 9
  ]);
  const m11 = new Matrix33([
    2, 3, 4, 5, 6, 7, 8, 9, 10
  ]);
  const m10m11 = m10.multiply(m11);
  const res10 = new Matrix33([
    36, 42, 48, 81, 96, 111, 126, 150, 174
  ]);
  assert.ok(m10m11.equals(res10), 'multiply #1');
});

/**
 * Tests for {@link Matrix33} inversion.
 *
 * @function module:tests/math~matrix33-inverse
 */
QUnit.test('Matrix33 inverse', function (assert) {
  // id
  const id = getIdentityMat33();
  const invid = id.getInverse();
  assert.ok(invid.equals(id), 'inverse id');

  // double inverse
  const invinvid = invid.getInverse();
  assert.ok(invinvid.equals(id), 'inverse id twice');

  // test #10
  const m10 = new Matrix33([
    1, 4, 5, 7, 2, 6, 8, 9, 3
  ]);
  const invm10 = m10.getInverse();
  const res10 = new Matrix33([
    -48 / 295,
    33 / 295,
    14 / 295,
    27 / 295,
    -37 / 295,
    29 / 295,
    47 / 295,
    23 / 295,
    -26 / 295
  ]);
  assert.ok(invm10.equals(res10), 'inverse #1');

  // double inverse
  const invinvm10 = invm10.getInverse();
  assert.ok(invinvm10.equals(m10, BIG_EPSILON), 'inverse #1 twice');
});

/**
 * Tests for {@link Matrix33} getAbs.
 *
 * @function module:tests/math~matrix33-abs
 */
QUnit.test('Matrix33 abs', function (assert) {
  const m00 = new Matrix33([
    -1, -2, -3, -4, -5, -6, -7, -8, -9
  ]);
  const theo00 = new Matrix33([
    1, 2, 3, 4, 5, 6, 7, 8, 9
  ]);
  assert.ok(m00.getAbs().equals(theo00), 'Matrix33 abs');
});

/**
 * Tests for {@link Matrix33} asOneAndZeros.
 *
 * @function module:tests/math~matrix33-asoneandzeros
 */
QUnit.test('Matrix33 asOneAndZeros', function (assert) {
  // test #00
  const m00 = new Matrix33([
    1, 2, 3, 4, 5, 6, 7, 8, 9
  ]);
  const theo00 = new Matrix33([
    0, 0, 1, 0, 0, 1, 0, 0, 1
  ]);
  assert.ok(m00.asOneAndZeros().equals(theo00), 'Matrix33 asOneAndZeros #00');

  // test #01
  const m01 = new Matrix33([
    3, 2, 1, 100, 99, 98, 5.5, 5.6, 5.4
  ]);
  const theo01 = new Matrix33([
    1, 0, 0, 1, 0, 0, 0, 1, 0
  ]);
  assert.ok(m01.asOneAndZeros().equals(theo01), 'Matrix33 asOneAndZeros #01');
});

/**
 * Tests for {@link Matrix33} factories.
 *
 * @function module:tests/math~matrix33-factories
 */
QUnit.test('Matrix33 factories', function (assert) {
  // test #00
  const m00 = getIdentityMat33();
  const theo00 = new Matrix33([
    1, 0, 0, 0, 1, 0, 0, 0, 1
  ]);
  assert.ok(m00.equals(theo00), 'Matrix33 factory id');

  assert.ok(isIdentityMat33(m00), 'Matrix33 factory id isIdentity');
});
