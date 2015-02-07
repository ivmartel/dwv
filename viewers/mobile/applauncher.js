/** 
 * Application launcher.
 */

// check browser support
dwv.browser.check();
// main application
var app = new dwv.App();

// launch when page is loaded
$(document).ready( function()
{
    // Add required loaders to the loader list
    dwv.io.loaders = {};
    dwv.io.loaders.file = dwv.io.File;
    dwv.io.loaders.url = dwv.io.Url;

    // append load container HTML
    dwv.gui.appendLoadboxHtml();
    // append loaders HTML
    dwv.gui.appendFileLoadHtml();
    dwv.gui.appendUrlLoadHtml();
    dwv.gui.displayFileLoadHtml(true);

    var config = {
        "containerDivId": "dwv",
        "fitToWindow": true,
        "tools": ["Window/Level", "Zoom/Pan", "Scroll", "Draw", "Livewire", "Filter"],
        "filters": ["Threshold", "Sharpen", "Sobel"],
        "shapes": ["Line", "Protractor", "Rectangle", "Roi", "Ellipse"]
    };

    // initialise the application
    app.init(config);

    // append help HTML
    dwv.gui.appendHelpHtml(app, true);
    dwv.gui.appendVersionHtml(app);
    dwv.gui.appendUndoHtml();

    
    var size = dwv.gui.getWindowSize();
    $(".layerContainer").height(size.height);

});
