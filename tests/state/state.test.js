/**
 * Tests for the 'app/state.js' file.
 */
/** @module tests/state */
// Do not warn if these variables were not defined before.
/* global QUnit */
QUnit.module("state");

/**
 * Test a state file.
 * @param {String} version The state version.
 * @param {String} type The type of drawing.
 * @param {Object} assert The qunit assert.
 */
dwv.utils.test.TestState = function ( version, type, assert ) {
    var done = assert.async();

    var request = new XMLHttpRequest();
    var urlRoot = "https://raw.githubusercontent.com/ivmartel/dwv/442-less-canvas";
    var url = urlRoot + "/tests/state/v" + version + "/state-" + type;
    if ( type === "arrow" ) {
        url += "-yellow";
    }
    url += ".json";
    request.open('GET', url, true);
    request.onerror = function (event) {
        console.log(event);
    };
    request.onload = function (/*event*/) {
        // read state
        var state = new dwv.State();
        var jsonData = state.fromJSON( this.responseText );
        // check drawings values
        dwv.utils.test.CheckDrawings(
            jsonData.drawings, jsonData.drawingsDetails, type, assert );
        // delete drawing to allow simple equal check
        delete jsonData.drawings;
        delete jsonData.drawingsDetails;
        // check values expect drawings
        dwv.utils.test.CheckStateHeader( jsonData, version, assert );
        // finish async test
        done();
    };
    // send request
    request.send(null);
};

/**
 * Check state header.
 * @param {Object} jsonData The input data to ckeck.
 * @param {String} version The state version.
 * @param {Object} assert The qunit assert.
 */
dwv.utils.test.CheckStateHeader = function (jsonData, version, assert) {
    // header data
    var headerData = {
        "version": version,
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
dwv.utils.test.CheckDrawings = function (drawings, details, type, assert) {
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

    // shape specific checks
    if ( type === "arrow" ) {
        dwv.utils.test.CheckArrowDrawing( posGroupKid, details, assert );
    }
};

/**
 * Check a line drawing.
 * @param {Object} posGroupKid The position group (only) kid.
 * @param {Object} details The drawing details
 * @param {Object} assert The qunit assert.
 */
dwv.utils.test.CheckArrowDrawing = function (posGroupKid, details, assert) {
    // check group name
    assert.equal( posGroupKid.attrs.name, "line-group", "Shape group is a line group.");
    assert.ok( posGroupKid.attrs.draggable,  "Shape group must be draggable.");
    assert.equal( posGroupKid.children.length, 3, "Shape group has 3 kids.");
    assert.equal( posGroupKid.attrs.id, "pf8zteo5r4", "Position group first level has the proper id.");
    assert.notEqual( typeof details.pf8zteo5r4, "undefined", "Details should contain data for id.");

    // real shape
    var shapeGroupKid0 = posGroupKid.children[0];
    assert.equal( shapeGroupKid0.className, "Line", "Shape group first level is a line.");
    assert.equal( shapeGroupKid0.attrs.name, "shape", "Shape group first level is a shape.");
    assert.notOk( shapeGroupKid0.attrs.draggable,  "Shape group first level must not be draggable.");
    assert.deepEqual( shapeGroupKid0.attrs.points, [53, 136, 139, 89], "Line has the proper points.");
    assert.equal( shapeGroupKid0.attrs.stroke, "#ffff80", "Line has the proper colour.");
    // shape extra
    var shapeGroupKid1 = posGroupKid.children[1];
    assert.equal( shapeGroupKid1.className, "RegularPolygon", "Shape group second level is a polygon.");
    assert.notOk( shapeGroupKid1.attrs.draggable,  "Shape group second level must not be draggable.");
    // label
    var shapeGroupKid2 = posGroupKid.children[2];
    assert.equal( shapeGroupKid2.className, "Label", "Shape group third level is a label.");
    assert.notOk( shapeGroupKid2.attrs.draggable,  "Shape group third level must not be draggable.");
    assert.equal( shapeGroupKid2.children.length, 2, "Label has 2 kids.");
    var labelGroupKid0 = shapeGroupKid2.children[0];
    assert.equal( labelGroupKid0.className, "Text", "Label group first level is a text.");
    assert.equal( labelGroupKid0.attrs.text, "Eye", "Text has the proper value.");
    var labelGroupKid1 = shapeGroupKid2.children[1];
    assert.equal( labelGroupKid1.className, "Tag", "Label group second level is a tag.");

    // details
    var details0 = details.pf8zteo5r4;
    assert.equal( details0.textExpr, "Eye", "Details textExpr has the proper value.");
    assert.equal( details0.longText, "", "Details longText has the proper value.");
};

/**
 * Tests for {@link dwv.State} v0.2 containing an arrow.
 * @function module:tests/state
 */
QUnit.test("Test read v0.2 state: arrow.", function (assert) {
    dwv.utils.test.TestState( "0.2", "arrow", assert );
});

/**
 * Tests for {@link dwv.State} v0.3 containing an arrow.
 * @function module:tests/state
 */
QUnit.test("Test read v0.3 state: arrow.", function (assert) {
    dwv.utils.test.TestState( "0.3", "arrow", assert );
});
