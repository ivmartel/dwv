/**
 * Tests for the 'math/point.js' file.
 */
/** @module tests/math */
// Do not warn if these variables were not defined before.
/* global QUnit */
QUnit.module("matrix");

/**
 * Tests for {@link dwv.math.Matrix33}.
 * @function module:tests/math~Matrix33
 */
QUnit.test("Test Matrix44.", function (assert) {
    var m0 = new dwv.math.getIdentityMat33();
    var m1 = new dwv.math.getIdentityMat33();
    var m2 = new dwv.math.Matrix33(
        1, 2, 3,
        4, 5, 6,
        7, 8, 9);
    var m3 = new dwv.math.Matrix33(
        1.001, 2.001, 3.001,
        4.001, 5.001, 6.001,
        7.001, 8.001, 9.001);
    var m4 = new dwv.math.Matrix33(
        1.002, 2.002, 3.002,
        4.002, 5.002, 6.002,
        7.002, 8.002, 9.002);

    // equals
    assert.equal(m0.equals(m1), true, "equals true");
    assert.equal(m0.equals(m2), false, "equals false");

    // get
    assert.equal(m2.get(0,0), 1, "get(0,0)");
    assert.equal(m2.get(0,1), 2, "get(0,1)");
    assert.equal(m2.get(0,2), 3, "get(0,2)");
    assert.equal(m2.get(1,0), 4, "get(1,0)");
    assert.equal(m2.get(1,1), 5, "get(1,1)");
    assert.equal(m2.get(1,2), 6, "get(1,2)");

    // equals with precision
    assert.equal(m3.equals(m4, 0.01), true, "equals true");
    assert.equal(m3.equals(m4, 0.001), false, "equals false");
});


