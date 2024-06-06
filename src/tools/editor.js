import {logger} from '../utils/logger';
import {getShapeDisplayName, ChangeGroupCommand} from './drawCommands';
import {validateAnchorPosition} from './draw';
// external
import Konva from 'konva';

// doc imports
/* eslint-disable no-unused-vars */
import {App} from '../app/application';
import {ViewController} from '../app/viewController';
import {DrawLayer} from '../gui/drawLayer';
import {Style} from '../gui/style';
/* eslint-enable no-unused-vars */

/**
 * Get the default anchor shape.
 *
 * @param {number} x The X position.
 * @param {number} y The Y position.
 * @param {string} id The shape id.
 * @param {Style} style The application style.
 * @returns {Konva.Ellipse} The default anchor shape.
 */
export function getDefaultAnchor(x, y, id, style) {
  const radius = style.applyZoomScale(3);
  const absRadius = {
    x: Math.abs(radius.x),
    y: Math.abs(radius.y)
  };
  return new Konva.Ellipse({
    x: x,
    y: y,
    stroke: '#999',
    fill: 'rgba(100,100,100,0.7',
    strokeWidth: style.getStrokeWidth(),
    strokeScaleEnabled: false,
    radius: absRadius,
    radiusX: absRadius.x,
    radiusY: absRadius.y,
    name: 'anchor',
    id: id.toString(),
    dragOnTop: false,
    draggable: true,
    visible: false
  });
}

/**
 * Shape editor.
 */
export class ShapeEditor {

  /**
   * Associated app.
   *
   * @type {App}
   */
  #app;

  /**
   * @param {App} app The associated application.
   */
  constructor(app) {
    this.#app = app;
  }

  /**
   * Shape factory list.
   *
   * @type {object}
   */
  #shapeFactoryList = null;

  /**
   * Current shape factory.
   *
   * @type {object}
   */
  #currentFactory = null;

  /**
   * Edited shape.
   *
   * @type {Konva.Shape}
   */
  #shape = null;

  /**
   * Associated draw layer. Used to bound anchor move.
   *
   * @type {DrawLayer}
   */
  #drawLayer;

  /**
   * Associated view controller. Used for quantification update.
   *
   * @type {ViewController}
   */
  #viewController = null;

  /**
   * Active flag.
   *
   * @type {boolean}
   */
  #isActive = false;

  /**
   * @callback eventFn
   * @param {object} event The event.
   */

  /**
   * Draw event callback.
   *
   * @type {eventFn}
   */
  #drawEventCallback = null;

  /**
   * Set the tool options.
   *
   * @param {Array} list The list of shape classes.
   */
  setFactoryList(list) {
    this.#shapeFactoryList = list;
  }

  /**
   * Set the shape to edit.
   *
   * @param {Konva.Shape} inshape The shape to edit.
   * @param {DrawLayer} drawLayer The associated draw layer.
   * @param {ViewController} viewController The associated view controller.
   */
  setShape(inshape, drawLayer, viewController) {
    this.#shape = inshape;
    this.#drawLayer = drawLayer;
    this.#viewController = viewController;
    if (this.#shape) {
      // remove old anchors
      this.#removeAnchors();
      // find a factory for the input shape
      const group = this.#shape.getParent();
      const keys = Object.keys(this.#shapeFactoryList);
      this.#currentFactory = null;
      for (let i = 0; i < keys.length; ++i) {
        const factory = new this.#shapeFactoryList[keys[i]];
        if (factory.isFactoryGroup(group)) {
          this.#currentFactory = factory;
          // stop at first find
          break;
        }
      }
      if (this.#currentFactory === null) {
        throw new Error('Could not find a factory to update shape.');
      }
      // add new anchors
      this.#addAnchors();
    }
  }

  /**
   * Get the edited shape.
   *
   * @returns {Konva.Shape} The edited shape.
   */
  getShape() {
    return this.#shape;
  }

  /**
   * Get the active flag.
   *
   * @returns {boolean} The active flag.
   */
  isActive() {
    return this.#isActive;
  }

  /**
   * Set the draw event callback.
   *
   * @param {eventFn} callback The callback.
   */
  setDrawEventCallback(callback) {
    this.#drawEventCallback = callback;
  }

  /**
   * Enable the editor. Redraws the layer.
   */
  enable() {
    this.#isActive = true;
    if (this.#shape) {
      this.#setAnchorsVisible(true);
      if (this.#shape.getLayer()) {
        this.#shape.getLayer().draw();
      }
    }
  }

  /**
   * Disable the editor. Redraws the layer.
   */
  disable() {
    this.#isActive = false;
    if (this.#shape) {
      this.#setAnchorsVisible(false);
      if (this.#shape.getLayer()) {
        this.#shape.getLayer().draw();
      }
    }
  }

  /**
   * Reset the editor.
   */
  reset() {
    this.#shape = undefined;
    this.#drawLayer = undefined;
    this.#viewController = undefined;
  }

  /**
   * Reset the anchors.
   */
  resetAnchors() {
    // remove previous controls
    this.#removeAnchors();
    // add anchors
    this.#addAnchors();
    // set them visible
    this.#setAnchorsVisible(true);
  }

  /**
   * Apply a function on all anchors.
   *
   * @param {object} func A f(shape) function.
   */
  #applyFuncToAnchors(func) {
    if (this.#shape && this.#shape.getParent()) {
      const anchors = this.#shape.getParent().find('.anchor');
      anchors.forEach(func);
    }
  }

  /**
   * Set anchors visibility.
   *
   * @param {boolean} flag The visible flag.
   */
  #setAnchorsVisible(flag) {
    this.#applyFuncToAnchors(function (anchor) {
      anchor.visible(flag);
    });
  }

  /**
   * Set anchors active.
   *
   * @param {boolean} flag The active (on/off) flag.
   */
  setAnchorsActive(flag) {
    let func = null;
    if (flag) {
      func = (anchor) => {
        this.#setAnchorOn(anchor);
      };
    } else {
      func = (anchor) => {
        this.#setAnchorOff(anchor);
      };
    }
    this.#applyFuncToAnchors(func);
  }

  /**
   * Remove anchors.
   */
  #removeAnchors() {
    this.#applyFuncToAnchors(function (anchor) {
      anchor.remove();
    });
  }

  /**
   * Add the shape anchors.
   */
  #addAnchors() {
    // exit if no shape or no layer
    if (!this.#shape || !this.#shape.getLayer()) {
      return;
    }
    // get shape group
    const group = this.#shape.getParent();

    // activate and add anchors to group
    const anchors =
      this.#currentFactory.getAnchors(this.#shape, this.#app.getStyle());
    for (let i = 0; i < anchors.length; ++i) {
      // set anchor on
      this.#setAnchorOn(anchors[i]);
      // add the anchor to the group
      group.add(anchors[i]);
    }
  }

  /**
   * Get a simple clone of the input anchor.
   *
   * @param {Konva.Shape} anchor The anchor to clone.
   * @returns {object} A clone of the input anchor.
   */
  #getClone(anchor) {
    // create closure to properties
    const parent = anchor.getParent();
    const id = anchor.id();
    const x = anchor.x();
    const y = anchor.y();
    // create clone object
    const clone = {};
    clone.getParent = function () {
      return parent;
    };
    clone.id = function () {
      return id;
    };
    clone.x = function () {
      return x;
    };
    clone.y = function () {
      return y;
    };
    return clone;
  }

  /**
   * Set the anchor on listeners.
   *
   * @param {Konva.Ellipse} anchor The anchor to set on.
   */
  #setAnchorOn(anchor) {
    let startAnchor = null;

    // command name based on shape type
    const shapeDisplayName = getShapeDisplayName(this.#shape);

    // drag start listener
    anchor.on('dragstart.edit', (event) => {
      const anchor = event.target;
      if (!(anchor instanceof Konva.Shape)) {
        return;
      }
      startAnchor = this.#getClone(anchor);
      // prevent bubbling upwards
      event.cancelBubble = true;
    });
    // drag move listener
    anchor.on('dragmove.edit', (event) => {
      const anchor = event.target;
      if (!(anchor instanceof Konva.Shape)) {
        return;
      }
      // validate the anchor position
      validateAnchorPosition(this.#drawLayer.getBaseSize(), anchor);
      // update shape
      this.#currentFactory.update(
        anchor, this.#app.getStyle(), this.#viewController);
      // redraw
      if (anchor.getLayer()) {
        anchor.getLayer().draw();
      } else {
        logger.warn('No layer to draw the anchor!');
      }
      // prevent bubbling upwards
      event.cancelBubble = true;
    });
    // drag end listener
    anchor.on('dragend.edit', (event) => {
      const anchor = event.target;
      if (!(anchor instanceof Konva.Shape)) {
        return;
      }
      const endAnchor = this.#getClone(anchor);
      // store the change command
      const chgcmd = new ChangeGroupCommand(
        shapeDisplayName,
        this.#currentFactory,
        startAnchor,
        endAnchor,
        this.#drawLayer,
        this.#viewController,
        this.#app.getStyle()
      );
      chgcmd.onExecute = this.#drawEventCallback;
      chgcmd.onUndo = this.#drawEventCallback;
      chgcmd.execute();
      this.#app.addToUndoStack(chgcmd);
      // reset start anchor
      startAnchor = endAnchor;
      // prevent bubbling upwards
      event.cancelBubble = true;
    });
    // mouse down listener
    anchor.on('mousedown touchstart', (event) => {
      const anchor = event.target;
      anchor.moveToTop();
    });
    // mouse over styling
    anchor.on('mouseover.edit', (event) => {
      const anchor = event.target;
      if (!(anchor instanceof Konva.Shape)) {
        return;
      }
      // style is handled by the group
      anchor.stroke('#ddd');
      if (anchor.getLayer()) {
        anchor.getLayer().draw();
      } else {
        logger.warn('No layer to draw the anchor!');
      }
    });
    // mouse out styling
    anchor.on('mouseout.edit', (event) => {
      const anchor = event.target;
      if (!(anchor instanceof Konva.Shape)) {
        return;
      }
      // style is handled by the group
      anchor.stroke('#999');
      if (anchor.getLayer()) {
        anchor.getLayer().draw();
      } else {
        logger.warn('No layer to draw the anchor!');
      }
    });
  }

  /**
   * Set the anchor off listeners.
   *
   * @param {Konva.Ellipse} anchor The anchor to set off.
   */
  #setAnchorOff(anchor) {
    anchor.off('dragstart.edit');
    anchor.off('dragmove.edit');
    anchor.off('dragend.edit');
    anchor.off('mousedown touchstart');
    anchor.off('mouseover.edit');
    anchor.off('mouseout.edit');
  }

} // class Editor
