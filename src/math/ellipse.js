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
 * @param {dwv.math.Point2D} centre A Point2D representing the centre
 *   of the ellipse.
 * @param {number} a The radius of the ellipse on the horizontal axe.
 * @param {number} b The radius of the ellipse on the vertical axe.
 */
dwv.math.Ellipse = function (centre, a, b) {
  /**
   * Get the centre (point) of the ellipse.
   *
   * @returns {dwv.math.Point2D} The center (point) of the ellipse.
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
}; // Ellipse class

/**
 * Check for equality.
 *
 * @param {dwv.math.Ellipse} rhs The object to compare to.
 * @returns {boolean} True if both objects are equal.
 */
dwv.math.Ellipse.prototype.equals = function (rhs) {
  return rhs !== null &&
    this.getCenter().equals(rhs.getCenter()) &&
    this.getA() === rhs.getA() &&
    this.getB() === rhs.getB();
};

/**
 * Get the surface of the ellipse.
 *
 * @returns {number} The surface of the ellipse.
 */
dwv.math.Ellipse.prototype.getSurface = function () {
  return Math.PI * this.getA() * this.getB();
};

/**
 * Get the surface of the ellipse according to a spacing.
 *
 * @param {number} spacingX The X spacing.
 * @param {number} spacingY The Y spacing.
 * @returns {number} The surface of the ellipse multiplied by the given
 *  spacing or null for null spacings.
 */
dwv.math.Ellipse.prototype.getWorldSurface = function (spacingX, spacingY) {
  return dwv.math.mulABC(this.getSurface(), spacingX, spacingY);
};

/**
 * Get the rounded limits of the ellipse.
 * (see https://en.wikipedia.org/wiki/Ellipse#Standard_equation)
 * Ellipse formula: x*x / a*a + y*y / b*b = 1
 * => y = (+-)(b/a) * sqrt(a*a - x*x)
 *
 * @returns {Array} The rounded limits.
 */
dwv.math.Ellipse.prototype.getRound = function () {
  var centerX = this.getCenter().getX();
  var centerY = this.getCenter().getY();
  var radiusX = this.getA();
  var radiusY = this.getB();
  var radiusRatio = radiusX / radiusY;
  var rySquare = Math.pow(radiusY, 2);
  // Y bounds
  var minY = centerY - radiusY;
  var maxY = centerY + radiusY;
  var regions = [];
  // loop through lines and store limits
  for (var y = minY; y < maxY; ++y) {
    var diff = rySquare - Math.pow(y - centerY, 2);
    // remove small values (possibly negative)
    if (Math.abs(diff) < 1e-7) {
      continue;
    }
    var transX = radiusRatio * Math.sqrt(diff);
    // remove small values
    if (transX < 0.5) {
      continue;
    }
    regions.push([
      [Math.round(centerX - transX), Math.round(y)],
      [Math.round(centerX + transX), Math.round(y)]
    ]);
  }
  return regions;
};

/**
 * Quantify an ellipse according to view information.
 *
 * @param {dwv.ctrl.ViewController} viewController The associated view
 *   controller.
 * @param {Array} flags A list of stat values to calculate.
 * @returns {object} A quantification object.
 */
dwv.math.Ellipse.prototype.quantify = function (viewController, flags) {
  var quant = {};
  // surface
  var spacing = viewController.get2DSpacing();
  var surface = this.getWorldSurface(spacing[0], spacing[1]);
  if (surface !== null) {
    quant.surface = {value: surface / 100, unit: dwv.i18n('unit.cm2')};
  }

  // pixel quantification
  if (viewController.canQuantifyImage()) {
    var regions = this.getRound();
    if (regions.length !== 0) {
      var values = viewController.getImageVariableRegionValues(regions);
      var quantif = dwv.math.getStats(values, flags);
      quant.min = {value: quantif.getMin(), unit: ''};
      quant.max = {value: quantif.getMax(), unit: ''};
      quant.mean = {value: quantif.getMean(), unit: ''};
      quant.stdDev = {value: quantif.getStdDev(), unit: ''};
      if (typeof quantif.getMedian !== 'undefined') {
        quant.median = {value: quantif.getMedian(), unit: ''};
      }
      if (typeof quantif.getP25 !== 'undefined') {
        quant.p25 = {value: quantif.getP25(), unit: ''};
      }
      if (typeof quantif.getP75 !== 'undefined') {
        quant.p75 = {value: quantif.getP75(), unit: ''};
      }
    }
  }

  // return
  return quant;
};

/**
 * Get the indices that form a ellpise.
 *
 * @param {dwv.math.Index} center The ellipse center.
 * @param {Array} radius The 2 ellipse radiuses.
 * @param {Array} dir The 2 ellipse directions.
 * @returns {Array} The indices of the ellipse.
 */
dwv.math.getEllipseIndices = function (center, radius, dir) {
  var centerValues = center.getValues();
  // keep all values for possible extra dimensions
  var values = centerValues.slice();
  var indices = [];
  var radiusI = radius[0];
  var radiusJ = radius[1];
  var radiusRatio = radiusI / radiusJ;
  var radiusJ2 = Math.pow(radiusJ, 2);
  var di = dir[0];
  var dj = dir[1];
  // deduce 4 positions from top right
  for (var j = 0; j < radiusJ; ++j) {
    // right triangle formed by radiuses, j and len
    // ellipse: i*i / a*a + j*j / b*b = 1
    // -> i = a/b * sqrt(b*b - j*j)
    var len = Math.round(
      radiusRatio * Math.sqrt(radiusJ2 - Math.pow(j, 2)));
    var jmax = centerValues[dj] + j;
    var jmin = centerValues[dj] - j;
    for (var i = 0; i < len; ++i) {
      var imax = centerValues[di] + i;
      var imin = centerValues[di] - i;

      // right
      values[di] = imax;
      // right - top
      values[dj] = jmax;
      indices.push(new dwv.math.Index(values.slice()));
      // right - bottom
      values[dj] = jmin;
      indices.push(new dwv.math.Index(values.slice()));

      // left
      values[di] = imin;
      // left - top
      values[dj] = jmax;
      indices.push(new dwv.math.Index(values.slice()));
      // left - bottom
      values[dj] = jmin;
      indices.push(new dwv.math.Index(values.slice()));
    }
  }
  return indices;
};
