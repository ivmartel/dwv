import {Command} from './undoStack.js';

/**
 * @import {MaskImage} from '../image/maskImage.js';
 */

export class DrawBrushCommandProperties {
  /**
   * @type {MaskImage}
   */
  mask;
  /**
   * @type {string}
   */
  dataId;
  /**
   * @type {number[][]}
   */
  offsetsLists;
  /**
   * @type {string}
   */
  mode;
  /**
   * @type {number}
   */
  segmentNumber;
  /**
   * @type {string}
   */
  srclayerid;
  /**
   * @type {Array}
   */
  originalValuesLists;
  /**
   * @type {boolean}
   */
  isSilent;
}
/**
 * Draw brush command.
 */
export class DrawBrushCommand extends Command {
  #mask;
  #dataId;
  #offsetsLists;
  #mode;
  #segmentNumber;
  #srclayerid;
  #originalValuesLists;
  #isSilent;

  /**
   * Segment algorithm types changed by this command, as
   *   {number, previousType} items.
   *
   * @type {Array<{number: number, previousType: string}>}
   */
  #segmentTypeChanges = [];

  /**
   * @type {string}
   */
  #exeType;
  /**
   * @type {string}
   */
  #undoType;

  /**
   * @param {DrawBrushCommandProperties} properties The command properties.
   */
  constructor(properties) {
    super();
    this.#mask = properties.mask;
    this.#dataId = properties.dataId;
    this.#offsetsLists = properties.offsetsLists;
    this.#mode = properties.mode;
    this.#segmentNumber = properties.segmentNumber;
    this.#srclayerid = properties.srclayerid;

    if (typeof properties.originalValuesLists !== 'undefined') {
      this.#originalValuesLists = properties.originalValuesLists;
    }
    this.#isSilent = properties.isSilent ?? false;
    // event types
    this.#exeType = this.#mode === 'del' ? 'brushremove' : 'brushdraw';
    this.#undoType =
      this.#exeType === 'brushdraw' ? 'brushremove' : 'brushdraw';
  }

  /**
   * Get the original values before applying brush.
   *
   * @returns {Array|undefined} Lists of original value iterators,
   *   undefined when erasing.
   */
  getOriginalValuesLists() {
    return this.#originalValuesLists;
  }

  /**
   * Get the numbers of the segments edited by this command: the drawn
   *   segment and the segments that had pixels at the brush offsets.
   *
   * @returns {number[]} The segment numbers.
   */
  #getEditedSegmentNumbers() {
    const newValue = this.#exeType === 'brushdraw' ? this.#segmentNumber : 0;
    const numbers = new Set();
    if (newValue !== 0) {
      numbers.add(newValue);
    }
    for (const originalValues of this.#originalValuesLists ?? []) {
      for (const item of originalValues) {
        if (item.value !== 0 && item.value !== newValue) {
          numbers.add(item.value);
        }
      }
    }
    return Array.from(numbers);
  }

  /**
   * Update the algorithm type of the segments edited by this command:
   *   an AUTOMATIC segment edited by the user becomes SEMIAUTOMATIC
   *   (its algorithm name is kept). The change is reverted by undo.
   *
   * Called by execute; call it directly for a command whose
   *   brush values were already applied to the mask.
   */
  updateSegmentTypes() {
    const segments = this.#mask.getMeta()?.custom?.segments;
    if (typeof segments === 'undefined') {
      return;
    }
    for (const number of this.#getEditedSegmentNumbers()) {
      const segment = segments.find(item => item.number === number);
      if (typeof segment !== 'undefined' &&
        segment.algorithmType === 'AUTOMATIC') {
        this.#segmentTypeChanges.push({
          number,
          previousType: segment.algorithmType
        });
        segment.algorithmType = 'SEMIAUTOMATIC';
      }
    }
  }

  /**
   * Revert the segment algorithm type changes of this command.
   */
  #revertSegmentTypes() {
    const segments = this.#mask.getMeta()?.custom?.segments;
    for (const change of this.#segmentTypeChanges) {
      const segment = segments?.find(item => item.number === change.number);
      if (typeof segment !== 'undefined') {
        segment.algorithmType = change.previousType;
      }
    }
    this.#segmentTypeChanges = [];
  }

  /**
   * Get the execute event.
   *
   * @returns {CustomEvent} The event.
   */
  getExecuteEvent() {
    const segNumber =
      this.#exeType === 'brushdraw' ? this.#segmentNumber : undefined;
    return new CustomEvent(this.#exeType, {
      detail: {
        segmentnumber: segNumber,
        dataid: this.#dataId,
        srclayerid: this.#srclayerid
      }
    });
  }

  /**
   * Get the command name.
   *
   * @returns {string} The command name.
   */
  getName() {
    return 'Draw-brush';
  }

  /**
   * Execute the command.
   *
   * @fires DrawBrushCommand#brushdraw
   */
  execute() {
    if (typeof this.#segmentNumber === 'undefined') {
      return;
    }

    let segNumber = this.#segmentNumber;
    if (this.#exeType === 'brushremove') {
      segNumber = 0;
    }

    // draw
    if (typeof this.#originalValuesLists === 'undefined') {
      this.#originalValuesLists = this.#mask.setAtOffsetsAndGetOriginals(
        this.#offsetsLists,
        segNumber
      );
    } else {
      this.#mask.setAtOffsetsWithIterator(this.#offsetsLists, segNumber);
    }
    this.updateSegmentTypes();

    // callback
    if (!this.#isSilent) {
      /**
       * Draw create event.
       *
       * @event DrawBrushCommand#brushdraw
       * @type {object}
       * @property {number} id The id of the created brush.
       */
      this.onExecute(this.getExecuteEvent());
    }
  }

  /**
   * Undo the command.
   *
   * @fires DrawBrushCommand#brushremove
   */
  undo() {
    if (typeof this.#originalValuesLists === 'undefined') {
      this.#originalValuesLists = this.#mask.setAtOffsetsAndGetOriginals(
        this.#offsetsLists,
        0
      );
    } else {
      this.#mask.setAtOffsetsWithIterator(
        this.#offsetsLists, this.#originalValuesLists);
    }
    this.#revertSegmentTypes();

    // callback
    const number =
      this.#undoType === 'brushdraw' ? this.#segmentNumber : undefined;
    const undoEvent = new CustomEvent(this.#undoType, {
      detail: {
        segmentnumber: number,
        dataid: this.#dataId,
        srclayerid: this.#srclayerid
      }
    });
    this.onUndo(undoEvent);
  }

  /**
   * Handle an execute event.
   *
   * @param {CustomEvent} _event The execute event with type and id.
   */
  onExecute(_event) {
    // default does nothing.
  }

  /**
   * Handle an undo event.
   *
   * @param {CustomEvent} _event The undo event with type and id.
   */
  onUndo(_event) {
    // default does nothing.
  }

} // DrawBrushCommand class