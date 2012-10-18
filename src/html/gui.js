/**
 * @namespace GUI classes.
 */
dwv.gui = dwv.gui || {};

dwv.gui.onChangeWindowLevelPreset = function(event)
{
    app.getToolBox().getSelectedTool().setPreset(this.value);
};

dwv.gui.onChangeColourMap = function(event)
{
    app.getToolBox().getSelectedTool().setColourMap(this.value);
};

dwv.gui.onChangeTool = function(event)
{
    app.getToolBox().setSelectedTool(this.value);
};

dwv.gui.onChangeFilter = function(event)
{
    app.getToolBox().getSelectedTool().setSelectedFilter(this.value);
};

dwv.gui.onChangeShape = function(event)
{
    app.getToolBox().getSelectedTool().setShapeName(this.value);
};

dwv.gui.onChangeShapeColour = function(event)
{
    app.getToolBox().getSelectedTool().setShapeColour(this.value);
};

dwv.gui.appendWindowLevelHtml = function()
{
    // preset selector
    var wlSelector = document.createElement("select");
    wlSelector.id = "presetsMenu";
    wlSelector.name = "presetsMenu";
    wlSelector.onchange = dwv.gui.onChangeWindowLevelPreset;
    wlSelector.selectedIndex = 1;
    // selector options
    var wlOptions = [];
    // from DICOM
    for ( var p = 0; p < app.getImage().getLookup().windowPresets.length; ++p )
    {
        wlOptions.push( app.getImage().getLookup().windowPresets[p].name );
    }
    // default
    var wlDefaultOptions = ["Abdomen", "Lung", "Brain", "Bone", "Head", "Min/Max"];
    for ( var d = 0; d < wlDefaultOptions.length; ++d )
    {
        wlOptions.push( wlDefaultOptions[d] );
    }
    // append options
    var option;
    for ( var i = 0; i < wlOptions.length; ++i )
    {
        option = document.createElement("option");
        option.value = wlOptions[i].toLowerCase();
        option.appendChild(document.createTextNode(wlOptions[i]));
        wlSelector.appendChild(option);
    }
    
    // colour map selector
    var cmSelector = dwv.html.createHtmlSelect("colourMapMenu",dwv.tool.colourMaps);
    cmSelector.onchange = dwv.gui.onChangeColourMap;

    // formatting...
    var div = document.createElement("div");
    div.id = "wl-options";
    // list
    var list_ul = document.createElement("ul");
    // first item: window level
    var list_li0 = document.createElement("li");
    list_li0.appendChild(document.createTextNode("WL Preset: "));
    list_li0.appendChild(wlSelector);
    // append to list
    list_ul.appendChild(list_li0);
    // second item: colour map selector
    var list_li1 = document.createElement("li");
    list_li1.appendChild(document.createTextNode("Colour Map: "));
    list_li1.appendChild(cmSelector);
    // append to list
    list_ul.appendChild(list_li1);
    // append list to div
    div.appendChild(list_ul);
    
    // add to document
    document.getElementById("toolbox").appendChild(div);
};

dwv.gui.clearWindowLevelHtml = function()
{
    dwv.html.removeAllChildren("wl-options", "toolbox");
};

/**
 * @function Append the color chooser to the HTML document in the 'colourChooser' node.
 */
dwv.gui.appendColourChooserHtml = function()
{
    // select
    var selector = dwv.html.createHtmlSelect("colourSelect",dwv.tool.colors);
    selector.onchange = dwv.gui.onChangeShapeColour;
    // paragraph
    var paragraph = document.createElement("p");  
    paragraph.appendChild(document.createTextNode("Colour: "));
    paragraph.appendChild(selector);
    // div
    var div = document.createElement("div");
    div.id = "colourChooser";
    div.appendChild(paragraph);
    // append to document
    document.getElementById('toolbox').appendChild(div);
};

/**
 * @function Remove the color chooser specific node.
 */
dwv.gui.clearColourChooserHtml = function()
{
    dwv.html.removeAllChildren("colourChooser", "toolbox");
};

/**
 * @function Append the shape chooser to the HTML document in the 'shapeChooser' node.
 */
dwv.gui.appendShapeChooserHtml = function()
{
    // select
    var selector = dwv.html.createHtmlSelect("shapeSelect",dwv.tool.shapes);
    selector.onchange = dwv.gui.onChangeShape;
    // paragraph
    var paragraph = document.createElement("p");  
    paragraph.appendChild(document.createTextNode("Shape: "));
    paragraph.appendChild(selector);
    // div
    var div = document.createElement("div");
    div.id = "shapeChooser";
    div.appendChild(paragraph);
    // append to document
    document.getElementById('toolbox').appendChild(div);
};

/**
 * @function Remove the shape chooser specific node.
 */
dwv.gui.clearShapeChooserHtml = function()
{
    dwv.html.removeAllChildren("shapeChooser", "toolbox");
};

dwv.gui.appendFilterHtml = function()
{
    // select
    var selector = dwv.html.createHtmlSelect("filterSelect",dwv.tool.filters);
    selector.onchange = dwv.gui.onChangeFilter;
    // paragraph
    var paragraph = document.createElement("p");  
    paragraph.appendChild(document.createTextNode("Filter: "));
    paragraph.appendChild(selector);
    // div
    var div = document.createElement("div");
    div.id = "filterDiv";
    div.appendChild(paragraph);
    // append to document
    document.getElementById('toolbox').appendChild(div);
};

dwv.gui.clearFilterHtml = function()
{
    dwv.html.removeAllChildren("filterDiv", "toolbox");
};

dwv.gui.clearSubFilterDiv = function()
{
    dwv.html.removeAllChildren("subFilterDiv", "filterDiv");
};

/**
 * @namespace GUI classes.
 */
dwv.gui.filter = dwv.gui.filter || {};

/**
* @function Threshold Filter User Interface.
*/
dwv.gui.filter.displayThreshold = function()
{
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
            app.getToolBox().getSelectedTool().getSelectedFilter().run(
                    {'min':ui.values[0], 'max':ui.values[1]});
        }
    });
};

/**
* @function Threshold Filter User Interface.
*/
dwv.gui.filter.displayThreshold2 = function()
{
    var min = app.getImage().getDataRange().min;
    var max = app.getImage().getDataRange().max;
    
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

/**
* @function Sharpen Filter User Interface.
*/
dwv.gui.filter.displaySharpen = function()
{
    var div = document.createElement("div");
    div.id = "subFilterDiv";
    
    var paragraph = document.createElement("p");  
    paragraph.id = 'applyFilter';
    paragraph.name = 'applyFilter';

    var button = document.createElement("button");
    button.id = "applyFilterButton";
    button.name = "applyFilterButton";
    button.onclick = app.getToolBox().getSelectedTool().getSelectedFilter().run;
    var text = document.createTextNode('Apply');
    button.appendChild(text);

    paragraph.appendChild(button);
    div.appendChild(paragraph);
    document.getElementById('filterDiv').appendChild(div);
};

/**
* @function Sobel Filter User Interface.
*/
dwv.gui.filter.displaySobel = function()
{
    var div = document.createElement("div");
    div.id = "subFilterDiv";
    
    var paragraph = document.createElement("p");  
    paragraph.id = 'applyFilter';
    paragraph.name = 'applyFilter';

    var button = document.createElement("button");
    button.id = "applyFilterButton";
    button.name = "applyFilterButton";
    button.onclick = app.getToolBox().getSelectedTool().getSelectedFilter().run;
    var text = document.createTextNode('Apply');
    button.appendChild(text);

    paragraph.appendChild(button);
    div.appendChild(paragraph);
    document.getElementById('filterDiv').appendChild(div);
};

dwv.gui.appendZoomHtml = function()
{
    var div = document.createElement("div");
    div.id = 'zoomResetDiv';
    
    var paragraph = document.createElement("p");  
    paragraph.id = 'zoomReset';
    paragraph.name = 'zoomReset';
    
    var button = document.createElement("button");
    button.id = "zoomResetButton";
    button.name = "zoomResetButton";
    button.onclick = dwv.tool.zoomReset;
    var text = document.createTextNode('Reset');
    button.appendChild(text);
    
    paragraph.appendChild(button);
    div.appendChild(paragraph);
    document.getElementById('toolbox').appendChild(div);
};

dwv.gui.clearZoomHtml = function()
{
    dwv.html.removeAllChildren("zoomResetDiv", "toolbox");
};

dwv.gui.appendToolboxHtml = function()
{
    var div = document.createElement("div");
    div.id = "toolChooser";
    
    var paragraph = document.createElement("p");  
    paragraph.appendChild(document.createTextNode("Tool: "));
    
    var selector = document.createElement("select");
    selector.id = "dtool";
    selector.name = "dtool";
    selector.onchange = dwv.gui.onChangeTool;
    paragraph.appendChild(selector);

    var options = ["windowLevel", "draw", "livewire", "zoom", "filter"];
    var option;
    for( var i = 0; i < options.length; ++i )
    {
        option = document.createElement("option");
        option.value = options[i];
        option.appendChild(document.createTextNode(options[i]));
        selector.appendChild(option);
    }

    div.appendChild(paragraph);
    document.getElementById('toolbox').appendChild(div);
};

dwv.gui.appendUndoHtml = function()
{
    var paragraph = document.createElement("p");  
    paragraph.appendChild(document.createTextNode("History:"));
    paragraph.appendChild(document.createElement("br"));
    
    var select = document.createElement("select");
    select.id = "history_list";
    select.name = "history_list";
    select.multiple = "multiple";
    paragraph.appendChild(select);

    document.getElementById('history').appendChild(paragraph);
};

dwv.gui.addCommandToUndoHtml = function(commandName)
{
    var select = document.getElementById('history_list');
    // remove undone commands
    var count = select.length - (select.selectedIndex+1);
    if( count > 0 )
    {
        for( var i = 0; i < count; ++i)
        {
            select.remove(select.length-1);
        }
    }
    // add new option
    var option = document.createElement('option');
    option.text = commandName;
    option.value = commandName;
    select.add(option);
    // increment selected index
    select.selectedIndex++;
};

dwv.gui.enableInUndoHtml = function(enable)
{
    var select = document.getElementById('history_list');
    // enable or not (order is important)
    var option;
    if( enable ) 
    {
        // increment selected index
        select.selectedIndex++;
        // enable option
        option = select.options[select.selectedIndex];
        option.disabled = false;
    }
    else 
    {
        // disable option
        option = select.options[select.selectedIndex];
        option.disabled = true;
        // decrement selected index
        select.selectedIndex--;
    }
};
