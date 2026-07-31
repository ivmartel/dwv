import {describe, test, assert} from 'vitest';
import {
  getElementsFromSimpleTagValues
} from '../../src/dicom/simpleTagValues.js';
import {ImageFactory} from '../../src/image/imageFactory.js';
import {Geometry} from '../../src/image/geometry.js';
import {Size} from '../../src/image/size.js';
import {Spacing} from '../../src/image/spacing.js';
import {Point3D} from '../../src/math/point.js';

import syntheticData from '/tests/data/synthetic-data.json';

/**
 * Tests for the 'image/imageFactory.js' file.
 */

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Parse a synthetic-data config tags into DICOM data elements.
 *
 * @param {object} config A synthetic-data entry.
 * @returns {Record<string, object>} DICOM data elements.
 */
function configToElements(config) {
  return getElementsFromSimpleTagValues(structuredClone(config.tags));
}

/**
 * Build a flat Uint16Array pixel buffer for the given config.
 *
 * @param {object} config A synthetic-data entry.
 * @returns {Uint16Array} Flat pixel buffer (rows × cols).
 */
function buildPixelBuffer(config) {
  const tags = config.tags;
  const size = tags.Columns * tags.Rows;
  const buffer = new Uint16Array(size);
  for (let i = 0; i < size; ++i) {
    buffer[i] = i % 256;
  }
  return buffer;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ImageFactory', () => {

  // -------------------------------------------------------------------------
  // Simple MR test — test-00
  // 32×32, MONOCHROME2, PixelSpacing=[1,1], no rescale, no window presets
  // -------------------------------------------------------------------------

  test('checkElements: valid test-00 returns no warning', () => {
    const config = syntheticData.find(c => c.name === 'test-00');
    const elements = configToElements(config);
    // add minimal pixel data element so checkElements passes
    elements['7FE00010'] = {value: buildPixelBuffer(config)};

    const factory = new ImageFactory();
    const warning = factory.checkElements(elements);

    assert.equal(warning, undefined, 'no warning for valid MR data');
  });

  test('create: geometry matches test-00 tags', () => {
    const config = syntheticData.find(c => c.name === 'test-00');
    const tags = config.tags;
    const elements = configToElements(config);
    const buffer = buildPixelBuffer(config);

    const factory = new ImageFactory();
    const image = factory.create(elements, buffer, 1);

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

  test('create: meta tags match test-00 tags', () => {
    const config = syntheticData.find(c => c.name === 'test-00');
    const tags = config.tags;
    const elements = configToElements(config);
    const buffer = buildPixelBuffer(config);

    const factory = new ImageFactory();
    const image = factory.create(elements, buffer, 1);

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
      meta.PixelRepresentation, tags.PixelRepresentation, 'PixelRepresentation'
    );
    assert.equal(meta.StudyInstanceUID, tags.StudyInstanceUID,
      'StudyInstanceUID');
    assert.equal(meta.SeriesInstanceUID, tags.SeriesInstanceUID,
      'SeriesInstanceUID');
    assert.equal(meta.PatientID, tags.PatientID, 'PatientID');
    assert.equal(meta.numberOfFiles, 1, 'numberOfFiles');
  });

  test('create: length unit is mm when PixelSpacing is present', () => {
    const config = syntheticData.find(c => c.name === 'test-00');
    const elements = configToElements(config);
    const buffer = buildPixelBuffer(config);

    const factory = new ImageFactory();
    const image = factory.create(elements, buffer, 1);

    assert.equal(image.getMeta().lengthUnit, 'unit.mm', 'length unit is mm');
  });

  test('create: default RSI (slope=1, intercept=0) when no rescale tags',
    () => {
      const config = syntheticData.find(c => c.name === 'test-00');
      const elements = configToElements(config);
      const buffer = buildPixelBuffer(config);

      const factory = new ImageFactory();
      const image = factory.create(elements, buffer, 1);

      const rsi = image.getRescaleSlopeAndIntercept();
      assert.equal(rsi.getSlope(), 1, 'default slope is 1');
      assert.equal(rsi.getIntercept(), 0, 'default intercept is 0');
    }
  );

  test('create: no window presets when no window tags in test-00', () => {
    const config = syntheticData.find(c => c.name === 'test-00');
    const elements = configToElements(config);
    const buffer = buildPixelBuffer(config);

    const factory = new ImageFactory();
    const image = factory.create(elements, buffer, 1);

    assert.equal(
      image.getMeta().windowPresets, undefined, 'no window presets'
    );
  });

  test('create: pixel buffer values are preserved', () => {
    const config = syntheticData.find(c => c.name === 'test-00');
    const elements = configToElements(config);
    const buffer = buildPixelBuffer(config);

    const factory = new ImageFactory();
    const image = factory.create(elements, buffer, 1);

    const imageBuffer = image.getBuffer();
    assert.equal(imageBuffer[0], buffer[0], 'first pixel matches');
    assert.equal(
      imageBuffer[buffer.length - 1],
      buffer[buffer.length - 1],
      'last pixel matches'
    );
  });

  test('create: SOPInstanceUID used as frame UID', () => {
    const config = syntheticData.find(c => c.name === 'test-00');
    const tags = config.tags;
    const elements = configToElements(config);
    const buffer = buildPixelBuffer(config);

    const factory = new ImageFactory();
    const image = factory.create(elements, buffer, 1);

    assert.ok(
      image.includesImageUid(tags.SOPInstanceUID),
      'SOPInstanceUID is in image UIDs'
    );
  });

});
