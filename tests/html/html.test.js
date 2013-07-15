/**
 * Tests for the 'html/html.js' file.
 */
$(document).ready(function(){
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
        // test 00
        var root00 = "http://test.com?input=";
        var theo00 = ["result?key=val"];
        var res00 = dwv.html.getUriParam("input", root00+encodeURIComponent(theo00));
        equal(decodeURIComponent(res00), theo00, "http uri");
        // test 01
        var root01 = "file:///test.html?input=";
        var theo01 = ["result"];
        var res01 = dwv.html.getUriParam("input", root01+encodeURIComponent(theo01));
        equal(decodeURIComponent(res01), theo01, "file uri");
        // test 02
        var root02 = "file:///test.html?input=";
        var theo02 = ["result&a=0&a=1"];
        var full02 = root02+encodeURIComponent(theo02)+"&dwvRepeatKey=a";
        var res02 = dwv.html.getUriParam("input", full02);
        equal(decodeURIComponent(res02), theo02, "multiple file uri");
        
        // real world URI
        
        // wado
        var root10 = "http://ivmartel.github.io/dwv/demo/static/index.html?input=";
        var theo10 = ["http://dicom.vital-it.ch:8089/wado?requestType=WADO&contentType=application/dicom&studyUID=1.2.840.113564.3.1.2.20110912134402.100261&seriesUID=1.2.840.113564.1921680151.20110912125724093870&objectUID=1.2.840.113564.1921680151.20110912125724093880.2003000225000"];
        var res10 = dwv.html.getUriParam("input", root10+encodeURIComponent(theo10));
        equal(decodeURIComponent(res10), theo10, "wado url");
        // babymri
        var root11 = "file:///E:/Bibliotheques/devel/dwv/dwv/index.html?input=";
        var theo11 = ["http://x.babymri.org/?53320924&.dcm"];
        var res11 = dwv.html.getUriParam("input", root11+encodeURIComponent(theo11));
        equal(decodeURIComponent(res11), theo11, "babymri uri");
        // github
    });

});
