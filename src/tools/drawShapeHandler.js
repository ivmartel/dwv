import {
  getMousePoint,
  customUI
} from '../gui/generic';
import {
  RemoveAnnotationCommand,
  UpdateAnnotationCommand
} from './drawCommands';
import {
  isNodeNameShape,
  isNodeNameLabel,
  validateGroupPosition
} from './drawBounds';
import {DrawShapeEditor} from './drawShapeEditor';
import {DrawTrash} from './drawTrash';

// external
import Konva from 'konva';

// doc imports
/* eslint-disable no-unused-vars */
import {App} from '../app/application';
import {Scalar2D} from '../math/scalar';
import {DrawLayer} from '../gui/drawLayer';
import {Annotation} from '../image/annotation';
import {Point2D} from '../math/point';
/* eslint-enable no-unused-vars */

/**
 * Draw shape handler: handle action on existing shapes.
 */
export class DrawShapeHandler {

  /**
   * Associated app.
   *
   * @type {App}
   */
  #app;

  /**
   * Shape editor.
   *
   * @type {DrawShapeEditor}
   */
  #shapeEditor;

  /**
   * Trash draw: a cross.
   *
   * @type {DrawTrash}
   */
  #trash;

  /**
   * Mouse cursor.
   *
   * @type {string}
   */
  #mouseOverCursor = 'pointer';

  /**
   * Original mouse cursor.
   *
   * @type {string}
   */
  #originalCursor;

  /**
   * Shape with mouse over.
   *
   * @type {Konva.Group}
   */
  #mouseOverShapeGroup;

  /**
   * Event callback.
   *
   * @type {Function}
   */
  #eventCallback;

  /**
   * @callback eventFn
   * @param {object} event The event.
   */

  /**
   * @param {App} app The associated application.
   * @param {Function} eventCallback Event callback.
   */
  constructor(app, eventCallback) {
    this.#app = app;
    this.#eventCallback = eventCallback;
    this.#shapeEditor = new DrawShapeEditor(app, eventCallback);
    this.#trash = new DrawTrash();
  }

  /**
   * Set the draw editor shape.
   *
   * @param {Konva.Shape} shape The shape to edit.
   * @param {DrawLayer} drawLayer The layer the shape belongs to.
   */
  setEditorShape(shape, drawLayer) {
    const drawController = drawLayer.getDrawController();
    if (shape &&
      shape instanceof Konva.Shape &&
      shape !== this.#shapeEditor.getShape() &&
      drawController.isAnnotationGroupEditable()) {
      // disable
      this.#shapeEditor.disable();
      // set shape
      this.#shapeEditor.setShape(
        shape,
        drawLayer,
        drawLayer.getDrawController().getAnnotation(shape.getParent().id()));
      // enable
      this.#shapeEditor.enable();
    }
  }

  /**
   * Get the currently edited shape group.
   *
   * @returns {Konva.Group|undefined} The edited group.
   */
  getEditorShapeGroup() {
    let res;
    if (this.#shapeEditor.isActive()) {
      res = this.#shapeEditor.getShape().getParent();
      if (!(res instanceof Konva.Group)) {
        return;
      }
    }
    return res;
  }

  /**
   * Get the currently edited annotation.
   *
   * @returns {Annotation|undefined} The edited annotation.
   */
  getEditorAnnotation() {
    let res;
    if (this.#shapeEditor.isActive()) {
      res = this.#shapeEditor.getAnnotation();
    }
    return res;
  }

  /**
   * Disable and reset the shape editor.
   */
  disableAndResetEditor() {
    this.#shapeEditor.disable();
    this.#shapeEditor.reset();
  }

  /**
   * Get the real position from an event.
   * TODO: use layer method?
   *
   * @param {Scalar2D} index The input index as {x,y}.
   * @param {DrawLayer} drawLayer The origin draw layer.
   * @returns {Scalar2D} The real position in the image as {x,y}.
   */
  #getRealPosition(index, drawLayer) {
    const stage = drawLayer.getKonvaStage();
    return {
      x: stage.offset().x + index.x / stage.scale().x,
      y: stage.offset().y + index.y / stage.scale().y
    };
  }

  /**
   * Store specific mouse over cursor.
   *
   * @param {string} cursor The cursor name.
   */
  storeMouseOverCursor(cursor) {
    this.#mouseOverCursor = cursor;
  }

  /**
   * Handle shape group mouseover.
   */
  #onMouseOverShapeGroup() {
    // mouse cursor
    this.#originalCursor = document.body.style.cursor;
    document.body.style.cursor = this.#mouseOverCursor;
    // shape opacity
    this.#mouseOverShapeGroup.opacity(0.75);
  }

  /**
   * Handle shape group mouseout.
   */
  onMouseOutShapeGroup() {
    // mouse cursor
    if (typeof this.#originalCursor !== 'undefined') {
      document.body.style.cursor = this.#originalCursor;
      this.#originalCursor = undefined;
    }
    // shape opacity
    if (typeof this.#mouseOverShapeGroup !== 'undefined') {
      this.#mouseOverShapeGroup.opacity(1);
    }
  }

  /**
   * Add shape group mouse over and out listeners: updates
   *   shape group opacity and cursor.
   *
   * @param {Konva.Group} shapeGroup The shape group.
   */
  #addShapeOverListeners(shapeGroup) {
    // handle mouse over
    shapeGroup.on('mouseover', () => {
      this.#mouseOverShapeGroup = shapeGroup;
      this.#onMouseOverShapeGroup();
    });

    // handle mouse out
    shapeGroup.on('mouseout', () => {
      this.onMouseOutShapeGroup();
      this.#mouseOverShapeGroup = undefined;
    });
  }

  /**
   * Remove shape group mouse over and out listeners.
   *
   * @param {Konva.Group} shapeGroup The shape group.
   */
  #removeShapeOverListeners(shapeGroup) {
    shapeGroup.off('mouseover');
    shapeGroup.off('mouseout');
  }

  /**
   * Add shape group listeners.
   *
   * @param {DrawLayer} drawLayer The origin draw layer.
   * @param {Konva.Group} shapeGroup The shape group to set on.
   * @param {Annotation} annotation The associated annotation.
   */
  addShapeListeners(drawLayer, shapeGroup, annotation) {
    // shape mouse over
    this.#addShapeOverListeners(shapeGroup);

    const konvaLayer = drawLayer.getKonvaLayer();

    // make shape draggable
    const shape = shapeGroup.getChildren(isNodeNameShape)[0];
    if (!(shape instanceof Konva.Shape)) {
      return;
    }
    shape.draggable(true);

    // make label draggable
    const label = shapeGroup.getChildren(isNodeNameLabel)[0];
    if (!(label instanceof Konva.Label)) {
      return;
    }
    label.draggable(true);

    // cache vars
    let dragStartPos;
    let previousPos;
    let originalProps;
    let colour;

    // shape listeners ------------------------------------------

    // drag start event handling
    shape.on('dragstart.draw', (event) => {
      // store colour
      colour = shape.stroke();
      // store pos
      dragStartPos = {
        x: shape.x(),
        y: shape.y()
      };
      previousPos = {
        x: event.target.x(),
        y: event.target.y()
      };
      // store original properties
      originalProps = {
        mathShape: annotation.mathShape,
        referencePoints: annotation.referencePoints
      };

      // display trash
      this.#trash.activate(drawLayer);
      // deactivate anchors to avoid events on null shape
      this.#shapeEditor.setAnchorsActive(false);
      // draw
      konvaLayer.draw();
    });
    // drag move event handling
    shape.on('dragmove.draw', (event) => {
      // move associated shapes (but not label)
      const diff = {
        x: event.target.x() - previousPos.x,
        y: event.target.y() - previousPos.y
      };
      const children = shapeGroup.getChildren();
      const labelWithDefaultPosition =
        typeof annotation.labelPosition === 'undefined';
      for (const child of children) {
        // skip shape and label with defined position
        if (child === event.target ||
          (child.name() === 'label' && !labelWithDefaultPosition)
        ) {
          continue;
        }
        // move other nodes
        child.move(diff);
      }

      // store pos
      previousPos = {
        x: event.target.x(),
        y: event.target.y()
      };

      // validate the group position
      validateGroupPosition(drawLayer.getBaseSize(), shapeGroup);

      // get appropriate factory
      const factory = annotation.getFactory();
      // update annotation
      factory.updateAnnotationOnTranslation(annotation, diff);
      // update label
      factory.updateLabelContent(annotation, shapeGroup, this.#app.getStyle());

      // highlight trash when on it
      const mousePoint = getMousePoint(event.evt);
      const offset = {
        x: mousePoint.getX(),
        y: mousePoint.getY()
      };
      const eventPos = this.#getRealPosition(offset, drawLayer);
      this.#trash.changeChildrenColourOnTrashHover(eventPos,
        shapeGroup, colour);
      // draw
      konvaLayer.draw();
    });
    // drag end event handling
    shape.on('dragend.draw', (event) => {
      // remove trash
      this.#trash.remove();
      // activate(false) will also trigger a dragend.draw
      if (typeof event === 'undefined' ||
        typeof event.evt === 'undefined') {
        return;
      }
      const pos = {x: shape.x(), y: shape.y()};
      // delete case
      const mousePoint = getMousePoint(event.evt);
      const offset = {
        x: mousePoint.getX(),
        y: mousePoint.getY()
      };
      const eventPos = this.#getRealPosition(offset, drawLayer);
      if (this.#trash.isOverTrash(eventPos)) {
        // compensate for the drag translation
        shapeGroup.x(dragStartPos.x);
        shapeGroup.y(dragStartPos.y);
        // disable editor
        this.#shapeEditor.disable();
        this.#shapeEditor.reset();
        this.#trash.changeGroupChildrenColour(shapeGroup, colour);
        // reset math shape (for undo)
        annotation.mathShape = originalProps.mathShape;
        annotation.referencePoints = originalProps.referencePoints;

        // create remove annotation command
        const command = new RemoveAnnotationCommand(
          annotation,
          drawLayer.getDrawController()
        );
        // add command to undo stack
        this.#app.addToUndoStack(command);
        // execute command: triggers draw remove
        command.execute();

        // reset cursor
        this.onMouseOutShapeGroup();
      } else {
        const translation = {
          x: pos.x - dragStartPos.x,
          y: pos.y - dragStartPos.y
        };
        if (translation.x !== 0 || translation.y !== 0) {
          // update annotation command
          const newProps = {
            mathShape: annotation.mathShape,
            referencePoints: annotation.referencePoints
          };
          const command = new UpdateAnnotationCommand(
            annotation,
            originalProps,
            newProps,
            drawLayer.getDrawController()
          );
          // add command to undo stack
          this.#app.addToUndoStack(command);
          // fire event manually since command is not executed
          this.#eventCallback({
            type: 'annotationupdate',
            data: annotation,
            dataid: drawLayer.getDataId(),
            keys: Object.keys(newProps)
          });
          // update original shape
          originalProps = {
            mathShape: newProps.mathShape,
            referencePoints: newProps.referencePoints
          };
        }
        // reset anchors
        this.#shapeEditor.setAnchorsActive(true);
        this.#shapeEditor.resetAnchors();
      }
      // draw
      konvaLayer.draw();
      // reset start position
      dragStartPos = {
        x: shape.x(),
        y: shape.y()
      };
    });

    // label listeners ------------------------------------------
    let originalLabelPosition;

    // drag start event handling
    label.on('dragstart.draw', (/*event*/) => {
      // store pos
      dragStartPos = {
        x: label.x(),
        y: label.y()
      };
      // store original position
      originalLabelPosition = annotation.labelPosition;
    });
    // drag end event handling
    label.on('dragend.draw', (/*event*/) => {
      const translation = {
        x: label.x() - dragStartPos.x,
        y: label.y() - dragStartPos.y
      };
      if (translation.x !== 0 || translation.y !== 0) {
        const newLabelPosition = new Point2D(label.x(), label.y());
        // set label position
        annotation.labelPosition = newLabelPosition;
        // update annotation command
        const command = new UpdateAnnotationCommand(
          annotation,
          {labelPosition: originalLabelPosition},
          {labelPosition: newLabelPosition},
          drawLayer.getDrawController()
        );
        // add command to undo stack
        this.#app.addToUndoStack(command);
        // fire event manually since command is not executed
        this.#eventCallback({
          type: 'annotationupdate',
          data: annotation,
          dataid: drawLayer.getDataId(),
          keys: ['labelPosition']
        });
        // update original position
        originalLabelPosition = newLabelPosition;
      }
      dragStartPos = {x: shape.x(), y: shape.y()};
    });

    // double click handling: update label
    shapeGroup.on('dblclick', () => {
      // original text expr
      const originalTextExpr = annotation.textExpr;

      const onSaveCallback = (annotation) => {
        // new text expr
        const newTextExpr = annotation.textExpr;
        // create annotation update command
        const command = new UpdateAnnotationCommand(
          annotation,
          {textExpr: originalTextExpr},
          {textExpr: newTextExpr},
          drawLayer.getDrawController()
        );
        // add command to undo stack
        this.#app.addToUndoStack(command);
        // execute command
        command.execute();
      };

      // call roi dialog
      customUI.openRoiDialog(annotation, onSaveCallback);
    });
  }

  /**
   * Remove shape group listeners.
   *
   * @param {Konva.Group} shapeGroup The shape group to set off.
   */
  removeShapeListeners(shapeGroup) {
    // mouse over
    this.#removeShapeOverListeners(shapeGroup);
    // double click
    shapeGroup.off('dblclick');
    // remove listeners from shape
    const shape = shapeGroup.getChildren(isNodeNameShape)[0];
    if (shape instanceof Konva.Shape) {
      shape.draggable(false);
      shape.off('dragstart.draw');
      shape.off('dragmove.draw');
      shape.off('dragend.draw');
    }
    // remove listeners from label
    const label = shapeGroup.getChildren(isNodeNameLabel)[0];
    if (label instanceof Konva.Label) {
      label.draggable(false);
      label.off('dragstart.draw');
      label.off('dragend.draw');
    }
  }
} // DrawShapeHandler class