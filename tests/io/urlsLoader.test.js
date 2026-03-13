import {describe, test, assert, beforeEach, afterEach} from 'vitest';
import {UrlsLoader, urlContentTypes} from '../../src/io/urlsLoader.js';
import {loaderList} from '../../src/io/loaderList.js';
import {MockIoLoader} from './utils/mockIoLoader.js';

/**
 * Test double for `XMLHttpRequest` used by `UrlsLoader`.
 */
class MockXMLHttpRequest {
  static instances = [];
  static behaviorByUrl = {};
  static sentUrls = [];

  readyState = 0;
  method = null;
  url = null;
  async = true;
  requestHeaders = [];
  withCredentials = false;
  responseType = '';
  response = null;
  status = 200;
  statusText = 'OK';
  responseURL = '';
  onprogress = null;
  onload = null;
  onloadend = null;
  onerror = null;
  ontimeout = null;
  onabort = null;
  aborted = false;

  /**
   * Create a mock XHR instance and track it.
   */
  constructor() {
    MockXMLHttpRequest.instances.push(this);
  }

  /**
   * Simulate `XMLHttpRequest.open`.
   *
   * @param {string} method The HTTP method.
   * @param {string} url The request URL.
   * @param {boolean} async The async flag.
   */
  open(method, url, async) {
    this.method = method;
    this.url = url;
    this.responseURL = url;
    this.async = async;
    this.readyState = 1;
  }

  /**
   * Simulate adding an HTTP request header.
   *
   * @param {string} name Header name.
   * @param {string} value Header value.
   */
  setRequestHeader(name, value) {
    this.requestHeaders.push({name, value});
  }

  /**
   * Simulate request execution according to configured behavior.
   */
  send() {
    MockXMLHttpRequest.sentUrls.push(this.url);
    this.readyState = 3;
    if (typeof this.onprogress === 'function') {
      this.onprogress({
        lengthComputable: true,
        loaded: 20,
        total: 100,
        target: this
      });
    }

    const behavior = MockXMLHttpRequest.behaviorByUrl[this.url] || 'success';
    if (behavior === 'pending') {
      return;
    }
    if (behavior === 'error') {
      this.readyState = 4;
      if (typeof this.onerror === 'function') {
        this.onerror({target: this, error: new Error('mock-xhr-error')});
      }
      if (typeof this.onloadend === 'function') {
        this.onloadend({target: this});
      }
      return;
    }
    if (behavior === 'timeout') {
      this.readyState = 4;
      if (typeof this.ontimeout === 'function') {
        this.ontimeout({target: this});
      }
      if (typeof this.onloadend === 'function') {
        this.onloadend({target: this});
      }
      return;
    }
    if (behavior === 'http-error') {
      this.status = 404;
      this.statusText = 'Not Found';
      this.response = null;
      this.readyState = 4;
      if (typeof this.onload === 'function') {
        this.onload({target: this});
      }
      if (typeof this.onloadend === 'function') {
        this.onloadend({target: this});
      }
      return;
    }

    this.status = 200;
    this.statusText = 'OK';
    this.response = this.responseType === 'arraybuffer'
      ? new ArrayBuffer(8) : `body:${this.url}`;
    this.readyState = 4;
    if (typeof this.onload === 'function') {
      this.onload({target: this});
    }
    if (typeof this.onloadend === 'function') {
      this.onloadend({target: this});
    }
  }

  /**
   * Simulate aborting an in-flight request.
   */
  abort() {
    this.aborted = true;
    this.readyState = 4;
    if (typeof this.onabort === 'function') {
      this.onabort({target: this});
    }
    if (typeof this.onloadend === 'function') {
      this.onloadend({target: this});
    }
  }
}

describe('io', () => {
  const originalXHR = globalThis.XMLHttpRequest;
  const originalLoaderList = [...loaderList];

  beforeEach(() => {
    MockIoLoader.reset();
    MockIoLoader.readAsType = urlContentTypes.Text;
    MockXMLHttpRequest.instances = [];
    MockXMLHttpRequest.behaviorByUrl = {};
    MockXMLHttpRequest.sentUrls = [];

    loaderList.splice(0, loaderList.length, MockIoLoader);
    globalThis.XMLHttpRequest = MockXMLHttpRequest;
  });

  afterEach(() => {
    loaderList.splice(0, loaderList.length, ...originalLoaderList);
    globalThis.XMLHttpRequest = originalXHR;
  });

  test('load throws when no matching loader is found', () => {
    const loader = new UrlsLoader();
    const urls = ['https://host/data.bad'];

    assert.throws(
      () => loader.load(urls),
      'No loader found for url: https://host/data.bad'
    );
  });

  test('load requests urls and fires aggregate events', () => {
    const loader = new UrlsLoader();
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

    const urls = ['https://host/a.ok', 'https://host/b.ok'];
    loader.load(urls, {batchSize: 1});

    assert.equal(MockXMLHttpRequest.sentUrls.length, 2);
    assert.deepEqual(MockXMLHttpRequest.sentUrls, urls);
    assert.equal(MockIoLoader.instances.length, 1);
    assert.equal(MockIoLoader.instances[0].options.numberOfFiles, 2);
    assert.equal(
      MockIoLoader.instances[0].options.defaultCharacterSet,
      'ISO_IR 100'
    );

    assert.ok(loadStartEvent);
    assert.equal(loadStartEvent.source, urls);
    assert.ok(loadEvent);
    assert.equal(loadEvent.source, urls);
    assert.ok(loadEndEvent);
    assert.equal(loadEndEvent.source, urls);
  });

  test('load applies request options and arraybuffer response type', () => {
    const loader = new UrlsLoader();
    const urls = ['https://host/a.ok'];
    MockIoLoader.readAsType = urlContentTypes.ArrayBuffer;

    loader.load(urls, {
      requestHeaders: [
        {name: 'Accept', value: 'application/dicom'},
        {name: 'X-Test', value: '1'}
      ],
      withCredentials: true
    });

    assert.equal(MockXMLHttpRequest.instances.length, 1);
    const request = MockXMLHttpRequest.instances[0];
    assert.equal(request.method, 'GET');
    assert.equal(request.url, urls[0]);
    assert.equal(request.withCredentials, true);
    assert.equal(request.responseType, 'arraybuffer');
    assert.deepEqual(request.requestHeaders, [
      {name: 'Accept', value: 'application/dicom'},
      {name: 'X-Test', value: '1'}
    ]);
  });

  test('http status error triggers onerror with formatted message', () => {
    const loader = new UrlsLoader();
    const url = 'https://host/a.ok';
    MockXMLHttpRequest.behaviorByUrl[url] = 'http-error';

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

    loader.load([url]);

    assert.ok(errorEvent);
    assert.equal(errorEvent.source, url);
    assert.equal(errorEvent.error, 'GET https://host/a.ok 404 (Not Found)');
    assert.notOk(gotLoad);
    assert.ok(loadEndEvent);
  });

  test('load throws for mixed url types', () => {
    const loader = new UrlsLoader();
    const urls = ['https://host/a.ok', 'https://host/b.bad'];

    assert.throws(
      () => loader.load(urls),
      'Input url of different type: https://host/b.bad'
    );
  });

  test('abort aborts pending requests and running loader', () => {
    const loader = new UrlsLoader();
    const urls = ['https://host/a.ok', 'https://host/b.ok'];
    MockXMLHttpRequest.behaviorByUrl[urls[0]] = 'pending';
    MockXMLHttpRequest.behaviorByUrl[urls[1]] = 'pending';
    MockIoLoader.initialLoadingState = true;

    let abortEvent = null;
    loader.onabort = (event) => {
      abortEvent = event;
    };

    loader.load(urls);
    loader.abort();

    assert.equal(MockXMLHttpRequest.instances.length, 2);
    assert.ok(MockXMLHttpRequest.instances[0].aborted);
    assert.ok(MockXMLHttpRequest.instances[1].aborted);
    assert.ok(MockIoLoader.instances[0].abortCalled);
    assert.ok(abortEvent);
    assert.equal(abortEvent.source, urls[1]);
  });

  test('DICOMDIR request error forwards source and ends load', () => {
    const loader = new UrlsLoader();
    const dicomDirUrl = 'https://host/DICOMDIR';
    MockXMLHttpRequest.behaviorByUrl[dicomDirUrl] = 'error';

    let errorEvent = null;
    let loadEndEvent = null;
    loader.onerror = (event) => {
      errorEvent = event;
    };
    loader.onloadend = (event) => {
      loadEndEvent = event;
    };

    loader.load([dicomDirUrl]);

    assert.equal(MockXMLHttpRequest.instances.length, 1);
    assert.equal(MockXMLHttpRequest.instances[0].responseType, 'arraybuffer');
    assert.ok(errorEvent);
    assert.equal(errorEvent.source, dicomDirUrl);
    assert.ok(loadEndEvent);
  });
});
