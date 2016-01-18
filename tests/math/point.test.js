/**
 * Tests for the 'math/point.js' file.
 */
// Do not warn if these variables were not defined before.
/* global QUnit */
QUnit.module("point");

QUnit.test("Test Point2D.", function (assert) {
    var p0 = new dwv.math.Point2D(1,2);
    // getX
    assert.equal(p0.getX(), 1, "getX");
    // getY
    assert.equal(p0.getY(), 2, "getY");
    // can't modify internal x
    p0.x = 3;
    assert.equal(p0.getX(), 1, "getX after .x");
    // can't modify internal y
    p0.y = 3;
    assert.equal(p0.getY(), 2, "getY after .y");
    // equals: true
    var p1 = new dwv.math.Point2D(1,2);
    assert.equal(p0.equals(p1), true, "equals true");
    // equals: false
    assert.equal(p0.equals(null), false, "null equals false");
    var p2 = new dwv.math.Point2D(2,1);
    assert.equal(p0.equals(p2), false, "equals false");
    // to string
    assert.equal(p0.toString(), "(1, 2)", "toString");
});

QUnit.test("Test FastPoint2D.", function (assert) {
    var p0 = new dwv.math.FastPoint2D(1,2);
    // x
    assert.equal(p0.x, 1, "x");
    // y
    assert.equal(p0.y, 2, "y");
    // can modify x
    p0.x = 3;
    assert.equal(p0.x, 3, "modified x");
    // can modify y
    p0.y = 4;
    assert.equal(p0.y, 4, "modified y");
    // equals: true
    var p1 = new dwv.math.FastPoint2D(3,4);
    assert.equal(p0.equals(p1), true, "equals true");
    // equals: false
    assert.equal(p0.equals(null), false, "null equals false");
    var p2 = new dwv.math.FastPoint2D(4,3);
    assert.equal(p0.equals(p2), false, "equals false");
    // to string
    assert.equal(p0.toString(), "(3, 4)", "toString");
});
