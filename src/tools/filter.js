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
    var image = app.getImage().clone();
    var data = image.getBuffer();
    var value = 0;
    for (var i=0; i<data.length; ++i) {
        value = image.getValueAtOffset(i);
        if( value < min || value > max) {
            data[i] = 0;
        }
    }
    
    app.setImage(image);
    app.generateAndDrawImage();
};

dwv.tool.filter.convolute = function(weights)
{
    var originalImage = app.getImage();
    var newImage = app.getImage().clone();
    var newBuffer = newImage.getBuffer();
    var value = 0;

    var side = Math.round(Math.sqrt(weights.length));
    var halfSide = Math.floor(side/2);
    
    var ncols = originalImage.getSize().getNumberOfColumns();
    var nrows = originalImage.getSize().getNumberOfRows();
    
    // go through the destination image pixels
    for (var y=0; y<nrows; y++) {
        for (var x=0; x<ncols; x++) {
            var dstOff = y*ncols + x;
            // calculate the weighed sum of the source image pixels that
            // fall under the convolution matrix
            var newValue = 0;
            for (var cy=0; cy<side; cy++) {
                for (var cx=0; cx<side; cx++) {
                    var scy = y + cy - halfSide;
                    var scx = x + cx - halfSide;
                    if (scy >= 0 && scy < nrows && scx >= 0 && scx < ncols) {
                        var srcOff = scy*ncols + scx;
                        var wt = weights[cy*side+cx];
                        value = originalImage.getValueAtOffset(srcOff);
                        newValue += value * wt;
                    }
                }
            }
            newBuffer[dstOff] = (newValue - originalImage.getLookup().rescaleIntercept) / originalImage.getLookup().rescaleSlope;
        }
    }
    
    return newImage;
};

dwv.tool.filter.sharpen = function()
{
    var newImage = dwv.tool.filter.convolute(
        [  0, -1,  0,
          -1,  5, -1,
           0, -1,  0 ] );
    
    app.setImage(newImage);
    app.generateAndDrawImage();
};

dwv.tool.filter.sobel = function()
{
    var gradX = dwv.tool.filter.convolute(
        [ -1,  0,  1,
          -2,  0,  2,
          -1,  0,  1 ] );

    var gradY = dwv.tool.filter.convolute(
        [ -1, -2, -1,
           0,  0,  0,
           1,  2,  1 ] );
    
    gradX.transform( gradY, function(x,y){return Math.sqrt(x*x+y*y); } );
    
    app.setImage(gradX);
    app.generateAndDrawImage();
};

dwv.tool.filter.clearFilterDiv = function()
{
    // find the tool specific node
    var node = document.getElementById('subFilterDiv');
    // delete its content
    while (node.hasChildNodes()) {
        node.removeChild(node.firstChild);
    }
    // remove the tool specific node
    var top = document.getElementById('filterDiv');
    top.removeChild(node);
};

/**
* @class Threshold Filter User Interface.
*/
dwv.tool.filter.ThresholdUI = function()
{
    this.display = function() {
        var div = document.createElement("div");
        div.id = "subFilterDiv";
        document.getElementById('filterDiv').appendChild(div);

        var min = app.getImage().getDataRange().min;
        var max = app.getImage().getDataRange().max;
        
        $( "#subFilterDiv" ).slider({
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
* @class Sharpen Filter User Interface.
*/
dwv.tool.filter.SharpenUI = function()
{
    this.display = function() {
        var div = document.createElement("div");
        div.id = "subFilterDiv";
        
        var paragraph = document.createElement("p");  
        paragraph.id = 'applyFilter';
        paragraph.name = 'applyFilter';

        var button = document.createElement("button");
        button.id = "applyFilterButton";
        button.name = "applyFilterButton";
        button.onclick = dwv.tool.filter.sharpen;
        var text = document.createTextNode('Apply');
        button.appendChild(text);

        paragraph.appendChild(button);
        div.appendChild(paragraph);
        document.getElementById('filterDiv').appendChild(div);
    };    
};

/**
* @class Sobel Filter User Interface.
*/
dwv.tool.filter.SobelUI = function()
{
    this.display = function() {
        var div = document.createElement("div");
        div.id = "subFilterDiv";
        
        var paragraph = document.createElement("p");  
        paragraph.id = 'applyFilter';
        paragraph.name = 'applyFilter';

        var button = document.createElement("button");
        button.id = "applyFilterButton";
        button.name = "applyFilterButton";
        button.onclick = dwv.tool.filter.sobel;
        var text = document.createTextNode('Apply');
        button.appendChild(text);

        paragraph.appendChild(button);
        div.appendChild(paragraph);
        document.getElementById('filterDiv').appendChild(div);
    };    
};

/**
 * @function
 */
dwv.tool.onchangeFilter = function(event)
{    
    var filterId = parseInt(document.getElementById("filtersMenu").options[
        document.getElementById("filtersMenu").selectedIndex].value, 10);

    var filterUI = 0;
    dwv.tool.filter.clearFilterDiv();
    
    switch (filterId)
    {
        case 1: // threshold
            filterUI = new dwv.tool.filter.ThresholdUI();
            break;
        case 2: // sharpen
            filterUI = new dwv.tool.filter.SharpenUI();
            break;
        case 3: // sobel
            filterUI = new dwv.tool.filter.SobelUI();
            break;
    }
    
    filterUI.display();
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
    var filterOptions = ["Threshold", "Sharpen", "Sobel"];
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
