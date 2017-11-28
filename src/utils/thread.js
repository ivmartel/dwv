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
        // clear tasks
        taskQueue = [];
        // cancel running workers
        for (var i = 0; i < runningThreads.length; ++i) {
            runningThreads[i].stop();
        }
        runningThreads = [];
        // re-init
        this.init();
    };

    /**
     * Free a worker thread.
     * @param {Object} workerThread The thread to free.
     */
    this.freeWorkerThread = function (workerThread) {
        // send worker end
        this.onworkerend();

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
                if ( runningThreads[i] === workerThread ) {
                    runningThreads.splice(i, 1);
                }
            }
            // the work is done when the queue is back to its initial size
            if ( freeThreads.length === poolSize ) {
                this.onpoolworkend();
            }
        }
    };
};

/**
 * Handle a pool work end event.
 * Default does nothing.
 */
dwv.utils.ThreadPool.prototype.onpoolworkend = function () {};
/**
 * Handle a pool worker end event.
 * Default does nothing.
 */
dwv.utils.ThreadPool.prototype.onworkerend = function () {};

/**
 * Worker thread.
 * @external Worker
 * @constructor
 * @param {Object} parentPool The parent pool.
 */
dwv.utils.WorkerThread = function (parentPool) {
    // closure to self
    var self = this;

    // running task
    var runningTask = {};
    // worker used to run task
    var worker;

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
            worker.addEventListener('message', ontaskend, false);
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
     * Handle once the task is done.
     * For now assume we only get a single callback from a worker
     * which also indicates the end of this worker.
     * @param {Object} event The callback event.
     */
    function ontaskend(event) {
        // pass to original callback
        runningTask.callback(event);
        // stop the worker and free the thread
        self.stop();
    }

};

/**
 * Worker task.
 * @constructor
 * @param {String} script The worker script.
 * @param {Function} callback The worker callback.
 * @param {Object} message The data to pass to the worker.
 */
dwv.utils.WorkerTask = function (script, callback, message) {
    // worker script
    this.script = script;
    // worker callback
    this.callback = callback;
    // worker start message
    this.startMessage = message;
};
