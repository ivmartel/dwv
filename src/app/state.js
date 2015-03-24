/** 
 * Tool module.
 * @module tool
 */
var dwv = dwv || {};

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
            "position": app.getViewController().getCurrentPosition()
        };
        return window.btoa(JSON.stringify(data));
    };
    /**
     * Load state.
     * @method load
     */
    this.fromJSON = function (json) {
        var data = JSON.parse(json);
        app.getViewController().setWindowLevel(data["window-center"], data["window-width"]);
        app.getViewController().setCurrentPosition(data.position);
    };
}; // State class
