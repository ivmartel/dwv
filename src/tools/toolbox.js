/** 
 * Tool module.
 * @module tool
 */
var dwv = dwv || {};
dwv.tool = dwv.tool || {};

/**
 * Tool box.
 * @class ToolBox
 * @namespace dwv.tool
 * @constructor
 * @param {Array} toolList The list of tool objects.
 */
dwv.tool.ToolBox = function( toolList )
{
    /**
     * Tool list
     * @property toolList
     * @type Object
     */
    this.toolList = toolList;
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
    if ( this.toolList.length !== 0 ) {
        dwv.gui.displayToolboxHtml(bool);
    }
};

/**
 * Get the list of tools.
 * @method getToolList
 * @return {Array} The list of tool objects.
 */
dwv.tool.ToolBox.prototype.getToolList = function() {
    return this.toolList;
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
    this.selectedTool = this.toolList[name];
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
    return this.toolList[name];
};

/**
 * Initialise the tool box.
 * @method init
 */
dwv.tool.ToolBox.prototype.init = function()
{
    // check if we have tools
    if ( this.toolList.length === 0 ) {
        return;
    }
    // set the default to the first in the list
    for( var key in this.toolList ){
        this.defaultToolName = key;
        break;
    }
    this.setSelectedTool(this.defaultToolName);
    // init all tools
    for( key in this.toolList ) {
        this.toolList[key].init();
    }    
    // init html
    dwv.gui.initToolboxHtml();
};

/**
 * Reset the tool box.
 * @method init
 */
dwv.tool.ToolBox.prototype.reset = function()
{
    // hide last selected
    if( this.selectedTool )
    {
        this.selectedTool.display(false);
    }
    this.selectedTool = 0;
    this.defaultToolName = 0;
};