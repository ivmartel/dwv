import {
  getMousePoint,
  getTouchPoints
} from '../gui/generic.js';
import {getLayerDetailsFromEvent} from '../gui/layerGroup.js';
import {DragStep} from './behaviors/dragBehavior.js';

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
/* eslint-enable no-unused-vars */

/**
 * Mouse position and layer group from a DOM event targeting a view layer.
 *
 * @param {MouseEvent|TouchEvent} event The mouse or touch event.
 * @param {App} app The application (resolves the layer group).
 * @returns {{point: Point2D, layerGroup: LayerGroup, groupDivId: string}}
 *   Pointer position, layer group, and group div id.
 */
export function getMouseLayerContext(event, app) {
  const layerDetails = getLayerDetailsFromEvent(event);
  const groupDivId = layerDetails.groupDivId;
  const layerGroup = app.getLayerGroupByDivId(groupDivId);
  return {
    point: getMousePoint(event),
    layerGroup,
    groupDivId
  };
}

/**
 * First touch position and layer group from a touch event.
 *
 * @param {TouchEvent} event The touch event.
 * @param {App} app The application (resolves the layer group).
 * @returns {{point: Point2D, layerGroup: LayerGroup, groupDivId: string}}
 *   Primary touch point, layer group, and group div id.
 */
export function getPrimaryTouchLayerContext(event, app) {
  const layerDetails = getLayerDetailsFromEvent(event);
  const groupDivId = layerDetails.groupDivId;
  const layerGroup = app.getLayerGroupByDivId(groupDivId);
  return {
    point: getTouchPoints(event)[0],
    layerGroup,
    groupDivId
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
 * @property {object} [twoTouchBehavior] Two-finger gestures: `isActive`,
 *   `onStart(points)`, `onUpdate(points, layerGroup)`, `onEnd`.
 * @property {TapBehavior} [tapBehavior] Tap when the pointer did not move
 *   (internal moved flag).
 * @property {number} [longTouchToDblClickMs] If set, after a touchstart on the
 *   single-touch path, schedule {@link LayerGroupPointer#dblclick} after this
 *   many milliseconds; cleared on touchmove, touchend, or
 *   {@link LayerGroupPointer#cancel}.
 */

/**
 * Normalises layer mouse/touch input into a single-pointer drag lifecycle.
 * Computes per-move deltas and passes a {@link DragStep} and
 * `layerGroup` to `onUpdate`.
 *
 * Event entry points use the same names as tools (`mousedown`, `mousemove`,
 * `wheel`, `dblclick`, …).
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
   * @type {object|undefined}
   */
  #twoTouchBehavior;

  /**
   * @type {TapBehavior|undefined}
   */
  #tapBehavior;

  /**
   * @type {number|undefined}
   */
  #longTouchToDblClickMs;

  /**
   * @type {number|null}
   */
  #longTouchTimerId = null;

  /**
   * Whether the current gesture is active (drag or two-touch).
   *
   * @type {boolean}
   */
  #active = false;

  /**
   * Whether the current gesture moved (drag or two-touch).
   *
   * @type {boolean}
   */
  #moved = false;

  /**
   * @type {Point2D|null}
   */
  #prevPoint = null;

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
    longTouchToDblClickMs
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
  wheel(event) {
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
  }

  /**
   * @param {MouseEvent|TouchEvent} event The double click event.
   */
  dblclick(event) {
    const {point, layerGroup} = getMouseLayerContext(event, this.#app);
    this.#doubleClickBehavior?.onDoubleClick(point, layerGroup);
  }

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
  mousedown(event) {
    this.#endHover();
    const getContext = (e) => getMouseLayerContext(e, this.#app);
    this.#beginDrag(event, getContext);
  }

  /**
   * @param {MouseEvent} event The mouse move event.
   */
  mousemove(event) {
    const {point, layerGroup} = getMouseLayerContext(event, this.#app);
    if (!this.#active) {
      this.#hoverBehavior?.onUpdate(point, layerGroup);
      return;
    }
    this.#dragBehavior.onUpdate(
      this.#dragStepFromTo(point, this.#prevPoint), layerGroup);
    this.#moved = true;
    this.#prevPoint = point;
  }

  /**
   * @param {MouseEvent} event The mouse up event.
   */
  mouseup(event) {
    if (typeof this.#tapBehavior !== 'undefined' &&
      this.#active &&
      !this.#moved) {
      const {point, layerGroup} = getMouseLayerContext(event, this.#app);
      this.#tapBehavior.onTap(point, layerGroup);
    }
    this.#endDrag();
  }

  /**
   * @param {MouseEvent} _event The mouse out event.
   */
  mouseout(_event) {
    this.#endDrag();
    this.#endHover();
  }

  /**
   * @param {TouchEvent} event The touch start event.
   */
  touchstart(event) {
    const touchPoints = getTouchPoints(event);
    if (this.#twoTouchBehavior && touchPoints.length === 2) {
      this.#clearLongTouchTimer();
      this.#endHover();
      if (this.#active) {
        this.#endDrag();
        this.#endHover();
      }
      this.#moved = false;
      this.#twoTouchBehavior.onStart(touchPoints);
      return;
    }
    if (typeof this.#longTouchToDblClickMs === 'number') {
      this.#clearLongTouchTimer();
      // recommended type is ReturnType<typeof setTimeout> but lint does not like it
      // @ts-ignore
      this.#longTouchTimerId = setTimeout(() => {
        this.#longTouchTimerId = null;
        this.dblclick(event);
      }, this.#longTouchToDblClickMs);
    }
    this.#endHover();
    const getContext = (e) => getPrimaryTouchLayerContext(e, this.#app);
    this.#beginDrag(event, getContext);
  }

  /**
   * @param {TouchEvent} event The touch move event.
   */
  touchmove(event) {
    this.#clearLongTouchTimer();
    const touchPoints = getTouchPoints(event);
    if (this.#twoTouchBehavior && touchPoints.length === 2) {
      const {layerGroup} = getPrimaryTouchLayerContext(event, this.#app);
      if (!this.#twoTouchBehavior.isActive()) {
        if (this.#active) {
          this.#endDrag();
          this.#endHover();
        }
        this.#moved = false;
        this.#twoTouchBehavior.onStart(touchPoints);
      }
      if (this.#twoTouchBehavior.onUpdate(touchPoints, layerGroup)) {
        this.#moved = true;
      }
      return;
    }
    const {point, layerGroup} = getPrimaryTouchLayerContext(event, this.#app);
    if (!this.#active) {
      this.#hoverBehavior?.onUpdate(point, layerGroup);
      return;
    }
    this.#dragBehavior.onUpdate(
      this.#dragStepFromTo(point, this.#prevPoint), layerGroup);
    this.#moved = true;
    this.#prevPoint = point;
  }

  /**
   * @param {TouchEvent} event The touch end event.
   */
  touchend(event) {
    this.#clearLongTouchTimer();
    if (typeof this.#tapBehavior !== 'undefined' &&
      !this.#moved) {
      const {point, layerGroup} = getPrimaryTouchLayerContext(event, this.#app);
      this.#tapBehavior.onTap(point, layerGroup);
    }
    this.#twoTouchBehavior?.onEnd();
    this.#endDrag();
  }

  /**
   * @param {MouseEvent|TouchEvent} event The event.
   * @param {function(Event): object} getContext Returns point and layerGroup.
   */
  #beginDrag(event, getContext) {
    const {point, layerGroup} = getContext(event);
    if (!this.#dragBehavior.canStart(point, layerGroup)) {
      return;
    }
    this.#dragBehavior.onStart(point, layerGroup);
    this.#moved = false;
    this.#active = true;
    this.#prevPoint = point;
  }

  /**
   * @param {Point2D} point Current position.
   * @param {Point2D} prevPoint Previous position.
   * @returns {DragStep} Drag step for the behaviour.
   */
  #dragStepFromTo(point, prevPoint) {
    return new DragStep(point, prevPoint);
  }

  #endDrag() {
    if (this.#active) {
      this.#dragBehavior.onEnd();
      this.#active = false;
      this.#prevPoint = null;
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
