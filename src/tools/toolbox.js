/** 
 * Tool module.
 * @module tool
 */
var dwv = dwv || {};
dwv.tool = dwv.tool || {};

/**
 * Tool box.
 * @class Toolbox
 * @namespace dwv.tool
 * @constructor
 * @param {Array} toolList The list of tool objects.
 * @param {Object} gui The associated gui.
 */
dwv.tool.Toolbox = function( toolList, app )
{
    /**
     * Toolbox GUI.
     * @property gui
     * @type Object
     */
    var gui = null;
    /**
     * Tool list.
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
    
    /**
     * Setup the toolbox GUI.
     * @method setup
     */
    this.setup = function ()
    {
        if ( Object.keys(this.toolList).length !== 0 ) {
            gui = new dwv.gui.Toolbox(app);
            gui.setup(this.toolList);
            for( var key in this.toolList ) {
                this.toolList[key].setup();
            }
        }
    };

    /**
     * Display the toolbox.
     * @method display
     * @param {Boolean} bool Flag to display or not.
     */
    this.display = function (bool)
    {
        if ( Object.keys(this.toolList).length !== 0 && gui ) {
            gui.display(bool);
        }
    };
    
    /**
     * Initialise the tool box.
     * @method init
     */
    this.init = function ()
    {
        // check if we have tools
        if ( Object.keys(this.toolList).length === 0 ) {
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
        if ( gui ) {
            gui.initialise();
        }
    };
};

/**
 * Get the list of tools.
 * @method getToolList
 * @return {Array} The list of tool objects.
 */
dwv.tool.Toolbox.prototype.getToolList = function ()
{
    return this.toolList;
};

/**
 * Get the selected tool.
 * @method getSelectedTool
 * @return {Object} The selected tool.
 */
dwv.tool.Toolbox.prototype.getSelectedTool = function ()
{
    return this.selectedTool;
};

/**
 * Set the selected tool.
 * @method setSelectedTool
 * @return {String} The name of the tool to select.
 */
dwv.tool.Toolbox.prototype.setSelectedTool = function (name)
{
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
dwv.tool.Toolbox.prototype.hasTool = function (name)
{
    return this.toolList[name];
};

/**
 * Reset the tool box.
 * @method init
 */
dwv.tool.Toolbox.prototype.reset = function ()
{
    // hide last selected
    if ( this.selectedTool ) {
        this.selectedTool.display(false);
    }
    this.selectedTool = 0;
    this.defaultToolName = 0;
};
