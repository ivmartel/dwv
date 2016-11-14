// namespaces
var dwv = dwv || {};
// external
var Kinetic = Kinetic || {};

/**
 * Draw controller.
 * @constructor
 */
dwv.DrawController = function (drawDiv)
{

    // Draw layers
    var drawLayers = [];
    // Draw stage
    var drawStage = null;

    // current slice position
    var currentSlice = 0;
    // current frame position
    var currentFrame = 0;

    /**
     * Create the controller: sets up the draw stage.
     * @param {Number} width The width of the stage.
     * @param {Number} height The height of the stage.
     */
    this.create = function (width, height) {
        // create stage
        drawStage = new Kinetic.Stage({
            'container': drawDiv,
            'width': width,
            'height': height,
            'listening': false
        });
        // reset style
        // (avoids a not needed vertical scrollbar)
        drawStage.getContent().setAttribute("style", "");
    };

    /**
     * Get the draw layer.
     * @param {Number} slice Optional slice position (uses the current slice position if not provided).
     * @param {Number} frame Optional frame position (uses the current frame position if not provided).
     * @return {Object} The draw layer.
     */
    /*this.getDrawLayer = function (slice, frame) {
        return drawLayers[slice][frame];
    };*/

    /**
     * Get the current draw layer.
     * @return {Object} The draw layer.
     */
    this.getCurrentDrawLayer = function () {
        //return this.getDrawLayer(currentSlice, currentFrame);
        return drawLayers[currentSlice][currentFrame];
    };

    this.clearLayers = function () {
        drawLayers = [];
    };

    /**
     * Get the draw stage.
     * @return {Object} The draw layer.
     */
    this.getDrawStage = function () {
        return drawStage;
    };

    this.resetStage = function (windowScale) {
        drawStage.offset( {'x': 0, 'y': 0} );
        drawStage.scale( {'x': windowScale, 'y': windowScale} );
        drawStage.draw();
    };

    /**
     * Append a new draw layer list to the list.
     * @private
     */
    this.appendDrawLayer = function (number) {
        // add a new dimension
        drawLayers.push([]);
        // fill it
        for (var i=0; i<number; ++i) {
            // create draw layer
            var drawLayer = new Kinetic.Layer({
                'listening': false,
                'hitGraphEnabled': false,
                'visible': false
            });
            drawLayers[drawLayers.length - 1].push(drawLayer);
            // add the layer to the stage
            drawStage.add(drawLayer);
        }
    };

    this.setDrawings = function (drawings, drawingsDetails, cmdCallback, exeCallback)
    {
        var isShape = function (node) {
            return node.name() === "shape";
        };
        var isLabel = function (node) {
            return node.name() === "label";
        };
        for ( var k = 0 ; k < drawLayers.length; ++k ) {
            for ( var f = 0; f < drawLayers[k].length; ++f ) {
                for ( var i = 0 ; i < drawings[k][f].length; ++i ) {
                    var group = Kinetic.Node.create(drawings[k][f][i]);
                    var shape = group.getChildren( isShape )[0];
                    var cmd = new dwv.tool.DrawGroupCommand(
                        group, shape.className,
                        drawLayers[k][f] );
                    if ( typeof eventCallback !== "undefined" ) {
                        cmd.onExecute = cmdCallback;
                        cmd.onUndo = cmdCallback;
                    }
                    // text (new in v0.2)
                    // TODO Verify ID?
                    if (drawingsDetails) {
                        var details = drawingsDetails[k][f][i];
                        var label = group.getChildren( isLabel )[0];
                        var text = label.getText();
                        // store details
                        text.textExpr = details.textExpr;
                        text.longText = details.longText;
                        text.quant = details.quant;
                        // reset text (it was not encoded)
                        text.setText(dwv.utils.replaceFlags(text.textExpr, text.quant));
                    }
                    // execute
                    cmd.execute();
                    //app.addToUndoStack(cmd);
                    exeCallback(cmd);
                }
            }
        }
    };

    /**
     * Activate the current draw layer.
     * @private
     */
    this.activateDrawLayer = function (viewController) {


        // hide all draw layers
        for ( var i = 0; i < drawLayers.length; ++i ) {
            //drawLayers[i].visible( false );
            for ( var j = 0; j < drawLayers[i].length; ++j ) {
                drawLayers[i][j].visible( false );
            }
        }
        // show current draw layer
        currentSlice = viewController.getCurrentPosition().k;
        currentFrame = viewController.getCurrentFrame();

        var currentLayer = this.getCurrentDrawLayer();

        currentLayer.visible( true );
        currentLayer.draw();
    };

    this.resize = function (newWidth, newHeight, scale) {
        // resize div
        //var drawDiv = this.getElement("drawDiv");
        drawDiv.setAttribute("style","width:"+newWidth+"px;height:"+newHeight+"px");
       // resize stage
        drawStage.setWidth(newWidth);
        drawStage.setHeight(newHeight);
        drawStage.scale( {x: scale, y: scale} );
        drawStage.draw();
    };

    this.zoom = function (scale, scaleCenter) {
        // zoom
        var newKZoom = {'x': scale, 'y': scale};
        // offset
        // TODO different from the imageLayer offset?
        var oldKZoom = drawStage.scale();
        var oldOffset = drawStage.offset();
        var newOffsetX = (scaleCenter.x / oldKZoom.x) +
            oldOffset.x - (scaleCenter.x / newKZoom.x);
        var newOffsetY = (scaleCenter.y / oldKZoom.y) +
            oldOffset.y - (scaleCenter.y / newKZoom.y);
        var newOffset = { 'x': newOffsetX, 'y': newOffsetY };
        // store
        drawStage.offset( newOffset );
        drawStage.scale( newKZoom );
        drawStage.draw();
    };

    this.translate = function (tx, ty) {
        drawStage.offset( { 'x': tx, 'y': ty } );
        drawStage.draw();
    };

    /**
     * Get a list of drawing details.
     * @return {Object} A list of draw details including id, slice, frame...
     */
    this.getDrawDisplayDetails = function ()
    {
        var list = [];
        //var size = image.getGeometry().getSize();
        //for ( var z = 0; z < size.getNumberOfSlices(); ++z ) {
//
        //    for ( var f = 0; f < image.getNumberOfFrames(); ++f ) {
        for ( var z = 0; z < drawLayers.length; ++z ) {
            for ( var f = 0; f < drawLayers[z].length; ++f ) {
                var collec = drawLayers[z][f].getChildren();
                for ( var i = 0; i < collec.length; ++i ) {
                    var shape = collec[i].getChildren()[0];
                    var label = collec[i].getChildren()[1];
                    var text = label.getChildren()[0];
                    var type = shape.className;
                    if (type === "Line" && shape.closed()) {
                        type = "Roi";
                    }
                    if (type === "Rect") {
                        type = "Rectangle";
                    }
                    list.push( {
                        "id": collec[i].id(),
                        //"id": i,
                        "slice": z,
                        "frame": f,
                        "type": type,
                        "color": shape.stroke(),
                        "label": text.textExpr,
                        "description": text.longText
                    });
                }
            }
        }
        // return
        return list;
    };

    this.getDraws = function ()
    {
        var drawGroups = [];
        for ( var k = 0; k < drawLayers.length; ++k ) {
            drawGroups[k] = [];
            for ( var f = 0; f < drawLayers[k].length; ++f ) {
                // getChildren always return, so drawings will have the good size
                var groups = drawLayers[k][f].getChildren();
                drawGroups[k].push(groups);
            }
        }
        return drawGroups;
    };

    this.getDrawStoreDetails = function ()
    {
        var drawingsDetails = [];
        for ( var k = 0; k < drawLayers.length; ++k ) {
            drawingsDetails[k] = [];
            for ( var f = 0; f < drawLayers[k].length; ++f ) {
                // getChildren always return, so drawings will have the good size
                var groups = drawLayers[k][f].getChildren();
                var details = [];
                for ( var i = 0; i < groups.length; ++i ) {
                    // remove anchors
                    var anchors = groups[i].find(".anchor");
                    for ( var a = 0; a < anchors.length; ++a ) {
                        anchors[a].remove();
                    }
                    // get text
                    var texts = groups[i].find(".text");
                    if ( texts.length !== 1 ) {
                        console.warn("There should not be more than one text per shape.");
                    }
                    // get details (non Kinetic vars)
                    details.push({
                        "id": groups[i].id(),
                        "textExpr": encodeURIComponent(texts[0].textExpr),
                        "longText": encodeURIComponent(texts[0].longText),
                        "quant": texts[0].quant
                    });
                }
                drawingsDetails[k].push(details);
            }
        }
        return drawingsDetails;
    };

    /**
     * Update a drawing.
     * @param {Object} drawDetails Details of the drawing to update.
     */
    this.updateDraw = function (drawDetails)
    {
        var layer = drawLayers[drawDetails.slice][drawDetails.frame];
        //var collec = layer.getChildren()[drawDetails.id];
        var collec = layer.getChildren( function (node) {
            return node.id() === drawDetails.id;
        })[0];
        // shape
        var shape = collec.getChildren()[0];
        shape.stroke(drawDetails.color);
        // label
        var label = collec.getChildren()[1];
        var text = label.getChildren()[0];
        text.fill(drawDetails.color);
        text.textExpr = drawDetails.label;
        text.longText = drawDetails.description;
        text.setText(dwv.utils.replaceFlags(text.textExpr, text.quant));

        // udpate current layer
        this.getCurrentDrawLayer().draw();
    };
    /**
     * Delete all Draws from all layers.
    */
    this.deleteDraws = function (cmdCallback, exeCallback) {
        var delcmd, layer, groups;
        for ( var k = 0; k < drawLayers.length; ++k ) {
            for ( var f = 0; f < drawLayers[k].length; ++f ) {
                layer = drawLayers[k][f];
                groups = layer.getChildren();
                while (groups.length) {
                    var shape = groups[0].getChildren()[0];
                    delcmd = new dwv.tool.DeleteGroupCommand( groups[0],
                        dwv.tool.GetShapeDisplayName(shape), layer);
                    delcmd.onExecute = cmdCallback;
                    delcmd.execute();
                    exeCallback(delcmd);
                }
            }
        }
    };

}; // class dwv.DrawController
