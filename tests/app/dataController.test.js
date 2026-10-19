import {describe, test, assert, vi} from 'vitest';
import {
  DicomData,
  DicomSliceDataList,
  DataController
} from '../../src/app/dataController.js';
import {Point3D} from '../../src/math/point.js';
import {Index} from '../../src/math/index.js';
import {Image} from '../../src/image/image.js';
import {Size} from '../../src/image/size.js';
import {Spacing} from '../../src/image/spacing.js';
import {Geometry} from '../../src/image/geometry.js';
import {DataElement} from '../../src/dicom/dataElement.js';
import {custom} from '../../src/app/custom.js';
import {getStructureElementsList} from '../../dev/dicom/dataStructures.js';

import syntheticData from '/tests/data/synthetic-img.json';

/**
 * Tests for the 'app/dataController.js' file.
 */
/** @module tests/app */

/**
 * Related DICOM tag keys.
 */
const TagKeys = {
  SOPClassUID: '00080016',
  AcquisitionTime: '00080032',
  DiffusionBValue: '00189087',
  TemporalPositionIdentifier: '00200100'
};

/**
 * MR image storage SOP class UID.
 */
const MRSOPClassUID = '1.2.840.10008.5.1.4.1.1.4';

/**
 * Create a data element with a given VR and value.
 *
 * @param {string} vr The value representation.
 * @param {Array} value The element value.
 * @returns {DataElement} The data element.
 */
function makeDataElement(vr, value) {
  const de = new DataElement(vr);
  de.value = value;
  return de;
}

/**
 * Create a single slice DicomData at a given z origin with the
 * given meta tags.
 *
 * @param {number} z The slice z origin.
 * @param {string} uid The slice image uid.
 * @param {Record<string, DataElement>} meta The slice meta data.
 * @returns {DicomData} The slice data.
 */
function makeSliceData(z, uid, meta) {
  const size = new Size([2, 2, 1]);
  const spacing = new Spacing([1, 1, 1]);
  const origin = new Point3D(0, 0, z);
  const geometry = new Geometry([origin], size, spacing);
  const buffer = new Int16Array(size.getTotalSize());
  const image = new Image(geometry, buffer, [uid]);
  image.setMeta({sliceCapacity: 4});

  const data = new DicomData({
    ...meta,
    imageUid: makeDataElement('UI', [uid])
  });
  data.image = image;
  return data;
}

/**
 * Create a 2 origins x 2 volumes slice list whose volumes are
 * separated by TemporalPositionIdentifier (time series).
 *
 * @returns {DicomSliceDataList} The slice list.
 */
function makeTimeSeriesList() {
  const list = new DicomSliceDataList();
  let uid = 0;
  for (const z of [0, 1]) {
    for (const tpi of [1, 2]) {
      list.add(makeSliceData(z, String(uid++), {
        [TagKeys.TemporalPositionIdentifier]:
          makeDataElement('IS', [String(tpi)])
      }));
    }
  }
  return list;
}

/**
 * Create multi-frame files of 2 frames at the same 2 positions, one
 * volume per file.
 *
 * @param {number[]} temporalPositions The TemporalPositionIndex of each
 *   file (same for its frames).
 * @param {number[]} bValues The b-value of each file (same for its
 *   frames).
 * @returns {Array<Record<string, DataElement>>} The files elements.
 */
function makeOneVolumeFiles(temporalPositions, bValues) {
  return temporalPositions.map((temporalPosition, index) => {
    const config = structuredClone(syntheticData[0]);
    config.tags.SOPInstanceUID += `.${index}`;
    const elements = getStructureElementsList(config, '1.2.840.10008.1.2.1', {
      numberOfFrames: 2,
      genOptions: {
        frames3D: true,
        framePositionOrder: [0, 1],
        frameTemporalPositions: [temporalPosition, temporalPosition],
        frameBValues: [bValues[index], bValues[index]]
      }
    })[0];
    // distinct instance numbers (meta merge id)
    elements['00200013'].value = [String(index + 1)];
    return elements;
  });
}

/**
 * Get the diffusion b-value of a generated multi-frame file (same for
 * all its frames) from its first per frame functional group.
 *
 * @param {Record<string, DataElement>} elements The file DICOM tags.
 * @returns {number|undefined} The b-value.
 */
function getFrameBValue(elements) {
  const group = elements['52009230']?.value?.[0];
  const value =
    group?.['00189117']?.value?.[0]?.['00189087']?.value?.[0];
  return typeof value !== 'undefined' ? Number(value) : undefined;
}

/**
 * Send the frames of files to a data controller as DicomBufferToData
 * does.
 *
 * @param {DataController} dc The data controller.
 * @param {string} dataId The data id.
 * @param {Array<Record<string, DataElement>>} filesElements The files.
 * @param {number} numberOfFrames The number of frames per file.
 */
function sendFrames(dc, dataId, filesElements, numberOfFrames) {
  for (const elements of filesElements) {
    const buffer = elements['7FE00010'].value;
    const frameSize = buffer.length / numberOfFrames;
    for (let f = 0; f < numberOfFrames; ++f) {
      const data = new DicomData(elements);
      data.buffer = buffer.subarray(f * frameSize, (f + 1) * frameSize);
      data.numberOfItems = filesElements.length;
      data.frameNumber = f;
      if (typeof dc.get(dataId) === 'undefined') {
        dc.add(dataId, data);
      } else {
        dc.update(dataId, data);
      }
    }
  }
}

describe('app', () => {

  /**
   * Tests for {@link DataController}.
   *
   * @function module:tests/app~datacontrollerClass
   */
  test('DataController class', () => {
    const dc0 = new DataController();

    // ids before add
    assert.deepEqual(dc0.getDataIds(), [], 'dataIds before add');

    // test image
    const size0 = 4;
    const imgSize0 = new Size([size0, size0, 1]);
    const imgSpacing0 = new Spacing([1, 1, 1]);
    const imgOrigin0 = new Point3D(0, 0, 0);
    const imgGeometry0 = new Geometry([imgOrigin0], imgSize0, imgSpacing0);
    const buffer0 = [];
    for (let i = 0; i < size0 * size0; ++i) {
      buffer0[i] = i;
    }
    const image0 = new Image(imgGeometry0, buffer0);

    // add image
    const dataId0 = 'img0';
    const dicomData0 = new DicomData({});
    dicomData0.image = image0;
    dc0.add(dataId0, dicomData0);
    assert.deepEqual(dc0.getDataIds(), [dataId0], 'dataIds after add');

    // get image
    const dc0Data0 = dc0.get(dataId0);
    assert.ok(dc0Data0.image.getGeometry().equals(imgGeometry0),
      'get image has good geometry');

    // add again should fail
    const added = dc0.add(dataId0, dicomData0);
    assert.equal(added, false, 'add already existing.');

    // set image
    let receivedImageSet = false;
    dc0.addEventListener('dataimageset', function () {
      receivedImageSet = true;
    });
    dc0.setImage(dataId0, image0);
    assert.ok(receivedImageSet, 'received imageset event');

    // reset
    dc0.reset();
    assert.deepEqual(dc0.getDataIds(), [], 'dataIds after reset');
  });

  /**
   * Tests for {@link DataController} with multi-frame multi-volume
   * files.
   *
   * @function module:tests/app~datacontrollerMultiFrameMultiVolume
   */
  test('DataController builds multi-frame files with shared origins', () => {
    // 3 files, each one volume of 2 frames at the same positions with
    // a constant TemporalPositionIndex (so the pre-load time is the same
    // for all files) and one b-value per file (the post-load volume id)
    const bValues = [800, 0, 50];
    const numberOfFrames = 2;
    const filesElements = bValues.map((bValue, index) => {
      const config = structuredClone(syntheticData[0]);
      config.tags.SOPInstanceUID += `.${index}`;
      config.tags.MediaStorageSOPInstanceUID =
        config.tags.SOPInstanceUID;
      const elements = getStructureElementsList(config, '1.2.840.10008.1.2.1', {
        numberOfFrames,
        genOptions: {
          frames3D: true,
          framePositionOrder: [0, 1],
          frameTemporalPositions: [1, 1],
          frameBValues: [bValue, bValue]
        }
      })[0];
      // distinct instance numbers (meta merge id)
      elements['00200013'].value = [String(index + 1)];
      return elements;
    });

    // send frames as DicomBufferToData does
    const dc0 = new DataController();
    const dataId = '0';
    for (const elements of filesElements) {
      const buffer = elements['7FE00010'].value;
      const frameSize = buffer.length / numberOfFrames;
      for (let f = 0; f < numberOfFrames; ++f) {
        const data = new DicomData(elements);
        data.buffer = buffer.subarray(f * frameSize, (f + 1) * frameSize);
        data.numberOfItems = filesElements.length;
        data.frameNumber = f;
        if (typeof dc0.get(dataId) === 'undefined') {
          dc0.add(dataId, data);
        } else {
          dc0.update(dataId, data);
        }
      }
    }
    assert.ok(dc0.get(dataId).hasDuplicateOrigin(), 'has duplicate origin');

    const res0 = dc0.markDataAsComplete(dataId);
    assert.ok(res0.imageHasChanged, 'image has changed');

    const image = dc0.get(dataId).image;
    const geometry = image.getGeometry();
    const size = geometry.getSize();
    assert.equal(size.get(2), numberOfFrames, 'number of slices');
    assert.equal(size.get(3), bValues.length, 'number of volumes');
    // volumes in b-value order: first one is the b=0 file
    const firstUid = filesElements[1]['00080018'].value[0];
    assert.equal(image.getImageUid(), firstUid, 'first volume is b=0');
  });

  /**
   * Tests for {@link DataController} with multi-frame files that
   * each contain multiple volumes.
   *
   * @function module:tests/app~datacontrollerMultiFrameMultiVolumePerFile
   */
  test('DataController builds multi-frame files with multiple volumes',
    () => {
      // 2 files, each one with 2 volumes of 2 frames at the same
      // positions: the first item of 2 volumes comes from the same
      // file, the meta merge has to use the frame b-value
      const filesBValues = [[0, 0, 800, 800], [50, 50, 1000, 1000]];
      const numberOfFrames = 4;
      const filesElements = filesBValues.map((bValues, index) => {
        const config = structuredClone(syntheticData[0]);
        config.tags.SOPInstanceUID += `.${index}`;
        config.tags.MediaStorageSOPInstanceUID =
          config.tags.SOPInstanceUID;
        const elements = getStructureElementsList(
          config, '1.2.840.10008.1.2.1', {
            numberOfFrames,
            genOptions: {
              frames3D: true,
              framePositionOrder: [0, 1, 0, 1],
              frameBValues: bValues
            }
          })[0];
        // distinct instance numbers (meta merge id)
        elements['00200013'].value = [String(index + 1)];
        return elements;
      });

      // send frames as DicomBufferToData does
      const dc0 = new DataController();
      const dataId = '0';
      for (const elements of filesElements) {
        const buffer = elements['7FE00010'].value;
        const frameSize = buffer.length / numberOfFrames;
        for (let f = 0; f < numberOfFrames; ++f) {
          const data = new DicomData(elements);
          data.buffer = buffer.subarray(f * frameSize, (f + 1) * frameSize);
          data.numberOfItems = filesElements.length;
          data.frameNumber = f;
          if (typeof dc0.get(dataId) === 'undefined') {
            dc0.add(dataId, data);
          } else {
            dc0.update(dataId, data);
          }
        }
      }
      assert.ok(dc0.get(dataId).hasDuplicateOrigin(), 'has duplicate origin');

      const res0 = dc0.markDataAsComplete(dataId);
      assert.ok(res0.imageHasChanged, 'image has changed');

      const size = dc0.get(dataId).image.getGeometry().getSize();
      assert.equal(size.get(2), 2, 'number of slices');
      assert.equal(size.get(3), 4, 'number of volumes');
    });

  /**
   * Tests for {@link DicomSliceDataList#buildData}.
   *
   * @function module:tests/app~dicomSliceDataListBuildData
   */
  test('DicomSliceDataList buildData guesses volume id tag', () => {
    // 2 origins (z=0, z=1) x 2 volumes (TemporalPositionIdentifier 1/2).
    // AcquisitionTime is constant across all slices so it cannot be
    // used to discriminate volumes: the guess must skip it and use
    // TemporalPositionIdentifier instead.
    const list0 = new DicomSliceDataList();
    const zs = [0, 1];
    const tpis = [1, 2];
    let uid = 0;
    for (const z of zs) {
      for (const tpi of tpis) {
        list0.add(makeSliceData(z, String(uid++), {
          [TagKeys.AcquisitionTime]: makeDataElement('TM', ['080000']),
          [TagKeys.TemporalPositionIdentifier]:
            makeDataElement('IS', [String(tpi)])
        }));
      }
    }

    const res0 = list0.buildData();
    assert.equal(
      res0.image.getGeometry().getSize().get(2), 2, 'volume0 slice count');
    assert.deepEqual(
      res0.image.getGeometry().getOrigins(),
      [new Point3D(0, 0, 0), new Point3D(0, 0, 1)],
      'volume0 origins');
  });

  test('DicomSliceDataList buildData merges meta with correct ids', () => {
    // each volume's own TemporalPositionIdentifier value must end up
    // keyed under its own id in the merged meta, including the first
    // volume (regression test for the first group getting tagged with
    // the second volume's id instead of its own).
    const list0 = new DicomSliceDataList();
    const zs = [0, 1];
    const tpis = [1, 2];
    let uid = 0;
    for (const z of zs) {
      for (const tpi of tpis) {
        list0.add(makeSliceData(z, String(uid++), {
          [TagKeys.TemporalPositionIdentifier]:
            makeDataElement('IS', [String(tpi)])
        }));
      }
    }

    const res0 = list0.buildData();
    const tpiValues = res0.meta[TagKeys.TemporalPositionIdentifier].value;
    for (const id of res0.meta.mergeId) {
      assert.equal(tpiValues[id][0], id.split('-')[1],
        `meta id ${id} maps to its own TemporalPositionIdentifier value`);
    }
  });

  test('DicomSliceDataList buildData falls back to AcquisitionTime', () => {
    // only AcquisitionTime varies per volume: no other candidate tag
    // is present, so the guess must still fall back to it.
    const list0 = new DicomSliceDataList();
    const zs = [0, 1];
    const acqTimes = ['080000', '090000'];
    let uid = 0;
    for (const z of zs) {
      for (const acqTime of acqTimes) {
        list0.add(makeSliceData(z, String(uid++), {
          [TagKeys.AcquisitionTime]: makeDataElement('TM', [acqTime])
        }));
      }
    }

    const res0 = list0.buildData();
    assert.equal(
      res0.image.getGeometry().getSize().get(2), 2, 'volume0 slice count');
  });

  test('DicomSliceDataList buildData respects custom override', () => {
    // custom.getPostLoadVolumeIdTagValue always returns the same value:
    // volumes cannot be discriminated so buildData must throw, even
    // though TemporalPositionIdentifier (a valid candidate) is present.
    custom.getPostLoadVolumeIdTagValue = function () {
      return 0;
    };
    try {
      const list0 = new DicomSliceDataList();
      const zs = [0, 1];
      const tpis = [1, 2];
      let uid = 0;
      for (const z of zs) {
        for (const tpi of tpis) {
          list0.add(makeSliceData(z, String(uid++), {
            [TagKeys.TemporalPositionIdentifier]:
              makeDataElement('IS', [String(tpi)])
          }));
        }
      }
      assert.throws(function () {
        list0.buildData();
      }, Error, 'Cannot create image for multi-volume');
    } finally {
      custom.getPostLoadVolumeIdTagValue = undefined;
    }
  });

  test('DicomSliceDataList buildData throws with no valid candidate', () => {
    // no tag distinguishes the two volumes at all: no candidate can
    // produce a valid grouping.
    const list0 = new DicomSliceDataList();
    const zs = [0, 1];
    let uid = 0;
    for (const z of zs) {
      for (let i = 0; i < 2; ++i) {
        list0.add(makeSliceData(z, String(uid++), {
          [TagKeys.AcquisitionTime]: makeDataElement('TM', ['080000'])
        }));
      }
    }
    assert.throws(function () {
      list0.buildData();
    }, Error, 'Cannot create image for multi-volume');
  });

  test('DicomSliceDataList buildData timepoints for time volumes', () => {
    assert.deepEqual(
      makeTimeSeriesList().buildData().timepoints,
      {
        tag: 'TemporalPositionIdentifier',
        syncTable: [
          {timepointIndex: 0, tagValue: 1},
          {timepointIndex: 1, tagValue: 2}
        ]
      },
      'time series timepoints');
  });

  test('DicomSliceDataList buildData timepoints for b-value volumes', () => {
    // volumes separated by the b-value
    const list0 = new DicomSliceDataList();
    let uid = 0;
    for (const z of [0, 1]) {
      for (const bvalue of [0, 800]) {
        list0.add(makeSliceData(z, String(uid++), {
          [TagKeys.SOPClassUID]: makeDataElement('UI', [MRSOPClassUID]),
          [TagKeys.TemporalPositionIdentifier]: makeDataElement('IS', ['1']),
          [TagKeys.DiffusionBValue]: makeDataElement('FD', [String(bvalue)])
        }));
      }
    }
    assert.equal(list0.buildData().timepoints, undefined,
      'no timepoints for b-value volumes');
  });

  test('DicomSliceDataList buildData timepoints with custom getter',
    () => {
      // custom getter: not time based
      custom.getPostLoadVolumeIdTagValue = function (meta) {
        return parseInt(
          meta[TagKeys.TemporalPositionIdentifier].value[0], 10);
      };
      try {
        assert.equal(makeTimeSeriesList().buildData().timepoints, undefined,
          'no timepoints for a custom getter');
      } finally {
        custom.getPostLoadVolumeIdTagValue = undefined;
      }
    });

  test('DataController markDataAsComplete without 4th dimension', () => {
    const dc0 = new DataController();
    const data = makeSliceData(0, 'uid3D', {});
    dc0.add('data3D', data);
    dc0.markDataAsComplete('data3D');
    assert.equal(
      dc0.getTimepointTag('data3D'), undefined, 'no timepoint tag');
    assert.equal(
      dc0.getTimepointSyncTable('data3D'), undefined, 'no sync table');
    // unknown data
    assert.equal(dc0.getTimepointTag('unknown'), undefined,
      'unknown data timepoint tag');
    assert.equal(dc0.getTimepointSyncTable('unknown'), undefined,
      'unknown data sync table');
  });

  test('DataController markDataAsComplete rebuilt b-value data', () => {
    // same time for all files: rebuilt with b-value volumes
    const filesElements = makeOneVolumeFiles([1, 1, 1], [800, 0, 50]);
    const dc0 = new DataController();
    sendFrames(dc0, '0', filesElements, 2);
    assert.ok(dc0.get('0').hasDuplicateOrigin(), 'has duplicate origin');
    dc0.markDataAsComplete('0');

    assert.equal(dc0.getTimepointTag('0'), undefined,
      'no timepoint tag for b-value volumes');
    assert.equal(dc0.getTimepointSyncTable('0'), undefined,
      'no sync table for b-value volumes');
  });

  test('DataController markDataAsComplete rebuilt time series', () => {
    // no time while loading: rebuilt with time volumes
    custom.getVolumeIdTagValue = function () {
      return undefined;
    };
    try {
      const temporalPositions = [3, 1, 2];
      const filesElements =
        makeOneVolumeFiles(temporalPositions, [0, 0, 0]);
      const dc0 = new DataController();
      sendFrames(dc0, '0', filesElements, 2);
      assert.ok(dc0.get('0').hasDuplicateOrigin(), 'has duplicate origin');
      const guessSpy =
        vi.spyOn(DicomSliceDataList.prototype, 'guessTimepoints');
      dc0.markDataAsComplete('0');
      assert.equal(guessSpy.mock.calls.length, 0,
        'timepoints from the build grouping, no second grouping');
      guessSpy.mockRestore();

      assert.equal(dc0.getTimepointTag('0'), 'TemporalPositionIndex',
        'timepoint tag');
      const table = dc0.getTimepointSyncTable('0');
      assert.deepEqual(table.map(entry => entry.tagValue), [1, 2, 3],
        'sync table tag values in volume order');
      // each table entry matches the volume shown at its index
      const image = dc0.get('0').image;
      for (const entry of table) {
        const fileIndex = temporalPositions.indexOf(entry.tagValue);
        assert.equal(
          image.getImageUid(new Index([0, 0, 0, entry.timepointIndex])),
          filesElements[fileIndex]['00080018'].value[0],
          `timepoint ${entry.timepointIndex} is the file with ` +
          `TemporalPositionIndex ${entry.tagValue}`);
      }
    } finally {
      custom.getVolumeIdTagValue = undefined;
    }
  });

  test('DataController markDataAsComplete b-value built while loading',
    () => {
      // b-value volumes built while loading
      custom.getVolumeIdTagValue = function (elements) {
        return getFrameBValue(elements);
      };
      try {
        const filesElements = makeOneVolumeFiles([1, 1, 1], [800, 0, 50]);
        const dc0 = new DataController();
        sendFrames(dc0, '0', filesElements, 2);
        assert.notOk(dc0.get('0').hasDuplicateOrigin(),
          'no duplicate origin');
        dc0.markDataAsComplete('0');

        assert.equal(dc0.getTimepointTag('0'), undefined,
          'no timepoint tag for b-value volumes');
        assert.equal(dc0.getTimepointSyncTable('0'), undefined,
          'no sync table for b-value volumes');
      } finally {
        custom.getVolumeIdTagValue = undefined;
      }
    });

  test('DataController markDataAsComplete data built while loading',
    () => {
      // time volumes built while loading, files not in time order
      const temporalPositions = [3, 1, 2];
      const filesElements =
        makeOneVolumeFiles(temporalPositions, [0, 0, 0]);
      const dc0 = new DataController();
      sendFrames(dc0, '0', filesElements, 2);
      assert.notOk(dc0.get('0').hasDuplicateOrigin(),
        'no duplicate origin');
      dc0.markDataAsComplete('0');

      assert.equal(dc0.getTimepointTag('0'), 'TemporalPositionIndex',
        'timepoint tag');
      const table = dc0.getTimepointSyncTable('0');
      assert.deepEqual(table.map(entry => entry.tagValue), [1, 2, 3],
        'sync table tag values');
      // each table entry matches the volume shown at its index
      const image = dc0.get('0').image;
      for (const entry of table) {
        const fileIndex = temporalPositions.indexOf(entry.tagValue);
        assert.equal(
          image.getImageUid(new Index([0, 0, 0, entry.timepointIndex])),
          filesElements[fileIndex]['00080018'].value[0],
          `timepoint ${entry.timepointIndex} is the file with ` +
          `TemporalPositionIndex ${entry.tagValue}`);
      }
    });

  test('DataController timepoints follow the data lifecycle', () => {
    const dc0 = new DataController();
    const loadTimeSeries = (dataId) => {
      sendFrames(dc0, dataId, makeOneVolumeFiles([1, 2], [0, 0]), 2);
      dc0.markDataAsComplete(dataId);
      assert.equal(dc0.getTimepointTag(dataId), 'TemporalPositionIndex',
        `${dataId} timepoint tag`);
    };

    // stash and unstash keep the timepoints
    loadTimeSeries('0');
    const table = dc0.getTimepointSyncTable('0');
    dc0.stash('0');
    assert.equal(dc0.getTimepointTag('0'), undefined,
      'no timepoint tag for stashed data');
    assert.equal(dc0.getTimepointSyncTable('0'), undefined,
      'no sync table for stashed data');
    dc0.unstash('0');
    assert.equal(dc0.getTimepointTag('0'), 'TemporalPositionIndex',
      'timepoint tag after unstash');
    assert.equal(dc0.getTimepointSyncTable('0'), table,
      'sync table after unstash');

    // remove clears the timepoints
    dc0.remove('0');
    assert.equal(dc0.getTimepointTag('0'), undefined,
      'no timepoint tag after remove');
    assert.equal(dc0.getTimepointSyncTable('0'), undefined,
      'no sync table after remove');

    // reset clears the timepoints
    loadTimeSeries('1');
    dc0.reset();
    assert.equal(dc0.getTimepointTag('1'), undefined,
      'no timepoint tag after reset');
  });


  test('DataController repeated markDataAsComplete keeps the timepoints',
    () => {
      const dc0 = new DataController();
      sendFrames(dc0, '0', makeOneVolumeFiles([3, 1, 2], [0, 0, 0]), 2);
      dc0.markDataAsComplete('0');
      const table = dc0.getTimepointSyncTable('0');
      dc0.markDataAsComplete('0');
      assert.equal(dc0.getTimepointTag('0'), 'TemporalPositionIndex',
        'tag kept');
      assert.deepEqual(dc0.getTimepointSyncTable('0'), table,
        'sync table kept');
    });

});
