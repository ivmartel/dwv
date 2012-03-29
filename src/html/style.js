// html namespace
dwv.html = dwv.html || {};

/**
* style.js
*/

/**
* Style class.
*/
dwv.html.Style = function()
{
    // immutable
    this.fontSize = 12;
    this.fontStr = "normal "+this.fontSize+"px sans-serif";
    this.lineHeight = this.fontSize + this.fontSize/5;
    this.textColor = "#fff";
    // mutable
    this.lineColor = "yellow";
};

dwv.html.Style.prototype.getFontSize = function() {
    return this.fontSize;
};

dwv.html.Style.prototype.getFontStr = function() {
    return this.fontStr;
};

dwv.html.Style.prototype.getLineHeight = function() {
    return this.lineHeight;
};

dwv.html.Style.prototype.getTextColor = function() {
    return this.textColor;
};

dwv.html.Style.prototype.getLineColor = function() {
    return this.lineColor;
};

dwv.html.Style.prototype.setLineColor = function(color) {
    this.lineColor = color;
};
