/**
 * ListenerHandler class: handles add/removing and firing listeners.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget#example
 */
export class ListenerHandler {
  /**
   * listeners.
   *
   * @type {object}
   */
  #listeners = {};

  /**
   * Add an event listener.
   *
   * @param {string} type The event type.
   * @param {object} callback The method associated with the provided
   *    event type, will be called with the fired event.
   */
  add(type, callback) {
    // create array if not present
    if (typeof this.#listeners[type] === 'undefined') {
      this.#listeners[type] = [];
    }
    // add callback to listeners array
    this.#listeners[type].push(callback);
  }

  /**
   * Remove an event listener.
   *
   * @param {string} type The event type.
   * @param {object} callback The method associated with the provided
   *   event type.
   */
  remove(type, callback) {
    // check if the type is present
    if (typeof this.#listeners[type] === 'undefined') {
      return;
    }
    // remove from listeners array
    for (let i = 0; i < this.#listeners[type].length; ++i) {
      if (this.#listeners[type][i] === callback) {
        this.#listeners[type].splice(i, 1);
      }
    }
  }

  /**
   * Fire an event: call all associated listeners with the input event object.
   *
   * @param {object} event The event to fire.
   */
  fireEvent = (event) => {
    // check if they are listeners for the event type
    if (typeof this.#listeners[event.type] === 'undefined') {
      return;
    }
    // fire events from a copy of the listeners array
    // to avoid interference from possible add/remove
    const stack = this.#listeners[event.type].slice();
    for (let i = 0; i < stack.length; ++i) {
      stack[i](event);
    }
  };
}
