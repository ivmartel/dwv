import {Command} from './undoStack.js';

/**
 * @import {App} from '../app/application.js';
 */

/**
 * Run filter command.
 */
export class RunFilterCommand extends Command {

  /**
   * The filter to run.
   *
   * @type {object}
   */
  #filter;

  /**
   * Data id.
   *
   * @type {string}
   */
  #dataId;

  /**
   * Associated app.
   *
   * @type {App}
   */
  #app;

  /**
   * @param {object} filter The filter to run.
   * @param {string} dataId The data to filter.
   * @param {App} app The associated application.
   */
  constructor(filter, dataId, app) {
    super();
    this.#filter = filter;
    this.#dataId = dataId;
    this.#app = app;
  }

  /**
   * Get the command name.
   *
   * @returns {string} The command name.
   */
  getName() {
    return `Filter-${this.#filter.getName()}`;
  }

  /**
   * Execute the command.
   *
   * @fires RunFilterCommand#filterrun
   */
  execute() {
    // run filter and set app image
    this.#app.setImage(this.#dataId, this.#filter.update());
    // update display
    this.#app.render(this.#dataId);
    /**
     * Filter run event.
     *
     * @event RunFilterCommand#filterrun
     * @type {object}
     * @property {string} type The event type: filterrun.
     * @property {number} id The id of the run command.
     */
    const event = {
      type: 'filterrun',
      id: this.getName(),
      dataId: this.#dataId
    };
    // callback
    this.onExecute(event);
  }

  /**
   * Undo the command.
   *
   * @fires RunFilterCommand#filterundo
   */
  undo() {
    // reset the image
    this.#app.setImage(this.#dataId, this.#filter.getOriginalImage());
    // update display
    this.#app.render(this.#dataId);
    /**
     * Filter undo event.
     *
     * @event RunFilterCommand#filterundo
     * @type {object}
     * @property {string} type The event type: filterundo.
     * @property {number} id The id of the undone run command.
     */
    const event = {
      type: 'filterundo',
      id: this.getName(),
      dataid: this.#dataId
    }; // callback
    this.onUndo(event);
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

} // RunFilterCommand class