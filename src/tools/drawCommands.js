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
 * Get the display name of the input shape.
 *
 * @param {object} shape The Konva shape.
 * @returns {string} The display name.
 */
dwv.tool.GetShapeDisplayName = function (shape) {
  var displayName = 'shape';
  if (shape instanceof Konva.Line) {
    if (shape.points().length === 4) {
      displayName = 'line';
    } else if (shape.points().length === 6) {
      displayName = 'protractor';
    } else {
      displayName = 'roi';
    }
  } else if (shape instanceof Konva.Rect) {
    displayName = 'rectangle';
  } else if (shape instanceof Konva.Ellipse) {
    displayName = 'ellipse';
  }
  // return
  return displayName;
};

/**
 * Draw group command.
 *
 * @param {object} group The group draw.
 * @param {string} name The shape display name.
 * @param {object} layer The layer where to draw the group.
 * @param {object} silent Whether to send a creation event or not.
 * @class
 */
dwv.tool.DrawGroupCommand = function (group, name, layer, silent) {
  var isSilent = (typeof silent === 'undefined') ? false : true;

  // group parent
  var parent = group.getParent();

  /**
   * Get the command name.
   *
   * @returns {string} The command name.
   */
  this.getName = function () {
    return 'Draw-' + name;
  };
  /**
   * Execute the command.
   *
   * @fires dwv.tool.DrawGroupCommand#drawcreate
   */
  this.execute = function () {
    // add the group to the parent (in case of undo/redo)
    parent.add(group);
    // draw
    layer.draw();
    // callback
    if (!isSilent) {
      /**
       * Draw create event.
       *
       * @event dwv.tool.DrawGroupCommand#drawcreate
       * @type {object}
       * @property {number} id The id of the create draw.
       */
      this.onExecute({
        'type': 'draw-create',
        'id': group.id()
      });
    }
  };
  /**
   * Undo the command.
   *
   * @fires dwv.tool.DeleteGroupCommand#drawdelete
   */
  this.undo = function () {
    // remove the group from the parent layer
    group.remove();
    // draw
    layer.draw();
    // callback
    this.onUndo({
      'type': 'draw-delete',
      'id': group.id()
    });
  };
}; // DrawGroupCommand class

/**
 * Handle an execute event.
 *
 * @param {object} _event The execute event with type and id.
 */
dwv.tool.DrawGroupCommand.prototype.onExecute = function (_event) {
  // default does nothing.
};
/**
 * Handle an undo event.
 *
 * @param {object} _event The undo event with type and id.
 */
dwv.tool.DrawGroupCommand.prototype.onUndo = function (_event) {
  // default does nothing.
};

/**
 * Move group command.
 *
 * @param {object} group The group draw.
 * @param {string} name The shape display name.
 * @param {object} translation A 2D translation to move the group by.
 * @param {object} layer The layer where to move the group.
 * @class
 */
dwv.tool.MoveGroupCommand = function (group, name, translation, layer) {
  /**
   * Get the command name.
   *
   * @returns {string} The command name.
   */
  this.getName = function () {
    return 'Move-' + name;
  };

  /**
   * Execute the command.
   *
   * @fires dwv.tool.MoveGroupCommand#drawmove
   */
  this.execute = function () {
    // translate group
    group.move(translation);
    // draw
    layer.draw();
    // callback
    /**
     * Draw move event.
     *
     * @event dwv.tool.MoveGroupCommand#drawmove
     * @type {object}
     * @property {number} id The id of the create draw.
     */
    this.onExecute({
      'type': 'draw-move',
      'id': group.id()
    });
  };
  /**
   * Undo the command.
   *
   * @fires dwv.tool.MoveGroupCommand#drawmove
   */
  this.undo = function () {
    // invert translate group
    var minusTrans = {'x': -translation.x, 'y': -translation.y};
    group.move(minusTrans);
    // draw
    layer.draw();
    // callback
    this.onUndo({
      'type': 'draw-move',
      'id': group.id()
    });
  };
}; // MoveGroupCommand class

/**
 * Handle an execute event.
 *
 * @param {object} _event The execute event with type and id.
 */
dwv.tool.MoveGroupCommand.prototype.onExecute = function (_event) {
  // default does nothing.
};
/**
 * Handle an undo event.
 *
 * @param {object} _event The undo event with type and id.
 */
dwv.tool.MoveGroupCommand.prototype.onUndo = function (_event) {
  // default does nothing.
};

/**
 * Change group command.
 *
 * @param {string} name The shape display name.
 * @param {object} func The change function.
 * @param {object} startAnchor The anchor that starts the change.
 * @param {object} endAnchor The anchor that ends the change.
 * @param {object} layer The layer where to change the group.
 * @param {object} image The associated image.
 * @class
 */
dwv.tool.ChangeGroupCommand = function (
  name, func, startAnchor, endAnchor, layer, image) {
  /**
   * Get the command name.
   *
   * @returns {string} The command name.
   */
  this.getName = function () {
    return 'Change-' + name;
  };

  /**
   * Execute the command.
   *
   * @fires dwv.tool.ChangeGroupCommand#drawchange
   */
  this.execute = function () {
    // change shape
    func(endAnchor, image);
    // draw
    layer.draw();
    // callback
    /**
     * Draw change event.
     *
     * @event dwv.tool.ChangeGroupCommand#drawchange
     * @type {object}
     */
    this.onExecute({
      'type': 'draw-change'
    });
  };
  /**
   * Undo the command.
   *
   * @fires dwv.tool.ChangeGroupCommand#drawchange
   */
  this.undo = function () {
    // invert change shape
    func(startAnchor, image);
    // draw
    layer.draw();
    // callback
    this.onUndo({
      'type': 'draw-change'
    });
  };
}; // ChangeGroupCommand class

/**
 * Handle an execute event.
 *
 * @param {object} _event The execute event with type and id.
 */
dwv.tool.ChangeGroupCommand.prototype.onExecute = function (_event) {
  // default does nothing.
};
/**
 * Handle an undo event.
 *
 * @param {object} _event The undo event with type and id.
 */
dwv.tool.ChangeGroupCommand.prototype.onUndo = function (_event) {
  // default does nothing.
};

/**
 * Delete group command.
 *
 * @param {object} group The group draw.
 * @param {string} name The shape display name.
 * @param {object} layer The layer where to delete the group.
 * @class
 */
dwv.tool.DeleteGroupCommand = function (group, name, layer) {
  // group parent
  var parent = group.getParent();

  /**
   * Get the command name.
   *
   * @returns {string} The command name.
   */
  this.getName = function () {
    return 'Delete-' + name;
  };
  /**
   * Execute the command.
   *
   * @fires dwv.tool.DeleteGroupCommand#drawdelete
   */
  this.execute = function () {
    // remove the group from its parent
    group.remove();
    // draw
    layer.draw();
    // callback
    /**
     * Draw delete event.
     *
     * @event dwv.tool.DeleteGroupCommand#drawdelete
     * @type {object}
     * @property {number} id The id of the create draw.
     */
    this.onExecute({
      'type': 'draw-delete',
      'id': group.id()
    });
  };
  /**
   * Undo the command.
   *
   * @fires dwv.tool.DrawGroupCommand#drawcreate
   */
  this.undo = function () {
    // add the group to its parent
    parent.add(group);
    // draw
    layer.draw();
    // callback
    this.onUndo({
      'type': 'draw-create',
      'id': group.id()
    });
  };
}; // DeleteGroupCommand class

/**
 * Handle an execute event.
 *
 * @param {object} _event The execute event with type and id.
 */
dwv.tool.DeleteGroupCommand.prototype.onExecute = function (_event) {
  // default does nothing.
};
/**
 * Handle an undo event.
 *
 * @param {object} _event The undo event with type and id.
 */
dwv.tool.DeleteGroupCommand.prototype.onUndo = function (_event) {
  // default does nothing.
};
