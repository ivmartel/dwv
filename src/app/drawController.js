import {AnnotationList} from '../image/annotation';

// doc imports
/* eslint-disable no-unused-vars */
import {Annotation} from '../image/annotation';
/* eslint-enable no-unused-vars */

/**
 * Draw controller.
 */
export class DrawController {

  /**
   * The annotation list.
   *
   * @type {AnnotationList}
   */
  #annotationList;

  /**
   * Get an annotation.
   *
   * @param {string} id The annotation id.
   * @returns {Annotation|undefined} The annotation.
   */
  getAnnotation(id) {
    return this.#annotationList.find(id);
  }

  /**
   * Get the annotation list.
   *
   * @returns {AnnotationList} The list.
   */
  getAnnotationList() {
    return this.#annotationList;
  }

  /**
   * Add an annotation.
   *
   * @param {Annotation} annotation The annotation to add.
   */
  addAnnotation(annotation) {
    this.#annotationList.add(annotation);
  }

  /**
   *
   * @param {Annotation} annotation The annotation to update.
   */
  updateAnnotation(annotation) {
    this.#annotationList.update(annotation);
  }

  /**
   *
   * @param {string} id The id of the annotation to remove.
   */
  removeAnnotation(id) {
    this.#annotationList.remove(id);
  }

  /**
   * @param {AnnotationList} [list] Optional annotation list.
   */
  constructor(list) {
    if (typeof list !== 'undefined') {
      this.#annotationList = list;
    } else {
      this.#annotationList = new AnnotationList();
    }
  }

  /**
   * Check if the annotation list contains a meta data value.
   *
   * @param {string} key The key to check.
   * @returns {boolean} True if the meta data is present.
   */
  hasAnnotationMeta(key) {
    return this.#annotationList.hasMeta(key);
  }

  /**
   * Set an annotation meta data.
   *
   * @param {string} key The meta data to set.
   * @param {string} value The value of the meta data.
   */
  setAnnotationMeta(key, value) {
    this.#annotationList.setMeta(key, value);
  }

  /**
   * Get draw store details.
   *
   * @deprecated
   */
  getDrawStoreDetails() {
    // does nothing
  }

} // class DrawController
