/**
 * Tests for the 'math/shapes.js' file.
 */
// Do not warn if these variables were not defined before.
/* global QUnit */
QUnit.module("shapes");

/**
 * Tests for {@link dwv.math.Circle}.
 * @function module:tests/math~Circle
 */
QUnit.test("Test Circle.", function (assert) {
    var center = new dwv.math.Point2D(0,0);
    var c0 = new dwv.math.Circle(center,2);
    // getCenter
    assert.equal(c0.getCenter(), center, "getCenter");
    // getRadius
    assert.equal(c0.getRadius(), 2, "getRadius");
    // getSurface
    assert.equal(c0.getSurface(), Math.PI*2*2, "getSurface");
    // equals: true
    assert.equal(c0.getWorldSurface(0.5,0.5), Math.PI, "getWorldSurface");
});

/**
 * Tests for {@link dwv.math.Ellipse}.
 * @function module:tests/math~Ellipse
 */
QUnit.test("Test Ellipse.", function (assert) {
    var center = new dwv.math.Point2D(0,0);
    var e0 = new dwv.math.Ellipse(center,2,4);
    // getCenter
    assert.equal(e0.getCenter(), center, "getCenter");
    // getA
    assert.equal(e0.getA(), 2, "getA");
    // getB
    assert.equal(e0.getB(), 4, "getB");
    // getSurface
    assert.equal(e0.getSurface(), Math.PI*2*4, "getSurface");
    // equals: true
    assert.equal(e0.getWorldSurface(0.5,0.25), Math.PI, "getWorldSurface");
});

/**
 * Tests for {@link dwv.math.Line}.
 * @function module:tests/math~Line
 */
QUnit.test("Test Line.", function (assert) {
    var p0 = new dwv.math.Point2D(0,0);
    var p1 = new dwv.math.Point2D(0,-5);
    var l0 = new dwv.math.Line(p0,p1);
    // getBegin
    assert.equal(l0.getBegin(), p0, "getBegin");
    // getEnd
    assert.equal(l0.getEnd(), p1, "getEnd");
    // getLength
    assert.equal(l0.getLength(), 5, "getLength");
    // getWorldLength
    assert.equal(l0.getWorldLength(0.5,0.5), 2.5, "getWorldLength");
    // getMidpoint
    var pMid = new dwv.math.Point2D(0,-2); // rounded...
    assert.equal(l0.getMidpoint().equals(pMid), true, "getMidpoint");
    // slope
    var p20 = new dwv.math.Point2D(1,1);
    var l10 = new dwv.math.Line(p0,p20);
    assert.equal(l10.getSlope(), 1, "getSlope");
    var p21 = new dwv.math.Point2D(1,-1);
    var l11 = new dwv.math.Line(p0,p21);
    assert.equal(l11.getSlope(), -1, "getSlope (negative)");
    var p3 = new dwv.math.Point2D(1,0);
    var l2 = new dwv.math.Line(p0,p3);
    assert.equal(l2.getSlope(), 0, "getSlope (horizontal)");
    assert.equal(l0.getSlope(), -Infinity, "getSlope (vertical)");
    // inclination
    assert.equal(l10.getInclination(), 135, "Inclination"); // 180 - 45
    assert.equal(l11.getInclination(), 225, "Inclination (negative)"); // 180 + 45
    assert.equal(l2.getInclination(), 180, "Inclination (horizontal)");
    assert.equal(l0.getInclination(), 270, "Inclination (vertical)"); // 180 + 90
    // angle
    assert.equal(dwv.math.getAngle(l10, l11), 90, "getAngle");
    var p4 = new dwv.math.Point2D(0,-1);
    var p5 = new dwv.math.Point2D(1,-1);
    var l3 = new dwv.math.Line(p4,p5);
    assert.equal(dwv.math.getAngle(l2, l3), 180, "getAngle (horizontal parallel)");
    var l4 = new dwv.math.Line(p3,p21);
    assert.equal(dwv.math.getAngle(l0, l4), 180, "getAngle (vertical parallel)");
});

/**
 * Tests for {@link dwv.math.Rectangle}.
 * @function module:tests/math~Rectangle
 */
QUnit.test("Test Rectangle.", function (assert) {
    var p0 = new dwv.math.Point2D(0,0);
    var p1 = new dwv.math.Point2D(-4,-4);
    var r0 = new dwv.math.Rectangle(p0,p1);
    // getBegin
    assert.equal(r0.getBegin().equals(p1), true, 'getBegin');
    // getEnd
    assert.equal(r0.getEnd().equals(p0), true, "getEnd");
    // getRealWidth
    assert.equal(r0.getRealWidth(), 4, "getRealWidth");
    // getRealHeight
    assert.equal(r0.getRealHeight(), 4, "getRealHeight");
    // getWidth
    assert.equal(r0.getWidth(), 4, "getWidth");
    // getHeight
    assert.equal(r0.getHeight(), 4, "getHeight");
    // getSurface
    assert.equal(r0.getSurface(), 16, "getSurface");
    // getWorldSurface
    assert.equal(r0.getWorldSurface(0.5,0.5), 4, "getWorldSurface");
});

/**
 * Tests for {@link dwv.math.ROI}.
 * @function module:tests/math~ROI
 */
QUnit.test("Test ROI.", function (assert) {
    var r0 = new dwv.math.ROI();
    // getLength
    assert.equal(r0.getLength(), 0, "getLength");
    // add a point
    var p0 = new dwv.math.Point2D(0,0);
    r0.addPoint(p0);
    // getLength
    assert.equal(r0.getLength(), 1, "getLength");
    // add another point
    var p1 = new dwv.math.Point2D(-4,-4);
    r0.addPoint(p1);
    // getPoint first
    assert.equal(r0.getPoint(0), p0, "getPoint first");
    // getPoint second
    assert.equal(r0.getPoint(1), p1, "getPoint second");
});

/**
 * Tests for {@link dwv.math.Path}.
 * @function module:tests/math~Path
 */
QUnit.test("Test Path.", function (assert) {
    var path0 = new dwv.math.Path();
    // getLength
    assert.equal(path0.getLength(), 0, "getLength");
    // add a point
    var p0 = new dwv.math.Point2D(0,0);
    path0.addPoint(p0);
    // getLength
    assert.equal(path0.getLength(), 1, "getLength");
    // add another point
    var p1 = new dwv.math.Point2D(-4,-4);
    path0.addPoint(p1);
    // getPoint first
    assert.equal(path0.getPoint(0), p0, "getPoint first");
    // getPoint second
    assert.equal(path0.getPoint(1), p1, "getPoint second");
    // add first point a control point
    path0.addControlPoint(p0);
    // check if control point
    assert.equal(path0.isControlPoint(p0), 1, "isControlPoint");
});
