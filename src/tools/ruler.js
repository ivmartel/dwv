// namespaces
var dwv = dwv || {};
dwv.tool = dwv.tool || {};
dwv.tool.draw = dwv.tool.draw || {};
/**
 * The Konva namespace.
 *
 * @external Konva
 * @see https://konvajs.org/
 */
var Konva = Konva || {};

/**
 * Ruler factory.
 *
 * @class
 */
dwv.tool.draw.RulerFactory = function () {
  /**
   * Get the number of points needed to build the shape.
   *
   * @returns {number} The number of points.
   */
  this.getNPoints = function () {
    return 2;
  };
  /**
   * Get the timeout between point storage.
   *
   * @returns {number} The timeout in milliseconds.
   */
  this.getTimeout = function () {
    return 0;
  };
};

/**
 * Create a ruler shape to be displayed.
 *
 * @param {Array} points The points from which to extract the line.
 * @param {object} style The drawing style.
 * @param {object} image The associated image.
 * @returns {object} The Konva group.
 */
dwv.tool.draw.RulerFactory.prototype.create = function (points, style, image) {
  // physical shape
  var line = new dwv.math.Line(points[0], points[1]);
  // draw shape
  var kshape = new Konva.Line({
    points: [line.getBegin().getX(),
      line.getBegin().getY(),
      line.getEnd().getX(),
      line.getEnd().getY()],
    stroke: style.getLineColour(),
    strokeWidth: style.getScaledStrokeWidth(),
    name: 'shape'
  });

  var tickLen = 10 * style.getScaledStrokeWidth();

  // tick begin
  var linePerp0 = dwv.math.getPerpendicularLine(line, points[0], tickLen);
  var ktick0 = new Konva.Line({
    points: [linePerp0.getBegin().getX(),
      linePerp0.getBegin().getY(),
      linePerp0.getEnd().getX(),
      linePerp0.getEnd().getY()],
    stroke: style.getLineColour(),
    strokeWidth: style.getScaledStrokeWidth(),
    name: 'shape-tick0'
  });

  // tick end
  var linePerp1 = dwv.math.getPerpendicularLine(line, points[1], tickLen);
  var ktick1 = new Konva.Line({
    points: [linePerp1.getBegin().getX(),
      linePerp1.getBegin().getY(),
      linePerp1.getEnd().getX(),
      linePerp1.getEnd().getY()],
    stroke: style.getLineColour(),
    strokeWidth: style.getScaledStrokeWidth(),
    name: 'shape-tick1'
  });

  // larger hitfunc
  kshape.hitFunc(function (context) {
    context.beginPath();
    context.moveTo(linePerp0.getBegin().getX(), linePerp0.getBegin().getY());
    context.lineTo(linePerp0.getEnd().getX(), linePerp0.getEnd().getY());
    context.lineTo(linePerp1.getEnd().getX(), linePerp1.getEnd().getY());
    context.lineTo(linePerp1.getBegin().getX(), linePerp1.getBegin().getY());
    context.closePath();
    context.fillStrokeShape(this);
  });

  // quantification
  var quant = image.quantifyLine(line);
  var ktext = new Konva.Text({
    fontSize: style.getScaledFontSize(),
    fontFamily: style.getFontFamily(),
    fill: style.getLineColour(),
    name: 'text'
  });
  ktext.textExpr = '{length}';
  ktext.longText = '';
  ktext.quant = quant;
  ktext.setText(dwv.utils.replaceFlags(ktext.textExpr, ktext.quant));
  // label
  var dX = line.getBegin().getX() > line.getEnd().getX() ? 0 : -1;
  var dY = line.getBegin().getY() > line.getEnd().getY() ? -1 : 0.5;
  var klabel = new Konva.Label({
    x: line.getEnd().getX() + dX * 25,
    y: line.getEnd().getY() + dY * 15,
    name: 'label'
  });
  klabel.add(ktext);
  klabel.add(new Konva.Tag());

  // return group
  var group = new Konva.Group();
  group.name('ruler-group');
  group.add(kshape);
  group.add(ktick0);
  group.add(ktick1);
  group.add(klabel);
  group.visible(true); // dont inherit
  return group;
};

/**
 * Update a ruler shape.
 *
 * @param {object} anchor The active anchor.
 * @param {object} image The associated image.
 */
dwv.tool.draw.UpdateRuler = function (anchor, image) {
  // parent group
  var group = anchor.getParent();
  // associated shape
  var kline = group.getChildren(function (node) {
    return node.name() === 'shape';
  })[0];
    // associated tick0
  var ktick0 = group.getChildren(function (node) {
    return node.name() === 'shape-tick0';
  })[0];
    // associated tick1
  var ktick1 = group.getChildren(function (node) {
    return node.name() === 'shape-tick1';
  })[0];
    // associated label
  var klabel = group.getChildren(function (node) {
    return node.name() === 'label';
  })[0];
    // find special points
  var begin = group.getChildren(function (node) {
    return node.id() === 'begin';
  })[0];
  var end = group.getChildren(function (node) {
    return node.id() === 'end';
  })[0];
    // update special points
  switch (anchor.id()) {
  case 'begin':
    begin.x(anchor.x());
    begin.y(anchor.y());
    break;
  case 'end':
    end.x(anchor.x());
    end.y(anchor.y());
    break;
  }
  // update shape and compensate for possible drag
  // note: shape.position() and shape.size() won't work...
  var bx = begin.x() - kline.x();
  var by = begin.y() - kline.y();
  var ex = end.x() - kline.x();
  var ey = end.y() - kline.y();
  kline.points([bx, by, ex, ey]);
  // new line
  var p2d0 = new dwv.math.Point2D(begin.x(), begin.y());
  var p2d1 = new dwv.math.Point2D(end.x(), end.y());
  var line = new dwv.math.Line(p2d0, p2d1);
  // tick
  var p2b = new dwv.math.Point2D(bx, by);
  var p2e = new dwv.math.Point2D(ex, ey);
  var linePerp0 = dwv.math.getPerpendicularLine(line, p2b, 10);
  ktick0.points([linePerp0.getBegin().getX(),
    linePerp0.getBegin().getY(),
    linePerp0.getEnd().getX(),
    linePerp0.getEnd().getY()]);
  var linePerp1 = dwv.math.getPerpendicularLine(line, p2e, 10);
  ktick1.points([linePerp1.getBegin().getX(),
    linePerp1.getBegin().getY(),
    linePerp1.getEnd().getX(),
    linePerp1.getEnd().getY()]);
  // larger hitfunc
  kline.hitFunc(function (context) {
    context.beginPath();
    context.moveTo(linePerp0.getBegin().getX(), linePerp0.getBegin().getY());
    context.lineTo(linePerp0.getEnd().getX(), linePerp0.getEnd().getY());
    context.lineTo(linePerp1.getEnd().getX(), linePerp1.getEnd().getY());
    context.lineTo(linePerp1.getBegin().getX(), linePerp1.getBegin().getY());
    context.closePath();
    context.fillStrokeShape(this);
  });
  // update text
  var quant = image.quantifyLine(line);
  var ktext = klabel.getText();
  ktext.quant = quant;
  ktext.setText(dwv.utils.replaceFlags(ktext.textExpr, ktext.quant));
  // update position
  var dX = line.getBegin().getX() > line.getEnd().getX() ? 0 : -1;
  var dY = line.getBegin().getY() > line.getEnd().getY() ? -1 : 0.5;
  var textPos = {
    x: line.getEnd().getX() + dX * 25,
    y: line.getEnd().getY() + dY * 15
  };
  klabel.position(textPos);
};
