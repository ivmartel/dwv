import {logger} from '../../utils/logger.js';
import {getActiveOrDrawRefViewLayer} from './utils.js';

// doc imports
/* eslint-disable no-unused-vars */
import {Point2D} from '../../math/point.js';
import {LayerGroup} from '../../gui/layerGroup.js';
/* eslint-enable no-unused-vars */

/**
 * Tap (no drag move): subclasses implement {@link TapBehavior#onTap}.
 */
export class TapBehavior {

  /**
   * @param {Point2D} _point Display position under the pointer.
   * @param {LayerGroup} _layerGroup Layer group under the pointer.
   */
  onTap(_point, _layerGroup) {
    // override in subclass
  }

}

/**
 * Tap sets the current slice/index from the display position (plane point).
 */
export class PositionSetTapBehavior extends TapBehavior {

  /**
   * @param {Point2D} point Display position.
   * @param {LayerGroup} layerGroup The layer group.
   */
  onTap(point, layerGroup) {
    const viewLayer = getActiveOrDrawRefViewLayer(layerGroup);
    if (typeof viewLayer === 'undefined') {
      logger.warn('No view layer to set current position');
      return;
    }
    const viewController = viewLayer.getViewController();
    const planePos = viewLayer.displayToPlanePos(point);
    const position = viewController.getPositionFromPlanePoint(planePos);
    viewController.setCurrentPosition(position);
  }

}
