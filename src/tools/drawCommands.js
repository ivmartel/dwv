// external
import Konva from 'konva';

// doc imports
/* eslint-disable no-unused-vars */
import {Style} from '../gui/style';
import {DrawLayer} from '../gui/drawLayer';
import {Scalar2D} from '../math/scalar';
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
   * @param {Annotation} annotation The group draw.
   * @param {DrawController} drawController The layer where to draw the group.
   */
  constructor(annotation, drawController) {
    this.#annotation = annotation;
    this.#drawController = drawController;
  }

  execute() {
    this.#drawController.addAnnotation(this.#annotation);
  }

  undo() {
    this.#drawController.removeAnnotation(this.#annotation.id);
  }
}

/**
 * Draw group command.
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


/**
 * Move shape command.
 */
export class MoveShapeCommand {

  /**
   * The shape to move.
   *
   * @type {Konva.Shape|Konva.Label}
   */
  #shape;

  /**
   * The shape display name.
   *
   * @type {string}
   */
  #name;

  /**
   * The 2D translation as {x,y}.
   *
   * @type {Scalar2D}
   */
  #translation;

  /**
   * The draw layer.
   *
   * @type {DrawLayer}
   */
  #layer;

  /**
   * Flag for linked label.
   *
   * @type {boolean}
   */
  #isLabelLinked;

  /**
   * @param {Konva.Shape|Konva.Label} shape The group draw.
   * @param {object} translation A 2D translation to move the group by.
   * @param {DrawLayer} layer The layer where to move the group.
   * @param {boolean} isLabelLinked Flag for shape-label link.
   */
  constructor(shape, translation, layer, isLabelLinked) {
    this.#shape = shape;
    if (shape instanceof Konva.Shape) {
      this.#name = getShapeDisplayName(shape);
    }
    if (shape instanceof Konva.Label) {
      this.#name = 'Label';
    }
    this.#translation = translation;
    this.#layer = layer;
    this.#isLabelLinked = isLabelLinked;
  }

  /**
   * Get the command name.
   *
   * @returns {string} The command name.
   */
  getName() {
    return 'Move-' + this.#name;
  }

  /**
   * Execute the command.
   *
   * @fires MoveGroupCommand#drawmove
   */
  execute() {
    // apply translation
    if (this.#shape instanceof Konva.Shape) {
      const children = this.#shape.getParent().getChildren();
      for (const child of children) {
        // move all but label if not linked
        if (!this.#isLabelLinked && child.name() === 'label') {
          continue;
        }
        child.move(this.#translation);
      }
    }
    if (this.#shape instanceof Konva.Label) {
      this.#shape.move(this.#translation);
    }

    // draw
    this.#layer.getKonvaLayer().draw();
    // callback
    /**
     * Draw move event.
     *
     * @event MoveGroupCommand#drawmove
     * @type {object}
     * @property {string} id The id of the create draw.
     * @property {string} srclayerid The id of the layer of the draw.
     * @property {string} dataid The associated data id.
     */
    this.onExecute({
      type: 'drawmove',
      id: this.#shape.id(),
      srclayerid: this.#layer.getId(),
      dataid: this.#layer.getDataId()
    });
  }

  /**
   * Undo the command.
   *
   * @fires MoveGroupCommand#drawmove
   */
  undo() {
    // invert translate group
    const minusTrans = {
      x: -this.#translation.x,
      y: -this.#translation.y
    };
    // remove translation
    if (this.#shape instanceof Konva.Shape) {
      const children = this.#shape.getParent().getChildren();
      for (const child of children) {
        // move all but label if not linked
        if (!this.#isLabelLinked && child.name() === 'label') {
          continue;
        }
        child.move(minusTrans);
      }
    }
    if (this.#shape instanceof Konva.Label) {
      this.#shape.move(minusTrans);
    }

    // draw
    this.#layer.getKonvaLayer().draw();
    // callback
    this.onUndo({
      type: 'drawmove',
      id: this.#shape.id(),
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

} // MoveShapeCommand class


/**
 * Change group command.
 */
export class ChangeGroupCommand {

  /**
   * The shape display name.
   *
   * @type {string}
   */
  #name;

  /**
   * The shape factory.
   *
   * @type {object}
   */
  #factory;

  /**
   * The start anchor.
   *
   * @type {object}
   */
  #startAnchor;

  /**
   * The end anchor.
   *
   * @type {object}
   */
  #endAnchor;

  /**
   * The draw layer.
   *
   * @type {DrawLayer}
   */
  #layer;

  /**
   * The associated annotation.
   *
   * @type {Annotation}
   */
  #annotation;

  /**
   * The app style.
   *
   * @type {Style}
   */
  #style;

  /**
   * @param {string} name The shape display name.
   * @param {object} factory The shape factory.
   * @param {object} startAnchor The anchor that starts the change.
   * @param {object} endAnchor The anchor that ends the change.
   * @param {Annotation} annotation The annotation.
   * @param {DrawLayer} layer The layer where to change the group.
   * @param {Style} style The app style.
   */
  constructor(
    name,
    factory,
    startAnchor,
    endAnchor,
    annotation,
    layer,
    style) {
    this.#name = name;
    this.#factory = factory;
    this.#startAnchor = startAnchor;
    this.#endAnchor = endAnchor;
    this.#annotation = annotation;
    this.#layer = layer;
    this.#style = style;
  }

  /**
   * Get the command name.
   *
   * @returns {string} The command name.
   */
  getName() {
    return 'Change-' + this.#name;
  }

  /**
   * Execute the command.
   *
   * @fires ChangeGroupCommand#drawchange
   */
  execute() {
    // udpate annotation
    this.#factory.updateAnnotationOnAnchorMove(
      this.#annotation, this.#endAnchor);
    // udpate shape
    this.#factory.updateShapeGroupOnAnchorMove(
      this.#annotation, this.#endAnchor, this.#style);
    // draw
    this.#layer.getKonvaLayer().draw();
    // callback
    /**
     * Draw change event.
     *
     * @event ChangeGroupCommand#drawchange
     * @type {object}
     * @property {string} id The id of the created draw.
     * @property {string} srclayerid The id of the layer of the draw.
     * @property {string} dataid The associated data id.
     */
    this.onExecute({
      type: 'drawchange',
      id: this.#endAnchor.getParent().id(),
      srclayerid: this.#layer.getId(),
      dataid: this.#layer.getDataId()
    });
  }

  /**
   * Undo the command.
   *
   * @fires ChangeGroupCommand#drawchange
   */
  undo() {
    // udpate annotation
    this.#factory.updateAnnotationOnAnchorMove(
      this.#annotation, this.#startAnchor);
    // udpate shape
    this.#factory.updateShapeGroupOnAnchorMove(
      this.#annotation, this.#startAnchor, this.#style);
    // draw
    this.#layer.getKonvaLayer().draw();
    // callback
    this.onUndo({
      type: 'drawchange',
      id: this.#startAnchor.getParent().id(),
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

} // ChangeGroupCommand class

/**
 * Delete group command.
 */
export class DeleteGroupCommand {

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
   * The group parent.
   *
   * @type {Konva.Container}
   */
  #parent;

  /**
   * @param {Konva.Group} group The group draw.
   * @param {string} name The shape display name.
   * @param {DrawLayer} layer The layer where to delete the group.
   */
  constructor(group, name, layer) {
    this.#group = group;
    this.#name = name;
    this.#layer = layer;
    this.#parent = group.getParent();
  }

  /**
   * Get the command name.
   *
   * @returns {string} The command name.
   */
  getName() {
    return 'Delete-' + this.#name;
  }

  /**
   * Execute the command.
   *
   * @fires DeleteGroupCommand#drawdelete
   */
  execute() {
    // remove the group from its parent
    this.#group.remove();
    // draw
    this.#layer.getKonvaLayer().draw();
    // callback
    /**
     * Draw delete event.
     *
     * @event DeleteGroupCommand#drawdelete
     * @type {object}
     * @property {string} id The id of the created draw.
     * @property {string} srclayerid The id of the layer of the draw.
     * @property {string} dataid The associated data id.
     */
    this.onExecute({
      type: 'drawdelete',
      id: this.#group.id(),
      srclayerid: this.#layer.getId(),
      dataid: this.#layer.getDataId()
    });
  }

  /**
   * Undo the command.
   *
   * @fires DrawGroupCommand#drawcreate
   */
  undo() {
    // add the group to its parent
    this.#parent.add(this.#group);
    // draw
    this.#layer.getKonvaLayer().draw();
    // callback
    this.onUndo({
      type: 'drawcreate',
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

} // DeleteGroupCommand class
