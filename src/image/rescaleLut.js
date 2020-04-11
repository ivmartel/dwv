// namespaces
var dwv = dwv || {};
dwv.image = dwv.image || {};

/**
 * Rescale LUT class.
 * Typically converts from integer to float.
 * @constructor
 * @param {Object} rsi The rescale slope and intercept.
 * @param {Number} bitsStored The number of bits used to store the data.
 */
dwv.image.RescaleLut = function (rsi, bitsStored)
{
    /**
     * The internal array.
     * @private
     * @type Float32Array
     */
    var lut = null;

    /**
     * Flag to know if the lut is ready or not.
     * @private
     * @type Boolean
     */
    var isReady = false;

    /**
     * The size of the LUT array.
     * @private
     * @type Number
     */
    var length = Math.pow(2, bitsStored);

    /**
     * Get the Rescale Slope and Intercept (RSI).
     * @return {Object} The rescale slope and intercept object.
     */
    this.getRSI = function () { return rsi; };

    /**
     * Is the lut ready to use or not? If not, the user must
     * call 'initialise'.
     * @return {Boolean} True if the lut is ready to use.
     */
    this.isReady = function () { return isReady; };

    /**
     * Initialise the LUT.
     */
    this.initialise = function () {
        // check if already initialised
        if (isReady) {
            return;
        }
        // create lut and fill it
        lut = new Float32Array(length);
        for (var i = 0; i < length; ++i) {
            lut[i] = rsi.apply(i);
        }
        // update ready flag
        isReady = true;
    };

    /**
     * Get the length of the LUT array.
     * @return {Number} The length of the LUT array.
     */
    this.getLength = function () { return length; };

    /**
     * Get the value of the LUT at the given offset.
     * @param {Number} offset The input offset in [0,2^bitsStored] range.
     * @return {Number} The float32 value of the LUT at the given offset.
     */
    this.getValue = function (offset) {
        return lut[offset];
    };
};
