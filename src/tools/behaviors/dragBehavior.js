import {
  WindowLevel as WindowLevelValues
} from '../../image/windowLevel.js';
import {logger} from '../../utils/logger.js';

// doc imports
/* eslint-disable no-unused-vars */
import {Point2D} from '../../math/point.js';
import {LayerGroup} from '../../gui/layerGroup.js';
import {ViewLayer} from '../../gui/viewLayer.js';
/* eslint-enable no-unused-vars */

/**
 * One pointer move while dragging: positions and delta from the previous event.
 */
export class DragStep {

  /**
   * @param {Point2D} point Current pointer position (display space).
   * @param {Point2D} prevPoint Position at the previous move (or down).
   */
  constructor(point, prevPoint) {
    this.point = point;
    this.prevPoint = prevPoint;
    this.dx = point.getX() - prevPoint.getX();
    this.dy = point.getY() - prevPoint.getY();
  }

}

/**
 * Base drag behaviour: optional start gate and drag lifecycle hooks.
 * Concrete tools extend this (e.g. {@link WindowLevelDragBehavior}).
 */
export class DragBehavior {

  /**
   * @param {Point2D} _point The pointer position.
   * @param {LayerGroup} _layerGroup The layer group under the pointer.
   * @returns {boolean} Whether a drag may begin.
   */
  canStart(_point, _layerGroup) {
    return true;
  }

  /**
   * @param {Point2D} _point The pointer position.
   * @param {LayerGroup} _layerGroup The layer group under the pointer.
   */
  onDragBegin(_point, _layerGroup) {
    // override in subclass
  }

  /**
   * @param {DragStep} _drag Step with `dx`/`dy` and positions.
   * @param {LayerGroup} _layerGroup The layer group under the pointer.
   */
  onDragMove(_drag, _layerGroup) {
    // override in subclass
  }

  onDragEnd() {
    // override in subclass
  }

}

/**
 * Window/level drag updates. Start: {@link WindowLevelDragBehavior.canStart}.
 */
export class WindowLevelDragBehavior extends DragBehavior {

  /**
   * Strict view layer flag: if true, use the active layer
   * (that could be undefined, ie bail) or, if false,
   * try to find the active monochrome view layer.
   *
   * @type {boolean}
   */
  #strictViewLayer;

  /**
   * @param {object} options
   * @param {boolean} [options.strictViewLayer] Strict active layer mode.
   */
  constructor({strictViewLayer = true} = {}) {
    super();
    this.#strictViewLayer = strictViewLayer;
  }

  /**
   * @param {boolean} strictViewLayer Strict active layer mode.
   */
  setStrictViewLayer(strictViewLayer) {
    this.#strictViewLayer = strictViewLayer;
  }

  /**
   * @param {LayerGroup} layerGroup The layer group of the view layer.
   * @returns {ViewLayer|undefined} The layer.
   */
  getActiveViewLayer(layerGroup) {
    let layer;
    if (this.#strictViewLayer) {
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
   * @param {Point2D} _point The pointer position (unused).
   * @param {LayerGroup} layerGroup The layer group under the pointer.
   * @returns {boolean} True if W/L adjustment is allowed.
   */
  canStart(_point, layerGroup) {
    const viewLayer = this.getActiveViewLayer(layerGroup);
    if (typeof viewLayer === 'undefined') {
      return false;
    }
    const viewController = viewLayer.getViewController();
    if (!viewController.isMonochrome()) {
      return false;
    }
    return true;
  }

  /**
   * @param {DragStep} drag Delta from previous event (`dx`/`dy`).
   * @param {LayerGroup} layerGroup The layer group under the pointer.
   */
  onDragMove(drag, layerGroup) {
    const viewLayer = this.getActiveViewLayer(layerGroup);
    if (typeof viewLayer === 'undefined') {
      return;
    }
    const viewController = viewLayer.getViewController();

    const diffX = drag.dx;
    const diffY = -drag.dy;
    const range = viewController.getImageRescaledDataRange();
    const pixelToIntensity = (range.max - range.min) * 0.001;

    const center = viewController.getWindowLevel().center;
    const width = viewController.getWindowLevel().width;
    const windowCenter = center + (diffY * pixelToIntensity);
    const windowWidth = width + (diffX * pixelToIntensity);

    const wl = new WindowLevelValues(windowCenter, windowWidth);
    viewController.setWindowLevel(wl);
  }

}

/**
 * Slice scroll drag updates. Start: {@link ScrollDragBehavior.canStart}.
 */
export class ScrollDragBehavior extends DragBehavior {

  /**
   * @type {Point2D|null}
   */
  #stepOrigin = null;

  /**
   * @param {object} [_options] Unused placeholder for API symmetry.
   */
  constructor(_options = {}) {
    super();
  }

  /**
   * @param {LayerGroup} layerGroup The layer group to search.
   * @returns {ViewLayer|undefined} The view layer.
   */
  #getViewLayer(layerGroup) {
    let viewLayer = layerGroup.getActiveViewLayer();
    if (typeof viewLayer === 'undefined') {
      const drawLayer = layerGroup.getActiveDrawLayer();
      if (typeof drawLayer === 'undefined') {
        logger.warn('No draw layer to do scroll');
        return;
      }
      viewLayer = layerGroup.getViewLayerById(
        drawLayer.getReferenceLayerId());
    }
    return viewLayer;
  }

  /**
   * @param {Point2D} _point The pointer position (unused).
   * @param {LayerGroup} layerGroup The layer group under the pointer.
   * @returns {boolean} True if scrolling is possible.
   */
  canStart(_point, layerGroup) {
    const viewLayer = this.#getViewLayer(layerGroup);
    if (typeof viewLayer === 'undefined') {
      logger.warn('No view layer to start scroll');
      return false;
    }
    return true;
  }

  /**
   * @param {Point2D} point The pointer position.
   * @param {LayerGroup} layerGroup The layer group.
   */
  onDragBegin(point, layerGroup) {
    const viewLayer = this.#getViewLayer(layerGroup);
    const viewController = viewLayer.getViewController();
    if (viewController.isPlaying()) {
      viewController.stop();
    }
    const planePos = viewLayer.displayToPlanePos(point);
    const position = viewController.getPositionFromPlanePoint(planePos);
    viewController.setCurrentPosition(position);
    this.#stepOrigin = point;
  }

  /**
   * @param {DragStep} drag Uses `drag.point` only. Does not use
   *   `drag.dx`/`drag.dy`: those are
   *   deltas since the *previous event*, but slice scroll fires when the
   *   pointer has moved more than 15px from `#stepOrigin`, and that origin
   *   jumps to `point` after each step — so the test is offset from step,
   *   not incremental pointer deltas.
   * @param {LayerGroup} layerGroup The layer group under the pointer.
   */
  onDragMove(drag, layerGroup) {
    const {point} = drag;
    const positionHelper = layerGroup.getPositionHelper();

    const offsetYFromStep = point.getY() - this.#stepOrigin.getY();
    const offsetXFromStep = point.getX() - this.#stepOrigin.getX();
    const yMove = Math.abs(offsetYFromStep) > 15;
    const xMove = Math.abs(offsetXFromStep) > 15;

    if (yMove && layerGroup.canScroll()) {
      if (offsetYFromStep > 0) {
        positionHelper.decrementPositionAlongScroll();
      } else {
        positionHelper.incrementPositionAlongScroll();
      }
    } else if (xMove && layerGroup.moreThanOne(3)) {
      if (offsetXFromStep > 0) {
        positionHelper.incrementPosition(3);
      } else {
        positionHelper.decrementPosition(3);
      }
    }

    if (xMove || yMove) {
      this.#stepOrigin = point;
    }
  }

  onDragEnd() {
    this.#stepOrigin = null;
  }

}
