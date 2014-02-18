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
    dwv.io.loaders.url = dwv.io.Url;

    // Add required tools to the tool list
    dwv.tool.tools = {};
    dwv.tool.tools.scroll = new dwv.tool.Scroll(app);
    dwv.tool.tools.zoom = new dwv.tool.Zoom(app);
    dwv.tool.tools.pan = new dwv.tool.Pan(app);
    dwv.tool.tools.windowlevel = new dwv.tool.WindowLevel(app);

    // append tool container HTML
    dwv.gui.appendToolboxHtml();
    // append tools HTML
    dwv.gui.appendScrollHtml();
    dwv.gui.appendZoomHtml();
    dwv.gui.appendPanHtml();
    dwv.gui.appendWindowLevelHtml();
    dwv.gui.appendResetHtml();
    
    // initialise the application
    app.init();
});
