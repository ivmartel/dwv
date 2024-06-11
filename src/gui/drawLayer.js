import {ListenerHandler} from '../utils/listen';
import {DrawController} from '../app/drawController';
import {getScaledOffset} from './layerGroup';
import {InteractionEventNames} from './generic';

// external
import Konva from 'konva';

// doc imports
/* eslint-disable no-unused-vars */
import {Point, Point3D} from '../math/point';
import {Index} from '../math/index';
import {Vector3D} from '../math/vector';
import {Scalar2D, Scalar3D} from '../math/scalar';
import {PlaneHelper} from '../image/planeHelper';
/* eslint-enable no-unused-vars */

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
   * @type {object}
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
   * @param {HTMLDivElement} containerDiv The layer div, its id will be used
   *   as this layer id.
   */
  constructor(containerDiv) {
    this.#containerDiv = containerDiv;
    // specific css class name
    this.#containerDiv.className += ' drawLayer';
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
   * @returns {object} The controller.
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
   * @param {string} dataId The associated data id.
   */
  initialise(size, spacing, dataId) {
    // set locals
    this.#baseSize = size;
    this.#baseSpacing = spacing;
    this.#dataId = dataId;

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

    // create draw controller
    this.#drawController = new DrawController(this);
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
   * Check the visibility of a given group.
   *
   * @param {string} id The id of the group.
   * @returns {boolean} True if the group is visible.
   */
  isGroupVisible(id) {
    // get the group
    const group = this.#drawController.getGroup(id);
    if (typeof group === 'undefined') {
      return false;
    }
    // get visibility
    return group.isVisible();
  }

  /**
   * Toggle the visibility of a given group.
   *
   * @param {string} id The id of the group.
   * @returns {boolean} False if the group cannot be found.
   */
  toggleGroupVisibility(id) {
    // get the group
    const group = this.#drawController.getGroup(id);
    if (typeof group === 'undefined') {
      return false;
    }
    // toggle visible
    group.visible(!group.isVisible());

    // udpate
    this.draw();

    return true;
  }

  /**
   * Delete a Draw from the stage.
   *
   * @param {string} id The id of the group to delete.
   * @param {object} exeCallback The callback to call once the
   *  DeleteCommand has been executed.
   */
  deleteDraw(id, exeCallback) {
    if (typeof this.#drawController !== 'undefined') {
      this.#drawController.deleteDraw(id, this.#fireEvent, exeCallback);
    }
  }

  /**
   * Delete all Draws from the stage.
   *
   * @param {object} exeCallback The callback to call once the
   *  DeleteCommand has been executed.
   */
  deleteDraws(exeCallback) {
    if (typeof this.#drawController !== 'undefined') {
      this.#drawController.deleteDraws(this.#fireEvent, exeCallback);
    }
  }

  /**
   * Get the total number of draws of this layer
   * (at all positions).
   *
   * @returns {number|undefined} The total number of draws.
   */
  getNumberOfDraws() {
    let res;
    if (typeof this.#drawController !== 'undefined') {
      res = this.#drawController.getNumberOfDraws();
    }
    return res;
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
    this.getDrawController().activateDrawLayer(
      index, this.#planeHelper.getScrollIndex());
    // TODO: add check
    return true;
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
    // same formula as in style::applyZoomScale:
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
