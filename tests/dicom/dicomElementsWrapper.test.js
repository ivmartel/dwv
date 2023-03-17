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
  var dicomParser = new DicomParser();
  dicomParser.parse(b64urlToArrayBuffer(dwvTestSimple));

  // wrapped tags
  var tags = dicomParser.getDicomElements();
  // dump to table
  var table = objectToArray(tags.dumpToObject());

  // regression table
  var teoTable = [
    {
      name: 'FileMetaInformationGroupLength',
      value: '90',
      group: '0x0002',
      element: '0x0000',
      vr: 'UL',
      vl: 4
    },
    {
      name: 'TransferSyntaxUID',
      value: '1.2.840.10008.1.2.1',
      group: '0x0002',
      element: '0x0010',
      vr: 'UI',
      vl: 20
    },
    {
      name: 'ImplementationClassUID',
      value: '1.2.826.0.1.3680043.9.7278.1.0.31.0',
      group: '0x0002',
      element: '0x0012',
      vr: 'UI',
      vl: 36
    },
    {
      name: 'ImplementationVersionName',
      value: 'DWV_0.31.0',
      group: '0x0002',
      element: '0x0013',
      vr: 'SH',
      vl: 10
    },
    {
      name: 'SOPInstanceUID',
      value: '1.2.3.0.1.11.111',
      group: '0x0008',
      element: '0x0018',
      vr: 'UI',
      vl: 16,
    },
    {
      name: 'Modality',
      value: 'MR',
      group: '0x0008',
      element: '0x0060',
      vr: 'CS',
      vl: 2
    },
    {
      name: 'PerformingPhysicianName',
      value: '(no value available)',
      group: '0x0008',
      element: '0x1050',
      vr: 'PN',
      vl: 0,
    },
    {
      name: 'ReferencedImageSequence',
      value: [
        [
          {
            element: '0x1150',
            group: '0x0008',
            name: 'ReferencedSOPClassUID',
            value: '1.2.840.10008.5.1.4.1.1.4',
            vl: 26,
            vr: 'UI'
          },
          {
            element: '0x1155',
            group: '0x0008',
            name: 'ReferencedSOPInstanceUID',
            value: '1.3.12.2.1107.5.2.32.35162.2012021515511672669154094',
            vl: 52,
            vr: 'UI'
          }
        ]
      ],
      group: '0x0008',
      element: '0x1140',
      vr: 'SQ',
      vl: 102
    },
    {
      name: 'PatientName',
      value: 'dwv^PatientName',
      group: '0x0010',
      element: '0x0010',
      vr: 'PN',
      vl: 16
    },
    {
      name: 'PatientID',
      value: 'dwv-patient-id123',
      group: '0x0010',
      element: '0x0020',
      vr: 'LO',
      vl: 18
    },
    {
      name: 'dBdt',
      value: '0',
      group: '0x0018',
      element: '0x1318',
      vr: 'DS',
      vl: 2
    },
    {
      name: 'StudyInstanceUID',
      value: '1.2.3.0.1',
      group: '0x0020',
      element: '0x000D',
      vr: 'UI',
      vl: 10
    },
    {
      name: 'SeriesInstanceUID',
      value: '1.2.3.0.1.11',
      group: '0x0020',
      element: '0x000E',
      vr: 'UI',
      vl: 12
    },
    {
      name: 'InstanceNumber',
      value: '0',
      group: '0x0020',
      element: '0x0013',
      vr: 'IS',
      vl: 2
    },
    {
      name: 'ImagePositionPatient',
      value: '0\\0\\0',
      group: '0x0020',
      element: '0x0032',
      vr: 'DS',
      vl: 6
    },
    {
      name: 'SamplesPerPixel',
      value: '1',
      group: '0x0028',
      element: '0x0002',
      vr: 'US',
      vl: 2
    },
    {
      name: 'PhotometricInterpretation',
      value: 'MONOCHROME2',
      group: '0x0028',
      element: '0x0004',
      vr: 'CS',
      vl: 12
    },
    {
      name: 'Rows',
      value: '32',
      group: '0x0028',
      element: '0x0010',
      vr: 'US',
      vl: 2
    },
    {
      name: 'Columns',
      value: '32',
      group: '0x0028',
      element: '0x0011',
      vr: 'US',
      vl: 2
    },
    {
      name: 'BitsAllocated',
      value: '16',
      group: '0x0028',
      element: '0x0100',
      vr: 'US',
      vl: 2
    },
    {
      name: 'BitsStored',
      value: '12',
      group: '0x0028',
      element: '0x0101',
      vr: 'US',
      vl: 2
    },
    {
      name: 'HighBit',
      value: '11',
      group: '0x0028',
      element: '0x0102',
      vr: 'US',
      vl: 2
    },
    {
      name: 'PixelRepresentation',
      value: '0',
      group: '0x0028',
      element: '0x0103',
      vr: 'US',
      vl: 2
    },
    {
      name: 'PixelData',
      value: '...',
      group: '0x7FE0',
      element: '0x0010',
      vr: 'OW',
      vl: 2048
    }
  ];

  // test
  var len = table.length;
  assert.equal(len, teoTable.length, 'dumpToTable length');

  // special pixel data case: browsers have different toString
  for (var i = 0; i < len; ++i) {
    if (table[i].name === 'PixelData' &&
      table[i].value === '[object Uint16Array]') {
      table[i].value = '...';
    }
  }
  assert.deepEqual(table, teoTable, 'dumpToTable content');
});
