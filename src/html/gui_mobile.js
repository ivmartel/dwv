/** 
 * GUI module.
 * @module gui
 */
var dwv = dwv || {};
dwv.gui = dwv.gui || {};

/**
 * Append the slider HTML.
 * @method getSliderHtml
 * @static
 */
dwv.gui.getSliderHtml = function()
{
    var min = app.getImage().getDataRange().min;
    var max = app.getImage().getDataRange().max;

    var inputMin = document.createElement("input");
    inputMin.setAttribute("id", "threshold-min");
    inputMin.setAttribute("max", max);
    inputMin.setAttribute("min", min);
    inputMin.setAttribute("value", min);
    inputMin.setAttribute("type", "range");

    var inputMax = document.createElement("input");
    inputMax.setAttribute("id", "threshold-max");
    inputMax.setAttribute("max", max);
    inputMax.setAttribute("min", min);
    inputMax.setAttribute("value", max);
    inputMax.setAttribute("type", "range");
    
    var div = document.createElement("div");
    div.setAttribute("id", "threshold-div");
    div.setAttribute("data-role", "rangeslider");
    div.appendChild(inputMin);
    div.appendChild(inputMax);
    div.setAttribute("data-mini", "true");
    document.getElementById("thresholdLi").appendChild(div);

    $("#threshold-div").bind("change",
        function( event ) {
            app.getToolBox().getSelectedTool().getSelectedFilter().run(
                { "min":$("#threshold-min").val(),
                  "max":$("#threshold-max").val() } );
        }
    );
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
    if( event.lengthComputable ) {
        var percent = Math.round((event.loaded / event.total) * 100);
        // Increase the progress bar length.
        if( percent < 100 ) {
            $.mobile.loading("show", {text: percent+"%", textVisible: true, theme: "b"} );
        }
        else if( percent === 100 ) {
            $.mobile.loading("hide");
        }
    }
};

