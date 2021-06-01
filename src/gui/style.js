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
   * Base scale.
   *
   * @private
   * @type {object}
   */
  var baseScale = {x: 1, y: 1};
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
   * Set the base scale.
   *
   * @param {number} scale The scale as {x,y}.
   */
  this.setBaseScale = function (scale) {
    baseScale = scale;
  };

  /**
   * Set the zoom scale.
   *
   * @param {object} scale The scale as {x,y}.
   */
  this.setZoomScale = function (scale) {
    zoomScale = scale;
  };

  /**
   * Get the base scale.
   *
   * @returns {number} The scale as {x,y}.
   */
  this.getBaseScale = function () {
    return baseScale;
  };

  /**
   * Get the zoom scale.
   *
   * @returns {object} The scale as {x,y}.
   */
  this.getZoomScale = function () {
    return zoomScale;
  };

  /**
   * Scale an input value using the base scale.
   *
   * @param {number} value The value to scale.
   * @returns {number} The scaled value.
   */
  this.scale = function (value) {
    // TODO: 2D?
    return value / baseScale.x;
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
  return dwv.utils.getShadowColour(this.getLineColour());
};
