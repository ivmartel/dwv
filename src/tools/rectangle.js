// namespaces
var dwv = dwv || {};
dwv.tool = dwv.tool || {};
//external
var Kinetic = Kinetic || {};

/**
 * Rectangle factory.
 * @constructor
 */
dwv.tool.RectangleFactory = function ()
{
    /**
     * Get the number of points needed to build the shape.
     * @return {Number} The number of points.
     */
    this.getNPoints = function () { return 2; };
    /**
     * Get the timeout between point storage.
     * @return {Number} The timeout in milliseconds.
     */
    this.getTimeout = function () { return 0; };
};

/**
 * Create a rectangle shape to be displayed.
 * @param {Array} points The points from which to extract the rectangle.
 * @param {Object} style The drawing style.
 * @param {Object} image The associated image.
 */
dwv.tool.RectangleFactory.prototype.create = function (points, style, image)
{
    // physical shape
    var rectangle = new dwv.math.Rectangle(points[0], points[1]);
    // draw shape
    var kshape = new Kinetic.Rect({
        x: rectangle.getBegin().getX(),
        y: rectangle.getBegin().getY(),
        width: rectangle.getWidth(),
        height: rectangle.getHeight(),
        stroke: style.getLineColour(),
        strokeWidth: style.getScaledStrokeWidth(),
        name: "shape"
    });
    // quantification
    var quant = image.quantifyRect( rectangle );
    var ktext = new Kinetic.Text({
        fontSize: style.getScaledFontSize(),
        fontFamily: style.getFontFamily(),
        fill: style.getLineColour(),
        name: "text"
    });
    ktext.textExpr = "{surface}";
    ktext.longText = "";
    ktext.quant = quant;
    ktext.setText(dwv.utils.replaceFlags(ktext.textExpr, ktext.quant));

    // label
    var klabel = new Kinetic.Label({
        x: rectangle.getBegin().getX(),
        y: rectangle.getEnd().getY() + 10,
        name: "label"
    });
    klabel.add(ktext);
    klabel.add(new Kinetic.Tag());

    // return group
    var group = new Kinetic.Group();
    group.name("rectangle-group");
    group.add(kshape);
    group.add(klabel);
    group.visible(true); // dont inherit
    return group;
};

/**
 * Update a rectangle shape.
 * @param {Object} anchor The active anchor.
 * @param {Object} image The associated image.
 */
dwv.tool.UpdateRect = function (anchor, image)
{
    // parent group
    var group = anchor.getParent();
    // associated shape
    var krect = group.getChildren( function (node) {
        return node.name() === 'shape';
    })[0];
    // associated label
    var klabel = group.getChildren( function (node) {
        return node.name() === 'label';
    })[0];
    // find special points
    var topLeft = group.getChildren( function (node) {
        return node.id() === 'topLeft';
    })[0];
    var topRight = group.getChildren( function (node) {
        return node.id() === 'topRight';
    })[0];
    var bottomRight = group.getChildren( function (node) {
        return node.id() === 'bottomRight';
    })[0];
    var bottomLeft = group.getChildren( function (node) {
        return node.id() === 'bottomLeft';
    })[0];
    // update 'self' (undo case) and special points
    switch ( anchor.id() ) {
    case 'topLeft':
        topLeft.x( anchor.x() );
        topLeft.y( anchor.y() );
        topRight.y( anchor.y() );
        bottomLeft.x( anchor.x() );
        break;
    case 'topRight':
        topRight.x( anchor.x() );
        topRight.y( anchor.y() );
        topLeft.y( anchor.y() );
        bottomRight.x( anchor.x() );
        break;
    case 'bottomRight':
        bottomRight.x( anchor.x() );
        bottomRight.y( anchor.y() );
        bottomLeft.y( anchor.y() );
        topRight.x( anchor.x() );
        break;
    case 'bottomLeft':
        bottomLeft.x( anchor.x() );
        bottomLeft.y( anchor.y() );
        bottomRight.y( anchor.y() );
        topLeft.x( anchor.x() );
        break;
    default :
        console.error('Unhandled anchor id: '+anchor.id());
        break;
    }
    // update shape
    krect.position(topLeft.position());
    var width = topRight.x() - topLeft.x();
    var height = bottomLeft.y() - topLeft.y();
    if ( width && height ) {
        krect.size({'width': width, 'height': height});
    }
    // new rect
    var p2d0 = new dwv.math.Point2D(topLeft.x(), topLeft.y());
    var p2d1 = new dwv.math.Point2D(bottomRight.x(), bottomRight.y());
    var rect = new dwv.math.Rectangle(p2d0, p2d1);
    // update text
    var quant = image.quantifyRect( rect );
    var ktext = klabel.getText();
    ktext.quant = quant;
    ktext.setText(dwv.utils.replaceFlags(ktext.textExpr, ktext.quant));
    // update position
    var textPos = { 'x': rect.getBegin().getX(), 'y': rect.getEnd().getY() + 10 };
    klabel.position( textPos );
};
