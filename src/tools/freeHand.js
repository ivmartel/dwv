// namespaces
var dwv = dwv || {};
/** @namespace */
dwv.tool = dwv.tool || {};
dwv.tool.draw = dwv.tool.draw || {};
// external
var Konva = Konva || {};

/**
 * FreeHand factory.
 * @constructor
 * @external Konva
 */
dwv.tool.draw.FreeHandFactory = function ()
{
    /**
     * Get the number of points needed to build the shape.
     * @return {Number} The number of points.
     */
    this.getNPoints = function () { return 1000; };
    /**
     * Get the timeout between point storage.
     * @return {Number} The timeout in milliseconds.
     */
    this.getTimeout = function () { return 25; };
};

/**
 * Create a roi shape to be displayed.
 * @param {Array} points The points from which to extract the line.
 * @param {Object} style The drawing style.
 * @param {Object} image The associated image.
 */
dwv.tool.draw.FreeHandFactory.prototype.create = function (points, style /*, image*/)
{
    // points stored the Konvajs way
    var arr = [];
    for( var i = 0; i < points.length; ++i )
    {
        arr.push( points[i].getX() );
        arr.push( points[i].getY() );
    }
    // draw shape
    var kshape = new Konva.Line({
        points: arr,
        stroke: style.getLineColour(),
        strokeWidth: style.getScaledStrokeWidth(),
        name: "shape",
        tension: 0.5
    });

    // text
    var ktext = new Konva.Text({
        fontSize: style.getScaledFontSize(),
        fontFamily: style.getFontFamily(),
        fill: style.getLineColour(),
        name: "text"
    });
    ktext.textExpr = "";
    ktext.longText = "";
    ktext.quant = null;
    ktext.setText(ktext.textExpr);

    // label
    var klabel = new Konva.Label({
        x: points[0].getX(),
        y: points[0].getY() + 10,
        name: "label"
    });
    klabel.add(ktext);
    klabel.add(new Konva.Tag());

    // return group
    var group = new Konva.Group();
    group.name("freeHand-group");
    group.add(kshape);
    group.add(klabel);
    group.visible(true); // dont inherit
    return group;
};

/**
 * Update a FreeHand shape.
 * @param {Object} anchor The active anchor.
 * @param {Object} image The associated image.
 */
dwv.tool.draw.UpdateFreeHand = function (anchor /*, image*/)
{
    // parent group
    var group = anchor.getParent();
    // associated shape
    var kline = group.getChildren( function (node) {
        return node.name() === 'shape';
    })[0];
    // associated label
    var klabel = group.getChildren( function (node) {
        return node.name() === 'label';
    })[0];

    // update self
    var point = group.getChildren( function (node) {
        return node.id() === anchor.id();
    })[0];
    point.x( anchor.x() );
    point.y( anchor.y() );
    // update the roi point and compensate for possible drag
    // (the anchor id is the index of the point in the list)
    var points = kline.points();
    points[anchor.id()] = anchor.x() - kline.x();
    points[anchor.id()+1] = anchor.y() - kline.y();
    // concat to make Konva think it is a new array
    kline.points( points.concat() );

    // update text
    var ktext = klabel.getText();
    ktext.quant = null;
    ktext.setText(dwv.utils.replaceFlags(ktext.textExpr, ktext.quant));
    // update position
    var textPos = { 'x': points[0] + kline.x(), 'y': points[1] +  kline.y() + 10 };
    klabel.position( textPos );
};
