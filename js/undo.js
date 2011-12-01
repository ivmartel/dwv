/**
 * undo.js
 * Simple undo/redo stack. 
 */
function UndoStack(app)
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
		// add to display
		addCommandToHistory(cmd);
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
			app.mergeTempLayer();
			// remove last from history
			removeOptionFromHistory();
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
			app.mergeTempLayer();
			// add to display
			addCommandToHistory(cmd);
		}
	};

} // UndoStack class

function addCommandToHistory(command)
{
	var select = document.getElementById('history_list');
	var newOption = document.createElement('option');
	newOption.text = command.getName();
	newOption.value = command.getName();
	var oldOption = select.options[select.selectedIndex];  
	try
	{
		select.add(newOption, oldOption); // standards compliant; doesn't work in IE
	}
	catch(ex)
	{
		select.add(newOption, select.selectedIndex); // IE only
	}
}

function removeOptionFromHistory()
{
	var select = document.getElementById('history_list');
	select.remove(select.length - 1);
}

UndoStack.prototype.appendHtml = function()
{
    var paragraph = document.createElement("p");  
    paragraph.appendChild(document.createTextNode("History: "));
    
    var select = document.createElement("select");
    select.id = "history_list";
    select.name = "history_list";
    select.multiple = "multiple";
    paragraph.appendChild(select);

    document.getElementById('history').appendChild(paragraph);
};
