import {Point2D} from '../../math/point.js';
import {logger} from '../../utils/logger.js';

// doc imports
/* eslint-disable no-unused-vars */
import {LayerGroup} from '../../gui/layerGroup.js';
import {ViewLayer} from '../../gui/viewLayer.js';
import {DragBehavior} from './dragBehavior.js';
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

/**
 * Single-pointer pan drag: translates using display deltas in plane space.
 */
export class PanDragBehavior extends DragBehavior {

  /**
   * @param {object} drag Step with `dx`/`dy` (same shape as DragStep).
   * @param {LayerGroup} layerGroup The layer group under the pointer.
   */
  onUpdate(drag, layerGroup) {
    const viewLayer = getActiveOrDrawRefViewLayer(layerGroup);
    if (typeof viewLayer === 'undefined') {
      logger.warn('No view layer to update pan drag behavior');
      return;
    }
    const viewController = viewLayer.getViewController();
    const planeOffset = viewLayer.displayToPlaneScale(
      new Point2D(drag.dx, drag.dy)
    );
    const offset3D = viewController.getOffset3DFromPlaneOffset({
      x: planeOffset.getX(),
      y: planeOffset.getY()
    });
    layerGroup.addTranslation({
      x: offset3D.getX(),
      y: offset3D.getY(),
      z: offset3D.getZ()
    });
    layerGroup.draw();
  }

}

