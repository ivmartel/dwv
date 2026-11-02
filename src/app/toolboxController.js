import {InteractionEventNames} from '../gui/generic.js';

/**
 * @import {LayerGroup} from '../gui/layerGroup.js';
 * @import {ViewLayer} from '../gui/viewLayer.js';
 * @import {DrawLayer} from '../gui/drawLayer.js';
 */

/**
 * Toolbox controller.
 */
export class ToolboxController {

  /**
   * List of tools to control.
   *
   * @type {object}
   */
  #toolList;

  /**
   * Selected tool.
   *
   * @type {object}
   */
  #selectedTool = null;

  /**
   * Callback store to allow attach/detach.
   *
   * @type {Array}
   */
  #callbackStore = [];

  /**
   * Current layers bound to tool.
   *
   * @type {object}
   */
  #boundLayers = {};

  /**
   * Ids of the layers with a touch in progress.
   *
   * @type {Set<string>}
   */
  #touchedLayerIds = new Set();

  /**
   * Layers that are not active anymore but stay bound until the end
   * of their touch, indexed by layer id: touch events keep going to
   * the element where the touch started.
   *
   * @type {Record<string, ViewLayer|DrawLayer>}
   */
  #pendingUnbindLayers = {};

  /**
   * @param {object} toolList The list of tool objects.
   */
  constructor(toolList) {
    this.#toolList = toolList;
  }

  /**
   * Initialise.
   */
  init() {
    for (const key in this.#toolList) {
      this.#toolList[key].init();
    }
    // enable shortcuts
    this.enableShortcuts(true);
  }

  /**
   * Enable or disable shortcuts. The 'init' methods enables shortcuts
   *  by default. Call this method after init to disable shortcuts.
   *
   * @param {boolean} flag True to enable shortcuts.
   */
  enableShortcuts(flag) {
    if (flag) {
      window.addEventListener('keydown',
        this.#getCallback('window', 'keydown'), true);
    } else {
      window.removeEventListener('keydown',
        this.#getCallback('window', 'keydown'), true);
    }
  }

  /**
   * Get the tool list.
   *
   * @returns {Array} The list of tool objects.
   */
  getToolList() {
    return this.#toolList;
  }

  /**
   * Check if a tool is in the tool list.
   *
   * @param {string} name The name to check.
   * @returns {boolean} The tool list element for the given name.
   */
  hasTool(name) {
    return typeof this.getToolList()[name] !== 'undefined';
  }

  /**
   * Get the selected tool.
   *
   * @returns {object} The selected tool.
   */
  getSelectedTool() {
    return this.#selectedTool;
  }

  /**
   * Get the selected tool event handler.
   *
   * @param {string} eventType The event type, for example
   *   mousedown, touchstart...
   * @returns {EventListener|undefined} The event handler, undefined
   *   if no tool is selected.
   */
  getSelectedToolEventHandler(eventType) {
    if (!this.getSelectedTool()) {
      return undefined;
    }
    return this.getSelectedTool()[eventType];
  }

  /**
   * Set the selected tool.
   *
   * @param {string} name The name of the tool.
   */
  setSelectedTool(name) {
    // check if we have it
    if (!this.hasTool(name)) {
      throw new Error(`Unknown tool: '${name}'`);
    }
    // de-activate previous
    if (this.#selectedTool) {
      this.#selectedTool.activate(false);
    }
    // set internal var
    this.#selectedTool = this.#toolList[name];
    // activate new tool
    this.#selectedTool.activate(true);
  }

  /**
   * Set the selected tool live features.
   *
   * @param {object} list The list of features.
   */
  setToolFeatures(list) {
    if (this.getSelectedTool()) {
      this.getSelectedTool().setFeatures(list);
    }
  }

  /**
   * Listen to layer interaction events.
   *
   * @param {LayerGroup} layerGroup The associated layer group.
   * @param {ViewLayer|DrawLayer} layer The layer to listen to.
   */
  bindLayerGroup(layerGroup, layer) {
    const divId = layerGroup.getDivId();
    // listen to active layer changes
    layerGroup.addEventListener(
      'activelayerchange', this.#getActiveLayerChangeHandler(divId));
    // bind the layer
    this.#internalBindLayerGroup(divId, layer);
  }

  /**
   * Bind a layer group to this controller.
   *
   * @param {string} layerGroupDivId The layer group div id.
   * @param {ViewLayer|DrawLayer} layer The layer.
   */
  #internalBindLayerGroup(layerGroupDivId, layer) {
    // remove from local list if preset
    const previous = this.#boundLayers[layerGroupDivId];
    if (typeof previous !== 'undefined') {
      if (this.#touchedLayerIds.has(previous.getId())) {
        // keep it bound until the end of its touch
        this.#pendingUnbindLayers[previous.getId()] = previous;
      } else {
        this.#unbindLayer(previous);
      }
    }
    // replace layer in local list
    this.#boundLayers[layerGroupDivId] = layer;
    // bind layer if not still bound
    if (typeof this.#pendingUnbindLayers[layer.getId()] !== 'undefined') {
      delete this.#pendingUnbindLayers[layer.getId()];
    } else {
      this.#bindLayer(layer);
    }
  }

  /**
   * End the touch of a layer and unbind it if it is not active anymore.
   *
   * @param {string} layerId The layer id.
   * @param {TouchEvent} event The touch end or cancel event.
   */
  #endTouch(layerId, event) {
    // other touches started on the same target are still in progress
    if (event.targetTouches?.length > 0) {
      return;
    }
    this.#touchedLayerIds.delete(layerId);
    const pending = this.#pendingUnbindLayers[layerId];
    if (typeof pending !== 'undefined') {
      delete this.#pendingUnbindLayers[layerId];
      this.#unbindLayer(pending);
    }
  }

  /**
   * Get an active layer change handler.
   *
   * @param {string} divId The associated layer group div id.
   * @returns {EventListener} The event handler.
   */
  #getActiveLayerChangeHandler(divId) {
    return ((/** @type {CustomEvent} */ event) => {
      const value = event.detail?.value;
      const layer = value?.[0];
      if (typeof layer !== 'undefined') {
        this.#internalBindLayerGroup(divId, layer);
      }
    });
  }

  /**
   * Add canvas mouse and touch listeners to a layer.
   *
   * @param {ViewLayer|DrawLayer} layer The layer to start listening to.
   */
  #bindLayer(layer) {
    layer.bindInteraction();
    // interaction events
    const names = InteractionEventNames;
    for (let i = 0; i < names.length; ++i) {
      layer.addEventListener(names[i],
        this.#getCallback(layer.getId(), names[i]));
    }
  }

  /**
   * Remove canvas mouse and touch listeners to a layer.
   *
   * @param {ViewLayer|DrawLayer} layer The layer to stop listening to.
   */
  #unbindLayer(layer) {
    layer.unbindInteraction();
    // interaction events
    const names = InteractionEventNames;
    for (let i = 0; i < names.length; ++i) {
      layer.removeEventListener(names[i],
        this.#getCallback(layer.getId(), names[i]));
    }
  }

  /**
   * Mou(se) and (T)ouch event handler. This function just determines
   * the mouse/touch position relative to the canvas element.
   * It then passes it to the current tool.
   *
   * @param {string} layerId The layer id.
   * @param {string} eventType The event type.
   * @returns {object} A callback for the provided layer and event.
   */
  #getCallback(layerId, eventType) {
    if (typeof this.#callbackStore[layerId] === 'undefined') {
      this.#callbackStore[layerId] = [];
    }

    if (typeof this.#callbackStore[layerId][eventType] === 'undefined') {
      const applySelectedTool = (event) => {
        // store the touch before the tool handles it: the tool can
        // change the active layer (for ex the draw tool creating a draw
        // layer), the layer is then kept bound until the end of its touch
        if (event.type === 'touchstart') {
          this.#touchedLayerIds.add(layerId);
        }
        // make sure we have a tool
        if (this.#selectedTool) {
          const func = this.#selectedTool[event.type];
          if (func) {
            func(event);
          }
        }
        if (event.type === 'touchend' || event.type === 'touchcancel') {
          this.#endTouch(layerId, event);
        }
      };
      // store callback
      this.#callbackStore[layerId][eventType] = applySelectedTool;
    }

    return this.#callbackStore[layerId][eventType];
  }

} // class ToolboxController
