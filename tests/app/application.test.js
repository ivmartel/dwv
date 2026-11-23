// @vitest-environment jsdom
import {describe, test, assert, vi, afterEach} from 'vitest';
import {App} from '../../src/app/application.js';
import {ImageFactory} from '../../src/image/imageFactory.js';
import * as loggerModule from '../../src/utils/logger.js';
import {
  dataStructures,
  singleSliceStructure,
  getStructureBuffers
} from '../../dev/dicom/dataStructures.js';

import syntheticImgData from '/tests/data/synthetic-img.json';
import syntheticKosData from '/tests/data/synthetic-kos.json';
import syntheticSegData from '/tests/data/synthetic-seg.json';

/**
 * Tests for the 'app/application.js' file.
 */

describe('app', () => {

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * Tests for {@link App} load with a data creation error.
   *
   * @function module:tests/app~appLoadDataCreationError
   */
  test('App load stops at data creation error', () => {
    // image creation fails, as for an unsupported geometry
    vi.spyOn(ImageFactory.prototype, 'create').mockImplementation(() => {
      throw new Error('Unsupported geometry');
    });

    const app = new App();
    app.init({});

    const events = [];
    for (const type of ['loaditem', 'error', 'abort', 'load', 'loadend']) {
      app.addEventListener(type, () => {
        events.push(type);
      });
    }

    // uncompressed multi-frame: frames are sent synchronously
    const buffer = getStructureBuffers(
      syntheticImgData[0],
      '1.2.840.10008.1.2.1',
      dataStructures.multiframe
    )[0];
    app.loadImageObject([{data: buffer, filename: 'mf.dcm'}]);

    assert.deepEqual(
      events, ['error', 'abort', 'loadend'],
      'one error, then abort and loadend');
    assert.deepEqual(
      app.getDataController().getDataIds(), [], 'no data left');
  });

  /**
   * Get a synthetic data config with some tags changed.
   *
   * @param {object[]} list The synthetic data list.
   * @param {string} name The config name.
   * @param {object} [tags] The tags to change.
   * @returns {object} The config.
   */
  function getConfig(list, name, tags = {}) {
    const config = structuredClone(list.find((item) => item.name === name));
    Object.assign(config.tags, tags);
    return config;
  }

  /**
   * Get the memory load input of a list of configs.
   *
   * @param {Array} items The list of [config, structure].
   * @returns {Array} The loadImageObject input.
   */
  function getLoadInput(items) {
    const res = [];
    for (const [config, structure] of items) {
      const buffers = getStructureBuffers(
        config, '1.2.840.10008.1.2.1', structure);
      for (const buffer of buffers) {
        res.push({data: buffer, filename: `${config.name}-${res.length}.dcm`});
      }
    }
    return res;
  }

  /**
   * Record the load events of an app.
   *
   * @param {App} app The app.
   * @returns {CustomEvent[]} The recorded events.
   */
  function recordLoadEvents(app) {
    const events = [];
    const types = ['loadstart',
      'loaddata',
      'loaditem',
      'load',
      'loadend',
      'error',
      'abort'];
    for (const type of types) {
      app.addEventListener(type, (event) => {
        events.push(event);
      });
    }
    return events;
  }

  /**
   * Load a list of buffers and wait for the load end.
   *
   * @param {App} app The app.
   * @param {Array} input The loadImageObject input.
   * @returns {Promise<string>} The load id.
   */
  function loadAndWait(app, input) {
    return new Promise((resolve) => {
      // small loads can end before loadImageObject returns
      app.addEventListener('loadend', (event) => {
        resolve(event.detail.loadid);
      }, {once: true});
      app.loadImageObject(input);
    });
  }

  /**
   * Tests for {@link App} load of several data in one call.
   *
   * @function module:tests/app~appLoadGroupsData
   */
  test('App load creates one data per series and object', async () => {
    const app = new App();
    app.init({});
    const events = recordLoadEvents(app);

    const series = getConfig(syntheticImgData, 'test-img-00');
    const otherSeries = getConfig(syntheticImgData, 'test-img-01');
    const localizer = getConfig(syntheticImgData, 'test-img-00', {
      SOPInstanceUID: '1.2.3.4.1',
      MediaStorageSOPInstanceUID: '1.2.3.4.1',
      ImageType: ['ORIGINAL', 'PRIMARY', 'LOCALIZER']
    });
    const kos = getConfig(syntheticKosData, 'test-kos-00');

    const input = getLoadInput([
      [series, dataStructures.multipleSingleSlice],
      [kos, singleSliceStructure],
      [localizer, singleSliceStructure],
      [otherSeries, singleSliceStructure]
    ]);
    const loadId = await loadAndWait(app, input);

    assert.equal(loadId, '0', 'load id');
    const types = events.map((event) => event.type);
    assert.equal(types[0], 'loadstart');
    assert.deepEqual(types.slice(-2), ['load', 'loadend']);
    assert.notInclude(types, 'error');

    const loadDataIds = events.filter((event) => event.type === 'loaddata')
      .map((event) => event.detail.dataid);
    assert.deepEqual(loadDataIds, ['0', '1', '2', '3'], 'one data per group');
    for (const event of events) {
      assert.equal(event.detail.loadid, loadId, `${event.type} loadid`);
    }

    // a loaddata event comes before the first item of its data
    const items = events.filter((event) => event.type === 'loaditem');
    assert.equal(items.length, input.length);
    for (const dataId of loadDataIds) {
      const dataItems = items.filter((item) => item.detail.dataid === dataId);
      assert.isTrue(dataItems[0].detail.isfirstitem);
      assert.isTrue(dataItems.slice(1).every(
        (item) => !item.detail.isfirstitem));
      const dataEventIndex = events.findIndex((event) =>
        event.type === 'loaddata' && event.detail.dataid === dataId);
      assert.isBelow(dataEventIndex, events.indexOf(dataItems[0]));
    }

    assert.deepEqual(events.at(-2).detail.dataids, loadDataIds, 'load');
    assert.deepEqual(events.at(-1).detail.dataids, loadDataIds, 'loadend');

    const dataController = app.getDataController();
    // series: 5 slices
    const seriesImage = dataController.get('0').image;
    assert.equal(seriesImage.getGeometry().getSize().get(2), 5);
    assert.isTrue(dataController.get('0').getComplete());
    // KOS: no image
    assert.isUndefined(dataController.get('1').image);
    assert.equal(
      dataController.get('1').meta['00080060'].value[0], 'KO');
    // localizer and other series: one slice each
    assert.equal(
      dataController.get('2').image.getGeometry().getSize().get(2), 1);
    assert.equal(
      dataController.get('3').image.getGeometry().getSize().get(2), 1);
  });

  test('App load creates a segmentation listed before its image', async () => {
    // the synthetic segments are reported as overlapping
    vi.spyOn(loggerModule.logger, 'warn').mockImplementation(() => {});
    const app = new App();
    app.init({});
    const events = recordLoadEvents(app);

    const seg = getConfig(syntheticSegData, 'test-seg-00');
    const image = getConfig(syntheticImgData, 'test-img-00');
    const loadId = await loadAndWait(app, getLoadInput([
      [seg, singleSliceStructure],
      [image, singleSliceStructure]
    ]));

    assert.notInclude(events.map((event) => event.type), 'error');
    const loadDataIds = events.filter((event) => event.type === 'loaddata')
      .map((event) => event.detail.dataid);
    // the image comes first: the segmentation waits for it
    assert.deepEqual(loadDataIds, ['0', '1']);
    const loadEvent = events.find((event) => event.type === 'load');
    assert.equal(loadEvent.detail.loadid, loadId);
    assert.deepEqual(loadEvent.detail.dataids, ['0', '1']);

    const dataController = app.getDataController();
    assert.equal(
      dataController.get('0').meta['00080060'].value[0], 'MR');
    const mask = dataController.get('1').image;
    assert.equal(mask.constructor.name, 'MaskImage');
    assert.isTrue(dataController.get('1').getComplete());
  });

  test('App load reports a segmentation with no referenced series',
    async () => {
      const app = new App();
      app.init({});
      const events = recordLoadEvents(app);

      const seg = getConfig(syntheticSegData, 'test-seg-00');
      // image of another series
      const image = getConfig(syntheticImgData, 'test-img-01');
      await loadAndWait(app, getLoadInput([
        [image, singleSliceStructure],
        [seg, singleSliceStructure]
      ]));

      const types = events.map((event) => event.type);
      const error = events.find((event) => event.type === 'error');
      assert.include(error.detail.error.message, 'referenced series');
      // the image is kept
      assert.deepEqual(types.slice(-2), ['load', 'loadend']);
      assert.deepEqual(events.at(-2).detail.dataids, ['0']);
      assert.deepEqual(app.getDataController().getDataIds(), ['0']);
    });

  test('App abortLoad after the load end keeps its data', async () => {
    const app = new App();
    app.init({});

    const first = await loadAndWait(app, getLoadInput([
      [getConfig(syntheticImgData, 'test-img-00'), singleSliceStructure]
    ]));
    const second = await loadAndWait(app, getLoadInput([
      [getConfig(syntheticImgData, 'test-img-01'), singleSliceStructure],
      [getConfig(syntheticKosData, 'test-kos-00'), singleSliceStructure]
    ]));
    assert.notEqual(first, second);
    const dataController = app.getDataController();
    assert.deepEqual(dataController.getDataIds(), ['0', '1', '2']);

    // the load is done: abort only forgets it
    app.abortLoad(second);
    assert.deepEqual(dataController.getDataIds(), ['0', '1', '2']);
  });

});
