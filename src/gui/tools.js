/** 
 * GUI module.
 * @module gui
 */
var dwv = dwv || {};
/**
 * Namespace for GUI functions.
 * @class gui
 * @namespace dwv
 * @static
 */
dwv.gui = dwv.gui || {};

/**
 * Refresh a HTML select.
 * @method refreshSelect
 * @static
 * @param {String} selectName The name of the HTML select to refresh.
 */
dwv.gui.refreshSelect = function(selectName)
{
    // jquery-mobile
    if( $(selectName).selectmenu ) $(selectName).selectmenu('refresh');
};

/**
 * Append the toolbox HTML to the page.
 * @method appendToolboxHtml
 * @static
 */
dwv.gui.appendToolboxHtml = function()
{
    // tool select
    var toolSelector = dwv.html.createHtmlSelect("toolSelect",dwv.tool.tools);
    toolSelector.onchange = dwv.gui.onChangeTool;
    
    // tool list element
    var toolLi = document.createElement("li");
    toolLi.id = "toolLi";
    toolLi.style.display = "none";
    toolLi.appendChild(toolSelector);
    toolLi.setAttribute("class","ui-block-a");

    // node
    var node = document.getElementById("toolList");
    // clear it
    while(node.hasChildNodes()) node.removeChild(node.firstChild);
    // append
    node.appendChild(toolLi);
    // trigger create event (mobile)
    $("#toolList").trigger("create");
};

/**
 * Display the toolbox HTML.
 * @method displayToolboxHtml
 * @static
 * @param {Boolean} bool True to display, false to hide.
 */
dwv.gui.displayToolboxHtml = function(bool)
{
    // tool list element
    var toolLi = document.getElementById("toolLi");
    toolLi.style.display = bool ? "" : "none";
};

/**
 * Initialise the toolbox HTML.
 * @method initToolboxHtml
 * @static
 */
dwv.gui.initToolboxHtml = function()
{
    // tool select: reset selected option
    var toolSelector = document.getElementById("toolSelect");
    toolSelector.selectedIndex = 0;
    dwv.gui.refreshSelect("#toolSelect");
};

/**
 * Append the window/level HTML to the page.
 * @method appendWindowLevelHtml
 * @static
 */
dwv.gui.appendWindowLevelHtml = function()
{
    // preset select
    var wlSelector = dwv.html.createHtmlSelect("presetSelect",dwv.tool.presets);
    wlSelector.onchange = dwv.gui.onChangeWindowLevelPreset;
    // colour map select
    var cmSelector = dwv.html.createHtmlSelect("colourMapSelect",dwv.tool.colourMaps);
    cmSelector.onchange = dwv.gui.onChangeColourMap;

    // preset list element
    var wlLi = document.createElement("li");
    wlLi.id = "wlLi";
    wlLi.style.display = "none";
    wlLi.appendChild(wlSelector);
    wlLi.setAttribute("class","ui-block-b");
    // color map list element
    var cmLi = document.createElement("li");
    cmLi.id = "cmLi";
    cmLi.style.display = "none";
    cmLi.appendChild(cmSelector);
    cmLi.setAttribute("class","ui-block-c");

    // node
    var node = document.getElementById("toolList");
    // apend preset
    node.appendChild(wlLi);
    // apend color map if monochrome image
    node.appendChild(cmLi);
    // trigger create event (mobile)
    $("#toolList").trigger("create");
};

/**
 * Display the window/level HTML.
 * @method displayWindowLevelHtml
 * @static
 * @param {Boolean} bool True to display, false to hide.
 */
dwv.gui.displayWindowLevelHtml = function(bool)
{
    // presets list element
    var wlLi = document.getElementById("wlLi");
    wlLi.style.display = bool ? "" : "none";
    // color map list element
    var cmLi = document.getElementById("cmLi");
    cmLi.style.display = bool ? "" : "none";
};

/**
 * Initialise the window/level HTML.
 * @method initWindowLevelHtml
 * @static
 */
dwv.gui.initWindowLevelHtml = function()
{
    // create new preset select
    var wlSelector = dwv.html.createHtmlSelect("presetSelect",dwv.tool.presets);
    wlSelector.onchange = dwv.gui.onChangeWindowLevelPreset;
    wlSelector.title = "Select w/l preset.";
    
    // update html list
    var wlLi = document.getElementById("wlLi");
    dwv.html.cleanNode(wlLi);
    wlLi.appendChild(wlSelector);
    $("#toolList").trigger("create");
    
    // colour map select
    var cmSelector = document.getElementById("colourMapSelect");
    cmSelector.selectedIndex = 0;
    // special monochrome1 case
    if( app.getImage().getPhotometricInterpretation() === "MONOCHROME1" )
    {
        cmSelector.selectedIndex = 1;
    }
    dwv.gui.refreshSelect("#colourMapSelect");
};

/**
 * Append the draw HTML to the page.
 * @method appendDrawHtml
 * @static
 */
dwv.gui.appendDrawHtml = function()
{
    // shape select
    var shapeSelector = dwv.html.createHtmlSelect("shapeSelect",dwv.tool.shapes);
    shapeSelector.onchange = dwv.gui.onChangeShape;
    // colour select
    var colourSelector = dwv.html.createHtmlSelect("colourSelect",dwv.tool.colors);
    colourSelector.onchange = dwv.gui.onChangeLineColour;

    // shape list element
    var shapeLi = document.createElement("li");
    shapeLi.id = "shapeLi";
    shapeLi.style.display = "none";
    shapeLi.appendChild(shapeSelector);
    shapeLi.setAttribute("class","ui-block-c");
    // colour list element
    var colourLi = document.createElement("li");
    colourLi.id = "colourLi";
    colourLi.style.display = "none";
    colourLi.appendChild(colourSelector);
    colourLi.setAttribute("class","ui-block-b");
    
    // node
    var node = document.getElementById("toolList");
    // apend shape
    node.appendChild(shapeLi);
    // append color
    node.appendChild(colourLi);
    // trigger create event (mobile)
    $("#toolList").trigger("create");
};

/**
 * Display the draw HTML.
 * @method displayDrawHtml
 * @static
 * @param {Boolean} bool True to display, false to hide.
 */
dwv.gui.displayDrawHtml = function(bool)
{
    // color list element
    var colourLi = document.getElementById("colourLi");
    colourLi.style.display = bool ? "" : "none";
    // shape list element
    var shapeLi = document.getElementById("shapeLi");
    shapeLi.style.display = bool ? "" : "none";
};

/**
 * Initialise the draw HTML.
 * @method displayDrawHtml
 * @static
 * */
dwv.gui.initDrawHtml = function()
{
    // shape select: reset selected option
    var shapeSelector = document.getElementById("shapeSelect");
    shapeSelector.selectedIndex = 0;
    dwv.gui.refreshSelect("#shapeSelect");
    // color select: reset selected option
    var colourSelector = document.getElementById("colourSelect");
    colourSelector.selectedIndex = 0;
    dwv.gui.refreshSelect("#colourSelect");
};

/**
 * Append the color chooser HTML to the page.
 * @method appendLivewireHtml
 * @static
 */
dwv.gui.appendLivewireHtml = function()
{
    // colour select
    var colourSelector = dwv.html.createHtmlSelect("lwColourSelect",dwv.tool.colors);
    colourSelector.onchange = dwv.gui.onChangeLineColour;
    
    // colour list element
    var colourLi = document.createElement("li");
    colourLi.id = "lwColourLi";
    colourLi.style.display = "none";
    colourLi.setAttribute("class","ui-block-b");
    colourLi.appendChild(colourSelector);
    
    // node
    var node = document.getElementById("toolList");
    // apend colour
    node.appendChild(colourLi);
    // trigger create event (mobile)
    $("#toolList").trigger("create");
};

/**
 * Display the livewire HTML.
 * @method displayLivewireHtml
 * @static
 * @param {Boolean} bool True to display, false to hide.
 */
dwv.gui.displayLivewireHtml = function(bool)
{
    // colour list
    var colourLi = document.getElementById("lwColourLi");
    colourLi.style.display = bool ? "" : "none";
};

/**
 * Initialise the livewire HTML.
 * @method initLivewireHtml
 * @static
 */
dwv.gui.initLivewireHtml = function()
{
    var colourSelector = document.getElementById("lwColourSelect");
    colourSelector.selectedIndex = 0;
    dwv.gui.refreshSelect("#lwColourSelect");
};

/**
 * Append the zoom HTML to the page.
 * @method appendZoomHtml
 * @static
 */
dwv.gui.appendZoomHtml = function()
{
    // zoom button
    var button = document.createElement("button");
    button.id = "zoomResetButton";
    button.name = "zoomResetButton";
    button.onclick = dwv.tool.zoomReset;
    var text = document.createTextNode("Reset");
    button.appendChild(text);
    
    // zoom list element
    var zoomLi = document.createElement("li");
    zoomLi.id = "zoomLi";
    zoomLi.style.display = "none";
    zoomLi.setAttribute("class","ui-block-c");
    zoomLi.appendChild(button);
    
    // node
    var node = document.getElementById("toolList");
    // append zoom
    node.appendChild(zoomLi);
    // trigger create event (mobile)
    $("#toolList").trigger("create");
};

/**
 * Display the zoom HTML.
 * @method displayZoomHtml
 * @static
 * @param {Boolean} bool True to display, false to hide.
 */
dwv.gui.displayZoomHtml = function(bool)
{
    // zoom list element
    var zoomLi = document.getElementById("zoomLi");
    zoomLi.style.display = bool ? "" : "none";
};
