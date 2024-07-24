// external
import Konva from 'konva';

// doc imports
/* eslint-disable no-unused-vars */
import {DrawLayer} from '../gui/drawLayer';
import {Annotation} from '../image/annotation';
import {DrawController} from '../app/drawController';
/* eslint-enable no-unused-vars */

/**
 * Get the display name of the input shape.
 *
 * @param {Konva.Shape} shape The Konva shape.
 * @returns {string} The display name.
 */
export function getShapeDisplayName(shape) {
  let displayName = 'shape';
  if (shape instanceof Konva.Line) {
    if (shape.points().length === 4) {
      displayName = 'line';
    } else if (shape.points().length === 6) {
      displayName = 'protractor';
    } else {
      displayName = 'roi';
    }
  } else if (shape instanceof Konva.Rect) {
    displayName = 'rectangle';
  } else if (shape instanceof Konva.Ellipse) {
    displayName = 'ellipse';
  }
  // return
  return displayName;
}

/**
 * Add annotation command.
 */
export class AddAnnotationCommand {
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
    this.#annotation = annotation;
    this.#drawController = drawController;
  }

  /**
   * Get the command name.
   *
   * @returns {string} The command name.
   */
  getName() {
    return 'AddAnnotation-' + this.#annotation.id;
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
    this.#drawController.removeAnnotation(this.#annotation.id);
  }
}

/**
 * Remove annotation command.
 */
export class RemoveAnnotationCommand {
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
    this.#annotation = annotation;
    this.#drawController = drawController;
  }

  /**
   * Get the command name.
   *
   * @returns {string} The command name.
   */
  getName() {
    return 'RemoveAnnotation-' + this.#annotation.id;
  }

  /**
   * Execute the command.
   */
  execute() {
    this.#drawController.removeAnnotation(this.#annotation.id);
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
export class UpdateAnnotationCommand {
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
    return 'UpdateAnnotation-' + this.#annotation.id;
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
/**
 * Draw group command.
 *
 * TODO: remove.
 */
export class DrawGroupCommand {

  /**
   * The group to draw.
   *
   * @type {Konva.Group}
   */
  #group;

  /**
   * The shape display name.
   *
   * @type {string}
   */
  #name;

  /**
   * The draw layer.
   *
   * @type {DrawLayer}
   */
  #layer;

  /**
   * Flag to send events.
   *
   * @type {boolean}
   */
  #isSilent;

  /**
   * The group parent.
   *
   * @type {object}
   */
  #parent;

  /**
   * @param {Konva.Group} group The group draw.
   * @param {string} name The shape display name.
   * @param {DrawLayer} layer The layer where to draw the group.
   * @param {boolean} [silent] Whether to send a creation event or not.
   */
  constructor(group, name, layer, silent) {
    this.#group = group;
    this.#name = name;
    this.#layer = layer;
    this.#isSilent = (typeof silent === 'undefined') ? false : silent;
    this.#parent = group.getParent();
  }

  /**
   * Get the command name.
   *
   * @returns {string} The command name.
   */
  getName() {
    return 'Draw-' + this.#name;
  }

  /**
   * Execute the command.
   *
   * @fires DrawGroupCommand#drawcreate
   */
  execute() {
    // add the group to the parent (in case of undo/redo)
    this.#parent.add(this.#group);
    // draw
    this.#layer.getKonvaLayer().draw();
    // callback
    if (!this.#isSilent) {
      /**
       * Draw create event.
       *
       * @event DrawGroupCommand#drawcreate
       * @type {object}
       * @property {string} id The id of the created draw.
       * @property {string} srclayerid The id of the layer of the draw.
       * @property {string} dataid The associated data id.
       */
      this.onExecute({
        type: 'drawcreate',
        id: this.#group.id(),
        srclayerid: this.#layer.getId(),
        dataid: this.#layer.getDataId()
      });
    }
  }

  /**
   * Undo the command.
   *
   * @fires DeleteGroupCommand#drawdelete
   */
  undo() {
    // remove the group from the parent layer
    this.#group.remove();
    // draw
    this.#layer.getKonvaLayer().draw();
    // callback
    this.onUndo({
      type: 'drawdelete',
      id: this.#group.id(),
      srclayerid: this.#layer.getId(),
      dataid: this.#layer.getDataId()
    });
  }

  /**
   * Handle an execute event.
   *
   * @param {object} _event The execute event with type and id.
   */
  onExecute(_event) {
    // default does nothing.
  }

  /**
   * Handle an undo event.
   *
   * @param {object} _event The undo event with type and id.
   */
  onUndo(_event) {
    // default does nothing.
  }

} // DrawGroupCommand class
