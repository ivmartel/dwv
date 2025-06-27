// doc imports
/* eslint-disable no-unused-vars */
import {Image} from './image.js';
import {MaskSegment} from '../dicom/dicomSegment.js';
import {RGB} from '../utils/colour.js';
/* eslint-enable no-unused-vars */

/**
 * Change segment colour command.
 */
export class ChangeSegmentColourCommand {

  /**
   * The associated mask.
   *
   * @type {Image}
   */
  #mask;

  /**
   * The segment to modify.
   *
   * @type {MaskSegment}
   */
  #segment;

  /**
   * The new segment colour.
   *
   * @type {RGB|number}
   */
  #newColour;

  /**
   * The previous segment colour.
   *
   * @type {RGB|number}
   */
  #previousColour;

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
   * @param {MaskSegment} segment The segment to modify.
   * @param {RGB|number} newColour The new segment colour.
   * @param {boolean} [silent] Whether to send a creation event or not.
   */
  constructor(mask, segment, newColour, silent) {
    this.#mask = mask;
    this.#segment = segment;
    this.#newColour = newColour;

    this.#isSilent = (typeof silent === 'undefined') ? false : silent;
    // list of offsets with the colour to delete
    if (typeof segment.displayRGBValue !== 'undefined') {
      this.#previousColour = segment.displayRGBValue;
    } else {
      this.#previousColour = segment.displayValue;
      this.#offsets = mask.getOffsets(this.#previousColour);
    }
  }

  /**
   * Get the command name.
   *
   * @returns {string} The command name.
   */
  getName() {
    return 'Change-segment-colour';
  }

  /**
   * Check if a command is valid and can be executed.
   *
   * @returns {boolean} True if the command is valid.
   */
  isValid() {
    let valid = true;
    if (typeof this.#offsets !== 'undefined') {
      valid = this.#offsets.length !== 0;
    }
    return valid;
  }

  /**
   * Execute the command.
   *
   * @fires ChangeSegmentColourCommand#changemasksegmentcolour
   */
  execute() {
    // update segment property
    if (typeof this.#newColour === 'number') {
      // remove
      this.#mask.setAtOffsets(this.#offsets, this.#newColour);
      // update segment
      this.#segment.displayValue = this.#newColour;
    } else {
      // update palette colour map (sends update event)
      this.#mask.updatePaletteColourMap(
        this.#segment.number,
        this.#newColour
      );
      // update segment
      this.#segment.displayRGBValue = this.#newColour;
    }

    // callback
    if (!this.#isSilent) {
      /**
       * Segment delete event.
       *
       * @event ChangeSegmentColourCommand#changemasksegmentcolour
       * @type {object}
       * @property {number} segmentnumber The segment number.
       */
      this.onExecute({
        type: 'changemasksegmentcolour',
        segmentnumber: this.#segment.number,
        value: [this.#newColour]
      });
    }
  }

  /**
   * Undo the command.
   *
   * @fires ChangeSegmentColourCommand#changemasksegmentcolour
   */
  undo() {
    // update segment property
    if (typeof this.#previousColour === 'number') {
      // update values
      this.#mask.setAtOffsets(this.#offsets, this.#previousColour);
      // update segment
      this.#segment.displayValue = this.#previousColour;
    } else {
      // update palette colour map (sends update event)
      this.#mask.updatePaletteColourMap(
        this.#segment.number,
        this.#previousColour
      );
      // udpate segment
      this.#segment.displayRGBValue = this.#previousColour;
    }

    // callback
    /**
     * Segment redraw event.
     *
     * @event ChangeSegmentColourCommand#changemasksegmentcolour
     * @type {object}
     * @property {number} segmentnumber The segment number.
     */
    this.onUndo({
      type: 'changemasksegmentcolour',
      segmentnumber: this.#segment.number,
      value: [this.#previousColour]
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

} // ChangeSegmentColourCommand class
