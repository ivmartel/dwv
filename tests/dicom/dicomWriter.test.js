/**
 * Tests for the 'dicom/dicomWriter.js' file.
 */
/** @module tests/dicom */
// Do not warn if these variables were not defined before.
/* global QUnit */
QUnit.module("dicomWriter");

var dwv = dwv || {};
dwv.utils = dwv.utils || {};
dwv.utils.test = dwv.utils.test || {};

dwv.urlRoot = "https://raw.githubusercontent.com/ivmartel/dwv/590-non-even-pad";

/**
 * Tests for {@link dwv.dicom.DicomWriter} using simple DICOM data.
 * Using remote file for CI integration.
 * @function module:tests/dicom~dicomWriter
 */
QUnit.test("Test multiframe writer support.", function (assert) {
    var done = assert.async();

    var request = new XMLHttpRequest();
    var url = dwv.urlRoot + "/tests/data/multiframe-test1.dcm";
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
    var url = dwv.urlRoot + "/tests/data/dwv-test-anonymise.dcm";
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

/**
 * Get a string representation of an object.
 * TypedArray.toString can return '[object Uint8Array]' on old browsers
 * (such as in PhantomJs).
 * @param {Object} obj The input object
 * @return {String} The string.
 */
dwv.utils.test.toString = function ( obj ) {
    var res = obj.toString();
    if ( res.substr(0,7) === "[object" &&
        res.substr((res.length - 6),6) === "Array]") {
        res = "";
        for ( var i = 0; i < obj.length; ++i ) {
            res += obj[i];
            if ( i !== obj.length - 1 ) {
                res += ",";
            }
        }
    }
    return res;
};

/**
 * Compare JSON tags and DICOM elements
 * @param {Object} jsonTags The JSON tags.
 * @param {Object} dicomElements The DICOM elements
 * @param {String} name The name of the test.
 * @param {Object} comaprator An object with an equal function (such as Qunit assert).
 */
dwv.utils.test.compare = function ( jsonTags, dicomElements, name, comparator ) {
    // check content
    if (jsonTags === null || jsonTags === 0) {
        return;
    }
    var keys = Object.keys(jsonTags);
    for ( var k = 0; k < keys.length; ++k ) {
        var tag = keys[k];
        var tagGE = dwv.dicom.getGroupElementFromName(tag);
        var tagKey = dwv.dicom.getGroupElementKey(tagGE.group, tagGE.element);
        var element = dicomElements.getDEFromKey(tagKey);
        var value = dicomElements.getFromKey(tagKey, true);
        if ( element.vr !== "SQ" ) {
            comparator.equal(dwv.utils.test.toString(value), jsonTags[tag], name + " - " + tag);
        } else {
            // check content
            if (jsonTags[tag] === null || jsonTags[tag] === 0) {
                continue;
            }
            // supposing same order of subkeys and indices...
            var subKeys = Object.keys(jsonTags[tag]);
            var index = 0;
            for ( var sk = 0; sk < subKeys.length; ++sk ) {
                if ( subKeys[sk] !== "explicitLength" ) {
                    var wrap = new dwv.dicom.DicomElementsWrapper(value[index]);
                    dwv.utils.test.compare(jsonTags[tag][subKeys[sk]], wrap, name, comparator);
                    ++index;
                }
            }
        }
    }
};

/**
 * Test a JSON config.
 * @param {Object} config A JSON config representing DICOM tags.
 * @param {Object} assert A Qunit assert.
 */
dwv.utils.test.testConfig = function (config, assert) {
    // convert JSON to DICOM element object
    var res = dwv.dicom.getElementsFromJSONTags(config.tags);
    var dicomElements = res.elements;
    // pixels: small gradient square
    dicomElements.x7FE00010 = dwv.dicom.generatePixelDataFromJSONTags(config.tags, res.offset);

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
    dwv.utils.test.compare(config.tags, elements, config.name, assert);
};

QUnit.test("Test synthetic dicom explicit", function (assert) {
    var done = assert.async();

    // get the list of configs
    var request = new XMLHttpRequest();
    var url = dwv.urlRoot + "/tests/dicom/synthetic-data_explicit.json";
    request.open('GET', url, true);
    request.onerror = function (event) {
        console.error(event);
    };
    request.onload = function (/*event*/) {
        var configs = JSON.parse(this.responseText);
        for (var i = 0; i < configs.length; ++i ) {
            dwv.utils.test.testConfig(configs[i], assert);
        }
        // finish async test
        done();
    };
    request.send(null);
});

QUnit.test("Test synthetic dicom implicit", function (assert) {
    var done = assert.async();

    // get the list of configs
    var request = new XMLHttpRequest();
    var url = dwv.urlRoot + "/tests/dicom/synthetic-data_implicit.json";
    request.open('GET', url, true);
    request.onerror = function (event) {
        console.error(event);
    };
    request.onload = function (/*event*/) {
        var configs = JSON.parse(this.responseText);
        for (var i = 0; i < configs.length; ++i ) {
            dwv.utils.test.testConfig(configs[i], assert);
        }
        // finish async test
        done();
    };
    request.send(null);
});

QUnit.test("Test synthetic dicom explicit big endian", function (assert) {
    var done = assert.async();

    // get the list of configs
    var request = new XMLHttpRequest();
    var url = dwv.urlRoot + "/tests/dicom/synthetic-data_explicit_big-endian.json";
    request.open('GET', url, true);
    request.onerror = function (event) {
        console.error(event);
    };
    request.onload = function (/*event*/) {
        var configs = JSON.parse(this.responseText);
        for (var i = 0; i < configs.length; ++i ) {
            dwv.utils.test.testConfig(configs[i], assert);
        }
        // finish async test
        done();
    };
    request.send(null);
});
