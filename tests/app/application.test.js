// @vitest-environment jsdom
import {describe, test, assert, vi, afterEach} from 'vitest';
import {App} from '../../src/app/application.js';
import {ImageFactory} from '../../src/image/imageFactory.js';
import {binderList} from '../../src/gui/binders.js';
import {
  dataStructures,
  getStructureBuffers
} from '../../dev/dicom/dataStructures.js';

import syntheticImgData from '/tests/data/synthetic-img.json';

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
    const dataId = app.loadImageObject([{data: buffer, filename: 'mf.dcm'}]);

    assert.deepEqual(
      events, ['error', 'abort', 'loadend'],
      'one error, then abort and loadend');
    assert.isUndefined(
      app.getDataController().get(dataId), 'no data left');
  });

  /**
   * Tests for {@link App#setLayerGroupsBinders}: binders get the data
   * geometry lookup.
   *
   * @function module:tests/app~appSetLayerGroupsBinders
   */
  test('App setLayerGroupsBinders passes the geometry lookup', () => {
    const app = new App();
    app.init({});
    const geometry = {};
    const getSpy = vi.spyOn(app.getDataController(), 'get')
      .mockImplementation((dataId) => dataId === 'data0'
        ? {image: {getGeometry: () => geometry}}
        : undefined);

    let binderArgs;
    const OriginalBinder = binderList.PositionBinder;
    binderList.PositionBinder = class extends OriginalBinder {
      constructor(...args) {
        super(...args);
        binderArgs = args;
      }
    };
    try {
      app.setLayerGroupsBinders(['PositionBinder']);
    } finally {
      binderList.PositionBinder = OriginalBinder;
    }

    assert.equal(binderArgs.length, 1, 'one lookup');
    const [getGeometry] = binderArgs;
    assert.equal(getGeometry('data0'), geometry, 'geometry lookup');
    assert.isUndefined(getGeometry('unknown'), 'unknown data');
    assert.deepEqual(getSpy.mock.calls, [['data0'], ['unknown']],
      'data asked for the data id');
  });

});
