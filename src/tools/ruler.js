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
 * Default draw label text.
 */
dwv.tool.draw.defaultRulerLabelText = '{length}';

/**
 * Ruler factory.
 *
 * @class
 */
dwv.tool.draw.RulerFactory = function () {
  /**
   * Get the name of the shape group.
   *
   * @returns {string} The name.
   */
  this.getGroupName = function () {
    return 'ruler-group';
  };
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
 * Is the input group a group of this factory?
 *
 * @param {object} group The group to test.
 * @returns {boolean} True if the group is from this fcatory.
 */
dwv.tool.draw.RulerFactory.prototype.isFactoryGroup = function (group) {
  return this.getGroupName() === group.name();
};

/**
 * Create a ruler shape to be displayed.
 *
 * @param {Array} points The points from which to extract the line.
 * @param {object} style The drawing style.
 * @param {object} viewController The associated view controller.
 * @returns {object} The Konva group.
 */
dwv.tool.draw.RulerFactory.prototype.create = function (
  points, style, viewController) {
  // physical shape
  var line = new dwv.math.Line(points[0], points[1]);
  // draw shape
  var kshape = new Konva.Line({
    points: [line.getBegin().getX(),
      line.getBegin().getY(),
      line.getEnd().getX(),
      line.getEnd().getY()],
    stroke: style.getLineColour(),
    strokeWidth: style.getStrokeWidth(),
    strokeScaleEnabled: false,
    name: 'shape'
  });

  var tickLen = style.scale(10);

  // tick begin
  var linePerp0 = dwv.math.getPerpendicularLine(line, points[0], tickLen);
  var ktick0 = new Konva.Line({
    points: [linePerp0.getBegin().getX(),
      linePerp0.getBegin().getY(),
      linePerp0.getEnd().getX(),
      linePerp0.getEnd().getY()],
    stroke: style.getLineColour(),
    strokeWidth: style.getStrokeWidth(),
    strokeScaleEnabled: false,
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
    strokeWidth: style.getStrokeWidth(),
    strokeScaleEnabled: false,
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
  var ktext = new Konva.Text({
    fontSize: style.getScaledFontSize(),
    fontFamily: style.getFontFamily(),
    fill: style.getLineColour(),
    name: 'text'
  });
  var textExpr = '';
  if (typeof dwv.tool.draw.rulerLabelText !== 'undefined') {
    textExpr = dwv.tool.draw.rulerLabelText;
  } else {
    textExpr = dwv.tool.draw.defaultRulerLabelText;
  }
  var quant = line.quantify(
    viewController,
    dwv.utils.getFlags(textExpr));
  ktext.setText(dwv.utils.replaceFlags(textExpr, quant));
  // meta data
  ktext.meta = {
    textExpr: textExpr,
    quantification: quant
  };

  // label
  var dX = line.getBegin().getX() > line.getEnd().getX() ? 0 : -1;
  var dY = line.getBegin().getY() > line.getEnd().getY() ? -1 : 0.5;
  var klabel = new Konva.Label({
    x: line.getEnd().getX() + dX * ktext.width(),
    y: line.getEnd().getY() + dY * style.scale(15),
    name: 'label'
  });
  klabel.add(ktext);
  klabel.add(new Konva.Tag());

  // return group
  var group = new Konva.Group();
  group.name(this.getGroupName());
  group.add(klabel);
  group.add(ktick0);
  group.add(ktick1);
  group.add(kshape);
  group.visible(true); // dont inherit
  return group;
};

/**
 * Get anchors to update a ruler shape.
 *
 * @param {object} shape The associated shape.
 * @param {object} style The application style.
 * @param {number} scale The application scale.
 * @returns {Array} A list of anchors.
 */
dwv.tool.draw.RulerFactory.prototype.getAnchors = function (
  shape, style, scale) {
  var points = shape.points();

  var anchors = [];
  anchors.push(dwv.tool.draw.getDefaultAnchor(
    points[0] + shape.x(), points[1] + shape.y(), 'begin', style, scale
  ));
  anchors.push(dwv.tool.draw.getDefaultAnchor(
    points[2] + shape.x(), points[3] + shape.y(), 'end', style, scale
  ));
  return anchors;
};

/**
 * Update a ruler shape.
 * Warning: do NOT use 'this' here, this method is passed
 *   as is to the change command.
 *
 * @param {object} anchor The active anchor.
 * @param {object} style The app style.
 * @param {object} viewController The associated view controller.
 */
dwv.tool.draw.RulerFactory.prototype.update = function (
  anchor, style, viewController) {
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
  var linePerp0 = dwv.math.getPerpendicularLine(line, p2b, style.scale(10));
  ktick0.points([linePerp0.getBegin().getX(),
    linePerp0.getBegin().getY(),
    linePerp0.getEnd().getX(),
    linePerp0.getEnd().getY()]);
  var linePerp1 = dwv.math.getPerpendicularLine(line, p2e, style.scale(10));
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
  var ktext = klabel.getText();
  var quantification = line.quantify(
    viewController,
    dwv.utils.getFlags(ktext.meta.textExpr));
  ktext.setText(dwv.utils.replaceFlags(ktext.meta.textExpr, quantification));
  // update meta
  ktext.meta.quantification = quantification;
  // update position
  var dX = line.getBegin().getX() > line.getEnd().getX() ? 0 : -1;
  var dY = line.getBegin().getY() > line.getEnd().getY() ? -1 : 0.5;
  var textPos = {
    x: line.getEnd().getX() + dX * ktext.width(),
    y: line.getEnd().getY() + dY * style.scale(15)
  };
  klabel.position(textPos);
};
