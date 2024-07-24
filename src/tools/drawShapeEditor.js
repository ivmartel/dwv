import {logger} from '../utils/logger';
import {UpdateAnnotationCommand} from './drawCommands';
import {validateAnchorPosition} from './drawBounds';
// external
import Konva from 'konva';

// doc imports
/* eslint-disable no-unused-vars */
import {App} from '../app/application';
import {DrawLayer} from '../gui/drawLayer';
import {Annotation} from '../image/annotation';
/* eslint-enable no-unused-vars */

/**
 * Draw shape editor.
 */
export class DrawShapeEditor {

  /**
   * Associated app.
   *
   * @type {App}
   */
  #app;

  /**
   * Event callback.
   *
   * @type {Function}
   */
  #eventCallback;

  /**
   * @param {App} app The associated application.
   * @param {Function} eventCallback Event callback.
   */
  constructor(app, eventCallback) {
    this.#app = app;
    this.#eventCallback = eventCallback;
  }

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
   * The associated annotation.
   *
   * @type {Annotation}
   */
  #annotation;

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
   * Set the shape to edit.
   *
   * @param {Konva.Shape} inshape The shape to edit.
   * @param {DrawLayer} drawLayer The associated draw layer.
   * @param {Annotation} annotation The associated annotation.
   */
  setShape(inshape, drawLayer, annotation) {
    this.#shape = inshape;
    this.#drawLayer = drawLayer;
    this.#annotation = annotation;

    if (this.#shape) {
      // remove old anchors
      this.#removeAnchors();

      this.#currentFactory = annotation.getFactory();
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
   * Get the edited annotation.
   *
   * @returns {Annotation} The annotation.
   */
  getAnnotation() {
    return this.#annotation;
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
    this.#annotation = undefined;
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
  // #getClone(anchor) {
  //   // create closure to properties
  //   const parent = anchor.getParent();
  //   const id = anchor.id();
  //   const x = anchor.x();
  //   const y = anchor.y();
  //   // create clone object
  //   const clone = {};
  //   clone.getParent = function () {
  //     return parent;
  //   };
  //   clone.id = function () {
  //     return id;
  //   };
  //   clone.x = function () {
  //     return x;
  //   };
  //   clone.y = function () {
  //     return y;
  //   };
  //   return clone;
  // }

  /**
   * Set the anchor on listeners.
   *
   * @param {Konva.Ellipse} anchor The anchor to set on.
   */
  #setAnchorOn(anchor) {
    let originalProps;

    // drag start listener
    anchor.on('dragstart.edit', (event) => {
      // prevent bubbling upwards
      event.cancelBubble = true;
      // store original properties
      originalProps = {
        mathShape: this.#annotation.mathShape,
        referencePoints: this.#annotation.referencePoints
      };
    });
    // drag move listener
    anchor.on('dragmove.edit', (event) => {
      const anchor = event.target;
      if (!(anchor instanceof Konva.Shape)) {
        return;
      }
      // validate the anchor position
      validateAnchorPosition(this.#drawLayer.getBaseSize(), anchor);
      if (typeof this.#currentFactory.constrainAnchorMove !== 'undefined') {
        this.#currentFactory.constrainAnchorMove(anchor);
      }

      // udpate annotation
      this.#currentFactory.updateAnnotationOnAnchorMove(
        this.#annotation, anchor);
      // udpate shape
      this.#currentFactory.updateShapeGroupOnAnchorMove(
        this.#annotation, anchor, this.#app.getStyle());

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
      // update annotation command
      const newProps = {
        mathShape: this.#annotation.mathShape,
        referencePoints: this.#annotation.referencePoints
      };
      const command = new UpdateAnnotationCommand(
        this.#annotation,
        originalProps,
        newProps,
        this.#drawLayer.getDrawController()
      );
      // add command to undo stack
      this.#app.addToUndoStack(command);
      // fire event manually since command is not executed
      this.#eventCallback({
        type: 'annotationupdate',
        data: this.#annotation,
        dataid: this.#drawLayer.getDataId(),
        keys: Object.keys(newProps)
      });
      // update original properties
      originalProps = {
        mathShape: newProps.mathShape,
        referencePoints: newProps.referencePoints
      };

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
