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
	var curCmd = 0;

	/**
	 * Add a command to the stack.
	 * @param cmd The command to add.
	 */
	this.add = function(cmd)
	{ 
		// clear commands after curCmd
		stack = stack.slice(0,curCmd);
		// store command
		stack[curCmd++] = cmd;
		// add command to display history
		dwv.gui.addCommandToUndoHtml(cmd.getName());
	};

	/**
	 * Call the previous command. 
	 */
	this.undo = function()
	{ 
		// not worth when drawing...
		// stack[--curCmd].execute();
		
		// a bit inefficient...
		if( curCmd > 0 )
		{
			// clear the draw layer
			app.getDrawLayer().clearContextRect();
			// clear the temporary layer 
			app.getTempLayer().clearContextRect();
			// redraw shapes
			curCmd--; 
			for( var i = 0; i < curCmd; ++i)
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
		if( curCmd < stack.length )
		{
			var cmd = stack[curCmd++];
			cmd.execute();
			// merge the temporary layer
			app.getDrawLayer().merge(app.getTempLayer());
			// enable next in display history
			dwv.gui.enableInUndoHtml(true);
		}
	};

}; // UndoStack class
