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
import {DoubleClickBehavior} from './behaviors/doubleClickBehavior.js';
/* eslint-enable no-unused-vars */

/**
 * Mouse position and layer group from a DOM event targeting a view layer.
 *
 * @param {MouseEvent} event The mouse event.
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
 * @property {(point: Point2D, layerGroup: LayerGroup) => boolean} [canStart]
 *   Whether a drag may begin (monochrome, view layer, …).
 * @property {DragBehavior} dragBehavior Drag behaviour.
 * @property {HoverBehavior} [hoverBehavior] Hover behaviour
 *   (e.g. `TooltipHoverBehavior`).
 * @property {WheelBehavior} [wheelBehavior] Mouse wheel handling.
 * @property {DoubleClickBehavior} [doubleClickBehavior]
 *   Double-click handling.
 */

/**
 * Normalises layer mouse/touch input into a single-pointer drag lifecycle.
 * Computes per-move deltas and passes a {@link DragStep} and
 * `layerGroup` to `onDragMove`.
 *
 * Tools keep their public API (`mousedown`, `mousemove`, `wheel`,
 * `dblclick`, …) and forward to this class.
 */
export class LayerGroupPointer {

  /**
   * @type {App}
   */
  #app;

  /**
   * @type {(point: Point2D, layerGroup: LayerGroup) => boolean}
   */
  #canStart;

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
   * @type {DoubleClickBehavior|undefined}
   */
  #doubleClickBehavior;

  /**
   * @type {boolean}
   */
  #active = false;

  /**
   * @type {Point2D|null}
   */
  #prevPoint = null;

  /**
   * @param {LayerGroupPointerOptions} options
   */
  constructor({
    app,
    canStart,
    dragBehavior,
    hoverBehavior,
    wheelBehavior,
    doubleClickBehavior
  }) {
    this.#app = app;
    this.#dragBehavior = dragBehavior;
    this.#hoverBehavior = hoverBehavior;
    this.#wheelBehavior = wheelBehavior;
    this.#doubleClickBehavior = doubleClickBehavior;
    this.#canStart = canStart || ((point, layerGroup) =>
      this.#dragBehavior.canStart(point, layerGroup));
  }

  /**
   * @param {WheelEvent} event The mouse wheel event.
   */
  handleWheel(event) {
    this.#wheelBehavior?.wheel(event);
  }

  /**
   * @param {MouseEvent} event The double click event.
   */
  handleDoubleClick(event) {
    const {point, layerGroup} = getMouseLayerContext(event, this.#app);
    this.#doubleClickBehavior?.onDoubleClick(point, layerGroup);
  }

  /**
   * End drag if active; does not call onDragEnd if already idle.
   */
  cancel() {
    this.#endDrag();
    this.#endHover();
  }

  /**
   * @param {MouseEvent} event The mouse down event.
   */
  handleMouseDown(event) {
    this.#endHover();
    this.#beginDrag(event, (e) => getMouseLayerContext(e, this.#app));
  }

  /**
   * @param {MouseEvent} event The mouse move event.
   */
  handleMouseMove(event) {
    const {point, layerGroup} = getMouseLayerContext(event, this.#app);
    if (!this.#active) {
      this.#hoverBehavior?.onHoverMove(point, layerGroup);
      return;
    }
    this.#dragBehavior.onDragMove(
      this.#dragStepFromTo(point, this.#prevPoint), layerGroup);
    this.#prevPoint = point;
  }

  /**
   * @param {MouseEvent} _event The mouse up event.
   */
  handleMouseUp(_event) {
    this.#endDrag();
  }

  /**
   * @param {MouseEvent} _event The mouse out event.
   */
  handleMouseOut(_event) {
    this.#endDrag();
    this.#endHover();
  }

  /**
   * @param {TouchEvent} event The touch start event.
   */
  handleTouchStart(event) {
    this.#endHover();
    this.#beginDrag(event, (e) => getPrimaryTouchLayerContext(e, this.#app));
  }

  /**
   * @param {TouchEvent} event The touch move event.
   */
  handleTouchMove(event) {
    const {point, layerGroup} = getPrimaryTouchLayerContext(event, this.#app);
    if (!this.#active) {
      this.#hoverBehavior?.onHoverMove(point, layerGroup);
      return;
    }
    this.#dragBehavior.onDragMove(
      this.#dragStepFromTo(point, this.#prevPoint), layerGroup);
    this.#prevPoint = point;
  }

  /**
   * @param {TouchEvent} _event The touch end event.
   */
  handleTouchEnd(_event) {
    this.#endDrag();
  }

  /**
   * @param {MouseEvent|TouchEvent} event The event.
   * @param {function(Event): object} getContext Returns point and layerGroup.
   */
  #beginDrag(event, getContext) {
    const {point, layerGroup} = getContext(event);
    if (!this.#canStart(point, layerGroup)) {
      return;
    }
    this.#dragBehavior.onDragBegin(point, layerGroup);
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
      this.#dragBehavior.onDragEnd();
      this.#active = false;
      this.#prevPoint = null;
    }
  }

  #endHover() {
    this.#hoverBehavior?.onHoverEnd();
  }

}
