/** 
 * Tool module.
 * @module tool
 */
var dwv = dwv || {};
dwv.tool = dwv.tool || {};
var Kinetic = Kinetic || {};

/** 
 * ROI factory.
 * @class RoiFactory
 * @namespace dwv.tool
 * @constructor
 */
dwv.tool.RoiFactory = function ()
{
    /** 
     * Get the number of points needed to build the shape.
     * @method getNPoints
     * @return {Number} The number of points.
     */
    this.getNPoints = function () { return 50; };
    /** 
     * Get the timeout between point storage.
     * @method getTimeout
     * @return {Number} The timeout in milliseconds.
     */
    this.getTimeout = function () { return 100; };
};  

/**
 * Create a roi shape to be displayed.
 * @method RoiCreator
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
    // shape
    var kline = new Kinetic.Line({
        points: arr,
        stroke: style.getLineColor(),
        strokeWidth: 2,
        name: "shape",
        closed: true
    });
    // quantification
    var ktext = new Kinetic.Text({
        x: 0,
        y: 0,
        text: "",
        fontSize: style.getFontSize(),
        fontFamily: "Verdana",
        fill: style.getLineColor(),
        name: "text"
    });
    // return shape
    return {"shape": kline, "text": ktext};
}; 

/**
 * Update a roi shape.
 * @method UpdateRoi
 * @static
 * @param {Object} kroi The line shape to update.
 * @param {Object} anchor The active anchor.
 */ 
dwv.tool.UpdateRoi = function (kroi, anchor /*, image*/)
{
    // parent group
    var group = anchor.getParent();
    // update self
    var point = group.getChildren(function(node){
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
