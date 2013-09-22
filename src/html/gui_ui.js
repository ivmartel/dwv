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
 * Update the progress bar.
 * @method updateProgress
 * @static
 * @param {Object} event A ProgressEvent.
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

