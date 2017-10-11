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
    var urlRoot = "https://raw.githubusercontent.com/ivmartel/dwv/master";
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

QUnit.test("Test patient anonymisation", function (assert) {
    var done = assert.async();

    var request = new XMLHttpRequest();
    var urlRoot = "https://raw.githubusercontent.com/ivmartel/dwv/master";
    var url = urlRoot + "/tests/data/dwv-test-anonymise.dcm";
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

        var patientsNameAnonymised = 'anonymise-name';
        var patientsIdAnonymised = 'anonymise-id';
        var rules = {
        		'default': {action: 'copy', value: null },
        		'x00100010' : {action: 'replace', value: patientsNameAnonymised }, // tag
        	    'PatientID': {action: 'replace', value: patientsIdAnonymised}, // tag name 'x00100020'
        	    'Patient' : {action: 'remove', value: null }, // group name 'x0010'
        };

        var patientsName = 'dwv-patient-test';
        var patientID = 'dwv-patient-id123';
        var patientsBirthDate = '19830101';
        var patientsSex = 'M';

        // raw tags
        var rawTags = dicomParser.getRawDicomElements();
        // check values
        assert.equal(rawTags.x00100010.value[0], patientsName, "patientsName");
        assert.equal(rawTags.x00100020.value[0], patientID, "patientID");
        assert.equal(rawTags.x00100030.value[0], patientsBirthDate, "patientsBirthDate");
        assert.equal(rawTags.x00100040.value[0], patientsSex, "patientsSex");

        var dicomWriter = new dwv.dicom.DicomWriter();
        dicomWriter.rules = rules;
        var buffer = dicomWriter.getBuffer(rawTags);

        dicomParser = new dwv.dicom.DicomParser();

        dicomParser.parse(buffer);

        rawTags = dicomParser.getRawDicomElements();

        // check values
        assert.equal(rawTags.x00100010.value[0], patientsNameAnonymised, "patientName");
        assert.equal(rawTags.x00100020.value[0], patientsIdAnonymised, "patientID");
        assert.notOk(rawTags.x00100030, "patientsBirthDate");
        assert.notOk(rawTags.x00100040, "patientsSex");

        // finish async test
        done();
    };
    request.send(null);
});

QUnit.test("Test synthetic dicom", function (assert) {
    var done = assert.async();

    // compare JSON tags to DICOM elements
    var compare = function ( jsonTags, dicomElements, name ) {
        var keys = Object.keys(jsonTags);
        for ( var k = 0; k < keys.length; ++k ) {
            var tag = keys[k];
            var tagGE = dwv.dicom.getGroupElementFromName(tag);
            var tagKey = dwv.dicom.getGroupElementKey(tagGE.group, tagGE.element);
            var element = dicomElements.getDEFromKey(tagKey);
            var value = dicomElements.getFromKey(tagKey, true);
            if ( element.vr !== "SQ" ) {
                assert.equal( value, jsonTags[tag],
                    "(" + name + ") " + tag );
            } else {
                // supposing same order of subkeys and indices...
                var subKeys = Object.keys(jsonTags[tag]);
                var index = 0;
                for ( var sk = 0; sk < subKeys.length; ++sk ) {
                    if ( subKeys[sk] !== "explicitLength" ) {
                        var wrap = new dwv.dicom.DicomElementsWrapper(value[index]);
                        compare(jsonTags[tag][subKeys[sk]], wrap, name);
                        ++index;
                    }
                }
            }
        }
    };

    // get the list of configs
    var request = new XMLHttpRequest();
    var urlRoot = "https://raw.githubusercontent.com/ivmartel/dwv/343-dicom-write";
    var url = urlRoot + "/tests/dicom/synthetic-data.json";
    request.open('GET', url, true);
    request.onerror = function (event) {
        console.error(event);
    };
    request.onload = function (/*event*/) {
        var configs = JSON.parse(this.responseText);
        for (var i = 0; i < configs.length; ++i ) {

            // convert JSON to DICOM element object
            var res = dwv.dicom.getElementsFromJSONTags(configs[i].tags);
            var dicomElements = res.elements;
            // pixels: small gradient square
            dicomElements.x7FE00010 = dwv.dicom.generatePixelDataFromJSONTags(configs[i].tags, res.offset);

            // create DICOM buffer
            var writer = new dwv.dicom.DicomWriter();
            var dicomBuffer = null;
            try {
                dicomBuffer = writer.getBuffer(dicomElements);
            } catch (error) {
                assert.ok(false, "Caught error: "+error);
                return;
            }

            // parse the buffer
            var dicomParser = new dwv.dicom.DicomParser();
            dicomParser.parse(dicomBuffer);
            var elements = dicomParser.getDicomElements();

            // compare contents
            compare(configs[i].tags, elements, configs[i].name);
        }

        // finish async test
        done();
    };
    request.send(null);

});
