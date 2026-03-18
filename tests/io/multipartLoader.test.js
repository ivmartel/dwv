// @vitest-environment jsdom
import {describe, test, assert} from 'vitest';
import {MultipartLoader} from '../../src/io/multipartLoader.js';

/**
 * Tests for the 'io/multipartLoader.js' file.
 */

describe('io', () => {

  /**
   * Tests for {@link MultipartLoader} events with single frame data.
   *
   * @function module:tests/io~multipart-loader-canloadurl
   */
  test(
    'Multipart loader canloadurl - #DWV-REQ-IO-02-002 Load DICOM multipart URL',
    () => {
      const loader = new MultipartLoader();

      // 'ok' tests
      const okTestArgs = [
        {
          url: 'path/data.ext',
          options: {forceLoader: 'multipart'},
          desc: 'ok force #0 (multipart)'
        },
        {
          url: 'path/data.ext',
          options: {requestHeaders: [
            {name: 'Accept', value: 'multipart/related'}
          ]},
          desc: 'ok request #0 (multipart)'
        },
      ];

      for (const testArg of okTestArgs) {
        assert.ok(
          loader.canLoadUrl(testArg.url, testArg.options),
          testArg.desc
        );
      }

      // 'notOk' tests
      const notOkTestArgs = [
        {
          url: 'path/data.dcm',
          options: {},
          desc: 'bad extension #0 (dcm)'
        },
        {
          url: 'path/data.ext',
          options: {},
          desc: 'bad options #0 (empty)'
        },
        {
          url: 'path/data.ext',
          options: {forceLoader: 'dicom'},
          desc: 'bad force #0 (dcm)'
        },
        {
          url: 'path/data.ext',
          options: {requestHeaders: [
            {name: 'Accept', value: 'application/dicom'}
          ]},
          desc: 'bad request #0 (dicom)'
        },
      ];

      for (const testArg of notOkTestArgs) {
        assert.notOk(
          loader.canLoadUrl(testArg.url, testArg.options),
          testArg.desc
        );
      }
    }
  );

});
