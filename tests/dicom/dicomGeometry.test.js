import {describe, test, assert} from 'vitest';
import {getFramesGeometry} from '../../src/dicom/dicomGeometry.js';
import {
  getElementsFromSimpleTagValues
} from '../../src/dicom/simpleTagValues.js';
import {Point3D} from '../../src/math/point.js';

/**
 * Tests for the 'dicom/dicomGeometry.js' file.
 */

describe('getFramesGeometry', () => {

  /**
   * Build minimal data elements for a multi-frame file with a shared
   * plane orientation/spacing (no per-frame orientation/spacing needed).
   *
   * @returns {Record<string, object>} The data elements.
   */
  function makeSharedGroupElements() {
    return getElementsFromSimpleTagValues({
      Rows: 4,
      Columns: 4,
      SharedFunctionalGroupsSequence: {
        value: [
          {
            PlaneOrientationSequence: {
              value: [{ImageOrientationPatient: [1, 0, 0, 0, 1, 0]}]
            },
            PixelMeasuresSequence: {
              value: [{PixelSpacing: [1, 1], SpacingBetweenSlices: 1}]
            }
          }
        ]
      }
    });
  }

  /**
   * @param {number[]} zValues Z coordinates, in the order frames should
   *   be built (not necessarily ascending).
   * @returns {object[]} Minimal per-frame functional group objects.
   */
  function makeFrames(zValues) {
    return zValues.map(z => ({imagePosPat: [0, 0, z]}));
  }

  /**
   * @param {number} count Number of reference slices, at z = 0..count-1.
   * @returns {Point3D[]} The reference origins.
   */
  function makeRefOrigins(count) {
    const origins = [];
    for (let z = 0; z < count; ++z) {
      origins.push(new Point3D(0, 0, z));
    }
    return origins;
  }

  test(
    'gap-fills correctly when frames are in ascending order (sanity check)',
    () => {
      const elements = makeSharedGroupElements();
      // two frames present (z=0 and z=3), reference has 4 slices (0..3)
      const perFrameFuncGroups = makeFrames([0, 3]);
      const refOrigins = makeRefOrigins(4);

      const geometry = getFramesGeometry(
        elements, perFrameFuncGroups, true, refOrigins);

      const origins = geometry.getOrigins();
      assert.equal(origins.length, 4, 'gap (z=1,2) filled from refOrigins');
      assert.deepEqual(
        origins.map(o => o.getZ()), [0, 1, 2, 3], 'ascending z order'
      );
    }
  );

  test(
    'gap-fills correctly when frames are in descending order (e.g. ' +
    'MaskFactory#toDicom\'s frame write order)',
    () => {
      const elements = makeSharedGroupElements();
      // same two frames as above, but written z=3 first, matching
      // toDicom()'s "revert slice order" frame ordering
      const perFrameFuncGroups = makeFrames([3, 0]);
      const refOrigins = makeRefOrigins(4);

      const geometry = getFramesGeometry(
        elements, perFrameFuncGroups, true, refOrigins);

      const origins = geometry.getOrigins();
      assert.equal(
        origins.length, 4,
        'gap (z=1,2) still filled despite descending frame order'
      );
      assert.deepEqual(
        origins.map(o => o.getZ()), [0, 1, 2, 3],
        'result is in ascending z order regardless of input order'
      );
      assert.equal(
        geometry.getSpacing().get(2), 1,
        'spacing computed from the 4 correctly-gap-filled origins, not ' +
        'from the 2 raw (3 apart) frame origins'
      );
    }
  );

  test('handles more than two out-of-order frames with multiple gaps',
    () => {
      const elements = makeSharedGroupElements();
      // frames at z=4, z=0, z=2 (scrambled), reference has 5 slices
      const perFrameFuncGroups = makeFrames([4, 0, 2]);
      const refOrigins = makeRefOrigins(5);

      const geometry = getFramesGeometry(
        elements, perFrameFuncGroups, true, refOrigins);

      const origins = geometry.getOrigins();
      assert.equal(origins.length, 5, 'all slices 0..4 present');
      assert.deepEqual(
        origins.map(o => o.getZ()), [0, 1, 2, 3, 4], 'ascending z order'
      );
    }
  );

});
