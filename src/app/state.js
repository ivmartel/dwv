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
        // return a JSON string
        return JSON.stringify( {
            "version": "0.3",
            "window-center": app.getViewController().getWindowLevel().center,
            "window-width": app.getViewController().getWindowLevel().width,
            "position": app.getViewController().getCurrentPosition(),
            "scale": app.getScale(),
            "scaleCenter": app.getScaleCenter(),
            "translation": app.getTranslation(),
            "drawings": app.getDraws(),
            // new in v0.2
            "drawingsDetails": app.getDrawStoreDetails()
        });
    };
    /**
     * Load an application state from JSON.
     * @param {String} json The JSON representation of the state.
     */
    this.fromJSON = function (json) {
        var data = typeof json === 'string' ? JSON.parse(json) : json;

        // Display
        app.getViewController().setWindowLevel( data["window-center"], data["window-width"] );
        app.getViewController().setCurrentPosition( data.position );
        app.zoom( data.scale, data.scaleCenter.x, data.scaleCenter.y );
        app.translate( data.translation.x, data.translation.y );

        // Drawings
        switch(data.version){
            case "0.1":
                app.setDrawings( data.drawings, null );
                break;
            case "0.2":
            case "0.3":
                app.setDrawings( data.drawings, data.drawingsDetails );
                break;
            default :
                throw new Error("Unknown state file format version: '"+data.version+"'.");
        }
    };

}; // State class
