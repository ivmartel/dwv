/**
 * Tests for the 'dicom/dicomParser.js' file.
 */
// Do not warn if these variables were not defined before.
/* global QUnit, module, equal */
module("dicomParser");

QUnit.test("Test DICOM parsing.", 3, function (assert) {
    // Local file: forbidden...
    // parse the DICOM file
    /*var reader = new FileReader();
    reader.onload = function(event) {
        // parse DICOM file
        var data = dwv.image.getDataFromDicomBuffer(event.target.result);
    };
    var file = new File("cta.dcm");
    reader.readAsArrayBuffer(file);*/
    
    var done = assert.async();
    
    var request = new XMLHttpRequest();
    var url = "http://x.babymri.org/?53320924&.dcm";
    request.open('GET', url, true);
    request.responseType = "arraybuffer"; 
    request.onload = function (/*event*/) {
        // parse DICOM
        var dicomParser = new dwv.dicom.DicomParser();
        dicomParser.parse(this.response);
        var tags = dicomParser.getDicomElements();
        // check values
        equal(tags.getFromName("Rows"), 256, "Number of rows");
        equal(tags.getFromName("Columns"), 256, "Number of columns");
        // ReferencedImageSequence - ReferencedSOPInstanceUID 
        equal(tags.getFromName("ReferencedImageSequence")[0].x00081155.value[0], 
            "1.3.12.2.1107.5.2.32.35162.2012021515511672669154094", 
            "ReferencedImageSequence SQ");
        // start async test
        done();
    };
    request.send(null);
});

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

