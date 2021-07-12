/**
 * Tests for the 'math/point.js' file.
 */
/** @module tests/math */
// Do not warn if these variables were not defined before.
/* global QUnit */
QUnit.module('matrix');

/**
 * Tests for {@link dwv.math.Matrix33}.
 *
 * @function module:tests/math~Matrix33
 */
QUnit.test('Test Matrix33.', function (assert) {
  var m0 = new dwv.math.getIdentityMat33();
  var m1 = new dwv.math.getIdentityMat33();
  /* eslint-disable array-element-newline */
  var m2 = new dwv.math.Matrix33([
    1, 2, 3,
    4, 5, 6,
    7, 8, 9
  ]);
  var m3 = new dwv.math.Matrix33([
    1.001, 2.001, 3.001,
    4.001, 5.001, 6.001,
    7.001, 8.001, 9.001
  ]);
  var m4 = new dwv.math.Matrix33([
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
 * Tests for {@link dwv.math.Matrix33} vector multiplication.
 *
 * @function module:tests/math~Matrix33
 */
QUnit.test('Test Matrix33 multiply vector.', function (assert) {
  // id
  var id = dwv.math.getIdentityMat33();
  var arr00 = [1, 2, 3];
  var resArr00 = [1, 2, 3];
  assert.deepEqual(id.multiplyArray3D(arr00), resArr00, 'id multiply array');
  var v00 = new dwv.math.Vector3D(1, 2, 3);
  var resV00 = new dwv.math.Vector3D(1, 2, 3);
  assert.ok(id.multiplyVector3D(v00).equals(resV00), 'id multiply vector');
  var i00 = new dwv.math.Index(arr00);
  var resI00 = new dwv.math.Index(resArr00);
  assert.ok(id.multiplyIndex3D(i00).equals(resI00), 'id multiply index');

  // zero
  var m00 = new dwv.math.Matrix33([
    0, 0, 0, 0, 0, 0, 0, 0, 0
  ]);
  var resArr01 = [0, 0, 0];
  assert.deepEqual(m00.multiplyArray3D(arr00), resArr01, 'zero multiply array');
  var v01 = new dwv.math.Vector3D(1, 2, 3);
  var resV01 = new dwv.math.Vector3D(0, 0, 0);
  assert.ok(m00.multiplyVector3D(v01).equals(resV01), 'zero multiply vector');
  var i01 = new dwv.math.Index(arr00);
  var resI01 = new dwv.math.Index(resArr01);
  assert.ok(m00.multiplyIndex3D(i01).equals(resI01), 'zero multiply index');

  // test #10
  var m10 = new dwv.math.Matrix33([
    1, 2, 3, 4, 5, 6, 7, 8, 9
  ]);
  var resArr10 = [14, 32, 50];
  assert.deepEqual(m10.multiplyArray3D(arr00), resArr10, 'multiply array #10');
  var v10 = new dwv.math.Vector3D(1, 2, 3);
  var resV10 = new dwv.math.Vector3D(14, 32, 50);
  assert.ok(m10.multiplyVector3D(v10).equals(resV10), 'multiply vector #10');
  var i10 = new dwv.math.Index(arr00);
  var resI10 = new dwv.math.Index(resArr10);
  assert.ok(m10.multiplyIndex3D(i10).equals(resI10), 'multiply index #10');
});

/**
 * Tests for {@link dwv.math.Matrix33} multiplication.
 *
 * @function module:tests/math~Matrix33
 */
QUnit.test('Test Matrix33 multiply.', function (assert) {
  // id
  var id = dwv.math.getIdentityMat33();
  var idid = id.multiply(id);
  assert.ok(idid.equals(id), 'multiply id');

  // zero
  var m00 = new dwv.math.Matrix33([
    0, 0, 0, 0, 0, 0, 0, 0, 0
  ]);
  var m00id = m00.multiply(id);
  assert.ok(m00id.equals(m00), 'multiply #0');

  // test #10
  var m10 = new dwv.math.Matrix33([
    1, 2, 3, 4, 5, 6, 7, 8, 9
  ]);
  var m11 = new dwv.math.Matrix33([
    2, 3, 4, 5, 6, 7, 8, 9, 10
  ]);
  var m10m11 = m10.multiply(m11);
  var res10 = new dwv.math.Matrix33([
    36, 42, 48, 81, 96, 111, 126, 150, 174
  ]);
  assert.ok(m10m11.equals(res10), 'multiply #1');
});

/**
 * Tests for {@link dwv.math.Matrix33} inversion.
 *
 * @function module:tests/math~Matrix33
 */
QUnit.test('Test Matrix33 inverse.', function (assert) {
  // id
  var id = dwv.math.getIdentityMat33();
  var invid = id.getInverse();
  assert.ok(invid.equals(id), 'inverse id');

  // double inverse
  var invinvid = invid.getInverse();
  assert.ok(invinvid.equals(id), 'inverse id twice');

  // test #10
  var m10 = new dwv.math.Matrix33([
    1, 4, 5, 7, 2, 6, 8, 9, 3
  ]);
  var invm10 = m10.getInverse();
  var res10 = new dwv.math.Matrix33([
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
  var invinvm10 = invm10.getInverse();
  assert.ok(invinvm10.equals(m10, dwv.math.BIG_EPSILON), 'inverse #1 twice');
});
