/** 
 * Tool module.
 * @module tool
 */
var dwv = dwv || {};
dwv.tool = dwv.tool || {};
var Kinetic = Kinetic || {};

/** 
 * Ellipse factory.
 * @class EllipseFactory
 * @namespace dwv.tool
 * @constructor
 */
dwv.tool.EllipseFactory = function ()
{
    /** 
     * Get the number of points needed to build the shape.
     * @method getNPoints
     * @return {Number} The number of points.
     */
    this.getNPoints = function () { return 2; };
    /** 
     * Get the timeout between point storage.
     * @method getTimeout
     * @return {Number} The timeout in milliseconds.
     */
    this.getTimeout = function () { return 0; };
};  

/**
 * Create an ellipse shape to be displayed.
 * @method create
 * @param {Array} points The points from which to extract the ellipse.
 * @param {Object} style The drawing style.
 * @param {Object} image The associated image.
 */ 
dwv.tool.EllipseFactory.prototype.create = function (points, style, image)
{
    // calculate radius
    var a = Math.abs(points[0].getX() - points[1].getX());
    var b = Math.abs(points[0].getY() - points[1].getY());
    // physical object
    var ellipse = new dwv.math.Ellipse(points[0], a, b);
    // shape
    var kellipse = new Kinetic.Ellipse({
        x: ellipse.getCenter().getX(),
        y: ellipse.getCenter().getY(),
        radius: { x: ellipse.getA(), y: ellipse.getB() },
        stroke: style.getLineColor(),
        strokeWidth: 2,
        name: "shape"
    });
    // quantification
    var quant = image.quantifyEllipse( ellipse );
    var cm2 = quant.surface / 100;
    var str = cm2.toPrecision(4) + " cm2";
    var ktext = new Kinetic.Text({
        x: ellipse.getCenter().getX(),
        y: ellipse.getCenter().getY(),
        text: str,
        fontSize: style.getFontSize(),
        fontFamily: "Verdana",
        fill: style.getLineColor(),
        name: "text"
    });
    // return shape
    return {"shape": kellipse, "text": ktext};
};

/**
 * Update an ellipse shape.
 * @method UpdateEllipse
 * @static
 * @param {Object} kellipse The ellipse shape to update.
 * @param {Object} anchor The active anchor.
 */ 
dwv.tool.UpdateEllipse = function (kellipse, anchor, image)
{
    // parent group
    var group = anchor.getParent();
    // find special points
    var topLeft = group.getChildren(function(node){
        return node.id() === 'topLeft';
    })[0];
    var topRight = group.getChildren(function(node){
        return node.id() === 'topRight';
    })[0];
    var bottomRight = group.getChildren(function(node){
        return node.id() === 'bottomRight';
    })[0];
    var bottomLeft = group.getChildren(function(node){
        return node.id() === 'bottomLeft';
    })[0];
    // update 'self' (undo case) and special points
    switch ( anchor.id() ) {
    case 'topLeft':
        topLeft.x( anchor.x() );
        topLeft.y( anchor.y() );
        topRight.y( anchor.y() );
        bottomLeft.x( anchor.x() );
        break;
    case 'topRight':
        topRight.x( anchor.x() );
        topRight.y( anchor.y() );
        topLeft.y( anchor.y() );
        bottomRight.x( anchor.x() );
        break;
    case 'bottomRight':
        bottomRight.x( anchor.x() );
        bottomRight.y( anchor.y() );
        bottomLeft.y( anchor.y() );
        topRight.x( anchor.x() ); 
        break;
    case 'bottomLeft':
        bottomLeft.x( anchor.x() );
        bottomLeft.y( anchor.y() );
        bottomRight.y( anchor.y() );
        topLeft.x( anchor.x() ); 
        break;
    default :
        console.error('Unhandled anchor id: '+anchor.id());
        break;
    }
    // update shape
    var radiusX = ( topRight.x() - topLeft.x() ) / 2;
    var radiusY = ( bottomRight.y() - topRight.y() ) / 2;
    var center = { 'x': topLeft.x() + radiusX, 'y': topRight.y() + radiusY };
    kellipse.position( center );
    var radiusAbs = { 'x': Math.abs(radiusX), 'y': Math.abs(radiusY) };
    if ( radiusAbs ) {
        kellipse.radius( radiusAbs );
    }
    // update text
    var ktext = group.getChildren(function(node){
        return node.name() === 'text';
    })[0];
    if ( ktext ) {
        var ellipse = new dwv.math.Ellipse(center, radiusX, radiusY);
        var quant = image.quantifyEllipse( ellipse );
        var cm2 = quant.surface / 100;
        var str = cm2.toPrecision(4) + " cm2";
        var textPos = { 'x': center.x, 'y': center.y };
        ktext.position(textPos);
        ktext.text(str);
    }
};
