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
    fontSize: style.getScaledFontSize(),
    fontFamily: style.getFontFamily(),
    fill: style.getLineColour(),
    name: 'text'
  });
  if (typeof dwv.tool.draw.freeHandLabelText !== 'undefined') {
    ktext.textExpr = dwv.tool.draw.freeHandLabelText;
  } else {
    ktext.textExpr = dwv.tool.draw.defaultFreeHandLabelText;
  }
  ktext.longText = '';
  ktext.quant = null;
  ktext.setText(ktext.textExpr);

  // label
  var klabel = new Konva.Label({
    x: points[0].getX(),
    y: points[0].getY() + style.scale(10),
    name: 'label'
  });
  klabel.add(ktext);
  klabel.add(new Konva.Tag());

  // return group
  var group = new Konva.Group();
  group.name('freeHand-group');
  group.add(kshape);
  group.add(klabel);
  group.visible(true); // dont inherit
  return group;
};

/**
 * Update a FreeHand shape.
 *
 * @param {object} anchor The active anchor.
 * @param {object} style The app style.
 * @param {object} _viewController The associated view controller.
 */
dwv.tool.draw.UpdateFreeHand = function (anchor, style, _viewController) {
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
  ktext.quant = null;
  ktext.setText(dwv.utils.replaceFlags(ktext.textExpr, ktext.quant));
  // update position
  var textPos = {
    x: points[0] + kline.x(),
    y: points[1] + kline.y() + style.scale(10)
  };
  klabel.position(textPos);
};
