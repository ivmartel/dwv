import {
  WindowLevel as WindowLevelValues
} from '../../image/windowLevel.js';
import {logger} from '../../utils/logger.js';
import {
  getActiveOrDrawRefViewLayer,
  getActiveOrFirstMonochromeViewLayer
} from './utils.js';

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
  onStart(_point, _layerGroup) {
    // override in subclass
  }

  /**
   * @param {DragStep} _drag Step with `dx`/`dy` and positions.
   * @param {LayerGroup} _layerGroup The layer group under the pointer.
   */
  onUpdate(_drag, _layerGroup) {
    // override in subclass
  }

  onEnd() {
    // override in subclass
  }

}

/**
 * Window/level drag updates. Start: {@link WindowLevelDragBehavior.canStart}.
 */
export class WindowLevelDragBehavior extends DragBehavior {

  /**
   * If true, use only the active view layer; if false, resolve to the first
   * monochrome view layer among active layers.
   *
   * @type {boolean}
   */
  #activeViewLayerOnly;

  /**
   * @param {object} options  Constructor options.
   * @param {boolean} [options.activeViewLayerOnly] Active view layer only.
   */
  constructor({activeViewLayerOnly = true} = {}) {
    super();
    this.#activeViewLayerOnly = activeViewLayerOnly;
  }

  /**
   * @param {boolean} activeViewLayerOnly Active view layer only.
   */
  setActiveViewLayerOnly(activeViewLayerOnly) {
    this.#activeViewLayerOnly = activeViewLayerOnly;
  }

  /**
   * @param {Point2D} _point The pointer position (unused).
   * @param {LayerGroup} layerGroup The layer group under the pointer.
   * @returns {boolean} True if W/L adjustment is allowed.
   */
  canStart(_point, layerGroup) {
    const viewLayer = getActiveOrFirstMonochromeViewLayer(
      layerGroup, this.#activeViewLayerOnly);
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
  onUpdate(drag, layerGroup) {
    const viewLayer = getActiveOrFirstMonochromeViewLayer(
      layerGroup, this.#activeViewLayerOnly);
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
   * @param {Point2D} _point The pointer position (unused).
   * @param {LayerGroup} layerGroup The layer group under the pointer.
   * @returns {boolean} True if scrolling is possible.
   */
  canStart(_point, layerGroup) {
    const viewLayer = getActiveOrDrawRefViewLayer(layerGroup);
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
  onStart(point, layerGroup) {
    const viewLayer = getActiveOrDrawRefViewLayer(layerGroup);
    if (typeof viewLayer === 'undefined') {
      logger.warn('No view layer to update scroll drag behavior');
      return;
    }
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
  onUpdate(drag, layerGroup) {
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

  onEnd() {
    this.#stepOrigin = null;
  }

}

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
  onStart(point, _layerGroup) {
    this.#stepOrigin = point;
  }

  /**
   * @param {DragStep} drag Pointer step; uses `point` only.
   * @param {LayerGroup} layerGroup The layer group under the pointer.
   */
  onUpdate(drag, layerGroup) {
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

  onEnd() {
    this.#stepOrigin = null;
  }

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
