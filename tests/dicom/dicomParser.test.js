/**
 * Tests for the 'dicom/dicomParser.js' file.
 */
// Do not warn if these variables were not defined before.
/* global module, asyncTest, equal, start */
module("dicomParser");

asyncTest("Test DICOM parsing.", 3, function() {
    // Local file: forbidden...
    // parse the DICOM file
    /*var reader = new FileReader();
    reader.onload = function(event) {
        // parse DICOM file
        var data = dwv.image.getDataFromDicomBuffer(event.target.result);
    };
    var file = new File("cta.dcm");
    reader.readAsArrayBuffer(file);*/
    
    var request = new XMLHttpRequest();
    var url = "http://x.babymri.org/?53320924&.dcm";
    request.open('GET', url, true);
    request.responseType = "arraybuffer"; 
    request.onload = function(/*event*/) {
        // parse DICOM
        var dicomParser = new dwv.dicom.DicomParser();
        dicomParser.parse(this.response);
        var tags = dicomParser.getDicomElements();
        // check values
        equal(tags.Rows.value[0], 256, "Number of rows");
        equal(tags.Columns.value[0], 256, "Number of columns");
        equal(tags.ReferencedImageSequence.value[0].ReferencedSOPInstanceUID.value[0], 
            "1.3.12.2.1107.5.2.32.35162.2012021515511672669154094", 
            "ReferencedImageSequence SQ");
        // start async test
        start();
    };
    request.send(null);
});
