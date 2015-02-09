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
 * Get the size of the image display window.
 * @method getWindowSize
 * @static
 */
dwv.gui.base.getWindowSize = function()
{
    return { 'width': ($(window).width()), 'height': ($(window).height() - 147) };
};

/**
 * Update the progress bar.
 * @method updateProgress
 * @static
 * @param {Object} event A ProgressEvent.
 */
dwv.gui.updateProgress = function(event)
{
    // event is an ProgressEvent.
    if( event.lengthComputable )
    {
        var percent = Math.round((event.loaded / event.total) * 100);
        dwv.gui.displayProgress(percent);
    }
};

/**
 * Display a progress value.
 * @method displayProgress
 * @static
 * @param {Number} percent The progress percentage.
 */
dwv.gui.base.displayProgress = function(percent)
{
    // jquery-mobile specific
    if( percent < 100 ) {
        $.mobile.loading("show", {text: percent+"%", textVisible: true, theme: "b"} );
    }
    else if( percent === 100 ) {
        $.mobile.loading("hide");
    }
};

/**
 * Refresh a HTML select. Mainly for jquery-mobile.
 * @method refreshSelect
 * @static
 * @param {String} selectName The name of the HTML select to refresh.
 */
dwv.gui.base.refreshSelect = function(selectName)
{
    // jquery-mobile
    if( $(selectName).selectmenu ) {
        $(selectName).selectmenu('refresh');
    }
};

/**
 * Set the selected item of a HTML select.
 * @method refreshSelect
 * @static
 * @param {String} selectName The name of the HTML select.
 * @param {String} itemName The name of the itme to mark as selected.
 */
dwv.gui.setSelected = function(selectName, itemName)
{
    var select = document.getElementById(selectName);
    if ( select ) {
        var index = 0;
        for( index in select.options){ 
            if( select.options[index].text === itemName ) {
                break;
            }
        }
        select.selectedIndex = index;
        dwv.gui.refreshSelect("#" + selectName);
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
        document.getElementById("thresholdLi").appendChild(div);
        // bind change
        $("#threshold-div").on("change",
                function(/*event*/) {
                    app.onChangeMinMax(
                        { "min":$("#threshold-min").val(),
                          "max":$("#threshold-max").val() } );
                }
            );
        // trigger creation
        $("#toolList").trigger("create");
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
        // trigger creation
        $("#toolList").trigger("create");
    };

}; // class dwv.gui.base.Slider

/**
 * DICOM tags base gui.
 * @class DicomTags
 * @namespace dwv.gui.base
 * @constructor
 */
dwv.gui.base.DicomTags = function ()
{
    /**
     * Initialise the DICOM tags table. To be called once the DICOM has been parsed.
     * @method initialise
     * @param {Object} dataInfo The data information.
     */
    this.initialise = function (dataInfo)
    {
        // HTML node
        var node = document.getElementById("tags");
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
        table.id = "tagsTable";
        table.className = "tagsList table-stripe";
        table.setAttribute("data-role", "table");
        table.setAttribute("data-mode", "columntoggle");
        // search form
        node.appendChild(dwv.html.getHtmlSearchForm(table));
        // tags table
        node.appendChild(table);
        // trigger create event (mobile)
        $("#tags").trigger("create");
    };
    
}; // class dwv.gui.base.DicomTags
