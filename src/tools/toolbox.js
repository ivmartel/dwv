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

dwv.tool.ToolBox.prototype.setSelectedTool = function(name) {
    // check if we have it
    if( !this.hasTool(name) )
    {
        throw new Error("Unknown tool: '" + name + "'");
    }
    // disable last selected
    if( this.selectedTool )
    {
        this.selectedTool.enable(false);
    }
    // enable new one
    this.selectedTool = new this.tools[name](app);
    this.selectedTool.enable(true);
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
