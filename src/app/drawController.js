// namespaces
var dwv = dwv || {};
dwv.draw = dwv.draw || {};
/**
 * The Konva namespace.
 *
 * @external Konva
 * @see https://konvajs.org/
 */
var Konva = Konva || {};

/**
 * Get the draw group id for a given position.
 *
 * @param {number} sliceNumber The slice number.
 * @param {number} frameNumber The frame number.
 * @returns {number} The group id.
 */
dwv.draw.getDrawPositionGroupId = function (sliceNumber, frameNumber) {
  return 'slice-' + sliceNumber + '_frame-' + frameNumber;
};

/**
 * Get the slice and frame position from a group id.
 *
 * @param {string} groupId The group id.
 * @returns {object} The slice and frame number.
 */
dwv.draw.getPositionFromGroupId = function (groupId) {
  var sepIndex = groupId.indexOf('_');
  if (sepIndex === -1) {
    dwv.logger.warn('Badly formed PositionGroupId: ' + groupId);
  }
  return {
    sliceNumber: groupId.substring(6, sepIndex),
    frameNumber: groupId.substring(sepIndex + 7)
  };
};

/**
 * Is an input node's name 'shape'.
 *
 * @param {object} node A Konva node.
 * @returns {boolean} True if the node's name is 'shape'.
 */
dwv.draw.isNodeNameShape = function (node) {
  return node.name() === 'shape';
};

/**
 * Is a node an extra shape associated with a main one.
 *
 * @param {object} node A Konva node.
 * @returns {boolean} True if the node's name starts with 'shape-'.
 */
dwv.draw.isNodeNameShapeExtra = function (node) {
  return node.name().startsWith('shape-');
};

/**
 * Is an input node's name 'label'.
 *
 * @param {object} node A Konva node.
 * @returns {boolean} True if the node's name is 'label'.
 */
dwv.draw.isNodeNameLabel = function (node) {
  return node.name() === 'label';
};

/**
 * Is an input node a position node.
 *
 * @param {object} node A Konva node.
 * @returns {boolean} True if the node's name is 'position-group'.
 */
dwv.draw.isPositionNode = function (node) {
  return node.name() === 'position-group';
};

/**
 * Get a lambda to check a node's id.
 *
 * @param {string} id The id to check.
 * @returns {Function} A function to check a node's id.
 */
dwv.draw.isNodeWithId = function (id) {
  return function (node) {
    return node.id() === id;
  };
};

/**
 * Is the input node a node that has the 'stroke' method.
 *
 * @param {object} node A Konva node.
 * @returns {boolean} True if the node's name is 'anchor' and 'label'.
 */
dwv.draw.canNodeChangeColour = function (node) {
  return node.name() !== 'anchor' && node.name() !== 'label';
};

/**
 * Debug function to output the layer hierarchy as text.
 *
 * @param {object} layer The Konva layer.
 * @param {string} prefix A display prefix (used in recursion).
 * @returns {string} A text representation of the hierarchy.
 */
dwv.draw.getHierarchyLog = function (layer, prefix) {
  if (typeof prefix === 'undefined') {
    prefix = '';
  }
  var kids = layer.getChildren();
  var log = prefix + '|__ ' + layer.name() + ': ' + layer.id() + '\n';
  for (var i = 0; i < kids.length; ++i) {
    log += dwv.draw.getHierarchyLog(kids[i], prefix + '    ');
  }
  return log;
};

/**
 * Draw controller.
 *
 * @class
 * @param {object} konvaLayer The draw layer.
 */
dwv.DrawController = function (konvaLayer) {
  // current position group id
  var currentPosGroupId = null;

  /**
   * Get the current position group.
   *
   * @returns {object} The Konva.Group.
   */
  this.getCurrentPosGroup = function () {
    // get position groups
    var posGroups = konvaLayer.getChildren(function (node) {
      return node.id() === currentPosGroupId;
    });
    // if one group, use it
    // if no group, create one
    var posGroup = null;
    if (posGroups.length === 1) {
      posGroup = posGroups[0];
    } else if (posGroups.length === 0) {
      posGroup = new Konva.Group();
      posGroup.name('position-group');
      posGroup.id(currentPosGroupId);
      posGroup.visible(true); // dont inherit
      // add new group to layer
      konvaLayer.add(posGroup);
    } else {
      dwv.logger.warn('Unexpected number of draw position groups.');
    }
    // return
    return posGroup;
  };

  /**
   * Reset: clear the layers array.
   */
  this.reset = function () {
    konvaLayer = null;
  };

  /**
   * Activate the current draw layer.
   *
   * @param {object} currentPosition The current position.
   */
  this.activateDrawLayer = function (currentPosition) {
    // get and store the position group id
    var currentSlice = currentPosition.get(2);
    var currentFrame = currentPosition.length() === 3
      ? currentPosition.get(3) : 0;
    currentPosGroupId = dwv.draw.getDrawPositionGroupId(
      currentSlice, currentFrame);

    // get all position groups
    var posGroups = konvaLayer.getChildren(dwv.draw.isPositionNode);
    // reset or set the visible property
    var visible;
    for (var i = 0, leni = posGroups.length; i < leni; ++i) {
      visible = false;
      if (posGroups[i].id() === currentPosGroupId) {
        visible = true;
      }
      // group members inherit the visible property
      posGroups[i].visible(visible);
    }

    // show current draw layer
    konvaLayer.draw();
  };

  /**
   * Get a list of drawing display details.
   *
   * @returns {object} A list of draw details including id, slice, frame...
   */
  this.getDrawDisplayDetails = function () {
    var list = [];
    var groups = konvaLayer.getChildren();
    for (var j = 0, lenj = groups.length; j < lenj; ++j) {
      var position = dwv.draw.getPositionFromGroupId(groups[j].id());
      var collec = groups[j].getChildren();
      for (var i = 0, leni = collec.length; i < leni; ++i) {
        var shape = collec[i].getChildren(dwv.draw.isNodeNameShape)[0];
        var label = collec[i].getChildren(dwv.draw.isNodeNameLabel)[0];
        var text = label.getChildren()[0];
        var type = shape.className;
        if (type === 'Line') {
          var shapeExtrakids = collec[i].getChildren(
            dwv.draw.isNodeNameShapeExtra);
          if (shape.closed()) {
            type = 'Roi';
          } else if (shapeExtrakids.length !== 0) {
            if (shapeExtrakids[0].name().indexOf('triangle') !== -1) {
              type = 'Arrow';
            } else {
              type = 'Ruler';
            }
          }
        }
        if (type === 'Rect') {
          type = 'Rectangle';
        }
        list.push({
          id: collec[i].id(),
          slice: position.sliceNumber,
          frame: position.frameNumber,
          type: type,
          color: shape.stroke(),
          meta: text.meta
        });
      }
    }
    return list;
  };

  /**
   * Get a list of drawing store details.
   *
   * @returns {object} A list of draw details including id, text, quant...
   * TODO Unify with getDrawDisplayDetails?
   */
  this.getDrawStoreDetails = function () {
    var drawingsDetails = {};

    // get all position groups
    var posGroups = konvaLayer.getChildren(dwv.draw.isPositionNode);

    var posKids;
    var group;
    for (var i = 0, leni = posGroups.length; i < leni; ++i) {
      posKids = posGroups[i].getChildren();
      for (var j = 0, lenj = posKids.length; j < lenj; ++j) {
        group = posKids[j];
        // remove anchors
        var anchors = group.find('.anchor');
        for (var a = 0; a < anchors.length; ++a) {
          anchors[a].remove();
        }
        // get text
        var texts = group.find('.text');
        if (texts.length !== 1) {
          dwv.logger.warn('There should not be more than one text per shape.');
        }
        // get meta (non konva vars)
        drawingsDetails[group.id()] = {
          meta: texts[0].meta
        };
      }
    }
    return drawingsDetails;
  };

  /**
   * Set the drawings on the current stage.
   *
   * @param {Array} drawings An array of drawings.
   * @param {Array} drawingsDetails An array of drawings details.
   * @param {object} cmdCallback The DrawCommand callback.
   * @param {object} exeCallback The callback to call once the
   *   DrawCommand has been executed.
   */
  this.setDrawings = function (
    drawings, drawingsDetails, cmdCallback, exeCallback) {
    // regular Konva deserialize
    var stateLayer = Konva.Node.create(drawings);

    // get all position groups
    var statePosGroups = stateLayer.getChildren(dwv.draw.isPositionNode);

    for (var i = 0, leni = statePosGroups.length; i < leni; ++i) {
      var statePosGroup = statePosGroups[i];

      // Get or create position-group if it does not exist and
      // append it to konvaLayer
      var posGroup = konvaLayer.getChildren(
        dwv.draw.isNodeWithId(statePosGroup.id()))[0];
      if (typeof posGroup === 'undefined') {
        posGroup = new Konva.Group({
          id: statePosGroup.id(),
          name: 'position-group',
          visible: false
        });
        konvaLayer.add(posGroup);
      }

      var statePosKids = statePosGroup.getChildren();
      for (var j = 0, lenj = statePosKids.length; j < lenj; ++j) {
        // shape group (use first one since it will be removed from
        // the group when we change it)
        var stateGroup = statePosKids[0];
        // add group to posGroup (switches its parent)
        posGroup.add(stateGroup);
        // shape
        var shape = stateGroup.getChildren(dwv.draw.isNodeNameShape)[0];
        // create the draw command
        var cmd = new dwv.tool.DrawGroupCommand(
          stateGroup, shape.className,
          konvaLayer, true);
        // draw command callbacks
        cmd.onExecute = cmdCallback;
        cmd.onUndo = cmdCallback;
        // details
        if (drawingsDetails) {
          var details = drawingsDetails[stateGroup.id()];
          var label = stateGroup.getChildren(dwv.draw.isNodeNameLabel)[0];
          var text = label.getText();
          // store details
          text.meta = details.meta;
          // reset text (it was not encoded)
          text.setText(dwv.utils.replaceFlags(
            text.meta.textExpr, text.meta.quantification
          ));
        }
        // execute
        cmd.execute();
        exeCallback(cmd);
      }
    }
  };

  /**
   * Update a drawing from its details.
   *
   * @param {object} drawDetails Details of the drawing to update.
   */
  this.updateDraw = function (drawDetails) {
    // get the group
    var group = konvaLayer.findOne('#' + drawDetails.id);
    if (typeof group === 'undefined') {
      dwv.logger.warn(
        '[updateDraw] Cannot find group with id: ' + drawDetails.id
      );
      return;
    }
    // shape
    var shapes = group.getChildren(dwv.draw.isNodeNameShape);
    for (var i = 0; i < shapes.length; ++i) {
      shapes[i].stroke(drawDetails.color);
    }
    // shape extra
    var shapesExtra = group.getChildren(dwv.draw.isNodeNameShapeExtra);
    for (var j = 0; j < shapesExtra.length; ++j) {
      if (typeof shapesExtra[j].stroke() !== 'undefined') {
        shapesExtra[j].stroke(drawDetails.color);
      } else if (typeof shapesExtra[j].fill() !== 'undefined') {
        // for example text
        shapesExtra[j].fill(drawDetails.color);
      }
    }
    // label
    var label = group.getChildren(dwv.draw.isNodeNameLabel)[0];
    var shadowColor = dwv.html.getShadowColour(drawDetails.color);
    var kids = label.getChildren();
    for (var k = 0; k < kids.length; ++k) {
      var kid = kids[k];
      kid.fill(drawDetails.color);
      if (kids[k].className === 'Text') {
        var text = kids[k];
        text.shadowColor(shadowColor);
        text.meta = drawDetails.meta;
        text.setText(dwv.utils.replaceFlags(
          text.meta.textExpr, text.meta.quantification
        ));
      }
    }

    // udpate current layer
    konvaLayer.draw();
  };

  /**
   * Check the visibility of a given group.
   *
   * @param {object} drawDetails Details of the group to check.
   * @returns {boolean} True if the group is visible.
   */
  this.isGroupVisible = function (drawDetails) {
    // get the group
    var group = konvaLayer.findOne('#' + drawDetails.id);
    if (typeof group === 'undefined') {
      dwv.logger.warn(
        '[isGroupVisible] Cannot find node with id: ' + drawDetails.id
      );
      return false;
    }
    // get visibility
    return group.isVisible();
  };

  /**
   * Toggle the visibility of a given group.
   *
   * @param {object} drawDetails Details of the group to update.
   * @returns {boolean} False if the group cannot be found.
   */
  this.toogleGroupVisibility = function (drawDetails) {
    // get the group
    var group = konvaLayer.findOne('#' + drawDetails.id);
    if (typeof group === 'undefined') {
      dwv.logger.warn(
        '[toogleGroupVisibility] Cannot find node with id: ' + drawDetails.id
      );
      return false;
    }
    // toggle visible
    group.visible(!group.isVisible());

    // udpate current layer
    konvaLayer.draw();
  };

  /**
   * Delete a Draw from the stage.
   *
   * @param {number} groupId The group id of the group to delete.
   * @param {object} cmdCallback The DeleteCommand callback.
   * @param {object} exeCallback The callback to call once the
   *   DeleteCommand has been executed.
   */
  this.deleteDrawGroupId = function (groupId, cmdCallback, exeCallback) {
    var groups = konvaLayer.getChildren();
    var groupToDelete = groups.getChildren(function (node) {
      return node.id() === groupId;
    });
    if (groupToDelete.length === 1) {
      this.deleteDrawGroup(groupToDelete[0], cmdCallback, exeCallback);
    } else if (groupToDelete.length === 0) {
      dwv.logger.warn('Can\'t delete group with id:\'' + groupId +
        '\', cannot find it.');
    } else {
      dwv.logger.warn('Can\'t delete group with id:\'' + groupId +
        '\', too many with the same id.');
    }
  };

  /**
   * Delete a Draw from the stage.
   *
   * @param {object} group The group to delete.
   * @param {object} cmdCallback The DeleteCommand callback.
   * @param {object} exeCallback The callback to call once the
   *  DeleteCommand has been executed.
   */
  this.deleteDrawGroup = function (group, cmdCallback, exeCallback) {
    var shape = group.getChildren(dwv.draw.isNodeNameShape)[0];
    var shapeDisplayName = dwv.tool.GetShapeDisplayName(shape);
    var delcmd = new dwv.tool.DeleteGroupCommand(
      group, shapeDisplayName, konvaLayer);
    delcmd.onExecute = cmdCallback;
    delcmd.onUndo = cmdCallback;
    delcmd.execute();
    exeCallback(delcmd);
  };

  /**
   * Delete all Draws from the stage.
   *
   * @param {object} cmdCallback The DeleteCommand callback.
   * @param {object} exeCallback The callback to call once the
   *  DeleteCommand has been executed.
   */
  this.deleteDraws = function (cmdCallback, exeCallback) {
    var groups = konvaLayer.getChildren();
    while (groups.length) {
      this.deleteDrawGroup(groups[0], cmdCallback, exeCallback);
    }
  };

}; // class dwv.DrawController
