/** 
 * Tool module.
 * @module tool
 */
var dwv = dwv || {};
dwv.tool = dwv.tool || {};
var Kinetic = Kinetic || {};

/**
 * Create an ellipse shape to be displayed.
 * @method EllipseCreator
 * @static
 * @param {Array} points The points from which to extract the ellipse.
 * @param {Style} style The drawing style.
 */ 
dwv.tool.EllipseCreator = function (points, style)
{
    // calculate radius
    var a = Math.abs(points[0].getX() - points[points.length-1].getX());
    var b = Math.abs(points[0].getY() - points[points.length-1].getY());
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
    // hover styling
    kellipse.on('mouseover', function () {
        if ( this.getLayer() ) {
            document.body.style.cursor = 'pointer';
            this.getLayer().draw();
        }
    });
    // not hover styling
    kellipse.on('mouseout', function () {
        if ( this.getLayer() ) {
            document.body.style.cursor = 'default';
            this.getLayer().draw();
        }
    });
    // return shape
    return kellipse;
};

/**
 * Update an ellipse shape.
 * @method UpdateEllipse
 * @static
 * @param {Object} ellipse The ellipse shape to update.
 * @param {Object} anchor The active anchor.
 */ 
dwv.tool.UpdateEllipse = function (ellipse, anchor)
{
    // parent group
    var group = anchor.getParent();
    // find special points
    var topLeft = group.find('#topLeft')[0];
    var topRight = group.find('#topRight')[0];
    var bottomRight = group.find('#bottomRight')[0];
    var bottomLeft = group.find('#bottomLeft')[0];
    // update special points
    switch ( anchor.id() ) {
    case 'topLeft':
        topRight.y( anchor.y() );
        bottomLeft.x( anchor.x() );
        break;
    case 'topRight':
        topLeft.y( anchor.y() );
        bottomRight.x( anchor.x() );
        break;
    case 'bottomRight':
        bottomLeft.y( anchor.y() );
        topRight.x( anchor.x() ); 
        break;
    case 'bottomLeft':
        bottomRight.y( anchor.y() );
        topLeft.x( anchor.x() ); 
        break;
    }
    // update shape
    var radiusX = ( topRight.x() - topLeft.x() ) / 2;
    var radiusY = ( bottomRight.y() - topRight.y() ) / 2;
    var center = { x: topLeft.x() + radiusX, y: topRight.y() + radiusY };
    ellipse.setPosition( center );
    var radiusAbs = { x: Math.abs(radiusX), y: Math.abs(radiusY) };
    if ( radiusAbs ) {
        ellipse.radius( radiusAbs );
    }
};
