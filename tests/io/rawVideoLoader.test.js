// @vitest-environment jsdom
import {describe, test, assert, vi, beforeEach, afterEach} from 'vitest';
import * as domReader from '../../src/image/domReader.js';
import {RawVideoLoader} from '../../src/io/rawVideoLoader.js';
import {fileContentTypes} from '../../src/io/filesLoader.js';
import {urlContentTypes} from '../../src/io/urlsLoader.js';

/**
 * Tests for the 'io/rawVideoLoader.js' file.
 */

describe('io', () => {
  const originalCreateElement = document.createElement.bind(document);
  let lastVideo = null;

  class MockVideoElement {
    onloadedmetadata = null;
    src = '';
  }

  beforeEach(() => {
    lastVideo = null;
    document.createElement = vi.fn((tagName) => {
      if (tagName === 'video') {
        lastVideo = new MockVideoElement();
        return lastVideo;
      }
      return originalCreateElement(tagName);
    });
  });

  afterEach(() => {
    document.createElement = originalCreateElement;
    vi.restoreAllMocks();
  });

  /**
   * Tests for {@link RawVideoLoader} events with single frame data.
   *
   * @function module:tests/io~raw-video-loader-canloadurl
   */
  test('RAW video loader canloadurl', () => {
    const loader = new RawVideoLoader();

    // 'ok' tests
    const okTestArgs = [
      {
        url: 'path/data.mp4',
        options: {},
        desc: 'ok extension #0 (mp4)'
      },
      {
        url: 'path/data.ogg',
        options: {},
        desc: 'ok extension #1 (ogg)'
      },
      {
        url: 'path/data.webm',
        options: {},
        desc: 'ok extension #2 (webm)'
      },
      {
        url: 'path/data.ext',
        options: {forceLoader: 'rawvideo'},
        desc: 'ok force #0 (rawvideo)'
      },
      {
        url: 'path/data.ogg',
        options: {forceLoader: 'dicom'},
        desc: 'ok force #1 (dicom + ogg ext)'
      },
      {
        url: 'path/data.ext',
        options: {requestHeaders: [
          {name: 'Accept', value: 'video/ogg'}
        ]},
        desc: 'ok request #0 (ogg)'
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
      {
        url: 'path/data.ogg',
        options: {requestHeaders: [
          {name: 'Accept', value: 'application/dicom'}
        ]},
        desc: 'bad request #1 (dicom + ogg ext)'
      }
    ];

    for (const testArg of notOkTestArgs) {
      assert.notOk(
        loader.canLoadUrl(testArg.url, testArg.options),
        testArg.desc
      );
    }

  });

  /**
   * Tests for {@link RawVideoLoader} canLoadFile.
   *
   * @function module:tests/io~raw-video-loader-canloadfile
   */
  test('RAW video loader canloadfile', () => {
    const loader = new RawVideoLoader();
    assert.ok(
      loader.canLoadFile(new File(['a'], 'a.mp4', {type: 'video/mp4'}))
    );
    assert.notOk(
      loader.canLoadFile(new File(['a'], 'a.png', {type: 'image/png'}))
    );
  });

  /**
   * Tests for {@link RawVideoLoader} canLoadMemory.
   *
   * @function module:tests/io~raw-video-loader-canloadmemory
   */
  test('RAW video loader canloadmemory', () => {
    const loader = new RawVideoLoader();
    assert.notOk(loader.canLoadMemory({}));
    assert.ok(loader.canLoadMemory({filename: 'clip.mp4'}));
  });

  /**
   * Tests for {@link RawVideoLoader} static behavior helpers.
   *
   * @function module:tests/io~raw-video-loader-content-and-state
   */
  test('RAW video loader content and state helpers', () => {
    const loader = new RawVideoLoader();
    loader.setOptions({dummy: true});
    assert.notOk(loader.isLoading());
    assert.equal(loader.loadFileAs(), fileContentTypes.DataURL);
    assert.equal(loader.loadUrlAs(), urlContentTypes.ArrayBuffer);
  });

  /**
   * Tests for {@link RawVideoLoader} load with url origin.
   *
   * @function module:tests/io~raw-video-loader-load-url
   */
  test('RAW video loader load url converts ArrayBuffer to data uri', () => {
    const loader = new RawVideoLoader();
    const buffer = new Uint8Array([65, 66]).buffer;

    loader.load(buffer, 'https://server/path/clip.mp4', 0);

    assert.ok(lastVideo);
    assert.equal(lastVideo.src, 'data:video/mp4;base64,QUI=');
  });

  /**
   * Tests for {@link RawVideoLoader} load with file/data uri input.
   *
   * @function module:tests/io~raw-video-loader-load-file
   */
  test('RAW video loader load file uses source buffer directly', () => {
    const loader = new RawVideoLoader();
    const sourceFile = new File(['fake'], 'clip.mp4', {type: 'video/mp4'});

    loader.load('data:video/mp4;base64,AAAA', sourceFile, 0);

    assert.ok(lastVideo);
    assert.equal(lastVideo.src, 'data:video/mp4;base64,AAAA');
  });

  /**
   * Tests for {@link RawVideoLoader} metadata callback delegation.
   *
   * @function module:tests/io~raw-video-loader-metadata-delegation
   */
  test('RAW video loader delegates metadata event to DOM reader', () => {
    const loader = new RawVideoLoader();
    const viewSpy = vi.spyOn(domReader, 'getViewFromDOMVideo')
      .mockImplementation(() => {});

    const sourceFile = new File(['fake'], 'clip.mp4', {type: 'video/mp4'});
    loader.load('data:video/mp4;base64,AAAA', sourceFile, 5);
    lastVideo.onloadedmetadata({target: lastVideo});

    assert.equal(viewSpy.mock.calls.length, 1);
    const callArgs = viewSpy.mock.calls[0];
    assert.equal(callArgs[0], lastVideo);
    assert.equal(typeof callArgs[1], 'function');
    assert.equal(typeof callArgs[2], 'function');
    assert.equal(typeof callArgs[3], 'function');
    assert.equal(typeof callArgs[4], 'function');
    assert.equal(callArgs[5], sourceFile);
    assert.equal(callArgs[6], 5);
  });

  /**
   * Tests for {@link RawVideoLoader} metadata handler error forwarding.
   *
   * @function module:tests/io~raw-video-loader-metadata-error
   */
  test('RAW video loader forwards metadata processing errors', () => {
    const loader = new RawVideoLoader();
    const thrownError = new Error('mock-video-view-error');
    vi.spyOn(domReader, 'getViewFromDOMVideo').mockImplementation(() => {
      throw thrownError;
    });

    let errorEvent = null;
    let loadEndEvent = null;
    loader.onerror = (event) => {
      errorEvent = event;
    };
    loader.onloadend = (event) => {
      loadEndEvent = event;
    };

    const sourceFile = new File(['fake'], 'clip.mp4', {type: 'video/mp4'});
    loader.load('data:video/mp4;base64,AAAA', sourceFile, 2);
    lastVideo.onloadedmetadata({target: lastVideo});

    assert.ok(errorEvent);
    assert.equal(errorEvent.error, thrownError);
    assert.equal(errorEvent.source, sourceFile);
    assert.ok(loadEndEvent);
    assert.equal(loadEndEvent.source, sourceFile);
  });

  /**
   * Tests for {@link RawVideoLoader} abort callbacks.
   *
   * @function module:tests/io~raw-video-loader-abort
   */
  test('RAW video loader abort fires abort and loadend', () => {
    const loader = new RawVideoLoader();
    let abortEvent = null;
    let loadEndEvent = null;
    loader.onabort = (event) => {
      abortEvent = event;
    };
    loader.onloadend = (event) => {
      loadEndEvent = event;
    };

    loader.abort();

    assert.ok(abortEvent);
    assert.deepEqual(abortEvent, {});
    assert.ok(loadEndEvent);
    assert.deepEqual(loadEndEvent, {});
  });

});
