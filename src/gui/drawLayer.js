import {ListenerHandler} from '../utils/listen';
import {DrawController} from '../app/drawController';
import {getScaledOffset} from './layerGroup';
import {InteractionEventNames} from './generic';
import {logger} from '../utils/logger';
import {toStringId} from '../utils/array';
import {precisionRound} from '../utils/string';
import {AddAnnotationCommand} from '../tools/drawCommands';
import {
  isNodeWithId,
  isPositionNode,
  isNodeNameShape,
  isNodeNameLabel
} from '../tools/drawBounds';
import {Style} from '../gui/style';
import {Line} from '../math/line';
import {Rectangle} from '../math/rectangle';
import {ROI} from '../math/roi';
import {Protractor} from '../math/protractor';
import {Ellipse} from '../math/ellipse';
import {Circle} from '../math/circle';
import {Point2D} from '../math/point';

// external
import Konva from 'konva';

// doc imports
/* eslint-disable no-unused-vars */
import {Point, Point3D} from '../math/point';
import {Index} from '../math/index';
import {Vector3D} from '../math/vector';
import {Scalar2D, Scalar3D} from '../math/scalar';
import {PlaneHelper} from '../image/planeHelper';
import {Annotation} from '../image/annotation';
import {AnnotationGroup} from '../image/annotationGroup';
import {DrawShapeHandler} from '../tools/drawShapeHandler';
/* eslint-enable no-unused-vars */

/**
 * Debug function to output the layer hierarchy as text.
 *
 * @param {object} layer The Konva layer.
 * @param {string} prefix A display prefix (used in recursion).
 * @returns {string} A text representation of the hierarchy.
 */
// function getHierarchyLog(layer, prefix) {
//   if (typeof prefix === 'undefined') {
//     prefix = '';
//   }
//   const kids = layer.getChildren();
//   let log = prefix + '|__ ' + layer.name() + ': ' + layer.id() + '\n';
//   for (let i = 0; i < kids.length; ++i) {
//     log += getHierarchyLog(kids[i], prefix + '    ');
//   }
//   return log;
// }

/**
 * Draw layer.
 */
export class DrawLayer {

  /**
   * The container div.
   *
   * @type {HTMLDivElement}
   */
  #containerDiv;

  /**
   * Konva stage.
   *
   * @type {Konva.Stage}
   */
  #konvaStage = null;

  /**
   * The layer base size as {x,y}.
   *
   * @type {Scalar2D}
   */
  #baseSize;

  /**
   * The layer base spacing as {x,y}.
   *
   * @type {Scalar2D}
   */
  #baseSpacing;

  /**
   * The layer fit scale.
   *
   * @type {Scalar2D}
   */
  #fitScale = {x: 1, y: 1};

  /**
   * The layer flip scale.
   *
   * @type {Scalar3D}
   */
  #flipScale = {x: 1, y: 1, z: 1};

  /**
   * The base layer offset.
   *
   * @type {Scalar2D}
   */
  #baseOffset = {x: 0, y: 0};

  /**
   * The view offset.
   *
   * @type {Scalar2D}
   */
  #viewOffset = {x: 0, y: 0};

  /**
   * The zoom offset.
   *
   * @type {Scalar2D}
   */
  #zoomOffset = {x: 0, y: 0};

  /**
   * The flip offset.
   *
   * @type {Scalar2D}
   */
  #flipOffset = {x: 0, y: 0};

  /**
   * The draw controller.
   *
   * @type {DrawController}
   */
  #drawController;

  /**
   * The plane helper.
   *
   * @type {PlaneHelper}
   */
  #planeHelper;

  /**
   * The associated data id.
   *
   * @type {string}
   */
  #dataId;

  /**
   * The reference layer id.
   *
   * @type {string}
   */
  #referenceLayerId;

  /**
   * Current position group id.
   *
   * @type {string}
   */
  #currentPosGroupId = null;

  /**
   * Draw shape handler.
   *
   * @type {DrawShapeHandler|undefined}
   */
  #shapeHandler;

  /**
   * Visible labels flag.
   *
   * @type {boolean}
   */
  #visibleLabels = true;

  /**
   * @param {HTMLDivElement} containerDiv The layer div, its id will be used
   *   as this layer id.
   */
  constructor(containerDiv) {
    this.#containerDiv = containerDiv;
    // specific css class name
    this.#containerDiv.className += ' drawLayer';
  }

  /**
   * Set the draw shape handler.
   *
   * @param {DrawShapeHandler|undefined} handler The shape handler.
   */
  setShapeHandler(handler) {
    this.#shapeHandler = handler;
  }

  /**
   * Get the associated data id.
   *
   * @returns {string} The id.
   */
  getDataId() {
    return this.#dataId;
  }

  /**
   * Get the reference data id.
   *
   * @returns {string} The id.
   */
  getReferenceLayerId() {
    return this.#referenceLayerId;
  }

  /**
   * Listener handler.
   *
   * @type {ListenerHandler}
   */
  #listenerHandler = new ListenerHandler();

  /**
   * Get the Konva stage.
   *
   * @returns {Konva.Stage} The stage.
   */
  getKonvaStage() {
    return this.#konvaStage;
  }

  /**
   * Get the Konva layer.
   *
   * @returns {Konva.Layer} The layer.
   */
  getKonvaLayer() {
    // there should only be one layer
    return this.#konvaStage.getLayers()[0];
  }

  /**
   * Get the draw controller.
   *
   * @returns {DrawController} The controller.
   */
  getDrawController() {
    return this.#drawController;
  }

  /**
   * Set the plane helper.
   *
   * @param {PlaneHelper} helper The helper.
   */
  setPlaneHelper(helper) {
    this.#planeHelper = helper;
  }

  // common layer methods [start] ---------------

  /**
   * Get the id of the layer.
   *
   * @returns {string} The string id.
   */
  getId() {
    return this.#containerDiv.id;
  }

  /**
   * Remove the HTML element from the DOM.
   */
  removeFromDOM() {
    this.#containerDiv.remove();
  }

  /**
   * Get the layer base size (without scale).
   *
   * @returns {Scalar2D} The size as {x,y}.
   */
  getBaseSize() {
    return this.#baseSize;
  }

  /**
   * Get the layer opacity.
   *
   * @returns {number} The opacity ([0:1] range).
   */
  getOpacity() {
    return this.#konvaStage.opacity();
  }

  /**
   * Set the layer opacity.
   *
   * @param {number} alpha The opacity ([0:1] range).
   */
  setOpacity(alpha) {
    this.#konvaStage.opacity(Math.min(Math.max(alpha, 0), 1));
  }

  /**
   * Add a flip offset along the layer X axis.
   */
  addFlipOffsetX() {
    // flip offset
    const scale = this.#konvaStage.scale();
    const size = this.#konvaStage.size();
    this.#flipOffset.x += size.width / scale.x;
    // apply
    const offset = this.#konvaStage.offset();
    offset.x += this.#flipOffset.x;
    this.#konvaStage.offset(offset);
  }

  /**
   * Add a flip offset along the layer Y axis.
   */
  addFlipOffsetY() {
    // flip offset
    const scale = this.#konvaStage.scale();
    const size = this.#konvaStage.size();
    this.#flipOffset.y += size.height / scale.y;
    // apply
    const offset = this.#konvaStage.offset();
    offset.y += this.#flipOffset.y;
    this.#konvaStage.offset(offset);
  }

  /**
   * Flip the scale along the layer X axis.
   */
  flipScaleX() {
    this.#flipScale.x *= -1;
  }

  /**
   * Flip the scale along the layer Y axis.
   */
  flipScaleY() {
    this.#flipScale.y *= -1;
  }

  /**
   * Flip the scale along the layer Z axis.
   */
  flipScaleZ() {
    this.#flipScale.z *= -1;
  }

  /**
   * Set the layer scale.
   *
   * @param {Scalar3D} newScale The scale as {x,y,z}.
   * @param {Point3D} [center] The scale center.
   */
  setScale(newScale, center) {
    const orientedNewScale =
      this.#planeHelper.getTargetOrientedPositiveXYZ({
        x: newScale.x * this.#flipScale.x,
        y: newScale.y * this.#flipScale.y,
        z: newScale.z * this.#flipScale.z,
      });
    const finalNewScale = {
      x: this.#fitScale.x * orientedNewScale.x,
      y: this.#fitScale.y * orientedNewScale.y
    };

    const offset = this.#konvaStage.offset();

    if (Math.abs(newScale.x) === 1 &&
      Math.abs(newScale.y) === 1 &&
      Math.abs(newScale.z) === 1) {
      // reset zoom offset for scale=1
      const resetOffset = {
        x: offset.x - this.#zoomOffset.x,
        y: offset.y - this.#zoomOffset.y
      };
      // store new offset
      this.#zoomOffset = {x: 0, y: 0};
      this.#konvaStage.offset(resetOffset);
    } else {
      if (typeof center !== 'undefined') {
        let worldCenter = this.#planeHelper.getPlaneOffsetFromOffset3D({
          x: center.getX(),
          y: center.getY(),
          z: center.getZ()
        });
        // center was obtained with viewLayer.displayToMainPlanePos
        // compensated for baseOffset
        // TODO: justify...
        worldCenter = {
          x: worldCenter.x + this.#baseOffset.x,
          y: worldCenter.y + this.#baseOffset.y
        };

        const newOffset = getScaledOffset(
          offset, this.#konvaStage.scale(), finalNewScale, worldCenter);

        const newZoomOffset = {
          x: this.#zoomOffset.x + newOffset.x - offset.x,
          y: this.#zoomOffset.y + newOffset.y - offset.y
        };
        // store new offset
        this.#zoomOffset = newZoomOffset;
        this.#konvaStage.offset(newOffset);
      }
    }

    this.#konvaStage.scale(finalNewScale);
    // update labels
    this.#updateLabelScale(finalNewScale);
  }

  /**
   * Initialise the layer scale.
   *
   * @param {Scalar3D} newScale The scale as {x,y,z}.
   * @param {Scalar2D} absoluteZoomOffset The zoom offset as {x,y}
   *   without the fit scale (as provided by getAbsoluteZoomOffset).
   */
  initScale(newScale, absoluteZoomOffset) {
    const orientedNewScale = this.#planeHelper.getTargetOrientedPositiveXYZ({
      x: newScale.x * this.#flipScale.x,
      y: newScale.y * this.#flipScale.y,
      z: newScale.z * this.#flipScale.z,
    });
    const finalNewScale = {
      x: this.#fitScale.x * orientedNewScale.x,
      y: this.#fitScale.y * orientedNewScale.y
    };
    this.#konvaStage.scale(finalNewScale);

    this.#zoomOffset = {
      x: absoluteZoomOffset.x / this.#fitScale.x,
      y: absoluteZoomOffset.y / this.#fitScale.y
    };
    const offset = this.#konvaStage.offset();
    this.#konvaStage.offset({
      x: offset.x + this.#zoomOffset.x,
      y: offset.y + this.#zoomOffset.y
    });
  }

  /**
   * Set the layer offset.
   *
   * @param {Scalar3D} newOffset The offset as {x,y,z}.
   */
  setOffset(newOffset) {
    const planeNewOffset =
      this.#planeHelper.getPlaneOffsetFromOffset3D(newOffset);
    this.#konvaStage.offset({
      x: planeNewOffset.x +
        this.#viewOffset.x +
        this.#baseOffset.x +
        this.#zoomOffset.x +
        this.#flipOffset.x,
      y: planeNewOffset.y +
        this.#viewOffset.y +
        this.#baseOffset.y +
        this.#zoomOffset.y +
        this.#flipOffset.y
    });
  }

  /**
   * Set the base layer offset. Updates the layer offset.
   *
   * @param {Vector3D} scrollOffset The scroll offset vector.
   * @param {Vector3D} planeOffset The plane offset vector.
   * @returns {boolean} True if the offset was updated.
   */
  setBaseOffset(scrollOffset, planeOffset) {
    const scrollIndex = this.#planeHelper.getNativeScrollIndex();
    const newOffset = this.#planeHelper.getPlaneOffsetFromOffset3D({
      x: scrollIndex === 0 ? scrollOffset.getX() : planeOffset.getX(),
      y: scrollIndex === 1 ? scrollOffset.getY() : planeOffset.getY(),
      z: scrollIndex === 2 ? scrollOffset.getZ() : planeOffset.getZ(),
    });
    const needsUpdate = this.#baseOffset.x !== newOffset.x ||
      this.#baseOffset.y !== newOffset.y;
    // reset offset if needed
    if (needsUpdate) {
      const offset = this.#konvaStage.offset();
      this.#konvaStage.offset({
        x: offset.x - this.#baseOffset.x + newOffset.x,
        y: offset.y - this.#baseOffset.y + newOffset.y
      });
      this.#baseOffset = newOffset;
    }
    return needsUpdate;
  }

  /**
   * Display the layer.
   *
   * @param {boolean} flag Whether to display the layer or not.
   */
  display(flag) {
    this.#containerDiv.style.display = flag ? '' : 'none';
  }

  /**
   * Check if the layer is visible.
   *
   * @returns {boolean} True if the layer is visible.
   */
  isVisible() {
    return this.#containerDiv.style.display === '';
  }

  /**
   * Draw the content (imageData) of the layer.
   * The imageData variable needs to be set.
   */
  draw() {
    this.#konvaStage.draw();
  }

  /**
   * Initialise the layer: set the canvas and context.
   *
   * @param {Scalar2D} size The image size as {x,y}.
   * @param {Scalar2D} spacing The image spacing as {x,y}.
   * @param {string} refLayerId The reference image dataId.
   */
  initialise(size, spacing, refLayerId) {
    // set locals
    this.#baseSize = size;
    this.#baseSpacing = spacing;
    this.#referenceLayerId = refLayerId;

    // create stage
    this.#konvaStage = new Konva.Stage({
      container: this.#containerDiv,
      width: this.#baseSize.x,
      height: this.#baseSize.y,
      listening: false
    });
    // reset style
    // (avoids a not needed vertical scrollbar)
    this.#konvaStage.getContent().setAttribute('style', '');

    // create layer
    const konvaLayer = new Konva.Layer({
      listening: false,
      visible: true
    });
    this.#konvaStage.add(konvaLayer);
  }

  /**
   * Set the annotation group.
   *
   * @param {AnnotationGroup} annotationGroup The annotation group.
   * @param {string} dataId The associated data id.
   * @param {object} exeCallback The undo stack callback.
   */
  setAnnotationGroup(annotationGroup, dataId, exeCallback) {
    this.#dataId = dataId;
    // local listeners
    annotationGroup.addEventListener('annotationadd', (event) => {
      // draw annotation
      this.#addAnnotationDraw(event.data, true);
      this.getKonvaLayer().draw();
    });
    annotationGroup.addEventListener('annotationupdate', (event) => {
      // update annotation draw
      this.#updateAnnotationDraw(event.data);
      this.getKonvaLayer().draw();
    });
    annotationGroup.addEventListener('annotationremove', (event) => {
      // remove annotation draw
      this.#removeAnnotationDraw(event.data);
      this.getKonvaLayer().draw();
    });
    annotationGroup.addEventListener(
      'annotationgroupeditablechange',
      (event) => {
        this.activateCurrentPositionShapes(event.data);
      }
    );

    // create draw controller
    this.#drawController = new DrawController(annotationGroup);

    // annotations are allready in the annotation list,
    // -> no need to add them, just draw and save command
    if (annotationGroup.getLength() !== 0) {
      for (const annotation of annotationGroup.getList()) {
        // draw annotation
        this.#addAnnotationDraw(annotation, false);
        // create the draw command
        const command = new AddAnnotationCommand(
          annotation, this.getDrawController());
        // add command to undo stack
        exeCallback(command);
      }
    }
  }

  /**
   * Activate shapes at current position.
   *
   * @param {boolean} flag The flag to activate or not.
   */
  activateCurrentPositionShapes(flag) {
    const konvaLayer = this.getKonvaLayer();

    // stop listening
    this.#konvaStage.listening(false);

    if (typeof this.#shapeHandler !== 'undefined') {
      // reset shape editor (remove anchors)
      this.#shapeHandler.disableAndResetEditor();
      // remove listeners for all position groups
      const allPosGroups = konvaLayer.getChildren();
      for (const posGroup of allPosGroups) {
        if (posGroup instanceof Konva.Group) {
          posGroup.getChildren().forEach((group) => {
            if (group instanceof Konva.Group) {
              this.#shapeHandler.removeShapeListeners(group);
            }
          });
        }
      }
    }

    // activate shape listeners if possible
    const drawController = this.getDrawController();
    if (flag &&
      drawController.getAnnotationGroup().isEditable()) {
      // shape groups at the current position
      const shapeGroups =
        this.getCurrentPosGroup().getChildren();
      // listen if we have shapes
      if (shapeGroups.length !== 0) {
        this.#konvaStage.listening(true);
        konvaLayer.listening(true);
      }
      // add listeners for position group
      if (typeof this.#shapeHandler !== 'undefined') {
        shapeGroups.forEach((group) => {
          if (group instanceof Konva.Group) {
            const annotation = drawController.getAnnotation(group.id());
            this.#shapeHandler.addShapeListeners(this, group, annotation);
          }
        });
      }
    }

    konvaLayer.draw();
  }

  /**
   * Get the position group id for an annotation.
   *
   * @param {Annotation} annotation The target annotation.
   * @returns {string|undefined} The group id.
   */
  #getAnnotationPosGroupId(annotation) {
    let points;
    // annotation planePoints are only present
    // for non aquisition plane
    if (typeof annotation.planePoints !== 'undefined') {
      // use plane points
      points = annotation.planePoints;
    } else {
      // just use plane origin
      points = [annotation.planeOrigin];
    }
    return this.#getPositionId(points);
  }

  /**
   * Get a string id from input plane points.
   *
   * @param {Point3D[]} points A list of points that defined a plane.
   * @returns {string} The string id.
   */
  #getPositionId(points) {
    let res = '';
    for (const point of points) {
      if (res.length !== 0) {
        res += '-';
      }
      const posValues = [
        precisionRound(point.getX(), 2),
        precisionRound(point.getY(), 2),
        precisionRound(point.getZ(), 2),
      ];
      res += toStringId(posValues);
    }
    return res;
  }

  /**
   * Find the shape group associated to an annotation.
   *
   * @param {Annotation} annotation The annotation.
   * @returns {Konva.Group|undefined} The shape group.
   */
  #findShapeGroup(annotation) {
    let res;

    const posGroupId = this.#getAnnotationPosGroupId(annotation);
    const layerChildren = this.getKonvaLayer().getChildren(
      isNodeWithId(posGroupId));
    if (layerChildren.length !== 0) {
      const posGroup = layerChildren[0];
      if (!(posGroup instanceof Konva.Group)) {
        return;
      }
      const posChildren = posGroup.getChildren(
        isNodeWithId(annotation.id));
      if (posChildren.length !== 0 &&
        posChildren[0] instanceof Konva.Group) {
        res = posChildren[0];
      }
    }
    return res;
  }

  /**
   * Draw an annotation: create the shape group and add it to
   *   the Konva layer.
   *
   * @param {Annotation} annotation The annotation to draw.
   * @param {boolean} visible The position group visibility.
   */
  #addAnnotationDraw(annotation, visible) {
    // check for compatible view
    if (!annotation.isCompatibleView(this.#planeHelper)) {
      return;
    }
    const posGroupId = this.#getAnnotationPosGroupId(annotation);
    // Get or create position-group if it does not exist and
    // append it to konvaLayer
    let posGroup = this.getKonvaLayer().getChildren(
      isNodeWithId(posGroupId))[0];
    if (typeof posGroup === 'undefined') {
      posGroup = new Konva.Group({
        id: posGroupId,
        name: 'position-group',
        visible: visible
      });
      this.getKonvaLayer().add(posGroup);
    }
    if (!(posGroup instanceof Konva.Group)) {
      return;
    };

    const style = new Style();
    const stage = this.getKonvaStage();
    style.setZoomScale(stage.scale());

    // shape group (use first one since it will be removed from
    // the group when we change it)
    const factory = annotation.getFactory();
    const shapeGroup = factory.createShapeGroup(annotation, style);
    // add group to posGroup (switches its parent)
    posGroup.add(shapeGroup);

    // activate shape if possible
    if (visible &&
      typeof this.#shapeHandler !== 'undefined'
    ) {
      this.#shapeHandler.addShapeListeners(this, shapeGroup, annotation);
    }
    // set label visibility
    this.setLabelVisibility(shapeGroup);
  }

  /**
   * Remove an annotation draw.
   *
   * @param {Annotation} annotation The annotation to remove.
   * @returns {boolean} True if the shape group has been found and removed.
   */
  #removeAnnotationDraw(annotation) {
    const shapeGroup = this.#findShapeGroup(annotation);
    if (!(shapeGroup instanceof Konva.Group)) {
      logger.debug('No shape group to remove');
      return false;
    };
    shapeGroup.remove();
    return true;
  }

  /**
   * Update an annotation draw.
   *
   * @param {Annotation} annotation The annotation to update.
   */
  #updateAnnotationDraw(annotation) {
    // update quantification after math shape update
    annotation.updateQuantification();
    // update draw if needed
    if (this.#removeAnnotationDraw(annotation)) {
      this.#addAnnotationDraw(annotation, true);
    }
  }

  /**
   * Fit the layer to its parent container.
   *
   * @param {Scalar2D} containerSize The container size as {x,y}.
   * @param {number} divToWorldSizeRatio The div to world size ratio.
   * @param {Scalar2D} fitOffset The fit offset as {x,y}.
   */
  fitToContainer(containerSize, divToWorldSizeRatio, fitOffset) {
    // update konva
    this.#konvaStage.width(containerSize.x);
    this.#konvaStage.height(containerSize.y);

    // fit scale
    const divToImageSizeRatio = {
      x: divToWorldSizeRatio * this.#baseSpacing.x,
      y: divToWorldSizeRatio * this.#baseSpacing.y
    };
    // #scale = inputScale * fitScale * flipScale
    // flipScale does not change here, we can omit it
    // newScale = (#scale / fitScale) * newFitScale
    const newScale = {
      x: this.#konvaStage.scale().x * divToImageSizeRatio.x / this.#fitScale.x,
      y: this.#konvaStage.scale().y * divToImageSizeRatio.y / this.#fitScale.y
    };

    // set scales if different from previous
    if (this.#konvaStage.scale().x !== newScale.x ||
      this.#konvaStage.scale().y !== newScale.y) {
      this.#fitScale = divToImageSizeRatio;
      this.#konvaStage.scale(newScale);
    }

    // view offset
    const newViewOffset = {
      x: fitOffset.x / divToImageSizeRatio.x,
      y: fitOffset.y / divToImageSizeRatio.y
    };
    // flip offset
    const scaledImageSize = {
      x: containerSize.x / divToImageSizeRatio.x,
      y: containerSize.y / divToImageSizeRatio.y
    };
    const newFlipOffset = {
      x: this.#flipOffset.x !== 0 ? scaledImageSize.x : 0,
      y: this.#flipOffset.y !== 0 ? scaledImageSize.y : 0,
    };

    // set offsets if different from previous
    if (this.#viewOffset.x !== newViewOffset.x ||
      this.#viewOffset.y !== newViewOffset.y ||
      this.#flipOffset.x !== newFlipOffset.x ||
      this.#flipOffset.y !== newFlipOffset.y) {
      // update global offset
      this.#konvaStage.offset({
        x: this.#konvaStage.offset().x +
          newViewOffset.x - this.#viewOffset.x +
          newFlipOffset.x - this.#flipOffset.x,
        y: this.#konvaStage.offset().y +
          newViewOffset.y - this.#viewOffset.y +
          newFlipOffset.y - this.#flipOffset.y,
      });
      // update private local offsets
      this.#flipOffset = newFlipOffset;
      this.#viewOffset = newViewOffset;
    }
  }

  /**
   * Check the visibility of an annotation.
   *
   * @param {string} id The id of the annotation.
   * @returns {boolean} True if the annotation is visible.
   */
  isAnnotationVisible(id) {
    // get the group (annotation and group have same id)
    const group = this.getGroup(id);
    if (typeof group === 'undefined') {
      return false;
    }
    // get visibility
    return group.isVisible();
  }

  /**
   * Set the visibility of an annotation.
   *
   * @param {string} id The id of the annotation.
   * @param {boolean} [visible] True to set to visible,
   *   will toggle visibility if not defined.
   * @returns {boolean} False if the annotation shape cannot be found.
   */
  setAnnotationVisibility(id, visible) {
    // get the group (annotation and group have same id)
    const group = this.getGroup(id);
    if (typeof group === 'undefined') {
      return false;
    }
    // if not set, toggle visibility
    if (typeof visible === 'undefined') {
      visible = !group.isVisible();
    }
    group.visible(visible);

    // udpate
    this.draw();

    return true;
  }

  /**
   * Set the visibility of all labels.
   *
   * @param {boolean} [visible] True to set to visible,
   *   will toggle visibility if not defined.
   */
  setLabelsVisibility(visible) {
    this.#visibleLabels = visible;

    const posGroups = this.getKonvaLayer().getChildren();
    for (const posGroup of posGroups) {
      if (posGroup instanceof Konva.Group) {
        const shapeGroups = posGroup.getChildren();
        for (const shapeGroup of shapeGroups) {
          if (shapeGroup instanceof Konva.Group) {
            this.#setLabelVisibility(shapeGroup, visible);
          }
        }
      }
    }
  }

  /**
   * Set a shape group label visibility.
   *
   * @param {Konva.Group} shapeGroup The shape group.
   * @param {boolean} [visible] True to set to visible,
   *   will toggle visibility if not defined.
   */
  #setLabelVisibility(shapeGroup, visible) {
    const label = shapeGroup.getChildren(isNodeNameLabel)[0];
    if (!(label instanceof Konva.Label)) {
      return;
    }
    // if not set, toggle visibility
    if (typeof visible === 'undefined') {
      visible = !label.isVisible();
    }
    // set visible only for non empty text
    if (typeof label.getText() !== 'undefined' &&
      label.getText().text().length !== 0) {
      label.visible(visible);
    }
  }

  /**
   * Set a shape group label visibility according to
   *  this layer setting.
   *
   * @param {Konva.Group} shapeGroup The shape group.
   */
  setLabelVisibility(shapeGroup) {
    this.#setLabelVisibility(shapeGroup, this.#visibleLabels);
  }

  /**
   * Delete a Draw from the stage.
   *
   * @deprecated
   * @param {string} _id The id of the group to delete.
   * @param {Function} _exeCallback The callback to call once the
   *  DeleteCommand has been executed.
   */
  deleteDraw(_id, _exeCallback) {
    // does nothing
  }

  /**
   * Delete all Draws from the stage.
   *
   * @deprecated
   * @param {Function} _exeCallback The callback to call once the
   *  DeleteCommand has been executed.
   */
  deleteDraws(_exeCallback) {
    // does nothing
  }

  /**
   * Get the total number of draws of this layer
   * (at all positions).
   *
   * @returns {number|undefined} The total number of draws.
   */
  getNumberOfDraws() {
    const posGroups = this.getKonvaLayer().getChildren();
    let count = 0;
    for (const posGroup of posGroups) {
      if (posGroup instanceof Konva.Group) {
        count += posGroup.getChildren().length;
      }
    }
    return count;
  }

  /**
   * Enable and listen to container interaction events.
   */
  bindInteraction() {
    this.#konvaStage.listening(true);
    // allow pointer events
    this.#containerDiv.style.pointerEvents = 'auto';
    // interaction events
    const names = InteractionEventNames;
    for (let i = 0; i < names.length; ++i) {
      this.#containerDiv.addEventListener(names[i], this.#fireEvent);
    }
  }

  /**
   * Disable and stop listening to container interaction events.
   */
  unbindInteraction() {
    this.#konvaStage.listening(false);
    // disable pointer events
    this.#containerDiv.style.pointerEvents = 'none';
    // interaction events
    const names = InteractionEventNames;
    for (let i = 0; i < names.length; ++i) {
      this.#containerDiv.removeEventListener(names[i], this.#fireEvent);
    }
  }

  /**
   * Set the current position.
   *
   * @param {Point} position The new position.
   * @param {Index} index The new index.
   * @returns {boolean} True if the position was updated.
   */
  setCurrentPosition(position, index) {
    if (typeof index === 'undefined') {
      index = this.#planeHelper.worldToIndex(position);
    }
    const scrollIndex = this.#planeHelper.getScrollIndex();
    const scrollIndexValue = index.get(scrollIndex);
    const planePoints = this.#planeHelper.getPlanePoints(scrollIndexValue);
    let points;
    if (this.#planeHelper.isAquisitionOrientation()) {
      // just use plane origin
      points = [planePoints[0]];
    } else {
      // use plane points
      points = planePoints;
    }
    const posGroupId = this.#getPositionId(points);

    this.#activateDrawLayer(posGroupId);
    // TODO: add check
    this.#fireEvent({
      type: 'positionchange',
      value: [
        index.getValues(),
        position.getValues(),
      ],
      valid: true
    });

    return true;
  }

  /**
   * Activate the current draw layer.
   *
   * @param {string} posGroupId The position group ID.
   */
  #activateDrawLayer(posGroupId) {
    this.#currentPosGroupId = posGroupId;

    // get all position groups
    const posGroups = this.getKonvaLayer().getChildren(isPositionNode);
    // reset or set the visible property
    let visible;
    for (let i = 0, leni = posGroups.length; i < leni; ++i) {
      visible = false;
      if (posGroups[i].id() === this.#currentPosGroupId) {
        visible = true;
      }
      // group members inherit the visible property
      posGroups[i].visible(visible);
    }

    // show current draw layer
    this.getKonvaLayer().draw();
  }

  /**
   * Get the current position group.
   *
   * @returns {Konva.Group|undefined} The Konva.Group.
   */
  getCurrentPosGroup() {
    // get position groups
    const posGroups = this.getKonvaLayer().getChildren((node) => {
      return node.id() === this.#currentPosGroupId;
    });
    // if one group, use it
    // if no group, create one
    let posGroup;
    if (posGroups.length === 1) {
      if (posGroups[0] instanceof Konva.Group) {
        posGroup = posGroups[0];
      }
    } else if (posGroups.length === 0) {
      posGroup = new Konva.Group();
      posGroup.name('position-group');
      posGroup.id(this.#currentPosGroupId);
      posGroup.visible(true); // dont inherit
      // add new group to layer
      this.getKonvaLayer().add(posGroup);
    } else {
      logger.warn('Unexpected number of draw position groups');
    }
    // return
    return posGroup;
  }

  /**
   * Get a Konva group using its id.
   *
   * @param {string} id The group id.
   * @returns {object|undefined} The Konva group.
   */
  getGroup(id) {
    const group = this.getKonvaLayer().findOne('#' + id);
    if (typeof group === 'undefined') {
      logger.warn('Cannot find node with id: ' + id);
    }
    return group;
  }

  /**
   * Add an event listener to this class.
   *
   * @param {string} type The event type.
   * @param {Function} callback The function associated with the provided
   *   event type, will be called with the fired event.
   */
  addEventListener(type, callback) {
    this.#listenerHandler.add(type, callback);
  }

  /**
   * Remove an event listener from this class.
   *
   * @param {string} type The event type.
   * @param {Function} callback The function associated with the provided
   *   event type.
   */
  removeEventListener(type, callback) {
    this.#listenerHandler.remove(type, callback);
  }

  /**
   * Fire an event: call all associated listeners with the input event object.
   *
   * @param {object} event The event to fire.
   */
  #fireEvent = (event) => {
    event.srclayerid = this.getId();
    event.dataid = this.#dataId;
    this.#listenerHandler.fireEvent(event);
  };

  // common layer methods [end] ---------------

  /**
   * Update label scale: compensate for it so
   *   that label size stays visually the same.
   *
   * @param {Scalar2D} scale The scale to compensate for as {x,y}.
   */
  #updateLabelScale(scale) {
    // same formula as in labelFactory::create
    // compensate for scale and times 2 so that font 10 looks like a 10
    const ratioX = 2 / scale.x;
    const ratioY = 2 / scale.y;
    // compensate scale for labels
    const labels = this.#konvaStage.find('Label');
    for (let i = 0; i < labels.length; ++i) {
      labels[i].scale({x: ratioX, y: ratioY});
    }
  }

} // DrawLayer class

// *************************
// legacy code to allow to convert old state into annotation
// *************************

/**
 * Draw meta data.
 */
export class DrawMeta {
  /**
   * Draw quantification.
   *
   * @type {object}
   */
  quantification;

  /**
   * Draw text expression. Can contain variables surrounded with '{}' that will
   * be extracted from the quantification object.
   *
   * @type {string}
   */
  textExpr;
}

/**
 * Draw details.
 */
export class DrawDetails {
  /**
   * The draw ID.
   *
   * @type {number}
   */
  id;

  /**
   * The draw position: an Index converted to string.
   *
   * @type {string}
   */
  position;

  /**
   * The draw type.
   *
   * @type {string}
   */
  type;

  /**
   * The draw color: for example 'green', '#00ff00' or 'rgb(0,255,0)'.
   *
   * @type {string}
   */
  color;

  /**
   * The draw meta.
   *
   * @type {DrawMeta}
   */
  meta;
}

/**
 * Convert a KonvaLayer object to a list of annotations.
 *
 * @param {Array} drawings An array of drawings stored
 *   with 'KonvaLayer().toObject()'.
 * @param {DrawDetails[]} drawingsDetails An array of drawings details.
 * @returns {Annotation[]} The associated list of annotations.
 */
export function konvaToAnnotation(drawings, drawingsDetails) {
  const annotations = [];

  // regular Konva deserialize
  const stateLayer = Konva.Node.create(drawings);

  // get all position groups
  const statePosGroups = stateLayer.getChildren(isPositionNode);

  for (let i = 0, leni = statePosGroups.length; i < leni; ++i) {
    const statePosGroup = statePosGroups[i];
    const statePosKids = statePosGroup.getChildren();
    for (let j = 0, lenj = statePosKids.length; j < lenj; ++j) {
      const annotation = new Annotation();

      // shape group (use first one since it will be removed from
      // the group when we change it)
      const stateGroup = statePosKids[0];
      // annotation id
      annotation.id = stateGroup.id();

      // shape
      const shape = stateGroup.getChildren(isNodeNameShape)[0];
      // annotation colour
      annotation.colour = shape.stroke();

      if (stateGroup.name() === 'line-group') {
        const points = shape.points();
        annotation.mathShape = new Point2D(points[0], points[1]);
        annotation.referencePoints = [
          new Point2D(points[2], points[3])
        ];
      } else if (stateGroup.name() === 'ruler-group') {
        const points = shape.points();
        annotation.mathShape = new Line(
          new Point2D(points[0], points[1]),
          new Point2D(points[2], points[3])
        );
      } else if (stateGroup.name() === 'rectangle-group') {
        annotation.mathShape = new Rectangle(
          new Point2D(shape.x(), shape.y()),
          new Point2D(shape.x() + shape.width(), shape.y() + shape.height())
        );
      } else if (stateGroup.name() === 'roi-group') {
        const points = shape.points();
        const pointsArray = [];
        for (let i = 0; i < points.length; i = i + 2) {
          pointsArray.push(new Point2D(points[i], points[i + 1]));
        }
        annotation.mathShape = new ROI(pointsArray);
      } else if (stateGroup.name() === 'freeHand-group') {
        logger.warn('Converting freehand into ROI shape');
        const points = shape.points();
        const pointsArray = [];
        for (let i = 0; i < points.length; i = i + 2) {
          pointsArray.push(new Point2D(points[i], points[i + 1]));
        }
        annotation.mathShape = new ROI(pointsArray);
      } else if (stateGroup.name() === 'protractor-group') {
        const points = shape.points();
        annotation.mathShape = new Protractor([
          new Point2D(points[0], points[1]),
          new Point2D(points[2], points[3]),
          new Point2D(points[4], points[5])
        ]);
      } else if (stateGroup.name() === 'ellipse-group') {
        const absPosition = shape.absolutePosition();
        annotation.mathShape = new Ellipse(
          new Point2D(absPosition.x, absPosition.y),
          shape.radiusX(),
          shape.radiusY()
        );
      } else if (stateGroup.name() === 'circle-group') {
        const absPosition = shape.absolutePosition();
        annotation.mathShape = new Circle(
          new Point2D(absPosition.x, absPosition.y),
          shape.radius()
        );
      }

      // details
      if (drawingsDetails) {
        const details = drawingsDetails[stateGroup.id()];
        annotation.textExpr = details.meta.textExpr;
        annotation.quantification = details.meta.quantification;
      }

      annotations.push(annotation);
    }
  }

  return annotations;
}
