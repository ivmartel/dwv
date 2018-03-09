// namespaces
var dwv = dwv || {};
/** @namespace */
dwv.browser = dwv.browser || {};
// external
var Modernizr = Modernizr || {};

/**
 * Browser check for the FileAPI.
 * Assume support for Safari5.
 */
dwv.browser.hasFileApi = function()
{
    // regular test does not work on Safari 5
    var isSafari5 = (navigator.appVersion.indexOf("Safari") !== -1) &&
        (navigator.appVersion.indexOf("Chrome") === -1) &&
        ( (navigator.appVersion.indexOf("5.0.") !== -1) ||
          (navigator.appVersion.indexOf("5.1.") !== -1) );
    if( isSafari5 )
    {
        console.warn("Assuming FileAPI support for Safari5...");
        return true;
    }
    // regular test
    return Modernizr.filereader;
};

/**
 * Browser check for the XMLHttpRequest.
 */
dwv.browser.hasXmlHttpRequest = function()
{
    return Modernizr.xhrresponsetype &&
        Modernizr.xhrresponsetypearraybuffer && Modernizr.xhrresponsetypetext &&
        "XMLHttpRequest" in window && "withCredentials" in new XMLHttpRequest();
};

/**
 * Browser check for typed array.
 */
dwv.browser.hasTypedArray = function()
{
    return Modernizr.dataview && Modernizr.typedarrays;
};

/**
 * Browser check for input with type='color'.
 * Missing in IE and Safari.
 */
dwv.browser.hasInputColor = function()
{
    return Modernizr.inputtypes.color;
};

/**
 * Browser check for input with type='files' and webkitdirectory flag.
 * Missing in IE and Safari.
 */
dwv.browser.hasInputDirectory = function()
{
    return Modernizr.fileinputdirectory;
};


//only check at startup (since we propose a replacement)
dwv.browser._hasTypedArraySlice = (typeof Uint8Array.prototype.slice !== "undefined");

/**
 * Browser check for typed array slice method.
 * Missing in Internet Explorer 11.
 */
dwv.browser.hasTypedArraySlice = function()
{
    return dwv.browser._hasTypedArraySlice;
};

// only check at startup (since we propose a replacement)
dwv.browser._hasFloat64Array = ("Float64Array" in window);

/**
 * Browser check for Float64Array array.
 * Missing in PhantomJS 1.9.20 (on Travis).
 */
dwv.browser.hasFloat64Array = function()
{
    return dwv.browser._hasFloat64Array;
};

//only check at startup (since we propose a replacement)
dwv.browser._hasClampedArray = ("Uint8ClampedArray" in window);

/**
 * Browser check for clamped array.
 * Missing in:
 * - Safari 5.1.7 for Windows
 * - PhantomJS 1.9.20 (on Travis).
 */
dwv.browser.hasClampedArray = function()
{
    return dwv.browser._hasClampedArray;
};

/**
 * Browser checks to see if it can run dwv. Throws an error if not.
 * Silently replaces basic functions.
 */
dwv.browser.check = function()
{

    // Required --------------

    var appnorun = "The application cannot be run.";
    var message = "";
    // Check for the File API support
    if( !dwv.browser.hasFileApi() ) {
        message = "The File APIs are not supported in this browser. ";
        alert(message+appnorun);
        throw new Error(message);
    }
    // Check for XMLHttpRequest
    if( !dwv.browser.hasXmlHttpRequest() ) {
        message = "The XMLHttpRequest is not supported in this browser. ";
        alert(message+appnorun);
        throw new Error(message);
    }
    // Check typed array
    if( !dwv.browser.hasTypedArray() ) {
        message = "The Typed arrays are not supported in this browser. ";
        alert(message+appnorun);
        throw new Error(message);
    }

    // Replaced if not present ------------

    // Check typed array slice
    if( !dwv.browser.hasTypedArraySlice() ) {
        // silent fail with warning
        console.warn("The TypedArray.slice method is not supported in this browser. This may impair performance. ");
        // basic Uint16Array implementation
        Uint16Array.prototype.slice = function (begin, end) {
            var size = end - begin;
            var cloned = new Uint16Array(size);
            for (var i = 0; i < size; i++) {
                cloned[i] = this[begin + i];
            }
            return cloned;
        };
        // basic Int16Array implementation
        Int16Array.prototype.slice = function (begin, end) {
            var size = end - begin;
            var cloned = new Int16Array(size);
            for (var i = 0; i < size; i++) {
                cloned[i] = this[begin + i];
            }
            return cloned;
        };
        // basic Uint8Array implementation
        Uint8Array.prototype.slice = function (begin, end) {
            var size = end - begin;
            var cloned = new Uint8Array(size);
            for (var i = 0; i < size; i++) {
                cloned[i] = this[begin + i];
            }
            return cloned;
        };
        // basic Int8Array implementation
        Int8Array.prototype.slice = function (begin, end) {
            var size = end - begin;
            var cloned = new Int8Array(size);
            for (var i = 0; i < size; i++) {
                cloned[i] = this[begin + i];
            }
            return cloned;
        };
    }
    // check clamped array
    if( !dwv.browser.hasClampedArray() ) {
        // silent fail with warning
        console.warn("The Uint8ClampedArray is not supported in this browser. This may impair performance. ");
        // Use Uint8Array instead... Not good
        // TODO Find better replacement!
        window.Uint8ClampedArray = window.Uint8Array;
    }
    // check Float64 array
    if( !dwv.browser.hasFloat64Array() ) {
        // silent fail with warning
        console.warn("The Float64Array is not supported in this browser. This may impair performance. ");
        // Use Float32Array instead... Not good
        // TODO Find better replacement!
        window.Float64Array = window.Float32Array;
    }

    // check string startsWith
    if ( !String.prototype.startsWith ) {
        String.prototype.startsWith = function (search, pos) {
            return this.substr(!pos || pos < 0 ? 0 : +pos, search.length) === search;
        };
    }
};
