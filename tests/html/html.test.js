$(document).ready(function(){
    test("Test array to html function.", function() {
        // 1D array
        var array0 = [0, 1, 2, 3];
        var table0 = arrayToTable(array0);
        var table0_ref = "<table><tbody><tr><td>0</td></tr><tr><td>1</td></tr><tr><td>2</td></tr><tr><td>3</td></tr></tbody></table>";
        equal(table0.outerHTML, table0_ref, "1D array");
       
        // 2D array
        var arrayIn0 = [0, 1];
        var arrayIn1 = [2, 3];
        var array1 = [arrayIn0, arrayIn1];
        var table1 = arrayToTable(array1);
        var table1_ref = "<table><tbody><tr><td>0</td><td>1</td></tr><tr><td>2</td><td>3</td></tr></tbody></table>";
        equal(table1.outerHTML, table1_ref, "2D array");
       
        // array of objects
        var array2 = [{a:0, b:1}, {a:2, b:3}];
        var table2 = arrayToTable(array2);
        var table2_ref = "<table><thead><tr><td>a</td><td>b</td></tr></thead><tbody><tr><td>0</td><td>1</td></tr><tr><td>2</td><td>3</td></tr></tbody></table>";
        equal(table2.outerHTML, table2_ref, "Array of objects");
    });

});
