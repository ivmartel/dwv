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
// Slider
dwv.gui.appendSliderHtml = function(){
    dwv.gui.base.appendSliderHtml();
};
dwv.gui.initSliderHtml = function(){
    dwv.gui.base.initSliderHtml();
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
dwv.gui.appendToolboxHtml = function(){
    dwv.gui.base.appendToolboxHtml();
    
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
dwv.gui.displayToolboxHtml = function(bool){
    dwv.gui.base.displayToolboxHtml(bool);
};
dwv.gui.initToolboxHtml = function(){
    dwv.gui.base.initToolboxHtml();
};

// Window/level
dwv.gui.appendWindowLevelHtml = function(){
    dwv.gui.base.appendWindowLevelHtml();
};
dwv.gui.displayWindowLevelHtml = function(bool){
    dwv.gui.base.displayWindowLevelHtml(bool);
};
dwv.gui.initWindowLevelHtml = function(){
    dwv.gui.base.initWindowLevelHtml();
};

// Draw
dwv.gui.appendDrawHtml = function(){
    dwv.gui.base.appendDrawHtml();
};
dwv.gui.displayDrawHtml = function(bool){
    dwv.gui.base.displayDrawHtml(bool);  
};
dwv.gui.initDrawHtml = function(){
    dwv.gui.base.initDrawHtml();  
};

// Livewire
dwv.gui.appendLivewireHtml = function(){
    dwv.gui.base.appendLivewireHtml();  
};
dwv.gui.displayLivewireHtml = function(bool){
    dwv.gui.base.displayLivewireHtml(bool);
};
dwv.gui.initLivewireHtml = function(){
    dwv.gui.base.initLivewireHtml();
};

// Navigate
dwv.gui.appendNavigateHtml = function(){
    dwv.gui.base.appendNavigateHtml();
};
dwv.gui.displayNavigateHtml = function(bool){
    dwv.gui.base.displayNavigateHtml(bool);
};

// Scroll
dwv.gui.appendScrollHtml = function(){
    dwv.gui.base.appendScrollHtml();
};
dwv.gui.displayScrollHtml = function(bool){
    dwv.gui.base.displayScrollHtml(bool);
};

// Filter
dwv.gui.appendFilterHtml = function(){
    dwv.gui.base.appendFilterHtml();
};
dwv.gui.displayFilterHtml = function(bool){
    dwv.gui.base.displayFilterHtml(bool);
};
dwv.gui.initFilterHtml = function(){
    dwv.gui.base.initFilterHtml();
};

// Threshold
dwv.gui.filter.appendThresholdHtml = function(){
    dwv.gui.filter.base.appendThresholdHtml();
};
dwv.gui.filter.displayThresholdHtml = function(bool){
    dwv.gui.filter.base.displayThresholdHtml(bool);
};
dwv.gui.filter.initThresholdHtml = function(){
    dwv.gui.filter.base.initThresholdHtml();
};

// Sharpen
dwv.gui.filter.appendSharpenHtml = function(){
    dwv.gui.filter.base.appendSharpenHtml();
};
dwv.gui.filter.displaySharpenHtml = function(bool){
    dwv.gui.filter.base.displaySharpenHtml(bool);
};

// Sobel
dwv.gui.filter.appendSobelHtml = function(){
    dwv.gui.filter.base.appendSobelHtml();
};
dwv.gui.filter.displaySobelHtml = function(bool){
    dwv.gui.filter.base.displaySobelHtml(bool);
};

// Undo/redo
dwv.gui.appendUndoHtml = function(){
    dwv.gui.base.appendUndoHtml();
};

// Help
dwv.gui.appendHelpHtml = function(mobile){
    dwv.gui.base.appendHelpHtml(mobile);
};
