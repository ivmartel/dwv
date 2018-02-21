// namespaces
var dwv = dwv || {};
// external
var Konva = Konva || {};

/**
 * Get the draw group id for a given position.
 * @return {Number} The group id.
 */
dwv.getDrawPositionGroupId = function (sliceNumber, frameNumber) {
    return "slice-"+sliceNumber+"_frame-"+frameNumber;
};

/**
 * Get the slice and frame position from a group id.
 * @param {String} groupId The group id.
 * @return {Object} The slice and frame number.
 */
dwv.getPositionFromGroupId = function (groupId) {
    var sepIndex = groupId.indexOf("_");
    if (sepIndex === -1) {
        console.warn("Badly formed PositionGroupId: "+groupId);
    }
    return { 'sliceNumber': groupId.substring(6, sepIndex),
        'frameNumber': groupId.substring(sepIndex + 7) };
};

/**
 * Debug function to output the layer hierarchy as text.
 * @param {Object} layer The Konva layer.
 * @param {String} prefix A display prefix (used in recursion).
 * @return {String} A text representation of the hierarchy.
 */
dwv.getHierarchyLog = function (layer, prefix) {
    if ( typeof prefix === "undefined" ) {
        prefix = "";
    }
    var kids = layer.getChildren();
    var log = prefix + "|__ " + layer.name() + ": " + layer.id() + "\n";
    for ( var i = 0; i < kids.length; ++i ) {
        log += dwv.getHierarchyLog( kids[i], prefix + "    ");
    }
    return log;
};

/**
 * Draw controller.
 * @constructor
 * @param {Object} drawDiv The HTML div used to store the drawings.
 * @external Konva
 */
dwv.DrawController = function (drawDiv)
{

    // Draw stage
    var drawStage = null;
    // Draw layer
    var drawLayer;

    // current position group id
    var currentPosGroupId = null;

    /**
     * Get the current position group id.
     * @return {String} The id.
     */
    this.getCurrentPosGroupId = function () {
        return currentPosGroupId;
    };

    /**
     * Get the current position group.
     * @return {Object} The Konva.Group.
     */
    this.getCurrentPosGroup = function () {
        // get position groups
        var posGroups = drawLayer.getChildren( function (node) {
            return node.id() === currentPosGroupId;
        });
        // if one group, use it
        // if no group, create one
        var posGroup = null;
        if ( posGroups.length === 1 ) {
            posGroup = posGroups[0];
        } else if ( posGroups.length === 0 ) {
            posGroup = new Konva.Group();
            posGroup.name("position-group");
            posGroup.id(currentPosGroupId);
            posGroup.visible(true); // dont inherit
            // add new group to layer
            drawLayer.add(posGroup);
        } else {
            console.warn("Unexpected number of draw position groups.");
        }
        // return
        return posGroup;
    };

    /**
     * Create the controller: sets up the draw stage.
     * @param {Number} width The width of the stage.
     * @param {Number} height The height of the stage.
     */
    this.create = function (width, height) {
        // create stage
        drawStage = new Konva.Stage({
            'container': drawDiv,
            'width': width,
            'height': height,
            'listening': false
        });
        // reset style
        // (avoids a not needed vertical scrollbar)
        drawStage.getContent().setAttribute("style", "");

        drawLayer = new Konva.Layer({
            'listening': false,
            'hitGraphEnabled': false,
            'visible': true
        });
        drawStage.add(drawLayer);
    };

    /**
     * Get the current draw layer.
     * @return {Object} The draw layer.
     */
    this.getCurrentDrawLayer = function () {
        return drawLayer;
    };

    /**
     * Reset: clear the layers array.
     */
    this.reset = function () {
        drawLayer = null;
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
        // set current position
        var currentSlice = viewController.getCurrentPosition().k;
        var currentFrame = viewController.getCurrentFrame();
        // get and store the position group id
        currentPosGroupId = dwv.getDrawPositionGroupId(currentSlice,currentFrame);

        // get all position groups
        var posGroups = drawLayer.getChildren( isPositionNode );
        // reset or set the visible property
        var visible;
        for ( var i = 0, leni = posGroups.length; i < leni; ++i ) {
            visible = false;
            if ( posGroups[i].id() === currentPosGroupId ) {
                visible = true;
            }
            // group members inherit the visible property
            posGroups[i].visible(visible);
        }

        // show current draw layer
        drawLayer.draw();
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
     * Get a list of drawing display details.
     * @return {Object} A list of draw details including id, slice, frame...
     */
    this.getDrawDisplayDetails = function ()
    {
        var list = [];
        var groups = drawLayer.getChildren();
        for ( var j = 0, lenj = groups.length; j < lenj; ++j ) {
            var position = dwv.getPositionFromGroupId(groups[j].id());
            var collec = groups[j].getChildren();
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
                    "slice": position.sliceNumber,
                    "frame": position.frameNumber,
                    "type": type,
                    "color": shape.stroke(),
                    "label": text.textExpr,
                    "description": text.longText
                });
            }
        }
        return list;
    };

    /**
     * Get all the draws of the stage.
     */
    this.getDraws = function ()
    {
        return drawLayer;
    };

    /**
     * Get a list of drawing store details.
     * @return {Object} A list of draw details including id, text, quant...
     * TODO Unify with getDrawDisplayDetails?
     */
    this.getDrawStoreDetails = function ()
    {
        var drawingsDetails = {};

        // get all position groups
        var posGroups = drawLayer.getChildren( isPositionNode );

        var posKids;
        var group;
        for ( var i = 0, leni = posGroups.length; i < leni; ++i ) {
            posKids = posGroups[i].getChildren();
            for ( var j = 0, lenj = posKids.length; j < lenj; ++j ) {
                group = posKids[j];
                // remove anchors
                var anchors = group.find(".anchor");
                for ( var a = 0; a < anchors.length; ++a ) {
                    anchors[a].remove();
                }
                // get text
                var texts = group.find(".text");
                if ( texts.length !== 1 ) {
                    console.warn("There should not be more than one text per shape.");
                }
                // get details (non konva vars)
                drawingsDetails[ group.id() ] = {
                    "textExpr": encodeURIComponent(texts[0].textExpr),
                    "longText": encodeURIComponent(texts[0].longText),
                    "quant": texts[0].quant
                };
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
        // regular Konva deserialize
        var stateLayer = Konva.Node.create(drawings);

        // get all position groups
        var statePosGroups = stateLayer.getChildren( isPositionNode );

        for ( var i = 0, leni = statePosGroups.length; i < leni; ++i ) {
            var statePosGroup = statePosGroups[i];

            // Get or create position-group if it does not exist and append it to drawLayer
            var posGroup = drawLayer.getChildren( isNodeWithId( statePosGroup.id() ) )[0];
            if( typeof posGroup === "undefined" ) {
                posGroup = new Konva.Group({
                    'id': statePosGroup.id(),
                    'name': "position-group",
                    'visible': false
                });
                drawLayer.add(posGroup);
            }

            var statePosKids = statePosGroup.getChildren();
            for ( var j = 0, lenj = statePosKids.length; j < lenj; ++j ) {
                // shape group
                var stateGroup = statePosKids[j];
                // add group to posGroup (switches its parent)
                posGroup.add( stateGroup );
                // shape
                var shape = stateGroup.getChildren( isNodeNameShape )[0];
                // create the draw command
                var cmd = new dwv.tool.DrawGroupCommand(
                    stateGroup, shape.className,
                    drawLayer );
                // draw command callbacks
                cmd.onExecute = cmdCallback;
                cmd.onUndo = cmdCallback;
                // details
                if (drawingsDetails) {
                    var details = drawingsDetails[ stateGroup.id() ];
                    var label = stateGroup.getChildren( isNodeNameLabel )[0];
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
    };

    /**
     * Update a drawing from its details.
     * @param {Object} drawDetails Details of the drawing to update.
     */
    this.updateDraw = function (drawDetails)
    {
        // get the group
        var group = drawLayer.findOne( "#"+drawDetails.id );
        if ( typeof group === "undefined" ) {
            console.warn("[updateDraw] Cannot find group with id: "+drawDetails.id);
            return;
        }
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
        var group = drawLayer.findOne( "#"+drawDetails.id );
        if ( typeof group === "undefined" ) {
            console.warn("[isGroupVisible] Cannot find node with id: "+drawDetails.id);
            return false;
        }
        // get visibility
        return group.isVisible();
    };

    /**
     * Toggle the visibility of a given group.
     * @param {Object} drawDetails Details of the group to update.
     */
    this.toogleGroupVisibility = function (drawDetails) {
        // get the group
        var group = drawLayer.findOne( "#"+drawDetails.id );
        if ( typeof group === "undefined" ) {
            console.warn("[toogleGroupVisibility] Cannot find node with id: "+drawDetails.id);
            return false;
        }
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
        var delcmd;
        var groups = drawLayer.getChildren();
        while (groups.length) {
            var shape = groups[0].getChildren( isNodeNameShape )[0];
            delcmd = new dwv.tool.DeleteGroupCommand( groups[0],
                dwv.tool.GetShapeDisplayName(shape), drawLayer);
            delcmd.onExecute = cmdCallback;
            delcmd.onUndo = cmdCallback;
            delcmd.execute();
            exeCallback(delcmd);
        }
    };

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

    /**
     * Is an input node a position node.
     * @param {Object} node A Konva node.
     */
    function isPositionNode( node ) {
        return node.name() === 'position-group';
    }

    /**
     * Get a lambda to check a node's id.
     * @param {String} id The id to check.
     * @return A function to check a node's id.
     */
    function isNodeWithId( id ) {
        return function (node) {
            return node.id() === id;
        };
    }



}; // class dwv.DrawController
