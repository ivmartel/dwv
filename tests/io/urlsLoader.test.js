// namespace
var dwv = dwv || {};
dwv.test = dwv.test || {};

/**
 * Tests for the 'io/urlsLoader.js' file.
 */
/** @module tests/io */
// Do not warn if these variables were not defined before.
/* global QUnit */
QUnit.module('io');

// Image decoders (for web workers)
dwv.image.decoderScripts = {
  'jpeg2000': '../../decoders/pdfjs/decode-jpeg2000.js',
  'jpeg-lossless': '../../decoders/rii-mango/decode-jpegloss.js',
  'jpeg-baseline': '../../decoders/pdfjs/decode-jpegbaseline.js',
  'rle': '../../decoders/dwv/decode-rle.js'
};

/**
 * Check the events of urls load
 *
 * @param {object} assert The Qunit assert object.
 * @param {string} id An id for the test.
 * @param {Array} data The data to load as a string array.
 * @param {number} nData The theoretical number of data.
 * @param {number} nDataOk The theoretical number of data with no error.
 */
dwv.test.checkLoad = function (assert, id, data, nData, nDataOk) {
  var done = assert.async();

  var prefix = '[' + id + '] ';
  var nDataError = nData - nDataOk;

  // checks
  var loadStartDates = [];
  var progressDates = [];
  var loadItemDates = [];
  var loadDates = [];
  var errorDates = [];
  var abortDates = [];
  var gotLoadEnd = false;

  // create loader
  var loader = new dwv.io.UrlsLoader();
  // callbacks
  loader.onloadstart = function (/*event*/) {
    loadStartDates.push(new Date());
  };
  loader.onprogress = function (/*event*/) {
    progressDates.push(new Date());
  };
  loader.onloaditem = function (/*event*/) {
    loadItemDates.push(new Date());
  };
  loader.onload = function (/*event*/) {
    loadDates.push(new Date());
  };
  loader.onloadend = function (/*event*/) {
    var loadEndDate = new Date();
    assert.notOk(gotLoadEnd,
      prefix + 'Received first load end.');
    gotLoadEnd = true;

    // check number of events
    assert.equal(loadStartDates.length, 1,
      prefix + 'Received one load start.');
    if (nDataOk !== 0) {
      assert.ok(progressDates.length > 0,
        prefix + 'Received at least one progress.');
    }
    assert.equal(loadItemDates.length, nDataOk,
      prefix + 'Received ' + nDataOk + ' load item.');
    var nLoad = nDataError === 0 ? 1 : 0;
    assert.equal(loadDates.length, nLoad,
      prefix + 'Received ' + nLoad + ' load.');
    assert.equal(errorDates.length, nDataError,
      prefix + 'Received ' + nDataError + ' error(s).');
    assert.equal(abortDates.length, 0,
      prefix + 'Received 0 abort(s).');

    // check start/end sequence
    var loadStartDate = loadStartDates[0];
    assert.ok(loadStartDate < loadEndDate,
      prefix + 'Received start before load end.');

    var firstProgressDate = null;
    var lastProgressDate = null;
    var firstLoadItemDate = null;
    var lastLoadItemDate = null;

    if (nDataOk !== 0) {
      // check progress sequence
      progressDates.sort();
      firstProgressDate = progressDates[0];
      lastProgressDate = progressDates[progressDates.length - 1];
      assert.ok(loadStartDate <= firstProgressDate,
        prefix + 'Received start before first progress.');
      assert.ok(loadEndDate >= lastProgressDate,
        prefix + 'Received end after last progress.');

      // check load item sequence
      loadItemDates.sort();
      firstLoadItemDate = loadItemDates[0];
      lastLoadItemDate = loadItemDates[loadItemDates.length - 1];
      assert.ok(loadStartDate <= firstLoadItemDate,
        prefix + 'Received start before first load item.');
      assert.ok(loadEndDate >= lastLoadItemDate,
        prefix + 'Received end after last load item.');
    }

    // check load or error event sequence
    if (nDataError === 0) {
      // load is sent if no error happened
      var loadDate = loadDates[0];
      assert.ok(loadStartDate <= loadDate,
        prefix + 'Received start before load.');
      assert.ok(loadDate >= lastProgressDate,
        prefix + 'Received load after last progress.');
      assert.ok(loadDate >= lastLoadItemDate,
        prefix + 'Received load after last load item.');
      assert.ok(loadEndDate >= loadDate,
        prefix + 'Received end after load.');
    } else {
      errorDates.sort();
      var firstErrorDate = errorDates[0];
      var lastErrorDate = errorDates[errorDates.length - 1];
      assert.ok(loadStartDate <= firstErrorDate,
        prefix + 'Received start before first error.');
      assert.ok(loadEndDate >= lastErrorDate,
        prefix + 'Received end after last error.');
    }
    // finish async test
    done();
  };
  loader.onerror = function (/*event*/) {
    errorDates.push(new Date());
  };
  loader.onabort = function (/*event*/) {
    abortDates.push(new Date());
  };
  // launch load
  loader.load(data);
};

/**
 * Tests for {@link dwv.io.UrlsLoader} events with single frame data.
 *
 * @function module:tests/io~UrlsLoader0
 */
QUnit.test('Test UrlsLoader events for single frame.', function (assert) {
  // #0: 2 good dicom
  var data0 = [
    '/tests/data/bbmri-53323131.dcm',
    '/tests/data/bbmri-53323275.dcm',
  ];
  var nData0 = data0.length;
  var nDataOk0 = nData0;
  dwv.test.checkLoad(assert, '0', data0, nData0, nDataOk0);

  // #1: 2 not found (404) dicom
  var data1 = [
    '/a.dcm',
    '/b.dcm',
  ];
  var nData1 = data1.length;
  var nDataOk1 = 0;
  dwv.test.checkLoad(assert, '1', data1, nData1, nDataOk1);

  // #2: 2 dicom, 1 not found (404, error in XHR request)
  var data2 = [
    '/tests/data/bbmri-53323131.dcm',
    '/b.dcm',
  ];
  var nData2 = data2.length;
  var nDataOk2 = 1;
  dwv.test.checkLoad(assert, '2', data2, nData2, nDataOk2);

  // #3: 2 dicom, 1 bad (no rows, error in loader)
  var data3 = [
    '/tests/data/dwv-test-simple.dcm',
    '/tests/data/dwv-test_no-number-rows.dcm',
  ];
  var nData3 = data3.length;
  var nDataOk3 = 1;
  dwv.test.checkLoad(assert, '3', data3, nData3, nDataOk3);
});

/**
 * Tests for {@link dwv.io.UrlsLoader} events with multi frame data.
 *
 * @function module:tests/io~UrlsLoader1
 */
QUnit.test('Test UrlsLoader events for multi frame.', function (assert) {
  // #0: simple multi frame
  var data0 = [
    '/tests/data/multiframe-test1.dcm',
  ];
  var nData0 = data0.length;
  var nDataOk0 = nData0;
  dwv.test.checkLoad(assert, '0', data0, nData0, nDataOk0);

  // #1: encoded multi frame
  // TODO seems to cause problems to phantomjs...
  /*var data1 = [
        "/tests/data/multiframe-jpegloss-ge.dcm",
    ];
    var nData1 = data1.length;
    var nDataOk1 = nData1;
    dwv.test.checkLoad(assert, "1", data1, nData1, nDataOk1);*/
});

/**
 * Tests for {@link dwv.io.UrlsLoader} events with zipped data.
 *
 * @function module:tests/io~UrlsLoader2
 */
QUnit.test('Test UrlsLoader events for zipped data.', function (assert) {
  // #0: simple zip
  var data0 = [
    '/tests/data/bbmri.zip',
  ];
  var nData0 = 2;
  var nDataOk0 = 2;
  dwv.test.checkLoad(assert, '0', data0, nData0, nDataOk0);

  // #1: bad link to zip
  var data1 = [
    '/tests/data/a.zip',
  ];
  var nData1 = 1;
  var nDataOk1 = 0;
  dwv.test.checkLoad(assert, '1', data1, nData1, nDataOk1);

  // #2: zip with erroneus data
  var data2 = [
    '/tests/data/dwv-test_bad.zip',
  ];
  var nData2 = 2;
  var nDataOk2 = 1;
  dwv.test.checkLoad(assert, '2', data2, nData2, nDataOk2);
});

/**
 * Tests for {@link dwv.io.UrlsLoader} events with DCMDIR data.
 *
 * @function module:tests/io~UrlsLoader3
 */
QUnit.test('Test UrlsLoader events for DCMDIR data.', function (assert) {
  // #0: simple DCMDIR
  var data0 = [
    '/tests/data/bbmri.dcmdir',
  ];
  var nData0 = 4;
  var nDataOk0 = 4;
  dwv.test.checkLoad(assert, '0', data0, nData0, nDataOk0);

  // #1: bad link to DCMDIR
  var data1 = [
    '/tests/data/a.dcmdir',
  ];
  var nData1 = 1;
  var nDataOk1 = 0;
  dwv.test.checkLoad(assert, '1', data1, nData1, nDataOk1);

  // #2: DCMDIR with bad links -> TODO
  // #3: DCMDIR with erroneus data -> TODO
});
