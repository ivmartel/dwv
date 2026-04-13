// doc imports
/* eslint-disable no-unused-vars */
import {LayerGroup} from '../../gui/layerGroup.js';
import {ViewLayer} from '../../gui/viewLayer.js';
/* eslint-enable no-unused-vars */

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
