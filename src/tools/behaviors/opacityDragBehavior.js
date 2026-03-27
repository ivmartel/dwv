import {DragBehavior} from './dragBehavior.js';

// doc imports
/* eslint-disable no-unused-vars */
import {LayerGroup} from '../../gui/layerGroup.js';
import {Point2D} from '../../math/point.js';
/* eslint-enable no-unused-vars */

/**
 * Horizontal drag adjusts the active layer opacity (15px steps, ±delta/200).
 */
export class OpacityDragBehavior extends DragBehavior {

  /**
   * @type {Point2D|null}
   */
  #stepOrigin = null;

  /**
   * @param {Point2D} _point The pointer position (unused).
   * @param {LayerGroup} layerGroup The layer group under the pointer.
   * @returns {boolean} True when an active layer exists.
   */
  canStart(_point, layerGroup) {
    const layer = layerGroup.getActiveLayer();
    return typeof layer !== 'undefined';
  }

  /**
   * @param {Point2D} point The pointer position.
   * @param {LayerGroup} _layerGroup The layer group (`canStart` passed).
   */
  onDragBegin(point, _layerGroup) {
    this.#stepOrigin = point;
  }

  /**
   * @param {object} drag Pointer step; uses `point` only.
   * @param {LayerGroup} layerGroup The layer group under the pointer.
   */
  onDragMove(drag, layerGroup) {
    const {point} = drag;
    const diffX = point.getX() - this.#stepOrigin.getX();
    if (Math.abs(diffX) <= 15) {
      return;
    }
    const layer = layerGroup.getActiveLayer();
    const op = layer.getOpacity();
    layer.setOpacity(op + (diffX / 200));
    layer.draw();
    this.#stepOrigin = point;
  }

  onDragEnd() {
    this.#stepOrigin = null;
  }

}
