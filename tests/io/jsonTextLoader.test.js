import {JSONTextLoader} from '../../src/io/jsonTextLoader';

/**
 * Tests for the 'io/dicomDataLoader.js' file.
 */

// Do not warn if these variables were not defined before.
/* global QUnit */
QUnit.module('io');

/**
 * Tests for {@link JsonTextLoader} events with single frame data.
 *
 * @function module:tests/io~jsonTextLoader-canloadurl
 */
QUnit.test('JSON loader canloadurl', function (assert) {
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
