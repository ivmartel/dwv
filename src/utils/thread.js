// namespaces
var dwv = dwv || {};
dwv.utils = dwv.utils || {};

/**
 * Thread Pool.
 * Highly inspired from {@link http://www.smartjava.org/content/html5-easily-parallelize-jobs-using-web-workers-and-threadpool}.
 *
 * @class
 * @param {number} poolSize The size of the pool.
 */
dwv.utils.ThreadPool = function (poolSize) {
  // task queue
  var taskQueue = [];
  // lsit of available threads
  var freeThreads = [];
  // create 'poolSize' number of worker threads
  for (var i = 0; i < poolSize; ++i) {
    freeThreads.push(new dwv.utils.WorkerThread(this));
  }
  // list of running threads (unsed in abort)
  var runningThreads = [];

  /**
   * Add a worker task to the queue.
   * Will be run when a thread is made available.
   *
   * @param {object} workerTask The task to add to the queue.
   */
  this.addWorkerTask = function (workerTask) {
    // send work start if first task
    if (freeThreads.length === poolSize) {
      this.onworkstart({type: 'work-start'});
    }
    // launch task or queue
    if (freeThreads.length > 0) {
      // get the first free worker thread
      var workerThread = freeThreads.shift();
      // add the thread to the runnning list
      runningThreads.push(workerThread);
      // run the input task
      workerThread.run(workerTask);
    } else {
      // no free thread, add task to queue
      taskQueue.push(workerTask);
    }
  };

  /**
   * Abort all threads.
   */
  this.abort = function () {
    // stop all threads
    stop();
    // callback
    this.onabort({type: 'work-abort'});
    this.onworkend({type: 'work-end'});
  };

  /**
   * Handle a task end.
   *
   * @param {object} workerThread The thread to free.
   */
  this.onTaskEnd = function (workerThread) {
    // launch next task in queue or finish
    if (taskQueue.length > 0) {
      // get waiting task
      var workerTask = taskQueue.shift();
      // use input thread to run the waiting task
      workerThread.run(workerTask);
    } else {
      // no task to run, add to free list
      freeThreads.push(workerThread);
      // remove from running list
      for (var i = 0; i < runningThreads.length; ++i) {
        if (runningThreads[i].getId() === workerThread.getId()) {
          runningThreads.splice(i, 1);
        }
      }
      // the work is done when the queue is back to its initial size
      if (freeThreads.length === poolSize) {
        this.onwork({type: 'work'});
        this.onworkend({type: 'work-end'});
      }
    }
  };

  /**
   * Handle an error message from a worker.
   *
   * @param {object} event The error event.
   */
  this.handleWorkerError = function (event) {
    // stop all threads
    stop();
    // callback
    this.onerror({error: event});
    this.onworkend({type: 'work-end'});
  };

  // private ----------------------------------------------------------------

  /**
   * Stop the pool: stop all running threads.
   *
   * @private
   */
  function stop() {
    // clear tasks
    taskQueue = [];
    // cancel running workers
    for (var i = 0; i < runningThreads.length; ++i) {
      runningThreads[i].stop();
    }
    runningThreads = [];
  }

}; // ThreadPool

/**
 * Handle a work start event.
 * Default does nothing.
 *
 * @param {object} _event The work start event.
 */
dwv.utils.ThreadPool.prototype.onworkstart = function (_event) {};
/**
 * Handle a work item event.
 * Default does nothing.
 *
 * @param {object} _event The work item event fired
 *   when a work item ended successfully.
 */
dwv.utils.ThreadPool.prototype.onworkitem = function (_event) {};
/**
 * Handle a work event.
 * Default does nothing.
 *
 * @param {object} _event The work event fired
 *   when a work ended successfully.
 */
dwv.utils.ThreadPool.prototype.onwork = function (_event) {};
/**
 * Handle a work end event.
 * Default does nothing.
 *
 * @param {object} _event The work end event fired
 *  when a work has completed, successfully or not.
 */
dwv.utils.ThreadPool.prototype.onworkend = function (_event) {};
/**
 * Handle an error event.
 * Default does nothing.
 *
 * @param {object} _event The error event.
 */
dwv.utils.ThreadPool.prototype.onerror = function (_event) {};
/**
 * Handle an abort event.
 * Default does nothing.
 *
 * @param {object} _event The abort event.
 */
dwv.utils.ThreadPool.prototype.onabort = function (_event) {};

/**
 * Worker background task.
 *
 * @external Worker
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Worker
 */

/**
 * Worker thread.
 *
 * @class
 * @param {object} parentPool The parent pool.
 */
dwv.utils.WorkerThread = function (parentPool) {
  // closure to self
  var self = this;
  // thread ID
  var id = Math.random().toString(36).substring(2, 15);
  // running task
  var runningTask = null;
  // worker used to run task
  var worker;

  /**
   * Get the thread ID.
   *
   * @returns {string} The thread ID (alphanumeric).
   */
  this.getId = function () {
    return id;
  };

  /**
   * Run a worker task
   *
   * @param {object} workerTask The task to run.
   */
  this.run = function (workerTask) {
    // store task
    runningTask = workerTask;
    // create a new web worker if not done yet
    if (typeof worker === 'undefined') {
      worker = new Worker(runningTask.script);
      // set callbacks
      worker.onmessage = onmessage;
      worker.onerror = onerror;
    }
    // launch the worker
    worker.postMessage(runningTask.startMessage);
  };

  /**
   * Finish a task and tell the parent.
   */
  this.stop = function () {
    // stop the worker
    worker.terminate();
  };

  /**
   * Message event handler.
   * For now assume we only get a single callback from a worker
   * which also indicates the end of this worker.
   *
   * @param {object} event The message event.
   * @private
   */
  function onmessage(event) {
    // augment event
    event.itemNumber = runningTask.info.itemNumber;
    event.numberOfItems = runningTask.info.numberOfItems;
    event.dataIndex = runningTask.info.dataIndex;
    // send event
    parentPool.onworkitem(event);
    // tell the parent pool the task is done
    parentPool.onTaskEnd(self);
  }

  /**
   * Error event handler.
   *
   * @param {object} event The error event.
   * @private
   */
  function onerror(event) {
    // augment event
    event.itemNumber = runningTask.info.itemNumber;
    event.numberOfItems = runningTask.info.numberOfItems;
    event.dataIndex = runningTask.info.dataIndex;
    // pass to parent
    parentPool.handleWorkerError(event);
    // stop the worker and free the thread
    self.stop();
  }
}; // class WorkerThread

/**
 * Worker task.
 *
 * @class
 * @param {string} script The worker script.
 * @param {object} message The data to pass to the worker.
 * @param {object} info Information object about the input data.
 */
dwv.utils.WorkerTask = function (script, message, info) {
  // worker script
  this.script = script;
  // worker start message
  this.startMessage = message;
  // information about the work data
  this.info = info;
};
