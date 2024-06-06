import {RawVideoLoader} from '../../src/io/rawVideoLoader';

/**
 * Tests for the 'io/rawVideoLoader.js' file.
 */

// Do not warn if these variables were not defined before.
/* global QUnit */
QUnit.module('io');

/**
 * Tests for {@link RawVideoLoader} events with single frame data.
 *
 * @function module:tests/io~rawVideoLoader-canloadurl
 */
QUnit.test('RAW image loader canloadurl', function (assert) {
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
