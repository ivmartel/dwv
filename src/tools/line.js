/** 
 * Tool module.
 * @module tool
 */
var dwv = dwv || {};
dwv.tool = dwv.tool || {};
var Kinetic = Kinetic || {};

/**
 * Create a line shape to be displayed.
 * @method LineCreator
 * @static
 * @param {Array} points The points from which to extract the line.
 * @param {Style} style The drawing style.
 */ 
dwv.tool.LineCreator = function (points, style)
{
    // physical object
    var line = new dwv.math.Line(points[0], points[points.length-1]);
    // shape
    var kline = new Kinetic.Line({
        points: [line.getBegin().getX(), line.getBegin().getY(), 
                 line.getEnd().getX(), line.getEnd().getY() ],
        stroke: style.getLineColor(),
        strokeWidth: 2,
        name: "shape"
    });
    // return shape
    return kline;
};

/**
 * Update a line shape.
 * @method UpdateLine
 * @static
 * @param {Object} line The line shape to update.
 * @param {Object} anchor The active anchor.
 */ 
dwv.tool.UpdateLine = function (line, anchor)
{
    // parent group
    var group = anchor.getParent();
    // find special points
    var begin = group.find('#begin')[0];
    var end = group.find('#end')[0];
    // update special points
    switch ( anchor.id() ) {
    case 'begin':
        begin.x( anchor.x() );
        begin.y( anchor.y() );
        break;
    case 'end':
        end.x( anchor.x() );
        end.y( anchor.y() );
        break;
    }
    // update shape
    // shape.position() and shape.size() won't work...
    var bx = begin.x() - line.x();
    var by = begin.y() - line.y();
    var ex = end.x() - line.x();
    var ey = end.y() - line.y();
    line.points( [bx,by,ex,ey] );
};
