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
dwv.tool.draw.defaultCircleLabelText = '{surface}';

/**
 * Circle factory.
 *
 * @class
 */
dwv.tool.draw.CircleFactory = function () {
  /**
   * Get the name of the shape group.
   *
   * @returns {string} The name.
   */
  this.getGroupName = function () {
    return 'circle-group';
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
dwv.tool.draw.CircleFactory.prototype.isFactoryGroup = function (group) {
  return this.getGroupName() === group.name();
};

/**
 * Create a circle shape to be displayed.
 *
 * @param {Array} points The points from which to extract the circle.
 * @param {object} style The drawing style.
 * @param {object} viewController The associated view controller.
 * @returns {object} The Konva group.
 */
dwv.tool.draw.CircleFactory.prototype.create = function (
  points, style, viewController) {
  // calculate radius
  var a = Math.abs(points[0].getX() - points[1].getX());
  var b = Math.abs(points[0].getY() - points[1].getY());
  var radius = Math.round(Math.sqrt(a * a + b * b));
  // physical shape
  var circle = new dwv.math.Circle(points[0], radius);
  // draw shape
  var kshape = new Konva.Circle({
    x: circle.getCenter().getX(),
    y: circle.getCenter().getY(),
    radius: circle.getRadius(),
    stroke: style.getLineColour(),
    strokeWidth: style.getStrokeWidth(),
    strokeScaleEnabled: false,
    name: 'shape'
  });
  // quantification
  var ktext = new Konva.Text({
    fontSize: style.getScaledFontSize(),
    fontFamily: style.getFontFamily(),
    fill: style.getLineColour(),
    name: 'text'
  });
  var textExpr = '';
  if (typeof dwv.tool.draw.circleLabelText !== 'undefined') {
    textExpr = dwv.tool.draw.circleLabelText;
  } else {
    textExpr = dwv.tool.draw.defaultCircleLabelText;
  }
  var quant = circle.quantify(
    viewController,
    dwv.utils.getFlags(textExpr));
  ktext.setText(dwv.utils.replaceFlags(textExpr, quant));
  // meta data
  ktext.meta = {
    textExpr: textExpr,
    quantification: quant
  };
  // label
  var klabel = new Konva.Label({
    x: circle.getCenter().getX(),
    y: circle.getCenter().getY(),
    name: 'label'
  });
  klabel.add(ktext);
  klabel.add(new Konva.Tag());

  // debug shadow
  var kshadow;
  if (dwv.tool.draw.debug) {
    kshadow = dwv.tool.draw.getShadowCircle(circle);
  }

  // return group
  var group = new Konva.Group();
  group.name(this.getGroupName());
  if (kshadow) {
    group.add(kshadow);
  }
  group.add(klabel);
  group.add(kshape);
  group.visible(true); // dont inherit
  return group;
};

/**
 * Get anchors to update a circle shape.
 *
 * @param {object} shape The associated shape.
 * @param {object} style The application style.
 * @param {number} scale The application scale.
 * @returns {Array} A list of anchors.
 */
dwv.tool.draw.CircleFactory.prototype.getAnchors = function (
  shape, style, scale) {
  var centerX = shape.x();
  var centerY = shape.y();
  var radius = shape.radius();

  var anchors = [];
  anchors.push(dwv.tool.draw.getDefaultAnchor(
    centerX - radius, centerY, 'left', style, scale
  ));
  anchors.push(dwv.tool.draw.getDefaultAnchor(
    centerX + radius, centerY, 'right', style, scale
  ));
  anchors.push(dwv.tool.draw.getDefaultAnchor(
    centerX, centerY - radius, 'bottom', style, scale
  ));
  anchors.push(dwv.tool.draw.getDefaultAnchor(
    centerX, centerY + radius, 'top', style, scale
  ));
  return anchors;
};

/**
 * Update a circle shape.
 * Warning: do NOT use 'this' here, this method is passed
 *   as is to the change command.
 *
 * @param {object} anchor The active anchor.
 * @param {object} _style The app style.
 * @param {object} viewController The associated view controller.
 */
dwv.tool.draw.CircleFactory.prototype.update = function (
  anchor, _style, viewController) {
  // parent group
  var group = anchor.getParent();
  // associated shape
  var kcircle = group.getChildren(function (node) {
    return node.name() === 'shape';
  })[0];
  // associated label
  var klabel = group.getChildren(function (node) {
    return node.name() === 'label';
  })[0];
  // find special points
  var left = group.getChildren(function (node) {
    return node.id() === 'left';
  })[0];
  var right = group.getChildren(function (node) {
    return node.id() === 'right';
  })[0];
  var bottom = group.getChildren(function (node) {
    return node.id() === 'bottom';
  })[0];
  var top = group.getChildren(function (node) {
    return node.id() === 'top';
  })[0];
  // debug shadow
  var kshadow;
  if (dwv.tool.draw.debug) {
    kshadow = group.getChildren(function (node) {
      return node.name() === 'shadow';
    })[0];
  }

  // circle center
  var center = {
    x: kcircle.x(),
    y: kcircle.y()
  };

  var radius;

  // update 'self' (undo case) and special points
  switch (anchor.id()) {
  case 'left':
    radius = center.x - anchor.x();
    // force y
    left.y(right.y());
    // update others
    right.x(center.x + radius);
    bottom.y(center.y - radius);
    top.y(center.y + radius);
    break;
  case 'right':
    radius = anchor.x() - center.x;
    // force y
    right.y(left.y());
    // update others
    left.x(center.x - radius);
    bottom.y(center.y - radius);
    top.y(center.y + radius);
    break;
  case 'bottom':
    radius = center.y - anchor.y();
    // force x
    bottom.x(top.x());
    // update others
    left.x(center.x - radius);
    right.x(center.x + radius);
    top.y(center.y + radius);
    break;
  case 'top':
    radius = anchor.y() - center.y;
    // force x
    top.x(bottom.x());
    // update others
    left.x(center.x - radius);
    right.x(center.x + radius);
    bottom.y(center.y - radius);
    break;
  default :
    dwv.logger.error('Unhandled anchor id: ' + anchor.id());
    break;
  }

  // update shape: just update the radius
  kcircle.radius(Math.abs(radius));
  // new circle
  var centerPoint = new dwv.math.Point2D(
    group.x() + center.x,
    group.y() + center.y
  );
  var circle = new dwv.math.Circle(centerPoint, radius);

  // debug shadow
  if (kshadow) {
    // remove previous
    kshadow.destroy();
    // add new
    group.add(dwv.tool.draw.getShadowCircle(circle, group));
  }

  // update text
  var ktext = klabel.getText();
  var quantification = circle.quantify(
    viewController,
    dwv.utils.getFlags(ktext.meta.textExpr));
  ktext.setText(dwv.utils.replaceFlags(ktext.meta.textExpr, quantification));
  // update meta
  ktext.meta.quantification = quantification;
  // update position
  var textPos = {x: center.x, y: center.y};
  klabel.position(textPos);
};

/**
 * Get the debug shadow.
 *
 * @param {object} circle The circle to shadow.
 * @param {object} group The associated group.
 * @returns {object} The shadow konva group.
 */
dwv.tool.draw.getShadowCircle = function (circle, group) {
  // possible group offset
  var offsetX = 0;
  var offsetY = 0;
  if (typeof group !== 'undefined') {
    offsetX = group.x();
    offsetY = group.y();
  }
  var kshadow = new Konva.Group();
  kshadow.name('shadow');
  var regions = circle.getRound();
  for (var i = 0; i < regions.length; ++i) {
    var region = regions[i];
    var minX = region[0][0];
    var minY = region[0][1];
    var maxX = region[1][0];
    var pixelLine = new Konva.Rect({
      x: minX - offsetX,
      y: minY - offsetY,
      width: maxX - minX,
      height: 1,
      fill: 'grey',
      strokeWidth: 0,
      strokeScaleEnabled: false,
      opacity: 0.3,
      name: 'shadow-element'
    });
    kshadow.add(pixelLine);
  }
  return kshadow;
};
