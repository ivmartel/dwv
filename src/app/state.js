// namespaces
var dwv = dwv || {};
//external
var Kinetic = Kinetic || {};

/**
 * State class.
 * Saves: data url/path, display info.
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
        var drawings = app.getDraws();
        var drawingsDetails = app.getDrawStoreDetails();
        // return a JSON string
        return JSON.stringify( {
            "version": "0.2",
            "slices" : app.getImage().getSlideSort(),
            "window-center": app.getViewController().getWindowLevel().center,
            "window-width": app.getViewController().getWindowLevel().width,
            "position": app.getViewController().getCurrentPosition(),
            "scale": app.getScale(),
            "scaleCenter": app.getScaleCenter(),
            "translation": app.getTranslation(),
            "drawings": drawings,
            // new in v0.2
            "drawingsDetails": drawingsDetails
        } );
    };
    /**
     * Load an application state from JSON.
     * @param {String} json The JSON representation of the state.
     */
    this.fromJSON = function (json) {
        var data = JSON.parse(json);
        if (data.version === "0.1") {
            readV01(data);
        }
        else if (data.version === "0.2") {
            readV02(data);
        }
        else {
            throw new Error("Unknown state file format version: '"+data.version+"'.");
        }
    };
    /**
     * Read an application state from an Object in v0.1 format.
     * @param {Object} data The Object representation of the state.
     */
    function readV01(data) {
        // display
        app.getViewController().setWindowLevel( data["window-center"], data["window-width"] );
        app.getViewController().setCurrentPosition( data.position );
        app.zoom( data.scale, data.scaleCenter.x, data.scaleCenter.y );
        app.translate( data.translation.x, data.translation.y );
        // drawings
        app.setDrawings( data.drawings, null );
    }
    /**
     * Read an application state from an Object in v0.2 format.
     * @param {Object} data The Object representation of the state.
     */
    function readV02(data) {
        // display
        app.getViewController().setWindowLevel( data["window-center"], data["window-width"] );
        app.getViewController().setCurrentPosition( data.position );
        app.zoom( data.scale, data.scaleCenter.x, data.scaleCenter.y );
        app.translate( data.translation.x, data.translation.y );
        // drawings
        app.setDrawings( data.drawings, data.drawingsDetails );
    }
}; // State class
