import {describe, test, assert} from 'vitest';
import {
  bufferToPolygons,
  findHolePolygons,
  fillPolygons
} from '../../src/image/maskPolygons.js';

/**
 * Tests for the 'image/maskPolygons.js' file.
 */

/**
 * Get a mask buffer from rows of characters.
 *
 * @param {string[]} rows The rows, one character (0-9) per pixel.
 * @returns {Uint8Array} The buffer.
 */
function rowsToBuffer(rows) {
  return new Uint8Array(rows.join('').split('').map(Number));
}

/**
 * Get rows of characters from a mask buffer.
 *
 * @param {Uint8Array} buffer The buffer.
 * @param {number} width The row width.
 * @returns {string[]} The rows.
 */
function bufferToRows(buffer, width) {
  const rows = [];
  for (let i = 0; i < buffer.length; i += width) {
    rows.push(Array.from(buffer.slice(i, i + width)).join(''));
  }
  return rows;
}

describe('image', () => {

  test('bufferToPolygons: pixel edges', () => {
    const buffer = rowsToBuffer([
      '0000',
      '0110',
      '0100',
      '0000'
    ]);
    const polygons = bufferToPolygons(buffer, 0, 4, 4, 1);
    assert.equal(polygons.length, 1, 'one polygon');
    // clockwise on screen, corners only
    assert.deepEqual(polygons[0], [
      {x: 0.5, y: 0.5},
      {x: 2.5, y: 0.5},
      {x: 2.5, y: 1.5},
      {x: 1.5, y: 1.5},
      {x: 1.5, y: 2.5},
      {x: 0.5, y: 2.5}
    ], 'L shape');
  });

  test('bufferToPolygons: connectivity, value and offset', () => {
    // second slice of the buffer
    const buffer = rowsToBuffer([
      '111',
      '111',
      '111',
      '100',
      '010',
      '002'
    ]);
    // corner contact: same (8-connected) region
    const polygons = bufferToPolygons(buffer, 9, 3, 3, 1);
    assert.equal(polygons.length, 1, 'one polygon');
    assert.equal(polygons[0].length, 8, 'two squares touching at a corner');
    // other value
    const polygons2 = bufferToPolygons(buffer, 9, 3, 3, 2);
    assert.deepEqual(polygons2, [[
      {x: 1.5, y: 1.5},
      {x: 2.5, y: 1.5},
      {x: 2.5, y: 2.5},
      {x: 1.5, y: 2.5}
    ]], 'single pixel');
    // missing value
    assert.deepEqual(bufferToPolygons(buffer, 9, 3, 3, 3), [], 'no region');
  });

  test('findHolePolygons', () => {
    // no hole
    const noHole = rowsToBuffer([
      '000',
      '010',
      '000'
    ]);
    assert.deepEqual(findHolePolygons(noHole, 0, 3, 3, 1), [], 'no hole');

    // ring
    const ring = rowsToBuffer([
      '11111',
      '10001',
      '10001',
      '11111'
    ]);
    assert.deepEqual(findHolePolygons(ring, 0, 5, 4, 1), [[
      {x: 0.5, y: 0.5},
      {x: 3.5, y: 0.5},
      {x: 3.5, y: 2.5},
      {x: 0.5, y: 2.5}
    ]], 'ring hole');

    // ring with a corner gap: the background is 4-connected,
    //   the corner gap does not open the hole
    const gap = rowsToBuffer([
      '00000',
      '01100',
      '01010',
      '00110',
      '00000'
    ]);
    assert.equal(
      findHolePolygons(gap, 0, 5, 5, 1).length, 1, 'corner gap hole');

    // holes touching at a corner are separate (4-connected) holes
    const holes = rowsToBuffer([
      '11111',
      '11011',
      '10101',
      '11011',
      '11111'
    ]);
    assert.equal(
      findHolePolygons(holes, 0, 5, 5, 1).length, 4, 'four holes');
  });

  test('fillPolygons', () => {
    // pixels are filled if their centre is in the polygon
    const square = [
      {x: 0.5, y: 0.5},
      {x: 2.5, y: 0.5},
      {x: 2.5, y: 2.5},
      {x: 0.5, y: 2.5}
    ];
    const buffer = new Uint8Array(32);
    fillPolygons(buffer, 16, 4, 4, [square], 3);
    assert.deepEqual(bufferToRows(buffer.slice(16), 4), [
      '0000',
      '0330',
      '0330',
      '0000'
    ], 'square in second slice');
    assert.ok(buffer.slice(0, 16).every(v => v === 0), 'first slice empty');

    // polygons are combined with the even-odd rule
    const outer = [
      {x: -0.5, y: -0.5},
      {x: 3.5, y: -0.5},
      {x: 3.5, y: 3.5},
      {x: -0.5, y: 3.5}
    ];
    const buffer2 = new Uint8Array(16);
    fillPolygons(buffer2, 0, 4, 4, [outer, square], 1);
    assert.deepEqual(bufferToRows(buffer2, 4), [
      '1111',
      '1001',
      '1001',
      '1111'
    ], 'square hole');
  });

  test('polygons round-trip', () => {
    const rows = [
      '0000000',
      '0111110',
      '0110110',
      '0101010',
      '0110110',
      '0111110',
      '0000001'
    ];
    const buffer = rowsToBuffer(rows);
    const polygons = bufferToPolygons(buffer, 0, 7, 7, 1).concat(
      findHolePolygons(buffer, 0, 7, 7, 1));
    const result = new Uint8Array(49);
    fillPolygons(result, 0, 7, 7, polygons, 1);
    assert.deepEqual(bufferToRows(result, 7), rows, 'same mask');
  });

});
