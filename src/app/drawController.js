import {AnnotationGroup} from '../image/annotation';
import {RemoveAnnotationCommand} from '../tools/drawCommands';
import {logger} from '../utils/logger';

// doc imports
/* eslint-disable no-unused-vars */
import {Annotation} from '../image/annotation';
/* eslint-enable no-unused-vars */

/**
 * Draw controller.
 */
export class DrawController {

  /**
   * The annotation group.
   *
   * @type {AnnotationGroup}
   */
  #annotationGroup;

  /**
   * Get an annotation.
   *
   * @param {string} id The annotation id.
   * @returns {Annotation|undefined} The annotation.
   */
  getAnnotation(id) {
    return this.#annotationGroup.find(id);
  }

  /**
   * Get the annotation group.
   *
   * @returns {AnnotationGroup} The list.
   */
  getAnnotationGroup() {
    return this.#annotationGroup;
  }

  /**
   * Add an annotation.
   *
   * @param {Annotation} annotation The annotation to add.
   */
  addAnnotation(annotation) {
    this.#annotationGroup.add(annotation);
  }

  /**
   * Update an anotation from the list.
   *
   * @param {Annotation} annotation The annotation to update.
   * @param {string[]} [propKeys] Optional properties that got updated.
   */
  updateAnnotation(annotation, propKeys) {
    this.#annotationGroup.update(annotation, propKeys);
  }

  /**
   * Remove an anotation for the list.
   *
   * @param {string} id The id of the annotation to remove.
   */
  removeAnnotation(id) {
    this.#annotationGroup.remove(id);
  }

  /**
   * Remove an annotation via a remove command (triggers draw actions).
   *
   * @param {string} id The annotation id.
   * @param {Function} exeCallback The undo stack callback.
   */
  removeAnnotationWithCommand(id, exeCallback) {
    const annotation = this.getAnnotation(id);
    if (typeof annotation === 'undefined') {
      logger.warn(
        'Cannot create remove command for undefined annotation: ' + id);
      return;
    }
    // create remove annotation command
    const command = new RemoveAnnotationCommand(annotation, this);
    // add command to undo stack
    exeCallback(command);
    // execute command: triggers draw remove
    command.execute();
  }

  /**
   * Remove all annotations via remove commands (triggers draw actions).
   *
   * @param {Function} exeCallback The undo stack callback.
   */
  removeAllAnnotationsWithCommand(exeCallback) {
    for (const annotation of this.#annotationGroup.getList()) {
      this.removeAnnotationWithCommand(annotation.id, exeCallback);
    }
  }

  /**
   * @param {AnnotationGroup} [group] Optional annotation group.
   */
  constructor(group) {
    if (typeof group !== 'undefined') {
      this.#annotationGroup = group;
    } else {
      this.#annotationGroup = new AnnotationGroup();
    }
  }

  /**
   * Check if the annotation group contains a meta data value.
   *
   * @param {string} key The key to check.
   * @returns {boolean} True if the meta data is present.
   */
  hasAnnotationMeta(key) {
    return this.#annotationGroup.hasMeta(key);
  }

  /**
   * Set an annotation meta data.
   *
   * @param {string} key The meta data to set.
   * @param {string} value The value of the meta data.
   */
  setAnnotationMeta(key, value) {
    this.#annotationGroup.setMetaValue(key, value);
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
