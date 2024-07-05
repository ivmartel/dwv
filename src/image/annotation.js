import {ListenerHandler} from '../utils/listen';
import {getFlags, replaceFlags} from '../utils/string';
import {CircleFactory} from '../tools/circle';
import {Circle} from '../math/circle';

// doc imports
/* eslint-disable no-unused-vars */
import {Index} from '../math/index';
/* eslint-enable no-unused-vars */

/**
 * Image annotation.
 */
export class Annotation {
  /**
   * The ID.
   *
   * 'Tracking Unique Identifier', 112040, DCM.
   *
   * @type {string}
   */
  id;

  /**
   * The reference image SOP UID.
   *
   * @type {string}
   */
  referenceSopUID;

  /**
   * The position: an Index converted to string.
   *
   * @type {string}
   */
  position;

  /**
   * The mathematical shape.
   *
   * @type {object}
   */
  mathShape;

  /**
   * The color: for example 'green', '#00ff00' or 'rgb(0,255,0)'.
   *
   * 'RGB R Component', 110834, DCM...
   *
   * @type {string}
   */
  colour;

  /**
   * Annotation quantification.
   *
   * @type {object}
   */
  quantification;

  /**
   * Text expression. Can contain variables surrounded with '{}' that will
   * be extracted from the quantification object.
   *
   * 'Short label', 125309, DCM.
   *
   * @type {string}
   */
  textExpr;

  #viewController;

  constructor(viewController) {
    this.#viewController = viewController;
    this.referenceSopUID = viewController.getCurrentImageUid();
  }

  /**
   * Get the image origin for a image UID.
   *
   * @returns {Index|undefined} The origin index.
   */
  getOriginIndex() {
    return this.#viewController.getOriginIndexForImageUid(this.referenceSopUID);
  }

  setTextExpr(labelText) {
    const modality = this.#viewController.getModality();

    if (typeof labelText[modality] !== 'undefined') {
      this.textExpr = labelText[modality];
    } else {
      this.textExpr = labelText['*'];
    }
  }

  getText() {
    return replaceFlags(this.textExpr, this.quantification);
  }

  updateQuantification() {
    this.quantification = this.mathShape.quantify(
      this.#viewController,
      getFlags(this.textExpr));
  }

  getFactory() {
    let fac;
    if (this.mathShape instanceof Circle) {
      fac = new CircleFactory();
    }
    return fac;
  }
}

export class AnnotationList {
  /**
   * @type {Annotation[]}
   */
  #list;

  /**
   * Annotation meta data.
   *
   * @type {Object<string, string>}
   */
  #meta = {};

  /**
   * Listener handler.
   *
   * @type {ListenerHandler}
   */
  #listenerHandler = new ListenerHandler();

  /**
   *
   * @param {Annotation[]} [list] Optional list.
   */
  constructor(list) {
    if (typeof list !== 'undefined') {
      this.#list = list;
    } else {
      this.#list = [];
    }
  }

  /**
   * Get the annotation list as an array.
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
   * Add a new annotation.
   *
   * @param {Annotation} annotation The annotation to add.
   */
  add(annotation) {
    this.#list.push(annotation);
    this.#fireEvent({
      type: 'addannotation',
      data: annotation
    });
  }

  /**
   * Update an existing annotation.
   *
   * @param {Annotation} annotation The annotation to update.
   */
  update(annotation) {
    const index = this.#list.findIndex((item) => item.id === annotation.id);
    if (index !== -1) {
      this.#list[index] = annotation;
      this.#fireEvent({
        type: 'updateannotation',
        data: annotation
      });
    } else {
      console.log('Cannot find annotation to update');
    }
  }

  /**
   * Remoave an annotation.
   *
   * @param {string} id The id of the annotation to remove.
   */
  remove(id) {
    const index = this.#list.findIndex((item) => item.id === id);
    if (index !== -1) {
      const annotation = this.#list.splice(index, 1)[0];
      this.#fireEvent({
        type: 'removeannotation',
        data: annotation
      });
    } else {
      console.log('Cannot find annotation to remove');
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
   * @returns {string} The meta data value.
   */
  getMeta(key) {
    return this.#meta[key];
  }

  /**
   * Set a meta data.
   *
   * @param {string} key The meta data key.
   * @param {string} value The value of the meta data.
   */
  setMeta(key, value) {
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