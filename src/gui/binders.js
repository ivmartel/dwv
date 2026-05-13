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
 * Position binder.
 */
export class PositionBinder {
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
  getCallback = function (layerGroup) {
    return function (/** @type {CustomEvent} */ event) {
      const dataid = event.detail?.dataid;
      const value = event.detail?.value;
      const pointValues = value[1];
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
      const vc = vl.getViewController();
      // bind 3D for all
      // bind 4D if same data, otherwise use 3D and keep current
      const currentPos = vc.getCurrentPosition();
      const currentDims = currentPos.length();
      const inputDims = pointValues.length;
      if (!sameData &&
        inputDims > 3 && currentDims > 3) {
        pointValues[3] = currentPos.get(3);
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
