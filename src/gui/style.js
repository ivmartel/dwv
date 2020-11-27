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
  var fontSize = 12;
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
   * Stroke width.
   *
   * @private
   * @type {number}
   */
  var strokeWidth = 2;

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
   * @param {string} scale The display scale.
   */
  this.setScale = function (scale) {
    displayScale = scale;
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
