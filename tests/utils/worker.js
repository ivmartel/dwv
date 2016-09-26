/**
 * Test worker.
 */
// Do not warn if these variables were not defined before.
/* global self */

self.addEventListener('message', function (event) {

    var res = event.data.input + " papagena";
    self.postMessage([res]);

}, false);
