import {describe, test, assert, vi} from 'vitest';
import {
  getFramesGeometry,
  getSortedFramesGeometry
} from '../../src/dicom/dicomGeometry.js';
import {
  getElementsFromSimpleTagValues
} from '../../src/dicom/simpleTagValues.js';
import {Point3D} from '../../src/math/point.js';
import {logger} from '../../src/utils/logger.js';
import {
  getStructureElementsList,
  singleSliceStructure,
  unsortedMultiframeMultiSliceStructure,
  unsortedMultiframeMultiVolumeStructure,
  unsortedMultiframeMultiVolumeBValueStructure
} from '../../dev/dicom/dataStructures.js';

import syntheticData from '/tests/data/synthetic-img.json';

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

  test('geometric spacing computed on sorted frame origins', () => {
    // only 2D pixel spacing: slice spacing is computed from origins
    const elements = getElementsFromSimpleTagValues({
      Rows: 4,
      Columns: 4,
      SharedFunctionalGroupsSequence: {
        value: [
          {
            PlaneOrientationSequence: {
              value: [{ImageOrientationPatient: [1, 0, 0, 0, 1, 0]}]
            },
            PixelMeasuresSequence: {
              value: [{PixelSpacing: [1, 1]}]
            }
          }
        ]
      }
    });
    const warnSpy = vi.spyOn(logger, 'warn').mockImplementation(() => {});
    const geometry = getFramesGeometry(elements, makeFrames([2, 0, 4, 1, 3]));
    warnSpy.mockRestore();
    assert.equal(geometry.getSpacing().get(2), 1, 'slice spacing');
    assert.equal(warnSpy.mock.calls.length, 0, 'no varying spacing warning');
  });

});

describe('getSortedFramesGeometry', () => {
  const config = syntheticData[0];
  const syntax = '1.2.840.10008.1.2.1';

  test('undefined without per-frame functional groups', () => {
    const elements = getStructureElementsList(
      config, syntax, singleSliceStructure)[0];
    assert.isUndefined(getSortedFramesGeometry(elements));
  });

  test('undefined with duplicate origins without volume ids', () => {
    const warnSpy = vi.spyOn(logger, 'warn').mockImplementation(() => {});
    const structure = structuredClone(unsortedMultiframeMultiSliceStructure);
    structure.genOptions.framePositionOrder = [0, 0, 1, 2, 3];
    const elements = getStructureElementsList(config, syntax, structure)[0];
    assert.isUndefined(getSortedFramesGeometry(elements));
    assert.equal(warnSpy.mock.calls.length, 1, 'duplicate origins warning');
    warnSpy.mockRestore();
  });

  test('undefined with duplicate origins and inconsistent volume ids', () => {
    const warnSpy = vi.spyOn(logger, 'warn').mockImplementation(() => {});
    const structure = structuredClone(unsortedMultiframeMultiVolumeStructure);
    // one volume has a duplicate slice
    structure.genOptions.framePositionOrder = [1, 0, 0, 0];
    const elements = getStructureElementsList(config, syntax, structure)[0];
    assert.isUndefined(getSortedFramesGeometry(elements));
    warnSpy.mockRestore();
  });

  test('multi-volume frame geometries', () => {
    for (const structure of [
      unsortedMultiframeMultiVolumeStructure,
      unsortedMultiframeMultiVolumeBValueStructure
    ]) {
      const positions = structure.genOptions.framePositionOrder;
      // volume 0 is the lowest TemporalPositionIndex or b-value
      const volumes = [1, 1, 0, 0];
      const elements = getStructureElementsList(config, syntax, structure)[0];
      const res = getSortedFramesGeometry(elements);
      assert.isDefined(res, structure.name);
      assert.equal(
        res.length, structure.numberOfFrames,
        `${structure.name} one geometry per frame`);
      for (let f = 0; f < res.length; ++f) {
        assert.deepEqual(
          res[f].getOrigins().map(origin => origin.getValues()),
          [[0, 0, positions[f]]],
          `${structure.name} frame ${f} origin`);
        assert.equal(
          res[f].getInitialTime(), volumes[f],
          `${structure.name} frame ${f} time`);
      }
    }
  });

  test('frame geometries', () => {
    const structure = unsortedMultiframeMultiSliceStructure;
    const order = structure.genOptions.framePositionOrder;
    const elements = getStructureElementsList(config, syntax, structure)[0];
    const res = getSortedFramesGeometry(elements);
    assert.isDefined(res);
    assert.equal(res.length, order.length, 'one geometry per frame');
    for (let f = 0; f < res.length; ++f) {
      assert.deepEqual(
        res[f].getOrigins().map(origin => origin.getValues()),
        [[0, 0, order[f]]], `frame ${f} origin`);
      assert.equal(res[f].getSize().get(2), 1, `frame ${f} one slice`);
      assert.equal(res[f].getSpacing().get(2), 1, `frame ${f} slice spacing`);
    }
  });

});
