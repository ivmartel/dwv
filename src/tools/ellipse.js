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
 * Ellipse factory.
 *
 * @class
 */
dwv.tool.draw.EllipseFactory = function () {
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
 * Create an ellipse shape to be displayed.
 *
 * @param {Array} points The points from which to extract the ellipse.
 * @param {object} style The drawing style.
 * @param {object} image The associated image.
 * @returns {object} The Konva group.
 */
dwv.tool.draw.EllipseFactory.prototype.create = function (
  points, style, image) {
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
  var quant = ellipse.quantify(image);
  var ktext = new Konva.Text({
    fontSize: style.getScaledFontSize(),
    fontFamily: style.getFontFamily(),
    fill: style.getLineColour(),
    name: 'text'
  });
  ktext.textExpr = '{surface}';
  ktext.longText = '';
  ktext.quant = quant;
  ktext.setText(dwv.utils.replaceFlags(ktext.textExpr, ktext.quant));
  // label
  var klabel = new Konva.Label({
    x: ellipse.getCenter().getX(),
    y: ellipse.getCenter().getY(),
    name: 'label'
  });
  klabel.add(ktext);
  klabel.add(new Konva.Tag());

  // return group
  var group = new Konva.Group();
  group.name('ellipse-group');
  group.add(kshape);
  group.add(klabel);
  group.visible(true); // dont inherit
  return group;
};

/**
 * Update an ellipse shape.
 *
 * @param {object} anchor The active anchor.
 * @param {object} image The associated image.
 */
dwv.tool.draw.UpdateEllipse = function (anchor, image) {
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
  var center = {x: topLeft.x() + radiusX, y: topRight.y() + radiusY};
  kellipse.position(center);
  var radiusAbs = {x: Math.abs(radiusX), y: Math.abs(radiusY)};
  if (radiusAbs) {
    kellipse.radius(radiusAbs);
  }
  // new ellipse
  var ellipse = new dwv.math.Ellipse(center, radiusAbs.x, radiusAbs.y);
  // update text
  var quant = ellipse.quantify(image);
  var ktext = klabel.getText();
  ktext.quant = quant;
  ktext.setText(dwv.utils.replaceFlags(ktext.textExpr, ktext.quant));
  // update position
  var textPos = {x: center.x, y: center.y};
  klabel.position(textPos);
};
