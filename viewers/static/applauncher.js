/**
 * Application launcher.
 */

// check browser support
dwv.browser.check();

// launch when page is loaded
$(document).ready( function()
{
    // gui setup
    dwv.gui.setup();

    // main application
    var myapp = new dwv.App();
    // initialise the application
    myapp.init({
        "containerDivId": "dwv",
        "fitToWindow": true,
        "gui": ["tool", "load", "help", "undo", "version", "tags"],
        "loaders": ["File", "Url"],
        "tools": ["Scroll", "Window/Level", "Zoom/Pan", "Draw", "Livewire", "Filter", "Floodfill"],
        "filters": ["Threshold", "Sharpen", "Sobel"],
        "shapes": ["Line", "Protractor", "Rectangle", "Roi", "Ellipse"],
        "isMobile": false
    });

    // help
    // TODO Seems accordion only works when at end...
    $("#accordion").accordion({ collapsible: "true", active: "false", heightStyle: "content" });

    myapp.addEventListener("livewire-start", function(){
        console.log('Getting ready...');
    });
    myapp.addEventListener("livewire-end", function(){
        console.log('Ready!');
    });
});
