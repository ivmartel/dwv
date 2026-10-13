import {Point, Point3D} from '../math/point.js';
import {WindowLevel} from '../image/windowLevel.js';

/**
 * @import {LayerGroup} from './layerGroup.js';
 */

/**
 * Window/level binder.
 */
export class WindowLevelBinder {
  /**
   * Get the associated event.
   *
   * @returns {string} The event name.
   */
  getEventType = function () {
    return 'wlchange';
  };
  /**
   * Get the event handler.
   *
   * @param {LayerGroup} layerGroup The input lqyer group.
   * @returns {EventListener} The event handler.
   */
  getCallback = function (layerGroup) {
    return function (/** @type {CustomEvent} */ event) {
      const dataid = event.detail?.dataid;
      const value = event.detail?.value;
      const viewLayers = layerGroup.getViewLayersByDataId(dataid);
      if (viewLayers.length !== 0) {
        const vc = viewLayers[0].getViewController();
        if (value.length === 2) {
          const wl = new WindowLevel(value[0], value[1]);
          vc.setWindowLevel(wl);
        }
        if (value.length === 3) {
          vc.setWindowLevelPreset(value[2]);
        }
      }
    };
  };
}

/**
 * Colour map binder.
 */
export class ColourMapBinder {
  /**
   * Get the associated event.
   *
   * @returns {string} The event name.
   */
  getEventType = function () {
    return 'colourmapchange';
  };
  /**
   * Get the event handler.
   *
   * @param {LayerGroup} layerGroup The input lqyer group.
   * @returns {EventListener} The event handler.
   */
  getCallback = function (layerGroup) {
    return function (/** @type {CustomEvent} */ event) {
      const dataid = event.detail?.dataid;
      const value = event.detail?.value;
      const viewLayers = layerGroup.getViewLayersByDataId(dataid);
      if (viewLayers.length !== 0) {
        const vc = viewLayers[0].getViewController();
        vc.setColourMap(value[0]);
      }
    };
  };
}

/**
 * Mask view binder.
 */
export class MaskViewBinder {
  /**
   * Get the associated event.
   *
   * @returns {string} The event name.
   */
  getEventType = function () {
    return 'maskviewchange';
  };
  /**
   * Get the event handler.
   *
   * @param {LayerGroup} layerGroup The input layer group.
   * @returns {EventListener} The event handler.
   */
  getCallback = function (layerGroup) {
    return function (/** @type {CustomEvent} */ event) {
      const dataid = event.detail?.dataid;
      const value = event.detail?.value;
      const viewLayers = layerGroup.getViewLayersByDataId(dataid);
      if (viewLayers.length !== 0) {
        viewLayers[0].setFillOpacity(value[0]);
        viewLayers[0].setContourThickness(value[1]);
      }
    };
  };
}

/**
 * Number of spatial dimensions of a position.
 */
const NUMBER_OF_SPATIAL_DIMS = 3;

/**
 * Check if a view controller can scroll along its scroll dimension.
 *
 * @param {object} vc The view controller.
 * @returns {boolean} True if the image has more than one slice along
 *   the scroll dimension.
 */
function canScrollSlices(vc) {
  const size = vc.getImageSize();
  return typeof size !== 'undefined' &&
    size.moreThanOne(vc.getScrollDimIndex());
}

/**
 * Check if a position change only modified non spatial dimensions.
 *
 * @param {number[]} [diffDims] The modified dimensions.
 * @returns {boolean} True if only non spatial dimensions changed.
 */
function isVolumeOnlyMove(diffDims) {
  return Array.isArray(diffDims) &&
    diffDims.length !== 0 &&
    diffDims.every((dim) => dim >= NUMBER_OF_SPATIAL_DIMS);
}

/**
 * Check if a position change did not modify any dimension.
 *
 * @param {number[]} [diffDims] The modified dimensions.
 * @returns {boolean} True if no dimension changed.
 */
function isUnchangedPosition(diffDims) {
  return Array.isArray(diffDims) && diffDims.length === 0;
}

/**
 * Get the target timepoint index that has the same timepoint tag value
 * as the source timepoint. Both data must be time series with the same
 * timepoint tag.
 *
 * @param {Function|undefined} getTimepointSyncTable The timepoint sync
 *   table getter.
 * @param {Function|undefined} getTimepointTag The timepoint tag getter.
 * @param {string} sourceDataId The source data id.
 * @param {string} targetDataId The target data id.
 * @param {number} sourceTimepoint The source timepoint index.
 * @returns {number|undefined} The target timepoint index, undefined if
 *   there is no match.
 */
function getMatchingTimepoint(
  getTimepointSyncTable, getTimepointTag,
  sourceDataId, targetDataId, sourceTimepoint) {
  if (typeof getTimepointSyncTable !== 'function' ||
    typeof getTimepointTag !== 'function') {
    return undefined;
  }
  const sourceTag = getTimepointTag(sourceDataId);
  const targetTag = getTimepointTag(targetDataId);
  if (typeof sourceTag === 'undefined' || sourceTag !== targetTag) {
    return undefined;
  }
  const sourceTagValue = getTimepointSyncTable(sourceDataId)?.find(
    (entry) => entry.timepointIndex === sourceTimepoint)?.tagValue;
  if (typeof sourceTagValue === 'undefined') {
    return undefined;
  }
  const targetSyncTable = getTimepointSyncTable(targetDataId);
  return targetSyncTable?.find(
    (entry) => entry.tagValue === sourceTagValue)?.timepointIndex;
}

/**
 * Position binder.
 */
export class PositionBinder {
  /**
   * The timepoint sync table getter.
   *
   * @type {Function|undefined}
   */
  #getTimepointSyncTable;

  /**
   * The timepoint tag getter.
   *
   * @type {Function|undefined}
   */
  #getTimepointTag;

  /**
   * @param {Function} [getTimepointSyncTable] The timepoint sync table
   *   getter, takes a data id as input.
   * @param {Function} [getTimepointTag] The timepoint tag getter, takes
   *   a data id as input.
   */
  constructor(getTimepointSyncTable, getTimepointTag) {
    this.#getTimepointSyncTable = getTimepointSyncTable;
    this.#getTimepointTag = getTimepointTag;
  }

  /**
   * Get the associated event.
   *
   * @returns {string} The event name.
   */
  getEventType = function () {
    return 'positionchange';
  };
  /**
   * Get the event handler.
   *
   * @param {LayerGroup} layerGroup The input lqyer group.
   * @returns {EventListener} The event handler.
   */
  getCallback = (layerGroup) => {
    const getTimepointSyncTable = this.#getTimepointSyncTable;
    const getTimepointTag = this.#getTimepointTag;
    return function (/** @type {CustomEvent} */ event) {
      const dataid = event.detail?.dataid;
      const value = event.detail?.value;
      if (!Array.isArray(value?.[1]) ||
        isUnchangedPosition(event.detail?.diffDims)) {
        return;
      }
      const pointValues = [...value[1]];
      const vls = layerGroup.getViewLayersByDataId(dataid);
      let vl;
      let sameData = false;
      if (vls.length !== 0) {
        // use first layer
        vl = vls[0];
        sameData = true;
      } else {
        vl = layerGroup.getBaseViewLayer();
      }
      if (typeof vl === 'undefined') {
        return;
      }
      const vc = vl.getViewController();
      // bind 3D for all
      // bind 4D if same data, otherwise use 3D and keep current
      const currentPos = vc.getCurrentPosition();
      if (!canScrollSlices(vc) || isVolumeOnlyMove(event.detail?.diffDims)) {
        for (let i = 0; i < NUMBER_OF_SPATIAL_DIMS; ++i) {
          pointValues[i] = currentPos.get(i);
        }
      }
      const currentDims = currentPos.length();
      const inputDims = pointValues.length;
      if (!sameData &&
        inputDims > 3 && currentDims > 3) {
        pointValues[3] = getMatchingTimepoint(
          getTimepointSyncTable, getTimepointTag,
          dataid, vl.getDataId(), pointValues[3]) ?? currentPos.get(3);
      }
      vc.setCurrentPosition(new Point(pointValues));
    };
  };
}

/**
 * Zoom binder.
 */
export class ZoomBinder {
  /**
   * Get the associated event.
   *
   * @returns {string} The event name.
   */
  getEventType = function () {
    return 'zoomchange';
  };
  /**
   * Get the event handler.
   *
   * @param {LayerGroup} layerGroup The input lqyer group.
   * @returns {EventListener} The event handler.
   */
  getCallback = function (layerGroup) {
    return function (/** @type {CustomEvent} */ event) {
      const value = event.detail?.value;
      const scale = {
        x: value[0],
        y: value[1],
        z: value[2]
      };
      let center;
      if (value.length === 6) {
        center = new Point3D(
          value[3],
          value[4],
          value[5]
        );
      }
      layerGroup.setScale(scale, center);
      layerGroup.draw();
    };
  };
}

/**
 * Offset binder.
 */
export class OffsetBinder {
  /**
   * Get the associated event.
   *
   * @returns {string} The event name.
   */
  getEventType = function () {
    return 'offsetchange';
  };
  /**
   * Get the event handler.
   *
   * @param {LayerGroup} layerGroup The input lqyer group.
   * @returns {EventListener} The event handler.
   */
  getCallback = function (layerGroup) {
    return function (/** @type {CustomEvent} */ event) {
      const value = event.detail?.value;
      layerGroup.setOffset({
        x: value[0],
        y: value[1],
        z: value[2]
      });
      layerGroup.draw();
    };
  };
}

/**
 * Opacity binder. Only propagates to view layers of the same data.
 */
export class OpacityBinder {
  /**
   * Get the associated event.
   *
   * @returns {string} The event name.
   */
  getEventType = function () {
    return 'opacitychange';
  };
  /**
   * Get the event handler.
   *
   * @param {LayerGroup} layerGroup The input lqyer group.
   * @returns {EventListener} The event handler.
   */
  getCallback = function (layerGroup) {
    return function (/** @type {CustomEvent} */ event) {
      const dataid = event.detail?.dataid;
      const value = event.detail?.value;
      // exit if no data id
      if (typeof dataid === 'undefined') {
        return;
      }
      // propagate to first view layer if it is not base layer
      const viewLayers = layerGroup.getViewLayersByDataId(dataid);
      const baseLayer = layerGroup.getBaseViewLayer();
      if (viewLayers.length !== 0 && baseLayer !== viewLayers[0]) {
        viewLayers[0].setOpacity(value);
        viewLayers[0].draw();
      }
    };
  };
}

/**
 * List of binders.
 */
export const binderList = {
  WindowLevelBinder,
  PositionBinder,
  ZoomBinder,
  OffsetBinder,
  OpacityBinder,
  ColourMapBinder,
  MaskViewBinder
};
