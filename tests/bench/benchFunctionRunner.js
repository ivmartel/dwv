// namespaces
// eslint-disable-next-line no-var
var dcmb = dcmb || {};
// benchmark.js
// eslint-disable-next-line no-var
var Benchmark = Benchmark || {};

/**
 * Function runner for benchmarks.
 * Launch functions within benchmark.js to evaluate their speed.
 */
dcmb.BenchFunctionRunner = function () {

  // the functions to run
  let functions = null;

  /**
   * Set the runner functions.
   *
   * @param {Array} funcs An array of functions in the form:
   *   {name: string, func: Object}.
   */
  this.setFunctions = function (funcs) {
    functions = funcs;
  };

  /**
   * Run the functions and store benchmark results.
   *
   * @param {object} buffer The data buffer.
   * @returns {Array} An array of memory measures in the form:
   *   {count: number, added: boolean, removed: boolean, value: string}.
   */
  this.run = function (buffer) {
    const results = [];

    // benchmark suite
    const suite = new Benchmark.Suite('bench');
    // handle end of cycle
    suite.on('cycle', function (event) {
      // console output
      console.log(String(event.target));
      // store results
      const opsPerSec = event.target.hz;
      const rme = event.target.stats.rme;
      const rmeTxt = rme.toFixed(rme < 100 ? 2 : 0);
      const text = opsPerSec + ' \u00B1' + rmeTxt + '%';
      results.push(text);
    });

    // avoid creating functions in loops
    const getFunc = function (f, a) {
      return function () {
        // run on a clone of the input array
        // (in case it is modified...)
        f(a.slice());
      };
    };
    // add parsers to suite
    for (let i = 0; i < functions.length; ++i) {
      const input = functions[i].test.setup(buffer);
      suite.add(functions[i].name, getFunc(functions[i].test.run, input));
    }
    // run async
    suite.run({async: false});

    return results;
  };

  /**
   * Get a header row to result data.
   *
   * @returns {Array} An array representing a header row to the result data.
   */
  this.getFunctionHeader = function () {
    const header = [];
    for (let i = 0; i < functions.length; ++i) {
      header.push(functions[i].name);
    }
    return header;
  };

};
