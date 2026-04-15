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
  onUpdate(_point, _layerGroup) {
    // override in subclass
  }

  onEnd() {
    // override in subclass
  }

}

/**
 * Hover-only tooltip: shows a layer-group tooltip on move when enabled.
 */
export class TooltipHoverBehavior extends HoverBehavior {

  /**
   * @type {boolean}
   */
  #tooltipEnabled = false;

  /**
   * @type {LayerGroup|undefined}
   */
  #currentLayerGroup;

  /**
   * @param {object} [options] Constructor options.
   * @param {boolean} [options.tooltipEnabled] Whether to show tooltip on hover.
   */
  constructor({tooltipEnabled = false} = {}) {
    super();
    this.#tooltipEnabled = tooltipEnabled;
  }

  /**
   * @param {boolean} tooltipEnabled Whether to show tooltip on hover.
   */
  setTooltipEnabled(tooltipEnabled) {
    this.#tooltipEnabled = tooltipEnabled;
  }

  /**
   * @param {Point2D} point The update point.
   * @param {LayerGroup} layerGroup The layer group.
   */
  onUpdate(point, layerGroup) {
    if (this.#tooltipEnabled) {
      this.#showTooltip(point, layerGroup);
    }
  }

  /**
   * Invoked when hover ends; removes the last tooltip html div.
   */
  onEnd() {
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
