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
      {
        pattern: 'node_modules/i18next-xhr-backend/i18nextXHRBackend.min.js',
        watched: false
      },
      {
        pattern: 'node_modules/i18next-browser-languagedetector/' +
          'i18nextBrowserLanguageDetector.min.js',
        watched: false
      },
      {pattern: 'node_modules/jszip/dist/jszip.min.js', watched: false},
      // test data
      {pattern: 'locales/**/translation.json', included: false, type: 'js'},
      {pattern: 'tests/data/*.dcm', included: false},
      {pattern: 'tests/data/DICOMDIR', included: false},
      {pattern: 'tests/data/*.dcmdir', included: false},
      {pattern: 'tests/data/*.zip', included: false},
      {pattern: 'tests/dicom/*.json', included: false},
      {pattern: 'tests/state/**/*.json', included: false},
      // extra served content
      {pattern: 'tests/**/*.html', included: false},
      {pattern: 'tests/visual/appgui.js', included: false},
      {pattern: 'tests/dicom/pages/*.js', included: false},
      {pattern: 'tests/image/pages/*.js', included: false},
      {pattern: 'tests/pacs/*.js', included: false},
      {pattern: 'decoders/**/*.js', included: false},
      {pattern: 'tests/utils/worker.js', included: false},
      {pattern: 'tests/visual/images/*.jpg', included: false},
      {pattern: 'tests/pacs/images/*.png', included: false},
      // src
      'src/**/*.js',
      // test
      'tests/**/*.test.js',
      'tests/dicom/*.js'
    ],
    proxies: {
      '/locales/': '/base/locales/',
      '/tests/data/': '/base/tests/data/',
      '/tests/dicom/': '/base/tests/dicom/',
      '/tests/state/': '/base/tests/state/',
      '/tests/utils/': '/base/tests/utils/'
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
        {type: 'html', subdir: 'report-html'},
        {type: 'lcovonly', subdir: '.', file: 'report-lcovonly.txt'},
        {type: 'text-summary'}
      ]
    },
    reporters: ['progress'],
    logLevel: config.LOG_INFO,
    customLaunchers: {
      ChromeWithTestsPage: {
        base: 'Chrome',
        flags: [
          'http://localhost:9876/base/tests/index.html'
        ]
      }
    },
    browsers: ['ChromeWithTestsPage'],
    restartOnFileChange: true
  });
};
