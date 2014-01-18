/** 
 * Tool module.
 * @module tool
 */
var dwv = dwv || {};
dwv.tool = dwv.tool || {};

/**
 * Tool box.
 * Relies on the static variable dwv.tool.tools. The available tools 
 * of the gui will be those of this list.
 * @class ToolBox
 * @namespace dwv.tool
 * @constructor
 * @param {Object} app The associated application.
 */
dwv.tool.ToolBox = function(app)
{
    /**
     * Selected tool.
     * @property selectedTool
     * @type Object
     */
    this.selectedTool = 0;
    /**
     * Default tool name.
     * @property defaultToolName
     * @type String
     */
    this.defaultToolName = 0;
};

/**
 * Enable the toolbox.
 * @method enable
 * @param {Boolean} bool Flag to enable or not.
 */
dwv.tool.ToolBox.prototype.display = function(bool)
{
    dwv.gui.displayToolboxHtml(bool);
};

/**
 * Get the selected tool.
 * @method getSelectedTool
 * @return {Object} The selected tool.
 */
dwv.tool.ToolBox.prototype.getSelectedTool = function() {
    return this.selectedTool;
};

/**
 * Set the selected tool.
 * @method setSelectedTool
 * @return {String} The name of the tool to select.
 */
dwv.tool.ToolBox.prototype.setSelectedTool = function(name) {
    // check if we have it
    if( !this.hasTool(name) )
    {
        throw new Error("Unknown tool: '" + name + "'");
    }
    // hide last selected
    if( this.selectedTool )
    {
        this.selectedTool.display(false);
    }
    // enable new one
    this.selectedTool = dwv.tool.tools[name];
    // display it
    this.selectedTool.display(true);
};

/**
 * Check if a tool is in the tool list.
 * @method hasTool
 * @param {String} name The name to check.
 * @return {String} The tool list element for the given name.
 */
dwv.tool.ToolBox.prototype.hasTool = function(name) {
    return dwv.tool.tools[name];
};

/**
 * Sort the tool list.
 * @method sortTools
 */
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

/**
 * Initialise the tool box.
 * @method init
 */
dwv.tool.ToolBox.prototype.init = function()
{
    // sort tools
    this.sortTools();
    // set the default to the first in the list
    for( var key in dwv.tool.tools ){
        this.defaultToolName = key;
        break;
    }
    this.setSelectedTool(this.defaultToolName);
    // init all tools
    for( key in dwv.tool.tools ) {
        dwv.tool.tools[key].init();
    }    
    // init html
    dwv.gui.initToolboxHtml();
};
