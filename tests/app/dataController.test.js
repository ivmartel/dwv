import {describe, test, assert} from 'vitest';
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
import {
  getStructureElementsList,
  unsortedMultiframeMultiVolumeStructure,
  unsortedMultiframeMultiVolumeBValueStructure
} from '../../dev/dicom/dataStructures.js';

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
  SOPInstanceUID: '00080018',
  TriggerTime: '00181060',
  TemporalPositionIdentifier: '00200100',
  FrameContentSequence: '00209111',
  TemporalPositionIndex: '00209128',
  PerFrameFunctionalGroupsSequence: '52009230',
  PixelData: '7FE00010'
};

/**
 * Explicit VR little endian transfer syntax UID.
 */
const ExplicitVRLittleEndian = '1.2.840.10008.1.2.1';

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
    const elements = getStructureElementsList(config, ExplicitVRLittleEndian, {
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
 * Create single frame files, one per slice and timepoint, with the
 * TemporalPositionIdentifier in the instance header.
 *
 * @param {number} numberOfSlices The number of slices.
 * @param {number} numberOfTimepoints The number of timepoints.
 * @returns {Array<Record<string, DataElement>>} The files elements, in
 *   timepoint then slice order, TemporalPositionIdentifier starting at 1.
 */
function makeSingleFrameTimeFiles(numberOfSlices, numberOfTimepoints) {
  const filesElements = getStructureElementsList(
    syntheticData[0], ExplicitVRLittleEndian, {
      genOptions: {numberOfSlices, numberOfFrames: numberOfTimepoints}
    });
  filesElements.forEach((elements, index) => {
    const timepoint = Math.floor(index / numberOfSlices);
    elements[TagKeys.TemporalPositionIdentifier].value =
      [String(timepoint + 1)];
  });
  return filesElements;
}

/**
 * Create 3 multi-frame files of 2 frames at the same 2 positions (see
 * makeOneVolumeFiles) where every frame has a different
 * TemporalPositionIndex.
 *
 * @returns {Array<Record<string, DataElement>>} The files elements.
 */
function makeVaryingIndexFiles() {
  const filesElements = makeOneVolumeFiles([1, 1, 1], [0, 0, 0]);
  let temporalPositionIndex = 1;
  for (const elements of filesElements) {
    const frameGroups =
      elements[TagKeys.PerFrameFunctionalGroupsSequence].value;
    for (const frameGroup of frameGroups) {
      const frameContent = frameGroup[TagKeys.FrameContentSequence].value[0];
      frameContent[TagKeys.TemporalPositionIndex].value =
        [temporalPositionIndex++];
    }
  }
  return filesElements;
}

/**
 * Send single frame files to a data controller as DicomBufferToData
 * does.
 *
 * @param {DataController} dc The data controller.
 * @param {string} dataId The data id.
 * @param {Array<Record<string, DataElement>>} filesElements The files.
 */
function sendFiles(dc, dataId, filesElements) {
  for (const elements of filesElements) {
    const data = new DicomData(elements);
    data.buffer = elements[TagKeys.PixelData].value;
    data.numberOfItems = filesElements.length;
    if (typeof dc.get(dataId) === 'undefined') {
      dc.add(dataId, data);
    } else {
      dc.update(dataId, data);
    }
  }
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

  test('DicomSliceDataList buildData skips time tags varying per slice',
    () => {
      // TriggerTime changes on every slice: rejected, the volumes are
      // separated by AcquisitionTime (one value per volume)
      const list0 = new DicomSliceDataList();
      const triggerTimes = ['100', '200', '300', '400'];
      let uid = 0;
      for (const z of [0, 1]) {
        for (const acqTime of ['090000', '080000']) {
          list0.add(makeSliceData(z, String(uid), {
            [TagKeys.TriggerTime]:
              makeDataElement('DS', [triggerTimes[uid]]),
            [TagKeys.AcquisitionTime]: makeDataElement('TM', [acqTime])
          }));
          ++uid;
        }
      }
      const res0 = list0.buildData();
      const image0 = res0.image;
      assert.equal(image0.getGeometry().getSize().get(3), 2, 'volumes');
      assert.deepEqual(
        [
          image0.getImageUid(new Index([0, 0, 0, 0])),
          image0.getImageUid(new Index([0, 0, 1, 0])),
          image0.getImageUid(new Index([0, 0, 0, 1])),
          image0.getImageUid(new Index([0, 0, 1, 1]))
        ],
        ['1', '3', '0', '2'],
        'volumes ordered by AcquisitionTime');
      assert.isUndefined(res0.timepoints, 'not a time series');

      // AcquisitionTime changes on every slice: no valid grouping
      const list1 = new DicomSliceDataList();
      const acqTimes = ['080000', '080001', '080002', '080003'];
      uid = 0;
      for (const z of [0, 1]) {
        for (let i = 0; i < 2; ++i) {
          list1.add(makeSliceData(z, String(uid), {
            [TagKeys.AcquisitionTime]: makeDataElement('TM', [acqTimes[uid]])
          }));
          ++uid;
        }
      }
      assert.throws(function () {
        list1.buildData();
      }, Error, 'Cannot create image for multi-volume');
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

  test('DicomSliceDataList guessTimepoints for time volumes', () => {
    assert.deepEqual(
      makeTimeSeriesList().guessTimepoints(),
      {
        tag: 'TemporalPositionIdentifier',
        syncTable: [
          {timepointIndex: 0, tagValue: 1},
          {timepointIndex: 1, tagValue: 2}
        ]
      },
      'time series timepoints');
  });

  test('DicomSliceDataList guessTimepoints for b-value volumes', () => {
    // same TemporalPositionIdentifier for all instances,
    // volumes separated by the diffusion b-value
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
    assert.equal(list0.guessTimepoints(), undefined,
      'no timepoints for b-value volumes');
  });

  test('DicomSliceDataList guessTimepoints with no valid candidate',
    () => {
      // one instance per origin: no volumes
      const list0 = new DicomSliceDataList();
      list0.add(makeSliceData(0, '0', {}));
      list0.add(makeSliceData(1, '1', {}));
      assert.equal(list0.guessTimepoints(), undefined,
        'one instance per origin');
      // no tag distinguishes the volumes
      const list1 = new DicomSliceDataList();
      let uid = 0;
      for (const z of [0, 1]) {
        for (let i = 0; i < 2; ++i) {
          list1.add(makeSliceData(z, String(uid++), {
            [TagKeys.AcquisitionTime]: makeDataElement('TM', ['080000'])
          }));
        }
      }
      assert.equal(list1.guessTimepoints(), undefined,
        'no valid candidate');
    });

  test('DicomSliceDataList guessTimepoints with custom getter',
    () => {
      // a custom getter does not say what its value means
      custom.getPostLoadVolumeIdTagValue = function (meta) {
        return parseInt(
          meta[TagKeys.TemporalPositionIdentifier].value[0], 10);
      };
      try {
        assert.equal(makeTimeSeriesList().guessTimepoints(), undefined,
          'no timepoints for a custom getter');
      } finally {
        custom.getPostLoadVolumeIdTagValue = undefined;
      }
    });

  /**
   * Tests for {@link DataController#markDataAsComplete} timepoints.
   *
   * @function module:tests/app~datacontrollerMarkDataAsComplete
   */
  test('DataController markDataAsComplete without 4th dimension', () => {
    const dc0 = new DataController();
    const data = makeSliceData(0, 'uid3D', {});
    dc0.add('data3D', data);
    dc0.markDataAsComplete('data3D');
    assert.equal(
      dc0.getTimepointTag('data3D'), undefined, 'no timepoint tag');
    assert.notOk(
      dc0.get('data3D').image.isTimeSeries(), '3D image not time series');
    assert.equal(
      dc0.getTimepointSyncTable('data3D'), undefined, 'no sync table');
    // unknown data
    assert.equal(dc0.getTimepointTag('unknown'), undefined,
      'unknown data timepoint tag');
    assert.equal(dc0.getTimepointSyncTable('unknown'), undefined,
      'unknown data sync table');
  });

  test('DataController markDataAsComplete rebuilt b-value data', () => {
    // same TemporalPositionIndex for all files: the pre-load time does
    // not separate the volumes, the data is rebuilt (buildData) and the
    // volumes are separated by the b-value
    const filesElements = makeOneVolumeFiles([1, 1, 1], [800, 0, 50]);
    const dc0 = new DataController();
    sendFrames(dc0, '0', filesElements, 2);
    assert.ok(dc0.get('0').hasDuplicateOrigin(), 'has duplicate origin');
    dc0.markDataAsComplete('0');

    assert.equal(dc0.getTimepointTag('0'), undefined,
      'no timepoint tag for b-value volumes');
    assert.notOk(dc0.get('0').image.isTimeSeries(),
      'image not time series');
    assert.equal(dc0.getTimepointSyncTable('0'), undefined,
      'no sync table for b-value volumes');
  });

  test('DataController markDataAsComplete rebuilt time series', () => {
    // a custom pre-load getter without time leaves the time undefined
    // while loading: the data is rebuilt (buildData) and the volumes are
    // separated by the TemporalPositionIndex
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
      dc0.markDataAsComplete('0');

      assert.equal(dc0.getTimepointTag('0'), 'TemporalPositionIndex',
        'timepoint tag');
      assert.ok(dc0.get('0').image.isTimeSeries(), 'image time series');
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

  test('DataController markDataAsComplete single multi-frame file', () => {
    // one file with several volumes: no stored files, the timepoints
    // are found from the frames
    for (const {structure, tag} of [
      {structure: unsortedMultiframeMultiVolumeStructure,
        tag: 'TemporalPositionIndex'},
      {structure: unsortedMultiframeMultiVolumeBValueStructure,
        tag: undefined}
    ]) {
      const elements = getStructureElementsList(
        syntheticData[0], ExplicitVRLittleEndian, structure)[0];
      const dc0 = new DataController();
      sendFrames(dc0, '0', [elements], structure.numberOfFrames);
      dc0.markDataAsComplete('0');

      const image = dc0.get('0').image;
      assert.ok(image.getGeometry().getSize().moreThanOne(3),
        `${structure.name} multivolume`);
      assert.equal(dc0.getTimepointTag('0'), tag,
        `${structure.name} timepoint tag`);
      assert.equal(image.isTimeSeries(), typeof tag !== 'undefined',
        `${structure.name} time series`);
    }
  });

  test('DataController markDataAsComplete b-value built while loading',
    () => {
      // a custom pre-load getter that returns the b-value separates the
      // volumes while loading (no duplicate origin, no buildData): no
      // timepoints
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
        // not a time series: only the first volume origins
        const image = dc0.get('0').image;
        assert.notOk(image.isTimeSeries(), 'image not time series');
        assert.equal(
          image.getOriginForImageUid(filesElements[2]['00080018'].value[0]),
          undefined,
          'no annotation origin outside the first volume');
      } finally {
        custom.getVolumeIdTagValue = undefined;
      }
    });

  test('DataController markDataAsComplete without temporal position tags',
    () => {
      // no TemporalPositionIdentifier and no TemporalPositionIndex: the
      // volumes are separated by a time value tag but are not timepoints
      for (const {tag, vr, values} of [
        {tag: TagKeys.TriggerTime, vr: 'DS', values: ['300', '100', '200']},
        {
          tag: TagKeys.AcquisitionTime,
          vr: 'TM',
          values: ['100000', '080000', '090000']
        }
      ]) {
        const filesElements = makeOneVolumeFiles([1, 1, 1], [0, 0, 0]);
        filesElements.forEach((elements, index) => {
          for (const group of elements['52009230'].value) {
            delete group['00209111'].value[0]['00209128'];
          }
          elements[tag] = makeDataElement(vr, [values[index]]);
        });
        const dc0 = new DataController();
        sendFrames(dc0, '0', filesElements, 2);
        dc0.markDataAsComplete('0');

        const image = dc0.get('0').image;
        assert.equal(image.getGeometry().getSize().get(3), 3,
          `${tag} volumes`);
        assert.equal(dc0.getTimepointTag('0'), undefined,
          `${tag} no timepoint tag`);
        assert.equal(dc0.getTimepointSyncTable('0'), undefined,
          `${tag} no sync table`);
        assert.notOk(image.isTimeSeries(), `${tag} not time series`);
        assert.ok(
          image.getOriginForImageUid(filesElements[1]['00080018'].value[0]),
          `${tag} annotation origin in the first volume`);
        assert.isUndefined(
          image.getOriginForImageUid(filesElements[0]['00080018'].value[0]),
          `${tag} no annotation origin outside the first volume`);
      }
    });

  test('DataController markDataAsComplete single frame time series',
    () => {
      // one file per slice and timepoint, files not in order
      const numberOfSlices = 2;
      const numberOfTimepoints = 3;
      const filesElements =
        makeSingleFrameTimeFiles(numberOfSlices, numberOfTimepoints);
      const arrivalOrder = [4, 1, 5, 0, 3, 2];
      const dc0 = new DataController();
      sendFiles(dc0, '0', arrivalOrder.map(index => filesElements[index]));
      dc0.markDataAsComplete('0');

      const image = dc0.get('0').image;
      const size = image.getGeometry().getSize();
      assert.equal(size.get(2), numberOfSlices, 'number of slices');
      assert.equal(size.get(3), numberOfTimepoints, 'number of timepoints');
      assert.equal(dc0.getTimepointTag('0'), 'TemporalPositionIdentifier',
        'timepoint tag');
      assert.ok(image.isTimeSeries(), 'time series');
      assert.deepEqual(
        dc0.getTimepointSyncTable('0').map(entry => entry.tagValue),
        [1, 2, 3], 'timepoint values in order');
      for (let t = 0; t < numberOfTimepoints; ++t) {
        for (let z = 0; z < numberOfSlices; ++z) {
          const fileElements = filesElements[t * numberOfSlices + z];
          assert.equal(
            image.getImageUid(new Index([0, 0, z, t])),
            fileElements[TagKeys.SOPInstanceUID].value[0],
            `timepoint ${t} slice ${z} file`);
        }
      }
    });

  test('DataController markDataAsComplete single frame varying identifier',
    () => {
      // TemporalPositionIdentifier changes on every slice: not timepoints
      const numberOfSlices = 2;
      const acquisitionTimes = ['080000', '090000', '100000'];
      for (const withAcquisitionTime of [false, true]) {
        const filesElements = makeSingleFrameTimeFiles(
          numberOfSlices, acquisitionTimes.length);
        filesElements.forEach((elements, index) => {
          elements[TagKeys.TemporalPositionIdentifier].value =
            [String(index + 1)];
          if (withAcquisitionTime) {
            const timepoint = Math.floor(index / numberOfSlices);
            elements[TagKeys.AcquisitionTime] =
              makeDataElement('TM', [acquisitionTimes[timepoint]]);
          }
        });
        const dc0 = new DataController();
        sendFiles(dc0, '0', filesElements);
        dc0.markDataAsComplete('0');

        const label = `acquisition time: ${withAcquisitionTime}`;
        assert.equal(dc0.getTimepointTag('0'), undefined,
          `no timepoint tag (${label})`);
        assert.equal(dc0.getTimepointSyncTable('0'), undefined,
          `no sync table (${label})`);
        assert.notOk(dc0.get('0').image.isTimeSeries(),
          `not time series (${label})`);
      }
    });

  test('DataController markDataAsComplete multi-frame varying index',
    () => {
      // TemporalPositionIndex changes between the frames of a volume:
      // rejected, the volumes are separated by the next valid candidate
      const numberOfSlices = 2;
      const acquisitionTimes = ['100000', '080000', '090000'];
      const earliestFileIndex = 1;
      const filesElements = makeVaryingIndexFiles();
      filesElements.forEach((elements, index) => {
        elements[TagKeys.AcquisitionTime] =
          makeDataElement('TM', [acquisitionTimes[index]]);
      });
      const dc0 = new DataController();
      sendFrames(dc0, '0', filesElements, numberOfSlices);
      dc0.markDataAsComplete('0');

      const image = dc0.get('0').image;
      const size = image.getGeometry().getSize();
      assert.equal(size.get(2), numberOfSlices, 'number of slices');
      assert.equal(size.get(3), acquisitionTimes.length, 'number of volumes');
      assert.equal(
        image.getImageUid(new Index([0, 0, 0, 0])),
        filesElements[earliestFileIndex][TagKeys.SOPInstanceUID].value[0],
        'first volume is the earliest acquisition');
      assert.equal(dc0.getTimepointTag('0'), undefined, 'no timepoint tag');
      assert.notOk(image.isTimeSeries(), 'not time series');

      // no other candidate: the data cannot be built
      const dc1 = new DataController();
      sendFrames(dc1, '0', makeVaryingIndexFiles(), numberOfSlices);
      assert.throws(function () {
        dc1.markDataAsComplete('0');
      }, Error, 'Cannot create image for multi-volume');
    });

  test('DataController markDataAsComplete data built while loading',
    () => {
      // one TemporalPositionIndex per file, files not in time order: the
      // pre-load time separates the volumes while loading, there is no
      // duplicate origin and buildData does not run: the sync table must
      // still be built, in the image volume order
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
      // time series: origins of any timepoint
      const image = dc0.get('0').image;
      assert.ok(image.isTimeSeries(), 'image time series');
      // getters read the image timepoints
      assert.deepEqual(image.getTimepoints(),
        {tag: 'TemporalPositionIndex', syncTable: table}, 'image timepoints');
      assert.ok(
        image.getOriginForImageUid(filesElements[2]['00080018'].value[0]),
        'annotation origin outside the first volume');
      // each table entry matches the volume shown at its index
      for (const entry of table) {
        const fileIndex = temporalPositions.indexOf(entry.tagValue);
        assert.equal(
          image.getImageUid(new Index([0, 0, 0, entry.timepointIndex])),
          filesElements[fileIndex]['00080018'].value[0],
          `timepoint ${entry.timepointIndex} is the file with ` +
          `TemporalPositionIndex ${entry.tagValue}`);
      }
    });

});
