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

dwv.tool.ToolBox.prototype.getSelectedTool = function() {
    return this.selectedTool;
};

dwv.tool.ToolBox.prototype.setSelectedTool = function(toolName) {
    // disable old one
    if( this.selectedTool )
    {
        this.enableTool(false);
    }
    // enable new one
    this.selectedTool = new this.tools[toolName](app);
    this.enableTool(true);
};

dwv.tool.ToolBox.prototype.hasTool = function(toolName) {
    return this.tools[toolName];
};

dwv.tool.ToolBox.prototype.init = function()
{
    // tool list
    this.tools = {
        windowLevel: dwv.tool.WindowLevel,
        draw: dwv.tool.Draw,
        roi: dwv.tool.Roi,
        livewire: dwv.tool.Livewire,
        zoom: dwv.tool.Zoom,
        filter: dwv.tool.Filter
    };

    // Activate the default tool.
    if (this.tools[this.defaultToolName])
    {
        this.setSelectedTool(this.defaultToolName);
    }
};

dwv.tool.ToolBox.prototype.enableTool = function(value)
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
