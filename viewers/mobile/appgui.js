/** 
 * Application GUI.
 */

// Window
dwv.gui.getWindowSize = function(){
    return dwv.gui.base.getWindowSize();
};
// Progress
dwv.gui.displayProgress = function(percent){
    dwv.gui.base.displayProgress(percent);
};
// Select
dwv.gui.refreshSelect = function(selectName){
    dwv.gui.base.refreshSelect(selectName);
};
// Slider
dwv.gui.Slider = dwv.gui.base.Slider;
// Tags table
dwv.gui.appendTagsTable = function(dataInfo){
    dwv.gui.base.appendTagsTable(dataInfo);
};

// Loaders
dwv.gui.appendLoadboxHtml = function(){
    dwv.gui.base.appendLoadboxHtml();
};

// File loader
dwv.gui.appendFileLoadHtml = function(){
    dwv.gui.base.appendFileLoadHtml();
};
dwv.gui.displayFileLoadHtml = function(bool){
    dwv.gui.base.displayFileLoadHtml(bool);
};

// Url loader
dwv.gui.appendUrlLoadHtml = function(){
    dwv.gui.base.appendUrlLoadHtml();
};
dwv.gui.displayUrlLoadHtml = function(bool){
    dwv.gui.base.displayUrlLoadHtml(bool);
};

// Toolbox 
dwv.gui.Toolbox = function (app)
{
    var base = new dwv.gui.base.Toolbox(app);
    
    this.setup = function (list)
    {
        base.setup(list);
        
        // toolbar
        var buttonClass = "ui-btn ui-btn-inline ui-btn-icon-notext ui-mini"; 
        
        var open = document.createElement("a");
        open.href = "#popupOpen";
        open.setAttribute("class", buttonClass + " ui-icon-plus");
        open.setAttribute("data-rel", "popup");
        open.setAttribute("data-position-to", "window");
    
        var undo = document.createElement("a");
        undo.setAttribute("class", buttonClass + " ui-icon-back");
        undo.onclick = dwv.gui.onUndo;
    
        var redo = document.createElement("a");
        redo.setAttribute("class", buttonClass + " ui-icon-forward");
        redo.onclick = dwv.gui.onRedo;
    
        var toggleInfo = document.createElement("a");
        toggleInfo.setAttribute("class", buttonClass + " ui-icon-info");
        toggleInfo.onclick = dwv.gui.onToggleInfoLayer;
    
        var tags = document.createElement("a");
        tags.href = "#tags_page";
        tags.setAttribute("class", buttonClass + " ui-icon-grid");
    
        var node = document.getElementById("toolbar");
        node.appendChild(open);
        node.appendChild(undo);
        node.appendChild(redo);
        node.appendChild(toggleInfo);
        node.appendChild(tags);
        $("#toolbar").trigger("create");
    };
    this.display = function (flag)
    {
        base.display(flag);
    };
    this.initialise = function ()
    {
        base.initialise();
    };
};

// Window/level
dwv.gui.WindowLevel = dwv.gui.base.WindowLevel;
// Draw
dwv.gui.Draw = dwv.gui.base.Draw;
// Livewire
dwv.gui.Livewire = dwv.gui.base.Livewire;  
// ZoomAndPan
dwv.gui.ZoomAndPan = dwv.gui.base.ZoomAndPan;
// Scroll
dwv.gui.Scroll = dwv.gui.base.Scroll;
// Filter
dwv.gui.Filter = dwv.gui.base.Filter;

// Filter: threshold
dwv.gui.Threshold = dwv.gui.base.Threshold;
// Filter: sharpen
dwv.gui.Sharpen = dwv.gui.base.Sharpen;
// Filter: sobel
dwv.gui.Sobel = dwv.gui.base.Sobel;

// Undo/redo
dwv.gui.appendUndoHtml = function(){
    dwv.gui.base.appendUndoHtml();
};

// Help
dwv.gui.appendHelpHtml = function(mobile){
    dwv.gui.base.appendHelpHtml(mobile);
};
dwv.gui.appendVersionHtml = function(app){
    dwv.gui.base.appendVersionHtml(app);
};
