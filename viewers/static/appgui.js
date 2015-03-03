/** 
 * Application GUI.
 */

// Window
dwv.gui.getWindowSize = function () {
    return { 'width': ($('#pageMain').width() - 360), 'height': ($('#pageMain').height() - 75) };
};
// Progress
dwv.gui.displayProgress = function (percent) {
    // jquery-ui progress bar
    if( percent <= 100 ) {
        $("#progressbar").progressbar({ value: percent });
    }
};
// Select
dwv.gui.refreshSelect = function (/*selectName*/) {
    // nothing to do
};
// Slider
dwv.gui.Slider = function (app)
{
    this.append = function ()
    {
        // nothing to do
    };
    this.initialise = function ()
    {
        var min = app.getImage().getDataRange().min;
        var max = app.getImage().getDataRange().max;
        
        // jquery-ui slider
        $( "#thresholdLi" ).slider({
            range: true,
            min: min,
            max: max,
            values: [ min, max ],
            slide: function( event, ui ) {
                app.onChangeMinMax(
                        {'min':ui.values[0], 'max':ui.values[1]});
            }
        });
    };
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
// Tags table
dwv.gui.DicomTags = dwv.gui.base.DicomTags;

// Loaders
dwv.gui.Loadbox = dwv.gui.base.Loadbox;
// File loader
dwv.gui.FileLoad = dwv.gui.base.FileLoad;
// Url loader
dwv.gui.UrlLoad =  dwv.gui.base.UrlLoad;

// Toolbox 
dwv.gui.Toolbox = function (app)
{
    var base = new dwv.gui.base.Toolbox(app);
    
    this.setup = function(list)
    {
        base.setup(list);
        
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
        info.onclick = app.onToggleInfoLayer;
    
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
    this.display = function (bool)
    {
        base.display(bool);
    };
    this.initialise = function (list)
    {
        base.initialise(list);
    };
};

//Window/level
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
dwv.gui.Undo = dwv.gui.base.Undo;
// Help
dwv.gui.appendHelpHtml = dwv.gui.base.appendHelpHtml;
// Version
dwv.gui.appendVersionHtml = dwv.gui.base.appendVersionHtml;
