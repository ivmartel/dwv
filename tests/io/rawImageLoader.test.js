import {RawImageLoader} from '../../src/io/rawImageLoader';

/**
 * Tests for the 'io/rawImageLoader.js' file.
 */

// Do not warn if these variables were not defined before.
/* global QUnit */
QUnit.module('io');

/**
 * Tests for {@link RawImageLoader} events with single frame data.
 *
 * @function module:tests/io~rawImageLoader-canloadurl
 */
QUnit.test('RAW image loader canloadurl', function (assert) {
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
