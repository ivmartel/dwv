// namespaces
var dwv = dwv || {};
dwv.utils = dwv.utils || {};

/**
 * Thread Pool.
 * Highly inspired from {@link http://www.smartjava.org/content/html5-easily-parallelize-jobs-using-web-workers-and-threadpool}.
 * @constructor
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
     * @param {Object} workerThread The thread to free.
     */
    this.freeWorkerThread = function (workerThread) {
        self.onworkerend();
        if (self.taskQueue.length > 0) {
            // don't put back in queue, but execute next task
            var workerTask = self.taskQueue.shift();
            workerThread.run(workerTask);
        } else {
            // no task to run, add to queue
            self.workerQueue.push(workerThread);
            // the work is done when the queue is back to its initial size
            if ( self.workerQueue.length === size ) {
                self.onpoolworkend();
            }
        }
    };
};

/**
 * Handle a pool work end event.
 */
dwv.utils.ThreadPool.prototype.onpoolworkend = function ()
{
    // default does nothing.
};

/**
 * Handle a pool worker end event.
 */
dwv.utils.ThreadPool.prototype.onworkerend = function ()
{
    // default does nothing.
};

/**
 * Worker thread.
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
    // associated web worker
    var worker;

    /**
     * Run a worker task
     * @param {Object} workerTask The task to run.
     */
    this.run = function (workerTask) {
        // closure to task
        this.workerTask = workerTask;
        // create a new web worker
        if (this.workerTask.script !== null) {
            worker = new Worker(workerTask.script);
            worker.addEventListener('message', ontaskend, false);
            // launch the worker
            worker.postMessage(workerTask.startMessage);
        }
    };

    /**
     * Handle once the task is done.
     * For now assume we only get a single callback from a worker
     * which also indicates the end of this worker.
     * @param {Object} event The callback event.
     */
    function ontaskend(event) {
        // pass to original callback
        self.workerTask.callback(event);
        // stop the worker
        worker.terminate();
        // tell the parent pool this thread is free
        self.parentPool.freeWorkerThread(self);
    }

};

/**
 * Worker task.
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
