// @vitest-environment node
import {describe, test, assert, vi, beforeEach} from 'vitest';
import {
  BrushMaskPaint,
  BrushMode,
  getBrushMaskMeta
} from '../../../src/tools/behaviors/brushMaskPaint.js';
import {
  getElementsFromSimpleTagValues
} from '../../../src/dicom/simpleTagValues.js';
import {Image} from '../../../src/image/image.js';
import {Geometry} from '../../../src/image/geometry.js';
import {Size} from '../../../src/image/size.js';
import {Spacing} from '../../../src/image/spacing.js';
import {Point3D} from '../../../src/math/point.js';

describe('BrushMaskPaint', () => {
  /** @type {BrushMaskPaint} */
  let paint;

  beforeEach(() => {
    paint = new BrushMaskPaint({app: {}});
  });

  test('defaults: brush size 10, mode del, no segment', () => {
    assert.equal(paint.getBrushSize(), 10);
    assert.equal(paint.getBrushMode(), BrushMode.Del);
    assert.equal(typeof paint.getSelectedSegmentNumber(), 'undefined');
  });

  test('setFeatures clamps brush size to range', () => {
    paint.setFeatures({
      brushSizeRange: {min: 2, max: 10},
      brushSize: 100
    });
    assert.equal(paint.getBrushSize(), 9);
    paint.setFeatures({brushSize: 1});
    assert.equal(paint.getBrushSize(), 2);
  });

  test('brushSizeAdd dispatches brushsizechange when size changes', () => {
    const spy = vi.fn();
    paint.addEventListener('brushsizechange', spy);
    paint.setFeatures({brushSizeRange: {min: 1, max: 20}, brushSize: 5});
    paint.setFeatures({brushSizeAdd: 1});
    assert.equal(spy.mock.calls.length, 1);
    assert.equal(spy.mock.calls[0][0].detail.value, 6);
  });

  test('brushSizeAdd does not dispatch when clamped unchanged', () => {
    const spy = vi.fn();
    paint.addEventListener('brushsizechange', spy);
    paint.setFeatures({brushSizeRange: {min: 1, max: 20}, brushSize: 19});
    spy.mockClear();
    paint.setFeatures({brushSizeAdd: 1});
    assert.equal(spy.mock.calls.length, 0);
  });

  test('setBrushMode delegates to setFeatures', () => {
    paint.setBrushMode(BrushMode.Add);
    assert.equal(paint.getBrushMode(), BrushMode.Add);
  });

  test('setFeatures updates selected segment number', () => {
    paint.setFeatures({selectedSegmentNumber: 3});
    assert.equal(paint.getSelectedSegmentNumber(), 3);
    paint.setFeatures({selectedSegmentNumber: 2});
    assert.equal(paint.getSelectedSegmentNumber(), 2);
  });
});

describe('getBrushMaskMeta', () => {
  /**
   * Get a 3 slices source image.
   *
   * @returns {Image} The image.
   */
  function getSourceImage() {
    const geometry = new Geometry(
      [
        new Point3D(0, 0, 0),
        new Point3D(0, 0, 1),
        new Point3D(0, 0, 2)
      ],
      new Size([2, 2, 3]),
      new Spacing([1, 1, 1])
    );
    const image = new Image(
      geometry, new Uint8Array(12), ['1.2.4.0', '1.2.4.1', '1.2.4.2']);
    image.setMeta({
      SOPClassUID: '1.2.840.10008.5.1.4.1.1.4',
      PatientName: 'dwv^Patient',
      PatientID: '123',
      StudyInstanceUID: '1.2',
      StudyDate: '20260101',
      StudyTime: '120000',
      StudyID: '7',
      SeriesInstanceUID: '1.2.3',
      FrameOfReferenceUID: '1.2.5'
    });
    return image;
  }

  test('copies the patient and study tags from the source', () => {
    const meta = getBrushMaskMeta(getSourceImage(), 1);
    assert.equal(meta.PatientName, 'dwv^Patient', 'PatientName');
    assert.equal(meta.PatientID, '123', 'PatientID');
    assert.equal(meta.StudyInstanceUID, '1.2', 'StudyInstanceUID');
    assert.equal(meta.StudyDate, '20260101', 'StudyDate');
    assert.equal(meta.StudyTime, '120000', 'StudyTime');
    assert.equal(meta.StudyID, '7', 'StudyID');
    assert.equal(meta.FrameOfReferenceUID, '1.2.5', 'FrameOfReferenceUID');

    // type 2 tags absent from the source are present, empty
    const elements = getElementsFromSimpleTagValues(meta);
    for (const key of ['00100030', '00100040', '00080090', '00080050']) {
      assert.ok(typeof elements[key] !== 'undefined', `${key} is present`);
    }
  });

  test('has its own series and references the source', () => {
    const meta = getBrushMaskMeta(getSourceImage(), 1);
    assert.notEqual(meta.SeriesInstanceUID, '1.2.3', 'new series');
    assert.equal(
      meta.custom.referencedSeriesUID, '1.2.3', 'referenced series');
    const refSeries = meta.ReferencedSeriesSequence.value[0];
    assert.equal(refSeries.SeriesInstanceUID, '1.2.3', 'ref series uid');
    const refInstance = refSeries.ReferencedInstanceSequence.value[0];
    assert.equal(
      refInstance.ReferencedSOPInstanceUID, '1.2.4.1', 'ref instance uid');
    assert.equal(
      refInstance.ReferencedSOPClassUID,
      '1.2.840.10008.5.1.4.1.1.4',
      'ref class uid'
    );
  });
});
