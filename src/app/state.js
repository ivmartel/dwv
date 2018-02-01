// namespaces
var dwv = dwv || {};
// external
var Konva = Konva || {};

/**
 * State class.
 * Saves: data url/path, display info.
 * @constructor
 */
dwv.State = function ()
{
    /**
     * Save the application state as JSON.
     * @param {Object} app The associated application.
     */
    this.toJSON = function (app) {
        // return a JSON string
        return JSON.stringify( {
            "version": "0.3",
            "window-center": app.getViewController().getWindowLevel().center,
            "window-width": app.getViewController().getWindowLevel().width,
            "position": app.getViewController().getCurrentPosition(),
            "scale": app.getScale(),
            "scaleCenter": app.getScaleCenter(),
            "translation": app.getTranslation(),
            // new structure in v0.3
            "drawings": app.getDraws().toObject(),
            // new in v0.2
            "drawingsDetails": app.getDrawStoreDetails()
        } );
    };
    /**
     * Load an application state from JSON.
     * @param {String} json The JSON representation of the state.
     */
    this.fromJSON = function (json) {
        var data = JSON.parse(json);
        var res = null;
        if ( data.version === "0.1" ) {
            res = readV01(data);
        } else if ( data.version === "0.2" ) {
            res = readV02(data);
        } else if ( data.version === "0.3" ) {
            res = readV03(data);
        } else {
            throw new Error("Unknown state file format version: '" + data.version + "'.");
        }
        return res;
    };
    /**
     * Load an application state from JSON.
     * @param {Object} app The app to apply the state to.
     * @param {Object} data The state data.
     */
    this.apply = function (app, data) {
        // display
        app.getViewController().setWindowLevel( data["window-center"], data["window-width"] );
        app.getViewController().setCurrentPosition( data.position );
        app.zoom( data.scale, data.scaleCenter.x, data.scaleCenter.y );
        app.translate( data.translation.x, data.translation.y );
        // drawings
        app.setDrawings( data.drawings, data.drawingsDetails );
    };
    /**
     * Read an application state from an Object in v0.1 format.
     * @param {Object} data The Object representation of the state.
     */
    function readV01(data) {
        // update drawings
        data.drawingsDetails = null;
        return data;
    }
    /**
     * Read an application state from an Object in v0.2 format.
     * @param {Object} data The Object representation of the state.
     */
    function readV02(data) {
        // update drawings
        data.drawings = dwv.v02Tov03Drawings( data.drawings );
        data.drawingsDetails = dwv.v02Tov03DrawingsDetails( data.drawingsDetails );
        return data;
    }
    /**
     * Read an application state from an Object in v0.3 format.
     * @param {Object} data The Object representation of the state.
     */
    function readV03(data) {
        return data;
    }
}; // State class

/**
 * Convert drawings from v0.2 to v0.3.
 * v0.2: one layer per slice/frame
 * v0.3: one layer, one group per slice. setDrawing expects the full stage
 * @param {Array} drawings An array of drawings.
 */
dwv.v02Tov03Drawings = function (drawings)
{
    // Auxiliar variables
    var group, groupShapes, parentGroup;
    // Avoid errors when dropping multiple states
    //drawLayer.getChildren().each(function(node){
    //    node.visible(false);
    //});

    var drawLayer = new Konva.Layer({
        'listening': false,
        'hitGraphEnabled': false,
        'visible': true
    });

    // Get the positions-groups data
    var groupDrawings = typeof drawings === 'string' ? JSON.parse(drawings) : drawings;
    // Iterate over each position-groups
    for ( var k = 0, lenk = groupDrawings.length; k < lenk; ++k ) {
        // Iterate over each frame
        for( var f = 0, lenf = groupDrawings[k].length; f < lenf ; ++f ) {
            // Create position-group set as visible and append it to drawLayer
            parentGroup = new Konva.Group({
                id: dwv.getDrawPositionGroupId(k,f),
                name: "position-group",
                visible: false
            });

            // Get all the shapes-groups in the position-group
            groupShapes = groupDrawings[k][f];
            // Iterate over shapes-group
            for( var g = 0, leng = groupShapes.length; g < leng; ++g ) {
                // create the konva group
                group = Konva.Node.create(groupShapes[g]);
                // enforce draggable: only the shape was draggable in v0.2,
                // now the whole group is.
                group.draggable(true);
                group.getChildren().forEach( function (gnode) {
                    gnode.draggable(false);
                });
                // add to position group
                parentGroup.add(group);
            }
            // add to layer
            drawLayer.add(parentGroup);
        }
    }

    return drawLayer.toObject();
};

/**
 * Convert drawings from v0.2 to v0.3.
 * v0.2: one layer per slice
 * v0.3: one layer, one group per slice. setDrawing expects the full stage
 * @param {Array} drawings An array of drawings.
 */
dwv.v02Tov03DrawingsDetails = function (details)
{
    var res = {};
    // Get the positions-groups data
    var groupDetails = typeof details === 'string' ? JSON.parse(details) : details;
    // Iterate over each position-groups
    for ( var k = 0, lenk = groupDetails.length; k < lenk; ++k ) {
        // Iterate over each frame
        for( var f = 0, lenf = groupDetails[k].length; f < lenf ; ++f ) {
            // Iterate over shapes-group
            for( var g = 0, leng = groupDetails[k][f].length; g < leng; ++g ) {
                var group = groupDetails[k][f][g];
                res[group.id] = {
                    "textExpr": group.textExpr,
                    "longText": group.longText,
                    "quant": group.quant
                };
            }
        }
    }
    return res;
};
