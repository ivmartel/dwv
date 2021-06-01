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
 * Debug flag.
 */
dwv.tool.draw.debug = false;

/**
 * Drawing tool.
 *
 * This tool is responsible for the draw layer group structure. The layout is:
 *
 * drawLayer
 * |_ positionGroup: name="position-group", id="slice-#_frame-#""
 *    |_ shapeGroup: name="{shape name}-group", id="#"
 *       |_ shape: name="shape"
 *       |_ label: name="label"
 *       |_ extra: line tick, protractor arc...
 *
 * Discussion:
 * - posGroup > shapeGroup
 *    pro: slice/frame display: 1 loop
 *    cons: multi-slice shape splitted in positionGroups
 * - shapeGroup > posGroup
 *    pros: more logical
 *    cons: slice/frame display: 2 loops
 *
 * @class
 * @param {object} app The associated application.
 */
dwv.tool.Draw = function (app) {
  /**
   * Closure to self: to be used by event handlers.
   *
   * @private
   * @type {dwv.tool.Draw }
   */
  var self = this;
  /**
   * Interaction start flag.
   *
   * @private
   * @type {boolean}
   */
  var started = false;

  /**
   * Shape factory list
   *
   * @type {object}
   */
  this.shapeFactoryList = null;

  /**
   * Current shape factory.
   *
   * @type {object}
   * @private
   */
  var currentFactory = null;

  /**
   * Draw command.
   *
   * @private
   * @type {object}
   */
  var command = null;
  /**
   * Current shape group.
   *
   * @private
   * @type {object}
   */
  var tmpShapeGroup = null;

  /**
   * Shape name.
   *
   * @type {string}
   */
  this.shapeName = 0;

  /**
   * List of points.
   *
   * @private
   * @type {Array}
   */
  var points = [];

  /**
   * Last selected point.
   *
   * @private
   * @type {object}
   */
  var lastPoint = null;

  /**
   * Shape editor.
   *
   * @private
   * @type {object}
   */
  var shapeEditor = new dwv.tool.ShapeEditor(app);

  // associate the event listeners of the editor
  //  with those of the draw tool
  shapeEditor.setDrawEventCallback(fireEvent);

  /**
   * Trash draw: a cross.
   *
   * @private
   * @type {object}
   */
  var trash = new Konva.Group();

  // first line of the cross
  var trashLine1 = new Konva.Line({
    points: [-10, -10, 10, 10],
    stroke: 'red'
  });
    // second line of the cross
  var trashLine2 = new Konva.Line({
    points: [10, -10, -10, 10],
    stroke: 'red'
  });
  trash.width(20);
  trash.height(20);
  trash.add(trashLine1);
  trash.add(trashLine2);

  /**
   * Drawing style.
   *
   * @type {dwv.gui.Style}
   */
  this.style = app.getStyle();

  /**
   * Event listeners.
   *
   * @private
   */
  var listeners = {};

  /**
   * The associated Konva layer.
   *
   * @private
   * @type {object}
   */
  var konvaLayer = null;

  /**
   * Handle mouse down event.
   *
   * @param {object} event The mouse down event.
   */
  this.mousedown = function (event) {
    // exit if a draw was started (handle at mouse move or up)
    if (started) {
      return;
    }

    var layerController = app.getLayerController();
    var drawLayer = layerController.getActiveDrawLayer();

    // determine if the click happened in an existing shape
    var stage = drawLayer.getKonvaStage();
    var kshape = stage.getIntersection({
      x: event._xs,
      y: event._ys
    });

    // update scale
    self.style.setZoomScale(stage.scale());

    if (kshape) {
      var group = kshape.getParent();
      var selectedShape = group.find('.shape')[0];
      // reset editor if click on other shape
      // (and avoid anchors mouse down)
      if (selectedShape && selectedShape !== shapeEditor.getShape()) {
        shapeEditor.disable();
        shapeEditor.setShape(selectedShape);
        var viewController =
          layerController.getActiveViewLayer().getViewController();
        shapeEditor.setViewController(viewController);
        shapeEditor.enable();
      }
    } else {
      // disable edition
      shapeEditor.disable();
      shapeEditor.setShape(null);
      shapeEditor.setViewController(null);
      // start storing points
      started = true;
      // set factory
      currentFactory = new self.shapeFactoryList[self.shapeName]();
      // clear array
      points = [];
      // store point
      lastPoint = new dwv.math.Point2D(event._x, event._y);
      points.push(lastPoint);
    }
  };

  /**
   * Handle mouse move event.
   *
   * @param {object} event The mouse move event.
   */
  this.mousemove = function (event) {
    // exit if not started draw
    if (!started) {
      return;
    }

    // draw line to current pos
    if (Math.abs(event._x - lastPoint.getX()) > 0 ||
                Math.abs(event._y - lastPoint.getY()) > 0) {
      // clear last added point from the list (but not the first one)
      // if it was marked as temporary
      if (points.length !== 1 &&
        typeof points[points.length - 1].tmp !== 'undefined') {
        points.pop();
      }
      // current point
      lastPoint = new dwv.math.Point2D(event._x, event._y);
      // mark it as temporary
      lastPoint.tmp = true;
      // add it to the list
      points.push(lastPoint);
      // update points
      onNewPoints(points);
    }
  };

  /**
   * Handle mouse up event.
   *
   * @param {object} _event The mouse up event.
   */
  this.mouseup = function (_event) {
    // exit if not started draw
    if (!started) {
      return;
    }
    // exit if no points
    if (points.length === 0) {
      dwv.logger.warn('Draw mouseup but no points...');
      return;
    }

    // do we have all the needed points
    if (points.length === currentFactory.getNPoints()) {
      // store points
      onFinalPoints(points);
      // reset flag
      started = false;
    } else {
      // remove temporary flag
      if (typeof points[points.length - 1].tmp !== 'undefined') {
        delete points[points.length - 1].tmp;
      }
    }
  };

  /**
   * Handle double click event.
   *
   * @param {object} _event The mouse up event.
   */
  this.dblclick = function (_event) {
    // exit if not started draw
    if (!started) {
      return;
    }
    // exit if no points
    if (points.length === 0) {
      dwv.logger.warn('Draw dblclick but no points...');
      return;
    }

    // store points
    onFinalPoints(points);
    // reset flag
    started = false;
  };

  /**
   * Handle mouse out event.
   *
   * @param {object} event The mouse out event.
   */
  this.mouseout = function (event) {
    self.mouseup(event);
  };

  /**
   * Handle touch start event.
   *
   * @param {object} event The touch start event.
   */
  this.touchstart = function (event) {
    self.mousedown(event);
  };

  /**
   * Handle touch move event.
   *
   * @param {object} event The touch move event.
   */
  this.touchmove = function (event) {
    // exit if not started draw
    if (!started) {
      return;
    }

    if (Math.abs(event._x - lastPoint.getX()) > 0 ||
                Math.abs(event._y - lastPoint.getY()) > 0) {
      // clear last added point from the list (but not the first one)
      if (points.length !== 1) {
        points.pop();
      }
      // current point
      lastPoint = new dwv.math.Point2D(event._x, event._y);
      // add current one to the list
      points.push(lastPoint);
      // allow for anchor points
      if (points.length < currentFactory.getNPoints()) {
        clearTimeout(this.timer);
        this.timer = setTimeout(function () {
          points.push(lastPoint);
        }, currentFactory.getTimeout());
      }
      // update points
      onNewPoints(points);
    }
  };

  /**
   * Handle touch end event.
   *
   * @param {object} event The touch end event.
   */
  this.touchend = function (event) {
    self.dblclick(event);
  };

  /**
   * Handle key down event.
   *
   * @param {object} event The key down event.
   */
  this.keydown = function (event) {
    // call app handler if we are not in the middle of a draw
    if (!started) {
      event.context = 'dwv.tool.Draw';
      app.onKeydown(event);
    }

    // press delete key
    if (event.keyCode === 46 && shapeEditor.isActive()) {
      // get shape
      var shapeGroup = shapeEditor.getShape().getParent();
      var shapeDisplayName = dwv.tool.GetShapeDisplayName(
        shapeGroup.getChildren(dwv.draw.isNodeNameShape)[0]);
      // delete command
      var delcmd = new dwv.tool.DeleteGroupCommand(shapeGroup,
        shapeDisplayName, konvaLayer);
      delcmd.onExecute = fireEvent;
      delcmd.onUndo = fireEvent;
      delcmd.execute();
      app.addToUndoStack(delcmd);
    }

    // escape key: exit shape creation
    if (event.keyCode === 27) {
      // reset temporary shape group
      if (tmpShapeGroup) {
        tmpShapeGroup.destroy();
      }
      // reset flag and points
      started = false;
      points = [];
      // redraw
      konvaLayer.draw();
    }
  };

  /**
   * Update the current draw with new points.
   *
   * @param {Array} tmpPoints The array of new points.
   */
  function onNewPoints(tmpPoints) {
    // remove temporary shape draw
    if (tmpShapeGroup) {
      tmpShapeGroup.destroy();
    }
    // create shape group
    var layerController = app.getLayerController();
    var viewController =
      layerController.getActiveViewLayer().getViewController();
    tmpShapeGroup = currentFactory.create(
      tmpPoints, self.style, viewController);
    // do not listen during creation
    var shape = tmpShapeGroup.getChildren(dwv.draw.isNodeNameShape)[0];
    shape.listening(false);
    konvaLayer.listening(false);
    // draw shape
    konvaLayer.add(tmpShapeGroup);
    konvaLayer.draw();
  }

  /**
   * Create the final shape from a point list.
   *
   * @param {Array} finalPoints The array of points.
   */
  function onFinalPoints(finalPoints) {
    // reset temporary shape group
    if (tmpShapeGroup) {
      tmpShapeGroup.destroy();
    }

    var layerController = app.getLayerController();
    var viewController =
      layerController.getActiveViewLayer().getViewController();
    var drawController =
      layerController.getActiveDrawLayer().getDrawController();

    // create final shape
    var finalShapeGroup = currentFactory.create(
      finalPoints, self.style, viewController);
    finalShapeGroup.id(dwv.math.guid());

    // get the position group
    var posGroup = drawController.getCurrentPosGroup();
    // add shape group to position group
    posGroup.add(finalShapeGroup);

    // re-activate layer
    konvaLayer.listening(true);
    // draw shape command
    command = new dwv.tool.DrawGroupCommand(
      finalShapeGroup, self.shapeName, konvaLayer);
    command.onExecute = fireEvent;
    command.onUndo = fireEvent;
    // execute it
    command.execute();
    // save it in undo stack
    app.addToUndoStack(command);

    // activate shape listeners
    self.setShapeOn(finalShapeGroup);
  }

  /**
   * Activate the tool.
   *
   * @param {boolean} flag The flag to activate or not.
   */
  this.activate = function (flag) {
    // reset shape display properties
    shapeEditor.disable();
    shapeEditor.setShape(null);
    shapeEditor.setViewController(null);
    document.body.style.cursor = 'default';
    // get the current draw layer
    var layerController = app.getLayerController();
    var drawLayer = layerController.getActiveDrawLayer();
    konvaLayer = drawLayer.getKonvaLayer();
    activateCurrentPositionShapes(flag);
    // listen to app change to update the draw layer
    if (flag) {
      app.addEventListener('slicechange', updateDrawLayer);
      app.addEventListener('framechange', updateDrawLayer);

      // init with the app window scale
      this.style.setBaseScale(app.getBaseScale());
      // same for colour
      this.setLineColour(this.style.getLineColour());
    } else {
      app.removeEventListener('slicechange', updateDrawLayer);
      app.removeEventListener('framechange', updateDrawLayer);
    }
  };

  /**
   * Update the draw layer.
   */
  function updateDrawLayer() {
    // activate the shape at current position
    activateCurrentPositionShapes(true);
  }

  /**
   * Activate shapes at current position.
   *
   * @param {boolean} visible Set the draw layer visible or not.
   */
  function activateCurrentPositionShapes(visible) {
    var layerController = app.getLayerController();
    var drawController =
      layerController.getActiveDrawLayer().getDrawController();

    // get shape groups at the current position
    var shapeGroups =
      drawController.getCurrentPosGroup().getChildren();

    // set shape display properties
    if (visible) {
      // activate shape listeners
      shapeGroups.forEach(function (group) {
        self.setShapeOn(group);
      });
    } else {
      // de-activate shape listeners
      shapeGroups.forEach(function (group) {
        setShapeOff(group);
      });
    }
    // draw
    konvaLayer.draw();
  }

  /**
   * Set shape group off properties.
   *
   * @param {object} shapeGroup The shape group to set off.
   */
  function setShapeOff(shapeGroup) {
    // mouse styling
    shapeGroup.off('mouseover');
    shapeGroup.off('mouseout');
    // drag
    shapeGroup.draggable(false);
    shapeGroup.off('dragstart.draw');
    shapeGroup.off('dragmove.draw');
    shapeGroup.off('dragend.draw');
    shapeGroup.off('dblclick');
  }

  /**
   * Get the real position from an event.
   *
   * @param {object} index The input index.
   * @returns {object} The reasl position in the image.
   * @private
   */
  function getRealPosition(index) {
    var layerController = app.getLayerController();
    var drawLayer = layerController.getActiveDrawLayer();
    var stage = drawLayer.getKonvaStage();
    return {
      x: stage.offset().x + index.x / stage.scale().x,
      y: stage.offset().y + index.y / stage.scale().y
    };
  }

  /**
   * Set shape group on properties.
   *
   * @param {object} shapeGroup The shape group to set on.
   */
  this.setShapeOn = function (shapeGroup) {
    // mouse over styling
    shapeGroup.on('mouseover', function () {
      document.body.style.cursor = 'pointer';
    });
    // mouse out styling
    shapeGroup.on('mouseout', function () {
      document.body.style.cursor = 'default';
    });

    // make it draggable
    shapeGroup.draggable(true);
    // cache drag start position
    var dragStartPos = {x: shapeGroup.x(), y: shapeGroup.y()};

    // command name based on shape type
    var shapeDisplayName = dwv.tool.GetShapeDisplayName(
      shapeGroup.getChildren(dwv.draw.isNodeNameShape)[0]);

    var colour = null;

    // drag start event handling
    shapeGroup.on('dragstart.draw', function (/*event*/) {
      // store colour
      colour = shapeGroup.getChildren(dwv.draw.isNodeNameShape)[0].stroke();
      // display trash
      var layerController = app.getLayerController();
      var drawLayer = layerController.getActiveDrawLayer();
      var stage = drawLayer.getKonvaStage();
      var scale = stage.scale();
      var invscale = {x: 1 / scale.x, y: 1 / scale.y};
      trash.x(stage.offset().x + (stage.width() / (2 * scale.x)));
      trash.y(stage.offset().y + (stage.height() / (15 * scale.y)));
      trash.scale(invscale);
      konvaLayer.add(trash);
      // deactivate anchors to avoid events on null shape
      shapeEditor.setAnchorsActive(false);
      // draw
      konvaLayer.draw();
    });
    // drag move event handling
    shapeGroup.on('dragmove.draw', function (event) {
      var layerController = app.getLayerController();
      var drawLayer = layerController.getActiveDrawLayer();
      // validate the group position
      dwv.tool.validateGroupPosition(drawLayer.getSize(), this);
      // highlight trash when on it
      var offset = dwv.gui.getEventOffset(event.evt)[0];
      var eventPos = getRealPosition(offset);
      var trashHalfWidth = trash.width() * trash.scaleX() / 2;
      var trashHalfHeight = trash.height() * trash.scaleY() / 2;
      if (Math.abs(eventPos.x - trash.x()) < trashHalfWidth &&
                    Math.abs(eventPos.y - trash.y()) < trashHalfHeight) {
        trash.getChildren().each(function (tshape) {
          tshape.stroke('orange');
        });
        // change the group shapes colour
        shapeGroup.getChildren(dwv.draw.canNodeChangeColour).forEach(
          function (ashape) {
            ashape.stroke('red');
          });
      } else {
        trash.getChildren().each(function (tshape) {
          tshape.stroke('red');
        });
        // reset the group shapes colour
        shapeGroup.getChildren(dwv.draw.canNodeChangeColour).forEach(
          function (ashape) {
            if (typeof ashape.stroke !== 'undefined') {
              ashape.stroke(colour);
            }
          });
      }
      // draw
      konvaLayer.draw();
    });
    // drag end event handling
    shapeGroup.on('dragend.draw', function (event) {
      var pos = {x: this.x(), y: this.y()};
      // remove trash
      trash.remove();
      // delete case
      var offset = dwv.gui.getEventOffset(event.evt)[0];
      var eventPos = getRealPosition(offset);
      var trashHalfWidth = trash.width() * trash.scaleX() / 2;
      var trashHalfHeight = trash.height() * trash.scaleY() / 2;
      if (Math.abs(eventPos.x - trash.x()) < trashHalfWidth &&
                    Math.abs(eventPos.y - trash.y()) < trashHalfHeight) {
        // compensate for the drag translation
        this.x(dragStartPos.x);
        this.y(dragStartPos.y);
        // disable editor
        shapeEditor.disable();
        shapeEditor.setShape(null);
        shapeEditor.setViewController(null);
        // reset colour
        shapeGroup.getChildren(dwv.draw.canNodeChangeColour).forEach(
          function (ashape) {
            ashape.stroke(colour);
          });
        // reset cursor
        document.body.style.cursor = 'default';
        // delete command
        var delcmd = new dwv.tool.DeleteGroupCommand(this,
          shapeDisplayName, konvaLayer);
        delcmd.onExecute = fireEvent;
        delcmd.onUndo = fireEvent;
        delcmd.execute();
        app.addToUndoStack(delcmd);
      } else {
        // save drag move
        var translation = {x: pos.x - dragStartPos.x,
          y: pos.y - dragStartPos.y};
        if (translation.x !== 0 || translation.y !== 0) {
          var mvcmd = new dwv.tool.MoveGroupCommand(this,
            shapeDisplayName, translation, konvaLayer);
          mvcmd.onExecute = fireEvent;
          mvcmd.onUndo = fireEvent;
          app.addToUndoStack(mvcmd);

          // the move is handled by Konva, trigger an event manually
          fireEvent({
            type: 'drawmove',
            id: this.id()
          });
        }
        // reset anchors
        shapeEditor.setAnchorsActive(true);
        shapeEditor.resetAnchors();
      }
      // draw
      konvaLayer.draw();
      // reset start position
      dragStartPos = {x: this.x(), y: this.y()};
    });
    // double click handling: update label
    shapeGroup.on('dblclick', function () {
      // get the label object for this shape
      var label = this.findOne('Label');
      // should just be one
      if (typeof label === 'undefined') {
        throw new Error('Could not find the shape label.');
      }
      var ktext = label.getText();

      var onSaveCallback = function (meta) {
        // store meta
        ktext.meta = meta;
        // update text expression
        ktext.setText(dwv.utils.replaceFlags(
          ktext.meta.textExpr, ktext.meta.quantification));
        // trigger event
        fireEvent({
          type: 'drawchange'
        });
        // draw
        konvaLayer.draw();
      };

      // call client dialog if defined
      if (typeof dwv.gui.openRoiDialog !== 'undefined') {
        dwv.gui.openRoiDialog(ktext.meta, onSaveCallback);
      } else {
        // simple prompt for the text expression
        var textExpr = prompt('Label', ktext.meta.textExpr);
        if (textExpr !== null) {
          ktext.meta.textExpr = textExpr;
          onSaveCallback(ktext.meta);
        }
      }
    });
  };

  /**
   * Set the tool options.
   *
   * @param {object} options The list of shape names amd classes.
   */
  this.setOptions = function (options) {
    // save the options as the shape factory list
    this.shapeFactoryList = options;
    // pass them to the editor
    shapeEditor.setFactoryList(options);
  };

  /**
   * Initialise the tool.
   */
  this.init = function () {
    // does nothing
  };

  /**
   * Add an event listener on the app.
   *
   * @param {string} type The event type.
   * @param {object} listener The method associated with the provided
   *   event type.
   */
  this.addEventListener = function (type, listener) {
    if (typeof listeners[type] === 'undefined') {
      listeners[type] = [];
    }
    listeners[type].push(listener);
  };

  /**
   * Remove an event listener from the app.
   *
   * @param {string} type The event type.
   * @param {object} listener The method associated with the provided
   *   event type.
   */
  this.removeEventListener = function (type, listener) {
    if (typeof listeners[type] === 'undefined') {
      return;
    }
    for (var i = 0; i < listeners[type].length; ++i) {
      if (listeners[type][i] === listener) {
        listeners[type].splice(i, 1);
      }
    }
  };

  /**
   * Set the line colour of the drawing.
   *
   * @param {string} colour The colour to set
   */
  this.setLineColour = function (colour) {
    this.style.setLineColour(colour);
  };

  // Private Methods -----------------------------------------------------------

  /**
   * Fire an event: call all associated listeners.
   *
   * @param {object} event The event to fire.
   * @private
   */
  function fireEvent(event) {
    if (typeof listeners[event.type] === 'undefined') {
      return;
    }
    for (var i = 0; i < listeners[event.type].length; ++i) {
      listeners[event.type][i](event);
    }
  }

}; // Draw class

/**
 * Help for this tool.
 *
 * @returns {object} The help content.
 */
dwv.tool.Draw.prototype.getHelpKeys = function () {
  return {
    title: 'tool.Draw.name',
    brief: 'tool.Draw.brief',
    mouse: {
      mouse_drag: 'tool.Draw.mouse_drag'
    },
    touch: {
      touch_drag: 'tool.Draw.touch_drag'
    }
  };
};

/**
 * Set the shape name of the drawing.
 *
 * @param {string} name The name of the shape.
 */
dwv.tool.Draw.prototype.setShapeName = function (name) {
  // check if we have it
  if (!this.hasShape(name)) {
    throw new Error('Unknown shape: \'' + name + '\'');
  }
  this.shapeName = name;
};

/**
 * Check if the shape is in the shape list.
 *
 * @param {string} name The name of the shape.
 * @returns {boolean} True if there is a factory for the shape.
 */
dwv.tool.Draw.prototype.hasShape = function (name) {
  return this.shapeFactoryList[name];
};

/**
 * Get the minimum position in a groups' anchors.
 *
 * @param {object} group The group that contains anchors.
 * @returns {object} The minimum position.
 */
dwv.tool.getAnchorMin = function (group) {
  var anchors = group.find('.anchor');
  if (anchors.length === 0) {
    return;
  }
  var minX = anchors[0].x();
  var minY = anchors[0].y();
  anchors.each(function (anchor) {
    minX = Math.min(minX, anchor.x());
    minY = Math.min(minY, anchor.y());
  });
  return {x: minX, y: minY};
};

/**
 * Bound a node position.
 *
 * @param {object} node The node to bound the position.
 * @param {object} min The minimum position.
 * @param {object} max The maximum position.
 * @returns {boolean} True if the position was corrected.
 */
dwv.tool.boundNodePosition = function (node, min, max) {
  var changed = false;
  if (node.x() < min.x) {
    node.x(min.x);
    changed = true;
  } else if (node.x() > max.x) {
    node.x(max.x);
    changed = true;
  }
  if (node.y() < min.y) {
    node.y(min.y);
    changed = true;
  } else if (node.y() > max.y) {
    node.y(max.y);
    changed = true;
  }
  return changed;
};

/**
 * Validate a group position.
 *
 * @param {object} stageSize The stage size {x,y}.
 * @param {object} group The group to evaluate.
 * @returns {boolean} True if the position was corrected.
 */
dwv.tool.validateGroupPosition = function (stageSize, group) {
  // if anchors get mixed, width/height can be negative
  var shape = group.getChildren(dwv.draw.isNodeNameShape)[0];
  var anchorMin = dwv.tool.getAnchorMin(group);

  var min = {
    x: -anchorMin.x,
    y: -anchorMin.y
  };
  var max = {
    x: stageSize.x -
      (anchorMin.x + Math.abs(shape.width())),
    y: stageSize.y -
      (anchorMin.y + Math.abs(shape.height()))
  };

  return dwv.tool.boundNodePosition(group, min, max);
};

/**
 * Validate an anchor position.
 *
 * @param {object} stageSize The stage size {x,y}.
 * @param {object} anchor The anchor to evaluate.
 * @returns {boolean} True if the position was corrected.
 */
dwv.tool.validateAnchorPosition = function (stageSize, anchor) {
  var group = anchor.getParent();

  var min = {
    x: -group.x(),
    y: -group.y()
  };
  var max = {
    x: stageSize.x - group.x(),
    y: stageSize.y - group.y()
  };

  return dwv.tool.boundNodePosition(anchor, min, max);
};
