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
 *   (internal `#moved` flag).
 * @property {number|null} [longTouchToDblClickMs] After a touchstart on the
 *   single-touch path, schedule {@link LayerGroupPointer#dblclick} after this
 *   many milliseconds (defaults to 500).
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
   * True after a mouse down, reset at mouse up.
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
   * End behaviors that have end method.
   */
  cancel() {
    this.#downed = false;
    this.#moved = false;
    this.#clearLongTouchTimer();

    // end drag
    if (this.#dragBehavior?.isActive()) {
      this.#dragBehavior.onEnd();
    }
    // end two touch
    if (this.#twoTouchBehavior?.isActive()) {
      this.#twoTouchBehavior?.onEnd();
    }
    // end hover
    this.#hoverBehavior?.onEnd();
  }

  /**
   * @param {MouseEvent} event The mouse down event.
   */
  mousedown = (event) => {
    this.#downed = true;
    this.#moved = false;

    const {point, layerGroup} = getMouseLayerContext(event, this.#app);
    if (this.#dragBehavior?.canStart(point, layerGroup)) {
      this.#dragBehavior.onStart(point, layerGroup);
    }
  };

  /**
   * @param {MouseEvent} event The mouse move event.
   */
  mousemove = (event) => {
    this.#moved = true;

    const {point, layerGroup} = getMouseLayerContext(event, this.#app);
    if (this.#downed) {
      // remove hover while dragging
      this.#hoverBehavior?.onEnd();
      // update drag
      if (this.#dragBehavior?.isActive()) {
        this.#dragBehavior.onUpdate(point, layerGroup);
      }
    } else {
      // update hover
      this.#hoverBehavior?.onUpdate(point, layerGroup);
    }
  };

  /**
   * @param {MouseEvent} event The mouse up event.
   */
  mouseup = (event) => {
    this.#downed = false;

    if (this.#moved) {
      // end drag
      if (this.#dragBehavior?.isActive()) {
        this.#dragBehavior.onEnd();
      }
    } else {
      // tap if no move
      const {point, layerGroup} = getMouseLayerContext(event, this.#app);
      this.#tapBehavior?.onTap(point, layerGroup);
    }
  };

  /**
   * @param {MouseEvent} _event The mouse out event.
   */
  mouseout = (_event) => {
    // end drag
    if (this.#dragBehavior?.isActive()) {
      this.#dragBehavior.onEnd();
    }
    // end hover
    this.#hoverBehavior?.onEnd();
  };

  /**
   * @param {TouchEvent} event The touch start event.
   */
  touchstart = (event) => {
    this.#moved = false;
    this.#clearLongTouchTimer();

    const touchPoints = getTouchPoints(event);
    if (touchPoints.length === 1) {
      // one touch drag
      const {point, layerGroup} = getPrimaryTouchLayerContext(event, this.#app);
      if (this.#dragBehavior?.canStart(point, layerGroup)) {
        this.#dragBehavior.onStart(point, layerGroup);
      }
      // long single touch to dblclick
      // recommended type is ReturnType<typeof setTimeout> but
      //   lint does not like it
      // @ts-ignore
      this.#longTouchTimerId = setTimeout(() => {
        this.#longTouchTimerId = null;
        this.dblclick(event);
      }, this.#longTouchToDblClickMs);
    } else if (touchPoints.length === 2) {
      // two touch
      this.#twoTouchBehavior?.onStart(touchPoints);
    }
  };

  /**
   * @param {TouchEvent} event The touch move event.
   */
  touchmove = (event) => {
    this.#moved = true;
    this.#clearLongTouchTimer();

    // context
    const {point, layerGroup} = getPrimaryTouchLayerContext(event, this.#app);

    const touchPoints = getTouchPoints(event);
    if (touchPoints.length === 1) {
      // one touch drag
      if (this.#dragBehavior?.isActive()) {
        this.#dragBehavior.onUpdate(point, layerGroup);
      }
    } else if (touchPoints.length === 2) {
      // two touch
      if (this.#twoTouchBehavior?.isActive()) {
        this.#twoTouchBehavior.onUpdate(touchPoints, layerGroup);
      }
    }
  };

  /**
   * @param {TouchEvent} event The touch end event.
   */
  touchend = (event) => {
    this.#clearLongTouchTimer();

    if (this.#moved) {
      // end one touch drag
      if (this.#dragBehavior?.isActive()) {
        this.#dragBehavior.onEnd();
      }
      // end two touch
      if (this.#twoTouchBehavior?.isActive()) {
        this.#twoTouchBehavior.onEnd();
      }
    } else {
      // tap if no move
      const {point, layerGroup} = getPrimaryTouchLayerContext(event, this.#app);
      this.#tapBehavior?.onTap(point, layerGroup);
    }
  };

  #clearLongTouchTimer() {
    if (this.#longTouchTimerId !== null) {
      clearTimeout(this.#longTouchTimerId);
      this.#longTouchTimerId = null;
    }
  }

}
