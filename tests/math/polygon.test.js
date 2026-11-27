import {describe, test, assert} from 'vitest';
import {simplifyPolygon} from '../../src/math/polygon.js';

/**
 * Tests for the 'math/polygon.js' file.
 */

describe('math', () => {

  test('simplifyPolygon', () => {
    // three points or less: as is
    const triangle = [{x: 0, y: 0}, {x: 2, y: 0}, {x: 0, y: 2}];
    assert.deepEqual(simplifyPolygon(triangle, 1), triangle, 'triangle');

    // collinear points are removed
    const line = [
      {x: 0, y: 0},
      {x: 1, y: 0},
      {x: 2, y: 0},
      {x: 3, y: 0},
      {x: 3, y: 3}
    ];
    assert.deepEqual(
      simplifyPolygon(line, 0.1),
      [{x: 0, y: 0}, {x: 3, y: 0}, {x: 3, y: 3}],
      'collinear points');

    // points closer than epsilon are removed, further are kept
    const bump = [
      {x: 0, y: 0},
      {x: 2, y: 0.5},
      {x: 4, y: 0},
      {x: 6, y: 2},
      {x: 8, y: 0}
    ];
    assert.deepEqual(
      simplifyPolygon(bump, 1),
      [{x: 0, y: 0}, {x: 4, y: 0}, {x: 6, y: 2}, {x: 8, y: 0}],
      'small deviation');
    assert.deepEqual(
      simplifyPolygon(bump, 0.1), bump, 'deviation above epsilon');
  });

});
