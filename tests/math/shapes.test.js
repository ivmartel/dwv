/**
 * Tests for the 'math/shapes.js' file.
 */
// Do not warn if these variables were not defined before.
/* global module, test, equal */
module("shapes");

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

test("Test Circle.", function() {
    var center = new dwv.math.Point2D(0,0);
    var c0 = new dwv.math.Circle(center,2);
    // getCenter
    equal(c0.getCenter(), center, "getCenter");
    // getRadius
    equal(c0.getRadius(), 2, "getRadius");
    // getSurface
    equal(c0.getSurface(), Math.PI*2*2, "getSurface");
    // equals: true
    equal(c0.getWorldSurface(0.5,0.5), Math.PI, "getWorldSurface");
});

test("Test Ellipse.", function() {
    var center = new dwv.math.Point2D(0,0);
    var e0 = new dwv.math.Ellipse(center,2,4);
    // getCenter
    equal(e0.getCenter(), center, "getCenter");
    // getA
    equal(e0.getA(), 2, "getA");
    // getB
    equal(e0.getB(), 4, "getB");
    // getSurface
    equal(e0.getSurface(), Math.PI*2*4, "getSurface");
    // equals: true
    equal(e0.getWorldSurface(0.5,0.25), Math.PI, "getWorldSurface");
});

test("Test Line.", function() {
    var p0 = new dwv.math.Point2D(0,0);
    var p1 = new dwv.math.Point2D(0,-5);
    var l0 = new dwv.math.Line(p0,p1);
    // getBegin
    equal(l0.getBegin(), p0, "getBegin");
    // getEnd
    equal(l0.getEnd(), p1, "getEnd");
    // getLength
    equal(l0.getLength(), 5, "getLength");
    // getWorldLength
    equal(l0.getWorldLength(0.5,0.5), 2.5, "getWorldLength");
    // getMidpoint
    var pMid = new dwv.math.Point2D(0,-2); // rounded...
    equal(l0.getMidpoint().equals(pMid), true, "getMidpoint");
    // slope
    var p20 = new dwv.math.Point2D(1,1);
    var l10 = new dwv.math.Line(p0,p20);
    equal(l10.getSlope(), 1, "getSlope");
    var p21 = new dwv.math.Point2D(1,-1);
    var l11 = new dwv.math.Line(p0,p21);
    equal(l11.getSlope(), -1, "getSlope (negative)");
    var p3 = new dwv.math.Point2D(1,0);
    var l2 = new dwv.math.Line(p0,p3);
    equal(l2.getSlope(), 0, "getSlope (horizontal)");
    equal(l0.getSlope(), -Infinity, "getSlope (vertical)");
    // inclination
    equal(l10.getInclination(), 135, "Inclination"); // 180 - 45
    equal(l11.getInclination(), 225, "Inclination (negative)"); // 180 + 45
    equal(l2.getInclination(), 180, "Inclination (horizontal)");
    equal(l0.getInclination(), 270, "Inclination (vertical)"); // 180 + 90
    // angle
    equal(dwv.math.getAngle(l10, l11), 90, "getAngle");
    var p4 = new dwv.math.Point2D(0,-1);
    var p5 = new dwv.math.Point2D(1,-1);
    var l3 = new dwv.math.Line(p4,p5);
    equal(dwv.math.getAngle(l2, l3), 180, "getAngle (horizontal parallel)");
    var l4 = new dwv.math.Line(p3,p21);
    equal(dwv.math.getAngle(l0, l4), 180, "getAngle (vertical parallel)");
});

test("Test Rectangle.", function() {
    var p0 = new dwv.math.Point2D(0,0);
    var p1 = new dwv.math.Point2D(-4,-4);
    var r0 = new dwv.math.Rectangle(p0,p1);
    // getBegin
    equal(r0.getBegin().equals(p1), true, 'getBegin');
    // getEnd
    equal(r0.getEnd().equals(p0), true, "getEnd");
    // getRealWidth
    equal(r0.getRealWidth(), 4, "getRealWidth");
    // getRealHeight
    equal(r0.getRealHeight(), 4, "getRealHeight");
    // getWidth
    equal(r0.getWidth(), 4, "getWidth");
    // getHeight
    equal(r0.getHeight(), 4, "getHeight");
    // getSurface
    equal(r0.getSurface(), 16, "getSurface");
    // getWorldSurface
    equal(r0.getWorldSurface(0.5,0.5), 4, "getWorldSurface");
});

test("Test ROI.", function() {
    var r0 = new dwv.math.ROI();
    // getLength
    equal(r0.getLength(), 0, "getLength");
    // add a point
    var p0 = new dwv.math.Point2D(0,0);
    r0.addPoint(p0);
    // getLength
    equal(r0.getLength(), 1, "getLength");
    // add another point
    var p1 = new dwv.math.Point2D(-4,-4);
    r0.addPoint(p1);
    // getPoint first
    equal(r0.getPoint(0), p0, "getPoint first");
    // getPoint second
    equal(r0.getPoint(1), p1, "getPoint second");
});

test("Test Path.", function() {
    var path0 = new dwv.math.Path();
    // getLength
    equal(path0.getLength(), 0, "getLength");
    // add a point
    var p0 = new dwv.math.Point2D(0,0);
    path0.addPoint(p0);
    // getLength
    equal(path0.getLength(), 1, "getLength");
    // add another point
    var p1 = new dwv.math.Point2D(-4,-4);
    path0.addPoint(p1);
    // getPoint first
    equal(path0.getPoint(0), p0, "getPoint first");
    // getPoint second
    equal(path0.getPoint(1), p1, "getPoint second");
    // add first point a control point
    path0.addControlPoint(p0);
    // check if control point
    equal(path0.isControlPoint(p0), 1, "isControlPoint");
});

