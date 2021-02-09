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
   * Line delta in the X direction.
   *
   * @private
   * @type {number}
   */
  var dx = end.getX() - begin.getX();
  /**
   * Line delta in the Y direction.
   *
   * @private
   * @type {number}
   */
  var dy = end.getY() - begin.getY();
  /**
   * Line length.
   *
   * @private
   * @type {number}
   */
  var length = Math.sqrt(dx * dx + dy * dy);

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
  /**
   * Get the line delta in the X direction.
   *
   * @returns {number} The delta in the X direction.
   */
  this.getDeltaX = function () {
    return dx;
  };
  /**
   * Get the line delta in the Y direction.
   *
   * @returns {number} The delta in the Y direction.
   */
  this.getDeltaY = function () {
    return dy;
  };
  /**
   * Get the length of the line.
   *
   * @returns {number} The length of the line.
   */
  this.getLength = function () {
    return length;
  };
  /**
   * Get the length of the line according to a  spacing.
   *
   * @param {number} spacingX The X spacing.
   * @param {number} spacingY The Y spacing.
   * @returns {number} The length of the line with spacing
   *  or null for null spacings.
   */
  this.getWorldLength = function (spacingX, spacingY) {
    var wlen = null;
    if (spacingX !== null && spacingY !== null) {
      var dxs = dx * spacingX;
      var dys = dy * spacingY;
      wlen = Math.sqrt(dxs * dxs + dys * dys);
    }
    return wlen;
  };
  /**
   * Get the mid point of the line.
   *
   * @returns {object} The mid point of the line.
   */
  this.getMidpoint = function () {
    return new dwv.math.Point2D(
      parseInt((begin.getX() + end.getX()) / 2, 10),
      parseInt((begin.getY() + end.getY()) / 2, 10));
  };
  /**
   * Get the slope of the line.
   *
   * @returns {number} The slope of the line.
   */
  this.getSlope = function () {
    return dy / dx;
  };
  /**
   * Get the intercept of the line.
   *
   * @returns {number} The slope of the line.
   */
  this.getIntercept = function () {
    return (end.getX() * begin.getY() - begin.getX() * end.getY()) / dx;
  };
  /**
   * Get the inclination of the line.
   *
   * @returns {number} The inclination of the line.
   */
  this.getInclination = function () {
    // tan(theta) = slope
    var angle = Math.atan2(dy, dx) * 180 / Math.PI;
    // shift?
    return 180 - angle;
  };
}; // Line class

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
