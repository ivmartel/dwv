/**
 * Test worker.
 */
// Do not warn if these variables were not defined before.

self.addEventListener('message', function (event) {

  const res = event.data.input + ' papagena';
  self.postMessage([res]);

}, false);
