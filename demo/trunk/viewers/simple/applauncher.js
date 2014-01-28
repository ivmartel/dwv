//check browser support
dwv.html.browser.check();
// main application
var app = new dwv.App(true);

// jquery
$(document).ready(function(){
    // button listeners
    var button = null;
    // undo
    button = document.getElementById("undo-btn");
    if( button ) button.onclick = function() { app.getUndoStack().undo(); };
    // undo
    button = document.getElementById("redo-btn");
    if( button ) button.onclick = function() { app.getUndoStack().redo(); };
    // info
    button = document.getElementById("info-btn");
    if( button ) button.onclick = function() { app.toggleInfoLayerDisplay(); };

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

    // Add required tools to the tool list
    dwv.tool.tools = {};
    dwv.tool.tools.windowlevel = new dwv.tool.WindowLevel(app);
    dwv.tool.tools.zoom = new dwv.tool.Zoom(app);

    // append tool container HTML
    dwv.gui.appendToolboxHtml();
    // append tools HTML
    dwv.gui.appendWindowLevelHtml();
    dwv.gui.appendZoomHtml();
    
    // initialise the application
    app.init();
    // align layers when the window is resized
    window.onresize = app.resize;
    // possible load from URL
    var inputUrls = dwv.html.getUriParam(); 
    if( inputUrls && inputUrls.length > 0 ) app.loadURL(inputUrls);
});
