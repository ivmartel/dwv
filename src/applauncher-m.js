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

    // Add required tools to the tool list
    dwv.tool.tools = {};
    dwv.tool.tools.windowlevel = new dwv.tool.WindowLevel(app);
    dwv.tool.tools.zoom = new dwv.tool.Zoom(app);
    dwv.tool.tools.draw = new dwv.tool.Draw(app);
    dwv.tool.tools.livewire = new dwv.tool.Livewire(app);

    // Add the filter to the filter list
    dwv.tool.tools.filter = new dwv.tool.Filter(app);
    dwv.tool.filters = {};
    dwv.tool.filters.threshold = new dwv.tool.filter.Threshold(app);
    dwv.tool.filters.sharpen = new dwv.tool.filter.Sharpen(app);
    dwv.tool.filters.sobel = new dwv.tool.filter.Sobel(app);

    dwv.gui.appendToolboxHtml();
    dwv.gui.appendWindowLevelHtml();
    dwv.gui.appendZoomHtml();
    dwv.gui.appendDrawHtml();
    dwv.gui.appendLivewireHtml();

    dwv.gui.appendFilterHtml();
    dwv.gui.filter.appendThresholdHtml();
    dwv.gui.filter.appendSharpenHtml();
    dwv.gui.filter.appendSobelHtml();
    
    // initialise the application
    app.init();
    // align layers when the window is resized
    window.onresize = app.resize;
    // possible load from URL
    var inputUrls = dwv.html.getUriParam(); 
    if( inputUrls && inputUrls.length > 0 ) app.loadURL(inputUrls);
});
