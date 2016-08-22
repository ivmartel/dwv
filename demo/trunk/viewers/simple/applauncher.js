/**
 * Application launcher.
 */

// start app function
function startApp() {
    // main application
    var myapp = new dwv.App();
    // initialise the application
    myapp.init({
        "containerDivId": "dwv",
        "fitToWindow": true,
        "gui": ["tool"],
        "tools": ["Scroll", "ZoomAndPan", "WindowLevel"],
        "isMobile": true
    });
    dwv.gui.appendResetHtml(myapp);
}

// Image decoders (for web workers)
dwv.image.decoderScripts = {
    "jpeg2000": "../../ext/pdfjs/decode-jpeg2000.js",
    "jpeg-lossless": "../../ext/rii-mango/decode-jpegloss.js",
    "jpeg-baseline": "../../ext/notmasteryet/decode-jpegbaseline.js"
};

// check browser support
dwv.browser.check();
// initialise i18n
dwv.i18nInitialise("auto", "/dwv/demo/trunk");
// launch when page is loaded
$(document).ready( function()
{
    // and i18n is loaded
    dwv.i18nOnLoaded( startApp );
});
