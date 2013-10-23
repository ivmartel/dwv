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

    // initialise the application
    app.init();
    // align layers when the window is resized
    window.onresize = app.resize;
    // possible load from URL
    var inputUrls = dwv.html.getUriParam(); 
    if( inputUrls && inputUrls.length > 0 ) app.loadURL(inputUrls);
});
