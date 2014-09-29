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
 * Append the filter HTML to the page.
 * @method appendFilterHtml
 * @static
 */
dwv.gui.base.appendFilterHtml = function ()
{
    // filter select
    var filterSelector = dwv.html.createHtmlSelect("filterSelect",dwv.tool.filters);
    filterSelector.onchange = dwv.gui.onChangeFilter;

    // filter list element
    var filterLi = dwv.html.createHiddenElement("li", "filterLi");
    filterLi.setAttribute("class","ui-block-b");
    filterLi.appendChild(filterSelector);
    
    // append element
    dwv.html.appendElement("toolList", filterLi);
};

/**
 * Display the filter HTML.
 * @method displayFilterHtml
 * @static
 * @param {Boolean} flag True to display, false to hide.
 */
dwv.gui.base.displayFilterHtml = function (flag)
{
    dwv.html.displayElement("filterLi", flag);
};

/**
 * Initialise the filter HTML.
 * @method displayFilterHtml
 * @static
 */
dwv.gui.base.initFilterHtml = function ()
{
    // filter select: reset selected options
    var filterSelector = document.getElementById("filterSelect");
    filterSelector.selectedIndex = 0;
    dwv.gui.refreshSelect("#filterSelect");
};

/**
 * Append the threshold filter HTML to the page.
 * @method appendThresholdHtml
 * @static
 */
dwv.gui.filter.base.appendThresholdHtml = function ()
{
    // threshold list element
    var thresholdLi = dwv.html.createHiddenElement("li", "thresholdLi");
    thresholdLi.setAttribute("class","ui-block-c");
    
    // node
    var node = document.getElementById("toolList");
    // append threshold
    node.appendChild(thresholdLi);
    // threshold slider
    dwv.gui.appendSliderHtml();
    // trigger create event (mobile)
    $("#toolList").trigger("create");
};

/**
 * Clear the treshold filter HTML.
 * @method displayThresholdHtml
 * @static
 * @param {Boolean} flag True to display, false to hide.
 */
dwv.gui.filter.base.displayThresholdHtml = function (flag)
{
    dwv.html.displayElement("thresholdLi", flag);
};

/**
 * Initialise the treshold filter HTML.
 * @method initThresholdHtml
 * @static
 */
dwv.gui.filter.base.initThresholdHtml = function ()
{
    // threshold slider
    dwv.gui.initSliderHtml();
};

/**
 * Append the sharpen filter HTML to the page.
 * @method appendSharpenHtml
 * @static
 */
dwv.gui.filter.base.createFilterApplyButton = function ()
{
    var button = document.createElement("button");
    button.id = "runFilterButton";
    button.onclick = dwv.gui.onRunFilter;
    button.setAttribute("style","width:100%; margin-top:0.5em;");
    button.setAttribute("class","ui-btn ui-btn-b");
    button.appendChild(document.createTextNode("Apply"));
    return button;
};

/**
 * Append the sharpen filter HTML to the page.
 * @method appendSharpenHtml
 * @static
 */
dwv.gui.filter.base.appendSharpenHtml = function ()
{
    // sharpen list element
    var sharpenLi = dwv.html.createHiddenElement("li", "sharpenLi");
    sharpenLi.setAttribute("class","ui-block-c");
    sharpenLi.appendChild( dwv.gui.filter.base.createFilterApplyButton() );
    
    // append element
    dwv.html.appendElement("toolList", sharpenLi);
};

/**
 * Display the sharpen filter HTML.
 * @method displaySharpenHtml
 * @static
 * @param {Boolean} flag True to display, false to hide.
 */
dwv.gui.filter.base.displaySharpenHtml = function (flag)
{
    dwv.html.displayElement("sharpenLi", flag);
};

/**
 * Append the sobel filter HTML to the page.
 * @method appendSobelHtml
 * @static
 */
dwv.gui.filter.base.appendSobelHtml = function ()
{
    // sobel list element
    var sobelLi = dwv.html.createHiddenElement("li", "sobelLi");
    sobelLi.setAttribute("class","ui-block-c");
    sobelLi.appendChild( dwv.gui.filter.base.createFilterApplyButton() );
    
    // append element
    dwv.html.appendElement("toolList", sobelLi);
};

/**
 * Display the sobel filter HTML.
 * @method displaySobelHtml
 * @static
 * @param {Boolean} flag True to display, false to hide.
 */
dwv.gui.filter.base.displaySobelHtml = function (flag)
{
    dwv.html.displayElement("sobelLi", flag);
};

