import {describe, test, assert, vi, beforeEach} from 'vitest';

const {MockLoader} = vi.hoisted(() => {
  /**
   * Test double for the IO loaders used by the load controller.
   * Callbacks are driven manually by the tests.
   */
  class HoistedMockLoader {
    static instances = [];
    static throwOnLoad = false;
    static hasTimeout = true;

    charset = undefined;
    loadArgs = null;
    abortCalled = false;

    /**
     * Create a mock loader and keep track of it.
     */
    constructor() {
      if (HoistedMockLoader.hasTimeout) {
        this.ontimeout = null;
      }
      HoistedMockLoader.instances.push(this);
    }

    /**
     * Reset static state between tests.
     */
    static reset() {
      HoistedMockLoader.instances = [];
      HoistedMockLoader.throwOnLoad = false;
      HoistedMockLoader.hasTimeout = true;
    }

    /**
     * Store the default character set.
     *
     * @param {string} charset The character set.
     */
    setDefaultCharacterSet(charset) {
      this.charset = charset;
    }

    /**
     * Store the load arguments, throw if configured to.
     *
     * @param {Array} data The data to load.
     * @param {object} [options] The load options.
     */
    load(data, options) {
      this.loadArgs = {data, options};
      if (HoistedMockLoader.throwOnLoad) {
        throw new Error('load failed');
      }
    }

    /**
     * Record abort.
     */
    abort() {
      this.abortCalled = true;
    }
  }
  return {MockLoader: HoistedMockLoader};
});

vi.mock('../../src/io/filesLoader.js', () => ({
  FilesLoader: class FilesLoader extends MockLoader {}
}));
vi.mock('../../src/io/urlsLoader.js', () => ({
  UrlsLoader: class UrlsLoader extends MockLoader {}
}));
vi.mock('../../src/io/memoryLoader.js', () => ({
  MemoryLoader: class MemoryLoader extends MockLoader {}
}));

import {LoadController, loadEventNames} from '../../src/app/loadController.js';

/**
 * Tests for the 'app/loadController.js' file.
 */
/** @module tests/app */

/**
 * Listen to all load events of a controller.
 *
 * @param {LoadController} controller The controller.
 * @returns {Array} The list of received {type, detail}, filled on the go.
 */
function recordEvents(controller) {
  const events = [];
  for (const name of loadEventNames) {
    controller.addEventListener(name, (event) => {
      events.push({
        type: event.type,
        detail: /** @type {CustomEvent} */ (event).detail
      });
    });
  }
  return events;
}

/**
 * Get the last created mock loader.
 *
 * @returns {MockLoader} The loader.
 */
function lastLoader() {
  return MockLoader.instances[MockLoader.instances.length - 1];
}

describe('app', () => {

  beforeEach(() => {
    MockLoader.reset();
  });

  /**
   * Tests for {@link LoadController} loader selection.
   */
  describe('LoadController loaders', () => {

    test('loadFiles - uses FilesLoader with charset', () => {
      const controller = new LoadController('ISO_IR 100');
      const files = [{name: 'a.dcm'}];
      controller.loadFiles(files, '0');

      assert.equal(MockLoader.instances.length, 1);
      const loader = lastLoader();
      assert.equal(loader.constructor.name, 'FilesLoader');
      assert.equal(loader.charset, 'ISO_IR 100');
      assert.equal(loader.loadArgs.data, files);
      assert.isUndefined(loader.loadArgs.options);
    });

    test('loadURLs - uses UrlsLoader with charset and options', () => {
      const controller = new LoadController('ISO_IR 192');
      const urls = ['http://host/a.dcm'];
      const options = {withCredentials: true};
      controller.loadURLs(urls, '0', options);

      const loader = lastLoader();
      assert.equal(loader.constructor.name, 'UrlsLoader');
      assert.equal(loader.charset, 'ISO_IR 192');
      assert.equal(loader.loadArgs.data, urls);
      assert.equal(loader.loadArgs.options, options);
    });

    test('loadImageObject - uses MemoryLoader', () => {
      const controller = new LoadController('ISO_IR 100');
      const data = [{name: 'a', filename: 'a.dcm', data: new ArrayBuffer(1)}];
      controller.loadImageObject(data, '0');

      const loader = lastLoader();
      assert.equal(loader.constructor.name, 'MemoryLoader');
      // memory loader does not get the default charset
      assert.isUndefined(loader.charset);
      assert.equal(loader.loadArgs.data, data);
    });

    test('each load creates a new loader', () => {
      const controller = new LoadController();
      controller.loadFiles([], '0');
      controller.loadFiles([], '1');
      assert.equal(MockLoader.instances.length, 2);
      assert.notEqual(MockLoader.instances[0], MockLoader.instances[1]);
    });

  });

  /**
   * Tests for {@link LoadController} events.
   */
  describe('LoadController events', () => {

    test('loadEventNames', () => {
      assert.deepEqual(loadEventNames, [
        'loadstart',
        'loadprogress',
        'loaditem',
        'load',
        'loadend',
        'error',
        'abort',
        'timeout'
      ]);
    });

    test('forwards loader callbacks as tagged events', () => {
      const controller = new LoadController();
      const events = recordEvents(controller);
      controller.loadFiles([], 'id0');
      const loader = lastLoader();

      loader.onloadstart({source: 'src'});
      loader.onprogress({loaded: 50, total: 100});
      loader.onloaditem({data: 'item'});
      loader.onload({source: 'src'});
      loader.onerror({error: 'err'});
      loader.onabort({});
      loader.ontimeout({});
      loader.onloadend({source: 'src'});

      assert.deepEqual(events.map((e) => e.type), [
        'loadstart',
        'loadprogress',
        'loaditem',
        'load',
        'error',
        'abort',
        'timeout',
        'loadend'
      ]);
      for (const event of events) {
        assert.equal(event.detail.dataid, 'id0', `${event.type} dataid`);
        assert.equal(event.detail.loadtype, 'image', `${event.type} loadtype`);
      }
      // original event content is kept
      assert.equal(events[0].detail.source, 'src');
      assert.equal(events[1].detail.loaded, 50);
      assert.equal(events[1].detail.total, 100);
      assert.equal(events[2].detail.data, 'item');
      assert.equal(events[4].detail.error, 'err');
    });

    test('local info overrides loader event info', () => {
      const controller = new LoadController();
      const events = recordEvents(controller);
      controller.loadFiles([], 'id0');
      lastLoader().onload({dataid: 'other', loadtype: 'other'});
      assert.equal(events[0].detail.dataid, 'id0');
      assert.equal(events[0].detail.loadtype, 'image');
    });

    test('no timeout callback if loader does not support it', () => {
      MockLoader.hasTimeout = false;
      const controller = new LoadController();
      controller.loadFiles([], 'id0');
      assert.isUndefined(lastLoader().ontimeout);
    });

    test('loaditem isfirstitem flag', () => {
      const controller = new LoadController();
      const events = recordEvents(controller);
      controller.loadFiles([], 'id0');
      const loader = lastLoader();

      loader.onloadstart({});
      loader.onloaditem({});
      loader.onloaditem({});
      loader.onloaditem({});
      loader.onloadend({});
      // item after end: no current loader, no flag
      loader.onloaditem({});

      const items = events.filter((e) => e.type === 'loaditem');
      assert.equal(items.length, 4);
      assert.isTrue(items[0].detail.isfirstitem);
      assert.isFalse(items[1].detail.isfirstitem);
      assert.isFalse(items[2].detail.isfirstitem);
      assert.isUndefined(items[3].detail.isfirstitem);
    });

    test('isfirstitem is per data id', () => {
      const controller = new LoadController();
      const events = recordEvents(controller);
      controller.loadFiles([], 'id0');
      const loader0 = lastLoader();
      controller.loadURLs([], 'id1');
      const loader1 = lastLoader();

      loader0.onloadstart({});
      loader1.onloadstart({});
      loader0.onloaditem({});
      loader1.onloaditem({});
      loader0.onloaditem({});

      const items = events.filter((e) => e.type === 'loaditem');
      assert.equal(items[0].detail.dataid, 'id0');
      assert.isTrue(items[0].detail.isfirstitem);
      assert.equal(items[1].detail.dataid, 'id1');
      assert.isTrue(items[1].detail.isfirstitem);
      assert.equal(items[2].detail.dataid, 'id0');
      assert.isFalse(items[2].detail.isfirstitem);
    });

    test('load throw sends error and loadend', () => {
      MockLoader.throwOnLoad = true;
      const controller = new LoadController();
      const events = recordEvents(controller);
      assert.doesNotThrow(() => {
        controller.loadFiles([], 'id0');
      });

      assert.deepEqual(events.map((e) => e.type), ['error', 'loadend']);
      assert.equal(events[0].detail.dataid, 'id0');
      assert.equal(events[0].detail.loadtype, 'image');
      assert.instanceOf(events[0].detail.error, Error);
      assert.equal(events[0].detail.error.message, 'load failed');
      assert.equal(events[1].detail.dataid, 'id0');
      assert.equal(events[1].detail.loadtype, 'image');
      assert.deepEqual(controller.getLoadingDataIds(), []);
    });

  });

  /**
   * Tests for {@link LoadController} loading state and abort.
   */
  describe('LoadController loading state', () => {

    test('getLoadingDataIds', () => {
      const controller = new LoadController();
      assert.deepEqual(controller.getLoadingDataIds(), []);

      controller.loadFiles([], 'id0');
      const loader0 = lastLoader();
      // not stored before loadstart
      assert.deepEqual(controller.getLoadingDataIds(), []);
      loader0.onloadstart({});
      assert.deepEqual(controller.getLoadingDataIds(), ['id0']);

      controller.loadURLs([], 'id1');
      const loader1 = lastLoader();
      loader1.onloadstart({});
      assert.deepEqual(controller.getLoadingDataIds(), ['id0', 'id1']);

      loader0.onloadend({});
      assert.deepEqual(controller.getLoadingDataIds(), ['id1']);
      loader1.onloadend({});
      assert.deepEqual(controller.getLoadingDataIds(), []);
    });

    test('abort', () => {
      const controller = new LoadController();
      controller.loadFiles([], 'id0');
      const loader0 = lastLoader();
      loader0.onloadstart({});
      controller.loadFiles([], 'id1');
      const loader1 = lastLoader();
      loader1.onloadstart({});

      controller.abort('id0');
      assert.isTrue(loader0.abortCalled);
      assert.isFalse(loader1.abortCalled);
      assert.deepEqual(controller.getLoadingDataIds(), ['id1']);

      // second abort is a no-op
      loader0.abortCalled = false;
      controller.abort('id0');
      assert.isFalse(loader0.abortCalled);
    });

    test('abort unknown or finished data id', () => {
      const controller = new LoadController();
      assert.doesNotThrow(() => {
        controller.abort('unknown');
      });

      controller.loadFiles([], 'id0');
      const loader = lastLoader();
      loader.onloadstart({});
      loader.onloadend({});
      controller.abort('id0');
      assert.isFalse(loader.abortCalled);
    });

  });

});
