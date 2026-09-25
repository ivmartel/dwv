import {describe, beforeAll, test, assert, vi} from 'vitest';

// ---------------------------------------------------------------------------
// Mock ThreadPool so no real Web Worker is ever created: tasks are
// decoded synchronously in-process with the RLE decoder (the one used
// by the RLE worker), and results are sent back the same way the
// real WorkerThread does (augmented event on onworkitem).
// In deferred mode, tasks are queued in poolState.pendingTasks instead,
// to be run by the test in any order (the real pool decodes in parallel
// so items can be decoded in any order).
// vi.mock is hoisted by Vitest so it runs before any import.
// ---------------------------------------------------------------------------
const poolState = vi.hoisted(() => ({deferred: false, pendingTasks: []}));

vi.mock('../../src/utils/thread.js', async (importOriginal) => {
  const original = await importOriginal();
  const {RleDecoder} = await import('../../src/decoders/dwv/rle.js');

  /**
   * Synchronous ThreadPool.
   */
  class ThreadPool {
    onworkitem(_event) {}
    onabort(_event) {}
    addWorkerTask(task) {
      if (poolState.deferred) {
        poolState.pendingTasks.push({
          run: () => this.runTask(task),
          itemNumber: task.info.itemNumber,
          index: task.info.index
        });
      } else {
        this.runTask(task);
      }
    }
    runTask(task) {
      const buffer = task.startMessage.buffer;
      const meta = task.startMessage.meta;
      const decoded = new RleDecoder().decode(
        buffer,
        meta.bitsAllocated,
        meta.isSigned,
        meta.sliceSize,
        meta.samplesPerPixel,
        meta.planarConfiguration
      );
      this.onworkitem({
        data: [decoded],
        itemNumber: task.info.itemNumber,
        numberOfItems: task.info.numberOfItems,
        index: task.info.index,
        indexOrigin: task.info.indexOrigin
      });
    }
    abort() {
      this.onabort({});
    }
  }

  return {...original, ThreadPool};
});

import {DicomBufferToData} from '../../src/image/dicomBufferToData.js';
import {logger} from '../../src/utils/logger.js';
import {generateSliceBuffers} from '../../dev/dicom/dicomGenerator.js';
import {
  dataStructures,
  getStructureBuffers,
  getStructureElementsList,
  singleSliceStructure
} from '../../dev/dicom/dataStructures.js';

import syntheticImgData from '/tests/data/synthetic-img.json';
import syntheticKosData from '/tests/data/synthetic-kos.json';

/**
 * Tests for the 'image/dicomBufferToData.js' file.
 */

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Uncompressed data uses Explicit VR Little Endian: RLE (like all
// encapsulated syntaxes) is always explicit VR little endian (PS3.5 A.4),
// so both paths only differ by compression. DicomBufferToData only
// branches on compressed or not, other uncompressed syntaxes (implicit,
// big endian) are handled by the parser (see the synthetic read/write
// tests in tests/dicom/dicomWriter.test.js).
const Syntax = {
  ExplicitVRLittleEndian: '1.2.840.10008.1.2.1',
  RLELossless: '1.2.840.10008.1.2.5'
};

/**
 * Generate the DICOM buffer of the first file of a data structure.
 *
 * @param {object} config The data configuration.
 * @param {string} syntax The transfer syntax.
 * @param {object} [structure] The data structure,
 *   defaults to single slice.
 * @returns {ArrayBuffer} The DICOM buffer.
 */
function getBuffer(config, syntax, structure = singleSliceStructure) {
  return getStructureBuffers(config, syntax, structure)[0];
}

/**
 * Get the reference (uncompressed) pixels of the first file of a
 * data structure.
 *
 * @param {object} config The data configuration.
 * @param {object} [structure] The data structure,
 *   defaults to single slice.
 * @returns {number[]} The pixel values.
 */
function getReferencePixels(config, structure = singleSliceStructure) {
  const elements = getStructureElementsList(
    config, Syntax.ExplicitVRLittleEndian, structure)[0];
  return Array.from(elements['7FE00010'].value);
}

/**
 * Create a converter that records all its events.
 *
 * @param {object} [options] Optional converter options.
 * @returns {object} The converter and the recorded events
 *   as {converter, events}, each event being {type, event}.
 */
function getRecordingConverter(options) {
  const converter = new DicomBufferToData();
  converter.setOptions(
    typeof options !== 'undefined' ? options : {numberOfFiles: 1});
  const events = [];
  const types = [
    'onloadstart',
    'onloaditem',
    'onprogress',
    'onload',
    'onloadend',
    'onerror',
    'onabort'
  ];
  for (const type of types) {
    converter[type] = (event) => {
      events.push({type, event});
    };
  }
  return {converter, events};
}

/**
 * Get the events of a given type.
 *
 * @param {object[]} events The recorded events.
 * @param {string} type The event type.
 * @returns {object[]} The events of that type.
 */
function eventsOfType(events, type) {
  return events.filter((item) => item.type === type).map(
    (item) => item.event);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('image', () => {

  describe('DicomBufferToData', () => {

    const config = syntheticImgData[0];

    describe('uncompressed', () => {

      const syntax = Syntax.ExplicitVRLittleEndian;

      test('event sequence', () => {
        const {converter, events} = getRecordingConverter();
        converter.convert(getBuffer(config, syntax), 'origin0', 0);
        assert.deepEqual(
          events.map((item) => item.type),
          ['onloadstart', 'onloaditem', 'onprogress', 'onload', 'onloadend'],
          'event sequence'
        );
        const start = eventsOfType(events, 'onloadstart')[0];
        assert.equal(start.source, 'origin0', 'loadstart source');
        assert.equal(start.index, 0, 'loadstart index');
        const progress = eventsOfType(events, 'onprogress')[0];
        assert.equal(progress.loaded, 100, 'progress loaded');
        assert.equal(progress.total, 100, 'progress total');
      });

      test('data meta and buffer', () => {
        const {converter, events} = getRecordingConverter(
          {numberOfFiles: 3});
        converter.convert(getBuffer(config, syntax), 'origin0', 0);
        const item = eventsOfType(events, 'onloaditem')[0];
        assert.equal(item.source, 'origin0', 'loaditem source');
        const data = item.data;
        assert.equal(data.numberOfFiles, 3, 'numberOfFiles from options');
        assert.equal(
          data.meta['00080060'].value[0], config.tags.Modality, 'Modality');
        assert.equal(
          data.meta['00020010'].value[0], syntax, 'TransferSyntaxUID');
        assert.deepEqual(
          Array.from(data.buffer),
          getReferencePixels(config),
          'buffer matches generated pixels'
        );
      });

    });

    test('non image data: no buffer', () => {
      const kosConfig = syntheticKosData[0];
      const {converter, events} = getRecordingConverter();
      converter.convert(
        getBuffer(kosConfig, Syntax.ExplicitVRLittleEndian),
        'origin0', 0);
      assert.deepEqual(
        events.map((item) => item.type),
        ['onloadstart', 'onloaditem', 'onprogress', 'onload', 'onloadend'],
        'event sequence'
      );
      const data = eventsOfType(events, 'onloaditem')[0].data;
      assert.equal(data.buffer, undefined, 'no buffer');
      assert.equal(data.meta['00080060'].value[0], 'KO', 'Modality');
    });

    test('parse error', () => {
      // the parser warns (missing DICM prefix, unknown VR) before failing
      const warnSpy = vi.spyOn(logger, 'warn').mockImplementation(() => {});
      const {converter, events} = getRecordingConverter();
      const badBuffer = new Uint8Array(200).buffer;
      converter.convert(badBuffer, 'origin0', 0);
      const warnCalls = warnSpy.mock.calls;
      warnSpy.mockRestore();
      assert.ok(
        warnCalls[0][0].startsWith('Invalid DICM prefix'),
        'invalid prefix warning');
      assert.deepEqual(
        events.map((item) => item.type),
        ['onloadstart', 'onerror', 'onloadend'],
        'event sequence'
      );
      const error = eventsOfType(events, 'onerror')[0];
      assert.ok(error.error instanceof Error, 'error is an Error');
      assert.equal(error.source, 'origin0', 'error source');
    });

    test('abort without decoder', () => {
      const {converter, events} = getRecordingConverter();
      converter.abort();
      assert.deepEqual(
        events.map((item) => item.type), ['onabort'], 'abort event');
    });

    // decoding itself is tested in tests/decoders/dwv/rle.test.js,
    // test the converter with a monochrome and a RGB image: the latter
    // being the only one that needs the planar configuration
    describe.each([
      syntheticImgData[0],
      syntheticImgData[2]
    ])('RLE $name', (imgConfig) => {

      test('single frame: decoded buffer', () => {
        const {converter, events} = getRecordingConverter();
        converter.convert(
          getBuffer(imgConfig, Syntax.RLELossless), 'origin0', 0);
        assert.deepEqual(
          events.map((item) => item.type),
          [
            'onloadstart',
            'onprogress',
            'onloaditem',
            'onload',
            'onloadend'
          ],
          'event sequence'
        );
        const data = eventsOfType(events, 'onloaditem')[0].data;
        assert.deepEqual(
          Array.from(data.buffer),
          getReferencePixels(imgConfig),
          'decoded buffer matches generated pixels'
        );
      });

      test('multi frame: decoded buffer', () => {
        const structure = dataStructures.multiframe;
        const numberOfFrames = structure.numberOfFrames;
        const {converter, events} = getRecordingConverter();
        converter.convert(
          getBuffer(imgConfig, Syntax.RLELossless, structure),
          'origin0', 0);

        // one progress per frame
        const progress = eventsOfType(events, 'onprogress');
        assert.equal(progress.length, numberOfFrames, 'progress count');
        for (let i = 0; i < numberOfFrames; ++i) {
          assert.equal(progress[i].loaded, i + 1, `progress ${i} loaded`);
          assert.equal(
            progress[i].total, numberOfFrames, `progress ${i} total`);
        }
        // data generated once, load sent once
        assert.equal(
          eventsOfType(events, 'onloaditem').length, 1, 'one loaditem');
        assert.equal(eventsOfType(events, 'onload').length, 1, 'one load');
        assert.equal(
          eventsOfType(events, 'onloadend').length, 1, 'one loadend');
        assert.equal(
          eventsOfType(events, 'onerror').length, 0, 'no error');

        // buffer is filled after the first item (shared reference)
        const data = eventsOfType(events, 'onloaditem')[0].data;
        assert.deepEqual(
          Array.from(data.buffer),
          getReferencePixels(imgConfig, structure),
          'decoded buffer matches generated pixels'
        );
      });

    });

    // same data structures as the ImageFactory creation tests, each
    // file converted in turn by the same converter (as DicomDataLoader)
    describe.each(Object.values(dataStructures))(
      'RLE structure: $name', (structure) => {

        const framesPerFile = typeof structure.numberOfFrames !== 'undefined'
          ? structure.numberOfFrames : 1;

        let refElementsList;
        let events;

        beforeAll(() => {
          refElementsList = getStructureElementsList(
            config, Syntax.ExplicitVRLittleEndian, structure);
          const buffers = getStructureBuffers(
            config, Syntax.RLELossless, structure);

          const recording = getRecordingConverter(
            {numberOfFiles: buffers.length});
          events = recording.events;
          for (let i = 0; i < buffers.length; ++i) {
            recording.converter.convert(buffers[i], `origin${i}`, i);
          }
        });

        test('one load per file, no error', () => {
          const numberOfFiles = refElementsList.length;
          assert.equal(
            eventsOfType(events, 'onloadstart').length, numberOfFiles,
            'one loadstart per file');
          assert.equal(
            eventsOfType(events, 'onloaditem').length, numberOfFiles,
            'one loaditem per file');
          assert.equal(
            eventsOfType(events, 'onload').length, numberOfFiles,
            'one load per file');
          assert.equal(
            eventsOfType(events, 'onloadend').length, numberOfFiles,
            'one loadend per file');
          assert.equal(
            eventsOfType(events, 'onerror').length, 0, 'no error');
        });

        test('one progress per frame', () => {
          const progress = eventsOfType(events, 'onprogress');
          assert.equal(
            progress.length, refElementsList.length * framesPerFile,
            'progress count');
          for (let i = 0; i < progress.length; ++i) {
            const fileIndex = Math.floor(i / framesPerFile);
            const frameIndex = i % framesPerFile;
            assert.equal(progress[i].index, fileIndex, `progress ${i} index`);
            assert.equal(
              progress[i].loaded, frameIndex + 1, `progress ${i} loaded`);
            assert.equal(
              progress[i].total, framesPerFile, `progress ${i} total`);
          }
        });

        test('each file data has its own meta and decoded buffer', () => {
          const items = eventsOfType(events, 'onloaditem');
          for (let i = 0; i < items.length; ++i) {
            const refElements = refElementsList[i];
            const data = items[i].data;
            assert.equal(items[i].source, `origin${i}`, `file ${i} source`);
            assert.equal(
              data.numberOfFiles, refElementsList.length,
              `file ${i} numberOfFiles`);
            assert.equal(
              data.meta['00080018'].value[0],
              refElements['00080018'].value[0],
              `file ${i} SOPInstanceUID`);
            assert.equal(
              data.meta['00200013'].value[0],
              refElements['00200013'].value[0],
              `file ${i} InstanceNumber`);
            assert.deepEqual(
              Array.from(data.buffer),
              Array.from(refElements['7FE00010'].value),
              `file ${i} decoded buffer matches generated pixels`);
          }
          // sanity check the generated data actually varies per file,
          // otherwise a mix-up between data indices would go unnoticed
          if (items.length > 1) {
            assert.notDeepEqual(
              Array.from(items[0].data.buffer),
              Array.from(items[1].data.buffer),
              'file 0 and file 1 buffers differ');
          }
        });

      });

    test('RLE: several data indices on one converter', () => {
      const {converter, events} = getRecordingConverter();
      // different configs and number of frames per index
      const config1 = syntheticImgData[1];
      const structure0 = dataStructures.multiframe;
      const structure1 = dataStructures.multiframeMultiSlice;
      converter.convert(
        getBuffer(config, Syntax.RLELossless, structure0), 'origin0', 0);
      converter.convert(
        getBuffer(config1, Syntax.RLELossless, structure1), 'origin1', 1);

      const items = eventsOfType(events, 'onloaditem');
      assert.equal(items.length, 2, 'one loaditem per data');
      assert.equal(items[0].source, 'origin0', 'first source');
      assert.equal(items[1].source, 'origin1', 'second source');
      assert.deepEqual(
        Array.from(items[0].data.buffer),
        getReferencePixels(config, structure0),
        'first buffer'
      );
      assert.deepEqual(
        Array.from(items[1].data.buffer),
        getReferencePixels(config1, structure1),
        'second buffer'
      );
    });

    describe('RLE: items decoded in any order', () => {

      const structure = dataStructures.multiframe;
      const numberOfFrames = structure.numberOfFrames;

      /**
       * Convert buffers with deferred decoding, then run the decoding
       * tasks in the given order.
       *
       * @param {ArrayBuffer[]} buffers The buffers, one per data index.
       * @param {Function} sortTasks The pending tasks sort function.
       * @returns {object[]} The recorded events.
       */
      function convertDeferred(buffers, sortTasks) {
        const {converter, events} = getRecordingConverter();
        poolState.deferred = true;
        poolState.pendingTasks = [];
        try {
          for (let i = 0; i < buffers.length; ++i) {
            converter.convert(buffers[i], `origin${i}`, i);
          }
        } finally {
          poolState.deferred = false;
        }
        const tasks = poolState.pendingTasks.slice().sort(sortTasks);
        poolState.pendingTasks = [];
        for (const task of tasks) {
          task.run();
        }
        return events;
      }

      test('reverse order: data once, load after the last item', () => {
        const events = convertDeferred(
          [getBuffer(config, Syntax.RLELossless, structure)],
          (a, b) => b.itemNumber - a.itemNumber
        );

        const types = events.map((item) => item.type);
        assert.deepEqual(
          types.filter((type) => type !== 'onloadstart'),
          [
            'onprogress',
            'onloaditem',
            'onprogress',
            'onprogress',
            'onload',
            'onloadend'
          ],
          'event sequence'
        );
        const progress = eventsOfType(events, 'onprogress');
        assert.deepEqual(
          progress.map((event) => event.loaded), [1, 2, 3],
          'progress counts decoded items');
        assert.equal(
          progress[0].total, numberOfFrames, 'progress total');

        // buffer is filled after the first item (shared reference)
        const data = eventsOfType(events, 'onloaditem')[0].data;
        assert.deepEqual(
          Array.from(data.buffer),
          getReferencePixels(config, structure),
          'decoded buffer matches generated pixels'
        );
      });

      test('interleaved data indices', () => {
        const config1 = syntheticImgData[1];
        // decode in reverse order, alternating between data indices
        const events = convertDeferred(
          [
            getBuffer(config, Syntax.RLELossless, structure),
            getBuffer(config1, Syntax.RLELossless, structure)
          ],
          (a, b) => (b.itemNumber - a.itemNumber) || (b.index - a.index)
        );

        const items = eventsOfType(events, 'onloaditem');
        assert.equal(items.length, 2, 'one loaditem per data');
        assert.equal(eventsOfType(events, 'onload').length, 2, 'two loads');
        assert.equal(
          eventsOfType(events, 'onloadend').length, 2, 'two loadends');
        // each index load comes after all its decoded items
        for (const index of [0, 1]) {
          const isIndex = (item) => item.event.index === index;
          const lastProgress = events.findLastIndex(
            (item) => item.type === 'onprogress' && isIndex(item));
          const load = events.findIndex(
            (item) => item.type === 'onload' && isIndex(item));
          assert.ok(
            lastProgress < load, `index ${index} load after its items`);
        }
        const byOrigin = {};
        for (const item of items) {
          byOrigin[item.source] = item.data;
        }
        assert.deepEqual(
          Array.from(byOrigin.origin0.buffer),
          getReferencePixels(config, structure),
          'first data buffer'
        );
        assert.deepEqual(
          Array.from(byOrigin.origin1.buffer),
          getReferencePixels(config1, structure),
          'second data buffer'
        );
      });

    });

    describe.each([
      {
        name: 'BitsAllocated',
        keys: ['00280100'],
        missing: ['bitsAllocated'],
        parserWarning: 'Reading DICOM pixel data with default bitsAllocated.'
      },
      {name: 'Rows', keys: ['00280010'], missing: ['rows']},
      {name: 'Columns', keys: ['00280011'], missing: ['columns']},
      {
        name: 'Rows and Columns',
        keys: ['00280010', '00280011'],
        missing: ['columns', 'rows']
      }
    ])('RLE: missing $name for decompression', (testCase) => {

      test('error event naming the missing tags', () => {
        // generate elements and remove tags before writing
        const elements = getStructureElementsList(
          config, Syntax.RLELossless, singleSliceStructure)[0];
        for (const key of testCase.keys) {
          delete elements[key];
        }
        const buffer = generateSliceBuffers([elements])[0];

        const warnSpy = vi.spyOn(logger, 'warn').mockImplementation(() => {});
        const {converter, events} = getRecordingConverter();
        converter.convert(buffer, 'origin0', 0);
        const warnings = warnSpy.mock.calls.map((call) => call[0]);
        warnSpy.mockRestore();
        // possible parser warning (the call history is cleared by
        // mockRestore, hence the copy above)
        if (typeof testCase.parserWarning !== 'undefined') {
          assert.deepEqual(
            warnings, [testCase.parserWarning], 'parser warning');
        } else {
          assert.deepEqual(warnings, [], 'no warning');
        }

        assert.equal(eventsOfType(events, 'onloaditem').length, 0,
          'no loaditem');
        assert.equal(eventsOfType(events, 'onload').length, 0, 'no load');
        const errors = eventsOfType(events, 'onerror');
        assert.equal(errors.length, 1, 'one error');
        assert.ok(
          errors[0].error.message.endsWith(
            `:${testCase.missing.toString()}`),
          'error message names the missing tags'
        );
        assert.equal(
          eventsOfType(events, 'onloadend').length, 1, 'one loadend');
      });

    });

  });

});
