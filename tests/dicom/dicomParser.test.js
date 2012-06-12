/**
 * Tests for the 'dicom/dicomParser.js' file.
 */
$(document).ready(function(){
    test("Test DICOM parsing.", function() {
        // timing
        var startTime = new Date().getTime();

        // parse the DICOM file
        var myreader = new FileReader();
        myreader.onload = ( function() {
            return function(e) {
                var reader = new dwv.dicom.DicomInputStreamReader();    
                reader.readDicom(e.target.result);
                var dicomBuffer = reader.getInputBuffer();
                var dicomReader = reader.getReader();
                var dicomParser = new dwv.dicom.DicomParser(dicomBuffer,dicomReader);
                dicomParser.parseAll();
            };
        }()
        );
        /*var file = new File("cta.dcm");
        myreader.readAsBinaryString(file);*/
        
        // check timing
        var endTime = new Date().getTime();
        var time = endTime - startTime;
        ok( time < 10000, "Parsing took too long.");
    });

});
