/**
 * Labeling filter worker.
 */

import {LabelingFilter} from './labelingFilter.js';

self.addEventListener('message', function (event) {

  const filter = new LabelingFilter();
  self.postMessage({
    labels: filter.run(event.data)
  });

}, false);
