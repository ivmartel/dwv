import {describe, test, assert} from 'vitest';
import {
  Matrix33,
  getIdentityMat33,
} from '../../src/math/matrix.js';
import {
  getMatrixFromName,
  getOrientationStringLPS,
  Orientation,
  getOrientationFromCosines,
  getCosinesFromOrientation,
  getOrientationName,
  getViewOrientation,
  getTargetOrientation,
  getLegacyTargetOrientation,
  getDisplayOrientation,
  getViewFlips
} from '../../src/math/orientation.js';

/**
 * Tests for the 'math/point.js' file.
 */

describe('math', () => {

  /**
   * Tests for {@link Matrix33} factories.
   *
   * @function module:tests/math~orientationMatrixFactories
   */
  test('orientation matrix factories', () => {
    const theo00 = new Matrix33([
      1, 0, 0, 0, 1, 0, 0, 0, 1
    ]);

    // test #01
    const m01 = getMatrixFromName(Orientation.Axial);
    assert.ok(m01.equals(theo00), 'Matrix33 factory axial');

    // test #02
    const m02 = getMatrixFromName(Orientation.Coronal);
    const theo02 = new Matrix33([
      1, 0, 0, 0, 0, 1, 0, -1, 0
    ]);
    assert.ok(m02.equals(theo02), 'Matrix33 factory coronal');

    // test #03
    const m03 = getMatrixFromName(Orientation.Sagittal);
    const theo03 = new Matrix33([
      0, 0, -1, 1, 0, 0, 0, -1, 0
    ]);
    assert.ok(m03.equals(theo03), 'Matrix33 factory sagittal');

    // test #04
    const m04 = getMatrixFromName('godo');
    assert.equal(m04, null, 'Matrix33 factory unknown name');
  });

  /**
   * Tests for {@link Matrix33} getOrientationFromCosines.
   *
   * @function module:tests/math~getorientationfromcosines
   */
  test('getOrientationFromCosines', () => {
    // axial
    const m00 = getIdentityMat33();
    const cos00 = [1, 0, 0, 0, 1, 0];
    assert.ok(getOrientationFromCosines(cos00).equals(m00), 'ID matrix');
    assert.deepEqual(getCosinesFromOrientation(m00), cos00,
      'ID matrix cosines');

    // coronal
    const m10 = getMatrixFromName(Orientation.Coronal);
    const cos10 = [1, 0, 0, 0, 0, -1];
    assert.ok(getOrientationFromCosines(cos10).equals(m10), 'coronal matrix');
    assert.deepEqual(getCosinesFromOrientation(m10), cos10,
      'coronal matrix cosines');

    // sagittal
    const m20 = getMatrixFromName(Orientation.Sagittal);
    const cos20 = [0, 1, 0, 0, 0, -1];
    assert.ok(getOrientationFromCosines(cos20).equals(m20), 'sagittal matrix');
    assert.deepEqual(getCosinesFromOrientation(m20), cos20,
      'sagittal matrix cosines');
  });

  /**
   * Tests for {@link Matrix33} getOrientationStringLPS.
   *
   * @function module:tests/math~getorientationstringlps
   */
  test('getOrientationStringLPS', () => {
    // axial
    const m00 = getIdentityMat33(); // [1, 0, 0, 0, 1, 0]
    const code00 = getOrientationStringLPS(m00);
    assert.equal(code00, 'LPS', 'LPS matrix');
    const m01 = getOrientationFromCosines([1, 0, 0, 0, -1, 0]);
    const code01 = getOrientationStringLPS(m01);
    assert.equal(code01, 'LAI', 'LAI matrix');
    const m02 = getOrientationFromCosines([-1, 0, 0, 0, -1, 0]);
    const code02 = getOrientationStringLPS(m02);
    assert.equal(code02, 'RAS', 'RAS matrix');
    const m03 = getOrientationFromCosines([-1, 0, 0, 0, 1, 0]);
    const code03 = getOrientationStringLPS(m03);
    assert.equal(code03, 'RPI', 'RPI matrix');

    // coronal
    const m10 = getMatrixFromName(Orientation.Coronal); // [1, 0, 0, 0, 0, -1]
    const code10 = getOrientationStringLPS(m10);
    assert.equal(code10, 'LIP', 'LIP matrix');
    const m11 = getOrientationFromCosines([1, 0, 0, 0, 0, 1]);
    const code11 = getOrientationStringLPS(m11);
    assert.equal(code11, 'LSA', 'LSA matrix');
    const m12 = getOrientationFromCosines([-1, 0, 0, 0, 0, -1]);
    const code12 = getOrientationStringLPS(m12);
    assert.equal(code12, 'RIA', 'RIA matrix');
    const m13 = getOrientationFromCosines([-1, 0, 0, 0, 0, 1]);
    const code13 = getOrientationStringLPS(m13);
    assert.equal(code13, 'RSP', 'RSP matrix');

    // sagittal
    const m20 = getMatrixFromName(Orientation.Sagittal); // [0, 1, 0, 0, 0, -1]
    const code20 = getOrientationStringLPS(m20);
    assert.equal(code20, 'PIR', 'PIR matrix');
    const m21 = getOrientationFromCosines([0, 1, 0, 0, 0, 1]);
    const code21 = getOrientationStringLPS(m21);
    assert.equal(code21, 'PSL', 'PSL matrix');
    const m22 = getOrientationFromCosines([0, -1, 0, 0, 0, -1]);
    const code22 = getOrientationStringLPS(m22);
    assert.equal(code22, 'AIL', 'AIL matrix');
    const m23 = getOrientationFromCosines([0, -1, 0, 0, 0, 1]);
    const code23 = getOrientationStringLPS(m23);
    assert.equal(code23, 'ASR', 'ASR matrix');
  });

  /**
   * Tests for {@link getOrientationName}.
   *
   * @function module:tests/math~getorientationname
   */
  test('getOrientationName', () => {
    const test00 = [1, 0, 0, 0, 1, 0];
    assert.equal(getOrientationName(test00), 'axial', 'test axial #0');
    const test01 = [0.99, 0.02, 0.05, -0.02, 0.99, 1.4e-08];
    assert.equal(getOrientationName(test01), 'axial', 'test axial #1');

    const test10 = [1, 0, 0, 0, 0, -1];
    assert.equal(getOrientationName(test10), 'coronal', 'test coronal #0');
    const test11 = [0.7, 0.3, 0, 0, 0.4, -0.6];
    assert.equal(getOrientationName(test11), 'coronal', 'test coronal #1');

    const test20 = [0, 1, 0, 0, 0, -1];
    assert.equal(getOrientationName(test20), 'sagittal', 'test sagittal #0');
    const test21 = [-0.01, 0.98, -0.20, 0.05, -0.19, -0.98];
    assert.equal(getOrientationName(test21), 'sagittal', 'test axial #1');
  });

  /**
   * Get the image orientation cosines of an LPS code.
   *
   * @param {string} code The LPS code.
   * @returns {number[]} The cosines (6 values).
   */
  function getCosinesFromCode(code) {
    const directions = {
      L: [1, 0, 0],
      R: [-1, 0, 0],
      P: [0, 1, 0],
      A: [0, -1, 0],
      S: [0, 0, 1],
      I: [0, 0, -1]
    };
    return directions[code[0]].concat(directions[code[1]]);
  }

  /**
   * All the axis aligned orientation codes.
   */
  /* eslint-disable @stylistic/js/array-element-newline */
  const allCodes = [
    'LPS', 'LAI', 'RPI', 'RAS', 'ALS', 'ARI', 'PLI', 'PRS',
    'LSA', 'LIP', 'RSP', 'RIA', 'ILA', 'IRP', 'SLP', 'SRA',
    'PSL', 'PIR', 'ASR', 'AIL', 'IAR', 'IPL', 'SAL', 'SPR'
  ];
  /* eslint-enable @stylistic/js/array-element-newline */

  /**
   * View target orientation names (undefined for none).
   */
  const viewNames = [
    undefined,
    Orientation.Axial,
    Orientation.Coronal,
    Orientation.Sagittal
  ];

  /**
   * Get the flips that reach the canvas: the target oriented scale
   *   flips (x and y) and the offset flips.
   *
   * @param {object} flips The scale and offset flips.
   * @param {Matrix33} targetOrientation The target orientation.
   * @returns {object} The canvas flips as {scale: [x, y],
   *   offset: [x, y]}.
   */
  function getCanvasFlips(flips, targetOrientation) {
    const flipScale = [
      flips.scale.x ? -1 : 1,
      flips.scale.y ? -1 : 1,
      flips.scale.z ? -1 : 1
    ];
    const scale = targetOrientation.getInverse().multiplyArray3D(flipScale);
    return {
      scale: [scale[0], scale[1]],
      offset: [flips.offset.x, flips.offset.y]
    };
  }

  /**
   * Tests for {@link getOrientationStringLPS}: all the 24 axis
   *   aligned codes.
   *
   * @function module:tests/math~getorientationstringlpsall
   */
  test('getOrientationStringLPS all codes', () => {
    for (const code of allCodes) {
      const orientation =
        getOrientationFromCosines(getCosinesFromCode(code));
      assert.equal(getOrientationStringLPS(orientation), code, code);
    }
  });

  /**
   * Tests for {@link getDisplayOrientation}.
   *
   * @function module:tests/math~getdisplayorientation
   */
  test('getDisplayOrientation', () => {
    const axial = getOrientationFromCosines(getCosinesFromCode('LAI'));
    const coronal = getOrientationFromCosines(getCosinesFromCode('ILA'));
    const sagittal = getOrientationFromCosines(getCosinesFromCode('SPR'));
    // target name
    assert.ok(getDisplayOrientation(axial, Orientation.Sagittal).equals(
      getMatrixFromName(Orientation.Sagittal)), 'named target');
    // undefined: acquisition plane
    assert.ok(getDisplayOrientation(axial).equals(
      getMatrixFromName(Orientation.Axial)), 'undefined axial');
    assert.ok(getDisplayOrientation(coronal).equals(
      getMatrixFromName(Orientation.Coronal)), 'undefined coronal');
    assert.ok(getDisplayOrientation(sagittal, 'unknown').equals(
      getMatrixFromName(Orientation.Sagittal)), 'unknown sagittal');
  });

  /**
   * Tests for {@link getViewFlips}: same canvas flips as the
   *   previous hard coded flip flags table.
   *
   * @function module:tests/math~getviewflipstable
   */
  test('getViewFlips previous table', () => {
    // previous flip flags table: offset x, y and scale x, y, z flags
    //   per view: undefined (u), axial (a), coronal (c), sagittal (s);
    //   the scale flags are in the previous target space, the one
    //   with abs for coronal acquisitions (see getLegacyTargetOrientation)
    const table = {
      LPS: {u: '', a: '', c: 'oy sz', s: 'oy sz'},
      LAI: {u: 'oy', a: 'oy', c: 'sz', s: 'ox sz'},
      RPI: {u: 'ox', a: 'ox', c: 'ox sz', s: 'sz'},
      RAS: {u: 'ox oy', a: 'ox oy', c: 'ox oy sz', s: 'ox oy sz'},
      LSA: {u: 'oy sz', a: 'oy sy', c: 'oy sz', s: 'ox oy sy sz'},
      LIP: {u: '', a: '', c: '', s: ''},
      RSP: {u: 'ox oy sx sz', a: 'ox sx', c: 'ox oy sx sz', s: 'oy sz'},
      RIA: {u: 'ox sx', a: 'ox oy sx sy', c: 'ox sx', s: 'ox sy'},
      PSL: {u: 'oy sz', a: 'sz', c: 'oy sz', s: 'oy sz'},
      PIR: {u: 'sz', a: 'ox sz', c: 'ox sz', s: 'sz'},
      ASR: {u: 'ox oy sz', a: 'ox oy', c: 'ox oy sz', s: 'ox oy sz'},
      AIL: {u: 'ox sz', a: 'oy', c: 'sz', s: 'ox sz'}
    };
    const viewKeys = ['u', 'a', 'c', 's'];
    for (const [code, flagsPerView] of Object.entries(table)) {
      const imageOrientation =
        getOrientationFromCosines(getCosinesFromCode(code));
      for (let v = 0; v < viewNames.length; ++v) {
        const flags = flagsPerView[viewKeys[v]].split(' ');
        const expectedFlips = {
          scale: {
            x: flags.includes('sx'),
            y: flags.includes('sy'),
            z: flags.includes('sz')
          },
          offset: {x: flags.includes('ox'), y: flags.includes('oy')}
        };
        const displayOrientation =
          getDisplayOrientation(imageOrientation, viewNames[v]);
        const viewOrientation =
          getViewOrientation(imageOrientation, displayOrientation);
        // previous view orientation: identity if undefined
        const previousViewOrientation = getViewOrientation(
          imageOrientation, getMatrixFromName(viewNames[v]));
        assert.ok(viewOrientation.equals(previousViewOrientation),
          `${code} ${viewNames[v]} view orientation`);
        const targetOrientation =
          getTargetOrientation(imageOrientation, viewOrientation);
        const flips = getViewFlips(
          imageOrientation, displayOrientation, targetOrientation);
        const previousTargetOrientation =
          getLegacyTargetOrientation(imageOrientation, targetOrientation);
        assert.deepEqual(
          getCanvasFlips(flips, targetOrientation),
          getCanvasFlips(expectedFlips, previousTargetOrientation),
          `${code} ${viewNames[v]} flips`);
      }
    }
  });

  /**
   * Tests for {@link getViewFlips}: the displayed axes are the
   *   display orientation ones for all codes and views.
   *
   * @function module:tests/math~getviewflipsall
   */
  test('getViewFlips all codes', () => {
    for (const code of allCodes) {
      const imageOrientation =
        getOrientationFromCosines(getCosinesFromCode(code));
      for (const viewName of viewNames) {
        const displayOrientation =
          getDisplayOrientation(imageOrientation, viewName);
        const viewOrientation =
          getViewOrientation(imageOrientation, displayOrientation);
        const targetOrientation =
          getTargetOrientation(imageOrientation, viewOrientation);
        const flips = getViewFlips(
          imageOrientation, displayOrientation, targetOrientation);
        const canvasFlips = getCanvasFlips(flips, targetOrientation);
        // view axes in real space
        const signedTarget =
          imageOrientation.asOneAndZeros().multiply(viewOrientation);
        for (let j = 0; j < 2; ++j) {
          // canvas flip and its offset go together
          assert.equal(canvasFlips.scale[j] < 0, canvasFlips.offset[j],
            `${code} ${viewName} offset ${j}`);
          // displayed axis = view axis times canvas flip
          for (let i = 0; i < 3; ++i) {
            assert.equal(
              signedTarget.get(i, j) * canvasFlips.scale[j],
              displayOrientation.get(i, j),
              `${code} ${viewName} axis ${j}`);
          }
        }
      }
    }
  });

});