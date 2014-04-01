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
dwv.tool.DrawCircleCommand = function(points, app, style)
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
        
        var canvas = app.getTempLayer().getCanvas();
        var stage = new Kinetic.Stage({
            container: 'kLayer', 
            width: canvas.width, 
            height: canvas.height
        });
        var layer = new Kinetic.Layer();

        var kcircle = new Kinetic.Circle({
            x: circle.getCenter().getX(),
            y: circle.getCenter().getY(),
            radius: circle.getRadius(),
            stroke: lineColor,
            strokeWidth: 2,
            draggable: true
        });

        // add the shape to the layer
        layer.add(kcircle);
        // add the layer to the stage
        stage.add(layer);
    };
}; // DrawCircleCommand class
