/** 
 * Tool module.
 * @module tool
 */
var dwv = dwv || {};
/**
 * Namespace for tool functions.
 * @class tool
 * @namespace dwv
 * @static
 */
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
     * Selected tool.
     * @property selectedTool
     * @type Object
     */
    var selectedTool = null;
    /**
     * Default tool name.
     * @property defaultToolName
     * @type String
     */
    var defaultToolName = null;

    /**
     * Get the list of tools.
     * @method getToolList
     * @return {Array} The list of tool objects.
     */
    this.getToolList = function ()
    {
        return toolList;
    };

    /**
     * Get the selected tool.
     * @method getSelectedTool
     * @return {Object} The selected tool.
     */
    this.getSelectedTool = function ()
    {
        return selectedTool;
    };

    /**
     * Setup the toolbox GUI.
     * @method setup
     */
    this.setup = function ()
    {
        if ( Object.keys(toolList).length !== 0 ) {
            gui = new dwv.gui.Toolbox(app);
            gui.setup(toolList);
            for( var key in toolList ) {
                toolList[key].setup();
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
        if ( Object.keys(toolList).length !== 0 && gui ) {
            gui.display(bool);
        }
    };

    /**
     * Initialise the tool box.
     * @method init
     */
    this.init = function ()
    {
        var keys = Object.keys(toolList);
        // check if we have tools
        if ( keys.length === 0 ) {
            return;
        }
        // init all tools
        defaultToolName = "";
        var displays = [];
        var display = null;
        for( var key in toolList ) {
            display = toolList[key].init();
            if ( display && defaultToolName === "" ) {
                defaultToolName = key;
            }
            displays.push(display);
        }
        this.setSelectedTool(defaultToolName);
        // init html
        if ( gui ) {
            gui.initialise(displays);
        }
    };

    /**
     * Set the selected tool.
     * @method setSelectedTool
     * @return {String} The name of the tool to select.
     */
    this.setSelectedTool = function (name)
    {
        // check if we have it
        if( !this.hasTool(name) )
        {
            throw new Error("Unknown tool: '" + name + "'");
        }
        // hide last selected
        if( selectedTool )
        {
            selectedTool.display(false);
        }
        // enable new one
        selectedTool = toolList[name];
        // display it
        selectedTool.display(true);
    };

    /**
     * Reset the tool box.
     * @method reset
     */
    this.reset = function ()
    {
        // hide last selected
        if ( selectedTool ) {
            selectedTool.display(false);
        }
        selectedTool = null;
        defaultToolName = null;
    };
};

/**
 * Check if a tool is in the tool list.
 * @method hasTool
 * @param {String} name The name to check.
 * @return {String} The tool list element for the given name.
 */
dwv.tool.Toolbox.prototype.hasTool = function (name)
{
    return this.getToolList()[name];
};
