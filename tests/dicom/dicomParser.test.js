/**
 * Tests for the 'dicom/dicomParser.js' file.
 */
/** @module tests/dicom */
// Do not warn if these variables were not defined before.
/* global QUnit */
QUnit.module("dicomParser");

/**
 * Tests for {@link dwv.dicom.DicomParser} using simple DICOM data.
 * Using remote file for CI integration.
 * @function module:tests/dicom~dicomParser
 */
//QUnit.test("Test simple DICOM parsing.", function (assert) {
//    var done = assert.async();
//
//    var request = new XMLHttpRequest();
//    var urlRoot = "https://raw.githubusercontent.com/ivmartel/dwv/238-empty-seq";
//    var url = urlRoot + "/tests/data/dwv-test-simple.dcm";
//    request.open('GET', url, true);
//    request.responseType = "arraybuffer";
//    request.onload = function (/*event*/) {
//        assert.ok((this.response.byteLength!==0), "Got a response.");
//
//        // cope with no support for Float64Array (Phantomjs for ex...)
//        if ( typeof Float64Array === "undefined" ) {
//            Float64Array = Float32Array; // jshint ignore:line
//        }
//
//        // parse DICOM
//        var dicomParser = new dwv.dicom.DicomParser();
//        dicomParser.parse(this.response);
//
//        var numRows = 32;
//        var numCols = 32;
//        
//        // raw tags
//        var rawTags = dicomParser.getRawDicomElements();
//        // check values
//        assert.equal(rawTags.x00280010.value[0], numRows, "Number of rows (raw)");
//        assert.equal(rawTags.x00280011.value[0], numCols, "Number of columns (raw)");
//        // ReferencedImageSequence - ReferencedSOPInstanceUID
//        assert.equal(rawTags.x00081140.value[0].x00081155.value[0],
//            "1.3.12.2.1107.5.2.32.35162.2012021515511672669154094",
//            "ReferencedImageSequence SQ (raw)");
//
//        // wrapped tags
//        var tags = dicomParser.getDicomElements();
//        // wrong key
//        assert.equal(tags.getFromKey("x12345678"), null, "Wrong key");
//        assert.notOk(tags.getFromKey("x12345678"), "Wrong key fails if test" );
//        // empty key
//        assert.equal(tags.getFromKey("x00081050"), "", "Empty key");
//        assert.notOk(tags.getFromKey("x00081050"), "Empty key fails if test" );
//        // good key
//        assert.equal(tags.getFromKey("x00280010"), numRows, "Good key");
//        assert.ok(tags.getFromKey("x00280010"), "Good key passes if test" );
//        // zero value (passes test since it is a string)
//        assert.equal(tags.getFromKey("x00181318"), 0, "Good key, zero value");
//        assert.ok(tags.getFromKey("x00181318"), "Good key, zero value passes if test" );
//
//        // check values
//        assert.equal(tags.getFromName("Rows"), numRows, "Number of rows");
//        assert.equal(tags.getFromName("Columns"), numCols, "Number of columns");
//        // ReferencedImageSequence - ReferencedSOPInstanceUID
//        // only one item value -> returns the object directly
//        // (no need for tags.getFromName("ReferencedImageSequence")[0])
//        assert.equal(tags.getFromName("ReferencedImageSequence").x00081155.value[0],
//            "1.3.12.2.1107.5.2.32.35162.2012021515511672669154094",
//            "ReferencedImageSequence SQ");
//
//        // finish async test
//        done();
//    };
//    request.send(null);
//});

/**
 * Tests for {@link dwv.dicom.DicomParser} using sequence test DICOM data.
 * Using remote file for CI integration.
 * @function module:tests/dicom~dicomParser
 */
QUnit.test("Test sequence DICOM parsing.", function (assert) {
    var done = assert.async();

    var request = new XMLHttpRequest();
    var urlRoot = "https://raw.githubusercontent.com/ivmartel/dwv/238-empty-seq";
    var url = urlRoot + "/tests/data/dwv-test-sequence.dcm";
    request.open('GET', url, true);
    request.responseType = "arraybuffer";
    request.onload = function (/*event*/) {
        assert.ok((this.response.byteLength!==0), "Got a response.");

        // cope with no support for Float64Array (Phantomjs for ex...)
        if ( typeof Float64Array === "undefined" ) {
            Float64Array = Float32Array; // jshint ignore:line
        }

        // parse DICOM
        var dicomParser = new dwv.dicom.DicomParser();
        dicomParser.parse(this.response);

        // (wrapped) tags
        var tags = dicomParser.getDicomElements();
        
        // ReferencedImageSequence: explicit sequence
        var seq0 = tags.getFromName("ReferencedImageSequence");
        assert.equal(seq0.length, 2, "ReferencedImageSequence length");
        assert.equal(seq0[0].x00081155.value[0], 
                "1.3.12.2.1107.5.2.32.35162.2012021515511672669154094", 
                "ReferencedImageSequence item0 ReferencedSOPInstanceUID");
        assert.equal(seq0[1].x00081155.value[0], 
                "1.3.12.2.1107.5.2.32.35162.2012021515511286933854090", 
                "ReferencedImageSequence - item1 - ReferencedSOPInstanceUID");

//        // SourceImageSequence: implicit sequence
//        var seq1 = tags.getFromName("SourceImageSequence");
//        assert.equal(seq1.length, 2, "SourceImageSequence length");
//        assert.equal(seq1[0].x00081155.value[0], 
//                "1.3.12.2.1107.5.2.32.35162.2012021515511672669154094", 
//                "SourceImageSequence - item0 - ReferencedSOPInstanceUID");
//        assert.equal(seq1[1].x00081155.value[0], 
//                "1.3.12.2.1107.5.2.32.35162.2012021515511286933854090", 
//                "SourceImageSequence - item1 - ReferencedSOPInstanceUID");
//
//        // ReferencedPatientSequence: explicit empty sequence
//        var seq2 = tags.getFromName("ReferencedPatientSequence");
//        assert.equal(seq2.length, 0, "ReferencedPatientSequence length");
//
//        // ReferencedOverlaySequence: implicit empty sequence
//        var seq3 = tags.getFromName("ReferencedOverlaySequence");
//        assert.equal(seq3.length, 0, "ReferencedOverlaySequence length");
//
//        // ReferencedStudySequence: explicit sequence of sequence
//        var seq4 = tags.getFromName("ReferencedStudySequence");
//        // just one element
//        //assert.equal(seq1.length, 2, "ReferencedStudySequence length");
//        assert.equal(seq4.x0040A170.value[0].x00080100.value[0], 
//                "123456", 
//                "ReferencedStudySequence - seq - item0 - CodeValue");
//
//        // ReferencedSeriesSequence: implicit sequence of sequence
//        var seq5 = tags.getFromName("ReferencedSeriesSequence");
//        // just one element
//        //assert.equal(seq1.length, 2, "ReferencedSeriesSequence length");
//        assert.equal(seq5.x0040A170.value[0].x00080100.value[0], 
//                "789101", 
//                "ReferencedSeriesSequence - seq - item0 - CodeValue");
//
//        // ReferencedInstanceSequence: explicit empty sequence of sequence
//        var seq6 = tags.getFromName("ReferencedInstanceSequence");
//        assert.equal(seq6.x0040A170.value.length, 0, 
//                "ReferencedInstanceSequence - seq - length");
//                
//        // ReferencedVisitSequence: implicit empty sequence of sequence
//        var seq7 = tags.getFromName("ReferencedVisitSequence");
//        assert.equal(seq7.x0040A170.value.length, 0, 
//                "ReferencedVisitSequence - seq - length");

        // finish async test
        done();
    };
    request.send(null);
});

/**
 * Tests for {@link dwv.dicom.cleanString}.
 * @function module:tests/dicom~cleanString
 */
QUnit.test("Test cleanString.", function (assert) {
    // undefined
    assert.equal(dwv.dicom.cleanString(), null, "Clean undefined");
    // null
    assert.equal(dwv.dicom.cleanString(null), null, "Clean null");
    // empty
    assert.equal(dwv.dicom.cleanString(""), "", "Clean empty");
    // short
    assert.equal(dwv.dicom.cleanString("a"), "a", "Clean short");
    // special
    var special = String.fromCharCode("u200B");
    assert.equal(dwv.dicom.cleanString(special), "", "Clean just special");
    // regular
    var str = " El cielo azul ";
    var refStr = "El cielo azul";
    assert.equal(dwv.dicom.cleanString(str), refStr, "Clean regular");
    // regular with special
    str = " El cielo azul" + special;
    refStr = "El cielo azul";
    assert.equal(dwv.dicom.cleanString(str), refStr, "Clean regular with special");
    // regular with special and ending space (not trimmed)
    str = " El cielo azul " + special;
    refStr = "El cielo azul ";
    assert.equal(dwv.dicom.cleanString(str), refStr, "Clean regular with special 2");
});
