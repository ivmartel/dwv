import {UndoStack} from '../command/undoStack.js';

/**
 * List of undo controller event names.
 *
 * @type {string[]}
 */
export const undoEventNames = [
  'undoadd',
  'undoremove',
  'undo',
  'redo'
];

/**
 * Undo controller.
 */
export class UndoController extends EventTarget {

  /**
   * The undo stack.
   *
   * @type {UndoStack}
   */
  #undoStack = new UndoStack();

  /**
   * Constructor.
   */
  constructor() {
    super();
    this.#wireEvents();
  }

  /**
   * Add a command to the undo stack.
   *
   * @param {object} cmd The command to add.
   * @fires UndoStack#undoadd
   */
  addToUndoStack(cmd) {
    this.#undoStack.add(cmd);
  }

  /**
   * Remove a command from the undo stack.
   *
   * @param {string} name The name of the command to remove.
   * @returns {boolean} True if the command was found and removed.
   * @fires UndoStack#undoremove
   */
  removeFromUndoStack(name) {
    return this.#undoStack.remove(name);
  }

  /**
   * Undo the last command.
   *
   * @fires UndoStack#undo
   */
  undo() {
    this.#undoStack.undo();
  }

  /**
   * Redo the next command.
   *
   * @fires UndoStack#redo
   */
  redo() {
    this.#undoStack.redo();
  }

  /**
   * Get the undo stack size.
   *
   * @returns {number} The size of the stack.
   */
  getStackSize() {
    return this.#undoStack.getStackSize();
  }

  /**
   * Get the current undo stack index.
   *
   * @returns {number} The stack index.
   */
  getCurrentStackIndex() {
    return this.#undoStack.getCurrentStackIndex();
  }

  /**
   * Reset the undo/redo history.
   */
  reset() {
    this.#undoStack = new UndoStack();
    this.#wireEvents();
  }

  // private ----------------------------------------------------------------

  /**
   * Wire UndoStack events to forward them as CustomEvents.
   */
  #wireEvents() {
    for (const name of undoEventNames) {
      this.#undoStack.addEventListener(name,
        (/** @type {CustomEvent} */ event) => {
          const detail = Object.assign({}, event.detail);
          this.dispatchEvent(new CustomEvent(name, {detail}));
        }
      );
    }
  }

}
