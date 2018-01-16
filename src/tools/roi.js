// namespaces
var dwv = dwv || {};
dwv.tool = dwv.tool || {};
// external
var Konva = Konva || {};

/**
 * ROI factory.
 * @constructor
 * @external Konva
 */
dwv.tool.RoiFactory = function ()
{
    /**
     * Get the number of points needed to build the shape.
     * @return {Number} The number of points.
     */
    this.getNPoints = function () { return 50; };
    /**
     * Get the timeout between point storage.
     * @return {Number} The timeout in milliseconds.
     */
    this.getTimeout = function () { return 100; };
};

/**
 * Create a roi shape to be displayed.
 * @param {Array} points The points from which to extract the line.
 * @param {Object} style The drawing style.
 * @param {Object} image The associated image.
 */
dwv.tool.RoiFactory.prototype.create = function (points, style /*, image*/)
{
    // physical shape
    var roi = new dwv.math.ROI();
    // add input points to the ROI
    roi.addPoints(points);
    // points stored the Konvajs way
    var arr = [];
    for( var i = 0; i < roi.getLength(); ++i )
    {
        arr.push( roi.getPoint(i).getX() );
        arr.push( roi.getPoint(i).getY() );
    }
    // draw shape
    var kshape = new Konva.Line({
        points: arr,
        stroke: style.getLineColour(),
        strokeWidth: style.getScaledStrokeWidth(),
        name: "shape",
        closed: true
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
    ktext.setText(dwv.utils.replaceFlags(ktext.textExpr, ktext.quant));

    // label
    var klabel = new Konva.Label({
        x: roi.getPoint(0).getX(),
        y: roi.getPoint(0).getY() + 10,
        name: "label"
    });
    klabel.add(ktext);
    klabel.add(new Konva.Tag());

    // return group
    var group = new Konva.Group();
    group.name("roi-group");
    group.add(kshape);
    group.add(klabel);
    group.visible(true); // dont inherit
    return group;
};

/**
 * Update a roi shape.
 * @param {Object} anchor The active anchor.
 * @param {Object} image The associated image.
 */
dwv.tool.UpdateRoi = function (anchor /*, image*/)
{
    // parent group
    var group = anchor.getParent();
    // associated shape
    var kroi = group.getChildren( function (node) {
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
    var points = kroi.points();
    points[anchor.id()] = anchor.x() - kroi.x();
    points[anchor.id()+1] = anchor.y() - kroi.y();
    kroi.points( points );

    // update text
    var ktext = klabel.getText();
    ktext.quant = null;
    ktext.setText(dwv.utils.replaceFlags(ktext.textExpr, ktext.quant));
    // update position
    var textPos = { 'x': points[0] + kroi.x(), 'y': points[1] +  kroi.y() + 10 };
    klabel.position( textPos );

};
