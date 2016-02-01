/** 
 * Utility module.
 * @module utils
 */
var dwv = dwv || {};
/**
 * Namespace for utility functions.
 * @class utils
 * @namespace dwv
 * @static
 */
dwv.utils = dwv.utils || {};

/**
 * Thread Pool.
 * @class ThreadPool
 * @namespace dwv.utils
 * @constructor
 * Highly inspired from http://www.smartjava.org/content/html5-easily-parallelize-jobs-using-web-workers-and-threadpool
 * @param {Number} size The size of the pool.
 */
dwv.utils.ThreadPool = function (size) {
    // closure to self
    var self = this;
    // task queue
    this.taskQueue = [];
    // worker queue
    this.workerQueue = [];
    // pool size
    this.poolSize = size;
 
    /**
     * Initialise.
     * @method init
     */
    this.init = function () {
        // create 'size' number of worker threads
        for (var i = 0; i < size; ++i) {
            self.workerQueue.push(new dwv.utils.WorkerThread(self));
        }
    };
 
    /**
     * Add a worker task to the queue.
     * Will be run when a thread is made available.
     * @method addWorkerTask
     * @return {Object} workerTask The task to add.
     */
    this.addWorkerTask = function (workerTask) {
        if (self.workerQueue.length > 0) {
            // get the worker thread from the front of the queue
            var workerThread = self.workerQueue.shift();
            workerThread.run(workerTask);
        } else {
            // no free workers, add to queue
            self.taskQueue.push(workerTask);
        }
    };
 
    /**
     * Free a worker thread.
     * @method freeWorkerThread
     * @param {Object} workerThread The thread to free.
     */
    this.freeWorkerThread = function (workerThread) {
        if (self.taskQueue.length > 0) {
            // don't put back in queue, but execute next task
            var workerTask = self.taskQueue.shift();
            workerThread.run(workerTask);
        } else {
            // no task to run, add to queue
            self.workerQueue.push(workerThread);
        }
    };
};
 
/**
 * Worker thread.
 * @class WorkerThread
 * @namespace dwv.utils
 * @constructor
 * @param {Object} parentPool The parent pool.
 */
dwv.utils.WorkerThread = function (parentPool) {
    // closure to self
    var self = this;
    // parent pool
    this.parentPool = parentPool;
    // associated task
    this.workerTask = {};
 
    /**
     * Run a worker task
     * @method run
     * @param {Object} workerTask The task to run.
     */
    this.run = function (workerTask) {
        // closure to task
        this.workerTask = workerTask;
        // create a new web worker
        if (this.workerTask.script !== null) {
            var worker = new Worker(workerTask.script);
            worker.addEventListener('message', ontaskend, false);
            // launch the worker
            worker.postMessage(workerTask.startMessage);
        }
    };
 
    /**
     * Handle once the task is done.
     * For now assume we only get a single callback from a worker
     * which also indicates the end of this worker.
     * @method ontaskend
     * @param {Object} event The callback event.
     */
    function ontaskend(event) {
        // pass to original callback
        self.workerTask.callback(event);
        // tell the parent pool this thread is free
        self.parentPool.freeWorkerThread(self);
        // ?
        this.terminate();
    }
 
};
 
/**
 * Worker task.
 * @class WorkerTask
 * @namespace dwv.utils
 * @constructor
 * @param {String} script The worker script.
 * @param {Function} parentPool The worker callback.
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
