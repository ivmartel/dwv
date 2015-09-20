/** 
 * Application GUI.
 */

// Default window level presets.
dwv.tool.defaultpresets = {};
// Default window level presets for CT.
dwv.tool.defaultpresets.CT = {
    "mediastinum": {"center": 40, "width": 400},
    "lung": {"center": -500, "width": 1500},
    "bone": {"center": 500, "width": 2000},
};

// Window
dwv.gui.getWindowSize = dwv.gui.base.getWindowSize;
// Progress
dwv.gui.displayProgress = dwv.gui.base.displayProgress;
// Select
dwv.gui.refreshSelect = dwv.gui.base.refreshSelect;
// Slider
dwv.gui.Slider = dwv.gui.base.Slider;
// Tags table
dwv.gui.DicomTags = dwv.gui.base.DicomTags;

// Toolbox 
dwv.gui.Toolbox = function (app)
{
    var base = new dwv.gui.base.Toolbox(app);
    
    this.setup = function (/*list*/)
    {
        // does nothing
    };
    this.display = function (bool)
    {
        base.display(bool);
    };
    this.initialise = function (/*list*/)
    {
        // does nothing
    };
};

// Window/level
dwv.gui.WindowLevel = function (app)
{
    this.setup = function ()
    {
        var button = document.createElement("button");
        button.id = "wl-button";
        button.value = "Window/Level";
        button.onclick = app.onChangeTool;
        button.appendChild(document.createTextNode("Window/Level"));
        
        var node = document.getElementById("toolbar");
        node.appendChild(button);
    };
    this.display = function (bool)
    {
        var button = document.getElementById("wl-button");
        button.disabled = bool;
    };
    this.initialise = function ()
    {
        // clear previous
        var oldSelect = document.getElementById("presetSelect");
        if ( oldSelect ) {
            console.log(oldSelect);
            dwv.html.removeNode(oldSelect);
        }

        // create preset select
        var select = dwv.html.createHtmlSelect("presetSelect", app.getViewController().getPresets());
        select.id = "presetSelect";
        select.onchange = app.onChangeWindowLevelPreset;
        select.title = "Select w/l preset.";
        select.setAttribute("data-inline","true");
    
        // label as span (otherwise creates new line)
        var span = document.createElement("span");
        span.id = "presetLabel";
        span.appendChild(document.createTextNode("Presets: "));
        
        var node = document.getElementById("toolbar");
        node.appendChild(span);
        node.appendChild(select);
    };
};

// Zoom
dwv.gui.ZoomAndPan = function (app)
{
    this.setup = function ()
    {
        var button = document.createElement("button");
        button.id = "zoom-button";
        button.value = "Zoom/Pan";
        button.onclick = app.onChangeTool;
        button.appendChild(document.createTextNode("Zoom/Pan"));
        
        var node = document.getElementById("toolbar");
        node.appendChild(button);
    };
    this.display = function (bool)
    {
        var button = document.getElementById("zoom-button");
        button.disabled = bool;
    };
};

// Scroll
dwv.gui.Scroll = function (app)
{
    this.setup = function ()
    {
        var button = document.createElement("button");
        button.id = "scroll-button";
        button.value = "Scroll";
        button.onclick = app.onChangeTool;
        button.appendChild(document.createTextNode("Scroll"));
        
        var node = document.getElementById("toolbar");
        node.appendChild(button);
    };
    this.display = function (bool)
    {
        var button = document.getElementById("scroll-button");
        button.disabled = bool;
    };
};

//Reset
dwv.gui.appendResetHtml = function (app)
{
    var button = document.createElement("button");
    button.id = "resetLi";
    button.value = "reset";
    button.onclick = app.onDisplayReset;
    button.appendChild(document.createTextNode("Reset"));
    
    var node = document.getElementById("toolbar");
    node.appendChild(button);
};
