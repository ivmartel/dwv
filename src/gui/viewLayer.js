import {Index} from '../math/index';
import {ListenerHandler} from '../utils/listen';
import {viewEventNames} from '../image/view';
import {ViewController} from '../app/viewController';
import {Point2D} from '../math/point';
import {
  canCreateCanvas,
  InteractionEventNames
} from './generic';
import {getScaledOffset} from './layerGroup';

// doc imports
/* eslint-disable no-unused-vars */
import {Vector3D} from '../math/vector';
import {Point, Point3D} from '../math/point';
import {Scalar2D, Scalar3D} from '../math/scalar';
/* eslint-enable no-unused-vars */

/**
 * View layer.
 */
export class ViewLayer {

  /**
   * Container div.
   *
   * @type {HTMLElement}
   */
  #containerDiv;

  /**
   * The view controller.
   *
   * @type {ViewController}
   */
  #viewController = null;

  /**
   * The main display canvas.
   *
   * @type {object}
   */
  #canvas = null;

  /**
   * The offscreen canvas: used to store the raw, unscaled pixel data.
   *
   * @type {object}
   */
  #offscreenCanvas = null;

  /**
   * The associated CanvasRenderingContext2D.
   *
   * @type {object}
   */
  #context = null;

  /**
   * Flag to know if the current position is valid.
   *
   * @type {boolean}
   */
  #isValidPosition = true;

  /**
   * The image data array.
   *
   * @type {ImageData}
   */
  #imageData = null;

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
   * The layer opacity.
   *
   * @type {number}
   */
  #opacity = 1;

  /**
   * The layer scale.
   *
   * @type {Scalar2D}
   */
  #scale = {x: 1, y: 1};

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
   * The layer offset.
   *
   * @type {Scalar2D}
   */
  #offset = {x: 0, y: 0};

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
   * Data update flag.
   *
   * @type {boolean}
   */
  #needsDataUpdate = null;

  /**
   * The associated data id.
   *
   * @type {string}
   */
  #dataId;

  /**
   * Listener handler.
   *
   * @type {ListenerHandler}
   */
  #listenerHandler = new ListenerHandler();

  /**
   * Image smoothing flag.
   *
   * See: {@link https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/imageSmoothingEnabled}.
   *
   * @type {boolean}
   */
  #imageSmoothing = false;

  /**
   * Layer group origin.
   *
   * @type {Point3D}
   */
  #layerGroupOrigin;

  /**
   * Layer group first origin.
   *
   * @type {Point3D}
   */
  #layerGroupOrigin0;

  /**
   * @param {HTMLElement} containerDiv The layer div, its id will be used
   *   as this layer id.
   */
  constructor(containerDiv) {
    this.#containerDiv = containerDiv;
    // specific css class name
    this.#containerDiv.className += ' viewLayer';
  }

  /**
   * Get the associated data id.
   *
   * @returns {string} The data id.
   */
  getDataId() {
    return this.#dataId;
  }

  /**
   * Get the layer scale.
   *
   * @returns {Scalar2D} The scale as {x,y}.
   */
  getScale() {
    return this.#scale;
  }

  /**
   * Get the layer zoom offset without the fit scale.
   *
   * @returns {Scalar2D} The offset as {x,y}.
   */
  getAbsoluteZoomOffset() {
    return {
      x: this.#zoomOffset.x * this.#fitScale.x,
      y: this.#zoomOffset.y * this.#fitScale.y
    };
  }

  /**
   * Set the imageSmoothing flag value.
   *
   * @param {boolean} flag True to enable smoothing.
   */
  setImageSmoothing(flag) {
    this.#imageSmoothing = flag;
  }

  /**
   * Set the associated view.
   *
   * @param {object} view The view.
   * @param {string} dataId The associated data id.
   */
  setView(view, dataId) {
    this.#dataId = dataId;
    // local listeners
    view.addEventListener('wlchange', this.#onWLChange);
    view.addEventListener('colourmapchange', this.#onColourMapChange);
    view.addEventListener('positionchange', this.#onPositionChange);
    view.addEventListener('alphafuncchange', this.#onAlphaFuncChange);
    // view events
    for (let j = 0; j < viewEventNames.length; ++j) {
      view.addEventListener(viewEventNames[j], this.#fireEvent);
    }
    // create view controller
    this.#viewController = new ViewController(view, dataId);
    // bind layer and image
    this.bindImage();
  }

  /**
   * Get the view controller.
   *
   * @returns {ViewController} The controller.
   */
  getViewController() {
    return this.#viewController;
  }

  /**
   * Get the canvas image data.
   *
   * @returns {object} The image data.
   */
  getImageData() {
    return this.#imageData;
  }

  /**
   * Handle an image set event.
   *
   * @param {object} event The event.
   * @function
   */
  onimageset = (event) => {
    // event.value = [index, image]
    if (this.#dataId === event.dataid) {
      this.#viewController.setImage(event.value[0], this.#dataId);
      this.#setBaseSize(this.#viewController.getImageSize().get2D());
      this.#needsDataUpdate = true;
    }
  };

  /**
   * Bind this layer to the view image.
   */
  bindImage() {
    if (this.#viewController) {
      this.#viewController.bindImageAndLayer(this);
    }
  }

  /**
   * Unbind this layer to the view image.
   */
  unbindImage() {
    if (this.#viewController) {
      this.#viewController.unbindImageAndLayer(this);
    }
  }

  /**
   * Handle an image content change event.
   *
   * @param {object} event The event.
   * @function
   */
  onimagecontentchange = (event) => {
    // event.value = [index]
    if (this.#dataId === event.dataid) {
      this.#isValidPosition = this.#viewController.isPositionInBounds();
      // flag update and draw
      this.#needsDataUpdate = true;
      this.draw();
    }
  };

  /**
   * Handle an image change event.
   *
   * @param {object} event The event.
   * @function
   */
  onimagegeometrychange = (event) => {
    // event.value = [index]
    if (this.#dataId === event.dataid) {
      const vcSize = this.#viewController.getImageSize().get2D();
      if (this.#baseSize.x !== vcSize.x ||
        this.#baseSize.y !== vcSize.y) {
        // size changed, recalculate base offset
        // in case origin changed
        if (typeof this.#layerGroupOrigin !== 'undefined' &&
          typeof this.#layerGroupOrigin0 !== 'undefined') {
          const origin0 = this.#viewController.getOrigin();
          const scrollOffset = this.#layerGroupOrigin0.minus(origin0);
          const origin = this.#viewController.getOrigin(
            this.#viewController.getCurrentPosition()
          );
          const planeOffset = this.#layerGroupOrigin.minus(origin);
          this.setBaseOffset(scrollOffset, planeOffset);
        }
        // update base size
        this.#setBaseSize(vcSize);
        // flag update and draw
        this.#needsDataUpdate = true;
        this.draw();
      }
    }
  };

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
   * Get the image world (mm) 2D size.
   *
   * @returns {Scalar2D} The 2D size as {x,y}.
   */
  getImageWorldSize() {
    return this.#viewController.getImageWorldSize();
  }

  /**
   * Get the layer opacity.
   *
   * @returns {number} The opacity ([0:1] range).
   */
  getOpacity() {
    return this.#opacity;
  }

  /**
   * Set the layer opacity.
   *
   * @param {number} alpha The opacity ([0:1] range).
   */
  setOpacity(alpha) {
    if (alpha === this.#opacity) {
      return;
    }

    this.#opacity = Math.min(Math.max(alpha, 0), 1);

    /**
     * Opacity change event.
     *
     * @event App#opacitychange
     * @type {object}
     * @property {string} type The event type.
     */
    const event = {
      type: 'opacitychange',
      value: [this.#opacity]
    };
    this.#fireEvent(event);
  }

  /**
   * Add a flip offset along the layer X axis.
   */
  addFlipOffsetX() {
    this.#flipOffset.x += this.#canvas.width / this.#scale.x;
    this.#offset.x += this.#flipOffset.x;
  }

  /**
   * Add a flip offset along the layer Y axis.
   */
  addFlipOffsetY() {
    this.#flipOffset.y += this.#canvas.height / this.#scale.y;
    this.#offset.y += this.#flipOffset.y;
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
    const helper = this.#viewController.getPlaneHelper();
    const orientedNewScale = helper.getTargetOrientedPositiveXYZ({
      x: newScale.x * this.#flipScale.x,
      y: newScale.y * this.#flipScale.y,
      z: newScale.z * this.#flipScale.z,
    });
    const finalNewScale = {
      x: this.#fitScale.x * orientedNewScale.x,
      y: this.#fitScale.y * orientedNewScale.y
    };

    if (Math.abs(newScale.x) === 1 &&
      Math.abs(newScale.y) === 1 &&
      Math.abs(newScale.z) === 1) {
      // reset zoom offset for scale=1
      const resetOffset = {
        x: this.#offset.x - this.#zoomOffset.x,
        y: this.#offset.y - this.#zoomOffset.y
      };
      // store new offset
      this.#zoomOffset = {x: 0, y: 0};
      this.#offset = resetOffset;
    } else {
      if (typeof center !== 'undefined') {
        let worldCenter = helper.getPlaneOffsetFromOffset3D({
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
          this.#offset, this.#scale, finalNewScale, worldCenter);

        const newZoomOffset = {
          x: this.#zoomOffset.x + newOffset.x - this.#offset.x,
          y: this.#zoomOffset.y + newOffset.y - this.#offset.y
        };
        // store new offset
        this.#zoomOffset = newZoomOffset;
        this.#offset = newOffset;
      }
    }

    // store new scale
    this.#scale = finalNewScale;
  }

  /**
   * Initialise the layer scale.
   *
   * @param {Scalar3D} newScale The scale as {x,y,z}.
   * @param {Scalar2D} absoluteZoomOffset The zoom offset as {x,y}
   *   without the fit scale (as provided by getAbsoluteZoomOffset).
   */
  initScale(newScale, absoluteZoomOffset) {
    const helper = this.#viewController.getPlaneHelper();
    const orientedNewScale = helper.getTargetOrientedPositiveXYZ({
      x: newScale.x * this.#flipScale.x,
      y: newScale.y * this.#flipScale.y,
      z: newScale.z * this.#flipScale.z,
    });
    const finalNewScale = {
      x: this.#fitScale.x * orientedNewScale.x,
      y: this.#fitScale.y * orientedNewScale.y
    };
    this.#scale = finalNewScale;

    this.#zoomOffset = {
      x: absoluteZoomOffset.x / this.#fitScale.x,
      y: absoluteZoomOffset.y / this.#fitScale.y
    };
    this.#offset = {
      x: this.#offset.x + this.#zoomOffset.x,
      y: this.#offset.y + this.#zoomOffset.y
    };
  }

  /**
   * Set the base layer offset. Updates the layer offset.
   *
   * @param {Vector3D} scrollOffset The scroll offset vector.
   * @param {Vector3D} planeOffset The plane offset vector.
   * @param {Point3D} [layerGroupOrigin] The layer group origin.
   * @param {Point3D} [layerGroupOrigin0] The layer group first origin.
   * @returns {boolean} True if the offset was updated.
   */
  setBaseOffset(
    scrollOffset, planeOffset,
    layerGroupOrigin, layerGroupOrigin0) {
    const helper = this.#viewController.getPlaneHelper();
    const scrollIndex = helper.getNativeScrollIndex();
    const newOffset = helper.getPlaneOffsetFromOffset3D({
      x: scrollIndex === 0 ? scrollOffset.getX() : planeOffset.getX(),
      y: scrollIndex === 1 ? scrollOffset.getY() : planeOffset.getY(),
      z: scrollIndex === 2 ? scrollOffset.getZ() : planeOffset.getZ(),
    });
    const needsUpdate = this.#baseOffset.x !== newOffset.x ||
      this.#baseOffset.y !== newOffset.y;
    // store layer group origins
    if (typeof layerGroupOrigin !== 'undefined' &&
      typeof layerGroupOrigin0 !== 'undefined') {
      this.#layerGroupOrigin = layerGroupOrigin;
      this.#layerGroupOrigin0 = layerGroupOrigin0;
    }
    // reset offset if needed
    if (needsUpdate) {
      this.#offset = {
        x: this.#offset.x - this.#baseOffset.x + newOffset.x,
        y: this.#offset.y - this.#baseOffset.y + newOffset.y
      };
      this.#baseOffset = newOffset;
    }
    return needsUpdate;
  }

  /**
   * Set the layer offset.
   *
   * @param {Scalar3D} newOffset The offset as {x,y,z}.
   */
  setOffset(newOffset) {
    const helper = this.#viewController.getPlaneHelper();
    const planeNewOffset = helper.getPlaneOffsetFromOffset3D(newOffset);
    this.#offset = {
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
    };
  }

  /**
   * Transform a display position to a 2D index.
   *
   * @param {Point2D} point2D The input point.
   * @returns {Index} The equivalent 2D index.
   */
  displayToPlaneIndex(point2D) {
    const planePos = this.displayToPlanePos(point2D);
    return new Index([
      Math.floor(planePos.getX()),
      Math.floor(planePos.getY())
    ]);
  }

  /**
   * Remove scale from a display position.
   *
   * @param {Point2D} point2D The input point.
   * @returns {Point2D} The de-scaled point.
   */
  displayToPlaneScale(point2D) {
    return new Point2D(
      point2D.getX() / this.#scale.x,
      point2D.getY() / this.#scale.y
    );
  }

  /**
   * Get a plane position from a display position.
   *
   * @param {Point2D} point2D The input point.
   * @returns {Point2D} The plane position.
   */
  displayToPlanePos(point2D) {
    const deScaled = this.displayToPlaneScale(point2D);
    return new Point2D(
      deScaled.getX() + this.#offset.x,
      deScaled.getY() + this.#offset.y
    );
  }

  /**
   * Get a display position from a plane position.
   *
   * @param {Point2D} point2D The input point.
   * @returns {Point2D} The display position, can be individually
   *   undefined if out of bounds.
   */
  planePosToDisplay(point2D) {
    let posX =
      (point2D.getX() - this.#offset.x + this.#baseOffset.x) * this.#scale.x;
    let posY =
      (point2D.getY() - this.#offset.y + this.#baseOffset.y) * this.#scale.y;
    // check if in bounds
    if (posX < 0 || posX >= this.#canvas.width) {
      posX = undefined;
    }
    if (posY < 0 || posY >= this.#canvas.height) {
      posY = undefined;
    }
    return new Point2D(posX, posY);
  }

  /**
   * Get a main plane position from a display position.
   *
   * @param {Point2D} point2D The input point.
   * @returns {Point2D} The main plane position.
   */
  displayToMainPlanePos(point2D) {
    const planePos = this.displayToPlanePos(point2D);
    return new Point2D(
      planePos.getX() - this.#baseOffset.x,
      planePos.getY() - this.#baseOffset.y
    );
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
   *
   * @fires App#renderstart
   * @fires App#renderend
   */
  draw() {
    // skip for non valid position
    if (!this.#isValidPosition) {
      return;
    }

    /**
     * Render start event.
     *
     * @event App#renderstart
     * @type {object}
     * @property {string} type The event type.
     */
    let event = {
      type: 'renderstart',
      layerid: this.getId(),
      dataid: this.getDataId()
    };
    this.#fireEvent(event);

    // update data if needed
    if (this.#needsDataUpdate) {
      this.#updateImageData();
    }

    // context opacity
    this.#context.globalAlpha = this.#opacity;

    // clear context
    this.clear();

    // draw the cached canvas on the context
    // transform takes as input a, b, c, d, e, f to create
    // the transform matrix (column-major order):
    // [ a c e ]
    // [ b d f ]
    // [ 0 0 1 ]
    this.#context.setTransform(
      this.#scale.x,
      0,
      0,
      this.#scale.y,
      -1 * this.#offset.x * this.#scale.x,
      -1 * this.#offset.y * this.#scale.y
    );

    // disable smoothing (set just before draw, could be reset by resize)
    this.#context.imageSmoothingEnabled = this.#imageSmoothing;
    // draw image
    this.#context.drawImage(this.#offscreenCanvas, 0, 0);

    /**
     * Render end event.
     *
     * @event App#renderend
     * @type {object}
     * @property {string} type The event type.
     */
    event = {
      type: 'renderend',
      layerid: this.getId(),
      dataid: this.getDataId()
    };
    this.#fireEvent(event);
  }

  /**
   * Initialise the layer: set the canvas and context.
   *
   * @param {Scalar2D} size The image size as {x,y}.
   * @param {Scalar2D} spacing The image spacing as {x,y}.
   * @param {number} alpha The initial data opacity.
   */
  initialise(size, spacing, alpha) {
    // set locals
    this.#baseSpacing = spacing;
    this.#opacity = Math.min(Math.max(alpha, 0), 1);

    // create canvas
    // (canvas size is set in fitToContainer)
    this.#canvas = document.createElement('canvas');
    this.#containerDiv.appendChild(this.#canvas);

    // check that the getContext method exists
    if (!this.#canvas.getContext) {
      alert('Error: no canvas.getContext method.');
      return;
    }
    // get the 2D context
    this.#context = this.#canvas.getContext('2d');
    if (!this.#context) {
      alert('Error: failed to get the 2D context.');
      return;
    }

    // off screen canvas
    this.#offscreenCanvas = document.createElement('canvas');

    // set base size: needs an existing context and off screen canvas
    this.#setBaseSize(size);

    // update data on first draw
    this.#needsDataUpdate = true;
  }

  /**
   * Set the base size of the layer.
   *
   * @param {Scalar2D} size The size as {x,y}.
   */
  #setBaseSize(size) {
    // check canvas creation
    if (!canCreateCanvas(size.x, size.y)) {
      throw new Error('Cannot create canvas with size ' +
        size.x + ', ' + size.y);
    }

    // set local
    this.#baseSize = size;

    // off screen canvas
    this.#offscreenCanvas.width = this.#baseSize.x;
    this.#offscreenCanvas.height = this.#baseSize.y;
    // original empty image data array
    this.#context.clearRect(0, 0, this.#baseSize.x, this.#baseSize.y);
    this.#imageData = this.#context.createImageData(
      this.#baseSize.x, this.#baseSize.y);
  }

  /**
   * Fit the layer to its parent container.
   *
   * @param {Scalar2D} containerSize The fit size as {x,y}.
   * @param {number} divToWorldSizeRatio The div to world size ratio.
   * @param {Scalar2D} fitOffset The fit offset as {x,y}.
   */
  fitToContainer(containerSize, divToWorldSizeRatio, fitOffset) {
    let needsDraw = false;

    // set canvas size if different from previous
    if (this.#canvas.width !== containerSize.x ||
      this.#canvas.height !== containerSize.y) {
      if (!canCreateCanvas(containerSize.x, containerSize.y)) {
        throw new Error('Cannot resize canvas ' +
          containerSize.x + ', ' + containerSize.y);
      }
      // canvas size change triggers canvas reset
      this.#canvas.width = containerSize.x;
      this.#canvas.height = containerSize.y;
      // update draw flag
      needsDraw = true;
    }

    // fit scale
    const divToImageSizeRatio = {
      x: divToWorldSizeRatio * this.#baseSpacing.x,
      y: divToWorldSizeRatio * this.#baseSpacing.y
    };
    // #scale = inputScale * fitScale * flipScale
    // flipScale does not change here, we can omit it
    // newScale = (#scale / fitScale) * newFitScale
    const newScale = {
      x: this.#scale.x * divToImageSizeRatio.x / this.#fitScale.x,
      y: this.#scale.y * divToImageSizeRatio.y / this.#fitScale.y
    };

    // set scales if different from previous
    if (this.#scale.x !== newScale.x ||
      this.#scale.y !== newScale.y) {
      this.#fitScale = divToImageSizeRatio;
      this.#scale = newScale;
      // update draw flag
      needsDraw = true;
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
      this.#offset = {
        x: this.#offset.x +
          newViewOffset.x - this.#viewOffset.x +
          newFlipOffset.x - this.#flipOffset.x,
        y: this.#offset.y +
          newViewOffset.y - this.#viewOffset.y +
          newFlipOffset.y - this.#flipOffset.y,
      };
      // update private local offsets
      this.#flipOffset = newFlipOffset;
      this.#viewOffset = newViewOffset;
      // update draw flag
      needsDraw = true;
    }

    // draw if needed
    if (needsDraw) {
      this.draw();
    }
  }

  /**
   * Enable and listen to container interaction events.
   */
  bindInteraction() {
    // allow pointer events
    this.#containerDiv.style.pointerEvents = 'auto';
    // interaction events
    const names = InteractionEventNames;
    for (let i = 0; i < names.length; ++i) {
      const eventName = names[i];
      const passive = eventName !== 'wheel';
      this.#containerDiv.addEventListener(
        eventName, this.#fireEvent, {passive: passive});
    }
  }

  /**
   * Disable and stop listening to container interaction events.
   */
  unbindInteraction() {
    // disable pointer events
    this.#containerDiv.style.pointerEvents = 'none';
    // interaction events
    const names = InteractionEventNames;
    for (let i = 0; i < names.length; ++i) {
      this.#containerDiv.removeEventListener(names[i], this.#fireEvent);
    }
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
   * Update the canvas image data.
   */
  #updateImageData() {
    // generate image data
    this.#viewController.generateImageData(this.#imageData);
    // pass the data to the off screen canvas
    this.#offscreenCanvas.getContext('2d').putImageData(this.#imageData, 0, 0);
    // update data flag
    this.#needsDataUpdate = false;
  }

  /**
   * Handle window/level change.
   *
   * @param {object} event The event fired when changing the window/level.
   */
  #onWLChange = (event) => {
    // generate and draw if no skip flag
    const skip = typeof event.skipGenerate !== 'undefined' &&
      event.skipGenerate === true;
    if (!skip) {
      this.#needsDataUpdate = true;
      this.draw();
    }
  };

  /**
   * Handle colour map change.
   *
   * @param {object} event The event fired when changing the colour map.
   */
  #onColourMapChange = (event) => {
    const skip = typeof event.skipGenerate !== 'undefined' &&
      event.skipGenerate === true;
    if (!skip) {
      this.#needsDataUpdate = true;
      this.draw();
    }
  };

  /**
   * Handle position change.
   *
   * @param {object} event The event fired when changing the position.
   */
  #onPositionChange = (event) => {
    const skip = typeof event.skipGenerate !== 'undefined' &&
      event.skipGenerate === true;
    if (!skip) {
      let valid = true;
      if (typeof event.valid !== 'undefined') {
        valid = event.valid;
      }
      // clear for non valid events
      if (!valid) {
        // clear only once
        if (this.#isValidPosition) {
          this.#isValidPosition = false;
          this.clear();
        }
      } else {
        // 3D dimensions
        const dims3D = [0, 1, 2];
        // remove scroll index
        const indexScrollIndex =
          dims3D.indexOf(this.#viewController.getScrollIndex());
        dims3D.splice(indexScrollIndex, 1);
        // remove non scroll index from diff dims
        const diffDims = event.diffDims.filter(function (item) {
          return dims3D.indexOf(item) === -1;
        });
        // update if we have something left
        if (diffDims.length !== 0 || !this.#isValidPosition) {
          // reset valid flag
          this.#isValidPosition = true;
          // reset update flag
          this.#needsDataUpdate = true;
          this.draw();
        }
      }
    }
  };

  /**
   * Handle alpha function change.
   *
   * @param {object} event The event fired when changing the function.
   */
  #onAlphaFuncChange = (event) => {
    const skip = typeof event.skipGenerate !== 'undefined' &&
      event.skipGenerate === true;
    if (!skip) {
      this.#needsDataUpdate = true;
      this.draw();
    }
  };

  /**
   * Set the current position.
   *
   * @param {Point} position The new position.
   * @param {Index} _index The new index.
   * @returns {boolean} True if the position was updated.
   */
  setCurrentPosition(position, _index) {
    return this.#viewController.setCurrentPosition(position);
  }

  /**
   * Clear the context.
   */
  clear() {
    // clear the context: reset the transform first
    // store the current transformation matrix
    this.#context.save();
    // use the identity matrix while clearing the canvas
    this.#context.setTransform(1, 0, 0, 1, 0, 0);
    this.#context.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
    // restore the transform
    this.#context.restore();
  }

} // ViewLayer class
