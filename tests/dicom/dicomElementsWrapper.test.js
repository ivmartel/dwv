import {DicomParser} from '../../src/dicom/dicomParser';
import {
  DicomElementsWrapper,
  getDate,
  getTime,
  getDateTime
} from '../../src/dicom/dicomElementsWrapper';
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
  const wrapper = new DicomElementsWrapper(tags);
  // dump to object
  const tagsObject = wrapper.dumpToObject();

  // regression table
  const theoObject = {
    FileMetaInformationGroupLength: {
      value: '90',
      vr: 'UL'
    },
    TransferSyntaxUID: {
      value: '1.2.840.10008.1.2.1',
      vr: 'UI'
    },
    ImplementationClassUID: {
      value: '1.2.826.0.1.3680043.9.7278.1.0.31.0',
      vr: 'UI'
    },
    ImplementationVersionName: {
      value: 'DWV_0.31.0',
      vr: 'SH'
    },
    SOPInstanceUID: {
      value: '1.2.3.0.1.11.111',
      vr: 'UI'
    },
    Modality: {
      value: 'MR',
      vr: 'CS'
    },
    PerformingPhysicianName: {
      value: '(no value available)',
      vr: 'PN'
    },
    ReferencedImageSequence: {
      value: [
        {
          ReferencedSOPClassUID: {
            value: '1.2.840.10008.5.1.4.1.1.4',
            vr: 'UI'
          },
          ReferencedSOPInstanceUID: {
            value: '1.3.12.2.1107.5.2.32.35162.2012021515511672669154094',
            vr: 'UI'
          }
        }
      ],
      vr: 'SQ'
    },
    PatientName: {
      value: 'dwv^PatientName',
      vr: 'PN'
    },
    PatientID: {
      value: 'dwv-patient-id123',
      vr: 'LO'
    },
    dBdt: {
      value: '0',
      vr: 'DS'
    },
    StudyInstanceUID: {
      value: '1.2.3.0.1',
      vr: 'UI'
    },
    SeriesInstanceUID: {
      value: '1.2.3.0.1.11',
      vr: 'UI'
    },
    InstanceNumber: {
      value: '0',
      vr: 'IS'
    },
    ImagePositionPatient: {
      value: '0\\0\\0',
      vr: 'DS'
    },
    SamplesPerPixel: {
      value: '1',
      vr: 'US'
    },
    PhotometricInterpretation: {
      value: 'MONOCHROME2',
      vr: 'CS'
    },
    Rows: {
      value: '32',
      vr: 'US'
    },
    Columns: {
      value: '32',
      vr: 'US'
    },
    BitsAllocated: {
      value: '16',
      vr: 'US'
    },
    BitsStored: {
      value: '12',
      vr: 'US'
    },
    HighBit: {
      value: '11',
      vr: 'US'
    },
    PixelRepresentation: {
      value: '0',
      vr: 'US'
    },
    PixelData: {
      value: '...',
      vr: 'OW'
    }
  };

  // test length
  const keys = Object.keys(tagsObject);
  const len = keys.length;
  const theoKeys = Object.keys(theoObject);
  assert.equal(len, theoKeys.length, 'dumpToTable length');
  // test content
  assert.deepEqual(tagsObject, theoObject, 'dumpToTable content');
});

/**
 * Tests for getDate.
 *
 * @function module:tests/dicom~dicomElementsWrapper
 */
QUnit.test('Test getDate.', function (assert) {
  const da00 = getDate(undefined);
  const daTheo00 = undefined;
  assert.equal(da00, daTheo00, 'test date #00');

  const da10 = getDate({value: ['20230501']});
  const daTheo10 = {year: 2023, monthIndex: 4, day: 1};
  assert.deepEqual(da10, daTheo10, 'test date #10');

  const da11 = getDate({value: ['20230131']});
  const daTheo11 = {year: 2023, monthIndex: 0, day: 31};
  assert.deepEqual(da11, daTheo11, 'test date #11');
});

/**
 * Tests for getDate.
 *
 * @function module:tests/dicom~dicomElementsWrapper
 */
QUnit.test('Test getTime.', function (assert) {
  const tm00 = getTime(undefined);
  const tmTheo00 = undefined;
  assert.equal(tm00, tmTheo00, 'test time #00');

  const tm10 = getTime({value: ['19']});
  const tmTheo10 = {hours: 19, minutes: 0, seconds: 0, milliseconds: 0};
  assert.deepEqual(tm10, tmTheo10, 'test time #10');

  const tm11 = getTime({value: ['1936']});
  const tmTheo11 = {hours: 19, minutes: 36, seconds: 0, milliseconds: 0};
  assert.deepEqual(tm11, tmTheo11, 'test time #11');

  const tm12 = getTime({value: ['193610']});
  const tmTheo12 = {hours: 19, minutes: 36, seconds: 10, milliseconds: 0};
  assert.deepEqual(tm12, tmTheo12, 'test time #12');

  const tm13 = getTime({value: ['193610.012345']});
  const tmTheo13 = {hours: 19, minutes: 36, seconds: 10, milliseconds: 12};
  assert.deepEqual(tm13, tmTheo13, 'test time #13');
});

/**
 * Tests for getDateTime.
 *
 * @function module:tests/dicom~dicomElementsWrapper
 */
QUnit.test('Test getDateTime.', function (assert) {
  const dt00 = getDateTime(undefined);
  const dtTheo00 = undefined;
  assert.equal(dt00, dtTheo00, 'test date-time #00');

  const dt10 = getDateTime({value: ['2023']});
  const dtTheo10 = {
    date: {year: 2023, monthIndex: 0, day: 0},
    time: undefined
  };
  assert.deepEqual(dt10, dtTheo10, 'test time #10');

  const dt11 = getDateTime({value: ['202305']});
  const dtTheo11 = {
    date: {year: 2023, monthIndex: 4, day: 0},
    time: undefined
  };
  assert.deepEqual(dt11, dtTheo11, 'test time #11');

  const dt12 = getDateTime({value: ['20230501']});
  const dtTheo12 = {
    date: {year: 2023, monthIndex: 4, day: 1},
    time: undefined
  };
  assert.deepEqual(dt12, dtTheo12, 'test time #12');

  const dt13 = getDateTime({value: ['2023050119']});
  const dtTheo13 = {
    date: {year: 2023, monthIndex: 4, day: 1},
    time: {hours: 19, minutes: 0, seconds: 0, milliseconds: 0}
  };
  assert.deepEqual(dt13, dtTheo13, 'test time #13');

  const dt14 = getDateTime({value: ['202305011936']});
  const dtTheo14 = {
    date: {year: 2023, monthIndex: 4, day: 1},
    time: {hours: 19, minutes: 36, seconds: 0, milliseconds: 0}
  };
  assert.deepEqual(dt14, dtTheo14, 'test time #14');

  const dt15 = getDateTime({value: ['20230501193610']});
  const dtTheo15 = {
    date: {year: 2023, monthIndex: 4, day: 1},
    time: {hours: 19, minutes: 36, seconds: 10, milliseconds: 0}
  };
  assert.deepEqual(dt15, dtTheo15, 'test time #15');

  const dt16 = getDateTime({value: ['20230501193610.012345']});
  const dtTheo16 = {
    date: {year: 2023, monthIndex: 4, day: 1},
    time: {hours: 19, minutes: 36, seconds: 10, milliseconds: 12}
  };
  assert.deepEqual(dt16, dtTheo16, 'test time #16');

  const dt17 = getDateTime({value: ['20230501193610.012345&0200']});
  const dtTheo17 = {
    date: {year: 2023, monthIndex: 4, day: 1},
    time: {hours: 19, minutes: 36, seconds: 10, milliseconds: 12}
  };
  assert.deepEqual(dt17, dtTheo17, 'test time #17');
});
