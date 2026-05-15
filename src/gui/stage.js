import {LayerGroup} from './layerGroup.js';
import {logger} from '../utils/logger.js';

/**
 * @import {ViewLayer} from '../gui/viewLayer.js';
 * @import {DrawLayer} from '../gui/drawLayer.js';
 */

/**
 * Stage: controls a list of layer groups and their
 * synchronisation.
 */
export class Stage {

  /**
   * Associated layer groups.
   *
   * @type {LayerGroup[]}
   */
  #layerGroups = [];

  /**
   * Active layer group index.
   *
   * @type {number|undefined}
   */
  #activeLayerGroupIndex;

  /**
   * Image smoothing flag.
   *
   * @type {boolean}
   */
  #imageSmoothing = false;

  // layer group binders
  #binders = [];
  // binder callbacks
  #callbackStore = null;

  /**
   * Get the layer group at the given index.
   *
   * @param {number} index The index.
   * @returns {LayerGroup|undefined} The layer group.
   */
  getLayerGroup(index) {
    return this.#layerGroups[index];
  }

  /**
   * Get the number of layer groups that form the stage.
   *
   * @returns {number} The number of layer groups.
   */
  getNumberOfLayerGroups() {
    return this.#layerGroups.length;
  }

  /**
   * Get the active layer group.
   *
   * @returns {LayerGroup|undefined} The layer group.
   */
  getActiveLayerGroup() {
    return this.getLayerGroup(this.#activeLayerGroupIndex);
  }

  /**
   * Set the active layer group.
   *
   * @param {number} index The layer group index.
   */
  setActiveLayerGroup(index) {
    if (typeof this.getLayerGroup(index) !== 'undefined') {
      this.#activeLayerGroupIndex = index;
    } else {
      logger.warn(`No layer group to set as active with index: ${
        index }`);
    }
  }

  /**
   * Get the view layers associated to a data id.
   *
   * @param {string} dataId The data id.
   * @returns {ViewLayer[]} The layers.
   */
  getViewLayersByDataId(dataId) {
    let res = [];
    for (const layerGroup of this.#layerGroups) {
      res = res.concat(layerGroup.getViewLayersByDataId(dataId));
    }
    return res;
  }

  /**
   * Get a list of view layers according to an input callback function.
   *
   * @param {Function} [callbackFn] A function that takes
   *   a ViewLayer as input and returns a boolean. If undefined,
   *   returns all view layers.
   * @returns {ViewLayer[]} The layers that
   *   satisfy the callbackFn.
   */
  getViewLayers(callbackFn) {
    let res = [];
    for (const layerGroup of this.#layerGroups) {
      res = res.concat(layerGroup.getViewLayers(callbackFn));
    }
    return res;
  }

  /**
   * Get the draw layers associated to a data id.
   *
   * @param {string} dataId The data id.
   * @returns {DrawLayer[]} The layers.
   */
  getDrawLayersByDataId(dataId) {
    let res = [];
    for (const layerGroup of this.#layerGroups) {
      res = res.concat(layerGroup.getDrawLayersByDataId(dataId));
    }
    return res;
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
    let res = [];
    for (const layerGroup of this.#layerGroups) {
      res = res.concat(layerGroup.getDrawLayers(callbackFn));
    }
    return res;
  }

  /**
   * Add a layer group to the list.
   *
   * The new layer group will be marked as the active layer group.
   *
   * @param {object} htmlElement The HTML element of the layer group.
   * @param {boolean} [withInfoOverlay] Optional with info overlay flag,
   * default to false.
   * @returns {LayerGroup} The newly created layer group.
   */
  addLayerGroup(htmlElement, withInfoOverlay) {
    this.#activeLayerGroupIndex = this.#layerGroups.length;
    const layerGroup = new LayerGroup(htmlElement, withInfoOverlay);
    layerGroup.setImageSmoothing(this.#imageSmoothing);
    // add to storage
    const isBound = this.#callbackStore && this.#callbackStore.length !== 0;
    if (isBound) {
      this.unbindLayerGroups();
    }
    this.#layerGroups.push(layerGroup);
    if (isBound) {
      this.bindLayerGroups();
    }
    // return created group
    return layerGroup;
  }

  /**
   * Get a layer group from an HTML element id.
   *
   * @param {string} id The element id to find.
   * @returns {LayerGroup|undefined} The layer group.
   */
  getLayerGroupByDivId(id) {
    return this.#layerGroups.find(function (item) {
      return item.getDivId() === id;
    });
  }

  /**
   * Set the layer groups binders.
   *
   * @param {Array} list The list of binder objects.
   */
  setBinders(list) {
    if (typeof list === 'undefined' || list === null) {
      throw new Error('Cannot set null or undefined binders');
    }
    if (this.#binders.length !== 0) {
      this.unbindLayerGroups();
    }
    this.#binders = list.slice();
    this.bindLayerGroups();
  }

  /**
   * Empty the layer group list.
   */
  empty() {
    this.unbindLayerGroups();
    for (const layerGroup of this.#layerGroups) {
      layerGroup.empty();
    }
    this.#layerGroups = [];
    this.#activeLayerGroupIndex = undefined;
  }

  /**
   * Remove all layers for a specific data.
   *
   * @param {string} dataId The data to remove its layers.
   */
  removeLayersByDataId(dataId) {
    for (const layerGroup of this.#layerGroups) {
      layerGroup.removeLayersByDataId(dataId);
    }
  }

  /**
   * Remove a layer group from this stage.
   *
   * @param {LayerGroup} layerGroup The layer group to remove.
   */
  removeLayerGroup(layerGroup) {
    // find layer
    const index = this.#layerGroups.findIndex((item) => item === layerGroup);
    if (index === -1) {
      throw new Error('Cannot find layerGroup to remove');
    }
    // unbind
    this.unbindLayerGroups();
    // empty layer group
    layerGroup.empty();
    // remove from storage
    this.#layerGroups.splice(index, 1);
    // update active index
    if (this.#activeLayerGroupIndex === index) {
      this.#activeLayerGroupIndex = undefined;
    }
    // bind
    this.bindLayerGroups();
  }

  /**
   * Reset the stage: calls reset on all layer groups.
   *
   * @deprecated Since v0.35, prefer resetZoomPan.
   */
  reset() {
    for (const layerGroup of this.#layerGroups) {
      layerGroup.reset();
    }
  }

  /**
   * Reset the zoom and pan of all layer groups.
   */
  resetZoomPan() {
    for (const layerGroup of this.#layerGroups) {
      layerGroup.resetZoomPan();
    }
  }

  /**
   * Reset the position and window level of all layer groups.
   */
  resetViews() {
    for (const layerGroup of this.#layerGroups) {
      layerGroup.resetViews();
    }
  }

  /**
   * Draw the stage: calls draw on all layer groups.
   */
  draw() {
    for (const layerGroup of this.#layerGroups) {
      layerGroup.draw();
    }
  }

  /**
   * Fit to container: synchronise the div to world size ratio
   *   of the group layers.
   */
  fitToContainer() {
    // find the minimum ratio
    let minRatio;
    const hasRatio = [];
    for (let i = 0; i < this.#layerGroups.length; ++i) {
      const ratio = this.#layerGroups[i].getDivToWorldSizeRatio();
      if (typeof ratio !== 'undefined' && this.#layerGroups[i].shouldBind()) {
        hasRatio.push(i);
        if (typeof minRatio === 'undefined' || ratio < minRatio) {
          minRatio = ratio;
        }
      }
    }
    // apply min ratio to layers
    for (let j = 0; j < this.#layerGroups.length; ++j) {
      if (hasRatio.includes(j) && this.#layerGroups[j].shouldBind()) {
        // minRatio has been set since hasRatio include j
        this.#layerGroups[j].fitToContainer(minRatio);
      } else {
        const ratio = this.#layerGroups[j].getDivToWorldSizeRatio();
        this.#layerGroups[j].fitToContainer(ratio);
      }
    }
  }

  /**
   * Bind the layer groups of the stage.
   */
  bindLayerGroups() {
    if (this.#layerGroups.length === 0 ||
      this.#layerGroups.length === 1 ||
      this.#binders.length === 0) {
      return;
    }
    // create callback store
    this.#callbackStore = new Array(this.#layerGroups.length);
    // add listeners
    for (let i = 0; i < this.#layerGroups.length; ++i) {
      if (this.#layerGroups[i].shouldBind()) {
        for (let j = 0; j < this.#binders.length; ++j) {
          this.#addEventListeners(i, this.#binders[j]);
        }
      }
    }
  }

  /**
   * Unbind the layer groups of the stage.
   */
  unbindLayerGroups() {
    if (this.#layerGroups.length === 0 ||
      this.#binders.length === 0 ||
      !this.#callbackStore) {
      return;
    }
    // remove listeners
    for (let i = 0; i < this.#layerGroups.length; ++i) {
      if (this.#layerGroups[i].shouldBind()) {
        for (let j = 0; j < this.#binders.length; ++j) {
          this.#removeEventListeners(i, this.#binders[j]);
        }
      }
    }
    // clear callback store
    this.#callbackStore = null;
  }

  /**
   * Set the imageSmoothing flag value.
   *
   * @param {boolean} flag True to enable smoothing.
   */
  setImageSmoothing(flag) {
    this.#imageSmoothing = flag;
    // set for existing layer groups
    for (const layerGroup of this.#layerGroups) {
      layerGroup.setImageSmoothing(flag);
    }
  }

  /**
   * Get the binder callback function for a given layer group index.
   * The function is created if not yet stored.
   *
   * @param {object} binder The layer binder.
   * @param {number} index The index of the associated layer group.
   * @returns {EventListener} The binder function.
   */
  #getBinderCallback(binder, index) {
    // silent exit
    // TODO: check if avoidable
    if (!this.#callbackStore) {
      return;
    }
    if (typeof this.#callbackStore[index] === 'undefined') {
      this.#callbackStore[index] = [];
    }
    const store = this.#callbackStore[index];
    let binderObj = store.find(function (elem) {
      return elem.binder === binder;
    });
    if (typeof binderObj === 'undefined') {
      // create new callback object
      binderObj = {
        binder,
        callback: ((/** @type {CustomEvent} */ event) => {
          // stop listeners
          this.#removeEventListeners(index, binder);
          // apply binder
          binder.getCallback(this.#layerGroups[index])(event);
          // re-start listeners
          this.#addEventListeners(index, binder);
        })
      };
      this.#callbackStore[index].push(binderObj);
    }
    return binderObj.callback;
  }

  /**
   * Add event listeners for a given layer group index and binder.
   *
   * @param {number} index The index of the associated layer group.
   * @param {object} binder The layer binder.
   */
  #addEventListeners(index, binder) {
    for (let i = 0; i < this.#layerGroups.length; ++i) {
      if (i !== index && this.#layerGroups[i].shouldBind()) {
        this.#layerGroups[index].addEventListener(
          binder.getEventType(),
          this.#getBinderCallback(binder, i)
        );
      }
    }
  }

  /**
   * Remove event listeners for a given layer group index and binder.
   *
   * @param {number} index The index of the associated layer group.
   * @param {object} binder The layer binder.
   */
  #removeEventListeners(index, binder) {
    if (!this.#callbackStore) {
      return;
    }
    for (const key in this.#callbackStore) {
      if (parseInt(key, 10) !== index) {
        for (const binderObj of this.#callbackStore[key]) {
          if (binderObj.binder.getEventType() === binder.getEventType()) {
            this.#layerGroups[index].removeEventListener(
              binder.getEventType(),
              binderObj.callback
            );
          }
        }
      }
    }
  }

} // class Stage
