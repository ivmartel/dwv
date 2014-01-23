/**
 * Tests for the 'html/html.js' file.
 */
module("html");

test("Test array to html function.", function() {
    // 1D array
    var array0 = [0, 1, 2, 3];
    var table0 = dwv.html.toTable(array0);
    var table0_ref = "<table><tbody><tr><td>0</td><td>1</td><td>2</td><td>3</td></tr></tbody></table>";
    equal(table0.outerHTML, table0_ref, "1D array");
   
    // 2D array
    var arrayIn0 = [0, 1];
    var arrayIn1 = [2, 3];
    var array1 = [arrayIn0, arrayIn1];
    var table1 = dwv.html.toTable(array1);
    var table1_ref = "<table><tbody><tr><td>0</td><td>1</td></tr><tr><td>2</td><td>3</td></tr></tbody></table>";
    equal(table1.outerHTML, table1_ref, "2D array");
   
    // array of objects
    var array2 = [{"a":0, "b":1}, {"a":2, "b":3}];
    var table2 = dwv.html.toTable(array2);
    var table2_ref = "<table><thead><tr><th data-priority=\"1\">A</th><th data-priority=\"1\">B</th></tr></thead><tbody><tr><td>0</td><td>1</td></tr><tr><td>2</td><td>3</td></tr></tbody></table>";
    equal(table2.outerHTML, table2_ref, "Array of objects");
    
    // object
    // not testing with null values since they are treated differently in browsers
    var obj = {};
    obj.first = {"a":0, "b":1};
    obj.second = {"a":"hello", "b":undefined};
    var table3 = dwv.html.toTable(obj);
    var table3_ref = "<table><thead><tr><th>Name</th><th data-priority=\"1\">A</th><th data-priority=\"1\">B</th></tr></thead><tbody><tr><td>first</td><td>0</td><td>1</td></tr><tr><td>second</td><td>hello</td><td>undefined</td></tr></tbody></table>";
    equal(table3.outerHTML, table3_ref, "Object");
});

test("Test get URI param.", function() {
    // simple test URI
    
    // test 00
    var root00 = "http://test.com?input=";
    var uri00 = "result";
    var full00 = root00 + encodeURIComponent(uri00);
    var res00 = dwv.html.getUriParam(full00);
    var theo00 = [uri00];
    equal(res00.toString(), theo00.toString(), "Http uri");
    // test 01
    var root01 = "file:///test.html?input=";
    var uri01 = "result";
    var full01 = root01 + encodeURIComponent(uri01);
    var res01 = dwv.html.getUriParam(full01);
    var theo01 = [uri01];
    equal(res01.toString(), theo01.toString(), "File uri");
    // test 02
    var root02 = "file:///test.html?input=";
    var uri02 = "result?a=0&b=1";
    var full02 = root02 + encodeURIComponent(uri02);
    var res02 = dwv.html.getUriParam(full02);
    var theo02 = [uri02];
    equal(res02.toString(), theo02.toString(), "File uri with args");

    // test 03
    var root03 = "file:///test.html?";
    var uri03 = "result?a=0";
    var full03 = root03 + encodeURIComponent(uri03);
    var caughtError = false;
    try {
        dwv.html.getUriParam(full03);
    }
    catch(error){ 
        caughtError = true;
    }
    ok(caughtError, "Throws error when no input.");

    // real world URI
    
    // wado (called 'anonymised')
    var root10 = "http://ivmartel.github.io/dwv/demo/static/index.html?input=";
    var uri10 = "http://dicom.vital-it.ch:8089/wado?requestType=WADO&contentType=application/dicom&studyUID=1.3.6.1.4.1.19291.2.1.1.2675258517533100002&seriesUID=1.2.392.200036.9116.2.6.1.48.1215564802.1245749034.88493&objectUID=1.2.392.200036.9116.2.6.1.48.1215564802.1245749034.96207";
    var full10 = root10 + encodeURIComponent(uri10);
    var res10 = dwv.html.getUriParam(full10);
    var theo10 = [uri10];
    equal(res10.toString(), theo10.toString(), "Wado url");
    
    // babymri
    var root11 = "http://ivmartel.github.io/dwv/demo/static/index.html?input=";
    var uri11 = "http://x.babymri.org/?53320924&.dcm";
    var full11 = root11 + encodeURIComponent(uri11);
    var res11 = dwv.html.getUriParam(full11);
    var theo11 = [uri11];
    equal(res11.toString(), theo11.toString(), "Babymri uri");
    
    // github
    var root12 = "http://ivmartel.github.io/dwv/demo/static/index.html?input=";
    var uri12 = "https://github.com/ivmartel/dwv/blob/master/data/cta0.dcm?raw=true";
    var full12 = root12 + encodeURIComponent(uri12);
    var res12 = dwv.html.getUriParam(full12);
    var theo12 = [uri12];
    equal(res12.toString(), theo12.toString(), "Github uri");
    
    // multiple URI
    
    // simple test: one argument
    var root20 = "file:///test.html?input=";
    var uri20 = "result?a=0";
    var full20 = root20 + encodeURIComponent(uri20);
    var res20 = dwv.html.getUriParam(full20);
    var theo20 = ["result?a=0"];
    equal(res20.toString(), theo20.toString(), "Multiple File uri with one arg");
    
    // simple test: two arguments
    var root21 = "file:///test.html?input=";
    var uri21 = "result?a=0&a=1";
    var full21 = root21 + encodeURIComponent(uri21);
    var res21 = dwv.html.getUriParam(full21);
    var theo21 = ["result?a=0", "result?a=1"];
    equal(res21.toString(), theo21.toString(), "Multiple File uri with two args");

    // simple test: three arguments
    var root22 = "file:///test.html?input=";
    var uri22 = "result?a=0&a=1&a=2";
    var full22 = root22 + encodeURIComponent(uri22);
    var res22 = dwv.html.getUriParam(full22);
    var theo22 = ["result?a=0", "result?a=1", "result?a=2"];
    equal(res22.toString(), theo22.toString(), "Multiple File uri with three args");
    
    // simple test: plenty arguments
    var root23 = "file:///test.html?input=";
    var uri23 = "result?a=0&a=1&a=2&b=3&c=4";
    var full23 = root23 + encodeURIComponent(uri23);
    var res23 = dwv.html.getUriParam(full23);
    var theo23 = ["result?b=3&c=4&a=0", "result?b=3&c=4&a=1", "result?b=3&c=4&a=2"];
    equal(res23.toString(), theo23.toString(), "Multiple File uri with plenty args");

    // real world multiple URI

    // wado (called 'anonymised')
    var root30 = "http://ivmartel.github.io/dwv/demo/static/index.html?input=";
    var uri30 = "http://dicom.vital-it.ch:8089/wado?requestType=WADO&contentType=application/dicom&studyUID=1.3.6.1.4.1.19291.2.1.1.2675258517533100002&seriesUID=1.2.392.200036.9116.2.6.1.48.1215564802.1245749034.88493&objectUID=1.2.392.200036.9116.2.6.1.48.1215564802.1245749034.96207&objectUID=1.2.392.200036.9116.2.6.1.48.1215564802.1245749216.165708";
    var full30 = root30 + encodeURIComponent(uri30);
    var res30 = dwv.html.getUriParam(full30);
    var theo30 = ["http://dicom.vital-it.ch:8089/wado?requestType=WADO&contentType=application/dicom&studyUID=1.3.6.1.4.1.19291.2.1.1.2675258517533100002&seriesUID=1.2.392.200036.9116.2.6.1.48.1215564802.1245749034.88493&objectUID=1.2.392.200036.9116.2.6.1.48.1215564802.1245749034.96207", 
                  "http://dicom.vital-it.ch:8089/wado?requestType=WADO&contentType=application/dicom&studyUID=1.3.6.1.4.1.19291.2.1.1.2675258517533100002&seriesUID=1.2.392.200036.9116.2.6.1.48.1215564802.1245749034.88493&objectUID=1.2.392.200036.9116.2.6.1.48.1215564802.1245749216.165708"];
    equal(res30.toString(), theo30.toString(), "Multiple Wado url");
    
    // babymri: test for replaceMode
    var root31 = "http://ivmartel.github.io/dwv/demo/static/index.html?input=";
    var uri31 = "http://x.babymri.org/?key=53320924&key=53320925&key=53320926";
    var full31 = root31 + encodeURIComponent(uri31) + "&dwvReplaceMode=void";
    var res31 = dwv.html.getUriParam(full31);
    var theo31 = ["http://x.babymri.org/?53320924", "http://x.babymri.org/?53320925", "http://x.babymri.org/?53320926"];
    equal(res31.toString(), theo31.toString(), "Multiple baby mri (replaceMode)");
    
    // github: not supported
    
    // simple links (no query)
    
    // simple test: plenty arguments
    var root40 = "file:///test.html?input=";
    var uri40 = "web/path/to/file/?a=0.dcm&a=1.dcm&a=2.dcm";
    var full40 = root40 + encodeURIComponent(uri40) + "&dwvReplaceMode=void";
    var res40 = dwv.html.getUriParam(full40);
    var theo40 = ["web/path/to/file/0.dcm", "web/path/to/file/1.dcm", "web/path/to/file/2.dcm"];
    equal(res40.toString(), theo40.toString(), "Multiple file-like uri");

});
