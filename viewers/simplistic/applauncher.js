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
        "containerDivId": "dwv-0",
        "fitToWindow": true,
        "tools": ["Scroll", "Zoom/Pan", "Window/Level"],
        "gui": ["tool"],
        "isMobile": true
    });
    dwv.gui.appendResetHtml(myapp);

    // main application
    var myapp1 = new dwv.App();
    // initialise the application
    myapp1.init({
        "containerDivId": "dwv-1",
        "fitToWindow": true,
        "tools": ["Scroll", "Zoom/Pan", "Window/Level"],
        "gui": ["tool"],
        "isMobile": true
    });
    dwv.gui.appendResetHtml(myapp1);
});
