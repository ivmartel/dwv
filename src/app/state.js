// namespaces
var dwv = dwv || {};
// external
var Konva = Konva || {};

/**
 * State class.
 * Saves: data url/path, display info.
 *
 * History:
 * - v0.3 (dwv v0.23.0, ?/?)
 *   - new drawing structure, drawings are now the full layer object and
 *     using toObject to avoid saving a string representation
 *   - new details structure: simple array of objects referenced by draw ids
 * - v0.2 (dwv v0.17.0, 12/2016)
 *   - adds draw details: array [nslices][nframes] of detail objects
 * - v0.1 (dwv v0.15.0, 07/2016)
 *   - adds version
 *   - drawings: array [nslices][nframes] with all groups
 * - initial release (dwv v0.10.0, 05/2015), no version number...
 *   - content: window-center, window-width, position, scale, scaleCenter, translation, drawings
 *   - drawings: array [nslices] with all groups
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
            "drawings": app.getDraws().toObject(),
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
        var v02DAndD = dwv.v01Tov02DrawingsAndDetails( data.drawings );
        data.drawings = dwv.v02Tov03Drawings( v02DAndD.drawings ).toObject();
        data.drawingsDetails = v02DAndD.drawingsDetails;
        return data;
    }
    /**
     * Read an application state from an Object in v0.2 format.
     * @param {Object} data The Object representation of the state.
     */
    function readV02(data) {
        // update drawings
        data.drawings = dwv.v02Tov03Drawings( data.drawings ).toObject();
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

    return drawLayer;
};

/**
 * Convert drawings from v0.2 to v0.3.
 * v0.1: text on its own
 * v0.2: text as part of label
 * @param {Array} inputDrawings An array of drawings.
 */
dwv.v01Tov02DrawingsAndDetails = function (inputDrawings)
{
    var newDrawings = [];
    var drawingsDetails = {};

    var drawGroups;
    var drawGroup;
    // loop over each slice
    for ( var k = 0, lenk = inputDrawings.length; k < lenk; ++k ) {
        // loop over each frame
        newDrawings[k] = [];
        for ( var f = 0, lenf = inputDrawings[k].length; f < lenf ; ++f ) {
            // draw group
            drawGroups = inputDrawings[k][f];
            var newFrameDrawings = [];
            // Iterate over shapes-group
            for ( var g = 0, leng = drawGroups.length; g < leng; ++g ) {
                // create konva group from input
                drawGroup = Konva.Node.create( drawGroups[g] );
                // label position
                var pos = {'x': 0, 'y': 0};
                // update shape colour
                var kshape = drawGroup.getChildren( function (node) {
                    return node.name() === 'shape';
                })[0];
                kshape.stroke( dwv.getColourHex(kshape.stroke()) );
                // get its text
                var ktexts = drawGroup.getChildren( function (node) {
                    return node.name() === 'text';
                });
                // update text: move it into a label
                var ktext = new Konva.Text({
                    name: "text",
                    text: ""
                });
                if ( ktexts.length === 1 ) {
                    pos.x = ktexts[0].x();
                    pos.y = ktexts[0].y();
                    // remove it from the group
                    ktexts[0].remove();
                    // use it
                    ktext = ktexts[0];
                } else {
                    // use shape position if no text
                    if ( kshape.points().length !== 0 ) {
                        pos = { 'x': kshape.points()[0],
                            'y': kshape.points()[1] };
                    }
                }
                // create new label with text and tag
                var klabel = new Konva.Label({
                    x: pos.x,
                    y: pos.y,
                    name: "label"
                });
                klabel.add( ktext );
                klabel.add( new Konva.Tag() );
                // add label to group
                drawGroup.add( klabel );
                // add group to list
                newFrameDrawings.push( JSON.stringify(drawGroup.toObject()) );

                // create details (v0.3 format)
                drawingsDetails[ drawGroup.id() ] = {
                    "textExpr": ktext.text(),
                    "longText": "",
                    "quant": null
                };

            }
            newDrawings[k].push(newFrameDrawings);
        }
    }

    return {'drawings': newDrawings, 'drawingsDetails': drawingsDetails};
};

/**
 * Convert drawing details from v0.2 to v0.3.
 * - v0.2: array [nslices][nframes] with all
 * - v0.3: simple array of objects referenced by draw ids
 * @param {Array} drawings An array of drawing details.
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

/**
 * Get the hex code of a string colour for a colour used in pre dwv v0.17.
 * @param {String} name The name of a colour.
 * @return {String} The hex representing the colour.
 */
dwv.getColourHex = function (name) {
    // default colours used in dwv version < 0.17
    var dict = {
        "Yellow": "#ffff00",
        "Red": "#ff0000",
        "White": "#ffffff",
        "Green": "#008000",
        "Blue": "#0000ff",
        "Lime": "#00ff00",
        "Fuchsia": "#ff00ff",
        "Black": "#000000"
    };
    var res = "#ffff00";
    if ( typeof dict[name] !== "undefined" ) {
        res = dict[name];
    }
    return res;
};
