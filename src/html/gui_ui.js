/**
 * @namespace GUI classes.
 * 
 * Specific to jquery-ui.
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
    
    $( "#thresholdLi" ).slider({
        range: true,
        min: min,
        max: max,
        values: [ min, max ],
        slide: function( event, ui ) {
            app.getToolBox().getSelectedTool().getSelectedFilter().run(
                    {'min':ui.values[0], 'max':ui.values[1]});
        }
    });
};
