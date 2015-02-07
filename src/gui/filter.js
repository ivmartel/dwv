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
dwv.gui.filter = dwv.gui.filter || {};
dwv.gui.filter.base = dwv.gui.filter.base || {};

/**
 * Filter tool base gui.
 * @class Filter
 * @namespace dwv.gui.base
 * @constructor
 */
dwv.gui.base.Filter = function (app)
{
    /**
     * Setup the filter tool HTML.
     * @method setup
     */
    this.setup = function (list)
    {
        // filter select
        var filterSelector = dwv.html.createHtmlSelect("filterSelect", list);
        filterSelector.onchange = app.onChangeFilter;
    
        // filter list element
        var filterLi = dwv.html.createHiddenElement("li", "filterLi");
        filterLi.setAttribute("class","ui-block-b");
        filterLi.appendChild(filterSelector);
        
        // append element
        dwv.html.appendElement("toolList", filterLi);
    };
    
    /**
     * Display the tool HTML.
     * @method display
     * @param {Boolean} flag True to display, false to hide.
     */
    this.display = function (flag)
    {
        dwv.html.displayElement("filterLi", flag);
    };
    
    /**
     * Initialise the tool HTML.
     * @method initialise
     */
    this.initialise = function ()
    {
        // filter select: reset selected options
        var filterSelector = document.getElementById("filterSelect");
        filterSelector.selectedIndex = 0;
        dwv.gui.refreshSelect("#filterSelect");
    };

}; // class dwv.gui.base.Filter

/**
 * Threshold filter base gui.
 * @class Threshold
 * @namespace dwv.gui.base
 * @constructor
 */
dwv.gui.base.Threshold = function (app)
{
    /**
     * Threshold slider.
     * @property slider
     * @private
     * @type Object
     */
    var slider = new dwv.gui.Slider(app);
    
    /**
     * Setup the threshold filter HTML.
     * @method setup
     */
    this.setup = function ()
    {
        // threshold list element
        var thresholdLi = dwv.html.createHiddenElement("li", "thresholdLi");
        thresholdLi.setAttribute("class","ui-block-c");
        
        // node
        var node = document.getElementById("toolList");
        // append threshold
        node.appendChild(thresholdLi);
        // threshold slider
        slider.append();
        // trigger create event (mobile)
        $("#toolList").trigger("create");
    };
    
    /**
     * Clear the threshold filter HTML.
     * @method display
     * @param {Boolean} flag True to display, false to hide.
     */
    this.display = function (flag)
    {
        dwv.html.displayElement("thresholdLi", flag);
    };
    
    /**
     * Initialise the threshold filter HTML.
     * @method initialise
     */
    this.initialise = function ()
    {
        // threshold slider
        slider.initialise();
    };

}; // class dwv.gui.base.Threshold
    
/**
 * Create the apply filter button.
 * @method createFilterApplyButton
 * @static
 */
dwv.gui.filter.base.createFilterApplyButton = function (app)
{
    var button = document.createElement("button");
    button.id = "runFilterButton";
    button.onclick = app.onRunFilter;
    button.setAttribute("style","width:100%; margin-top:0.5em;");
    button.setAttribute("class","ui-btn ui-btn-b");
    button.appendChild(document.createTextNode("Apply"));
    return button;
};

/**
 * Sharpen filter base gui.
 * @class Sharpen
 * @namespace dwv.gui.base
 * @constructor
 */
dwv.gui.base.Sharpen = function (app)
{
    /**
     * Setup the sharpen filter HTML.
     * @method setup
     */
    this.setup = function ()
    {
        // sharpen list element
        var sharpenLi = dwv.html.createHiddenElement("li", "sharpenLi");
        sharpenLi.setAttribute("class","ui-block-c");
        sharpenLi.appendChild( dwv.gui.filter.base.createFilterApplyButton(app) );
        // append element
        dwv.html.appendElement("toolList", sharpenLi);
    };
    
    /**
     * Display the sharpen filter HTML.
     * @method display
     * @param {Boolean} flag True to display, false to hide.
     */
    this.display = function (flag)
    {
        dwv.html.displayElement("sharpenLi", flag);
    };
    
}; // class dwv.gui.base.Sharpen

/**
 * Sobel filter base gui.
 * @class Sobel
 * @namespace dwv.gui.base
 * @constructor
 */
dwv.gui.base.Sobel = function (app)
{
    /**
     * Setup the sobel filter HTML.
     * @method setup
     */
    this.setup = function ()
    {
        // sobel list element
        var sobelLi = dwv.html.createHiddenElement("li", "sobelLi");
        sobelLi.setAttribute("class","ui-block-c");
        sobelLi.appendChild( dwv.gui.filter.base.createFilterApplyButton(app) );
       // append element
        dwv.html.appendElement("toolList", sobelLi);
    };
    
    /**
     * Display the sobel filter HTML.
     * @method display
     * @param {Boolean} flag True to display, false to hide.
     */
    this.display = function (flag)
    {
        dwv.html.displayElement("sobelLi", flag);
    };
    
}; // class dwv.gui.base.Sobel

