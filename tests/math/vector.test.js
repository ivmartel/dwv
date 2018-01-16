/**
 * Tests for the 'math/point.js' file.
 */
/** @module tests/math */
// Do not warn if these variables were not defined before.
/* global QUnit */
QUnit.module("vector");

/**
 * Tests for {@link dwv.math.Vector3D}.
 * @function module:tests/math~Vector3D
 */
QUnit.test("Test Vector3D.", function (assert) {
    var v0 = new dwv.math.Vector3D(1,2,3);
    // getX
    assert.equal(v0.getX(), 1, "getX");
    // getY
    assert.equal(v0.getY(), 2, "getY");
    // getZ
    assert.equal(v0.getZ(), 3, "getZ");
    // can't modify internal x
    v0.x = 3;
    assert.equal(v0.getX(), 1, "getX after .x");
    // can't modify internal y
    v0.y = 3;
    assert.equal(v0.getY(), 2, "getY after .y");
    // can't modify internal z
    v0.z = 3;
    assert.equal(v0.getZ(), 3, "getZ after .z");
    // equals: true
    var v1 = new dwv.math.Vector3D(1,2,3);
    assert.equal(v0.equals(v1), true, "equals true");
    // equals: false
    assert.equal(v0.equals(null), false, "null equals false");
    var v2 = new dwv.math.Vector3D(3,2,1);
    assert.equal(v0.equals(v2), false, "equals false");
    // to string
    assert.equal(v0.toString(), "(1, 2, 3)", "toString");

    // norm
    var v10 = new dwv.math.Vector3D(1,0,0);
    assert.equal(v10.norm(), 1, "norm unit #0");
    var v11 = new dwv.math.Vector3D(0,1,0);
    assert.equal(v11.norm(), 1, "norm unit#1");
    var v12 = new dwv.math.Vector3D(0,0,1);
    assert.equal(v12.norm(), 1, "norm unit #2");

    var v13 = new dwv.math.Vector3D(1,1,0);
    assert.equal(v13.norm(), Math.sqrt(2), "norm other #0");
    var v14 = new dwv.math.Vector3D(0,1,1);
    assert.equal(v14.norm(), Math.sqrt(2), "norm other #1");
    var v15 = new dwv.math.Vector3D(1,0,1);
    assert.equal(v15.norm(), Math.sqrt(2), "norm other #2");
    var v16 = new dwv.math.Vector3D(1,1,1);
    assert.equal(v16.norm(), Math.sqrt(3), "norm other #3");
    var v17 = new dwv.math.Vector3D(1,2,3);
    assert.equal(v17.norm(), Math.sqrt(14), "norm other #4");
});

/**
 * Tests for {@link dwv.math.Vector3D}.
 * @function module:tests/math~Vector3D
 */
QUnit.test("Test Vector3D crossProduct.", function (assert) {
    // test vectors
    var v0 = new dwv.math.Vector3D(0,0,0);
    var v0x = new dwv.math.Vector3D(1,0,0);
    var v0y = new dwv.math.Vector3D(0,1,0);
    var v0my = new dwv.math.Vector3D(0,-1,0);
    var v0z = new dwv.math.Vector3D(0,0,1);
    var v0mz = new dwv.math.Vector3D(0,0,-1);

    // self cross product is zero vector
    assert.equal(v0x.crossProduct(v0x).equals(v0), true, "crossProduct self");

    // cross product of parallel vector is zero vector
    var v1x = new dwv.math.Vector3D(2,0,0);
    assert.equal(v0x.crossProduct(v1x).equals(v0), true, "crossProduct parallel #0");
    var v1y = new dwv.math.Vector3D(0,6,0);
    assert.equal(v0y.crossProduct(v1y).equals(v0), true, "crossProduct parallel #1");
    var v10 = new dwv.math.Vector3D(1,1,1);
    var v11 = new dwv.math.Vector3D(5,5,5);
    assert.equal(v10.crossProduct(v11).equals(v0), true, "crossProduct parallel #2");
    var v12 = new dwv.math.Vector3D(-5,-5,-5);
    assert.equal(v10.crossProduct(v12).equals(v0), true, "crossProduct parallel #3");

    // unit vectors
    assert.equal(v0x.crossProduct(v0y).equals(v0z), true, "crossProduct unit #0");
    // anticommutative a * b = - (b * a)
    assert.equal(v0y.crossProduct(v0x).equals(v0mz), true, "crossProduct unit #1");
    assert.equal(v0z.crossProduct(v0x).equals(v0y), true, "crossProduct unit #2");
    assert.equal(v0x.crossProduct(v0z).equals(v0my), true, "crossProduct unit #3");
});

/**
 * Tests for {@link dwv.math.Vector3D}.
 * @function module:tests/math~Vector3D
 */
QUnit.test("Test Vector3D dotProduct.", function (assert) {
    // orthogonal
    var v00 = new dwv.math.Vector3D(1,0,0);
    var v01 = new dwv.math.Vector3D(0,1,0);
    assert.equal(v00.dotProduct(v01), 0, "dotProduct orthogonal #0");
    var v02 = new dwv.math.Vector3D(0,0,1);
    assert.equal(v00.dotProduct(v02), 0, "dotProduct orthogonal #1");

    // parallel
    var v10 = new dwv.math.Vector3D(2,0,0);
    assert.equal(v00.dotProduct(v10), 2, "dotProduct parallel #0");
    var v11 = new dwv.math.Vector3D(-1,0,0);
    assert.equal(v00.dotProduct(v11), -1, "dotProduct parallel #1");

    var simiFunc = function (a,b) {
        return Math.abs(a - b) < 1e-6;
    };

    // regular
    var v20 = new dwv.math.Vector3D(1,1,0);
    var dot20 = v20.norm() * v00.norm() * Math.cos(Math.PI/4);
    assert.equal(simiFunc(v20.dotProduct(v00), dot20), true, "dotProduct regular #0");
    var v21 = new dwv.math.Vector3D(0,1,0);
    var dot21 = v20.norm() * v21.norm() * Math.cos(Math.PI/4);
    assert.equal(simiFunc(v20.dotProduct(v21), dot21), true, "dotProduct regular #1");
});
