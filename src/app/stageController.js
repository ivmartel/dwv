import {viewEventNames} from '../image/view.js';
import {ViewFactory} from '../image/viewFactory.js';
import {
  getMatrixFromName,
  getOrientationStringLPS,
  Orientation,
  getViewOrientation
} from '../math/orientation.js';
import {DIRECTION_EPSILON} from '../image/geometry.js';
import {Point3D} from '../math/point.js';
import {Stage} from '../gui/stage.js';
import {getLayerDetailsFromLayerDivId} from '../gui/layerGroup.js';
import {logger} from '../utils/logger.js';
import {WindowLevel} from '../image/windowLevel.js';
import {PlaneHelper} from '../image/planeHelper.js';

/**
 * @import {LayerGroup} from '../gui/layerGroup.js';
 * @import {ViewLayer} from '../gui/viewLayer.js';
 * @import {DrawLayer} from '../gui/drawLayer.js';
 * @import {Matrix33} from '../math/matrix.js';
 * @import {Scalar3D} from '../math/scalar.js';
 * @import {AnnotationGroup} from '../image/annotationGroup.js';
 * @import {DataController} from './dataController.js';
 * @import {ToolboxController} from './toolboxController.js';
 * @import {ViewConfig} from './application.js';
 */

/**
 * Events fired by the StageController (propagated to App).
 */
export const stageControllerEventNames = [
  'viewlayeradd',
  'drawlayeradd',
  'error',
  'zoomchange',
  'offsetchange',
  'layerremove',
  'outofrange',
  'renderstart',
  'renderend',
  ...viewEventNames,
];

/**
 * Stage controller: manages the link between the data view configs
 * and the stage (layer groups, layers, rendering).
 */
export class StageController extends EventTarget {

  /**
   * The stage.
   *
   * @type {Stage}
   */
  #stage = null;

  /**
   * The data controller.
   *
   * @type {DataController}
   */
  #dataController;

  /**
   * App options.
   *
   * @type {object}
   */
  #options;

  /**
   * The toolbox controller.
   *
   * @type {ToolboxController|undefined}
   */
  #toolboxController;

  /**
   * Add to undo stack callback.
   *
   * @type {Function|undefined}
   */
  #addToUndoStack;

  /**
   * Info data getter callback.
   *
   * @type {Function|undefined}
   */
  #getInfoData;

  /**
   * @param {DataController} dataController The data controller.
   * @param {object} options The app options.
   */
  constructor(dataController, options) {
    super();
    this.#dataController = dataController;
    this.#options = options;
    this.#stage = new Stage();
    if (typeof options.binders !== 'undefined') {
      this.#stage.setBinders(options.binders);
    }
  }

  /**
   * Set the toolbox controller.
   *
   * @param {ToolboxController} tc The toolbox controller.
   */
  setToolboxController(tc) {
    this.#toolboxController = tc;
  }

  /**
   * Set the add-to-undo-stack callback.
   *
   * @param {Function} fn The callback.
   */
  setAddToUndoStack(fn) {
    this.#addToUndoStack = fn;
  }

  /**
   * Set the info data getter callback.
   *
   * @param {Function} fn A function `(dataId) => InfoData`.
   */
  setGetInfoData(fn) {
    this.#getInfoData = fn;
  }

  // View config methods -------------------------------------------------------

  /**
   * Get the layer group configuration from a data id.
   *
   * @param {string} dataId The data id.
   * @param {boolean} [excludeStarConfig] Exclude the star config
   *  (default to false).
   * @returns {ViewConfig[]} The list of associated configs.
   */
  getViewConfigs(dataId, excludeStarConfig) {
    if (typeof excludeStarConfig === 'undefined') {
      excludeStarConfig = false;
    }
    // check options
    if (this.#options.dataViewConfigs === null ||
      typeof this.#options.dataViewConfigs === 'undefined') {
      throw new Error('No available data view configuration');
    }
    let configs = [];
    if (typeof this.#options.dataViewConfigs[dataId] !== 'undefined') {
      configs = this.#options.dataViewConfigs[dataId];
    } else if (!excludeStarConfig &&
      typeof this.#options.dataViewConfigs['*'] !== 'undefined') {
      configs = this.#options.dataViewConfigs['*'];
    }
    return configs;
  }

  /**
   * Get the layer group configuration for a data id and group div id.
   *
   * @param {string} dataId The data id.
   * @param {string} groupDivId The layer group div id.
   * @param {boolean} [excludeStarConfig] Exclude the star config
   *  (default to false).
   * @returns {ViewConfig|undefined} The associated config.
   */
  getViewConfig(dataId, groupDivId, excludeStarConfig) {
    const configs = this.getViewConfigs(dataId, excludeStarConfig);
    return configs.find(function (item) {
      return item.divId === groupDivId;
    });
  }

  /**
   * Get the data view config.
   * Careful, returns a reference; do not modify without resetting.
   *
   * @returns {Record<string, ViewConfig[]>} The configuration list.
   */
  getDataViewConfigs() {
    return this.#options.dataViewConfigs;
  }

  /**
   * Set the data view configuration.
   * Resets the stage and recreates all the views.
   *
   * @param {Record<string, ViewConfig[]>} configs The configuration list.
   */
  setDataViewConfigs(configs) {
    // clean up
    this.#stage.empty();
    // set new
    this.#options.dataViewConfigs = configs;
    // create layer groups
    this.#createLayerGroups(configs);
  }

  /**
   * Add a data view config.
   *
   * @param {string} dataId The data id.
   * @param {ViewConfig} config The view configuration.
   * @param {boolean} [doRender] Render data after configuration
   *   add. Defaults to true.
   */
  addDataViewConfig(dataId, config, doRender) {
    if (typeof doRender === 'undefined') {
      doRender = true;
    }
    // add to list
    const configs = this.#options.dataViewConfigs;
    if (typeof configs[dataId] === 'undefined') {
      configs[dataId] = [];
    }
    const equalDivId = function (item) {
      return item.divId === config.divId;
    };
    const itemIndex = configs[dataId].findIndex(equalDivId);
    if (itemIndex === -1) {
      this.#options.dataViewConfigs[dataId].push(config);
    } else {
      throw new Error(`Duplicate view config for data ${dataId
      } and div ${config.divId}`);
    }

    // add layer group if not done
    if (typeof this.#stage.getLayerGroupByDivId(config.divId) === 'undefined') {
      this.#createLayerGroup(config);
    }

    // render (will create layers)
    if (typeof this.#dataController.get(dataId) !== 'undefined' &&
      doRender) {
      this.render(dataId, [config]);
    }
  }

  /**
   * Remove a data view config.
   * Removes the associated layer if found, removes
   *   the layer group if empty.
   *
   * @param {string} dataId The data id.
   * @param {string} divId The div id.
   */
  removeDataViewConfig(dataId, divId) {
    // input checks
    const configs = this.#options.dataViewConfigs;
    if (typeof configs[dataId] === 'undefined') {
      // no config for dataId
      return;
    }
    const equalDivId = function (item) {
      return item.divId === divId;
    };
    const itemIndex = configs[dataId].findIndex(equalDivId);
    if (itemIndex === -1) {
      // no config for divId
      return;
    }

    // remove from config list
    configs[dataId].splice(itemIndex, 1);
    if (configs[dataId].length === 0) {
      delete configs[dataId];
    }

    // update layer group
    const layerGroup = this.#stage.getLayerGroupByDivId(divId);
    if (typeof layerGroup !== 'undefined') {
      // remove layer if possible
      const vls = layerGroup.getViewLayersByDataId(dataId);
      if (vls.length === 1) {
        layerGroup.removeLayer(vls[0]);
      }
      const dls = layerGroup.getDrawLayersByDataId(dataId);
      if (dls.length === 1) {
        layerGroup.removeLayer(dls[0]);
      }
      // remove layer group if empty
      if (layerGroup.getNumberOfLayers() === 0) {
        this.#stage.removeLayerGroup(layerGroup);
      }
    }
  }

  /**
   * Update an existing data view config.
   * Removes and re-creates the layer if found.
   *
   * @param {string} dataId The data id.
   * @param {string} divId The div id.
   * @param {ViewConfig} config The view configuration.
   */
  updateDataViewConfig(dataId, divId, config) {
    // input checks
    const configs = this.#options.dataViewConfigs;
    // check data id
    if (typeof configs[dataId] === 'undefined') {
      throw new Error(`No config for dataId: ${dataId}`);
    }
    // check div id
    const equalDivId = function (item) {
      return item.divId === divId;
    };
    const itemIndex = configs[dataId].findIndex(equalDivId);
    if (itemIndex === -1) {
      throw new Error(`No config for dataId: ${
        dataId} and divId: ${divId}`);
    }

    // update config
    const configToUpdate = configs[dataId][itemIndex];
    for (const prop in config) {
      configToUpdate[prop] = config[prop];
    }

    // update layer group
    const layerGroup =
      this.#stage.getLayerGroupByDivId(configToUpdate.divId);
    if (typeof layerGroup !== 'undefined') {
      // remove layer if possible
      const vls = layerGroup.getViewLayersByDataId(dataId);
      if (vls.length === 1) {
        layerGroup.removeLayer(vls[0]);
      }
      const dls = layerGroup.getDrawLayersByDataId(dataId);
      if (dls.length === 1) {
        layerGroup.removeLayer(dls[0]);
      }
    }

    // render (will create layer)
    if (typeof this.#dataController.get(dataId) !== 'undefined') {
      this.render(dataId, [configToUpdate]);
    }
  }

  // Stage delegation ----------------------------------------------------------

  /**
   * Get the active layer group.
   *
   * @returns {LayerGroup|undefined} The layer group.
   */
  getActiveLayerGroup() {
    return this.#stage.getActiveLayerGroup();
  }

  /**
   * Set the active layer group.
   *
   * @param {number} index The layer group index.
   */
  setActiveLayerGroup(index) {
    this.#stage.setActiveLayerGroup(index);
  }

  /**
   * Get a layer group by index.
   *
   * @param {number} index The index.
   * @returns {LayerGroup} The layer group.
   */
  getLayerGroup(index) {
    return this.#stage.getLayerGroup(index);
  }

  /**
   * Get the number of layer groups.
   *
   * @returns {number} The number of groups.
   */
  getNumberOfLayerGroups() {
    return this.#stage.getNumberOfLayerGroups();
  }

  /**
   * Get the view layers associated to a data id.
   *
   * @param {string} dataId The data id.
   * @returns {ViewLayer[]} The layers.
   */
  getViewLayersByDataId(dataId) {
    return this.#stage.getViewLayersByDataId(dataId);
  }

  /**
   * Get a list of view layers according to an input callback function.
   *
   * @param {Function} [callbackFn] A function that takes
   *   a ViewLayer as input and returns a boolean. If undefined,
   *   returns all view layers.
   * @returns {ViewLayer[]} The layers that satisfy the callbackFn.
   */
  getViewLayers(callbackFn) {
    return this.#stage.getViewLayers(callbackFn);
  }

  /**
   * Get the draw layers associated to a data id.
   *
   * @param {string} dataId The data id.
   * @returns {DrawLayer[]} The layers.
   */
  getDrawLayersByDataId(dataId) {
    return this.#stage.getDrawLayersByDataId(dataId);
  }

  /**
   * Get a list of draw layers according to an input callback function.
   *
   * @param {Function} [callbackFn] A function that takes
   *   a DrawLayer as input and returns a boolean. If undefined,
   *   returns all draw layers.
   * @returns {DrawLayer[]} The layers that satisfy the callbackFn.
   */
  getDrawLayers(callbackFn) {
    return this.#stage.getDrawLayers(callbackFn);
  }

  /**
   * Get a layer group by div id.
   *
   * @param {string} divId The div id.
   * @returns {LayerGroup|undefined} The layer group.
   */
  getLayerGroupByDivId(divId) {
    return this.#stage.getLayerGroupByDivId(divId);
  }

  /**
   * Get the active layer group scale on top of the base scale.
   *
   * @returns {Scalar3D} The scale as {x,y,z}.
   * @deprecated Since v0.37, please access from the active layer group.
   */
  getAddedScale() {
    return this.#stage.getActiveLayerGroup().getAddedScale();
  }

  /**
   * Get the base scale of the active layer group.
   *
   * @returns {Scalar3D} The scale as {x,y,z}.
   * @deprecated Since v0.37, please access from the active layer group.
   */
  getBaseScale() {
    return this.#stage.getActiveLayerGroup().getBaseScale();
  }

  /**
   * Get the layer offset of the active layer group.
   *
   * @returns {Scalar3D} The offset as {x,y,z}.
   * @deprecated Since v0.37, please access from the active layer group.
   */
  getOffset() {
    return this.#stage.getActiveLayerGroup().getOffset();
  }

  /**
   * Empty the stage (remove all layer groups).
   */
  empty() {
    this.#stage.empty();
  }

  /**
   * Remove layers for a specific data id.
   *
   * @param {string} dataId The data id.
   */
  removeLayersByDataId(dataId) {
    this.#stage.removeLayersByDataId(dataId);
  }

  /**
   * Set the layer groups binders.
   *
   * @param {object[]} instances Binder instances.
   */
  setBinders(instances) {
    this.#stage.setBinders(instances);
  }

  // Display -------------------------------------------------------------------

  /**
   * Fit the display to the data of each layer group.
   */
  fitToContainer() {
    this.#stage.fitToContainer();
  }

  /**
   * Draw all layer groups.
   */
  draw() {
    this.#stage.draw();
  }

  /**
   * Reset zoom and pan of the stage.
   *
   * @deprecated Since v0.35, prefer resetZoomPan.
   */
  resetLayout() {
    this.#stage.reset();
    this.#stage.draw();
  }

  /**
   * Reset the zoom and pan of the stage.
   */
  resetZoomPan() {
    this.#stage.resetZoomPan();
    this.#stage.draw();
  }

  /**
   * Reset the position and window level of the stage.
   */
  resetViews() {
    this.#stage.resetViews();
  }

  /**
   * Set the imageSmoothing flag value. Default is false.
   *
   * @param {boolean} flag True to enable smoothing.
   */
  setImageSmoothing(flag) {
    this.#stage.setImageSmoothing(flag);
    this.#stage.draw();
  }

  /**
   * Zoom the layers of the active layer group.
   *
   * @param {number} step The step to add to the current zoom.
   * @param {number} cx The zoom center X coordinate.
   * @param {number} cy The zoom center Y coordinate.
   * @deprecated Since v0.37, please access from the active layer group.
   */
  zoom(step, cx, cy) {
    const layerGroup = this.#stage.getActiveLayerGroup();
    const viewController =
      layerGroup.getBaseViewLayer().getViewController();
    const k = viewController.getCurrentScrollPosition();
    const center = new Point3D(cx, cy, k);
    layerGroup.addScale(step, center);
    layerGroup.draw();
  }

  /**
   * Apply a translation to the layers of the active layer group.
   *
   * @param {number} tx The translation along X.
   * @param {number} ty The translation along Y.
   */
  translate(tx, ty) {
    const layerGroup = this.#stage.getActiveLayerGroup();
    layerGroup.addTranslation({x: tx, y: ty, z: 0});
    layerGroup.draw();
  }

  // Rendering -----------------------------------------------------------------

  /**
   * Render the current data.
   *
   * @param {string} dataId The data id to render.
   * @param {ViewConfig[]} [viewConfigs] The list of configs to render.
   */
  render(dataId, viewConfigs) {
    if (typeof dataId === 'undefined' || dataId === null) {
      throw new Error('Cannot render without data id');
    }
    const data = this.#dataController.get(dataId);

    // guess data type
    const isImage = typeof data !== 'undefined' &&
      typeof data.image !== 'undefined';
    const isMeasurement = typeof data !== 'undefined' &&
      typeof data.annotationGroup !== 'undefined';

    // create layer groups if not done yet
    // (create all to allow for ratio sync)
    if (this.#stage.getNumberOfLayerGroups() === 0) {
      this.#createLayerGroups(this.#options.dataViewConfigs);
    }

    // use options list if non provided
    if (typeof viewConfigs === 'undefined') {
      viewConfigs = this.getViewConfigs(dataId);
    }

    // nothing to do if no view config
    if (viewConfigs.length === 0) {
      logger.info(`Not rendering data: ${dataId
      } (no data view config)`);
      return;
    }

    // loop on configs
    for (let i = 0; i < viewConfigs.length; ++i) {
      const config = viewConfigs[i];
      const layerGroup =
        this.#stage.getLayerGroupByDivId(config.divId);
      // layer group must exist
      if (!layerGroup) {
        throw new Error(`No layer group for ${config.divId}`);
      }
      // check compatibility
      if (isImage && !this.#canRenderData(dataId, layerGroup)) {
        this.dispatchEvent(new CustomEvent('error', {
          detail: {
            error: new Error(
              'Render error: incompatible geometries for overlay'),
            dataid: dataId,
          }
        }));
        continue;
      }
      // create layer if needed
      // warn: needs a loaded DOM
      if (isImage &&
        layerGroup.getViewLayersByDataId(dataId).length === 0
      ) {
        this.#addViewLayer(dataId, config);
      } else if (isMeasurement &&
        layerGroup.getDrawLayersByDataId(dataId).length === 0
      ) {
        this.#addDrawLayer(dataId, config);
      }
      // draw
      layerGroup.draw();
    }
  }

  // Private -------------------------------------------------------------------

  /**
   * Propagate an event from a sub-component as a new CustomEvent.
   *
   * @param {CustomEvent} event The event to propagate.
   */
  #propagate = (event) => {
    if (event.detail?.propagate === false) {
      return;
    }
    const detail = Object.assign({}, event.detail);
    delete detail.propagate;
    this.dispatchEvent(new CustomEvent(event.type, {detail}));
  };

  /**
   * Create layer groups according to a data view config.
   *
   * @param {Record<string, ViewConfig[]>} dataViewConfigs The data view config.
   */
  #createLayerGroups(dataViewConfigs) {
    const dataKeys = Object.keys(dataViewConfigs);
    const divIds = [];
    for (let i = 0; i < dataKeys.length; ++i) {
      const viewConfigs = dataViewConfigs[dataKeys[i]];
      for (let j = 0; j < viewConfigs.length; ++j) {
        const viewConfig = viewConfigs[j];
        // view configs can contain the same divIds, avoid duplicating
        if (!divIds.includes(viewConfig.divId)) {
          this.#createLayerGroup(viewConfig);
          divIds.push(viewConfig.divId);
        }
      }
    }
  }

  /**
   * Create a layer group according to a view config.
   *
   * @param {ViewConfig} viewConfig The view config.
   */
  #createLayerGroup(viewConfig) {
    const element =
      this.#options.rootDocument.getElementById(viewConfig.divId);
    const withInfoOverlay =
      typeof this.#options.overlayConfig !== 'undefined';
    const layerGroup = this.#stage.addLayerGroup(element, withInfoOverlay);
    this.#bindLayerGroup(layerGroup);
  }

  /**
   * Bind layer group events to this controller.
   *
   * @param {LayerGroup} group The layer group.
   */
  #bindLayerGroup(group) {
    // propagate layer group events
    group.addEventListener('zoomchange', this.#propagate);
    group.addEventListener('offsetchange', this.#propagate);
    group.addEventListener('layerremove', this.#propagate);
    group.addEventListener('outofrange', this.#propagate);
    // propagate viewLayer events
    group.addEventListener('renderstart', this.#propagate);
    group.addEventListener('renderend', this.#propagate);
    // propagate view events
    for (const eventName of viewEventNames) {
      group.addEventListener(eventName, this.#propagate);
    }
    // update data view config on wl/opacity/colourmap changes
    group.addEventListener('wlchange', (/** @type {CustomEvent} */ event) => {
      const srclayerid = event.detail?.srclayerid;
      const dataid = event.detail?.dataid;
      const value = event.detail?.value;
      const layerDetails = getLayerDetailsFromLayerDivId(srclayerid);
      const groupId = layerDetails.groupDivId;
      const config = this.getViewConfig(dataid, groupId, true);
      if (typeof config !== 'undefined') {
        // reset previous values
        config.windowCenter = undefined;
        config.windowWidth = undefined;
        config.wlPresetName = undefined;
        // window width, center and name
        if (value.length === 3) {
          config.windowCenter = value[0];
          config.windowWidth = value[1];
          config.wlPresetName = value[2];
        }
      }
    });
    group.addEventListener('opacitychange',
      (/** @type {CustomEvent} */ event) => {
        const srclayerid = event.detail?.srclayerid;
        const dataid = event.detail?.dataid;
        const value = event.detail?.value;
        const layerDetails = getLayerDetailsFromLayerDivId(srclayerid);
        const groupId = layerDetails.groupDivId;
        const config = this.getViewConfig(dataid, groupId, true);
        if (typeof config !== 'undefined') {
          config.opacity = value[0];
        }
      });
    group.addEventListener('colourmapchange',
      (/** @type {CustomEvent} */ event) => {
        const srclayerid = event.detail?.srclayerid;
        const dataid = event.detail?.dataid;
        const value = event.detail?.value;
        const layerDetails = getLayerDetailsFromLayerDivId(srclayerid);
        const groupId = layerDetails.groupDivId;
        const config = this.getViewConfig(dataid, groupId, true);
        if (typeof config !== 'undefined') {
          config.colourMap = value[0];
        }
      });
  }

  /**
   * Check if data can be rendered in a layer group.
   *
   * @param {string} dataId The data id.
   * @param {LayerGroup} layerGroup The layer group.
   * @returns {boolean} True if the data can be rendered.
   */
  #canRenderData(dataId, layerGroup) {
    let res = false;
    const baseViewLayer = layerGroup.getBaseViewLayer();
    if (typeof baseViewLayer !== 'undefined') {
      const baseData = this.#dataController.get(baseViewLayer.getDataId());
      const baseImage = baseData.image;
      const newData = this.#dataController.get(dataId);
      const newImage = newData.image;
      if (typeof baseImage !== 'undefined' &&
        typeof newImage !== 'undefined'
      ) {
        const baseOrientation = baseImage.getGeometry().getOrientation();
        const newOrientation = newImage.getGeometry().getOrientation();
        res = newOrientation.isSimilarProgressive(
          baseOrientation, DIRECTION_EPSILON);
      }
    } else {
      res = true;
    }
    return res;
  }

  /**
   * Add a view layer.
   *
   * @param {string} dataId The data id.
   * @param {ViewConfig} viewConfig The data view config.
   */
  #addViewLayer(dataId, viewConfig) {
    const data = this.#dataController.get(dataId);
    if (!data) {
      throw new Error(`Cannot initialise layer with missing data, id: ${
        dataId}`);
    }
    const layerGroup = this.#stage.getLayerGroupByDivId(viewConfig.divId);
    if (!layerGroup) {
      throw new Error(`Cannot initialise layer with missing group, id: ${
        viewConfig.divId}`);
    }
    const imageGeometry = data.image.getGeometry();

    // un-bind
    this.#stage.unbindLayerGroups();

    // create and setup view
    const viewFactory = new ViewFactory();
    const view = viewFactory.create(data.meta, data.image);
    const viewOrientation = getViewOrientation(
      imageGeometry.getOrientation(),
      getMatrixFromName(viewConfig.orientation)
    );
    view.setOrientation(viewOrientation);

    // segmentation settings
    if (view.isMask()) {
      data.image.initializeContour();
      // possible presets
      if (typeof viewConfig.fillOpacity !== 'undefined') {
        view.setFillOpacity(viewConfig.fillOpacity);
      }
      if (typeof viewConfig.contourThickness !== 'undefined') {
        view.setContourThickness(viewConfig.contourThickness);
      }
    }

    // do we have more than one layer
    // (the layer has not been added to the layer group yet)
    const isBaseLayer = layerGroup.getNumberOfViewLayers() === 0;

    // opacity
    let opacity = 1;
    if (typeof viewConfig.opacity !== 'undefined') {
      opacity = viewConfig.opacity;
    } else if (!isBaseLayer) {
      if (view.isMask()) {
        // Assuming contours are enabled be default
        opacity = 0.8;
      } else {
        opacity = 0.5;
      }
    }

    // view layer
    const viewLayer = layerGroup.addViewLayer();
    viewLayer.setView(view, dataId);
    const size2D = imageGeometry.getSize(viewOrientation).get2D();
    const spacing2D = imageGeometry.getSpacing(viewOrientation).get2D();
    viewLayer.initialise(size2D, spacing2D, opacity);

    // view controller
    const viewController = viewLayer.getViewController();
    // window/level
    if (typeof viewConfig.wlPresetName !== 'undefined') {
      viewController.setWindowLevelPreset(viewConfig.wlPresetName);
    } else if (typeof viewConfig.windowCenter !== 'undefined' &&
      typeof viewConfig.windowWidth !== 'undefined') {
      const wl = new WindowLevel(
        viewConfig.windowCenter, viewConfig.windowWidth);
      viewController.setWindowLevel(wl);
    }
    // colour map
    if (typeof viewConfig.colourMap !== 'undefined') {
      viewController.setColourMap(viewConfig.colourMap);
    } else if (!isBaseLayer) {
      if (data.image.getMeta().Modality === 'PT') {
        viewController.setColourMap('hot');
      } else {
        viewController.setColourMap('rainbow');
      }
    }

    // listen to image set
    this.#dataController.addEventListener(
      'dataimageset', viewLayer.onimageset);

    // bind overlay data
    if (typeof this.#options.overlayConfig !== 'undefined' &&
      typeof this.#getInfoData !== 'undefined') {
      layerGroup.addInfoData(this.#getInfoData(dataId), dataId);
      layerGroup.bindInfoData(dataId);
    }

    // sync layers position
    const value = [
      viewController.getCurrentIndex().getValues(),
      viewController.getCurrentPosition().getValues()
    ];
    layerGroup.updateLayersToPositionChange(
      new CustomEvent('positionchange', {
        detail: {
          value,
          srclayerid: viewLayer.getId()
        }
      })
    );

    // sync layer groups
    this.#stage.fitToContainer();

    // layer offset (done before scale)
    viewLayer.setOffset(layerGroup.getOffset());

    // get and apply flip flags
    const flipFlags = this.#getViewFlipFlags(
      imageGeometry.getOrientation(),
      viewConfig.orientation);
    this.#applyFlipFlags(flipFlags, viewLayer);

    // layer scale (done after possible flip)
    if (!isBaseLayer) {
      // use zoom offset of base layer
      const baseViewLayer = layerGroup.getBaseViewLayer();
      viewLayer.initScale(
        layerGroup.getScale(),
        baseViewLayer.getAbsoluteZoomOffset()
      );
    } else {
      viewLayer.setScale(layerGroup.getScale());
    }

    // bind
    this.#stage.bindLayerGroups();
    if (this.#toolboxController) {
      this.#toolboxController.bindLayerGroup(layerGroup, viewLayer);
    }

    /**
     * Add view layer event.
     *
     * @event App#viewlayeradd
     * @type {CustomEvent}
     * @property {object} detail The event detail.
     * @property {string} detail.layerid The layer id.
     * @property {string} detail.layergroupid The layer group id.
     * @property {string} detail.dataid The data id.
     */
    this.dispatchEvent(new CustomEvent('viewlayeradd', {
      detail: {
        layerid: viewLayer.getId(),
        layergroupid: layerGroup.getDivId(),
        dataid: dataId,
      }
    }));

    // initialise the toolbox for base layer
    if (isBaseLayer && this.#toolboxController) {
      this.#toolboxController.init();
    }
  }

  /**
   * Add a draw layer.
   *
   * @param {string} dataId The data id.
   * @param {ViewConfig} viewConfig The data view config.
   */
  #addDrawLayer(dataId, viewConfig) {
    const layerGroup =
      this.#stage.getLayerGroupByDivId(viewConfig.divId);
    if (!layerGroup) {
      throw new Error(`Cannot initialise layer with missing group, id: ${
        viewConfig.divId}`);
    }

    const data = this.#dataController.get(dataId);
    if (!data) {
      throw new Error(`Cannot initialise layer with missing data, id: ${
        dataId}`);
    }
    const annotationGroup = data.annotationGroup;

    // find referenced view layer
    const refViewLayer =
      this.#getReferenceLayer(annotationGroup, layerGroup);
    if (typeof refViewLayer === 'undefined') {
      console.warn(
        'No loaded data that matches the measurements reference series UID');
      return;
    }
    const refDataId = refViewLayer.getDataId();

    // un-bind
    this.#stage.unbindLayerGroups();

    // set annotation view controller (allows quantification)
    const refViewController = refViewLayer.getViewController();
    data.annotationGroup.setViewController(refViewController);

    // reference data to use as base for layer properties
    const refData = this.#dataController.get(refDataId);
    if (!refData) {
      throw new Error(
        `Cannot initialise layer without reference data, id: ${refDataId}`);
    }
    const imageGeometry = refData.image.getGeometry();

    const viewOrientation = getViewOrientation(
      imageGeometry.getOrientation(),
      getMatrixFromName(viewConfig.orientation)
    );
    const size2D = imageGeometry.getSize(viewOrientation).get2D();
    const spacing2D = imageGeometry.getSpacing(viewOrientation).get2D();

    const drawLayer = layerGroup.addDrawLayer();
    drawLayer.initialise(size2D, spacing2D, refViewLayer.getId());

    const planeHelper = new PlaneHelper(
      imageGeometry,
      viewOrientation
    );
    drawLayer.setPlaneHelper(planeHelper);

    // sync layers position
    const value = [
      refViewController.getCurrentIndex().getValues(),
      refViewController.getCurrentPosition().getValues()
    ];
    layerGroup.updateLayersToPositionChange(
      new CustomEvent('positionchange', {
        detail: {
          value,
          srclayerid: drawLayer.getId()
        }
      })
    );

    // sync layer groups
    this.#stage.fitToContainer();

    // layer offset (done before scale)
    drawLayer.setOffset(layerGroup.getOffset());

    // get and apply flip flags
    const flipFlags = this.#getViewFlipFlags(
      imageGeometry.getOrientation(),
      viewConfig.orientation);
    this.#applyFlipFlags(flipFlags, drawLayer);

    // layer scale (done after possible flip)
    drawLayer.initScale(
      layerGroup.getScale(),
      refViewLayer.getAbsoluteZoomOffset()
    );

    // add possible existing data
    drawLayer.setAnnotationGroup(
      data.annotationGroup,
      dataId,
      this.#addToUndoStack);

    drawLayer.setCurrentPosition(
      refViewController.getCurrentPosition(),
      refViewController.getCurrentIndex()
    );

    // bind
    this.#stage.bindLayerGroups();
    if (this.#toolboxController) {
      this.#toolboxController.bindLayerGroup(layerGroup, drawLayer);
    }

    /**
     * Add draw layer event.
     *
     * @event App#drawlayeradd
     * @type {CustomEvent}
     * @property {object} detail The event detail.
     * @property {string} detail.layerid The layer id.
     * @property {string} detail.layergroupid The layer group id.
     * @property {string} detail.dataid The data id.
     */
    this.dispatchEvent(new CustomEvent('drawlayeradd', {
      detail: {
        layerid: drawLayer.getId(),
        layergroupid: layerGroup.getDivId(),
        dataid: dataId,
      }
    }));
  }

  /**
   * Get the reference view layer for an annotation group.
   *
   * @param {AnnotationGroup} annotationGroup The annotation group.
   * @param {LayerGroup} layerGroup The layer group to search in.
   * @returns {ViewLayer|undefined} The reference view layer.
   */
  #getReferenceLayer(annotationGroup, layerGroup) {
    let refViewLayer;

    // use meta
    // -> will match empty groups created with createAnnotationData
    const evidenceSeq = annotationGroup.getMetaValue(
      'CurrentRequestedProcedureEvidenceSequence');
    if (typeof evidenceSeq !== 'undefined') {
      const evidenceSeqItem0 = evidenceSeq.value[0];
      const refSeriesSeq = evidenceSeqItem0?.ReferencedSeriesSequence;
      const refSeriesSeqItem0 = refSeriesSeq?.value[0];
      const refSeriesInstanceUID = refSeriesSeqItem0?.SeriesInstanceUID;
      const metaSearch = {SeriesInstanceUID: refSeriesInstanceUID};
      const viewLayers = layerGroup.searchViewLayers(metaSearch);
      if (viewLayers.length !== 0) {
        refViewLayer = viewLayers[0];
      }
    }

    // dwv034 wrongly uses ReferencedSeriesSequence tag at root
    // and does not set the SOPClassUID of annotation reference...
    const refSeriesSeq =
      annotationGroup.getMetaValue('ReferencedSeriesSequence');
    if (typeof refSeriesSeq !== 'undefined') {
      const refSeriesSeqItem0 = refSeriesSeq.value[0];
      const refSeriesInstanceUID = refSeriesSeqItem0?.SeriesInstanceUID;
      const metaSearch = {SeriesInstanceUID: refSeriesInstanceUID};
      const viewLayers = layerGroup.searchViewLayers(metaSearch);
      if (viewLayers.length !== 0) {
        refViewLayer = viewLayers[0];
      }
    }

    // if no meta, go through annotations
    if (typeof refViewLayer === 'undefined') {
      for (const annotation of annotationGroup.getList()) {
        const metaSearch = {
          SOPInstanceUID: annotation.referencedSopInstanceUID,
          SOPClassUID: annotation.referencedSopClassUID
        };
        const viewLayers = layerGroup.searchViewLayers(metaSearch);
        if (viewLayers.length !== 0) {
          // exit at first match
          refViewLayer = viewLayers[0];
          break;
        }
      }
    }

    return refViewLayer;
  }

  /**
   * Get the view flip flags: offset (x, y) and scale (x, y, z) flags.
   *
   * @param {Matrix33} imageOrientation The image orientation.
   * @param {string} viewConfigOrientation The view config orientation.
   * @returns {object} Offset and scale flip flags.
   */
  #getViewFlipFlags(imageOrientation, viewConfigOrientation) {
    // 'simple' orientation code (does not take into account angles)
    const orientationCode =
      getOrientationStringLPS(imageOrientation.asOneAndZeros());
    if (typeof orientationCode === 'undefined') {
      throw new Error('Unsupported undefined orientation code');
    }

    // view orientation flags
    const isViewUndefined = typeof viewConfigOrientation === 'undefined';
    const isViewAxial = !isViewUndefined &&
      viewConfigOrientation === Orientation.Axial;
    const isViewCoronal = !isViewUndefined &&
      viewConfigOrientation === Orientation.Coronal;
    const isViewSagittal = !isViewUndefined &&
      viewConfigOrientation === Orientation.Sagittal;

    // default flags
    const flipOffset = {x: false, y: false};
    const flipScale = {x: false, y: false, z: false};

    if (orientationCode === 'LPS') {
      // axial
      if (isViewCoronal || isViewSagittal) {
        flipScale.z = true;
        flipOffset.y = true;
      }
    } else if (orientationCode === 'LAI') {
      // axial
      if (isViewUndefined || isViewAxial) {
        flipOffset.y = true;
      } else if (isViewCoronal) {
        flipScale.z = true;
      } else if (isViewSagittal) {
        flipScale.z = true;
        flipOffset.x = true;
      }
    } else if (orientationCode === 'RPI') {
      // axial
      if (isViewUndefined || isViewAxial) {
        flipOffset.x = true;
      } else if (isViewCoronal) {
        flipScale.z = true;
        flipOffset.x = true;
      } else if (isViewSagittal) {
        flipScale.z = true;
      }
    } else if (orientationCode === 'RAS') {
      // axial
      flipOffset.x = true;
      flipOffset.y = true;
      if (isViewCoronal || isViewSagittal) {
        flipScale.z = true;
      }
    } else if (orientationCode === 'LSA') {
      // coronal
      flipOffset.y = true;
      if (isViewUndefined || isViewCoronal) {
        flipScale.z = true;
      } else if (isViewAxial) {
        flipScale.y = true;
      } else if (isViewSagittal) {
        flipOffset.x = true;
        flipScale.y = true;
        flipScale.z = true;
      }
    // } else if (orientationCode === 'LIP') { // nothing to do
    } else if (orientationCode === 'RSP') {
      // coronal
      if (isViewUndefined || isViewCoronal) {
        flipOffset.x = true;
        flipOffset.y = true;
        flipScale.x = true;
        flipScale.z = true;
      } else if (isViewAxial) {
        flipOffset.x = true;
        flipScale.x = true;
      } else if (isViewSagittal) {
        flipOffset.y = true;
        flipScale.z = true;
      }
    } else if (orientationCode === 'RIA') {
      // coronal
      flipOffset.x = true;
      if (isViewUndefined || isViewCoronal) {
        flipScale.x = true;
      } else if (isViewAxial) {
        flipOffset.y = true;
        flipScale.x = true;
        flipScale.y = true;
      } else if (isViewSagittal) {
        flipScale.y = true;
      }
    } else if (orientationCode === 'PSL') {
      // sagittal
      flipScale.z = true;
      if (isViewUndefined || isViewSagittal) {
        flipOffset.y = true;
      } else if (isViewCoronal) {
        flipOffset.y = true;
      }
    } else if (orientationCode === 'PIR') {
      // sagittal
      flipScale.z = true;
      if (isViewAxial || isViewCoronal) {
        flipOffset.x = true;
      }
    } else if (orientationCode === 'ASR') {
      // sagittal
      flipOffset.x = true;
      flipOffset.y = true;
      if (isViewUndefined || isViewSagittal) {
        flipScale.z = true;
      } else if (isViewCoronal) {
        flipScale.z = true;
      }
    } else if (orientationCode === 'AIL') {
      // sagittal
      if (isViewUndefined || isViewSagittal) {
        flipOffset.x = true;
        flipScale.z = true;
      } else if (isViewAxial) {
        flipOffset.y = true;
      } else if (isViewCoronal) {
        flipScale.z = true;
      }
    } else if (orientationCode !== 'LIP') {
      // LIP uses default scale and offset
      logger.warn(`Unsupported orientation code: ${
        orientationCode}, display could be incorrect`);
    }

    return {
      scale: flipScale,
      offset: flipOffset
    };
  }

  /**
   * Apply flip flags to a layer.
   *
   * @param {object} flipFlags The flip flags.
   * @param {object} layer The layer to apply to.
   */
  #applyFlipFlags(flipFlags, layer) {
    if (flipFlags.offset.x) {
      layer.addFlipOffsetX();
    }
    if (flipFlags.offset.y) {
      layer.addFlipOffsetY();
    }
    if (flipFlags.scale.x) {
      layer.flipScaleX();
    }
    if (flipFlags.scale.y) {
      layer.flipScaleY();
    }
    if (flipFlags.scale.z) {
      layer.flipScaleZ();
    }
  }

} // class StageController
