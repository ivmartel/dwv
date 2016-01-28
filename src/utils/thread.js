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
 * Thread Pool
 * Highly inspired from http://www.smartjava.org/content/html5-easily-parallelize-jobs-using-web-workers-and-threadpool
 * @param size
 */
dwv.utils.ThreadPool = function (size) {
    var self = this;
 
    // set some defaults
    this.taskQueue = [];
    this.workerQueue = [];
    this.poolSize = size;
 
    this.addWorkerTask = function(workerTask) {
        if (self.workerQueue.length > 0) {
            // get the worker from the front of the queue
            var workerThread = self.workerQueue.shift();
            workerThread.run(workerTask);
        } else {
            // no free workers,
            self.taskQueue.push(workerTask);
        }
    };
 
    this.init = function() {
        // create 'size' number of worker threads
        for (var i = 0 ; i < size ; i++) {
            self.workerQueue.push(new dwv.utils.WorkerThread(self));
        }
    };
 
    this.freeWorkerThread = function(workerThread) {
        if (self.taskQueue.length > 0) {
            // don't put back in queue, but execute next task
            var workerTask = self.taskQueue.shift();
            workerThread.run(workerTask);
        } else {
            self.workerQueue.push(workerThread);
        }
    };
};
 
// runner work tasks in the pool
dwv.utils.WorkerThread = function (parentPool) {
 
    var self = this;
 
    this.parentPool = parentPool;
    this.workerTask = {};
 
    this.run = function(workerTask) {
        this.workerTask = workerTask;
        // create a new web worker
        if (this.workerTask.script !== null) {
            var worker = new Worker(workerTask.script);
            worker.addEventListener('message', dummyCallback, false);
            worker.postMessage(workerTask.startMessage);
        }
    };
 
    // for now assume we only get a single callback from a worker
    // which also indicates the end of this worker.
    function dummyCallback(event) {
        // pass to original callback
        self.workerTask.callback(event);
 
        // we should use a separate thread to add the worker
        self.parentPool.freeWorkerThread(self);
        
        this.terminate();
    }
 
};
 
// task to run
dwv.utils.WorkerTask = function (script, callback, msg) {
 
    this.script = script;
    this.callback = callback;
    this.startMessage = msg;
};
