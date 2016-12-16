// namespaces
var dwv = dwv || {};
dwv.tool = dwv.tool || {};
//external
var Kinetic = Kinetic || {};

/**
 * Arrow factory.
 * @constructor
 */
dwv.tool.ArrowFactory = function ()
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
 * Create an arrow shape to be displayed.
 * @param {Array} points The points from which to extract the line.
 * @param {Object} style The drawing style.
 * @param {Object} image The associated image.
 */
dwv.tool.ArrowFactory.prototype.create = function (points, style/*, image*/)
{
    // physical shape
    var line = new dwv.math.Line(points[0], points[1]);
    // draw shape
    var kshape = new Kinetic.Line({
        points: [line.getBegin().getX(), line.getBegin().getY(),
                 line.getEnd().getX(), line.getEnd().getY() ],
        stroke: style.getLineColour(),
        strokeWidth: style.getScaledStrokeWidth(),
        name: "shape"
    });
    // triangle
    var beginTy = new dwv.math.Point2D(line.getBegin().getX(), line.getBegin().getY() - 10);
    var verticalLine = new dwv.math.Line(line.getBegin(), beginTy);
    var angle = dwv.math.getAngle(line, verticalLine);
    var angleRad = angle * Math.PI / 180;
    var radius = 5;
    var kpoly = new Kinetic.RegularPolygon({
        x: line.getBegin().getX() + radius * Math.sin(angleRad),
        y: line.getBegin().getY() + radius * Math.cos(angleRad),
        sides: 3,
        radius: radius,
        rotation: -angle,
        fill: style.getLineColour(),
        strokeWidth: style.getScaledStrokeWidth(),
        name: "shape-triangle"
    });
    // quantification
    var ktext = new Kinetic.Text({
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
    var dX = line.getBegin().getX() > line.getEnd().getX() ? 0 : -1;
    var dY = line.getBegin().getY() > line.getEnd().getY() ? -1 : 0.5;
    var klabel = new Kinetic.Label({
        x: line.getEnd().getX() + dX * 25,
        y: line.getEnd().getY() + dY * 15,
        name: "label"
    });
    klabel.add(ktext);
    klabel.add(new Kinetic.Tag());

    // return group
    var group = new Kinetic.Group();
    group.name("line-group");
    group.add(kshape);
    group.add(kpoly);
    group.add(klabel);
    group.visible(true); // dont inherit
    return group;
};

/**
 * Update an arrow shape.
 * @param {Object} anchor The active anchor.
 * @param {Object} image The associated image.
 */
dwv.tool.UpdateArrow = function (anchor/*, image*/)
{
    // parent group
    var group = anchor.getParent();
    // associated shape
    var kline = group.getChildren( function (node) {
        return node.name() === 'shape';
    })[0];
    // associated triangle shape
    var ktriangle = group.getChildren( function (node) {
        return node.name() === 'shape-triangle';
    })[0];
    // associated label
    var klabel = group.getChildren( function (node) {
        return node.name() === 'label';
    })[0];
    // find special points
    var begin = group.getChildren( function (node) {
        return node.id() === 'begin';
    })[0];
    var end = group.getChildren( function (node) {
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
    // new line
    var p2d0 = new dwv.math.Point2D(begin.x(), begin.y());
    var p2d1 = new dwv.math.Point2D(end.x(), end.y());
    var line = new dwv.math.Line(p2d0, p2d1);
    // udate triangle
    var beginTy = new dwv.math.Point2D(line.getBegin().getX(), line.getBegin().getY() - 10);
    var verticalLine = new dwv.math.Line(line.getBegin(), beginTy);
    var angle = dwv.math.getAngle(line, verticalLine);
    var angleRad = angle * Math.PI / 180;
    ktriangle.x(line.getBegin().getX() + ktriangle.radius() * Math.sin(angleRad));
    ktriangle.y(line.getBegin().getY() + ktriangle.radius() * Math.cos(angleRad));
    ktriangle.rotation(-angle);
    // update text
    var ktext = klabel.getText();
    ktext.quant = null;
    ktext.setText(ktext.textExpr);
    // update position
    var dX = line.getBegin().getX() > line.getEnd().getX() ? 0 : -1;
    var dY = line.getBegin().getY() > line.getEnd().getY() ? -1 : 0.5;
    var textPos = {
        'x': line.getEnd().getX() + dX * 25,
        'y': line.getEnd().getY() + dY * 15 };
    klabel.position( textPos );
};
