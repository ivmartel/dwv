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
        // store each slice drawings group
        var nSlices = app.getImage().getGeometry().getSize().getNumberOfSlices();
        var drawings = [];
        for ( var k = 0; k < nSlices; ++k ) {
            // getChildren always return, so drawings will have the good size
            var groups = app.getDrawLayer(k).getChildren();
            // remove anchors
            for ( var i = 0; i < groups.length; ++i ) {
                var anchors  = groups[i].find(".anchor");
                for ( var a = 0; a < anchors.length; ++a ) {
                    anchors[a].remove();
                }
            }
            drawings.push(groups);
        }
        // return a JSON string
        return JSON.stringify( {
            "window-center": app.getViewController().getWindowLevel().center,
            "window-width": app.getViewController().getWindowLevel().width,
            "position": app.getViewController().getCurrentPosition(),
            "scale": app.getScale(),
            "scaleCenter": app.getScaleCenter(),
            "translation": app.getTranslation(),
            "drawings": drawings
        } );
    };
    /**
     * Load state.
     * @method load
     */
    this.fromJSON = function (json, eventCallback) {
        var data = JSON.parse(json);
        // display
        app.getViewController().setWindowLevel(data["window-center"], data["window-width"]);
        app.getViewController().setCurrentPosition(data.position);
        app.zoom(data.scale, data.scaleCenter.x, data.scaleCenter.y);
        app.translate(data.translation.x, data.translation.y);
        // drawings
        var nSlices = app.getImage().getGeometry().getSize().getNumberOfSlices();
        var isShape = function (node) {
            return node.name() === "shape";
        };
        for ( var k = 0 ; k < nSlices; ++k ) {
            for ( var i = 0 ; i < data.drawings[k].length; ++i ) {
                var group = Kinetic.Node.create(data.drawings[k][i]);
                var shape = group.getChildren( isShape )[0];
                var cmd = new dwv.tool.DrawGroupCommand(
                    group, shape.className,
                    app.getDrawLayer(k) );
                if ( typeof eventCallback !== "undefined" ) {
                    cmd.onExecute = eventCallback;
                    cmd.onUndo = eventCallback;
                }
                cmd.execute();
                app.addToUndoStack(cmd);
            }
        }
    };
}; // State class
