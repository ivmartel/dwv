/**
 * @namespace Tool classes.
 */
dwv.tool = dwv.tool || {};

/**
 * @class UndoStack class.
 * @param app
 */
dwv.tool.UndoStack = function(app)
{ 
	// Array of commands.
	var stack = [];
	// Current command index.
	var curCmdIndex = 0;

	/**
	 * Add a command to the stack.
	 * @param cmd The command to add.
	 */
	this.add = function(cmd)
	{ 
		// clear commands after current index
		stack = stack.slice(0,curCmdIndex);
		// store command
		stack[curCmdIndex] = cmd;
        // increment index
        ++curCmdIndex;
		// add command to display history
		dwv.gui.addCommandToUndoHtml(cmd.getName());
	};

	/**
	 * Call the previous command. 
	 */
	this.undo = function()
	{ 
		// a bit inefficient...
		if( curCmdIndex > 0 )
		{
			// decrement index
		    --curCmdIndex; 
		    // clear the draw layer
			app.getDrawLayer().clearContextRect();
			// clear the temporary layer 
			app.getTempLayer().clearContextRect();
			// redo from first command
			for( var i = 0; i < curCmdIndex; ++i)
			{
				stack[i].execute(); 
			}
			// merge the temporary layer
			app.getDrawLayer().merge(app.getTempLayer());
			// disable last in display history
			dwv.gui.enableInUndoHtml(false);
		}
	}; 

	/**
	 * Call the next command.
	 */
	this.redo = function()
	{ 
		if( curCmdIndex < stack.length )
		{
		    // run command
		    var cmd = stack[curCmdIndex];
			cmd.execute();
            // increment index
            ++curCmdIndex;
			// merge the temporary layer
			app.getDrawLayer().merge(app.getTempLayer());
			// enable next in display history
			dwv.gui.enableInUndoHtml(true);
		}
	};

}; // UndoStack class
