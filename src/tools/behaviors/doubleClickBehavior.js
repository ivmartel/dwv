import {
  WindowLevel as WindowLevelValues
} from '../../image/windowLevel.js';
import {logger} from '../../utils/logger.js';

// doc imports
/* eslint-disable no-unused-vars */
import {App} from '../../app/application.js';
import {LayerGroup} from '../../gui/layerGroup.js';
import {Point2D} from '../../math/point.js';
import {ViewLayer} from '../../gui/viewLayer.js';
/* eslint-enable no-unused-vars */

/**
 * Optional double-click handling for tools that forward `dblclick` into
 * `LayerGroupPointer.handleDoubleClick`.
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
   * Strict view layer flag: if true, use the active layer
   * (that could be undefined, ie bail) or, if false,
   * try to find the active monochrome view layer.
   *
   * @type {boolean}
   */
  #strictViewLayer;

  /**
   * @param {object} options Constructor options.
   * @param {App} options.app The application.
   * @param {boolean} [options.strictViewLayer] Strict active layer mode.
   */
  constructor({app, strictViewLayer = true} = {}) {
    super();
    this.#app = app;
    this.#strictViewLayer = strictViewLayer;
  }

  /**
   * @param {boolean} strictViewLayer Strict active layer mode.
   */
  setStrictViewLayer(strictViewLayer) {
    this.#strictViewLayer = strictViewLayer;
  }

  /**
   * @param {LayerGroup} layerGroup The layer group of the view layer.
   * @returns {ViewLayer|undefined} The layer.
   */
  #getActiveViewLayer(layerGroup) {
    let layer;
    if (this.#strictViewLayer) {
      layer = layerGroup.getActiveViewLayer();
    } else {
      const callbackFn = function (cbLayer) {
        return cbLayer.getViewController().isMonochrome();
      };
      layer = layerGroup.getViewLayersFromActive(callbackFn)[0];
    }
    return layer;
  }

  /**
   * @param {Point2D} point The click position in display space.
   * @param {LayerGroup} layerGroup The layer group under the pointer.
   */
  onDoubleClick(point, layerGroup) {
    const viewLayer = this.#getActiveViewLayer(layerGroup);
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
   * @param {LayerGroup} layerGroup The layer group to search.
   * @returns {ViewLayer|undefined} The view layer.
   */
  #getViewLayer(layerGroup) {
    let viewLayer = layerGroup.getActiveViewLayer();
    if (typeof viewLayer === 'undefined') {
      const drawLayer = layerGroup.getActiveDrawLayer();
      if (typeof drawLayer === 'undefined') {
        logger.warn('No draw layer to do scroll');
        return;
      }
      viewLayer = layerGroup.getViewLayerById(
        drawLayer.getReferenceLayerId());
    }
    return viewLayer;
  }

  /**
   * @param {Point2D} _point The click position (unused).
   * @param {LayerGroup} layerGroup The layer group under the pointer.
   */
  onDoubleClick(_point, layerGroup) {
    const viewLayer = this.#getViewLayer(layerGroup);
    if (typeof viewLayer !== 'undefined') {
      const viewController = viewLayer.getViewController();
      viewController.play();
    }
  }

}
