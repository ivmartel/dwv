import {logger} from '../utils/logger';
import {ListenerHandler} from '../utils/listen';

// doc imports
/* eslint-disable no-unused-vars */
import {Annotation} from './annotation';
import {ViewController} from '../app/viewController';
/* eslint-enable no-unused-vars */

/**
 * Annotation group.
 */
export class AnnotationGroup {
  /**
   * @type {Annotation[]}
   */
  #list;

  /**
   * Annotation meta data.
   *
   * @type {Object<string, any>}
   */
  #meta = {};

  /**
   * Listener handler.
   *
   * @type {ListenerHandler}
   */
  #listenerHandler = new ListenerHandler();

  /**
   * Editable flag.
   *
   * @type {boolean}
   */
  #editable;

  /**
   * Group colour as hex string. If defined, it will be used as
   *   default colour for new annotations in draw tool.
   *
   * @type {string|undefined}
   */
  #colour;

  /**
   * @param {Annotation[]} [list] Optional list, will
   *   create new if not provided.
   */
  constructor(list) {
    if (typeof list !== 'undefined') {
      this.#list = list;
    } else {
      this.#list = [];
    }
    this.#editable = true;
  }

  /**
   * Get the annotation group as an array.
   *
   * @returns {Annotation[]} The array.
   */
  getList() {
    return this.#list;
  }

  /**
   * Get the number of annotations of this list.
   *
   * @returns {number} The number of annotations.
   */
  getLength() {
    return this.#list.length;
  }

  /**
   * Check if the annotation group is editable.
   *
   * @returns {boolean} True if editable.
   */
  isEditable() {
    return this.#editable;
  }

  /**
   * Set the annotation group editability.
   *
   * @param {boolean} flag True to make the annotation group editable.
   */
  setEditable(flag) {
    this.#editable = flag;
    this.#fireEvent({
      type: 'annotationgroupeditablechange',
      data: flag
    });
  }

  /**
   * Get the group colour.
   *
   * @returns {string} The colour as hex string.
   */
  getColour() {
    return this.#colour;
  }

  /**
   * Set the group colour.
   *
   * @param {string} colour The colour as hex string.
   */
  setColour(colour) {
    this.#colour = colour;
  }

  /**
   * Add a new annotation.
   *
   * @param {Annotation} annotation The annotation to add.
   */
  add(annotation) {
    this.#list.push(annotation);
    this.#fireEvent({
      type: 'annotationadd',
      data: annotation
    });
  }

  /**
   * Update an existing annotation.
   *
   * @param {Annotation} annotation The annotation to update.
   * @param {string[]} [propKeys] Optional properties that got updated.
   */
  update(annotation, propKeys) {
    const index = this.#list.findIndex((item) => item.id === annotation.id);
    if (index !== -1) {
      this.#list[index] = annotation;
      this.#fireEvent({
        type: 'annotationupdate',
        data: annotation,
        keys: propKeys
      });
    } else {
      logger.warn('Cannot find annotation to update');
    }
  }

  /**
   * Remove an annotation.
   *
   * @param {string} id The id of the annotation to remove.
   */
  remove(id) {
    const index = this.#list.findIndex((item) => item.id === id);
    if (index !== -1) {
      const annotation = this.#list.splice(index, 1)[0];
      this.#fireEvent({
        type: 'annotationremove',
        data: annotation
      });
    } else {
      logger.warn('Cannot find annotation to remove');
    }
  }

  /**
   * Set the associated view controller.
   *
   * @param {ViewController} viewController The associated view controller.
   */
  setViewController(viewController) {
    for (const item of this.#list) {
      item.setViewController(viewController);
      item.updateQuantification();
    }
  }

  /**
   * Find an annotation.
   *
   * @param {string} id The id of the annotation to find.
   * @returns {Annotation|undefined} The found annotation.
   */
  find(id) {
    return this.#list.find((item) => item.id === id);
  }

  /**
   * Get the meta data.
   *
   * @returns {Object<string, any>} The meta data.
   */
  getMeta() {
    return this.#meta;
  }

  /**
   * Check if this list contains a meta data value.
   *
   * @param {string} key The key to check.
   * @returns {boolean} True if the meta data is present.
   */
  hasMeta(key) {
    return typeof this.#meta[key] !== 'undefined';
  }

  /**
   * Get a meta data value.
   *
   * @param {string} key The meta data key.
   * @returns {string|object} The meta data value.
   */
  getMetaValue(key) {
    return this.#meta[key];
  }

  /**
   * Set a meta data.
   *
   * @param {string} key The meta data key.
   * @param {string|object} value The value of the meta data.
   */
  setMetaValue(key, value) {
    this.#meta[key] = value;
  }

  /**
   * Add an event listener to this class.
   *
   * @param {string} type The event type.
   * @param {Function} callback The function associated with the provided
   *   event type, will be called with the fired event.
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
}
