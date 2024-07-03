import {ListenerHandler} from '../utils/listen';
import {getFlags, replaceFlags} from '../utils/string';

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

}

export class AnnotationList {
  /**
   * @type {Annotation[]}
   */
  #list = [];

  /**
   * Listener handler.
   *
   * @type {ListenerHandler}
   */
  #listenerHandler = new ListenerHandler();

  getList() {
    return this.#list;
  }

  add(details) {
    this.#list.push(details);
    this.#fireEvent({type: 'adddraw'});
  }

  find(id) {
    return this.#list.find((item) => item.id === id);
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