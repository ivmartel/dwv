import {ThreadPool, WorkerTask} from '../utils/thread.js';

/**
 * Jpeg baseline worker task.
 */
class JpegBaselineWorkerTask extends WorkerTask {
  constructor(message, info) {
    super(message, info);
  }
  getWorker() {
    return new Worker(
      new URL('../decoders/pdfjs/jpegbaseline.worker.js', import.meta.url),
      {
        name: 'jpegbaseline.worker'
      }
    );
  }
}

/**
 * Jpeg lossless worker task.
 */
class JpegLosslessWorkerTask extends WorkerTask {
  constructor(message, info) {
    super(message, info);
  }
  getWorker() {
    return new Worker(
      new URL('../decoders/rii-mango/jpegloss.worker.js', import.meta.url),
      {
        name: 'jpegloss.worker'
      }
    );
  }
}

/**
 * Jpeg 2000 worker task.
 */
class Jpeg2000WorkerTask extends WorkerTask {
  constructor(message, info) {
    super(message, info);
  }
  getWorker() {
    return new Worker(
      new URL('../decoders/pdfjs/jpeg2000.worker.js', import.meta.url),
      {
        name: 'jpeg2000.worker'
      }
    );
  }
}

/**
 * RLE worker task.
 */
class RleWorkerTask extends WorkerTask {
  constructor(message, info) {
    super(message, info);
  }
  getWorker() {
    return new Worker(
      new URL('../decoders/dwv/rle.worker.js', import.meta.url),
      {
        name: 'rle.worker'
      }
    );
  }
}

/**
 * Pixel buffer decoder.
 */
export class PixelBufferDecoder {

  /**
   * The name of the compression algorithm.
   *
   * @type {string}
   */
  #algoName;

  /**
   * Associated thread pool.
   *
   * @type {ThreadPool}
   */
  #pool;

  /**
   * Flag to know if callbacks are set.
   *
   * @type {boolean}
   */
  #areCallbacksSet = false;

  /**
   * @param {string} algoName The compression algorithm name.
   */
  constructor(algoName) {
    this.#algoName = algoName;
    // create pool
    this.#pool = new ThreadPool(10);
  }

  /**
   * Decode a pixel buffer.
   *
   * @param {Array} pixelBuffer The pixel buffer.
   * @param {object} pixelMeta The input meta data.
   * @param {object} info Information object about the input data.
   */
  decode(pixelBuffer, pixelMeta, info) {
    // wait until last minute to set callbacks
    if (!this.#areCallbacksSet) {
      this.#areCallbacksSet = true;
      // set event handlers
      this.#pool.onworkstart = this.ondecodestart;
      this.#pool.onworkitem = this.ondecodeditem;
      this.#pool.onwork = this.ondecoded;
      this.#pool.onworkend = this.ondecodeend;
      this.#pool.onerror = this.onerror;
      this.#pool.onabort = this.onabort;
    }

    const message = {
      buffer: pixelBuffer,
      meta: pixelMeta
    };

    let workerTask;
    if (this.#algoName === 'jpeg-baseline') {
      workerTask = new JpegBaselineWorkerTask(message, info);
    } else if (this.#algoName === 'jpeg-lossless') {
      workerTask = new JpegLosslessWorkerTask(message, info);
    } else if (this.#algoName === 'jpeg2000') {
      workerTask = new Jpeg2000WorkerTask(message, info);
    } else if (this.#algoName === 'rle') {
      workerTask = new RleWorkerTask(message, info);
    }

    // add it the queue and run it
    if (typeof workerTask !== 'undefined') {
      this.#pool.addWorkerTask(workerTask);
    }
  }

  /**
   * Abort decoding.
   */
  abort() {
    // abort the thread pool, will trigger pool.onabort
    this.#pool.abort();
  }

  /**
   * Handle a decode start event.
   * Default does nothing.
   *
   * @param {object} _event The decode start event.
   */
  ondecodestart(_event) {}

  /**
   * Handle a decode item event.
   * Default does nothing.
   *
   * @param {object} _event The decode item event fired
   *   when a decode item ended successfully.
   */
  ondecodeditem(_event) {}

  /**
   * Handle a decode event.
   * Default does nothing.
   *
   * @param {object} _event The decode event fired
   *   when a file has been decoded successfully.
   */
  ondecoded(_event) {}

  /**
   * Handle a decode end event.
   * Default does nothing.
   *
   * @param {object} _event The decode end event fired
   *  when a file decoding has completed, successfully or not.
   */
  ondecodeend(_event) {}

  /**
   * Handle an error event.
   * Default does nothing.
   *
   * @param {object} _event The error event.
   */
  onerror(_event) {}

  /**
   * Handle an abort event.
   * Default does nothing.
   *
   * @param {object} _event The abort event.
   */
  onabort(_event) {}

} // class PixelBufferDecoder
