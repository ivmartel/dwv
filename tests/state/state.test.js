// namespaces
var dwv = dwv || {};
/**
 * Just used for tests.
 *
 * @namespace
 */
dwv.test = dwv.test || {};

/**
 * Tests for the 'app/state.js' file.
 */
/** @module tests/state */
// Do not warn if these variables were not defined before.
/* global QUnit */
QUnit.module('state');

/**
 * Test a state file.
 *
 * @param {string} version The state format version.
 * @param {string} type The type of drawing.
 * @param {object} assert The qunit assert.
 */
dwv.test.testState = function (version, type, assert) {
  var done = assert.async();
  // test file request
  var request = new XMLHttpRequest();
  var url = '/tests/state/v' + version + '/state-' + type + '.json';
  request.open('GET', url, true);
  request.onerror = function (event) {
    console.log(event);
  };
  request.onload = function (/*event*/) {
    // status 200: "OK"; status 0: "debug"
    if (this.status !== 200 && this.status !== 0) {
      assert.ok(false, 'Error while loading test data.');
      done();
      return;
    }
    // read state
    var state = new dwv.io.State();
    var jsonData = state.fromJSON(this.responseText);
    // check drawings values
    dwv.test.checkDrawings(
      jsonData.drawings, jsonData.drawingsDetails, version, type, assert);
    // delete drawing to allow simple equal check
    delete jsonData.drawings;
    delete jsonData.drawingsDetails;
    // check values expect drawings
    dwv.test.checkStateHeader(jsonData, version, assert);
    // finish async test
    done();
  };
  // send request
  request.send(null);
};

/**
 * Check state header.
 *
 * @param {object} jsonData The input data to check.
 * @param {string} version The state format version.
 * @param {object} assert The qunit assert.
 */
dwv.test.checkStateHeader = function (jsonData, version, assert) {
  // header data
  var headerData = {
    version: version,
    'window-center': 441,
    'window-width': 911,
    position: [0, 0, 0]
  };
  if (parseFloat(version) <= 0.3) {
    headerData.scale = 1;
    headerData.scaleCenter = {x: 0, y: 0};
    headerData.translation = {x: 0, y: 0};
  } else {
    headerData.scale = {x: 1, y: 1};
    headerData.offset = {x: 0, y: 0};
  }
  assert.deepEqual(jsonData, headerData);
};

/**
 * Check drawings.
 *
 * @param {object} drawings The drawing object to check
 * @param {object} details The drawing details
 * @param {string} version The state format version.
 * @param {string} type The type of drawing.
 * @param {object} assert The qunit assert.
 */
dwv.test.checkDrawings = function (drawings, details, version, type, assert) {
  // first level: layer
  assert.equal(drawings.className, 'Layer', 'State drawings is a layer.');

  // second level: position groups
  if (drawings.children.length === 5 &&
        (type === 'ruler_multi-slice' || type === 'line_multi-slice')) {
    dwv.test.checkRulerDrawings(drawings.children, details, version, assert);
  } else if (drawings.children.length === 1) {

    var layerKid = drawings.children[0];
    assert.equal(layerKid.className, 'Group', 'Layer first level is a group.');
    assert.equal(
      layerKid.attrs.name,
      'position-group',
      'Layer first level is a position group.');
    assert.equal(
      layerKid.attrs.id,
      '#2-0',
      'Position group has the proper id.');

    // third level: shape group(s)
    var posGroupKid = layerKid.children[0];
    assert.equal(
      posGroupKid.className,
      'Group',
      'Position group first level is a group.');

    var unit = parseFloat(version) <= 0.3 ? 'mm' : ' mm';

    // shape specific checks
    if (type === 'arrow') {
      dwv.test.checkArrowDrawing(posGroupKid, details, version, assert);
    } else if (type === 'ruler' && version !== '0.1') {
      var refRuler = {
        id: '4gvkz8v6wzw',
        points: [51, 135, 216, 134],
        colour: '#ffff80',
        text: '165.0' + unit,
        textExpr: '{length}',
        longText: 'What a ruler!'
      };
      dwv.test.checkRulerDrawing(
        posGroupKid, details, version, refRuler, assert);
    } else if (type === 'line' && version === '0.1') {
      var refLine = {
        id: '4gvkz8v6wzw',
        points: [51, 135, 216, 134],
        colour: '#ffff00',
        text: '165.0' + unit,
        textExpr: '{length}',
        longText: ''
      };
      dwv.test.checkRulerDrawing(
        posGroupKid, details, version, refLine, assert);
    } else if (type === 'roi') {
      dwv.test.checkRoiDrawing(posGroupKid, details, version, assert);
    } else if (type === 'hand') {
      dwv.test.checkHandDrawing(posGroupKid, details, version, assert);
    } else if (type === 'ellipse') {
      dwv.test.checkEllipseDrawing(posGroupKid, details, version, assert);
    } else if (type === 'protractor') {
      dwv.test.checkProtractorDrawing(posGroupKid, details, version, assert);
    } else if (type === 'rectangle') {
      dwv.test.checkRectangleDrawing(posGroupKid, details, version, assert);
    } else {
      assert.ok(false, 'Unknown draw type.');
    }
  } else {
    assert.ok(false, 'Not the expected number of position groups.');
  }
};

/**
 * Check an arrow drawing.
 *
 * @param {object} posGroupKid The position group (only) kid.
 * @param {object} details The drawing details
 * @param {string} version The state format version.
 * @param {object} assert The qunit assert.
 */
dwv.test.checkArrowDrawing = function (posGroupKid, details, version, assert) {
  // check group
  assert.equal(
    posGroupKid.attrs.name, 'line-group', 'Shape group is a line group.');
  assert.ok(posGroupKid.attrs.draggable, 'Shape group must be draggable.');
  assert.equal(
    posGroupKid.attrs.id,
    'pf8zteo5r4',
    'Position group first level has the proper id.');
  assert.notEqual(
    typeof details.pf8zteo5r4,
    'undefined',
    'Details should contain data for id.');

  // kids
  assert.equal(posGroupKid.children.length, 3, 'Shape group has 3 kids.');
  var hasShape = false;
  var hasLabel = false;
  var hasPoly = false;
  for (var i = 0; i < posGroupKid.children.length; ++i) {
    var shapeGroupKid = posGroupKid.children[i];
    if (shapeGroupKid.attrs.name === 'shape') {
      hasShape = true;
      assert.equal(
        shapeGroupKid.className,
        'Line',
        'Shape group \'shape\' is a line.');
      assert.notOk(
        shapeGroupKid.attrs.draggable,
        'Shape group \'shape\' must not be draggable.');
      assert.deepEqual(
        shapeGroupKid.attrs.points,
        [53, 136, 139, 89],
        'Line has the proper points.');
      assert.equal(
        shapeGroupKid.attrs.stroke,
        '#ffff80',
        'Line has the proper colour.');
    } else if (shapeGroupKid.className === 'Label') {
      hasLabel = true;
      assert.notOk(
        shapeGroupKid.attrs.draggable,
        'Shape group \'label\' must not be draggable.');
      assert.equal(shapeGroupKid.children.length, 2, 'Label has 2 kids.');
      var labelGroupKid0 = shapeGroupKid.children[0];
      assert.equal(
        labelGroupKid0.className,
        'Text',
        'Label group first level is a text.');
      assert.equal(
        labelGroupKid0.attrs.text,
        'Eye',
        'Text has the proper value.');
      var labelGroupKid1 = shapeGroupKid.children[1];
      assert.equal(
        labelGroupKid1.className,
        'Tag',
        'Label group second level is a tag.');
    } else if (shapeGroupKid.className === 'RegularPolygon') {
      hasPoly = true;
      assert.notOk(
        shapeGroupKid.attrs.draggable,
        'Shape group \'extra\' must not be draggable.');
    }
  }
  assert.ok(hasShape, 'Shape group contains a shape.');
  assert.ok(hasLabel, 'Shape group contains a label.');
  assert.ok(hasPoly, 'Shape group contains a polygon.');

  // details
  var details0 = details.pf8zteo5r4;
  assert.equal(
    details0.meta.textExpr, 'Eye', 'Details textExpr has the proper value.');
  if (parseFloat(version) <= 0.3) {
    assert.equal(
      details0.meta.longText,
      'This is an eye!',
      'Details longText has the proper value.');
  }
};

/**
 * Check a ruler drawing.
 *
 * @param {object} posGroupKid The position group (only) kid.
 * @param {object} details The drawing details
 * @param {string} version The state format version.
 * @param {string} ref The reference data to compare to.
 * @param {object} assert The qunit assert.
 */
dwv.test.checkRulerDrawing = function (
  posGroupKid, details, version, ref, assert) {
  // check group
  assert.equal(
    posGroupKid.attrs.name, 'ruler-group', 'Shape group is a ruler group.');
  assert.ok(posGroupKid.attrs.draggable, 'Shape group must be draggable.');
  assert.equal(
    posGroupKid.attrs.id,
    ref.id,
    'Position group first level has the proper id.');
  assert.notEqual(
    typeof details[ref.id],
    'undefined',
    'Details should contain data for id.');

  // kids
  assert.equal(posGroupKid.children.length, 4, 'Shape group has 4 kids.');
  var hasShape = false;
  var hasLabel = false;
  var hasTick1 = false;
  var hasTick2 = false;
  for (var i = 0; i < posGroupKid.children.length; ++i) {
    var shapeGroupKid = posGroupKid.children[i];
    if (shapeGroupKid.attrs.name === 'shape') {
      hasShape = true;
      assert.equal(
        shapeGroupKid.className,
        'Line',
        'Shape group \'shape\' is a line.');
      assert.notOk(
        shapeGroupKid.attrs.draggable,
        'Shape group \'shape\' must not be draggable.');
      assert.deepEqual(
        shapeGroupKid.attrs.points,
        ref.points,
        'Line has the proper points.');
      assert.equal(
        shapeGroupKid.attrs.stroke,
        ref.colour,
        'Line has the proper colour.');
    } else if (shapeGroupKid.className === 'Label') {
      hasLabel = true;
      assert.notOk(
        shapeGroupKid.attrs.draggable,
        'Shape group \'label\' must not be draggable.');
      assert.equal(shapeGroupKid.children.length, 2, 'Label has 2 kids.');
      var labelGroupKid0 = shapeGroupKid.children[0];
      assert.equal(
        labelGroupKid0.className,
        'Text',
        'Label group first level is a text.');
      assert.equal(
        labelGroupKid0.attrs.text,
        ref.text,
        'Text has the proper value.');
      var labelGroupKid1 = shapeGroupKid.children[1];
      assert.equal(
        labelGroupKid1.className,
        'Tag',
        'Label group second level is a tag.');
    } else if (shapeGroupKid.className === 'Line') {
      if (hasTick1) {
        hasTick2 = true;
      } else {
        hasTick1 = true;
      }
      assert.notOk(
        shapeGroupKid.attrs.draggable,
        'Shape group \'extra\' must not be draggable.');
    }
  }
  assert.ok(hasShape, 'Shape group contains a shape.');
  assert.ok(hasLabel, 'Shape group contains a label.');
  assert.ok(hasTick1, 'Shape group contains a tick1.');
  assert.ok(hasTick2, 'Shape group contains a tick2.');

  // details
  var details0 = details[ref.id];
  assert.equal(
    details0.meta.textExpr,
    ref.textExpr,
    'Details textExpr has the proper value.');
  if (parseFloat(version) <= 0.3) {
    assert.equal(
      details0.meta.longText,
      ref.longText,
      'Details longText has the proper value.');
  }
};

/**
 * Check a multi slice ruler drawing.
 *
 * @param {object} layerKids The draw layer.
 * @param {object} details The drawing details
 * @param {string} version The state format version.
 * @param {object} assert The qunit assert.
 */
dwv.test.checkRulerDrawings = function (layerKids, details, version, assert) {

  var ndraws = 5;
  assert.equal(layerKids.length, ndraws, 'Layer has ' + ndraws + ' kids.');

  var unit = parseFloat(version) <= 0.3 ? 'mm' : ' mm';
  var refRulers = [
    {
      id: 'onzlkbs8p',
      points: [120, 110, 120, 60],
      colour: '#ffff00',
      text: '50.00' + unit,
      textExpr: '{length}',
      longText: (version === '0.1' ? '' : 'First ruler.')
    },
    {
      id: 'u9bvidgkjc9',
      points: [120, 110, 170, 110],
      colour: '#ff0000',
      text: '50.00' + unit,
      textExpr: '{length}',
      longText: (version === '0.1' ? '' : 'Second ruler.')
    },
    {
      id: 'c9abkegq62j',
      points: [120, 110, 120, 160],
      colour: '#ffffff',
      text: '50.00' + unit,
      textExpr: '{length}',
      longText: (version === '0.1' ? '' : 'Third ruler.')
    },
    {
      id: 'uiav43zjw1',
      points: [120, 110, 60, 110],
      colour: '#00ff00',
      text: '50.00' + unit,
      textExpr: '{length}',
      longText: (version === '0.1' ? '' : 'Fourth ruler.')
    },
    {
      id: '26ir11b9ugl',
      points: [120, 110, 120, 60],
      colour: '#ff00ff',
      text: '50.00' + unit,
      textExpr: '{length}',
      longText: (version === '0.1' ? '' : 'Fifth ruler.')
    }
  ];

  for (var i = 0; i < ndraws; ++i) {
    var layerKid = layerKids[i];
    assert.equal(
      layerKid.className,
      'Group',
      'Layer first level is a group for slice ' + i + '.');
    assert.equal(
      layerKid.attrs.name,
      'position-group',
      'Layer first level is a position group.');
    assert.equal(
      layerKid.attrs.id,
      '#2-' + (i + 1),
      'Position group has the proper id.');

    // third level: shape group(s)
    var posGroupKid = layerKid.children[0];
    assert.equal(
      posGroupKid.className,
      'Group',
      'Position group first level is a group.');

    dwv.test.checkRulerDrawing(
      posGroupKid, details, version, refRulers[i], assert);
  }
};

/**
 * Check a roi drawing.
 *
 * @param {object} posGroupKid The position group (only) kid.
 * @param {object} details The drawing details
 * @param {string} version The state format version.
 * @param {object} assert The qunit assert.
 */
dwv.test.checkRoiDrawing = function (posGroupKid, details, version, assert) {
  // check group
  assert.equal(
    posGroupKid.attrs.name,
    'roi-group',
    'Shape group is a roi group.');
  assert.ok(posGroupKid.attrs.draggable, 'Shape group must be draggable.');
  assert.equal(
    posGroupKid.attrs.id,
    '4l24ofouhmf',
    'Position group first level has the proper id.');
  assert.notEqual(
    typeof details['4l24ofouhmf'],
    'undefined',
    'Details should contain data for id.');

  // kids
  assert.equal(posGroupKid.children.length, 2, 'Shape group has 2 kids.');
  var hasShape = false;
  var hasLabel = false;
  for (var i = 0; i < posGroupKid.children.length; ++i) {
    var shapeGroupKid = posGroupKid.children[i];
    if (shapeGroupKid.attrs.name === 'shape') {
      hasShape = true;
      assert.equal(
        shapeGroupKid.className,
        'Line',
        'Shape group \'shape\' is a line.');
      assert.notOk(
        shapeGroupKid.attrs.draggable,
        'Shape group \'shape\' must not be draggable.');
      /* eslint-disable array-element-newline */
      assert.deepEqual(
        shapeGroupKid.attrs.points,
        [
          126, 40, 58, 80, 60, 116, 92, 128, 93, 143, 93,
          151, 94, 151, 114, 150, 128, 150, 214, 135, 183,
          56, 182, 56, 182, 56
        ],
        'Line has the proper points.');
      /* eslint-enable array-element-newline */
      var colour = (version === '0.1' ? '#ffff00' : '#ffff80');
      assert.equal(
        shapeGroupKid.attrs.stroke,
        colour,
        'Line has the proper colour.');
    } else if (shapeGroupKid.className === 'Label') {
      hasLabel = true;
      assert.notOk(
        shapeGroupKid.attrs.draggable,
        'Shape group \'label\' must not be draggable.');
      assert.equal(shapeGroupKid.children.length, 2, 'Label has 2 kids.');
      var labelGroupKid0 = shapeGroupKid.children[0];
      assert.equal(
        labelGroupKid0.className,
        'Text',
        'Label group first level is a text.');
      if (version !== '0.1') {
        assert.equal(
          labelGroupKid0.attrs.text,
          'Brain',
          'Text has the proper value.');
      }
      var labelGroupKid1 = shapeGroupKid.children[1];
      assert.equal(
        labelGroupKid1.className,
        'Tag',
        'Label group second level is a tag.');
    }
  }
  assert.ok(hasShape, 'Shape group contains a shape.');
  assert.ok(hasLabel, 'Shape group contains a label.');

  // details
  if (version !== '0.1') {
    var details0 = details['4l24ofouhmf'];
    assert.equal(
      details0.meta.textExpr,
      'Brain',
      'Details textExpr has the proper value.');
    if (version === '0.2' || version === '0.3') {
      assert.equal(
        details0.meta.longText,
        'This is a squary brain!',
        'Details longText has the proper value.');
    }
  }
};

/**
 * Check a hand drawing.
 *
 * @param {object} posGroupKid The position group (only) kid.
 * @param {object} details The drawing details
 * @param {string} version The state format version.
 * @param {object} assert The qunit assert.
 */
dwv.test.checkHandDrawing = function (posGroupKid, details, version, assert) {
  // check group
  assert.equal(
    posGroupKid.attrs.name,
    'freeHand-group',
    'Shape group is a freeHand group.');
  assert.ok(posGroupKid.attrs.draggable, 'Shape group must be draggable.');
  assert.equal(
    posGroupKid.attrs.id,
    '08m011yjp8je',
    'Position group first level has the proper id.');
  assert.notEqual(
    typeof details['08m011yjp8je'],
    'undefined',
    'Details should contain data for id.');

  // kids
  assert.equal(posGroupKid.children.length, 2, 'Shape group has 2 kids.');
  var hasShape = false;
  var hasLabel = false;
  for (var i = 0; i < posGroupKid.children.length; ++i) {
    var shapeGroupKid = posGroupKid.children[i];
    if (shapeGroupKid.attrs.name === 'shape') {
      hasShape = true;
      assert.equal(
        shapeGroupKid.className,
        'Line',
        'Shape group \'shape\' is a line.');
      assert.notOk(
        shapeGroupKid.attrs.draggable,
        'Shape group \'shape\' must not be draggable.');
      /* eslint-disable array-element-newline */
      assert.deepEqual(
        shapeGroupKid.attrs.points,
        [
          93, 50, 92, 50, 71, 58, 71, 59, 68, 63, 68, 64, 54, 80, 54, 81, 53,
          83, 52, 85, 51, 87, 50, 92, 47, 98, 47, 100, 55, 117, 56, 118, 86,
          122, 89, 126, 90, 128, 90, 129, 88, 131, 87, 133, 86, 134, 85, 138,
          85, 139, 85, 141, 87, 143, 87, 144, 87, 145, 88, 147, 92, 150, 97,
          152, 112, 154, 113, 153, 136, 143, 174, 136, 178, 135, 191, 136, 192,
          136, 194, 138, 196, 139, 197, 141, 199, 141, 200, 141, 207, 140, 208,
          139, 211, 136, 213, 134, 213, 133, 213, 129, 213, 126, 213, 122, 210,
          90, 209, 87, 206, 80, 205, 79, 204, 78, 201, 73, 199, 71, 197, 70,
          187, 63, 184, 61, 182, 59, 180, 58, 174, 54, 172, 52, 170, 51, 168,
          50, 167, 49, 155, 42, 154, 42, 151, 42, 136, 40, 134, 40, 133, 40,
          128, 41, 126, 41, 124, 41, 117, 44, 116, 44, 114, 44, 107, 47, 102,
          49, 100, 49, 97, 49, 93, 50, 92, 50, 92, 50
        ],
        'Line has the proper points.');
      /* eslint-enablearray-element-newline */
      assert.equal(
        shapeGroupKid.attrs.stroke,
        '#ffff80',
        'Line has the proper colour.');
    } else if (shapeGroupKid.className === 'Label') {
      hasLabel = true;
      assert.notOk(
        shapeGroupKid.attrs.draggable,
        'Shape group \'label\' must not be draggable.');
      assert.equal(shapeGroupKid.children.length, 2, 'Label has 2 kids.');
      var labelGroupKid0 = shapeGroupKid.children[0];
      assert.equal(
        labelGroupKid0.className,
        'Text',
        'Label group first level is a text.');
      assert.equal(
        labelGroupKid0.attrs.text,
        'Brain',
        'Text has the proper value.');
      var labelGroupKid1 = shapeGroupKid.children[1];
      assert.equal(
        labelGroupKid1.className,
        'Tag',
        'Label group second level is a tag.');
    }
  }
  assert.ok(hasShape, 'Shape group contains a shape.');
  assert.ok(hasLabel, 'Shape group contains a label.');

  // details
  var details0 = details['08m011yjp8je'];
  assert.equal(
    details0.meta.textExpr,
    'Brain',
    'Details textExpr has the proper value.');
  if (version === '0.2' || version === '0.3') {
    assert.equal(
      details0.meta.longText,
      'This is a roundy brain!',
      'Details longText has the proper value.');
  }
};

/**
 * Check an ellipse drawing.
 *
 * @param {object} posGroupKid The position group (only) kid.
 * @param {object} details The drawing details
 * @param {string} version The state format version.
 * @param {object} assert The qunit assert.
 */
dwv.test.checkEllipseDrawing = function (
  posGroupKid, details, version, assert) {
  // check group
  assert.equal(
    posGroupKid.attrs.name,
    'ellipse-group',
    'Shape group is an ellipse group.');
  assert.ok(posGroupKid.attrs.draggable, 'Shape group must be draggable.');
  assert.equal(
    posGroupKid.attrs.id,
    'c6j16qt6vt6',
    'Position group first level has the proper id.');
  assert.notEqual(
    typeof details.c6j16qt6vt6,
    'undefined',
    'Details should contain data for id.');

  // kids
  assert.equal(posGroupKid.children.length, 2, 'Shape group has 2 kids.');
  var hasShape = false;
  var hasLabel = false;
  for (var i = 0; i < posGroupKid.children.length; ++i) {
    var shapeGroupKid = posGroupKid.children[i];
    if (shapeGroupKid.attrs.name === 'shape') {
      hasShape = true;
      assert.equal(
        shapeGroupKid.className,
        'Ellipse',
        'Shape group \'shape\' is an ellipse.');
      assert.notOk(
        shapeGroupKid.attrs.draggable,
        'Shape group \'shape\' must not be draggable.');
      assert.deepEqual(shapeGroupKid.attrs.x, 90, 'Ellipse has the proper x.');
      assert.deepEqual(shapeGroupKid.attrs.y, 78, 'Ellipse has the proper y.');
      assert.deepEqual(
        shapeGroupKid.attrs.radiusX,
        53,
        'Ellipse has the proper radiusX.');
      assert.deepEqual(
        shapeGroupKid.attrs.radiusY,
        32,
        'Ellipse has the proper radiusY.');
      var colour = (version === '0.1' ? '#ffff00' : '#ffff80');
      assert.equal(
        shapeGroupKid.attrs.stroke,
        colour,
        'Ellipse has the proper colour.');
    } else if (shapeGroupKid.className === 'Label') {
      hasLabel = true;
      assert.notOk(
        shapeGroupKid.attrs.draggable,
        'Shape group \'label\' must not be draggable.');
      assert.equal(shapeGroupKid.children.length, 2, 'Label has 2 kids.');
      var labelGroupKid0 = shapeGroupKid.children[0];
      assert.equal(
        labelGroupKid0.className,
        'Text',
        'Label group first level is a text.');
      var unit = parseFloat(version) <= 0.3 ? 'cm2' : ' cm²';
      assert.equal(
        labelGroupKid0.attrs.text,
        '53.28' + unit,
        'Text has the proper value.');
      var labelGroupKid1 = shapeGroupKid.children[1];
      assert.equal(
        labelGroupKid1.className,
        'Tag',
        'Label group second level is a tag.');
    }
  }
  assert.ok(hasShape, 'Shape group contains a shape.');
  assert.ok(hasLabel, 'Shape group contains a label.');

  // details
  if (version !== '0.1') {
    var details0 = details.c6j16qt6vt6;
    assert.equal(
      details0.meta.textExpr,
      '{surface}',
      'Details textExpr has the proper value.');
    if (version === '0.2' || version === '0.3') {
      assert.equal(
        details0.meta.longText,
        'What a surface!',
        'Details longText has the proper value.');
    }
  }
};

/**
 * Check a protractor drawing.
 *
 * @param {object} posGroupKid The position group (only) kid.
 * @param {object} details The drawing details
 * @param {string} version The state format version.
 * @param {object} assert The qunit assert.
 */
dwv.test.checkProtractorDrawing = function (
  posGroupKid, details, version, assert) {
  // check group
  assert.equal(
    posGroupKid.attrs.name,
    'protractor-group',
    'Shape group is an protractor group.');
  assert.ok(posGroupKid.attrs.draggable, 'Shape group must be draggable.');
  assert.equal(
    posGroupKid.attrs.id,
    '49g7kqi3p4u',
    'Position group first level has the proper id.');
  assert.notEqual(
    typeof details['49g7kqi3p4u'],
    'undefined',
    'Details should contain data for id.');

  // kids
  assert.equal(posGroupKid.children.length, 3, 'Shape group has 3 kids.');
  var hasShape = false;
  var hasLabel = false;
  var hasArc = false;
  for (var i = 0; i < posGroupKid.children.length; ++i) {
    var shapeGroupKid = posGroupKid.children[i];
    if (shapeGroupKid.attrs.name === 'shape') {
      hasShape = true;
      assert.equal(
        shapeGroupKid.className,
        'Line',
        'Shape group \'shape\' is a line.');
      assert.notOk(
        shapeGroupKid.attrs.draggable,
        'Shape group \'shape\' must not be draggable.');
      assert.deepEqual(
        shapeGroupKid.attrs.points,
        [33, 164, 81, 145, 93, 198],
        'Line has the proper points.');
      var colour = (version === '0.1' ? '#ffff00' : '#ffff80');
      assert.equal(
        shapeGroupKid.attrs.stroke,
        colour,
        'Line has the proper colour.');
    } else if (shapeGroupKid.className === 'Label') {
      hasLabel = true;
      assert.notOk(
        shapeGroupKid.attrs.draggable,
        'Shape group \'label\' must not be draggable.');
      assert.equal(shapeGroupKid.children.length, 2, 'Label has 2 kids.');
      var labelGroupKid0 = shapeGroupKid.children[0];
      assert.equal(
        labelGroupKid0.className,
        'Text',
        'Label group first level is a text.');
      var unit = parseFloat(version) <= 0.3 ? '°' : ' °';
      assert.equal(
        labelGroupKid0.attrs.text,
        '80.15' + unit,
        'Text has the proper value.');
      var labelGroupKid1 = shapeGroupKid.children[1];
      assert.equal(
        labelGroupKid1.className,
        'Tag',
        'Label group second level is a tag.');
    } else if (shapeGroupKid.className === 'Arc') {
      hasArc = true;
      assert.notOk(
        shapeGroupKid.attrs.draggable,
        'Shape group \'extra\' must not be draggable.');
    }
  }
  assert.ok(hasShape, 'Shape group contains a shape.');
  assert.ok(hasLabel, 'Shape group contains a label.');
  assert.ok(hasArc, 'Shape group contains an arc.');

  // details
  if (version !== '0.1') {
    var details0 = details['49g7kqi3p4u'];
    assert.equal(
      details0.meta.textExpr,
      '{angle}',
      'Details textExpr has the proper value.');
    if (version === '0.2' || version === '0.3') {
      assert.equal(
        details0.meta.longText,
        'What an angle!',
        'Details longText has the proper value.');
    }
  }
};

/**
 * Check a rectangle drawing.
 *
 * @param {object} posGroupKid The position group (only) kid.
 * @param {object} details The drawing details
 * @param {string} version The state format version.
 * @param {object} assert The qunit assert.
 */
dwv.test.checkRectangleDrawing = function (
  posGroupKid, details, version, assert) {
  // check group
  assert.equal(
    posGroupKid.attrs.name,
    'rectangle-group',
    'Shape group is a rectangle group.');
  assert.ok(posGroupKid.attrs.draggable, 'Shape group must be draggable.');
  assert.equal(
    posGroupKid.attrs.id,
    'db0puu209qe',
    'Position group first level has the proper id.');
  assert.notEqual(
    typeof details.db0puu209qe,
    'undefined',
    'Details should contain data for id.');

  // kids
  assert.equal(posGroupKid.children.length, 2, 'Shape group has 2 kids.');
  var hasShape = false;
  var hasLabel = false;
  for (var i = 0; i < posGroupKid.children.length; ++i) {
    var shapeGroupKid = posGroupKid.children[i];
    if (shapeGroupKid.attrs.name === 'shape') {
      hasShape = true;
      assert.equal(
        shapeGroupKid.className,
        'Rect',
        'Shape group \'shape\' is a rectangle.');
      assert.notOk(
        shapeGroupKid.attrs.draggable,
        'Shape group \'shape\' must not be draggable.');
      assert.deepEqual(
        shapeGroupKid.attrs.x,
        80,
        'Rectangle has the proper x.');
      assert.deepEqual(
        shapeGroupKid.attrs.y,
        58,
        'Rectangle has the proper y.');
      assert.deepEqual(
        shapeGroupKid.attrs.width,
        104,
        'Rectangle has the proper width.');
      assert.deepEqual(
        shapeGroupKid.attrs.height,
        64,
        'Rectangle has the proper height.');
      var colour = (version === '0.1' ? '#ffff00' : '#ffff80');
      assert.equal(
        shapeGroupKid.attrs.stroke,
        colour,
        'Rectangle has the proper colour.');
    } else if (shapeGroupKid.className === 'Label') {
      hasLabel = true;
      assert.notOk(
        shapeGroupKid.attrs.draggable,
        'Shape group \'label\' must not be draggable.');
      assert.equal(shapeGroupKid.children.length, 2, 'Label has 2 kids.');
      var labelGroupKid0 = shapeGroupKid.children[0];
      assert.equal(
        labelGroupKid0.className,
        'Text',
        'Label group first level is a text.');
      var unit = parseFloat(version, 10) <= 0.3 ? 'cm2' : ' cm²';
      assert.equal(
        labelGroupKid0.attrs.text,
        '66.56' + unit,
        'Text has the proper value.');
      var labelGroupKid1 = shapeGroupKid.children[1];
      assert.equal(
        labelGroupKid1.className,
        'Tag',
        'Label group second level is a tag.');
    }
  }
  assert.ok(hasShape, 'Shape group contains a shape.');
  assert.ok(hasLabel, 'Shape group contains a label.');

  // details
  if (version !== '0.1') {
    var details0 = details.db0puu209qe;
    assert.equal(
      details0.meta.textExpr,
      '{surface}',
      'Details textExpr has the proper value.');
    if (version === '0.2' || version === '0.3') {
      assert.equal(
        details0.meta.longText,
        'What a rectangle!',
        'Details longText has the proper value.');
    }
  }
};

/**
 * Tests for {@link dwv.io.State} v0.1 containing a line.
 *
 * @function module:tests/state~testV01Line
 */
QUnit.test('Test read v0.1 state: line.', function (assert) {
  dwv.test.testState('0.1', 'line', assert);
});

/**
 * Tests for {@link dwv.io.State} v0.1 containing a roi.
 *
 * @function module:tests/state~testV01Roi
 */
QUnit.test('Test read v0.1 state: roi.', function (assert) {
  dwv.test.testState('0.1', 'roi', assert);
});

/**
 * Tests for {@link dwv.io.State} v0.1 containing an ellipse.
 *
 * @function module:tests/state~testV01Ellipse
 */
QUnit.test('Test read v0.1 state: ellipse.', function (assert) {
  dwv.test.testState('0.1', 'ellipse', assert);
});

/**
 * Tests for {@link dwv.io.State} v0.1 containing a protractor.
 *
 * @function module:tests/state~testV01Protractor
 */
QUnit.test('Test read v0.1 state: protractor.', function (assert) {
  dwv.test.testState('0.1', 'protractor', assert);
});

/**
 * Tests for {@link dwv.io.State} v0.1 containing a rectangle.
 *
 * @function module:tests/state~testV01Rectangle
 */
QUnit.test('Test read v0.1 state: rectangle.', function (assert) {
  dwv.test.testState('0.1', 'rectangle', assert);
});

/**
 * Tests for {@link dwv.io.State} v0.1 containing a multi slice ruler.
 *
 * @function module:tests/state~testV01MultiSliceRuler
 */
QUnit.test('Test read v0.1 state: line multi-slice.', function (assert) {
  dwv.test.testState('0.1', 'line_multi-slice', assert);
});

/**
 * Tests for {@link dwv.io.State} v0.2 containing an arrow.
 *
 * @function module:tests/state~testV02Arrow
 */
QUnit.test('Test read v0.2 state: arrow.', function (assert) {
  dwv.test.testState('0.2', 'arrow', assert);
});

/**
 * Tests for {@link dwv.io.State} v0.2 containing a ruler.
 *
 * @function module:tests/state~testV02Ruler
 */
QUnit.test('Test read v0.2 state: ruler.', function (assert) {
  dwv.test.testState('0.2', 'ruler', assert);
});

/**
 * Tests for {@link dwv.io.State} v0.2 containing a roi.
 *
 * @function module:tests/state~testV02Roi
 */
QUnit.test('Test read v0.2 state: roi.', function (assert) {
  dwv.test.testState('0.2', 'roi', assert);
});

/**
 * Tests for {@link dwv.io.State} v0.2 containing a hand draw.
 *
 * @function module:tests/state~testV02Hand
 */
QUnit.test('Test read v0.2 state: hand.', function (assert) {
  dwv.test.testState('0.2', 'hand', assert);
});

/**
 * Tests for {@link dwv.io.State} v0.2 containing an ellipse.
 *
 * @function module:tests/state~testV02Ellipses
 */
QUnit.test('Test read v0.2 state: ellipse.', function (assert) {
  dwv.test.testState('0.2', 'ellipse', assert);
});

/**
 * Tests for {@link dwv.io.State} v0.2 containing a protractor.
 *
 * @function module:tests/state~testV02Protractor
 */
QUnit.test('Test read v0.2 state: protractor.', function (assert) {
  dwv.test.testState('0.2', 'protractor', assert);
});

/**
 * Tests for {@link dwv.io.State} v0.2 containing a rectangle.
 *
 * @function module:tests/state~testV02Rectangle
 */
QUnit.test('Test read v0.2 state: rectangle.', function (assert) {
  dwv.test.testState('0.2', 'rectangle', assert);
});

/**
 * Tests for {@link dwv.io.State} v0.2 containing a multi slice ruler.
 *
 * @function module:tests/state~testV02MultiSliceRuler
 */
QUnit.test('Test read v0.2 state: ruler multi-slice.', function (assert) {
  dwv.test.testState('0.2', 'ruler_multi-slice', assert);
});

/**
 * Tests for {@link dwv.io.State} v0.3 containing an arrow.
 *
 * @function module:tests/state~testV03Arrow
 */
QUnit.test('Test read v0.3 state: arrow.', function (assert) {
  dwv.test.testState('0.3', 'arrow', assert);
});

/**
 * Tests for {@link dwv.io.State} v0.3 containing a ruler.
 *
 * @function module:tests/state~testV03Ruler
 */
QUnit.test('Test read v0.3 state: ruler.', function (assert) {
  dwv.test.testState('0.3', 'ruler', assert);
});

/**
 * Tests for {@link dwv.io.State} v0.3 containing a roi.
 *
 * @function module:tests/state~testV03Roi
 */
QUnit.test('Test read v0.3 state: roi.', function (assert) {
  dwv.test.testState('0.3', 'roi', assert);
});

/**
 * Tests for {@link dwv.io.State} v0.3 containing a hand draw.
 *
 * @function module:tests/state~testV03Hand
 */
QUnit.test('Test read v0.3 state: hand.', function (assert) {
  dwv.test.testState('0.3', 'hand', assert);
});

/**
 * Tests for {@link dwv.io.State} v0.3 containing an ellipse.
 *
 * @function module:tests/state~testV03Ellipse
 */
QUnit.test('Test read v0.3 state: ellipse.', function (assert) {
  dwv.test.testState('0.3', 'ellipse', assert);
});

/**
 * Tests for {@link dwv.io.State} v0.3 containing a protractor.
 *
 * @function module:tests/state~testV03Protractor
 */
QUnit.test('Test read v0.3 state: protractor.', function (assert) {
  dwv.test.testState('0.3', 'protractor', assert);
});

/**
 * Tests for {@link dwv.io.State} v0.3 containing a rectangle.
 *
 * @function module:tests/state~testV03Rectangle
 */
QUnit.test('Test read v0.3 state: rectangle.', function (assert) {
  dwv.test.testState('0.3', 'rectangle', assert);
});

/**
 * Tests for {@link dwv.io.State} v0.3 containing a multi slice ruler.
 *
 * @function module:tests/state~testV03MultiSliceRuler
 */
QUnit.test('Test read v0.3 state: ruler multi-slice.', function (assert) {
  dwv.test.testState('0.3', 'ruler_multi-slice', assert);
});

/**
 * Tests for {@link dwv.io.State} v0.4 containing an arrow.
 *
 * @function module:tests/state~testV04Arrow
 */
QUnit.test('Test read v0.4 state: arrow.', function (assert) {
  dwv.test.testState('0.4', 'arrow', assert);
});

/**
 * Tests for {@link dwv.io.State} v0.4 containing a ruler.
 *
 * @function module:tests/state~testV04Ruler
 */
QUnit.test('Test read v0.4 state: ruler.', function (assert) {
  dwv.test.testState('0.4', 'ruler', assert);
});

/**
 * Tests for {@link dwv.io.State} v0.4 containing a roi.
 *
 * @function module:tests/state~testV04Roi
 */
QUnit.test('Test read v0.4 state: roi.', function (assert) {
  dwv.test.testState('0.4', 'roi', assert);
});

/**
 * Tests for {@link dwv.io.State} v0.4 containing a hand draw.
 *
 * @function module:tests/state~testV04Hand
 */
QUnit.test('Test read v0.4 state: hand.', function (assert) {
  dwv.test.testState('0.4', 'hand', assert);
});

/**
 * Tests for {@link dwv.io.State} v0.4 containing an ellipse.
 *
 * @function module:tests/state~testV04Ellipse
 */
QUnit.test('Test read v0.4 state: ellipse.', function (assert) {
  dwv.test.testState('0.4', 'ellipse', assert);
});

/**
 * Tests for {@link dwv.io.State} v0.4 containing a protractor.
 *
 * @function module:tests/state~testV04Protractor
 */
QUnit.test('Test read v0.4 state: protractor.', function (assert) {
  dwv.test.testState('0.4', 'protractor', assert);
});


/**
 * Tests for {@link dwv.io.State} v0.4 containing a rectangle.
 *
 * @function module:tests/state~testV04Rectangle
 */
QUnit.test('Test read v0.4 state: rectangle.', function (assert) {
  dwv.test.testState('0.4', 'rectangle', assert);
});

/**
 * Tests for {@link dwv.io.State} v0.4 containing a multi slice ruler.
 *
 * @function module:tests/state~testV04MultiSliceRuler
 */
QUnit.test('Test read v0.4 state: ruler multi-slice.', function (assert) {
  dwv.test.testState('0.4', 'ruler_multi-slice', assert);
});

/**
 * Tests for {@link dwv.io.State} v0.5 containing an arrow.
 *
 * @function module:tests/state~testV05Arrow
 */
QUnit.test('Test read v0.5 state: arrow.', function (assert) {
  dwv.test.testState('0.5', 'arrow', assert);
});

/**
 * Tests for {@link dwv.io.State} v0.5 containing a ruler.
 *
 * @function module:tests/state~testV05Ruler
 */
QUnit.test('Test read v0.5 state: ruler.', function (assert) {
  dwv.test.testState('0.5', 'ruler', assert);
});

/**
 * Tests for {@link dwv.io.State} v0.5 containing a roi.
 *
 * @function module:tests/state~testV05Roi
 */
QUnit.test('Test read v0.5 state: roi.', function (assert) {
  dwv.test.testState('0.5', 'roi', assert);
});

/**
 * Tests for {@link dwv.io.State} v0.5 containing a hand draw.
 *
 * @function module:tests/state~testV05Hand
 */
QUnit.test('Test read v0.5 state: hand.', function (assert) {
  dwv.test.testState('0.5', 'hand', assert);
});

/**
 * Tests for {@link dwv.io.State} v0.5 containing an ellipse.
 *
 * @function module:tests/state~testV05Ellipse
 */
QUnit.test('Test read v0.5 state: ellipse.', function (assert) {
  dwv.test.testState('0.5', 'ellipse', assert);
});

/**
 * Tests for {@link dwv.io.State} v0.5 containing a protractor.
 *
 * @function module:tests/state~testV05Protractor
 */
QUnit.test('Test read v0.5 state: protractor.', function (assert) {
  dwv.test.testState('0.5', 'protractor', assert);
});


/**
 * Tests for {@link dwv.io.State} v0.5 containing a rectangle.
 *
 * @function module:tests/state~testV05Rectangle
 */
QUnit.test('Test read v0.5 state: rectangle.', function (assert) {
  dwv.test.testState('0.5', 'rectangle', assert);
});

/**
 * Tests for {@link dwv.io.State} v0.5 containing a multi slice ruler.
 *
 * @function module:tests/state~testV05MultiSliceRuler
 */
QUnit.test('Test read v0.5 state: ruler multi-slice.', function (assert) {
  dwv.test.testState('0.5', 'ruler_multi-slice', assert);
});
