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
dwv.html.Style = function ()
{
    /**
     * Font size.
     * @property fontSize
     * @private
     * @type Number
     */
    var fontSize = 12;
    /**
     * Font family.
     * @property fontFamily
     * @private
     * @type String
     */
    var fontFamily = "Verdana";
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
    var lineColour = "";
    /**
     * Display scale.
     * @property scale
     * @private
     * @type Number
     */
    var displayScale = 1;
    /**
     * Stroke width.
     * @property strokeWidth
     * @private
     * @type Number
     */
    var strokeWidth = 2;

    /**
     * Get the font family.
     * @method getFontFamily
     * @return {String} The font family.
     */
    this.getFontFamily = function () { return fontFamily; };

    /**
     * Get the font size.
     * @method getFontSize
     * @return {Number} The font size.
     */
    this.getFontSize = function () { return fontSize; };

    /**
     * Get the stroke width.
     * @method getStrokeWidth
     * @return {Number} The stroke width.
     */
    this.getStrokeWidth = function () { return strokeWidth; };

    /**
     * Get the text colour.
     * @method getTextColour
     * @return {String} The text colour.
     */
    this.getTextColour = function () { return textColour; };

    /**
     * Get the line colour.
     * @method getLineColour
     * @return {String} The line colour.
     */
    this.getLineColour = function () { return lineColour; };

    /**
     * Set the line colour.
     * @method setLineColour
     * @param {String} colour The line colour.
     */
    this.setLineColour = function (colour) { lineColour = colour; };

    /**
     * Set the display scale.
     * @method setScale
     * @param {String} scale The display scale.
     */
    this.setScale = function (scale) { displayScale = scale; };

    /**
     * Scale an input value.
     * @method scale
     * @param {Number} value The value to scale.
     */
    this.scale = function (value) { return value / displayScale; };
};

/**
 * Get the font definition string.
 * @method getFontStr
 * @return {String} The font definition string.
 */
dwv.html.Style.prototype.getFontStr = function ()
{
    return ("normal " + this.getFontSize() + "px sans-serif");
};

/**
 * Get the line height.
 * @method getLineHeight
 * @return {Number} The line height.
 */
dwv.html.Style.prototype.getLineHeight = function ()
{
    return ( this.getFontSize() + this.getFontSize() / 5 );
};

/**
 * Get the font size scaled to the display.
 * @method getScaledFontSize
 * @return {Number} The scaled font size.
 */
dwv.html.Style.prototype.getScaledFontSize = function ()
{
    return this.scale( this.getFontSize() );
};

/**
 * Get the stroke width scaled to the display.
 * @method getScaledStrokeWidth
 * @return {Number} The scaled stroke width.
 */
dwv.html.Style.prototype.getScaledStrokeWidth = function ()
{
    return this.scale( this.getStrokeWidth() );
};
