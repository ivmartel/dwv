import {describe, beforeAll, test, assert} from 'vitest';
import {ImageFactory} from '../../src/image/imageFactory.js';
import {Geometry} from '../../src/image/geometry.js';
import {Size} from '../../src/image/size.js';
import {Spacing} from '../../src/image/spacing.js';
import {Point3D} from '../../src/math/point.js';
import {generateDataElements} from '../../dev/dicom/dicomGenerator.js';

import syntheticData from '/tests/data/synthetic-img.json';

/**
 * Tests for the 'image/imageFactory.js' file.
 */

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ImageFactory', () => {

  // run the full check/create test suite against every image config
  // in synthetic-img.json (simple MR, RGB, alternate encodings,
  // private tags, charset, etc.)
  describe.each(syntheticData)('$name', (config) => {
    const tags = config.tags;

    // checkElements() and create() are pure (no shared mutable state
    // between calls, no mutation of their inputs) and every test below
    // only reads their results, so both run once per config and are
    // shared across all assertions instead of being redone per test.
    let warning;
    let image;
    let buffer;

    beforeAll(() => {
      const tagsCopy = structuredClone(config.tags);
      tagsCopy.TransferSyntaxUID = '1.2.840.10008.1.2.1';
      const genOptions = {pixelGeneratorName: 'string'};
      const elements = generateDataElements(tagsCopy, genOptions)[0];
      buffer = elements['7FE00010'].value;

      const factory = new ImageFactory();
      warning = factory.checkElements(elements);
      image = factory.create(elements, buffer, 1);
    });

    test('checkElements: returns no warning', () => {
      assert.equal(warning, undefined, 'no warning for valid MR data');
    });

    test('create: geometry matches tags', () => {
      const geo = image.getGeometry();
      const expectedGeo = new Geometry(
        [new Point3D(
          tags.ImagePositionPatient[0],
          tags.ImagePositionPatient[1],
          tags.ImagePositionPatient[2]
        )],
        new Size([tags.Columns, tags.Rows, 1]),
        new Spacing([tags.PixelSpacing[0], tags.PixelSpacing[1], 1])
      );

      assert.ok(geo.equals(expectedGeo), 'geometry matches tags');
      assert.equal(
        geo.getSize().get(0), tags.Columns, 'columns match');
      assert.equal(
        geo.getSize().get(1), tags.Rows, 'rows match');
      assert.deepEqual(
        geo.getOrigin().getValues(), [0, 0, 0], 'origin at (0,0,0)');
      assert.equal(
        geo.getSpacing().get(0), tags.PixelSpacing[0], 'spacing x matches');
      assert.equal(
        geo.getSpacing().get(1), tags.PixelSpacing[1], 'spacing y matches');
    });

    test('create: meta tags match tags', () => {
      const meta = image.getMeta();
      assert.equal(meta.Modality, tags.Modality, 'Modality');
      assert.equal(meta.SOPClassUID, tags.SOPClassUID, 'SOPClassUID');
      assert.equal(
        meta.PhotometricInterpretation,
        tags.PhotometricInterpretation,
        'PhotometricInterpretation'
      );
      assert.equal(meta.BitsAllocated, tags.BitsAllocated, 'BitsAllocated');
      assert.equal(meta.BitsStored, tags.BitsStored, 'BitsStored');
      assert.equal(meta.HighBit, tags.HighBit, 'HighBit');
      assert.equal(
        meta.PixelRepresentation, tags.PixelRepresentation,
        'PixelRepresentation'
      );
      assert.equal(meta.StudyInstanceUID, tags.StudyInstanceUID,
        'StudyInstanceUID');
      assert.equal(meta.SeriesInstanceUID, tags.SeriesInstanceUID,
        'SeriesInstanceUID');
      assert.equal(meta.PatientID, tags.PatientID, 'PatientID');
      assert.equal(meta.numberOfFiles, 1, 'numberOfFiles');
    });

    test('create: length unit is mm when PixelSpacing is present', () => {
      assert.equal(image.getMeta().lengthUnit, 'unit.mm', 'length unit is mm');
    });

    test('create: default RSI (slope=1, intercept=0) when no rescale tags',
      () => {
        const rsi = image.getRescaleSlopeAndIntercept();
        assert.equal(rsi.getSlope(), 1, 'default slope is 1');
        assert.equal(rsi.getIntercept(), 0, 'default intercept is 0');
      }
    );

    test('create: no window presets when no window tags', () => {
      assert.equal(
        image.getMeta().windowPresets, undefined, 'no window presets'
      );
    });

    test('create: pixel buffer values are preserved', () => {
      const imageBuffer = image.getBuffer();
      assert.equal(imageBuffer[0], buffer[0], 'first pixel matches');
      assert.equal(
        imageBuffer[buffer.length - 1],
        buffer[buffer.length - 1],
        'last pixel matches'
      );
    });

    test('create: SOPInstanceUID used as frame UID', () => {
      assert.ok(
        image.includesImageUid(tags.SOPInstanceUID),
        'SOPInstanceUID is in image UIDs'
      );
    });

  });

  // build a 3D volume from multiple single-slice DICOM elements, the way
  // the app assembles a series: one Image per slice via ImageFactory,
  // combined with appendSlice.
  describe('3D creation from generateDicomElements', () => {
    const config = syntheticData[0];
    const numberOfSlices = 4;

    let image;
    let sliceElementsList;

    beforeAll(() => {
      const tagsCopy = structuredClone(config.tags);
      tagsCopy.TransferSyntaxUID = '1.2.840.10008.1.2.1';
      const genOptions = {
        pixelGeneratorName: 'string',
        numberOfSlices
      };
      sliceElementsList = generateDataElements(tagsCopy, genOptions);

      const factory = new ImageFactory();
      for (const sliceElements of sliceElementsList) {
        const pixelBuffer = sliceElements['7FE00010'].value;
        const sliceImage = factory.create(
          sliceElements, pixelBuffer, numberOfSlices);
        if (typeof image === 'undefined') {
          image = sliceImage;
        } else {
          image.appendSlice(sliceImage);
        }
      }
    });

    test('geometry has one slice per generated element set', () => {
      assert.equal(
        image.getGeometry().getSize().get(2), numberOfSlices,
        'slice count matches numberOfSlices'
      );
    });

    test('slice origins are ordered along z with expected spacing', () => {
      const origins = image.getGeometry().getOrigins();
      assert.equal(origins.length, numberOfSlices, 'one origin per slice');
      for (let i = 0; i < numberOfSlices; ++i) {
        assert.equal(origins[i].getZ(), i, `slice ${i} z position`);
      }
    });

    test('pixel buffer content of each slice is preserved', () => {
      const sliceSize = config.tags.Rows * config.tags.Columns;
      const fullBuffer = image.getBuffer();
      for (let i = 0; i < numberOfSlices; ++i) {
        const sliceBuffer = sliceElementsList[i]['7FE00010'].value;
        assert.equal(
          fullBuffer[i * sliceSize], sliceBuffer[0],
          `slice ${i} first pixel matches`
        );
        assert.equal(
          fullBuffer[i * sliceSize + sliceSize - 1],
          sliceBuffer[sliceSize - 1],
          `slice ${i} last pixel matches`
        );
      }
    });

    test('each slice SOPInstanceUID is included as an image UID', () => {
      for (let i = 0; i < numberOfSlices; ++i) {
        const uid = sliceElementsList[i]['00080018'].value[0];
        assert.ok(
          image.includesImageUid(uid),
          `slice ${i} SOPInstanceUID included`
        );
      }
    });

  });

  // build an image from a single multiframe DICOM file (NumberOfFrames
  // tag, one SOPInstanceUID, all frame pixel data in one buffer). With
  // no per-frame position info (no PerFrameFunctionalGroupsSequence),
  // the frames share the file's single spatial position and are stacked
  // along the time dimension instead of z, unlike the spatially-stacked
  // volume built via appendSlice above.
  describe('multiframe creation from generateDataElements', () => {
    const config = syntheticData[0];
    const tags = config.tags;
    const numberOfFrames = 3;

    let image;
    let buffer;

    beforeAll(() => {
      const tagsCopy = structuredClone(config.tags);
      tagsCopy.TransferSyntaxUID = '1.2.840.10008.1.2.1';
      tagsCopy.NumberOfFrames = numberOfFrames;
      const genOptions = {pixelGeneratorName: 'string'};
      const elements = generateDataElements(tagsCopy, genOptions)[0];
      buffer = elements['7FE00010'].value;

      const factory = new ImageFactory();
      factory.checkElements(elements);
      image = factory.create(elements, buffer, 1);
    });

    test('geometry keeps a single spatial slice with frames as time', () => {
      const size = image.getGeometry().getSize();
      assert.equal(size.get(2), 1, 'single spatial slice');
      assert.equal(size.length(), 4, 'geometry gains a time dimension');
      assert.equal(
        size.get(3), numberOfFrames, 'frame count matches NumberOfFrames');
    });

    test('meta numberOfFiles stays 1 for a single multiframe file', () => {
      assert.equal(image.getMeta().numberOfFiles, 1, 'numberOfFiles');
    });

    test('pixel buffer holds all frames with distinct per-frame content',
      () => {
        const sliceSize = tags.Rows * tags.Columns;
        assert.equal(
          buffer.length, sliceSize * numberOfFrames,
          'buffer holds all frames'
        );
        const imageBuffer = image.getBuffer();
        const frames = [];
        for (let f = 0; f < numberOfFrames; ++f) {
          const start = f * sliceSize;
          const end = start + sliceSize;
          frames.push(Array.from(buffer.slice(start, end)));
          assert.deepEqual(
            Array.from(imageBuffer.slice(start, end)),
            frames[f],
            `frame ${f} pixel data is preserved`
          );
        }
        // sanity check the generated data actually varies per frame,
        // otherwise the preservation check above would be vacuous
        // (e.g. a generator that only fills frame 0, leaving the rest
        // zeroed, would still pass it)
        assert.notDeepEqual(
          frames[0], frames[1], 'frame 0 and frame 1 are not identical'
        );
      }
    );

    test('SOPInstanceUID used as frame UID', () => {
      assert.ok(
        image.includesImageUid(tags.SOPInstanceUID),
        'SOPInstanceUID is in image UIDs'
      );
    });

  });

  // build an image from a single multiframe DICOM file that also carries
  // per-frame spatial position (frames3D genOption: Shared/PerFrame
  // FunctionalGroupsSequence with a PlanePositionSequence per frame), as
  // created by dev/dicom/pages/synthetic-data.js's
  // getSingleMultiFrameMultiSliceLink. Unlike the plain multiframe case
  // above, the per-frame ImagePositionPatient lets ImageFactory build a
  // genuine spatial z-stack (getFramesGeometry) from a single file,
  // instead of falling back to a time dimension.
  describe('multiframe multi-slice creation from generateDataElements',
    () => {
      const config = syntheticData[0];
      const tags = config.tags;
      const numberOfFrames = 5;

      let image;
      let buffer;

      beforeAll(() => {
        const tagsCopy = structuredClone(config.tags);
        tagsCopy.TransferSyntaxUID = '1.2.840.10008.1.2.1';
        tagsCopy.NumberOfFrames = numberOfFrames;
        const genOptions = {
          pixelGeneratorName: 'string',
          frames3D: true
        };
        const elements = generateDataElements(tagsCopy, genOptions)[0];
        buffer = elements['7FE00010'].value;

        const factory = new ImageFactory();
        factory.checkElements(elements);
        image = factory.create(elements, buffer, 1);
      });

      test('geometry is a genuine z-stack, not a time dimension', () => {
        const size = image.getGeometry().getSize();
        assert.equal(size.length(), 3, 'no extra time dimension');
        assert.equal(
          size.get(2), numberOfFrames, 'slice count matches NumberOfFrames');
      });

      test('frame origins are ordered along z with expected spacing', () => {
        const origins = image.getGeometry().getOrigins();
        assert.equal(origins.length, numberOfFrames, 'one origin per frame');
        for (let i = 0; i < numberOfFrames; ++i) {
          assert.equal(origins[i].getZ(), i, `frame ${i} z position`);
        }
      });

      test('meta numberOfFiles stays 1 for a single multiframe file', () => {
        assert.equal(image.getMeta().numberOfFiles, 1, 'numberOfFiles');
      });

      test('pixel buffer holds all frames with distinct per-frame content',
        () => {
          const sliceSize = tags.Rows * tags.Columns;
          assert.equal(
            buffer.length, sliceSize * numberOfFrames,
            'buffer holds all frames'
          );
          const imageBuffer = image.getBuffer();
          const frames = [];
          for (let f = 0; f < numberOfFrames; ++f) {
            const start = f * sliceSize;
            const end = start + sliceSize;
            frames.push(Array.from(buffer.slice(start, end)));
            assert.deepEqual(
              Array.from(imageBuffer.slice(start, end)),
              frames[f],
              `frame ${f} pixel data is preserved`
            );
          }
          // sanity check the generated data actually varies per frame,
          // otherwise the preservation check above would be vacuous
          assert.notDeepEqual(
            frames[0], frames[1], 'frame 0 and frame 1 are not identical'
          );
        }
      );

      test('SOPInstanceUID used as frame UID', () => {
        assert.ok(
          image.includesImageUid(tags.SOPInstanceUID),
          'SOPInstanceUID is in image UIDs'
        );
      });

    }
  );

  // build a 4D volume from multiple files, each file itself a spatial
  // multiframe 3D volume (frames3D) representing one time point, as
  // created by dev/dicom/pages/synthetic-data.js's
  // getMultipleSingleFrameMultiSliceLink. Each file is turned into its
  // own z-stack Image via ImageFactory (as in the "multiframe
  // multi-slice" case above), then the per-file volumes are combined
  // with appendVolume rather than appendSlice, since each one is a
  // whole volume (more than one slice) representing a new time point,
  // not a single 2D slice.
  describe(
    'multiple single-frame multi-slice creation from generateDataElements',
    () => {
      const config = syntheticData[0];
      const tags = config.tags;
      const numberOfSlices = 3;
      const numberOfFrames = 5;

      let image;
      let fileElementsList;

      beforeAll(() => {
        const tagsCopy = structuredClone(config.tags);
        tagsCopy.TransferSyntaxUID = '1.2.840.10008.1.2.1';
        tagsCopy.NumberOfFrames = numberOfFrames;
        const genOptions = {
          pixelGeneratorName: 'string',
          frames3D: true,
          numberOfSlices
        };
        fileElementsList = generateDataElements(tagsCopy, genOptions);

        const factory = new ImageFactory();
        for (const elements of fileElementsList) {
          const pixelBuffer = elements['7FE00010'].value;
          const fileImage = factory.create(
            elements, pixelBuffer, numberOfSlices);
          if (typeof image === 'undefined') {
            image = fileImage;
          } else {
            image.appendVolume(fileImage);
          }
        }
      });

      test('generates one multiframe file per slice position', () => {
        assert.equal(
          fileElementsList.length, numberOfSlices,
          'one file per slice position'
        );
      });

      test('geometry is 4D: spatial frames by z, files by time', () => {
        const size = image.getGeometry().getSize();
        assert.equal(size.length(), 4, 'geometry gains a time dimension');
        assert.equal(
          size.get(2), numberOfFrames,
          'z size matches per-file frame count');
        assert.equal(
          size.get(3), numberOfSlices, 'time size matches file count');
      });

      test('frame origins are ordered along z with expected spacing', () => {
        const origins = image.getGeometry().getOrigins();
        assert.equal(origins.length, numberOfFrames, 'one origin per frame');
        for (let i = 0; i < numberOfFrames; ++i) {
          assert.equal(origins[i].getZ(), i, `frame ${i} z position`);
        }
      });

      test('meta numberOfFiles matches the number of combined files', () => {
        assert.equal(
          image.getMeta().numberOfFiles, numberOfSlices, 'numberOfFiles');
      });

      test(
        'pixel buffer holds every file and frame with distinct content',
        () => {
          const sliceSize = tags.Rows * tags.Columns;
          const fullBuffer = image.getBuffer();
          assert.equal(
            fullBuffer.length, sliceSize * numberOfFrames * numberOfSlices,
            'buffer holds every file and frame'
          );

          const frames = [];
          for (let fileIndex = 0; fileIndex < numberOfSlices; ++fileIndex) {
            const fileBuffer = fileElementsList[fileIndex]['7FE00010'].value;
            for (let f = 0; f < numberOfFrames; ++f) {
              const start = (fileIndex * numberOfFrames + f) * sliceSize;
              const end = start + sliceSize;
              const frame = Array.from(fullBuffer.slice(start, end));
              assert.deepEqual(
                frame,
                Array.from(fileBuffer.slice(f * sliceSize, f * sliceSize +
                sliceSize)),
                `file ${fileIndex} frame ${f} pixel data is preserved`
              );
              frames.push(frame);
            }
          }
          // sanity check the generated data actually varies, both across
          // frames within a file (z) and across files at the same frame
          // index (time), otherwise the preservation check above would
          // be vacuous
          assert.notDeepEqual(
            frames[0], frames[1], 'frame 0 and frame 1 of file 0 differ');
          assert.notDeepEqual(
            frames[0], frames[numberOfFrames],
            'frame 0 of file 0 and frame 0 of file 1 differ');
        }
      );

      test('each file SOPInstanceUID is included as an image UID', () => {
        for (const elements of fileElementsList) {
          const uid = elements['00080018'].value[0];
          assert.ok(image.includesImageUid(uid), `${uid} included`);
        }
      });

    }
  );

  // build a 4D volume from multiple single-frame files that all share
  // the same spatial position but differ by TemporalPositionIdentifier
  // (a "cine" style series stored as separate single-frame instances),
  // as created by dev/dicom/pages/synthetic-data.js's
  // getMultipleSingleFrameLink. Each per-file Image has a single slice
  // (no NumberOfFrames, no frames3D), so unlike the two cases above the
  // files are combined with a plain Image#appendSlice loop, exactly as
  // for the "3D creation" case; but since the files share one origin
  // and each carries its own tag-derived time, appendSlice grows a
  // time dimension instead of stacking along z.
  describe('multiple single-frame creation from generateDataElements',
    () => {
      const config = syntheticData[0];
      const tags = config.tags;
      const numberOfFrames = 3;

      let image;
      let fileElementsList;

      beforeAll(() => {
        const tagsCopy = structuredClone(config.tags);
        tagsCopy.TransferSyntaxUID = '1.2.840.10008.1.2.1';
        const genOptions = {
          pixelGeneratorName: 'string',
          numberOfFrames
        };
        fileElementsList = generateDataElements(tagsCopy, genOptions);

        const factory = new ImageFactory();
        for (const elements of fileElementsList) {
          const pixelBuffer = elements['7FE00010'].value;
          const fileImage = factory.create(
            elements, pixelBuffer, numberOfFrames);
          if (typeof image === 'undefined') {
            image = fileImage;
          } else {
            image.appendSlice(fileImage);
          }
        }
      });

      test('generates one single-frame file per temporal position', () => {
        assert.equal(
          fileElementsList.length, numberOfFrames,
          'one file per temporal position'
        );
      });

      test('geometry keeps a single spatial slice, gains a time dimension',
        () => {
          const size = image.getGeometry().getSize();
          assert.equal(size.length(), 4, 'geometry gains a time dimension');
          assert.equal(size.get(2), 1, 'single spatial slice');
          assert.equal(
            size.get(3), numberOfFrames, 'time size matches file count');
        }
      );

      test('all files share the same spatial origin', () => {
        const origins = image.getGeometry().getOrigins();
        assert.equal(origins.length, 1, 'single shared origin');
        assert.deepEqual(
          origins[0].getValues(), [0, 0, 0], 'origin at (0,0,0)');
      });

      test('meta numberOfFiles matches the number of combined files', () => {
        assert.equal(
          image.getMeta().numberOfFiles, numberOfFrames, 'numberOfFiles');
      });

      test('pixel buffer holds every file with distinct content', () => {
        const sliceSize = tags.Rows * tags.Columns;
        const fullBuffer = image.getBuffer();
        assert.equal(
          fullBuffer.length, sliceSize * numberOfFrames,
          'buffer holds every file'
        );

        const frames = [];
        for (let f = 0; f < numberOfFrames; ++f) {
          const fileBuffer = fileElementsList[f]['7FE00010'].value;
          const start = f * sliceSize;
          const end = start + sliceSize;
          const frame = Array.from(fullBuffer.slice(start, end));
          assert.deepEqual(
            frame, Array.from(fileBuffer),
            `file ${f} pixel data is preserved`
          );
          frames.push(frame);
        }
        // sanity check the generated data actually varies per file,
        // otherwise the preservation check above would be vacuous
        assert.notDeepEqual(
          frames[0], frames[1], 'file 0 and file 1 content differ'
        );
      });

      test('SOPInstanceUID is included as an image UID', () => {
        // note: getMultipleSingleFrameLink's files only vary by
        // TemporalPositionIdentifier, not SOPInstanceUID, so all files
        // share the same uid here
        assert.ok(
          image.includesImageUid(tags.SOPInstanceUID),
          'SOPInstanceUID is in image UIDs'
        );
      });

    }
  );

});
