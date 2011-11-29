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
		insertOption(cmd);
	};

	/**
	 * Call the previous command. 
	 */
	this.undo = function()
	{ 
		// not worth when drawing...
		// stack[--curCmd]();
		
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
				stack[i](); 
			}
			// merge the temporary layer
			app.mergeTempLayer();
		}
	}; 

	/**
	 * Call the next command.
	 */
	this.redo = function()
	{ 
		if( curCmd < stack.length )
		{
			stack[curCmd++]();
			// merge the temporary layer
			app.mergeTempLayer();
		}
	};

} // UndoStack class

function insertOption(command)
{
	var elSel = document.getElementById('history_list');
	var elOptNew = document.createElement('option');
	elOptNew.text = command.getName();
	elOptNew.value = "h";
	var elOptOld = elSel.options[elSel.selectedIndex];  
	try {
	  elSel.add(elOptNew, elOptOld); // standards compliant; doesn't work in IE
	}
	catch(ex) {
	  elSel.add(elOptNew, elSel.selectedIndex); // IE only
	}
}

function removeOption()
{
	var elSel = document.getElementById('history_list');
	elSel.remove(elSel.length - 1);
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
