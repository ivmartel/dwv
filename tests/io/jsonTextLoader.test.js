// @vitest-environment jsdom
import {describe, test, assert, beforeEach} from 'vitest';
import {JSONTextLoader} from '../../src/io/jsonTextLoader.js';
import {fileContentTypes} from '../../src/io/filesLoader.js';
import {urlContentTypes} from '../../src/io/urlsLoader.js';

describe('io', () => {

  describe('JSONTextLoader-events', () => {
    let loader;
    let loadStartEvent;
    let progressEvent;
    let loadItemEvent;
    let loadEvent;
    let loadEndEvent;
    let errorEvent;
    let abortEvent;

    beforeEach(() => {
      loader = new JSONTextLoader();
      loadStartEvent = null;
      progressEvent = null;
      loadItemEvent = null;
      loadEvent = null;
      loadEndEvent = null;
      errorEvent = null;
      abortEvent = null;

      loader.onloadstart = (event) => {
        loadStartEvent = event;
      };
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
      loader.onerror = (event) => {
        errorEvent = event;
      };
      loader.onabort = (event) => {
        abortEvent = event;
      };
    });

    /**
     * Tests for {@link JSONTextLoader} events.
     *
     * @function module:tests/io~jsontextloaderEventsIsloadingInitial
     */
    test('isLoading initial', () => {
      assert.notOk(loader.isLoading());
    });

    /**
     * Tests for {@link JSONTextLoader} events.
     *
     * @function module:tests/io~jsontextloaderEventsLoadSetsFlagAndFires
     */
    test('load sets flag and fires', () => {
      const text = '{"key": "value"}';
      const origin = 'test-origin';
      const index = 0;

      loader.load(text, origin, index);

      assert.ok(loadStartEvent);
      assert.equal(loadStartEvent.source, origin);

      assert.ok(progressEvent);
      assert.equal(progressEvent.lengthComputable, true);
      assert.equal(progressEvent.loaded, 100);
      assert.equal(progressEvent.total, 100);
      assert.equal(progressEvent.index, index);
      assert.equal(progressEvent.source, origin);

      assert.ok(loadItemEvent);
      assert.equal(loadItemEvent.data, text);
      assert.equal(loadItemEvent.source, origin);

      assert.ok(loadEvent);
      assert.equal(loadEvent.data, text);
      assert.equal(loadEvent.source, origin);

      assert.ok(loadEndEvent);
      assert.equal(loadEndEvent.source, origin);
    });

    /**
     * Tests for {@link JSONTextLoader} events.
     *
     * @function module:tests/io~jsontextloaderEventsLoadResetsFlag
     */
    test('load resets flag', () => {
      assert.notOk(loader.isLoading());
      loader.load('test', 'origin', 0);
      assert.notOk(loader.isLoading());
    });

    /**
     * Tests for {@link JSONTextLoader} events.
     *
     * @function module:tests/io~jsontextloaderEventsLoadFiresError
     */
    test('load fires error', () => {
      loader.onloaditem = () => {
        throw new Error('Test error');
      };

      const text = '{"test": true}';
      const origin = 'error-origin';

      loader.load(text, origin, 0);

      assert.ok(errorEvent);
      assert.ok(errorEvent.error);
      assert.ok(errorEvent.error instanceof Error);
      assert.equal(errorEvent.source, origin);
      assert.ok(loadEndEvent);
    });

    /**
     * Tests for {@link JSONTextLoader} events.
     *
     * @function module:tests/io~jsontextloaderEventsAbortResetsInternals
     */
    test('abort resets internals', () => {
      loader.abort();

      assert.notOk(loader.isLoading());
      assert.ok(abortEvent);
      assert.ok(loadEndEvent);
    });

    /**
     * Tests for {@link JSONTextLoader} events.
     *
     * @function module:tests/io~jsontextloaderEventsSetoptionsDoesNothing
     */
    test('setOptions does nothing', () => {
      loader.setOptions({foo: 'bar'});
      assert.notOk(loader.isLoading());
    });

    /**
     * Tests for {@link JSONTextLoader} events.
     *
     * @function module:tests/io~jsontextloaderEventsDefaultDoesNotThrow
     */
    test('default does not throw', () => {
      const loader2 = new JSONTextLoader();
      assert.doesNotThrow(() => {
        loader2.onloadstart({});
        loader2.onprogress({});
        loader2.onloaditem({});
        loader2.onload({});
        loader2.onloadend({});
        loader2.onerror({});
        loader2.onabort({});
      });
    });
  });

  describe('JSONTextLoader-file', () => {
    let loader;

    beforeEach(() => {
      loader = new JSONTextLoader();
    });

    /**
     * Tests for {@link JSONTextLoader} canLoadFile.
     *
     * @function module:tests/io~jsontextloaderFiletrueForJson
     */
    test('true for json', () => {
      const jsonFile = new File(['test'], 'test.json');
      assert.ok(loader.canLoadFile(jsonFile));
    });

    /**
     * Tests for {@link JSONTextLoader} canLoadFile.
     *
     * @function module:tests/io~jsontextloaderFilefalseForNonJson
     */
    test('false for non-json', () => {
      const txtFile = new File(['test'], 'test.txt');
      assert.notOk(loader.canLoadFile(txtFile));
    });

    /**
     * Tests for {@link JSONTextLoader} canLoadFile.
     *
     * @function module:tests/io~jsontextloaderFileHandlesUppercase
     */
    test('handles uppercase', () => {
      const jsonFile = new File(['test'], 'test.JSON');
      assert.ok(loader.canLoadFile(jsonFile));
    });

    /**
     * Tests for {@link JSONTextLoader} canLoadFile.
     *
     * @function module:tests/io~jsontextloaderFileHandlesMultiple
     */
    test('handles multiple', () => {
      const file = new File(['test'], 'data.backup.json');
      assert.ok(loader.canLoadFile(file));
    });

    /**
     * Tests for {@link JSONTextLoader} canLoadFile.
     *
     * @function module:tests/io~jsontextloaderFileHandlesNoExtension
     */
    test('handles no extension', () => {
      const file = new File(['test'], 'data');
      assert.notOk(loader.canLoadFile(file));
    });
  });

  describe('JSONTextLoader-memory', () => {
    let loader;

    beforeEach(() => {
      loader = new JSONTextLoader();
    });

    /**
     * Tests for {@link JSONTextLoader} canLoadMemory.
     *
     * @function module:tests/io~jsontextloaderMemoryJsonContentType
     */
    test('json content-type', () => {
      const mem = {
        'Content-Type': 'application/json',
        data: '{"test": true}'
      };
      assert.ok(loader.canLoadMemory(mem));
    });

    /**
     * Tests for {@link JSONTextLoader} canLoadMemory.
     *
     * @function module:tests/io~jsontextloaderMemoryJsonContentTypeCharset
     */
    test('json content-type charset', () => {
      const mem = {
        'Content-Type': 'application/json; charset=utf-8'
      };
      assert.ok(loader.canLoadMemory(mem));
    });

    /**
     * Tests for {@link JSONTextLoader} canLoadMemory.
     *
     * @function module:tests/io~jsontextloaderMemoryNonJsonContentType
     */
    test('non-json content-type', () => {
      const mem = {
        'Content-Type': 'application/xml',
        data: '<test/>'
      };
      assert.notOk(loader.canLoadMemory(mem));
    });

    /**
     * Tests for {@link JSONTextLoader} canLoadMemory.
     *
     * @function module:tests/io~jsontextloaderMemoryNoContentType
     */
    test('no content-type', () => {
      const mem = {
        filename: 'data.json'
      };
      assert.ok(loader.canLoadMemory(mem));
    });

    /**
     * Tests for {@link JSONTextLoader} canLoadMemory.
     *
     * @function module:tests/io~jsontextloaderMemoryNonJsonFilename
     */
    test('non-json filename', () => {
      const mem = {
        filename: 'data.txt'
      };
      assert.notOk(loader.canLoadMemory(mem));
    });

    /**
     * Tests for {@link JSONTextLoader} canLoadMemory.
     *
     * @function module:tests/io~jsontextloaderMemoryEmpty
     */
    test('empty', () => {
      const mem = {};
      assert.notOk(loader.canLoadMemory(mem));
    });
  });

  describe('JSONTextLoader-loadFileAs', () => {
    /**
     * Tests for {@link JSONTextLoader} loadFileAs.
     *
     * @function module:tests/io~jsontextloaderLoadfileasReturnsText
     */
    test('returns Text', () => {
      const loader = new JSONTextLoader();
      assert.equal(loader.loadFileAs(), fileContentTypes.Text);
    });
  });

  describe('JSONTextLoader-loadUrlAs', () => {
    /**
     * Tests for {@link JSONTextLoader} loadUrlAs.
     *
     * @function module:tests/io~jsontextloaderLoadurlasReturnsText
     */
    test('returns Text', () => {
      const loader = new JSONTextLoader();
      assert.equal(loader.loadUrlAs(), urlContentTypes.Text);
    });
  });

  describe('JSONTextLoader-canLoadUrl', () => {
    /**
     * Tests for {@link JSONTextLoader} canLoadUrl.
     *
     * @function module:tests/io~jsontextloaderCanloadurlPatterns
     */
    test('patterns', () => {
      const loader = new JSONTextLoader();

      // 'ok' tests
      const okTestArgs = [
        {
          url: 'path/data.json',
          options: {},
          desc: 'ok extension #0 (json)'
        },
        {
          url: 'path/data.ext',
          options: {forceLoader: 'json'},
          desc: 'ok force #0 (json)'
        },
        {
          url: 'path/data.json',
          options: {forceLoader: 'dicom'},
          desc: 'ok force #0 (dicom + json ext)'
        },
        {
          url: 'path/data.ext',
          options: {requestHeaders: [
            {name: 'Accept', value: 'application/json'}
          ]},
          desc: 'ok request #0 (json)'
        },
        {
          url: 'path/data.ext',
          options: {requestHeaders: [
            {name: 'Accept', value: 'application/dicom+json'}
          ]},
          desc: 'ok request #1 (dicom+json)'
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
          url: 'path/data.json',
          options: {requestHeaders: [
            {name: 'Accept', value: 'application/dicom'}
          ]},
          desc: 'bad request #1 (dicom + json ext)'
        }
      ];

      for (const testArg of notOkTestArgs) {
        assert.notOk(
          loader.canLoadUrl(testArg.url, testArg.options),
          testArg.desc
        );
      }

    });
  });
});
