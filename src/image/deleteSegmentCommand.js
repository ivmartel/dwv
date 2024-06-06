import {MaskSegmentHelper} from './maskSegmentHelper';
import {BLACK} from '../utils/colour';

// doc imports
/* eslint-disable no-unused-vars */
import {Image} from './image';
import {MaskSegment} from '../dicom/dicomSegment';
/* eslint-enable no-unused-vars */

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
   * @type {MaskSegment}
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
   * @type {number[]}
   */
  #offsets;

  /**
   * @param {Image} mask The mask image.
   * @param {MaskSegment} segment The segment to remove.
   * @param {boolean} [silent] Whether to send a creation event or not.
   */
  constructor(mask, segment, silent) {
    this.#mask = mask;
    this.#segment = segment;

    this.#isSilent = (typeof silent === 'undefined') ? false : silent;
    // list of offsets with the colour to delete
    if (typeof segment.displayRGBValue !== 'undefined') {
      this.#offsets = mask.getOffsets(segment.displayRGBValue);
    } else {
      this.#offsets = mask.getOffsets(segment.displayValue);
    }
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
    // remove from image
    if (typeof this.#segment.displayRGBValue !== 'undefined') {
      this.#mask.setAtOffsets(this.#offsets, BLACK);
    } else {
      this.#mask.setAtOffsets(this.#offsets, 0);
    }
    // remove from segments
    const segHelper = new MaskSegmentHelper(this.#mask);
    segHelper.removeSegment(this.#segment.number);

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
    // re-draw in image
    if (typeof this.#segment.displayRGBValue !== 'undefined') {
      this.#mask.setAtOffsets(this.#offsets, this.#segment.displayRGBValue);
    } else {
      this.#mask.setAtOffsets(this.#offsets, this.#segment.displayValue);
    }
    // add back to segments
    const segHelper = new MaskSegmentHelper(this.#mask);
    segHelper.addSegment(this.#segment);

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
