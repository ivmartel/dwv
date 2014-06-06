/** 
 * Tool module.
 * @module tool
 */
var dwv = dwv || {};
dwv.tool = dwv.tool || {};
var Kinetic = Kinetic || {};

/**
 * Create a rectangle shape to be displayed.
 * @method RectangleCreator
 * @static
 * @param {Array} points The points from which to extract the rectangle.
 * @param {Style} style The drawing style.
 */ 
dwv.tool.RectangleCreator = function (points, style)
{
    // physical shape
    var rectangle = new dwv.math.Rectangle(points[0], points[points.length-1]);
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
    // return shape
    return krect;
};

/**
 * Update a rectangle shape.
 * @method UpdateRect
 * @static
 * @param {Object} rect The rectangle shape to update.
 * @param {Object} anchor The active anchor.
 */ 
dwv.tool.UpdateRect = function (rect, anchor)
{
    // parent group
    var group = anchor.getParent();
    // find special points
    var topLeft = group.find('#topLeft')[0];
    var topRight = group.find('#topRight')[0];
    var bottomRight = group.find('#bottomRight')[0];
    var bottomLeft = group.find('#bottomLeft')[0];
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
    rect.position(topLeft.position());
    var width = topRight.x() - topLeft.x();
    var height = bottomLeft.y() - topLeft.y();
    if ( width && height ) {
        rect.size({'width': width, 'height': height});
    }
};
