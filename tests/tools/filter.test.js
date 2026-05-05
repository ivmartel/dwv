// @vitest-environment jsdom
import {describe, test, assert, vi, afterEach} from 'vitest';

vi.mock('../../src/tools/index.js', () => ({
  toolList: {},
  toolOptions: {},
  defaultToolList: {},
  defaultToolOptions: {
    draw: {},
    filter: {}
  }
}));

vi.mock('../../src/app/application.js', () => ({
  App: class App {}
}));

vi.mock('../../src/utils/logger.js', () => ({
  logger: {
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn()
  }
}));

import {Filter, Threshold, Sharpen, Sobel} from '../../src/tools/filter.js';
import {Size} from '../../src/image/size.js';
import {Spacing} from '../../src/image/spacing.js';
import {Geometry} from '../../src/image/geometry.js';
import {Image} from '../../src/image/image.js';
import {Point3D} from '../../src/math/point.js';

/**
 * Small greyscale image for filter runs (3×3 matches convolution kernels).
 *
 * @param {number[]} values Pixel values row-major.
 * @returns {Image} The image.
 */
function makeImage3x3(values) {
  const geometry = new Geometry(
    [new Point3D(0, 0, 0)],
    new Size([3, 3, 1]),
    new Spacing([1, 1, 1])
  );
  return new Image(geometry, new Int16Array(values));
}

/**
 * Minimal app stub with image data for {@link Threshold}/{@link Sharpen}/{@link Sobel}.
 *
 * @param {Image} image Pixel data.
 * @returns {object} App mock.
 */
function makeFilterApp(image) {
  const dataId = 'test-data';
  return {
    dataId,
    image,
    getData: vi.fn(() => ({image})),
    setImage: vi.fn(),
    render: vi.fn(),
    addToUndoStack: vi.fn(),
    onKeydown: vi.fn()
  };
}

/**
 * Image passed to {@link App#setImage} from {@link RunFilterCommand#execute}.
 *
 * @param {object} app Mock app from {@link makeFilterApp}.
 * @returns {Image} The new image for `dataId`.
 */
function getResultImageFromSetImage(app) {
  assert.equal(app.setImage.mock.calls.length, 1);
  const [dataId, image] = app.setImage.mock.calls[0];
  assert.equal(dataId, app.dataId);
  return image;
}

/**
 * Filter entry that stores listeners like shape/DOM-style APIs used by {@link Filter}.
 */
class RecordingFilter {
  /** @type {Map<string, Function[]>} */
  #byType = new Map();

  /**
   * @param {object} app Associated application.
   */
  constructor(app) {
    this.app = app;
  }

  init() {}

  activate(_bool) {}

  /**
   * @param {string} type Event type.
   * @param {Function} cb Callback.
   */
  addEventListener(type, cb) {
    const list = this.#byType.get(type) ?? [];
    list.push(cb);
    this.#byType.set(type, list);
  }

  /**
   * @param {string} type Event type.
   * @param {Function} cb Callback.
   */
  removeEventListener(type, cb) {
    const list = this.#byType.get(type);
    if (!list) {
      return;
    }
    const i = list.indexOf(cb);
    if (i !== -1) {
      list.splice(i, 1);
    }
  }

  /**
   * @param {string} type Event type.
   * @param {object} payload Event payload.
   */
  emit(type, payload) {
    for (const cb of this.#byType.get(type) ?? []) {
      cb(payload);
    }
  }

  run() {}
}

describe('tools/filter', () => {

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Filter', () => {

    test('getOptionsType returns instance', () => {
      const tool = new Filter({});
      assert.equal(tool.getOptionsType(), 'instance');
    });

    test('getEventNames lists filterrun and filterundo', () => {
      const tool = new Filter({});
      assert.deepEqual(tool.getEventNames(), ['filterrun', 'filterundo']);
    });

    test('setOptions builds filter instances', () => {
      const app = {};
      const tool = new Filter(app);
      tool.setOptions({a: RecordingFilter});
      const list = tool.getFilterList();
      assert.ok(list.a instanceof RecordingFilter);
      assert.equal(list.a.app, app);
    });

    test('hasFilter returns entry when defined', () => {
      const tool = new Filter({});
      tool.setOptions({roi: RecordingFilter});
      assert.ok(tool.hasFilter('roi'));
      assert.notOk(tool.hasFilter('missing'));
    });

    test('setFeatures throws for unknown filter name', () => {
      const tool = new Filter({});
      tool.setOptions({only: RecordingFilter});
      assert.throws(
        () => tool.setFeatures({filterName: 'other'}),
        /Unknown filter: 'other'/);
    });

    test('keydown forwards to app with Filter context', () => {
      const app = {onKeydown: vi.fn()};
      const tool = new Filter(app);
      const event = {key: 'Enter'};
      tool.keydown(event);
      assert.equal(event.context, 'Filter');
      assert.equal(app.onKeydown.mock.calls.length, 1);
      assert.equal(app.onKeydown.mock.calls[0][0], event);
    });

    test('activate wires filterrun/filterundo to Filter listeners', () => {
      const tool = new Filter({});
      tool.setOptions({rec: RecordingFilter});
      const spy = vi.fn();
      tool.addEventListener('filterrun', spy);
      tool.addEventListener('filterundo', spy);
      tool.activate(true);
      const rec = tool.getFilterList().rec;
      rec.emit('filterrun', {type: 'filterrun', id: 'x'});
      rec.emit('filterundo', {type: 'filterundo', id: 'y'});
      assert.equal(spy.mock.calls.length, 2);
      tool.activate(false);
      spy.mockClear();
      rec.emit('filterrun', {});
      assert.equal(spy.mock.calls.length, 0);
    });

    test('setFeatures selects filter and optional run dispatches command', () => {
      const img = makeImage3x3(Array(9).fill(10));
      const app = makeFilterApp(img);
      const tool = new Filter(app);
      tool.setOptions({threshold: Threshold});
      tool.init();
      tool.activate(true);
      const spy = vi.fn();
      tool.addEventListener('filterrun', spy);
      tool.setFeatures({
        filterName: 'threshold',
        run: true,
        runArgs: {
          dataId: app.dataId,
          min: 0,
          max: 255
        }
      });
      assert.equal(app.render.mock.calls.length, 1);
      assert.equal(app.addToUndoStack.mock.calls.length, 1);
      assert.equal(spy.mock.calls.length, 1);
      assert.equal(spy.mock.calls[0][0].type, 'filterrun');
      const out = getResultImageFromSetImage(app);
      assert.deepEqual(Array.from(out.getBuffer()), Array(9).fill(10));
    });

  });

  describe('Threshold', () => {

    test('run throws without dataId', () => {
      const tool = new Threshold(makeFilterApp(makeImage3x3(Array(9).fill(1))));
      assert.throws(
        () => tool.run({min: 0, max: 255}),
        /No dataId to run threshod filter on/);
    });

    test('run executes filter command and pushes undo', () => {
      const img = makeImage3x3([10, 20, 30, 40, 50, 60, 70, 80, 90]);
      const app = makeFilterApp(img);
      const tool = new Threshold(app);
      tool.run({
        dataId: app.dataId,
        min: 25,
        max: 75
      });
      assert.equal(app.render.mock.calls.length, 1);
      assert.equal(app.addToUndoStack.mock.calls.length, 1);
      const pushed = app.addToUndoStack.mock.calls[0][0];
      assert.equal(typeof pushed.execute, 'function');
      assert.equal(typeof pushed.undo, 'function');
      const out = getResultImageFromSetImage(app);
      // imageMin = 10; outside [25, 75] → 10; inside → unchanged
      assert.deepEqual(
        Array.from(out.getBuffer()),
        [10, 10, 30, 40, 50, 60, 70, 10, 10]);
    });

  });

  describe('Sharpen', () => {

    test('run throws without dataId', () => {
      const tool = new Sharpen(makeFilterApp(makeImage3x3(Array(9).fill(1))));
      assert.throws(
        () => tool.run({}),
        /No dataId to run sharpen filter on/);
    });

    test('run executes filter command and pushes undo', () => {
      const img = makeImage3x3(Array(9).fill(10));
      const app = makeFilterApp(img);
      const tool = new Sharpen(app);
      tool.run({dataId: app.dataId});
      assert.equal(app.render.mock.calls.length, 1);
      assert.equal(app.addToUndoStack.mock.calls.length, 1);
      const out = getResultImageFromSetImage(app);
      const buf = out.getBuffer();
      for (let i = 0; i < 9; ++i) {
        assert.equal(buf[i], 10, `pixel ${i} flat-field sharpen`);
      }
    });

  });

  describe('Sobel', () => {

    test('run throws without dataId', () => {
      const tool = new Sobel(makeFilterApp(makeImage3x3(Array(9).fill(1))));
      assert.throws(
        () => tool.run({}),
        /No dataId to run sobel filter on/);
    });

    test('run executes filter command and pushes undo', () => {
      const img = makeImage3x3(Array(9).fill(10));
      const app = makeFilterApp(img);
      const tool = new Sobel(app);
      tool.run({dataId: app.dataId});
      assert.equal(app.render.mock.calls.length, 1);
      assert.equal(app.addToUndoStack.mock.calls.length, 1);
      const out = getResultImageFromSetImage(app);
      const buf = out.getBuffer();
      for (let i = 0; i < 9; ++i) {
        assert.equal(buf[i], 0, `pixel ${i} zero gradient on flat field`);
      }
    });

  });

});
