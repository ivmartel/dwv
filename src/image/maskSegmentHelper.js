// namespaces
var dwv = dwv || {};
dwv.image = dwv.image || {};

/**
 * Mask segment helper.
 *
 * @class
 * @param {object} mask The associated mask image.
 */
dwv.image.MaskSegmentHelper = function (mask) {

  /**
   * The segments: array of segment description.
   *
   * @private
   * @type {Array}
   */
  var segments = mask.getMeta().custom.segments;

  /**
   * List of ids of hidden segments.
   *
   * @private
   * @type {Array}
   */
  var hiddenSegments = [];

  /**
   * Check if a segment is part of the inner segment list.
   *
   * @param {number} segmentNumber The segment number.
   * @returns {boolean} True if the segment is included.
   */
  this.hasSegment = function (segmentNumber) {
    return typeof this.getSegment(segmentNumber) !== 'undefined';
  };

  /**
   * Check if a segment is present in a mask image.
   *
   * @param {number} segmentNumber The segment number.
   * @returns {boolean} True if the segment is present in the mask.
   */
  this.maskHasSegment = function (segmentNumber) {
    var segment = this.getSegment(segmentNumber);
    if (typeof segment === 'undefined') {
      return true;
    }
    return mask.getOffsets(segment.displayValue).length !== 0;
  };

  /**
   * Get a segment from the inner segment list.
   *
   * @param {number} segmentNumber The segment number.
   * @returns {object} The segment.
   */
  this.getSegment = function (segmentNumber) {
    return segments.find(function (item) {
      return item.number === segmentNumber;
    });
  };

  /**
   * Get the inner segment list.
   *
   * @returns {Array} The list of segments.
   */
  this.getSegments = function () {
    return segments;
  };

  /**
   * Set the inner segment list.
   *
   * @param {Array} list The segment list.
   */
  this.setSegments = function (list) {
    segments = list;
  };

  /**
   * Set the hidden segment list.
   * TODO: not sure if needed...
   *
   * @param {Array} list The list of hidden segment numbers.
   */
  this.setHiddenSegments = function (list) {
    hiddenSegments = list;
  };

  /**
   * Get the index of a segment in the hidden list.
   *
   * @param {number} segmentNumber The segment number.
   * @returns {number|undefined} The index in the array.
   */
  function getHiddenIndex(segmentNumber) {
    return hiddenSegments.findIndex(function (item) {
      return item === segmentNumber;
    });
  }

  /**
   * Check if a segment is in the hidden list.
   *
   * @param {number} segmentNumber The segment number.
   * @returns {boolean} True if the segment is in the list.
   */
  this.isHidden = function (segmentNumber) {
    return getHiddenIndex(segmentNumber) !== -1;
  };

  /**
   * Add a segment to the hidden list.
   *
   * @param {number} segmentNumber The segment number.
   */
  this.addToHidden = function (segmentNumber) {
    if (!this.isHidden(segmentNumber)) {
      hiddenSegments.push(segmentNumber);
    } else {
      dwv.logger.warn(
        'Segment is allready in the hidden list: ' + segmentNumber);
    }
  };

  /**
   * Remove a segment from the hidden list.
   *
   * @param {number} segmentNumber The segment number.
   */
  this.removeFromHidden = function (segmentNumber) {
    var index = getHiddenIndex(segmentNumber);
    if (index !== -1) {
      hiddenSegments.splice(index, 1);
    } else {
      dwv.logger.warn('Segment is not in the hidden list: ' + segmentNumber);
    }
  };

  /**
   * Get the alpha function to apply hidden colors.
   *
   * @returns {Function} The corresponding alpha function.
   */
  this.getAlphaFunc = function () {
    // get colours
    var hiddenColours = [{r: 0, g: 0, b: 0}];
    for (var i = 0; i < hiddenSegments.length; ++i) {
      var segment = this.getSegment(hiddenSegments[i]);
      if (typeof segment !== 'undefined') {
        hiddenColours.push(segment.displayValue);
      }
    }

    // create alpha function
    return function (value/*, index*/) {
      for (var i = 0; i < hiddenColours.length; ++i) {
        if (value[0] === hiddenColours[i].r &&
          value[1] === hiddenColours[i].g &&
          value[2] === hiddenColours[i].b) {
          return 0;
        }
      }
      // default
      return 255;
    };
  };

  /**
   * Delete a segment.
   *
   * @param {number} segmentNumber The segment number.
   * @param {Function} cmdCallback The command event callback.
   * @param {Function} exeCallback The post execution callback.
   */
  this.deleteSegment = function (segmentNumber, cmdCallback, exeCallback) {
    var delcmd = new dwv.image.DeleteSegmentCommand(
      mask, this.getSegment(segmentNumber));
    delcmd.onExecute = cmdCallback;
    delcmd.onUndo = cmdCallback;
    if (delcmd.isValid()) {
      delcmd.execute();
      // callback
      exeCallback(delcmd);
      // possibly hidden
      if (this.isHidden(segmentNumber)) {
        this.removeFromHidden(segmentNumber);
      }
    }
  };
};

/**
 * Delete segment command.
 *
 * @param {object} mask The mask image.
 * @param {object} segment The segment to remove.
 * @param {boolean} silent Whether to send a creation event or not.
 * @class
 */
dwv.image.DeleteSegmentCommand = function (mask, segment, silent) {
  var isSilent = (typeof silent === 'undefined') ? false : silent;

  // list of offsets with the colour to delete
  var offsets = mask.getOffsets(segment.displayValue);

  /**
   * Get the command name.
   *
   * @returns {string} The command name.
   */
  this.getName = function () {
    return 'Delete-segment';
  };

  /**
   * Check if a command is valid and can be executed.
   *
   * @returns {boolean} True if the command is valid.
   */
  this.isValid = function () {
    return offsets.length !== 0;
  };

  /**
   * Execute the command.
   *
   * @fires dwv.image.DeleteSegmentCommand#masksegmentdelete
   */
  this.execute = function () {
    // remove
    mask.setAtOffsets(offsets, {r: 0, g: 0, b: 0});

    // callback
    if (!isSilent) {
      /**
       * Segment delete event.
       *
       * @event dwv.image.DeleteSegmentCommand#masksegmentdelete
       * @type {object}
       * @property {number} segmentnumber The segment number.
       */
      this.onExecute({
        type: 'masksegmentdelete',
        segmentnumber: segment.number
      });
    }
  };

  /**
   * Undo the command.
   *
   * @fires dwv.image.DeleteSegmentCommand#masksegmentredraw
   */
  this.undo = function () {
    // re-draw
    mask.setAtOffsets(offsets, segment.displayValue);

    // callback
    /**
     * Segment redraw event.
     *
     * @event dwv.image.DeleteSegmentCommand#masksegmentredraw
     * @type {object}
     * @property {number} segmentnumber The segment number.
     */
    this.onUndo({
      type: 'masksegmentredraw',
      segmentnumber: segment.number
    });
  };
}; // DeleteSegmentCommand class

/**
 * Handle an execute event.
 *
 * @param {object} _event The execute event with type and id.
 */
dwv.image.DeleteSegmentCommand.prototype.onExecute = function (_event) {
  // default does nothing.
};
/**
 * Handle an undo event.
 *
 * @param {object} _event The undo event with type and id.
 */
dwv.image.DeleteSegmentCommand.prototype.onUndo = function (_event) {
  // default does nothing.
};