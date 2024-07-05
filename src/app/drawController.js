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
   * Get draw store details.
   *
   * @deprecated
   */
  getDrawStoreDetails() {
    // does nothing
  }

} // class DrawController
