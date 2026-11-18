import {
  WindowLevel as WindowLevelValues
} from '../../image/windowLevel.js';
import {
  getActiveOrDrawRefViewLayer,
  getActiveOrFirstMonochromeViewLayer
} from './utils.js';
import {logger} from '../../utils/logger.js';

/**
 * @import {DataController} from '../../app/dataController.js';
 * @import {LayerGroup} from '../../gui/layerGroup.js';
 * @import {Point2D} from '../../math/point.js';
 */

/**
 * Optional double-click handling for tools that forward `dblclick` into
 * `LayerGroupPointer.dblclick`.
 */
export class DoubleClickBehavior {

  /**
   * Handle a double-click at the given display position; override in
   * subclasses.
   *
   * @param {Point2D} _point The click position in display space.
   * @param {LayerGroup} _layerGroup The layer group under the pointer.
   */
  onDoubleClick(_point, _layerGroup) {
    // override in subclass
  }

}

/**
 * Double-click: set window center from the clicked pixel (monochrome only).
 */
export class WindowLevelDoubleClickBehavior extends DoubleClickBehavior {

  /**
   * @type {DataController}
   */
  #dataController;

  /**
   * If true, use only the active view layer; if false, resolve to the first
   * monochrome view layer among active layers.
   *
   * @type {boolean}
   */
  #activeViewLayerOnly;

  /**
   * @param {object} options Constructor options.
   * @param {DataController} options.dataController The data controller.
   * @param {boolean} [options.activeViewLayerOnly] Active view layer only.
   */
  constructor({dataController, activeViewLayerOnly = true}) {
    super();
    this.#dataController = dataController;
    this.#activeViewLayerOnly = activeViewLayerOnly;
  }

  /**
   * @param {boolean} activeViewLayerOnly Active view layer only.
   */
  setActiveViewLayerOnly(activeViewLayerOnly) {
    this.#activeViewLayerOnly = activeViewLayerOnly;
  }

  /**
   * @param {Point2D} point The click position in display space.
   * @param {LayerGroup} layerGroup The layer group under the pointer.
   * @override
   */
  onDoubleClick(point, layerGroup) {
    const viewLayer = getActiveOrFirstMonochromeViewLayer(
      layerGroup, this.#activeViewLayerOnly);
    if (typeof viewLayer === 'undefined') {
      return;
    }
    const index = viewLayer.displayToPlaneIndex(point);
    const viewController = viewLayer.getViewController();
    if (!viewController.isMonochrome()) {
      return;
    }

    const image = this.#dataController.get(viewLayer.getDataId()).image;
    const wl = new WindowLevelValues(
      image.getRescaledValueAtIndex(
        viewController.getCurrentIndex().getWithNew2D(
          index.get(0),
          index.get(1)
        )
      ),
      viewController.getWindowLevel().width
    );
    viewController.setWindowLevel(wl);
  }

}

/**
 * Double-click: start cine playback on the resolved view layer.
 */
export class PlayDoubleClickBehavior extends DoubleClickBehavior {

  /**
   * @param {Point2D} _point The click position (unused).
   * @param {LayerGroup} layerGroup The layer group under the pointer.
   * @override
   */
  onDoubleClick(_point, layerGroup) {
    const viewLayer = getActiveOrDrawRefViewLayer(layerGroup);
    if (typeof viewLayer === 'undefined') {
      logger.warn('No view layer to play double click behavior');
      return;
    }
    const viewController = viewLayer.getViewController();
    viewController.play();
  }

}
