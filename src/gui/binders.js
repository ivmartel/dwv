import {Point, Point3D} from '../math/point.js';
import {WindowLevel} from '../image/windowLevel.js';
import {SPATIAL_DIMS, VOLUME_DIM_INDEX} from '../image/geometry.js';

/**
 * @import {LayerGroup} from './layerGroup.js';
 * @import {Geometry} from '../image/geometry.js';
 * @import {ViewController} from '../app/viewController.js';
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
 * Check if only non spatial dimensions changed.
 *
 * @param {number[]} [diffDims] The modified dimensions.
 * @returns {boolean} True if only non spatial dimensions changed.
 */
function isVolumeOnlyMove(diffDims) {
  return Array.isArray(diffDims) &&
    diffDims.length !== 0 &&
    diffDims.every((dim) => dim >= SPATIAL_DIMS);
}

/**
 * Check if the position index did not change.
 *
 * @param {number[]} [diffDims] The modified dimensions.
 * @returns {boolean} True if no index dimension changed.
 */
function isUnchangedPosition(diffDims) {
  return Array.isArray(diffDims) && diffDims.length === 0;
}

/**
 * Check if the target volume can follow the source one.
 *
 * @param {Geometry|undefined} sourceGeometry The source geometry.
 * @param {Geometry|undefined} targetGeometry The target geometry.
 * @param {number} value The source volume id value.
 * @returns {boolean} True if the target volume can follow.
 */
function canSyncVolume(sourceGeometry, targetGeometry, value) {
  const sourceId = sourceGeometry?.getVolumeIds()?.[0];
  const targetId = targetGeometry?.getVolumeIds()?.[0];
  if (typeof sourceId === 'undefined' || typeof targetId === 'undefined') {
    return false;
  }
  return sourceId.source === targetId.source &&
    sourceId.tagKey === targetId.tagKey &&
    targetGeometry.getVolumeIndex(value) !== -1;
}

/**
 * Get the bound position of a target view.
 *
 * @param {ViewController} vc The target view controller.
 * @param {number[]} values The source position values.
 * @param {boolean} keepVolume True to keep the target volume.
 * @param {number[]} [diffDims] The modified dimensions.
 * @returns {Point} The target position.
 */
function getBoundPosition(vc, values, keepVolume, diffDims) {
  // copy to keep the event value
  const res = [...values];
  const currentPos = vc.getCurrentPosition();
  if (isVolumeOnlyMove(diffDims)) {
    // volume change: keep the spatial position
    for (let i = 0; i < SPATIAL_DIMS; ++i) {
      res[i] = currentPos.get(i);
    }
  } else if (!vc.moreThanOne(vc.getScrollDimIndex())) {
    // single slice: keep the slice
    const planePos = vc.getPositionFromPlanePoint(
      vc.getPlanePositionFromPosition(new Point(res)));
    for (let i = 0; i < SPATIAL_DIMS; ++i) {
      res[i] = planePos.get(i);
    }
  }
  if (keepVolume &&
    res.length > VOLUME_DIM_INDEX &&
    currentPos.length() > VOLUME_DIM_INDEX) {
    res[VOLUME_DIM_INDEX] = currentPos.get(VOLUME_DIM_INDEX);
  }
  return new Point(res);
}

/**
 * Position binder.
 */
export class PositionBinder {
  /**
   * Data geometry getter.
   *
   * @type {Function|undefined}
   */
  #getGeometry;

  /**
   * @param {Function} [getGeometry] The data geometry getter.
   */
  constructor(getGeometry) {
    this.#getGeometry = getGeometry;
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
    const getGeometry = this.#getGeometry;
    return function (/** @type {CustomEvent} */ event) {
      const dataid = event.detail?.dataid;
      const value = event.detail?.value;
      const diffDims = event.detail?.diffDims;
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
      // same data: skip same voxel changes
      if (sameData && isUnchangedPosition(diffDims)) {
        return;
      }
      // exit if no view layer
      if (typeof vl === 'undefined') {
        return;
      }
      // bind 4D if same data or volume origin, otherwise keep current
      const canSync = typeof getGeometry !== 'undefined' &&
        canSyncVolume(getGeometry(dataid), getGeometry(vl.getDataId()),
          value[1][VOLUME_DIM_INDEX]);
      const vc = vl.getViewController();
      vc.setCurrentPosition(getBoundPosition(
        vc, value[1], !sameData && !canSync, diffDims));
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
