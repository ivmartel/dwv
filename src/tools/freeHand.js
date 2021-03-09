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
dwv.tool.draw.defaultFreeHandLabelText = '';

/**
 * FreeHand factory.
 *
 * @class
 */
dwv.tool.draw.FreeHandFactory = function () {
  /**
   * Get the name of the shape group.
   *
   * @returns {string} The name.
   */
  this.getGroupName = function () {
    return 'freeHand-group';
  };
  /**
   * Get the number of points needed to build the shape.
   *
   * @returns {number} The number of points.
   */
  this.getNPoints = function () {
    return 1000;
  };
  /**
   * Get the timeout between point storage.
   *
   * @returns {number} The timeout in milliseconds.
   */
  this.getTimeout = function () {
    return 25;
  };
};

/**
 * Is the input group a group of this factory?
 *
 * @param {object} group The group to test.
 * @returns {boolean} True if the group is from this fcatory.
 */
dwv.tool.draw.FreeHandFactory.prototype.isFactoryGroup = function (group) {
  return this.getGroupName() === group.name();
};

/**
 * Create a roi shape to be displayed.
 *
 * @param {Array} points The points from which to extract the line.
 * @param {object} style The drawing style.
 * @param {object} _viewController The associated view controller.
 * @returns {object} The Konva group.
 */
dwv.tool.draw.FreeHandFactory.prototype.create = function (
  points, style, _viewController) {
  // points stored the Konvajs way
  var arr = [];
  for (var i = 0; i < points.length; ++i) {
    arr.push(points[i].getX());
    arr.push(points[i].getY());
  }
  // draw shape
  var kshape = new Konva.Line({
    points: arr,
    stroke: style.getLineColour(),
    strokeWidth: style.getStrokeWidth(),
    strokeScaleEnabled: false,
    name: 'shape',
    tension: 0.5
  });

  // text
  var ktext = new Konva.Text({
    fontSize: style.getFontSize(),
    fontFamily: style.getFontFamily(),
    fill: style.getLineColour(),
    name: 'text'
  });
  var textExpr = '';
  if (typeof dwv.tool.draw.freeHandLabelText !== 'undefined') {
    textExpr = dwv.tool.draw.freeHandLabelText;
  } else {
    textExpr = dwv.tool.draw.defaultFreeHandLabelText;
  }
  ktext.setText(textExpr);
  // meta data
  ktext.meta = {
    textExpr: textExpr,
    quantification: {}
  };

  // label
  var klabel = new Konva.Label({
    x: points[0].getX(),
    y: points[0].getY() + style.scale(10),
    scale: style.applyZoomScale(1),
    name: 'label'
  });
  klabel.add(ktext);
  klabel.add(new Konva.Tag());

  // return group
  var group = new Konva.Group();
  group.name(this.getGroupName());
  group.add(klabel);
  group.add(kshape);
  group.visible(true); // dont inherit
  return group;
};

/**
 * Get anchors to update a free hand shape.
 *
 * @param {object} shape The associated shape.
 * @param {object} style The application style.
 * @returns {Array} A list of anchors.
 */
dwv.tool.draw.FreeHandFactory.prototype.getAnchors = function (shape, style) {
  var points = shape.points();

  var anchors = [];
  for (var i = 0; i < points.length; i = i + 2) {
    var px = points[i] + shape.x();
    var py = points[i + 1] + shape.y();
    var name = i;
    anchors.push(dwv.tool.draw.getDefaultAnchor(
      px, py, name, style
    ));
  }
  return anchors;
};

/**
 * Update a FreeHand shape.
 * Warning: do NOT use 'this' here, this method is passed
 *   as is to the change command.
 *
 * @param {object} anchor The active anchor.
 * @param {object} style The app style.
 * @param {object} _viewController The associated view controller.
 */
dwv.tool.draw.FreeHandFactory.prototype.update = function (
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

  // update self
  var point = group.getChildren(function (node) {
    return node.id() === anchor.id();
  })[0];
  point.x(anchor.x());
  point.y(anchor.y());
  // update the roi point and compensate for possible drag
  // (the anchor id is the index of the point in the list)
  var points = kline.points();
  points[anchor.id()] = anchor.x() - kline.x();
  points[anchor.id() + 1] = anchor.y() - kline.y();
  // concat to make Konva think it is a new array
  kline.points(points.concat());

  // update text
  var ktext = klabel.getText();
  ktext.setText(ktext.meta.textExpr);
  // update position
  var textPos = {
    x: points[0] + kline.x(),
    y: points[1] + kline.y() + style.scale(10)
  };
  klabel.position(textPos);
};
