import {
  WindowLevel as WindowLevelValues
} from '../../image/windowLevel.js';
import {
  getActiveOrDrawRefViewLayer,
  getActiveOrFirstMonochromeViewLayer
} from './utils.js';
import {logger} from '../../utils/logger.js';

/**
 * @import {App} from '../../app/application.js';
 * @import {LayerGroup} from '../../gui/layerGroup.js';
 * @import {Point2D} from '../../math/point.js';
 */

/**
 * Optional double-click handling for tools that forward `dblclick` into
 * `LayerGroupPointer.dblclick`.
 */
export class DoubleClickBehavior {

  /**
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
   * @type {App}
   */
  #app;

  /**
   * If true, use only the active view layer; if false, resolve to the first
   * monochrome view layer among active layers.
   *
   * @type {boolean}
   */
  #activeViewLayerOnly;

  /**
   * @param {object} options Constructor options.
   * @param {App} options.app The application.
   * @param {boolean} [options.activeViewLayerOnly] Active view layer only.
   */
  constructor({app, activeViewLayerOnly = true}) {
    super();
    this.#app = app;
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

    const image = this.#app.getData(viewLayer.getDataId()).image;
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
