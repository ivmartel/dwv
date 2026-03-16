// @vitest-environment jsdom
import {describe, test, assert, vi, beforeEach, afterEach} from 'vitest';
import {
  getViewFromDOMImage,
  getViewFromDOMVideo
} from '../../src/image/domReader.js';

/**
 * Tests for the 'image/domReader.js' file.
 */

// ---------------------------------------------------------------------------
// Canvas mock helpers
// ---------------------------------------------------------------------------

/**
 * Build a predictable RGBA flat buffer for `n` pixels.
 * Pixel i has R=i+1, G=i+2, B=i+3, A=255.
 *
 * @param {number} n Number of pixels.
 * @returns {Uint8ClampedArray} RGBA data.
 */
function makeRgbaData(n) {
  const data = new Uint8ClampedArray(n * 4);
  for (let i = 0; i < n; ++i) {
    data[i * 4] = i + 1;
    data[i * 4 + 1] = i + 2;
    data[i * 4 + 2] = i + 3;
    data[i * 4 + 3] = 255;
  }
  return data;
}

/**
 * Convert RGBA data to the expected RGB buffer (alpha stripped).
 *
 * @param {Uint8ClampedArray} rgba RGBA pixel data.
 * @returns {Uint8Array} RGB buffer.
 */
function rgbaToRgb(rgba) {
  const rgb = new Uint8Array((rgba.length / 4) * 3);
  let j = 0;
  for (let i = 0; i < rgba.length; i += 4) {
    rgb[j++] = rgba[i];
    rgb[j++] = rgba[i + 1];
    rgb[j++] = rgba[i + 2];
  }
  return rgb;
}

// ---------------------------------------------------------------------------
// Video mock helper
// ---------------------------------------------------------------------------

/**
 * Minimal mock of an HTMLVideoElement that supports manual `seeked` dispatch.
 * Setting `currentTime` does NOT auto-fire; call `fireSeeked()` from the test.
 */
class MockVideo {
  videoWidth;
  videoHeight;
  duration;
  currentTime = 0;
  #seekedHandlers = [];

  /**
   * @param {number} w Video width in pixels.
   * @param {number} h Video height in pixels.
   * @param {number} duration Duration in seconds.
   */
  constructor(w, h, duration) {
    this.videoWidth = w;
    this.videoHeight = h;
    this.duration = duration;
  }

  /**
   * Register a seeked event handler.
   *
   * @param {string} event Event name.
   * @param {Function} handler Handler function.
   */
  addEventListener(event, handler) {
    if (event === 'seeked') {
      this.#seekedHandlers.push(handler);
    }
  }

  /**
   * Remove a seeked event handler.
   *
   * @param {string} event Event name.
   * @param {Function} handler Handler function.
   */
  removeEventListener(event, handler) {
    if (event === 'seeked') {
      this.#seekedHandlers =
        this.#seekedHandlers.filter((h) => h !== handler);
    }
  }

  /**
   * Simulate the browser firing a `seeked` event.
   * The handler is called with `this` bound to the video element.
   */
  fireSeeked() {
    const event = {target: {duration: this.duration}};
    for (const h of [...this.#seekedHandlers]) {
      h.call(this, event);
    }
  }

  /**
   * Return the number of currently registered seeked handlers.
   *
   * @returns {number} Handler count.
   */
  get seekedHandlerCount() {
    return this.#seekedHandlers.length;
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('image', () => {
  let mockCtx;
  let mockCanvas;

  beforeEach(() => {
    const rgbaData = makeRgbaData(4); // 2×2 pixels
    mockCtx = {
      drawImage: vi.fn(),
      getImageData: vi.fn(() => ({data: rgbaData}))
    };
    mockCanvas = {width: 0, height: 0, getContext: vi.fn(() => mockCtx)};

    vi.spyOn(document, 'createElement').mockImplementation((tag) => {
      if (tag === 'canvas') {
        return mockCanvas;
      }
      return document.createElement(tag);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // -------------------------------------------------------------------------
  // getViewFromDOMImage
  // -------------------------------------------------------------------------

  /**
   * Tests that getViewFromDOMImage returns data and preserves origin as source.
   *
   * @function module:tests/image~dom-reader-image-source
   */
  test('getViewFromDOMImage returns data and source', () => {
    const origin = 'http://example.com/img.png';
    const result = getViewFromDOMImage({width: 2, height: 2}, origin, 0);

    assert.ok(result.data, 'result has data');
    assert.equal(result.source, origin, 'source equals origin');
  });

  /**
   * Tests that meta info fields are populated correctly for a URL origin.
   *
   * @function module:tests/image~dom-reader-image-url-info
   */
  test('getViewFromDOMImage with URL origin sets info fields', () => {
    const origin = 'http://example.com/img.png';
    const {data} = getViewFromDOMImage({width: 3, height: 4}, origin, 1);
    const info = data.meta;

    assert.deepEqual(info.origin.value, [origin], 'origin');
    assert.deepEqual(info.imageWidth.value, [3], 'imageWidth');
    assert.deepEqual(info.imageHeight.value, [4], 'imageHeight');
    assert.deepEqual(info.imageUid.value, [1], 'imageUid index');
    assert.deepEqual(
      info.seriesUid.value, [parseInt(origin, 36).toString()], 'seriesUid'
    );
  });

  /**
   * Tests that meta info fields are populated correctly for a File origin.
   *
   * @function module:tests/image~dom-reader-image-file-info
   */
  test('getViewFromDOMImage with File origin sets info fields', () => {
    const file = new File(['x'], 'photo.png', {type: 'image/png'});
    const {data} = getViewFromDOMImage({width: 2, height: 2}, file, 0);
    const info = data.meta;

    assert.deepEqual(info.fileName.value, ['photo.png'], 'fileName');
    assert.deepEqual(info.fileType.value, ['image/png'], 'fileType');
    assert.ok(
      Array.isArray(info.fileLastModifiedDate.value), 'fileLastModifiedDate'
    );
    assert.deepEqual(
      info.seriesUid.value, [parseInt('photo.png', 36).toString()],
      'seriesUid from filename'
    );
  });

  /**
   * Tests that index defaults to 0 when not supplied.
   *
   * @function module:tests/image~dom-reader-image-default-index
   */
  test('getViewFromDOMImage defaults imageUid to 0 when index is falsy', () => {
    const {data} = getViewFromDOMImage(
      {width: 2, height: 2}, 'http://x.com/a.png', undefined
    );
    assert.deepEqual(data.meta.imageUid.value, [0], 'imageUid defaults to 0');
  });

  /**
   * Tests that the created image has RGB photometric interpretation.
   *
   * @function module:tests/image~dom-reader-image-photometric
   */
  test('getViewFromDOMImage creates RGB image', () => {
    const {data} = getViewFromDOMImage(
      {width: 2, height: 2}, 'http://x.com/a.png', 0
    );
    assert.equal(
      data.image.getPhotometricInterpretation(), 'RGB', 'photometric'
    );
  });

  /**
   * Tests that alpha is stripped: the image buffer holds only RGB bytes.
   *
   * @function module:tests/image~dom-reader-image-strip-alpha
   */
  test('getViewFromDOMImage strips alpha channel from pixel data', () => {
    const rgbaData = makeRgbaData(4); // 2×2
    mockCtx.getImageData.mockReturnValue({data: rgbaData});

    const {data} = getViewFromDOMImage(
      {width: 2, height: 2}, 'http://x.com/a.png', 0
    );
    const expected = rgbaToRgb(rgbaData);
    const actual = data.image.getBuffer();

    assert.equal(actual.length, expected.length, 'buffer length (no alpha)');
    assert.deepEqual(Array.from(actual), Array.from(expected), 'buffer values');
  });

  /**
   * Tests that SeriesInstanceUID is set in the image meta.
   *
   * @function module:tests/image~dom-reader-image-series-uid
   */
  test('getViewFromDOMImage sets SeriesInstanceUID in image meta', () => {
    const origin = 'http://x.com/img.png';
    const {data} = getViewFromDOMImage({width: 2, height: 2}, origin, 0);

    assert.equal(
      data.image.getMeta().SeriesInstanceUID,
      parseInt(origin, 36).toString(),
      'SeriesInstanceUID'
    );
  });

  // -------------------------------------------------------------------------
  // getViewFromDOMVideo
  // -------------------------------------------------------------------------

  /**
   * Tests that onloaditem fires on the first seeked event (URL origin).
   *
   * @function module:tests/image~dom-reader-video-loaditem-url
   */
  test(
    'getViewFromDOMVideo calls onloaditem on first seek (URL origin)',
    () => {
      const origin = 'http://x.com/clip.mp4';
      const video = new MockVideo(2, 2, 0.01); // 1 frame
      const onloaditem = vi.fn();
      const onload = vi.fn();
      const onprogress = vi.fn();
      const onloadend = vi.fn();

      getViewFromDOMVideo(
        video, onloaditem, onload, onprogress, onloadend, origin, 0
      );
      video.fireSeeked();

      assert.equal(onloaditem.mock.calls.length, 1, 'onloaditem called once');
      const {data, source} = onloaditem.mock.calls[0][0];
      assert.equal(source, origin, 'source');
      assert.deepEqual(data.meta.origin.value, [origin], 'origin info');
      assert.deepEqual(data.meta.imageWidth.value, [2], 'imageWidth');
      assert.deepEqual(data.meta.imageHeight.value, [2], 'imageHeight');
    }
  );

  /**
   * Tests that onloaditem fires on the first seeked event (File origin).
   *
   * @function module:tests/image~dom-reader-video-loaditem-file
   */
  test(
    'getViewFromDOMVideo calls onloaditem on first seek (File origin)',
    () => {
      const file = new File(['x'], 'clip.mp4', {type: 'video/mp4'});
      const video = new MockVideo(2, 2, 0.01);
      const onloaditem = vi.fn();

      getViewFromDOMVideo(
        video, onloaditem, vi.fn(), vi.fn(), vi.fn(), file, 0
      );
      video.fireSeeked();

      assert.equal(onloaditem.mock.calls.length, 1, 'onloaditem called');
      const info = onloaditem.mock.calls[0][0].data.meta;
      assert.deepEqual(info.fileName.value, ['clip.mp4'], 'fileName');
      assert.deepEqual(info.fileType.value, ['video/mp4'], 'fileType');
    }
  );

  /**
   * Tests that onprogress fires for every frame.
   *
   * @function module:tests/image~dom-reader-video-progress
   */
  test('getViewFromDOMVideo calls onprogress for each frame', () => {
    const origin = 'http://x.com/clip.mp4';
    // duration = 1/30 + ε → 2 frames
    const video = new MockVideo(2, 2, 1 / 30 + 0.001);
    const onprogress = vi.fn();

    getViewFromDOMVideo(
      video, vi.fn(), vi.fn(), onprogress, vi.fn(), origin, 0
    );
    video.fireSeeked(); // frame 0
    video.fireSeeked(); // frame 1

    assert.equal(onprogress.mock.calls.length, 2, 'onprogress fires twice');
    assert.equal(
      onprogress.mock.calls[0][0].loaded, 0, 'progress loaded frame 0'
    );
    assert.equal(
      onprogress.mock.calls[1][0].loaded, 1, 'progress loaded frame 1'
    );
  });

  /**
   * Tests that onload and onloadend fire after the last frame.
   *
   * @function module:tests/image~dom-reader-video-load-end
   */
  test(
    'getViewFromDOMVideo fires onload and onloadend after last frame',
    () => {
      const origin = 'http://x.com/clip.mp4';
      const video = new MockVideo(2, 2, 0.01); // 1 frame
      const onload = vi.fn();
      const onloadend = vi.fn();

      getViewFromDOMVideo(
        video, vi.fn(), onload, vi.fn(), onloadend, origin, 0
      );
      video.fireSeeked();

      assert.equal(onload.mock.calls.length, 1, 'onload fired');
      assert.equal(onload.mock.calls[0][0].source, origin, 'onload source');
      assert.equal(onloadend.mock.calls.length, 1, 'onloadend fired');
    }
  );

  /**
   * Tests multi-frame: appendFrameBuffer called and listener removed at end.
   *
   * @function module:tests/image~dom-reader-video-multiframe
   */
  test(
    'getViewFromDOMVideo appends frames and removes listener when done',
    () => {
      const origin = 'http://x.com/clip.mp4';
      // duration = 1/30 + ε → 2 frames
      const video = new MockVideo(2, 2, 1 / 30 + 0.001);
      const onloaditem = vi.fn();
      const onload = vi.fn();
      const onloadend = vi.fn();

      getViewFromDOMVideo(
        video, onloaditem, onload, vi.fn(), onloadend, origin, 0
      );

      video.fireSeeked(); // frame 0 — creates image, calls onloaditem
      assert.equal(
        onloaditem.mock.calls.length, 1, 'onloaditem after frame 0'
      );
      assert.equal(onload.mock.calls.length, 0, 'onload not yet called');

      const image = onloaditem.mock.calls[0][0].data.image;
      const appendSpy = vi.spyOn(image, 'appendFrameBuffer');

      video.fireSeeked(); // frame 1 — appends buffer, fires onload/onloadend
      assert.equal(appendSpy.mock.calls.length, 1, 'appendFrameBuffer called');
      assert.equal(appendSpy.mock.calls[0][1], 1, 'frame index passed');
      assert.equal(
        onload.mock.calls.length, 1, 'onload fired after last frame'
      );
      assert.equal(onloadend.mock.calls.length, 1, 'onloadend fired');
      assert.equal(
        video.seekedHandlerCount, 0, 'seeked listener removed'
      );
    }
  );
});
