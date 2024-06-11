/**
 * Thread Pool.
 *
 * Highly inspired from {@link http://www.smartjava.org/content/html5-easily-parallelize-jobs-using-web-workers-and-threadpool}.
 */
export class ThreadPool {

  /**
   * @param {number} poolSize The size of the pool.
   */
  constructor(poolSize) {
    this.poolSize = poolSize;
    // task queue
    this.taskQueue = [];
    // lsit of available threads
    this.freeThreads = [];
    // create 'poolSize' number of worker threads
    for (let i = 0; i < poolSize; ++i) {
      this.freeThreads.push(new WorkerThread(this));
    }
    // list of running threads (unsed in abort)
    this.runningThreads = [];
  }

  /**
   * Add a worker task to the queue.
   * Will be run when a thread is made available.
   *
   * @param {object} workerTask The task to add to the queue.
   */
  addWorkerTask(workerTask) {
    // send work start if first task
    if (this.freeThreads.length === this.poolSize) {
      this.onworkstart({type: 'work-start'});
    }
    // launch task or queue
    if (this.freeThreads.length > 0) {
      // get the first free worker thread
      const workerThread = this.freeThreads.shift();
      // add the thread to the runnning list
      this.runningThreads.push(workerThread);
      // run the input task
      workerThread.run(workerTask);
    } else {
      // no free thread, add task to queue
      this.taskQueue.push(workerTask);
    }
  }

  /**
   * Abort all threads.
   */
  abort() {
    // stop all threads
    this.#stop();
    // callback
    this.onabort({type: 'work-abort'});
    this.onworkend({type: 'work-end'});
  }

  /**
   * Handle a task end.
   *
   * @param {object} workerThread The thread to free.
   */
  onTaskEnd(workerThread) {
    // launch next task in queue or finish
    if (this.taskQueue.length > 0) {
      // get waiting task
      const workerTask = this.taskQueue.shift();
      // use input thread to run the waiting task
      workerThread.run(workerTask);
    } else {
      // stop the worker
      workerThread.stop();
      // no task to run, add to free list
      this.freeThreads.push(workerThread);
      // remove from running list
      for (let i = 0; i < this.runningThreads.length; ++i) {
        if (this.runningThreads[i].getId() === workerThread.getId()) {
          this.runningThreads.splice(i, 1);
        }
      }
      // the work is done when the queue is back to its initial size
      if (this.freeThreads.length === this.poolSize) {
        this.onwork({type: 'work'});
        this.onworkend({type: 'work-end'});
      }
    }
  }

  /**
   * Handle an error message from a worker.
   *
   * @param {object} event The error event.
   */
  handleWorkerError = (event) => {
    // stop all threads
    this.#stop();
    // callback
    this.onerror({error: event});
    this.onworkend({type: 'work-end'});
  };

  // private ----------------------------------------------------------------

  /**
   * Stop the pool: stop all running threads.
   *
   */
  #stop() {
    // clear tasks
    this.taskQueue = [];
    // cancel running workers
    for (let i = 0; i < this.runningThreads.length; ++i) {
      this.runningThreads[i].stop();
    }
    this.runningThreads = [];
  }


  /**
   * Handle a work start event.
   * Default does nothing.
   *
   * @param {object} _event The work start event.
   */
  onworkstart(_event) {}

  /**
   * Handle a work item event.
   * Default does nothing.
   *
   * @param {object} _event The work item event fired
   *   when a work item ended successfully.
   */
  onworkitem(_event) {}

  /**
   * Handle a work event.
   * Default does nothing.
   *
   * @param {object} _event The work event fired
   *   when a work ended successfully.
   */
  onwork(_event) {}

  /**
   * Handle a work end event.
   * Default does nothing.
   *
   * @param {object} _event The work end event fired
   *  when a work has completed, successfully or not.
   */
  onworkend(_event) {}

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

} // ThreadPool

/**
 * Worker background task.
 *
 * Ref: {@link https://developer.mozilla.org/en-US/docs/Web/API/Worker}.
 *
 * @external Worker
 */

/**
 * Worker thread.
 */
class WorkerThread {

  /**
   * @param {object} parentPool The parent pool.
   */
  constructor(parentPool) {
    this.parentPool = parentPool;
    // thread ID
    this.id = Math.random().toString(36).substring(2, 15);
    // running task
    this.runningTask = null;
    // worker used to run task
    this.worker;
  }

  /**
   * Get the thread ID.
   *
   * @returns {string} The thread ID (alphanumeric).
   */
  getId() {
    return this.id;
  }

  /**
   * Run a worker task.
   *
   * @param {object} workerTask The task to run.
   */
  run(workerTask) {
    // store task
    this.runningTask = workerTask;
    // create a new web worker if not done yet
    if (typeof this.worker === 'undefined') {
      this.worker = new Worker(this.runningTask.script);
      // set callbacks
      this.worker.onmessage = this.onmessage;
      this.worker.onerror = this.onerror;
    }
    // launch the worker
    this.worker.postMessage(this.runningTask.startMessage);
  }

  /**
   * Finish a task and tell the parent.
   */
  stop() {
    // stop the worker
    if (typeof this.worker !== 'undefined') {
      this.worker.terminate();
      // force create at next run
      this.worker = undefined;
    }
  }

  /**
   * Message event handler.
   * For now assume we only get a single callback from a worker
   * which also indicates the end of this worker.
   *
   * @param {object} event The message event.
   */
  onmessage = (event) => {
    // augment event
    event.itemNumber = this.runningTask.info.itemNumber;
    event.numberOfItems = this.runningTask.info.numberOfItems;
    event.index = this.runningTask.info.index;
    // send event
    this.parentPool.onworkitem(event);
    // tell the parent pool the task is done
    this.parentPool.onTaskEnd(this);
  };

  /**
   * Error event handler.
   *
   * @param {object} event The error event.
   */
  onerror = (event) => {
    // augment event
    event.itemNumber = this.runningTask.info.itemNumber;
    event.numberOfItems = this.runningTask.info.numberOfItems;
    event.index = this.runningTask.info.index;
    // pass to parent
    this.parentPool.handleWorkerError(event);
    // stop the worker and free the thread
    this.stop();
  };
} // class WorkerThread

/**
 * Worker task.
 */
export class WorkerTask {
  /**
   * @param {string} script The worker script.
   * @param {object} message The data to pass to the worker.
   * @param {object} info Information object about the input data.
   */
  constructor(script, message, info) {
    // worker script
    this.script = script;
    // worker start message
    this.startMessage = message;
    // information about the work data
    this.info = info;
  }
}
