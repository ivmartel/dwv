// namespaces
var dwv = dwv || {};
/** @namespace */
dwv.browser = dwv.browser || {};

/**
 * Browser check for the FileAPI.
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
    return "FileReader" in window;
};

/**
 * Browser check for the XMLHttpRequest.
 */
dwv.browser.hasXmlHttpRequest = function()
{
    return "XMLHttpRequest" in window && "withCredentials" in new XMLHttpRequest();
};

/**
 * Browser check for typed array.
 */
dwv.browser.hasTypedArray = function()
{
    return "Uint8Array" in window && "Uint16Array" in window;
};

/**
 * Browser check for clamped array.
 */
dwv.browser.hasClampedArray = function()
{
    return "Uint8ClampedArray" in window;
};

/**
 * Browser checks to see if it can run dwv. Throws an error if not.
 * @todo Maybe use {@link http://modernizr.com/}.
 */
dwv.browser.check = function()
{
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
    // check clamped array
    if( !dwv.browser.hasClampedArray() ) {
        // silent fail since IE does not support it...
        console.warn("The Uint8ClampedArray is not supported in this browser. This may impair performance. ");
    }
};
