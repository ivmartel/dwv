import {Command} from './undoStack.js';

/**
 * @import {Annotation} from '../image/annotation.js';
 * @import {DrawController} from '../app/drawController.js';
 */

/**
 * Add annotation command.
 */
export class AddAnnotationCommand extends Command {
  /**
   * @type {Annotation}
   */
  #annotation;

  /**
   * @type {DrawController}
   */
  #drawController;

  /**
   * @param {Annotation} annotation The annotation to add.
   * @param {DrawController} drawController The associated draw controller.
   */
  constructor(annotation, drawController) {
    super();
    this.#annotation = annotation;
    this.#drawController = drawController;
  }

  /**
   * Get the command name.
   *
   * @returns {string} The command name.
   */
  getName() {
    return `AddAnnotation-${this.#annotation.trackingUid}`;
  }

  /**
   * Execute the command.
   */
  execute() {
    this.#drawController.addAnnotation(this.#annotation);
  }

  /**
   * Undo the command.
   */
  undo() {
    this.#drawController.removeAnnotation(this.#annotation.trackingUid);
  }
}

/**
 * Remove annotation command.
 */
export class RemoveAnnotationCommand extends Command {
  /**
   * @type {Annotation}
   */
  #annotation;

  /**
   * @type {DrawController}
   */
  #drawController;

  /**
   * @param {Annotation} annotation The annotation to remove.
   * @param {DrawController} drawController The associated draw controller.
   */
  constructor(annotation, drawController) {
    super();
    this.#annotation = annotation;
    this.#drawController = drawController;
  }

  /**
   * Get the command name.
   *
   * @returns {string} The command name.
   */
  getName() {
    return `RemoveAnnotation-${this.#annotation.trackingUid}`;
  }

  /**
   * Execute the command.
   */
  execute() {
    this.#drawController.removeAnnotation(this.#annotation.trackingUid);
  }

  /**
   * Undo the command.
   */
  undo() {
    this.#drawController.addAnnotation(this.#annotation);
  }
}

/**
 * Update annotation command.
 */
export class UpdateAnnotationCommand extends Command {
  /**
   * @type {Annotation}
   */
  #annotation;

  /**
   * @type {DrawController}
   */
  #drawController;

  /**
   * Original annotation properties.
   *
   * @type {object}
   */
  #originalProps;

  /**
   * New annotation properties.
   *
   * @type {object}
   */
  #newProps;

  /**
   * @param {Annotation} annotation The annotation to update.
   * @param {object} originaProps The original annotation properties.
   * @param {object} newProps The new annotation properties.
   * @param {DrawController} drawController The associated draw controller.
   */
  constructor(annotation, originaProps, newProps, drawController) {
    super();
    this.#annotation = annotation;
    this.#drawController = drawController;
    this.#originalProps = originaProps;
    this.#newProps = newProps;
  }

  /**
   * Get the command name.
   *
   * @returns {string} The command name.
   */
  getName() {
    return `UpdateAnnotation-${this.#annotation.trackingUid}`;
  }

  /**
   * Execute the command.
   */
  execute() {
    const keys = Object.keys(this.#newProps);
    for (const key of keys) {
      this.#annotation[key] = this.#newProps[key];
    }
    this.#drawController.updateAnnotation(this.#annotation, keys);
  }

  /**
   * Undo the command.
   */
  undo() {
    const keys = Object.keys(this.#originalProps);
    for (const key of keys) {
      this.#annotation[key] = this.#originalProps[key];
    }
    this.#drawController.updateAnnotation(this.#annotation, keys);
  }
}
