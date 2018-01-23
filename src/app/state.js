// namespaces
var dwv = dwv || {};

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
            "version": "0.3",
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

        // Images state
        app.getViewController().setWindowLevel( data["window-center"], data["window-width"] );
        app.getViewController().setCurrentPosition( data.position );
        app.zoom( data.scale, data.scaleCenter.x, data.scaleCenter.y );
        app.translate( data.translation.x, data.translation.y );

        // Drawings state
        switch(String(data.version)){
            case '0.1':
                app.setDrawings( data.version, data.drawings, null );
                break;
            case '0.2':
            case '0.3':
                app.setDrawings( data.version, data.drawings, data.drawingsDetails );
                break;
            default:
                throw new Error("Unknown state file format version: '"+data.version+"'.");
        }
    };
}; // State class
