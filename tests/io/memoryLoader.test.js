// @vitest-environment jsdom
import {describe, test, assert, vi, expect} from 'vitest';
import {MemoryLoader} from '../../src/io/memoryLoader.js';
import {b64urlToArrayBuffer} from '../dicom/utils.js';

import bbmri53323131 from '../data/bbmri-53323131.dcm?inline';
import bbmri53323275 from '../data/bbmri-53323275.dcm?inline';
import dwvTestSimple from '../data/dwv-test-simple.dcm?inline';
import dwvTestBadPrefix from '../data/dwv-test_bad-prefix.dcm?inline';
import multiframeTest1 from '../data/multiframe-test1.dcm?inline';
import bbmriZip from '../data/bbmri.zip?inline';
import dwvTestBadZip from '../data/dwv-test_bad.zip?inline';

/**
 * Tests for the 'io/memoryLoader.js' file.
 */

describe('io', () => {

  /**
   * Check the events of memory load.
   *
   * @param {string} id An id for the test.
   * @param {Array} data The data to load as a string array.
   * @param {number} nData The theoretical number of data.
   * @param {number} nDataOk The theoretical number of data with no error.
   * @returns {Promise} The load promise.
   */
  async function checkLoad(id, data, nData, nDataOk) {

    return new Promise((resolve) => {

      const prefix = `[${id}] `;
      const nDataError = nData - nDataOk;

      // checks
      const loadStartDates = [];
      const progressDates = [];
      const loadItemDates = [];
      const loadDates = [];
      const errorDates = [];
      const abortDates = [];
      let gotLoadEnd = false;

      // create loader
      const loader = new MemoryLoader();
      // callbacks
      loader.onloadstart = function (/*event*/) {
        loadStartDates.push(new Date());
      };
      loader.onprogress = function (/*event*/) {
        progressDates.push(new Date());
      };
      loader.onloaditem = function (/*event*/) {
        loadItemDates.push(new Date());
      };
      loader.onload = function (/*event*/) {
        loadDates.push(new Date());
      };
      loader.onloadend = function (/*event*/) {
        const loadEndDate = new Date();
        assert.notOk(gotLoadEnd,
          `${prefix}Received first load end.`);
        gotLoadEnd = true;

        // check number of events
        assert.equal(loadStartDates.length, 1,
          `${prefix}Received one load start.`);
        if (nDataOk !== 0) {
          assert.ok(progressDates.length > 0,
            `${prefix}Received at least one progress.`);
        }
        assert.equal(loadItemDates.length, nDataOk,
          `${prefix}Received loaditem.`);
        const nLoad = nDataError === 0 ? 1 : 0;
        assert.equal(loadDates.length, nLoad,
          `${prefix}Received load.`);
        assert.equal(errorDates.length, nDataError,
          `${prefix}Received error(s).`);
        assert.equal(abortDates.length, 0,
          `${prefix}Received abort(s).`);

        // check start/end sequence
        const loadStartDate = loadStartDates[0];
        assert.ok(loadStartDate <= loadEndDate,
          `${prefix}Received start before load end.`);

        let lastProgressDate = null;
        let lastLoadItemDate = null;

        if (nDataOk !== 0) {
          // check progress sequence
          progressDates.sort();
          const firstProgressDate = progressDates[0];
          lastProgressDate = progressDates[progressDates.length - 1];
          assert.ok(loadStartDate <= firstProgressDate,
            `${prefix}Received start before first progress.`);
          assert.ok(loadEndDate >= lastProgressDate,
            `${prefix}Received end after last progress.`);

          // check load item sequence
          loadItemDates.sort();
          const firstLoadItemDate = loadItemDates[0];
          lastLoadItemDate = loadItemDates[loadItemDates.length - 1];
          assert.ok(loadStartDate <= firstLoadItemDate,
            `${prefix}Received start before first load item.`);
          assert.ok(loadEndDate >= lastLoadItemDate,
            `${prefix}Received end after last load item.`);
        }

        // check load or error event sequence
        if (nDataError === 0) {
          // load is sent if no error happened
          const loadDate = loadDates[0];
          assert.ok(loadStartDate <= loadDate,
            `${prefix}Received start before load.`);
          assert.ok(loadDate >= lastProgressDate,
            `${prefix}Received load after last progress.`);
          assert.ok(loadDate >= lastLoadItemDate,
            `${prefix}Received load after last load item.`);
          assert.ok(loadEndDate >= loadDate,
            `${prefix}Received end after load.`);
        } else {
          errorDates.sort();
          const firstErrorDate = errorDates[0];
          const lastErrorDate = errorDates[errorDates.length - 1];
          assert.ok(loadStartDate <= firstErrorDate,
            `${prefix}Received start before first error.`);
          assert.ok(loadEndDate >= lastErrorDate,
            `${prefix}Received end after last error.`);
        }
        resolve(true);
      };
      loader.onerror = function (/*event*/) {
        errorDates.push(new Date());
      };
      loader.onabort = function (/*event*/) {
        abortDates.push(new Date());
      };

      // launch load
      loader.load(data);
    });
  }

  /**
   * Tests for {@link MemoryLoader} events with single frame data.
   *
   * @function module:tests/io~memoryloader-events-single-frame
   */
  test(
    // eslint-disable-next-line @stylistic/js/max-len
    'MemoryLoader events single frame - #DWV-REQ-IO-04-001 DICOM load start event',
    async () => {
      // #0: 2 good dicom
      const data0 = [
        {
          data: b64urlToArrayBuffer(bbmri53323131),
          filename: 'bbmri-53323131.dcm'
        },
        {
          data: b64urlToArrayBuffer(bbmri53323275),
          filename: 'bbmri-53323275.dcm'
        }
      ];
      const nData0 = data0.length;
      const nDataOk0 = nData0;
      await checkLoad('0', data0, nData0, nDataOk0);

      // // #1: 2 not found (404) dicom
      // const data1 = [
      //   '/a.dcm',
      //   '/b.dcm',
      // ];
      // const nData1 = data1.length;
      // const nDataOk1 = 0;
      // await checkLoad('1', data1, nData1, nDataOk1);

      // // #2: 2 dicom, 1 not found (404, error in XHR request)
      // const data2 = [
      //   '/tests/data/bbmri-53323131.dcm',
      //   '/b.dcm',
      // ];
      // const nData2 = data2.length;
      // const nDataOk2 = 1;
      // await checkLoad('2', data2, nData2, nDataOk2);

      // #3: 2 dicom, 1 bad (bad prefix, error in loader)
      const data3 = [
        {
          data: b64urlToArrayBuffer(dwvTestSimple),
          filename: 'dwv-test-simple.dcm'
        },
        {
          data: b64urlToArrayBuffer(dwvTestBadPrefix),
          filename: 'dwv-test_bad-prefix.dcm',
        }
      ];
      const nData3 = data3.length;
      const nDataOk3 = 1;

      // console warn spy
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      // run test
      await checkLoad('3', data3, nData3, nDataOk3);
      // expect warn call
      expect(consoleSpy).toHaveBeenNthCalledWith(
        1, 'Invalid DICM prefix (DIMC), trying to guess tansfer syntax.');
      const vr = String.fromCharCode(0, 0);
      expect(consoleSpy).toHaveBeenNthCalledWith(
        2, `Unknown VR: ${vr} (for tag 00000000), treating as 'UN'`);
      // reset spy
      consoleSpy.mockReset();
    }
  );

  /**
   * Tests for {@link MemoryLoader} events with multi frame data.
   *
   * @function module:tests/io~memoryloader-events-multi-frame
   */
  test(
    'MemoryLoader events multi frame - ' +
    '#DWV-REQ-IO-04-001 DICOM load start event',
    async () => {
      // #0: simple multi frame
      const data0 = [
        {
          data: b64urlToArrayBuffer(multiframeTest1),
          filename: 'multiframe-test1.dcm'
        }
      ];
      const nData0 = data0.length;
      const nDataOk0 = nData0;
      await checkLoad('0', data0, nData0, nDataOk0);

      // #1: encoded multi frame
      // TODO seems to cause problems to phantomjs...
      /*const data1 = [
            "/tests/data/multiframe-jpegloss-ge.dcm",
        ];
        const nData1 = data1.length;
        const nDataOk1 = nData1;
        await checkLoad("1", data1, nData1, nDataOk1);*/
    }
  );

  /**
   * Tests for {@link MemoryLoader} events with zipped data.
   * TODO check all good...
   *
   * @function module:tests/io~memoryloader-events-zip
   */
  test(
    'MemoryLoader events zip - #DWV-REQ-IO-04-001 DICOM load start event',
    async () => {
      // #0: simple zip
      const data0 = [
        {
          data: b64urlToArrayBuffer(bbmriZip),
          filename: 'bbmri.zip'
        }
      ];
      const nData0 = 2;
      const nDataOk0 = 2;
      await checkLoad('0', data0, nData0, nDataOk0);

      // // #1: bad link to zip
      // const data1 = [
      //   '/tests/data/a.zip',
      // ];
      // const nData1 = 1;
      // const nDataOk1 = 0;
      // await checkLoad('1', data1, nData1, nDataOk1);

      // #2: zip with erroneus data
      const data2 = [
        {
          data: b64urlToArrayBuffer(dwvTestBadZip),
          filename: 'dwv-test_bad.zip'
        }
      ];
      const nData2 = 2;
      const nDataOk2 = 1;

      // console warn spy
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      // run test
      await checkLoad('2', data2, nData2, nDataOk2);
      // expect warn call
      expect(consoleSpy).toHaveBeenCalledWith(
        'Invalid DICM prefix (DIMC), trying to guess tansfer syntax.');
      // reset spy
      consoleSpy.mockReset();
    }
  );

  /**
   * Tests for {@link UrlsLoader} events with DCMDIR data.
   *
   * @function module:tests/io~urlsloader-events
   */
  // TODO...
  // test('Test UrlsLoader events for DCMDIR data.', () => {
  //   // #0: simple DCMDIR
  //   const data0 = [
  //     '/tests/data/bbmri.dcmdir',
  //   ];
  //   const nData0 = 4;
  //   const nDataOk0 = 4;
  //   await checkLoad('0', data0, nData0, nDataOk0);

  //   // #1: bad link to DCMDIR
  //   const data1 = [
  //     '/tests/data/a.dcmdir',
  //   ];
  //   const nData1 = 1;
  //   const nDataOk1 = 0;
  //   await checkLoad('1', data1, nData1, nDataOk1);

  //   // #2: DCMDIR with bad links -> TODO
  //   // #3: DCMDIR with erroneus data -> TODO
  // });

});