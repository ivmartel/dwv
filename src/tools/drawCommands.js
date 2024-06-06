// external
import Konva from 'konva';

// doc imports
/* eslint-disable no-unused-vars */
import {Style} from '../gui/style';
import {DrawLayer} from '../gui/drawLayer';
import {ViewController} from '../app/viewController';
import {Scalar2D} from '../math/scalar';
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
 * Move group command.
 */
export class MoveGroupCommand {

  /**
   * The group to move.
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
   * @param {Konva.Group} group The group draw.
   * @param {string} name The shape display name.
   * @param {object} translation A 2D translation to move the group by.
   * @param {DrawLayer} layer The layer where to move the group.
   */
  constructor(group, name, translation, layer) {
    this.#group = group;
    this.#name = name;
    this.#translation = translation;
    this.#layer = layer;
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
    // translate group
    this.#group.move(this.#translation);
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
      id: this.#group.id(),
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
    this.#group.move(minusTrans);
    // draw
    this.#layer.getKonvaLayer().draw();
    // callback
    this.onUndo({
      type: 'drawmove',
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

} // MoveGroupCommand class


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
   * The associated view controller.
   *
   * @type {ViewController}
   */
  #viewController;

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
   * @param {DrawLayer} layer The layer where to change the group.
   * @param {ViewController} viewController The associated viewController.
   * @param {Style} style The app style.
   */
  constructor(
    name, factory, startAnchor, endAnchor, layer, viewController, style) {
    this.#name = name;
    this.#factory = factory;
    this.#startAnchor = startAnchor;
    this.#endAnchor = endAnchor;
    this.#layer = layer;
    this.#viewController = viewController;
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
    // change shape
    this.#factory.update(
      this.#endAnchor,
      this.#style,
      this.#viewController
    );
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
    // invert change shape
    this.#factory.update(
      this.#startAnchor,
      this.#style,
      this.#viewController
    );
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
