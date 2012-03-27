/**
* style.js
*/

/**
* Style.
*/
function Style()
{
    // immutable
    this.fontSize = 12;
    this.fontStr = "normal "+this.fontSize+"px sans-serif";
    this.lineHeight = this.fontSize + this.fontSize/5;
    this.textColor = "#fff";
    // mutable
    this.lineColor = "yellow";
}

Style.prototype.getFontSize = function() {
    return this.fontSize;
};

Style.prototype.getFontStr = function() {
    return this.fontStr;
};

Style.prototype.getLineHeight = function() {
    return this.lineHeight;
};

Style.prototype.getTextColor = function() {
    return this.textColor;
};

Style.prototype.getLineColor = function() {
    return this.lineColor;
};

Style.prototype.setLineColor = function(color) {
    this.lineColor = color;
};



