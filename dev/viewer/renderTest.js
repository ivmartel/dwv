/**
 * @import {DwvAppService} from './src/dwvAppService.js';
 */

/**
 * Setup test line.
 *
 * @param {DwvAppService} dwvAppService The associated viewer dwvAppService.
 */
export function setupRenderTests(dwvAppService) {
  const renderTestButton = document.createElement('button');
  renderTestButton.onclick = getRunRenderTest(dwvAppService);
  renderTestButton.appendChild(document.createTextNode('render test'));

  const testsDiv = document.getElementById('tests');
  testsDiv.appendChild(renderTestButton);
};

/**
 * Run render tests.
 *
 * @param {DwvAppService} dwvAppService The associated viewer dwvAppService.
 * @returns {Function} The run render text function.
 */
function getRunRenderTest(dwvAppService) {
  return function () {
    const numberOfRun = 20;
    const stgCtrl = dwvAppService.getStageController();
    // default to first layer group
    stgCtrl.setActiveLayerGroup(0);

    const vl = stgCtrl.getActiveLayerGroup().getActiveViewLayer();
    if (typeof vl === 'undefined') {
      return;
    }
    const vc = vl.getViewController();
    const runner = function () {
      vc.getPositionHelper().incrementPositionAlongScroll();
    };

    let startTime;
    const timings = [];
    const onRenderStart = function (/*event*/) {
      startTime = performance.now();
    };
    const onRenderEnd = function (/*event*/) {
      const endTime = performance.now();
      timings.push(endTime - startTime);

      if (timings.length < numberOfRun) {
        setTimeout(() => {
          runner();
        }, 100);
      } else {
        console.log('Stats:', getBasicStats(timings));
        // clean up
        dwvAppService.removeEventListener('renderstart', onRenderStart);
        dwvAppService.removeEventListener('renderend', onRenderEnd);
      }
    };

    // setup
    dwvAppService.addEventListener('renderstart', onRenderStart);
    dwvAppService.addEventListener('renderend', onRenderEnd);

    // start
    runner();
  };
}

/**
 * Get basic stats for an array.
 *
 * @param {Array} array Input array.
 * @returns {object} Min, max, mean and standard deviation.
 */
function getBasicStats(array) {
  let min = array[0];
  let max = min;
  let sum = 0;
  let sumSqr = 0;
  const length = array.length;
  for (let i = 0; i < length; ++i) {
    const val = array[i];
    if (val < min) {
      min = val;
    } else if (val > max) {
      max = val;
    }
    sum += val;
    sumSqr += val * val;
  }

  const mean = sum / length;
  // see http://en.wikipedia.org/wiki/Algorithms_for_calculating_variance
  const variance = sumSqr / length - mean * mean;
  const stdDev = Math.sqrt(variance);

  return {min, max, mean, stdDev};
}
