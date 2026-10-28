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
  AcquisitionTime: '00080032',
  EchoTime: '00180081',
  TemporalPositionIdentifier: '00200100'
};

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
  test(
    'DataController builds multi-frame files with multiple volumes - ' +
    '#DWV-REQ-IO-07-001 Load multi-volume data',
    () => {
      // 2 files, each one with 2 volumes of 2 frames at the same
      // positions: the first item of 2 volumes comes from the same
      // file, the meta merge has to use the frame b-value.
      // The volume ids (b-values) of the 2 files are different:
      // the volumes are appended while loading, no rebuild needed
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
      // (frames filled with their b-value to check the final layout)
      const dc0 = new DataController();
      const dataId = '0';
      for (let i = 0; i < filesElements.length; ++i) {
        const elements = filesElements[i];
        const buffer = elements['7FE00010'].value;
        const frameSize = buffer.length / numberOfFrames;
        for (let f = 0; f < numberOfFrames; ++f) {
          const data = new DicomData(elements);
          data.buffer = buffer.subarray(f * frameSize, (f + 1) * frameSize)
            .fill(filesBValues[i][f]);
          data.numberOfItems = filesElements.length;
          data.frameNumber = f;
          if (typeof dc0.get(dataId) === 'undefined') {
            dc0.add(dataId, data);
          } else {
            dc0.update(dataId, data);
          }
        }
      }
      assert.notOk(dc0.get(dataId).hasDuplicateOrigin(),
        'has duplicate origin');

      const res0 = dc0.markDataAsComplete(dataId);
      assert.notOk(res0.imageHasChanged, 'image has changed');

      const image = dc0.get(dataId).image;
      const size = image.getGeometry().getSize();
      assert.equal(size.get(2), 2, 'number of slices');
      assert.equal(size.get(3), 4, 'number of volumes');
      const volumeIds = [0, 50, 800, 1000];
      const geometry = image.getGeometry();
      assert.deepEqual(geometry.getVolumeIds(), volumeIds.map(value => ({id: {
        source: 'DiffusionBValue',
        value,
        tagKey: '00189087',
        unit: 'unit.smm2'
      }})), 'volume ids');
      for (let v = 0; v < volumeIds.length; ++v) {
        for (let k = 0; k < 2; ++k) {
          assert.equal(image.getValue(0, 0, k, v), volumeIds[v],
            `value of slice ${k} of volume ${v}`);
        }
      }
    });

  /**
   * Tests for {@link DicomSliceDataList#buildData}.
   *
   * @function module:tests/app~dicomSliceDataListBuildData
   */
  test(
    'DicomSliceDataList buildData guesses volume id tag - ' +
    '#DWV-REQ-IO-07-001 Load multi-volume data',
    () => {
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
      const geometry = res0.image.getGeometry();
      assert.deepEqual(geometry.getVolumeIds(), [1, 2].map(value => ({id: {
        source: 'TemporalPositionIdentifier',
        value,
        tagKey: TagKeys.TemporalPositionIdentifier
      }})), 'volume ids');
    });

  test('DicomSliceDataList buildData uses volume id values', () => {
    // fractional, unsorted EchoTime (a post load candidate)
    const list0 = new DicomSliceDataList();
    const echoTimes = [9.2, 4.6];
    let uid = 0;
    for (const z of [1, 0]) {
      for (const echoTime of echoTimes) {
        const data = makeSliceData(z, String(uid++), {
          [TagKeys.EchoTime]: makeDataElement('DS', [String(echoTime)])
        });
        data.image.getBuffer().fill(echoTime * 10 + z);
        list0.add(data);
      }
    }

    const image = list0.buildData().image;
    const geometry = image.getGeometry();
    assert.deepEqual(geometry.getVolumeIds(), [4.6, 9.2].map(value => ({id: {
      source: 'EchoTime',
      value,
      tagKey: TagKeys.EchoTime,
      unit: 'unit.ms'
    }})), 'volume ids');
    for (let v = 0; v < 2; ++v) {
      for (let k = 0; k < 2; ++k) {
        assert.equal(image.getValue(0, 0, k, v), [46, 92][v] + k,
          `value of slice ${k} of volume ${v}`);
      }
    }
    // position of volume 1 holds its echo time
    const position = image.getGeometry().indexToWorld(
      new Index([0, 0, 0, 1]));
    assert.equal(position.get(3), 9.2, 'volume 1 position');
  });

  test('DataController sets volume values once loaded', () => {
    // 2 slices x 2 volumes, one file each: pre load
    // TemporalPositionIdentifier (volumes appended while loading),
    // acquisition time per slice
    const items = [
      [0, 1, '080000'], [1, 1, '080001'], [0, 2, '080010'], [1, 2, '080011']
    ];
    const dc0 = new DataController();
    const dataId = '0';
    for (let i = 0; i < items.length; ++i) {
      const [z, tpi, acqTime] = items[i];
      const config = structuredClone(syntheticData[0]);
      config.tags.SOPInstanceUID += `.${i}`;
      config.tags.MediaStorageSOPInstanceUID = config.tags.SOPInstanceUID;
      config.tags.TemporalPositionIdentifier = String(tpi);
      config.tags.AcquisitionTime = acqTime;
      const elements = getStructureElementsList(
        config, '1.2.840.10008.1.2.1', {genOptions: {}})[0];
      // distinct instance numbers (meta merge id) and positions
      elements['00200013'].value = [String(i + 1)];
      elements['00200032'].value = [0, 0, z];
      const data = new DicomData(elements);
      data.buffer = elements['7FE00010'].value;
      data.numberOfItems = items.length;
      if (typeof dc0.get(dataId) === 'undefined') {
        dc0.add(dataId, data);
      } else {
        dc0.update(dataId, data);
      }
    }
    assert.notOk(dc0.get(dataId).hasDuplicateOrigin(),
      'has duplicate origin');
    const geometry = dc0.get(dataId).image.getGeometry();
    assert.isTrue(geometry.getVolumeIds().every(
      volumeId => typeof volumeId.value === 'undefined'),
    'no values while loading');

    dc0.markDataAsComplete(dataId);
    const info = {
      source: 'AcquisitionTime',
      tagKey: TagKeys.AcquisitionTime,
      unit: 'unit.s'
    };
    assert.deepEqual(geometry.getVolumeIds(), [1, 2].map((id, i) => ({
      id: {
        value: id,
        tagKey: TagKeys.TemporalPositionIdentifier,
        source: 'TemporalPositionIdentifier'
      },
      value: {...info, value: [0, 10][i]}
    })), 'volume ids');
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
    const geometry = res0.image.getGeometry();
    assert.equal(geometry.getSize().get(2), 2, 'volume0 slice count');
    // ids in seconds since midnight, no associated value before
    // load is complete
    assert.deepEqual(
      geometry.getVolumeIds(), [0, 3600].map(value => ({id: {
        source: 'AcquisitionTime',
        tagKey: TagKeys.AcquisitionTime,
        unit: 'unit.s',
        value: 8 * 3600 + value
      }})), 'volume ids');
  });

  test('DicomSliceDataList buildData respects custom override', () => {
    // the only custom candidate always returns the same value:
    // volumes cannot be discriminated so buildData must throw, even
    // though TemporalPositionIdentifier (a default candidate) is present.
    custom.volumeIdCandidates = [{name: 'Custom', getter: () => 0}];
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
      custom.volumeIdCandidates = undefined;
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

});
