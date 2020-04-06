// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config) {
  config.set({
    basePath: '.',
    frameworks: ['qunit'],
    plugins: [
      require('karma-qunit'),
      require('karma-chrome-launcher'),
      require('karma-coverage')
    ],
    files: [
        // dependencies
        {pattern: 'node_modules/konva/konva.min.js', watched: false},
        {pattern: 'node_modules/i18next/i18next.min.js', watched: false},
        {pattern: 'node_modules/i18next-xhr-backend/i18nextXHRBackend.min.js', watched: false},
        {pattern: 'node_modules/i18next-browser-languagedetector/i18nextBrowserLanguageDetector.min.js', watched: false},
        {pattern: 'node_modules/jszip/dist/jszip.js', watched: false},
        // test data
        {pattern: 'locales/**/translation.json', included: false, type: 'js'},
        {pattern: 'tests/data/bbmri-53323131.dcm', included: false},
        {pattern: 'tests/data/bbmri-53323275.dcm', included: false},
        {pattern: 'tests/data/bbmri-53323419.dcm', included: false},
        {pattern: 'tests/data/bbmri-53323563.dcm', included: false},
        {pattern: 'tests/data/dwv-test-simple.dcm', included: false},
        {pattern: 'tests/data/dwv-test-sequence.dcm', included: false},
        {pattern: 'tests/data/dwv-test-anonymise.dcm', included: false},
        {pattern: 'tests/data/dwv-test_no-number-rows.dcm', included: false},
        {pattern: 'tests/data/multiframe-test1.dcm', included: false},
        {pattern: 'tests/data/DICOMDIR', included: false},
        {pattern: 'tests/data/bbmri.dcmdir', included: false},
        {pattern: 'tests/data/bbmri.zip', included: false},
        {pattern: 'tests/data/dwv-test_bad.zip', included: false},
        {pattern: 'tests/dicom/*.json', included: false},
        {pattern: 'tests/state/**/*.json', included: false},
        // src
        'src/**/*.js',
        // test
        'tests/**/*.test.js',
        'tests/utils/worker.js'
    ],
    proxies: {
      "/locales/": "/base/locales/",
      "/tests/data/": "/base/tests/data/",
      "/tests/dicom/": "/base/tests/dicom/",
      "/tests/state/": "/base/tests/state/",
      "/tests/utils/": "/base/tests/utils/"
    },
    client: {
      clearContext: false,
      qunit: {
        showUI: true,
        testTimeout: 5000
      }
    },
    preprocessors: {
      'src/**/*.js': ['coverage']
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './build/coverage/dwv'),
      reporters: [
        { type: 'html', subdir: 'report-html' },
        { type: 'lcovonly', subdir: '.', file: 'report-lcovonly.txt' },
        { type: 'text-summary' }
      ]
    },
    reporters: ['progress'],
    logLevel: config.LOG_INFO,
    browsers: ['Chrome'],
    restartOnFileChange: true
  });
};
