// namespaces
var dwv = dwv || {};

/**
 * Toolbox controller.
 * @param {Array} toolList The list of tool objects.
 * @constructor
 */
dwv.ToolboxController = function (toolList)
{
    /**
     * Point converter function
     * @private
     */
    var displayToIndexConverter = null;

    /**
     * Selected tool.
     * @type Object
     * @private
     */
    var selectedTool = null;

    /**
     * Initialise.
     */
    this.init = function (layer) {
        for( var key in toolList ) {
            toolList[key].init();
        }
        // TODO Would prefer to have this done in the addLayerListeners
        displayToIndexConverter = layer.displayToIndex;
        // add layer listeners
        this.addCanvasListeners(layer.getCanvas());
        // keydown listener
        window.addEventListener("keydown", onMouch, true);
    };

    /**
     * Get the tool list.
     * @return {Array} The list of tool objects.
     */
    this.getToolList = function () {
        return toolList;
    };

    /**
     * Check if a tool is in the tool list.
     * @param {String} name The name to check.
     * @return {String} The tool list element for the given name.
     */
    this.hasTool = function (name) {
        return this.getToolList()[name];
    };

    /**
     * Get the selected tool.
     * @return {Object} The selected tool.
     */
    this.getSelectedTool = function () {
        return selectedTool;
    };

    /**
     * Get the selected tool event handler.
     * @param {String} eventType The event type, for example mousedown, touchstart...
     */
    this.getSelectedToolEventHandler = function (eventType)
    {
        return this.getSelectedTool()[eventType];
    };

    /**
     * Set the selected tool.
     * @param {String} name The name of the tool.
     */
    this.setSelectedTool = function (name)
    {
        // check if we have it
        if (!this.hasTool(name)) {
            throw new Error("Unknown tool: '" + name + "'");
        }
        // de-activate previous
        if (selectedTool) {
            selectedTool.activate(false);
        }
        // set internal var
        selectedTool = toolList[name];
        // activate new tool
        selectedTool.activate(true);
    };

    /**
     * Set the selected shape.
     * @param {String} name The name of the shape.
     */
    this.setSelectedShape = function (name)
    {
        this.getSelectedTool().setShapeName(name);
    };

    /**
     * Set the selected filter.
     * @param {String} name The name of the filter.
     */
    this.setSelectedFilter = function (name)
    {
        this.getSelectedTool().setSelectedFilter(name);
    };

    /**
     * Run the selected filter.
     */
    this.runSelectedFilter = function ()
    {
        this.getSelectedTool().getSelectedFilter().run();
    };

    /**
     * Set the tool line colour.
     * @param {String} colour The colour.
     */
    this.setLineColour = function (colour)
    {
        this.getSelectedTool().setLineColour(colour);
    };

    /**
     * Set the tool range.
     * @param {Object} range The new range of the data.
     */
    this.setRange = function (range)
    {
        // seems like jquery is checking if the method exists before it
        // is used...
        if ( this.getSelectedTool() &&
                this.getSelectedTool().getSelectedFilter() ) {
            this.getSelectedTool().getSelectedFilter().run(range);
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
     * @param {Object} event The event to handle.
     * @private
     */
    function onMouch(event)
    {
        // make sure we have a tool
        if (!selectedTool) {
            return;
        }

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
            var func = selectedTool[event.type];
            if ( func )
            {
                func(event);
            }
        }
    }

}; // class dwv.ToolboxController
