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
 * @param {Array} points The points from which to extract the rectangle.
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
        // add hover styling
        krect.on('mouseover', function () {
            if ( this.getLayer() ) {
                document.body.style.cursor = 'pointer';
                this.getLayer().draw();
            }
        });
        krect.on('mouseout', function () {
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
        kgroup.add(krect);
        // add the group to the layer
        app.getKineticLayer().add(kgroup);
        app.getKineticLayer().draw();
    }; 
}; // DrawRectangleCommand class

dwv.tool.UpdateRect = function (rect, anchor)
{
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
    rect.setPosition(topLeft.getPosition());
    // update size
    var width = topRight.x() - topLeft.x();
    var height = bottomLeft.y() - topLeft.y();
    if ( width && height ) {
        rect.setSize({width:width, height: height});
    }
};