import {describe, test, assert, vi, beforeEach, afterEach} from 'vitest';
import * as domReader from '../../src/image/domReader.js';
import {RawImageLoader} from '../../src/io/rawImageLoader.js';
import {fileContentTypes} from '../../src/io/filesLoader.js';
import {urlContentTypes} from '../../src/io/urlsLoader.js';

/**
 * Tests for the 'io/rawImageLoader.js' file.
 */

describe('io', () => {
  const originalImage = globalThis.Image;
  const originalCreateObjectURL = globalThis.URL.createObjectURL;
  let lastImage = null;

  class MockImage {
    onload = null;
    _src = '';

    constructor() {
      lastImage = this;
    }

    set src(value) {
      this._src = value;
      if (typeof this.onload === 'function') {
        this.onload({});
      }
    }
  }

  beforeEach(() => {
    lastImage = null;
    globalThis.Image = MockImage;
    globalThis.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
  });

  afterEach(() => {
    globalThis.Image = originalImage;
    globalThis.URL.createObjectURL = originalCreateObjectURL;
    vi.restoreAllMocks();
  });

  /**
   * Tests for {@link RawImageLoader} events with single frame data.
   *
   * @function module:tests/io~raw-image-loader-canloadurl
   */
  test('RAW image loader canloadurl', () => {
    const loader = new RawImageLoader();

    // 'ok' tests
    const okTestArgs = [
      {
        url: 'path/data.jpeg',
        options: {},
        desc: 'ok extension #0 (jpeg)'
      },
      {
        url: 'path/data.jpg',
        options: {},
        desc: 'ok extension #1 (jpg)'
      },
      {
        url: 'path/data.png',
        options: {},
        desc: 'ok extension #2 (png)'
      },
      {
        url: 'path/data.gif',
        options: {},
        desc: 'ok extension #3 (gif)'
      },
      {
        url: 'path/data.ext',
        options: {forceLoader: 'rawimage'},
        desc: 'ok force #0 (rawimage)'
      },
      {
        url: 'path/data.png',
        options: {forceLoader: 'dicom'},
        desc: 'ok force #1 (dicom + png ext)'
      },
      {
        url: 'path/data.ext',
        options: {requestHeaders: [
          {name: 'Accept', value: 'image/png'}
        ]},
        desc: 'ok request #0 (png)'
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
        url: 'path/data.png',
        options: {requestHeaders: [
          {name: 'Accept', value: 'application/dicom'}
        ]},
        desc: 'bad request #1 (dicom + png ext)'
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
   * Tests for {@link RawImageLoader} canLoadFile.
   *
   * @function module:tests/io~raw-image-loader-canloadfile
   */
  test('RAW image loader canloadfile', () => {
    const loader = new RawImageLoader();
    assert.ok(loader.canLoadFile(new File(['a'], 'a.png', {type: 'image/png'})));
    assert.notOk(loader.canLoadFile(new File(['a'], 'a.dcm', {type: 'application/dicom'})));
  });

  /**
   * Tests for {@link RawImageLoader} canLoadMemory.
   *
   * @function module:tests/io~raw-image-loader-canloadmemory
   */
  test('RAW image loader canloadmemory', () => {
    const loader = new RawImageLoader();
    assert.notOk(loader.canLoadMemory({}));
    // Current implementation rebuilds a File with no type, so this is false.
    assert.notOk(loader.canLoadMemory({filename: 'image.png'}));
  });

  /**
   * Tests for {@link RawImageLoader} static behavior helpers.
   *
   * @function module:tests/io~raw-image-loader-content-and-state
   */
  test('RAW image loader content and state helpers', () => {
    const loader = new RawImageLoader();
    loader.setOptions({dummy: true});
    assert.ok(loader.isLoading());
    assert.equal(loader.loadFileAs(), fileContentTypes.DataURL);
    assert.equal(loader.loadUrlAs(), urlContentTypes.ArrayBuffer);
  });

  /**
   * Tests for {@link RawImageLoader} load from file/data url.
   *
   * @function module:tests/io~raw-image-loader-load-file
   */
  test('RAW image loader load file data and fires callbacks', () => {
    const loader = new RawImageLoader();
    const viewSpy = vi.spyOn(domReader, 'getViewFromDOMImage')
      .mockReturnValue({id: 'view-data'});

    let progressEvent = null;
    let loadItemEvent = null;
    let loadEvent = null;
    let loadEndEvent = null;
    loader.onprogress = (event) => {
      progressEvent = event;
    };
    loader.onloaditem = (event) => {
      loadItemEvent = event;
    };
    loader.onload = (event) => {
      loadEvent = event;
    };
    loader.onloadend = (event) => {
      loadEndEvent = event;
    };

    const sourceFile = new File(['fake'], 'img.png', {type: 'image/png'});
    loader.load('data:image/png;base64,AAAA', sourceFile, 3);

    assert.ok(lastImage);
    assert.equal(lastImage._src, 'data:image/png;base64,AAAA');
    assert.equal(viewSpy.mock.calls.length, 1);

    assert.ok(progressEvent);
    assert.equal(progressEvent.index, 3);
    assert.equal(progressEvent.source, sourceFile);
    assert.ok(loadItemEvent);
    assert.deepEqual(loadItemEvent, {id: 'view-data'});
    assert.ok(loadEvent);
    assert.deepEqual(loadEvent, {id: 'view-data'});
    assert.ok(loadEndEvent);
    assert.equal(loadEndEvent.source, sourceFile);
  });

  /**
   * Tests for {@link RawImageLoader} load from url response.
   *
   * @function module:tests/io~raw-image-loader-load-url
   */
  test('RAW image loader load url data creates object url', () => {
    const loader = new RawImageLoader();
    vi.spyOn(domReader, 'getViewFromDOMImage')
      .mockReturnValue({id: 'url-view'});

    const buffer = new ArrayBuffer(4);
    const origin = 'https://server/path/image.jpg';
    loader.load(buffer, origin, 0);

    assert.equal(globalThis.URL.createObjectURL.mock.calls.length, 1);
    assert.ok(lastImage);
    assert.equal(lastImage._src, 'blob:mock-url');
  });

  /**
   * Tests for {@link RawImageLoader} load error forwarding.
   *
   * @function module:tests/io~raw-image-loader-load-error
   */
  test('RAW image loader forwards view conversion errors', () => {
    const loader = new RawImageLoader();
    const thrownError = new Error('mock-get-view-error');
    vi.spyOn(domReader, 'getViewFromDOMImage').mockImplementation(() => {
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

    const sourceFile = new File(['fake'], 'img.png', {type: 'image/png'});
    loader.load('data:image/png;base64,AAAA', sourceFile, 1);

    assert.ok(errorEvent);
    assert.equal(errorEvent.error, thrownError);
    assert.equal(errorEvent.source, sourceFile);
    assert.ok(loadEndEvent);
    assert.equal(loadEndEvent.source, sourceFile);
  });

  /**
   * Tests for {@link RawImageLoader} abort callbacks.
   *
   * @function module:tests/io~raw-image-loader-abort
   */
  test('RAW image loader abort fires abort and loadend', () => {
    const loader = new RawImageLoader();
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
