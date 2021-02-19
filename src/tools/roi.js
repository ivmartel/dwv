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
dwv.tool.draw.defaultRoiLabelText = '';

/**
 * ROI factory.
 *
 * @class
 */
dwv.tool.draw.RoiFactory = function () {
  /**
   * Get the number of points needed to build the shape.
   *
   * @returns {number} The number of points.
   */
  this.getNPoints = function () {
    return 50;
  };
  /**
   * Get the timeout between point storage.
   *
   * @returns {number} The timeout in milliseconds.
   */
  this.getTimeout = function () {
    return 100;
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
dwv.tool.draw.RoiFactory.prototype.create = function (
  points, style, _viewController) {
  // physical shape
  var roi = new dwv.math.ROI();
  // add input points to the ROI
  roi.addPoints(points);
  // points stored the Konvajs way
  var arr = [];
  for (var i = 0; i < roi.getLength(); ++i) {
    arr.push(roi.getPoint(i).getX());
    arr.push(roi.getPoint(i).getY());
  }
  // draw shape
  var kshape = new Konva.Line({
    points: arr,
    stroke: style.getLineColour(),
    strokeWidth: style.getStrokeWidth(),
    strokeScaleEnabled: false,
    name: 'shape',
    closed: true
  });

  // text
  var ktext = new Konva.Text({
    fontSize: style.getScaledFontSize(),
    fontFamily: style.getFontFamily(),
    fill: style.getLineColour(),
    name: 'text'
  });
  if (typeof dwv.tool.draw.roiLabelText !== 'undefined') {
    ktext.textExpr = dwv.tool.draw.roiLabelText;
  } else {
    ktext.textExpr = dwv.tool.draw.defaultRoiLabelText;
  }
  ktext.longText = '';
  ktext.quant = null;
  ktext.setText(dwv.utils.replaceFlags(ktext.textExpr, ktext.quant));

  // label
  var klabel = new Konva.Label({
    x: roi.getPoint(0).getX(),
    y: roi.getPoint(0).getY() + style.scale(10),
    name: 'label'
  });
  klabel.add(ktext);
  klabel.add(new Konva.Tag());

  // return group
  var group = new Konva.Group();
  group.name('roi-group');
  group.add(klabel);
  group.add(kshape);
  group.visible(true); // dont inherit
  return group;
};

/**
 * Update a roi shape.
 *
 * @param {object} anchor The active anchor.
 * @param {object} style The app style.
 * @param {object} _viewController The associated view controller.
 */
dwv.tool.draw.UpdateRoi = function (anchor, style, _viewController) {
  // parent group
  var group = anchor.getParent();
  // associated shape
  var kroi = group.getChildren(function (node) {
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
  var points = kroi.points();
  points[anchor.id()] = anchor.x() - kroi.x();
  points[anchor.id() + 1] = anchor.y() - kroi.y();
  kroi.points(points);

  // update text
  var ktext = klabel.getText();
  ktext.quant = null;
  ktext.setText(dwv.utils.replaceFlags(ktext.textExpr, ktext.quant));
  // update position
  var textPos = {
    x: points[0] + kroi.x(),
    y: points[1] + kroi.y() + style.scale(10)
  };
  klabel.position(textPos);

};
