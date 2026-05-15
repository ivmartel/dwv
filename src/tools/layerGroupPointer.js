import {
  getMousePoint,
  getTouchPoints
} from '../gui/generic.js';
import {getLayerDetailsFromEvent} from '../gui/layerGroup.js';
import {WheelTick} from './behaviors/wheelTick.js';

// Avoid mouse events. To use with browser mobile simulation.
const TOUCH_EVENTS_DEBUG = false;

/**
 * `MouseEvent#button` values (left through fifth / forward).
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
 *
 * @type {Readonly<{
 *   left: 0,
 *   middle: 1,
 *   right: 2,
 *   back: 3,
 *   forward: 4
 * }>}
 */
export const MouseEventButtons = {
  left: 0,
  middle: 1,
  right: 2,
  back: 3,
  forward: 4
};

/**
 * @import {App} from '../app/application.js';
 * @import {DragBehavior} from './behaviors/dragBehavior.js';
 * @import {HoverBehavior} from './behaviors/hoverBehavior.js';
 * @import {Point2D} from '../math/point.js';
 * @import {LayerGroup} from '../gui/layerGroup.js';
 * @import {WheelBehavior} from './behaviors/wheelBehavior.js';
 * @import {DoubleClickBehavior} from './behaviors/doubleClickBehavior.js';
 * @import {TapBehavior} from './behaviors/tapBehavior.js';
 * @import {TwoTouchBehavior} from './behaviors/twoTouchBehavior.js';
 * @import {StageController} from '../app/stageController.js';
 */

/**
 * Mouse position and layer group from a DOM event targeting a view layer.
 *
 * @param {MouseEvent} event The mouse or touch event.
 * @param {StageController} stgCtrl The stage controller
 *   (resolves the layer group).
 * @returns {{point: Point2D, layerGroup: LayerGroup}}
 *   Pointer position and layer group.
 */
function getMouseLayerContext(event, stgCtrl) {
  const layerDetails = getLayerDetailsFromEvent(event);
  const layerGroup = stgCtrl.getLayerGroupByDivId(layerDetails.groupDivId);
  return {
    point: getMousePoint(event),
    layerGroup
  };
}

/**
 * First touch position and layer group from a touch event.
 *
 * @param {TouchEvent} event The touch event.
 * @param {StageController} stgCtrl The stage controller
 *   (resolves the layer group).
 * @returns {{point: Point2D, layerGroup: LayerGroup}}
 *   Primary touch point and layer group.
 */
function getPrimaryTouchLayerContext(event, stgCtrl) {
  const layerDetails = getLayerDetailsFromEvent(event);
  const layerGroup = stgCtrl.getLayerGroupByDivId(layerDetails.groupDivId);
  return {
    point: getTouchPoints(event)[0],
    layerGroup
  };
}

/**
 * @typedef {object} LayerGroupPointerOptions
 * @property {App} app Used to resolve {@link LayerGroup} from events.
 * @property {DragBehavior} [dragBehavior] Drag behaviour:
 *   mouse down / touch start + move + end (mouse or touch).
 * @property {HoverBehavior} [hoverBehavior] Hover behaviour:
 *   mouse move without click (only mouse).
 * @property {WheelBehavior} [wheelBehavior] Mouse wheel handling
 *   (only mouse).
 * @property {DoubleClickBehavior} [doubleClickBehavior] Double-click
 *   behaviour, also triggered by long touch.
 * @property {TwoTouchBehavior} [twoTouchBehavior] Two-finger behaviour
 *   (only touch).
 * @property {TapBehavior} [tapBehavior] Tap behaviour: can be one tap
 *   or sticky tap for multiple taps (finite or finished with double click).
 *   For mouse or touch.
 * @property {number|null} [longTouchToDblClickMs] After a touchstart on the
 *   single-touch path, schedule {@link LayerGroupPointer#dblclick} after this
 *   many milliseconds (defaults to 500).
 */

/**
 * Normalises layer mouse/touch input into a single-pointer drag lifecycle.
 * Per-move deltas are computed inside {@link DragBehavior#onUpdate}.
 * Hover ({@link HoverBehavior}) is driven from mouse events only, not touch.
 *
 * Extends {@link EventTarget} so subclasses (tools) can use
 * `addEventListener` / `dispatchEvent` like other UI tools.
 *
 * Event entry points use the same names as tools (`mousedown`, `mousemove`,
 * `wheel`, `dblclick`, …). Those handlers are arrow functions so they stay
 * bound when the toolbox invokes them as bare callbacks (`func(event)`).
 */
export class LayerGroupPointer extends EventTarget {

  /**
   * @type {App}
   */
  #app;

  /**
   * @type {DragBehavior|undefined}
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
   * @type {number|undefined}
   */
  #longTouchTimerId;

  /**
   * True after a mouse down, reset at mouseup or mouseout.
   *
   * @type {boolean}
   */
  #downed = false;

  /**
   * True after a mouse or touch move, reset at mousedown or touchstart.
   *
   * @type {boolean}
   */
  #moved = false;

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
    super();
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
   * Get the list of event names that this tool can fire.
   * Default implementation returns an empty array.
   *
   * @returns {string[]} The list of event names.
   */
  getEventNames() {
    return [];
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
    const stgCtrl = this.#app.getStageController();
    const layerGroup = stgCtrl.getLayerGroupByDivId(layerDetails.groupDivId);
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
   * @param {MouseEvent} event The double click event.
   */
  dblclick = (event) => {
    if (TOUCH_EVENTS_DEBUG) {
      return;
    }

    const stgCtrl = this.#app.getStageController();
    const {point, layerGroup} = getMouseLayerContext(event, stgCtrl);
    if (typeof this.#doubleClickBehavior !== 'undefined') {
      this.#doubleClickBehavior.onDoubleClick(point, layerGroup);
    } else if (this.#tapBehavior?.isActive()) {
      this.#tapBehavior.onEnd();
    }
  };

  /**
   * @param {Point2D} point Display point.
   * @param {LayerGroup} layerGroup Layer group.
   */
  #longTouch(point, layerGroup) {
    // similar to this.dblclick
    if (typeof this.#doubleClickBehavior !== 'undefined') {
      this.#doubleClickBehavior.onDoubleClick(point, layerGroup);
    } else if (this.#tapBehavior?.isActive()) {
      // add last point
      this.#tapBehavior.onTap(point, layerGroup);
      this.#tapBehavior.onEnd();
    }
    // avoid tap on touchend
    this.#downed = false;
    // reset timer
    this.#longTouchTimerId = undefined;
  };

  /**
   * End behaviors that have end method.
   */
  cancel() {
    this.#downed = false;
    this.#moved = false;
    this.#clearLongTouchTimer();

    // reset drag
    if (this.#dragBehavior?.isActive()) {
      this.#dragBehavior.reset();
    }
    // reset sticky tap
    if (this.#tapBehavior?.isActive()) {
      this.#tapBehavior.reset();
    }
    // reset two touch
    if (this.#twoTouchBehavior?.isActive()) {
      this.#twoTouchBehavior?.reset();
    }
    // reset hover
    this.#hoverBehavior?.reset();
  }

  /**
   * Handle mouse down.
   *
   * @param {MouseEvent} event The mouse down event.
   */
  mousedown = (event) => {
    if (TOUCH_EVENTS_DEBUG) {
      return;
    }
    // reset
    if (this.#dragBehavior?.isActive()) {
      this.#dragBehavior.reset();
    }
    this.#moved = false;
    // set flag
    this.#downed = true;

    const stgCtrl = this.#app.getStageController();
    const {point, layerGroup} = getMouseLayerContext(event, stgCtrl);
    if (this.#dragBehavior?.canStart(point, layerGroup)) {
      this.#dragBehavior.onStart(point, layerGroup, {
        mouseDownButton: event.button
      });
    }
  };

  /**
   * Handle mouse move.
   *
   * @param {MouseEvent} event The mouse move event.
   */
  mousemove = (event) => {
    if (TOUCH_EVENTS_DEBUG) {
      return;
    }
    // set flag
    this.#moved = true;

    const stgCtrl = this.#app.getStageController();
    const {point, layerGroup} = getMouseLayerContext(event, stgCtrl);
    if (this.#downed) {
      // remove hover for down+move
      this.#hoverBehavior?.onEnd();
      // update drag
      if (this.#dragBehavior?.isActive()) {
        this.#dragBehavior.onUpdate(point, layerGroup);
      }
    } else {
      // update sticky tap
      if (this.#tapBehavior?.isActive()) {
        this.#tapBehavior.onUpdate(point, layerGroup);
      }
      // update hover
      this.#hoverBehavior?.onUpdate(point, layerGroup);
    }
  };

  /**
   * Handle mouse up.
   *
   * @param {MouseEvent} event The mouse up event.
   */
  mouseup = (event) => {
    if (TOUCH_EVENTS_DEBUG) {
      return;
    }

    if (this.#dragBehavior?.isActive()) {
      if (this.#moved) {
        // up+move -> end drag
        this.#dragBehavior.onEnd();
      } else {
        // up and no move -> reset drag
        this.#dragBehavior.reset();
      }
    }

    if (this.#tapBehavior &&
      (this.#tapBehavior.isActive() || (this.#downed && !this.#moved))) {
      // active tap -> sticky tap
      // down + no move -> discrete tap
      const stgCtrl = this.#app.getStageController();
      const {point, layerGroup} = getMouseLayerContext(event, stgCtrl);
      this.#tapBehavior.onTap(point, layerGroup);
    }

    // reset flag
    this.#downed = false;
  };

  /**
   * @param {MouseEvent} _event The mouse out event.
   */
  mouseout = (_event) => {
    if (TOUCH_EVENTS_DEBUG) {
      return;
    }

    // end drag
    if (this.#dragBehavior?.isActive()) {
      this.#dragBehavior.onEnd();
    }
    // end sticky tap
    if (this.#tapBehavior?.isActive()) {
      this.#tapBehavior.onEnd();
    }
    // end hover
    this.#hoverBehavior?.onEnd();
    // reset flags
    this.#downed = false;
    this.#moved = false;
  };

  /**
   * @param {TouchEvent} event The touch start event.
   */
  touchstart = (event) => {
    // reset
    if (this.#dragBehavior?.isActive()) {
      this.#dragBehavior.reset();
    }
    this.#moved = false;
    this.#clearLongTouchTimer();
    // set flag
    this.#downed = true;

    const stgCtrl = this.#app.getStageController();
    const touchPoints = getTouchPoints(event);
    if (touchPoints.length === 1) {
      // one touch drag
      const {point, layerGroup} = getPrimaryTouchLayerContext(event, stgCtrl);
      if (this.#dragBehavior?.canStart(point, layerGroup)) {
        this.#dragBehavior.onStart(point, layerGroup, {});
      }
      // long single touch to dblclick
      const delay = this.#longTouchToDblClickMs;
      if (delay !== null && delay !== undefined && delay > 0) {
        event.preventDefault();
        // recommended type is ReturnType<typeof setTimeout> but
        //   lint does not like it
        // @ts-ignore
        this.#longTouchTimerId = setTimeout(() => {
          this.#longTouch(point, layerGroup);
        }, delay);
      }
    } else if (touchPoints.length === 2) {
      this.#twoTouchBehavior?.onStart(touchPoints);
    }
  };

  /**
   * @param {TouchEvent} event The touch move event.
   */
  touchmove = (event) => {
    // reset
    this.#clearLongTouchTimer();
    // set flag
    this.#moved = true;

    // context
    const stgCtrl = this.#app.getStageController();
    const {point, layerGroup} = getPrimaryTouchLayerContext(event, stgCtrl);

    const touchPoints = getTouchPoints(event);
    if (touchPoints.length === 1) {
      // one touch drag
      if (this.#dragBehavior?.isActive()) {
        this.#dragBehavior.onUpdate(point, layerGroup);
      }
    } else if (touchPoints.length === 2) {
      // Transition frames may have two touches before two-touch is active.
      if (this.#dragBehavior?.isActive()) {
        this.#dragBehavior.reset();
      }
      if (this.#twoTouchBehavior?.isActive()) {
        this.#twoTouchBehavior.onUpdate(touchPoints, layerGroup);
      }
    }
  };

  /**
   * @param {TouchEvent} event The touch end event.
   */
  touchend = (event) => {
    // reset
    this.#clearLongTouchTimer();

    if (this.#twoTouchBehavior?.isActive()) {
      this.#twoTouchBehavior.onEnd();
      return;
    }

    if (this.#dragBehavior?.isActive()) {
      if (this.#moved) {
        // up+move -> end drag
        this.#dragBehavior.onEnd();
      } else {
        // up and no move -> reset drag
        this.#dragBehavior.reset();
      }
    }

    if (this.#tapBehavior &&
      (this.#tapBehavior.isActive() || (this.#downed && !this.#moved))) {
      // active tap -> sticky tap
      // down + no move -> discrete tap
      const stgCtrl = this.#app.getStageController();
      const {point, layerGroup} = getPrimaryTouchLayerContext(event, stgCtrl);
      this.#tapBehavior.onTap(point, layerGroup);
    }

    // reset flag
    this.#downed = false;
  };

  #clearLongTouchTimer() {
    if (typeof this.#longTouchTimerId !== 'undefined') {
      clearTimeout(this.#longTouchTimerId);
      this.#longTouchTimerId = undefined;
    }
  }

}
