// namespaces
var dwv = dwv || {};
dwv.math = dwv.math || {};

/**
 * Mulitply the three inputs if the last two are not null.
 *
 * @param {number} a The first input.
 * @param {number} b The second input.
 * @param {number} c The third input.
 * @returns {number} The multiplication of the three inputs or
 *  null if one of the last two is null.
 */
dwv.math.mulABC = function (a, b, c) {
  var res = null;
  if (b !== null && c !== null) {
    res = a * b * c;
  }
  return res;
};

/**
 * Rectangle shape.
 *
 * @class
 * @param {object} begin A Point2D representing the beginning of the rectangle.
 * @param {object} end A Point2D representing the end of the rectangle.
 */
dwv.math.Rectangle = function (begin, end) {
  if (end.getX() < begin.getX()) {
    var tmpX = begin.getX();
    begin = new dwv.math.Point2D(end.getX(), begin.getY());
    end = new dwv.math.Point2D(tmpX, end.getY());
  }
  if (end.getY() < begin.getY()) {
    var tmpY = begin.getY();
    begin = new dwv.math.Point2D(begin.getX(), end.getY());
    end = new dwv.math.Point2D(end.getX(), tmpY);
  }

  /**
   * Rectangle surface.
   *
   * @private
   * @type {number}
   */
  var surface = Math.abs(end.getX() - begin.getX()) *
    Math.abs(end.getY() - begin.getY());

  /**
   * Get the begin point of the rectangle.
   *
   * @returns {object} The begin point of the rectangle
   */
  this.getBegin = function () {
    return begin;
  };
  /**
   * Get the end point of the rectangle.
   *
   * @returns {object} The end point of the rectangle
   */
  this.getEnd = function () {
    return end;
  };
  /**
   * Get the real width of the rectangle.
   *
   * @returns {number} The real width of the rectangle.
   */
  this.getRealWidth = function () {
    return end.getX() - begin.getX();
  };
  /**
   * Get the real height of the rectangle.
   *
   * @returns {number} The real height of the rectangle.
   */
  this.getRealHeight = function () {
    return end.getY() - begin.getY();
  };
  /**
   * Get the width of the rectangle.
   *
   * @returns {number} The width of the rectangle.
   */
  this.getWidth = function () {
    return Math.abs(this.getRealWidth());
  };
  /**
   * Get the height of the rectangle.
   *
   * @returns {number} The height of the rectangle.
   */
  this.getHeight = function () {
    return Math.abs(this.getRealHeight());
  };
  /**
   * Get the surface of the rectangle.
   *
   * @returns {number} The surface of the rectangle.
   */
  this.getSurface = function () {
    return surface;
  };
  /**
   * Get the surface of the circle according to a spacing.
   *
   * @param {number} spacingX The X spacing.
   * @param {number} spacingY The Y spacing.
   * @returns {number} The surface of the rectangle multiplied by the given
   *  spacing or null for null spacings.
   */
  this.getWorldSurface = function (spacingX, spacingY) {
    return dwv.math.mulABC(surface, spacingX, spacingY);
  };
}; // Rectangle class
