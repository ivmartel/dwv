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
dwv.tool.draw.defaultRectangleLabelText = '{surface}';

/**
 * Rectangle factory.
 *
 * @class
 */
dwv.tool.draw.RectangleFactory = function () {
  /**
   * Get the name of the shape group.
   *
   * @returns {string} The name.
   */
  this.getGroupName = function () {
    return 'rectangle-group';
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
dwv.tool.draw.RectangleFactory.prototype.isFactoryGroup = function (group) {
  return this.getGroupName() === group.name();
};

/**
 * Create a rectangle shape to be displayed.
 *
 * @param {Array} points The points from which to extract the rectangle.
 * @param {object} style The drawing style.
 * @param {object} viewController The associated view controller.
 * @returns {object} The Konva group.
 */
dwv.tool.draw.RectangleFactory.prototype.create = function (
  points, style, viewController) {
  // physical shape
  var rectangle = new dwv.math.Rectangle(points[0], points[1]);
  // draw shape
  var kshape = new Konva.Rect({
    x: rectangle.getBegin().getX(),
    y: rectangle.getBegin().getY(),
    width: rectangle.getWidth(),
    height: rectangle.getHeight(),
    stroke: style.getLineColour(),
    strokeWidth: style.getStrokeWidth(),
    strokeScaleEnabled: false,
    name: 'shape'
  });
  // label text
  var ktext = new Konva.Text({
    fontSize: style.getFontSize(),
    fontFamily: style.getFontFamily(),
    fill: style.getLineColour(),
    name: 'text'
  });
  var textExpr = '';
  if (typeof dwv.tool.draw.rectangleLabelText !== 'undefined') {
    textExpr = dwv.tool.draw.rectangleLabelText;
  } else {
    textExpr = dwv.tool.draw.defaultRectangleLabelText;
  }
  var quant = rectangle.quantify(
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
    x: rectangle.getBegin().getX(),
    y: rectangle.getEnd().getY() + style.scale(10),
    scaleX: style.applyZoomScale(1),
    scaleY: style.applyZoomScale(1),
    name: 'label'
  });
  klabel.add(ktext);
  klabel.add(new Konva.Tag());

  // debug shadow
  var kshadow;
  if (dwv.tool.draw.debug) {
    kshadow = dwv.tool.draw.getShadowRectangle(rectangle);
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
 * Get anchors to update a rectangle shape.
 *
 * @param {object} shape The associated shape.
 * @param {object} style The application style.
 * @returns {Array} A list of anchors.
 */
dwv.tool.draw.RectangleFactory.prototype.getAnchors = function (shape, style) {
  var rectX = shape.x();
  var rectY = shape.y();
  var rectWidth = shape.width();
  var rectHeight = shape.height();

  var anchors = [];
  anchors.push(dwv.tool.draw.getDefaultAnchor(
    rectX, rectY, 'topLeft', style
  ));
  anchors.push(dwv.tool.draw.getDefaultAnchor(
    rectX + rectWidth, rectY, 'topRight', style
  ));
  anchors.push(dwv.tool.draw.getDefaultAnchor(
    rectX + rectWidth, rectY + rectHeight, 'bottomRight', style
  ));
  anchors.push(dwv.tool.draw.getDefaultAnchor(
    rectX, rectY + rectHeight, 'bottomLeft', style
  ));
  return anchors;
};

/**
 * Update a rectangle shape.
 * Warning: do NOT use 'this' here, this method is passed
 *   as is to the change command.
 *
 * @param {object} anchor The active anchor.
 * @param {object} style The app style.
 * @param {object} viewController The associated view controller.
 */
dwv.tool.draw.RectangleFactory.prototype.update = function (
  anchor, style, viewController) {
  // parent group
  var group = anchor.getParent();
  // associated shape
  var krect = group.getChildren(function (node) {
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
  krect.position(topLeft.position());
  var width = topRight.x() - topLeft.x();
  var height = bottomLeft.y() - topLeft.y();
  if (width && height) {
    krect.size({width: width, height: height});
  }
  // positions: add possible group offset
  var p2d0 = new dwv.math.Point2D(
    group.x() + topLeft.x(),
    group.y() + topLeft.y()
  );
  var p2d1 = new dwv.math.Point2D(
    group.x() + bottomRight.x(),
    group.y() + bottomRight.y()
  );
  // new rect
  var rect = new dwv.math.Rectangle(p2d0, p2d1);

  // debug shadow based on round (used in quantification)
  if (kshadow) {
    var round = rect.getRound();
    var rWidth = round.max.getX() - round.min.getX();
    var rHeight = round.max.getY() - round.min.getY();
    kshadow.position({
      x: round.min.getX() - group.x(),
      y: round.min.getY() - group.y()
    });
    kshadow.size({width: rWidth, height: rHeight});
  }

  // update text
  var ktext = klabel.getText();
  var quantification = rect.quantify(
    viewController,
    dwv.utils.getFlags(ktext.meta.textExpr));
  ktext.setText(dwv.utils.replaceFlags(ktext.meta.textExpr, quantification));
  // update meta
  ktext.meta.quantification = quantification;
  // update position
  var textPos = {
    x: rect.getBegin().getX() - group.x(),
    y: rect.getEnd().getY() - group.y() + style.scale(10)
  };
  klabel.position(textPos);
};

/**
 * Get the debug shadow.
 *
 * @param {object} rectangle The rectangle to shadow.
 * @returns {object} The shadow konva shape.
 */
dwv.tool.draw.getShadowRectangle = function (rectangle) {
  var round = rectangle.getRound();
  var rWidth = round.max.getX() - round.min.getX();
  var rHeight = round.max.getY() - round.min.getY();
  return new Konva.Rect({
    x: round.min.getX(),
    y: round.min.getY(),
    width: rWidth,
    height: rHeight,
    fill: 'grey',
    strokeWidth: 0,
    strokeScaleEnabled: false,
    opacity: 0.3,
    name: 'shadow'
  });
};
