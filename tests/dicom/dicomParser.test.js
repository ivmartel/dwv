import {safeGet} from '../../src/dicom/dataElement';
import {
  getDwvVersion,
  getDwvVersionUI,
  getDwvUIDPrefix,
  getImplementationClassUID,
  parseImplementationClassUID,
  cleanString,
  hasDicomPrefix,
  DicomParser
} from '../../src/dicom/dicomParser';
import {
  Tag,
  getPixelDataTag
} from '../../src/dicom/dicomTag';
import {getFileListFromDicomDir} from '../../src/dicom/dicomElementsWrapper';
import {b64urlToArrayBuffer} from './utils';

import dwvTestSimple from '../data/dwv-test-simple.dcm';
import dwvTestSequence from '../data/dwv-test-sequence.dcm';
import dwvDicomDir from '../data/DICOMDIR';

/**
 * Tests for the 'dicom/dicomParser.js' file.
 */

// Do not warn if these variables were not defined before.
/* global QUnit */
QUnit.module('dicom');

/**
 * Tests for {@link DicomParser} using simple DICOM data.
 * Using remote file for CI integration.
 *
 * @function module:tests/dicom~simple-dicom-parsing
 */
QUnit.test('DICOM parsing - Implementation class and name', function (assert) {
  // check UI
  const versionUI = getDwvVersionUI();
  const regex = /[a-zA-Z]/g;
  assert.equal(versionUI.search(regex), -1, 'No letters in vr=UI');

  // test #0: get and parse
  const version0 = getDwvVersion();
  // dot and possible '-' for beta
  const versions0 = version0.split(/[\\.-]/);
  const classUID0 = getImplementationClassUID();
  const versions01 = parseImplementationClassUID(classUID0);
  assert.deepEqual(versions0, versions01, 'Implementation class test #0');

  // test #1: basic
  const classUID1 = getDwvUIDPrefix() + '.' + '1.2.3';
  const versions1 = ['1', '2', '3'];
  const versions11 = parseImplementationClassUID(classUID1);
  assert.deepEqual(versions1, versions11, 'Implementation class test #1');

  // test #2: with beta
  const classUID2 = getDwvUIDPrefix() + '.' + '4.5.6.99.19';
  const versions2 = ['4', '5', '6', 'beta', '19'];
  const versions21 = parseImplementationClassUID(classUID2);
  assert.deepEqual(versions2, versions21, 'Implementation class test #2');
});

/**
 * Tests for {@link DicomParser} using simple DICOM data.
 * Using remote file for CI integration.
 *
 * @function module:tests/dicom~simple-dicom-parsing
 */
QUnit.test('Simple DICOM parsing - #DWV-REQ-IO-01-001 Load DICOM file(s)',
  function (assert) {
    const buffer = b64urlToArrayBuffer(dwvTestSimple);

    assert.ok(hasDicomPrefix(buffer), 'Response has DICOM prefix.');

    // parse DICOM
    const dicomParser = new DicomParser();
    dicomParser.parse(buffer);

    const numRows = 32;
    const numCols = 32;

    // raw tags
    const rawTags = dicomParser.getDicomElements();
    // check values
    assert.equal(rawTags['00280010'].value[0], numRows, 'Number of rows (raw)');
    assert.equal(
      rawTags['00280011'].value[0], numCols, 'Number of columns (raw)');
    // ReferencedImageSequence - ReferencedSOPInstanceUID
    assert.equal(rawTags['00081140'].value[0]['00081155'].value[0],
      '1.3.12.2.1107.5.2.32.35162.2012021515511672669154094',
      'ReferencedImageSequence SQ (raw)');

    // wrapped tags
    const tags = dicomParser.getDicomElements();
    // wrong key
    assert.ok(typeof tags['12345678'] === 'undefined',
      'Wrong key fails if test');
    // empty key
    assert.ok(typeof tags[''] === 'undefined',
      'Empty key fails if test');
    // good key
    assert.ok(typeof tags['00280010'] !== 'undefined',
      'Good key passes if test');

    // zero value (passes test since it is a string)
    assert.equal(tags['00181318'].value[0], 0, 'Good key, zero value');
    // check values
    assert.equal(tags['00280010'].value[0], numRows, 'Number of rows');
    assert.equal(tags['00280011'].value[0], numCols, 'Number of columns');
    // ReferencedImageSequence - ReferencedSOPInstanceUID
    // only one item value -> returns the object directly
    // (no need for tags["ReferencedImageSequence")[0])
    assert.equal(tags['00081140'].value[0]['00081155'].value[0],
      '1.3.12.2.1107.5.2.32.35162.2012021515511672669154094',
      'ReferencedImageSequence SQ');
  }
);

/**
 * Tests for {@link DicomParser} using simple DICOM data.
 * Using remote file for CI integration.
 *
 * @function module:tests/dicom~simple-dicom-parsing
 */
QUnit.test('Simple DICOM parsing - until tag',
  function (assert) {
    const buffer = b64urlToArrayBuffer(dwvTestSimple);

    assert.ok(hasDicomPrefix(buffer), 'Response has DICOM prefix.');

    const getRefUID = function (tags) {
      return safeGet(safeGet(tags, '00081140'), '00081155');
    };

    const patientNameKey = '00100010';
    const patientIdKey = '00100020';
    const rowsKey = '00280010';
    const colsKey = '00280011';

    const patientName = 'dwv^PatientName';
    const patientId = 'dwv-patient-id123';
    const numRows = 32;
    const numCols = 32;
    const refUID = '1.3.12.2.1107.5.2.32.35162.2012021515511672669154094';

    // test #0: parse until patient id
    const dicomParser0 = new DicomParser();
    const untilTag0 = new Tag('0010', '0020'); // patient id
    dicomParser0.parse(buffer, untilTag0);
    const tags0 = dicomParser0.getDicomElements();
    // check values
    assert.equal(
      dicomParser0.safeGet(patientNameKey), patientName, '#0 Patient name');
    assert.ok(
      typeof tags0[untilTag0.getKey()] === 'undefined',
      '#0 Until tag is not defined');
    assert.ok(
      typeof tags0[rowsKey] === 'undefined', '#0 Number of rows');
    assert.ok(
      typeof tags0[colsKey] === 'undefined', '#0 Number of columns');

    // test #1: parse until pixel data
    const dicomParser1 = new DicomParser();
    const untilTag1 = getPixelDataTag();
    dicomParser1.parse(buffer, untilTag1);
    const tags1 = dicomParser1.getDicomElements();
    // check values
    assert.equal(
      dicomParser1.safeGet(patientNameKey), patientName, '#1 Patient name');
    assert.equal(
      dicomParser1.safeGet(patientIdKey), patientId, '#1 Patient id');
    assert.equal(
      dicomParser1.safeGet(rowsKey), numRows, '#1 Number of rows');
    assert.equal(
      dicomParser1.safeGet(colsKey), numCols, '#1 Number of columns');
    assert.equal(
      getRefUID(tags1), refUID, '#1 ReferencedImageSequence SQ');
    assert.ok(
      typeof tags1[untilTag1.getKey()] === 'undefined',
      '#1 Until tag is not defined');
  }
);

/**
 * Tests for {@link DicomParser} using sequence test DICOM data.
 * Using remote file for CI integration.
 *
 * @function module:tests/dicom~dicom-sequence-parsing
 */
QUnit.test('DICOM sequence parsing - #DWV-REQ-IO-01-001 Load DICOM file(s)',
  function (assert) {
    const buffer = b64urlToArrayBuffer(dwvTestSequence);

    assert.ok(hasDicomPrefix(buffer), 'Response has DICOM prefix.');

    // parse DICOM
    const dicomParser = new DicomParser();
    dicomParser.parse(buffer);
    // raw tags
    const tags = dicomParser.getDicomElements();
    assert.ok((Object.keys(tags).length !== 0), 'Got raw tags.');

    // ReferencedImageSequence: explicit sequence
    const seq00 = tags['00081140'].value;
    assert.equal(seq00.length, 3, 'ReferencedImageSequence length');
    assert.equal(seq00[0]['00081155'].value[0],
      '1.3.12.2.1107.5.2.32.35162.2012021515511672669154094',
      'ReferencedImageSequence - item0 - ReferencedSOPInstanceUID');
    assert.equal(seq00[1]['00081155'].value[0],
      '1.3.12.2.1107.5.2.32.35162.2012021515511286933854090',
      'ReferencedImageSequence - item1 - ReferencedSOPInstanceUID');

    // SourceImageSequence: implicit sequence
    const seq01 = tags['00082112'].value;
    assert.equal(seq01.length, 3, 'SourceImageSequence length');
    assert.equal(seq01[0]['00081155'].value[0],
      '1.3.12.2.1107.5.2.32.35162.2012021515511672669154094',
      'SourceImageSequence - item0 - ReferencedSOPInstanceUID');
    assert.equal(seq01[1]['00081155'].value[0],
      '1.3.12.2.1107.5.2.32.35162.2012021515511286933854090',
      'SourceImageSequence - item1 - ReferencedSOPInstanceUID');

    // ReferencedPatientSequence: explicit empty sequence
    const seq10 = tags['00081120'].value;
    assert.equal(seq10.length, 0, 'ReferencedPatientSequence length');

    // ReferencedOverlaySequence: implicit empty sequence
    const seq11 = tags['00081130'].value;
    assert.equal(seq11.length, 0, 'ReferencedOverlaySequence length');

    // ReferringPhysicianIdentificationSequence: explicit empty item
    const seq12 = tags['00080096'].value;
    assert.equal(seq12[0]['FFFEE000'].value.length, 0,
      'ReferringPhysicianIdentificationSequence item length');

    // ConsultingPhysicianIdentificationSequence: implicit empty item
    const seq13 = tags['0008009D'].value;
    assert.equal(seq13.length, 0,
      'ConsultingPhysicianIdentificationSequence item length');

    // ReferencedStudySequence: explicit sequence of sequence
    const seq20 = tags['00081110'].value;
    // just one element
    //assert.equal(seq20.length, 2, "ReferencedStudySequence length");
    assert.equal(seq20[0]['0040A170'].value[0]['00080100'].value[0],
      '123456',
      'ReferencedStudySequence - seq - item0 - CodeValue');

    // ReferencedSeriesSequence: implicit sequence of sequence
    const seq21 = tags['00081115'].value;
    // just one element
    //assert.equal(seq21.length, 2, "ReferencedSeriesSequence length");
    assert.equal(seq21[0]['0040A170'].value[0]['00080100'].value[0],
      '789101',
      'ReferencedSeriesSequence - seq - item0 - CodeValue');

    // ReferencedInstanceSequence: explicit empty sequence of sequence
    const seq30 = tags['0008114A'].value;
    assert.equal(seq30[0]['0040A170'].value.length, 0,
      'ReferencedInstanceSequence - seq - length');

    // ReferencedVisitSequence: implicit empty sequence of sequence
    const seq31 = tags['00081125'].value;
    assert.equal(seq31[0]['0040A170'].value.length, 0,
      'ReferencedVisitSequence - seq - length');
  }
);

/**
 * Tests for {@link cleanString}.
 *
 * @function module:tests/dicom~cleanstring
 */
QUnit.test('cleanString', function (assert) {
  // undefined
  assert.throws(function () {
    cleanString();
  },
  new TypeError('Cannot read properties of undefined (reading \'length\')'),
  'cleanstring undefined throws.');
  // null
  assert.throws(function () {
    cleanString(null);
  },
  new TypeError('Cannot read properties of null (reading \'length\')'),
  'cleanstring null throws.');
  // number
  assert.throws(function () {
    cleanString(3);
  },
  new TypeError('res.trim is not a function'),
  'cleanstring number throws.');
  // empty
  assert.equal(cleanString(''), '', 'Clean empty');
  // short
  assert.equal(cleanString('a'), 'a', 'Clean short');
  // special
  const special = String.fromCharCode('u200B');
  assert.equal(cleanString(special), '', 'Clean just special');
  // regular
  let str = ' El cielo azul ';
  let refStr = 'El cielo azul';
  assert.equal(cleanString(str), refStr, 'Clean regular');
  // regular with special
  str = ' El cielo azul' + special;
  refStr = 'El cielo azul';
  assert.equal(
    cleanString(str), refStr, 'Clean regular with special');
  // regular with special and ending space (not trimmed)
  str = ' El cielo azul ' + special;
  refStr = 'El cielo azul';
  assert.equal(
    cleanString(str), refStr, 'Clean regular with special 2');
});

/**
 * Tests for {@link DicomParser} using DICOMDIR data.
 * Using remote file for CI integration.
 *
 * @function module:tests/dicom~dicomdir-parsing
 */
QUnit.test('DICOMDIR parsing - #DWV-REQ-IO-02-004 Load DICOMDIR URL',
  function (assert) {
    // get the file list
    const list = getFileListFromDicomDir(
      b64urlToArrayBuffer(dwvDicomDir)
    );

    // check file list
    const nFilesSeries0Study0 = 23;
    const nFilesSeries1Study0 = 20;
    const nFilesSeries0Study1 = 1;
    assert.equal(list.length, 2, 'Number of study');
    assert.equal(list[0].length, 2, 'Number of series in first study');
    assert.equal(list[1].length, 1, 'Number of series in second study');
    assert.equal(
      list[0][0].length,
      nFilesSeries0Study0,
      'Study#0:Series#0 number of files');
    assert.equal(
      list[0][1].length,
      nFilesSeries1Study0,
      'Study#0:Series#1 number of files');
    assert.equal(
      list[1][0].length,
      nFilesSeries0Study1,
      'Study#1:Series#0 number of files'
    );

    // files
    const files00 = [];
    let iStart = 0;
    let iEnd = nFilesSeries0Study0;
    for (let i = iStart; i < iEnd; ++i) {
      files00.push('IMAGES/IM' + i);
    }
    assert.deepEqual(list[0][0], files00, 'Study#0:Series#0 file names');
    const files01 = [];
    iStart = iEnd;
    iEnd += nFilesSeries1Study0;
    for (let i = iStart; i < iEnd; ++i) {
      files01.push('IMAGES/IM' + i);
    }
    assert.deepEqual(list[0][0], files00, 'Study#0:Series#1 file names');
    const files10 = [];
    iStart = iEnd;
    iEnd += nFilesSeries0Study1;
    for (let i = iStart; i < iEnd; ++i) {
      files10.push('IMAGES/IM' + i);
    }
    assert.deepEqual(list[0][0], files00, 'Study#1:Series#0 file names');
  }
);
