/**
 * Application launcher.
 */

// start app function
function startApp() {
    // translate page
    dwv.i18nPage();

    // main application
    var myapp = new dwv.App();

    // display loading time
    var listener = function (event) {
        if (event.type === "load-start") {
            console.time("load-data");
        }
        else {
            console.timeEnd("load-data");
        }
    };

    // before myapp.init since it does the url load
    myapp.addEventListener("load-start", listener);
    myapp.addEventListener("load-end", listener);

    // also available:
    //myapp.addEventListener("load-progress", listener);
    //myapp.addEventListener("draw-create", listener);
    //myapp.addEventListener("draw-move", listener);
    //myapp.addEventListener("draw-change", listener);
    //myapp.addEventListener("draw-delete", listener);
    //myapp.addEventListener("wl-width-change", listener);
    //myapp.addEventListener("wl-center-change", listener);
    //myapp.addEventListener("colour-change", listener);
    //myapp.addEventListener("position-change", listener);
    //myapp.addEventListener("slice-change", listener);
    //myapp.addEventListener("frame-change", listener);
    //myapp.addEventListener("zoom-change", listener);
    //myapp.addEventListener("offset-change", listener);
    //myapp.addEventListener("filter-run", listener);
    //myapp.addEventListener("filter-undo", listener);

    // initialise the application
    myapp.init({
        "containerDivId": "dwv",
        "fitToWindow": true,
        "gui": ["tool", "load", "help", "undo", "version", "tags", "drawList"],
        "loaders": ["File", "Url", "GoogleDrive", "Dropbox"],
        "tools": ["Scroll", "WindowLevel", "ZoomAndPan", "Draw", "Livewire", "Filter", "Floodfill"],
        "filters": ["Threshold", "Sharpen", "Sobel"],
        "shapes": ["Arrow", "Ruler", "Protractor", "Rectangle", "Roi", "Ellipse", "FreeHand"],
        "isMobile": true
        //"defaultCharacterSet": "chinese"
    });

    var size = dwv.gui.getWindowSize();
    $(".layerContainer").height(size.height);
}

// Image decoders (for web workers)
dwv.image.decoderScripts = {
    //"jpeg2000": "../../decoders/pdfjs/decode-jpeg2000.js",
    "jpeg2000": "../../decoders/openjpeg/decode-jpeg2000.js",
    "jpeg-lossless": "../../decoders/rii-mango/decode-jpegloss.js",
    "jpeg-baseline": "../../decoders/pdfjs/decode-jpegbaseline.js"
};

// check browser support
dwv.browser.check();
// initialise i18n
dwv.i18nInitialise();

// status flags
var domContentLoaded = false;
var i18nLoaded = false;
// launch when both DOM and i18n are ready
function launchApp() {
    if ( domContentLoaded && i18nLoaded ) {
        startApp();
    }
}
// DOM ready?
$(document).ready( function() {
    domContentLoaded = true;
    launchApp();
});
// i18n ready?
dwv.i18nOnLoaded( function () {
    // call next once the overlays are loaded
    var onLoaded = function (data) {
        dwv.gui.info.overlayMaps = data;
        i18nLoaded = true;
        launchApp();
    };
    // load overlay map info
    $.getJSON( dwv.i18nGetLocalePath("overlays.json"), onLoaded )
    .fail( function () {
        console.log("Using fallback overlays.");
        $.getJSON( dwv.i18nGetFallbackLocalePath("overlays.json"), onLoaded );
    });
});
