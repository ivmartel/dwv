/**
 * undo.js
 * Simple undo/redo stack. 
 */

dwv.addCommandToDisplayHistory = function(command)
{
    var select = document.getElementById('history_list');
    // remove undone commands
    var count = select.length - (select.selectedIndex+1);
    if( count > 0 )
    {
        for( var i = 0; i < count; ++i)
        {
            select.remove(select.length-1);
        }
    }
    // add new option
    var option = document.createElement('option');
    option.text = command.getName();
    option.value = command.getName();
    select.add(option);
    // increment selected index
    select.selectedIndex++;
};

dwv.enableInDisplayHistory = function(enable)
{
    var select = document.getElementById('history_list');
    // enable or not (order is important)
    var option;
    if( enable ) 
    {
        // increment selected index
        select.selectedIndex++;
        // enable option
        option = select.options[select.selectedIndex];
        option.disabled = false;
    }
    else 
    {
        // disable option
        option = select.options[select.selectedIndex];
        option.disabled = true;
        // decrement selected index
        select.selectedIndex--;
    }
};

/**
 * UndoStack class.
 * @param app
 */
dwv.UndoStack = function(app)
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
		dwv.addCommandToDisplayHistory(cmd);
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
			dwv.enableInDisplayHistory(false);
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
			dwv.enableInDisplayHistory(true);
		}
	};

}; // UndoStack class

dwv.UndoStack.prototype.appendHtml = function()
{
    var paragraph = document.createElement("p");  
    paragraph.appendChild(document.createTextNode("History:"));
    paragraph.appendChild(document.createElement("br"));
    
    var select = document.createElement("select");
    select.id = "history_list";
    select.name = "history_list";
    select.multiple = "multiple";
    paragraph.appendChild(select);

    document.getElementById('history').appendChild(paragraph);
};
