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
dwv.gui.displayProgress = function (/*percent*/) { /*does nothing*/ };
// Select
dwv.gui.refreshElement = dwv.gui.base.refreshElement;
// Slider
dwv.gui.Slider = null;
// Tags table
dwv.gui.DicomTags = null;

// Toolbox 
dwv.gui.Toolbox = function (app)
{
    //var base = new dwv.gui.base.Toolbox(app);
    
    this.setup = function (/*list*/)
    {
        // does nothing
    };
    this.display = function (/*bool*/)
    {
     // does nothing
    };
    this.initialise = function (list)
    {
        // not wonderful: first one should be scroll is more than one slice
        if ( list[0] === false ) {
            var inputScroll = app.getElementByClassName("scroll-button");
            inputScroll.style.display = "none";
            var inputZoom = app.getElementByClassName("zoom-button");
            inputZoom.checked = true;
        }
    };
};

// Window/level
dwv.gui.WindowLevel = function (app)
{
    this.setup = function ()
    {
        var button = document.createElement("button");
        button.className = "wl-button";
        button.value = "Window/Level";
        button.onclick = app.onChangeTool;
        button.appendChild(document.createTextNode("Window/Level"));

        var node = app.getElementByClassName("toolbar");
        node.appendChild(button);
    };
    this.display = function (bool)
    {
        var button = app.getElementByClassName("wl-button");
        button.disabled = bool;
    };
    this.initialise = function ()
    {
        // clear previous
        dwv.html.removeNode(app.getElementByClassName("presetSelect"));
        dwv.html.removeNode(app.getElementByClassName("presetLabel"));

        // create preset select
        var select = dwv.html.createHtmlSelect("presetSelect", app.getViewController().getPresets());
        select.className = "presetSelect";
        select.onchange = app.onChangeWindowLevelPreset;
        select.title = "Select w/l preset.";
        select.setAttribute("data-inline","true");
        var label = document.createElement("label");
        label.className = "presetLabel";
        label.setAttribute("for", "presetSelect");
        label.appendChild(document.createTextNode("Presets: "));

        var node = app.getElementByClassName("toolbar");
        node.appendChild(label);
        node.appendChild(select);
    };
};

// Zoom
dwv.gui.ZoomAndPan = function (app)
{
    this.setup = function ()
    {
        var button = document.createElement("button");
        button.className = "zoom-button";
        button.value = "Zoom/Pan";
        button.onclick = app.onChangeTool;
        button.appendChild(document.createTextNode("Zoom/Pan"));

        var node = app.getElementByClassName("toolbar");
        node.appendChild(button);
    };
    this.display = function (bool)
    {
        var button = app.getElementByClassName("zoom-button");
        button.disabled = bool;
    };
};

// Scroll
dwv.gui.Scroll = function (app)
{
    this.setup = function ()
    {
        var button = document.createElement("button");
        button.className = "scroll-button";
        button.value = "Scroll";
        button.onclick = app.onChangeTool;
        button.appendChild(document.createTextNode("Scroll"));

        var node = app.getElementByClassName("toolbar");
        node.appendChild(button);
    };
    this.display = function (bool)
    {
        var button = app.getElementByClassName("scroll-button");
        button.disabled = bool;
    };
};

//Reset
dwv.gui.appendResetHtml = function (app)
{
    var button = document.createElement("button");
    button.className = "reset-button";
    button.value = "reset";
    button.onclick = app.onDisplayReset;
    button.appendChild(document.createTextNode("Reset"));

    var node = app.getElementByClassName("toolbar");
    node.appendChild(button);
};
