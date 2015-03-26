/** 
 * Tool module.
 * @module tool
 */
var dwv = dwv || {};

var Kinetic = Kinetic || {};

/**
 * State class.
 * Saves: data url/path, display info, undo stack.
 * @class State
 * @namespace dwv
 * @constructor
 * @param {Object} app The associated application.
 */
dwv.State = function (app)
{
    /**
     * Save state.
     * @method save
     */
    this.toJSON = function () {
        var data = {
            "window-center": app.getViewController().getWindowLevel().center, 
            "window-width": app.getViewController().getWindowLevel().width,
            "position": app.getViewController().getCurrentPosition(),
            "drawings": app.getDrawLayer().getChildren()
        };
        return window.btoa(JSON.stringify(data));
    };
    /**
     * Load state.
     * @method load
     */
    this.fromJSON = function (json) {
        var data = JSON.parse(json);
        // display
        app.getViewController().setWindowLevel(data["window-center"], data["window-width"]);
        app.getViewController().setCurrentPosition(data.position);
        // drawings
        for ( var i = 0 ; i < data.drawings.length; ++i ) {
            var cmd = new dwv.tool.DrawGroupCommand(
                Kinetic.Node.create(data.drawings[i]), 
                "Draw", 
                app.getDrawLayer() );
            cmd.execute();
            app.getUndoStack().add(cmd);
        }
    };
}; // State class
