// namespaces
var dwv = dwv || {};
dwv.tool = dwv.tool || {};
//external
var Kinetic = Kinetic || {};

/**
 * ROI factory.
 * @constructor
 */
dwv.tool.RoiFactory = function ()
{
    /**
     * Get the number of points needed to build the shape.
     * @return {Number} The number of points.
     */
    this.getNPoints = function () { return 50; };
    /**
     * Get the timeout between point storage.
     * @return {Number} The timeout in milliseconds.
     */
    this.getTimeout = function () { return 100; };
};

/**
 * Create a roi shape to be displayed.
 * @param {Array} points The points from which to extract the line.
 * @param {Object} style The drawing style.
 * @param {Object} image The associated image.
 */
dwv.tool.RoiFactory.prototype.create = function (points, style /*, image*/)
{
    // physical shape
    var roi = new dwv.math.ROI();
    // add input points to the ROI
    roi.addPoints(points);
    // points stored the kineticjs way
    var arr = [];
    for( var i = 0; i < roi.getLength(); ++i )
    {
        arr.push( roi.getPoint(i).getX() );
        arr.push( roi.getPoint(i).getY() );
    }
    // draw shape
    var kshape = new Kinetic.Line({
        points: arr,
        stroke: style.getLineColour(),
        strokeWidth: style.getScaledStrokeWidth(),
        name: "shape",
        closed: true
    });
    // return group
    var group = new Kinetic.Group();
    group.name("roi-group");
    group.add(kshape);
    return group;
};

/**
 * Update a roi shape.
 * @param {Object} anchor The active anchor.
 * @param {Object} image The associated image.
 */
dwv.tool.UpdateRoi = function (anchor /*, image*/)
{
    // parent group
    var group = anchor.getParent();
    // associated shape
    var kroi = group.getChildren( function (node) {
        return node.name() === 'shape';
    })[0];
    // update self
    var point = group.getChildren( function (node) {
        return node.id() === anchor.id();
    })[0];
    point.x( anchor.x() );
    point.y( anchor.y() );
    // update the roi point and compensate for possible drag
    // (the anchor id is the index of the point in the list)
    var points = kroi.points();
    points[anchor.id()] = anchor.x() - kroi.x();
    points[anchor.id()+1] = anchor.y() - kroi.y();
    kroi.points( points );
};
