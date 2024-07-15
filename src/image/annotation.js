import {ListenerHandler} from '../utils/listen';
import {getFlags, replaceFlags} from '../utils/string';
import {CircleFactory} from '../tools/circle';
import {Circle} from '../math/circle';

// doc imports
/* eslint-disable no-unused-vars */
import {Index} from '../math/index';
import {Point2D} from '../math/point';
import {ViewController} from '../app/viewController';
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

  /**
   * Label position.
   *
   * @type {Point2D}
   */
  labelPosition;

  /**
   * Associated view controller.
   *
   * @type {ViewController}
   */
  #viewController;

  /**
   * Set the associated view controller.
   *
   * @param {ViewController} viewController The associated view controller.
   */
  setViewController(viewController) {
    if (typeof this.#viewController === 'undefined') {
      this.#viewController = viewController;
      // set UID if empty
      if (typeof this.referenceSopUID === 'undefined') {
        this.referenceSopUID = viewController.getCurrentImageUid();
      }
    } else {
      console.log('Cannot override previous view controller');
    }
  }

  /**
   * Get the image origin for a image UID.
   *
   * @returns {Index|undefined} The origin index.
   */
  getOriginIndex() {
    let res;
    if (typeof this.#viewController !== 'undefined') {
      res =
        this.#viewController.getOriginIndexForImageUid(this.referenceSopUID);
    }
    return res;
  }

  /**
   * Set the annotation text expression.
   *
   * @param {Object.<string, string>} labelText The list of label
   *   texts indexed by modality.
   */
  setTextExpr(labelText) {
    if (typeof this.#viewController !== 'undefined') {
      const modality = this.#viewController.getModality();

      if (typeof labelText[modality] !== 'undefined') {
        this.textExpr = labelText[modality];
      } else {
        this.textExpr = labelText['*'];
      }
    } else {
      console.log('Cannot set text expr without a view controller');
    }
  }

  /**
   * Get the annotation label text by applying the
   *   text expression on the current quantification.
   *
   * @returns {string} The resulting text.
   */
  getText() {
    return replaceFlags(this.textExpr, this.quantification);
  }

  /**
   * Update the annotation quantification.
   */
  updateQuantification() {
    if (typeof this.#viewController !== 'undefined') {
      this.quantification = this.mathShape.quantify(
        this.#viewController,
        getFlags(this.textExpr));
    } else {
      console.log('Cannot update quantification without a view controller');
    }
  }

  /**
   * Get the math shape associated draw factory.
   *
   * @returns {object} The factory.
   */
  getFactory() {
    let fac;
    if (this.mathShape instanceof Circle) {
      fac = new CircleFactory();
    }
    return fac;
  }
}

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
   * @param {Annotation[]} [list] Optional list, will
   *   create new if not provided.
   */
  constructor(list) {
    if (typeof list !== 'undefined') {
      this.#list = list;
    } else {
      this.#list = [];
    }
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
   * Remove an annotation.
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
   * @returns {object} The meta data value.
   */
  getMeta(key) {
    return this.#meta[key];
  }

  /**
   * Set a meta data.
   *
   * @param {string} key The meta data key.
   * @param {object} value The value of the meta data.
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