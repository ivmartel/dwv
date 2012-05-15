/**
 * @namespace Tool classes.
 */
dwv.tool = dwv.tool || {};
/**
 * @namespace Filter classes.
 */
dwv.tool.filter = dwv.tool.filter || {};

dwv.tool.filter.threshold = function(min, max)
{
    app.getImage().restoreOrginalBuffer();
    var data = app.getImage().getBuffer();
    var value = 0;
    for (var i=0; i<data.length; ++i) {
        value = app.getImage().getValueAtOffset(i);
        if( value < min || value > max) {
            data[i] = 0;
        }
    }
    app.generateAndDrawImage();
};

/**
* @class Threshold Filter.
*/
dwv.tool.filter.ThresholdUI = function()
{
    
    this.display = function() {
        var div = document.createElement("div");
        div.id = "slider-range";
        document.getElementById('filterDiv').appendChild(div);

        var min = app.getImage().getDataRange().min;
        var max = app.getImage().getDataRange().max;
        
        $( "#slider-range" ).slider({
            range: true,
            min: min,
            max: max,
            values: [ min, max ],
            slide: function( event, ui ) {
                dwv.tool.filter.threshold(ui.values[ 0 ], ui.values[ 1 ]);
            }
        });
    };
};

/**
 * @function
 */
dwv.tool.onchangeFilter = function(event)
{    
    var filterId = parseInt(document.getElementById("filtersMenu").options[
        document.getElementById("filtersMenu").selectedIndex].value, 10);

    switch (filterId)
    {
        case 1: // threshold
            var filterUI = new dwv.tool.filter.ThresholdUI();
            filterUI.display();
            break;
        case 2: // sobel
            break;
    }
};

/**
* @class Filter tool.
*/
dwv.tool.Filter = function(app)
{
    this.enable = function(bool){
        if( bool ) {
            this.appendHtml();
        }
        else {
            this.clearHtml();
        }
    };

    this.keydown = function(event){
        app.handleKeyDown(event);
    };
};

dwv.tool.Filter.prototype.appendHtml = function()
{
    var div = document.createElement("div");
    div.id = "filterDiv";

    // paragraph for the window level preset selector
    var filterParagraph = document.createElement("p");  
    filterParagraph.appendChild(document.createTextNode("Filter: "));
    // filter selector
    var filterSelector = document.createElement("select");
    filterSelector.id = "filtersMenu";
    filterSelector.name = "filtersMenu";
    filterSelector.onchange = dwv.tool.onchangeFilter;
    filterSelector.selectedIndex = 1;
    // selector options
    var filterOptions = ["Threshold", "Sobel"];
    // append options
    var option;
    for ( var i = 0; i < filterOptions.length; ++i )
    {
        option = document.createElement("option");
        option.value = i+1;
        option.appendChild(document.createTextNode(filterOptions[i]));
        filterSelector.appendChild(option);
    }
    
    // append all
    filterParagraph.appendChild(filterSelector);
    div.appendChild(filterParagraph);
    document.getElementById('toolbox').appendChild(div);

    // enable default filter
    var filterUI = new dwv.tool.filter.ThresholdUI();
    filterUI.display();
};

dwv.tool.Filter.prototype.clearHtml = function()
{
    // find the tool specific node
    var node = document.getElementById('filterDiv');
    // delete its content
    while (node.hasChildNodes()) {
        node.removeChild(node.firstChild);
    }
    // remove the tool specific node
    var top = document.getElementById('toolbox');
    top.removeChild(node);
};

/**
 * @class Run filter command.
 * @param filter The filter to run.
 * @param app The application to draw the line on.
 */
dwv.tool.RunFilterCommand = function(filter, app)
{
    // command name
    var name = "RunFilterCommand";
    this.setName = function(str) { name = str; };
    this.getName = function() { return name; };

    // main method
    this.execute = function()
    {
        filter.run(app.getImage().getBuffer(), args);
    }; 
}; // RunFilterCommand class
