import {Command} from './undoStack.js';

export class DrawBrushCommandProperties {
  mask;
  dataId;
  offsetsLists;
  mode;
  segmentNumber;
  srclayerid;
  originalValuesLists;
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

  #exeType;
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