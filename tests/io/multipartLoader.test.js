// @vitest-environment jsdom
import {describe, test, assert, vi, beforeEach} from 'vitest';

// Capture the most-recently created MemoryLoader instance so tests can
// trigger its event callbacks manually.
const capturedML = vi.hoisted(() => ({instance: null}));

vi.mock('../../src/io/memoryLoader.js', () => ({
  MemoryLoader: vi.fn(function MockMemoryLoader() {
    capturedML.instance = this;
    this.load = vi.fn();
  })
}));

vi.mock('../../src/utils/array.js', () => ({
  parseMultipart: vi.fn().mockReturnValue([])
}));

import {MultipartLoader} from '../../src/io/multipartLoader.js';
import {parseMultipart} from '../../src/utils/array.js';
import {fileContentTypes} from '../../src/io/filesLoader.js';
import {urlContentTypes} from '../../src/io/urlsLoader.js';

/**
 * Tests for the 'io/multipartLoader.js' file.
 */
/** @module tests/io */

describe('io', () => {

  describe('MultipartLoader', () => {

    beforeEach(() => {
      vi.clearAllMocks();
      capturedML.instance = null;
    });

    /**
     * Tests for {@link MultipartLoader#canLoadMediaType}.
     */
    test('canLoadMediaType', () => {
      const loader = new MultipartLoader();
      assert.ok(
        loader.canLoadMediaType('multipart/related'), 'multipart/related');
      assert.notOk(
        loader.canLoadMediaType('application/dicom'), 'not dicom');
      assert.notOk(
        loader.canLoadMediaType('application/json'), 'not json');
    });

    /**
     * Tests for {@link MultipartLoader#isLoaderName}.
     */
    test('isLoaderName', () => {
      const loader = new MultipartLoader();
      assert.ok(loader.isLoaderName('multipart'), 'multipart');
      assert.notOk(loader.isLoaderName('dicom'), 'not dicom');
    });

    /**
     * Tests for {@link MultipartLoader#loadFileAs}.
     */
    test('loadFileAs', () => {
      const loader = new MultipartLoader();
      assert.equal(loader.loadFileAs(), fileContentTypes.ArrayBuffer);
    });

    /**
     * Tests for {@link MultipartLoader#loadUrlAs}.
     */
    test('loadUrlAs', () => {
      const loader = new MultipartLoader();
      assert.equal(loader.loadUrlAs(), urlContentTypes.ArrayBuffer);
    });

    /**
     * Tests for {@link MultipartLoader#canLoadFile}.
     */
    test('canLoadFile', () => {
      const loader = new MultipartLoader();
      assert.ok(
        loader.canLoadFile({type: 'multipart/related', name: 'x'}),
        'multipart/related type');
      assert.notOk(
        loader.canLoadFile({type: 'application/dicom', name: 'x'}),
        'not dicom type');
      assert.notOk(
        loader.canLoadFile({name: 'data.bin'}),
        'no type, no extension match');
    });

    /**
     * Tests for {@link MultipartLoader#canLoadUrl}.
     */
    test('canLoadUrl', () => {
      const loader = new MultipartLoader();

      const okArgs = [
        {
          url: 'path/data?contentType=multipart/related',
          options: {},
          desc: 'ok contentType'
        },
        {
          url: 'path/data',
          options: {forceLoader: 'multipart'},
          desc: 'ok forceLoader'
        },
        {
          url: 'path/data',
          options: {
            requestHeaders: [{name: 'Accept', value: 'multipart/related'}]
          },
          desc: 'ok Accept header'
        }
      ];
      for (const {url, options, desc} of okArgs) {
        assert.ok(loader.canLoadUrl(url, options), desc);
      }

      const notOkArgs = [
        {
          url: 'path/data',
          options: {},
          desc: 'no extension, no content type'
        },
        {
          url: 'path/data?contentType=application/dicom',
          options: {},
          desc: 'wrong contentType'
        },
        {
          url: 'path/data',
          options: {forceLoader: 'dicom'},
          desc: 'wrong forceLoader'
        },
        {
          url: 'path/data',
          options: {
            requestHeaders: [{name: 'Accept', value: 'application/dicom'}]
          },
          desc: 'wrong Accept header'
        }
      ];
      for (const {url, options, desc} of notOkArgs) {
        assert.notOk(loader.canLoadUrl(url, options), desc);
      }
    });

    /**
     * Tests for {@link MultipartLoader#canLoadMemory}.
     */
    test('canLoadMemory', () => {
      const loader = new MultipartLoader();
      assert.ok(
        loader.canLoadMemory({'Content-Type': 'multipart/related'}),
        'multipart/related Content-Type');
      assert.notOk(
        loader.canLoadMemory({'Content-Type': 'application/dicom'}),
        'wrong Content-Type');
      assert.notOk(
        loader.canLoadMemory({filename: 'data.bin'}),
        'filename only, no extension match');
    });

    /**
     * Tests for {@link MultipartLoader#load}.
     */
    test('load fires onloadstart and calls parseMultipart', () => {
      const loader = new MultipartLoader();
      const buffer = new ArrayBuffer(8);
      let startEvent = null;
      loader.onloadstart = (event) => {
        startEvent = event;
      };

      loader.load(buffer, 'test-origin', 0);

      assert.deepEqual(
        startEvent, {source: 'test-origin'}, 'onloadstart fired with origin');
      assert.ok(loader.isLoading(), 'isLoading true after load');
      assert.equal(
        parseMultipart.mock.calls.length, 1, 'parseMultipart called once');
      assert.equal(
        parseMultipart.mock.calls[0][0], buffer,
        'parseMultipart called with buffer');
      assert.equal(
        capturedML.instance.load.mock.calls.length, 1,
        'MemoryLoader.load called once');
    });

    test(
      'load transforms progress: loaded = 50 + inner / 2, index forwarded',
      () => {
        const loader = new MultipartLoader();
        const progressEvents = [];
        loader.onprogress = (e) => progressEvents.push({...e});
        loader.load(new ArrayBuffer(8), 'origin', 3);

        capturedML.instance.onprogress({loaded: 0});
        capturedML.instance.onprogress({loaded: 100});

        assert.equal(progressEvents.length, 2, 'two progress events fired');
        assert.equal(progressEvents[0].loaded, 50,
          'loaded=0 → 50 + 0/2 = 50');
        assert.equal(progressEvents[0].index, 3, 'index forwarded for first');
        assert.equal(progressEvents[1].loaded, 100,
          'loaded=100 → 50 + 100/2 = 100');
        assert.equal(progressEvents[1].index, 3, 'index forwarded for second');
      });

    test('load: onloaditem by reference; onload fires once per URL', () => {
      const loader = new MultipartLoader();
      const loads = [];
      loader.onload = (e) => loads.push(e);
      loader.load(new ArrayBuffer(8), 'origin', 0);

      assert.equal(
        capturedML.instance.onloaditem, loader.onloaditem,
        'onloaditem forwarded by reference');

      capturedML.instance.onload({source: 'origin'});
      assert.equal(loads.length, 1,
        'loader.onload called once for single URL');
    });

    test('load: onloadend resets isLoading then fires', () => {
      const loader = new MultipartLoader();
      const loadEnds = [];
      loader.onloadend = (e) => loadEnds.push(e);
      loader.load(new ArrayBuffer(8), 'origin', 0);

      assert.ok(loader.isLoading(), 'isLoading true before loadend');
      capturedML.instance.onloadend({source: 'origin'});
      assert.notOk(loader.isLoading(), 'isLoading false after loadend');
      assert.equal(loadEnds.length, 1, 'onloadend fired once');
    });

    test('load assigns onerror and onabort by reference', () => {
      const loader = new MultipartLoader();
      loader.load(new ArrayBuffer(8), 'origin', 0);

      assert.equal(
        capturedML.instance.onerror, loader.onerror,
        'onerror forwarded by reference');
      assert.equal(
        capturedML.instance.onabort, loader.onabort,
        'onabort forwarded by reference');
    });

    test('load with 2 URLs: accumulates parts, fires MemoryLoader once', () => {
      const loader = new MultipartLoader();
      loader.setOptions({numberOfFiles: 2});

      parseMultipart
        .mockReturnValueOnce([{data: 'part-a'}])
        .mockReturnValueOnce([{data: 'part-b'}]);

      let startCount = 0;
      loader.onloadstart = () => startCount++;

      // first URL — MemoryLoader must not be created yet
      loader.load(new ArrayBuffer(8), 'url-0', 0);
      assert.equal(capturedML.instance, null,
        'MemoryLoader not created after first of two URLs');
      assert.ok(loader.isLoading(), 'still loading after first URL');
      assert.equal(startCount, 1, 'onloadstart fired once');

      // second URL — MemoryLoader must be created with combined parts
      loader.load(new ArrayBuffer(8), 'url-1', 1);
      assert.notEqual(capturedML.instance, null,
        'MemoryLoader created after last URL');
      assert.equal(capturedML.instance.load.mock.calls.length, 1,
        'MemoryLoader.load called exactly once');
      assert.deepEqual(
        capturedML.instance.load.mock.calls[0][0],
        [{data: 'part-a'}, {data: 'part-b'}],
        'MemoryLoader receives combined parts from both URLs');
      assert.equal(startCount, 1, 'onloadstart still fired only once');
      assert.equal(parseMultipart.mock.calls.length, 2,
        'parseMultipart called once per URL');
    });

    /**
     * Tests for {@link MultipartLoader#abort}.
     */
    test('abort resets isLoading and fires onabort and onloadend', () => {
      const loader = new MultipartLoader();
      const aborts = [];
      const loadEnds = [];
      loader.onabort = (e) => aborts.push(e);
      loader.onloadend = (e) => loadEnds.push(e);

      loader.load(new ArrayBuffer(8), 'origin', 0);
      assert.ok(loader.isLoading(), 'isLoading true before abort');

      loader.abort();
      assert.notOk(loader.isLoading(), 'isLoading false after abort');
      assert.equal(aborts.length, 1, 'onabort fired once');
      assert.equal(loadEnds.length, 1, 'onloadend fired once');
    });

  });

});
