import {logger} from '../../utils/logger.js';
import {Point2D} from '../../math/point.js';
import {getActiveOrDrawRefViewLayer} from './utils.js';

/**
 * @import {LayerGroup} from '../../gui/layerGroup.js';
 */

/**
 * Tap hit tolerance, in display pixels.
 *
 * @type {number}
 */
const TAP_TOLERANCE = 5;

/**
 * Tap (no drag move): subclasses implement {@link TapBehavior#onTap}.
 * Extends {@link EventTarget} so tap-driven tools can emit and forward events.
 */
export class TapBehavior extends EventTarget {

  /**
   * Tap points. Reset to empty array on the tap after
   * the last previous tap.
   *
   * @type {Point2D[]}
   */
  #points = [];

  /**
   * @type {number}
   */
  #numberOfTaps = 1;

  /**
   * Set how many taps complete a session; clears any in-progress points.
   *
   * @param {number} numberOfTaps The number of taps.
   */
  setNumberOfTaps(numberOfTaps) {
    this.#points = [];
    this.#numberOfTaps = numberOfTaps;
  }

  /**
   * @returns {boolean} True when at least one tap point has been recorded and
   *   the session is not yet complete.
   */
  isActive() {
    return this.#points.length !== 0;
  }

  /**
   * Clear tap session state (committed points).
   */
  reset() {
    this.#points = [];
  }

  /**
   * Committed tap points (copy).
   *
   * @returns {Point2D[]} Display-space points accumulated for this tap session.
   */
  getPointList() {
    return this.#points.slice();
  }

  /**
   * Pointer move while a tap session may be active; default
   * implementation does nothing.
   *
   * @param {Point2D} _point Display position.
   * @param {LayerGroup} _layerGroup The layer group.
   */
  onUpdate(_point, _layerGroup) {
    // default is no-op
  }

  /**
   * Record one tap; ends the session when {@link setNumberOfTaps} is reached
   * by calling {@link TapBehavior#onEnd}.
   *
   * @param {Point2D} point Display position under the pointer.
   * @param {LayerGroup} _layerGroup Layer group under the pointer.
   */
  onTap(point, _layerGroup) {
    // add the current point
    this.#points.push(point);
    // call onEnd if the number of taps is at limit
    if (this.#points.length === this.#numberOfTaps) {
      this.onEnd();
    }
  }

  /**
   * End the tap session and reset.
   */
  onEnd() {
    // isActive returns false after this
    this.#points = [];
    // reset
    this.reset();
  }
}

/**
 * Tap hit result for an annotation.
 *
 * @typedef {object} AnnotationTapHit
 * @property {string} annotationid The annotation tracking UID.
 * @property {string} dataid The annotation group data id.
 */

/**
 * Tap hit result for a segmentation.
 *
 * @typedef {object} SegmentationTapHit
 * @property {string} dataid The segmentation data id.
 * @property {number[]} segmentnumbers The numbers of the segments
 *   under the tap (several if segments overlap).
 */

/**
 * Tap sets the current slice/index from the display position (plane point).
 * It then emits a `tap` event, on every tap, with as detail:
 * - `position`: the tapped position values,
 * - `annotations`: an {@link AnnotationTapHit} for the top most
 *   annotation under the tap, one per draw layer with a hit,
 * - `segments`: a {@link SegmentationTapHit} per mask view layer with
 *   segments under the tap.
 * Empty `annotations` and `segments` mean that nothing was hit, for
 * example to reset a selection.
 */
export class PositionSetTapBehavior extends TapBehavior {

  /**
   * Set stack position from the tapped display point (plane coordinates)
   *   and emit the `tap` event.
   *
   * @param {Point2D} point Display position.
   * @param {LayerGroup} layerGroup The layer group.
   * @override
   */
  onTap(point, layerGroup) {
    super.onTap(point, layerGroup);

    const viewLayer = getActiveOrDrawRefViewLayer(layerGroup);
    if (typeof viewLayer === 'undefined') {
      logger.warn('No view layer to set current position');
      return;
    }

    const viewController = viewLayer.getViewController();
    const planePos = viewLayer.displayToPlanePos(point);
    const position = viewController.getPositionFromPlanePoint(planePos);
    viewController.setCurrentPosition(position);

    this.dispatchEvent(new CustomEvent('tap', {
      detail: {
        position: position.getValues(),
        annotations: this.#getAnnotationHits(point, layerGroup),
        segments: this.#getSegmentationHits(point, layerGroup)
      }
    }));
  }

  /**
   * Get the top most annotation under the input point for each
   *   visible draw layer.
   *
   * @param {Point2D} point Display position.
   * @param {LayerGroup} layerGroup The layer group.
   * @returns {AnnotationTapHit[]} The hits, empty if none.
   */
  #getAnnotationHits(point, layerGroup) {
    const hits = [];
    for (const drawLayer of layerGroup.getDrawLayers()) {
      if (!drawLayer.isVisible()) {
        continue;
      }
      const refViewLayer = layerGroup.getViewLayerById(
        drawLayer.getReferenceLayerId());
      if (typeof refViewLayer === 'undefined') {
        continue;
      }
      const planePos = refViewLayer.displayToPlanePos(point);
      const tolerance = refViewLayer.displayToPlaneScale(
        new Point2D(TAP_TOLERANCE, TAP_TOLERANCE)).getX();
      const annotation = drawLayer.getAnnotationAt(planePos, tolerance);
      if (typeof annotation !== 'undefined') {
        hits.push({
          annotationid: annotation.trackingUid,
          dataid: drawLayer.getDataId()
        });
      }
    }
    return hits;
  }

  /**
   * Get the segments under the input point for each visible
   *   mask view layer.
   *
   * @param {Point2D} point Display position.
   * @param {LayerGroup} layerGroup The layer group.
   * @returns {SegmentationTapHit[]} The hits, empty if none.
   */
  #getSegmentationHits(point, layerGroup) {
    const hits = [];
    const maskViewLayers = layerGroup.getViewLayers(
      (layer) => layer.isVisible() && layer.getViewController().isMask());
    for (const maskViewLayer of maskViewLayers) {
      const viewController = maskViewLayer.getViewController();
      const planePos = maskViewLayer.displayToPlanePos(point);
      const position = viewController.getPositionFromPlanePoint(planePos);
      const segmentNumbers =
        viewController.getSegmentNumbersAtPosition(position);
      if (segmentNumbers.length !== 0) {
        hits.push({
          dataid: maskViewLayer.getDataId(),
          segmentnumbers: segmentNumbers
        });
      }
    }
    return hits;
  }

}
