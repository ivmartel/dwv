import {getLayerDetailsFromEvent} from '../../gui/layerGroup.js';

// doc imports
/* eslint-disable no-unused-vars */
import {App} from '../../app/application.js';
import {WheelBehavior} from './wheelBehavior.js';
import {WheelTick} from './wheelTick.js';
/* eslint-enable no-unused-vars */

/**
 * Wheel tick accumulation, `preventDefault`, then `behavior.onWheelTick`.
 * For tools that forward wheel without a {@link LayerGroupPointer}.
 *
 * @param {WheelEvent} event The wheel event.
 * @param {App} app The application (resolves layer group).
 * @param {WheelTick} wheelTick Accumulator (owned by caller).
 * @param {WheelBehavior|undefined} behavior Receives `onWheelTick`.
 */
export function runWheelTickPipeline(event, app, wheelTick, behavior) {
  if (typeof behavior === 'undefined') {
    return;
  }
  wheelTick.add(event);
  const up = wheelTick.getSum() >= 0;
  if (!wheelTick.isTick()) {
    return;
  }
  wheelTick.clear();
  event.preventDefault();

  const layerDetails = getLayerDetailsFromEvent(event);
  const layerGroup = app.getLayerGroupByDivId(layerDetails.groupDivId);
  behavior.onWheelTick(up, layerGroup);
}
