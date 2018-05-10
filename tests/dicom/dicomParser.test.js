/**
 * Tests for the 'dicom/dicomParser.js' file.
 */
/** @module tests/dicom */
// Do not warn if these variables were not defined before.
/* global QUnit */
QUnit.module("dicomParser");

// WARNING about PhantomJS 1.9
// ---------------------------
// TypedArray implementation seems incomplete, at least different than observed
// behavior in browsers...
// For a DICOM dataset, it was giving an:
// 'RangeError: ArrayBuffer length minus the byteOffset is not a multiple of the element size.'
// Which seem to originate from reading the data of first tag
// (FileMetaInformationGroupLength, Uint32 -> size=4)
// at offset 140 of a file of size 3070. 3070-140=2930; 2930/4=732.5...
//
// Error which, according to specs, should be thrown when the size of the data
// to read is not specified (see
// https://www.khronos.org/registry/typedarray/specs/latest/#7). But it is specified...
//
// So I updated the data to be of the correct size (in this case 3072)...

/**
 * Tests for {@link dwv.dicom.DicomParser} using simple DICOM data.
 * Using remote file for CI integration.
 * @function module:tests/dicom~dicomParser
 */
QUnit.test("Test simple DICOM parsing.", function (assert) {
    var done = assert.async();

    var request = new XMLHttpRequest();
    var urlRoot = "https://raw.githubusercontent.com/ivmartel/dwv/master";
    var url = urlRoot + "/tests/data/dwv-test-simple.dcm";
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

        var numRows = 32;
        var numCols = 32;

        // raw tags
        var rawTags = dicomParser.getRawDicomElements();
        // check values
        assert.equal(rawTags.x00280010.value[0], numRows, "Number of rows (raw)");
        assert.equal(rawTags.x00280011.value[0], numCols, "Number of columns (raw)");
        // ReferencedImageSequence - ReferencedSOPInstanceUID
        assert.equal(rawTags.x00081140.value[0].x00081155.value[0],
            "1.3.12.2.1107.5.2.32.35162.2012021515511672669154094",
            "ReferencedImageSequence SQ (raw)");

        // wrapped tags
        var tags = dicomParser.getDicomElements();
        // wrong key
        assert.equal(tags.getFromKey("x12345678"), null, "Wrong key");
        assert.notOk(tags.getFromKey("x12345678"), "Wrong key fails if test" );
        // empty key
        assert.equal(tags.getFromKey("x00081050"), "", "Empty key");
        assert.notOk(tags.getFromKey("x00081050"), "Empty key fails if test" );
        // good key
        assert.equal(tags.getFromKey("x00280010"), numRows, "Good key");
        assert.ok(tags.getFromKey("x00280010"), "Good key passes if test" );
        // zero value (passes test since it is a string)
        assert.equal(tags.getFromKey("x00181318"), 0, "Good key, zero value");
        assert.ok(tags.getFromKey("x00181318"), "Good key, zero value passes if test" );

        // check values
        assert.equal(tags.getFromName("Rows"), numRows, "Number of rows");
        assert.equal(tags.getFromName("Columns"), numCols, "Number of columns");
        // ReferencedImageSequence - ReferencedSOPInstanceUID
        // only one item value -> returns the object directly
        // (no need for tags.getFromName("ReferencedImageSequence")[0])
        assert.equal(tags.getFromName("ReferencedImageSequence").x00081155.value[0],
            "1.3.12.2.1107.5.2.32.35162.2012021515511672669154094",
            "ReferencedImageSequence SQ");

        // finish async test
        done();
    };
    request.send(null);
});

/**
 * Tests for {@link dwv.dicom.DicomParser} using sequence test DICOM data.
 * Using remote file for CI integration.
 * @function module:tests/dicom~dicomParser
 */
QUnit.test("Test sequence DICOM parsing.", function (assert) {
    var done = assert.async();

    var request = new XMLHttpRequest();
    var urlRoot = "https://raw.githubusercontent.com/ivmartel/dwv/master";
    var url = urlRoot + "/tests/data/dwv-test-sequence.dcm";
    request.open('GET', url, true);
    request.responseType = "arraybuffer";
    request.onload = function (/*event*/) {
        assert.ok((this.response.byteLength!==0), "Got a response.");

        // parse DICOM
        var dicomParser = new dwv.dicom.DicomParser();
        dicomParser.parse(this.response);
        // raw tags
        var rawTags = dicomParser.getRawDicomElements();
        assert.ok((Object.keys(rawTags).length!==0), "Got raw tags.");
        // wrapped tags
        var tags = dicomParser.getDicomElements();
        assert.ok((tags.dumpToTable().length!==0), "Got wrapped tags.");

        // ReferencedImageSequence: explicit sequence
        var seq00 = tags.getFromName("ReferencedImageSequence");
        assert.equal(seq00.length, 3, "ReferencedImageSequence length");
        assert.equal(seq00[0].x00081155.value[0],
                "1.3.12.2.1107.5.2.32.35162.2012021515511672669154094",
                "ReferencedImageSequence - item0 - ReferencedSOPInstanceUID");
        assert.equal(seq00[1].x00081155.value[0],
                "1.3.12.2.1107.5.2.32.35162.2012021515511286933854090",
                "ReferencedImageSequence - item1 - ReferencedSOPInstanceUID");

        // SourceImageSequence: implicit sequence
        var seq01 = tags.getFromName("SourceImageSequence");
        assert.equal(seq01.length, 3, "SourceImageSequence length");
        assert.equal(seq01[0].x00081155.value[0],
                "1.3.12.2.1107.5.2.32.35162.2012021515511672669154094",
                "SourceImageSequence - item0 - ReferencedSOPInstanceUID");
        assert.equal(seq01[1].x00081155.value[0],
                "1.3.12.2.1107.5.2.32.35162.2012021515511286933854090",
                "SourceImageSequence - item1 - ReferencedSOPInstanceUID");

        // ReferencedPatientSequence: explicit empty sequence
        var seq10 = tags.getFromName("ReferencedPatientSequence");
        assert.equal(seq10.length, 0, "ReferencedPatientSequence length");

        // ReferencedOverlaySequence: implicit empty sequence
        var seq11 = tags.getFromName("ReferencedOverlaySequence");
        assert.equal(seq11.length, 0, "ReferencedOverlaySequence length");

        // ReferringPhysicianIdentificationSequence: explicit empty item
        var seq12 = tags.getFromName("ReferringPhysicianIdentificationSequence");
        assert.equal(seq12.xFFFEE000.value.length, 0,
                "ReferringPhysicianIdentificationSequence item length");

        // ConsultingPhysicianIdentificationSequence: implicit empty item
        var seq13 = tags.getFromName("ConsultingPhysicianIdentificationSequence");
        assert.equal(seq13.xFFFEE000.value.length, 0,
            "ConsultingPhysicianIdentificationSequence item length");

        // ReferencedStudySequence: explicit sequence of sequence
        var seq20 = tags.getFromName("ReferencedStudySequence");
        // just one element
        //assert.equal(seq20.length, 2, "ReferencedStudySequence length");
        assert.equal(seq20.x0040A170.value[0].x00080100.value[0],
                "123456",
                "ReferencedStudySequence - seq - item0 - CodeValue");

        // ReferencedSeriesSequence: implicit sequence of sequence
        var seq21 = tags.getFromName("ReferencedSeriesSequence");
        // just one element
        //assert.equal(seq21.length, 2, "ReferencedSeriesSequence length");
        assert.equal(seq21.x0040A170.value[0].x00080100.value[0],
                "789101",
                "ReferencedSeriesSequence - seq - item0 - CodeValue");

        // ReferencedInstanceSequence: explicit empty sequence of sequence
        var seq30 = tags.getFromName("ReferencedInstanceSequence");
        assert.equal(seq30.x0040A170.value.length, 0,
                "ReferencedInstanceSequence - seq - length");

        // ReferencedVisitSequence: implicit empty sequence of sequence
        var seq31 = tags.getFromName("ReferencedVisitSequence");
        assert.equal(seq31.x0040A170.value.length, 0,
                "ReferencedVisitSequence - seq - length");

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

/**
 * Tests for {@link dwv.dicom.DicomParser} using simple DICOM data.
 * Using remote file for CI integration.
 * @function module:tests/dicom~dicomParser
 */
QUnit.test("Test DICOMDIR parsing.", function (assert) {
    var done = assert.async();

    var request = new XMLHttpRequest();
    var urlRoot = "https://raw.githubusercontent.com/ivmartel/dwv/425-dicomdir";
    var url = urlRoot + "/tests/data/DICOMDIR";
    request.open('GET', url, true);
    request.responseType = "arraybuffer";
    request.onerror = function (event) {
        console.log(event);
    };
    request.onload = function (/*event*/) {
        assert.ok((this.response.byteLength!==0), "Got a response.");

        // get the file list
        var list = dwv.dicom.getFileListFromDicomDir(this.response);

        // check file list
        var nFilesSeries0Study0 = 23;
        var nFilesSeries1Study0 = 20;
        var nFilesSeries0Study1 = 1;
        assert.equal(list.length, 2, "Number of study");
        assert.equal(list[0].length, 2, "Number of series in first study");
        assert.equal(list[1].length, 1, "Number of series in second study");
        assert.equal(list[0][0].length, nFilesSeries0Study0, "Study#0:Series#0 number of files");
        assert.equal(list[0][1].length, nFilesSeries1Study0, "Study#0:Series#1 number of files");
        assert.equal(list[1][0].length, nFilesSeries0Study1, "Study#1:Series#0 number of files");

        // files
        var files00 = [];
        var iStart = 0;
        var iEnd = nFilesSeries0Study0;
        for ( var i = iStart; i < iEnd; ++i ) {
            files00.push("IMAGES/IM" + i);
        }
        assert.deepEqual(list[0][0], files00, "Study#0:Series#0 file names");
        var files01 = [];
        iStart = iEnd;
        iEnd += nFilesSeries1Study0;
        for ( i = iStart; i < iEnd; ++i ) {
            files01.push("IMAGES/IM" + i);
        }
        assert.deepEqual(list[0][0], files00, "Study#0:Series#1 file names");
        var files10 = [];
        iStart = iEnd;
        iEnd += nFilesSeries0Study1;
        for ( i = iStart; i < iEnd; ++i ) {
            files10.push("IMAGES/IM" + i);
        }
        assert.deepEqual(list[0][0], files00, "Study#1:Series#0 file names");

        // finish async test
        done();
    };
    request.send(null);
});
