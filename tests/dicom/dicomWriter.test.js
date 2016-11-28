/**
 * Tests for the 'dicom/dicomWriter.js' file.
 */
/** @module tests/dicom */
// Do not warn if these variables were not defined before.
/* global QUnit */
QUnit.module("dicomWriter");

/**
 * Tests for {@link dwv.dicom.DicomWriter} using simple DICOM data.
 * Using remote file for CI integration.
 * @function module:tests/dicom~dicomWriter
 */
QUnit.test("Test multiframe writer support.", function (assert) {
    var done = assert.async();

    var request = new XMLHttpRequest();
    var urlRoot = "https://raw.githubusercontent.com/yulia-tue/dwv/master";
    var url = urlRoot + "/tests/data/multiframe-test1.dcm";
    request.open('GET', url, true);
    request.responseType = "arraybuffer";
    request.onerror = function (event) {
        console.log(event);
    };
    request.onload = function (/*event*/) {
        assert.ok((this.response.byteLength!==0), "Got a response.");

        // parse DICOM
        var dicomParser = new dwv.dicom.DicomParser();
        dicomParser.parse(this.response);

        var numFrames = 16;

        // raw tags
        var rawTags = dicomParser.getRawDicomElements();
        // check values
        assert.equal(rawTags.x00280008.value[0], numFrames, "Number of frames");
        // length of value array for pixel data
        assert.equal(rawTags.x7FE00010.value.length, numFrames, "Length of value array for pixel data");
        
        var dicomWriter = new dwv.dicom.DicomWriter();
        var buffer = dicomWriter.getBuffer(rawTags);
        
        dicomParser = new dwv.dicom.DicomParser();
        dicomParser.parse(buffer);

        rawTags = dicomParser.getRawDicomElements();
        
        // check values
        assert.equal(rawTags.x00280008.value[0], numFrames, "Number of frames");
        // length of value array for pixel data
        assert.equal(rawTags.x7FE00010.value.length, numFrames, "Length of value array for pixel data");
        
        // finish async test
        done();
    };
    request.send(null);
});