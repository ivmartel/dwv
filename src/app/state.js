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
            "undo": app.getUndoStack().getStack()
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
        // undo stack
        for ( var i = 0 ; i < data.undo.length; ++i ) {
            if ( data.undo[i].type === "DrawGroupCommand" ) {
                var cmd = new dwv.tool.DrawGroupCommand(
                    Kinetic.Node.create(data.undo[i].group), 
                    data.undo[i].name, 
                    app.getDrawLayer() );
                cmd.execute();
            }
        }
    };
}; // State class
