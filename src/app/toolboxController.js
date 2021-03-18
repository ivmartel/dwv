// namespaces
var dwv = dwv || {};

/**
 * Toolbox controller.
 *
 * @param {Array} toolList The list of tool objects.
 * @class
 */
dwv.ToolboxController = function (toolList) {
  /**
   * Point converter function
   *
   * @private
   */
  var displayToIndexConverter = null;

  /**
   * Selected tool.
   *
   * @type {object}
   * @private
   */
  var selectedTool = null;

  /**
   * Initialise.
   *
   * @param {object} layer The associated layer.
   */
  this.init = function (layer) {
    for (var key in toolList) {
      toolList[key].init();
    }
    // TODO Would prefer to have this done in the addLayerListeners
    displayToIndexConverter = layer.displayToIndex;
    // keydown listener
    window.addEventListener('keydown', onMouch, true);
  };

  /**
   * Get the tool list.
   *
   * @returns {Array} The list of tool objects.
   */
  this.getToolList = function () {
    return toolList;
  };

  /**
   * Check if a tool is in the tool list.
   *
   * @param {string} name The name to check.
   * @returns {string} The tool list element for the given name.
   */
  this.hasTool = function (name) {
    return typeof this.getToolList()[name] !== 'undefined';
  };

  /**
   * Get the selected tool.
   *
   * @returns {object} The selected tool.
   */
  this.getSelectedTool = function () {
    return selectedTool;
  };

  /**
   * Get the selected tool event handler.
   *
   * @param {string} eventType The event type, for example
   *   mousedown, touchstart...
   * @returns {Function} The event handler.
   */
  this.getSelectedToolEventHandler = function (eventType) {
    return this.getSelectedTool()[eventType];
  };

  /**
   * Set the selected tool.
   *
   * @param {string} name The name of the tool.
   */
  this.setSelectedTool = function (name) {
    // check if we have it
    if (!this.hasTool(name)) {
      throw new Error('Unknown tool: \'' + name + '\'');
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
   *
   * @param {string} name The name of the shape.
   */
  this.setSelectedShape = function (name) {
    this.getSelectedTool().setShapeName(name);
  };

  /**
   * Set the selected filter.
   *
   * @param {string} name The name of the filter.
   */
  this.setSelectedFilter = function (name) {
    this.getSelectedTool().setSelectedFilter(name);
  };

  /**
   * Run the selected filter.
   */
  this.runSelectedFilter = function () {
    this.getSelectedTool().getSelectedFilter().run();
  };

  /**
   * Set the tool line colour.
   *
   * @param {string} colour The colour.
   */
  this.setLineColour = function (colour) {
    this.getSelectedTool().setLineColour(colour);
  };

  /**
   * Set the tool range.
   *
   * @param {object} range The new range of the data.
   */
  this.setRange = function (range) {
    // seems like jquery is checking if the method exists before it
    // is used...
    if (this.getSelectedTool() &&
      this.getSelectedTool().getSelectedFilter()) {
      this.getSelectedTool().getSelectedFilter().run(range);
    }
  };

  /**
   * Listen to layer interaction events.
   *
   * @param {object} layer The layer to listen to.
   */
  this.attachLayer = function (layer) {
    layer.activate();
    // interaction events
    var names = dwv.gui.interactionEventNames;
    for (var i = 0; i < names.length; ++i) {
      layer.addEventListener(names[i], onMouch);
    }
  };

  /**
   * Remove canvas mouse and touch listeners.
   *
   * @param {object} layer The layer to stop listening to.
   */
  this.detachLayer = function (layer) {
    layer.deactivate();
    // interaction events
    var names = dwv.gui.interactionEventNames;
    for (var i = 0; i < names.length; ++i) {
      layer.removeEventListener(names[i], onMouch);
    }
  };

  /**
   * Mou(se) and (T)ouch event handler. This function just determines
   * the mouse/touch position relative to the canvas element.
   * It then passes it to the current tool.
   *
   * @param {object} event The event to handle.
   * @private
   */
  function onMouch(event) {
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
    if (event.type === 'touchstart' ||
            event.type === 'touchmove') {
      // event offset(s)
      offsets = dwv.html.getEventOffset(event);
      // should have at least one offset
      event._xs = offsets[0].x;
      event._ys = offsets[0].y;
      position = displayToIndexConverter(offsets[0]);
      event._x = parseInt(position.x, 10);
      event._y = parseInt(position.y, 10);
      // possible second
      if (offsets.length === 2) {
        event._x1s = offsets[1].x;
        event._y1s = offsets[1].y;
        position = displayToIndexConverter(offsets[1]);
        event._x1 = parseInt(position.x, 10);
        event._y1 = parseInt(position.y, 10);
      }
      // set handle event flag
      handled = true;
    } else if (event.type === 'mousemove' ||
            event.type === 'mousedown' ||
            event.type === 'mouseup' ||
            event.type === 'mouseout' ||
            event.type === 'mousewheel' ||
            event.type === 'dblclick' ||
            event.type === 'DOMMouseScroll') {
      offsets = dwv.html.getEventOffset(event);
      event._xs = offsets[0].x;
      event._ys = offsets[0].y;
      position = displayToIndexConverter(offsets[0]);
      event._x = parseInt(position.x, 10);
      event._y = parseInt(position.y, 10);
      // set handle event flag
      handled = true;
    } else if (event.type === 'keydown' ||
                event.type === 'touchend') {
      handled = true;
    }

    // Call the event handler of the curently selected tool.
    if (handled) {
      if (event.type !== 'keydown') {
        event.preventDefault();
      }
      var func = selectedTool[event.type];
      if (func) {
        func(event);
      }
    }
  }

}; // class dwv.ToolboxController
