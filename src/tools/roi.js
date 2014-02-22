/** 
 * Tool module.
 * @module tool
 */
var dwv = dwv || {};
dwv.tool = dwv.tool || {};

/**
 * Draw ROI command.
 * @class DrawRoiCommand
 * @namespace dwv.tool
 * @constructor
 * @param {Array} points The points from which to extract the line.
 * @param {Object} app The application to draw the line on.
 * @param {Style} style The drawing style.
 */
dwv.tool.DrawRoiCommand = function(points, app, style)
{
    /**
     * ROI object.
     * @property roi
     * @private
     * @type ROI
     */
    var roi = new dwv.math.ROI();
    
    // add input points to the ROI
    roi.addPoints(points);

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
    var context = app.getTempLayer().getContext();
    
    /**
     * Command name.
     * @property name
     * @private
     * @type String
     */
    var name = "DrawRoiCommand";
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
        context.fillStyle = lineColor;
        context.strokeStyle = lineColor;
        // path
        context.beginPath();
        context.moveTo(
            roi.getPoint(0).getX(), 
            roi.getPoint(0).getY());
        for( var i = 1; i < roi.getLength(); ++i )
        {
            context.lineTo(
                roi.getPoint(i).getX(), 
                roi.getPoint(i).getY());
            context.stroke();
        }
        context.closePath();
        context.stroke();
    }; 
}; // DrawRoiCommand class
