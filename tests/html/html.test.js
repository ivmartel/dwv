/**
 * Tests for the 'html/html.js' file.
 */
$(document).ready(function(){
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
        var table2_ref = "<table><thead><tr><td>A</td><td>B</td></tr></thead><tbody><tr><td>0</td><td>1</td></tr><tr><td>2</td><td>3</td></tr></tbody></table>";
        equal(table2.outerHTML, table2_ref, "Array of objects");
        
        // object
        // not testing with null values since they are treated differently in browsers
        var obj = {};
        obj.first = {"a":0, "b":1};
        obj.second = {"a":"hello", "b":undefined};
        var table3 = dwv.html.toTable(obj);
        var table3_ref = "<table><thead><tr><td></td><td>A</td><td>B</td></tr></thead><tbody><tr><td>first</td><td>0</td><td>1</td></tr><tr><td>second</td><td>hello</td><td>undefined</td></tr></tbody></table>";
        equal(table3.outerHTML, table3_ref, "Object");
    });

});
