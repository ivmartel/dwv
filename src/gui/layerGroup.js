import {getIdentityMat33, getCoronalMat33} from '../math/matrix';
import {Index} from '../math/index';
import {Point} from '../math/point';
import {Vector3D} from '../math/vector';
import {viewEventNames} from '../image/view';
import {ListenerHandler} from '../utils/listen';
import {logger} from '../utils/logger';
import {ViewLayer} from './viewLayer';
import {DrawLayer} from './drawLayer';

// doc imports
/* eslint-disable no-unused-vars */
import {Matrix33} from '../math/matrix';
import {Point3D} from '../math/point';
/* eslint-enable no-unused-vars */

/**
 * Get the layer div id.
 *
 * @param {string} groupDivId The layer group div id.
 * @param {number} layerId The lyaer id.
 * @returns {string} A string id.
 */
export function getLayerDivId(groupDivId, layerId) {
  return groupDivId + '-layer-' + layerId;
}

/**
 * Get the layer details from a div id.
 *
 * @param {string} idString The layer div id.
 * @returns {object} The layer details as {groupDivId, layerId}.
 */
export function getLayerDetailsFromLayerDivId(idString) {
  const split = idString.split('-layer-');
  if (split.length !== 2) {
    logger.warn('Not the expected layer div id format...');
  }
  return {
    groupDivId: split[0],
    layerId: split[1]
  };
}

/**
 * Get the layer details from a mouse event.
 *
 * @param {object} event The event to get the layer div id from. Expecting
 * an event origininating from a canvas inside a layer HTML div
 * with the 'layer' class and id generated with `getLayerDivId`.
 * @returns {object} The layer details as {groupDivId, layerId}.
 */
export function getLayerDetailsFromEvent(event) {
  let res = null;
  // get the closest element from the event target and with the 'layer' class
  const layerDiv = event.target.closest('.layer');
  if (layerDiv && typeof layerDiv.id !== 'undefined') {
    res = getLayerDetailsFromLayerDivId(layerDiv.id);
  }
  return res;
}

/**
 * Get the view orientation according to an image and target orientation.
 * The view orientation is used to go from target to image space.
 *
 * @param {Matrix33} imageOrientation The image geometry.
 * @param {Matrix33} targetOrientation The target orientation.
 * @returns {Matrix33} The view orientation.
 */
export function getViewOrientation(imageOrientation, targetOrientation) {
  let viewOrientation = getIdentityMat33();
  if (typeof targetOrientation !== 'undefined') {
    // i: image, v: view, t: target, O: orientation, P: point
    // [Img] -- Oi --> [Real] <-- Ot -- [Target]
    // Pi = (Oi)-1 * Ot * Pt = Ov * Pt
    // -> Ov = (Oi)-1 * Ot
    // TODO: asOneAndZeros simplifies but not nice...
    viewOrientation =
      imageOrientation.asOneAndZeros().getInverse().multiply(targetOrientation);
  }
  // TODO: why abs???
  return viewOrientation.getAbs();
}

/**
 * Get the target orientation according to an image and view orientation.
 * The target orientation is used to go from target to real space.
 *
 * @param {Matrix33} imageOrientation The image geometry.
 * @param {Matrix33} viewOrientation The view orientation.
 * @returns {Matrix33} The target orientation.
 */
export function getTargetOrientation(imageOrientation, viewOrientation) {
  // i: image, v: view, t: target, O: orientation, P: point
  // [Img] -- Oi --> [Real] <-- Ot -- [Target]
  // Pi = (Oi)-1 * Ot * Pt = Ov * Pt
  // -> Ot = Oi * Ov
  // note: asOneAndZeros as in getViewOrientation...
  let targetOrientation =
    imageOrientation.asOneAndZeros().multiply(viewOrientation);

  // TODO: why abs???
  const simpleImageOrientation = imageOrientation.asOneAndZeros().getAbs();
  if (simpleImageOrientation.equals(getCoronalMat33().getAbs())) {
    targetOrientation = targetOrientation.getAbs();
  }

  return targetOrientation;
}

/**
 * Get a scaled offset to adapt to new scale and such as the input center
 * stays at the same position.
 *
 * @param {object} offset The previous offset as {x,y}.
 * @param {object} scale The previous scale as {x,y}.
 * @param {object} newScale The new scale as {x,y}.
 * @param {object} center The scale center as {x,y}.
 * @returns {object} The scaled offset as {x,y}.
 */
export function getScaledOffset(offset, scale, newScale, center) {
  // worldPoint = indexPoint / scale + offset
  //=> indexPoint = (worldPoint - offset ) * scale

  // plane center should stay the same:
  // indexCenter / newScale + newOffset =
  //   indexCenter / oldScale + oldOffset
  //=> newOffset = indexCenter / oldScale + oldOffset -
  //     indexCenter / newScale
  //=> newOffset = worldCenter - indexCenter / newScale
  const indexCenter = {
    x: (center.x - offset.x) * scale.x,
    y: (center.y - offset.y) * scale.y
  };
  return {
    x: center.x - (indexCenter.x / newScale.x),
    y: center.y - (indexCenter.y / newScale.y)
  };
}

/**
 * Layer group.
 *
 * Display position: {x,y}
 * Plane position: Index (access: get(i))
 * (world) Position: Point3D (access: getX, getY, getZ)
 *
 * Display -> World:
 * planePos = viewLayer.displayToPlanePos(displayPos)
 * -> compensate for layer scale and offset
 * pos = viewController.getPositionFromPlanePoint(planePos)
 *
 * World -> display
 * planePos = viewController.getOffset3DFromPlaneOffset(pos)
 * no need yet for a planePos to displayPos...
 */
export class LayerGroup {

  /**
   * The container div.
   *
   * @type {HTMLElement}
   */
  #containerDiv;

  /**
   * List of layers.
   *
   * @type {Array}
   */
  #layers = [];

  /**
   * The layer scale as {x,y}.
   *
   * @type {object}
   */
  #scale = {x: 1, y: 1, z: 1};

  /**
   * The base scale as {x,y}: all posterior scale will be on top of this one.
   *
   * @type {object}
   */
  #baseScale = {x: 1, y: 1, z: 1};

  /**
   * The layer offset as {x,y}.
   *
   * @type {object}
   */
  #offset = {x: 0, y: 0, z: 0};

  /**
   * Active view layer index.
   *
   * @type {number}
   */
  #activeViewLayerIndex = undefined;

  /**
   * Active draw layer index.
   *
   * @type {number}
   */
  #activeDrawLayerIndex = undefined;

  /**
   * Listener handler.
   *
   * @type {ListenerHandler}
   */
  #listenerHandler = new ListenerHandler();

  /**
   * Flag to activate crosshair or not.
   *
   * @type {boolean}
   */
  #showCrosshair = false;

  /**
   * The current position used for the crosshair.
   *
   * @type {Point}
   */
  #currentPosition;

  /**
   * Image smoothing flag.
   *
   * @type {boolean}
   */
  #imageSmoothing = false;

  /**
   * @param {HTMLElement} containerDiv The associated HTML div.
   */
  constructor(containerDiv) {
    this.#containerDiv = containerDiv;
  }

  /**
   * Get the showCrosshair flag.
   *
   * @returns {boolean} True to display the crosshair.
   */
  getShowCrosshair() {
    return this.#showCrosshair;
  }

  /**
   * Set the showCrosshair flag.
   *
   * @param {boolean} flag True to display the crosshair.
   */
  setShowCrosshair(flag) {
    this.#showCrosshair = flag;
    if (flag) {
      // listen to offset and zoom change
      this.addEventListener('offsetchange', this.#updateCrosshairOnChange);
      this.addEventListener('zoomchange', this.#updateCrosshairOnChange);
      // show crosshair div
      this.#showCrosshairDiv();
    } else {
      // listen to offset and zoom change
      this.removeEventListener('offsetchange', this.#updateCrosshairOnChange);
      this.removeEventListener('zoomchange', this.#updateCrosshairOnChange);
      // remove crosshair div
      this.#removeCrosshairDiv();
    }
  }

  /**
   * Set the imageSmoothing flag value.
   *
   * @param {boolean} flag True to enable smoothing.
   */
  setImageSmoothing(flag) {
    this.#imageSmoothing = flag;
    // set for existing layers
    for (let i = 0; i < this.#layers.length; ++i) {
      if (this.#layers[i] instanceof ViewLayer) {
        this.#layers[i].setImageSmoothing(flag);
      }
    }
  }

  /**
   * Update crosshair on offset or zoom change.
   *
   * @param {object} _event The change event.
   */
  #updateCrosshairOnChange = (_event) => {
    this.#showCrosshairDiv();
  };

  /**
   * Get the Id of the container div.
   *
   * @returns {string} The id of the div.
   */
  getDivId() {
    return this.#containerDiv.id;
  }

  /**
   * Get the layer scale.
   *
   * @returns {object} The scale as {x,y,z}.
   */
  getScale() {
    return this.#scale;
  }

  /**
   * Get the base scale.
   *
   * @returns {object} The scale as {x,y,z}.
   */
  getBaseScale() {
    return this.#baseScale;
  }

  /**
   * Get the added scale: the scale added to the base scale
   *
   * @returns {object} The scale as {x,y,z}.
   */
  getAddedScale() {
    return {
      x: this.#scale.x / this.#baseScale.x,
      y: this.#scale.y / this.#baseScale.y,
      z: this.#scale.z / this.#baseScale.z
    };
  }

  /**
   * Get the layer offset.
   *
   * @returns {object} The offset as {x,y,z}.
   */
  getOffset() {
    return this.#offset;
  }

  /**
   * Get the number of layers handled by this class.
   *
   * @returns {number} The number of layers.
   */
  getNumberOfLayers() {
    let count = 0;
    this.#layers.forEach(item => {
      if (typeof item !== 'undefined') {
        count++;
      }
    });
    return count;
  }

  /**
   * Get the active image layer.
   *
   * @returns {ViewLayer|undefined} The layer.
   */
  getActiveViewLayer() {
    let layer;
    if (typeof this.#activeViewLayerIndex !== 'undefined') {
      layer = this.#layers[this.#activeViewLayerIndex];
    } else {
      logger.info('No active view layer to return');
    }
    return layer;
  }

  /**
   * Get the view layers associated to a data id.
   *
   * @param {string} dataId The data id.
   * @returns {ViewLayer[]} The layers.
   */
  getViewLayersByDataId(dataId) {
    const res = [];
    for (let i = 0; i < this.#layers.length; ++i) {
      if (this.#layers[i] instanceof ViewLayer &&
        this.#layers[i].getDataId() === dataId) {
        res.push(this.#layers[i]);
      }
    }
    return res;
  }

  /**
   * Search view layers for equal imae meta data.
   *
   * @param {object} meta The meta data to find.
   * @returns {ViewLayer[]} The list of view layers that contain matched data.
   */
  searchViewLayers(meta) {
    const res = [];
    for (let i = 0; i < this.#layers.length; ++i) {
      if (this.#layers[i] instanceof ViewLayer) {
        if (this.#layers[i].getViewController().equalImageMeta(meta)) {
          res.push(this.#layers[i]);
        }
      }
    }
    return res;
  }

  /**
   * Get the view layers data indices.
   *
   * @returns {Array} The list of indices.
   */
  getViewDataIndices() {
    const res = [];
    for (let i = 0; i < this.#layers.length; ++i) {
      if (this.#layers[i] instanceof ViewLayer) {
        res.push(this.#layers[i].getDataId());
      }
    }
    return res;
  }

  /**
   * Get the active draw layer.
   *
   * @returns {DrawLayer|undefined} The layer.
   */
  getActiveDrawLayer() {
    let layer;
    if (typeof this.#activeDrawLayerIndex !== 'undefined') {
      layer = this.#layers[this.#activeDrawLayerIndex];
    } else {
      logger.info('No active draw layer to return');
    }
    return layer;
  }

  /**
   * Get the draw layers associated to a data id.
   *
   * @param {string} dataId The data id.
   * @returns {DrawLayer[]} The layers.
   */
  getDrawLayersByDataId(dataId) {
    const res = [];
    for (let i = 0; i < this.#layers.length; ++i) {
      if (this.#layers[i] instanceof DrawLayer &&
        this.#layers[i].getDataId() === dataId) {
        res.push(this.#layers[i]);
      }
    }
    return res;
  }

  /**
   * Set the active view layer.
   *
   * @param {number} index The index of the layer to set as active.
   */
  setActiveViewLayer(index) {
    if (this.#layers[index] instanceof ViewLayer) {
      this.#activeViewLayerIndex = index;
      /**
       * Active view layer change event.
       *
       * @event LayerGroup#activeviewlayerchange
       * @type {object}
       * @property {Array} value The changed value.
       */
      this.#fireEvent({
        type: 'activelayerchange',
        value: [this.#layers[index]]
      });
    } else {
      logger.warn('No view layer to set as active with index: ' +
        index);
    }
  }

  /**
   * Set the active view layer with a data id.
   *
   * @param {string} dataId The data id.
   */
  setActiveViewLayerByDataId(dataId) {
    let index;
    for (let i = 0; i < this.#layers.length; ++i) {
      if (this.#layers[i] instanceof ViewLayer &&
        this.#layers[i].getDataId() === dataId) {
        // stop at first one
        index = i;
        break;
      }
    }
    if (typeof index !== 'undefined') {
      this.setActiveViewLayer(index);
    } else {
      logger.warn('No view layer to set as active with dataId: ' +
        dataId);
    }
  }

  /**
   * Set the active draw layer.
   *
   * @param {number} index The index of the layer to set as active.
   */
  setActiveDrawLayer(index) {
    if (this.#layers[index] instanceof DrawLayer) {
      this.#activeDrawLayerIndex = index;
      this.#fireEvent({
        type: 'activelayerchange',
        value: [this.#layers[index]]
      });
    } else {
      logger.warn('No draw layer to set as active with index: ' +
        index);
    }
  }

  /**
   * Set the active draw layer with a data id.
   *
   * @param {string} dataId The data id.
   */
  setActiveDrawLayerByDataId(dataId) {
    let index;
    for (let i = 0; i < this.#layers.length; ++i) {
      if (this.#layers[i] instanceof DrawLayer &&
        this.#layers[i].getDataId() === dataId) {
        // stop at first one
        index = i;
        break;
      }
    }
    if (typeof index !== 'undefined') {
      this.setActiveDrawLayer(index);
    } else {
      logger.warn('No draw layer to set as active with dataId: ' +
        dataId);
    }
  }

  /**
   * Add a view layer.
   *
   * @returns {ViewLayer} The created layer.
   */
  addViewLayer() {
    // layer index
    const viewLayerIndex = this.#layers.length;
    // create div
    const div = this.#getNextLayerDiv();
    // prepend to container
    this.#containerDiv.append(div);
    // view layer
    const layer = new ViewLayer(div);
    layer.setImageSmoothing(this.#imageSmoothing);
    // add layer
    this.#layers.push(layer);
    // mark it as active
    this.setActiveViewLayer(viewLayerIndex);
    // bind view layer events
    this.#bindViewLayer(layer);
    // return
    return layer;
  }

  /**
   * Add a draw layer.
   *
   * @returns {DrawLayer} The created layer.
   */
  addDrawLayer() {
    // store active index
    this.#activeDrawLayerIndex = this.#layers.length;
    // create div
    const div = this.#getNextLayerDiv();
    // prepend to container
    this.#containerDiv.append(div);
    // draw layer
    const layer = new DrawLayer(div);
    // add layer
    this.#layers.push(layer);
    // bind draw layer events
    this.#bindDrawLayer(layer);
    // return
    return layer;
  }

  /**
   * Bind view layer events to this.
   *
   * @param {ViewLayer} viewLayer The view layer to bind.
   */
  #bindViewLayer(viewLayer) {
    // listen to position change to update other group layers
    viewLayer.addEventListener(
      'positionchange', this.updateLayersToPositionChange);
    // propagate view viewLayer-layer events
    for (let j = 0; j < viewEventNames.length; ++j) {
      viewLayer.addEventListener(viewEventNames[j], this.#fireEvent);
    }
    // propagate viewLayer events
    viewLayer.addEventListener('renderstart', this.#fireEvent);
    viewLayer.addEventListener('renderend', this.#fireEvent);
  }

  /**
   * Un-bind a view layer events to this.
   *
   * @param {ViewLayer} viewLayer The view layer to unbind.
   */
  #unbindViewLayer(viewLayer) {
    // listen to position change to update other group layers
    viewLayer.removeEventListener(
      'positionchange', this.updateLayersToPositionChange);
    // propagate view viewLayer-layer events
    for (let j = 0; j < viewEventNames.length; ++j) {
      viewLayer.removeEventListener(viewEventNames[j], this.#fireEvent);
    }
    // propagate viewLayer events
    viewLayer.removeEventListener('renderstart', this.#fireEvent);
    viewLayer.removeEventListener('renderend', this.#fireEvent);
  }

  /**
   * Bind draw layer events to this.
   *
   * @param {DrawLayer} drawLayer The draw layer to bind.
   */
  #bindDrawLayer(drawLayer) {
    // propagate drawLayer events
    drawLayer.addEventListener('drawcreate', this.#fireEvent);
    drawLayer.addEventListener('drawdelete', this.#fireEvent);
  }

  /**
   * Un-bind a draw layer events to this.
   *
   * @param {DrawLayer} drawLayer The draw layer to unbind.
   */
  #unbindDrawLayer(drawLayer) {
    // propagate drawLayer events
    drawLayer.removeEventListener('drawcreate', this.#fireEvent);
    drawLayer.removeEventListener('drawdelete', this.#fireEvent);
  }

  /**
   * Get the next layer DOM div.
   *
   * @returns {HTMLDivElement} A DOM div.
   */
  #getNextLayerDiv() {
    const div = document.createElement('div');
    div.id = getLayerDivId(this.getDivId(), this.#layers.length);
    div.className = 'layer';
    div.style.pointerEvents = 'none';
    return div;
  }

  /**
   * Empty the layer list.
   */
  empty() {
    this.#layers = [];
    // reset active indices
    this.#activeViewLayerIndex = undefined;
    this.#activeDrawLayerIndex = undefined;
    // remove possible crosshair
    this.#removeCrosshairDiv();
    // clean container div
    const previous = this.#containerDiv.getElementsByClassName('layer');
    if (previous) {
      while (previous.length > 0) {
        previous[0].remove();
      }
    }
  }

  /**
   * Remove a layer from this layer group.
   * Warning: if current active layer, the index will
   *   be set to `undefined`. Call one of the setActive
   *   methods to define the active index.
   *
   * @param {ViewLayer | DrawLayer} layer The layer to remove.
   */
  removeLayer(layer) {
    // find layer
    const index = this.#layers.findIndex((item) => item === layer);
    if (index === -1) {
      throw new Error('Cannot find layer to remove');
    }
    // unbind and update active index
    if (layer instanceof ViewLayer) {
      this.#unbindViewLayer(layer);
      if (this.#activeViewLayerIndex === index) {
        this.#activeViewLayerIndex = undefined;
      }
    } else {
      this.#unbindDrawLayer(layer);
      if (this.#activeDrawLayerIndex === index) {
        this.#activeDrawLayerIndex = undefined;
      }
    }
    // reset in storage
    this.#layers[index] = undefined;
    // update html
    const layerDiv = document.getElementById(layer.getId());
    if (layerDiv) {
      layerDiv.remove();
    }
  }

  /**
   * Show a crosshair at a given position.
   *
   * @param {Point} [position] The position where to show the crosshair,
   *   defaults to current position.
   */
  #showCrosshairDiv(position) {
    if (typeof position === 'undefined') {
      position = this.#currentPosition;
    }

    // remove previous
    this.#removeCrosshairDiv();

    // use first layer as base for calculating position and
    // line sizes
    const layer0 = this.#layers[0];
    const vc = layer0.getViewController();
    const p2D = vc.getPlanePositionFromPosition(position);
    const displayPos = layer0.planePosToDisplay(p2D.x, p2D.y);

    const lineH = document.createElement('hr');
    lineH.id = this.getDivId() + '-scroll-crosshair-horizontal';
    lineH.className = 'horizontal';
    lineH.style.width = this.#containerDiv.offsetWidth + 'px';
    lineH.style.left = '0px';
    lineH.style.top = displayPos.y + 'px';

    const lineV = document.createElement('hr');
    lineV.id = this.getDivId() + '-scroll-crosshair-vertical';
    lineV.className = 'vertical';
    lineV.style.width = this.#containerDiv.offsetHeight + 'px';
    lineV.style.left = (displayPos.x) + 'px';
    lineV.style.top = '0px';

    this.#containerDiv.appendChild(lineH);
    this.#containerDiv.appendChild(lineV);
  }

  /**
   * Remove crosshair divs.
   */
  #removeCrosshairDiv() {
    let div = document.getElementById(
      this.getDivId() + '-scroll-crosshair-horizontal');
    if (div) {
      div.remove();
    }
    div = document.getElementById(
      this.getDivId() + '-scroll-crosshair-vertical');
    if (div) {
      div.remove();
    }
  }

  /**
   * Update layers (but not the active view layer) to a position change.
   *
   * @param {object} event The position change event.
   */
  updateLayersToPositionChange = (event) => {
    // pause positionchange listeners
    for (let j = 0; j < this.#layers.length; ++j) {
      if (this.#layers[j] instanceof ViewLayer) {
        this.#layers[j].removeEventListener(
          'positionchange', this.updateLayersToPositionChange);
        this.#layers[j].removeEventListener('positionchange', this.#fireEvent);
      }
    }

    const index = new Index(event.value[0]);
    const position = new Point(event.value[1]);

    // store current position
    this.#currentPosition = position;

    if (this.#showCrosshair) {
      this.#showCrosshairDiv(position);
    }

    // origin of the first view layer
    let baseViewLayerOrigin0;
    let baseViewLayerOrigin;
    // update position for all layers except the source one
    for (let i = 0; i < this.#layers.length; ++i) {
      if (typeof this.#layers[i] === 'undefined') {
        continue;
      }

      // update base offset (does not trigger redraw)
      // TODO check draw layers update
      let hasSetOffset = false;
      if (this.#layers[i] instanceof ViewLayer) {
        const vc = this.#layers[i].getViewController();
        // origin0 should always be there
        const origin0 = vc.getOrigin();
        // depending on position, origin could be undefined
        const origin = vc.getOrigin(position);

        if (typeof baseViewLayerOrigin === 'undefined') {
          baseViewLayerOrigin0 = origin0;
          baseViewLayerOrigin = origin;
        } else {
          if (vc.canSetPosition(position) &&
            typeof origin !== 'undefined') {
            // TODO: compensate for possible different orientation between views

            const scrollDiff = baseViewLayerOrigin0.minus(origin0);
            const scrollOffset = new Vector3D(
              scrollDiff.getX(), scrollDiff.getY(), scrollDiff.getZ());

            const planeDiff = baseViewLayerOrigin.minus(origin);
            const planeOffset = new Vector3D(
              planeDiff.getX(), planeDiff.getY(), planeDiff.getZ());

            hasSetOffset =
              this.#layers[i].setBaseOffset(scrollOffset, planeOffset);
          }
        }
      }

      // update position (triggers redraw)
      let hasSetPos = false;
      if (this.#layers[i].getId() !== event.srclayerid) {
        hasSetPos = this.#layers[i].setCurrentPosition(position, index);
      }

      // force redraw if needed
      if (!hasSetPos && hasSetOffset) {
        this.#layers[i].draw();
      }
    }

    // re-start positionchange listeners
    for (let k = 0; k < this.#layers.length; ++k) {
      if (this.#layers[k] instanceof ViewLayer) {
        this.#layers[k].addEventListener(
          'positionchange', this.updateLayersToPositionChange);
        this.#layers[k].addEventListener('positionchange', this.#fireEvent);
      }
    }
  };

  /**
   * Calculate the fit scale: the scale that fits the largest data.
   *
   * @returns {number|undefined} The fit scale.
   */
  calculateFitScale() {
    // check container
    if (this.#containerDiv.offsetWidth === 0 &&
      this.#containerDiv.offsetHeight === 0) {
      throw new Error('Cannot fit to zero sized container.');
    }
    // get max size
    const maxSize = this.getMaxSize();
    if (typeof maxSize === 'undefined') {
      return undefined;
    }
    // return best fit
    return Math.min(
      this.#containerDiv.offsetWidth / maxSize.x,
      this.#containerDiv.offsetHeight / maxSize.y
    );
  }

  /**
   * Set the layer group fit scale.
   *
   * @param {number} scaleIn The fit scale.
   */
  setFitScale(scaleIn) {
    // get maximum size
    const maxSize = this.getMaxSize();
    // exit if none
    if (typeof maxSize === 'undefined') {
      return;
    }

    const containerSize = {
      x: this.#containerDiv.offsetWidth,
      y: this.#containerDiv.offsetHeight
    };
    // offset to keep data centered
    const fitOffset = {
      x: -0.5 * (containerSize.x - Math.floor(maxSize.x * scaleIn)),
      y: -0.5 * (containerSize.y - Math.floor(maxSize.y * scaleIn))
    };

    // apply to layers
    for (let j = 0; j < this.#layers.length; ++j) {
      if (typeof this.#layers[j] !== 'undefined') {
        this.#layers[j].fitToContainer(scaleIn, containerSize, fitOffset);
      }
    }

    // update crosshair
    if (this.#showCrosshair) {
      this.#showCrosshairDiv();
    }
  }

  /**
   * Get the largest data size.
   *
   * @returns {object|undefined} The largest size as {x,y}.
   */
  getMaxSize() {
    let maxSize = {x: 0, y: 0};
    for (let j = 0; j < this.#layers.length; ++j) {
      if (this.#layers[j] instanceof ViewLayer) {
        const size = this.#layers[j].getImageWorldSize();
        if (size.x > maxSize.x) {
          maxSize.x = size.x;
        }
        if (size.y > maxSize.y) {
          maxSize.y = size.y;
        }
      }
    }
    if (maxSize.x === 0 && maxSize.y === 0) {
      maxSize = undefined;
    }
    return maxSize;
  }

  /**
   * Flip all layers along the Z axis without offset compensation.
   */
  flipScaleZ() {
    this.#baseScale.z *= -1;
    this.setScale(this.#baseScale);
  }

  /**
   * Add scale to the layers. Scale cannot go lower than 0.1.
   *
   * @param {number} scaleStep The scale to add.
   * @param {Point3D} center The scale center Point3D.
   */
  addScale(scaleStep, center) {
    const newScale = {
      x: this.#scale.x * (1 + scaleStep),
      y: this.#scale.y * (1 + scaleStep),
      z: this.#scale.z * (1 + scaleStep)
    };
    this.setScale(newScale, center);
  }

  /**
   * Set the layers' scale.
   *
   * @param {object} newScale The scale to apply as {x,y,z}.
   * @param {Point3D} [center] The scale center Point3D.
   * @fires LayerGroup#zoomchange
   */
  setScale(newScale, center) {
    this.#scale = newScale;
    // apply to layers
    for (let i = 0; i < this.#layers.length; ++i) {
      if (typeof this.#layers[i] !== 'undefined') {
        this.#layers[i].setScale(this.#scale, center);
      }
    }

    // event value
    const value = [
      newScale.x,
      newScale.y,
      newScale.z
    ];
    if (typeof center !== 'undefined') {
      value.push(center.getX());
      value.push(center.getY());
      value.push(center.getZ());
    }

    /**
     * Zoom change event.
     *
     * @event LayerGroup#zoomchange
     * @type {object}
     * @property {Array} value The changed value.
     */
    this.#fireEvent({
      type: 'zoomchange',
      value: value
    });
  }

  /**
   * Add translation to the layers.
   *
   * @param {object} translation The translation as {x,y,z}.
   */
  addTranslation(translation) {
    this.setOffset({
      x: this.#offset.x - translation.x,
      y: this.#offset.y - translation.y,
      z: this.#offset.z - translation.z
    });
  }

  /**
   * Set the layers' offset.
   *
   * @param {object} newOffset The offset as {x,y,z}.
   * @fires LayerGroup#offsetchange
   */
  setOffset(newOffset) {
    // store
    this.#offset = newOffset;
    // apply to layers
    for (let i = 0; i < this.#layers.length; ++i) {
      if (typeof this.#layers[i] !== 'undefined') {
        this.#layers[i].setOffset(this.#offset);
      }
    }

    /**
     * Offset change event.
     *
     * @event LayerGroup#offsetchange
     * @type {object}
     * @property {Array} value The changed value.
     */
    this.#fireEvent({
      type: 'offsetchange',
      value: [
        this.#offset.x,
        this.#offset.y,
        this.#offset.z
      ]
    });
  }

  /**
   * Reset the stage to its initial scale and no offset.
   */
  reset() {
    this.setScale(this.#baseScale);
    this.setOffset({x: 0, y: 0, z: 0});
  }

  /**
   * Draw the layer.
   */
  draw() {
    for (let i = 0; i < this.#layers.length; ++i) {
      if (typeof this.#layers[i] !== 'undefined') {
        this.#layers[i].draw();
      }
    }
  }

  /**
   * Display the layer.
   *
   * @param {boolean} flag Whether to display the layer or not.
   */
  display(flag) {
    for (let i = 0; i < this.#layers.length; ++i) {
      if (typeof this.#layers[i] !== 'undefined') {
        this.#layers[i].display(flag);
      }
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
    this.#listenerHandler.fireEvent(event);
  };

} // LayerGroup class
