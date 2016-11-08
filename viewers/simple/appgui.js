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

// decode query
dwv.utils.decodeQuery = dwv.utils.base.decodeQuery;

// Window
dwv.gui.getWindowSize = function () {
    return { 'width': ($(window).width()), 'height': ($(window).height() - 147) };
};
// Progress
dwv.gui.displayProgress = dwv.gui.base.displayProgress;
// get element
dwv.gui.getElement = dwv.gui.base.getElement;
// refresh
dwv.gui.refreshElement = function (element) {
    if( $(element)[0].nodeName.toLowerCase() === 'select' ) {
        $(element).selectmenu('refresh');
    }
    else {
        $(element).enhanceWithin();
    }
};
// Slider
dwv.gui.Slider = dwv.gui.base.Slider;
// Tags table
dwv.gui.DicomTags = dwv.gui.base.DicomTags;

// Toolbox
dwv.gui.Toolbox = function (app)
{
    this.setup = function (/*list*/)
    {
        var mainFieldset = document.createElement("fieldset");
        mainFieldset.className = "mainfieldset";
        mainFieldset.setAttribute("data-role", "controlgroup");
        mainFieldset.setAttribute("data-type", "horizontal");

        var toolFieldset = document.createElement("fieldset");
        toolFieldset.className = "toolfieldset";
        toolFieldset.setAttribute("data-role", "controlgroup");
        toolFieldset.setAttribute("data-type", "horizontal");
        toolFieldset.setAttribute("style", "padding-right:10px;");

        mainFieldset.appendChild(toolFieldset);

        var node = app.getElement("toolbar");
        node.appendChild(mainFieldset);
        dwv.gui.refreshElement(node);
    };

    this.display = function (/*bool*/)
    {
        // does nothing...
    };
    this.initialise = function (list)
    {
        // not wonderful: first one should be scroll...
        if ( list[0] === false ) {
            var inputScroll = app.getElement("scrollLi");
            inputScroll.parentNode.style.display = "none";
            inputScroll.checked = false;
            var inputZoom = app.getElement("zoomLi");
            inputZoom.checked = true;
        }

        // refresh
        $("input[type='radio']").checkboxradio("refresh");
        var node = app.getElement("toolfieldset");
        dwv.gui.refreshElement(node);
    };
};

// Window/level
dwv.gui.WindowLevel = function (app)
{
    this.setup = function ()
    {
        var input = document.createElement("input");
        input.id = "wlLi";
        input.className = "wlLi";
        input.name = "radio-choice";
        input.type = "radio";
        input.value = "WindowLevel";
        input.onclick = app.onChangeTool;

        var label = document.createElement("label");
        label.setAttribute("for", "wlLi");
        var image = document.createElement("img");
        image.src = "../../resources/contrast-64.png";
        image.title = dwv.i18n("tool.WindowLevel.name");
        label.appendChild(image);

        var node = app.getElement("toolfieldset");
        $(node).controlgroup("container").append(input);
        $(node).controlgroup("container").append(label);
        dwv.gui.refreshElement(node);
    };
    this.display = function (/*bool*/)
    {
        // does nothing...
    };
    this.initialise = function ()
    {
        // clear previous
        $(".presetSelect").remove();
        $(".presetLabel").remove();

        // create preset select
        var select = dwv.html.createHtmlSelect("presetSelect",
            app.getViewController().getPresets(), "wl.presets", true);
        select.onchange = app.onChangeWindowLevelPreset;
        select.title = "Select w/l preset.";
        select.setAttribute("data-inline","true");

        // label as span (otherwise creates new line)
        var span = document.createElement("span");
        span.className = "presetLabel";
        span.appendChild(document.createTextNode(dwv.i18n("basics.presets") + ": "));

        var node = app.getElement("mainfieldset");
        node.appendChild(span);
        node.appendChild(select);
        dwv.gui.refreshElement(node);
    };
};

// Zoom
dwv.gui.ZoomAndPan = function (app)
{
    this.setup = function ()
    {
        var input = document.createElement("input");
        input.id = "zoomLi";
        input.className = "zoomLi";
        input.name = "radio-choice";
        input.type = "radio";
        input.value = "ZoomAndPan";
        input.onclick = app.onChangeTool;

        var label = document.createElement("label");
        label.setAttribute("for", "zoomLi");
        var image = document.createElement("img");
        image.src = "../../ext/jquery-mobile/images/icons-png/search-white.png";
        image.title = dwv.i18n("tool.ZoomAndPan.name");
        label.appendChild(image);

        var node = app.getElement("toolfieldset");
        $(node).controlgroup("container").append(input);
        $(node).controlgroup("container").append(label);
        dwv.gui.refreshElement(node);
    };
    this.display = function (/*bool*/)
    {
        // does nothing...
    };
};

// Scroll
dwv.gui.Scroll = function (app)
{
    this.setup = function ()
    {
        var input = document.createElement("input");
        input.id = "scrollLi";
        input.className = "scrollLi";
        input.name = "radio-choice";
        input.checked = "checked";
        input.type = "radio";
        input.value = "Scroll";
        input.onclick = app.onChangeTool;

        var label = document.createElement("label");
        label.setAttribute("for", "scrollLi");
        var image = document.createElement("img");
        image.src = "../../ext/jquery-mobile/images/icons-png/bars-white.png";
        image.title = dwv.i18n("tool.Scroll.name");
        label.appendChild(image);

        var node = app.getElement("toolfieldset");
        $(node).controlgroup("container").append(input);
        $(node).controlgroup("container").append(label);
        dwv.gui.refreshElement(node);
    };
    this.display = function (/*bool*/)
    {
        // does nothing...
    };
};

//Reset
dwv.gui.appendResetHtml = function (app)
{
    var button = document.createElement("button");
    button.className = "resetLi";
    button.value = "reset";
    button.onclick = app.onDisplayReset;
    button.appendChild(document.createTextNode(dwv.i18n("basics.reset")));
    button.setAttribute("class","ui-btn ui-btn-inline");

    var node = app.getElement("mainfieldset");
    node.appendChild(button);
    dwv.gui.refreshElement(node);
};
