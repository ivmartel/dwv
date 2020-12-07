var process = process || {};

// namespace
var dwv = dwv || {};
dwv.test = dwv.test || {};

// Saucelabs script.
// Has to be launched from the root dir with grunt: `grunt sauce`
// If it is the first time, install all dependencies by running:
//  `npm install` (from the root dir, will install locally).
//
// Results are published publicly at: https://saucelabs.com/u/ivmartel
//
// Removed to solve dependencies... TODO Find another way?
// Gruntfile:
// grunt.initConfig({
//     execute: {
//         sauce_full: {
//             options: {
//                 args: ['full']
//             },
//             src: ['tests/visual/sauce.js']
//         }
//     }
// });
// grunt.loadNpmTasks('grunt-execute');
// grunt.registerTask('sauce', ['execute:sauce_full']);

// selenium webdriver
var webdriver = require('../../node_modules/selenium-webdriver');
// used to update the saucelab job name
var SauceLabs = require('saucelabs');
var saucelabs = new SauceLabs({
  username: 'ivmartel',
  password: 'my-password'
});

/**
 * Launch a sauce GUI test.
 *
 * @see https://wiki.saucelabs.com/display/DOCS/Platform+Configurator
 *   for saucelabs possibilities.
 * @see http://seleniumhq.github.io/selenium/docs/api/javascript/index.html
 *   for the webdriver API.
 *
 * @param {object} caps Desired capabilities for the webdriver. Minimum of
 *   {'browserName', 'version', 'platform'}.
 */
dwv.test.sauceTest = function (caps) {
  var driver = new webdriver.Builder().
    withCapabilities({
      'browserName': caps.browserName,
      'version': caps.version,
      'platform': caps.platform,
      'username': saucelabs.options.username,
      'accessKey': saucelabs.options.password
    }).
    usingServer('http://' + saucelabs.options.username + ':' + saucelabs.options.password +
                  '@ondemand.saucelabs.com:80/wd/hub').
    build();

  driver.getSession().then(function (sessionid) {
    driver.sessionID = sessionid.id_;
  });

  var root = 'https://ivmartel.github.io/dwv/demo/stable/viewers/mobile/index.html';
  var dataUrl =
    'https%3A%2F%2Fraw.githubusercontent.com%2F' +
    'ivmartel%2Fdwv%2Fmaster%2Ftests%2Fdata%2F';
  dataUrl += '%3Ffile%3Dbbmri-53323851.dcm';
  dataUrl += '%26file%3Dbbmri-53323707.dcm';
  dataUrl += '%26file%3Dbbmri-53323563.dcm';

  driver.get(root + '?input=' + dataUrl + '&dwvReplaceMode=void').then(
    function () {
    // wait for the tool list to be displayed
      return driver.wait(
        webdriver.until.elementLocated(webdriver.By.className('toolSelect')),
        10000);
    }).then(function () {
    // get the image layer
    return driver.findElement(webdriver.By.className('imageLayer'));
  }).then(function (element) {
    // simulate a mouse move on the image layer
    return driver.actions().
      mouseDown(element).
      mouseMove(element, {x: 0, y: 50}).
      mouseUp().
      perform();
  }).then(function () {
    // sleep to allow to refresh
    return driver.sleep(5 * 1000);
  }).then(function () {
    // get the image layer
    return driver.findElement(webdriver.By.className('imageLayer'));
  }).then(function (element) {
    // simulate a mouse move on the image layer
    return driver.actions().
      mouseDown(element).
      mouseMove(element, {x: 0, y: -50}).
      mouseUp().
      perform();
  }).then(function () {
    // sleep to allow to refresh
    return driver.sleep(5 * 1000);
  }).then(function () {
    // update the sauce test name and quit
    var cb = function () {
      console.log('Finished!');
      driver.quit();
    };
    var bname = caps.browserName.toLowerCase();
    bname = bname.replace(/\s+/g, '');
    saucelabs.updateJob(driver.sessionID, {
      name: 'dwv-' + bname,
      build: '0.14.0',
      passed: true
    }, cb);
  });
};

dwv.test.sauceFirefox = function () {
  var caps = {
    browserName: 'Firefox',
    version: '44.0',
    platform: 'Linux'
  };
  dwv.test.sauceTest(caps);
};
dwv.test.sauceChrome = function () {
  var caps = {
    browserName: 'Chrome',
    version: '48.0',
    platform: 'Windows 10'
  };
  dwv.test.sauceTest(caps);
};
dwv.test.sauceSafari = function () {
  var caps = {
    browserName: 'Safari',
    version: '9.0',
    platform: 'OS X 10.11'
  };
  dwv.test.sauceTest(caps);
};
dwv.test.sauceIE = function () {
  var caps = {
    browserName: 'MicrosoftEdge',
    version: '20.10240',
    platform: 'Windows 10'
  };
  dwv.test.sauceTest(caps);

  var caps2 = {
    browserName: 'Internet Explorer',
    version: '11.0',
    platform: 'Windows 10'
  };
  dwv.test.sauceTest(caps2);
};

dwv.test.sauceAndroid = function () {
  var caps = {
    browserName: 'Android',
    version: '5.1',
    platform: 'Linux'
  };
  dwv.test.sauceTest(caps);
};

// main launcher
if (process.argv.length === 3 && process.argv[2] === 'full') {
  dwv.test.sauceFirefox();

  //dwv.test.sauceChrome();

  // no mouse actions in safari...
  //dwv.test.sauceSafari();

  //dwv.test.sauceIE();
}
