/**
 * @namespace Tool classes.
 */
dwv.tool = dwv.tool || {};

// tool list
dwv.tool.tools = {
    "windowlevel": dwv.tool.WindowLevel,
    "draw": dwv.tool.Draw,
    "roi": dwv.tool.Roi,
    "livewire": dwv.tool.Livewire,
    "zoom": dwv.tool.Zoom,
    "filter": dwv.tool.Filter
};

/**
* @class Tool box.
*/
dwv.tool.ToolBox = function(app)
{
    this.selectedTool = 0;
    this.defaultToolName = "windowlevel";
};

dwv.tool.ToolBox.prototype.enable = function(bool)
{
    if( bool ) {
        dwv.gui.appendToolboxHtml();
        this.init();
    }
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
    this.selectedTool = new dwv.tool.tools[name](app);
    this.selectedTool.enable(true);
};

dwv.tool.ToolBox.prototype.hasTool = function(name) {
    return dwv.tool.tools[name];
};

dwv.tool.ToolBox.prototype.init = function()
{
    this.setSelectedTool(this.defaultToolName);
};
