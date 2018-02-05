// namespaces
var dwv = dwv || {};
// external
var Konva = Konva || {};

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
        }, null, "\t");
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
                var drawings = dwv.updateDrawingsV1ToV3(app, data.drawings);
                app.setDrawings( drawings.toJSON(), app.getDrawStoreDetails(drawings));
                break;
            case "0.2":
                app.setDrawings( dwv.updateDrawingsV2ToV3(data.drawings), dwv.updateDrawingsDetailsV2ToV3(data.drawingsDetails));
                break;
            case "0.3":
                app.setDrawings( data.drawings, data.drawingsDetails );
                break;
            default :
                throw new Error("Unknown state file format version: '"+data.version+"'.");
        }
    };

}; // State class


/**
 * Convert drawings from v0.1 to v0.3.
 * v0.1: one layer per slice/frame
 * v0.3: one layer, one group per slice. setDrawing expects the full stage
 * @param {Array} drawings An array of drawings.
 */
dwv.updateDrawingsV1ToV3 = function (app, drawings)
{
    // Auxiliar variables
    var group, groupShapes, parentGroup;
    var name, id, mathPoints, points, newDraw, shape;

    var image = app.getImage();
    var style = app.getStyle();

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

            // Get all the shapes-groups in the position-group
            groupShapes = groupDrawings[k][f];
            // Avoid create empty groups
            if(!groupShapes.length){
                continue;
            }

            // Create position-group set as visible and append it to drawLayer
            parentGroup = new Konva.Group({
                id: dwv.getDrawPositionGroupId(k,f),
                name: "position-group",
                visible: false
            });

            // Iterate over shapes-group
            for( var g = 0, leng = groupShapes.length; g < leng; ++g ) {
                // create the konva group
                group = Konva.Node.create(groupShapes[g]);
                name = group.getAttr('name');
                mathPoints = [];
                console.log('id -> ', id);
                shape = group.getChildren(function(node){
                    return node.name() === "shape";
                })[0];

                var factory = null;

                switch(name){
                    case "line-group":
                        points = shape.points();
                        mathPoints = [
                            new dwv.math.Point2D(points[0], points[1]),
                            new dwv.math.Point2D(points[2], points[3])
                        ];
                        factory = new dwv.tool.RulerFactory();
                        break;
                    case "protractor-group":
                        points = shape.points();
                        mathPoints = [];
                        for(var p = 0, plen = points.length; p<plen; p = p+2){
                            mathPoints.push( new dwv.math.Point2D(points[p], points[p+1]) );
                        }
                        factory = new dwv.tool.ProtractorFactory();
                        break;
                    case "rectangle-group":
                        points = {
                            x: shape.x(),
                            y: shape.y(),
                            w: shape.width(),
                            h: shape.height()
                        };
                        mathPoints = [
                            new dwv.math.Point2D(points.x, points.y),
                            new dwv.math.Point2D(points.x + points.w, points.y + points.h)
                        ];
                        factory = new dwv.tool.RectangleFactory();
                        break;
                    case "roi-group":
                        points = shape.points();
                        for(var r = 0, rlen = points.length; r<rlen; r = r+2){
                            mathPoints.push( new dwv.math.Point2D(points[r], points[r+1]) );
                        }
                        factory = new dwv.tool.RoiFactory();
                        break;
                    case "ellipse-group":
                        points = {
                            x: shape.x(),
                            y: shape.y(),
                            w: shape.width(),
                            h: shape.height()
                        };
                        mathPoints = [
                            new dwv.math.Point2D(points.x, points.y),
                            new dwv.math.Point2D(points.x + points.w, points.y + points.h)
                        ];
                        factory = new dwv.tool.EllipseFactory();
                        break;
                    default:
                        console.error("Unknown shape name: '" + name + "'.");
                }
                if(factory){
                    style.setLineColour(dwv.utils.stringToColor(shape.getAttr('stroke')));
                    newDraw = factory.create(mathPoints, style, image);
                    newDraw.id(group.getAttr('id'));
                    parentGroup.add(newDraw);
                }
            }
            drawLayer.add(parentGroup);
        }
    }
    return drawLayer;
};

/**
 * Convert drawings from v0.2 to v0.3.
 * v0.1: one layer per slice
 * v0.2: one layer per slice/frame
 * v0.3: one layer, one group per slice. setDrawing expects the full stage
 * @param {Array} drawings An array of drawings.
 */
dwv.updateDrawingsV2ToV3 = function (drawings)
{
    // Auxiliar variables
    var group, groupShapes, parentGroup;

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

            // Get all the shapes-groups in the position-group
            groupShapes = groupDrawings[k][f];

            // Avoid create empty groups
            if(!groupShapes.length){
                continue;
            }

            // Create position-group set as visible and append it to drawLayer
            parentGroup = new Konva.Group({
                id: dwv.getDrawPositionGroupId(k,f),
                name: "position-group",
                visible: false
            });
            // Iterate over shapes-group
            for( var g = 0, leng = groupShapes.length; g < leng; ++g ) {
                // create the konva group
                group = Konva.Node.create(groupShapes[g]);
                parentGroup.add(group);
            }
            drawLayer.add(parentGroup);
        }
    }

    return drawLayer.toJSON();
};

/**
 * Convert drawings from v0.2 to v0.3.
 * v0.2: one layer per slice
 * v0.3: one layer, one group per slice. setDrawing expects the full stage
 * @param {Array} drawings An array of drawings.
 */
dwv.updateDrawingsDetailsV2ToV3 = function (details)
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