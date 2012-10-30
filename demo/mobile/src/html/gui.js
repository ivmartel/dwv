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
    // select
    var selector = dwv.html.createHtmlSelect("toolSelect",dwv.tool.tools);
    selector.onchange = dwv.gui.onChangeTool;
    // label
    var label = document.createElement("label");
    label.setAttribute("for", "toolSelect");
    label.appendChild(document.createTextNode("Tool: "));
    // list element
    var li = document.createElement("li");
    li.appendChild(label);
    li.appendChild(selector);
    // append to list
    document.getElementById('toolList').appendChild(li);
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
    wlLi.appendChild(wlLabel);
    wlLi.appendChild(wlSelector);
    // add to document
    document.getElementById("toolList").appendChild(wlLi);

    // list element
    var cmLi = document.createElement("li");
    cmLi.id = "cmLi";
    cmLi.appendChild(cmLabel);
    cmLi.appendChild(cmSelector);
    // add to document
    document.getElementById("toolList").appendChild(cmLi);
};

dwv.gui.clearWindowLevelHtml = function()
{
    dwv.html.removeNode("wlLi");
    dwv.html.removeNode("cmLi");
};

dwv.gui.appendDrawHtml = function()
{
    // colour select
    var colourSelector = dwv.html.createHtmlSelect("colourSelect",dwv.tool.colors);
    colourSelector.onchange = dwv.gui.onChangeLineColour;
    // colour label
    var colourLabel = document.createElement("label");
    colourLabel.setAttribute("for", "colourSelect");
    colourLabel.appendChild(document.createTextNode("Colour: "));
    // shape select
    var shapeSelector = dwv.html.createHtmlSelect("shapeSelect",dwv.tool.shapes);
    shapeSelector.onchange = dwv.gui.onChangeShape;
    // shape label
    var shapeLabel = document.createElement("label");
    shapeLabel.setAttribute("for", "shapeSelect");
    shapeLabel.appendChild(document.createTextNode("Shape: "));

    // list element
    var colourLi = document.createElement("li");
    colourLi.id = "colourLi";
    colourLi.appendChild(colourLabel);
    colourLi.appendChild(colourSelector);
    // add to document
    document.getElementById("toolList").appendChild(colourLi);

    // list element
    var shapeLi = document.createElement("li");
    shapeLi.id = "shapeLi";
    shapeLi.appendChild(shapeLabel);
    shapeLi.appendChild(shapeSelector);
    // add to document
    document.getElementById("toolList").appendChild(shapeLi);
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
    colourLi.appendChild(colourLabel);
    colourLi.appendChild(colourSelector);
    // add to document
    document.getElementById("toolList").appendChild(colourLi);
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
    filterLi.appendChild(filterLabel);
    filterLi.appendChild(filterSelector);
    // add to document
    document.getElementById("toolList").appendChild(filterLi);
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
    var li = document.createElement("li");
    li.id = "thresholdLi";
    document.getElementById("toolList").appendChild(li);

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

dwv.gui.filter.clearThresholdHtml = function()
{
    dwv.html.removeNode("thresholdLi");
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
dwv.gui.filter.appendSharpenHtml = function()
{
    // button
    var button = document.createElement("button");
    button.id = "applyFilterButton";
    button.name = "applyFilterButton";
    button.onclick = app.getToolBox().getSelectedTool().getSelectedFilter().run;
    button.appendChild(document.createTextNode("Apply"));
    
    // list element
    var li = document.createElement("li");
    li.id = "sharpenLi";
    li.appendChild(button);
    document.getElementById("toolList").appendChild(li);
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
    var li = document.createElement("li");
    li.id = "sobelLi";
    li.appendChild(button);
    document.getElementById("toolList").appendChild(li);
};

dwv.gui.filter.clearSobelHtml = function()
{
    dwv.html.removeNode("sobelLi");
};

dwv.gui.appendZoomHtml = function()
{
    var div = document.createElement("div");
    div.id = "zoomResetDiv";
    
    var paragraph = document.createElement("p");  
    paragraph.id = "zoomReset";
    paragraph.name = "zoomReset";
    
    var button = document.createElement("button");
    button.id = "zoomResetButton";
    button.name = "zoomResetButton";
    button.onclick = dwv.tool.zoomReset;
    var text = document.createTextNode("Reset");
    button.appendChild(text);
    
    paragraph.appendChild(button);
    div.appendChild(paragraph);
    document.getElementById('toolbox').appendChild(div);
};

dwv.gui.clearZoomHtml = function()
{
    dwv.html.removeNode("zoomResetDiv");
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
