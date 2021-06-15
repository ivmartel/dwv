// namespace
var dcmb = dcmb || {};
// benchmark.js
var Benchmark = Benchmark || {};

/**
 * Function runner for benchmarks.
 * Launch functions within benchmark.js to evaluate their speed.
 */
dcmb.BenchFunctionRunner = function () {

  // the functions to run
  var functions = null;

  /**
   * Set the runner functions.
   *
   * @param {Array} funcs An array of functions in the form:
   * {name: string, func: Object}
   */
  this.setFunctions = function (funcs) {
    functions = funcs;
  };

  /**
   * Run the functions and store benchmark results.
   *
   * @param {object} buffer The data buffer.
   * @returns {Array} An array of memory measures in the form:
   * {count: number, added: boolean, removed: boolean, value: string}
   */
  this.run = function (buffer) {
    var results = [];

    // benchmark suite
    var suite = new Benchmark.Suite('bench');
    // handle end of cycle
    suite.on('cycle', function (event) {
      // console output
      console.log(String(event.target));
      // store results
      var opsPerSec = event.target.hz;
      var rme = event.target.stats.rme;
      var rmeTxt = rme.toFixed(rme < 100 ? 2 : 0);
      var text = opsPerSec + ' \u00B1' + rmeTxt + '%';
      results.push(text);
    });

    // avoid creating functions in loops
    var getFunc = function (f, a) {
      return function () {
        // run on a clone of the input array
        // (in case it is modified...)
        f(a.slice());
      };
    };
    // add parsers to suite
    for (var i = 0; i < functions.length; ++i) {
      suite.add(functions[i].name, getFunc(functions[i].func, buffer));
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
    var header = [];
    for (var i = 0; i < functions.length; ++i) {
      header.push(functions[i].name);
    }
    return header;
  };

};
