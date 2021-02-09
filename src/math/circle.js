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
 * Circle shape.
 *
 * @class
 * @param {object} centre A Point2D representing the centre of the circle.
 * @param {number} radius The radius of the circle.
 */
dwv.math.Circle = function (centre, radius) {
  /**
   * Circle surface.
   *
   * @private
   * @type {number}
   */
  var surface = Math.PI * radius * radius;

  /**
   * Get the centre (point) of the circle.
   *
   * @returns {object} The center (point) of the circle.
   */
  this.getCenter = function () {
    return centre;
  };
  /**
   * Get the radius of the circle.
   *
   * @returns {number} The radius of the circle.
   */
  this.getRadius = function () {
    return radius;
  };
  /**
   * Get the surface of the circle.
   *
   * @returns {number} The surface of the circle.
   */
  this.getSurface = function () {
    return surface;
  };
  /**
   * Get the surface of the circle according to a spacing.
   *
   * @param {number} spacingX The X spacing.
   * @param {number} spacingY The Y spacing.
   * @returns {number} The surface of the circle multiplied by the given
   *  spacing or null for null spacings.
   */
  this.getWorldSurface = function (spacingX, spacingY) {
    return dwv.math.mulABC(surface, spacingX, spacingY);
  };
}; // Circle class
