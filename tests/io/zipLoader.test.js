import {ZipLoader} from '../../src/io/zipLoader';

/**
 * Tests for the 'io/zipLoader.js' file.
 */

// Do not warn if these variables were not defined before.
/* global QUnit */
QUnit.module('io');

/**
 * Tests for {@link ZipLoader} events with single frame data.
 *
 * @function module:tests/io~zipLoader-canloadurl
 */
QUnit.test('ZIP loader canloadurl - #DWV-REQ-IO-02-003 Load DICOM ZIP URL',
  function (assert) {
    const loader = new ZipLoader();

    // 'ok' tests
    const okTestArgs = [
      {
        url: 'path/data.zip',
        options: {},
        desc: 'ok extension #0 (zip)'
      },
      {
        url: 'path/data.ext',
        options: {forceLoader: 'zip'},
        desc: 'ok force #0 (zip)'
      },
      {
        url: 'path/data.zip',
        options: {forceLoader: 'dicom'},
        desc: 'ok force #1 (dicom + zip ext)'
      },
      {
        url: 'path/data.ext',
        options: {requestHeaders: [
          {name: 'Accept', value: 'application/zip'}
        ]},
        desc: 'ok request #0 (zip)'
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
        url: 'path/data.zip',
        options: {requestHeaders: [
          {name: 'Accept', value: 'application/dicom'}
        ]},
        desc: 'bad request #1 (dicom + zip ext)'
      }
    ];

    for (const testArg of notOkTestArgs) {
      assert.notOk(
        loader.canLoadUrl(testArg.url, testArg.options),
        testArg.desc
      );
    }
  }
);
