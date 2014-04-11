/** 
 * Tool module.
 * @module tool
 */
var dwv = dwv || {};
dwv.tool = dwv.tool || {};

var Kinetic = Kinetic || {};

/**
 * Draw circle command.
 * @class DrawCircleCommand
 * @namespace dwv.tool
 * @constructor
 * @param {Array} points The points from which to extract the circle.
 * @param {Object} app The application to draw the circle on.
 * @param {Style} style The drawing style.
 */
dwv.tool.DrawCircleCommand = function(points, app, style, isFinal)
{
    // calculate radius
    var a = Math.abs(points[0].getX() - points[points.length-1].getX());
    var b = Math.abs(points[0].getY() - points[points.length-1].getY());
    var radius = Math.round( Math.sqrt( a * a + b * b ) );
    // check zero radius
    if( radius === 0 )
    {
        // silent fail...
        return;
    }
    
    /**
     * Circle object.
     * @property circle
     * @private
     * @type Circle
     */
    var circle = new dwv.math.Circle(points[0], radius);
    
    /**
     * Line color.
     * @property lineColor
     * @private
     * @type String
     */
    var lineColor = style.getLineColor();
    /**
     * HTML context.
     * @property context
     * @private
     * @type Object
     */
    //var context = app.getTempLayer().getContext();
    
    /**
     * Command name.
     * @property name
     * @private
     * @type String
     */
    var name = "DrawCircleCommand";
    /**
     * Get the command name.
     * @method getName
     * @return {String} The command name.
     */
    this.getName = function() { return name; };
    /**
     * Set the command name.
     * @method setName
     * @param {String} str The command name.
     */
    this.setName = function(str) { name = str; };

    /**
     * Execute the command.
     * @method execute
     */
    this.execute = function()
    {
        // style
        /*context.fillStyle = lineColor;
        context.strokeStyle = lineColor;
        // path
        context.beginPath();
        context.arc(
            circle.getCenter().getX(), 
            circle.getCenter().getY(), 
            circle.getRadius(),
            0, 2*Math.PI);
        context.stroke();
        // surface
        var surf = circle.getWorldSurface( 
            app.getImage().getSpacing().getColumnSpacing(), 
            app.getImage().getSpacing().getRowSpacing() );
        context.font = style.getFontStr();
        context.fillText( Math.round(surf) + "mm2",
            circle.getCenter().getX() + style.getFontSize(),
            circle.getCenter().getY() + style.getFontSize());*/
        
        var name = isFinal ? "final" : "temp";
        var kcircle = new Kinetic.Ellipse({
            x: circle.getCenter().getX(),
            y: circle.getCenter().getY(),
            radius: { x: circle.getRadius(), y: circle.getRadius() },
            stroke: lineColor,
            strokeWidth: 2,
            name: name
        });
        // add hover styling
        kcircle.on('mouseover', function () {
            document.body.style.cursor = 'pointer';
            this.getLayer().draw();
        });
        kcircle.on('mouseout', function () {
            document.body.style.cursor = 'default';
            this.getLayer().draw();
        });
        // remove temporary shapes from the layer
        var klayer = app.getKineticLayer();
        var kshapes = klayer.find('.temp');
        kshapes.each( function (kshape) {
            kshape.remove(); 
        });
        // create group
        var kgroup = new Kinetic.Group();
        kgroup.add(kcircle);
       // add the group to the layer
        app.getKineticLayer().add(kgroup);
        app.getKineticLayer().draw();
    };
}; // DrawCircleCommand class

dwv.tool.UpdateCircle = function (circle, anchor) {
    var group = anchor.getParent();

    var topLeft = group.find('#topLeft')[0];
    var topRight = group.find('#topRight')[0];
    var bottomRight = group.find('#bottomRight')[0];
    var bottomLeft = group.find('#bottomLeft')[0];

    var anchorX = anchor.x();
    var anchorY = anchor.y();

    // update anchor positions
    switch (anchor.id()) {
    case 'topLeft':
        topRight.y(anchorY);
        bottomLeft.x(anchorX);
        break;
    case 'topRight':
        topLeft.y(anchorY);
        bottomRight.x(anchorX);
        break;
    case 'bottomRight':
        bottomLeft.y(anchorY);
        topRight.x(anchorX); 
        break;
    case 'bottomLeft':
        bottomRight.y(anchorY);
        topLeft.x(anchorX); 
        break;
    }

    // update position
    var radiusX = ( topRight.x() - topLeft.x() ) / 2;
    var radiusY = ( bottomRight.y() - topRight.y() ) / 2;
    var center = { x: topLeft.x() + radiusX, y: topRight.y() + radiusY };
    circle.setPosition( center );
    // update radius
    var radiusAbs = { x: Math.abs(radiusX), y: Math.abs(radiusY) };
    if ( radiusAbs ) {
        circle.radius( radiusAbs );
    }
};
