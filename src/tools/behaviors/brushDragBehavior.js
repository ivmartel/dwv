import {logger} from '../../utils/logger.js';
import {ViewLayer} from '../../gui/viewLayer.js';
import {ERROR_MESSAGES} from './brushPaintMessages.js';
import {BrushMode, BrushMaskPaint} from './brushMaskPaint.js';
import {DragBehavior} from './dragBehavior.js';
import {MouseEventButtons} from '../layerGroupPointer.js';

/**
 * Event types from {@link BrushMaskPaint} forwarded by this behavior.
 */
const BRUSH_MASK_FORWARD_EVENT_TYPES = [
  'brushsizechange',
  'brushdraw',
  'brushremove'
];

/**
 * @import {LayerGroup} from '../../gui/layerGroup.js';
 * @import {App} from '../../app/application.js';
 * @import {Point2D} from '../../math/point.js';
 * @import {DragPointerStartContext, DragStep} from './dragBehavior.js';
 */

/**
 * Brush painting as a {@link DragBehavior} for {@link LayerGroupPointer}.
 */
export class BrushDragBehavior extends DragBehavior {

  /**
   * @type {App}
   */
  #app;

  /**
   * @type {BrushMaskPaint}
   */
  #maskPaint;

  /**
   * Set when this stroke began with the right button (temporary eraser UI).
   * With {@link #deactivateErasingModeIfDel}, keyboard delete mode is kept
   * across strokes; pointer-up never uses `event.button`.
   *
   * @type {boolean}
   */
  #eraserFromRightButtonStroke = false;

  /**
   * Series Instance UIDs where brush segmentation creation is forbidden.
   *
   * @type {string[]}
   */
  #blacklist = [];

  /**
   * @param {App} app The associated application.
   */
  constructor(app) {
    super();
    this.#app = app;
    this.#maskPaint = new BrushMaskPaint({app});
    // forward brush mask paint events to this behavior
    for (const type of BRUSH_MASK_FORWARD_EVENT_TYPES) {
      this.#maskPaint.addEventListener(type, (e) => {
        const ce = /** @type {CustomEvent} */ (e);
        this.dispatchEvent(new CustomEvent(type, {detail: ce.detail}));
      });
    }
  }

  /**
   * @param {object} features Subset of {@link Brush#setFeatures}; brush-only
   *   `blacklist` is stored here, the rest is forwarded to
   *   {@link BrushMaskPaint#setFeatures}.
   */
  setFeatures(features) {
    if (typeof features.blacklist !== 'undefined') {
      this.#blacklist = features.blacklist;
    }
    this.#maskPaint.setFeatures(features);
  }

  /**
   * @param {Point2D} _point The pointer position.
   * @param {LayerGroup} layerGroup The layer group under the pointer.
   * @returns {boolean} Whether painting may begin.
   * @override
   */
  canStart(_point, layerGroup) {
    if (!this.#activeLayerIsViewLayerForGroup(layerGroup) ||
      this.#isInBlackListForGroup(layerGroup)) {
      return false;
    }
    if (typeof this.#maskPaint.getSelectedSegmentNumber() === 'undefined') {
      logger.warn(ERROR_MESSAGES.brush.noSelectedSegmentNumber);
      return false;
    }
    return true;
  }

  /**
   * @param {Point2D} point The pointer position at drag start.
   * @param {LayerGroup} layerGroup The layer group under the pointer.
   * @param {DragPointerStartContext|undefined} pointerStart Mouse/touch
   *   context from {@link LayerGroupPointer}.
   * @override
   */
  onStart(point, layerGroup, pointerStart) {
    super.onStart(point, layerGroup, pointerStart);

    const halfBrush = this.#maskPaint.getBrushSize() / 2;
    this.setDragThreshold({x: halfBrush, y: halfBrush});

    this.#eraserFromRightButtonStroke = false;
    if (pointerStart?.mouseDownButton === MouseEventButtons.right) {
      this.#setEraserModeForRightButton();
    }

    if (!this.#beginStroke(point, layerGroup)) {
      super.onEnd();
    }
  }

  /**
   * @param {DragStep} _drag Unused (threshold already applied in
   *   {@link DragBehavior#onUpdate}).
   * @param {LayerGroup} layerGroup The layer group under the pointer.
   * @override
   */
  onDrag(_drag, layerGroup) {
    const point = this.prevPoint;
    if (point === undefined) {
      return;
    }
    this.#paintStep(point, layerGroup);
  }

  /**
   * Finalize stroke buffers or delegate reset when the drag never activated.
   *
   * @override
   */
  onEnd() {
    if (this.isActive()) {
      this.#endStroke();
    }
    super.onEnd();
  }

  /**
   * @param {Point2D} point Pointer position at stroke start.
   * @param {LayerGroup} layerGroup The layer group.
   * @returns {boolean} False when first dab produced no offsets (drag
   *   aborted).
   */
  #beginStroke(point, layerGroup) {
    if (this.#maskPaint.beginStroke(point, layerGroup)) {
      return true;
    }
    this.#deactivateErasingModeIfDel();
    return false;
  }

  /**
   * @param {Point2D} point Current pointer position.
   * @param {LayerGroup} layerGroup The layer group under the pointer.
   */
  #paintStep(point, layerGroup) {
    this.#maskPaint.paintStep(point, layerGroup);
  }

  #endStroke() {
    this.#deactivateErasingModeIfDel();
    this.#maskPaint.finalizeStroke();
  }

  /**
   * @param {LayerGroup} layerGroup The layer group.
   * @returns {boolean} True if active layer is a view layer.
   */
  #activeLayerIsViewLayerForGroup(layerGroup) {
    if (typeof layerGroup === 'undefined') {
      throw new Error('No layergroup to check for view layer');
    }
    const layer = layerGroup.getActiveLayer();
    return layer instanceof ViewLayer;
  }

  /**
   * @param {LayerGroup} layerGroup The layer group.
   * @returns {boolean} True if series is blacklisted.
   */
  #isInBlackListForGroup(layerGroup) {
    if (typeof layerGroup === 'undefined') {
      throw new Error('No layergroup to check black list');
    }
    const drawLayer = layerGroup.getActiveDrawLayer();
    if (typeof drawLayer === 'undefined') {
      const viewLayer = layerGroup.getActiveViewLayer();
      const referenceDataId = viewLayer.getDataId();
      const dataCtrl = this.#app.getDataController();
      const referenceData = dataCtrl.get(referenceDataId);
      const referenceMeta = referenceData.image.getMeta();
      const seriesInstanceUID = referenceMeta.SeriesInstanceUID;
      if (this.#blacklist.includes(seriesInstanceUID)) {
        return true;
      }
    }
    return false;
  }

  #setEraserModeForRightButton() {
    this.#eraserFromRightButtonStroke = true;
    this.#maskPaint.setBrushMode(BrushMode.Del);
    this.dispatchEvent(new CustomEvent('erasingactivated'));
  }

  /**
   * End temporary right-button eraser using mode + session state, not
   * pointer-up `button` (unreliable for touch / synthetic events). Keyboard
   * delete is unchanged because {@link #eraserFromRightButtonStroke} stays
   * false for those strokes.
   */
  #deactivateErasingModeIfDel() {
    if (this.#eraserFromRightButtonStroke &&
      this.#maskPaint.getBrushMode() === BrushMode.Del) {
      this.#maskPaint.setBrushMode(BrushMode.Add);
      this.dispatchEvent(new CustomEvent('erasingdeactivated'));
    }
    this.#eraserFromRightButtonStroke = false;
  }
}
