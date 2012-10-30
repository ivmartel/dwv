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

dwv.gui.onChangeLineColour = function(event)
{
    app.getToolBox().getSelectedTool().setLineColour(this.value);
};

dwv.gui.appendToolboxHtml = function()
{
    var node = document.getElementById('toolList');
    while (node.hasChildNodes()) {
        node.removeChild(node.firstChild);
    }
    
    // select
    var toolSelector = dwv.html.createHtmlSelect("toolSelect",dwv.tool.tools);
    toolSelector.onchange = dwv.gui.onChangeTool;
    // label
    var toolLabel = document.createElement("label");
    toolLabel.setAttribute("for", "toolSelect");
    toolLabel.appendChild(document.createTextNode("Tool: "));
    
    // list element
    var toolLi = document.createElement("li");
    toolLi.id = "toolLi";
    //toolLi.appendChild(toolLabel);
    toolLi.appendChild(toolSelector);
    toolLi.setAttribute("class","ui-block-a");
    // append to list
    document.getElementById('toolList').appendChild(toolLi);
    
    $("#toolList").trigger("create");
};

dwv.gui.appendWindowLevelHtml = function()
{
    // preset selector
    var wlSelector = dwv.html.createHtmlSelect("presetSelect",dwv.tool.presets);
    wlSelector.onchange = dwv.gui.onChangeWindowLevelPreset;
    // preset label
    var wlLabel = document.createElement("label");
    wlLabel.setAttribute("for", "presetSelect");
    wlLabel.appendChild(document.createTextNode("WL Preset: "));
    // colour map selector
    var cmSelector = dwv.html.createHtmlSelect("colourMapSelect",dwv.tool.colourMaps);
    cmSelector.onchange = dwv.gui.onChangeColourMap;
    // colour map label
    var cmLabel = document.createElement("label");
    cmLabel.setAttribute("for", "colourMapSelect");
    cmLabel.appendChild(document.createTextNode("Colour Map: "));

    // list element
    var wlLi = document.createElement("li");
    wlLi.id = "wlLi";
    //wlLi.appendChild(wlLabel);
    wlLi.appendChild(wlSelector);
    wlLi.setAttribute("class","ui-block-b");
    // add to document
    document.getElementById("toolList").appendChild(wlLi);

    // list element
    var cmLi = document.createElement("li");
    cmLi.id = "cmLi";
   // cmLi.appendChild(cmLabel);
    cmLi.appendChild(cmSelector);
    cmLi.setAttribute("class","ui-block-c");
    // add to document
    document.getElementById("toolList").appendChild(cmLi);

    $("#toolList").trigger("create");
};

dwv.gui.clearWindowLevelHtml = function()
{
    dwv.html.removeNode("wlLi");
    dwv.html.removeNode("cmLi");
};

dwv.gui.appendDrawHtml = function()
{
    // shape select
    var shapeSelector = dwv.html.createHtmlSelect("shapeSelect",dwv.tool.shapes);
    shapeSelector.onchange = dwv.gui.onChangeShape;
    // shape label
    var shapeLabel = document.createElement("label");
    shapeLabel.setAttribute("for", "shapeSelect");
    shapeLabel.appendChild(document.createTextNode("Shape: "));
    // colour select
    var colourSelector = dwv.html.createHtmlSelect("colourSelect",dwv.tool.colors);
    colourSelector.onchange = dwv.gui.onChangeLineColour;
    // colour label
    var colourLabel = document.createElement("label");
    colourLabel.setAttribute("for", "colourSelect");
    colourLabel.appendChild(document.createTextNode("Colour: "));

    // list element
    var shapeLi = document.createElement("li");
    shapeLi.id = "shapeLi";
   // shapeLi.appendChild(shapeLabel);
    shapeLi.appendChild(shapeSelector);
    shapeLi.setAttribute("class","ui-block-c");
    // add to document
    document.getElementById("toolList").appendChild(shapeLi);
    
    // list element
    var colourLi = document.createElement("li");
    colourLi.id = "colourLi";
    //colourLi.appendChild(colourLabel);
    colourLi.appendChild(colourSelector);
    colourLi.setAttribute("class","ui-block-b");
    // add to document
    document.getElementById("toolList").appendChild(colourLi);

    $("#toolList").trigger("create");
};

dwv.gui.clearDrawHtml = function()
{
    dwv.html.removeNode("colourLi");
    dwv.html.removeNode("shapeLi");
};

/**
 * @function Append the color chooser to the HTML document in the 'colourChooser' node.
 */
dwv.gui.appendLivewireHtml = function()
{
    // select
    var colourSelector = dwv.html.createHtmlSelect("colourSelect",dwv.tool.colors);
    colourSelector.onchange = dwv.gui.onChangeLineColour;
    // label
    var colourLabel = document.createElement("label");
    colourLabel.setAttribute("for", "colourSelect");
    colourLabel.appendChild(document.createTextNode("Colour: "));
    
    // list element
    var colourLi = document.createElement("li");
    colourLi.id = "colourLi";
    colourLi.setAttribute("class","ui-block-b");
    //colourLi.appendChild(colourLabel);
    colourLi.appendChild(colourSelector);
    // add to document
    document.getElementById("toolList").appendChild(colourLi);

    $("#toolList").trigger("create");
};

/**
 * @function Remove the color chooser specific node.
 */
dwv.gui.clearLivewireHtml = function()
{
    dwv.html.removeNode("colourLi");
};

dwv.gui.appendFilterHtml = function()
{
    // select
    var filterSelector = dwv.html.createHtmlSelect("filterSelect",dwv.tool.filters);
    filterSelector.onchange = dwv.gui.onChangeFilter;
    // label
    var filterLabel = document.createElement("label");
    filterLabel.setAttribute("for", "filterSelect");
    filterLabel.appendChild(document.createTextNode("Filter: "));

    // list element
    var filterLi = document.createElement("li");
    filterLi.id = "filterLi";
    filterLi.setAttribute("class","ui-block-b");
    //filterLi.appendChild(filterLabel);
    filterLi.appendChild(filterSelector);
    // add to document
    document.getElementById("toolList").appendChild(filterLi);
    
    $("#toolList").trigger("create");
};

dwv.gui.clearFilterHtml = function()
{
    dwv.html.removeNode("filterLi");
};

/**
 * @namespace GUI classes.
 */
dwv.gui.filter = dwv.gui.filter || {};

/**
* @function Threshold Filter User Interface.
*/
dwv.gui.filter.appendThresholdHtml = function()
{
    var thresholdLi = document.createElement("li");
    thresholdLi.setAttribute("class","ui-block-c");
    thresholdLi.id = "thresholdLi";
    document.getElementById("toolList").appendChild(thresholdLi);

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

dwv.gui.filter.clearThresholdHtml = function()
{
    dwv.html.removeNode("thresholdLi");
};

/**
* @function Sharpen Filter User Interface.
*/
dwv.gui.filter.appendSharpenHtml = function()
{
    // button
    var button = document.createElement("button");
    button.id = "applyFilterButton";
    button.name = "applyFilterButton";
    button.onclick = app.getToolBox().getSelectedTool().getSelectedFilter().run;
    button.appendChild(document.createTextNode("Apply"));
    
    // list element
    var sharpenLi = document.createElement("li");
    sharpenLi.id = "sharpenLi";
    sharpenLi.setAttribute("class","ui-block-c");
    sharpenLi.appendChild(button);
    document.getElementById("toolList").appendChild(sharpenLi);
    
    $("#toolList").trigger("create");
};

dwv.gui.filter.clearSharpenHtml = function()
{
    dwv.html.removeNode("sharpenLi");
};

/**
* @function Sobel Filter User Interface.
*/
dwv.gui.filter.appendSobelHtml = function()
{
    // button
    var button = document.createElement("button");
    button.id = "applyFilterButton";
    button.name = "applyFilterButton";
    button.onclick = app.getToolBox().getSelectedTool().getSelectedFilter().run;
    button.appendChild(document.createTextNode("Apply"));

    // list element
    var sobelLi = document.createElement("li");
    sobelLi.id = "sobelLi";
    sobelLi.setAttribute("class","ui-block-c");
    sobelLi.appendChild(button);
    document.getElementById("toolList").appendChild(sobelLi);
    
    $("#toolList").trigger("create");
};

dwv.gui.filter.clearSobelHtml = function()
{
    dwv.html.removeNode("sobelLi");
};

dwv.gui.appendZoomHtml = function()
{
    var button = document.createElement("button");
    button.id = "zoomResetButton";
    button.name = "zoomResetButton";
    button.onclick = dwv.tool.zoomReset;
    var text = document.createTextNode("Reset");
    button.appendChild(text);
    
    // list element
    var zoomLi = document.createElement("li");
    zoomLi.id = "zoomLi";
    zoomLi.setAttribute("class","ui-block-c");
    zoomLi.appendChild(button);
    document.getElementById("toolList").appendChild(zoomLi);
    
    $("#toolList").trigger("create");
};

dwv.gui.clearZoomHtml = function()
{
    dwv.html.removeNode("zoomLi");
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

    document.getElementById("history").appendChild(paragraph);
};

dwv.gui.addCommandToUndoHtml = function(commandName)
{
    var select = document.getElementById("history_list");
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
    var option = document.createElement("option");
    option.text = commandName;
    option.value = commandName;
    select.add(option);
    // increment selected index
    select.selectedIndex++;
};

dwv.gui.enableInUndoHtml = function(enable)
{
    var select = document.getElementById("history_list");
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
