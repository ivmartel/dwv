import {
  getMousePoint
} from '../../gui/generic.js';
import {logger} from '../../utils/logger.js';
import {getActiveOrDrawRefViewLayer} from './panDragBehavior.js';

// doc imports
/* eslint-disable no-unused-vars */
import {LayerGroup} from '../../gui/layerGroup.js';
/* eslint-enable no-unused-vars */

/**
 * Mouse wheel handling: subclasses may override {@link WheelBehavior#onWheel}
 * (every event) and/or {@link WheelBehavior#onWheelTick}
 * (after tick threshold).
 */
export class WheelBehavior {

  /**
   * @param {WheelEvent} _event The wheel event.
   * @param {LayerGroup|undefined} _layerGroup Layer group under the wheel.
   */
  onWheel(_event, _layerGroup) {
    // override in subclass
  }

  /**
   * @param {boolean} _up True when spin is in the positive direction.
   * @param {LayerGroup} _layerGroup Layer group under the wheel event.
   */
  onWheelTick(_up, _layerGroup) {
    // override in subclass
  }

}

/**
 * Slice / dimension scrolling on wheel ticks (extends {@link WheelBehavior}).
 */
export class ScrollWheelBehavior extends WheelBehavior {

  /**
   * @param {boolean} up True to increment along scroll / next index.
   * @param {LayerGroup} layerGroup The layer group under the wheel.
   */
  onWheelTick(up, layerGroup) {
    const positionHelper = layerGroup.getPositionHelper();

    if (layerGroup.canScroll()) {
      if (up) {
        positionHelper.incrementPositionAlongScroll();
      } else {
        positionHelper.decrementPositionAlongScroll();
      }
    } else if (layerGroup.moreThanOne(3)) {
      if (up) {
        positionHelper.incrementPosition(3);
      } else {
        positionHelper.decrementPosition(3);
      }
    }
  }

}

/**
 * Continuous wheel zoom around the cursor (not tick-thresholded).
 * Overrides {@link WheelBehavior#onWheel} to apply zoom.
 * The default {@link WheelBehavior#onWheelTick} is left as-is.
 */
export class ZoomWheelBehavior extends WheelBehavior {

  /**
   * @param {WheelEvent} event The wheel event.
   * @param {LayerGroup|undefined} layerGroup The layer group under the wheel.
   */
  onWheel(event, layerGroup) {
    if (typeof layerGroup === 'undefined') {
      return;
    }
    const step = -event.deltaY / 500;
    const mousePoint = getMousePoint(event);

    const viewLayer = getActiveOrDrawRefViewLayer(layerGroup);
    if (typeof viewLayer === 'undefined') {
      logger.warn('No view layer to do wheel zoom behavior');
      return;
    }
    const viewController = viewLayer.getViewController();
    const planePos = viewLayer.displayToMainPlanePos(mousePoint);
    const center = viewController.getPlanePositionFromPlanePoint(planePos);
    layerGroup.addScale(step, center);
    layerGroup.draw();
  }

}
