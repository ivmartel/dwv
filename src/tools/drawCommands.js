// external
import Konva from 'konva';

/**
 * Get the display name of the input shape.
 *
 * @param {object} shape The Konva shape.
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
 *
 * @param {object} group The group draw.
 * @param {string} name The shape display name.
 * @param {object} layer The layer where to draw the group.
 * @param {boolean} silent Whether to send a creation event or not.
 * @class
 */
export class DrawGroupCommand {

  #group;
  #name;
  #layer;
  #isSilent;
  #parent;

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
    this.#layer.draw();
    // callback
    if (!this.#isSilent) {
      /**
       * Draw create event.
       *
       * @event DrawGroupCommand#drawcreate
       * @type {object}
       * @property {number} id The id of the create draw.
       */
      this.onExecute({
        type: 'drawcreate',
        id: this.#group.id()
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
    this.#layer.draw();
    // callback
    this.onUndo({
      type: 'drawdelete',
      id: this.#group.id()
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
 *
 * @param {object} group The group draw.
 * @param {string} name The shape display name.
 * @param {object} translation A 2D translation to move the group by.
 * @param {object} layer The layer where to move the group.
 * @class
 */
export class MoveGroupCommand {

  #group;
  #name;
  #translation;
  #layer;

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
    this.#layer.draw();
    // callback
    /**
     * Draw move event.
     *
     * @event MoveGroupCommand#drawmove
     * @type {object}
     * @property {number} id The id of the create draw.
     */
    this.onExecute({
      type: 'drawmove',
      id: this.#group.id()
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
    this.#layer.draw();
    // callback
    this.onUndo({
      type: 'drawmove',
      id: this.#group.id()
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
 *
 * @param {string} name The shape display name.
 * @param {object} func The change function.
 * @param {object} startAnchor The anchor that starts the change.
 * @param {object} endAnchor The anchor that ends the change.
 * @param {object} layer The layer where to change the group.
 * @param {object} viewController The associated viewController.
 * @param {object} style The app style.
 * @class
 */
export class ChangeGroupCommand {

  #name;
  #factory;
  #startAnchor;
  #endAnchor;
  #layer;
  #viewController;
  #style;

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
    this.#layer.draw();
    // callback
    /**
     * Draw change event.
     *
     * @event ChangeGroupCommand#drawchange
     * @type {object}
     */
    this.onExecute({
      type: 'drawchange',
      id: this.#endAnchor.getParent().id()
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
    this.#layer.draw();
    // callback
    this.onUndo({
      type: 'drawchange',
      id: this.#startAnchor.getParent().id()
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
 *
 * @param {object} group The group draw.
 * @param {string} name The shape display name.
 * @param {object} layer The layer where to delete the group.
 * @class
 */
export class DeleteGroupCommand {

  #group;
  #name;
  #layer;
  #parent;

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
    this.#layer.draw();
    // callback
    /**
     * Draw delete event.
     *
     * @event DeleteGroupCommand#drawdelete
     * @type {object}
     * @property {number} id The id of the create draw.
     */
    this.onExecute({
      type: 'drawdelete',
      id: this.#group.id()
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
    this.#layer.draw();
    // callback
    this.onUndo({
      type: 'drawcreate',
      id: this.#group.id()
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
