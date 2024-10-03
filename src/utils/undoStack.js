import {ListenerHandler} from './listen';

/**
 * UndoStack class.
 */
export class UndoStack {
  /**
   * Array of commands.
   *
   * @type {Array}
   */
  #stack = [];

  /**
   * Current command index.
   *
   * @type {number}
   */
  #curCmdIndex = 0;

  /**
   * Listener handler.
   *
   * @type {ListenerHandler}
   */
  #listenerHandler = new ListenerHandler();

  /**
   * Get the stack size.
   *
   * @returns {number} The size of the stack.
   */
  getStackSize() {
    return this.#stack.length;
  }

  /**
   * Get the current stack index.
   *
   * @returns {number} The stack index.
   */
  getCurrentStackIndex() {
    return this.#curCmdIndex;
  }

  /**
   * Add a command to the stack.
   *
   * @param {object} cmd The command to add.
   * @fires UndoStack#undoadd
   */
  add(cmd) {
    // clear commands after current index
    this.#stack = this.#stack.slice(0, this.#curCmdIndex);
    // store command
    this.#stack.push(cmd);
    // increment index
    ++this.#curCmdIndex;
    /**
     * Command add to undo stack event.
     *
     * @event UndoStack#undoadd
     * @type {object}
     * @property {string} command The name of the command added to the
     *   undo stack.
     */
    this.#fireEvent({
      type: 'undoadd',
      command: cmd.getName()
    });
  }

  /**
   * Remove a command to the stack.
   *
   * @param {string} name The name of the command to remove.
   * @returns {boolean} True if the command was found and removed.
   * @fires UndoStack#undoremove
   */
  remove(name) {
    let res = false;
    const hasInputName = function (element) {
      return element.getName() === name;
    };
    const index = this.#stack.findIndex(hasInputName);
    if (index !== -1) {
      // remove command
      this.#stack.splice(index, 1);
      // decrement index
      --this.#curCmdIndex;
      // result
      res = true;
      /**
       * Command remove from undo stack event.
       *
       * @event UndoStack#undoremove
       * @type {object}
       * @property {string} command The name of the command added to the
       *   undo stack.
       */
      this.#fireEvent({
        type: 'undoremove',
        command: name
      });
    }
    return res;
  }

  /**
   * Undo the last command.
   *
   * @fires UndoStack#undo
   */
  undo() {
    // a bit inefficient...
    if (this.#curCmdIndex > 0) {
      // decrement command index
      --this.#curCmdIndex;
      // undo last command
      this.#stack[this.#curCmdIndex].undo();
      /**
       * Command undo event.
       *
       * @event UndoStack#undo
       * @type {object}
       * @property {string} command The name of the undone command.
       */
      this.#fireEvent({
        type: 'undo',
        command: this.#stack[this.#curCmdIndex].getName()
      });
    }
  }

  /**
   * Redo the last command.
   *
   * @fires UndoStack#redo
   */
  redo() {
    if (this.#curCmdIndex < this.#stack.length) {
      // run last command
      this.#stack[this.#curCmdIndex].execute();
      /**
       * Command redo event.
       *
       * @event UndoStack#redo
       * @type {object}
       * @property {string} command The name of the redone command.
       */
      this.#fireEvent({
        type: 'redo',
        command: this.#stack[this.#curCmdIndex].getName()
      });
      // increment command index
      ++this.#curCmdIndex;
    }
  }

  /**
   * Add an event listener to this class.
   *
   * @param {string} type The event type.
   * @param {Function} callback The function associated with the provided
   *    event type, will be called with the fired event.
   */
  addEventListener(type, callback) {
    this.#listenerHandler.add(type, callback);
  }

  /**
   * Remove an event listener from this class.
   *
   * @param {string} type The event type.
   * @param {Function} callback The function associated with the provided
   *   event type.
   */
  removeEventListener(type, callback) {
    this.#listenerHandler.remove(type, callback);
  }

  /**
   * Fire an event: call all associated listeners with the input event object.
   *
   * @param {object} event The event to fire.
   */
  #fireEvent = (event) => {
    this.#listenerHandler.fireEvent(event);
  };

} // UndoStack class
