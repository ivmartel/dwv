// @vitest-environment jsdom
import {describe, test, assert, beforeEach, afterEach} from 'vitest';
import {FilesLoader, fileContentTypes} from '../../src/io/filesLoader.js';
import {loaderList} from '../../src/io/loaderList.js';
import {MockIoLoader} from './utils/mockIoLoader.js';

/**
 * Test double for `FileReader` used by `FilesLoader`.
 * It simulates success, error, abort and pending read behaviors.
 */
class MockFileReader {
  static instances = [];
  static behaviorByName = {};

  readyState = 0;
  mode = null;
  abortCalled = false;
  onprogress = null;
  onload = null;
  onerror = null;
  onabort = null;

  /**
   * Create a mock file reader and keep track of it.
   */
  constructor() {
    MockFileReader.instances.push(this);
  }

  /**
   * Simulate `FileReader.readAsText`.
   *
   * @param {File} file The file to read.
   */
  readAsText(file) {
    this.mode = 'text';
    this.#runRead(file, `text:${file.name}`);
  }

  /**
   * Simulate `FileReader.readAsDataURL`.
   *
   * @param {File} file The file to read.
   */
  readAsDataURL(file) {
    this.mode = 'dataurl';
    this.#runRead(file, `dataurl:${file.name}`);
  }

  /**
   * Simulate `FileReader.readAsArrayBuffer`.
   *
   * @param {File} file The file to read.
   */
  readAsArrayBuffer(file) {
    this.mode = 'arraybuffer';
    this.#runRead(file, new ArrayBuffer(8));
  }

  /**
   * Simulate aborting an in-flight read.
   */
  abort() {
    this.abortCalled = true;
    this.readyState = 2;
    if (typeof this.onabort === 'function') {
      this.onabort({target: this});
    }
  }

  /**
   * Drive the mock read lifecycle according to configured behavior.
   *
   * @param {File} file The file being read.
   * @param {string|ArrayBuffer} result The successful read result.
   */
  #runRead(file, result) {
    this.readyState = 1;
    if (typeof this.onprogress === 'function') {
      this.onprogress({
        lengthComputable: true,
        loaded: 50,
        total: 100,
        target: this
      });
    }

    const behavior = MockFileReader.behaviorByName[file.name] || 'success';
    if (behavior === 'pending') {
      return;
    }
    if (behavior === 'error') {
      this.readyState = 2;
      if (typeof this.onerror === 'function') {
        this.onerror({target: this, error: new Error('mock-reader-error')});
      }
      return;
    }
    if (behavior === 'abort') {
      this.readyState = 2;
      if (typeof this.onabort === 'function') {
        this.onabort({target: this});
      }
      return;
    }

    this.readyState = 2;
    if (typeof this.onload === 'function') {
      this.onload({target: {result}});
    }
  }
}

describe('io', () => {
  const originalFileReader = globalThis.FileReader;
  const originalLoaderList = [...loaderList];

  beforeEach(() => {
    MockIoLoader.reset();
    MockIoLoader.readAsType = fileContentTypes.Text;
    MockFileReader.instances = [];
    MockFileReader.behaviorByName = {};

    loaderList.splice(0, loaderList.length, MockIoLoader);
    globalThis.FileReader = MockFileReader;
  });

  afterEach(() => {
    loaderList.splice(0, loaderList.length, ...originalLoaderList);
    globalThis.FileReader = originalFileReader;
  });

  test('load returns early for empty input', () => {
    const loader = new FilesLoader();
    let gotLoadStart = false;
    loader.onloadstart = () => {
      gotLoadStart = true;
    };

    loader.load([]);
    assert.notOk(gotLoadStart);
    assert.equal(MockFileReader.instances.length, 0);
  });

  test('load throws when no matching loader is found', () => {
    const loader = new FilesLoader();
    const data = [new File(['a'], 'input.bad')];

    assert.throws(
      () => loader.load(data),
      'No loader found for file: input.bad'
    );
  });

  test('load reads files and fires aggregate events', () => {
    const loader = new FilesLoader();
    loader.setDefaultCharacterSet('ISO_IR 100');

    let loadStartEvent = null;
    let loadEvent = null;
    let loadEndEvent = null;
    loader.onloadstart = (event) => {
      loadStartEvent = event;
    };
    loader.onload = (event) => {
      loadEvent = event;
    };
    loader.onloadend = (event) => {
      loadEndEvent = event;
    };

    const data = [
      new File(['a'], 'input-0.ok'),
      new File(['b'], 'input-1.ok')
    ];

    loader.load(data);

    assert.equal(MockFileReader.instances.length, 2);
    assert.equal(MockFileReader.instances[0].mode, 'text');
    assert.equal(MockFileReader.instances[1].mode, 'text');
    assert.equal(MockIoLoader.instances.length, 1);
    assert.equal(MockIoLoader.instances[0].options.numberOfFiles, 2);
    assert.equal(
      MockIoLoader.instances[0].options.defaultCharacterSet,
      'ISO_IR 100'
    );

    assert.ok(loadStartEvent);
    assert.equal(loadStartEvent.source, data);
    assert.ok(loadEvent);
    assert.equal(loadEvent.source, data);
    assert.ok(loadEndEvent);
    assert.equal(loadEndEvent.source, data);
  });

  test('load picks file reader mode from loader type', () => {
    const file = new File(['a'], 'input.ok');
    const loader = new FilesLoader();

    MockIoLoader.readAsType = fileContentTypes.DataURL;
    loader.load([file]);
    assert.equal(MockFileReader.instances[0].mode, 'dataurl');

    MockFileReader.instances = [];
    MockIoLoader.instances = [];
    MockIoLoader.readAsType = fileContentTypes.ArrayBuffer;
    loader.load([file]);
    assert.equal(MockFileReader.instances[0].mode, 'arraybuffer');
  });

  test('reader error triggers error callback with file source', () => {
    const loader = new FilesLoader();
    let errorEvent = null;
    let gotLoad = false;
    let loadEndEvent = null;
    loader.onerror = (event) => {
      errorEvent = event;
    };
    loader.onload = () => {
      gotLoad = true;
    };
    loader.onloadend = (event) => {
      loadEndEvent = event;
    };

    const file = new File(['a'], 'input.ok');
    MockFileReader.behaviorByName[file.name] = 'error';

    loader.load([file]);

    assert.ok(errorEvent);
    assert.equal(errorEvent.source, file);
    assert.notOk(gotLoad);
    assert.ok(loadEndEvent);
  });

  test('load throws for mixed file types', () => {
    const loader = new FilesLoader();
    const data = [
      new File(['a'], 'input-0.ok'),
      new File(['b'], 'input-1.bad')
    ];

    assert.throws(
      () => loader.load(data),
      'Input file of different type: [object File]'
    );
  });

  test('abort aborts active readers and running loader', () => {
    const loader = new FilesLoader();
    const file = new File(['a'], 'input.ok');
    MockFileReader.behaviorByName[file.name] = 'pending';
    MockIoLoader.initialLoadingState = true;

    let abortEvent = null;
    loader.onabort = (event) => {
      abortEvent = event;
    };

    loader.load([file]);
    loader.abort();

    assert.equal(MockFileReader.instances.length, 1);
    assert.ok(MockFileReader.instances[0].abortCalled);
    assert.ok(MockIoLoader.instances[0].abortCalled);
    assert.ok(abortEvent);
    assert.equal(abortEvent.source, file);
  });
});
