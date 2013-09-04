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
     * Undo the last command. 
     */
    this.undo = function()
    { 
        // a bit inefficient...
        if( curCmdIndex > 0 )
        {
            // decrement index
            --curCmdIndex; 
            // reset image
            app.restoreOriginalImage();
            // clear layers
            app.getDrawLayer().clearContextRect();
            app.getTempLayer().clearContextRect();
            // redo from first command
            for( var i = 0; i < curCmdIndex; ++i)
            {
                stack[i].execute(); 
            }
            // display
            if( curCmdIndex === 0 ) {
                // just draw the image
                app.generateAndDrawImage();
            }
            else {
                // merge the temporary layer
                app.getDrawLayer().merge(app.getTempLayer());
            }
            // disable last in display history
            dwv.gui.enableInUndoHtml(false);
        }
    }; 

    /**
     * Redo the last command.
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
