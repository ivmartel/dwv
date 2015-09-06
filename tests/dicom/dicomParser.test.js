/**
 * Tests for the 'dicom/dicomParser.js' file.
 */
// Do not warn if these variables were not defined before.
/* global QUnit */
QUnit.module("dicomParser");

QUnit.test("Test DICOM parsing.", function (assert) {
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
        assert.ok((this.response.byteLength!==0), "Got a response.");
        
        // cope with no support for Float64Array (Phantomjs for ex...)
        if ( typeof Float64Array === "undefined" ) {
            Float64Array = Float32Array; // jshint ignore:line
        }            
        
        // parse DICOM
        var dicomParser = new dwv.dicom.DicomParser();
        dicomParser.parse(this.response);
        
        // raw tags
        var rawTags = dicomParser.getRawDicomElements();
        // check values
        assert.equal(rawTags.x00280010.value[0], 256, "Number of rows (raw)");
        assert.equal(rawTags.x00280011.value[0], 256, "Number of columns (raw)");
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
        assert.equal(tags.getFromKey("x00280010"), 256, "Good key");
        assert.ok(tags.getFromKey("x00280010"), "Good key passes if test" );
        // zero value (passes test since it is a string)
        assert.equal(tags.getFromKey("x00181318"), 0, "Good key, zero value");
        assert.ok(tags.getFromKey("x00181318"), "Good key, zero value passes if test" );

        // check values
        assert.equal(tags.getFromName("Rows"), 256, "Number of rows");
        assert.equal(tags.getFromName("Columns"), 256, "Number of columns");
        // ReferencedImageSequence - ReferencedSOPInstanceUID 
        assert.equal(tags.getFromName("ReferencedImageSequence")[0].x00081155.value[0], 
            "1.3.12.2.1107.5.2.32.35162.2012021515511672669154094", 
            "ReferencedImageSequence SQ");
        
        // finish async test
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

