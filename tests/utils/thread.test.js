/**
 * Tests for the 'utils/thread' file.
 */
// Do not warn if these variables were not defined before.
/* global QUnit */
QUnit.module('thread');

/**
 * Tests for {@link dwv.utils.ThreadPool}.
 *
 * @function module:tests/utils~threadPool
 */
QUnit.test('Test ThreadPool.', function (assert) {

  var done = assert.async();

  // create the thread pool and initialise it
  var pool = new dwv.utils.ThreadPool(20);

  // number of workers
  var nTestWorkers = 10;

  // called on pool end (successfull or not)
  pool.onworkend = function () {
    // check counters
    assert.equal(countWorkItem, nTestWorkers, 'Count WorkItem');
    assert.equal(countWork, 1, 'Count Work');
    // finish async test
    done();
  };

  // called on work
  var countWork = 0;
  pool.onwork = function () {
    ++countWork;
  };

  // called on work item (end of task)
  var countWorkItem = 0;
  pool.onworkitem = function (event) {
    if (typeof event.index !== 'undefined' &&
            event.data[0] === 'papageno papagena') {
      ++countWorkItem;
    }
  };

  // create the workers and run them
  for (var i = 0; i < nTestWorkers; ++i) {
    // create worker task
    var workerTask = new dwv.utils.WorkerTask(
      '/tests/utils/worker.js', {'input': 'papageno'}, i);
    // add it the queue and run it
    pool.addWorkerTask(workerTask);
  }

});
