/**
 * Tests for the 'app/state.js' file.
 */
/** @module tests/state */
// Do not warn if these variables were not defined before.
/* global QUnit */
QUnit.module("state");

/**
 * Create a XMLHttpRequest to retrieve state test data.
 * @param {String} filePath The state file path from the repository root.
 * @return {Object} The XMLHttpRequest.
 */
dwv.utils.test.CreateStateTestRequest = function ( filePath ) {
    var request = new XMLHttpRequest();
    var urlRoot = "https://raw.githubusercontent.com/ivmartel/dwv/442-less-canvas";
    var url = urlRoot + filePath;
    request.open('GET', url, true);
    request.onerror = function (event) {
        console.log(event);
    };
    return request;
};

/**
 * Check state header.
 * @param {Object} jsonData The input data to ckeck
 * @param {Object} assert The qunit assert.
 */
dwv.utils.test.CheckStateHeader = function (jsonData, assert) {
    // header data
    var headerData = {
        "version": "0.3",
        "window-center": 441,
        "window-width": 911,
        "position": { "i": 0, "j": 0, "k": 0 },
        "scale": 1,
        "scaleCenter": { "x": 0, "y": 0 },
        "translation": { "x": 0,  "y": 0 }
    };
    assert.deepEqual( jsonData, headerData );
};

/**
 * Check drawings.
 * @param {Object} drawings The drawing object to ckeck
 * @param {Object} details The drawing details
 * @param {Object} assert The qunit assert.
 * @param {String} type The type of drawing.
 */
dwv.utils.test.CheckDrawings = function (drawings, details, assert, type) {
    // first level: layer
    assert.equal( drawings.className, "Layer", "State drawings is a layer.");
    assert.equal( drawings.children.length, 1, "State drawings has one kid.");
    // second level: position group
    var layerKid = drawings.children[0];
    assert.equal( layerKid.className, "Group", "Layer first level is a group.");
    assert.equal( layerKid.attrs.name, "position-group", "Layer first level is a position group.");
    assert.equal( layerKid.attrs.id, "slice-0_frame-0", "Position group has the proper id.");
    assert.equal( layerKid.children.length, 1, "Position group has one kid.");
    // third level: shape group
    var posGroupKid = layerKid.children[0];
    assert.equal( posGroupKid.className, "Group", "Position group first level is a group.");
    assert.equal( posGroupKid.attrs.id, "pf8zteo5r4", "Position group first level has the proper id.");
    assert.notEqual( typeof details.pf8zteo5r4, "undefined", "Details should contain data for id.");
    // shape specific checks
    if ( type === "line" ) {
        dwv.utils.test.CheckLineDrawing( posGroupKid, details.pf8zteo5r4, assert );
    }
};

/**
 * Check a line drawing.
 * @param {Object} posGroupKid The position group (only) kid.
 * @param {Object} details The drawing details
 * @param {Object} assert The qunit assert.
 */
dwv.utils.test.CheckLineDrawing = function (posGroupKid, details, assert) {
    // check group name
    assert.equal( posGroupKid.attrs.name, "line-group", "Shape group is a line group.");
    assert.equal( posGroupKid.children.length, 3, "Shape group has 3 kids.");
    // real shape
    var shapeGroupKid0 = posGroupKid.children[0];
    assert.equal( shapeGroupKid0.className, "Line", "Shape group first level is a line.");
    assert.equal( shapeGroupKid0.attrs.name, "shape", "Shape group first level is a shape.");
    assert.deepEqual( shapeGroupKid0.attrs.points, [53, 136, 139, 89], "Line has the proper points.");
    assert.equal( shapeGroupKid0.attrs.stroke, "#ffff80", "Line has the proper colour.");
    // shape extra
    var shapeGroupKid1 = posGroupKid.children[1];
    assert.equal( shapeGroupKid1.className, "RegularPolygon", "Shape group second level is a polygon.");
    // label
    var shapeGroupKid2 = posGroupKid.children[2];
    assert.equal( shapeGroupKid2.className, "Label", "Shape group third level is a label.");
    assert.equal( shapeGroupKid2.children.length, 2, "Label has 2 kids.");
    var labelGroupKid0 = shapeGroupKid2.children[0];
    assert.equal( labelGroupKid0.className, "Text", "Label group first level is a text.");
    assert.equal( labelGroupKid0.attrs.text, "Eye", "Text has the proper value.");
    var labelGroupKid1 = shapeGroupKid2.children[1];
    assert.equal( labelGroupKid1.className, "Tag", "Label group second level is a tag.");

    // details
    assert.equal( details.textExpr, "Eye", "Details textExpr has the proper value.");
    assert.equal( details.longText, "", "Details longText has the proper value.");
};

/**
 * Tests for {@link dwv.State}.
 * @function module:tests/state
 */
QUnit.test("Test read state.", function (assert) {
    var done = assert.async();
    // create request
    var request = dwv.utils.test.CreateStateTestRequest(
        "/tests/state/v0.3/state-arrow-yellow.json" );
    // add request onload
    request.onload = function (/*event*/) {
        // read state
        var state = new dwv.State();
        var jsonData = state.fromJSON( this.responseText );

        // check drawings values
        dwv.utils.test.CheckDrawings(
            jsonData.drawings, jsonData.drawingsDetails, assert, "line" );
        // delete drawing to allow simple equal check
        delete jsonData.drawings;
        delete jsonData.drawingsDetails;
        // check values expect drawings
        dwv.utils.test.CheckStateHeader( jsonData, assert );

        // finish async test
        done();
    };
    // send request
    request.send(null);
});
