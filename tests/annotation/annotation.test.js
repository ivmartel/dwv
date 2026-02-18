import {describe, test, assert, vi, expect} from 'vitest';
import {DicomParser} from '../../src/dicom/dicomParser.js';
import {b64urlToArrayBuffer} from '../dicom/utils.js';
import {
  AnnotationGroupFactory
} from '../../src/image/annotationGroupFactory.js';
import {Circle} from '../../src/math/circle.js';
import {Ellipse} from '../../src/math/ellipse.js';
import {Line} from '../../src/math/line.js';
import {Point2D} from '../../src/math/point.js';
import {Protractor} from '../../src/math/protractor.js';
import {Rectangle} from '../../src/math/rectangle.js';
import {ROI} from '../../src/math/roi.js';
import {BidimensionalLine} from '../../src/math/bidimensionalLine.js';
import {
  getScoordFromShape,
  getShapeFromScoord
} from '../../src/dicom/dicomSpatialCoordinate.js';

// doc imports
/* eslint-disable no-unused-vars */
import {AnnotationGroup} from '../../src/image/annotationGroup.js';
/* eslint-enable no-unused-vars */

import dwv034Arrow from './dwv034/sr-arrow.dcm?inline';
import dwv034Circle from './dwv034/sr-circle.dcm?inline';
import dwv034Ellipse from './dwv034/sr-ellipse.dcm?inline';
import dwv034Protractor from './dwv034/sr-protractor.dcm?inline';
import dwv034Rectangle from './dwv034/sr-rectangle.dcm?inline';
import dwv034Roi from './dwv034/sr-roi.dcm?inline';
import dwv034Ruler from './dwv034/sr-ruler.dcm?inline';

import tid1500v0Arrow from './tid1500-0/sr-arrow.dcm?inline';
import tid1500v0Circle from './tid1500-0/sr-circle.dcm?inline';
import tid1500v0Ellipse from './tid1500-0/sr-ellipse.dcm?inline';
import tid1500v0Protractor from './tid1500-0/sr-protractor.dcm?inline';
import tid1500v0Rectangle from './tid1500-0/sr-rectangle.dcm?inline';
import tid1500v0Roi from './tid1500-0/sr-roi.dcm?inline';
import tid1500v0Ruler from './tid1500-0/sr-ruler.dcm?inline';
import tid1500v0Bidimensional from './tid1500-0/sr-bidimensional.dcm?inline';

/**
 * Tests for the annotation I/O.
 */
/** @module tests/annotation */

describe('annotation', () => {
  /**
   * Get an annotation group from a buffer string.
   *
   * @param {string} bufferStr The buffer string.
   * @returns {AnnotationGroup} The annotation group.
   */
  function getAnnotationGroup(bufferStr) {
    const dicomParser = new DicomParser();
    dicomParser.parse(b64urlToArrayBuffer(bufferStr));
    const tags = dicomParser.getDicomElements();
    const fac = new AnnotationGroupFactory();
    let group;
    if (typeof fac.checkElements(tags) === 'undefined') {
      group = fac.create(tags);
    }
    return group;
  }

  /**
   * Get a dwv v0.34 annotation group from a buffer string.
   *
   * @param {string} bufferStr The buffer string.
   * @returns {AnnotationGroup} The annotation group.
   */
  function get034AnnotationGroup(bufferStr) {
    // console warn spy
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    // run test
    const res = getAnnotationGroup(bufferStr);
    // expect warn call
    expect(consoleSpy).toHaveBeenCalledWith('DWV v0.34 annotation');
    // reset spy
    consoleSpy.mockReset();

    return res;
  }

  /**
   * Check common properties of an annotation group.
   *
   * @param {AnnotationGroup} annotationGroup The group to check.
   * @param {string} prefix A message prefix.
   */
  function checkGroupCommonProperties(annotationGroup, prefix) {
    const annotations = annotationGroup.getList();

    const colours = ['#ffff80', '#ffa348', '#ed333b'];

    assert.ok(annotationGroup.getLength() === 3,
      prefix + ' annotationGroup length');
    assert.ok(annotations.length === 3,
      prefix + ' annotations length');

    for (let i = 0; i < annotations.length; ++i) {
      const annotation = annotations[i];
      assert.ok(typeof annotation.trackingId !== 'undefined',
        prefix + ' annotation ' + i + ' trackingId');
      assert.ok(typeof annotation.trackingUid !== 'undefined',
        prefix + ' annotation ' + i + ' trackingUid');
      assert.ok(typeof annotation.referencedSopClassUID !== 'undefined',
        prefix + ' annotation ' + i + ' referencedSopClassUID');
      assert.ok(typeof annotation.referencedSopInstanceUID !== 'undefined',
        prefix + ' annotation ' + i + ' referencedSopInstanceUID');

      assert.ok(typeof annotation.colour !== 'undefined',
        prefix + ' annotation ' + i + ' colour');
      assert.equal(annotation.colour, colours[i],
        prefix + ' annotation ' + i + ' good colour');

      assert.ok(typeof annotation.textExpr !== 'undefined',
        prefix + ' annotation ' + i + ' textExpr');
      if (i === 2) {
        assert.ok(typeof annotation.labelPosition !== 'undefined',
          prefix + ' annotation ' + i + ' labelPosition');
      }
    }
  }

  /**
   * Check a quantification.
   *
   * @param {object} quantification The quantification to check.
   * @param {string} prefix A message prefix.
   */
  function checkQuantification(quantification, prefix) {
    assert.ok(typeof quantification.min !== 'undefined',
      prefix + ' quantification.min');
    assert.ok(typeof quantification.max !== 'undefined',
      prefix + ' quantification.max');
    assert.ok(typeof quantification.mean !== 'undefined',
      prefix + ' quantification.mean');
    assert.ok(typeof quantification.surface !== 'undefined',
      prefix + ' quantification.surface');
  }

  /**
   * Check an arrow annotation group.
   *
   * @param {AnnotationGroup} annotationGroup The group to check.
   */
  function checkArrowGroup(annotationGroup) {
    const annotations = annotationGroup.getList();
    for (let i = 0; i < annotations.length; ++i) {
      const annotation = annotations[i];
      const prefix = 'arrow annotation ' + i;
      assert.ok(annotation.mathShape instanceof Point2D,
        prefix + ' mathShape');
      assert.ok(typeof annotation.quantification === 'undefined',
        prefix + ' quantification');
      if (i !== 0) {
        assert.equal(annotation.textExpr, 'label',
          prefix + ' annotation ' + i + ' good textExpr');
      }
    }
  }

  /**
   * Check a circle annotation group.
   *
   * @param {AnnotationGroup} annotationGroup The group to check.
   */
  function checkCircleGroup(annotationGroup) {
    const annotations = annotationGroup.getList();
    for (let i = 0; i < annotations.length; ++i) {
      const annotation = annotations[i];
      const prefix = 'circle annotation ' + i;
      assert.ok(annotation.mathShape instanceof Circle,
        prefix + ' mathShape');
      assert.equal(annotation.textExpr, '{surface}',
        prefix + ' annotation ' + i + ' good textExpr');

      assert.ok(typeof annotation.quantification.radius !== 'undefined',
        prefix + ' quantification.radius');
      const radius = Math.round(
        parseFloat(annotation.quantification.radius.value));
      assert.equal(radius, 2, prefix + ' radius is ~2');
      assert.equal(annotation.quantification.radius.unit, 'unit.mm',
        prefix + ' radius unit');
      checkQuantification(annotation.quantification, assert, prefix);
    }
  }

  /**
   * Check an ellipse annotation group.
   *
   * @param {AnnotationGroup} annotationGroup The group to check.
   */
  function checkEllipseGroup(annotationGroup) {
    const annotations = annotationGroup.getList();
    for (let i = 0; i < annotations.length; ++i) {
      const annotation = annotations[i];
      const prefix = 'ellipse annotation ' + i;
      assert.ok(annotation.mathShape instanceof Ellipse,
        prefix + ' mathShape');
      assert.equal(annotation.textExpr, '{surface}',
        prefix + ' annotation ' + i + ' good textExpr');

      assert.ok(typeof annotation.quantification.a !== 'undefined',
        prefix + ' quantification.a');
      assert.ok(typeof annotation.quantification.b !== 'undefined',
        prefix + ' quantification.b');
      const radiusA = Math.round(parseFloat(annotation.quantification.a.value));
      assert.equal(radiusA, 3, prefix + ' radiusA is ~3');
      assert.equal(annotation.quantification.a.unit, 'unit.mm',
        prefix + ' radiusA unit');
      const radiusB = Math.round(parseFloat(annotation.quantification.b.value));
      assert.equal(radiusB, 2, prefix + ' radiusB is ~2');
      assert.equal(annotation.quantification.b.unit, 'unit.mm',
        prefix + ' radiusB unit');
      checkQuantification(annotation.quantification, assert, prefix);
    }
  }

  /**
   * Check a protractor annotation group.
   *
   * @param {AnnotationGroup} annotationGroup The group to check.
   */
  function checkProtractorGroup(annotationGroup) {
    const annotations = annotationGroup.getList();
    for (let i = 0; i < annotations.length; ++i) {
      const annotation = annotations[i];
      const prefix = 'protractor annotation ' + i;
      assert.ok(annotation.mathShape instanceof Protractor,
        prefix + ' mathShape');
      assert.equal(annotation.textExpr, '{angle}',
        prefix + ' annotation ' + i + ' good textExpr');

      assert.ok(typeof annotation.quantification.angle !== 'undefined',
        prefix + ' quantification.angle');
      const angle = Math.round(parseFloat(
        annotation.quantification.angle.value));
      assert.equal(angle, 90, prefix + ' angle is ~90');
      assert.equal(annotation.quantification.angle.unit, 'unit.degree',
        prefix + ' angle unit');
    }
  }

  /**
   * Check a rectangle annotation group.
   *
   * @param {AnnotationGroup} annotationGroup The group to check.
   */
  function checkRectangleGroup(annotationGroup) {
    const annotations = annotationGroup.getList();
    for (let i = 0; i < annotations.length; ++i) {
      const annotation = annotations[i];
      const prefix = 'rectangle annotation ' + i;
      assert.ok(annotation.mathShape instanceof Rectangle,
        prefix + ' mathShape');
      assert.equal(annotation.textExpr, '{surface}',
        prefix + ' annotation ' + i + ' good textExpr');

      assert.ok(typeof annotation.quantification.width !== 'undefined',
        prefix + ' quantification.width');
      assert.ok(typeof annotation.quantification.height !== 'undefined',
        prefix + ' quantification.height');
      const width = Math.round(parseFloat(
        annotation.quantification.width.value));
      assert.equal(width, 6, prefix + ' width is ~6');
      assert.equal(annotation.quantification.width.unit, 'unit.mm',
        prefix + ' width unit');
      const height = Math.round(parseFloat(
        annotation.quantification.height.value));
      assert.equal(height, 4, prefix + ' height is ~4');
      assert.equal(annotation.quantification.height.unit, 'unit.mm',
        prefix + ' height unit');
      checkQuantification(annotation.quantification, assert, prefix);
    }
  }

  /**
   * Check a roi annotation group.
   *
   * @param {AnnotationGroup} annotationGroup The group to check.
   */
  function checkRoiGroup(annotationGroup) {
    const annotations = annotationGroup.getList();
    for (let i = 0; i < annotations.length; ++i) {
      const annotation = annotations[i];
      const prefix = 'roi annotation ' + i;
      assert.ok(annotation.mathShape instanceof ROI,
        prefix + ' mathShape');
      if (i !== 0) {
        assert.equal(annotation.textExpr, 'label',
          prefix + ' annotation ' + i + ' good textExpr');
      }

      assert.ok(typeof annotation.quantification === 'undefined',
        prefix + ' quantification');
    }
  }

  /**
   * Check a ruler annotation group.
   *
   * @param {AnnotationGroup} annotationGroup The group to check.
   */
  function checkRulerGroup(annotationGroup) {
    const annotations = annotationGroup.getList();
    for (let i = 0; i < annotations.length; ++i) {
      const annotation = annotations[i];
      const prefix = 'ruler annotation ' + i;
      assert.ok(annotation.mathShape instanceof Line,
        prefix + ' mathShape');
      assert.equal(annotation.textExpr, '{length}',
        prefix + ' annotation ' + i + ' good textExpr');

      assert.ok(typeof annotation.quantification.length !== 'undefined',
        prefix + ' quantification.length');
      const length = Math.round(
        parseInt(annotation.quantification.length.value, 10));
      assert.equal(length, 4, prefix + ' length is ~4');
      assert.equal(annotation.quantification.length.unit, 'unit.mm',
        prefix + ' length unit');
    }
  }

  /**
   * Check a bidimensional annotation group.
   *
   * @param {AnnotationGroup} annotationGroup The group to check.
   */
  function checkBidimensionalGroup(annotationGroup) {
    const annotations = annotationGroup.getList();
    for (let i = 0; i < annotations.length; ++i) {
      const annotation = annotations[i];
      const prefix = 'bidimensional annotation ' + i;
      assert.ok(annotation.mathShape instanceof BidimensionalLine,
        prefix + ' mathShape');
      assert.ok(
        annotation.textExpr === '{longAxis} x {shortAxis}' ||
        annotation.textExpr === '{longAxis}',
        prefix + ' annotation ' + i + ' good textExpr (' +
        annotation.textExpr + ')'
      );
      assert.ok(typeof annotation.quantification.longAxis !== 'undefined',
        prefix + ' quantification.longAxis');
      assert.ok(typeof annotation.quantification.shortAxis !== 'undefined',
        prefix + ' quantification.shortAxis');
    }
  }

  //----------------------------------------------------
  // dwv 0.34
  //----------------------------------------------------

  /**
   * Tests for {@link Annotation} from dwv034 containing an arrow.
   *
   * @function module:tests/annotation~read-dwv034-arrow
   */
  test('Read dwv034 arrow', () => {
    const annotationGroup = get034AnnotationGroup(dwv034Arrow);
    checkGroupCommonProperties(annotationGroup, 'arrow');
    checkArrowGroup(annotationGroup);
  });

  /**
   * Tests for {@link Annotation} from dwv034 containing a circle.
   *
   * @function module:tests/annotation~read-dwv034-circle
   */
  test('Read dwv034 circle', () => {
    const annotationGroup = get034AnnotationGroup(dwv034Circle);
    checkGroupCommonProperties(annotationGroup, 'circle');
    checkCircleGroup(annotationGroup);
  });

  /**
   * Tests for {@link Annotation} from dwv034 containing a ellipse.
   *
   * @function module:tests/annotation~read-dwv034-ellipse
   */
  test('Read dwv034 ellipse', () => {
    const annotationGroup = get034AnnotationGroup(dwv034Ellipse);
    checkGroupCommonProperties(annotationGroup, 'ellipse');
    checkEllipseGroup(annotationGroup);
  });

  /**
   * Tests for {@link Annotation} from dwv034 containing a protractor.
   *
   * @function module:tests/annotation~read-dwv034-protractor
   */
  test('Read dwv034 protractor', () => {
    const annotationGroup = get034AnnotationGroup(dwv034Protractor);
    checkGroupCommonProperties(annotationGroup, 'protractor');
    checkProtractorGroup(annotationGroup);
  });

  /**
   * Tests for {@link Annotation} from dwv034 containing a rectangle.
   *
   * @function module:tests/annotation~read-dwv034-rectangle
   */
  test('Read dwv034 rectangle', () => {
    const annotationGroup = get034AnnotationGroup(dwv034Rectangle);
    checkGroupCommonProperties(annotationGroup, 'rectangle');
    checkRectangleGroup(annotationGroup);
  });

  /**
   * Tests for {@link Annotation} from dwv034 containing a ROI.
   *
   * @function module:tests/annotation~read-dwv034-roi
   */
  test('Read dwv034 roi', () => {
    const annotationGroup = get034AnnotationGroup(dwv034Roi);
    checkGroupCommonProperties(annotationGroup, 'roi');
    checkRoiGroup(annotationGroup);
  });

  /**
   * Tests for {@link Annotation} from dwv034 containing a ruler.
   *
   * @function module:tests/annotation~read-dwv034-ruler
   */
  test('Read dwv034 ruler', () => {
    const annotationGroup = get034AnnotationGroup(dwv034Ruler);
    checkGroupCommonProperties(annotationGroup, 'ruler');
    checkRulerGroup(annotationGroup);
  });

  //----------------------------------------------------
  // TID 1500 v0
  //----------------------------------------------------

  /**
   * Tests for {@link Annotation} from tid1500 v0 containing an arrow.
   *
   * @function module:tests/annotation~read-tid1500-v0-arrow
   */
  test('Read tid1500 v0 arrow', () => {
    const annotationGroup = getAnnotationGroup(tid1500v0Arrow);
    checkGroupCommonProperties(annotationGroup, 'arrow');
    checkArrowGroup(annotationGroup);
  });

  /**
   * Tests for {@link Annotation} from tid1500 v0 containing a circle.
   *
   * @function module:tests/annotation~read-tid1500-v0-circle
   */
  test('Read tid1500 v0 circle', () => {
    const annotationGroup = getAnnotationGroup(tid1500v0Circle);
    checkGroupCommonProperties(annotationGroup, 'circle');
    checkCircleGroup(annotationGroup);
  });

  /**
   * Tests for {@link Annotation} from tid1500 v0 containing an ellipse.
   *
   * @function module:tests/annotation~read-tid1500-v0-ellipse
   */
  test('Read tid1500 v0 ellipse', () => {
    const annotationGroup = getAnnotationGroup(tid1500v0Ellipse);
    checkGroupCommonProperties(annotationGroup, 'ellipse');
    checkEllipseGroup(annotationGroup);
  });

  /**
   * Tests for {@link Annotation} from tid1500 v0 containing a protractor.
   *
   * @function module:tests/annotation~read-tid1500-v0-protractor
   */
  test('Read tid1500 v0 protractor', () => {
    const annotationGroup = getAnnotationGroup(tid1500v0Protractor);
    checkGroupCommonProperties(annotationGroup, 'protractor');
    checkProtractorGroup(annotationGroup);
  });

  /**
   * Tests for {@link Annotation} from tid1500 v0 containing a rectangle.
   *
   * @function module:tests/annotation~read-tid1500-v0-rectangle
   */
  test('Read tid1500 v0 rectangle', () => {
    const annotationGroup = getAnnotationGroup(tid1500v0Rectangle);
    checkGroupCommonProperties(annotationGroup, 'rectangle');
    checkRectangleGroup(annotationGroup);
  });

  /**
   * Tests for {@link Annotation} from tid1500 v0 containing a roi.
   *
   * @function module:tests/annotation~read-tid1500-v0-roi
   */
  test('Read tid1500 v0 roi', () => {
    const annotationGroup = getAnnotationGroup(tid1500v0Roi);
    checkGroupCommonProperties(annotationGroup, 'roi');
    checkRoiGroup(annotationGroup);
  });

  /**
   * Tests for {@link Annotation} from tid1500 v0 containing a ruler.
   *
   * @function module:tests/annotation~read-tid1500-v0-ruler
   */
  test('Read tid1500 v0 ruler', () => {
    const annotationGroup = getAnnotationGroup(tid1500v0Ruler);
    checkGroupCommonProperties(annotationGroup, 'ruler');
    checkRulerGroup(annotationGroup);
  });

  /**
   * Test BidimensionalLine DICOM SR import/export roundtrip.
   */
  test('BidimensionalLine DICOM SR import/export roundtrip', () => {
    // Create a BidimensionalLine with all properties
    const p1 = new Point2D(10, 20);
    const p2 = new Point2D(30, 40);
    const b = new BidimensionalLine(p1, p2);
    b.shortAxisLength = 12;
    b.shortAxisT = 0.6;
    b.shortAxisL1 = 7;
    b.shortAxisL2 = 5;
    // Set shortAxisCenter for export
    b.shortAxisCenter = new Point2D(22, 32);

    // Export to DICOM SR (SCOORD)
    const scoord = getScoordFromShape(b);
    // Import back to BidimensionalLine
    const b2 = getShapeFromScoord(scoord);

    // Check type and main axis
    assert.ok(
      b2 instanceof BidimensionalLine,
      'Imported shape is BidimensionalLine'
    );
    assert.equal(b2.getBegin().getX(), b.getBegin().getX(), 'Begin X matches');
    assert.equal(b2.getBegin().getY(), b.getBegin().getY(), 'Begin Y matches');
    assert.equal(b2.getEnd().getX(), b.getEnd().getX(), 'End X matches');
    assert.equal(b2.getEnd().getY(), b.getEnd().getY(), 'End Y matches');

    // Check short axis properties
    assert.closeTo(
      b2.shortAxisLength,
      b.shortAxisLength,
      1e-6,
      'shortAxisLength matches'
    );
    // L1 and L2 may be swapped or recalculated, but their sum should match
    assert.closeTo(
      b2.shortAxisL1 + b2.shortAxisL2,
      b.shortAxisLength,
      1e-6,
      'shortAxisL1 + shortAxisL2 matches shortAxisLength'
    );
    assert.ok(
      b2.shortAxisL1 > 0 && b2.shortAxisL2 > 0,
      'shortAxisL1 and L2 positive'
    );
    assert.closeTo(b2.shortAxisT, b.shortAxisT, 1e-2, 'shortAxisT matches');
    // Center is recalculated, but should be close
    assert.closeTo(
      b2.shortAxisCenter.getX(),
      b.shortAxisCenter.getX(),
      1,
      'shortAxisCenter X close'
    );
    assert.closeTo(
      b2.shortAxisCenter.getY(),
      b.shortAxisCenter.getY(),
      1,
      'shortAxisCenter Y close'
    );
  });

  /**
   * Tests for {@link Annotation} from tid1500 v0 containing a
   * BidimensionalLine.
   *
   * @function module:tests/annotation~read-tid1500-v0-bidimensional
   */
  test('Read tid1500 v0 bidimensional', () => {
    const annotationGroup = getAnnotationGroup(tid1500v0Bidimensional);
    checkGroupCommonProperties(annotationGroup, 'bidimensional');
    checkBidimensionalGroup(annotationGroup);
  });

});
