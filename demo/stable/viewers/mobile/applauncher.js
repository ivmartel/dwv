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
        "tools": ["Scroll", "Window/Level", "Zoom/Pan", "Draw", "Livewire", "Filter"],
        "filters": ["Threshold", "Sharpen", "Sobel"],
        "shapes": ["Line", "Protractor", "Rectangle", "Roi", "Ellipse"],
        "gui": ["tool", "load", "help", "undo", "version", "tags"],
        "isMobile": true
    });
    
    // example app listening
    /*var consoleFunc = function (event) { console.log("event: "+event.type); };
    myapp.addEventListener("draw-create", consoleFunc);
    myapp.addEventListener("draw-move", consoleFunc);
    myapp.addEventListener("draw-change", consoleFunc);
    myapp.addEventListener("draw-delete", consoleFunc);*/

    var size = dwv.gui.getWindowSize();
    $(".layerContainer").height(size.height);

});
