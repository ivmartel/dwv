/** 
 * Tool module.
 * @module tool
 */
var dwv = dwv || {};
dwv.tool = dwv.tool || {};

var Kinetic = Kinetic || {};

/**
 * Draw ROI command.
 * @class DrawRoiCommand
 * @namespace dwv.tool
 * @constructor
 * @param {Array} points The points from which to extract the line.
 * @param {Object} app The application to draw the line on.
 * @param {Style} style The drawing style.
 */
dwv.tool.DrawRoiCommand = function(points, app, style, isFinal)
{
    /**
     * ROI object.
     * @property roi
     * @private
     * @type ROI
     */
    var roi = new dwv.math.ROI();
    
    if ( isFinal ) {
        var size = points.length;
        var clean = [];
        if ( size > 0 ) {
            clean.push( points[0] );
            var last = points[0];
            for ( var i = 1; i < size; ++i ) {
                var line = new dwv.math.Line( last, points[i] );
                if( line.getLength() > 2 ) {
                    clean.push( points[i] );
                    last = points[i];
                }
            }
            points = clean;
        }
    }
    
    
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
    //var context = app.getTempLayer().getContext();
    
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
        /*context.fillStyle = lineColor;
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
        context.stroke();*/
        var arr = [];
        for( var i = 1; i < roi.getLength(); ++i )
        {
            arr = arr.concat( roi.getPoint(i).getX() );
            arr = arr.concat( roi.getPoint(i).getY() );
        }

        var name = isFinal ? "final" : "temp";
        var kline = new Kinetic.Line({
            points: arr,
            stroke: lineColor,
            strokeWidth: 2,
            name: name,
            closed: true
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
}; // DrawRoiCommand class

dwv.tool.UpdateRoi = function (roi, anchor)
{
    // get the anchor position
    var group = anchor.getParent();
    var point = group.find('#'+anchor.id())[0];
    var px = Math.floor(point.x());
    var py = Math.floor(point.y());
    
    // update the roi points
    // (the anchor id is the index of the point in the list)
    var points = roi.points();
    points[anchor.id()] = px;
    points[anchor.id()+1] = py;
    roi.points( points );
};
