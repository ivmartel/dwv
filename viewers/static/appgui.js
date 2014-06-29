/** 
 * Application GUI.
 */

// Window
dwv.gui.getWindowSize = function(){
    return { 'width': ($('#pageMain').width() - 360), 'height': ($('#pageMain').height() - 75) };
};
// Progress
dwv.gui.displayProgress = function(percent){
    // jquery-ui progress bar
    if( percent <= 100 ) {
        $("#progressbar").progressbar({ value: percent });
    }
};
// Select
dwv.gui.refreshSelect = function(/*selectName*/){
	// nothing to do
};
// Slider
dwv.gui.appendSliderHtml = function(){
    // nothing to do
};
dwv.gui.initSliderHtml = function(){
    var min = app.getImage().getDataRange().min;
    var max = app.getImage().getDataRange().max;
    
    // jquery-ui slider
    $( "#thresholdLi" ).slider({
        range: true,
        min: min,
        max: max,
        values: [ min, max ],
        slide: function( event, ui ) {
            dwv.gui.onChangeMinMax(
                    {'min':ui.values[0], 'max':ui.values[1]});
        }
    });
};
function toggle(dialogId)
{
    if( $(dialogId).dialog('isOpen') ) { 
        $(dialogId).dialog('close');
    }
    else {
        $(dialogId).dialog('open');
    }
}

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
    var open = document.createElement("button");
    open.appendChild(document.createTextNode("File"));
    open.onclick = function() { toggle("#openData"); };
    
    var toolbox = document.createElement("button");
    toolbox.appendChild(document.createTextNode("Toolbox"));
    toolbox.onclick = function() { toggle("#toolbox"); };

    var history = document.createElement("button");
    history.appendChild(document.createTextNode("History"));
    history.onclick = function() { toggle("#history"); };

    var tags = document.createElement("button");
    tags.appendChild(document.createTextNode("Tags"));
    tags.onclick = function() { toggle("#tags"); };

    var image = document.createElement("button");
    image.appendChild(document.createTextNode("Image"));
    image.onclick = function() { toggle("#layerDialog"); };

    var info = document.createElement("button");
    info.appendChild(document.createTextNode("Info"));
    info.onclick = dwv.gui.onToggleInfoLayer;

    var help = document.createElement("button");
    help.appendChild(document.createTextNode("Help"));
    help.onclick = function() { toggle("#help"); };

    var node = document.getElementById("toolbar");
    node.appendChild(open);
    node.appendChild(toolbox);
    node.appendChild(history);
    node.appendChild(tags);
    node.appendChild(image);
    node.appendChild(info);
    node.appendChild(help);
    $("button").button();
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
dwv.gui.appendZoomAndPanHtml = function(){
    dwv.gui.base.appendZoomAndPanHtml();
};
dwv.gui.displayZoomAndPanHtml = function(bool){
    dwv.gui.base.displayZoomAndPanHtml(bool);
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
dwv.gui.appendVersionHtml = function(){
    dwv.gui.base.appendVersionHtml();
};