/**
 * Tests for the 'app/state.js' file.
 */
/** @module tests/state */
// Do not warn if these variables were not defined before.
/* global QUnit */
QUnit.module("state");

/**
 * Test a state file.
 * @param {String} version The state format version.
 * @param {String} type The type of drawing.
 * @param {Object} assert The qunit assert.
 */
dwv.utils.test.TestState = function ( version, type, assert ) {
    var done = assert.async();

    var request = new XMLHttpRequest();
    var urlRoot = "https://raw.githubusercontent.com/ivmartel/dwv/442-less-canvas";
    var url = urlRoot + "/tests/state/v" + version + "/state-" + type + ".json";
    request.open('GET', url, true);
    request.onerror = function (event) {
        console.log(event);
    };
    request.onload = function (/*event*/) {
        // status 200: "OK"; status 0: "debug"
        if ( this.status !== 200 && this.status !== 0 ) {
            assert.ok( false, "Error while loading test data." );
            done();
            return;
        }
        // read state
        var state = new dwv.State();
        var jsonData = state.fromJSON( this.responseText );
        // check drawings values
        dwv.utils.test.CheckDrawings(
            jsonData.drawings, jsonData.drawingsDetails, version, type, assert );
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
 * @param {Object} jsonData The input data to check.
 * @param {String} version The state format version.
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
 * @param {Object} drawings The drawing object to check
 * @param {Object} details The drawing details
 * @param {String} version The state format version.
 * @param {String} type The type of drawing.
 * @param {Object} assert The qunit assert.
 */
dwv.utils.test.CheckDrawings = function (drawings, details, version, type, assert) {
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
        dwv.utils.test.CheckArrowDrawing( posGroupKid, details, version, assert );
    } else if ( type === "ruler" ) {
        dwv.utils.test.CheckRulerDrawing( posGroupKid, details, version, assert );
    } else if ( type === "roi" ) {
        dwv.utils.test.CheckRoiDrawing( posGroupKid, details, version, assert );
    } else if ( type === "hand" ) {
        dwv.utils.test.CheckHandDrawing( posGroupKid, details, version, assert );
    } else if ( type === "ellipse" ) {
        dwv.utils.test.CheckEllipseDrawing( posGroupKid, details, version, assert );
    } else if ( type === "protractor" ) {
        dwv.utils.test.CheckProtractorDrawing( posGroupKid, details, version, assert );
    } else if ( type === "rectangle" ) {
        dwv.utils.test.CheckRectangleDrawing( posGroupKid, details, version, assert );
    }
};

/**
 * Check an arrow drawing.
 * @param {Object} posGroupKid The position group (only) kid.
 * @param {Object} details The drawing details
 * @param {String} version The state format version.
 * @param {Object} assert The qunit assert.
 */
dwv.utils.test.CheckArrowDrawing = function (posGroupKid, details, version, assert) {
    // check group name
    assert.equal( posGroupKid.attrs.name, "line-group", "Shape group is a line group.");
    assert.ok( posGroupKid.attrs.draggable, "Shape group must be draggable.");
    assert.equal( posGroupKid.children.length, 3, "Shape group has 3 kids.");
    assert.equal( posGroupKid.attrs.id, "pf8zteo5r4", "Position group first level has the proper id.");
    assert.notEqual( typeof details.pf8zteo5r4, "undefined", "Details should contain data for id.");

    // real shape
    var shapeGroupKid0 = posGroupKid.children[0];
    assert.equal( shapeGroupKid0.className, "Line", "Shape group first level is a line.");
    assert.equal( shapeGroupKid0.attrs.name, "shape", "Shape group first level is a shape.");
    assert.notOk( shapeGroupKid0.attrs.draggable, "Shape group first level must not be draggable.");
    assert.deepEqual( shapeGroupKid0.attrs.points, [53, 136, 139, 89], "Line has the proper points.");
    assert.equal( shapeGroupKid0.attrs.stroke, "#ffff80", "Line has the proper colour.");
    // shape extra
    var shapeGroupKid1 = posGroupKid.children[1];
    assert.equal( shapeGroupKid1.className, "RegularPolygon", "Shape group second level is a polygon.");
    assert.notOk( shapeGroupKid1.attrs.draggable, "Shape group second level must not be draggable.");
    // label
    var shapeGroupKid2 = posGroupKid.children[2];
    assert.equal( shapeGroupKid2.className, "Label", "Shape group third level is a label.");
    assert.notOk( shapeGroupKid2.attrs.draggable, "Shape group third level must not be draggable.");
    assert.equal( shapeGroupKid2.children.length, 2, "Label has 2 kids.");
    var labelGroupKid0 = shapeGroupKid2.children[0];
    assert.equal( labelGroupKid0.className, "Text", "Label group first level is a text.");
    assert.equal( labelGroupKid0.attrs.text, "Eye", "Text has the proper value.");
    var labelGroupKid1 = shapeGroupKid2.children[1];
    assert.equal( labelGroupKid1.className, "Tag", "Label group second level is a tag.");

    // details
    var details0 = details.pf8zteo5r4;
    assert.equal( details0.textExpr, "Eye", "Details textExpr has the proper value.");
    assert.equal( details0.longText, "This is an eye!", "Details longText has the proper value.");
};

/**
 * Check a ruler drawing.
 * @param {Object} posGroupKid The position group (only) kid.
 * @param {Object} details The drawing details
 * @param {String} version The state format version.
 * @param {Object} assert The qunit assert.
 */
dwv.utils.test.CheckRulerDrawing = function (posGroupKid, details, version, assert) {
    // check group name
    assert.equal( posGroupKid.attrs.name, "ruler-group", "Shape group is a ruler group.");
    assert.ok( posGroupKid.attrs.draggable, "Shape group must be draggable.");
    assert.equal( posGroupKid.children.length, 4, "Shape group has 4 kids.");
    assert.equal( posGroupKid.attrs.id, "4gvkz8v6wzw", "Position group first level has the proper id.");
    assert.notEqual( typeof details["4gvkz8v6wzw"], "undefined", "Details should contain data for id.");

    // real shape
    var shapeGroupKid0 = posGroupKid.children[0];
    assert.equal( shapeGroupKid0.className, "Line", "Shape group first level is a line.");
    assert.equal( shapeGroupKid0.attrs.name, "shape", "Shape group first level is a shape.");
    assert.notOk( shapeGroupKid0.attrs.draggable, "Shape group first level must not be draggable.");
    assert.deepEqual( shapeGroupKid0.attrs.points, [51,135,216,134], "Line has the proper points.");
    assert.equal( shapeGroupKid0.attrs.stroke, "#ffff80", "Line has the proper colour.");
    // shape extra
    var shapeGroupKid1 = posGroupKid.children[1];
    assert.equal( shapeGroupKid1.className, "Line", "Shape group second level is a polygon.");
    assert.notOk( shapeGroupKid1.attrs.draggable, "Shape group second level must not be draggable.");
    // shape extra
    var shapeGroupKid2 = posGroupKid.children[2];
    assert.equal( shapeGroupKid2.className, "Line", "Shape group third level is a polygon.");
    assert.notOk( shapeGroupKid2.attrs.draggable, "Shape group third level must not be draggable.");
    // label
    var shapeGroupKid3 = posGroupKid.children[3];
    assert.equal( shapeGroupKid3.className, "Label", "Shape group fourth level is a label.");
    assert.notOk( shapeGroupKid3.attrs.draggable, "Shape group fourth level must not be draggable.");
    assert.equal( shapeGroupKid3.children.length, 2, "Label has 2 kids.");
    var labelGroupKid0 = shapeGroupKid3.children[0];
    assert.equal( labelGroupKid0.className, "Text", "Label group first level is a text.");
    assert.equal( labelGroupKid0.attrs.text, "165.0mm", "Text has the proper value.");
    var labelGroupKid1 = shapeGroupKid3.children[1];
    assert.equal( labelGroupKid1.className, "Tag", "Label group second level is a tag.");

    // details
    var details0 = details["4gvkz8v6wzw"];
    assert.equal( details0.textExpr, "{length}", "Details textExpr has the proper value.");
    assert.equal( details0.longText, "What a ruler!", "Details longText has the proper value.");
};

/**
 * Check a roi drawing.
 * @param {Object} posGroupKid The position group (only) kid.
 * @param {Object} details The drawing details
 * @param {String} version The state format version.
 * @param {Object} assert The qunit assert.
 */
dwv.utils.test.CheckRoiDrawing = function (posGroupKid, details, version, assert) {
    // check group name
    assert.equal( posGroupKid.attrs.name, "roi-group", "Shape group is a roi group.");
    assert.ok( posGroupKid.attrs.draggable, "Shape group must be draggable.");
    assert.equal( posGroupKid.children.length, 2, "Shape group has 2 kids.");
    assert.equal( posGroupKid.attrs.id, "4l24ofouhmf", "Position group first level has the proper id.");
    assert.notEqual( typeof details["4l24ofouhmf"], "undefined", "Details should contain data for id.");

    // real shape
    var shapeGroupKid0 = posGroupKid.children[0];
    assert.equal( shapeGroupKid0.className, "Line", "Shape group first level is a line.");
    assert.equal( shapeGroupKid0.attrs.name, "shape", "Shape group first level is a shape.");
    assert.notOk( shapeGroupKid0.attrs.draggable, "Shape group first level must not be draggable.");
    assert.deepEqual( shapeGroupKid0.attrs.points, [126, 40, 58, 80, 60, 116, 92, 128, 93, 143, 93, 151, 94, 151, 114, 150, 128, 150, 214, 135, 183, 56, 182, 56, 182, 56], "Line has the proper points.");
    var colour = ( version === "0.1" ? "#ffff00" : "#ffff80" );
    assert.equal( shapeGroupKid0.attrs.stroke, colour, "Line has the proper colour.");
    // label
    var shapeGroupKid1 = posGroupKid.children[1];
    assert.equal( shapeGroupKid1.className, "Label", "Shape group third level is a label.");
    assert.notOk( shapeGroupKid1.attrs.draggable, "Shape group third level must not be draggable.");
    assert.equal( shapeGroupKid1.children.length, 2, "Label has 2 kids.");
    var labelGroupKid0 = shapeGroupKid1.children[0];
    assert.equal( labelGroupKid0.className, "Text", "Label group first level is a text.");
    if ( version !== "0.1" ) {
        assert.equal( labelGroupKid0.attrs.text, "Brain", "Text has the proper value.");
    }
    var labelGroupKid1 = shapeGroupKid1.children[1];
    assert.equal( labelGroupKid1.className, "Tag", "Label group second level is a tag.");

    // details
    if ( version !== "0.1" ) {
        var details0 = details["4l24ofouhmf"];
        assert.equal( details0.textExpr, "Brain", "Details textExpr has the proper value.");
        assert.equal( details0.longText, "This is a squary brain!", "Details longText has the proper value.");
    }
};

/**
 * Check a hand drawing.
 * @param {Object} posGroupKid The position group (only) kid.
 * @param {Object} details The drawing details
 * @param {String} version The state format version.
 * @param {Object} assert The qunit assert.
 */
dwv.utils.test.CheckHandDrawing = function (posGroupKid, details, version, assert) {
    // check group name
    assert.equal( posGroupKid.attrs.name, "freeHand-group", "Shape group is a freeHand group.");
    assert.ok( posGroupKid.attrs.draggable, "Shape group must be draggable.");
    assert.equal( posGroupKid.children.length, 2, "Shape group has 2 kids.");
    assert.equal( posGroupKid.attrs.id, "08m011yjp8je", "Position group first level has the proper id.");
    assert.notEqual( typeof details["08m011yjp8je"], "undefined", "Details should contain data for id.");

    // real shape
    var shapeGroupKid0 = posGroupKid.children[0];
    assert.equal( shapeGroupKid0.className, "Line", "Shape group first level is a line.");
    assert.equal( shapeGroupKid0.attrs.name, "shape", "Shape group first level is a shape.");
    assert.notOk( shapeGroupKid0.attrs.draggable, "Shape group first level must not be draggable.");
    assert.deepEqual( shapeGroupKid0.attrs.points, [93,50,92,50,71,58,71,59,68,63,68,64,54,80,54,81,53,83,52,85,51,87,50,92,47,98,47,100,55,117,56,118,86,122,89,126,90,128,90,129,88,131,87,133,86,134,85,138,85,139,85,141,87,143,87,144,87,145,88,147,92,150,97,152,112,154,113,153,136,143,174,136,178,135,191,136,192,136,194,138,196,139,197,141,199,141,200,141,207,140,208,139,211,136,213,134,213,133,213,129,213,126,213,122,210,90,209,87,206,80,205,79,204,78,201,73,199,71,197,70,187,63,184,61,182,59,180,58,174,54,172,52,170,51,168,50,167,49,155,42,154,42,151,42,136,40,134,40,133,40,128,41,126,41,124,41,117,44,116,44,114,44,107,47,102,49,100,49,97,49,93,50,92,50,92,50], "Line has the proper points.");
    assert.equal( shapeGroupKid0.attrs.stroke, "#ffff80", "Line has the proper colour.");
    // label
    var shapeGroupKid1 = posGroupKid.children[1];
    assert.equal( shapeGroupKid1.className, "Label", "Shape group third level is a label.");
    assert.notOk( shapeGroupKid1.attrs.draggable, "Shape group third level must not be draggable.");
    assert.equal( shapeGroupKid1.children.length, 2, "Label has 2 kids.");
    var labelGroupKid0 = shapeGroupKid1.children[0];
    assert.equal( labelGroupKid0.className, "Text", "Label group first level is a text.");
    assert.equal( labelGroupKid0.attrs.text, "Brain", "Text has the proper value.");
    var labelGroupKid1 = shapeGroupKid1.children[1];
    assert.equal( labelGroupKid1.className, "Tag", "Label group second level is a tag.");

    // details
    var details0 = details["08m011yjp8je"];
    assert.equal( details0.textExpr, "Brain", "Details textExpr has the proper value.");
    assert.equal( details0.longText, "This is a roundy brain!", "Details longText has the proper value.");
};

/**
 * Check an ellipse drawing.
 * @param {Object} posGroupKid The position group (only) kid.
 * @param {Object} details The drawing details
 * @param {String} version The state format version.
 * @param {Object} assert The qunit assert.
 */
dwv.utils.test.CheckEllipseDrawing = function (posGroupKid, details, version, assert) {
    // check group name
    assert.equal( posGroupKid.attrs.name, "ellipse-group", "Shape group is an ellipse group.");
    assert.ok( posGroupKid.attrs.draggable, "Shape group must be draggable.");
    assert.equal( posGroupKid.children.length, 2, "Shape group has 2 kids.");
    assert.equal( posGroupKid.attrs.id, "c6j16qt6vt6", "Position group first level has the proper id.");
    assert.notEqual( typeof details.c6j16qt6vt6, "undefined", "Details should contain data for id.");

    // real shape
    var shapeGroupKid0 = posGroupKid.children[0];
    assert.equal( shapeGroupKid0.className, "Ellipse", "Shape group first level is an ellipse.");
    assert.equal( shapeGroupKid0.attrs.name, "shape", "Shape group first level is a shape.");
    assert.notOk( shapeGroupKid0.attrs.draggable, "Shape group first level must not be draggable.");
    assert.deepEqual( shapeGroupKid0.attrs.x, 90, "Ellipse has the proper x.");
    assert.deepEqual( shapeGroupKid0.attrs.y, 78, "Ellipse has the proper y.");
    assert.deepEqual( shapeGroupKid0.attrs.radiusX, 53, "Ellipse has the proper radiusX.");
    assert.deepEqual( shapeGroupKid0.attrs.radiusY, 32, "Ellipse has the proper radiusY.");
    var colour = ( version === "0.1" ? "#ffff00" : "#ffff80" );
    assert.equal( shapeGroupKid0.attrs.stroke, colour, "Ellipse has the proper colour.");
    // label
    var shapeGroupKid1 = posGroupKid.children[1];
    assert.equal( shapeGroupKid1.className, "Label", "Shape group third level is a label.");
    assert.notOk( shapeGroupKid1.attrs.draggable, "Shape group third level must not be draggable.");
    assert.equal( shapeGroupKid1.children.length, 2, "Label has 2 kids.");
    var labelGroupKid0 = shapeGroupKid1.children[0];
    assert.equal( labelGroupKid0.className, "Text", "Label group first level is a text.");
    assert.equal( labelGroupKid0.attrs.text, "53.28cm2", "Text has the proper value.");
    var labelGroupKid1 = shapeGroupKid1.children[1];
    assert.equal( labelGroupKid1.className, "Tag", "Label group second level is a tag.");

    // details
    if ( version !== "0.1" ) {
        var details0 = details.c6j16qt6vt6;
        assert.equal( details0.textExpr, "{surface}", "Details textExpr has the proper value.");
        assert.equal( details0.longText, "What a surface!", "Details longText has the proper value.");
    }
};

/**
 * Check a protractor drawing.
 * @param {Object} posGroupKid The position group (only) kid.
 * @param {Object} details The drawing details
 * @param {String} version The state format version.
 * @param {Object} assert The qunit assert.
 */
dwv.utils.test.CheckProtractorDrawing = function (posGroupKid, details, version, assert) {
    // check group name
    assert.equal( posGroupKid.attrs.name, "protractor-group", "Shape group is an protractor group.");
    assert.ok( posGroupKid.attrs.draggable, "Shape group must be draggable.");
    assert.equal( posGroupKid.children.length, 3, "Shape group has 3 kids.");
    assert.equal( posGroupKid.attrs.id, "49g7kqi3p4u", "Position group first level has the proper id.");
    assert.notEqual( typeof details["49g7kqi3p4u"], "undefined", "Details should contain data for id.");

    // real shape
    var shapeGroupKid0 = posGroupKid.children[0];
    assert.equal( shapeGroupKid0.className, "Line", "Shape group first level is a line.");
    assert.equal( shapeGroupKid0.attrs.name, "shape", "Shape group first level is a shape.");
    assert.notOk( shapeGroupKid0.attrs.draggable, "Shape group first level must not be draggable.");
    assert.deepEqual( shapeGroupKid0.attrs.points, [33,164,81,145,93,198], "Line has the proper points.");
    var colour = ( version === "0.1" ? "#ffff00" : "#ffff80" );
    assert.equal( shapeGroupKid0.attrs.stroke, colour, "Line has the proper colour.");
    // label
    var shapeGroupKid1 = posGroupKid.children[1];
    assert.equal( shapeGroupKid1.className, "Label", "Shape group third level is a label.");
    assert.notOk( shapeGroupKid1.attrs.draggable, "Shape group third level must not be draggable.");
    assert.equal( shapeGroupKid1.children.length, 2, "Label has 2 kids.");
    var labelGroupKid0 = shapeGroupKid1.children[0];
    assert.equal( labelGroupKid0.className, "Text", "Label group first level is a text.");
    assert.equal( labelGroupKid0.attrs.text, "80.15°", "Text has the proper value.");
    var labelGroupKid1 = shapeGroupKid1.children[1];
    assert.equal( labelGroupKid1.className, "Tag", "Label group second level is a tag.");
    // shape extra
    var shapeGroupKid2 = posGroupKid.children[2];
    assert.equal( shapeGroupKid2.className, "Arc", "Shape group second level is a polygon.");
    assert.notOk( shapeGroupKid2.attrs.draggable, "Shape group second level must not be draggable.");

    // details
    if ( version !== "0.1" ) {
        var details0 = details["49g7kqi3p4u"];
        assert.equal( details0.textExpr, "{angle}", "Details textExpr has the proper value.");
        assert.equal( details0.longText, "What an angle!", "Details longText has the proper value.");
    }
};

/**
 * Check a rectangle drawing.
 * @param {Object} posGroupKid The position group (only) kid.
 * @param {Object} details The drawing details
 * @param {String} version The state format version.
 * @param {Object} assert The qunit assert.
 */
dwv.utils.test.CheckRectangleDrawing = function (posGroupKid, details, version, assert) {
    // check group name
    assert.equal( posGroupKid.attrs.name, "rectangle-group", "Shape group is a rectangle group.");
    assert.ok( posGroupKid.attrs.draggable, "Shape group must be draggable.");
    assert.equal( posGroupKid.children.length, 2, "Shape group has 2 kids.");
    assert.equal( posGroupKid.attrs.id, "db0puu209qe", "Position group first level has the proper id.");
    assert.notEqual( typeof details.db0puu209qe, "undefined", "Details should contain data for id.");

    // real shape
    var shapeGroupKid0 = posGroupKid.children[0];
    assert.equal( shapeGroupKid0.className, "Rect", "Shape group first level is a rectangle.");
    assert.equal( shapeGroupKid0.attrs.name, "shape", "Shape group first level is a shape.");
    assert.notOk( shapeGroupKid0.attrs.draggable, "Shape group first level must not be draggable.");
    assert.deepEqual( shapeGroupKid0.attrs.x, 80, "Rectangle has the proper x.");
    assert.deepEqual( shapeGroupKid0.attrs.y, 58, "Rectangle has the proper y.");
    assert.deepEqual( shapeGroupKid0.attrs.width, 104, "Rectangle has the proper width.");
    assert.deepEqual( shapeGroupKid0.attrs.height, 64, "Rectangle has the proper height.");
    var colour = ( version === "0.1" ? "#ffff00" : "#ffff80" );
    assert.equal( shapeGroupKid0.attrs.stroke, colour, "Rectangle has the proper colour.");
    // label
    var shapeGroupKid1 = posGroupKid.children[1];
    assert.equal( shapeGroupKid1.className, "Label", "Shape group third level is a label.");
    assert.notOk( shapeGroupKid1.attrs.draggable, "Shape group third level must not be draggable.");
    assert.equal( shapeGroupKid1.children.length, 2, "Label has 2 kids.");
    var labelGroupKid0 = shapeGroupKid1.children[0];
    assert.equal( labelGroupKid0.className, "Text", "Label group first level is a text.");
    assert.equal( labelGroupKid0.attrs.text, "66.56cm2", "Text has the proper value.");
    var labelGroupKid1 = shapeGroupKid1.children[1];
    assert.equal( labelGroupKid1.className, "Tag", "Label group second level is a tag.");

    // details
    if ( version !== "0.1" ) {
        var details0 = details.db0puu209qe;
        assert.equal( details0.textExpr, "{surface}", "Details textExpr has the proper value.");
        assert.equal( details0.longText, "What a rectangle!", "Details longText has the proper value.");
    }
};

/**
 * Tests for {@link dwv.State} v0.1 containing a line.
 * @function module:tests/state
 */
/*QUnit.test("Test read v0.1 state: line.", function (assert) {
    dwv.utils.test.TestState( "0.1", "line", assert );
});*/

/**
 * Tests for {@link dwv.State} v0.1 containing a roi.
 * @function module:tests/state
 */
QUnit.test("Test read v0.1 state: roi.", function (assert) {
    dwv.utils.test.TestState( "0.1", "roi", assert );
});

/**
 * Tests for {@link dwv.State} v0.1 containing an ellipse.
 * @function module:tests/state
 */
QUnit.test("Test read v0.1 state: ellipse.", function (assert) {
    dwv.utils.test.TestState( "0.1", "ellipse", assert );
});

/**
 * Tests for {@link dwv.State} v0.1 containing a protractor.
 * @function module:tests/state
 */
/*QUnit.test("Test read v0.1 state: protractor.", function (assert) {
    dwv.utils.test.TestState( "0.1", "protractor", assert );
});*/

/**
 * Tests for {@link dwv.State} v0.1 containing a rectangle.
 * @function module:tests/state
 */
QUnit.test("Test read v0.1 state: rectangle.", function (assert) {
    dwv.utils.test.TestState( "0.1", "rectangle", assert );
});

/**
 * Tests for {@link dwv.State} v0.2 containing an arrow.
 * @function module:tests/state
 */
QUnit.test("Test read v0.2 state: arrow.", function (assert) {
    dwv.utils.test.TestState( "0.2", "arrow", assert );
});

/**
 * Tests for {@link dwv.State} v0.2 containing a ruler.
 * @function module:tests/state
 */
QUnit.test("Test read v0.2 state: ruler.", function (assert) {
    dwv.utils.test.TestState( "0.2", "ruler", assert );
});

/**
 * Tests for {@link dwv.State} v0.2 containing a roi.
 * @function module:tests/state
 */
QUnit.test("Test read v0.2 state: roi.", function (assert) {
    dwv.utils.test.TestState( "0.2", "roi", assert );
});

/**
 * Tests for {@link dwv.State} v0.2 containing a hand draw.
 * @function module:tests/state
 */
QUnit.test("Test read v0.2 state: hand.", function (assert) {
    dwv.utils.test.TestState( "0.2", "hand", assert );
});

/**
 * Tests for {@link dwv.State} v0.2 containing an ellipse.
 * @function module:tests/state
 */
QUnit.test("Test read v0.2 state: ellipse.", function (assert) {
    dwv.utils.test.TestState( "0.2", "ellipse", assert );
});

/**
 * Tests for {@link dwv.State} v0.2 containing a protractor.
 * @function module:tests/state
 */
QUnit.test("Test read v0.2 state: protractor.", function (assert) {
    dwv.utils.test.TestState( "0.2", "protractor", assert );
});

/**
 * Tests for {@link dwv.State} v0.2 containing a rectangle.
 * @function module:tests/state
 */
QUnit.test("Test read v0.2 state: rectangle.", function (assert) {
    dwv.utils.test.TestState( "0.2", "rectangle", assert );
});

/**
 * Tests for {@link dwv.State} v0.3 containing an arrow.
 * @function module:tests/state
 */
QUnit.test("Test read v0.3 state: arrow.", function (assert) {
    dwv.utils.test.TestState( "0.3", "arrow", assert );
});

/**
 * Tests for {@link dwv.State} v0.3 containing a ruler.
 * @function module:tests/state
 */
QUnit.test("Test read v0.3 state: ruler.", function (assert) {
    dwv.utils.test.TestState( "0.3", "ruler", assert );
});

/**
 * Tests for {@link dwv.State} v0.3 containing a roi.
 * @function module:tests/state
 */
QUnit.test("Test read v0.3 state: roi.", function (assert) {
    dwv.utils.test.TestState( "0.3", "roi", assert );
});

/**
 * Tests for {@link dwv.State} v0.3 containing a hand draw.
 * @function module:tests/state
 */
QUnit.test("Test read v0.3 state: hand.", function (assert) {
    dwv.utils.test.TestState( "0.3", "hand", assert );
});

/**
 * Tests for {@link dwv.State} v0.3 containing an ellipse.
 * @function module:tests/state
 */
QUnit.test("Test read v0.3 state: ellipse.", function (assert) {
    dwv.utils.test.TestState( "0.3", "ellipse", assert );
});

/**
 * Tests for {@link dwv.State} v0.3 containing a protractor.
 * @function module:tests/state
 */
QUnit.test("Test read v0.3 state: protractor.", function (assert) {
    dwv.utils.test.TestState( "0.3", "protractor", assert );
});

/**
 * Tests for {@link dwv.State} v0.3 containing a rectangle.
 * @function module:tests/state
 */
QUnit.test("Test read v0.3 state: rectangle.", function (assert) {
    dwv.utils.test.TestState( "0.3", "rectangle", assert );
});
