/** 
 * Tool module.
 * @module tool
 */
var dwv = dwv || {};
dwv.tool = dwv.tool || {};
var Kinetic = Kinetic || {};

/** 
 * Rectangle factory.
 * @class RectangleFactory
 * @namespace dwv.tool
 * @constructor
 */
dwv.tool.RectangleFactory = function ()
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
 * Create a rectangle shape to be displayed.
 * @method create
 * @param {Array} points The points from which to extract the rectangle.
 * @param {Object} style The drawing style.
 * @param {Object} image The associated image.
 */ 
dwv.tool.RectangleFactory.prototype.create = function (points, style, image)
{
    // physical shape
    var rectangle = new dwv.math.Rectangle(points[0], points[1]);
    // shape
    var krect = new Kinetic.Rect({
        x: rectangle.getBegin().getX(),
        y: rectangle.getBegin().getY(),
        width: rectangle.getWidth(),
        height: rectangle.getHeight(),
        stroke: style.getLineColor(),
        strokeWidth: 2,
        name: "shape"
    });
    // quantification
    var quant = image.quantifyRect( rectangle );
    var cm2 = quant.surface / 100;
    var str = cm2.toPrecision(4) + " cm2";
    var ktext = new Kinetic.Text({
        x: rectangle.getBegin().getX(),
        y: rectangle.getEnd().getY() + 10,
        text: str,
        fontSize: style.getFontSize(),
        fontFamily: "Verdana",
        fill: style.getLineColor(),
        name: "text"
    });
    // return shape
    return {"shape": krect, "text": ktext};
};

/**
 * Update a rectangle shape.
 * @method UpdateRect
 * @static
 * @param {Object} krect The rectangle shape to update.
 * @param {Object} anchor The active anchor.
 */ 
dwv.tool.UpdateRect = function (krect, anchor, image)
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
    krect.position(topLeft.position());
    var width = topRight.x() - topLeft.x();
    var height = bottomLeft.y() - topLeft.y();
    if ( width && height ) {
        krect.size({'width': width, 'height': height});
    }
    // update text
    var ktext = group.getChildren(function(node){
        return node.name() === 'text';
    })[0];
    if ( ktext ) {
        var p2d0 = new dwv.math.Point2D(topLeft.x(), topLeft.y());
        var p2d1 = new dwv.math.Point2D(bottomRight.x(), bottomRight.y());
        var rect = new dwv.math.Rectangle(p2d0, p2d1);
        var quant = image.quantifyRect( rect );
        var cm2 = quant.surface / 100;
        var str = cm2.toPrecision(4) + " cm2";
        var textPos = { 'x': rect.getBegin().getX(), 'y': rect.getEnd().getY() + 10 };
        ktext.position(textPos);
        ktext.text(str);
    }
};
