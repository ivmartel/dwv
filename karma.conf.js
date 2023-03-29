// Karma configuration file, see link for more information
// https://karma-runner.github.io/6.4/config/configuration-file.html

module.exports = function (config) {
  config.set({
    basePath: '.',
    frameworks: ['qunit', 'webpack'],
    files: [
      {pattern: 'tests/**/*.test.js', watched: false}
    ],
    client: {
      clearContext: false,
      qunit: {
        showUI: true,
        testTimeout: 5000
      }
    },
    preprocessors: {
      'src/**/*.js': ['webpack', 'sourcemap'],
      'tests/**/*.test.js': ['webpack']
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './build/coverage/'),
      reporters: [
        {type: 'html', subdir: 'report-html'},
        {type: 'text-summary'}
      ],
      check: {
        global: {
          statements: 45,
          branches: 45,
          functions: 45,
          lines: 45
        }
      }
    },
    reporters: ['progress'],
    logLevel: config.LOG_INFO,
    browsers: ['Chrome'],
    restartOnFileChange: true,
    webpack: webpackConfig()
  });
};

/**
 * Get the webpack config to pass to Karma.
 *
 * @returns {object} The config.
 */
function webpackConfig() {
  const config = require('./webpack.test.js');
  delete config.entry;
  delete config.output;
  return config;
}
