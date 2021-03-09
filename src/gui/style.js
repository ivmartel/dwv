// namespaces
var dwv = dwv || {};
dwv.html = dwv.html || {};

/**
 * Style class.
 *
 * @class
 */
dwv.html.Style = function () {
  /**
   * Font size.
   *
   * @private
   * @type {number}
   */
  var fontSize = 10;
  /**
   * Font family.
   *
   * @private
   * @type {string}
   */
  var fontFamily = 'Verdana';
  /**
   * Text colour.
   *
   * @private
   * @type {string}
   */
  var textColour = '#fff';
  /**
   * Line colour.
   *
   * @private
   * @type {string}
   */
  var lineColour = '#ffff80';
  /**
   * Display scale.
   *
   * @private
   * @type {number}
   */
  var displayScale = 1;
  /**
   * Zoom scale.
   *
   * @private
   * @type {object}
   */
  var zoomScale = {x: 1, y: 1};
  /**
   * Stroke width.
   *
   * @private
   * @type {number}
   */
  var strokeWidth = 2;

  /**
   * Shadow offset.
   *
   * @private
   * @type {object}
   */
  var shadowOffset = {x: 0.25, y: 0.25};
  /**
   * Tag opacity.
   *
   * @private
   * @type {number}
   */
  var tagOpacity = 0.2;
  /**
   * Text padding.
   *
   * @private
   * @type {number}
   */
  var textPadding = 3;

  /**
   * Get the font family.
   *
   * @returns {string} The font family.
   */
  this.getFontFamily = function () {
    return fontFamily;
  };

  /**
   * Get the font size.
   *
   * @returns {number} The font size.
   */
  this.getFontSize = function () {
    return fontSize;
  };

  /**
   * Get the stroke width.
   *
   * @returns {number} The stroke width.
   */
  this.getStrokeWidth = function () {
    return strokeWidth;
  };

  /**
   * Get the text colour.
   *
   * @returns {string} The text colour.
   */
  this.getTextColour = function () {
    return textColour;
  };

  /**
   * Get the line colour.
   *
   * @returns {string} The line colour.
   */
  this.getLineColour = function () {
    return lineColour;
  };

  /**
   * Set the line colour.
   *
   * @param {string} colour The line colour.
   */
  this.setLineColour = function (colour) {
    lineColour = colour;
  };

  /**
   * Set the display scale.
   *
   * @param {number} scale The display scale.
   */
  this.setScale = function (scale) {
    displayScale = scale;
  };

  /**
   * Set the zoom scale.
   *
   * @param {object} scale The zoom scale as {x,y}.
   */
  this.setZoomScale = function (scale) {
    zoomScale = scale;
  };

  /**
   * Get the display scale.
   *
   * @returns {number} The display scale.
   */
  this.getScale = function () {
    return displayScale;
  };

  /**
   * Get the zoom scale.
   *
   * @returns {object} The zoom scale as {x,y}.
   */
  this.getZoomScale = function () {
    return zoomScale;
  };

  /**
   * Scale an input value.
   *
   * @param {number} value The value to scale.
   * @returns {number} The scaled value.
   */
  this.scale = function (value) {
    return value / displayScale;
  };

  /**
   * Apply zoom scale on an input value.
   *
   * @param {number} value The value to scale.
   * @returns {object} The scaled value as {x,y}.
   */
  this.applyZoomScale = function (value) {
    // times 2 so that the font size 10 looks like a 10...
    // (same logic as in the DrawController::updateLabelScale)
    return {
      x: 2 * value / zoomScale.x,
      y: 2 * value / zoomScale.y
    };
  };

  /**
   * Get the shadow offset.
   *
   * @returns {object} The offset as {x,y}.
   */
  this.getShadowOffset = function () {
    return shadowOffset;
  };

  /**
   * Get the tag opacity.
   *
   * @returns {number} The opacity.
   */
  this.getTagOpacity = function () {
    return tagOpacity;
  };

  /**
   * Get the text padding.
   *
   * @returns {number} The padding.
   */
  this.getTextPadding = function () {
    return textPadding;
  };

};

/**
 * Get the font definition string.
 *
 * @returns {string} The font definition string.
 */
dwv.html.Style.prototype.getFontStr = function () {
  return ('normal ' + this.getFontSize() + 'px sans-serif');
};

/**
 * Get the line height.
 *
 * @returns {number} The line height.
 */
dwv.html.Style.prototype.getLineHeight = function () {
  return (this.getFontSize() + this.getFontSize() / 5);
};

/**
 * Get the font size scaled to the display.
 *
 * @returns {number} The scaled font size.
 */
dwv.html.Style.prototype.getScaledFontSize = function () {
  return this.scale(this.getFontSize());
};

/**
 * Get the stroke width scaled to the display.
 *
 * @returns {number} The scaled stroke width.
 */
dwv.html.Style.prototype.getScaledStrokeWidth = function () {
  return this.scale(this.getStrokeWidth());
};

/**
 * Get the shadow line colour.
 *
 * @returns {string} The shadow line colour.
 */
dwv.html.Style.prototype.getShadowLineColour = function () {
  return dwv.html.getShadowColour(this.getLineColour());
};

/**
 * Get the brightness of a colour given in hexadecimal format.
 * See https://github.com/bgrins/TinyColor/blob/1.4.2/tinycolor.js#L70
 *
 * @param {string} hexColour The colour (as '#ab01ef').
 * @returns {number} The brightness (range [0,255]).
 */
dwv.html.getBrightness = function (hexColour) {
  // extract rgb
  var r = parseInt(hexColour.substr(1, 2), 16);
  var g = parseInt(hexColour.substr(3, 2), 16);
  var b = parseInt(hexColour.substr(5, 2), 16);
  return (r * 299 + g * 587 + b * 114) / 1000;
};

/**
 * Check if a colour given in hexadecimal format is dark.
 *
 * @param {string} hexColour The colour (as '#ab01ef').
 * @returns {boolean} True if the coluor is dark (brightness < 128).
 */
dwv.html.isDarkColour = function (hexColour) {
  return dwv.html.getBrightness(hexColour) < 128;
};

/**
 * Get the shadow colour of an input colour.
 *
 * @param {string} hexColour The colour (as '#ab01ef').
 * @returns {string} The shadow colour (white or black).
 */
dwv.html.getShadowColour = function (hexColour) {
  return dwv.html.isDarkColour(hexColour) ? '#fff' : '#000';
};
