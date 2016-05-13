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

// check browser support
dwv.browser.check();
//initialise i18n
dwv.i18nInitialise();
// launch when page is loaded
document.addEventListener("DOMContentLoaded", function (/*event*/)
{
    // and i18n is loaded
    dwv.i18nOnLoaded( startApp );
});
