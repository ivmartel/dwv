/**
 * Tests for the 'math/point.js' file.
 */
// Do not warn if these variables were not defined before.
/* global module, test, equal */
module("point");

test("Test Point2D.", function() {
    var p0 = new dwv.math.Point2D(1,2);
    // getX
    equal(p0.getX(), 1, "getX");
    // getY
    equal(p0.getY(), 2, "getY");
    // can't modify internal x
    p0.x = 3;
    equal(p0.getX(), 1, "getX after .x");
    // can't modify internal y
    p0.y = 3;
    equal(p0.getY(), 2, "getY after .y");
    // equals: true
    var p1 = new dwv.math.Point2D(1,2);
    equal(p0.equals(p1), true, "equals true");
    // equals: false
    equal(p0.equals(null), false, "null equals false");
    var p2 = new dwv.math.Point2D(2,1);
    equal(p0.equals(p2), false, "equals false");
    // to string
    equal(p0.toString(), "(1, 2)", "toString");        
});

test("Test FastPoint2D.", function() {
    var p0 = new dwv.math.FastPoint2D(1,2);
    // x
    equal(p0.x, 1, "x");
    // y
    equal(p0.y, 2, "y");
    // can modify x
    p0.x = 3;
    equal(p0.x, 3, "modified x");
    // can modify y
    p0.y = 4;
    equal(p0.y, 4, "modified y");
    // equals: true
    var p1 = new dwv.math.FastPoint2D(3,4);
    equal(p0.equals(p1), true, "equals true");
    // equals: false
    equal(p0.equals(null), false, "null equals false");
    var p2 = new dwv.math.FastPoint2D(4,3);
    equal(p0.equals(p2), false, "equals false");
    // to string
    equal(p0.toString(), "(3, 4)", "toString");        
});
