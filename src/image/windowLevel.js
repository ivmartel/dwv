// namespaces
var dwv = dwv || {};
dwv.image = dwv.image || {};

/**
 * WindowLevel class.
 * <br>Pseudo-code:
 * <pre>
 *  if (x <= c - 0.5 - (w-1)/2), then y = ymin
 *  else if (x > c - 0.5 + (w-1)/2), then y = ymax,
 *  else y = ((x - (c - 0.5)) / (w-1) + 0.5) * (ymax - ymin) + ymin
 * </pre>
 *
 * @param {Number} center The window center.
 * @param {Number} width The window width.
 * @constructor
 * @see DICOM doc for [Window Center and Window Width]{@link http://dicom.nema.org/dicom/2013/output/chtml/part03/sect_C.11.html#sect_C.11.2.1.2}
 *
 */
dwv.image.WindowLevel = function (center, width) {
  // avoid zero width
  if (width === 0) {
    throw new Error('A window level with a width of zero is not possible.');
  }

  /**
     * Signed data offset. Defaults to 0.
     * @private
     * @type Number
     */
  var signedOffset = 0;
  /**
     * Output value minimum. Defaults to 0.
     * @private
     * @type Number
     */
  var ymin = 0;
  /**
     * Output value maximum. Defaults to 255.
     * @private
     * @type Number
     */
  var ymax = 255;

  /**
     * Input value minimum (calculated).
     * @private
     * @type Number
     */
  var xmin = null;
  /**
     * Input value maximum (calculated).
     * @private
     * @type Number
     */
  var xmax = null;
  /**
     * Window level equation slope (calculated).
     * @private
     * @type Number
     */
  var slope = null;
  /**
     * Window level equation intercept (calculated).
     * @private
     * @type Number
     */
  var inter = null;

  /**
     * Initialise members. Called at construction.
     * @private
     */
  function init() {
    var c = center + signedOffset;
    // from the standard
    xmin = c - 0.5 - ((width - 1) / 2);
    xmax = c - 0.5 + ((width - 1) / 2);
    // develop the equation:
    // y = ( ( x - (c - 0.5) ) / (w-1) + 0.5 ) * (ymax - ymin) + ymin
    // y = ( x / (w-1) ) * (ymax - ymin) +
    //     ( -(c - 0.5) / (w-1) + 0.5 ) * (ymax - ymin) + ymin
    slope = (ymax - ymin) / (width - 1);
    inter = (-(c - 0.5) / (width - 1) + 0.5) * (ymax - ymin) + ymin;
  }

  // call init
  init();

  /**
     * Get the window center.
     * @return {Number} The window center.
     */
  this.getCenter = function () {
    return center;
  };
  /**
     * Get the window width.
     * @return {Number} The window width.
     */
  this.getWidth = function () {
    return width;
  };

  /**
     * Set the output value range.
     * @param {Number} min The output value minimum.
     * @param {Number} max The output value maximum.
     */
  this.setRange = function (min, max) {
    ymin = parseInt(min, 10);
    ymax = parseInt(max, 10);
    // re-initialise
    init();
  };
  /**
   * Set the signed offset.
   * @param {Number} offset The signed data offset,
   *   typically: slope * ( size / 2).
   */
  this.setSignedOffset = function (offset) {
    signedOffset = offset;
    // re-initialise
    init();
  };

  /**
     * Apply the window level on an input value.
     * @param {Number} value The value to rescale as an integer.
     * @return {Number} The leveled value, in the
     *  [ymin, ymax] range (default [0,255]).
     */
  this.apply = function (value) {
    if (value <= xmin) {
      return ymin;
    } else if (value > xmax) {
      return ymax;
    } else {
      return parseInt(((value * slope) + inter), 10);
    }
  };

};

/**
 * Check for window level equality.
 * @param {Object} rhs The other window level to compare to.
 * @return {Boolean} True if both window level are equal.
 */
dwv.image.WindowLevel.prototype.equals = function (rhs) {
  return rhs !== null &&
        this.getCenter() === rhs.getCenter() &&
        this.getWidth() === rhs.getWidth();
};

/**
 * Get a string representation of the window level.
 * @return {String} The window level as a string.
 */
dwv.image.WindowLevel.prototype.toString = function () {
  return (this.getCenter() + ', ' + this.getWidth());
};
