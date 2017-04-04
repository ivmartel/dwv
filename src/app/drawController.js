// namespaces
var dwv = dwv || {};
// external
dwv.ext = dwv.ext || {};
/* global Konva */
dwv.ext.Konva = Konva || {};

/**
 * Draw controller.
 * @constructor
 * @param {Object} drawDiv The HTML div used to store the drawings.
 */
dwv.DrawController = function (drawDiv)
{

    // Draw stage
    var drawStage = null;
    // Draw layers: 2 dimension array: [slice][frame]
    var drawLayers = [];

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
        drawStage = new dwv.ext.Konva.Stage({
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
     * Get the current draw layer.
     * @return {Object} The draw layer.
     */
    this.getCurrentDrawLayer = function () {
        //return this.getDrawLayer(currentSlice, currentFrame);
        return drawLayers[currentSlice][currentFrame];
    };

    /**
     * Reset: clear the layers array.
     */
    this.reset = function () {
        drawLayers = [];
    };

    /**
     * Get the draw stage.
     * @return {Object} The draw layer.
     */
    this.getDrawStage = function () {
        return drawStage;
    };

    /**
     * Activate the current draw layer.
     * @param {Object} viewController The associated view controller.
     */
    this.activateDrawLayer = function (viewController)
    {
        // hide all draw layers
        for ( var k = 0, lenk = drawLayers.length; k < lenk; ++k ) {
            for ( var f = 0, lenf = drawLayers[k].length; f < lenf; ++f ) {
                drawLayers[k][f].visible( false );
            }
        }
        // set current position
        currentSlice = viewController.getCurrentPosition().k;
        currentFrame = viewController.getCurrentFrame();
        // show current draw layer
        var currentLayer = this.getCurrentDrawLayer();
        currentLayer.visible( true );
        currentLayer.draw();
    };

    /**
     * Reset the stage with a new window scale.
     * @param {Number} windowScale The window scale.
     */
    this.resetStage = function (windowScale) {
        drawStage.offset( {'x': 0, 'y': 0} );
        drawStage.scale( {'x': windowScale, 'y': windowScale} );
        drawStage.draw();
    };

    /**
     * Resize the current stage.
     * @param {Number} width the stage width.
     * @param {Number} height the stage height.
     * @param {Number} scale the stage scale.
     */
    this.resizeStage = function (width, height, scale) {
        // resize div
        drawDiv.setAttribute("style","width:"+width+"px;height:"+height+"px");
        // resize stage
        drawStage.setWidth(width);
        drawStage.setHeight(height);
        drawStage.scale( {'x': scale, 'y': scale} );
        drawStage.draw();
    };

    /**
     * Zoom the stage.
     * @param {Number} scale The scale factor.
     * @param {Object} scaleCenter The scale center point.
     */
    this.zoomStage = function (scale, scaleCenter) {
        // zoom
        var newScale = {'x': scale, 'y': scale};
        // offset
        // TODO different from the imageLayer offset?
        var oldScale = drawStage.scale();
        var oldOffset = drawStage.offset();
        var newOffsetX = (scaleCenter.x / oldScale.x) +
            oldOffset.x - (scaleCenter.x / newScale.x);
        var newOffsetY = (scaleCenter.y / oldScale.y) +
            oldOffset.y - (scaleCenter.y / newScale.y);
        var newOffset = {'x': newOffsetX, 'y': newOffsetY};
        // store
        drawStage.offset( newOffset );
        drawStage.scale( newScale );
        drawStage.draw();
    };

    /**
     * Translate the stage.
     * @param {Number} tx The X translation.
     * @param {Number} ty The Y translation.
     */
    this.translateStage = function (tx, ty) {
        drawStage.offset( {'x': tx, 'y': ty} );
        drawStage.draw();
    };

    /**
     * Append a new draw layer list to the list.
     * @param {Number} nLayers The size of the layers array to append to the current one.
     */
    this.appendDrawLayer = function (nLayers) {
        // add a new dimension
        drawLayers.push([]);
        // fill it
        for (var i = 0; i < nLayers; ++i) {
            // create draw layer
            var drawLayer = new dwv.ext.Konva.Layer({
                'listening': false,
                'hitGraphEnabled': false,
                'visible': false
            });
            drawLayers[drawLayers.length - 1].push(drawLayer);
            // add the layer to the stage
            drawStage.add(drawLayer);
        }
    };

    /**
     * Get a list of drawing display details.
     * @return {Object} A list of draw details including id, slice, frame...
     */
    this.getDrawDisplayDetails = function ()
    {
        var list = [];
        for ( var k = 0, lenk = drawLayers.length; k < lenk; ++k ) {
            for ( var f = 0, lenf = drawLayers[k].length; f < lenf; ++f ) {
                var collec = drawLayers[k][f].getChildren();
                for ( var i = 0, leni = collec.length; i < leni; ++i ) {
                    var shape = collec[i].getChildren( isNodeNameShape )[0];
                    var label = collec[i].getChildren( isNodeNameLabel )[0];
                    var text = label.getChildren()[0];
                    var type = shape.className;
                    if (type === "Line") {
                        var shapeExtrakids = collec[i].getChildren( isNodeNameShapeExtra );
                        if (shape.closed()) {
                            type = "Roi";
                        } else if (shapeExtrakids.length !== 0) {
                            if ( shapeExtrakids[0].name().indexOf("triangle") !== -1 ) {
                                type = "Arrow";
                            }
                            else {
                                type = "Ruler";
                            }
                        }
                    }
                    if (type === "Rect") {
                        type = "Rectangle";
                    }
                    list.push( {
                        "id": collec[i].id(),
                        "slice": k,
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

    /**
     * Get all the draws of the stage.
     */
    this.getDraws = function ()
    {
        var drawGroups = [];
        for ( var k = 0, lenk = drawLayers.length; k < lenk; ++k ) {
            drawGroups[k] = [];
            for ( var f = 0, lenf = drawLayers[k].length; f < lenf; ++f ) {
                // getChildren always return, so drawings will have the good size
                var groups = drawLayers[k][f].getChildren();
                drawGroups[k].push(groups);
            }
        }
        return drawGroups;
    };

    /**
     * Get a list of drawing store details.
     * @return {Object} A list of draw details including id, text, quant...
     * TODO Unify with getDrawDisplayDetails?
     */
    this.getDrawStoreDetails = function ()
    {
        var drawingsDetails = [];
        for ( var k = 0, lenk = drawLayers.length; k < lenk; ++k ) {
            drawingsDetails[k] = [];
            for ( var f = 0, lenf = drawLayers[k].length; f < lenf; ++f ) {
                // getChildren always return, so drawings will have the good size
                var groups = drawLayers[k][f].getChildren();
                var details = [];
                for ( var i = 0, leni = groups.length; i < leni; ++i ) {
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
                    // get details (non konva vars)
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
     * Set the drawings on the current stage.
     * @param {Array} drawings An array of drawings.
     * @param {Array} drawingsDetails An array of drawings details.
     * @param {Object} cmdCallback The DrawCommand callback.
     * @param {Object} exeCallback The callback to call once the DrawCommand has been executed.
     */
    this.setDrawings = function (drawings, drawingsDetails, cmdCallback, exeCallback)
    {
        // loop through layers
        for ( var k = 0, lenk = drawLayers.length; k < lenk; ++k ) {
            for ( var f = 0, lenf = drawLayers[k].length; f < lenf; ++f ) {
                for ( var i = 0, leni = drawings[k][f].length; i < leni; ++i ) {
                    // create the group
                    var group = dwv.ext.Konva.Node.create(drawings[k][f][i]);
                    var shape = group.getChildren( isNodeNameShape )[0];
                    // create the draw command
                    var cmd = new dwv.tool.DrawGroupCommand(
                        group, shape.className,
                        drawLayers[k][f] );
                    // draw command callbacks
                    cmd.onExecute = cmdCallback;
                    cmd.onUndo = cmdCallback;
                    // text (new in v0.2)
                    // TODO Verify ID?
                    if (drawingsDetails) {
                        var details = drawingsDetails[k][f][i];
                        var label = group.getChildren( isNodeNameLabel )[0];
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
                    exeCallback(cmd);
                }
            }
        }
    };

    /**
     * Update a drawing from its details.
     * @param {Object} drawDetails Details of the drawing to update.
     */
    this.updateDraw = function (drawDetails)
    {
        // get the group
        var group = getDrawGroup(drawDetails.slice, drawDetails.frame, drawDetails.id);
        // shape
        var shapes = group.getChildren( isNodeNameShape );
        for (var i = 0; i < shapes.length; ++i ) {
            shapes[i].stroke(drawDetails.color);
        }
        // shape extra
        var shapesExtra = group.getChildren( isNodeNameShapeExtra );
        for (var j = 0; j < shapesExtra.length; ++j ) {
            if (typeof shapesExtra[j].stroke() !== "undefined") {
                shapesExtra[j].stroke(drawDetails.color);
            }
            else if (typeof shapesExtra[j].fill() !== "undefined") {
                shapesExtra[j].fill(drawDetails.color);
            }
        }
        // label
        var label = group.getChildren( isNodeNameLabel )[0];
        var text = label.getChildren()[0];
        text.fill(drawDetails.color);
        text.textExpr = drawDetails.label;
        text.longText = drawDetails.description;
        text.setText(dwv.utils.replaceFlags(text.textExpr, text.quant));

        // udpate current layer
        this.getCurrentDrawLayer().draw();
    };

    /**
     * Check the visibility of a given group.
     * @param {Object} drawDetails Details of the group to check.
     */
    this.isGroupVisible = function (drawDetails) {
        // get the group
        var group = getDrawGroup(drawDetails.slice, drawDetails.frame, drawDetails.id);
        // get visibility
        return group.isVisible();
    };

    /**
     * Toggle the visibility of a given group.
     * @param {Object} drawDetails Details of the group to update.
     */
    this.toogleGroupVisibility = function (drawDetails) {
        // get the group
        var group = getDrawGroup(drawDetails.slice, drawDetails.frame, drawDetails.id);
        // toggle visible
        group.visible(!group.isVisible());

        // udpate current layer
        this.getCurrentDrawLayer().draw();
    };

    /**
     * Delete all Draws from the stage.
     * @param {Object} cmdCallback The DeleteCommand callback.
     * @param {Object} exeCallback The callback to call once the DeleteCommand has been executed.
     */
    this.deleteDraws = function (cmdCallback, exeCallback) {
        var delcmd, layer, groups;
        for ( var k = 0, lenk = drawLayers.length; k < lenk; ++k ) {
            for ( var f = 0, lenf = drawLayers[k].length; f < lenf; ++f ) {
                layer = drawLayers[k][f];
                groups = layer.getChildren();
                while (groups.length) {
                    var shape = groups[0].getChildren( isNodeNameShape )[0];
                    delcmd = new dwv.tool.DeleteGroupCommand( groups[0],
                        dwv.tool.GetShapeDisplayName(shape), layer);
                    delcmd.onExecute = cmdCallback;
                    delcmd.onUndo = cmdCallback;
                    delcmd.execute();
                    exeCallback(delcmd);
                }
            }
        }
    };

    /**
     * Get a draw group.
     * @param {Number} slice The slice position.
     * @param {Number} frame The frame position.
     * @param {Number} id The group id.
     */
    function getDrawGroup(slice, frame, id) {
        var layer = drawLayers[slice][frame];
        //var collec = layer.getChildren()[drawDetails.id];
        var collec = layer.getChildren( function (node) {
            return node.id() === id;
        });

        var res = null;
        if (collec.length !== 0) {
            res = collec[0];
        }
        else {
            console.warn("Could not find draw group for slice='" +
                slice + "', frame='" + frame + "', id='" + id + "'.");
        }
        return res;
    }

    /**
     * Is an input node's name 'shape'.
     * @param {Object} node A Konva node.
     */
    function isNodeNameShape( node ) {
        return node.name() === "shape";
    }

    /**
     * Is a node an extra shape associated with a main one.
     * @param {Object} node A Konva node.
     */
    function isNodeNameShapeExtra( node ) {
        return node.name().startsWith("shape-");
    }

    /**
     * Is an input node's name 'label'.
     * @param {Object} node A Konva node.
     */
    function isNodeNameLabel( node ) {
        return node.name() === "label";
    }

}; // class dwv.DrawController
