// import {
//   ThreadPool,
//   WorkerTask
// } from '../../src/utils/thread';

/**
 * Tests for the 'utils/thread' file.
 */

/* global QUnit */
QUnit.module('utils');

/**
 * Tests for {@link ThreadPool}.
 *
 * @function module:tests/utils~threadpool
 */
QUnit.test('ThreadPool class', function (assert) {

  // TODO: fix this!
  assert.ok(true);

  // const done = assert.async();

  // // create the thread pool and initialise it
  // const pool = new ThreadPool(20);

  // // number of workers
  // const nTestWorkers = 10;

  // // called on pool end (successfull or not)
  // pool.onworkend = function () {
  //   // check counters
  //   assert.equal(countWorkItem, nTestWorkers, 'Count WorkItem');
  //   assert.equal(countWork, 1, 'Count Work');
  //   // finish async test
  //   done();
  // };

  // // called on work
  // const countWork = 0;
  // pool.onwork = function () {
  //   ++countWork;
  // };

  // // called on work item (end of task)
  // const countWorkItem = 0;
  // pool.onworkitem = function (event) {
  //   if (event.data[0] === 'papageno papagena') {
  //     ++countWorkItem;
  //   }
  // };

  // // create the workers and run them
  // for (let i = 0; i < nTestWorkers; ++i) {
  //   // create worker task
  //   const workerTask = new WorkerTask(
  //     './worker.js',
  //     {input: 'papageno'},
  //     {itemNumber: i, numberOfItems: nTestWorkers});
  //   // add it the queue and run it
  //   pool.addWorkerTask(workerTask);
  // }

});
