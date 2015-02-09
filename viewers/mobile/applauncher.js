/** 
 * Application launcher.
 */

// check browser support
dwv.browser.check();

// launch when page is loaded
$(document).ready( function()
{
    // main application
    var myapp = new dwv.App();
    // initialise the application
    myapp.init({
        "containerDivId": "dwv",
        "fitToWindow": true,
        "tools": ["Window/Level", "Zoom/Pan", "Scroll", "Draw", "Livewire", "Filter"],
        "filters": ["Threshold", "Sharpen", "Sobel"],
        "shapes": ["Line", "Protractor", "Rectangle", "Roi", "Ellipse"],
        "gui": ["tool", "load", "help", "undo", "version", "tags"],
        "isMobile": true
    });

    var size = dwv.gui.getWindowSize();
    $(".layerContainer").height(size.height);

});
