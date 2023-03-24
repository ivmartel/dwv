import {Point, Point3D} from '../math/point';
import {LayerGroup} from './layerGroup';

/**
 * Window/level binder.
 */
export class WindowLevelBinder {
  getEventType = function () {
    return 'wlchange';
  };
  getCallback = function (layerGroup) {
    return function (event) {
      var viewLayers = layerGroup.getViewLayersByDataIndex(event.dataid);
      if (viewLayers.length !== 0) {
        var vc = viewLayers[0].getViewController();
        vc.setWindowLevel(event.value[0], event.value[1]);
      }
    };
  };
}

/**
 * Position binder.
 */
export class PositionBinder {
  getEventType = function () {
    return 'positionchange';
  };
  getCallback = function (layerGroup) {
    return function (event) {
      var pointValues = event.value[1];
      var vc = layerGroup.getActiveViewLayer().getViewController();
      // handle different number of dimensions
      var currentPos = vc.getCurrentPosition();
      var currentDims = currentPos.length();
      var inputDims = pointValues.length;
      if (inputDims !== currentDims) {
        if (inputDims === currentDims - 1) {
          // add missing dim, for ex: input 3D -> current 4D
          pointValues.push(currentPos.get(currentDims - 1));
        } else if (inputDims === currentDims + 1) {
          // remove extra dim, for ex: input 4D -> current 3D
          pointValues.pop();
        }
      }
      vc.setCurrentPosition(new Point(pointValues));
    };
  };
}

/**
 * Zoom binder.
 */
export class ZoomBinder {
  getEventType = function () {
    return 'zoomchange';
  };
  getCallback = function (layerGroup) {
    return function (event) {
      var scale = {
        x: event.value[0],
        y: event.value[1],
        z: event.value[2]
      };
      var center;
      if (event.value.length === 6) {
        center = new Point3D(
          event.value[3],
          event.value[4],
          event.value[5]
        );
      }
      layerGroup.setScale(scale, center);
      layerGroup.draw();
    };
  };
}

/**
 * Offset binder.
 */
export class OffsetBinder {
  getEventType = function () {
    return 'offsetchange';
  };
  getCallback = function (layerGroup) {
    return function (event) {
      layerGroup.setOffset({
        x: event.value[0],
        y: event.value[1],
        z: event.value[2]
      });
      layerGroup.draw();
    };
  };
}

/**
 * Opacity binder. Only propagates to view layers of the same data.
 */
export class OpacityBinder {
  getEventType = function () {
    return 'opacitychange';
  };
  getCallback = function (layerGroup) {
    return function (event) {
      // exit if no data index
      if (typeof event.dataid === 'undefined') {
        return;
      }
      // propagate to first view layer
      var viewLayers = layerGroup.getViewLayersByDataIndex(event.dataid);
      if (viewLayers.length !== 0) {
        viewLayers[0].setOpacity(event.value);
        viewLayers[0].draw();
      }
    };
  };
}

export const BinderList = {
  WindowLevelBinder,
  PositionBinder,
  ZoomBinder,
  OffsetBinder,
  OpacityBinder
};

/**
 * Stage: controls a list of layer groups and their
 * synchronisation.
 *
 * @class
 */
export class Stage {

  // associated layer groups
  #layerGroups = [];
  // active layer group index
  #activeLayerGroupIndex = null;

  // layer group binders
  #binders = [];
  // binder callbacks
  #callbackStore = null;

  /**
   * Get the layer group at the given index.
   *
   * @param {number} index The index.
   * @returns {LayerGroup} The layer group.
   */
  getLayerGroup(index) {
    return this.#layerGroups[index];
  }

  /**
   * Get the number of layer groups that form the stage.
   *
   * @returns {number} The number of layer groups.
   */
  getNumberOfLayerGroups() {
    return this.#layerGroups.length;
  }

  /**
   * Get the active layer group.
   *
   * @returns {LayerGroup} The layer group.
   */
  getActiveLayerGroup() {
    return this.getLayerGroup(this.#activeLayerGroupIndex);
  }

  /**
   * Get the view layers associated to a data index.
   *
   * @param {number} index The data index.
   * @returns {Array} The layers.
   */
  getViewLayersByDataIndex(index) {
    var res = [];
    for (var i = 0; i < this.#layerGroups.length; ++i) {
      res = res.concat(this.#layerGroups[i].getViewLayersByDataIndex(index));
    }
    return res;
  }

  /**
   * Get the draw layers associated to a data index.
   *
   * @param {number} index The data index.
   * @returns {Array} The layers.
   */
  getDrawLayersByDataIndex(index) {
    var res = [];
    for (var i = 0; i < this.#layerGroups.length; ++i) {
      res = res.concat(this.#layerGroups[i].getDrawLayersByDataIndex(index));
    }
    return res;
  }

  /**
   * Add a layer group to the list.
   *
   * @param {object} htmlElement The HTML element of the layer group.
   * @returns {LayerGroup} The newly created layer group.
   */
  addLayerGroup(htmlElement) {
    this.#activeLayerGroupIndex = this.#layerGroups.length;
    var layerGroup = new LayerGroup(htmlElement);
    // add to storage
    var isBound = this.#callbackStore && this.#callbackStore.length !== 0;
    if (isBound) {
      this.unbindLayerGroups();
    }
    this.#layerGroups.push(layerGroup);
    if (isBound) {
      this.bindLayerGroups();
    }
    // return created group
    return layerGroup;
  }

  /**
   * Get a layer group from an HTML element id.
   *
   * @param {string} id The element id to find.
   * @returns {LayerGroup} The layer group.
   */
  getLayerGroupByDivId(id) {
    return this.#layerGroups.find(function (item) {
      return item.getDivId() === id;
    });
  }

  /**
   * Set the layer groups binders.
   *
   * @param {Array} list The list of binder objects.
   */
  setBinders(list) {
    if (typeof list === 'undefined' || list === null) {
      throw new Error('Cannot set null or undefined binders');
    }
    if (this.#binders.length !== 0) {
      this.unbindLayerGroups();
    }
    this.#binders = list.slice();
    this.bindLayerGroups();
  }

  /**
   * Empty the layer group list.
   */
  empty() {
    this.unbindLayerGroups();
    for (var i = 0; i < this.#layerGroups.length; ++i) {
      this.#layerGroups[i].empty();
    }
    this.#layerGroups = [];
    this.#activeLayerGroupIndex = null;
  }

  /**
   * Reset the stage: calls reset on all layer groups.
   */
  reset() {
    for (var i = 0; i < this.#layerGroups.length; ++i) {
      this.#layerGroups[i].reset();
    }
  }

  /**
   * Draw the stage: calls draw on all layer groups.
   */
  draw() {
    for (var i = 0; i < this.#layerGroups.length; ++i) {
      this.#layerGroups[i].draw();
    }
  }

  /**
   * Synchronise the fit scale of the group layers.
   */
  syncLayerGroupScale() {
    var minScale;
    var hasScale = [];
    for (var i = 0; i < this.#layerGroups.length; ++i) {
      var scale = this.#layerGroups[i].calculateFitScale();
      if (typeof scale !== 'undefined') {
        hasScale.push(i);
        if (typeof minScale === 'undefined' || scale < minScale) {
          minScale = scale;
        }
      }
    }
    // exit if no scale
    if (typeof minScale === 'undefined') {
      return;
    }
    // apply min scale to layers
    for (var j = 0; j < this.#layerGroups.length; ++j) {
      if (hasScale.includes(j)) {
        this.#layerGroups[j].setFitScale(minScale);
      }
    }
  }

  /**
   * Bind the layer groups of the stage.
   */
  bindLayerGroups() {
    if (this.#layerGroups.length === 0 ||
      this.#layerGroups.length === 1 ||
      this.#binders.length === 0) {
      return;
    }
    // create callback store
    this.#callbackStore = new Array(this.#layerGroups.length);
    // add listeners
    for (var i = 0; i < this.#layerGroups.length; ++i) {
      for (var j = 0; j < this.#binders.length; ++j) {
        this.#addEventListeners(i, this.#binders[j]);
      }
    }
  }

  /**
   * Unbind the layer groups of the stage.
   */
  unbindLayerGroups() {
    if (this.#layerGroups.length === 0 ||
      this.#layerGroups.length === 1 ||
      this.#binders.length === 0 ||
      !this.#callbackStore) {
      return;
    }
    // remove listeners
    for (var i = 0; i < this.#layerGroups.length; ++i) {
      for (var j = 0; j < this.#binders.length; ++j) {
        this.#removeEventListeners(i, this.#binders[j]);
      }
    }
    // clear callback store
    this.#callbackStore = null;
  }

  /**
   * Get the binder callback function for a given layer group index.
   * The function is created if not yet stored.
   *
   * @param {object} binder The layer binder.
   * @param {number} index The index of the associated layer group.
   * @returns {Function} The binder function.
   */
  #getBinderCallback(binder, index) {
    if (typeof this.#callbackStore[index] === 'undefined') {
      this.#callbackStore[index] = [];
    }
    var store = this.#callbackStore[index];
    var binderObj = store.find(function (elem) {
      return elem.binder === binder;
    });
    if (typeof binderObj === 'undefined') {
      // create new callback object
      binderObj = {
        binder: binder,
        callback: (event) => {
          // stop listeners
          this.#removeEventListeners(index, binder);
          // apply binder
          binder.getCallback(this.#layerGroups[index])(event);
          // re-start listeners
          this.#addEventListeners(index, binder);
        }
      };
      this.#callbackStore[index].push(binderObj);
    }
    return binderObj.callback;
  }

  /**
   * Add event listeners for a given layer group index and binder.
   *
   * @param {number} index The index of the associated layer group.
   * @param {object} binder The layer binder.
   */
  #addEventListeners(index, binder) {
    for (var i = 0; i < this.#layerGroups.length; ++i) {
      if (i !== index) {
        this.#layerGroups[index].addEventListener(
          binder.getEventType(),
          this.#getBinderCallback(binder, i)
        );
      }
    }
  }

  /**
   * Remove event listeners for a given layer group index and binder.
   *
   * @param {number} index The index of the associated layer group.
   * @param {object} binder The layer binder.
   */
  #removeEventListeners(index, binder) {
    for (var i = 0; i < this.#layerGroups.length; ++i) {
      if (i !== index) {
        this.#layerGroups[index].removeEventListener(
          binder.getEventType(),
          this.#getBinderCallback(binder, i)
        );
      }
    }
  }

} // class Stage
