// namespaces
var dwv = dwv || {};
dwv.math = dwv.math || {};

/**
 * Line shape.
 *
 * @class
 * @param {object} begin A Point2D representing the beginning of the line.
 * @param {object} end A Point2D representing the end of the line.
 */
dwv.math.Line = function (begin, end) {
  /**
   * Get the begin point of the line.
   *
   * @returns {object} The beginning point of the line.
   */
  this.getBegin = function () {
    return begin;
  };

  /**
   * Get the end point of the line.
   *
   * @returns {object} The ending point of the line.
   */
  this.getEnd = function () {
    return end;
  };
}; // Line class

/**
 * Check for equality.
 *
 * @param {object} rhs The object to compare to.
 * @returns {boolean} True if both objects are equal.
 */
dwv.math.Line.prototype.equals = function (rhs) {
  return rhs !== null &&
    this.getBegin().equals(rhs.getBegin()) &&
    this.getEnd().equals(rhs.getEnd());
};

/**
 * Get the line delta in the X direction.
 *
 * @returns {number} The delta in the X direction.
 */
dwv.math.Line.prototype.getDeltaX = function () {
  return this.getEnd().getX() - this.getBegin().getX();
};

/**
 * Get the line delta in the Y direction.
 *
 * @returns {number} The delta in the Y direction.
 */
dwv.math.Line.prototype.getDeltaY = function () {
  return this.getEnd().getY() - this.getBegin().getY();
};

/**
 * Get the length of the line.
 *
 * @returns {number} The length of the line.
 */
dwv.math.Line.prototype.getLength = function () {
  return Math.sqrt(
    this.getDeltaX() * this.getDeltaX() +
    this.getDeltaY() * this.getDeltaY()
  );
};

/**
 * Get the length of the line according to a  spacing.
 *
 * @param {number} spacingX The X spacing.
 * @param {number} spacingY The Y spacing.
 * @returns {number} The length of the line with spacing
 *  or null for null spacings.
 */
dwv.math.Line.prototype.getWorldLength = function (spacingX, spacingY) {
  var wlen = null;
  if (spacingX !== null && spacingY !== null) {
    var dxs = this.getDeltaX() * spacingX;
    var dys = this.getDeltaY() * spacingY;
    wlen = Math.sqrt(dxs * dxs + dys * dys);
  }
  return wlen;
};

/**
 * Get the mid point of the line.
 *
 * @returns {object} The mid point of the line.
 */
dwv.math.Line.prototype.getMidpoint = function () {
  return new dwv.math.Point2D(
    parseInt((this.getBegin().getX() + this.getEnd().getX()) / 2, 10),
    parseInt((this.getBegin().getY() + this.getEnd().getY()) / 2, 10)
  );
};

/**
 * Get the slope of the line.
 *
 * @returns {number} The slope of the line.
 */
dwv.math.Line.prototype.getSlope = function () {
  return this.getDeltaY() / this.getDeltaX();
};

/**
 * Get the intercept of the line.
 *
 * @returns {number} The slope of the line.
 */
dwv.math.Line.prototype.getIntercept = function () {
  return (
    this.getEnd().getX() * this.getBegin().getY() -
    this.getBegin().getX() * this.getEnd().getY()
  ) / this.getDeltaX();
};

/**
 * Get the inclination of the line.
 *
 * @returns {number} The inclination of the line.
 */
dwv.math.Line.prototype.getInclination = function () {
  // tan(theta) = slope
  var angle = Math.atan2(this.getDeltaY(), this.getDeltaX()) * 180 / Math.PI;
  // shift?
  return 180 - angle;
};

/**
 * Get the angle between two lines in degree.
 *
 * @param {object} line0 The first line.
 * @param {object} line1 The second line.
 * @returns {number} The angle.
 */
dwv.math.getAngle = function (line0, line1) {
  var dx0 = line0.getDeltaX();
  var dy0 = line0.getDeltaY();
  var dx1 = line1.getDeltaX();
  var dy1 = line1.getDeltaY();
  // dot = ||a||*||b||*cos(theta)
  var dot = dx0 * dx1 + dy0 * dy1;
  // cross = ||a||*||b||*sin(theta)
  var det = dx0 * dy1 - dy0 * dx1;
  // tan = sin / cos
  var angle = Math.atan2(det, dot) * 180 / Math.PI;
  // complementary angle
  // shift?
  return 360 - (180 - angle);
};

/**
 * Get a perpendicular line to an input one.
 *
 * @param {object} line The line to be perpendicular to.
 * @param {object} point The middle point of the perpendicular line.
 * @param {number} length The length of the perpendicular line.
 * @returns {object} A perpendicular line.
 */
dwv.math.getPerpendicularLine = function (line, point, length) {
  // begin point
  var beginX = 0;
  var beginY = 0;
  // end point
  var endX = 0;
  var endY = 0;

  // check slope:
  // 0 -> horizontal
  // Infinite -> vertical (a/Infinite = 0)
  if (line.getSlope() !== 0) {
    // a0 * a1 = -1
    var slope = -1 / line.getSlope();
    // y0 = a1*x0 + b1 -> b1 = y0 - a1*x0
    var intercept = point.getY() - slope * point.getX();

    // 1. (x - x0)^2 + (y - y0)^2 = d^2
    // 2. a = (y - y0) / (x - x0) -> y = a*(x - x0) + y0
    // ->  (x - x0)^2 + m^2 * (x - x0)^2 = d^2
    // -> x = x0 +- d / sqrt(1+m^2)

    // length is the distance between begin and end,
    // point is half way between both -> d = length / 2
    var dx = length / (2 * Math.sqrt(1 + slope * slope));

    // begin point
    beginX = point.getX() - dx;
    beginY = slope * beginX + intercept;
    // end point
    endX = point.getX() + dx;
    endY = slope * endX + intercept;
  } else {
    // horizontal input line -> perpendicular is vertical!
    // begin point
    beginX = point.getX();
    beginY = point.getY() - length / 2;
    // end point
    endX = point.getX();
    endY = point.getY() + length / 2;
  }
  // perpendicalar line
  return new dwv.math.Line(
    new dwv.math.Point2D(beginX, beginY),
    new dwv.math.Point2D(endX, endY));
};

/**
 * Quantify a line according to view information.
 *
 * @param {object} viewController The associated view controller.
 * @returns {object} A quantification object.
 */
dwv.math.Line.prototype.quantify = function (viewController) {
  var quant = {};
  // length
  var spacing = viewController.get2DSpacing();
  var length = this.getWorldLength(spacing[0], spacing[1]);
  if (length !== null) {
    quant.length = {value: length, unit: dwv.i18n('unit.mm')};
  }
  // return
  return quant;
};
