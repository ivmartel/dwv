/**
 * @namespace Tool classes.
 */
dwv.tool = dwv.tool || {};

/**
* @class Tool box.
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
    this.tools.draw = dwv.tool.Draw;
    this.tools.roi = dwv.tool.Roi;
    this.tools.livewire = dwv.tool.Livewire;
    this.tools.windowLevel = dwv.tool.WindowLevel;
    this.tools.zoom = dwv.tool.Zoom;
    this.tools.filter = dwv.tool.Filter;

    // Activate the default tool.
    if (this.tools[this.defaultToolName])
    {
        this.setSelectedTool(this.defaultToolName);
    }
};

dwv.tool.ToolBox.prototype.enable = function(value)
{
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
