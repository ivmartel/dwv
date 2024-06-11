// tests fails weirdly withtout this import...
/* eslint-disable no-unused-vars */
import {MemoryLoader} from '../../src/io/memoryLoader';
/* eslint-enable no-unused-vars */

import {DicomDataLoader} from '../../src/io/dicomDataLoader';

/**
 * Tests for the 'io/dicomDataLoader.js' file.
 */
/** @module tests/io */
// Do not warn if these variables were not defined before.
/* global QUnit */
QUnit.module('io');

/**
 * Tests for {@link DicomDataLoader} events with single frame data.
 *
 * @function module:tests/io~dicomDataLoader-canloadurl
 */
QUnit.test(
  'DICOM loader canloadurl - #DWV-REQ-IO-02-001 Load DICOM discrete URL(s)',
  function (assert) {
    const loader = new DicomDataLoader();

    // 'ok' tests
    const okTestArgs = [
      {
        url: 'path/data',
        options: {},
        desc: 'ok extension #0 (empty)'
      },
      {
        url: 'path/data.dcm',
        options: {},
        desc: 'ok extension #0 (dcm)'
      },
      {
        url: 'path/data.ext?contentType=application/dicom',
        options: {},
        desc: 'ok contentType #0 (dcm)'
      },
      {
        url: 'path/data.ext',
        options: {forceLoader: 'dicom'},
        desc: 'ok force #0 (dcm)'
      },
      {
        url: 'path/data.dcm',
        options: {forceLoader: 'json'},
        desc: 'ok force #1 (json + dcm ext)'
      },
      {
        url: 'path/data.ext',
        options: {requestHeaders: [
          {name: 'Accept', value: 'application/dicom'}
        ]},
        desc: 'ok request #0 (dcm)'
      }
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
        url: 'path/data.json',
        options: {},
        desc: 'bad extension #0 (json)'
      },
      {
        url: 'path/data.ext',
        options: {},
        desc: 'bad options #0 (empty)'
      },
      {
        url: 'path/data.ext?contentType=application/json',
        options: {},
        desc: 'bad contentType #0 (dcm)'
      },
      {
        url: 'path/data.ext',
        options: {forceLoader: 'json'},
        desc: 'bad force #0 (json)'
      },
      {
        url: 'path/data.ext',
        options: {requestHeaders: [
          {name: 'Accept', value: 'application/json'}
        ]},
        desc: 'bad request #0 (json)'
      },
      {
        url: 'path/data.ext',
        options: {requestHeaders: [
          {name: 'Accept', value: 'application/dicom+json'}
        ]},
        desc: 'bad request #1 (dicom+json)'
      },
      {
        url: 'path/data.dcm',
        options: {requestHeaders: [
          {name: 'Accept', value: 'application/json'}
        ]},
        desc: 'bad request #2 (json + dcm ext)'
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
