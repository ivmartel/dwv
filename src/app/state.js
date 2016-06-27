// namespaces
var dwv = dwv || {};
//external
var Kinetic = Kinetic || {};

/**
 * State class.
 * Saves: data url/path, display info, undo stack.
 * @constructor
 * @param {Object} app The associated application.
 */
dwv.State = function (app)
{
    /**
     * Save the application state as JSON.
     */
    this.toJSON = function () {
        // store each slice drawings group
        var nSlices = app.getImage().getGeometry().getSize().getNumberOfSlices();
        var nFrames = app.getImage().getNumberOfFrames();
        var drawings = [];
        for ( var k = 0; k < nSlices; ++k ) {
        	drawings[k] = [];
        	for ( var f = 0; f < nFrames; ++f ) {
	            // getChildren always return, so drawings will have the good size
	            var groups = app.getDrawLayer(k,f).getChildren();
	            // remove anchors
	            for ( var i = 0; i < groups.length; ++i ) {
	                var anchors  = groups[i].find(".anchor");
	                for ( var a = 0; a < anchors.length; ++a ) {
	                    anchors[a].remove();
	                }
	            }
	            drawings[k].push(groups);
	        }
        }
        // return a JSON string
        return JSON.stringify( {
            "version": "0.1",
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
     * Load an application state from JSON.
     * @param {String} json The JSON representation of the state.
     * @param {Object} eventCallback The callback to associate to draw commands.
     */
    this.fromJSON = function (json, eventCallback) {
        var data = JSON.parse(json);
        if (data.version === "0.1") {
        	readV01(data, eventCallback);
        }
        else {
        	throw new Error("Unknown state file format version: '"+data.version+"'.");
        }
    };
    /**
     * Read an application state from an Object.
     * @param {Object} data The Object representation of the state.
     * @param {Object} eventCallback The callback to associate to draw commands.
     */
    function readV01(data, eventCallback) {
        // display
        app.getViewController().setWindowLevel(data["window-center"], data["window-width"]);
        app.getViewController().setCurrentPosition(data.position);
        app.zoom(data.scale, data.scaleCenter.x, data.scaleCenter.y);
        app.translate(data.translation.x, data.translation.y);
        // drawings
        var nSlices = app.getImage().getGeometry().getSize().getNumberOfSlices();
        var nFrames = app.getImage().getNumberOfFrames();
        var isShape = function (node) {
            return node.name() === "shape";
        };
        for ( var k = 0 ; k < nSlices; ++k ) {
        	for ( var f = 0; f < nFrames; ++f ) {
	            for ( var i = 0 ; i < data.drawings[k][f].length; ++i ) {
	                var group = Kinetic.Node.create(data.drawings[k][f][i]);
	                var shape = group.getChildren( isShape )[0];
	                var cmd = new dwv.tool.DrawGroupCommand(
	                    group, shape.className,
	                    app.getDrawLayer(k,f) );
	                if ( typeof eventCallback !== "undefined" ) {
	                    cmd.onExecute = eventCallback;
	                    cmd.onUndo = eventCallback;
	                }
	                cmd.execute();
	                app.addToUndoStack(cmd);
	            }
	        }
        }
    }
}; // State class
