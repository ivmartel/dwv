// namespaces
var dwv = dwv || {};
dwv.tool = dwv.tool || {};
//external
var Kinetic = Kinetic || {};

/**
 * Protractor factory.
 * @constructor
 */
dwv.tool.ProtractorFactory = function ()
{
    /**
     * Get the number of points needed to build the shape.
     * @return {Number} The number of points.
     */
    this.getNPoints = function () { return 3; };
    /**
     * Get the timeout between point storage.
     * @return {Number} The timeout in milliseconds.
     */
    this.getTimeout = function () { return 500; };
};

/**
 * Create a protractor shape to be displayed.
 * @param {Array} points The points from which to extract the protractor.
 * @param {Object} style The drawing style.
 * @param {Object} image The associated image.
 */
dwv.tool.ProtractorFactory.prototype.create = function (points, style/*, image*/)
{
    // physical shape
    var line0 = new dwv.math.Line(points[0], points[1]);
    // points stored the kineticjs way
    var pointsArray = [];
    for( var i = 0; i < points.length; ++i )
    {
        pointsArray.push( points[i].getX() );
        pointsArray.push( points[i].getY() );
    }
    // draw shape
    var kshape = new Kinetic.Line({
        points: pointsArray,
        stroke: style.getLineColour(),
        strokeWidth: style.getScaledStrokeWidth(),
        name: "shape"
    });
    var group = new Kinetic.Group();
    group.name("protractor-group");
    group.add(kshape);
    // text and decoration
    if ( points.length === 3 ) {
        var line1 = new dwv.math.Line(points[1], points[2]);
        // quantification
        var angle = dwv.math.getAngle(line0, line1);
        var inclination = line0.getInclination();
        if ( angle > 180 ) {
            angle = 360 - angle;
            inclination += angle;
        }

        // quantification
        var quant = { "angle": { "value": angle, "unit": dwv.i18n("unit.degree")} };
        var ktext = new Kinetic.Text({
            fontSize: style.getScaledFontSize(),
            fontFamily: style.getFontFamily(),
            fill: style.getLineColour(),
            name: "text"
        });
        ktext.textExpr = "{angle}";
        ktext.longText = "";
        ktext.quant = quant;
        ktext.setText(dwv.utils.replaceFlags(ktext.textExpr, ktext.quant));

        // label
        var midX = ( line0.getMidpoint().getX() + line1.getMidpoint().getX() ) / 2;
        var midY = ( line0.getMidpoint().getY() + line1.getMidpoint().getY() ) / 2;
        var klabel = new Kinetic.Label({
            x: midX,
            y: midY - 15,
            name: "label"
        });
        klabel.add(ktext);
        klabel.add(new Kinetic.Tag());

        // arc
        var radius = Math.min(line0.getLength(), line1.getLength()) * 33 / 100;
        var karc = new Kinetic.Arc({
            innerRadius: radius,
            outerRadius: radius,
            stroke: style.getLineColour(),
            strokeWidth: style.getScaledStrokeWidth(),
            angle: angle,
            rotationDeg: -inclination,
            x: points[1].getX(),
            y: points[1].getY(),
            name: "arc"
         });
        // add to group
        group.add(klabel);
        group.add(karc);
    }
    // return group
    return group;
};

/**
 * Update a protractor shape.
 * @param {Object} anchor The active anchor.
 * @param {Object} image The associated image.
 */
dwv.tool.UpdateProtractor = function (anchor/*, image*/)
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
    // associated arc
    var karc = group.getChildren( function (node) {
        return node.name() === 'arc';
    })[0];
    // find special points
    var begin = group.getChildren( function (node) {
        return node.id() === 'begin';
    })[0];
    var mid = group.getChildren( function (node) {
        return node.id() === 'mid';
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
    case 'mid':
        mid.x( anchor.x() );
        mid.y( anchor.y() );
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
    var mx = mid.x() - kline.x();
    var my = mid.y() - kline.y();
    var ex = end.x() - kline.x();
    var ey = end.y() - kline.y();
    kline.points( [bx,by,mx,my,ex,ey] );
    // update text
    var p2d0 = new dwv.math.Point2D(begin.x(), begin.y());
    var p2d1 = new dwv.math.Point2D(mid.x(), mid.y());
    var p2d2 = new dwv.math.Point2D(end.x(), end.y());
    var line0 = new dwv.math.Line(p2d0, p2d1);
    var line1 = new dwv.math.Line(p2d1, p2d2);
    var angle = dwv.math.getAngle(line0, line1);
    var inclination = line0.getInclination();
    if ( angle > 180 ) {
        angle = 360 - angle;
        inclination += angle;
    }

    // update text
    var quant = { "angle": { "value": angle, "unit": dwv.i18n("unit.degree")} };
    var ktext = klabel.getText();
    ktext.quant = quant;
    ktext.setText(dwv.utils.replaceFlags(ktext.textExpr, ktext.quant));
    // update position
    var midX = ( line0.getMidpoint().getX() + line1.getMidpoint().getX() ) / 2;
    var midY = ( line0.getMidpoint().getY() + line1.getMidpoint().getY() ) / 2;
    var textPos = { 'x': midX, 'y': midY - 15 };
    klabel.position( textPos );

    // arc
    var radius = Math.min(line0.getLength(), line1.getLength()) * 33 / 100;
    karc.innerRadius(radius);
    karc.outerRadius(radius);
    karc.angle(angle);
    karc.rotation(-inclination);
    var arcPos = { 'x': mid.x(), 'y': mid.y() };
    karc.position(arcPos);
};
