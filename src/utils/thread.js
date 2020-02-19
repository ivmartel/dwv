// namespaces
var dwv = dwv || {};
dwv.utils = dwv.utils || {};

/**
 * Thread Pool.
 * Highly inspired from {@link http://www.smartjava.org/content/html5-easily-parallelize-jobs-using-web-workers-and-threadpool}.
 * @constructor
 * @param {Number} poolSize The size of the pool.
 */
dwv.utils.ThreadPool = function (poolSize) {
    // closure to self
    var self = this;
    // task queue
    var taskQueue = [];
    // lsit of available threads
    var freeThreads = [];
    // list of running threads (unsed in abort)
    var runningThreads = [];

    /**
     * Initialise.
     */
    this.init = function () {
        // create 'poolSize' number of worker threads
        for (var i = 0; i < poolSize; ++i) {
            freeThreads.push(new dwv.utils.WorkerThread(this));
        }
    };

    /**
     * Add a worker task to the queue.
     * Will be run when a thread is made available.
     * @return {Object} workerTask The task to add.
     */
    this.addWorkerTask = function (workerTask) {

        if (freeThreads.length === poolSize) {
            this.onworkstart({type: "work-start"});
        }

        if (freeThreads.length > 0) {
            // get the first free worker thread
            var workerThread = freeThreads.shift();
            // run the input task
            workerThread.run(workerTask);
            // add the thread to the runnning list
            runningThreads.push(workerThread);
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
        this.onabort({type: "work-abort"});
        this.onworkend({type: "work-end"});
    };

    /**
     * Free a worker thread.
     * @param {Object} workerThread The thread to free.
     */
    this.freeWorkerThread = function (workerThread) {
        if (taskQueue.length > 0) {
            // get waiting task
            var workerTask = taskQueue.shift();
            // use input thread to run the waiting task
            workerThread.run(workerTask);
        } else {
            // no task to run, add to free list
            freeThreads.push(workerThread);
            // remove from running list
            for ( var i = 0; i < runningThreads.length; ++i ) {
                if ( runningThreads[i].getId() === workerThread.getId() ) {
                    runningThreads.splice(i, 1);
                }
            }
            // the work is done when the queue is back to its initial size
            if ( freeThreads.length === poolSize ) {
                this.onwork({type: "work"});
                this.onworkend({type: "work-end"});
            }
        }
    };

    /**
     * Handle an error message from a worker.
     * @param {Object} event The error event.
     */
    this.handleWorkerError = function (event) {
        // stop all threads
        stop();
        // callback
        this.onerror({error: event});
        this.onworkend({type: "work-end"});
    };

    // private ----------------------------------------------------------------

    /**
     * Stop the pool: stop all running threads.
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
        // re-init
        self.init();
    }

};

/**
 * Handle a work start event.
 * @param {Object} event The work start event.
 * Default does nothing.
 */
dwv.utils.ThreadPool.prototype.onworkstart = function (/*event*/) {};
/**
 * Handle a work event.
 * @param {Object} event The work event fired
 *   when a work ended successfully.
 * Default does nothing.
 */
dwv.utils.ThreadPool.prototype.onwork = function  (/*event*/) {};
/**
 * Handle a work end event.
 * @param {Object} event The work end event fired
 *  when a work has completed, successfully or not.
 * Default does nothing.
 */
dwv.utils.ThreadPool.prototype.onworkend = function (/*event*/) {};
/**
 * Handle an error event.
 * @param {Object} event The error event.
 * Default does nothing.
 */
dwv.utils.ThreadPool.prototype.onerror = function (/*event*/) {};
/**
 * Handle an abort event.
 * @param {Object} event The abort event.
 * Default does nothing.
 */
dwv.utils.ThreadPool.prototype.onabort = function (/*event*/) {};

/**
 * Worker background task.
 * @external Worker
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Worker
 */

/**
 * Worker thread.
 * @constructor
 * @param {Object} parentPool The parent pool.
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
     * @return {String} The thread ID (alphanumeric).
     */
    this.getId = function () {
        return id;
    };

    /**
     * Run a worker task
     * @param {Object} workerTask The task to run.
     */
    this.run = function (workerTask) {
        // store task
        runningTask = workerTask;
        // create a new web worker
        if (runningTask.script !== null) {
            worker = new Worker(runningTask.script);
            worker.onmessage = onmessage;
            worker.onerror = onerror;
            // launch the worker
            worker.postMessage(runningTask.startMessage);
        }
    };

    /**
     * Stop a run and free the thread.
     */
    this.stop = function () {
        // stop the worker
        worker.terminate();
        // tell the parent pool this thread is free
        parentPool.freeWorkerThread(this);
    };

    /**
     * Message event handler.
     * For now assume we only get a single callback from a worker
     * which also indicates the end of this worker.
     * @param {Object} event The message event.
     */
    function onmessage(event) {
        // pass to task
        runningTask.callback(event);
        // stop the worker and free the thread
        self.stop();
    }

    /**
     * Error event handler.
     * @param {Object} event The error event.
     */
    function onerror(event) {
        // pass to parent
        parentPool.handleWorkerError(event);
        // stop the worker and free the thread
        self.stop();
    }
}; // class WorkerThread

/**
 * Worker task.
 * @constructor
 * @param {String} script The worker script.
 * @param {Object} message The data to pass to the worker.
 * @param {Function} callback The worker callback.
 */
dwv.utils.WorkerTask = function (script, message, callback) {
    // worker script
    this.script = script;
    // worker start message
    this.startMessage = message;
    // worker callback
    this.callback = callback;
};
