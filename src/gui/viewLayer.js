import {Index} from '../math/index';
import {ListenerHandler} from '../utils/listen';
import {viewEventNames} from '../image/view';
import {ViewController} from '../app/viewController';
import {
  canCreateCanvas,
  InteractionEventNames
} from './generic';
import {getScaledOffset} from './layerGroup';

// doc imports
/* eslint-disable no-unused-vars */
import {Vector3D} from '../math/vector';
import {Point, Point3D} from '../math/point';
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
   * @type {object}
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
   * @type {object}
   */
  #baseSize;

  /**
   * The layer base spacing as {x,y}.
   *
   * @type {object}
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
   * @type {object}
   */
  #scale = {x: 1, y: 1};

  /**
   * The layer fit scale.
   *
   * @type {object}
   */
  #fitScale = {x: 1, y: 1};

  /**
   * The layer flip scale.
   *
   * @type {object}
   */
  #flipScale = {x: 1, y: 1, z: 1};

  /**
   * The layer offset.
   *
   * @type {object}
   */
  #offset = {x: 0, y: 0};

  /**
   * The base layer offset.
   *
   * @type {object}
   */
  #baseOffset = {x: 0, y: 0};

  /**
   * The view offset.
   *
   * @type {object}
   */
  #viewOffset = {x: 0, y: 0};

  /**
   * The zoom offset.
   *
   * @type {object}
   */
  #zoomOffset = {x: 0, y: 0};

  /**
   * The flip offset.
   *
   * @type {object}
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
   * @type {object}
   */
  #listenerHandler = new ListenerHandler();

  /**
   * Image smoothing flag.
   * see: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/imageSmoothingEnabled
   *
   * @type {boolean}
   */
  #imageSmoothing = false;

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
    view.addEventListener('colourchange', this.#onColourChange);
    view.addEventListener('positionchange', this.#onPositionChange);
    view.addEventListener('alphafuncchange', this.#onAlphaFuncChange);
    // view events
    for (let j = 0; j < viewEventNames.length; ++j) {
      view.addEventListener(viewEventNames[j], this.#fireEvent);
    }
    // create view controller
    this.#viewController = new ViewController(view, dataId);
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
   * Handle an image change event.
   *
   * @param {object} event The event.
   */
  onimagechange = (event) => {
    // event.value = [index]
    if (this.#dataId === event.dataid) {
      this.#needsDataUpdate = true;
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
   * Get the layer base size (without scale).
   *
   * @returns {object} The size as {x,y}.
   */
  getBaseSize() {
    return this.#baseSize;
  }

  /**
   * Get the image world (mm) 2D size.
   *
   * @returns {object} The 2D size as {x,y}.
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
    // flip scale is handled by layer group
    // flip offset
    this.#flipOffset.x += this.#canvas.width / this.#scale.x;
    this.#offset.x += this.#flipOffset.x;
  }

  /**
   * Add a flip offset along the layer Y axis.
   */
  addFlipOffsetY() {
    // flip scale is handled by layer group
    // flip offset
    this.#flipOffset.y += this.#canvas.height / this.#scale.y;
    this.#offset.y += this.#flipOffset.y;
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
   * @param {object} newScale The scale as {x,y}.
   * @param {Point3D} center The scale center.
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
   * Set the base layer offset. Updates the layer offset.
   *
   * @param {Vector3D} scrollOffset The scroll offset vector.
   * @param {Vector3D} planeOffset The plane offset vector.
   * @returns {boolean} True if the offset was updated.
   */
  setBaseOffset(scrollOffset, planeOffset) {
    const helper = this.#viewController.getPlaneHelper();
    const scrollIndex = helper.getNativeScrollIndex();
    const newOffset = helper.getPlaneOffsetFromOffset3D({
      x: scrollIndex === 0 ? scrollOffset.getX() : planeOffset.getX(),
      y: scrollIndex === 1 ? scrollOffset.getY() : planeOffset.getY(),
      z: scrollIndex === 2 ? scrollOffset.getZ() : planeOffset.getZ(),
    });
    const needsUpdate = this.#baseOffset.x !== newOffset.x ||
    this.#baseOffset.y !== newOffset.y;
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
   * @param {object} newOffset The offset as {x,y}.
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
   * Transform a display position to an index.
   *
   * @param {number} x The X position.
   * @param {number} y The Y position.
   * @returns {Index} The equivalent index.
   */
  displayToPlaneIndex(x, y) {
    const planePos = this.displayToPlanePos(x, y);
    return new Index([
      Math.floor(planePos.x),
      Math.floor(planePos.y)
    ]);
  }

  /**
   * Remove scale from a display position.
   *
   * @param {number} x The X position.
   * @param {number} y The Y position.
   * @returns {object} The de-scaled position as {x,y}.
   */
  displayToPlaneScale(x, y) {
    return {
      x: x / this.#scale.x,
      y: y / this.#scale.y
    };
  }

  /**
   * Get a plane position from a display position.
   *
   * @param {number} x The X position.
   * @param {number} y The Y position.
   * @returns {object} The plane position as {x,y}.
   */
  displayToPlanePos(x, y) {
    const deScaled = this.displayToPlaneScale(x, y);
    return {
      x: deScaled.x + this.#offset.x,
      y: deScaled.y + this.#offset.y
    };
  }

  /**
   * Get a display position from a plane position.
   *
   * @param {number} x The X position.
   * @param {number} y The Y position.
   * @returns {object} The display position as {x,y}.
   */
  planePosToDisplay(x, y) {
    return {
      x: (x - this.#offset.x + this.#baseOffset.x) * this.#scale.x,
      y: (y - this.#offset.y + this.#baseOffset.y) * this.#scale.y
    };
  }

  /**
   * Get a main plane position from a display position.
   *
   * @param {number} x The X position.
   * @param {number} y The Y position.
   * @returns {object} The main plane position as {x,y}.
   */
  displayToMainPlanePos(x, y) {
    const planePos = this.displayToPlanePos(x, y);
    return {
      x: planePos.x - this.#baseOffset.x,
      y: planePos.y - this.#baseOffset.y
    };
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
   * The imageData variable needs to be set
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
   * Initialise the layer: set the canvas and context
   *
   * @param {object} size The image size as {x,y}.
   * @param {object} spacing The image spacing as {x,y}.
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
   * @param {object} size The size as {x,y}.
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
   * @param {number} fitScale1D The 1D fit scale.
   * @param {object} fitSize The fit size as {x,y}.
   * @param {object} fitOffset The fit offset as {x,y}.
   */
  fitToContainer(fitScale1D, fitSize, fitOffset) {
    let needsDraw = false;

    // update canvas size if needed (triggers canvas reset)
    if (this.#canvas.width !== fitSize.x || this.#canvas.height !== fitSize.y) {
      if (!canCreateCanvas(fitSize.x, fitSize.y)) {
        throw new Error('Cannot resize canvas ' + fitSize.x + ', ' + fitSize.y);
      }
      // canvas size  change triggers canvas reset
      this.#canvas.width = fitSize.x;
      this.#canvas.height = fitSize.y;
      // update draw flag
      needsDraw = true;
    }
    // previous fit scale
    const previousFitScale = this.#fitScale;
    // previous scale without fit
    const previousScale = {
      x: this.#scale.x / this.#fitScale.x,
      y: this.#scale.y / this.#fitScale.y
    };
    // fit scale
    const newFitScale = {
      x: fitScale1D * this.#baseSpacing.x,
      y: fitScale1D * this.#baseSpacing.y
    };
    // scale
    const newScale = {
      x: previousScale.x * newFitScale.x,
      y: previousScale.y * newFitScale.y
    };
    // check if different
    if (previousScale.x !== newScale.x || previousScale.y !== newScale.y) {
      this.#fitScale = newFitScale;
      this.#scale = newScale;
      // update draw flag
      needsDraw = true;
    }

    // view offset
    const newViewOffset = {
      x: fitOffset.x / newFitScale.x,
      y: fitOffset.y / newFitScale.y
    };
    const newFlipOffset = {
      x: this.#flipOffset.x * previousFitScale.x / newFitScale.x,
      y: this.#flipOffset.y * previousFitScale.y / newFitScale.y
    };
    // check if different
    if (this.#viewOffset.x !== newViewOffset.x ||
      this.#viewOffset.y !== newViewOffset.y ||
      this.#flipOffset.x !== newFlipOffset.x ||
      this.#flipOffset.y !== newFlipOffset.y) {
      // update private local offsets
      this.#flipOffset = newFlipOffset;
      this.#viewOffset = newViewOffset;
      // update global offset
      this.#offset = {
        x: this.#viewOffset.x +
          this.#baseOffset.x +
          this.#zoomOffset.x +
          this.#flipOffset.x,
        y: this.#viewOffset.y +
          this.#baseOffset.y +
          this.#zoomOffset.y +
          this.#flipOffset.y
      };
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
      this.#containerDiv.addEventListener(
        names[i], this.#fireEvent, {passive: true});
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
   * @param {object} callback The method associated with the provided
   *   event type, will be called with the fired event.
   */
  addEventListener(type, callback) {
    this.#listenerHandler.add(type, callback);
  }

  /**
   * Remove an event listener from this class.
   *
   * @param {string} type The event type.
   * @param {object} callback The method associated with the provided
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
  #onColourChange = (event) => {
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
