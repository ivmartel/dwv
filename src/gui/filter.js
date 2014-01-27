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
 * Append the slider HTML.
 * @method appendSliderHtml
 * @static
 */
dwv.gui.appendSliderHtml = function()
{
    if( app.isMobile() )
    {
        // default values
        var min = 0;
        var max = 1;
        
        // jquery-mobile range slider
        // minimum input
        var inputMin = document.createElement("input");
        inputMin.id = "threshold-min";
        inputMin.type = "range";
        inputMin.max = max;
        inputMin.min = min;
        inputMin.value = min;
        // maximum input
        var inputMax = document.createElement("input");
        inputMax.id = "threshold-max";
        inputMax.type = "range";
        inputMax.max = max;
        inputMax.min = min;
        inputMax.value = max;
        // slicer div
        var div = document.createElement("div");
        div.id = "threshold-div";
        div.setAttribute("data-role", "rangeslider");
        div.appendChild(inputMin);
        div.appendChild(inputMax);
        div.setAttribute("data-mini", "true");
        // append to document
        document.getElementById("thresholdLi").appendChild(div);
        // bind change
        $("#threshold-div").on("change",
                function( event ) {
                    dwv.gui.onChangeMinMax(
                        { "min":$("#threshold-min").val(),
                          "max":$("#threshold-max").val() } );
                }
            );
        // trigger creation
        $("#toolList").trigger("create");
    }
};

/**
 * Initialise the slider HTML.
 * @method initSliderHtml
 * @static
 */
dwv.gui.initSliderHtml = function()
{
    var min = app.getImage().getDataRange().min;
    var max = app.getImage().getDataRange().max;
    
    if( app.isMobile() )
    {
        // minimum input
        var inputMin = document.getElementById("threshold-min");
        inputMin.max = max;
        inputMin.min = min;
        inputMin.value = min;
        // maximum input
        var inputMax = document.getElementById("threshold-max");
        inputMax.max = max;
        inputMax.min = min;
        inputMax.value = max;
        // trigger creation
        $("#toolList").trigger("create");
    }
    else
    {
        // jquery-ui slider
        $( "#thresholdLi" ).slider({
            range: true,
            min: min,
            max: max,
            values: [ min, max ],
            slide: function( event, ui ) {
                dwv.gui.onChangeMinMax(
                        {'min':ui.values[0], 'max':ui.values[1]});
            }
        });
    }
};

/**
 * Append the filter HTML to the page.
 * @method appendFilterHtml
 * @static
 */
dwv.gui.appendFilterHtml = function()
{
    // filter select
    var filterSelector = dwv.html.createHtmlSelect("filterSelect",dwv.tool.filters);
    filterSelector.onchange = dwv.gui.onChangeFilter;

    // filter list element
    var filterLi = document.createElement("li");
    filterLi.id = "filterLi";
    filterLi.style.display = "none";
    filterLi.setAttribute("class","ui-block-b");
    filterLi.appendChild(filterSelector);
    
    // node
    var node = document.getElementById("toolList");
    // apend filter
    node.appendChild(filterLi);
    // trigger create event (mobile)
    $("#toolList").trigger("create");
};

/**
 * Display the filter HTML.
 * @method displayFilterHtml
 * @static
 * @param {Boolean} bool True to display, false to hide.
 */
dwv.gui.displayFilterHtml = function(bool)
{
    // filter lsit element
    var filterLi = document.getElementById("filterLi");
    filterLi.style.display = bool ? "" : "none";
};

/**
 * Initialise the filter HTML.
 * @method displayFilterHtml
 * @static
 */
dwv.gui.initFilterHtml = function()
{
    // filter select: reset selected options
    var filterSelector = document.getElementById("filterSelect");
    filterSelector.selectedIndex = 0;
    dwv.gui.refreshSelect("#filterSelect");
};

// create namespace if not there
dwv.gui.filter = dwv.gui.filter || {};

/**
 * Append the threshold filter HTML to the page.
 * @method appendThresholdHtml
 * @static
 */
dwv.gui.filter.appendThresholdHtml = function()
{
    // threshold list element
    var thresholdLi = document.createElement("li");
    thresholdLi.id = "thresholdLi";
    thresholdLi.setAttribute("class","ui-block-c");
    thresholdLi.style.display = "none";
    
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
 * @param {Boolean} bool True to display, false to hide.
 */
dwv.gui.filter.displayThresholdHtml = function(bool)
{
    // threshold list element
    var thresholdLi = document.getElementById("thresholdLi");
    thresholdLi.style.display = bool ? "" : "none";
};

/**
 * Initialise the treshold filter HTML.
 * @method initThresholdHtml
 * @static
 */
dwv.gui.filter.initThresholdHtml = function()
{
    // threshold slider
    dwv.gui.initSliderHtml();
};

/**
 * Append the sharpen filter HTML to the page.
 * @method appendSharpenHtml
 * @static
 */
dwv.gui.filter.appendSharpenHtml = function()
{
    // sharpen button
    var buttonRun = document.createElement("button");
    buttonRun.id = "runFilterButton";
    buttonRun.onclick = dwv.gui.onRunFilter;
    buttonRun.appendChild(document.createTextNode("Apply"));

    // sharpen list element
    var sharpenLi = document.createElement("li");
    sharpenLi.id = "sharpenLi";
    sharpenLi.style.display = "none";
    sharpenLi.setAttribute("class","ui-block-c");
    sharpenLi.appendChild(buttonRun);
    
    // node
    var node = document.getElementById("toolList");
    // append threshold
    node.appendChild(sharpenLi);
    // trigger create event (mobile)
    $("#toolList").trigger("create");
};

/**
 * Display the sharpen filter HTML.
 * @method displaySharpenHtml
 * @static
 * @param {Boolean} bool True to display, false to hide.
 */
dwv.gui.filter.displaySharpenHtml = function(bool)
{
    // sharpen list element
    var sharpenLi = document.getElementById("sharpenLi");
    sharpenLi.style.display = bool ? "" : "none";
};

/**
 * Append the sobel filter HTML to the page.
 * @method appendSobelHtml
 * @static
 */
dwv.gui.filter.appendSobelHtml = function()
{
    // sobel button
    var buttonRun = document.createElement("button");
    buttonRun.id = "runFilterButton";
    buttonRun.onclick = dwv.gui.onRunFilter;
    buttonRun.appendChild(document.createTextNode("Apply"));

    // sobel list element
    var sobelLi = document.createElement("li");
    sobelLi.id = "sobelLi";
    sobelLi.style.display = "none";
    sobelLi.setAttribute("class","ui-block-c");
    sobelLi.appendChild(buttonRun);
    
    // node
    var node = document.getElementById("toolList");
    // append sobel
    node.appendChild(sobelLi);
    // trigger create event (mobile)
    $("#toolList").trigger("create");
};

/**
 * Display the sobel filter HTML.
 * @method displaySobelHtml
 * @static
 * @param {Boolean} bool True to display, false to hide.
 */
dwv.gui.filter.displaySobelHtml = function(bool)
{
    // sobel list element
    var sobelLi = document.getElementById("sobelLi");
    sobelLi.style.display = bool ? "" : "none";
};

