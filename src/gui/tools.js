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
        toolLi.className = "toolLi ui-block-a";
        toolLi.style.display = "none";
        toolLi.appendChild(toolSelector);
    
        // node
        var node = app.getElement("toolList");
        // clear it
        /*while(node.hasChildNodes()) {
            node.removeChild(node.firstChild);
        }*/
        // append
        node.appendChild(toolLi);
        // refresh
        dwv.gui.refreshElement(node);
    };
    
    /**
     * Display the toolbox HTML.
     * @method display
     * @param {Boolean} bool True to display, false to hide.
     */
    this.display = function (bool)
    {
        // tool list element
        var node = app.getElement("toolLi");
        dwv.html.displayElement(node, bool);
    };
    
    /**
     * Initialise the toolbox HTML.
     * @method initialise
     */
    this.initialise = function (displays)
    {
        // tool select: reset selected option
        var toolSelector = app.getElement("toolSelect");
        
        // update list
        var options = toolSelector.options;
        var selectedIndex = -1;
        for ( var i = 0; i < options.length; ++i ) {
            if ( !displays[i] ) {
                options[i].style.display = "none";
            }
            else {
                if ( selectedIndex === -1 ) {
                    selectedIndex = i;
                }
                options[i].style.display = "";
            }
        }
        toolSelector.selectedIndex = selectedIndex;
        
        // refresh
        dwv.gui.refreshElement(toolSelector);
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
        var wlSelector = dwv.html.createHtmlSelect("presetSelect", []);
        wlSelector.onchange = app.onChangeWindowLevelPreset;
        // colour map select
        var cmSelector = dwv.html.createHtmlSelect("colourMapSelect", dwv.tool.colourMaps);
        cmSelector.onchange = app.onChangeColourMap;
    
        // preset list element
        var wlLi = document.createElement("li");
        wlLi.className = "wlLi ui-block-b";
        wlLi.style.display = "none";
        wlLi.appendChild(wlSelector);
        // colour map list element
        var cmLi = document.createElement("li");
        cmLi.className = "cmLi ui-block-c";
        cmLi.style.display = "none";
        cmLi.appendChild(cmSelector);
    
        // node
        var node = app.getElement("toolList");
        // append preset
        node.appendChild(wlLi);
        // append colour map
        node.appendChild(cmLi);
        // refresh
        dwv.gui.refreshElement(node);
    };
    
    /**
     * Display the tool HTML.
     * @method display
     * @param {Boolean} bool True to display, false to hide.
     */
    this.display = function (bool)
    {
        // presets list element
        var node = app.getElement("wlLi");
        dwv.html.displayElement(node, bool);
        // colour map list element
        node = app.getElement("cmLi");
        dwv.html.displayElement(node, bool);
    };
    
    /**
     * Initialise the tool HTML.
     * @method initialise
     */
    this.initialise = function ()
    {
        // create new preset select
        var wlSelector = dwv.html.createHtmlSelect("presetSelect", app.getViewController().getPresets());
        wlSelector.onchange = app.onChangeWindowLevelPreset;
        wlSelector.title = "Select w/l preset.";
        
        // copy html list
        var wlLi = app.getElement("wlLi");
        // clear node
        dwv.html.cleanNode(wlLi);
        // add children
        wlLi.appendChild(wlSelector);
        // refresh
        dwv.gui.refreshElement(wlLi);
        
        // colour map select
        var cmSelector = app.getElement("colourMapSelect");
        cmSelector.selectedIndex = 0;
        // special monochrome1 case
        if( app.getImage().getPhotometricInterpretation() === "MONOCHROME1" )
        {
            cmSelector.selectedIndex = 1;
        }
        // refresh
        dwv.gui.refreshElement(cmSelector);
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
        shapeLi.className = "shapeLi ui-block-c";
        shapeLi.style.display = "none";
        shapeLi.appendChild(shapeSelector);
        //shapeLi.setAttribute("class","ui-block-c");
        // colour list element
        var colourLi = document.createElement("li");
        colourLi.className = "colourLi ui-block-b";
        colourLi.style.display = "none";
        colourLi.appendChild(colourSelector);
        //colourLi.setAttribute("class","ui-block-b");
        
        // node
        var node = app.getElement("toolList");
        // apend shape
        node.appendChild(shapeLi);
        // append colour
        node.appendChild(colourLi);
        // refresh
        dwv.gui.refreshElement(node);
    };

    /**
     * Display the tool HTML.
     * @method display
     * @param {Boolean} bool True to display, false to hide.
     */
    this.display = function (bool)
    {
        // colour list element
        var node = app.getElement("colourLi");
        dwv.html.displayElement(node, bool);
        // shape list element
        node = app.getElement("shapeLi");
        dwv.html.displayElement(node, bool);
    };
    
    /**
     * Initialise the tool HTML.
     * @method initialise
     */
    this.initialise = function ()
    {
        // shape select: reset selected option
        var shapeSelector = app.getElement("shapeSelect");
        shapeSelector.selectedIndex = 0;
        // refresh
        dwv.gui.refreshElement(shapeSelector);
        
        // colour select: reset selected option
        var colourSelector = app.getElement("colourSelect");
        colourSelector.selectedIndex = 0;
        // refresh
        dwv.gui.refreshElement(colourSelector);
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
        colourLi.className = "lwColourLi ui-block-b";
        colourLi.style.display = "none";
        //colourLi.setAttribute("class","ui-block-b");
        colourLi.appendChild(colourSelector);
        
        // node
        var node = app.getElement("toolList");
        // apend colour
        node.appendChild(colourLi);
        // refresh
        dwv.gui.refreshElement(node);
    };
    
    /**
     * Display the tool HTML.
     * @method display
     * @param {Boolean} bool True to display, false to hide.
     */
    this.display = function (bool)
    {
        // colour list
        var node = app.getElement("lwColourLi");
        dwv.html.displayElement(node, bool);
    };
    
    /**
     * Initialise the tool HTML.
     * @method initialise
     */
    this.initialise = function ()
    {
        var colourSelector = app.getElement("lwColourSelect");
        colourSelector.selectedIndex = 0;
        dwv.gui.refreshElement(colourSelector);
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
        button.className = "zoomResetButton";
        button.name = "zoomResetButton";
        button.onclick = app.onZoomReset;
        button.setAttribute("style","width:100%; margin-top:0.5em;");
        button.setAttribute("class","ui-btn ui-btn-b");
        var text = document.createTextNode("Reset");
        button.appendChild(text);
        
        // list element
        var liElement = document.createElement("li");
        liElement.className = "zoomLi ui-block-c";
        liElement.style.display = "none";
        //liElement.setAttribute("class","ui-block-c");
        liElement.appendChild(button);
        
        // node
        var node = app.getElement("toolList");
        // append element
        node.appendChild(liElement);
        // refresh
        dwv.gui.refreshElement(node);
    };
    
    /**
     * Display the tool HTML.
     * @method display
     * @param {Boolean} bool True to display, false to hide.
     */
    this.display = function(bool)
    {
        // display list element
        var node = app.getElement("zoomLi");
        dwv.html.displayElement(node, bool);
    };
    
}; // class dwv.gui.base.ZoomAndPan

/**
 * Scroll tool base gui.
 * @class Scroll
 * @namespace dwv.gui.base
 * @constructor
 */
dwv.gui.base.Scroll = function (app)
{
    /**
     * Setup the tool HTML.
     * @method setup
     */
    this.setup = function()
    {
        // list element
        var liElement = document.createElement("li");
        liElement.className = "scrollLi ui-block-c";
        liElement.style.display = "none";
        
        // node
        var node = app.getElement("toolList");
        // append element
        node.appendChild(liElement);
        // refresh
        dwv.gui.refreshElement(node);
    };
    
    /**
     * Display the tool HTML.
     * @method display
     * @param {Boolean} bool True to display, false to hide.
     */
    this.display = function(bool)
    {
        // display list element
        var node = app.getElement("scrollLi");
        dwv.html.displayElement(node, bool);
    };
    
}; // class dwv.gui.base.Scroll
