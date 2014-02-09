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

// Toolbox 
dwv.gui.appendToolboxHtml = function(){
    //dwv.gui.base.appendToolboxHtml();
};
dwv.gui.displayToolboxHtml = function(bool){
    dwv.gui.base.displayToolboxHtml(bool);
};
dwv.gui.initToolboxHtml = function(){
    //dwv.gui.base.initToolboxHtml();
};

// Window/level
dwv.gui.appendWindowLevelHtml = function(){
    var button = document.createElement("button");
    button.id = "wlLi";
    button.value = "windowlevel";
    button.onclick = dwv.gui.onChangeTool;
    button.appendChild(document.createTextNode("W/L"));
    button.setAttribute("class","ui-btn ui-btn-inline");
    
    var node = document.getElementById("toolfieldset");
    node.appendChild(button);
    $("#toolfieldset").trigger("create");
};
dwv.gui.displayWindowLevelHtml = function(bool){
    //dwv.gui.base.displayWindowLevelHtml(bool);
};
dwv.gui.initWindowLevelHtml = function(){
    //dwv.gui.base.initWindowLevelHtml();
    
    // create preset select
    var select = dwv.html.createHtmlSelect("presetSelect",dwv.tool.presets);
    select.onchange = dwv.gui.onChangeWindowLevelPreset;
    select.title = "Select w/l preset.";
    //select.setAttribute("class","ui-select-inline");
    select.setAttribute("data-inline","true");

    var node = document.getElementById("toolfieldset");
    node.appendChild(select);
    $("#toolfieldset").trigger("create");
};

// Zoom
dwv.gui.appendZoomHtml = function(){
    var button = document.createElement("button");
    button.id = "zoomLi";
    button.value = "zoom";
    button.onclick = dwv.gui.onChangeTool;
    button.appendChild(document.createTextNode("Zoom"));
    button.setAttribute("class","ui-btn ui-btn-inline");
    
    var node = document.getElementById("toolfieldset");
    node.appendChild(button);
    $("#toolfieldset").trigger("create");
};
dwv.gui.displayZoomHtml = function(bool){
    //dwv.gui.base.displayZoomHtml(bool);
};

// Pan
dwv.gui.appendPanHtml = function(){
    var button = document.createElement("button");
    button.id = "panLi";
    button.value = "pan";
    button.onclick = dwv.gui.onChangeTool;
    button.appendChild(document.createTextNode("Pan"));
    button.setAttribute("class","ui-btn ui-btn-inline");
    
    var node = document.getElementById("toolfieldset");
    node.appendChild(button);
    $("#toolfieldset").trigger("create");
};
dwv.gui.displayPanHtml = function(bool){
    //dwv.gui.base.displayPanHtml(bool);
};

// Reset
dwv.gui.appendResetHtml = function(){
    var button = document.createElement("button");
    button.id = "resetLi";
    button.value = "reset";
    button.onclick = dwv.gui.onZoomReset;
    button.appendChild(document.createTextNode("Reset"));
    button.setAttribute("class","ui-btn ui-btn-inline");
    
    var node = document.getElementById("toolfieldset");
    node.appendChild(button);
    $("#toolfieldset").trigger("create");
};

// Scroll
dwv.gui.appendScrollHtml = function(){
    var button = document.createElement("button");
    button.id = "scrollLi";
    button.value = "scroll";
    button.onclick = dwv.gui.onChangeTool;
    button.appendChild(document.createTextNode("Scroll"));
    button.setAttribute("class","ui-btn ui-btn-inline");
    
    var node = document.getElementById("toolfieldset");
    node.appendChild(button);
    $("#toolfieldset").trigger("create");
};
dwv.gui.displayScrollHtml = function(bool){
    //dwv.gui.base.displayScrollHtml(bool);
};

// Undo/redo
// TODO not needed but gives error...
dwv.gui.appendUndoHtml = function(){
    //dwv.gui.base.appendUndoHtml();
};
