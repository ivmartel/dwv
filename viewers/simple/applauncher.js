/** 
 * Application launcher.
 */

// check browser support
dwv.html.browser.check();
// main application
var app = new dwv.App(true);

// jquery
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
    // align layers when the window is resized
    window.onresize = app.resize;
    // possible load from URL
    var inputUrls = dwv.html.getUriParam(); 
    if( inputUrls && inputUrls.length > 0 ) app.loadURL(inputUrls);
});
