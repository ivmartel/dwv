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
dwv.tool.LineCreator = function (points, style, image)
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
    // quantification
    var quant = image.quantifyLine( line );
    var str = quant.length.toPrecision(4) + " mm";
    var ktext = new Kinetic.Text({
        x: line.getEnd().getX(),
        y: line.getEnd().getY() - 15,
        text: str,
        fontSize: style.getFontSize(),
        fontFamily: "Verdana",
        fill: style.getLineColor(),
        name: "text"
    });
    // return shape
    return {"shape": kline, "text": ktext};
};

/**
 * Update a line shape.
 * @method UpdateLine
 * @static
 * @param {Object} kline The line shape to update.
 * @param {Object} anchor The active anchor.
 */ 
dwv.tool.UpdateLine = function (kline, anchor, image)
{
    // parent group
    var group = anchor.getParent();
    // find special points
    var begin = group.getChildren(function(node){
        return node.id() === 'begin';
    })[0];
    var end = group.getChildren(function(node){
        return node.id() === 'end';
    })[0];
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
    // update shape and compensate for possible drag
    // note: shape.position() and shape.size() won't work...
    var bx = begin.x() - kline.x();
    var by = begin.y() - kline.y();
    var ex = end.x() - kline.x();
    var ey = end.y() - kline.y();
    kline.points( [bx,by,ex,ey] );
    // update text
    var ktext = group.getChildren(function(node){
        return node.name() === 'text';
    })[0];
    if ( ktext ) {
        // update quantification
        var p2d0 = new dwv.math.Point2D(begin.x(), begin.y());
        var p2d1 = new dwv.math.Point2D(end.x(), end.y());
        var line = new dwv.math.Line(p2d0, p2d1);
        var quant = image.quantifyLine( line );
        var str = quant.length.toPrecision(4) + " mm";
        var textPos = { 'x': line.getEnd().getX(), 'y': line.getEnd().getY() - 15 };
        ktext.position( textPos );
        ktext.text(str);
    }
};
