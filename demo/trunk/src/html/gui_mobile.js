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

    var input = document.createElement("input");
    input.setAttribute("id", "threshold-input");
    input.setAttribute("max", max);
    input.setAttribute("min", min);
    input.setAttribute("value", min);
    input.setAttribute("type", "range");
    input.setAttribute("data-mini", "true");
    document.getElementById("thresholdLi").appendChild(input);

    $("#thresholdLi").bind("change",
        function( event ) {
            app.getToolBox().getSelectedTool().getSelectedFilter().run(
                    {"min":$("#threshold-input").val(), "max":max});
        }
    );
};
