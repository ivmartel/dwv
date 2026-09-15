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

});
