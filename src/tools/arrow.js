// namespaces
var dwv = dwv || {};
/** @namespace */
dwv.tool = dwv.tool || {};
/** @namespace */
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
dwv.tool.draw.defaultArrowLabelText = '';

/**
 * Arrow factory.
 *
 * @class
 */
dwv.tool.draw.ArrowFactory = function () {
  /**
   * Get the name of the shape group.
   *
   * @returns {string} The name.
   */
  this.getGroupName = function () {
    return 'line-group';
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
dwv.tool.draw.ArrowFactory.prototype.isFactoryGroup = function (group) {
  return this.getGroupName() === group.name();
};

/**
 * Create an arrow shape to be displayed.
 *
 * @param {Array} points The points from which to extract the line.
 * @param {object} style The drawing style.
 * @param {object} _viewController The associated view controller.
 * @returns {object} The Konva object.
 */
dwv.tool.draw.ArrowFactory.prototype.create = function (
  points, style, _viewController) {
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
  // larger hitfunc
  var linePerp0 = dwv.math.getPerpendicularLine(
    line, points[0], style.scale(10));
  var linePerp1 = dwv.math.getPerpendicularLine(
    line, points[1], style.scale(10));
  kshape.hitFunc(function (context) {
    context.beginPath();
    context.moveTo(linePerp0.getBegin().getX(), linePerp0.getBegin().getY());
    context.lineTo(linePerp0.getEnd().getX(), linePerp0.getEnd().getY());
    context.lineTo(linePerp1.getEnd().getX(), linePerp1.getEnd().getY());
    context.lineTo(linePerp1.getBegin().getX(), linePerp1.getBegin().getY());
    context.closePath();
    context.fillStrokeShape(this);
  });
  // triangle
  var beginTy = new dwv.math.Point2D(
    line.getBegin().getX(),
    line.getBegin().getY() - 10);
  var verticalLine = new dwv.math.Line(line.getBegin(), beginTy);
  var angle = dwv.math.getAngle(line, verticalLine);
  var angleRad = angle * Math.PI / 180;
  var radius = 5 * style.getScaledStrokeWidth();
  var kpoly = new Konva.RegularPolygon({
    x: line.getBegin().getX() + radius * Math.sin(angleRad),
    y: line.getBegin().getY() + radius * Math.cos(angleRad),
    sides: 3,
    radius: radius,
    rotation: -angle,
    fill: style.getLineColour(),
    strokeWidth: style.getStrokeWidth(),
    strokeScaleEnabled: false,
    name: 'shape-triangle'
  });
  // quantification
  var ktext = new Konva.Text({
    fontSize: style.getFontSize(),
    fontFamily: style.getFontFamily(),
    fill: style.getLineColour(),
    padding: style.getTextPadding(),
    shadowColor: style.getShadowLineColour(),
    shadowOffset: style.getShadowOffset(),
    name: 'text'
  });
  var textExpr = '';
  if (typeof dwv.tool.draw.arrowLabelText !== 'undefined') {
    textExpr = dwv.tool.draw.arrowLabelText;
  } else {
    textExpr = dwv.tool.draw.defaultArrowLabelText;
  }
  ktext.setText(textExpr);
  // meta data
  ktext.meta = {
    textExpr: textExpr,
    quantification: {}
  };
  // label
  var dX = line.getBegin().getX() > line.getEnd().getX() ? 0 : -1;
  var dY = line.getBegin().getY() > line.getEnd().getY() ? -1 : 0;
  var klabel = new Konva.Label({
    x: line.getEnd().getX() + dX * ktext.width(),
    y: line.getEnd().getY() + dY * style.applyZoomScale(15).y,
    scale: style.applyZoomScale(1),
    name: 'label'
  });
  klabel.add(ktext);
  klabel.add(new Konva.Tag());

  // return group
  var group = new Konva.Group();
  group.name(this.getGroupName());
  group.add(klabel);
  group.add(kpoly);
  group.add(kshape);
  group.visible(true); // dont inherit
  return group;
};

/**
 * Get anchors to update an arrow shape.
 *
 * @param {object} shape The associated shape.
 * @param {object} style The application style.
 * @returns {Array} A list of anchors.
 */
dwv.tool.draw.ArrowFactory.prototype.getAnchors = function (shape, style) {
  var points = shape.points();

  var anchors = [];
  anchors.push(dwv.tool.draw.getDefaultAnchor(
    points[0] + shape.x(), points[1] + shape.y(), 'begin', style
  ));
  anchors.push(dwv.tool.draw.getDefaultAnchor(
    points[2] + shape.x(), points[3] + shape.y(), 'end', style
  ));
  return anchors;
};

/**
 * Update an arrow shape.
 * Warning: do NOT use 'this' here, this method is passed
 *   as is to the change command.
 *
 * @param {object} anchor The active anchor.
 * @param {object} style The app style.
 * @param {object} _viewController The associated view controller.
 */
dwv.tool.draw.ArrowFactory.prototype.update = function (
  anchor, style, _viewController) {
  // parent group
  var group = anchor.getParent();
  // associated shape
  var kline = group.getChildren(function (node) {
    return node.name() === 'shape';
  })[0];
    // associated triangle shape
  var ktriangle = group.getChildren(function (node) {
    return node.name() === 'shape-triangle';
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
  // larger hitfunc
  var p2b = new dwv.math.Point2D(bx, by);
  var p2e = new dwv.math.Point2D(ex, ey);
  var linePerp0 = dwv.math.getPerpendicularLine(line, p2b, 10);
  var linePerp1 = dwv.math.getPerpendicularLine(line, p2e, 10);
  kline.hitFunc(function (context) {
    context.beginPath();
    context.moveTo(linePerp0.getBegin().getX(), linePerp0.getBegin().getY());
    context.lineTo(linePerp0.getEnd().getX(), linePerp0.getEnd().getY());
    context.lineTo(linePerp1.getEnd().getX(), linePerp1.getEnd().getY());
    context.lineTo(linePerp1.getBegin().getX(), linePerp1.getBegin().getY());
    context.closePath();
    context.fillStrokeShape(this);
  });
  // udate triangle
  var beginTy = new dwv.math.Point2D(
    line.getBegin().getX(),
    line.getBegin().getY() - 10);
  var verticalLine = new dwv.math.Line(line.getBegin(), beginTy);
  var angle = dwv.math.getAngle(line, verticalLine);
  var angleRad = angle * Math.PI / 180;
  ktriangle.x(line.getBegin().getX() + ktriangle.radius() * Math.sin(angleRad));
  ktriangle.y(line.getBegin().getY() + ktriangle.radius() * Math.cos(angleRad));
  ktriangle.rotation(-angle);

  // update text
  var ktext = klabel.getText();
  ktext.setText(ktext.meta.textExpr);
  // update position
  var dX = line.getBegin().getX() > line.getEnd().getX() ? 0 : -1;
  var dY = line.getBegin().getY() > line.getEnd().getY() ? -1 : 0;
  var textPos = {
    x: line.getEnd().getX() + dX * ktext.width(),
    y: line.getEnd().getY() + dY * style.applyZoomScale(15).y
  };
  klabel.position(textPos);
};
