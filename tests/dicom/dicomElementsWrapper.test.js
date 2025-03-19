import {DicomParser} from '../../src/dicom/dicomParser';
import {dcmdump} from '../../src/dicom/dicomElementsWrapper';
import {b64urlToArrayBuffer} from './utils';

import dwvTestSimple from '../data/dwv-test-simple.dcm';

/**
 * Tests for the 'dicom/dicomElementsWrapper.js' file.
 */

/* global QUnit */
QUnit.module('dicom');

/**
 * Tests for dcmdump using simple DICOM data.
 * Using remote file for CI integration.
 *
 * @function module:tests/dicom~dicom-dump
 */
QUnit.test('DICOM dump', function (assert) {

  // parse DICOM
  const dicomParser = new DicomParser();
  dicomParser.parse(b64urlToArrayBuffer(dwvTestSimple));

  // wrapped tags
  const tags = dicomParser.getDicomElements();
  const dump = dcmdump(tags);

  /* eslint-disable @stylistic/js/max-len */
  const theoDump = '\n\
# Dicom-File-Format\n\
\n\
# Dicom-Meta-Information-Header\n\
# Used TransferSyntax: Little Endian Explicit\n\
(0002,0000) UL 90                                       # undefined, 1 FileMetaInformationGroupLength\n\
(0002,0010) UI [1.2.840.10008.1.2.1]                    # undefined, 1 TransferSyntaxUID\n\
(0002,0012) UI [1.2.826.0.1.3680043.9.7278.1.0.31.0]    # undefined, 1 ImplementationClassUID\n\
(0002,0013) SH [DWV_0.31.0]                             # undefined, 1 ImplementationVersionName\n\
\n\
# Dicom-Data-Set\n\
# Used TransferSyntax: Explicit VR Little Endian\n\
(0008,0018) UI [1.2.3.0.1.11.111]                       # undefined, 1 SOPInstanceUID\n\
(0008,0060) CS [MR]                                     # undefined, 1 Modality\n\
(0008,1050) PN (no value available)                     # undefined, 0 PerformingPhysicianName\n\
(0008,1140) SQ (Sequence with explicit length #=1)      # undefined, 1 ReferencedImageSequence\n\
  (fffe,e000) na (Item with explicit length #=2)          # undefined, 1 Item\n\
    (fffe,e000) na (Item with explicit length #=2)          # undefined, 1 Item\n\
    (0008,1150) UI [1.2.840.10008.5.1.4.1.1.4]              # undefined, 1 ReferencedSOPClassUID\n\
    (0008,1155) UI [1.3.12.2.1107.5.2.32.35162.2012021515511672669154094] # undefined, 1 ReferencedSOPInstanceUID\n\
  (fffe,e00d) na (ItemDelimitationItem for re-encoding)   #   0, 0 ItemDelimitationItem\n\
(fffe,e0dd) na (SequenceDelimitationItem for re-encod.) #   0, 0 SequenceDelimitationItem\n\
(0010,0010) PN [dwv^PatientName]                        # undefined, 1 PatientName\n\
(0010,0020) LO [dwv-patient-id123]                      # undefined, 1 PatientID\n\
(0018,1318) DS [0]                                      # undefined, 1 dBdt\n\
(0020,000d) UI [1.2.3.0.1]                              # undefined, 1 StudyInstanceUID\n\
(0020,000e) UI [1.2.3.0.1.11]                           # undefined, 1 SeriesInstanceUID\n\
(0020,0013) IS [0]                                      # undefined, 1 InstanceNumber\n\
(0020,0032) DS [0\\0\\0]                                  # undefined, 3 ImagePositionPatient\n\
(0028,0002) US 1                                        # undefined, 1 SamplesPerPixel\n\
(0028,0004) CS [MONOCHROME2]                            # undefined, 1 PhotometricInterpretation\n\
(0028,0010) US 32                                       # undefined, 1 Rows\n\
(0028,0011) US 32                                       # undefined, 1 Columns\n\
(0028,0100) US 16                                       # undefined, 1 BitsAllocated\n\
(0028,0101) US 12                                       # undefined, 1 BitsStored\n\
(0028,0102) US 11                                       # undefined, 1 HighBit\n\
(0028,0103) US 0                                        # undefined, 1 PixelRepresentation\n\
(7fe0,0010) OW ...                                      # undefined, 1 PixelData\n';
  /* eslint-enable @stylistic/js/max-len */

  assert.equal(dump, theoDump, 'dump');
});
