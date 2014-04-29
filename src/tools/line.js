/** 
 * Tool module.
 * @module tool
 */
var dwv = dwv || {};
dwv.tool = dwv.tool || {};

var Kinetic = Kinetic || {};

/**
 * Draw line command.
 * @class DrawLineCommand
 * @namespace dwv.tool
 * @constructor
 * @param {Array} points The points from which to extract the line.
 * @param {Object} app The application to draw the line on.
 * @param {Style} style The drawing style.
 */
dwv.tool.DrawLineCommand = function(points, app, style, isFinal)
{
    /**
     * Line object.
     * @property line
     * @private
     * @type Line
     */
    var line = new dwv.math.Line(points[0], points[points.length-1]);
    
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
    var name = "DrawLineCommand";
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
        context.moveTo( line.getBegin().getX(), line.getBegin().getY());
        context.lineTo( line.getEnd().getX(), line.getEnd().getY());
        context.stroke();
        context.closePath();
        // length
        var length = line.getWorldLength( 
            app.getImage().getSpacing().getColumnSpacing(), 
            app.getImage().getSpacing().getRowSpacing() );
        context.font = style.getFontStr();
        context.fillText( Math.round(length) + "mm",
            line.getEnd().getX() + style.getFontSize(),
            line.getEnd().getY() + style.getFontSize());*/
        
        var name = isFinal ? "final" : "temp";
        var kline = new Kinetic.Line({
            points: [line.getBegin().getX(), line.getBegin().getY(), 
                     line.getEnd().getX(), line.getEnd().getY() ],
            stroke: lineColor,
            strokeWidth: 2,
            name: name
        });
        // add hover styling
        kline.on('mouseover', function () {
            if ( this.getLayer() ) {
                document.body.style.cursor = 'pointer';
                this.getLayer().draw();
            }
        });
        kline.on('mouseout', function () {
            if ( this.getLayer() ) {
                document.body.style.cursor = 'default';
                this.getLayer().draw();
            }
        });
        // remove temporary shapes from the layer
        var klayer = app.getKineticLayer();
        var kshapes = klayer.find('.temp');
        kshapes.each( function (kshape) {
            kshape.remove(); 
        });
        // create group
        var kgroup = new Kinetic.Group();
        kgroup.add(kline);
       // add the group to the layer
        app.getKineticLayer().add(kgroup);
        app.getKineticLayer().draw();

    }; 
}; // DrawLineCommand class

dwv.tool.UpdateLine = function (line, anchor)
{
    var group = anchor.getParent();
    
    var begin = group.find('#begin')[0];
    var end = group.find('#end')[0];
    
    var anchorX = anchor.x();
    var anchorY = anchor.y();
    
    // update anchor positions
    switch (anchor.id()) {
    case 'begin':
        begin.x( anchorX );
        begin.y( anchorY );
        break;
    case 'end':
        end.x( anchorX );
        end.y( anchorY );
        break;
    }
    
    line.points([begin.x(), begin.y(), end.x(), end.y()]);
};
