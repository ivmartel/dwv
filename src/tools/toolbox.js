//! @namespace Main DWV namespace.
var dwv = dwv || {};
//! @namespace Tool classes.
dwv.tool = dwv.tool || {};

// tool list: to be completed after each tool definition 
dwv.tool.tools = dwv.tool.tools || {};
    
/**
* @class Tool box.
*/
dwv.tool.ToolBox = function(app)
{
    this.selectedTool = 0;
    this.defaultToolName = 0;
};

dwv.tool.ToolBox.prototype.enable = function(bool)
{
    if( bool ) {
        this.sortTools();
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

dwv.tool.ToolBox.prototype.sortTools = function()
{
    // fiddle with order: make window level first if present
    var tools = dwv.tool.tools;
    dwv.tool.tools = {};
    if( tools.windowlevel ) dwv.tool.tools.windowlevel = tools.windowlevel;
    for( var key in tools ) {
        if( key === "windowlevel" ) continue;
        dwv.tool.tools[key] = tools[key];
    }
};

dwv.tool.ToolBox.prototype.init = function()
{
    // set the default to the first in the list
    for( var key in dwv.tool.tools ){
        this.defaultToolName = key;
        break;
    }
    this.setSelectedTool(this.defaultToolName);
};
