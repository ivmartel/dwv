// @vitest-environment jsdom
import {describe, test, assert, vi, afterEach} from 'vitest';
import {App} from '../../src/app/application.js';
import {ImageFactory} from '../../src/image/imageFactory.js';
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

});
