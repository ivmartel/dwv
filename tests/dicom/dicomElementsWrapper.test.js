// @vitest-environment jsdom
import {describe, test, assert} from 'vitest';
import {DicomParser} from '../../src/dicom/dicomParser.js';
import {dcmdump} from '../../src/dicom/dicomElementsWrapper.js';
import {b64urlToArrayBuffer} from './utils.js';

import dwvTestSimple from '../data/dwv-test-simple.dcm?inline';
import dwvTestSequence from '../data/dwv-test-sequence.dcm?inline';
import leadtoolsRle from '../data/leadtools-flowers-8-mono2-rle.dcm?inline';

/**
 * Tests for the 'dicom/dicomElementsWrapper.js' file.
 */

describe('dicom', () => {

  /**
   * Tests for {@link dcmdump} using simple DICOM data.
   * Using remote file for CI integration.
   *
   * @function module:tests/dicom~dump
   */
  test('dump', () => {

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
(0002,0000) UL 90                                       #   4, 1 FileMetaInformationGroupLength\n\
(0002,0010) UI [1.2.840.10008.1.2.1]                    #  20, 1 TransferSyntaxUID\n\
(0002,0012) UI [1.2.826.0.1.3680043.9.7278.1.0.31.0]    #  36, 1 ImplementationClassUID\n\
(0002,0013) SH [DWV_0.31.0]                             #  10, 1 ImplementationVersionName\n\
\n\
# Dicom-Data-Set\n\
# Used TransferSyntax: Explicit VR Little Endian\n\
(0008,0018) UI [1.2.3.0.1.11.111]                       #  16, 1 SOPInstanceUID\n\
(0008,0060) CS [MR]                                     #   2, 1 Modality\n\
(0008,1050) PN (no value available)                     #   0, 0 PerformingPhysicianName\n\
(0008,1140) SQ (Sequence with explicit length #=1)      # 102, 1 ReferencedImageSequence\n\
  (fffe,e000) na (Item with explicit length #=2)          #  94, 1 Item\n\
    (0008,1150) UI [1.2.840.10008.5.1.4.1.1.4]              #  26, 1 ReferencedSOPClassUID\n\
    (0008,1155) UI [1.3.12.2.1107.5.2.32.35162.2012021515511672669154094] #  52, 1 ReferencedSOPInstanceUID\n\
  (fffe,e00d) na (ItemDelimitationItem for re-encoding)   #   0, 0 ItemDelimitationItem\n\
(fffe,e0dd) na (SequenceDelimitationItem for re-encod.) #   0, 0 SequenceDelimitationItem\n\
(0010,0010) PN [dwv^PatientName]                        #  16, 1 PatientName\n\
(0010,0020) LO [dwv-patient-id123]                      #  18, 1 PatientID\n\
(0018,1318) DS [0]                                      #   2, 1 dBdt\n\
(0020,000d) UI [1.2.3.0.1]                              #  10, 1 StudyInstanceUID\n\
(0020,000e) UI [1.2.3.0.1.11]                           #  12, 1 SeriesInstanceUID\n\
(0020,0013) IS [0]                                      #   2, 1 InstanceNumber\n\
(0020,0032) DS [0\\0\\0]                                  #   6, 3 ImagePositionPatient\n\
(0028,0002) US 1                                        #   2, 1 SamplesPerPixel\n\
(0028,0004) CS [MONOCHROME2]                            #  12, 1 PhotometricInterpretation\n\
(0028,0010) US 32                                       #   2, 1 Rows\n\
(0028,0011) US 32                                       #   2, 1 Columns\n\
(0028,0100) US 16                                       #   2, 1 BitsAllocated\n\
(0028,0101) US 12                                       #   2, 1 BitsStored\n\
(0028,0102) US 11                                       #   2, 1 HighBit\n\
(0028,0103) US 0                                        #   2, 1 PixelRepresentation\n\
(7fe0,0010) OW 0000\\0000\\0000\\0000\\0000\\0000\\0000\\0000\\0000\\0000\\0000\\0000\\0000... # 2048, 1 PixelData\n';
    /* eslint-enable @stylistic/js/max-len */

    assert.equal(dump, theoDump, 'dump');
  });

  /**
   * Tests for {@link dcmdump} using DICOM data with sequences:
   * explicit and undefined length sequences and items, nested sequences.
   * The expected dump matches the DCMTK one (apart from its UID names).
   *
   * @function module:tests/dicom~dumpSequence
   */
  test('dump sequence', () => {
    const dicomParser = new DicomParser();
    dicomParser.parse(b64urlToArrayBuffer(dwvTestSequence));
    const dump = dcmdump(dicomParser.getDicomElements());

    /* eslint-disable @stylistic/js/max-len */
    const theoDump = `
# Dicom-File-Format

# Dicom-Meta-Information-Header
# Used TransferSyntax: Little Endian Explicit
(0002,0000) UL 90                                       #   4, 1 FileMetaInformationGroupLength
(0002,0010) UI [1.2.840.10008.1.2.1]                    #  20, 1 TransferSyntaxUID
(0002,0012) UI [1.2.826.0.1.3680043.9.7278.1.0.31.0]    #  36, 1 ImplementationClassUID
(0002,0013) SH [DWV_0.31.0]                             #  10, 1 ImplementationVersionName

# Dicom-Data-Set
# Used TransferSyntax: Explicit VR Little Endian
(0008,0018) UI [1.2.3.0.1.11.111]                       #  16, 1 SOPInstanceUID
(0008,0060) CS [MR]                                     #   2, 1 Modality
(0008,0096) SQ (Sequence with explicit length #=1)      #   8, 1 ReferringPhysicianIdentificationSequence
  (fffe,e000) na (Item with explicit length #=0)          #   0, 1 Item
  (fffe,e00d) na (ItemDelimitationItem for re-encoding)   #   0, 0 ItemDelimitationItem
(fffe,e0dd) na (SequenceDelimitationItem for re-encod.) #   0, 0 SequenceDelimitationItem
(0008,009d) SQ (Sequence with undefined length #=0)     # u/l, 1 ConsultingPhysicianIdentificationSequence
(fffe,e0dd) na (SequenceDelimitationItem)               #   0, 0 SequenceDelimitationItem
(0008,1050) PN [Dr^X]                                   #   4, 1 PerformingPhysicianName
(0008,1110) SQ (Sequence with explicit length #=1)      #  42, 1 ReferencedStudySequence
  (fffe,e000) na (Item with explicit length #=1)          #  34, 1 Item
    (0040,a170) SQ (Sequence with explicit length #=1)      #  22, 1 PurposeOfReferenceCodeSequence
      (fffe,e000) na (Item with explicit length #=1)          #  14, 1 Item
        (0008,0100) SH [123456]                                 #   6, 1 CodeValue
      (fffe,e00d) na (ItemDelimitationItem for re-encoding)   #   0, 0 ItemDelimitationItem
    (fffe,e0dd) na (SequenceDelimitationItem for re-encod.) #   0, 0 SequenceDelimitationItem
  (fffe,e00d) na (ItemDelimitationItem for re-encoding)   #   0, 0 ItemDelimitationItem
(fffe,e0dd) na (SequenceDelimitationItem for re-encod.) #   0, 0 SequenceDelimitationItem
(0008,1115) SQ (Sequence with undefined length #=1)     # u/l, 1 ReferencedSeriesSequence
  (fffe,e000) na (Item with undefined length #=1)         # u/l, 1 Item
    (0040,a170) SQ (Sequence with explicit length #=1)      #  22, 1 PurposeOfReferenceCodeSequence
      (fffe,e000) na (Item with explicit length #=1)          #  14, 1 Item
        (0008,0100) SH [789101]                                 #   6, 1 CodeValue
      (fffe,e00d) na (ItemDelimitationItem for re-encoding)   #   0, 0 ItemDelimitationItem
    (fffe,e0dd) na (SequenceDelimitationItem for re-encod.) #   0, 0 SequenceDelimitationItem
  (fffe,e00d) na (ItemDelimitationItem)                   #   0, 0 ItemDelimitationItem
(fffe,e0dd) na (SequenceDelimitationItem)               #   0, 0 SequenceDelimitationItem
(0008,1120) SQ (Sequence with explicit length #=0)      #   0, 1 ReferencedPatientSequence
(fffe,e0dd) na (SequenceDelimitationItem for re-encod.) #   0, 0 SequenceDelimitationItem
(0008,1125) SQ (Sequence with undefined length #=1)     # u/l, 1 ReferencedVisitSequence
  (fffe,e000) na (Item with undefined length #=1)         # u/l, 1 Item
    (0040,a170) SQ (Sequence with explicit length #=0)      #   0, 1 PurposeOfReferenceCodeSequence
    (fffe,e0dd) na (SequenceDelimitationItem for re-encod.) #   0, 0 SequenceDelimitationItem
  (fffe,e00d) na (ItemDelimitationItem)                   #   0, 0 ItemDelimitationItem
(fffe,e0dd) na (SequenceDelimitationItem)               #   0, 0 SequenceDelimitationItem
(0008,1130) SQ (Sequence with explicit length #=0)      #   0, 1 ReferencedOverlaySequence
(fffe,e0dd) na (SequenceDelimitationItem for re-encod.) #   0, 0 SequenceDelimitationItem
(0008,1140) SQ (Sequence with explicit length #=3)      # 212, 1 ReferencedImageSequence
  (fffe,e000) na (Item with explicit length #=2)          #  94, 1 Item
    (0008,1150) UI [1.2.840.10008.5.1.4.1.1.4]              #  26, 1 ReferencedSOPClassUID
    (0008,1155) UI [1.3.12.2.1107.5.2.32.35162.2012021515511672669154094] #  52, 1 ReferencedSOPInstanceUID
  (fffe,e00d) na (ItemDelimitationItem for re-encoding)   #   0, 0 ItemDelimitationItem
  (fffe,e000) na (Item with explicit length #=2)          #  94, 1 Item
    (0008,1150) UI [1.2.840.10008.5.1.4.1.1.4]              #  26, 1 ReferencedSOPClassUID
    (0008,1155) UI [1.3.12.2.1107.5.2.32.35162.2012021515511286933854090] #  52, 1 ReferencedSOPInstanceUID
  (fffe,e00d) na (ItemDelimitationItem for re-encoding)   #   0, 0 ItemDelimitationItem
  (fffe,e000) na (Item with explicit length #=0)          #   0, 1 Item
  (fffe,e00d) na (ItemDelimitationItem for re-encoding)   #   0, 0 ItemDelimitationItem
(fffe,e0dd) na (SequenceDelimitationItem for re-encod.) #   0, 0 SequenceDelimitationItem
(0008,114a) SQ (Sequence with explicit length #=1)      #  20, 1 ReferencedInstanceSequence
  (fffe,e000) na (Item with explicit length #=1)          #  12, 1 Item
    (0040,a170) SQ (Sequence with explicit length #=0)      #   0, 1 PurposeOfReferenceCodeSequence
    (fffe,e0dd) na (SequenceDelimitationItem for re-encod.) #   0, 0 SequenceDelimitationItem
  (fffe,e00d) na (ItemDelimitationItem for re-encoding)   #   0, 0 ItemDelimitationItem
(fffe,e0dd) na (SequenceDelimitationItem for re-encod.) #   0, 0 SequenceDelimitationItem
(0008,2112) SQ (Sequence with undefined length #=3)     # u/l, 1 SourceImageSequence
  (fffe,e000) na (Item with undefined length #=2)         # u/l, 1 Item
    (0008,1150) UI [1.2.840.10008.5.1.4.1.1.4]              #  26, 1 ReferencedSOPClassUID
    (0008,1155) UI [1.3.12.2.1107.5.2.32.35162.2012021515511672669154094] #  52, 1 ReferencedSOPInstanceUID
  (fffe,e00d) na (ItemDelimitationItem)                   #   0, 0 ItemDelimitationItem
  (fffe,e000) na (Item with undefined length #=2)         # u/l, 1 Item
    (0008,1150) UI [1.2.840.10008.5.1.4.1.1.4]              #  26, 1 ReferencedSOPClassUID
    (0008,1155) UI [1.3.12.2.1107.5.2.32.35162.2012021515511286933854090] #  52, 1 ReferencedSOPInstanceUID
  (fffe,e00d) na (ItemDelimitationItem)                   #   0, 0 ItemDelimitationItem
  (fffe,e000) na (Item with undefined length #=0)         # u/l, 1 Item
  (fffe,e00d) na (ItemDelimitationItem)                   #   0, 0 ItemDelimitationItem
(fffe,e0dd) na (SequenceDelimitationItem)               #   0, 0 SequenceDelimitationItem
(0010,0010) PN [dwv^PatientName]                        #  16, 1 PatientName
(0010,0020) LO [dwv-patient-id123]                      #  18, 1 PatientID
(0020,000d) UI [1.2.3.0.1]                              #  10, 1 StudyInstanceUID
(0020,000e) UI [1.2.3.0.1.11]                           #  12, 1 SeriesInstanceUID
(0020,0013) IS [0]                                      #   2, 1 InstanceNumber
(0020,0032) DS [0\\0\\0]                                  #   6, 3 ImagePositionPatient
(0028,0002) US 1                                        #   2, 1 SamplesPerPixel
(0028,0004) CS [MONOCHROME2]                            #  12, 1 PhotometricInterpretation
(0028,0010) US 32                                       #   2, 1 Rows
(0028,0011) US 32                                       #   2, 1 Columns
(0028,0100) US 16                                       #   2, 1 BitsAllocated
(0028,0101) US 12                                       #   2, 1 BitsStored
(0028,0102) US 11                                       #   2, 1 HighBit
(0028,0103) US 0                                        #   2, 1 PixelRepresentation
(7fe0,0010) OW 0000\\0000\\0000\\0000\\0000\\0000\\0000\\0000\\0000\\0000\\0000\\0000\\0000... # 2048, 1 PixelData
`;
    /* eslint-enable @stylistic/js/max-len */

    assert.equal(dump, theoDump, 'dump sequence');
  });

  /**
   * Tests for {@link dcmdump} using encapsulated pixel data.
   *
   * @function module:tests/dicom~dumpPixelSequence
   */
  test('dump pixel sequence', () => {
    const dicomParser = new DicomParser();
    dicomParser.parse(b64urlToArrayBuffer(leadtoolsRle));
    const dump = dcmdump(dicomParser.getDicomElements());
    const lines = dump.split('\n');
    const pixelIndex = lines.findIndex(
      (line) => line.startsWith('(7fe0,0010)'));
    assert.ok(pixelIndex !== -1, 'pixel data line');
    assert.ok(
      lines[pixelIndex].includes('(PixelSequence #=1)'), 'pixel sequence');
    assert.ok(lines[pixelIndex].includes('# u/l, 1 PixelData'),
      'pixel sequence length');
    assert.ok(lines[pixelIndex + 1].startsWith('  (fffe,e000) pi 01\\00'),
      'pixel item');
    assert.ok(lines[pixelIndex + 1].endsWith('# 376776, 1 Item'),
      'pixel item length');
    assert.ok(lines[pixelIndex + 2].startsWith('(fffe,e0dd) na'),
      'pixel sequence delimitation');
  });

  /**
   * Tests that {@link dcmdump} does not modify its input.
   *
   * @function module:tests/dicom~dumpNoChange
   */
  test('dump does not change input', () => {
    const dicomParser = new DicomParser();
    dicomParser.parse(b64urlToArrayBuffer(dwvTestSequence));
    const elements = dicomParser.getDicomElements();
    const before = JSON.stringify(elements);
    dcmdump(elements);
    assert.equal(JSON.stringify(elements), before, 'unchanged input');

    const rleParser = new DicomParser();
    rleParser.parse(b64urlToArrayBuffer(leadtoolsRle));
    const rleElements = rleParser.getDicomElements();
    const fragment = rleElements['7FE00010'].value[0];
    dcmdump(rleElements);
    assert.ok(typeof fragment.vr === 'undefined', 'unchanged pixel item');
  });

});
