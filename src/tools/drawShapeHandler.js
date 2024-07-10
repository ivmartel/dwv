import {
  getMousePoint,
  customUI
} from '../gui/generic';
import {
  getShapeDisplayName,
  DeleteGroupCommand,
  MoveShapeCommand
} from './drawCommands';
import {
  isNodeNameShape,
  isNodeNameLabel,
  validateGroupPosition
} from './drawBounds';
import {ShapeEditor} from './editor';
import {DrawTrash} from './drawTrash';

// external
import Konva from 'konva';

// doc imports
/* eslint-disable no-unused-vars */
import {App} from '../app/application';
import {LayerGroup} from '../gui/layerGroup';
import {Scalar2D} from '../math/scalar';
import {DrawLayer} from '../gui/drawLayer';
import {Annotation} from '../image/annotation';
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
   * @type {ShapeEditor}
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
   * @callback eventFn
   * @param {object} event The event.
   */

  /**
   * Draw event callback.
   *
   * @type {eventFn}
   */
  #drawEventCallback;

  /**
   * @param {App} app The associated application.
   * @param {eventFn} callback The draw event callback.
   */
  constructor(app, callback) {
    this.#app = app;
    this.#drawEventCallback = callback;

    this.#shapeEditor = new ShapeEditor(app);
    this.#shapeEditor.setDrawEventCallback(callback);

    this.#trash = new DrawTrash();
  }

  /**
   * Set the draw editor shape.
   *
   * @param {Konva.Shape} shape The shape to edit.
   * @param {DrawLayer} drawLayer The layer the shape belongs to.
   */
  setEditorShape(shape, drawLayer) {
    if (shape &&
      shape instanceof Konva.Shape &&
      shape !== this.#shapeEditor.getShape()) {
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
   * @param {LayerGroup} layerGroup The origin layer group.
   * @returns {Scalar2D} The real position in the image as {x,y}.
   */
  #getRealPosition(index, layerGroup) {
    const drawLayer = layerGroup.getActiveDrawLayer();
    const stage = drawLayer.getKonvaStage();
    return {
      x: stage.offset().x + index.x / stage.scale().x,
      y: stage.offset().y + index.y / stage.scale().y
    };
  }

  /**
   * Create a delete group command, execute it and add
   *   it to the undo stack.
   *
   * @param {DrawLayer} drawLayer The associated layer.
   * @param {Konva.Group} shapeGroup The shape group to delete.
   * @param {Konva.Shape} shape The shape to delete.
   */
  #emitDeleteCommand(drawLayer, shapeGroup, shape) {
    if (!(shape instanceof Konva.Shape)) {
      return;
    }

    const shapeDisplayName = getShapeDisplayName(shape);
    // delete command
    const delcmd = new DeleteGroupCommand(
      shapeGroup,
      shapeDisplayName,
      drawLayer
    );
    delcmd.onExecute = this.#drawEventCallback;
    delcmd.onUndo = this.#drawEventCallback;
    // execute it
    delcmd.execute();
    // add it to undo stack
    this.#app.addToUndoStack(delcmd);
  }

  /**
   * Create a move group command and add
   *   it to the undo stack. To no execute it.
   *
   * @param {DrawLayer} drawLayer The associated layer.
   * @param {Konva.Shape|Konva.Label} shape The shape to move.
   * @param {object} translation The move translation as {x,y}.
   * @param {boolean} isLabelLinked Flag for shape-label link.
   */
  #storeMoveCommand(drawLayer, shape, translation, isLabelLinked) {
    const mvcmd = new MoveShapeCommand(
      shape,
      translation,
      drawLayer,
      isLabelLinked
    );
    mvcmd.onExecute = this.#drawEventCallback;
    mvcmd.onUndo = this.#drawEventCallback;
    // add it to undo stack
    this.#app.addToUndoStack(mvcmd);
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
   * @param {LayerGroup} layerGroup The origin layer group.
   * @param {Konva.Group} shapeGroup The shape group to set on.
   * @param {Annotation} annotation The associated annnotation.
   */
  addShapeListeners(layerGroup, shapeGroup, annotation) {
    // shape mouse over
    this.#addShapeOverListeners(shapeGroup);

    const drawLayer = layerGroup.getActiveDrawLayer();
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

    let isShapeLabelLinked = true;

    // cache position
    let dragStartPos;
    let previousPos;

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
      for (const child of children) {
        // skip shape and label
        if (child === event.target ||
          (child.name() === 'label' && !isShapeLabelLinked)
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
      const eventPos = this.#getRealPosition(offset, layerGroup);
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
      const eventPos = this.#getRealPosition(offset, layerGroup);
      if (this.#trash.isOverTrash(eventPos)) {
        // compensate for the drag translation
        shapeGroup.x(dragStartPos.x);
        shapeGroup.y(dragStartPos.y);
        // disable editor
        this.#shapeEditor.disable();
        this.#shapeEditor.reset();
        this.#trash.changeGroupChildrenColour(shapeGroup, colour);
        this.#emitDeleteCommand(drawLayer, shapeGroup, shape);
        // reset cursor
        this.onMouseOutShapeGroup();
      } else {
        const translation = {
          x: pos.x - dragStartPos.x,
          y: pos.y - dragStartPos.y
        };
        if (translation.x !== 0 || translation.y !== 0) {
          // the move is handled by Konva, create a command but
          // do not execute it
          this.#storeMoveCommand(
            drawLayer, shape, translation, isShapeLabelLinked);
          // manually trigger a move event
          this.#drawEventCallback({
            type: 'drawmove',
            id: shapeGroup.id(),
            srclayerid: drawLayer.getId(),
            dataid: drawLayer.getDataId()
          });
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

    // drag start event handling
    label.on('dragstart.draw', (/*event*/) => {
      // unlink shape and label at first label move
      isShapeLabelLinked = false;
      // store pos
      dragStartPos = {
        x: label.x(),
        y: label.y()
      };
    });
    // drag end event handling
    label.on('dragend.draw', (/*event*/) => {
      const translation = {
        x: label.x() - dragStartPos.x,
        y: label.y() - dragStartPos.y
      };
      if (translation.x !== 0 || translation.y !== 0) {
        this.#storeMoveCommand(
          drawLayer, label, translation, isShapeLabelLinked);
        // the move is handled by Konva, trigger an event manually
        this.#drawEventCallback({
          type: 'drawmove',
          id: shapeGroup.id(),
          srclayerid: drawLayer.getId(),
          dataid: drawLayer.getDataId()
        });
      }
      dragStartPos = {x: shape.x(), y: shape.y()};
    });

    // double click handling: update label
    shapeGroup.on('dblclick', (event) => {
      const group = event.currentTarget;
      if (!(group instanceof Konva.Group)) {
        return;
      }
      // get the label object for this shape
      const label = group.findOne('Label');
      if (!(label instanceof Konva.Label)) {
        return;
      }
      // should just be one
      if (typeof label === 'undefined') {
        throw new Error('Could not find the shape label.');
      }
      const ktext = label.getText();
      // id for event
      const groupId = group.id();

      const onSaveCallback = (annotation) => {
        // update text expression
        const text = annotation.getText();
        ktext.setText(text);
        // hide label if no text
        label.visible(text.length !== 0);

        // trigger event
        this.#drawEventCallback({
          type: 'drawchange',
          id: groupId,
          srclayerid: drawLayer.getId(),
          dataid: drawLayer.getDataId()
        });
        // draw
        konvaLayer.draw();
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
    // remove listeners from shape
    const shape = shapeGroup.getChildren(isNodeNameShape)[0];
    if (shape instanceof Konva.Shape) {
      shape.draggable(false);
      shape.off('dragstart.draw');
      shape.off('dragmove.draw');
      shape.off('dragend.draw');
      shape.off('dblclick');
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