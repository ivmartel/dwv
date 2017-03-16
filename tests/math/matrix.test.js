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
        7, 8, 9 );

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
});
