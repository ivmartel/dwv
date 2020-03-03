// namespace
var dwv = dwv || {};
dwv.test = dwv.test || {};

/**
 * Tests for the 'io/urlsLoader.js' file.
 */
/** @module tests/io */
// Do not warn if these variables were not defined before.
/* global QUnit */
QUnit.module("io");

// Image decoders (for web workers)
dwv.image.decoderScripts = {
    "jpeg2000": "../../decoders/pdfjs/decode-jpeg2000.js",
    "jpeg-lossless": "../../decoders/rii-mango/decode-jpegloss.js",
    "jpeg-baseline": "../../decoders/pdfjs/decode-jpegbaseline.js",
    "rle": "../../decoders/dwv/decode-rle.js"
};

/**
 * Check the events of urls load
 * @param {Object} assert The Qunit assert object.
 * @param {string} id An id for the test.
 * @param {array} data The data to load as a string array.
 * @param {number} nDataOk The theoretical number of data with no error.
 */
dwv.test.checkLoad(assert, id, data, nDataOk) {
    var done = assert.async();

    var prefix = "[" + id + "] ";
    var nDataError = data.length - nDataOk;

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
          prefix + "Received first load end");
        gotLoadEnd = true;
        // check number of events
        assert.equal(loadStartDates.length, 1,
          prefix + "Received one load start.");
        assert.ok(progressDates.length > 1,
          prefix + "Received more than one progress.");
        assert.equal(loadItemDates.length, nDataOk,
          prefix + "Received " + nDataOk + " load item.");
        var nLoad = nDataError === 0 ? 1 : 0;
        assert.equal(loadDates.length, nLoad,
          prefix + "Received " + nLoad + " load.");
        assert.equal(errorDates.length, nDataError,
          prefix + "Received " + nDataError + " error(s).");
        assert.equal(abortDates.length, 0,
          prefix + "Received 0 abort(s).");
        // check sequence
        var loadStartDate = loadStartDates[0];
        assert.ok(loadStartDate < loadEndDate,
          prefix + "Received start before load end.");
        for (var i = 0; i < progressDates.length; ++i) {
            assert.ok(loadStartDate <= progressDates[i],
              prefix + "Received start before progress #" + i + ".");
            assert.ok(loadEndDate >= progressDates[i],
              prefix + "Received end after progress #" + i + ".");
        }
        for (var j = 0; j < loadItemDates.length; ++j) {
            assert.ok(loadStartDate <= loadItemDates[j],
              prefix + "Received start before load item #" + j + ".");
            assert.ok(loadEndDate >= loadItemDates[j],
              prefix + "Received end after load item #" + j + ".");
        }
        // check load or error event
        if (nDataError === 0) {
            var loadDate = loadDates[0];
            for (var k = 0; k < progressDates.length; ++k) {
                assert.ok(loadDate >= progressDates[k],
                  prefix + "Received load after progress #" + k + ".");
            }
            for (var l = 0; l < loadItemDates.length; ++l) {
                assert.ok(loadDate >= loadItemDates[l],
                  prefix + "Received load after load item #" + l + ".");
            }
            assert.ok(loadStartDate < loadDate,
              prefix + "Received start before load.");
            assert.ok(loadEndDate >= loadDate,
              prefix + "Received end after load.");
        } else {
            for (var m = 0; m < errorDates.length; ++m) {
                assert.ok(loadStartDate < errorDates[m],
                  prefix + "Received start before error #" + m + ".");
                assert.ok(loadEndDate >= errorDates[m],
                  prefix + "Received end after error #" + m + ".");
            }
        }
        // finish async test
        done();
    };
    loader.onerror = function (event) {
        errorDates.push(new Date());
    };
    loader.onabort = function (/*event*/) {
        abortDates.push(new Date());
    };
    // launch load
    loader.load(data);
}

/**
 * Tests for {@link dwv.io.UrlsLoader} events with single frame data.
 * @function module:tests/io~UrlsLoader0
 */
QUnit.test("Test UrlsLoader events for single frame.", function (assert) {
    var urlRoot = "https://raw.githubusercontent.com/ivmartel/dwv/master";

    // #0: 2 good dicom
    var data0 = [
        urlRoot + "/tests/data/bbmri-53323131.dcm",
        urlRoot + "/tests/data/bbmri-53323275.dcm",
    ];
    var nDataOk0 = 2;
    dwv.test.checkLoad(assert, "0", data0, nDataOk0);

    // #1: 2 not found (404) dicom
    var data1 = [
        urlRoot + "/a.dcm",
        urlRoot + "/b.dcm",
    ];
    var nDataOk1 = 0;
    dwv.test.checkLoad(assert, "1", data1, nDataOk1);

    // #2: 2 dicom, 1 not found (404, error in XHR request)
    var data2 = [
        urlRoot + "/tests/data/bbmri-53323131.dcm",
        urlRoot + "/b.dcm",
    ];
    var nDataOk2 = 1;
    dwv.test.checkLoad(assert, "2", data2, nDataOk2);

    // #3: 2 dicom, 1 bad (no rows, error in loader)
    var urlRoot2 = "https://raw.githubusercontent.com/ivmartel/dwv/develop";
    var data3 = [
        urlRoot + "/tests/data/dwv-test-simple.dcm",
        urlRoot2 + "/tests/data/dwv-test_no-number-rows.dcm",
    ];
    var nDataOk3 = 1;
    dwv.test.checkLoad(assert, "3", data3, nDataOk3);
});

/**
 * Tests for {@link dwv.io.UrlsLoader} events with multi frame data.
 * @function module:tests/io~UrlsLoader1
 */
QUnit.test("Test UrlsLoader events for multi frame.", function (assert) {
    var urlRoot = "https://raw.githubusercontent.com/ivmartel/dwv/master";
    var urlRoot2 = "https://raw.githubusercontent.com/ivmartel/dwv/develop";

    // #0: simple multi frame
    var data0 = [
        urlRoot + "/tests/data/multiframe-test1.dcm",
    ];
    var nDataOk0 = 1;
    dwv.test.checkLoad(assert, "0", data0, nDataOk0);

    // #1: encoded multi frame
    var data1 = [
        urlRoot2 + "/tests/data/multiframe-jpegloss-ge.dcm",
    ];
    var nDataOk1 = 1;
    dwv.test.checkLoad(assert, "1", data1, nDataOk1);
});

// TODO: zip, DICOMDIR
