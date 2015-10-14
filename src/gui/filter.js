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
        filterLi.className += " ui-block-b";
        filterLi.appendChild(filterSelector);
        
        // append element
        var node = app.getElement("toolList").getElementsByTagName("ul")[0];
        dwv.html.appendElement(node, filterLi);
    };
    
    /**
     * Display the tool HTML.
     * @method display
     * @param {Boolean} flag True to display, false to hide.
     */
    this.display = function (flag)
    {
        var node = app.getElement("filterLi");
        dwv.html.displayElement(node, flag);
    };
    
    /**
     * Initialise the tool HTML.
     * @method initialise
     */
    this.initialise = function ()
    {
        // filter select: reset selected options
        var filterSelector = app.getElement("filterSelect");
        filterSelector.selectedIndex = 0;
        // refresh
        dwv.gui.refreshElement(filterSelector);
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
        thresholdLi.className += " ui-block-c";
        
        // node
        var node = app.getElement("toolList").getElementsByTagName("ul")[0];
        // append threshold
        node.appendChild(thresholdLi);
        // threshold slider
        slider.append();
        // refresh
        dwv.gui.refreshElement(node);
    };
    
    /**
     * Clear the threshold filter HTML.
     * @method display
     * @param {Boolean} flag True to display, false to hide.
     */
    this.display = function (flag)
    {
        var node = app.getElement("thresholdLi");
        dwv.html.displayElement(node, flag);
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
        sharpenLi.className += " ui-block-c";
        sharpenLi.appendChild( dwv.gui.filter.base.createFilterApplyButton(app) );
        // append element
        var node = app.getElement("toolList").getElementsByTagName("ul")[0];
        dwv.html.appendElement(node, sharpenLi);
    };
    
    /**
     * Display the sharpen filter HTML.
     * @method display
     * @param {Boolean} flag True to display, false to hide.
     */
    this.display = function (flag)
    {
        var node = app.getElement("sharpenLi");
        dwv.html.displayElement(node, flag);
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
        sobelLi.className += " ui-block-c";
        sobelLi.appendChild( dwv.gui.filter.base.createFilterApplyButton(app) );
        // append element
        var node = app.getElement("toolList").getElementsByTagName("ul")[0];
        dwv.html.appendElement(node, sobelLi);
    };
    
    /**
     * Display the sobel filter HTML.
     * @method display
     * @param {Boolean} flag True to display, false to hide.
     */
    this.display = function (flag)
    {
        var node = app.getElement("sobelLi");
        dwv.html.displayElement(node, flag);
    };
    
}; // class dwv.gui.base.Sobel

