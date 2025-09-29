/**
 * Contour filter worker.
 */

import {ContourFilter} from './contourFilter.js';

self.addEventListener('message', function (event) {

  const filter = new ContourFilter();
  self.postMessage({
    contour: filter.run(event.data)
  });

}, false);
