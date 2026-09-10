import {describe, beforeAll, test, assert} from 'vitest';
import {ImageFactory} from '../../src/image/imageFactory.js';
import {Geometry} from '../../src/image/geometry.js';
import {Size} from '../../src/image/size.js';
import {Spacing} from '../../src/image/spacing.js';
import {Point3D} from '../../src/math/point.js';
import {generateDicomElements} from '../../dev/dicom/dicomGenerator.js';

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
      const genOptions = {pixelGeneratorName: 'gradSquare'};
      const elements = generateDicomElements(tagsCopy, genOptions);
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

});
