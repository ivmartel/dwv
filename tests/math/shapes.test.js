/**
 * Tests for the 'math/shapes.js' file.
 */
$(document).ready(function(){
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

});
