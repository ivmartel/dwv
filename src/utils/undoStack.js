/**
 * UndoStack class.
 */
export class UndoStack extends EventTarget {
  /**
   * Array of commands.
   *
   * @type {Array}
   */
  #stack = [];

  /**
   * Current command index.
   * Warning: 1 based.
   *
   * @type {number}
   */
  #curCmdIndex = 0;

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
   * Warning: 1 based.
   *
   * @returns {number} The stack index.
   */
  getCurrentStackIndex() {
    return this.#curCmdIndex;
  }

  /**
   * Get the current command.
   *
   * @returns {object} The command.
   */
  getCurrentCommand() {
    return this.#stack[this.#curCmdIndex - 1];
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
     * Add command to undo stack event.
     * `event.target.getCurrentCommand()` will return the added command.
     *
     * @event UndoStack#undoadd
     * @type {Event}
     */
    this.dispatchEvent(new Event('undoadd'));
  }

  /**
   * Remove a command from the stack.
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
      // result
      res = true;
      /**
       * Remove command from undo stack event.
       * Get the removed command name from the `event.detail`.
       *
       * @event UndoStack#undoremove
       * @type {CustomEvent}
       */
      this.dispatchEvent(new CustomEvent('undoremove', {
        detail: {commandName: name}
      }));
      // remove command
      this.#stack.splice(index, 1);
      // decrement index
      --this.#curCmdIndex;
    }
    return res;
  }

  /**
   * Undo the last command.
   *
   * @fires UndoStack#undo
   */
  undo() {
    if (this.#curCmdIndex > 0) {
      /**
       * Command undo event.
       * `event.target.getCurrentCommand()` will return the undone command.
       *
       * @event UndoStack#undo
       * @type {Event}
       */
      this.dispatchEvent(new Event('undo'));
      // decrement command index
      --this.#curCmdIndex;
      // undo last command
      this.#stack[this.#curCmdIndex].undo();
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
      // increment command index
      ++this.#curCmdIndex;
      /**
       * Command redo event.
       * `event.target.getCurrentCommand()` will return the re-done command.
       *
       * @event UndoStack#redo
       * @type {Event}
       */
      this.dispatchEvent(new Event('redo'));
    }
  }

} // UndoStack class
