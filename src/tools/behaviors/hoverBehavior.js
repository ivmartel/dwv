// doc imports
/* eslint-disable no-unused-vars */
import {Point2D} from '../../math/point.js';
import {LayerGroup} from '../../gui/layerGroup.js';
/* eslint-enable no-unused-vars */

/**
 * Hover-only behaviour while the pointer is not dragging.
 */
export class HoverBehavior {

  /**
   * @param {Point2D} _point The pointer position.
   * @param {LayerGroup} _layerGroup The layer group under the pointer.
   */
  onHoverMove(_point, _layerGroup) {
    // override in subclass
  }

  onHoverEnd() {
    // override in subclass
  }

}

/**
 * Hover-only tooltip: shows a layer-group tooltip on move when enabled.
 */
export class TooltipHoverBehavior extends HoverBehavior {

  /**
   * @type {() => boolean}
   */
  #isTooltipEnabled;

  /**
   * @type {LayerGroup|undefined}
   */
  #currentLayerGroup;

  /**
   * @param {object} options
   * @param {() => boolean} options.isTooltipEnabled Whether to show tooltip.
   */
  constructor({isTooltipEnabled}) {
    super();
    this.#isTooltipEnabled = isTooltipEnabled;
  }

  /**
   * @param {Point2D} point The update point.
   * @param {LayerGroup} layerGroup The layer group.
   */
  onHoverMove(point, layerGroup) {
    if (this.#isTooltipEnabled()) {
      this.#showTooltip(point, layerGroup);
    }
  }

  /**
   * Invoked when hover ends; removes the last tooltip html div.
   */
  onHoverEnd() {
    if (typeof this.#currentLayerGroup !== 'undefined') {
      this.#currentLayerGroup.removeTooltipDiv();
      this.#currentLayerGroup = undefined;
    }
  }

  /**
   * @param {Point2D} point The update point.
   * @param {LayerGroup} layerGroup The layer group.
   */
  #showTooltip(point, layerGroup) {
    this.#currentLayerGroup = layerGroup;
    layerGroup.showTooltip(point);
  }

}
