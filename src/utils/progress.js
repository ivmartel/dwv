/**
 * Multiple progresses handler.
 * Stores a multi dimensional list of progresses to allow to
 * calculate a global progress.
 *
 */
export class MultiProgressHandler {

  /**
   * List of progresses.
   * First dimension is a list of item for which the progress is recorded,
   *   for example file names.
   * Second dimension is a list of possible progresses, for example
   *   the progress of the download and the progress of the decoding.
   *
   * @type {Array}
   */
  #progresses = [];

  /**
   * Number of dimensions.
   *
   * @type {number}
   */
  #numberOfDimensions = 2;

  /**
   * Progress callback.
   *
   * @type {Function}
   */
  #callback;

  /**
   * @param {Function} callback The function to pass the global progress to.
   */
  constructor(callback) {
    this.#callback = callback;
  }

  /**
   * Set the number of dimensions.
   *
   * @param {number} num The number.
   */
  setNumberOfDimensions(num) {
    this.#numberOfDimensions = num;
  }

  /**
   * Set the number of data to load.
   *
   * @param {number} n The number of data to load.
   */
  setNToLoad(n) {
    for (let i = 0; i < n; ++i) {
      this.#progresses[i] = [];
      for (let j = 0; j < this.#numberOfDimensions; ++j) {
        this.#progresses[i][j] = 0;
      }
    }
  }

  /**
   * Handle a load progress.
   * Call the member callback with a global event.
   *
   * @param {object} event The progress event.
   */
  onprogress = (event) => {
    // check event
    if (!event.lengthComputable) {
      return;
    }
    if (typeof event.subindex === 'undefined') {
      return;
    }
    if (typeof event.index === 'undefined') {
      return;
    }
    // calculate percent
    const percent = (event.loaded * 100) / event.total;
    // set percent for index
    this.#progresses[event.index][event.subindex] = percent;

    // item progress
    let item = null;
    if (typeof event.item !== 'undefined') {
      item = event.item;
    } else {
      item = {
        loaded: this.#getItemProgress(event.index),
        total: 100,
        source: event.source
      };
    }

    // call callback with a global event
    this.#callback({
      lengthComputable: true,
      loaded: this.#getGlobalPercent(),
      total: 100,
      item: item
    });
  };

  /**
   * Get the item load percent.
   *
   * @param {number} index The index of the item.
   * @returns {number} The load percentage.
   */
  #getItemProgress(index) {
    let sum = 0;
    for (let j = 0; j < this.#numberOfDimensions; ++j) {
      sum += this.#progresses[index][j];
    }
    return sum / this.#numberOfDimensions;
  }

  /**
   * Get the global load percent including the provided one.
   *
   * @returns {number} The accumulated percentage.
   */
  #getGlobalPercent() {
    let sum = 0;
    const lenprog = this.#progresses.length;
    for (let i = 0; i < lenprog; ++i) {
      sum += this.#getItemProgress(i);
    }
    return Math.round(sum / lenprog);
  }


  /**
   * @callback eventFn
   * @param {object} event The event.
   */

  /**
   * Create a mono progress event handler.
   *
   * @param {number} index The index of the data.
   * @param {number} subindex The sub-index of the data.
   * @returns {eventFn} A progress handler function.
   */
  getMonoProgressHandler(index, subindex) {
    return (event) => {
      event.index = index;
      event.subindex = subindex;
      this.onprogress(event);
    };
  }

  /**
   * Create a mono progress event handler with an undefined index.
   * Warning: The caller handles the progress index.
   *
   * @param {number} subindex The sub-index of the data.
   * @returns {eventFn} A progress handler function.
   */
  getUndefinedMonoProgressHandler(subindex) {
    return (event) => {
      event.subindex = subindex;
      this.onprogress(event);
    };
  }
}
