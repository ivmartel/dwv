import {getLayerDetailsFromEvent} from '../gui/layerGroup';

// doc imports
/* eslint-disable no-unused-vars */
import {App} from '../app/application';
/* eslint-enable no-unused-vars */

/**
 * Scroll wheel class: provides a wheel event handler
 *   that scroll the corresponding data.
 */
export class ScrollWheel {
  /**
   * Associated app.
   *
   * @type {App}
   */
  #app;

  /**
   * Accumulated wheel event deltaY.
   *
   * @type {number}
   */
  #wheelDeltaY = 0;

  /**
   * @param {App} app The associated application.
   */
  constructor(app) {
    this.#app = app;
  }

  /**
   * Handle mouse wheel event.
   *
   * @param {WheelEvent} event The mouse wheel event.
   */
  wheel(event) {
    // deltaMode (deltaY values on my machine...):
    // - 0 (DOM_DELTA_PIXEL): chrome, deltaY mouse scroll = 53
    // - 1 (DOM_DELTA_LINE): firefox, deltaY mouse scroll = 6
    // - 2 (DOM_DELTA_PAGE): ??
    // TODO: check scroll event
    let scrollMin = 52;
    if (event.deltaMode === 1) {
      scrollMin = 5.99;
    }
    this.#wheelDeltaY += event.deltaY;
    if (Math.abs(this.#wheelDeltaY) < scrollMin) {
      return;
    } else {
      this.#wheelDeltaY = 0;
    }

    const up = event.deltaY < 0 ? true : false;

    const layerDetails = getLayerDetailsFromEvent(event);
    const layerGroup = this.#app.getLayerGroupByDivId(layerDetails.groupDivId);
    const viewController =
      layerGroup.getActiveViewLayer().getViewController();
    let newPosition;
    if (layerGroup.canScroll()) {
      if (up) {
        newPosition = viewController.getIncrementScrollPosition();
      } else {
        newPosition = viewController.getDecrementScrollPosition();
      }
    } else if (layerGroup.moreThanOne(3)) {
      if (up) {
        newPosition = viewController.getIncrementPosition(3);
      } else {
        newPosition = viewController.getDecrementPosition(3);
      }
    }

    // set all layers if at least one can be set
    if (typeof newPosition !== 'undefined' &&
      layerGroup.isPositionInBounds(newPosition)) {
      viewController.setCurrentPosition(newPosition);
    }
  }

} // ScrollWheel class
