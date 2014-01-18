/** 
 * GUI module.
 * @module gui
 */
var dwv = dwv || {};
/**
 * Namespace for GUI functions.
 * @class gui
 * @namespace dwv
 * @static
 */
dwv.gui = dwv.gui || {};

/**
 * Handle window/level change.
 * @method onChangeWindowLevelPreset
 * @namespace dwv.gui
 * @static
 * @param {Object} event The change event.
 */
dwv.gui.onChangeWindowLevelPreset = function(event)
{
    app.getToolBox().getSelectedTool().setPreset(this.value);
};

/**
 * Handle colour map change.
 * @method onChangeColourMap
 * @static
 * @param {Object} event The change event.
 */
dwv.gui.onChangeColourMap = function(event)
{
    app.getToolBox().getSelectedTool().setColourMap(this.value);
};

/**
 * Handle loader change.
 * @method onChangeLoader
 * @static
 * @param {Object} event The change event.
 */
dwv.gui.onChangeLoader = function(event)
{
    if( this.value === "file") {
        dwv.gui.clearUrlLoadHtml();
        dwv.gui.appendFileLoadHtml();
    }
    else if( this.value === "url") {
        dwv.gui.clearFileLoadHtml();
        dwv.gui.appendUrlLoadHtml();
    }
};

/**
 * Handle files change.
 * @method onChangeFiles
 * @static
 * @param {Object} event The change event.
 */
dwv.gui.onChangeFiles = function(event)
{
    app.onChangeFiles(event);
};

/**
 * Handle URL change.
 * @method onChangeURL
 * @static
 * @param {Object} event The change event.
 */
dwv.gui.onChangeURL = function(event)
{
    app.onChangeURL(event);
};

/**
 * Handle tool change.
 * @method onChangeTool
 * @static
 * @param {Object} event The change event.
 */
dwv.gui.onChangeTool = function(event)
{
    app.getToolBox().setSelectedTool(this.value);
};

/**
 * Handle filter change.
 * @method onChangeFilter
 * @static
 * @param {Object} event The change event.
 */
dwv.gui.onChangeFilter = function(event)
{
    app.getToolBox().getSelectedTool().setSelectedFilter(this.value);
};

dwv.gui.onRunFilter = function(event)
{
    app.getToolBox().getSelectedTool().getSelectedFilter().run();
};

/**
 * Handle shape change.
 * @method onChangeShape
 * @static
 * @param {Object} event The change event.
 */
dwv.gui.onChangeShape = function(event)
{
    app.getToolBox().getSelectedTool().setShapeName(this.value);
};

/**
 * Handle line color change.
 * @method onChangeLineColour
 * @static
 * @param {Object} event The change event.
 */
dwv.gui.onChangeLineColour = function(event)
{
    app.getToolBox().getSelectedTool().setLineColour(this.value);
};

/**
 * Append the slider HTML.
 * @method getSliderHtml
 * @static
 */
dwv.gui.getSliderHtml = function()
{
    var min = app.getImage().getDataRange().min;
    var max = app.getImage().getDataRange().max;

    if( app.isMobile() )
    {
        // jquery-mobile range slider
        var inputMin = document.createElement("input");
        inputMin.setAttribute("id", "threshold-min");
        inputMin.setAttribute("max", max);
        inputMin.setAttribute("min", min);
        inputMin.setAttribute("value", min);
        inputMin.setAttribute("type", "range");

        var inputMax = document.createElement("input");
        inputMax.setAttribute("id", "threshold-max");
        inputMax.setAttribute("max", max);
        inputMax.setAttribute("min", min);
        inputMax.setAttribute("value", max);
        inputMax.setAttribute("type", "range");
        
        var div = document.createElement("div");
        div.setAttribute("id", "threshold-div");
        div.setAttribute("data-role", "rangeslider");
        div.appendChild(inputMin);
        div.appendChild(inputMax);
        div.setAttribute("data-mini", "true");
        document.getElementById("thresholdLi").appendChild(div);

        $("#threshold-div").bind("change",
            function( event ) {
                app.getToolBox().getSelectedTool().getSelectedFilter().run(
                    { "min":$("#threshold-min").val(),
                      "max":$("#threshold-max").val() } );
            }
        );
    }
    else
    {
        // jquery-ui slider
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
    }
};

/**
 * Update the progress bar.
 * @method updateProgress
 * @static
 * @param {Object} event A ProgressEvent.
 */
dwv.gui.updateProgress = function(event)
{
    // event is an ProgressEvent.
    if( event.lengthComputable )
    {
        var percent = Math.round((event.loaded / event.total) * 100);
        if( app.isMobile() )
        {
            // jquery-mobile loading
            if( percent < 100 ) {
                $.mobile.loading("show", {text: percent+"%", textVisible: true, theme: "b"} );
            }
            else if( percent === 100 ) {
                $.mobile.loading("hide");
            }
        }
        else
        {
            // jquery-ui progress bar
            if( percent <= 100 ) {
                $("#progressbar").progressbar({ value: percent });
            }
        }
    }
};

/**
 * Append the loadbox HTML to the page.
 * @method appendLoadboxHtml
 * @static
 */
dwv.gui.appendLoadboxHtml = function()
{
    // select
    var loaderSelector = dwv.html.createHtmlSelect("loaderSelect",dwv.io.loaders);
    loaderSelector.onchange = dwv.gui.onChangeLoader;
    
    // node
    var node = document.getElementById("loaderlist");
    // clear it
    while(node.hasChildNodes()) node.removeChild(node.firstChild);
    // append
    node.appendChild(loaderSelector);
    // trigger create event (mobile)
    $("#loaderlist").trigger("create");
    
    // default load
    dwv.gui.appendFileLoadHtml();
};

/**
 * Append the file load HTML to the page.
 * @method appendFileLoadHtml
 * @static
 */
dwv.gui.appendFileLoadHtml = function()
{
    // input
    var fileLoadInput = document.createElement("input");
    fileLoadInput.onchange = dwv.gui.onChangeFiles;
    fileLoadInput.type = "file";
    fileLoadInput.multiple = true;
    fileLoadInput.id = "imagefiles";
    fileLoadInput.setAttribute("data-clear-btn","true");
    fileLoadInput.setAttribute("data-mini","true");

    // associated div
    var fileLoadDiv = document.createElement("div");
    fileLoadDiv.id = "imagefilesdiv";
    fileLoadDiv.appendChild(fileLoadInput);
    
    // node
    var node = document.getElementById("loaderlist");
    // append
    node.appendChild(fileLoadDiv);
    // trigger create event (mobile)
    $("#loaderlist").trigger("create");
};

/**
 * Clear the file load HTML.
 * @method clearUrlLoadHtml
 * @static
 */
dwv.gui.clearFileLoadHtml = function()
{
    dwv.html.removeNode("imagefilesdiv");
};

/**
 * Append the url load HTML to the page.
 * @method appendUrlLoadHtml
 * @static
 */
dwv.gui.appendUrlLoadHtml = function()
{
    // input
    var urlLoadInput = document.createElement("input");
    urlLoadInput.onchange = dwv.gui.onChangeURL;
    urlLoadInput.type = "url";
    urlLoadInput.id = "imageurl";
    urlLoadInput.setAttribute("data-clear-btn","true");
    urlLoadInput.setAttribute("data-mini","true");

    // associated div
    var urlLoadDiv = document.createElement("div");
    urlLoadDiv.id = "imageurldiv";
    urlLoadDiv.appendChild(urlLoadInput);

    // node
    var node = document.getElementById("loaderlist");
    // append
    node.appendChild(urlLoadDiv);
    // trigger create event (mobile)
    $("#loaderlist").trigger("create");
};

/**
 * Clear the url load HTML.
 * @method clearUrlLoadHtml
 * @static
 */
dwv.gui.clearUrlLoadHtml = function()
{
    dwv.html.removeNode("imageurldiv");
};

/**
 * Append the toolbox HTML to the page.
 * @method appendToolboxHtml
 * @static
 */
dwv.gui.appendToolboxHtml = function()
{
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
    toolLi.style.display = "none";
    //toolLi.appendChild(toolLabel);
    toolLi.appendChild(toolSelector);
    toolLi.setAttribute("class","ui-block-a");

    // node
    var node = document.getElementById("toolList");
    // clear it
    while(node.hasChildNodes()) node.removeChild(node.firstChild);
    // append
    node.appendChild(toolLi);
    // trigger create event (mobile)
    $("#toolList").trigger("create");
};

dwv.gui.displayToolboxHtml = function(bool)
{
    var toolLi = document.getElementById("toolLi");
    toolLi.style.display = bool ? "" : "none";
};

dwv.gui.initToolboxHtml = function()
{
    var toolSelector = document.getElementById("toolSelect");
    toolSelector.options[0].defaultSelected = true;
};

/**
 * Append the window/level HTML to the page.
 * @method appendWindowLevelHtml
 * @static
 */
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

    // preset list element
    var wlLi = document.createElement("li");
    wlLi.id = "wlLi";
    wlLi.style.display = "none";
    //wlLi.appendChild(wlLabel);
    wlLi.appendChild(wlSelector);
    wlLi.setAttribute("class","ui-block-b");
    // color map list element
    var cmLi = document.createElement("li");
    cmLi.id = "cmLi";
    cmLi.style.display = "none";
    // cmLi.appendChild(cmLabel);
    cmLi.appendChild(cmSelector);
    cmLi.setAttribute("class","ui-block-c");

    // node
    var node = document.getElementById("toolList");
    // apend preset
    node.appendChild(wlLi);
    // apend color map if monochrome image
    node.appendChild(cmLi);
    // trigger create event (mobile)
    $("#toolList").trigger("create");
};

/**
 * Clear the window/level HTML.
 * @method clearWindowLevelHtml
 * @static
 */
dwv.gui.displayWindowLevelHtml = function(bool)
{
    // presets
    var wlLi = document.getElementById("wlLi");
    wlLi.style.display = bool ? "" : "none";
    // color map
    var cmLi = document.getElementById("cmLi");
    cmLi.style.display = bool ? "" : "none";
};

dwv.gui.initWindowLevelHtml = function()
{
    // update presets
    dwv.html.removeNode("presetSelect");
    // mobile
    var nono = document.getElementById("presetSelect");
    if( nono ) {
        console.log("removing nono");
        dwv.html.removeNode(nono.parentNode);
    }
    var wlSelector = dwv.html.createHtmlSelect("presetSelect",dwv.tool.presets);
    wlSelector.onchange = dwv.gui.onChangeWindowLevelPreset;
    var node = document.getElementById("wlLi");
    node.appendChild(wlSelector);
    
    // colour map selector
    var select = document.getElementById("colourMapSelect");
    select.options[0].defaultSelected = true;
    // special monochrome1 case
    if( app.getImage().getPhotometricInterpretation() === "MONOCHROME1" )
    {
        select.options[1].defaultSelected = true;
    }
    
    // trigger create event (mobile)
    $("#toolList").trigger("create");
};

/**
 * Append the draw HTML to the page.
 * @method appendDrawHtml
 * @static
 */
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
    shapeLi.style.display = "none";
    // shapeLi.appendChild(shapeLabel);
    shapeLi.appendChild(shapeSelector);
    shapeLi.setAttribute("class","ui-block-c");
    // list element
    var colourLi = document.createElement("li");
    colourLi.id = "colourLi";
    colourLi.style.display = "none";
    //colourLi.appendChild(colourLabel);
    colourLi.appendChild(colourSelector);
    colourLi.setAttribute("class","ui-block-b");
    
    // node
    var node = document.getElementById("toolList");
    // apend shape
    node.appendChild(shapeLi);
    // append color
    node.appendChild(colourLi);
    // trigger create event (mobile)
    $("#toolList").trigger("create");
};

/**
 * Clear the draw HTML.
 * @method clearDrawHtml
 * @static
 */
dwv.gui.displayDrawHtml = function(bool)
{
    // color
    var colourLi = document.getElementById("colourLi");
    colourLi.style.display = bool ? "" : "none";
    // shape
    var shapeLi = document.getElementById("shapeLi");
    shapeLi.style.display = bool ? "" : "none";
};

dwv.gui.initDrawHtml = function()
{
    // shape selector
    var shapeSelector = document.getElementById("shapeSelect");
    shapeSelector.options[0].defaultSelected = true;
    // color selector
    var colourSelector = document.getElementById("colourSelect");
    colourSelector.options[0].defaultSelected = true;
};

/**
 * Append the color chooser HTML to the page.
 * @method appendLivewireHtml
 * @static
 */
dwv.gui.appendLivewireHtml = function()
{
    // select
    var colourSelector = dwv.html.createHtmlSelect("lwColourSelect",dwv.tool.colors);
    colourSelector.onchange = dwv.gui.onChangeLineColour;
    // label
    var colourLabel = document.createElement("label");
    colourLabel.setAttribute("for", "lwColourSelect");
    colourLabel.appendChild(document.createTextNode("Colour: "));
    
    // list element
    var colourLi = document.createElement("li");
    colourLi.id = "lwColourLi";
    colourLi.style.display = "none";
    colourLi.setAttribute("class","ui-block-b");
    //colourLi.appendChild(colourLabel);
    colourLi.appendChild(colourSelector);
    
    // append to tool list
    document.getElementById("toolList").appendChild(colourLi);
    // trigger create event (mobile)
    $("#toolList").trigger("create");
};

/**
 * Clear the color chooser HTML.
 * @method clearDrawHtml
 * @static
 */
dwv.gui.displayLivewireHtml = function(bool)
{
    var colourLi = document.getElementById("lwColourLi");
    colourLi.style.display = bool ? "" : "none";
};

dwv.gui.initLivewireHtml = function()
{
    var colourSelector = document.getElementById("lwColourSelect");
    colourSelector.options[0].defaultSelected = true;
};

/**
 * Append the filter HTML to the page.
 * @method appendLivewireHtml
 * @static
 */
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
    filterLi.style.display = "none";
    filterLi.setAttribute("class","ui-block-b");
    //filterLi.appendChild(filterLabel);
    filterLi.appendChild(filterSelector);
    
    // append to tool list
    document.getElementById("toolList").appendChild(filterLi);
    // trigger create event (mobile)
    $("#toolList").trigger("create");
};

/**
 * Clear the filter HTML.
 * @method clearDrawHtml
 * @static
 */
dwv.gui.displayFilterHtml = function(bool)
{
    var filterLi = document.getElementById("filterLi");
    filterLi.style.display = bool ? "" : "none";
};

dwv.gui.initFilterHtml = function()
{
    var filterSelector = document.getElementById("filterSelect");
    filterSelector.options[0].defaultSelected = true;
};

// create namespace if not there
dwv.gui.filter = dwv.gui.filter || {};

/**
 * Append the threshold filter HTML to the page.
 * @method appendThresholdHtml
 * @static
 */
dwv.gui.filter.appendThresholdHtml = function()
{
    // list element
    var thresholdLi = document.createElement("li");
    thresholdLi.id = "thresholdLi";
    thresholdLi.setAttribute("class","ui-block-c");
    thresholdLi.style.display = "none";
    
    // append to tool list
    document.getElementById("toolList").appendChild(thresholdLi);
    // gui specific slider...
    //dwv.gui.getSliderHtml();
    // trigger create event (mobile)
    $("#toolList").trigger("create");
};

/**
 * Clear the treshold filter HTML.
 * @method clearDrawHtml
 * @static
 */
dwv.gui.filter.displayThresholdHtml = function(bool)
{
    var thresholdLi = document.getElementById("thresholdLi");
    thresholdLi.style.display = bool ? "" : "none";
};

/**
 * Append the sharpen filter HTML to the page.
 * @method appendSharpenHtml
 * @static
 */
dwv.gui.filter.appendSharpenHtml = function()
{
    // button
    var buttonRun = document.createElement("button");
    buttonRun.id = "runFilterButton";
    buttonRun.onclick = dwv.gui.onRunFilter;
    buttonRun.appendChild(document.createTextNode("Apply"));

    // list element
    var sharpenLi = document.createElement("li");
    sharpenLi.id = "sharpenLi";
    sharpenLi.style.display = "none";
    sharpenLi.setAttribute("class","ui-block-c");
    sharpenLi.appendChild(buttonRun);
    
    // append to tool list
    document.getElementById("toolList").appendChild(sharpenLi);
    // trigger create event (mobile)
    $("#toolList").trigger("create");
};

/**
 * Clear the sharpen filter HTML.
 * @method clearSharpenHtml
 * @static
 */
dwv.gui.filter.displaySharpenHtml = function(bool)
{
    var sharpenLi = document.getElementById("sharpenLi");
    sharpenLi.style.display = bool ? "" : "none";
};

/**
 * Append the sobel filter HTML to the page.
 * @method appendSharpenHtml
 * @static
 */
dwv.gui.filter.appendSobelHtml = function()
{
    // button
    var buttonRun = document.createElement("button");
    buttonRun.id = "runFilterButton";
    buttonRun.onclick = dwv.gui.onRunFilter;
    buttonRun.appendChild(document.createTextNode("Apply"));

    // list element
    var sobelLi = document.createElement("li");
    sobelLi.id = "sobelLi";
    sobelLi.style.display = "none";
    sobelLi.setAttribute("class","ui-block-c");
    sobelLi.appendChild(buttonRun);
    
    // append to tool list
    document.getElementById("toolList").appendChild(sobelLi);
    // trigger create event (mobile)
    $("#toolList").trigger("create");
};

/**
 * Clear the sobel filter HTML.
 * @method clearSharpenHtml
 * @static
 */
dwv.gui.filter.displaySobelHtml = function(bool)
{
    var sobelLi = document.getElementById("sobelLi");
    sobelLi.style.display = bool ? "" : "none";
};

/**
 * Append the zoom HTML to the page.
 * @method appendZoomHtml
 * @static
 */
dwv.gui.appendZoomHtml = function()
{
    // button
    var button = document.createElement("button");
    button.id = "zoomResetButton";
    button.name = "zoomResetButton";
    button.onclick = dwv.tool.zoomReset;
    var text = document.createTextNode("Reset");
    button.appendChild(text);
    
    // list element
    var zoomLi = document.createElement("li");
    zoomLi.id = "zoomLi";
    zoomLi.style.display = "none";
    zoomLi.setAttribute("class","ui-block-c");
    zoomLi.appendChild(button);
    
    // append to tool list
    document.getElementById("toolList").appendChild(zoomLi);
    // trigger create event (mobile)
    $("#toolList").trigger("create");
};

/**
 * Clear the zoom filter HTML.
 * @method clearZoomHtml
 * @static
 */
dwv.gui.displayZoomHtml = function(bool)
{
    var zoomLi = document.getElementById("zoomLi");
    zoomLi.style.display = bool ? "" : "none";
};

/**
 * Append the undo HTML to the page.
 * @method appendUndoHtml
 * @static
 */
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

    // node
    var node = document.getElementById("history");
    // clear it
    while(node.hasChildNodes()) node.removeChild(node.firstChild);
    // append
    node.appendChild(paragraph);
};

/**
 * Add a command to the undo HTML.
 * @method addCommandToUndoHtml
 * @static
 * @param {String} commandName The name of the command to add.
 */
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

/**
 * Enable the last command of the undo HTML.
 * @method enableInUndoHtml
 * @static
 * @param {Boolean} enable Flag to enable or disable the command.
 */
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

/**
 * Build the help HTML.
 * @method appendHelpHtml
 * @param {Boolean} mobile Flag for mobile or not environement.
 */
dwv.gui.appendHelpHtml = function(mobile)
{
    var actionType = "mouse";
    if( mobile ) actionType = "touch";
    
    var toolHelpDiv = document.createElement("div");
    
    for ( var t in dwv.tool.tools )
    {
        var tool = dwv.tool.tools[t];
        // title
        var title = document.createElement("h3");
        title.appendChild(document.createTextNode(tool.getHelp().title));
        // doc div
        var docDiv = document.createElement("div");
        // brief
        var brief = document.createElement("p");
        brief.appendChild(document.createTextNode(tool.getHelp().brief));
        docDiv.appendChild(brief);
        // details
        if( tool.getHelp()[actionType] ) {
            var keys = Object.keys(tool.getHelp()[actionType]);
            for( var i=0; i<keys.length; ++i )
            {
                var action = tool.getHelp()[actionType][keys[i]];
                
                var img = document.createElement("img");
                img.src = "resources/"+keys[i]+".png";
                img.style.float = "left";
                img.style.margin = "0px 15px 15px 0px";
                
                var br = document.createElement("br");
                br.style.clear = "both";
                
                var para = document.createElement("p");
                para.appendChild(img);
                para.appendChild(document.createTextNode(action));
                para.appendChild(br);
                docDiv.appendChild(para);
            }
        }
        
        // different div structure for mobile or static
        if( mobile )
        {
            var toolDiv = document.createElement("div");
            toolDiv.setAttribute("data-role", "collapsible");
            toolDiv.appendChild(title);
            toolDiv.appendChild(docDiv);
            toolHelpDiv.appendChild(toolDiv);
        }
        else
        {
            toolHelpDiv.id = "accordion";
            toolHelpDiv.appendChild(title);
            toolHelpDiv.appendChild(docDiv);
        }
    }
    
    var helpNode = document.getElementById("help");

    var headPara = document.createElement("p");
    headPara.appendChild(document.createTextNode("DWV can load DICOM data " +
        "either from a local file or from an URL. All DICOM tags are available " +
        "in a searchable table, press the 'tags' or grid button. " + 
        "You can choose to display the image information overlay by pressing the " + 
        "'info' or i button. "));
    helpNode.appendChild(headPara);
    
    var toolPara = document.createElement("p");
    toolPara.appendChild(document.createTextNode("Each tool defines the possible " + 
        "user interactions. The default tool is the window/level one. " + 
        "Here are the available tools:"));
    helpNode.appendChild(toolPara);
    helpNode.appendChild(toolHelpDiv);
};
