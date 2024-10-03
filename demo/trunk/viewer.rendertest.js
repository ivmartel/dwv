// namespace
// eslint-disable-next-line no-var
var test = test || {};

/**
 * Setup test line.
 *
 * @param {object} app The associated application.
 */
test.setupRenderTests = function (app) {
  const renderTestButton = document.createElement('button');
  renderTestButton.onclick = getRunRenderTest(app);
  renderTestButton.appendChild(document.createTextNode('render test'));

  const testsDiv = document.getElementById('tests');
  testsDiv.appendChild(renderTestButton);
};

/**
 * Run render tests.
 *
 * @param {object} app The associated application.
 * @returns {Function} The run render text function.
 */
function getRunRenderTest(app) {
  return function () {
    const numberOfRun = 20;
    // default to first layer group
    app.setActiveLayerGroup(0);

    const vl = app.getActiveLayerGroup().getActiveViewLayer();
    if (typeof vl === 'undefined') {
      return;
    }
    const vc = vl.getViewController();
    const runner = function () {
      vc.incrementScrollIndex();
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
        app.removeEventListener('renderstart', onRenderStart);
        app.removeEventListener('renderend', onRenderEnd);
      }
    };

    // setup
    app.addEventListener('renderstart', onRenderStart);
    app.addEventListener('renderend', onRenderEnd);

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
  let val = 0;
  const length = array.length;
  for (let i = 0; i < length; ++i) {
    val = array[i];
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

  return {
    min: min,
    max: max,
    mean: mean,
    stdDev: stdDev
  };
}
