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
 * Namespace for base GUI functions.
 * @class base
 * @namespace dwv.gui
 * @static
 */
dwv.gui.base = dwv.gui.base || {};

/**
 * Get the size of the image display window.
 * @method getWindowSize
 * @static
 */
dwv.gui.base.getWindowSize = function()
{
    return { 'width': window.innerWidth, 'height': window.innerHeight - 147 };
};

/**
 * Display a progress value.
 * @method displayProgress
 * @static
 * @param {Number} percent The progress percentage.
 */
dwv.gui.base.displayProgress = function(/*percent*/)
{
    // default does nothing...
};

/**
 * Get a HTML element associated to a container div.
 * @method getElement
 * @static
 * @param containerDivId The id of the container div.
 * @param name The name or id to find.
 * @return The found element or null.
 */
dwv.gui.base.getElement = function (containerDivId, name)
{
    // get by class in the container div
    var parent = document.getElementById(containerDivId);
    var elements = parent.getElementsByClassName(name);
    // getting the last element since some libraries (ie jquery-mobile) creates
    // span in front of regular tags (such as select)...
    var element = elements[elements.length-1];
    // if not found get by id with 'containerDivId-className'
    if ( typeof element === "undefined" ) {
        element = document.getElementById(containerDivId + '-' + name);
    }
    return element;
 };

 /**
 * Refresh a HTML element. Mainly for jquery-mobile.
 * @method refreshElement
 * @static
 * @param {String} element The HTML element to refresh.
 */
dwv.gui.base.refreshElement = function (/*element*/)
{
    // base does nothing...
};

/**
 * Set the selected item of a HTML select.
 * @method setSelected
 * @static
 * @param {String} selectName The name of the HTML select.
 * @param {String} itemName The name of the itme to mark as selected.
 */
dwv.gui.setSelected = function(element, itemName)
{
    if ( element ) {
        var index = 0;
        for( index in element.options){
            if( element.options[index].text === itemName ) {
                break;
            }
        }
        element.selectedIndex = index;
        dwv.gui.refreshElement(element);
    }
};

/**
 * Slider base gui.
 * @class Slider
 * @namespace dwv.gui.base
 * @constructor
 */
dwv.gui.base.Slider = function (app)
{
    /**
     * Append the slider HTML.
     * @method append
     */
    this.append = function ()
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
        app.getElement("thresholdLi").appendChild(div);
        // bind change
        $("#threshold-div").on("change",
                function(/*event*/) {
                    app.onChangeMinMax(
                        { "min":$("#threshold-min").val(),
                          "max":$("#threshold-max").val() } );
                }
            );
        // refresh
        dwv.gui.refreshElement(app.getElement("toolList"));
    };
    
    /**
     * Initialise the slider HTML.
     * @method initialise
     */
    this.initialise = function ()
    {
        var min = app.getImage().getDataRange().min;
        var max = app.getImage().getDataRange().max;
        
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
        // refresh
        dwv.gui.refreshElement(app.getElement("toolList"));
    };

}; // class dwv.gui.base.Slider

/**
 * DICOM tags base gui.
 * @class DicomTags
 * @namespace dwv.gui.base
 * @constructor
 */
dwv.gui.base.DicomTags = function (app)
{
    /**
     * Initialise the DICOM tags table. To be called once the DICOM has been parsed.
     * @method initialise
     * @param {Object} dataInfo The data information.
     */
    this.initialise = function (dataInfo)
    {
        // HTML node
        var node = app.getElement("tags");
        if( node === null ) {
            return;
        }
        // remove possible previous
        while (node.hasChildNodes()) { 
            node.removeChild(node.firstChild);
        }
        // tag list table (without the pixel data)
        if(dataInfo.PixelData) {
            dataInfo.PixelData.value = "...";
        }
        // tags HTML table
        var table = dwv.html.toTable(dataInfo);
        table.className = "tagsTable";
        //table.setAttribute("class", "tagsList");
        table.setAttribute("data-role", "table");
        table.setAttribute("data-mode", "columntoggle");
        // search form
        node.appendChild(dwv.html.getHtmlSearchForm(table));
        // tags table
        node.appendChild(table);
        // refresh
        dwv.gui.refreshElement(node);
    };
    
}; // class dwv.gui.base.DicomTags
