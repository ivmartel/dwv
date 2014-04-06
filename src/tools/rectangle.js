/** 
 * Tool module.
 * @module tool
 */
var dwv = dwv || {};
dwv.tool = dwv.tool || {};

var Kinetic = Kinetic || {};

/**
 * Draw rectangle command.
 * @class DrawRectangleCommand
 * @namespace dwv.tool
 * @constructor
 * @param {Array} points The points from which to extract the circle.
 * @param {Object} app The application to draw the line on.
 * @param {Style} style The drawing style.
 */
dwv.tool.DrawRectangleCommand = function(points, app, style, isFinal)
{
    /**
     * Rectangle object.
     * @property rectangle
     * @private
     * @type Rectangle
     */
    var rectangle = new dwv.math.Rectangle(points[0], points[points.length-1]);
    
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
    var name = "DrawRectangleCommand";
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
        context.strokeRect( 
            rectangle.getBegin().getX(), 
            rectangle.getBegin().getY(),
            rectangle.getRealWidth(),
            rectangle.getRealHeight() );
        // length
        var surf = rectangle.getWorldSurface( 
            app.getImage().getSpacing().getColumnSpacing(), 
            app.getImage().getSpacing().getRowSpacing() );
        context.font = style.getFontStr();
        context.fillText( Math.round(surf) + "mm2",
            rectangle.getEnd().getX() + style.getFontSize(),
            rectangle.getEnd().getY() + style.getFontSize());*/
        
        var name = isFinal ? "final" : "temp";
        var krect = new Kinetic.Rect({
            x: rectangle.getBegin().getX(),
            y: rectangle.getBegin().getY(),
            width: rectangle.getWidth(),
            height: rectangle.getHeight(),
            stroke: lineColor,
            strokeWidth: 2,
            name: name
        });
        // remove temporary shapes from the layer
        var klayer = app.getKineticLayer();
        var shapes = klayer.find('.temp');
        shapes.each( function(shape) {
            shape.remove(); 
        });
        // create group
        var group = new Kinetic.Group();
        group.add(krect);
        // add the group to the layer
        app.getKineticLayer().add(group);
        app.getKineticLayer().draw();
    }; 
}; // DrawRectangleCommand class
