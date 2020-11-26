// namespaces
var dwv = dwv || {};
dwv.tool = dwv.tool || {};

/**
 * UndoStack class.
 *
 * @class
 */
dwv.tool.UndoStack = function () {
  /**
   * Array of commands.
   *
   * @private
   * @type {Array}
   */
  var stack = [];

  /**
   * Get the stack.
   *
   * @returns {Array} The list of stored commands.
   */
  this.getStack = function () {
    return stack;
  };

  /**
   * Current command index.
   *
   * @private
   * @type {number}
   */
  var curCmdIndex = 0;

  /**
   * Listener handler.
   *
   * @type {object}
   * @private
   */
  var listenerHandler = new dwv.utils.ListenerHandler();

  /**
   * Add a command to the stack.
   *
   * @param {object} cmd The command to add.
   * @fires dwv.tool.UndoStack#undoadd
   */
  this.add = function (cmd) {
    // clear commands after current index
    stack = stack.slice(0, curCmdIndex);
    // store command
    stack.push(cmd);
    // increment index
    ++curCmdIndex;
    /**
     * Command add to undo stack event.
     *
     * @event dwv.tool.UndoStack#undoadd
     * @type {object}
     * @property {string} command The name of the command added to the
     *   undo stack.
     */
    fireEvent({
      type: 'undo-add',
      command: cmd.getName()
    });
  };

  /**
   * Undo the last command.
   *
   * @fires dwv.tool.UndoStack#undo
   */
  this.undo = function () {
    // a bit inefficient...
    if (curCmdIndex > 0) {
      // decrement command index
      --curCmdIndex;
      // undo last command
      stack[curCmdIndex].undo();
      /**
       * Command undo event.
       *
       * @event dwv.tool.UndoStack#undo
       * @type {object}
       * @property {string} command The name of the undone command.
       */
      fireEvent({
        type: 'undo',
        command: stack[curCmdIndex].getName()
      });
    }
  };

  /**
   * Redo the last command.
   *
   * @fires dwv.tool.UndoStack#redo
   */
  this.redo = function () {
    if (curCmdIndex < stack.length) {
      // run last command
      stack[curCmdIndex].execute();
      /**
       * Command redo event.
       *
       * @event dwv.tool.UndoStack#redo
       * @type {object}
       * @property {string} command The name of the redone command.
       */
      fireEvent({
        type: 'redo',
        command: stack[curCmdIndex].getName()
      });
      // increment command index
      ++curCmdIndex;
    }
  };

  /**
   * Add an event listener to this class.
   *
   * @param {string} type The event type.
   * @param {object} callback The method associated with the provided
   *    event type, will be called with the fired event.
   */
  this.addEventListener = function (type, callback) {
    listenerHandler.add(type, callback);
  };
  /**
   * Remove an event listener from this class.
   *
   * @param {string} type The event type.
   * @param {object} callback The method associated with the provided
   *   event type.
   */
  this.removeEventListener = function (type, callback) {
    listenerHandler.remove(type, callback);
  };
  /**
   * Fire an event: call all associated listeners with the input event object.
   *
   * @param {object} event The event to fire.
   * @private
   */
  function fireEvent(event) {
    listenerHandler.fireEvent(event);
  }

}; // UndoStack class
