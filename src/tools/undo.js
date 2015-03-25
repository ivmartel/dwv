/** 
 * Tool module.
 * @module tool
 */
var dwv = dwv || {};
dwv.tool = dwv.tool || {};

/**
 * UndoStack class.
 * @class UndoStack
 * @namespace dwv.tool
 * @constructor
 */
dwv.tool.UndoStack = function ()
{ 
    /**
     * Undo GUI.
     * @property gui
     * @type Object
     */
    var gui = new dwv.gui.Undo();
    /**
     * Array of commands.
     * @property stack
     * @private
     * @type Array
     */
    var stack = [];
    
    /**
     * Get the stack.
     * @method getStack
     * @return {Array} The list of stored commands.
     */
    this.getStack = function () { return stack; };
    
    /**
     * Current command index.
     * @property curCmdIndex
     * @private
     * @type Number
     */
    var curCmdIndex = 0;

    /**
     * Add a command to the stack.
     * @method add
     * @param {Object} cmd The command to add.
     */
    this.add = function(cmd)
    { 
        // clear commands after current index
        stack = stack.slice(0,curCmdIndex);
        // store command
        stack.push(cmd);
        //stack[curCmdIndex] = cmd;
        // increment index
        ++curCmdIndex;
        // add command to display history
        gui.addCommandToUndoHtml(cmd.getName());
    };

    /**
     * Undo the last command. 
     * @method undo
     */
    this.undo = function()
    { 
        // a bit inefficient...
        if( curCmdIndex > 0 )
        {
            // decrement command index
            --curCmdIndex; 
            // undo last command
            stack[curCmdIndex].undo();
            // disable last in display history
            gui.enableInUndoHtml(false);
        }
    }; 

    /**
     * Redo the last command.
     * @method redo
     */
    this.redo = function()
    { 
        if( curCmdIndex < stack.length )
        {
            // run last command
            stack[curCmdIndex].execute();
            // increment command index
            ++curCmdIndex;
            // enable next in display history
            gui.enableInUndoHtml(true);
        }
    };

    /**
     * Setup the tool GUI.
     * @method setup
     */
    this.setup = function ()
    {
        gui.setup();
    };

    /**
     * Initialise the tool GUI.
     * @method initialise
     */
    this.initialise = function ()
    {
        gui.initialise();
    };

}; // UndoStack class
