/**
 * @namespace GUI classes.
 * 
 * Specific to jquery-mobile.
 * 
 */
dwv.gui = dwv.gui || {};

/**
* @function Get a slider.
*/
dwv.gui.getSliderHtml = function()
{
    var min = app.getImage().getDataRange().min;
    var max = app.getImage().getDataRange().max;

    // TODO: fix...
    $("#threshold-slider").attr("min", min).slider("refresh");
    $("#threshold-slider").attr("max", max).slider("refresh");
    $("#threshold-slider").attr("value", min).slider("refresh");
    
    $("#threshold-slider").bind("change",
        function( event ) {
            app.getToolBox().getSelectedTool().getSelectedFilter().run(
                    {'min':$("#threshold-slider").val(), 'max':max});
        }
    );
};
