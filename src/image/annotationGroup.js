import {logger} from '../utils/logger.js';
import {ListenerHandler} from '../utils/listen.js';

// doc imports
/* eslint-disable no-unused-vars */
import {Annotation} from './annotation.js';
import {ViewController} from '../app/viewController.js';
/* eslint-enable no-unused-vars */

/**
 * List of annotation group event names.
 *
 * @type {string[]}
 */
export const annotationGroupEventNames = [
  'annotationgroupeditablechange',
  'annotationadd',
  'annotationupdate',
  'annotationremove'
];

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
    /**
     * Annotation group editable flag change event.
     *
     * @event AnnotationGroup#annotationgroupeditablechange
     * @type {object}
     * @property {string} type The event type.
     * @property {boolean} data The value of the editable flag.
     */
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
   * @param {boolean} [propagate] Whether the event propagates
   *   outside of dwv or not, defaults to true.
   */
  add(annotation, propagate) {
    this.#list.push(annotation);
    /**
     * Annotation add event.
     *
     * @event AnnotationGroup#annotationadd
     * @type {object}
     * @property {string} type The event type.
     * @property {Annotation} data The added annnotation.
     */
    this.#fireEvent({
      type: 'annotationadd',
      data: annotation,
      propagate: propagate
    });
  }

  /**
   * Update an existing annotation.
   *
   * @param {Annotation} annotation The annotation to update.
   * @param {string[]} [propKeys] Optional properties that got updated.
   * @param {boolean} [propagate] Whether the event propagates
   *   outside of dwv or not, defaults to true.
   */
  update(annotation, propKeys, propagate) {
    const index = this.#list.findIndex(
      (item) => item.trackingUid === annotation.trackingUid);
    if (index !== -1) {
      // update quantification if needed
      if (propKeys.includes('mathShape') ||
        propKeys.includes('textExpr')) {
        annotation.updateQuantification();
      }
      // update list
      this.#list[index] = annotation;
      /**
       * Annotation update event.
       *
       * @event AnnotationGroup#annotationupdate
       * @type {object}
       * @property {string} type The event type.
       * @property {Annotation} data The added annnotation.
       * @property {string[]} keys The properties that were updated.
       */
      this.#fireEvent({
        type: 'annotationupdate',
        data: annotation,
        keys: propKeys,
        propagate: propagate
      });
    } else {
      logger.warn('Cannot find annotation to update');
    }
  }

  /**
   * Remove an annotation.
   *
   * @param {string} uid The UID of the annotation to remove.
   * @param {boolean} [propagate] Whether the event propagates
   *   outside of dwv or not, defaults to true.
   */
  remove(uid, propagate) {
    const index = this.#list.findIndex(
      (item) => item.trackingUid === uid);
    if (index !== -1) {
      const annotation = this.#list.splice(index, 1)[0];
      /**
       * Annotation update event.
       *
       * @event AnnotationGroup#annotationremove
       * @type {object}
       * @property {string} type The event type.
       * @property {Annotation} data The added annnotation.
       * @property {string[]} keys The properties that were updated.
       */
      this.#fireEvent({
        type: 'annotationremove',
        data: annotation,
        propagate: propagate
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
   * @param {string} uid The UID of the annotation to find.
   * @returns {Annotation|undefined} The found annotation.
   */
  find(uid) {
    return this.#list.find((item) => item.trackingUid === uid);
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
   * @returns {string|object|undefined} The meta data value.
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
