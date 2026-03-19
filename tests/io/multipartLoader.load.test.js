// @vitest-environment jsdom
import {describe, test, assert} from 'vitest';
import {buildMultipart} from '../../src/utils/array.js';
import {MultipartLoader} from '../../src/io/multipartLoader.js';

/**
 * End-to-end load tests for the 'io/multipartLoader.js' file.
 * These tests use real multipart buffers and the full loader pipeline
 * (parseMultipart → MemoryLoader → JSONTextLoader) without any mocks.
 */
/** @module tests/io */

describe('io', () => {

  /**
   * Tests for {@link MultipartLoader#load} with a real multipart buffer.
   *
   * @function module:tests/io~multipart-loader-load
   */
  test(
    'MultipartLoader load - two JSON parts end-to-end',
    () => {
      const json0 = '{"key": "value0"}';
      const json1 = '{"key": "value1"}';
      const enc = new TextEncoder();
      const dec = new TextDecoder();

      // Build a real multipart buffer containing two JSON parts.
      const parts = [
        {'Content-Type': 'application/json', data: enc.encode(json0)},
        {'Content-Type': 'application/json', data: enc.encode(json1)}
      ];
      const buffer = buildMultipart(parts, 'test-boundary').buffer;

      const loader = new MultipartLoader();
      const loadItems = [];
      let loadFired = false;
      let loadEndFired = false;

      loader.onloaditem = (event) => {
        // JSONTextLoader passes the raw buffer as event.data since
        // MemoryLoader does not convert types.
        loadItems.push(dec.decode(new Uint8Array(event.data)));
      };
      loader.onload = () => {
        loadFired = true;
      };
      loader.onloadend = () => {
        loadEndFired = true;
      };

      loader.load(buffer, 'test-origin', 0);

      // JSONTextLoader is synchronous: all events fire before load() returns.
      assert.equal(loadItems.length, 2, 'onloaditem fired for each part');
      assert.equal(loadItems[0], json0, 'first part data matches');
      assert.equal(loadItems[1], json1, 'second part data matches');
      assert.ok(loadFired, 'onload fired');
      assert.ok(loadEndFired, 'onloadend fired');
      assert.notOk(loader.isLoading(), 'isLoading false after completion');
    }
  );

});
