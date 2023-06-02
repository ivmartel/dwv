import {logger} from '../utils/logger';

// doc imports
/* eslint-disable no-unused-vars */
import {Image} from './image';
/* eslint-enable no-unused-vars */

/**
 * Mask segment helper.
 */
export class MaskSegmentHelper {

  /**
   * The associated mask.
   *
   * @type {Image}
   */
  #mask;

  /**
   * The segments: array of segment description.
   *
   * @type {Array}
   */
  #segments;

  /**
   * List of ids of hidden segments.
   *
   * @type {Array}
   */
  #hiddenSegments = [];

  /**
   * @param {Image} mask The associated mask image.
   */
  constructor(mask) {
    this.#mask = mask;
    this.#segments = mask.getMeta().custom.segments;
  }

  /**
   * Check if a segment is part of the inner segment list.
   *
   * @param {number} segmentNumber The segment number.
   * @returns {boolean} True if the segment is included.
   */
  hasSegment(segmentNumber) {
    return typeof this.getSegment(segmentNumber) !== 'undefined';
  }

  /**
   * Check if a segment is present in a mask image.
   *
   * @param {Array} numbers Array of segment numbers.
   * @returns {Array} Array of boolean set to true
   *   if the segment is present in the mask.
   */
  maskHasSegments(numbers) {
    // create values using displayValue
    const values = [];
    const unknowns = [];
    for (let i = 0; i < numbers.length; ++i) {
      const segment = this.getSegment(numbers[i]);
      if (typeof segment !== 'undefined') {
        values.push(segment.displayValue);
      } else {
        logger.warn('Unknown segment in maskHasSegments: ' + numbers[i]);
        unknowns.push(i);
      }
    }
    const res = this.#mask.hasValues(values);
    // insert unknowns as false in result
    for (let j = 0; j < unknowns.length; ++j) {
      res.splice(unknowns[j], 0, false);
    }
    return res;
  }

  /**
   * Get a segment from the inner segment list.
   *
   * @param {number} segmentNumber The segment number.
   * @returns {object} The segment.
   */
  getSegment(segmentNumber) {
    return this.#segments.find(function (item) {
      return item.number === segmentNumber;
    });
  }

  /**
   * Get the inner segment list.
   *
   * @returns {Array} The list of segments.
   */
  getSegments() {
    return this.#segments;
  }

  /**
   * Set the inner segment list.
   *
   * @param {Array} list The segment list.
   */
  setSegments(list) {
    this.#segments = list;
  }

  /**
   * Set the hidden segment list.
   * TODO: not sure if needed...
   *
   * @param {Array} list The list of hidden segment numbers.
   */
  setHiddenSegments(list) {
    this.#hiddenSegments = list;
  }

  /**
   * Get the index of a segment in the hidden list.
   *
   * @param {number} segmentNumber The segment number.
   * @returns {number|undefined} The index in the array.
   */
  #getHiddenIndex(segmentNumber) {
    return this.#hiddenSegments.findIndex(function (item) {
      return item === segmentNumber;
    });
  }

  /**
   * Check if a segment is in the hidden list.
   *
   * @param {number} segmentNumber The segment number.
   * @returns {boolean} True if the segment is in the list.
   */
  isHidden(segmentNumber) {
    return this.#getHiddenIndex(segmentNumber) !== -1;
  }

  /**
   * Add a segment to the hidden list.
   *
   * @param {number} segmentNumber The segment number.
   */
  addToHidden(segmentNumber) {
    if (!this.isHidden(segmentNumber)) {
      this.#hiddenSegments.push(segmentNumber);
    } else {
      logger.warn(
        'Segment is allready in the hidden list: ' + segmentNumber);
    }
  }

  /**
   * Remove a segment from the hidden list.
   *
   * @param {number} segmentNumber The segment number.
   */
  removeFromHidden(segmentNumber) {
    const index = this.#getHiddenIndex(segmentNumber);
    if (index !== -1) {
      this.#hiddenSegments.splice(index, 1);
    } else {
      logger.warn('Segment is not in the hidden list: ' + segmentNumber);
    }
  }

  /**
   * @callback alphaFn
   * @param {object} value The pixel value.
   * @param {object} index The values' index.
   * @returns {number} The value to display.
   */

  /**
   * Get the alpha function to apply hidden colors.
   *
   * @returns {alphaFn} The corresponding alpha function.
   */
  getAlphaFunc() {
    // get colours
    const hiddenColours = [{r: 0, g: 0, b: 0}];
    for (let i = 0; i < this.#hiddenSegments.length; ++i) {
      const segment = this.getSegment(this.#hiddenSegments[i]);
      if (typeof segment !== 'undefined') {
        hiddenColours.push(segment.displayValue);
      }
    }

    // create alpha function
    return function (value/*, index*/) {
      for (let i = 0; i < hiddenColours.length; ++i) {
        if (value[0] === hiddenColours[i].r &&
          value[1] === hiddenColours[i].g &&
          value[2] === hiddenColours[i].b) {
          return 0;
        }
      }
      // default
      return 255;
    };
  }

  /**
   * @callback eventFn
   * @param {object} event The event.
   */

  /**
   * Delete a segment.
   *
   * @param {number} segmentNumber The segment number.
   * @param {eventFn} cmdCallback The command event callback.
   * @param {Function} exeCallback The post execution callback.
   */
  deleteSegment(segmentNumber, cmdCallback, exeCallback) {
    const delcmd = new DeleteSegmentCommand(
      this.#mask, this.getSegment(segmentNumber));
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
  }

} // class MaskSegmentHelper

/**
 * Delete segment command.
 */
export class DeleteSegmentCommand {

  /**
   * The associated mask.
   *
   * @type {Image}
   */
  #mask;

  /**
   * The segment to remove.
   *
   * @type {object}
   */
  #segment;

  /**
   * Flag to send creation events.
   *
   * @type {boolean}
   */
  #isSilent;

  /**
   * List of offsets.
   *
   * @type {Array}
   */
  #offsets;

  /**
   * @param {Image} mask The mask image.
   * @param {object} segment The segment to remove.
   * @param {boolean} [silent] Whether to send a creation event or not.
   */
  constructor(mask, segment, silent) {
    this.#mask = mask;
    this.#segment = segment;

    this.#isSilent = (typeof silent === 'undefined') ? false : silent;
    // list of offsets with the colour to delete
    this.#offsets = mask.getOffsets(segment.displayValue);
  }

  /**
   * Get the command name.
   *
   * @returns {string} The command name.
   */
  getName() {
    return 'Delete-segment';
  }

  /**
   * Check if a command is valid and can be executed.
   *
   * @returns {boolean} True if the command is valid.
   */
  isValid() {
    return this.#offsets.length !== 0;
  }

  /**
   * Execute the command.
   *
   * @fires DeleteSegmentCommand#masksegmentdelete
   */
  execute() {
    // remove
    this.#mask.setAtOffsets(this.#offsets, {r: 0, g: 0, b: 0});

    // callback
    if (!this.#isSilent) {
      /**
       * Segment delete event.
       *
       * @event DeleteSegmentCommand#masksegmentdelete
       * @type {object}
       * @property {number} segmentnumber The segment number.
       */
      this.onExecute({
        type: 'masksegmentdelete',
        segmentnumber: this.#segment.number
      });
    }
  }

  /**
   * Undo the command.
   *
   * @fires DeleteSegmentCommand#masksegmentredraw
   */
  undo() {
    // re-draw
    this.#mask.setAtOffsets(this.#offsets, this.#segment.displayValue);

    // callback
    /**
     * Segment redraw event.
     *
     * @event DeleteSegmentCommand#masksegmentredraw
     * @type {object}
     * @property {number} segmentnumber The segment number.
     */
    this.onUndo({
      type: 'masksegmentredraw',
      segmentnumber: this.#segment.number
    });
  }

  /**
   * Handle an execute event.
   *
   * @param {object} _event The execute event with type and id.
   */
  onExecute(_event) {
    // default does nothing.
  }

  /**
   * Handle an undo event.
   *
   * @param {object} _event The undo event with type and id.
   */
  onUndo(_event) {
    // default does nothing.
  }

} // DeleteSegmentCommand class
