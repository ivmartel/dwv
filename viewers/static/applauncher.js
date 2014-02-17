/** 
 * Application launcher.
 */

function toggle(dialogId)
{
    if( $(dialogId).dialog('isOpen') ) $(dialogId).dialog('close');
    else $(dialogId).dialog('open');
}

// check browser support
dwv.html.browser.check();
// main application
var app = new dwv.App();

// jquery
$(document).ready(function(){
    // initialise buttons
    $("button").button();
    $("#toggleInfoLayer").button({ icons: 
        { primary: "ui-icon-comment" }, text: false });
    // create dialogs
    $("#openData").dialog({ position: 
        {my: "left top", at: "left top", of: "#pageMain"} });
    $("#toolbox").dialog({ position: 
        {my: "left top+200", at: "left top", of: "#pageMain"} });
    $("#history").dialog({ position: 
        {my: "left top+370", at: "left top", of: "#pageMain"},
        autoOpen: false });
    $("#tags").dialog({ position: 
        {my: "right top", at: "right top", of: "#pageMain"},
        autoOpen: false, width: 500, height: 590 });
    $("#help").dialog({ position: 
        {my: "right top", at: "right top", of: "#pageMain"},
        autoOpen: false, width: 500, height: 590 });
    
    // image dialog
    $("#layerDialog").dialog({ position: 
        {my: "left+320 top", at: "left top", of: "#pageMain"}});
    // default size
    $("#layerDialog").dialog({ width: "auto", resizable: false });
    // Resizable but keep aspect ratio
    // TODO it seems to add a border that bothers getting the cursor position...
    //$("#layerContainer").resizable({ aspectRatio: true });
        
    // button listeners
    var button = null;
    // open
    button = document.getElementById("open-btn");
    if( button ) button.onclick = function() { toggle("#openData"); };
    // toolbox
    button = document.getElementById("toolbox-btn");
    if( button ) button.onclick = function() { toggle("#toolbox"); };
    // history
    button = document.getElementById("history-btn");
    if( button ) button.onclick = function() { toggle("#history"); };
    // tags
    button = document.getElementById("tags-btn");
    if( button ) button.onclick = function() { toggle("#tags"); };
    // layerDialog
    button = document.getElementById("layerDialog-btn");
    if( button ) button.onclick = function() { toggle("#layerDialog"); };
    // info
    button = document.getElementById("info-btn");
    if( button ) button.onclick = function() { app.toggleInfoLayerDisplay(); };
    // help
    button = document.getElementById("help-btn");
    if( button ) button.onclick = function() { toggle("#help"); };
    
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
    dwv.tool.tools.navigate = new dwv.tool.Navigate(app);
    dwv.tool.tools.scroll = new dwv.tool.Scroll(app);
    dwv.tool.tools.draw = new dwv.tool.Draw(app);
    dwv.tool.tools.livewire = new dwv.tool.Livewire(app);

    // Add the filter to the filter list
    dwv.tool.tools.filter = new dwv.tool.Filter(app);
    dwv.tool.filters = {};
    dwv.tool.filters.threshold = new dwv.tool.filter.Threshold(app);
    dwv.tool.filters.sharpen = new dwv.tool.filter.Sharpen(app);
    dwv.tool.filters.sobel = new dwv.tool.filter.Sobel(app);

    // append tool container HTML
    dwv.gui.appendToolboxHtml();
    // append tools HTML
    dwv.gui.appendWindowLevelHtml();
    dwv.gui.appendNavigateHtml();
    dwv.gui.appendScrollHtml();
    dwv.gui.appendDrawHtml();
    dwv.gui.appendLivewireHtml();
    
    // append filter container HTML
    dwv.gui.appendFilterHtml();
    // append filters HTML
    dwv.gui.filter.appendThresholdHtml();
    dwv.gui.filter.appendSharpenHtml();
    dwv.gui.filter.appendSobelHtml();
    
    // append help HTML
    dwv.gui.appendHelpHtml(false);
    dwv.gui.base.appendVersionHtml();
    dwv.gui.appendUndoHtml();

    // initialise the application
    app.init();
    // align layers when the window is resized
    window.onresize = app.resize;
    // possible load from URL
    var inputUrls = dwv.html.getUriParam(); 
    if( inputUrls && inputUrls.length > 0 ) app.loadURL(inputUrls);
    
    // help
    // TODO Seems accordion only works when at end...
    $("#accordion").accordion({ collapsible: "true", active: "false", heightStyle: "content" });
});
