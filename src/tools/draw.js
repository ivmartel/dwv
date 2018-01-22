// namespaces
var dwv = dwv || {};
/** @namespace */
dwv.tool = dwv.tool || {};
// external
var Konva = Konva || {};

/**
 * Drawing tool.
 *
 * This tool is responsible for the draw layer group structure. The layout is:
 *
 * drawLayer
 * |_ positionGroup: name="position-group", id="slice-#_frame-#""
 *    |_ shapeGroup: name="{shape name}-group", id="#"
 *       |_ shape: name="shape"
 *       |_ label: name="label"
 *       |_ extra: line tick, protractor arc...
 *
 * Discussion:
 * - posGroup > shapeGroup
 *    pro: slice/frame display: 1 loop
 *    cons: multi-slice shape splitted in positionGroups
 * - shapeGroup > posGroup
 *    pros: more logical
 *    cons: slice/frame display: 2 loops
 *
 * @constructor
 * @param {Object} app The associated application.
 * @external Konva
 */
dwv.tool.Draw = function (app, shapeFactoryList)
{
    /**
     * Closure to self: to be used by event handlers.
     * @private
     * @type WindowLevel
     */
    var self = this;
    /**
     * Draw GUI.
     * @type Object
     */
    var gui = null;
    /**
     * Interaction start flag.
     * @private
     * @type Boolean
     */
    var started = false;

    /**
     * Shape factory list
     * @type Object
     */
    this.shapeFactoryList = shapeFactoryList;
    /**
     * Draw command.
     * @private
     * @type Object
     */
    var command = null;
    /**
     * Current shape group.
     * @private
     * @type Object
     */
    var shapeGroup = null;

    /**
     * Shape name.
     * @type String
     */
    this.shapeName = 0;

    /**
     * List of points.
     * @private
     * @type Array
     */
    var points = [];

    /**
     * Last selected point.
     * @private
     * @type Object
     */
    var lastPoint = null;

    /**
     * Shape editor.
     * @private
     * @type Object
     */
    var shapeEditor = new dwv.tool.ShapeEditor(app);

    // associate the event listeners of the editor
    //  with those of the draw tool
    shapeEditor.setDrawEventCallback(fireEvent);

    /**
     * Trash draw: a cross.
     * @private
     * @type Object
     */
    var trash = new Konva.Group();

    // first line of the cross
    var trashLine1 = new Konva.Line({
        points: [-10, -10, 10, 10 ],
        stroke: 'red'
    });
    // second line of the cross
    var trashLine2 = new Konva.Line({
        points: [10, -10, -10, 10 ],
        stroke: 'red'
    });
    trash.add(trashLine1);
    trash.add(trashLine2);

    /**
     * Drawing style.
     * @type Style
     */
    this.style = new dwv.html.Style();

    /**
     * Event listeners.
     * @private
     */
    var listeners = {};

    /**
     * The associated draw layer.
     * @private
     * @type Object
     */
    var drawLayer = null;

    /**
     * Handle mouse down event.
     * @param {Object} event The mouse down event.
     */
    this.mousedown = function(event){
        // determine if the click happened in an existing shape
        var stage = app.getDrawStage();
        var kshape = stage.getIntersection({
            x: event._xs,
            y: event._ys
        });

        if ( kshape ) {
            var group = kshape.getParent();
            var selectedShape = group.find(".shape")[0];
            // reset editor if click on other shape
            // (and avoid anchors mouse down)
            if ( selectedShape && selectedShape !== shapeEditor.getShape() ) {
                shapeEditor.disable();
                shapeEditor.setShape(selectedShape);
                shapeEditor.setImage(app.getImage());
                shapeEditor.enable();
            }
        }
        else {
            // disable edition
            shapeEditor.disable();
            shapeEditor.setShape(null);
            shapeEditor.setImage(null);
            // start storing points
            started = true;
            // clear array
            points = [];
            // store point
            lastPoint = new dwv.math.Point2D(event._x, event._y);
            points.push(lastPoint);
        }
    };

    /**
     * Handle mouse move event.
     * @param {Object} event The mouse move event.
     */
    this.mousemove = function(event){
        if (!started)
        {
            return;
        }
        if ( Math.abs( event._x - lastPoint.getX() ) > 0 ||
                Math.abs( event._y - lastPoint.getY() ) > 0 )
        {
            // current point
            lastPoint = new dwv.math.Point2D(event._x, event._y);
            // clear last added point from the list (but not the first one)
            if ( points.length != 1 ) {
                points.pop();
            }
            // add current one to the list
            points.push( lastPoint );
            // allow for anchor points
            var factory = new self.shapeFactoryList[self.shapeName]();
            if( points.length < factory.getNPoints() ) {
                clearTimeout(this.timer);
                this.timer = setTimeout( function () {
                    points.push( lastPoint );
                }, factory.getTimeout() );
            }
            // remove previous draw
            if ( shapeGroup ) {
                shapeGroup.destroy();
            }
            // create shape group
            shapeGroup = factory.create(points, self.style, app.getImage());
            // do not listen during creation
            var shape = shapeGroup.getChildren( function (node) {
                return node.name() === 'shape';
            })[0];
            shape.listening(false);
            drawLayer.hitGraphEnabled(false);
            // draw shape
            drawLayer.add(shapeGroup);
            drawLayer.draw();
        }
    };

    /**
     * Get the current position draw group id.
     * @return {Number} The group id.
     */
    var getDrawCurrentPositionGroupId = function () {
        var currentSlice = app.getViewController().getCurrentPosition().k;
        var currentFrame = app.getViewController().getCurrentFrame();
        return dwv.getDrawPositionGroupId(currentSlice, currentFrame);
    };

    /**
     * Handle mouse up event.
     * @param {Object} event The mouse up event.
     */
    this.mouseup = function (/*event*/){
        if (started && points.length > 1 )
        {
            // reset shape group
            if ( shapeGroup ) {
                shapeGroup.destroy();
            }
            // create final shape
            var factory = new self.shapeFactoryList[self.shapeName]();
            var group = factory.create(points, self.style, app.getImage());
            group.id( dwv.math.guid() );
            dwv.ensurePositionGroup(app);

            // re-activate layer
            drawLayer.hitGraphEnabled(true);
            // draw shape command
            command = new dwv.tool.DrawGroupCommand(group, self.shapeName, drawLayer);
            command.onExecute = fireEvent;
            command.onUndo = fireEvent;
            // execute it
            command.execute();
            // save it in undo stack
            app.addToUndoStack(command);

            // activate shape listeners
            self.setShapeOn( group );
        }
        // reset flag
        started = false;
    };

    /**
     * Handle mouse out event.
     * @param {Object} event The mouse out event.
     */
    this.mouseout = function(event){
        self.mouseup(event);
    };

    /**
     * Handle touch start event.
     * @param {Object} event The touch start event.
     */
    this.touchstart = function(event){
        self.mousedown(event);
    };

    /**
     * Handle touch move event.
     * @param {Object} event The touch move event.
     */
    this.touchmove = function(event){
        self.mousemove(event);
    };

    /**
     * Handle touch end event.
     * @param {Object} event The touch end event.
     */
    this.touchend = function(event){
        self.mouseup(event);
    };

    /**
     * Handle key down event.
     * @param {Object} event The key down event.
     */
    this.keydown = function(event){
        app.onKeydown(event);
    };

    /**
     * Setup the tool GUI.
     */
    this.setup = function ()
    {
        gui = new dwv.gui.Draw(app);
        gui.setup(this.shapeFactoryList);
    };

    /**
     * Enable the tool.
     * @param {Boolean} flag The flag to enable or not.
     */
    this.display = function ( flag ){
        if ( gui ) {
            gui.display( flag );
        }
        // reset shape display properties
        shapeEditor.disable();
        shapeEditor.setShape(null);
        shapeEditor.setImage(null);
        document.body.style.cursor = 'default';
        // make layer listen or not to events
        app.getDrawStage().listening( flag );
        // get the current draw layer
        drawLayer = app.getCurrentDrawLayer();
        renderDrawLayer(flag);
        // listen to app change to update the draw layer
        if (flag) {
            app.addEventListener("slice-change", updateDrawLayer);
            app.addEventListener("frame-change", updateDrawLayer);
        }
        else {
            app.removeEventListener("slice-change", updateDrawLayer);
            app.removeEventListener("frame-change", updateDrawLayer);
        }
    };

    /**
     * Update the draw layer.
     */
    function updateDrawLayer() {
        // activate the draw layer
        renderDrawLayer(true);
    }

    /**
     * Render (or not) the draw layer.
     * @param {Boolean} visible Set the draw layer visible or not.
     */
    function renderDrawLayer(visible) {

        drawLayer.listening( visible );
        drawLayer.hitGraphEnabled( visible );

        // get shape groups at the current position
        var posGroupId = getDrawCurrentPositionGroupId();
        var shapeGroups = dwv.getDrawShapeGroupsAtPosition(posGroupId, drawLayer);

        // set shape display properties
        if ( visible ) {
            // activate tool listeners
            app.addToolCanvasListeners( app.getDrawStage().getContent() );
            // activate shape listeners
            shapeGroups.forEach( function (group) { self.setShapeOn( group ); });
        }
        else {
            // de-activate tool listeners
            app.removeToolCanvasListeners( app.getDrawStage().getContent() );
            // de-activate shape listeners
            shapeGroups.forEach( function (group) { setShapeOff( group ); });
        }
        // draw
        drawLayer.draw();
    }

    /**
     * Set shape off properties.
     * @param {Object} shape The shape to set off.
     */
    function setShapeOff( shape ) {
        // mouse styling
        shape.off('mouseover');
        shape.off('mouseout');
        // drag
        shape.draggable(false);
        shape.off('dragstart.draw');
        shape.off('dragmove.draw');
        shape.off('dragend.draw');
        shape.off('dblclick');
    }

    /**
     * Get the real position from an event.
     */
    function getRealPosition( index ) {
        var stage = app.getDrawStage();
        return { 'x': stage.offset().x + index.x / stage.scale().x,
            'y': stage.offset().y + index.y / stage.scale().y };
    }

    /**
     * Set shape on properties.
     * @param {Object} shape The shape to set on.
     */
    this.setShapeOn = function ( shape ) {
        // mouse over styling
        shape.on('mouseover', function () {
            document.body.style.cursor = 'pointer';
        });
        // mouse out styling
        shape.on('mouseout', function () {
            document.body.style.cursor = 'default';
        });

        // make it draggable
        shape.draggable(true);
        // cache drag start position
        var dragStartPos = {'x': shape.x(), 'y': shape.y()};

        // command name based on shape type
        var shapeDisplayName = dwv.tool.GetShapeDisplayName(shape);

        // shape node
        var isNodeNameShape = function( node ) {
            return node.name() === "shape";
        };
        var colour = null;

        // nodes that have the 'stroke' method
        var canNodeChangeColour = function( node ) {
            return node.name() !== "anchor" && node.name() !== "label";
        };

        // drag start event handling
        shape.on('dragstart.draw', function (/*event*/) {
            // store colour
            colour = shape.getChildren(isNodeNameShape)[0].stroke();
            // display trash
            var stage = app.getDrawStage();
            var scale = stage.scale();
            var invscale = {'x': 1/scale.x, 'y': 1/scale.y};
            trash.x( stage.offset().x + ( 256 / scale.x ) );
            trash.y( stage.offset().y + ( 20 / scale.y ) );
            trash.scale( invscale );
            drawLayer.add( trash );
            // deactivate anchors to avoid events on null shape
            shapeEditor.setAnchorsActive(false);
            // draw
            drawLayer.draw();
        });
        // drag move event handling
        shape.on('dragmove.draw', function (event) {
            // highlight trash when on it
            var offset = dwv.html.getEventOffset( event.evt )[0];
            var eventPos = getRealPosition( offset );
            if ( Math.abs( eventPos.x - trash.x() ) < 10 &&
                    Math.abs( eventPos.y - trash.y() ) < 10   ) {
                trash.getChildren().each( function (tshape){ tshape.stroke('orange'); });
                // change the group shapes colour
                shape.getChildren(canNodeChangeColour).forEach(
                    function (ashape) { ashape.stroke( 'red' ); });
            }
            else {
                trash.getChildren().each( function (tshape){ tshape.stroke('red'); });
                // reset the group shapes colour
                shape.getChildren(canNodeChangeColour).forEach(
                    function (ashape) { ashape.stroke( colour ); });
            }
            // draw
            drawLayer.draw();
        });
        // drag end event handling
        shape.on('dragend.draw', function (event) {
            var pos = {'x': this.x(), 'y': this.y()};
            // remove trash
            trash.remove();
            // delete case
            var offset = dwv.html.getEventOffset( event.evt )[0];
            var eventPos = getRealPosition( offset );
            if ( Math.abs( eventPos.x - trash.x() ) < 10 &&
                    Math.abs( eventPos.y - trash.y() ) < 10   ) {
                // compensate for the drag translation
                this.x( dragStartPos.x );
                this.y( dragStartPos.y );
                // disable editor
                shapeEditor.disable();
                shapeEditor.setShape(null);
                shapeEditor.setImage(null);
                // reset colour
                shape.getChildren(canNodeChangeColour).forEach(
                    function (ashape) { ashape.stroke( colour ); });
                // reset cursor
                document.body.style.cursor = 'default';
                // delete command
                var delcmd = new dwv.tool.DeleteGroupCommand(this,
                    shapeDisplayName, drawLayer);
                delcmd.onExecute = fireEvent;
                delcmd.onUndo = fireEvent;
                delcmd.execute();
                app.addToUndoStack(delcmd);
            }
            else {
                // save drag move
                var translation = {'x': pos.x - dragStartPos.x,
                        'y': pos.y - dragStartPos.y};
                if ( translation.x !== 0 || translation.y !== 0 ) {
                    var mvcmd = new dwv.tool.MoveGroupCommand(this,
                        shapeDisplayName, translation, drawLayer);
                    mvcmd.onExecute = fireEvent;
                    mvcmd.onUndo = fireEvent;
                    app.addToUndoStack(mvcmd);

                    // the move is handled by Konva, trigger an event manually
                    fireEvent({'type': 'draw-move'});
                }
                // reset anchors
                shapeEditor.setAnchorsActive(true);
                shapeEditor.resetAnchors();
            }
            // draw
            drawLayer.draw();
            // reset start position
            dragStartPos = {'x': this.x(), 'y': this.y()};
        });
        // double click handling: update label
        shape.on('dblclick', function () {

            // get the label object for this shape
            var group = this.getParent();
            var labels = group.find('Label');
            // should just be one
            if (labels.length !== 1) {
                throw new Error("Could not find the shape label.");
            }
            var ktext = labels[0].getText();

            // ask user for new label
            var labelText = dwv.gui.prompt("Shape label", ktext.textExpr);

            // if press cancel do nothing
            if (labelText === null) {
                return;
            }
            else if (labelText === ktext.textExpr) {
                return;
            }
            // update text expression and set text
            ktext.textExpr = labelText;
            ktext.setText(dwv.utils.replaceFlags(ktext.textExpr, ktext.quant));

            // trigger event
            fireEvent({'type': 'draw-change'});

            // draw
            drawLayer.draw();
        });
    };

    /**
     * Initialise the tool.
     */
    this.init = function() {
        // set the default to the first in the list
        var shapeName = 0;
        for( var key in this.shapeFactoryList ){
            shapeName = key;
            break;
        }
        this.setShapeName(shapeName);
        // init gui
        if ( gui ) {
            // init with the app window scale
            this.style.setScale(app.getWindowScale());
            // same for colour
            this.setLineColour(this.style.getLineColour());
            // init html
            gui.initialise();
        }
        return true;
    };

    /**
     * Add an event listener on the app.
     * @param {String} type The event type.
     * @param {Object} listener The method associated with the provided event type.
     */
    this.addEventListener = function (type, listener)
    {
        if ( typeof listeners[type] === "undefined" ) {
            listeners[type] = [];
        }
        listeners[type].push(listener);
    };

    /**
     * Remove an event listener from the app.
     * @param {String} type The event type.
     * @param {Object} listener The method associated with the provided event type.
     */
    this.removeEventListener = function (type, listener)
    {
        if( typeof listeners[type] === "undefined" ) {
            return;
        }
        for ( var i = 0; i < listeners[type].length; ++i )
        {
            if ( listeners[type][i] === listener ) {
                listeners[type].splice(i,1);
            }
        }
    };

    /**
     * Set the line colour of the drawing.
     * @param {String} colour The colour to set.
     */
    this.setLineColour = function (colour)
    {
        this.style.setLineColour(colour);
    };

    // Private Methods -----------------------------------------------------------

    /**
     * Fire an event: call all associated listeners.
     * @param {Object} event The event to fire.
     */
    function fireEvent (event)
    {
        if ( typeof listeners[event.type] === "undefined" ) {
            return;
        }
        for ( var i=0; i < listeners[event.type].length; ++i )
        {
            listeners[event.type][i](event);
        }
    }

}; // Draw class

/**
 * Help for this tool.
 * @return {Object} The help content.
 */
dwv.tool.Draw.prototype.getHelp = function()
{
    return {
        "title": dwv.i18n("tool.Draw.name"),
        "brief": dwv.i18n("tool.Draw.brief"),
        "mouse": {
            "mouse_drag": dwv.i18n("tool.Draw.mouse_drag")
        },
        "touch": {
            "touch_drag": dwv.i18n("tool.Draw.touch_drag")
        }
    };
};

/**
 * Set the shape name of the drawing.
 * @param {String} name The name of the shape.
 */
dwv.tool.Draw.prototype.setShapeName = function(name)
{
    // check if we have it
    if( !this.hasShape(name) )
    {
        throw new Error("Unknown shape: '" + name + "'");
    }
    this.shapeName = name;
};

/**
 * Check if the shape is in the shape list.
 * @param {String} name The name of the shape.
 */
dwv.tool.Draw.prototype.hasShape = function(name) {
    return this.shapeFactoryList[name];
};
