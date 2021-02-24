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
 * @param {number} scale The application scale.
 * @returns {object} The default anchor shape.
 */
dwv.tool.draw.getDefaultAnchor = function (x, y, id, style, scale) {
  return new Konva.Circle({
    x: x,
    y: y,
    stroke: '#999',
    fill: 'rgba(100,100,100,0.7',
    strokeWidth: style.getStrokeWidth(),
    strokeScaleEnabled: false,
    radius: style.scale(6) / scale,
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
   * Update function used by anchors to update the shape.
   *
   * @private
   * @type {Function}
   */
  var updateFunction = null;
  /**
   * Draw event callback.
   *
   * @private
   * @type {Function}
   */
  var drawEventCallback = null;

  /**
   * Set the shape to edit.
   *
   * @param {object} inshape The shape to edit.
   */
  this.setShape = function (inshape) {
    shape = inshape;
    // reset anchors
    if (shape) {
      removeAnchors();
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

    var anchors = null;

    // get shape group
    var group = shape.getParent();
    // add shape specific anchors to the shape group
    if (shape instanceof Konva.Line) {
      if (group.name() === 'line-group') {
        updateFunction = dwv.tool.draw.UpdateArrow;
        anchors = dwv.tool.draw.GetArrowAnchors(
          shape, app.getStyle(), app.getScale());
      } else if (group.name() === 'ruler-group') {
        updateFunction = dwv.tool.draw.UpdateRuler;
        anchors = dwv.tool.draw.GetRulerAnchors(
          shape, app.getStyle(), app.getScale());
      } else if (group.name() === 'protractor-group') {
        updateFunction = dwv.tool.draw.UpdateProtractor;
        anchors = dwv.tool.draw.GetProtractorAnchors(
          shape, app.getStyle(), app.getScale());
      } else if (group.name() === 'roi-group') {
        updateFunction = dwv.tool.draw.UpdateRoi;
        anchors = dwv.tool.draw.GetRoiAnchors(
          shape, app.getStyle(), app.getScale());
      } else if (group.name() === 'freeHand-group') {
        updateFunction = dwv.tool.draw.UpdateFreeHand;
        anchors = dwv.tool.draw.GetFreeHandAnchors(
          shape, app.getStyle(), app.getScale());
      } else {
        dwv.logger.warn('Cannot update unknown line shape.');
      }
    } else if (shape instanceof Konva.Rect) {
      updateFunction = dwv.tool.draw.UpdateRect;
      anchors = dwv.tool.draw.GetRectAnchors(
        shape, app.getStyle(), app.getScale());
    } else if (shape instanceof Konva.Ellipse) {
      updateFunction = dwv.tool.draw.UpdateEllipse;
      anchors = dwv.tool.draw.GetEllipseAnchors(
        shape, app.getStyle(), app.getScale());
    }

    for (var a = 0; a < anchors.length; ++a) {
      // set anchor on
      setAnchorOn(anchors[a]);
      // add the anchor to the group
      group.add(anchors[a]);
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
      dwv.tool.validateAnchorPosition(app.getDrawStage(), this);
      // update shape
      if (updateFunction) {
        updateFunction(this, app.getStyle(), viewController);
      } else {
        dwv.logger.warn('No update function!');
      }
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
        updateFunction,
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
