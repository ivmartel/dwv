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
 * Ellipse shape.
 *
 * @class
 * @param {object} centre A Point2D representing the centre of the ellipse.
 * @param {number} a The radius of the ellipse on the horizontal axe.
 * @param {number} b The radius of the ellipse on the vertical axe.
 */
dwv.math.Ellipse = function (centre, a, b) {
  /**
   * Circle surface.
   *
   * @private
   * @type {number}
   */
  var surface = Math.PI * a * b;

  /**
   * Get the centre (point) of the ellipse.
   *
   * @returns {object} The center (point) of the ellipse.
   */
  this.getCenter = function () {
    return centre;
  };
  /**
   * Get the radius of the ellipse on the horizontal axe.
   *
   * @returns {number} The radius of the ellipse on the horizontal axe.
   */
  this.getA = function () {
    return a;
  };
  /**
   * Get the radius of the ellipse on the vertical axe.
   *
   * @returns {number} The radius of the ellipse on the vertical axe.
   */
  this.getB = function () {
    return b;
  };
  /**
   * Get the surface of the ellipse.
   *
   * @returns {number} The surface of the ellipse.
   */
  this.getSurface = function () {
    return surface;
  };
  /**
   * Get the surface of the ellipse according to a spacing.
   *
   * @param {number} spacingX The X spacing.
   * @param {number} spacingY The Y spacing.
   * @returns {number} The surface of the ellipse multiplied by the given
   *  spacing or null for null spacings.
   */
  this.getWorldSurface = function (spacingX, spacingY) {
    return dwv.math.mulABC(surface, spacingX, spacingY);
  };
}; // Ellipse class
