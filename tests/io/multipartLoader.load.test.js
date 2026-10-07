// @vitest-environment jsdom
import {describe, test, assert} from 'vitest';
import {buildMultipart} from '../../src/utils/array.js';
import {MultipartLoader} from '../../src/io/multipartLoader.js';
import {b64urlToArrayBuffer} from '../dicom/utils.js';

import bbmri53323131 from '../data/bbmri-53323131.dcm?inline';
import bbmri53323275 from '../data/bbmri-53323275.dcm?inline';

/**
 * End-to-end load tests for the 'io/multipartLoader.js' file.
 * These tests use real multipart buffers and the full loader pipeline
 * (parseMultipart → MemoryLoader → DicomDataLoader) without any mocks.
 */
/** @module tests/io */

describe('io', () => {

  /**
   * Tests for {@link MultipartLoader#load} with a real multipart buffer.
   *
   * @function module:tests/io~multipartLoaderLoad
   */
  test(
    'MultipartLoader load - two DICOM parts end-to-end',
    async () => {
      // Build a real multipart buffer containing two DICOM parts.
      const parts = [
        {
          'Content-Type': 'application/dicom',
          data: new Uint8Array(b64urlToArrayBuffer(bbmri53323131))
        },
        {
          'Content-Type': 'application/dicom',
          data: new Uint8Array(b64urlToArrayBuffer(bbmri53323275))
        }
      ];
      const buffer = buildMultipart(parts, 'test-boundary').buffer;

      const loader = new MultipartLoader();
      const loadItems = [];
      let loadFired = false;

      await new Promise((resolve) => {
        loader.onloaditem = (event) => {
          loadItems.push(event.data);
        };
        loader.onload = () => {
          loadFired = true;
        };
        loader.onloadend = () => {
          resolve();
        };
        loader.load(buffer, 'test-origin', 0);
      });

      assert.equal(loadItems.length, 2, 'onloaditem fired for each part');
      for (const item of loadItems) {
        assert.ok(typeof item.meta !== 'undefined', 'item has meta data');
      }
      assert.ok(loadFired, 'onload fired');
      assert.notOk(loader.isLoading(), 'isLoading false after completion');
    }
  );

});
