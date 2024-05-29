import {State} from '../../src/io/state';

import v01Ellipse from './v0.1/state-ellipse.json';
import v01LineMulti from './v0.1/state-line_multi-slice.json';
import v01Line from './v0.1/state-line.json';
import v01Protractor from './v0.1/state-protractor.json';
import v01Rectangle from './v0.1/state-rectangle.json';
import v01Roi from './v0.1/state-roi.json';

import v02Arrow from './v0.2/state-arrow.json';
import v02Ellipse from './v0.2/state-ellipse.json';
import v02Hand from './v0.2/state-hand.json';
import v02Protractor from './v0.2/state-protractor.json';
import v02Rectangle from './v0.2/state-rectangle.json';
import v02Roi from './v0.2/state-roi.json';
import v02RulerMulti from './v0.2/state-ruler_multi-slice.json';
import v02Ruler from './v0.2/state-ruler.json';

import v03Arrow from './v0.3/state-arrow.json';
import v03Ellipse from './v0.3/state-ellipse.json';
import v03Hand from './v0.3/state-hand.json';
import v03Protractor from './v0.3/state-protractor.json';
import v03Rectangle from './v0.3/state-rectangle.json';
import v03Roi from './v0.3/state-roi.json';
import v03RulerMulti from './v0.3/state-ruler_multi-slice.json';
import v03Ruler from './v0.3/state-ruler.json';

import v04Arrow from './v0.4/state-arrow.json';
import v04Ellipse from './v0.4/state-ellipse.json';
import v04Hand from './v0.4/state-hand.json';
import v04Protractor from './v0.4/state-protractor.json';
import v04Rectangle from './v0.4/state-rectangle.json';
import v04Roi from './v0.4/state-roi.json';
import v04RulerMulti from './v0.4/state-ruler_multi-slice.json';
import v04Ruler from './v0.4/state-ruler.json';

import v05Arrow from './v0.5/state-arrow.json';
import v05Ellipse from './v0.5/state-ellipse.json';
import v05Hand from './v0.5/state-hand.json';
import v05Protractor from './v0.5/state-protractor.json';
import v05Rectangle from './v0.5/state-rectangle.json';
import v05Roi from './v0.5/state-roi.json';
import v05RulerMulti from './v0.5/state-ruler_multi-slice.json';
import v05Ruler from './v0.5/state-ruler.json';

/**
 * Tests for the 'app/state.js' file.
 */
/** @module tests/state */

/* global QUnit */
QUnit.module('state');

/**
 * Test a state file.
 *
 * @param {object} data The test data.
 * @param {string} version The state format version.
 * @param {string} type The type of drawing.
 * @param {object} assert The qunit assert.
 */
function testState(data, version, type, assert) {
  // read state
  const state = new State();
  const jsonData = state.fromJSON(data);
  // check drawings values
  checkDrawings(
    jsonData.drawings, jsonData.drawingsDetails, version, type, assert);
  // delete drawing to allow simple equal check
  delete jsonData.drawings;
  delete jsonData.drawingsDetails;
  // check values expect drawings
  checkStateHeader(jsonData, version, assert);
}

/**
 * Check state header.
 *
 * @param {object} jsonData The input data to check.
 * @param {string} version The state format version.
 * @param {object} assert The qunit assert.
 */
function checkStateHeader(jsonData, version, assert) {
  // header data
  const headerData = {
    version: version,
    'window-center': 441,
    'window-width': 911,
  };
  if (parseFloat(version) <= 0.3) {
    headerData.scale = 1;
    headerData.scaleCenter = {x: 0, y: 0};
    headerData.translation = {x: 0, y: 0};
  } else {
    headerData.scale = {x: 1, y: 1};
    headerData.offset = {x: 0, y: 0};
  }
  if (parseFloat(version) <= 0.4) {
    headerData.position = [0, 0, 0];
  } else {
    headerData.position = [0, 0, 114.63];
  }
  assert.deepEqual(jsonData, headerData);
}

/**
 * Check drawings.
 *
 * @param {object} drawings The drawing object to check.
 * @param {object} details The drawing details.
 * @param {string} version The state format version.
 * @param {string} type The type of drawing.
 * @param {object} assert The qunit assert.
 */
function checkDrawings(drawings, details, version, type, assert) {
  // first level: layer
  assert.equal(drawings.className, 'Layer', 'State drawings is a layer.');

  // second level: position groups
  if (drawings.children.length === 5 &&
        (type === 'ruler_multi-slice' || type === 'line_multi-slice')) {
    checkRulerDrawings(drawings.children, details, version, assert);
  } else if (drawings.children.length === 1) {

    const layerKid = drawings.children[0];
    assert.equal(layerKid.className, 'Group', 'Layer first level is a group.');
    assert.equal(
      layerKid.attrs.name,
      'position-group',
      'Layer first level is a position group.');
    const groupId = '#2-0';
    assert.equal(
      layerKid.attrs.id,
      groupId,
      'Position group has the proper id.');

    // third level: shape group(s)
    const posGroupKid = layerKid.children[0];
    assert.equal(
      posGroupKid.className,
      'Group',
      'Position group first level is a group.');

    const unit = parseFloat(version) <= 0.3 ? 'mm' : ' mm';

    // shape specific checks
    if (type === 'arrow') {
      checkArrowDrawing(posGroupKid, details, version, assert);
    } else if (type === 'ruler' && version !== '0.1') {
      const refRuler = {
        id: '4gvkz8v6wzw',
        points: [51, 135, 216, 134],
        colour: '#ffff80',
        text: '165.0' + unit,
        textExpr: '{length}',
        longText: 'What a ruler!'
      };
      checkRulerDrawing(
        posGroupKid, details, version, refRuler, assert);
    } else if (type === 'line' && version === '0.1') {
      const refLine = {
        id: '4gvkz8v6wzw',
        points: [51, 135, 216, 134],
        colour: '#ffff00',
        text: '165.0' + unit,
        textExpr: '{length}',
        longText: ''
      };
      checkRulerDrawing(
        posGroupKid, details, version, refLine, assert);
    } else if (type === 'roi') {
      checkRoiDrawing(posGroupKid, details, version, assert);
    } else if (type === 'hand') {
      checkHandDrawing(posGroupKid, details, version, assert);
    } else if (type === 'ellipse') {
      checkEllipseDrawing(posGroupKid, details, version, assert);
    } else if (type === 'protractor') {
      checkProtractorDrawing(posGroupKid, details, version, assert);
    } else if (type === 'rectangle') {
      checkRectangleDrawing(posGroupKid, details, version, assert);
    } else {
      assert.ok(false, 'Unknown draw type.');
    }
  } else {
    assert.ok(false, 'Not the expected number of position groups.');
  }
}

/**
 * Check an arrow drawing.
 *
 * @param {object} posGroupKid The position group (only) kid.
 * @param {object} details The drawing details.
 * @param {string} version The state format version.
 * @param {object} assert The qunit assert.
 */
function checkArrowDrawing(posGroupKid, details, version, assert) {
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
  let hasShape = false;
  let hasLabel = false;
  let hasPoly = false;
  for (let i = 0; i < posGroupKid.children.length; ++i) {
    const shapeGroupKid = posGroupKid.children[i];
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
      const labelGroupKid0 = shapeGroupKid.children[0];
      assert.equal(
        labelGroupKid0.className,
        'Text',
        'Label group first level is a text.');
      assert.equal(
        labelGroupKid0.attrs.text,
        'Eye',
        'Text has the proper value.');
      const labelGroupKid1 = shapeGroupKid.children[1];
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
  const details0 = details.pf8zteo5r4;
  assert.equal(
    details0.meta.textExpr, 'Eye', 'Details textExpr has the proper value.');
  if (parseFloat(version) <= 0.3) {
    assert.equal(
      details0.meta.longText,
      'This is an eye!',
      'Details longText has the proper value.');
  }
}

/**
 * Check a ruler drawing.
 *
 * @param {object} posGroupKid The position group (only) kid.
 * @param {object} details The drawing details.
 * @param {string} version The state format version.
 * @param {string} ref The reference data to compare to.
 * @param {object} assert The qunit assert.
 */
function checkRulerDrawing(
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
  let hasShape = false;
  let hasLabel = false;
  let hasTick1 = false;
  let hasTick2 = false;
  for (let i = 0; i < posGroupKid.children.length; ++i) {
    const shapeGroupKid = posGroupKid.children[i];
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
      const labelGroupKid0 = shapeGroupKid.children[0];
      assert.equal(
        labelGroupKid0.className,
        'Text',
        'Label group first level is a text.');
      assert.equal(
        labelGroupKid0.attrs.text,
        ref.text,
        'Text has the proper value.');
      const labelGroupKid1 = shapeGroupKid.children[1];
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
  const details0 = details[ref.id];
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
}

/**
 * Check a multi slice ruler drawing.
 *
 * @param {object} layerKids The draw layer.
 * @param {object} details The drawing details.
 * @param {string} version The state format version.
 * @param {object} assert The qunit assert.
 */
function checkRulerDrawings(layerKids, details, version, assert) {

  const ndraws = 5;
  assert.equal(layerKids.length, ndraws, 'Layer has ' + ndraws + ' kids.');

  const unit = parseFloat(version) <= 0.3 ? 'mm' : ' mm';
  const refRulers = [
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

  for (let i = 0; i < ndraws; ++i) {
    const layerKid = layerKids[i];
    assert.equal(
      layerKid.className,
      'Group',
      'Layer first level is a group for slice ' + i + '.');
    assert.equal(
      layerKid.attrs.name,
      'position-group',
      'Layer first level is a position group.');
    const groupId = '#2-' + (i + 1);
    assert.equal(
      layerKid.attrs.id,
      groupId,
      'Position group has the proper id.');

    // third level: shape group(s)
    const posGroupKid = layerKid.children[0];
    assert.equal(
      posGroupKid.className,
      'Group',
      'Position group first level is a group.');

    checkRulerDrawing(
      posGroupKid, details, version, refRulers[i], assert);
  }
}

/**
 * Check a roi drawing.
 *
 * @param {object} posGroupKid The position group (only) kid.
 * @param {object} details The drawing details.
 * @param {string} version The state format version.
 * @param {object} assert The qunit assert.
 */
function checkRoiDrawing(posGroupKid, details, version, assert) {
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
  let hasShape = false;
  let hasLabel = false;
  for (let i = 0; i < posGroupKid.children.length; ++i) {
    const shapeGroupKid = posGroupKid.children[i];
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
      const colour = (version === '0.1' ? '#ffff00' : '#ffff80');
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
      const labelGroupKid0 = shapeGroupKid.children[0];
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
      const labelGroupKid1 = shapeGroupKid.children[1];
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
    const details0 = details['4l24ofouhmf'];
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
}

/**
 * Check a hand drawing.
 *
 * @param {object} posGroupKid The position group (only) kid.
 * @param {object} details The drawing details.
 * @param {string} version The state format version.
 * @param {object} assert The qunit assert.
 */
function checkHandDrawing(posGroupKid, details, version, assert) {
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
  let hasShape = false;
  let hasLabel = false;
  for (let i = 0; i < posGroupKid.children.length; ++i) {
    const shapeGroupKid = posGroupKid.children[i];
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
      const labelGroupKid0 = shapeGroupKid.children[0];
      assert.equal(
        labelGroupKid0.className,
        'Text',
        'Label group first level is a text.');
      assert.equal(
        labelGroupKid0.attrs.text,
        'Brain',
        'Text has the proper value.');
      const labelGroupKid1 = shapeGroupKid.children[1];
      assert.equal(
        labelGroupKid1.className,
        'Tag',
        'Label group second level is a tag.');
    }
  }
  assert.ok(hasShape, 'Shape group contains a shape.');
  assert.ok(hasLabel, 'Shape group contains a label.');

  // details
  const details0 = details['08m011yjp8je'];
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
}

/**
 * Check an ellipse drawing.
 *
 * @param {object} posGroupKid The position group (only) kid.
 * @param {object} details The drawing details.
 * @param {string} version The state format version.
 * @param {object} assert The qunit assert.
 */
function checkEllipseDrawing(
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
  let hasShape = false;
  let hasLabel = false;
  for (let i = 0; i < posGroupKid.children.length; ++i) {
    const shapeGroupKid = posGroupKid.children[i];
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
      const colour = (version === '0.1' ? '#ffff00' : '#ffff80');
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
      const labelGroupKid0 = shapeGroupKid.children[0];
      assert.equal(
        labelGroupKid0.className,
        'Text',
        'Label group first level is a text.');
      const unit = parseFloat(version) <= 0.3 ? 'cm2' : ' cm²';
      assert.equal(
        labelGroupKid0.attrs.text,
        '53.28' + unit,
        'Text has the proper value.');
      const labelGroupKid1 = shapeGroupKid.children[1];
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
    const details0 = details.c6j16qt6vt6;
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
}

/**
 * Check a protractor drawing.
 *
 * @param {object} posGroupKid The position group (only) kid.
 * @param {object} details The drawing details.
 * @param {string} version The state format version.
 * @param {object} assert The qunit assert.
 */
function checkProtractorDrawing(
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
  let hasShape = false;
  let hasLabel = false;
  let hasArc = false;
  for (let i = 0; i < posGroupKid.children.length; ++i) {
    const shapeGroupKid = posGroupKid.children[i];
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
      const colour = (version === '0.1' ? '#ffff00' : '#ffff80');
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
      const labelGroupKid0 = shapeGroupKid.children[0];
      assert.equal(
        labelGroupKid0.className,
        'Text',
        'Label group first level is a text.');
      const unit = parseFloat(version) <= 0.3 ? '°' : ' °';
      assert.equal(
        labelGroupKid0.attrs.text,
        '80.15' + unit,
        'Text has the proper value.');
      const labelGroupKid1 = shapeGroupKid.children[1];
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
    const details0 = details['49g7kqi3p4u'];
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
}

/**
 * Check a rectangle drawing.
 *
 * @param {object} posGroupKid The position group (only) kid.
 * @param {object} details The drawing details.
 * @param {string} version The state format version.
 * @param {object} assert The qunit assert.
 */
function checkRectangleDrawing(
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
  let hasShape = false;
  let hasLabel = false;
  for (let i = 0; i < posGroupKid.children.length; ++i) {
    const shapeGroupKid = posGroupKid.children[i];
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
      const colour = (version === '0.1' ? '#ffff00' : '#ffff80');
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
      const labelGroupKid0 = shapeGroupKid.children[0];
      assert.equal(
        labelGroupKid0.className,
        'Text',
        'Label group first level is a text.');
      const unit = parseFloat(version, 10) <= 0.3 ? 'cm2' : ' cm²';
      assert.equal(
        labelGroupKid0.attrs.text,
        '66.56' + unit,
        'Text has the proper value.');
      const labelGroupKid1 = shapeGroupKid.children[1];
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
    const details0 = details.db0puu209qe;
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
}

/**
 * Tests for {@link State} v0.1 containing a line.
 *
 * @function module:tests/state~read-v01-state-line
 */
QUnit.test('Read v01 state line', function (assert) {
  testState(v01Line, '0.1', 'line', assert);
});

/**
 * Tests for {@link State} v0.1 containing a roi.
 *
 * @function module:tests/state~read-v01-state-roi
 */
QUnit.test('Read v01 state roi', function (assert) {
  testState(v01Roi, '0.1', 'roi', assert);
});

/**
 * Tests for {@link State} v0.1 containing an ellipse.
 *
 * @function module:tests/state~read-v01-state-ellipse
 */
QUnit.test('Read v01 state ellipse', function (assert) {
  testState(v01Ellipse, '0.1', 'ellipse', assert);
});

/**
 * Tests for {@link State} v0.1 containing a protractor.
 *
 * @function module:tests/state~read-v01-state-protractor
 */
QUnit.test('Read v01 state protractor', function (assert) {
  testState(v01Protractor, '0.1', 'protractor', assert);
});

/**
 * Tests for {@link State} v0.1 containing a rectangle.
 *
 * @function module:tests/state~read-v01-state-rectangle
 */
QUnit.test('Read v01 state rectangle', function (assert) {
  testState(v01Rectangle, '0.1', 'rectangle', assert);
});

/**
 * Tests for {@link State} v0.1 containing a multi slice ruler.
 *
 * @function module:tests/state~read-v01-state-line-multi-slice
 */
QUnit.test('Read v01 state line multi-slice', function (assert) {
  testState(v01LineMulti, '0.1', 'line_multi-slice', assert);
});

/**
 * Tests for {@link State} v0.2 containing an arrow.
 *
 * @function module:tests/state~read-v02-state-arrow
 */
QUnit.test('Read v02 state arrow', function (assert) {
  testState(v02Arrow, '0.2', 'arrow', assert);
});

/**
 * Tests for {@link State} v0.2 containing a ruler.
 *
 * @function module:tests/state~read-v02-state-ruler
 */
QUnit.test('Read v02 state ruler', function (assert) {
  testState(v02Ruler, '0.2', 'ruler', assert);
});

/**
 * Tests for {@link State} v0.2 containing a roi.
 *
 * @function module:tests/state~read-v02-state-roi
 */
QUnit.test('Read v02 state roi', function (assert) {
  testState(v02Roi, '0.2', 'roi', assert);
});

/**
 * Tests for {@link State} v0.2 containing a hand draw.
 *
 * @function module:tests/state~read-v02-state-hand
 */
QUnit.test('Read v02 state hand', function (assert) {
  testState(v02Hand, '0.2', 'hand', assert);
});

/**
 * Tests for {@link State} v0.2 containing an ellipse.
 *
 * @function module:tests/state~read-v02-state-ellipse
 */
QUnit.test('Read v02 state ellipse', function (assert) {
  testState(v02Ellipse, '0.2', 'ellipse', assert);
});

/**
 * Tests for {@link State} v0.2 containing a protractor.
 *
 * @function module:tests/state~read-v02-state-protractor
 */
QUnit.test('Read v02 state protractor', function (assert) {
  testState(v02Protractor, '0.2', 'protractor', assert);
});

/**
 * Tests for {@link State} v0.2 containing a rectangle.
 *
 * @function module:tests/state~read-v02-state-rectangle
 */
QUnit.test('Read v02 state rectangle', function (assert) {
  testState(v02Rectangle, '0.2', 'rectangle', assert);
});

/**
 * Tests for {@link State} v0.2 containing a multi slice ruler.
 *
 * @function module:tests/state~read-v02-state-ruler-multi-slice
 */
QUnit.test('Read v02 state ruler multi-slice', function (assert) {
  testState(v02RulerMulti, '0.2', 'ruler_multi-slice', assert);
});

/**
 * Tests for {@link State} v0.3 containing an arrow.
 *
 * @function module:tests/state~read-v03-state-arrow
 */
QUnit.test('Read v03 state arrow', function (assert) {
  testState(v03Arrow, '0.3', 'arrow', assert);
});

/**
 * Tests for {@link State} v0.3 containing a ruler.
 *
 * @function module:tests/state~read-v03-state-ruler
 */
QUnit.test('Read v03 state ruler', function (assert) {
  testState(v03Ruler, '0.3', 'ruler', assert);
});

/**
 * Tests for {@link State} v0.3 containing a roi.
 *
 * @function module:tests/state~read-v03-state-roi
 */
QUnit.test('Read v03 state roi', function (assert) {
  testState(v03Roi, '0.3', 'roi', assert);
});

/**
 * Tests for {@link State} v0.3 containing a hand draw.
 *
 * @function module:tests/state~read-v03-state-hand
 */
QUnit.test('Read v03 state hand', function (assert) {
  testState(v03Hand, '0.3', 'hand', assert);
});

/**
 * Tests for {@link State} v0.3 containing an ellipse.
 *
 * @function module:tests/state~read-v03-state-ellipse
 */
QUnit.test('Read v03 state ellipse', function (assert) {
  testState(v03Ellipse, '0.3', 'ellipse', assert);
});

/**
 * Tests for {@link State} v0.3 containing a protractor.
 *
 * @function module:tests/state~read-v03-state-protractor
 */
QUnit.test('Read v03 state protractor', function (assert) {
  testState(v03Protractor, '0.3', 'protractor', assert);
});

/**
 * Tests for {@link State} v0.3 containing a rectangle.
 *
 * @function module:tests/state~read-v03-state-rectangle
 */
QUnit.test('Read v03 state rectangle', function (assert) {
  testState(v03Rectangle, '0.3', 'rectangle', assert);
});

/**
 * Tests for {@link State} v0.3 containing a multi slice ruler.
 *
 * @function module:tests/state~read-v03-state-ruler-multi-slice
 */
QUnit.test('Read v03 state ruler multi-slice', function (assert) {
  testState(v03RulerMulti, '0.3', 'ruler_multi-slice', assert);
});

/**
 * Tests for {@link State} v0.4 containing an arrow.
 *
 * @function module:tests/state~read-v04-state-arrow
 */
QUnit.test('Read v04 state arrow', function (assert) {
  testState(v04Arrow, '0.4', 'arrow', assert);
});

/**
 * Tests for {@link State} v0.4 containing a ruler.
 *
 * @function module:tests/state~read-v04-state-ruler
 */
QUnit.test('Read v04 state ruler', function (assert) {
  testState(v04Ruler, '0.4', 'ruler', assert);
});

/**
 * Tests for {@link State} v0.4 containing a roi.
 *
 * @function module:tests/state~read-v04-state-roi
 */
QUnit.test('Read v04 state roi', function (assert) {
  testState(v04Roi, '0.4', 'roi', assert);
});

/**
 * Tests for {@link State} v0.4 containing a hand draw.
 *
 * @function module:tests/state~read-v04-state-hand
 */
QUnit.test('Read v04 state hand', function (assert) {
  testState(v04Hand, '0.4', 'hand', assert);
});

/**
 * Tests for {@link State} v0.4 containing an ellipse.
 *
 * @function module:tests/state~read-v04-state-ellipse
 */
QUnit.test('Read v04 state ellipse', function (assert) {
  testState(v04Ellipse, '0.4', 'ellipse', assert);
});

/**
 * Tests for {@link State} v0.4 containing a protractor.
 *
 * @function module:tests/state~read-v04-state-protractor
 */
QUnit.test('Read v04 state protractor', function (assert) {
  testState(v04Protractor, '0.4', 'protractor', assert);
});


/**
 * Tests for {@link State} v0.4 containing a rectangle.
 *
 * @function module:tests/state~read-v04-state-rectangle
 */
QUnit.test('Read v04 state rectangle', function (assert) {
  testState(v04Rectangle, '0.4', 'rectangle', assert);
});

/**
 * Tests for {@link State} v0.4 containing a multi slice ruler.
 *
 * @function module:tests/state~read-v04-state-ruler-multi-slice
 */
QUnit.test('Read v04 state ruler multi-slice', function (assert) {
  testState(v04RulerMulti, '0.4', 'ruler_multi-slice', assert);
});

/**
 * Tests for {@link State} v0.5 containing an arrow.
 *
 * @function module:tests/state~read-v05-state-arrow
 */
QUnit.test('Read v05 state arrow', function (assert) {
  testState(v05Arrow, '0.5', 'arrow', assert);
});

/**
 * Tests for {@link State} v0.5 containing a ruler.
 *
 * @function module:tests/state~read-v05-state-ruler
 */
QUnit.test('Read v05 state ruler', function (assert) {
  testState(v05Ruler, '0.5', 'ruler', assert);
});

/**
 * Tests for {@link State} v0.5 containing a roi.
 *
 * @function module:tests/state~read-v05-state-roi
 */
QUnit.test('Read v05 state roi', function (assert) {
  testState(v05Roi, '0.5', 'roi', assert);
});

/**
 * Tests for {@link State} v0.5 containing a hand draw.
 *
 * @function module:tests/state~read-v05-state-hand
 */
QUnit.test('Read v05 state hand', function (assert) {
  testState(v05Hand, '0.5', 'hand', assert);
});

/**
 * Tests for {@link State} v0.5 containing an ellipse.
 *
 * @function module:tests/state~read-v05-state-ellipse
 */
QUnit.test('Read v05 state ellipse', function (assert) {
  testState(v05Ellipse, '0.5', 'ellipse', assert);
});

/**
 * Tests for {@link State} v0.5 containing a protractor.
 *
 * @function module:tests/state~read-v05-state-protractor
 */
QUnit.test('Read v05 state protractor', function (assert) {
  testState(v05Protractor, '0.5', 'protractor', assert);
});


/**
 * Tests for {@link State} v0.5 containing a rectangle.
 *
 * @function module:tests/state~read-v05-state-rectangle
 */
QUnit.test('Read v05 state rectangle', function (assert) {
  testState(v05Rectangle, '0.5', 'rectangle', assert);
});

/**
 * Tests for {@link State} v0.5 containing a multi slice ruler.
 *
 * @function module:tests/state~read-v05-state-ruler-multi-slice
 */
QUnit.test('Read v05 state ruler multi-slice', function (assert) {
  testState(v05RulerMulti, '0.5', 'ruler_multi-slice', assert);
});
