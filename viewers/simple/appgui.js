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
    var mainFieldset = document.createElement("fieldset");
    mainFieldset.id = "mainfieldset";
    mainFieldset.setAttribute("data-role", "controlgroup");
    mainFieldset.setAttribute("data-type", "horizontal");
    
    var toolFieldset = document.createElement("fieldset");
    toolFieldset.id = "toolfieldset";
    toolFieldset.setAttribute("data-role", "controlgroup");
    toolFieldset.setAttribute("data-type", "horizontal");
    toolFieldset.setAttribute("style", "padding-right:10px;");

    mainFieldset.appendChild(toolFieldset);
    
    var node = document.getElementById("toolbar");
    node.appendChild(mainFieldset);
     $("#toolbar").trigger("create");
};

dwv.gui.displayToolboxHtml = function(bool){
    dwv.gui.base.displayToolboxHtml(bool);
};
dwv.gui.initToolboxHtml = function(){
    //dwv.gui.base.initToolboxHtml();
};

// Window/level
dwv.gui.appendWindowLevelHtml = function(){
    var input = document.createElement("input");
    input.id = "wlLi";
    input.name = "radio-choice";
    input.type = "radio";
    input.value = "windowlevel";
    input.onclick = dwv.gui.onChangeTool;
    
    var label = document.createElement("label");
    label.setAttribute("for", "wlLi");
    label.appendChild(document.createTextNode("W/L"));
    
    $("#toolfieldset").controlgroup("container")["append"](input);
    $("#toolfieldset").controlgroup("container")["append"](label);
    
    $("#toolfieldset").trigger("create");
};
dwv.gui.displayWindowLevelHtml = function(bool){
    //dwv.gui.base.displayWindowLevelHtml(bool);
};
dwv.gui.initWindowLevelHtml = function(){
    //dwv.gui.base.initWindowLevelHtml();
    
    // clear previous
    $("#presetSelect").remove();
    $("#presetLabel").remove();
    
    // create preset select
    dwv.tool.updatePresets(false);
    var select = dwv.html.createHtmlSelect("presetSelect",dwv.tool.presets);
    select.onchange = dwv.gui.onChangeWindowLevelPreset;
    select.title = "Select w/l preset.";
    select.setAttribute("data-inline","true");

    // label as span (otherwise creates new line)
    var span = document.createElement("span");
    span.id = "presetLabel";
    span.appendChild(document.createTextNode("Presets: "));
    
    var node = document.getElementById("mainfieldset");
    node.appendChild(span);
    node.appendChild(select);
    
    $("#mainfieldset").trigger("create");
};

// Zoom
dwv.gui.appendZoomAndPanHtml = function(){
    var input = document.createElement("input");
    input.id = "zoomLi";
    input.name = "radio-choice";
    input.type = "radio";
    input.value = "zoompan";
    input.onclick = dwv.gui.onChangeTool;
    
    var label = document.createElement("label");
    label.setAttribute("for", "zoomLi");
    label.appendChild(document.createTextNode("Zoom/Pan"));

    $("#toolfieldset").controlgroup("container")["append"](input);
    $("#toolfieldset").controlgroup("container")["append"](label);
    
    $("#toolfieldset").trigger("create");
};
dwv.gui.displayZoomAndPanHtml = function(bool){
    //dwv.gui.base.displayZoomHtml(bool);
};

// Scroll
dwv.gui.appendScrollHtml = function(){
    var input = document.createElement("input");
    input.id = "scrollLi";
    input.name = "radio-choice";
    input.checked = "checked";
    input.type = "radio";
    input.value = "scroll";
    input.onclick = dwv.gui.onChangeTool;
    
    var label = document.createElement("label");
    label.setAttribute("for", "scrollLi");
    label.appendChild(document.createTextNode("Scroll"));

    $("#toolfieldset").controlgroup("container")["append"](input);
    $("#toolfieldset").controlgroup("container")["append"](label);

    $("#toolfieldset").trigger("create");
};
dwv.gui.displayScrollHtml = function(bool){
    //dwv.gui.base.displayScrollHtml(bool);
};

//Reset
dwv.gui.appendResetHtml = function(){
    var button = document.createElement("button");
    button.id = "resetLi";
    button.value = "reset";
    button.onclick = dwv.gui.onDisplayReset;
    button.appendChild(document.createTextNode("Reset"));
    button.setAttribute("class","ui-btn ui-btn-inline");
    
    var node = document.getElementById("mainfieldset");
    node.appendChild(button);
    $("#mainfieldset").trigger("create");
};
