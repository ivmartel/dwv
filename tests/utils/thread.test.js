import {describe, test, assert, vi, beforeEach} from 'vitest';
import {ThreadPool, WorkerTask} from '../../src/utils/thread.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Build a WorkerTask backed by a mock worker so no real Web Worker is spawned.
 * The mock worker exposes `postMessage`, `terminate`, `onmessage`, `onerror`
 * as plain spies. After `addWorkerTask` runs, the pool wires its own callbacks
 * onto `mockWorker.onmessage` / `.onerror`, so calling those in tests
 * simulates the worker responding.
 *
 * @param {object} [message] Start message for the task.
 * @param {object} [info] Info object attached to the task.
 * @returns {WorkerTask} The task with an extra `.mockWorker` property.
 */
function makeTask(message = {}, info = {}) {
  const mockWorker = {
    postMessage: vi.fn(),
    terminate: vi.fn(),
    onmessage: null,
    onerror: null
  };
  const task = new WorkerTask(message, info);
  task.getWorker = () => mockWorker;
  task.mockWorker = mockWorker;
  return task;
}

/**
 * Build a ThreadPool with spies on every event handler.
 *
 * @param {number} size Pool size.
 * @returns {{pool: ThreadPool, events: object}} Pool and a map of spy handlers.
 */
function makePool(size) {
  const pool = new ThreadPool(size);
  const events = {
    workstart: vi.fn(),
    workitem: vi.fn(),
    work: vi.fn(),
    workend: vi.fn(),
    error: vi.fn(),
    abort: vi.fn()
  };
  pool.onworkstart = events.workstart;
  pool.onworkitem = events.workitem;
  pool.onwork = events.work;
  pool.onworkend = events.workend;
  pool.onerror = events.error;
  pool.onabort = events.abort;
  return {pool, events};
}

describe('utils', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // WorkerTask
  // -------------------------------------------------------------------------

  /**
   * Tests for {@link WorkerTask} constructor.
   *
   * @function module:tests/utils~worker-task-constructor
   */
  test('WorkerTask constructor stores startMessage and info', () => {
    const msg = {buffer: new Uint8Array([1, 2])};
    const info = {frameIndex: 3};
    const task = new WorkerTask(msg, info);
    assert.equal(task.startMessage, msg);
    assert.equal(task.info, info);
  });

  /**
   * Tests that {@link WorkerTask#getWorker} returns undefined by default.
   *
   * @function module:tests/utils~worker-task-get-worker
   */
  test('WorkerTask getWorker returns undefined by default', () => {
    const task = new WorkerTask({}, {});
    assert.isUndefined(task.getWorker());
  });

  /**
   * Tests that default event handlers are no-ops.
   *
   * @function module:tests/utils~thread-pool-default-handlers
   */
  test('ThreadPool default event handlers exist and do not throw', () => {
    const pool = new ThreadPool(1);
    assert.doesNotThrow(() => pool.onworkstart({}));
    assert.doesNotThrow(() => pool.onworkitem({}));
    assert.doesNotThrow(() => pool.onwork({}));
    assert.doesNotThrow(() => pool.onworkend({}));
    assert.doesNotThrow(() => pool.onerror({}));
    assert.doesNotThrow(() => pool.onabort({}));
  });

  // -------------------------------------------------------------------------
  // ThreadPool — addWorkerTask
  // -------------------------------------------------------------------------

  /**
   * Tests that addWorkerTask fires onworkstart on the first task only.
   *
   * @function module:tests/utils~thread-pool-workstart
   */
  test('ThreadPool addWorkerTask fires onworkstart only for the first task',
    () => {
      const {pool, events} = makePool(2);
      const t1 = makeTask();
      const t2 = makeTask();

      pool.addWorkerTask(t1);
      assert.equal(events.workstart.mock.calls.length, 1,
        'onworkstart fired after first task');

      pool.addWorkerTask(t2);
      assert.equal(events.workstart.mock.calls.length, 1,
        'onworkstart not fired again for second task');
    }
  );

  /**
   * Tests that addWorkerTask dispatches the task immediately when a thread
   * is free (postMessage called, thread moved to runningThreads).
   *
   * @function module:tests/utils~thread-pool-immediate-dispatch
   */
  test('ThreadPool addWorkerTask dispatches task immediately when thread free',
    () => {
      const {pool} = makePool(1);
      const msg = {buffer: new Uint8Array([7])};
      const task = makeTask(msg, {});

      pool.addWorkerTask(task);

      assert.equal(task.mockWorker.postMessage.mock.calls.length, 1,
        'worker.postMessage called once');
      assert.equal(
        task.mockWorker.postMessage.mock.calls[0][0],
        msg,
        'correct message forwarded'
      );
    }
  );

  /**
   * Tests that addWorkerTask queues a task when no thread is free.
   *
   * @function module:tests/utils~thread-pool-queue
   */
  test('ThreadPool addWorkerTask queues task when all threads are busy', () => {
    const {pool} = makePool(1);
    const t1 = makeTask();
    const t2 = makeTask();

    pool.addWorkerTask(t1); // occupies the only thread
    pool.addWorkerTask(t2); // should be queued

    assert.equal(t2.mockWorker.postMessage.mock.calls.length, 0,
      'second task not yet dispatched');
  });

  // -------------------------------------------------------------------------
  // ThreadPool — task completion (onmessage)
  // -------------------------------------------------------------------------

  /**
   * Tests that when a worker replies, onworkitem is called with the event
   * augmented by task info.
   *
   * @function module:tests/utils~thread-pool-workitem
   */
  test('ThreadPool fires onworkitem with augmented event on worker reply',
    () => {
      const {pool, events} = makePool(1);
      const info = {
        itemNumber: 2,
        numberOfItems: 5,
        index: 7,
        indexOrigin: 0
      };
      const task = makeTask({}, info);
      pool.addWorkerTask(task);

      // Simulate worker posting a result
      task.mockWorker.onmessage({data: 'result'});

      assert.equal(events.workitem.mock.calls.length, 1);
      const evt = events.workitem.mock.calls[0][0];
      assert.equal(evt.itemNumber, 2);
      assert.equal(evt.numberOfItems, 5);
      assert.equal(evt.index, 7);
      assert.equal(evt.indexOrigin, 0);
      assert.equal(evt.data, 'result');
    }
  );

  /**
   * Tests that when the last task completes, onwork and onworkend are fired
   * and the thread is returned to freeThreads.
   *
   * @function module:tests/utils~thread-pool-work-done
   */
  test('ThreadPool fires onwork and onworkend when all tasks complete', () => {
    const {pool, events} = makePool(1);
    const task = makeTask();
    pool.addWorkerTask(task);

    task.mockWorker.onmessage({});

    assert.equal(events.work.mock.calls.length, 1, 'onwork fired');
    assert.equal(events.workend.mock.calls.length, 1, 'onworkend fired');
  });

  /**
   * Tests that a queued task is dispatched when a running task finishes.
   *
   * @function module:tests/utils~thread-pool-queue-drain
   */
  test('ThreadPool runs next queued task when a thread is freed', () => {
    const {pool, events} = makePool(1);
    const t1 = makeTask({id: 1}, {});
    const t2 = makeTask({id: 2}, {});

    pool.addWorkerTask(t1);
    pool.addWorkerTask(t2); // queued

    // t1 finishes — t2 should now start on the same worker
    t1.mockWorker.onmessage({});

    assert.equal(
      t1.mockWorker.postMessage.mock.calls.length, 2,
      'same worker reused for queued task'
    );
    assert.deepEqual(
      t1.mockWorker.postMessage.mock.calls[1][0],
      {id: 2},
      'queued task message dispatched'
    );
    // pool not done yet — one task still running
    assert.equal(events.workend.mock.calls.length, 0,
      'onworkend not yet fired');

    // t2 finishes
    t1.mockWorker.onmessage({});
    assert.equal(events.work.mock.calls.length, 1, 'onwork fired at the end');
    assert.equal(events.workend.mock.calls.length, 1,
      'onworkend fired at the end');
  });

  /**
   * Tests that multiple tasks across multiple threads all complete correctly.
   *
   * @function module:tests/utils~thread-pool-multi-thread
   */
  test('ThreadPool handles concurrent tasks on multiple threads', () => {
    const {pool, events} = makePool(2);
    const t1 = makeTask({}, {itemNumber: 0, numberOfItems: 2});
    const t2 = makeTask({}, {itemNumber: 1, numberOfItems: 2});

    pool.addWorkerTask(t1);
    pool.addWorkerTask(t2);

    assert.equal(t1.mockWorker.postMessage.mock.calls.length, 1,
      't1 dispatched');
    assert.equal(t2.mockWorker.postMessage.mock.calls.length, 1,
      't2 dispatched');

    // t1 finishes
    t1.mockWorker.onmessage({});
    assert.equal(events.workend.mock.calls.length, 0,
      'not done yet after t1');

    // t2 finishes
    t2.mockWorker.onmessage({});
    assert.equal(events.work.mock.calls.length, 1, 'onwork after both done');
    assert.equal(events.workend.mock.calls.length, 1,
      'onworkend after both done');
  });

  // -------------------------------------------------------------------------
  // ThreadPool — abort
  // -------------------------------------------------------------------------

  /**
   * Tests that abort() stops running workers, clears the queue, and
   * fires onabort + onworkend.
   *
   * @function module:tests/utils~thread-pool-abort
   */
  test('ThreadPool abort stops workers, clears queue, fires onabort', () => {
    const {pool, events} = makePool(1);
    const t1 = makeTask();
    const t2 = makeTask();
    pool.addWorkerTask(t1); // running
    pool.addWorkerTask(t2); // queued

    pool.abort();

    assert.equal(t1.mockWorker.terminate.mock.calls.length, 1,
      'running worker terminated');
    assert.equal(events.abort.mock.calls.length, 1, 'onabort fired');
    assert.equal(events.workend.mock.calls.length, 1, 'onworkend fired');
  });

  /**
   * Tests that the pool is fully operational after an abort.
   *
   * @function module:tests/utils~thread-pool-reuse-after-abort
   */
  test('ThreadPool is reusable after abort', () => {
    const {pool, events} = makePool(1);
    pool.addWorkerTask(makeTask());
    pool.abort();

    // reset spies so counts start from zero
    vi.clearAllMocks();
    // re-attach handlers (cleared by vi.clearAllMocks)
    pool.onworkstart = events.workstart;
    pool.onworkitem = events.workitem;
    pool.onwork = events.work;
    pool.onworkend = events.workend;
    pool.onerror = events.error;
    pool.onabort = events.abort;

    const t2 = makeTask({}, {itemNumber: 0, numberOfItems: 1});
    pool.addWorkerTask(t2);

    assert.equal(events.workstart.mock.calls.length, 1,
      'onworkstart fired after reuse');
    assert.equal(t2.mockWorker.postMessage.mock.calls.length, 1,
      'task dispatched after reuse');

    t2.mockWorker.onmessage({});
    assert.equal(events.work.mock.calls.length, 1, 'onwork fired');
    assert.equal(events.workend.mock.calls.length, 1, 'onworkend fired');
  });

  // -------------------------------------------------------------------------
  // ThreadPool — worker error
  // -------------------------------------------------------------------------

  /**
   * Tests that a worker error stops all threads and fires onerror + onworkend.
   *
   * @function module:tests/utils~thread-pool-error
   */
  test('ThreadPool handles worker error: stops pool and fires onerror', () => {
    const {pool, events} = makePool(2);
    const t1 = makeTask({}, {itemNumber: 0, numberOfItems: 2});
    const t2 = makeTask({}, {itemNumber: 1, numberOfItems: 2});
    pool.addWorkerTask(t1);
    pool.addWorkerTask(t2);

    // Simulate t1's worker throwing an error
    t1.mockWorker.onerror({type: 'error'});

    assert.equal(events.error.mock.calls.length, 1, 'onerror fired');
    assert.equal(events.workend.mock.calls.length, 1, 'onworkend fired');
    // Both workers must be stopped
    assert.equal(t1.mockWorker.terminate.mock.calls.length, 1,
      't1 worker terminated');
    assert.equal(t2.mockWorker.terminate.mock.calls.length, 1,
      't2 worker terminated');
  });

});
