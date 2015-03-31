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
        //base.setup(list);
        
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
    
    this.display = function (bool)
    {
        base.display(bool);
    };
    this.initialise = function (list)
    {
        //base.initialise(list);
        
        // not wonderful: first one should be scroll...
        if ( list[0] === false ) {
            var inputScroll = document.getElementById("scrollLi");
            inputScroll.parentNode.style.display = "none";
            inputScroll.checked = false;
            var inputZoom = document.getElementById("zoomLi");
            inputZoom.checked = true;
        }
        
        // refresh
        $("input[type='radio']").checkboxradio("refresh");
        $("#toolfieldset").trigger("create");
    };
};

// Window/level
dwv.gui.WindowLevel = function (app)
{
    //var base = new dwv.gui.base.WindowLevel(app);
    
    this.setup = function ()
    {
        //base.setup();
        
        var input = document.createElement("input");
        input.id = "wlLi";
        input.name = "radio-choice";
        input.type = "radio";
        input.value = "Window/Level";
        input.onclick = app.onChangeTool;
        
        var label = document.createElement("label");
        label.setAttribute("for", "wlLi");
        label.appendChild(document.createTextNode("W/L"));
        
        $("#toolfieldset").controlgroup("container").append(input);
        $("#toolfieldset").controlgroup("container").append(label);
        
        $("#toolfieldset").trigger("create");
    };
    this.display = function (/*bool*/)
    {
        //base.display(bool);
    };
    this.initialise = function ()
    {
        //base.initialise();
        
        // clear previous
        $("#presetSelect").remove();
        $("#presetLabel").remove();
        
        // create preset select
        var select = dwv.html.createHtmlSelect("presetSelect", app.getViewController().getPresets());
        select.onchange = app.onChangeWindowLevelPreset;
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
};

// Zoom
dwv.gui.ZoomAndPan = function (app)
{
    //var base = new dwv.gui.base.ZoomAndPan(app);
    
    this.setup = function ()
    {
        var input = document.createElement("input");
        input.id = "zoomLi";
        input.name = "radio-choice";
        input.type = "radio";
        input.value = "Zoom/Pan";
        input.onclick = app.onChangeTool;
        
        var label = document.createElement("label");
        label.setAttribute("for", "zoomLi");
        label.appendChild(document.createTextNode("Zoom/Pan"));
    
        $("#toolfieldset").controlgroup("container").append(input);
        $("#toolfieldset").controlgroup("container").append(label);
        
        $("#toolfieldset").trigger("create");
    };
    this.display = function (/*bool*/)
    {
        //base.display(bool);
    };
};

// Scroll
dwv.gui.Scroll = function (app)
{
    //var base = new dwv.gui.base.Scroll(app);
    
    this.setup = function ()
    {
        var input = document.createElement("input");
        input.id = "scrollLi";
        input.name = "radio-choice";
        input.checked = "checked";
        input.type = "radio";
        input.value = "Scroll";
        input.onclick = app.onChangeTool;
        
        var label = document.createElement("label");
        label.setAttribute("for", "scrollLi");
        label.appendChild(document.createTextNode("Scroll"));
    
        $("#toolfieldset").controlgroup("container").append(input);
        $("#toolfieldset").controlgroup("container").append(label);
    
        $("#toolfieldset").trigger("create");
    };
    this.display = function (/*bool*/)
    {
        //base.display(bool);
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
    button.setAttribute("class","ui-btn ui-btn-inline");
    
    var node = document.getElementById("mainfieldset");
    node.appendChild(button);
    $("#mainfieldset").trigger("create");
};
