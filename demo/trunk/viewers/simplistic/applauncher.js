/**
 * Application launcher.
 */

// check browser support
dwv.browser.check();

// launch when page is loaded
document.addEventListener("DOMContentLoaded", function (/*event*/)
{
    // main application
    var myapp = new dwv.App();
    // initialise the application
    myapp.init({
        "containerDivId": "dwv",
        "fitToWindow": false,
        "tools": ["Scroll", "Zoom/Pan", "Window/Level"],
        "gui": ["tool"],
        "isMobile": true
    });
    dwv.gui.appendResetHtml(myapp);
});
