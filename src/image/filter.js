/**
 * @namespace Image related.
 */
dwv.image = dwv.image || {};
/**
 * @namespace Filter classes.
 */
dwv.image.filter = dwv.image.filter || {};

/**
 * @function Threshold an image between an input minimum and maximum.
 * @param min The new minimum.
 * @param max The new maximum.
 */
dwv.image.filter.Threshold = function()
{
    var min = 0;
    var max = 0;
    // Get the minimum value.
    this.getMin = function() { return min; };
    // Set the minimum value.
    this.setMin = function(val) { min = val; };
    // Get the maximum value.
    this.getMax = function() { return max; };
    // Set the maximum value.
    this.setMax = function(val) { max = val; };
    // Get the name of the filter.
    this.getName = function() { return "Threshold"; };
};

dwv.image.filter.Threshold.prototype.update = function()
{
    var imageMin = app.getImage().getDataRange().min;
    var self = this;
    var threshFunction = function(value){
        if(value<self.getMin()||value>self.getMax()) return imageMin;
        else return value;
    };
    return app.getImage().transform( threshFunction );
};

/**
 * @function Sharpen an image using a sharpen convolution matrix.
 */
dwv.image.filter.Sharpen = function()
{
    // Get the name of the filter.
    this.getName = function() { return "Sharpen"; };
};

dwv.image.filter.Sharpen.prototype.update = function()
{
    return app.getImage().convolute2D(
        [  0, -1,  0,
          -1,  5, -1,
           0, -1,  0 ] );
};

/**
 * @function Apply a Sobel filter to an image.
 */
dwv.image.filter.Sobel = function()
{
    // Get the name of the filter.
    this.getName = function() { return "Sobel"; };
};

dwv.image.filter.Sobel.prototype.update = function()
{
    var gradX = app.getImage().convolute2D(
        [ 1,  0,  -1,
          2,  0,  -2,
          1,  0,  -1 ] );

    var gradY = app.getImage().convolute2D(
        [  1,  2,  1,
           0,  0,  0,
          -1, -2, -1 ] );
    
    return gradX.compose( gradY, function(x,y){return Math.sqrt(x*x+y*y);} );
};
