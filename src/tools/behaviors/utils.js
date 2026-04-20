/**
 * @import {LayerGroup} from '../../gui/layerGroup.js';
 * @import {ViewLayer} from '../../gui/viewLayer.js';
 */

/**
 * Active view layer, or the first monochrome view layer among active layers
 * when `activeViewLayerOnly` is false (window/level-style resolution).
 *
 * @param {LayerGroup} layerGroup The layer group.
 * @param {boolean} activeViewLayerOnly If true, use
 *   {@link LayerGroup#getActiveViewLayer} only; if false, the first layer
 *   whose view controller reports monochrome.
 * @returns {ViewLayer|undefined} The view layer.
 */
export function getActiveOrFirstMonochromeViewLayer(
  layerGroup, activeViewLayerOnly) {
  let layer;
  if (activeViewLayerOnly) {
    layer = layerGroup.getActiveViewLayer();
  } else {
    const callbackFn = function (cbLayer) {
      return cbLayer.getViewController().isMonochrome();
    };
    layer = layerGroup.getViewLayersFromActive(callbackFn)[0];
  }
  return layer;
}

/**
 * Active view layer, or the view layer referenced by the active draw layer.
 *
 * @param {LayerGroup} layerGroup The layer group.
 * @returns {ViewLayer|undefined} The view layer.
 */
export function getActiveOrDrawRefViewLayer(layerGroup) {
  let viewLayer = layerGroup.getActiveViewLayer();
  if (typeof viewLayer === 'undefined') {
    const drawLayer = layerGroup.getActiveDrawLayer();
    if (typeof drawLayer === 'undefined') {
      return undefined;
    }
    viewLayer = layerGroup.getViewLayerById(
      drawLayer.getReferenceLayerId());
  }
  return viewLayer;
}
