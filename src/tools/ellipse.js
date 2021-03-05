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
dwv.tool.draw.defaultEllipseLabelText = '{surface}';

/**
 * Ellipse factory.
 *
 * @class
 */
dwv.tool.draw.EllipseFactory = function () {
  /**
   * Get the name of the shape group.
   *
   * @returns {string} The name.
   */
  this.getGroupName = function () {
    return 'ellipse-group';
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
dwv.tool.draw.EllipseFactory.prototype.isFactoryGroup = function (group) {
  return this.getGroupName() === group.name();
};

/**
 * Create an ellipse shape to be displayed.
 *
 * @param {Array} points The points from which to extract the ellipse.
 * @param {object} style The drawing style.
 * @param {object} viewController The associated view controller.
 * @returns {object} The Konva group.
 */
dwv.tool.draw.EllipseFactory.prototype.create = function (
  points, style, viewController) {
  // calculate radius
  var a = Math.abs(points[0].getX() - points[1].getX());
  var b = Math.abs(points[0].getY() - points[1].getY());
  // physical shape
  var ellipse = new dwv.math.Ellipse(points[0], a, b);
  // draw shape
  var kshape = new Konva.Ellipse({
    x: ellipse.getCenter().getX(),
    y: ellipse.getCenter().getY(),
    radius: {x: ellipse.getA(), y: ellipse.getB()},
    stroke: style.getLineColour(),
    strokeWidth: style.getStrokeWidth(),
    strokeScaleEnabled: false,
    name: 'shape'
  });
  // quantification
  var ktext = new Konva.Text({
    fontSize: style.getFontSize(),
    fontFamily: style.getFontFamily(),
    fill: style.getLineColour(),
    name: 'text'
  });
  var textExpr = '';
  if (typeof dwv.tool.draw.ellipseLabelText !== 'undefined') {
    textExpr = dwv.tool.draw.ellipseLabelText;
  } else {
    textExpr = dwv.tool.draw.defaultEllipseLabelText;
  }
  var quant = ellipse.quantify(
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
    x: ellipse.getCenter().getX(),
    y: ellipse.getCenter().getY(),
    scaleX: style.applyZoomScale(1),
    scaleY: style.applyZoomScale(1),
    name: 'label'
  });
  klabel.add(ktext);
  klabel.add(new Konva.Tag());

  // debug shadow
  var kshadow;
  if (dwv.tool.draw.debug) {
    kshadow = dwv.tool.draw.getShadowEllipse(ellipse);
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
 * Get anchors to update an ellipse shape.
 *
 * @param {object} shape The associated shape.
 * @param {object} style The application style.
 * @returns {Array} A list of anchors.
 */
dwv.tool.draw.EllipseFactory.prototype.getAnchors = function (shape, style) {
  var ellipseX = shape.x();
  var ellipseY = shape.y();
  var radius = shape.radius();

  var anchors = [];
  anchors.push(dwv.tool.draw.getDefaultAnchor(
    ellipseX - radius.x, ellipseY - radius.y, 'topLeft', style
  ));
  anchors.push(dwv.tool.draw.getDefaultAnchor(
    ellipseX + radius.x, ellipseY - radius.y, 'topRight', style
  ));
  anchors.push(dwv.tool.draw.getDefaultAnchor(
    ellipseX + radius.x, ellipseY + radius.y, 'bottomRight', style
  ));
  anchors.push(dwv.tool.draw.getDefaultAnchor(
    ellipseX - radius.x, ellipseY + radius.y, 'bottomLeft', style
  ));
  return anchors;
};

/**
 * Update an ellipse shape.
 * Warning: do NOT use 'this' here, this method is passed
 *   as is to the change command.
 *
 * @param {object} anchor The active anchor.
 * @param {object} _style The app style.
 * @param {object} viewController The associated view controller.
 */
dwv.tool.draw.EllipseFactory.prototype.update = function (
  anchor, _style, viewController) {
  // parent group
  var group = anchor.getParent();
  // associated shape
  var kellipse = group.getChildren(function (node) {
    return node.name() === 'shape';
  })[0];
    // associated label
  var klabel = group.getChildren(function (node) {
    return node.name() === 'label';
  })[0];
    // find special points
  var topLeft = group.getChildren(function (node) {
    return node.id() === 'topLeft';
  })[0];
  var topRight = group.getChildren(function (node) {
    return node.id() === 'topRight';
  })[0];
  var bottomRight = group.getChildren(function (node) {
    return node.id() === 'bottomRight';
  })[0];
  var bottomLeft = group.getChildren(function (node) {
    return node.id() === 'bottomLeft';
  })[0];
  // debug shadow
  var kshadow;
  if (dwv.tool.draw.debug) {
    kshadow = group.getChildren(function (node) {
      return node.name() === 'shadow';
    })[0];
  }

  // update 'self' (undo case) and special points
  switch (anchor.id()) {
  case 'topLeft':
    topLeft.x(anchor.x());
    topLeft.y(anchor.y());
    topRight.y(anchor.y());
    bottomLeft.x(anchor.x());
    break;
  case 'topRight':
    topRight.x(anchor.x());
    topRight.y(anchor.y());
    topLeft.y(anchor.y());
    bottomRight.x(anchor.x());
    break;
  case 'bottomRight':
    bottomRight.x(anchor.x());
    bottomRight.y(anchor.y());
    bottomLeft.y(anchor.y());
    topRight.x(anchor.x());
    break;
  case 'bottomLeft':
    bottomLeft.x(anchor.x());
    bottomLeft.y(anchor.y());
    bottomRight.y(anchor.y());
    topLeft.x(anchor.x());
    break;
  default :
    dwv.logger.error('Unhandled anchor id: ' + anchor.id());
    break;
  }
  // update shape
  var radiusX = (topRight.x() - topLeft.x()) / 2;
  var radiusY = (bottomRight.y() - topRight.y()) / 2;
  var center = {
    x: topLeft.x() + radiusX,
    y: topRight.y() + radiusY
  };
  kellipse.position(center);
  var radiusAbs = {x: Math.abs(radiusX), y: Math.abs(radiusY)};
  if (radiusAbs) {
    kellipse.radius(radiusAbs);
  }
  // new ellipse
  var centerPoint = new dwv.math.Point2D(
    group.x() + center.x,
    group.y() + center.y
  );
  var ellipse = new dwv.math.Ellipse(centerPoint, radiusAbs.x, radiusAbs.y);

  // debug shadow
  if (kshadow) {
    // remove previous
    kshadow.destroy();
    // add new
    group.add(dwv.tool.draw.getShadowEllipse(ellipse, group));
  }

  // update text
  var ktext = klabel.getText();
  var quantification = ellipse.quantify(
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
 * @param {object} ellipse The ellipse to shadow.
 * @param {object} group The associated group.
 * @returns {object} The shadow konva group.
 */
dwv.tool.draw.getShadowEllipse = function (ellipse, group) {
  // possible group offset
  var offsetX = 0;
  var offsetY = 0;
  if (typeof group !== 'undefined') {
    offsetX = group.x();
    offsetY = group.y();
  }
  var kshadow = new Konva.Group();
  kshadow.name('shadow');
  var regions = ellipse.getRound();
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
