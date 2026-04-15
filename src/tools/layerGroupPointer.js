import {
  getMousePoint,
  getTouchPoints
} from '../gui/generic.js';
import {getLayerDetailsFromEvent} from '../gui/layerGroup.js';

// doc imports
/* eslint-disable no-unused-vars */
import {App} from '../app/application.js';
import {DragBehavior} from './behaviors/dragBehavior.js';
import {HoverBehavior} from './behaviors/hoverBehavior.js';
import {Point2D} from '../math/point.js';
import {LayerGroup} from '../gui/layerGroup.js';
import {WheelBehavior} from './behaviors/wheelBehavior.js';
import {WheelTick} from './behaviors/wheelTick.js';
import {DoubleClickBehavior} from './behaviors/doubleClickBehavior.js';
import {TapBehavior} from './behaviors/tapBehavior.js';
import {TwoTouchBehavior} from './behaviors/twoTouchBehavior.js';
/* eslint-enable no-unused-vars */

/**
 * Mouse position and layer group from a DOM event targeting a view layer.
 *
 * @param {MouseEvent|TouchEvent} event The mouse or touch event.
 * @param {App} app The application (resolves the layer group).
 * @returns {{point: Point2D, layerGroup: LayerGroup}}
 *   Pointer position and layer group.
 */
function getMouseLayerContext(event, app) {
  const layerDetails = getLayerDetailsFromEvent(event);
  const layerGroup = app.getLayerGroupByDivId(layerDetails.groupDivId);
  return {
    point: getMousePoint(event),
    layerGroup
  };
}

/**
 * First touch position and layer group from a touch event.
 *
 * @param {TouchEvent} event The touch event.
 * @param {App} app The application (resolves the layer group).
 * @returns {{point: Point2D, layerGroup: LayerGroup}}
 *   Primary touch point and layer group.
 */
function getPrimaryTouchLayerContext(event, app) {
  const layerDetails = getLayerDetailsFromEvent(event);
  const layerGroup = app.getLayerGroupByDivId(layerDetails.groupDivId);
  return {
    point: getTouchPoints(event)[0],
    layerGroup
  };
}

/**
 * @typedef {object} LayerGroupPointerOptions
 * @property {App} app Used to resolve {@link LayerGroup} from events.
 * @property {DragBehavior} dragBehavior Drag behaviour; whether a drag may
 *   begin is {@link DragBehavior#canStart}.
 * @property {HoverBehavior} [hoverBehavior] Hover behaviour
 *   (e.g. `TooltipHoverBehavior`).
 * @property {WheelBehavior} [wheelBehavior] Mouse wheel handling.
 * @property {DoubleClickBehavior} [doubleClickBehavior]
 *   Double-click handling.
 * @property {TwoTouchBehavior} [twoTouchBehavior] Two-finger gestures
 *   ({@link TwoTouchBehavior}).
 * @property {TapBehavior} [tapBehavior] Tap when the gesture did not move
 *   (internal `#gestureMoved` flag).
 * @property {number|null} [longTouchToDblClickMs] After a touchstart on the
 *   single-touch path, schedule {@link LayerGroupPointer#dblclick} after this
 *   many milliseconds (defaults to 500); use `0` or `null` to skip the timer.
 *   Cleared on touchmove, touchend, or
 *   {@link LayerGroupPointer#cancel}.
 */

/**
 * Normalises layer mouse/touch input into a single-pointer drag lifecycle.
 * Per-move deltas are computed inside {@link DragBehavior#onUpdate}.
 * Hover ({@link HoverBehavior}) is driven from mouse events only, not touch.
 *
 * Event entry points use the same names as tools (`mousedown`, `mousemove`,
 * `wheel`, `dblclick`, …). Those handlers are arrow functions so they stay
 * bound when the toolbox invokes them as bare callbacks (`func(event)`).
 */
export class LayerGroupPointer {

  /**
   * @type {App}
   */
  #app;

  /**
   * @type {DragBehavior}
   */
  #dragBehavior;

  /**
   * @type {HoverBehavior|undefined}
   */
  #hoverBehavior;

  /**
   * @type {WheelBehavior|undefined}
   */
  #wheelBehavior;

  /**
   * @type {WheelTick}
   */
  #wheelTick = new WheelTick();

  /**
   * @type {DoubleClickBehavior|undefined}
   */
  #doubleClickBehavior;

  /**
   * @type {TwoTouchBehavior|undefined}
   */
  #twoTouchBehavior;

  /**
   * @type {TapBehavior|undefined}
   */
  #tapBehavior;

  /**
   * @type {number|null}
   */
  #longTouchToDblClickMs;

  /**
   * @type {number|null}
   */
  #longTouchTimerId = null;

  /**
   * True after a drag move, or after two-touch {@link TwoTouchBehavior} reports
   * movement — suppresses tap on mouseup/touchend when set.
   *
   * @type {boolean}
   */
  #gestureMoved = false;

  /**
   * @param {LayerGroupPointerOptions} options Constructor options.
   */
  constructor({
    app,
    dragBehavior,
    hoverBehavior,
    wheelBehavior,
    doubleClickBehavior,
    twoTouchBehavior,
    tapBehavior,
    longTouchToDblClickMs = 500
  }) {
    this.#app = app;
    this.#dragBehavior = dragBehavior;
    this.#hoverBehavior = hoverBehavior;
    this.#wheelBehavior = wheelBehavior;
    this.#doubleClickBehavior = doubleClickBehavior;
    this.#twoTouchBehavior = twoTouchBehavior;
    this.#tapBehavior = tapBehavior;
    this.#longTouchToDblClickMs = longTouchToDblClickMs;
  }

  /**
   * @param {WheelEvent} event The mouse wheel event.
   *   Calls `preventDefault` once before `onWheel` / tick handling.
   */
  wheel = (event) => {
    if (typeof this.#wheelBehavior === 'undefined') {
      return;
    }
    event.preventDefault();
    const layerDetails = getLayerDetailsFromEvent(event);
    const layerGroup = this.#app.getLayerGroupByDivId(layerDetails.groupDivId);
    this.#wheelBehavior.onWheel(event, layerGroup);

    this.#wheelTick.add(event);
    const up = this.#wheelTick.getSum() >= 0;
    if (!this.#wheelTick.isTick()) {
      return;
    }
    this.#wheelTick.clear();

    this.#wheelBehavior.onWheelTick(up, layerGroup);
  };

  /**
   * @param {MouseEvent|TouchEvent} event The double click event.
   */
  dblclick = (event) => {
    const {point, layerGroup} = getMouseLayerContext(event, this.#app);
    this.#doubleClickBehavior?.onDoubleClick(point, layerGroup);
  };

  /**
   * End drag if active; does not call onEnd if already idle.
   */
  cancel() {
    this.#clearLongTouchTimer();
    this.#twoTouchBehavior?.onEnd();
    this.#endDrag();
    this.#endHover();
  }

  /**
   * @param {MouseEvent} event The mouse down event.
   */
  mousedown = (event) => {
    this.#gestureMoved = false;
    const {point, layerGroup} = getMouseLayerContext(event, this.#app);
    this.#beginDrag(point, layerGroup);
  };

  /**
   * @param {MouseEvent} event The mouse move event.
   */
  mousemove = (event) => {
    const {point, layerGroup} = getMouseLayerContext(event, this.#app);
    if (this.#dragBehavior.isActive()) {
      this.#endHover();
      this.#dragBehavior.onUpdate(point, layerGroup);
      this.#gestureMoved = true;
    } else {
      this.#hoverBehavior?.onUpdate(point, layerGroup);
    }
  };

  /**
   * @param {MouseEvent} event The mouse up event.
   */
  mouseup = (event) => {
    if (typeof this.#tapBehavior !== 'undefined' &&
      this.#dragBehavior.isActive() &&
      !this.#gestureMoved) {
      const {point, layerGroup} = getMouseLayerContext(event, this.#app);
      this.#tapBehavior.onTap(point, layerGroup);
    }
    this.#endDrag();
  };

  /**
   * @param {MouseEvent} _event The mouse out event.
   */
  mouseout = (_event) => {
    this.#endDrag();
    this.#endHover();
  };

  /**
   * @param {TouchEvent} event The touch start event.
   */
  touchstart = (event) => {
    this.#clearLongTouchTimer();
    this.#gestureMoved = false;

    // two-touch gesture
    const touchPoints = getTouchPoints(event);
    const twoTouch = this.#twoTouchBehavior && touchPoints.length === 2;
    if (twoTouch) {
      if (this.#dragBehavior.isActive()) {
        this.#endDrag();
      }
      this.#twoTouchBehavior.onStart(touchPoints);
      return;
    }

    // long touch to dblclick
    // recommended type is ReturnType<typeof setTimeout> but
    //   lint does not like it
    // @ts-ignore
    this.#longTouchTimerId = setTimeout(() => {
      this.#longTouchTimerId = null;
      this.dblclick(event);
    }, this.#longTouchToDblClickMs);

    const {point, layerGroup} = getPrimaryTouchLayerContext(event, this.#app);
    this.#beginDrag(point, layerGroup);
  };

  /**
   * @param {TouchEvent} event The touch move event.
   */
  touchmove = (event) => {
    this.#clearLongTouchTimer();
    const {point, layerGroup} = getPrimaryTouchLayerContext(event, this.#app);

    // two-touch gesture
    const touchPoints = getTouchPoints(event);
    const twoTouch = this.#twoTouchBehavior && touchPoints.length === 2;
    if (twoTouch) {
      if (!this.#twoTouchBehavior.isActive()) {
        if (this.#dragBehavior.isActive()) {
          this.#endDrag();
        }
        this.#gestureMoved = false;
        this.#twoTouchBehavior.onStart(touchPoints);
      }
      if (this.#twoTouchBehavior.onUpdate(touchPoints, layerGroup)) {
        this.#gestureMoved = true;
      }
      return;
    }

    if (this.#dragBehavior.isActive()) {
      this.#dragBehavior.onUpdate(point, layerGroup);
      this.#gestureMoved = true;
    }
  };

  /**
   * @param {TouchEvent} event The touch end event.
   */
  touchend = (event) => {
    this.#clearLongTouchTimer();
    if (typeof this.#tapBehavior !== 'undefined' &&
      !this.#gestureMoved) {
      const {point, layerGroup} = getPrimaryTouchLayerContext(event, this.#app);
      this.#tapBehavior.onTap(point, layerGroup);
    }
    this.#twoTouchBehavior?.onEnd();
    this.#endDrag();
  };

  /**
   * @param {Point2D} point Pointer position in display space.
   * @param {LayerGroup} layerGroup The layer group under the pointer.
   */
  #beginDrag(point, layerGroup) {
    if (this.#dragBehavior?.canStart(point, layerGroup)) {
      this.#dragBehavior.onStart(point, layerGroup);
    }
  }

  #endDrag() {
    if (this.#dragBehavior?.isActive()) {
      this.#dragBehavior.onEnd();
    }
  }

  #endHover() {
    this.#hoverBehavior?.onEnd();
  }

  #clearLongTouchTimer() {
    if (this.#longTouchTimerId !== null) {
      clearTimeout(this.#longTouchTimerId);
      this.#longTouchTimerId = null;
    }
  }

}
