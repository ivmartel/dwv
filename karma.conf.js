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
        {pattern: 'node_modules/konva/konva.min.js', watched: false},
        {pattern: 'node_modules/i18next/i18next.min.js', watched: false},
        {pattern: 'node_modules/i18next-xhr-backend/i18nextXHRBackend.min.js', watched: false},
        {pattern: 'node_modules/i18next-browser-languagedetector/i18nextBrowserLanguageDetector.min.js', watched: false},
        {pattern: 'node_modules/jszip/dist/jszip.js', watched: false},
        {pattern: 'locales/**/translation.json', included: false, type: 'js'},
        'src/**/*.js',
        'tests/**/*.test.js',
        'tests/utils/worker.js'
    ],
    proxies: {
      "/locales/": "/base/locales/",
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
