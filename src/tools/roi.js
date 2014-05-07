/** 
 * Tool module.
 * @module tool
 */
var dwv = dwv || {};
dwv.tool = dwv.tool || {};
var Kinetic = Kinetic || {};

/**
 * Create a roi shape to be displayed.
 * @method RoiCreator
 * @static
 * @param {Array} points The points from which to extract the line.
 * @param {Style} style The drawing style.
 * @param {Boolean} isFinal Flag to know if final or temporary shape.
 */ 
dwv.tool.RoiCreator = function (points, style, isFinal)
{
    // physical shape
    var roi = new dwv.math.ROI();
    // sample points so that they are not too close 
    // to one another
    if ( isFinal ) {
        var size = points.length;
        var clean = [];
        if ( size > 0 ) {
            clean.push( points[0] );
            var last = points[0];
            for ( var j = 1; j < size; ++j ) {
                var line = new dwv.math.Line( last, points[j] );
                if( line.getLength() > 2 ) {
                    clean.push( points[j] );
                    last = points[j];
                }
            }
            points = clean;
        }
    }
    // add input points to the ROI
    roi.addPoints(points);
    // points stored the kineticjs way
    var arr = [];
    for( var i = 1; i < roi.getLength(); ++i )
    {
        arr = arr.concat( roi.getPoint(i).getX() );
        arr = arr.concat( roi.getPoint(i).getY() );
    }
    // shape
    var kline = new Kinetic.Line({
        points: arr,
        stroke: style.getLineColor(),
        strokeWidth: 2,
        name: ( isFinal ? "final" : "temp" ),
        closed: true
    });
    // hover styling
    kline.on('mouseover', function () {
        if ( this.getLayer() ) {
            document.body.style.cursor = 'pointer';
            this.getLayer().draw();
        }
    });
    // not hover styling
    kline.on('mouseout', function () {
        if ( this.getLayer() ) {
            document.body.style.cursor = 'default';
            this.getLayer().draw();
        }
    });
    // return shape
    return kline;
}; 

/**
 * Update a roi shape.
 * @method UpdateRoi
 * @static
 * @param {Object} line The line shape to update.
 * @param {Object} anchor The active anchor.
 */ 
dwv.tool.UpdateRoi = function (roi, anchor)
{
    // parent group
    var group = anchor.getParent();
    // find special point
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
