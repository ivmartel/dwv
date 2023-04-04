import {DicomParser} from '../../src/dicom/dicomParser';
import {objectToArray} from '../../src/utils/operator';
import {b64urlToArrayBuffer} from './utils';

import dwvTestSimple from '../data/dwv-test-simple.dcm';

/**
 * Tests for the 'dicom/dicomElementsWrapper.js' file.
 */
/** @module tests/dicom */
// Do not warn if these variables were not defined before.
/* global QUnit */
QUnit.module('dicom');

/**
 * Tests for {@link DicomElementsWrapper} using simple DICOM data.
 * Using remote file for CI integration.
 *
 * @function module:tests/dicom~dicomElementsWrapper
 */
QUnit.test('Test simple DICOM wrapping.', function (assert) {

  // parse DICOM
  const dicomParser = new DicomParser();
  dicomParser.parse(b64urlToArrayBuffer(dwvTestSimple));

  // wrapped tags
  const tags = dicomParser.getDicomElements();
  // dump to table
  const table = objectToArray(tags.dumpToObject());

  // regression table
  const teoTable = [
    {
      name: 'FileMetaInformationGroupLength',
      value: '90',
      vr: 'UL'
    },
    {
      name: 'TransferSyntaxUID',
      value: '1.2.840.10008.1.2.1',
      vr: 'UI'
    },
    {
      name: 'ImplementationClassUID',
      value: '1.2.826.0.1.3680043.9.7278.1.0.31.0',
      vr: 'UI'
    },
    {
      name: 'ImplementationVersionName',
      value: 'DWV_0.31.0',
      vr: 'SH'
    },
    {
      name: 'SOPInstanceUID',
      value: '1.2.3.0.1.11.111',
      vr: 'UI'
    },
    {
      name: 'Modality',
      value: 'MR',
      vr: 'CS'
    },
    {
      name: 'PerformingPhysicianName',
      value: '(no value available)',
      vr: 'PN'
    },
    {
      name: 'ReferencedImageSequence',
      value: [
        [
          {
            name: 'ReferencedSOPClassUID',
            value: '1.2.840.10008.5.1.4.1.1.4',
            vr: 'UI'
          },
          {
            name: 'ReferencedSOPInstanceUID',
            value: '1.3.12.2.1107.5.2.32.35162.2012021515511672669154094',
            vr: 'UI'
          }
        ]
      ],
      vr: 'SQ'
    },
    {
      name: 'PatientName',
      value: 'dwv^PatientName',
      vr: 'PN'
    },
    {
      name: 'PatientID',
      value: 'dwv-patient-id123',
      vr: 'LO'
    },
    {
      name: 'dBdt',
      value: '0',
      vr: 'DS'
    },
    {
      name: 'StudyInstanceUID',
      value: '1.2.3.0.1',
      vr: 'UI'
    },
    {
      name: 'SeriesInstanceUID',
      value: '1.2.3.0.1.11',
      vr: 'UI'
    },
    {
      name: 'InstanceNumber',
      value: '0',
      vr: 'IS'
    },
    {
      name: 'ImagePositionPatient',
      value: '0\\0\\0',
      vr: 'DS'
    },
    {
      name: 'SamplesPerPixel',
      value: '1',
      vr: 'US'
    },
    {
      name: 'PhotometricInterpretation',
      value: 'MONOCHROME2',
      vr: 'CS'
    },
    {
      name: 'Rows',
      value: '32',
      vr: 'US'
    },
    {
      name: 'Columns',
      value: '32',
      vr: 'US'
    },
    {
      name: 'BitsAllocated',
      value: '16',
      vr: 'US'
    },
    {
      name: 'BitsStored',
      value: '12',
      vr: 'US'
    },
    {
      name: 'HighBit',
      value: '11',
      vr: 'US'
    },
    {
      name: 'PixelRepresentation',
      value: '0',
      vr: 'US'
    },
    {
      name: 'PixelData',
      value: '...',
      vr: 'OW'
    }
  ];

  // test
  const len = table.length;
  assert.equal(len, teoTable.length, 'dumpToTable length');

  // special pixel data case: browsers have different toString
  for (let i = 0; i < len; ++i) {
    if (table[i].name === 'PixelData' &&
      table[i].value === '[object Uint16Array]') {
      table[i].value = '...';
    }
  }
  assert.deepEqual(table, teoTable, 'dumpToTable content');
});
