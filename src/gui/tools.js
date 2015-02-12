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
dwv.gui.base = dwv.gui.base || {};

/**
 * Toolbox base gui.
 * @class Toolbox
 * @namespace dwv.gui.base
 * @constructor
 */
dwv.gui.base.Toolbox = function (app)
{
    /**
     * Setup the toolbox HTML.
     * @method setup
     */
    this.setup = function (list)
    {
        // tool select
        var toolSelector = dwv.html.createHtmlSelect("toolSelect", list);
        toolSelector.onchange = app.onChangeTool;
        
        // tool list element
        var toolLi = document.createElement("li");
        toolLi.id = "toolLi";
        toolLi.style.display = "none";
        toolLi.appendChild(toolSelector);
        toolLi.setAttribute("class","ui-block-a");
    
        // node
        var node = document.getElementById("toolList");
        // clear it
        while(node.hasChildNodes()) {
            node.removeChild(node.firstChild);
        }
        // append
        node.appendChild(toolLi);
        // trigger create event (mobile)
        $("#toolList").trigger("create");
    };
    
    /**
     * Display the toolbox HTML.
     * @method display
     * @param {Boolean} bool True to display, false to hide.
     */
    this.display = function (bool)
    {
        // tool list element
        dwv.html.displayElement("toolLi", bool);
    };
    
    /**
     * Initialise the toolbox HTML.
     * @method initialise
     */
    this.initialise = function ()
    {
        // tool select: reset selected option
        var toolSelector = document.getElementById("toolSelect");
        toolSelector.selectedIndex = 0;
        dwv.gui.refreshSelect("#toolSelect");
    };
    
}; // dwv.gui.base.Toolbox

/**
 * WindowLevel tool base gui.
 * @class WindowLevel
 * @namespace dwv.gui.base
 * @constructor
 */
dwv.gui.base.WindowLevel = function (app)
{
    /**
     * Setup the tool HTML.
     * @method setup
     */
    this.setup = function ()
    {
        // preset select
        var wlSelector = dwv.html.createHtmlSelect("presetSelect", app.getPresets());
        wlSelector.onchange = app.onChangeWindowLevelPreset;
        // colour map select
        var cmSelector = dwv.html.createHtmlSelect("colourMapSelect",dwv.tool.colourMaps);
        cmSelector.onchange = app.onChangeColourMap;
    
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
        // append preset
        node.appendChild(wlLi);
        // append color map
        node.appendChild(cmLi);
        // trigger create event (mobile)
        $("#toolList").trigger("create");
    };
    
    /**
     * Display the tool HTML.
     * @method display
     * @param {Boolean} bool True to display, false to hide.
     */
    this.display = function (bool)
    {
        // presets list element
        dwv.html.displayElement("wlLi", bool);
        // color map list element
        dwv.html.displayElement("cmLi", bool);
    };
    
    /**
     * Initialise the tool HTML.
     * @method initialise
     */
    this.initialise = function ()
    {
        // create new preset select
        var wlSelector = dwv.html.createHtmlSelect("presetSelect", app.getPresets());
        wlSelector.onchange = app.onChangeWindowLevelPreset;
        wlSelector.title = "Select w/l preset.";
        
        // copy html list
        var wlLi = document.getElementById("wlLi");
        // clear node
        dwv.html.cleanNode(wlLi);
        // add children
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
    
}; // class dwv.gui.base.WindowLevel

/**
 * Draw tool base gui.
 * @class Draw
 * @namespace dwv.gui.base
 * @constructor
 */
dwv.gui.base.Draw = function (app)
{
    // default colours
    var colours = [
       "Yellow", "Red", "White", "Green", "Blue", "Lime", "Fuchsia", "Black"
    ];
    /**
     * Get the available colours.
     * @method getColours
     */
    this.getColours = function () { return colours; };
    
    /**
     * Setup the tool HTML.
     * @method setup
     */
    this.setup = function (shapeList)
    {
        // shape select
        var shapeSelector = dwv.html.createHtmlSelect("shapeSelect", shapeList);
        shapeSelector.onchange = app.onChangeShape;
        // colour select
        var colourSelector = dwv.html.createHtmlSelect("colourSelect", colours);
        colourSelector.onchange = app.onChangeLineColour;
    
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
     * Display the tool HTML.
     * @method display
     * @param {Boolean} bool True to display, false to hide.
     */
    this.display = function (bool)
    {
        // color list element
        dwv.html.displayElement("colourLi", bool);
        // shape list element
        dwv.html.displayElement("shapeLi", bool);
    };
    
    /**
     * Initialise the tool HTML.
     * @method initialise
     */
    this.initialise = function ()
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
    
}; // class dwv.gui.base.Draw

/**
 * Livewire tool base gui.
 * @class Livewire
 * @namespace dwv.gui.base
 * @constructor
 */
dwv.gui.base.Livewire = function (app)
{
    // default colours
    var colours = [
       "Yellow", "Red", "White", "Green", "Blue", "Lime", "Fuchsia", "Black"
    ];
    /**
     * Get the available colours.
     * @method getColours
     */
    this.getColours = function () { return colours; };

    /**
     * Setup the tool HTML.
     * @method setup
     */
    this.setup = function ()
    {
        // colour select
        var colourSelector = dwv.html.createHtmlSelect("lwColourSelect", colours);
        colourSelector.onchange = app.onChangeLineColour;
        
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
     * Display the tool HTML.
     * @method display
     * @param {Boolean} bool True to display, false to hide.
     */
    this.display = function (bool)
    {
        // colour list
        dwv.html.displayElement("lwColourLi", bool);
    };
    
    /**
     * Initialise the tool HTML.
     * @method initialise
     */
    this.initialise = function ()
    {
        var colourSelector = document.getElementById("lwColourSelect");
        colourSelector.selectedIndex = 0;
        dwv.gui.refreshSelect("#lwColourSelect");
    };
    
}; // class dwv.gui.base.Livewire

/**
 * ZoomAndPan tool base gui.
 * @class ZoomAndPan
 * @namespace dwv.gui.base
 * @constructor
 */
dwv.gui.base.ZoomAndPan = function (app)
{
    /**
     * Setup the tool HTML.
     * @method setup
     */
    this.setup = function()
    {
        // reset button
        var button = document.createElement("button");
        button.id = "zoomResetButton";
        button.name = "zoomResetButton";
        button.onclick = app.onZoomReset;
        button.setAttribute("style","width:100%; margin-top:0.5em;");
        button.setAttribute("class","ui-btn ui-btn-b");
        var text = document.createTextNode("Reset");
        button.appendChild(text);
        
        // list element
        var liElement = document.createElement("li");
        liElement.id = "zoomLi";
        liElement.style.display = "none";
        liElement.setAttribute("class","ui-block-c");
        liElement.appendChild(button);
        
        // node
        var node = document.getElementById("toolList");
        // append element
        node.appendChild(liElement);
        // trigger create event (mobile)
        $("#toolList").trigger("create");
    };
    
    /**
     * Display the tool HTML.
     * @method display
     * @param {Boolean} bool True to display, false to hide.
     */
    this.display = function(bool)
    {
        // display list element
        dwv.html.displayElement("zoomLi", bool);
    };
    
}; // class dwv.gui.base.ZoomAndPan

/**
 * Scroll tool base gui.
 * @class Scroll
 * @namespace dwv.gui.base
 * @constructor
 */
dwv.gui.base.Scroll = function ()
{
    /**
     * Setup the tool HTML.
     * @method setup
     */
    this.setup = function()
    {
        // list element
        var liElement = document.createElement("li");
        liElement.id = "scrollLi";
        liElement.style.display = "none";
        liElement.setAttribute("class","ui-block-c");
        
        // node
        var node = document.getElementById("toolList");
        // append element
        node.appendChild(liElement);
        // trigger create event (mobile)
        $("#toolList").trigger("create");
    };
    
    /**
     * Display the tool HTML.
     * @method display
     * @param {Boolean} bool True to display, false to hide.
     */
    this.display = function(bool)
    {
        // display list element
        dwv.html.displayElement("scrollLi", bool);
    };
    
}; // class dwv.gui.base.Scroll
