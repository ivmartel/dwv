import {webpackTest} from './webpack.test.js';

// Karma configuration file, see link for more information
// https://karma-runner.github.io/6.4/config/configuration-file.html

/**
 * Get the Karma config for dwv.
 *
 * @param {object} config The Karma configuration.
 */
export default function (config) {
  config.set({
    basePath: '.',
    frameworks: ['qunit', 'webpack'],
    files: [
      {pattern: 'tests/**/*.test.js', watched: false},
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
      dir: './build/coverage/',
      reporters: [
        {type: 'html', subdir: 'report-html'},
        {type: 'text-summary'}
      ],
      check: {
        global: {
          statements: 30,
          branches: 30,
          functions: 30,
          lines: 30
        }
      }
    },
    reporters: ['progress'],
    logLevel: config.LOG_INFO,
    browsers: ['Chrome'],
    restartOnFileChange: true,
    webpack: webpackTest,
    jsonReporter: {
      stdout: false,
      outputFile: './build/test-results.json'
    },
  });
};
