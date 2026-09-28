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
import {DataController} from '../../src/app/dataController.js';
import {ImageFactory} from '../../src/image/imageFactory.js';
import {logger} from '../../src/utils/logger.js';
import {generateSliceBuffers} from '../../dev/dicom/dicomGenerator.js';
import {
  dataStructures,
  getStructureBuffers,
  getStructureElementsList,
  singleSliceStructure,
  unsortedMultiframeMultiSliceStructure
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

/**
 * Get the reference (uncompressed) frames of a file, in encoding order.
 *
 * @param {object} elements The file data elements.
 * @param {number} numberOfFrames The number of frames.
 * @returns {number[][]} The frames pixel values.
 */
function getReferenceFrames(elements, numberOfFrames) {
  const pixels = Array.from(elements['7FE00010'].value);
  const frameSize = pixels.length / numberOfFrames;
  const frames = [];
  for (let f = 0; f < numberOfFrames; ++f) {
    frames.push(pixels.slice(f * frameSize, (f + 1) * frameSize));
  }
  return frames;
}

/**
 * Get the number of frames per file of a data structure.
 *
 * @param {object} structure The data structure.
 * @returns {number} The number of frames.
 */
function getFramesPerFile(structure) {
  return typeof structure.numberOfFrames !== 'undefined'
    ? structure.numberOfFrames : 1;
}

/**
 * Convert buffers with deferred decoding, then run the decoding
 * tasks in the given order (uncompressed data is not deferred).
 *
 * @param {ArrayBuffer[]} buffers The buffers, one per data index.
 * @param {Function} sortTasks The pending tasks sort function.
 * @param {object} [options] Optional converter options.
 * @param {Function} [setup] Optional converter setup function,
 *   called with the recording converter before conversion.
 * @returns {object[]} The recorded events.
 */
function convertDeferred(buffers, sortTasks, options, setup) {
  const {converter, events} = getRecordingConverter(options);
  if (typeof setup !== 'undefined') {
    setup(converter);
  }
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

/**
 * Get a converter setup function that adds or appends the loaded
 * data to a data controller, as the app does.
 *
 * @param {DataController} dataController The data controller.
 * @returns {Function} The setup function.
 */
function getDataControllerSetup(dataController) {
  return (converter) => {
    const record = converter.onloaditem;
    converter.onloaditem = (event) => {
      record(event);
      if (typeof dataController.get('0') === 'undefined') {
        dataController.add('0', event.data);
      } else {
        dataController.update('0', event.data);
      }
    };
  };
}

/**
 * Build the reference image of a data structure from its uncompressed
 * files, without converter nor data controller: one image per frame
 * appended in encoding order.
 *
 * @param {object} config The data configuration.
 * @param {object} structure The data structure.
 * @returns {object} The reference image.
 */
function getReferenceImage(config, structure) {
  const elementsList = getStructureElementsList(
    config, Syntax.ExplicitVRLittleEndian, structure);
  const numberOfFrames = getFramesPerFile(structure);
  const factory = new ImageFactory();
  let image;
  for (const elements of elementsList) {
    factory.checkElements(elements);
    const frames = getReferenceFrames(elements, numberOfFrames);
    const TypedArray = elements['7FE00010'].value.constructor;
    for (let f = 0; f < numberOfFrames; ++f) {
      const frameImage = factory.create(
        elements,
        new TypedArray(frames[f]),
        elementsList.length,
        numberOfFrames === 1 ? undefined : f);
      if (typeof image === 'undefined') {
        image = frameImage;
      } else {
        image.appendSlice(frameImage);
      }
    }
  }
  return image;
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

    // the app aborts the load when a frame cannot be added (for example
    // an unsupported geometry): the following frames should not be sent
    // (the mock pool abort does not cancel the pending tasks, as a
    // real worker can have finished before the abort)
    describe.each([
      {name: 'uncompressed', syntax: Syntax.ExplicitVRLittleEndian},
      {name: 'RLE', syntax: Syntax.RLELossless}
    ])('multi frame: abort at first loaded item, $name', ({syntax}) => {

      test('no more item nor load', () => {
        const events = convertDeferred(
          [getBuffer(config, syntax, dataStructures.multiframe)],
          (a, b) => a.itemNumber - b.itemNumber,
          undefined,
          (converter) => {
            const record = converter.onloaditem;
            converter.onloaditem = (event) => {
              record(event);
              converter.abort();
            };
          }
        );
        assert.equal(
          eventsOfType(events, 'onloaditem').length, 1, 'one loaditem');
        assert.equal(eventsOfType(events, 'onabort').length, 1, 'one abort');
        assert.equal(eventsOfType(events, 'onload').length, 0, 'no load');
      });

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

      test('multi frame: one data per frame', () => {
        const structure = dataStructures.multiframe;
        const numberOfFrames = structure.numberOfFrames;
        const {converter, events} = getRecordingConverter();
        converter.convert(
          getBuffer(imgConfig, Syntax.RLELossless, structure),
          'origin0', 0);

        // one progress and data per frame
        const progress = eventsOfType(events, 'onprogress');
        assert.equal(progress.length, numberOfFrames, 'progress count');
        for (let i = 0; i < numberOfFrames; ++i) {
          assert.equal(progress[i].loaded, i + 1, `progress ${i} loaded`);
          assert.equal(
            progress[i].total, numberOfFrames, `progress ${i} total`);
        }
        const items = eventsOfType(events, 'onloaditem');
        assert.equal(items.length, numberOfFrames, 'one loaditem per frame');
        // load sent once
        assert.equal(eventsOfType(events, 'onload').length, 1, 'one load');
        assert.equal(
          eventsOfType(events, 'onloadend').length, 1, 'one loadend');
        assert.equal(
          eventsOfType(events, 'onerror').length, 0, 'no error');

        const refFrames = getReferenceFrames(
          getStructureElementsList(
            imgConfig, Syntax.ExplicitVRLittleEndian, structure)[0],
          numberOfFrames);
        for (let i = 0; i < numberOfFrames; ++i) {
          const data = items[i].data;
          assert.equal(data.frameNumber, i, `item ${i} frame number`);
          assert.deepEqual(
            Array.from(data.buffer), refFrames[i],
            `item ${i} buffer matches generated frame`);
        }
      });

    });

    // same data structures as the ImageFactory creation tests, each
    // file converted in turn by the same converter (as DicomDataLoader)
    describe.each([
      {name: 'uncompressed', syntax: Syntax.ExplicitVRLittleEndian},
      {name: 'RLE', syntax: Syntax.RLELossless}
    ])('$name', ({syntax}) => {

      describe.each(Object.values(dataStructures))(
        'structure: $name', (structure) => {

          const framesPerFile = getFramesPerFile(structure);

          let refElementsList;
          let events;

          beforeAll(() => {
            refElementsList = getStructureElementsList(
              config, Syntax.ExplicitVRLittleEndian, structure);
            const buffers = getStructureBuffers(config, syntax, structure);

            const recording = getRecordingConverter(
              {numberOfFiles: buffers.length});
            events = recording.events;
            for (let i = 0; i < buffers.length; ++i) {
              recording.converter.convert(buffers[i], `origin${i}`, i);
            }
          });

          test('one load per file, one data per frame, no error', () => {
            const numberOfFiles = refElementsList.length;
            assert.equal(
              eventsOfType(events, 'onloadstart').length, numberOfFiles,
              'one loadstart per file');
            assert.equal(
              eventsOfType(events, 'onloaditem').length,
              numberOfFiles * framesPerFile,
              'one loaditem per frame');
            assert.equal(
              eventsOfType(events, 'onload').length, numberOfFiles,
              'one load per file');
            assert.equal(
              eventsOfType(events, 'onloadend').length, numberOfFiles,
              'one loadend per file');
            assert.equal(
              eventsOfType(events, 'onerror').length, 0, 'no error');
          });

          test('each data has its file meta and frame buffer', () => {
            const items = eventsOfType(events, 'onloaditem');
            for (let i = 0; i < items.length; ++i) {
              const fileIndex = Math.floor(i / framesPerFile);
              const frameIndex = i % framesPerFile;
              const refElements = refElementsList[fileIndex];
              const data = items[i].data;
              assert.equal(
                items[i].source, `origin${fileIndex}`, `item ${i} source`);
              assert.equal(
                data.numberOfFiles, refElementsList.length,
                `item ${i} numberOfFiles`);
              assert.equal(
                data.meta['00080018'].value[0],
                refElements['00080018'].value[0],
                `item ${i} SOPInstanceUID`);
              if (framesPerFile === 1) {
                assert.isUndefined(data.frameNumber, `item ${i} frame number`);
              } else {
                assert.equal(
                  data.frameNumber, frameIndex, `item ${i} frame number`);
              }
              assert.deepEqual(
                Array.from(data.buffer),
                getReferenceFrames(refElements, framesPerFile)[frameIndex],
                `item ${i} buffer matches generated frame`);
            }
          });

        });

      // assembled image: frames decoded in reverse order (across files),
      // data added as it arrives (as the app does), the result
      // should be the same as the one built from the full files
      describe.each([
        ...Object.values(dataStructures),
        unsortedMultiframeMultiSliceStructure
      ])('assembled structure: $name', (structure) => {

        let image;
        let refImage;
        let events;

        beforeAll(() => {
          const buffers = getStructureBuffers(config, syntax, structure);
          const dataController = new DataController();
          events = convertDeferred(
            buffers,
            (a, b) => (b.itemNumber - a.itemNumber) || (b.index - a.index),
            {numberOfFiles: buffers.length},
            getDataControllerSetup(dataController)
          );
          dataController.markDataAsComplete('0');
          image = dataController.get('0').image;
          refImage = getReferenceImage(config, structure);
        });

        test('no error', () => {
          assert.equal(
            eventsOfType(events, 'onerror').length, 0, 'no error');
        });

        test('same size and origins', () => {
          assert.deepEqual(
            image.getGeometry().getSize().getValues(),
            refImage.getGeometry().getSize().getValues(),
            'size');
          assert.deepEqual(
            image.getGeometry().getOrigins().map((item) => item.getValues()),
            refImage.getGeometry().getOrigins().map(
              (item) => item.getValues()),
            'origins');
        });

        test('same buffer', () => {
          assert.deepEqual(
            Array.from(image.getBuffer()),
            Array.from(refImage.getBuffer()),
            'buffer');
        });

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
      assert.equal(
        items.length,
        structure0.numberOfFrames + structure1.numberOfFrames,
        'one loaditem per frame');
      const cases = [
        {origin: 'origin0', imgConfig: config, structure: structure0},
        {origin: 'origin1', imgConfig: config1, structure: structure1}
      ];
      for (const {origin, imgConfig, structure} of cases) {
        const refFrames = getReferenceFrames(
          getStructureElementsList(
            imgConfig, Syntax.ExplicitVRLittleEndian, structure)[0],
          structure.numberOfFrames);
        const frames = items.filter((item) => item.source === origin);
        assert.deepEqual(
          frames.map((item) => Array.from(item.data.buffer)), refFrames,
          `${origin} frames`);
      }
    });

    describe('RLE: items decoded in any order', () => {

      const structure = dataStructures.multiframe;
      const numberOfFrames = structure.numberOfFrames;

      test('reverse order: data per frame, load after the last item', () => {
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
            'onloaditem',
            'onprogress',
            'onloaditem',
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

        const items = eventsOfType(events, 'onloaditem');
        assert.deepEqual(
          items.map((item) => item.data.frameNumber), [2, 1, 0],
          'frame numbers in decoding order');
        const refFrames = getReferenceFrames(
          getStructureElementsList(
            config, Syntax.ExplicitVRLittleEndian, structure)[0],
          numberOfFrames);
        for (const item of items) {
          assert.deepEqual(
            Array.from(item.data.buffer), refFrames[item.data.frameNumber],
            `frame ${item.data.frameNumber} buffer`);
        }
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
        assert.equal(items.length, 2 * numberOfFrames, 'one item per frame');
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
        const cases = [
          {origin: 'origin0', imgConfig: config},
          {origin: 'origin1', imgConfig: config1}
        ];
        for (const {origin, imgConfig} of cases) {
          const refFrames = getReferenceFrames(
            getStructureElementsList(
              imgConfig, Syntax.ExplicitVRLittleEndian, structure)[0],
            numberOfFrames);
          for (const item of items.filter((it) => it.source === origin)) {
            assert.deepEqual(
              Array.from(item.data.buffer),
              refFrames[item.data.frameNumber],
              `${origin} frame ${item.data.frameNumber} buffer`);
          }
        }
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
