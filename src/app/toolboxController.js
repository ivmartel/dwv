// namespaces
var dwv = dwv || {};

/**
 * Toolbox controller.
 * @constructor
 */
dwv.ToolboxController = function ()
{
    // internal toolbox
    var toolbox = null;
    // point converter function
    var displayToIndexConverter = null;

    /**
     * Create the internal toolbox.
     * @param {Array} toolList The list of tools instances.
     * @param {Object} app The associated app.
     */
    this.create = function (toolList, app) {
        toolbox = new dwv.tool.Toolbox(toolList, app);
    };

    /**
     * Setup the internal toolbox.
     */
    this.setup = function () {
        toolbox.setup();
    };

    /**
     * Reset the internal toolbox.
     */
    this.reset = function () {
        toolbox.reset();
    };

    /**
     * Initialise and display the internal toolbox.
     */
    this.initAndDisplay = function (layer) {
        // initialise
        toolbox.init();
        // display
        toolbox.display(true);
        // TODO Would prefer to have this done in the addLayerListeners
        displayToIndexConverter = layer.displayToIndex;
        // add layer listeners
        this.addCanvasListeners(layer.getCanvas());
        // keydown listener
        window.addEventListener("keydown", onMouch, true);
    };

    /**
     * Get the tool list.
     */
    this.getToolList = function () {
        return toolbox.getToolList();
    };

    /**
     * Get the selected tool event handler.
     * @param {String} eventType The event type, for example mousedown, touchstart...
     */
    this.getSelectedToolEventHandler = function (eventType)
    {
        return toolbox.getSelectedTool()[eventType];
    };

    /**
     * Set the selected tool.
     * @param {String} name The name of the tool.
     */
    this.setSelectedTool = function (name)
    {
        toolbox.setSelectedTool(name);
    };

    /**
     * Set the selected shape.
     * @param {String} name The name of the shape.
     */
    this.setSelectedShape = function (name)
    {
        toolbox.getSelectedTool().setShapeName(name);
    };

    /**
     * Set the selected filter.
     * @param {String} name The name of the filter.
     */
    this.setSelectedFilter = function (name)
    {
        toolbox.getSelectedTool().setSelectedFilter(name);
    };

    /**
     * Run the selected filter.
     */
    this.runSelectedFilter = function ()
    {
        toolbox.getSelectedTool().getSelectedFilter().run();
    };

    /**
     * Set the tool line colour.
     * @param {String} colour The colour.
     */
    this.setLineColour = function (colour)
    {
        toolbox.getSelectedTool().setLineColour(colour);
    };

    /**
     * Set the tool range.
     * @param {Object} range The new range of the data.
     */
    this.setRange = function (range)
    {
        // seems like jquery is checking if the method exists before it
        // is used...
        if ( toolbox && toolbox.getSelectedTool() &&
                toolbox.getSelectedTool().getSelectedFilter() ) {
            toolbox.getSelectedTool().getSelectedFilter().run(range);
        }
    };

    /**
     * Add canvas mouse and touch listeners.
     * @param {Object} canvas The canvas to listen to.
     */
    this.addCanvasListeners = function (canvas)
    {
        // allow pointer events
        canvas.setAttribute("style", "pointer-events: auto;");
        // mouse listeners
        canvas.addEventListener("mousedown", onMouch);
        canvas.addEventListener("mousemove", onMouch);
        canvas.addEventListener("mouseup", onMouch);
        canvas.addEventListener("mouseout", onMouch);
        canvas.addEventListener("mousewheel", onMouch);
        canvas.addEventListener("DOMMouseScroll", onMouch);
        canvas.addEventListener("dblclick", onMouch);
        // touch listeners
        canvas.addEventListener("touchstart", onMouch);
        canvas.addEventListener("touchmove", onMouch);
        canvas.addEventListener("touchend", onMouch);
    };

    /**
     * Remove canvas mouse and touch listeners.
     * @param {Object} canvas The canvas to stop listening to.
     */
    this.removeCanvasListeners = function (canvas)
    {
        // disable pointer events
        canvas.setAttribute("style", "pointer-events: none;");
        // mouse listeners
        canvas.removeEventListener("mousedown", onMouch);
        canvas.removeEventListener("mousemove", onMouch);
        canvas.removeEventListener("mouseup", onMouch);
        canvas.removeEventListener("mouseout", onMouch);
        canvas.removeEventListener("mousewheel", onMouch);
        canvas.removeEventListener("DOMMouseScroll", onMouch);
        canvas.removeEventListener("dblclick", onMouch);
        // touch listeners
        canvas.removeEventListener("touchstart", onMouch);
        canvas.removeEventListener("touchmove", onMouch);
        canvas.removeEventListener("touchend", onMouch);
    };

    /**
     * Mou(se) and (T)ouch event handler. This function just determines the mouse/touch
     * position relative to the canvas element. It then passes it to the current tool.
     * @private
     * @param {Object} event The event to handle.
     */
    function onMouch(event)
    {
        // flag not to get confused between touch and mouse
        var handled = false;
        // Store the event position relative to the image canvas
        // in an extra member of the event:
        // event._x and event._y.
        var offsets = null;
        var position = null;
        if ( event.type === "touchstart" ||
            event.type === "touchmove")
        {
            // event offset(s)
            offsets = dwv.html.getEventOffset(event);
            // should have at least one offset
            event._xs = offsets[0].x;
            event._ys = offsets[0].y;
            position = displayToIndexConverter( offsets[0] );
            event._x = parseInt( position.x, 10 );
            event._y = parseInt( position.y, 10 );
            // possible second
            if ( offsets.length === 2 ) {
                event._x1s = offsets[1].x;
                event._y1s = offsets[1].y;
                position = displayToIndexConverter( offsets[1] );
                event._x1 = parseInt( position.x, 10 );
                event._y1 = parseInt( position.y, 10 );
            }
            // set handle event flag
            handled = true;
        }
        else if ( event.type === "mousemove" ||
            event.type === "mousedown" ||
            event.type === "mouseup" ||
            event.type === "mouseout" ||
            event.type === "mousewheel" ||
            event.type === "dblclick" ||
            event.type === "DOMMouseScroll" )
        {
            offsets = dwv.html.getEventOffset(event);
            event._xs = offsets[0].x;
            event._ys = offsets[0].y;
            position = displayToIndexConverter( offsets[0] );
            event._x = parseInt( position.x, 10 );
            event._y = parseInt( position.y, 10 );
            // set handle event flag
            handled = true;
        }
        else if ( event.type === "keydown" ||
                event.type === "touchend")
        {
            handled = true;
        }

        // Call the event handler of the curently selected tool.
        if ( handled )
        {
            if ( event.type !== "keydown" ) {
                event.preventDefault();
            }

            var tool =toolbox.getSelectedTool();
            if (tool){
                var func = tool[event.type];
                if ( func )
                {
                    func(event);
                }
            }
            // var func = toolbox.getSelectedTool()[event.type];
            // if ( func )
            // {
            //     func(event);
            // }
        }
    }

}; // class dwv.ToolboxController
