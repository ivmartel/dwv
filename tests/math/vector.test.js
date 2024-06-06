import {Vector3D} from '../../src/math/vector';

/**
 * Tests for the 'math/point.js' file.
 */

/* global QUnit */
QUnit.module('math');

/**
 * Tests for {@link Vector3D}.
 *
 * @function module:tests/math~vector3D-class
 */
QUnit.test('Vector3D class', function (assert) {
  const v0 = new Vector3D(1, 2, 3);
  // getX
  assert.equal(v0.getX(), 1, 'getX');
  // getY
  assert.equal(v0.getY(), 2, 'getY');
  // getZ
  assert.equal(v0.getZ(), 3, 'getZ');
  // can't modify internal x
  v0.x = 3;
  assert.equal(v0.getX(), 1, 'getX after .x');
  // can't modify internal y
  v0.y = 3;
  assert.equal(v0.getY(), 2, 'getY after .y');
  // can't modify internal z
  v0.z = 3;
  assert.equal(v0.getZ(), 3, 'getZ after .z');
  // equals: true
  const v1 = new Vector3D(1, 2, 3);
  assert.equal(v0.equals(v1), true, 'equals true');
  // equals: false
  assert.equal(v0.equals(null), false, 'null equals false');
  const v2 = new Vector3D(3, 2, 1);
  assert.equal(v0.equals(v2), false, 'equals false');
  // to string
  assert.equal(v0.toString(), '(1, 2, 3)', 'toString');

  // norm
  const v10 = new Vector3D(1, 0, 0);
  assert.equal(v10.norm(), 1, 'norm unit #0');
  const v11 = new Vector3D(0, 1, 0);
  assert.equal(v11.norm(), 1, 'norm unit#1');
  const v12 = new Vector3D(0, 0, 1);
  assert.equal(v12.norm(), 1, 'norm unit #2');

  const v13 = new Vector3D(1, 1, 0);
  assert.equal(v13.norm(), Math.sqrt(2), 'norm other #0');
  const v14 = new Vector3D(0, 1, 1);
  assert.equal(v14.norm(), Math.sqrt(2), 'norm other #1');
  const v15 = new Vector3D(1, 0, 1);
  assert.equal(v15.norm(), Math.sqrt(2), 'norm other #2');
  const v16 = new Vector3D(1, 1, 1);
  assert.equal(v16.norm(), Math.sqrt(3), 'norm other #3');
  const v17 = new Vector3D(1, 2, 3);
  assert.equal(v17.norm(), Math.sqrt(14), 'norm other #4');
});

/**
 * Tests for {@link Vector3D}.
 *
 * @function module:tests/math~vector3D-crossproduct
 */
QUnit.test('Vector3D crossProduct', function (assert) {
  // test vectors
  const v0 = new Vector3D(0, 0, 0);
  const v0x = new Vector3D(1, 0, 0);
  const v0y = new Vector3D(0, 1, 0);
  const v0my = new Vector3D(0, -1, 0);
  const v0z = new Vector3D(0, 0, 1);
  const v0mz = new Vector3D(0, 0, -1);

  // self cross product is zero vector
  assert.equal(v0x.crossProduct(v0x).equals(v0), true, 'crossProduct self');

  // cross product of parallel vector is zero vector
  const v1x = new Vector3D(2, 0, 0);
  assert.equal(
    v0x.crossProduct(v1x).equals(v0),
    true,
    'crossProduct parallel #0');
  const v1y = new Vector3D(0, 6, 0);
  assert.equal(
    v0y.crossProduct(v1y).equals(v0),
    true,
    'crossProduct parallel #1');
  const v10 = new Vector3D(1, 1, 1);
  const v11 = new Vector3D(5, 5, 5);
  assert.equal(
    v10.crossProduct(v11).equals(v0),
    true,
    'crossProduct parallel #2');
  const v12 = new Vector3D(-5, -5, -5);
  assert.equal(
    v10.crossProduct(v12).equals(v0),
    true,
    'crossProduct parallel #3');

  // unit vectors
  assert.equal(v0x.crossProduct(v0y).equals(v0z), true, 'crossProduct unit #0');
  // anticommutative a * b = - (b * a)
  assert.equal(
    v0y.crossProduct(v0x).equals(v0mz),
    true,
    'crossProduct unit #1');
  assert.equal(
    v0z.crossProduct(v0x).equals(v0y),
    true,
    'crossProduct unit #2');
  assert.equal(
    v0x.crossProduct(v0z).equals(v0my),
    true,
    'crossProduct unit #3');
});

/**
 * Tests for {@link Vector3D}.
 *
 * @function module:tests/math~vector3D-dotproduct
 */
QUnit.test('Vector3D dotProduct', function (assert) {
  // orthogonal
  const v00 = new Vector3D(1, 0, 0);
  const v01 = new Vector3D(0, 1, 0);
  assert.equal(v00.dotProduct(v01), 0, 'dotProduct orthogonal #0');
  const v02 = new Vector3D(0, 0, 1);
  assert.equal(v00.dotProduct(v02), 0, 'dotProduct orthogonal #1');

  // parallel
  const v10 = new Vector3D(2, 0, 0);
  assert.equal(v00.dotProduct(v10), 2, 'dotProduct parallel #0');
  const v11 = new Vector3D(-1, 0, 0);
  assert.equal(v00.dotProduct(v11), -1, 'dotProduct parallel #1');

  const simiFunc = function (a, b) {
    return Math.abs(a - b) < 1e-6;
  };

  // regular
  const v20 = new Vector3D(1, 1, 0);
  const dot20 = v20.norm() * v00.norm() * Math.cos(Math.PI / 4);
  assert.equal(
    simiFunc(v20.dotProduct(v00), dot20),
    true,
    'dotProduct regular #0');
  const v21 = new Vector3D(0, 1, 0);
  const dot21 = v20.norm() * v21.norm() * Math.cos(Math.PI / 4);
  assert.equal(
    simiFunc(v20.dotProduct(v21), dot21),
    true,
    'dotProduct regular #1');

  // isCodirectional
  const v30 = new Vector3D(1, 0, 0);
  const tv300 = new Vector3D(2, 0, 0);
  assert.equal(v30.isCodirectional(tv300), true, 'isCodirectional #00');
  const tv301 = new Vector3D(0.1, 1, 0);
  assert.equal(v30.isCodirectional(tv301), true, 'isCodirectional #01');
  const tv302 = new Vector3D(0, 1, 0);
  assert.equal(v30.isCodirectional(tv302), false, 'isCodirectional #02');
  const tv303 = new Vector3D(-0.1, 1, 0);
  assert.equal(v30.isCodirectional(tv303), false, 'isCodirectional #03');
  const tv304 = new Vector3D(-1, 0, 0);
  assert.equal(v30.isCodirectional(tv304), false, 'isCodirectional #04');
  const tv305 = new Vector3D(-0.1, -1, 0);
  assert.equal(v30.isCodirectional(tv305), false, 'isCodirectional #05');
  const tv306 = new Vector3D(0, -1, 0);
  assert.equal(v30.isCodirectional(tv306), false, 'isCodirectional #06');
  const tv307 = new Vector3D(0.1, -1, 0);
  assert.equal(v30.isCodirectional(tv307), true, 'isCodirectional #07');

  const v31 = new Vector3D(0, 1, 0);
  const tv310 = new Vector3D(0, 2, 0);
  assert.equal(v31.isCodirectional(tv310), true, 'isCodirectional #10');
  const tv311 = new Vector3D(1, 0.1, 0);
  assert.equal(v31.isCodirectional(tv311), true, 'isCodirectional #11');
  const tv312 = new Vector3D(1, 0, 0);
  assert.equal(v31.isCodirectional(tv312), false, 'isCodirectional #12');
  const tv313 = new Vector3D(1, -0.1, 0);
  assert.equal(v31.isCodirectional(tv313), false, 'isCodirectional #13');
  const tv314 = new Vector3D(0, -1, 0);
  assert.equal(v31.isCodirectional(tv314), false, 'isCodirectional #14');
  const tv315 = new Vector3D(-1, -0.1, 0);
  assert.equal(v31.isCodirectional(tv315), false, 'isCodirectional #15');
  const tv316 = new Vector3D(-1, 0, 0);
  assert.equal(v31.isCodirectional(tv316), false, 'isCodirectional #16');
  const tv317 = new Vector3D(-1, 0.1, 0);
  assert.equal(v31.isCodirectional(tv317), true, 'isCodirectional #17');

  const v32 = new Vector3D(0, 0, 1);
  const tv320 = new Vector3D(0, 0, 2);
  assert.equal(v32.isCodirectional(tv320), true, 'isCodirectional #20');
  const tv321 = new Vector3D(1, 0, 0.1);
  assert.equal(v32.isCodirectional(tv321), true, 'isCodirectional #21');
  const tv322 = new Vector3D(1, 0, 0);
  assert.equal(v32.isCodirectional(tv322), false, 'isCodirectional #22');
  const tv323 = new Vector3D(1, 0, -0.1);
  assert.equal(v32.isCodirectional(tv323), false, 'isCodirectional #23');
  const tv324 = new Vector3D(0, 0, -1);
  assert.equal(v32.isCodirectional(tv324), false, 'isCodirectional #24');
  const tv325 = new Vector3D(-1, 0, -0.1);
  assert.equal(v32.isCodirectional(tv325), false, 'isCodirectional #25');
  const tv326 = new Vector3D(-1, 0, 0);
  assert.equal(v32.isCodirectional(tv326), false, 'isCodirectional #26');
  const tv327 = new Vector3D(-1, 0, 0.1);
  assert.equal(v32.isCodirectional(tv327), true, 'isCodirectional #27');
});
