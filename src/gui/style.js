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
     * Text colour.
     * @property textColour
     * @private
     * @type String
     */
    var textColour = "#fff";
    /**
     * Line colour.
     * @property lineColour
     * @private
     * @type String
     */
    var lineColour = 0;
    
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
     * Get the text colour.
     * @method getTextColour
     * @return {String} The text colour.
     */
    dwv.html.Style.prototype.getTextColour = function() { return textColour; };

    /**
     * Get the line colour.
     * @method getLineColour
     * @return {String} The line colour.
     */
    dwv.html.Style.prototype.getLineColour = function() { return lineColour; };

    /**
     * Set the line colour.
     * @method setLineColour
     * @param {String} colour The line colour.
     */
    dwv.html.Style.prototype.setLineColour = function(colour) { lineColour = colour; };
};
