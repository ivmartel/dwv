// tool namespace
dwv.tool = dwv.tool || {};

/**
* toolbox.js
* Tool box.
*/
dwv.tool.ToolBox = function(app)
{
    this.tools = {};
    this.selectedTool = 0;
    this.defaultToolName = 'windowLevel';
};

dwv.tool.ToolBox.prototype.getTools = function() {
    return this.tools;
};

dwv.tool.ToolBox.prototype.getSelectedTool = function() {
    return this.selectedTool;
};

dwv.tool.ToolBox.prototype.setSelectedTool = function(toolName) {
    // disable old one
    if( this.selectedTool )
    {
        this.enable(false);
    }
    // enable new one
    this.selectedTool = new this.tools[toolName](app);
    this.enable(true);
};

dwv.tool.ToolBox.prototype.hasTool = function(toolName) {
    return this.tools[toolName];
};

dwv.tool.ToolBox.prototype.init = function()
{
    // tool list
    this.tools.rectangle = dwv.tool.Rectangle;
    this.tools.roi = dwv.tool.Roi;
    this.tools.line = dwv.tool.Line;
    this.tools.circle = dwv.tool.Circle;
    this.tools.windowLevel = dwv.tool.WindowLevel;
    this.tools.zoom = dwv.tool.Zoom;

    // Get the tool select input.
    var tool_select = document.getElementById('dtool');
    if (!tool_select)
    {
        throw new Error('Failed to get the dtool element!');
    }
    tool_select.addEventListener('change', this.eventToolChange, false);
    
    // Activate the default tool.
    if (this.tools[this.defaultToolName])
    {
        this.setSelectedTool(this.defaultToolName);
        tool_select.value = this.defaultToolName;
    }
};

dwv.tool.ToolBox.prototype.enable = function(value)
{
    // enable html select 
    document.getElementById('dtool').disabled = !value;
    // enable selected tool
    this.selectedTool.enable(value);
};

// The event handler for any changes made to the tool selector.
dwv.tool.ToolBox.prototype.eventToolChange = function(event)
{
    toolName = this.value;
    if( app.getToolBox().hasTool(toolName) )
    {
        app.getToolBox().setSelectedTool(toolName);
    }
    else
    {
        throw new Error("Unknown tool: '" + toolName + "'");
    }
};

dwv.tool.ToolBox.prototype.appendHtml = function()
{
    var div = document.createElement("div");
    div.id = "toolChooser";
    
    var paragraph = document.createElement("p");  
    paragraph.appendChild(document.createTextNode("Tool: "));
    
    var selector = document.createElement("select");
    selector.id = "dtool";
    selector.name = "dtool";
    selector.disabled = 1;
    paragraph.appendChild(selector);

    var options = ["windowLevel", "rectangle", "circle", "roi", "line", "zoom"];
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
