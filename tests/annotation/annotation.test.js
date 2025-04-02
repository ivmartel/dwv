import {DicomParser} from '../../src/dicom/dicomParser';
import {b64urlToArrayBuffer} from '../dicom/utils';
import {AnnotationGroupFactory} from '../../src/image/annotationGroupFactory';
import {Circle} from '../../src/math/circle';
import {Ellipse} from '../../src/math/ellipse';
import {Line} from '../../src/math/line';
import {Point2D} from '../../src/math/point';
import {Protractor} from '../../src/math/protractor';
import {Rectangle} from '../../src/math/rectangle';
import {ROI} from '../../src/math/roi';

import dwv034Arrow from './dwv034/sr-arrow.dcm';
import dwv034Circle from './dwv034/sr-circle.dcm';
import dwv034Ellipse from './dwv034/sr-ellipse.dcm';
import dwv034Protractor from './dwv034/sr-protractor.dcm';
import dwv034Rectangle from './dwv034/sr-rectangle.dcm';
import dwv034Roi from './dwv034/sr-roi.dcm';
import dwv034Ruler from './dwv034/sr-ruler.dcm';

import tid1500v0Arrow from './tid1500-0/sr-arrow.dcm';
import tid1500v0Circle from './tid1500-0/sr-circle.dcm';
import tid1500v0Ellipse from './tid1500-0/sr-ellipse.dcm';
import tid1500v0Protractor from './tid1500-0/sr-protractor.dcm';
import tid1500v0Rectangle from './tid1500-0/sr-rectangle.dcm';
import tid1500v0Roi from './tid1500-0/sr-roi.dcm';
import tid1500v0Ruler from './tid1500-0/sr-ruler.dcm';

// doc imports
/* eslint-disable no-unused-vars */
import {AnnotationGroup} from '../../src/image/annotationGroup';
/* eslint-enable no-unused-vars */

/**
 * Tests for the annotation I/O.
 */
/** @module tests/annotation */

/* global QUnit */
QUnit.module('annotation');

/**
 *
 * @param {string} bufferStr
 * @returns {AnnotationGroup}
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
 * Check common properties of an annotation group.
 *
 * @param {AnnotationGroup} annotationGroup
 * @param {Function} assert The qunit assert.
 */
function checkGroupCommonProperties(annotationGroup, assert, prefix) {
  const annotations = annotationGroup.getList();

  assert.ok(annotationGroup.getLength() === 3,
    prefix + ' annotationGroup length');
  assert.ok(annotations.length === 3,
    prefix + ' annotations length');

  for (let i = 0; i < annotations.length; ++i) {
    const annotation = annotations[i];
    assert.ok(typeof annotation.id !== 'undefined',
      prefix + ' annotation ' + i + ' id');
    assert.ok(typeof annotation.uid !== 'undefined',
      prefix + ' annotation ' + i + ' uid');
    assert.ok(typeof annotation.referenceSopClassUID !== 'undefined',
      prefix + ' annotation ' + i + ' referenceSopClassUID');
    assert.ok(typeof annotation.referenceSopUID !== 'undefined',
      prefix + ' annotation ' + i + ' referenceSopUID');
  }
}

function checkQuantification(quantification, assert, prefix) {
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
 * @param {Function} assert The qunit assert.
 */
function checkArrowGroup(annotationGroup, assert) {
  const annotations = annotationGroup.getList();
  for (let i = 0; i < annotations.length; ++i) {
    const annotation = annotations[i];
    const prefix = 'arrow annotation ' + i;
    assert.ok(annotation.mathShape instanceof Point2D,
      prefix + ' mathShape');
    assert.ok(typeof annotation.quantification === 'undefined',
      prefix + ' quantification');
  }
}

/**
 * Check a circle annotation group.
 *
 * @param {AnnotationGroup} annotationGroup The group to check.
 * @param {Function} assert The qunit assert.
 */
function checkCircleGroup(annotationGroup, assert) {
  const annotations = annotationGroup.getList();
  for (let i = 0; i < annotations.length; ++i) {
    const annotation = annotations[i];
    const prefix = 'circle annotation ' + i;
    assert.ok(annotation.mathShape instanceof Circle,
      prefix + ' mathShape');
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
 * @param {Function} assert The qunit assert.
 */
function checkEllipseGroup(annotationGroup, assert) {
  const annotations = annotationGroup.getList();
  for (let i = 0; i < annotations.length; ++i) {
    const annotation = annotations[i];
    const prefix = 'ellipse annotation ' + i;
    assert.ok(annotation.mathShape instanceof Ellipse,
      prefix + ' mathShape');
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
 * @param {Function} assert The qunit assert.
 */
function checkProtractorGroup(annotationGroup, assert) {
  const annotations = annotationGroup.getList();
  for (let i = 0; i < annotations.length; ++i) {
    const annotation = annotations[i];
    const prefix = 'protractor annotation ' + i;
    assert.ok(annotation.mathShape instanceof Protractor,
      prefix + ' mathShape');
    assert.ok(typeof annotation.quantification.angle !== 'undefined',
      prefix + ' quantification.angle');
    const angle = Math.round(parseFloat(annotation.quantification.angle.value));
    assert.equal(angle, 90, prefix + ' angle is ~90');
    assert.equal(annotation.quantification.angle.unit, 'unit.degree',
      prefix + ' angle unit');
  }
}

/**
 * Check a rectangle annotation group.
 *
 * @param {AnnotationGroup} annotationGroup The group to check.
 * @param {Function} assert The qunit assert.
 */
function checkRectangleGroup(annotationGroup, assert) {
  const annotations = annotationGroup.getList();
  for (let i = 0; i < annotations.length; ++i) {
    const annotation = annotations[i];
    const prefix = 'rectangle annotation ' + i;
    assert.ok(annotation.mathShape instanceof Rectangle,
      prefix + ' mathShape');
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
 * @param {Function} assert The qunit assert.
 */
function checkRoiGroup(annotationGroup, assert) {
  const annotations = annotationGroup.getList();
  for (let i = 0; i < annotations.length; ++i) {
    const annotation = annotations[i];
    const prefix = 'roi annotation ' + i;
    assert.ok(annotation.mathShape instanceof ROI,
      prefix + ' mathShape');
    assert.ok(typeof annotation.quantification === 'undefined',
      prefix + ' quantification');
  }
}

/**
 * Check a ruler annotation group.
 *
 * @param {AnnotationGroup} annotationGroup The group to check.
 * @param {Function} assert The qunit assert.
 */
function checkRulerGroup(annotationGroup, assert) {
  const annotations = annotationGroup.getList();
  for (let i = 0; i < annotations.length; ++i) {
    const annotation = annotations[i];
    const prefix = 'ruler annotation ' + i;
    assert.ok(annotation.mathShape instanceof Line,
      prefix + ' mathShape');
    assert.ok(typeof annotation.quantification.length !== 'undefined',
      prefix + ' quantification.length');
    const length = Math.round(
      parseInt(annotation.quantification.length.value, 10));
    assert.equal(length, 4, prefix + ' length is ~4');
    assert.equal(annotation.quantification.length.unit, 'unit.mm',
      prefix + ' length unit');
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
QUnit.test('Read dwv034 annotation arrow', function (assert) {
  const annotationGroup = getAnnotationGroup(dwv034Arrow);
  checkGroupCommonProperties(annotationGroup, assert, 'arrow');
  checkArrowGroup(annotationGroup, assert);
});

/**
 * Tests for {@link Annotation} from dwv034 containing a circle.
 *
 * @function module:tests/annotation~read-dwv034-circle
 */
QUnit.test('Read dwv034 annotation circle', function (assert) {
  const annotationGroup = getAnnotationGroup(dwv034Circle);
  checkGroupCommonProperties(annotationGroup, assert, 'circle');
  checkCircleGroup(annotationGroup, assert);
});

/**
 * Tests for {@link Annotation} from dwv034 containing a ellipse.
 *
 * @function module:tests/annotation~read-dwv034-ellipse
 */
QUnit.test('Read dwv034 annotation ellipse', function (assert) {
  const annotationGroup = getAnnotationGroup(dwv034Ellipse);
  checkGroupCommonProperties(annotationGroup, assert, 'ellipse');
  checkEllipseGroup(annotationGroup, assert);
});

/**
 * Tests for {@link Annotation} from dwv034 containing a protractor.
 *
 * @function module:tests/annotation~read-dwv034-protractor
 */
QUnit.test('Read dwv034 annotation protractor', function (assert) {
  const annotationGroup = getAnnotationGroup(dwv034Protractor);
  checkGroupCommonProperties(annotationGroup, assert, 'protractor');
  checkProtractorGroup(annotationGroup, assert);
});

/**
 * Tests for {@link Annotation} from dwv034 containing a rectangle.
 *
 * @function module:tests/annotation~read-dwv034-rectangle
 */
QUnit.test('Read dwv034 annotation rectangle', function (assert) {
  const annotationGroup = getAnnotationGroup(dwv034Rectangle);
  checkGroupCommonProperties(annotationGroup, assert, 'rectangle');
  checkRectangleGroup(annotationGroup, assert);
});

/**
 * Tests for {@link Annotation} from dwv034 containing a ROI.
 *
 * @function module:tests/annotation~read-dwv034-roi
 */
QUnit.test('Read dwv034 annotation roi', function (assert) {
  const annotationGroup = getAnnotationGroup(dwv034Roi);
  checkGroupCommonProperties(annotationGroup, assert, 'roi');
  checkRoiGroup(annotationGroup, assert);
});

/**
 * Tests for {@link Annotation} from dwv034 containing a ruler.
 *
 * @function module:tests/annotation~read-dwv034-ruler
 */
QUnit.test('Read dwv034 annotation ruler', function (assert) {
  const annotationGroup = getAnnotationGroup(dwv034Ruler);
  checkGroupCommonProperties(annotationGroup, assert, 'ruler');
  checkRulerGroup(annotationGroup, assert);
});

//----------------------------------------------------
// TID 1500 v0
//----------------------------------------------------

/**
 * Tests for {@link Annotation} from tid1500 v0 containing an arrow.
 *
 * @function module:tests/annotation~read-tid1500v0-arrow
 */
QUnit.test('Read tid1500 v0 annotation arrow', function (assert) {
  const annotationGroup = getAnnotationGroup(tid1500v0Arrow);
  checkGroupCommonProperties(annotationGroup, assert, 'arrow');
  checkArrowGroup(annotationGroup, assert);
});

/**
 * Tests for {@link Annotation} from tid1500 v0 containing a circle.
 *
 * @function module:tests/annotation~read-tid1500v0-circle
 */
QUnit.test('Read tid1500 v0 annotation circle', function (assert) {
  const annotationGroup = getAnnotationGroup(tid1500v0Circle);
  checkGroupCommonProperties(annotationGroup, assert, 'circle');
  checkCircleGroup(annotationGroup, assert);
});

/**
 * Tests for {@link Annotation} from tid1500 v0 containing an ellipse.
 *
 * @function module:tests/annotation~read-tid1500v0-ellipse
 */
QUnit.test('Read tid1500 v0 annotation ellipse', function (assert) {
  const annotationGroup = getAnnotationGroup(tid1500v0Ellipse);
  checkGroupCommonProperties(annotationGroup, assert, 'ellipse');
  checkEllipseGroup(annotationGroup, assert);
});

/**
 * Tests for {@link Annotation} from tid1500 v0 containing a protractor.
 *
 * @function module:tests/annotation~read-tid1500v0-protractor
 */
QUnit.test('Read tid1500 v0 annotation protractor', function (assert) {
  const annotationGroup = getAnnotationGroup(tid1500v0Protractor);
  checkGroupCommonProperties(annotationGroup, assert, 'protractor');
  checkProtractorGroup(annotationGroup, assert);
});

/**
 * Tests for {@link Annotation} from tid1500 v0 containing a rectangle.
 *
 * @function module:tests/annotation~read-tid1500v0-rectangle
 */
QUnit.test('Read tid1500 v0 annotation rectangle', function (assert) {
  const annotationGroup = getAnnotationGroup(tid1500v0Rectangle);
  checkGroupCommonProperties(annotationGroup, assert, 'rectangle');
  checkRectangleGroup(annotationGroup, assert);
});

/**
 * Tests for {@link Annotation} from tid1500 v0 containing a roi.
 *
 * @function module:tests/annotation~read-tid1500v0-roi
 */
QUnit.test('Read tid1500 v0 annotation roi', function (assert) {
  const annotationGroup = getAnnotationGroup(tid1500v0Roi);
  checkGroupCommonProperties(annotationGroup, assert, 'roi');
  checkRoiGroup(annotationGroup, assert);
});

/**
 * Tests for {@link Annotation} from tid1500 v0 containing a ruler.
 *
 * @function module:tests/annotation~read-tid1500v0-ruler
 */
QUnit.test('Read tid1500 v0 annotation ruler', function (assert) {
  const annotationGroup = getAnnotationGroup(tid1500v0Ruler);
  checkGroupCommonProperties(annotationGroup, assert, 'ruler');
  checkRulerGroup(annotationGroup, assert);
});
