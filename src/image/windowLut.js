// namespaces
var dwv = dwv || {};
dwv.image = dwv.image || {};

/**
 * Window LUT class.
  * Typically converts from float to integer.
 * @constructor
 * @param {Number} rescaleLut The associated rescale LUT.
 * @param {Boolean} isSigned Flag to know if the data is signed or not.
 */
dwv.image.WindowLut = function (rescaleLut, isSigned)
{
    /**
     * The internal array: Uint8ClampedArray clamps between 0 and 255.
     * @private
     * @type Uint8ClampedArray
     */
    var lut = null;

    /**
     * The window level.
     * @private
     * @type {Object}
     */
    var windowLevel = null;

    /**
     * Flag to know if the lut is ready or not.
     * @private
     * @type Boolean
     */
    var isReady = false;

    /**
     * Shift for signed data.
     * @private
     * @type Number
     */
    var signedShift = 0;

    /**
     * Get the window / level.
     * @return {Object} The window / level.
     */
    this.getWindowLevel = function () { return windowLevel; };
    /**
     * Get the signed flag.
     * @return {Boolean} The signed flag.
     */
    this.isSigned = function () { return isSigned; };
    /**
     * Get the rescale lut.
     * @return {Object} The rescale lut.
     */
    this.getRescaleLut = function () { return rescaleLut; };

    /**
     * Is the lut ready to use or not? If not, the user must
     * call 'update'.
     * @return {Boolean} True if the lut is ready to use.
     */
    this.isReady = function () { return isReady; };

    /**
     * Set the window center and width.
     * @param {Object} wl The window level.
     */
    this.setWindowLevel = function (wl) {
        // store the window values
        windowLevel = wl;
        // possible signed shift
        signedShift = 0;
        windowLevel.setSignedOffset(0);
        if (isSigned) {
            var size = rescaleLut.getLength();
            signedShift = size / 2;
            windowLevel.setSignedOffset(rescaleLut.getRSI().getSlope() * signedShift);
        }
        // update ready flag
        isReady = false;
    };

    /**
     * Update the lut if needed..
     */
    this.update = function () {
        // check if we need to update
        if (isReady) {
            return;
        }

        // check rescale lut
        if (!rescaleLut.isReady()) {
            rescaleLut.initialise();
        }
        // create window lut
        var size = rescaleLut.getLength();
        if (!lut) {
            // use clamped array (polyfilled in env.js)
            lut = new Uint8ClampedArray(size);
        }
        // by default WindowLevel returns a value in the [0,255] range
        // this is ok with regular Arrays and ClampedArray.
        for (var i = 0; i < size; ++i) {
            lut[i] = windowLevel.apply( rescaleLut.getValue(i) );
        }

        // update ready flag
        isReady = true;
    };

    /**
     * Get the length of the LUT array.
     * @return {Number} The length of the LUT array.
     */
    this.getLength = function () { return lut.length; };

    /**
     * Get the value of the LUT at the given offset.
     * @param {Number} offset The input offset in [0,2^bitsStored] range.
     * @return {Number} The integer value (default [0,255]) of the LUT at the given offset.
     */
    this.getValue = function (offset) {
        return lut[offset + signedShift];
    };
};
