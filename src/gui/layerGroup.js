import {Index} from '../math/index.js';
import {Point} from '../math/point.js';
import {Vector3D} from '../math/vector.js';
import {viewEventNames} from '../image/view.js';
import {ListenerHandler} from '../utils/listen.js';
import {logger} from '../utils/logger.js';
import {precisionRound} from '../utils/string.js';
import {ViewLayer} from './viewLayer.js';
import {DrawLayer} from './drawLayer.js';
import {SOPClassUIDs} from '../dicom/dictionary.js';

// doc imports
/* eslint-disable no-unused-vars */
import {Point2D, Point3D} from '../math/point.js';
import {Scalar2D, Scalar3D} from '../math/scalar.js';
import {PositionHelper} from '../image/positionHelper.js';
/* eslint-enable no-unused-vars */

/**
 * Get the layer div id.
 *
 * @param {string} groupDivId The layer group div id.
 * @param {number} layerIndex The layer index.
 * @returns {string} A string id.
 */
export function getLayerDivId(groupDivId, layerIndex) {
  return groupDivId + '-layer-' + layerIndex;
}

/**
 * Get the layer details from a div id.
 *
 * @param {string} idString The layer div id.
 * @returns {object} The layer details as {groupDivId, layerIndex, layerId}.
 */
export function getLayerDetailsFromLayerDivId(idString) {
  const split = idString.split('-layer-');
  if (split.length !== 2) {
    logger.warn('Not the expected layer div id format...');
  }
  return {
    groupDivId: split[0],
    layerIndex: split[1],
    layerId: idString,
  };
}

/**
 * Get the layer details from a mouse event.
 *
 * @param {object} event The event to get the layer div id from. Expecting
 * an event origininating from a canvas inside a layer HTML div
 * with the 'layer' class and id generated with `getLayerDivId`.
 * @returns {object} The layer details as {groupDivId, layerIndex, layerId}.
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
 * Get a scaled offset to adapt to new scale and such as the input center
 * stays at the same position.
 *
 * @param {Scalar2D} offset The previous offset as {x,y}.
 * @param {Scalar2D} scale The previous scale as {x,y}.
 * @param {Scalar2D} newScale The new scale as {x,y}.
 * @param {Scalar2D} center The scale center as {x,y}.
 * @returns {Scalar2D} The scaled offset as {x,y}.
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
 * - Display position: {x,y},
 * - Plane position: Index (access: get(i)),
 * - (world) Position: Point3D (access: getX, getY, getZ).
 *
 * Display -> World:
 * - planePos = viewLayer.displayToPlanePos(displayPos)
 *   -> compensate for layer scale and offset,
 * - pos = viewController.getPositionFromPlanePoint(planePos).
 *
 * World -> Display:
 * - planePos = viewController.getOffset3DFromPlaneOffset(pos)
 *   no need yet for a planePos to displayPos...
 */
export class LayerGroup {

  /**
   * The container div.
   *
   * @type {HTMLElement}
   */
  #containerDiv;

  // jsdoc does not like
  // @type {(ViewLayer|DrawLayer)[]}

  /**
   * List of layers.
   *
   * @type {Array<ViewLayer|DrawLayer>}
   */
  #layers = [];

  /**
   * The layer scale as {x,y,z}.
   *
   * @type {Scalar3D}
   */
  #scale = {x: 1, y: 1, z: 1};

  /**
   * The base scale as {x,y,z}: all posterior scale will be on top of this one.
   *
   * @type {Scalar3D}
   */
  #baseScale = {x: 1, y: 1, z: 1};

  /**
   * The layer offset as {x,y,z}.
   *
   * @type {Scalar3D}
   */
  #offset = {x: 0, y: 0, z: 0};

  /**
   * Active layer index.
   *
   * @type {number}
   */
  #activeLayerIndex = undefined;

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
   * Crosshair HTML elements.
   *
   * @type {HTMLElement[]}
   */
  #crosshairHtmlElements = [];

  /**
   * Tooltip HTML element.
   *
   * @type {HTMLElement}
   */
  #tooltipHtmlElement;

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
   * Position helper.
   *
   * @type {PositionHelper}
   */
  #positionHelper;

  /**
   * Get the position helper.
   *
   * @returns {PositionHelper} The position helper.
   */
  getPositionHelper() {
    if (typeof this.#positionHelper === 'undefined') {
      for (const layer of this.#layers) {
        if (layer instanceof ViewLayer) {
          const controller = layer.getViewController();
          const helper = controller.getPositionHelperClone();
          if (typeof this.#positionHelper === 'undefined') {
            this.#positionHelper = helper;
          } else {
            this.#positionHelper.merge(helper);
          }
        }
      }
    }
    return this.#positionHelper;
  }

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
    for (const layer of this.#layers) {
      if (layer instanceof ViewLayer) {
        layer.setImageSmoothing(flag);
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
   * @returns {string|undefined} The id of the div.
   */
  getDivId() {
    let divId;
    // could be null if html changed
    if (this.#containerDiv !== null) {
      divId = this.#containerDiv.id;
    }
    return divId;
  }

  /**
   * Get the layer scale.
   *
   * @returns {Scalar3D} The scale as {x,y,z}.
   */
  getScale() {
    return this.#scale;
  }

  /**
   * Get the base scale.
   *
   * @returns {Scalar3D} The scale as {x,y,z}.
   */
  getBaseScale() {
    return this.#baseScale;
  }


  /**
   * Get the added scale: the scale added to the base scale.
   *
   * @returns {Scalar3D} The scale as {x,y,z}.
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
   * @returns {Scalar3D} The offset as {x,y,z}.
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
   * Check if this layerGroup contains a layer with the input id.
   *
   * @param {string} id The layer id to look for.
   * @returns {boolean} True if this group contains
   *   a layer with the input id.
   */
  includes(id) {
    if (typeof id === 'undefined') {
      return false;
    }
    for (const layer of this.#layers) {
      if (typeof layer !== 'undefined' &&
        layer.getId() === id) {
        return true;
      }
    }
    return false;
  }

  /**
   * Get the view layers that satisfy the input callback function.
   *
   * @param {Function} [callbackFn] A function that takes
   *   a ViewLayer as input and returns a boolean. If undefined,
   *   returns all view layers.
   * @returns {ViewLayer[]} The layers that
   *   satisfy the callbackFn.
   */
  getViewLayers(callbackFn) {
    if (typeof callbackFn === 'undefined') {
      callbackFn = function () {
        return true;
      };
    }
    const res = [];
    for (const layer of this.#layers) {
      if (layer instanceof ViewLayer &&
        callbackFn(layer)) {
        res.push(layer);
      }
    }
    return res;
  }

  /**
   * Get the view layers that satisfy the input callback function
   * starting from the active layer.
   *
   * @param {Function} [callbackFn] A function that takes
   *   a ViewLayer as input and returns a boolean. If undefined,
   *   returns all view layers.
   * @returns {ViewLayer[]} The layers that
   *   satisfy the callbackFn.
   */
  getViewLayersFromActive(callbackFn) {
    if (typeof callbackFn === 'undefined') {
      callbackFn = function () {
        return true;
      };
    }

    let activeIndex = 0;
    if (typeof this.#activeLayerIndex !== 'undefined') {
      activeIndex = this.#activeLayerIndex;
    }

    const indices = [];
    // from active index to 0
    for (let i = activeIndex; i >= 0; i--) {
      indices.push(i);
    }
    // from number of layers to active
    for (let i = this.#layers.length - 1; i > activeIndex; i--) {
      indices.push(i);
    }

    const res = [];

    for (const index of indices) {
      const layer = this.#layers[index];
      if (layer instanceof ViewLayer && callbackFn(layer)) {
        res.push(layer);
      }
    }

    return res;
  }

  /**
   * Test if one of the view layers satisfies an input callbackFn.
   *
   * @param {Function} callbackFn A function that takes
   *   a ViewLayer as input and returns a boolean.
   * @returns {boolean} True if one of the ViewLayers
   *   satisfies the callbackFn.
   */
  someViewLayer(callbackFn) {
    let hasOne = false;
    for (const layer of this.#layers) {
      if (layer instanceof ViewLayer &&
        callbackFn(layer)) {
        hasOne = true;
        break;
      }
    }
    return hasOne;
  }

  /**
   * Get a list of draw layers according to an input callback function.
   *
   * @param {Function} [callbackFn] A function that takes
   *   a DrawLayer as input and returns a boolean. If undefined,
   *   returns all draw layers.
   * @returns {DrawLayer[]} The layers that
   *   satisfy the callbackFn.
   */
  getDrawLayers(callbackFn) {
    if (typeof callbackFn === 'undefined') {
      callbackFn = function () {
        return true;
      };
    }
    const res = [];
    for (const layer of this.#layers) {
      if (layer instanceof DrawLayer &&
        callbackFn(layer)) {
        res.push(layer);
      }
    }
    return res;
  }

  /**
   * Get the number of view layers handled by this class.
   *
   * @returns {number} The number of layers.
   */
  getNumberOfViewLayers() {
    let count = 0;
    this.#layers.forEach(item => {
      if (typeof item !== 'undefined' &&
        item instanceof ViewLayer) {
        count++;
      }
    });
    return count;
  }

  /**
   * Get the active image layer.
   *
   * @returns {ViewLayer|DrawLayer|undefined} The layer.
   */
  getActiveLayer() {
    let layer;
    if (typeof this.#activeLayerIndex !== 'undefined') {
      layer = this.#layers[this.#activeLayerIndex];
    }
    return layer;
  }

  /**
   * Get the active image layer.
   *
   * @returns {ViewLayer|undefined} The layer.
   */
  getActiveViewLayer() {
    let layer;
    const activeLayer = this.getActiveLayer();
    if (typeof activeLayer !== 'undefined' &&
      activeLayer instanceof ViewLayer) {
      layer = activeLayer;
    }
    return layer;
  }

  /**
   * Get the base view layer.
   *
   * @returns {ViewLayer|undefined} The layer.
   */
  getBaseViewLayer() {
    // use first layer as base for calculating position and
    // line sizes
    let baseLayer;
    for (const layer of this.#layers) {
      if (layer instanceof ViewLayer) {
        baseLayer = layer;
        break;
      }
    }
    if (typeof baseLayer === 'undefined') {
      logger.warn('No layer found');
      return;
    }
    return baseLayer;
  }

  /**
   * Get a view layer associated to a data id.
   *
   * @param {string} id The layer id.
   * @returns {ViewLayer|undefined} The layer.
   */
  getViewLayerById(id) {
    const callbackFn = function (layer) {
      return layer.getId() === id;
    };
    const layers = this.getViewLayers(callbackFn);
    let layer;
    if (layers.length === 1) {
      layer = layers[0];
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
    const callbackFn = function (layer) {
      return layer.getDataId() === dataId;
    };
    return this.getViewLayers(callbackFn);
  }

  /**
   * Search view layers for equal image meta data.
   *
   * @param {object} meta The meta data to find.
   * @returns {ViewLayer[]} The list of view layers that contain matched data.
   */
  searchViewLayers(meta) {
    const metaClone = structuredClone(meta);
    // extract sop instance
    let sopInstanceUid;
    if (typeof metaClone.SOPInstanceUID !== 'undefined') {
      sopInstanceUid = metaClone.SOPInstanceUID;
      delete metaClone.SOPInstanceUID;
    }
    const hasSopInstance = typeof sopInstanceUid !== 'undefined';
    const hasMeta = Object.keys(metaClone).length !== 0;

    const res = [];
    for (const layer of this.#layers) {
      if (layer instanceof ViewLayer) {
        let equalMeta = false;
        if (hasMeta) {
          equalMeta = layer.getViewController().equalImageMeta(metaClone);
        }
        let includesSopInstance = false;
        if (hasSopInstance) {
          includesSopInstance =
            layer.getViewController().includesImageUid(sopInstanceUid);
        }

        let check = false;
        if (hasMeta && hasSopInstance) {
          check = equalMeta && includesSopInstance;
        } else if (hasMeta) {
          check = equalMeta;
        } else if (hasSopInstance) {
          check = includesSopInstance;
        }

        if (check) {
          res.push(layer);
        }
      }
    }
    return res;
  }

  /**
   * Get the view layers data indices.
   *
   * @returns {string[]} The list of indices.
   */
  getViewDataIndices() {
    const res = [];
    for (const layer of this.#layers) {
      if (layer instanceof ViewLayer) {
        res.push(layer.getDataId());
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
    const activeLayer = this.getActiveLayer();
    if (typeof activeLayer !== 'undefined' &&
      activeLayer instanceof DrawLayer) {
      layer = activeLayer;
    }
    return layer;
  }

  /**
   * Get a draw layer associated to a data id.
   *
   * @param {string} id The layer id.
   * @returns {DrawLayer|undefined} The layer.
   */
  getDrawLayerById(id) {
    const callbackFn = function (layer) {
      return layer.getId() === id;
    };
    const layers = this.getDrawLayers(callbackFn);
    let layer;
    if (layers.length === 1) {
      layer = layers[0];
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
    const callbackFn = function (layer) {
      return layer.getDataId() === dataId;
    };
    return this.getDrawLayers(callbackFn);
  }

  /**
   * Set the active layer.
   *
   * @param {number} index The index of the layer to set as active.
   */
  setActiveLayer(index) {
    this.#activeLayerIndex = index;
    /**
     * Active layer change event.
     *
     * @event LayerGroup#activelayerchange
     * @type {object}
     * @property {string} type The event type.
     * @property {Array} value The changed value.
     */
    this.#fireEvent({
      type: 'activelayerchange',
      value: [this.#layers[index]]
    });
  }

  /**
   * Set the active layer with a layer id.
   *
   * @param {string} id The layer id.
   */
  setActiveLayerById(id) {
    let index;
    for (let i = 0; i < this.#layers.length; ++i) {
      if (typeof this.#layers[i] !== 'undefined' &&
        this.#layers[i].getId() === id) {
        // stop at first one
        index = i;
        break;
      }
    }
    if (typeof index !== 'undefined') {
      this.setActiveLayer(index);
    } else {
      logger.warn('No layer to set as active with id: ' +
        id);
    }
  }

  /**
   * Set the active layer with a data id.
   *
   * @param {string} dataId The data id.
   */
  setActiveLayerByDataId(dataId) {
    let index;
    for (let i = 0; i < this.#layers.length; ++i) {
      if (typeof this.#layers[i] !== 'undefined' &&
        this.#layers[i].getDataId() === dataId) {
        // stop at first one
        index = i;
        break;
      }
    }
    if (typeof index !== 'undefined') {
      this.setActiveLayer(index);
    } else {
      logger.warn('No layer to set as active with dataId: ' +
        dataId);
    }
  }

  /**
   * Add a view layer.
   *
   * The new layer will be marked as the active view layer.
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
    this.setActiveLayer(viewLayerIndex);
    // bind view layer events
    this.#bindViewLayer(layer);

    // force helper update
    this.#positionHelper = undefined;

    // return
    return layer;
  }

  /**
   * Add a draw layer.
   *
   * The new layer will be marked as the active draw layer.
   *
   * @returns {DrawLayer} The created layer.
   */
  addDrawLayer() {
    // store active index
    this.#activeLayerIndex = this.#layers.length;
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
    for (const eventName of viewEventNames) {
      viewLayer.addEventListener(eventName, this.#fireEvent);
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
    // stop listening to position change to update other group layers
    viewLayer.removeEventListener(
      'positionchange', this.updateLayersToPositionChange);
    // stop propagating view viewLayer-layer events
    for (const eventName of viewEventNames) {
      viewLayer.removeEventListener(eventName, this.#fireEvent);
    }
    // stop propagating viewLayer events
    viewLayer.removeEventListener('renderstart', this.#fireEvent);
    viewLayer.removeEventListener('renderend', this.#fireEvent);

    // stop view layer - image binding
    // (binding is done in layer.setView)
    viewLayer.unbindImage();
  }

  /**
   * Bind draw layer events to this.
   *
   * @param {DrawLayer} drawLayer The draw layer to bind.
   */
  #bindDrawLayer(drawLayer) {
    // listen to position change to update other group layers
    drawLayer.addEventListener(
      'positionchange', this.updateLayersToPositionChange);
    drawLayer.addEventListener(
      'positionchange', this.#fireEvent);
  }

  /**
   * Un-bind a draw layer events to this.
   *
   * @param {DrawLayer} drawLayer The draw layer to unbind.
   */
  #unbindDrawLayer(drawLayer) {
    // stop listening to position change to update other group layers
    drawLayer.removeEventListener(
      'positionchange', this.updateLayersToPositionChange);
    drawLayer.removeEventListener(
      'positionchange', this.#fireEvent);
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
    for (const layer of this.#layers) {
      if (typeof layer !== 'undefined') {
        this.removeLayer(layer);
      }
    }
    this.#layers = [];
    // remove possible crosshair
    this.#removeCrosshairDiv();
  }

  /**
   * Remove all layers for a specific data.
   *
   * @param {string} dataId The data to remove its layers.
   */
  removeLayersByDataId(dataId) {
    for (const layer of this.#layers) {
      if (typeof layer !== 'undefined' &&
        layer.getDataId() === dataId) {
        this.removeLayer(layer);
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
   * @fires LayerGroup#removelayer
   */
  removeLayer(layer) {
    // find layer
    const index = this.#layers.findIndex((item) => item === layer);
    if (index === -1) {
      throw new Error('Cannot find layer to remove');
    }
    // update active index
    if (this.#activeLayerIndex === index) {
      this.#activeLayerIndex = undefined;
    }
    // unbind and update active index
    if (layer instanceof ViewLayer) {
      this.#unbindViewLayer(layer);
    } else {
      this.#unbindDrawLayer(layer);
    }
    // reset in storage
    this.#layers[index] = undefined;
    // force helper update
    this.#positionHelper = undefined;
    // update html
    layer.removeFromDOM();

    /**
     * Remove layer event.
     *
     * @event LayerGroup#removelayer
     * @type {object}
     * @property {string} type The event type.
     * @property {string} layerid The layer id.
     * @property {string} layergroupid The layer group id.
     */
    this.#fireEvent({
      type: 'layerremove',
      layerid: layer.getId(),
      layergroupid: this.getDivId()
    });
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
    let baseLayer;
    for (const layer of this.#layers) {
      if (layer instanceof ViewLayer) {
        baseLayer = layer;
        break;
      }
    }
    if (typeof baseLayer === 'undefined') {
      logger.warn('No layer to show crosshair');
      return;
    }

    const vc = baseLayer.getViewController();
    const planePos = vc.getPlanePositionFromPosition(position);
    const displayPos = baseLayer.planePosToDisplay(planePos);

    // horizontal line
    if (typeof displayPos.getY() !== 'undefined') {
      const lineH = document.createElement('hr');
      lineH.id = this.getDivId() + '-scroll-crosshair-horizontal';
      lineH.className = 'horizontal';
      lineH.style.width = this.#containerDiv.offsetWidth + 'px';
      lineH.style.left = '0px';
      lineH.style.top = displayPos.getY() + 'px';
      // add to local array
      this.#crosshairHtmlElements.push(lineH);
      // add to html
      this.#containerDiv.appendChild(lineH);
    }

    // vertical line
    if (typeof displayPos.getX() !== 'undefined') {
      const lineV = document.createElement('hr');
      lineV.id = this.getDivId() + '-scroll-crosshair-vertical';
      lineV.className = 'vertical';
      lineV.style.width = this.#containerDiv.offsetHeight + 'px';
      lineV.style.left = (displayPos.getX()) + 'px';
      lineV.style.top = '0px';
      // add to local array
      this.#crosshairHtmlElements.push(lineV);
      // add to html
      this.#containerDiv.appendChild(lineV);
    }
  }

  /**
   * Remove crosshair divs.
   */
  #removeCrosshairDiv() {
    for (const element of this.#crosshairHtmlElements) {
      element.remove();
    }
    this.#crosshairHtmlElements = [];
  }

  /**
   * Displays a tooltip in a temporary `span`.
   * Works with css to hide/show the span only on mouse hover.
   *
   * @param {Point2D} point The update point.
   */
  showTooltip(point) {
    // remove previous div
    this.removeTooltipDiv();

    const viewLayer = this.getBaseViewLayer();
    const viewController = viewLayer.getViewController();
    const planePos = viewLayer.displayToPlanePos(point);
    const position = viewController.getPositionFromPlanePoint(planePos);
    const value = viewController.getRescaledImageValue(position);

    // create
    if (typeof value !== 'undefined') {
      const span = document.createElement('span');
      span.id = 'scroll-tooltip';
      // tooltip position
      span.style.left = (point.getX() + 10) + 'px';
      span.style.top = (point.getY() + 10) + 'px';
      let text = precisionRound(value, 3).toString();
      if (typeof viewController.getPixelUnit() !== 'undefined') {
        text += ' ' + viewController.getPixelUnit();
      }
      span.appendChild(document.createTextNode(text));
      // add to local var
      this.#tooltipHtmlElement = span;
      // add to html
      this.#containerDiv.appendChild(span);
    }
  }

  /**
   * Remove the tooltip html div.
   */
  removeTooltipDiv() {
    if (typeof this.#tooltipHtmlElement !== 'undefined') {
      this.#tooltipHtmlElement.remove();
      this.#tooltipHtmlElement = undefined;
    }
  }

  /**
   * Can the input position be set on one of the view layers.
   *
   * @param {Point} position The input position.
   * @returns {boolean} True if one view layer accepts the input position.
   */
  isPositionInBounds(position) {
    return this.someViewLayer(function (layer) {
      return layer.getViewController().isPositionInBounds(position);
    });
  }

  /**
   * Can one of the view layers be scrolled.
   *
   * @returns {boolean} True if one view layer can be scrolled.
   */
  canScroll() {
    return this.someViewLayer(function (layer) {
      return layer.getViewController().canScroll();
    });
  }

  /**
   * Returns whether or not a layer group should have its zoom/pan/etc
   * synced to other views. Used for things like Secondary Capture where
   * there is no meaningful real-world scale.
   *
   * @returns {boolean} Whether to sync the zoom/pan.
   */
  shouldBind() {
    const baseLayer = this.getBaseViewLayer();
    if (!baseLayer) {
      return false;
    }

    const SOPClassUID = baseLayer.getViewController().getSopClassUid();
    if (typeof SOPClassUID === 'undefined' || SOPClassUID === null) {
      // We don't know what it is, assume it is a normal scan
      return true;
    }

    const dontSync =
      // Secondary Capture
      SOPClassUID.startsWith(SOPClassUIDs.SecondaryCapture);

    return !dontSync;
  }

  /**
   * Does one of the view layer have more than one slice in the
   *   given dimension.
   *
   * @param {number} dim The input dimension.
   * @returns {boolean} True if one view layer has more than one slice.
   */
  moreThanOne(dim) {
    return this.someViewLayer(function (layer) {
      return layer.getViewController().moreThanOne(dim);
    });
  }

  /**
   * Update layers (but not the event source layer) to a position change.
   *
   * @param {object} event The position change event.
   * @function
   */
  updateLayersToPositionChange = (event) => {
    // pause positionchange listeners
    for (const layer of this.#layers) {
      if (typeof layer !== 'undefined') {
        layer.removeEventListener(
          'positionchange', this.updateLayersToPositionChange);
        layer.removeEventListener('positionchange', this.#fireEvent);
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
    const viewLayerOffsets = {};
    let baseViewLayerOrigin0;
    let baseViewLayerOrigin;
    // update position for all layers except the source one
    for (const layer of this.#layers) {
      if (typeof layer === 'undefined') {
        continue;
      }
      let hasSetOffset = false;

      // view layer case: define and set offsets
      if (layer instanceof ViewLayer) {
        const vc = layer.getViewController();
        // origin0 should always be there
        const origin0 = vc.getOrigin();
        // depending on position, origin could be undefined
        const origin = vc.getOrigin(position);

        let scrollOffset;
        let planeOffset;

        if (typeof baseViewLayerOrigin === 'undefined') {
          // first view layer, store origins
          baseViewLayerOrigin0 = origin0;
          baseViewLayerOrigin = origin;
          // no offset
          scrollOffset = new Vector3D(0, 0, 0);
          planeOffset = new Vector3D(0, 0, 0);
        } else {
          if (vc.isPositionInBounds(position) &&
            typeof origin !== 'undefined') {
            // TODO: compensate for possible different orientation between views
            const scrollDiff = baseViewLayerOrigin0.minus(origin0);
            scrollOffset = new Vector3D(
              scrollDiff.getX(), scrollDiff.getY(), scrollDiff.getZ());
            const planeDiff = baseViewLayerOrigin.minus(origin);
            planeOffset = new Vector3D(
              planeDiff.getX(), planeDiff.getY(), planeDiff.getZ());
          }
        }

        // set and store offsets
        if (typeof scrollOffset !== 'undefined' &&
          typeof planeOffset !== 'undefined') {
          hasSetOffset =
            layer.setBaseOffset(
              scrollOffset, planeOffset,
              baseViewLayerOrigin, baseViewLayerOrigin0
            );
          // store
          viewLayerOffsets[layer.getId()] = {
            scroll: scrollOffset,
            plane: planeOffset
          };
        }
      }

      // draw layer case: use associated view layer offsets
      if (layer instanceof DrawLayer) {
        const refOffsets = viewLayerOffsets[layer.getReferenceLayerId()];
        if (typeof refOffsets !== 'undefined') {
          hasSetOffset =
            layer.setBaseOffset(refOffsets.scroll, refOffsets.plane);
        }
      }

      // update position (triggers redraw)
      let hasSetPos = false;
      if (layer.getId() !== event.srclayerid) {
        hasSetPos = layer.setCurrentPosition(position, index);
      }

      // force redraw if needed
      if (!hasSetPos && hasSetOffset) {
        layer.draw();
      }
    }

    // re-start positionchange listeners
    for (const layer of this.#layers) {
      if (typeof layer !== 'undefined') {
        layer.addEventListener(
          'positionchange', this.updateLayersToPositionChange);
        layer.addEventListener('positionchange', this.#fireEvent);
      }
    }
  };

  /**
   * Calculate the div to world size ratio needed to fit
   *   the largest data.
   *
   * @returns {number|undefined} The ratio.
   */
  getDivToWorldSizeRatio() {
    // check container
    if (this.#containerDiv.offsetWidth === 0 &&
      this.#containerDiv.offsetHeight === 0) {
      throw new Error('Cannot fit to zero sized container with id \'' +
        this.#containerDiv.id + '\'.'
      );
    }
    // get max world size
    const maxWorldSize = this.getMaxWorldSize();
    if (typeof maxWorldSize === 'undefined') {
      return undefined;
    }
    // if the container has a width but no height,
    // resize it to follow the same ratio to completely
    // fill the div with the image
    if (this.#containerDiv.offsetHeight === 0) {
      const ratioX = this.#containerDiv.offsetWidth / maxWorldSize.x;
      const height = maxWorldSize.y * ratioX;
      this.#containerDiv.style.height = height + 'px';
    }
    // return best fit
    return Math.min(
      this.#containerDiv.offsetWidth / maxWorldSize.x,
      this.#containerDiv.offsetHeight / maxWorldSize.y
    );
  }

  /**
   * Fit to container: set the layers div to world size ratio.
   *
   * @param {number} divToWorldSizeRatio The ratio.
   */
  fitToContainer(divToWorldSizeRatio) {
    // get maximum world size
    const maxWorldSize = this.getMaxWorldSize();
    // exit if none
    if (typeof maxWorldSize === 'undefined') {
      return;
    }

    const containerSize = {
      x: this.#containerDiv.offsetWidth,
      y: this.#containerDiv.offsetHeight
    };
    // offset to keep data centered
    const fitOffset = {
      x: -0.5 *
        (containerSize.x - Math.floor(maxWorldSize.x * divToWorldSizeRatio)),
      y: -0.5 *
        (containerSize.y - Math.floor(maxWorldSize.y * divToWorldSizeRatio))
    };

    // apply to layers
    for (const layer of this.#layers) {
      if (typeof layer !== 'undefined') {
        layer.fitToContainer(containerSize, divToWorldSizeRatio, fitOffset);
      }
    }

    // update crosshair
    if (this.#showCrosshair) {
      this.#showCrosshairDiv();
    }
  }

  /**
   * Get the largest data world (mm) size.
   *
   * @returns {Scalar2D|undefined} The largest size as {x,y}.
   */
  getMaxWorldSize() {
    let maxSize = {x: 0, y: 0};
    for (const layer of this.#layers) {
      if (layer instanceof ViewLayer) {
        const size = layer.getImageWorldSize();
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
   * @param {Scalar3D} newScale The scale to apply as {x,y,z}.
   * @param {Point3D} [center] The scale center Point3D.
   * @fires LayerGroup#zoomchange
   */
  setScale(newScale, center) {
    this.#scale = newScale;
    // apply to layers
    for (const layer of this.#layers) {
      if (typeof layer !== 'undefined') {
        layer.setScale(this.#scale, center);
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
     * @property {string} type The event type.
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
   * @param {Scalar3D} translation The translation as {x,y,z}.
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
   * @param {Scalar3D} newOffset The offset as {x,y,z}.
   * @fires LayerGroup#offsetchange
   */
  setOffset(newOffset) {
    // store
    this.#offset = newOffset;
    // apply to layers
    for (const layer of this.#layers) {
      if (typeof layer !== 'undefined') {
        layer.setOffset(this.#offset);
      }
    }

    /**
     * Offset change event.
     *
     * @event LayerGroup#offsetchange
     * @type {object}
     * @property {string} type The event type.
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
    for (const layer of this.#layers) {
      if (typeof layer !== 'undefined') {
        layer.draw();
      }
    }
  }

  /**
   * Display the layer.
   *
   * @param {boolean} flag Whether to display the layer or not.
   */
  display(flag) {
    for (const layer of this.#layers) {
      if (typeof layer !== 'undefined') {
        layer.display(flag);
      }
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
    this.#listenerHandler.fireEvent(event);
  };

} // LayerGroup class
