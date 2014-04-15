/** 
 * Tool module.
 * @module tool
 */
var dwv = dwv || {};
dwv.tool = dwv.tool || {};

var Kinetic = Kinetic || {};

/**
 * Draw ellpise command.
 * @class DrawEllipseCommand
 * @namespace dwv.tool
 * @constructor
 * @param {Array} points The points from which to extract the ellipse.
 * @param {Object} app The application to draw the ellipse on.
 * @param {Style} style The drawing style.
 */
dwv.tool.DrawEllipseCommand = function(points, app, style, isFinal)
{
    // calculate radius
    var a = Math.abs(points[0].getX() - points[points.length-1].getX());
    var b = Math.abs(points[0].getY() - points[points.length-1].getY());
    // check zero radius
    if ( a === 0 || b === 0 )
    {
        // silent fail...
        return;
    }
    
    /**
     * Ellipse object.
     * @property ellipse
     * @private
     * @type Ellipse
     */
    var ellipse = new dwv.math.Ellipse(points[0], a, b);
    
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
    var name = "DrawEllipseCommand";
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
            ellipse.getCenter().getX(), 
            ellipse.getCenter().getY(), 
            ellipse.getRadius(),
            0, 2*Math.PI);
        context.stroke();
        // surface
        var surf = ellipse.getWorldSurface( 
            app.getImage().getSpacing().getColumnSpacing(), 
            app.getImage().getSpacing().getRowSpacing() );
        context.font = style.getFontStr();
        context.fillText( Math.round(surf) + "mm2",
            ellipse.getCenter().getX() + style.getFontSize(),
            ellipse.getCenter().getY() + style.getFontSize());*/
        
        var name = isFinal ? "final" : "temp";
        var kellipse = new Kinetic.Ellipse({
            x: ellipse.getCenter().getX(),
            y: ellipse.getCenter().getY(),
            radius: { x: ellipse.getA(), y: ellipse.getB() },
            stroke: lineColor,
            strokeWidth: 2,
            name: name
        });
        // add hover styling
        kellipse.on('mouseover', function () {
            document.body.style.cursor = 'pointer';
            this.getLayer().draw();
        });
        kellipse.on('mouseout', function () {
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
        kgroup.add(kellipse);
       // add the group to the layer
        app.getKineticLayer().add(kgroup);
        app.getKineticLayer().draw();
    };
}; // DrawEllipseCommand class

dwv.tool.UpdateEllipse = function (ellipse, anchor) {
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
    ellipse.setPosition( center );
    // update radius
    var radiusAbs = { x: Math.abs(radiusX), y: Math.abs(radiusY) };
    if ( radiusAbs ) {
        ellipse.radius( radiusAbs );
    }
};
