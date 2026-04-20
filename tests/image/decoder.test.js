import {describe, test, assert, vi, beforeEach} from 'vitest';

// ---------------------------------------------------------------------------
// Mock ThreadPool so no real Web Worker is ever created.
// The mock exposes spy functions for every method the decoder touches.
// vi.mock is hoisted by Vitest so it runs before any import.
// ---------------------------------------------------------------------------
vi.mock('../../src/utils/thread.js', () => {
  /**
   * Minimal WorkerTask base class used by the internal decoder task classes.
   */
  class WorkerTask {
    /**
     * @param {object} message The start message.
     * @param {object} info Task information.
     */
    constructor(message, info) {
      this.startMessage = message;
      this.info = info;
    }
    /** @returns {undefined} No worker in tests. */
    getWorker() {
      return undefined;
    }
  }

  /**
   * Mock ThreadPool constructor.
   * Uses a regular function (not arrow) so it can be called with `new`.
   * Each instance gets its own spy methods.
   */

  const ThreadPool = vi.fn(function () {
    this.addWorkerTask = vi.fn();
    this.abort = vi.fn();
    this.onworkstart = undefined;
    this.onworkitem = undefined;
    this.onwork = undefined;
    this.onworkend = undefined;
    this.onerror = undefined;
    this.onabort = undefined;
  });

  return {ThreadPool, WorkerTask};
});

import {PixelBufferDecoder} from '../../src/image/decoder.js';
import {ThreadPool} from '../../src/utils/thread.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Return the ThreadPool mock instance created by the last PixelBufferDecoder
 * constructor call.
 *
 * @returns {object} The mock pool instance.
 */
function lastPool() {
  const instances = ThreadPool.mock.instances;
  return instances[instances.length - 1];
}

describe('image', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // Constructor
  // -------------------------------------------------------------------------

  /**
   * Tests for {@link PixelBufferDecoder} constructor.
   *
   * @function module:tests/image~decoderConstructor
   */
  test('PixelBufferDecoder constructor creates a ThreadPool with size 10',
    () => {
      new PixelBufferDecoder('jpeg-baseline');
      assert.equal(ThreadPool.mock.calls.length, 1,
        'ThreadPool constructed once');
      assert.equal(ThreadPool.mock.calls[0][0], 10, 'pool size is 10');
    }
  );

  // -------------------------------------------------------------------------
  // Default event handlers
  // -------------------------------------------------------------------------

  /**
   * Tests that all default event handlers are no-ops.
   *
   * @function module:tests/image~decoderDefaultHandlers
   */
  test('PixelBufferDecoder default event handlers exist and do not throw',
    () => {
      const dec = new PixelBufferDecoder('jpeg-baseline');
      assert.doesNotThrow(() => dec.ondecodestart({}));
      assert.doesNotThrow(() => dec.ondecodeditem({}));
      assert.doesNotThrow(() => dec.ondecoded({}));
      assert.doesNotThrow(() => dec.ondecodeend({}));
      assert.doesNotThrow(() => dec.onerror({}));
      assert.doesNotThrow(() => dec.onabort({}));
    }
  );

  // -------------------------------------------------------------------------
  // decode() — lazy callback wiring
  // -------------------------------------------------------------------------

  /**
   * Tests that the first decode() call wires the decoder's event handlers
   * onto the pool.
   *
   * @function module:tests/image~decoderCallbackWiring
   */
  test('PixelBufferDecoder decode wires event handlers to pool on first call',
    () => {
      const dec = new PixelBufferDecoder('jpeg-baseline');
      const pool = lastPool();

      dec.decode(new Uint8Array([0]), {}, {});

      assert.equal(pool.onworkstart, dec.ondecodestart, 'onworkstart');
      assert.equal(pool.onworkitem, dec.ondecodeditem, 'onworkitem');
      assert.equal(pool.onwork, dec.ondecoded, 'onwork');
      assert.equal(pool.onworkend, dec.ondecodeend, 'onworkend');
      assert.equal(pool.onerror, dec.onerror, 'onerror');
      assert.equal(pool.onabort, dec.onabort, 'onabort');
    }
  );

  /**
   * Tests that pool callbacks are assigned only once across multiple decode
   * calls.
   *
   * @function module:tests/image~decoderCallbackWiringOnce
   */
  test('PixelBufferDecoder decode wires callbacks only on the first call',
    () => {
      const dec = new PixelBufferDecoder('jpeg-baseline');

      // Replace one handler after the first decode wires it up
      dec.decode(new Uint8Array([0]), {}, {});
      const pool = lastPool();
      const originalHandler = pool.onworkstart;

      // A second decode call must NOT overwrite the already-set handler
      dec.decode(new Uint8Array([1]), {}, {});
      assert.equal(pool.onworkstart, originalHandler,
        'handler not overwritten on second call');
    }
  );

  // -------------------------------------------------------------------------
  // decode() — algorithm routing
  // -------------------------------------------------------------------------

  /**
   * Tests that decode() routes 'jpeg-baseline' to the correct worker task.
   *
   * @function module:tests/image~decoderRouteJpegBaseline
   */
  test('PixelBufferDecoder decode routes jpeg-baseline to correct task', () => {
    const dec = new PixelBufferDecoder('jpeg-baseline');
    const pool = lastPool();
    dec.decode(new Uint8Array([0xFF, 0xD8]), {bitsAllocated: 8}, {index: 0});

    assert.equal(pool.addWorkerTask.mock.calls.length, 1);
    const task = pool.addWorkerTask.mock.calls[0][0];
    assert.equal(task.constructor.name, 'JpegBaselineWorkerTask');
  });

  /**
   * Tests that decode() routes 'jpeg-lossless' to the correct worker task.
   *
   * @function module:tests/image~decoderRouteJpegLossless
   */
  test('PixelBufferDecoder decode routes jpeg-lossless to correct task',
    () => {
      const dec = new PixelBufferDecoder('jpeg-lossless');
      const pool = lastPool();
      dec.decode(new Uint8Array([0]), {}, {});

      const task = pool.addWorkerTask.mock.calls[0][0];
      assert.equal(task.constructor.name, 'JpegLosslessWorkerTask');
    }
  );

  /**
   * Tests that decode() routes 'jpeg2000' to the correct worker task.
   *
   * @function module:tests/image~decoderRouteJpeg2000
   */
  test('PixelBufferDecoder decode routes jpeg2000 to correct task', () => {
    const dec = new PixelBufferDecoder('jpeg2000');
    const pool = lastPool();
    dec.decode(new Uint8Array([0]), {}, {});

    const task = pool.addWorkerTask.mock.calls[0][0];
    assert.equal(task.constructor.name, 'Jpeg2000WorkerTask');
  });

  /**
   * Tests that decode() routes 'rle' to the correct worker task.
   *
   * @function module:tests/image~decoderRouteRle
   */
  test('PixelBufferDecoder decode routes rle to correct task', () => {
    const dec = new PixelBufferDecoder('rle');
    const pool = lastPool();
    dec.decode(new Uint8Array([0]), {}, {});

    const task = pool.addWorkerTask.mock.calls[0][0];
    assert.equal(task.constructor.name, 'RleWorkerTask');
  });

  // -------------------------------------------------------------------------
  // decode() — task payload
  // -------------------------------------------------------------------------

  /**
   * Tests that the worker task receives the correct buffer, meta and info.
   *
   * @function module:tests/image~decoderTaskPayload
   */
  test('PixelBufferDecoder decode passes buffer, meta and info to task', () => {
    const dec = new PixelBufferDecoder('rle');
    const pool = lastPool();
    const buf = new Uint8Array([1, 2, 3]);
    const meta = {bitsAllocated: 16, isSigned: true};
    const info = {frameIndex: 2, numberOfFrames: 10};

    dec.decode(buf, meta, info);

    const task = pool.addWorkerTask.mock.calls[0][0];
    assert.equal(task.startMessage.buffer, buf, 'buffer forwarded');
    assert.equal(task.startMessage.meta, meta, 'meta forwarded');
    assert.equal(task.info, info, 'info forwarded');
  });

  // -------------------------------------------------------------------------
  // decode() — unknown algorithm
  // -------------------------------------------------------------------------

  /**
   * Tests that decode() does not add a task for an unrecognised algorithm.
   *
   * @function module:tests/image~decoderUnknownAlgo
   */
  test('PixelBufferDecoder decode ignores unknown algorithm names', () => {
    const dec = new PixelBufferDecoder('unknown-codec');
    const pool = lastPool();
    dec.decode(new Uint8Array([0]), {}, {});

    assert.equal(pool.addWorkerTask.mock.calls.length, 0,
      'no task added for unknown algorithm');
  });

  // -------------------------------------------------------------------------
  // abort()
  // -------------------------------------------------------------------------

  /**
   * Tests that abort() delegates to the underlying thread pool.
   *
   * @function module:tests/image~decoderAbort
   */
  test('PixelBufferDecoder abort delegates to pool.abort', () => {
    const dec = new PixelBufferDecoder('jpeg-baseline');
    const pool = lastPool();
    dec.abort();
    assert.equal(pool.abort.mock.calls.length, 1, 'pool.abort called once');
  });

});
