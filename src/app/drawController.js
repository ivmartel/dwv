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
 * Get the current position-group. Create it if not exist.
 * @param {Object} app DWV app
 * @return {Object} The current position-group.
 */
dwv.ensurePositionGroup = function(app){
    var currentGroup = app.getCurrentDrawGroup(true);
    if (typeof currentGroup !== 'object') {
        var newGroup = new Konva.Group({
            id: currentGroup,
            name: "position-group",
            visible: true
        });
        app.getCurrentDrawLayer().add(newGroup);
        app.getCurrentDrawLayer().getChildren().sort(function(a, b){
            var aPos = dwv.getPositionFromGroupId(a.id());
            var bPos = dwv.getPositionFromGroupId(b.id());
            if(aPos.sliceNumber != bPos.sliceNumber){
                return aPos.sliceNumber - bPos.sliceNumber;
            }
            return aPos.frameNumber - bPos.frameNumber;
        });
        return newGroup;
    }
    return currentGroup;
};

/**
 * Get slice and the frame of a position-group.
 * @param {String} groupId The position-group id.
 * @return {Object} { 'sliceNumber': Number, 'frameNumber': Number }
 */

dwv.getPositionFromGroupId = function (groupId) {
    var sepIndex = groupId.indexOf("_");
    if (sepIndex === -1) {
        console.warn("Badly formed PositionGroupId: "+groupId);
    }
    return {
        'sliceNumber': Number(groupId.substring(6, sepIndex)),
        'frameNumber': Number(groupId.substring(sepIndex + 7))
    };
};

/**
 * Get the collection of shape groups for a given position id.
 * @param {String} positionGroupId The position group id.
 * @param {Object} drawLayer The Konva.Layer ot search.
 * @return {Object} A Konva.Collection of shapes.
 */
dwv.getDrawShapeGroupsAtPosition = function (positionGroupId, drawLayer) {
    var posGroups = drawLayer.getChildren( function (node) {
        return node.id() === positionGroupId;
    });
    // if one group, use it
    // if more than one group, send warning
    var shapeGroups = [];
    if ( posGroups.length === 1 ) {
        shapeGroups = posGroups[0].getChildren();
    } else if ( posGroups.length !== 0 ) {
        console.warn("More than one position group found: "+posGroups.length, posGroups);
    }
    return shapeGroups;
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
    // Draw layers: 2 dimension array: [slice][frame]
    var drawLayers = [];

    var drawLayer;


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
     * Get the draw layer.
     * @return {Object} The draw layer.
     */
    this.getDrawLayer = function () {
        return drawLayer;
    };

    /**
     * Get the current draw layer.
     * @return {Object} The draw layer.
     * @deprecated There is only one layer so getDrawLayer is enought
     */
    this.getCurrentDrawLayer = this.getDrawLayer;

    /**
     * Reset: clear the layers array.
     */
    this.reset = function () {
        drawLayers = [];
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
        currentSlice = viewController.getCurrentPosition().k;
        currentFrame = viewController.getCurrentFrame();

        // get all position groups
        var posGroups = drawLayer.getChildren( isPositionNode );

        var visible;
        var posGroupId = dwv.getDrawPositionGroupId(currentSlice,currentFrame);
        for ( var i = 0, leni = posGroups.length; i < leni; ++i ) {
            visible = false;
            if ( posGroups[i].id() === posGroupId ) {
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
     * @return {Object} A list of konva position-groups elements
     * @todo Return list of draws
     */
    this.getDraws = function ()
    {
        // return drawLayer;
    };

    /**
     * Get a list of drawing store details.
     * @return {Object} A list of draw details including id, text, quant...
     * TODO Unify with getDrawDisplayDetails?
     */
    this.getDrawStoreDetails = function (customLayer)
    {
        var drawingsDetails = {};
        var layer = customLayer || drawLayer;

        // get all position groups
        var posGroups = layer.getChildren( isPositionNode );

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
                    "textExpr": (texts[0].textExpr),
                    "longText": (texts[0].longText),
                    "quant": texts[0].quant
                };
            }
        }
        return drawingsDetails;
    };


    /**
     * Set the drawings on the current stage for V03(groups version).
     * @param {Array} drawings An array of drawings.
     * @param {Array} drawingsDetails An array of drawings details.
     * @param {Object} cmdCallback The DrawCommand callback.
     * @param {Object} exeCallback The callback to call once the DrawCommand has been executed.
     */
    this.setDrawings = function (groupDrawings, groupDetails, cmdCallback, exeCallback)
    {
        // Auxiliar variables
        var group, shape, groupShapes, parentGroup, groupDrawing, groupDrawingId, groupDetail, label, text;

        // Avoid errors when dropping multiple state.json
        drawLayer.getChildren().each(function(node){
            node.visible(false);
        });

        groupDrawings = (typeof groupDrawings === 'string' ? JSON.parse(groupDrawings) : groupDrawings).children;

        // Iterate over each position-groups
        for ( var k = 0, lenk = groupDrawings.length; k < lenk; ++k ) {

            // Get the position-group data
            groupDrawing = groupDrawings[k];
            groupDrawingId = groupDrawings[k].attrs.id;

            // Get or create position-group if it does not exist and append it to drawLayer
            parentGroup = getDrawGroup(groupDrawingId);
            if(!parentGroup){
                parentGroup = new Konva.Group({
                    id: groupDrawingId,
                    name: "position-group",
                    visible: false
                });
            }
            drawLayer.add(parentGroup);

            // Get all the shapes-groups in the position-group
            groupShapes = typeof groupDrawing.children === 'string' ?
            JSON.parse(groupDrawing.children) : groupDrawing.children;

            // Iterate over shapes-group of the position-group
            for( var g = 0, glen = groupShapes.length; g < glen; ++g){
                // create the konva group
                group = Konva.Node.create(groupShapes[g]);
                shape = group.getChildren( isNodeNameShape )[0];
                parentGroup.add(group);

                // create the draw command
                var cmd = new dwv.tool.DrawGroupCommand( group, shape.className, drawLayer );
                // draw command callbacks
                cmd.onExecute = cmdCallback;
                cmd.onUndo = cmdCallback;
                // Add group detail if exist
                if(groupDetails){
                    // Get the drawings detail of this shapes group
                    groupDetail = groupDetails[group.id()];
                    label = group.getChildren( isNodeNameLabel )[0];

                    text = label.getText();
                    // store details
                    text.textExpr = groupDetail.textExpr;
                    text.longText = groupDetail.longText;
                    text.quant = groupDetail.quant;
                    // reset text (it was not encoded)
                    text.setText(dwv.utils.replaceFlags(text.textExpr, text.quant));
                }
                // execute
                cmd.execute();
                exeCallback(cmd);
            }
        }
        // console.log(drawLayer);
    };

    /**
     * Update a drawing from its details.
     * @param {Object} drawDetails Details of the drawing to update.
     */
    this.updateDraw = function (drawDetails)
    {
        // get the group
        var group = getDrawGroup(drawDetails.id);
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
        var group = getDrawGroup(drawDetails.id);
        // get visibility
        return (group ? group.isVisible() : false );
    };

    /**
     * Toggle the visibility of a given group.
     * @param {Object} drawDetails Details of the group to update.
     */
    this.toogleGroupVisibility = function (drawDetails) {
        // get the group
        var group = getDrawGroup(drawDetails.id);
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
     * @param {Number} id The group id.
     */
    function getDrawGroup( id ) {
        var collec = drawLayer.find("#"+id);
        var res = null;
        if (collec.length !== 0) {
            res = collec[0];
        } else {
            console.warn("Could not find draw group for id='" + id + "'.");
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

    /**
     * Is an input node a position node.
     * @param {Object} node A Konva node.
     */
    function isPositionNode( node ) {
        return node.name() === 'position-group';
    }

}; // class dwv.DrawController
