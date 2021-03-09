// namespaces
var dwv = dwv || {};
dwv.tool = dwv.tool || {};
/**
 * The Konva namespace.
 *
 * @external Konva
 * @see https://konvajs.org/
 */
var Konva = Konva || {};

/**
 * Get the default anchor shape.
 *
 * @param {number} x The X position.
 * @param {number} y The Y position.
 * @param {string} id The shape id.
 * @param {object} style The application style.
 * @returns {object} The default anchor shape.
 */
dwv.tool.draw.getDefaultAnchor = function (x, y, id, style) {
  return new Konva.Ellipse({
    x: x,
    y: y,
    stroke: '#999',
    fill: 'rgba(100,100,100,0.7',
    strokeWidth: style.getStrokeWidth(),
    strokeScaleEnabled: false,
    radius: style.applyZoomScale(3),
    name: 'anchor',
    id: id,
    dragOnTop: false,
    draggable: true,
    visible: false
  });
};

/**
 * Shape editor.
 *
 * @param {object} app The associated application.
 * @class
 */
dwv.tool.ShapeEditor = function (app) {
  /**
   * Shape factory list
   *
   * @type {object}
   * @private
   */
  var shapeFactoryList = null;
  /**
   * Current shape factory.
   *
   * @type {object}
   * @private
   */
  var currentFactory = null;
  /**
   * Edited shape.
   *
   * @private
   * @type {object}
   */
  var shape = null;
  /**
   * Edited view controller. Used for quantification update.
   *
   * @private
   * @type {object}
   */
  var viewController = null;
  /**
   * Active flag.
   *
   * @private
   * @type {boolean}
   */
  var isActive = false;
  /**
   * Draw event callback.
   *
   * @private
   * @type {Function}
   */
  var drawEventCallback = null;

  /**
   * Set the tool options.
   *
   * @param {Array} list The list of shape classes.
   */
  this.setFactoryList = function (list) {
    shapeFactoryList = list;
  };

  /**
   * Set the shape to edit.
   *
   * @param {object} inshape The shape to edit.
   */
  this.setShape = function (inshape) {
    shape = inshape;
    if (shape) {
      // remove old anchors
      removeAnchors();
      // find a factory for the input shape
      var group = shape.getParent();
      var keys = Object.keys(shapeFactoryList);
      currentFactory = null;
      for (var i = 0; i < keys.length; ++i) {
        var factory = new shapeFactoryList[keys[i]];
        if (factory.isFactoryGroup(group)) {
          currentFactory = factory;
          // stop at first find
          break;
        }
      }
      if (currentFactory === null) {
        throw new Error('Could not find a factory to update shape.');
      }
      // add new anchors
      addAnchors();
    }
  };

  /**
   * Set the associated image.
   *
   * @param {object} vc The associated view controller.
   */
  this.setViewController = function (vc) {
    viewController = vc;
  };

  /**
   * Get the edited shape.
   *
   * @returns {object} The edited shape.
   */
  this.getShape = function () {
    return shape;
  };

  /**
   * Get the active flag.
   *
   * @returns {boolean} The active flag.
   */
  this.isActive = function () {
    return isActive;
  };

  /**
   * Set the draw event callback.
   *
   * @param {object} callback The callback.
   */
  this.setDrawEventCallback = function (callback) {
    drawEventCallback = callback;
  };

  /**
   * Enable the editor. Redraws the layer.
   */
  this.enable = function () {
    isActive = true;
    if (shape) {
      setAnchorsVisible(true);
      if (shape.getLayer()) {
        shape.getLayer().draw();
      }
    }
  };

  /**
   * Disable the editor. Redraws the layer.
   */
  this.disable = function () {
    isActive = false;
    if (shape) {
      setAnchorsVisible(false);
      if (shape.getLayer()) {
        shape.getLayer().draw();
      }
    }
  };

  /**
   * Reset the anchors.
   */
  this.resetAnchors = function () {
    // remove previous controls
    removeAnchors();
    // add anchors
    addAnchors();
    // set them visible
    setAnchorsVisible(true);
  };

  /**
   * Apply a function on all anchors.
   *
   * @param {object} func A f(shape) function.
   * @private
   */
  function applyFuncToAnchors(func) {
    if (shape && shape.getParent()) {
      var anchors = shape.getParent().find('.anchor');
      anchors.each(func);
    }
  }

  /**
   * Set anchors visibility.
   *
   * @param {boolean} flag The visible flag.
   * @private
   */
  function setAnchorsVisible(flag) {
    applyFuncToAnchors(function (anchor) {
      anchor.visible(flag);
    });
  }

  /**
   * Set anchors active.
   *
   * @param {boolean} flag The active (on/off) flag.
   */
  this.setAnchorsActive = function (flag) {
    var func = null;
    if (flag) {
      func = function (anchor) {
        setAnchorOn(anchor);
      };
    } else {
      func = function (anchor) {
        setAnchorOff(anchor);
      };
    }
    applyFuncToAnchors(func);
  };

  /**
   * Remove anchors.
   *
   * @private
   */
  function removeAnchors() {
    applyFuncToAnchors(function (anchor) {
      anchor.remove();
    });
  }

  /**
   * Add the shape anchors.
   *
   * @private
   */
  function addAnchors() {
    // exit if no shape or no layer
    if (!shape || !shape.getLayer()) {
      return;
    }
    // get shape group
    var group = shape.getParent();

    // activate and add anchors to group
    var anchors = currentFactory.getAnchors(shape, app.getStyle());
    for (var i = 0; i < anchors.length; ++i) {
      // set anchor on
      setAnchorOn(anchors[i]);
      // add the anchor to the group
      group.add(anchors[i]);
    }
  }

  /**
   * Get a simple clone of the input anchor.
   *
   * @param {object} anchor The anchor to clone.
   * @returns {object} A clone of the input anchor.
   * @private
   */
  function getClone(anchor) {
    // create closure to properties
    var parent = anchor.getParent();
    var id = anchor.id();
    var x = anchor.x();
    var y = anchor.y();
    // create clone object
    var clone = {};
    clone.getParent = function () {
      return parent;
    };
    clone.id = function () {
      return id;
    };
    clone.x = function () {
      return x;
    };
    clone.y = function () {
      return y;
    };
    return clone;
  }

  /**
   * Set the anchor on listeners.
   *
   * @param {object} anchor The anchor to set on.
   * @private
   */
  function setAnchorOn(anchor) {
    var startAnchor = null;

    // command name based on shape type
    var shapeDisplayName = dwv.tool.GetShapeDisplayName(shape);

    // drag start listener
    anchor.on('dragstart.edit', function (evt) {
      startAnchor = getClone(this);
      // prevent bubbling upwards
      evt.cancelBubble = true;
    });
    // drag move listener
    anchor.on('dragmove.edit', function (evt) {
      // validate the anchor position
      dwv.tool.validateAnchorPosition(
        app.getDrawController().getInitialSize(), this);
      // update shape
      currentFactory.update(this, app.getStyle(), viewController);
      // redraw
      if (this.getLayer()) {
        this.getLayer().draw();
      } else {
        dwv.logger.warn('No layer to draw the anchor!');
      }
      // prevent bubbling upwards
      evt.cancelBubble = true;
    });
    // drag end listener
    anchor.on('dragend.edit', function (evt) {
      var endAnchor = getClone(this);
      // store the change command
      var chgcmd = new dwv.tool.ChangeGroupCommand(
        shapeDisplayName,
        currentFactory.update,
        startAnchor,
        endAnchor,
        this.getLayer(),
        viewController,
        app.getStyle()
      );
      chgcmd.onExecute = drawEventCallback;
      chgcmd.onUndo = drawEventCallback;
      chgcmd.execute();
      app.addToUndoStack(chgcmd);
      // reset start anchor
      startAnchor = endAnchor;
      // prevent bubbling upwards
      evt.cancelBubble = true;
    });
    // mouse down listener
    anchor.on('mousedown touchstart', function () {
      this.moveToTop();
    });
    // mouse over styling
    anchor.on('mouseover.edit', function () {
      // style is handled by the group
      this.stroke('#ddd');
      if (this.getLayer()) {
        this.getLayer().draw();
      } else {
        dwv.logger.warn('No layer to draw the anchor!');
      }
    });
    // mouse out styling
    anchor.on('mouseout.edit', function () {
      // style is handled by the group
      this.stroke('#999');
      if (this.getLayer()) {
        this.getLayer().draw();
      } else {
        dwv.logger.warn('No layer to draw the anchor!');
      }
    });
  }

  /**
   * Set the anchor off listeners.
   *
   * @param {object} anchor The anchor to set off.
   * @private
   */
  function setAnchorOff(anchor) {
    anchor.off('dragstart.edit');
    anchor.off('dragmove.edit');
    anchor.off('dragend.edit');
    anchor.off('mousedown touchstart');
    anchor.off('mouseover.edit');
    anchor.off('mouseout.edit');
  }
};
