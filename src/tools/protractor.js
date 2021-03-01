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
dwv.tool.draw.defaultProtractorLabelText = '{angle}';

/**
 * Protractor factory.
 *
 * @class
 */
dwv.tool.draw.ProtractorFactory = function () {
  /**
   * Get the name of the shape group.
   *
   * @returns {string} The name.
   */
  this.getGroupName = function () {
    return 'protractor-group';
  };
  /**
   * Get the number of points needed to build the shape.
   *
   * @returns {number} The number of points.
   */
  this.getNPoints = function () {
    return 3;
  };
  /**
   * Get the timeout between point storage.
   *
   * @returns {number} The timeout in milliseconds.
   */
  this.getTimeout = function () {
    return 500;
  };
};

/**
 * Is the input group a group of this factory?
 *
 * @param {object} group The group to test.
 * @returns {boolean} True if the group is from this fcatory.
 */
dwv.tool.draw.ProtractorFactory.prototype.isFactoryGroup = function (group) {
  return this.getGroupName() === group.name();
};

/**
 * Create a protractor shape to be displayed.
 *
 * @param {Array} points The points from which to extract the protractor.
 * @param {object} style The drawing style.
 * @param {object} _viewController The associated view controller.
 * @returns {object} The Konva group.
 */
dwv.tool.draw.ProtractorFactory.prototype.create = function (
  points, style, _viewController) {
  // physical shape
  var line0 = new dwv.math.Line(points[0], points[1]);
  // points stored the Konvajs way
  var pointsArray = [];
  for (var i = 0; i < points.length; ++i) {
    pointsArray.push(points[i].getX());
    pointsArray.push(points[i].getY());
  }
  // draw shape
  var kshape = new Konva.Line({
    points: pointsArray,
    stroke: style.getLineColour(),
    strokeWidth: style.getStrokeWidth(),
    strokeScaleEnabled: false,
    name: 'shape'
  });
  var group = new Konva.Group();
  group.name(this.getGroupName());
  // text and decoration
  if (points.length === 3) {
    var line1 = new dwv.math.Line(points[1], points[2]);
    // larger hitfunc
    kshape.hitFunc(function (context) {
      context.beginPath();
      context.moveTo(points[0].getX(), points[0].getY());
      context.lineTo(points[1].getX(), points[1].getY());
      context.lineTo(points[2].getX(), points[2].getY());
      context.closePath();
      context.fillStrokeShape(this);
    });
    // quantification
    var angle = dwv.math.getAngle(line0, line1);
    var inclination = line0.getInclination();
    if (angle > 180) {
      angle = 360 - angle;
      inclination += angle;
    }

    // quantification
    var ktext = new Konva.Text({
      fontSize: style.getScaledFontSize(),
      fontFamily: style.getFontFamily(),
      fill: style.getLineColour(),
      name: 'text'
    });
    var textExpr = '';
    if (typeof dwv.tool.draw.protractorLabelText !== 'undefined') {
      textExpr = dwv.tool.draw.protractorLabelText;
    } else {
      textExpr = dwv.tool.draw.defaultProtractorLabelText;
    }
    var quantification = {
      angle: {
        value: angle,
        unit: dwv.i18n('unit.degree')
      }
    };
    ktext.setText(dwv.utils.replaceFlags(textExpr, quantification));
    // meta data
    ktext.meta = {textExpr, quantification};

    // label
    var midX = (line0.getMidpoint().getX() + line1.getMidpoint().getX()) / 2;
    var midY = (line0.getMidpoint().getY() + line1.getMidpoint().getY()) / 2;
    var klabel = new Konva.Label({
      x: midX,
      y: midY - style.scale(15),
      name: 'label'
    });
    klabel.add(ktext);
    klabel.add(new Konva.Tag());

    // arc
    var radius = Math.min(line0.getLength(), line1.getLength()) * 33 / 100;
    var karc = new Konva.Arc({
      innerRadius: radius,
      outerRadius: radius,
      stroke: style.getLineColour(),
      strokeWidth: style.getStrokeWidth(),
      strokeScaleEnabled: false,
      angle: angle,
      rotation: -inclination,
      x: points[1].getX(),
      y: points[1].getY(),
      name: 'shape-arc'
    });
    // add to group
    group.add(klabel);
    group.add(karc);
  }
  // add shape to group
  group.add(kshape);
  group.visible(true); // dont inherit
  // return group
  return group;
};

/**
 * Get anchors to update a protractor shape.
 *
 * @param {object} shape The associated shape.
 * @param {object} style The application style.
 * @param {number} scale The application scale.
 * @returns {Array} A list of anchors.
 */
dwv.tool.draw.ProtractorFactory.prototype.getAnchors = function (
  shape, style, scale) {
  var points = shape.points();

  var anchors = [];
  anchors.push(dwv.tool.draw.getDefaultAnchor(
    points[0] + shape.x(), points[1] + shape.y(), 'begin', style, scale
  ));
  anchors.push(dwv.tool.draw.getDefaultAnchor(
    points[2] + shape.x(), points[3] + shape.y(), 'mid', style, scale
  ));
  anchors.push(dwv.tool.draw.getDefaultAnchor(
    points[4] + shape.x(), points[5] + shape.y(), 'end', style, scale
  ));
  return anchors;
};

/**
 * Update a protractor shape.
 * Warning: do NOT use 'this' here, this method is passed
 *   as is to the change command.
 *
 * @param {object} anchor The active anchor.
 * @param {object} style The app style.
 * @param {object} _viewController The associated view controller.
 */
dwv.tool.draw.ProtractorFactory.prototype.update = function (
  anchor, style, _viewController) {
  // parent group
  var group = anchor.getParent();
  // associated shape
  var kline = group.getChildren(function (node) {
    return node.name() === 'shape';
  })[0];
    // associated label
  var klabel = group.getChildren(function (node) {
    return node.name() === 'label';
  })[0];
    // associated arc
  var karc = group.getChildren(function (node) {
    return node.name() === 'shape-arc';
  })[0];
    // find special points
  var begin = group.getChildren(function (node) {
    return node.id() === 'begin';
  })[0];
  var mid = group.getChildren(function (node) {
    return node.id() === 'mid';
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
  case 'mid':
    mid.x(anchor.x());
    mid.y(anchor.y());
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
  var mx = mid.x() - kline.x();
  var my = mid.y() - kline.y();
  var ex = end.x() - kline.x();
  var ey = end.y() - kline.y();
  kline.points([bx, by, mx, my, ex, ey]);
  // larger hitfunc
  kline.hitFunc(function (context) {
    context.beginPath();
    context.moveTo(bx, by);
    context.lineTo(mx, my);
    context.lineTo(ex, ey);
    context.closePath();
    context.fillStrokeShape(this);
  });
  // update text
  var p2d0 = new dwv.math.Point2D(begin.x(), begin.y());
  var p2d1 = new dwv.math.Point2D(mid.x(), mid.y());
  var p2d2 = new dwv.math.Point2D(end.x(), end.y());
  var line0 = new dwv.math.Line(p2d0, p2d1);
  var line1 = new dwv.math.Line(p2d1, p2d2);
  var angle = dwv.math.getAngle(line0, line1);
  var inclination = line0.getInclination();
  if (angle > 180) {
    angle = 360 - angle;
    inclination += angle;
  }

  // update text
  var ktext = klabel.getText();
  var quantification = {
    angle: {value: angle, unit: dwv.i18n('unit.degree')}
  };
  ktext.setText(dwv.utils.replaceFlags(ktext.meta.textExpr, quantification));
  // update meta
  ktext.meta.quantification = quantification;
  // update position
  var midX = (line0.getMidpoint().getX() + line1.getMidpoint().getX()) / 2;
  var midY = (line0.getMidpoint().getY() + line1.getMidpoint().getY()) / 2;
  var textPos = {
    x: midX,
    y: midY - style.scale(15)
  };
  klabel.position(textPos);

  // arc
  var radius = Math.min(line0.getLength(), line1.getLength()) * 33 / 100;
  karc.innerRadius(radius);
  karc.outerRadius(radius);
  karc.angle(angle);
  karc.rotation(-inclination);
  var arcPos = {x: mid.x(), y: mid.y()};
  karc.position(arcPos);
};
