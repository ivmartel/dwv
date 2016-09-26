/**
 * Tests for the 'utils/thread' file.
 */
/** @module tests/utils */
// Do not warn if these variables were not defined before.
/* global QUnit */
QUnit.module("thread");

/**
 * Tests for {@link dwv.utils.ThreadPool}.
 * @function module:tests/utils~ThreadPool
 */
QUnit.test("Test ThreadPool.", function (assert) {

    var done = assert.async();

    // create the thread pool and initialise it
    var pool = new dwv.utils.ThreadPool(20);
    pool.init();

    // number of workers
    var nTestWorkers = 10;

    // called on pool end, should be last
    pool.onpoolworkend = function () {
        // check counters
        assert.equal(countWorkerCallback, nTestWorkers, "Count WorkerCallback");
        assert.equal(countWorkerEnd, nTestWorkers, "Count WorkerEnd");
        // finish async test
        done();
    };

    // called on worker end
    var countWorkerEnd = 0;
    pool.onworkerend = function () {
        ++countWorkerEnd;
    };

    // worker callback: check returned data
    var countWorkerCallback = 0;
    var workerCallback = function (event) {
        if (event.data[0] === "papageno papagena") {
            ++countWorkerCallback;
        }
    };

    // create the workers and run them
    for ( var i = 0; i < nTestWorkers; ++i ) {
        // create worker task
        var workerTask = new dwv.utils.WorkerTask(
            "./utils/worker.js", workerCallback, {"input": "papageno"} );
        // add it the queue and run it
        pool.addWorkerTask(workerTask);
    }

});
