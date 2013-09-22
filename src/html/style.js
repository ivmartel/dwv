/** 
 * HTML module.
 * @module dicom
 */
var dwv = dwv || {};
dwv.html = dwv.html || {};

/**
 * Style class.
 * @class Style
 * @namespace dwv.html
 * @constructor
 */
dwv.html.Style = function()
{
    // immutable
    this.fontSize = 12;
    this.fontStr = "normal "+this.fontSize+"px sans-serif";
    this.lineHeight = this.fontSize + this.fontSize/5;
    this.textColor = "#fff";
    // mutable
    this.lineColor = 0;
};

/**
 * Get the font size.
 * @method getFontSize
 * @return {Number} The font size.
 */
dwv.html.Style.prototype.getFontSize = function() {
    return this.fontSize;
};

/**
 * Get the font definition string.
 * @method getFontStr
 * @return {String} The font definition string.
 */
dwv.html.Style.prototype.getFontStr = function() {
    return this.fontStr;
};

/**
 * Get the line height.
 * @method getLineHeight
 * @return {Number} The line height.
 */
dwv.html.Style.prototype.getLineHeight = function() {
    return this.lineHeight;
};

/**
 * Get the text color.
 * @method getTextColor
 * @return {String} The text color.
 */
dwv.html.Style.prototype.getTextColor = function() {
    return this.textColor;
};

/**
 * Get the line color.
 * @method getLineColor
 * @return {String} The line color.
 */
dwv.html.Style.prototype.getLineColor = function() {
    return this.lineColor;
};

/**
 * Set the line color.
 * @method setLineColor
 * @param {String} color The line color.
 */
dwv.html.Style.prototype.setLineColor = function(color) {
    this.lineColor = color;
};

