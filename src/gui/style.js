/** 
 * HTML module.
 * @module html
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
    /**
     * Font size.
     * @property fontSize
     * @private
     * @type Number
     */
    var fontSize = 12;
    /**
     * Font definition string.
     * @property fontStr
     * @private
     * @type String
     */
    var fontStr = "normal "+this.fontSize+"px sans-serif";
    /**
     * Line height.
     * @property lineHeight
     * @private
     * @type Number
     */
    var lineHeight = this.fontSize + this.fontSize/5;
    /**
     * Text color.
     * @property textColor
     * @private
     * @type String
     */
    var textColor = "#fff";
    /**
     * Line color.
     * @property lineColor
     * @private
     * @type String
     */
    var lineColor = 0;
    
    /**
     * Get the font size.
     * @method getFontSize
     * @return {Number} The font size.
     */
    dwv.html.Style.prototype.getFontSize = function() { return fontSize; };

    /**
     * Get the font definition string.
     * @method getFontStr
     * @return {String} The font definition string.
     */
    dwv.html.Style.prototype.getFontStr = function() { return fontStr; };

    /**
     * Get the line height.
     * @method getLineHeight
     * @return {Number} The line height.
     */
    dwv.html.Style.prototype.getLineHeight = function() { return lineHeight; };

    /**
     * Get the text color.
     * @method getTextColor
     * @return {String} The text color.
     */
    dwv.html.Style.prototype.getTextColor = function() { return textColor; };

    /**
     * Get the line color.
     * @method getLineColor
     * @return {String} The line color.
     */
    dwv.html.Style.prototype.getLineColor = function() { return lineColor; };

    /**
     * Set the line color.
     * @method setLineColor
     * @param {String} color The line color.
     */
    dwv.html.Style.prototype.setLineColor = function(color) { lineColor = color; };
};
