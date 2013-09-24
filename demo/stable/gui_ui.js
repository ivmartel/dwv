//! @namespace Main DWV namespace.
var dwv = dwv || {};
//! @namespace GUI classes for jquery-ui.
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

/**
 * @function Update the progress bar.
 * @param event A ProgressEvent.
 */
dwv.gui.updateProgress = function(event)
{
    if( event.lengthComputable ) {
        var percent = Math.round((event.loaded / event.total) * 100);
        // Increase the progress bar length.
        if( percent <= 100 ) {
            $("#progressbar").progressbar({ value: percent });
        }
    }
};
