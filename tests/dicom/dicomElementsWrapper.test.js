/**
 * Tests for the 'dicom/dicomElementsWrapper.js' file.
 */
/** @module tests/dicom */
// Do not warn if these variables were not defined before.
/* global QUnit */
QUnit.module("dicomElementsWrapper");

/**
 * Tests for {@link dwv.dicom.DicomElementsWrapper} using simple DICOM data.
 * Using remote file for CI integration.
 * @function module:tests/dicom~dicomElementsWrapper
 */
QUnit.test("Test simple DICOM wrapping.", function (assert) {
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

        // wrapped tags
        var tags = dicomParser.getDicomElements();
        // dump to table
        var table = dwv.utils.objectToArray(tags.dumpToObject());

        // regression table
        var teoTable = [
            {
                "name": "FileMetaInformationGroupLength", "value": "27",
                "group": "0x0002", "element": "0x0000", "vr": "UL", "vl": 4
            },
            {
                "name": "TransferSyntaxUID", "value": "1.2.840.10008.1.2.1",
                "group": "0x0002", "element": "0x0010", "vr": "UI", "vl": 19
            },
            {
                "name": "Modality", "value": "MR",
                "group": "0x0008", "element": "0x0060", "vr": "CS", "vl": 2
            },
            {
                "name": "PatientName", "value": "dwv-patient-name",
                "group": "0x0010", "element": "0x0010", "vr": "PN", "vl": 16
            },
            {
                "name": "PerformingPhysicianName", "value": "(no value available)",
                "group": "0x0008", "element": "0x1050", "vr": "PN", "vl": 0
            },
            {
                "name": "dBdt", "value": "0",
                "group": "0x0018", "element": "0x1318", "vr": "DS", "vl": 1
            },
            {
                "name": "PhotometricInterpretation", "value": "MONOCHROME2",
                "group": "0x0028", "element": "0x0004", "vr": "CS", "vl": 11
            },
            {
                "name": "SamplesPerPixel", "value": "1",
                "group": "0x0028", "element": "0x0002", "vr": "US", "vl": 2
            },
            {
                "name": "PixelRepresentation", "value": "0",
                "group": "0x0028", "element": "0x0103", "vr": "US", "vl": 2
            },
            {
                "name": "Rows", "value": "32",
                "group": "0x0028", "element": "0x0010", "vr": "US", "vl": 2
            },
            {
                "name": "Columns", "value": "32",
                "group": "0x0028", "element": "0x0011", "vr": "US", "vl": 2
            },
            {
                "name": "BitsAllocated", "value": "16",
                "group": "0x0028", "element": "0x0100", "vr": "US", "vl": 2
            },
            {
                "name": "BitsStored", "value": "12",
                "group": "0x0028", "element": "0x0101", "vr": "US", "vl": 2
            },
            {
                "name": "HighBit", "value": "11",
                "group": "0x0028", "element": "0x0102", "vr": "US", "vl": 2
            },
            {
                "name": "ReferencedImageSequence", "value": "[object Object]",
                "group": "0x0008", "element": "0x1140", "vr": "SQ", "vl": 101
            },
            {
                "name": "PixelData", "value": "...",
                "group": "0x7FE0", "element": "0x0010", "vr": "OW", "vl": 2060
            }
        ];

        // test
        var len = table.length;
        assert.equal(len, teoTable.length, "dumpToTable length");

        // special pixel data case: browsers have different toString
        for ( var i = 0; i < len; ++i ) {
            if ( table[i].name === "PixelData" && table[i].value === "[object Uint16Array]" ) {
                table[i].value = "...";
            }
        }
        assert.deepEqual(table, teoTable, "dumpToTable content");

        // finish async test
        done();
    };
    request.send(null);
});
