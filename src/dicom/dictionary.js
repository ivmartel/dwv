/* eslint-disable @stylistic/js/quote-props */
/* eslint @stylistic/js/max-len:0 */

import dictionaryData from
  'dcmstdtojs/dist/assets/2022a/dicom_tags.json' with {type: 'json'};

/**
 * DICOM tag dictionary 2022a.
 *
 * @type {Record<string, Record<string, string[]>>}
 */
export const dictionary = dictionaryData;

/**
 * Add tags to the dictionary.
 *
 * @param {string} group The group key.
 * @param {Record<string, string[]>} tags The tags to add as an
 *   object indexed by element key with values as:
 *   [VR, multiplicity, TagName] (all strings).
 */
export function addTagsToDictionary(group, tags) {
  // TODO: add checks!
  dictionary[group] = tags;
}

/**
 * Tag groups: key to name pairs.
 * Copied from gdcm-2.6.1\Source\DataDictionary\GroupName.dic
 * -> removed duplicates (commented).
 *
 * @type {Record<string, string>}
 */
export const tagGroups = {
  '0000': 'Command',
  '0002': 'Meta Element',
  '0004': 'File Set',
  //'0004': 'Directory',
  '0008': 'Identifying',
  '0009': 'SPI Identifying',
  '0010': 'Patient',
  '0012': 'Clinical Trial',
  '0018': 'Acquisition',
  '0019': 'SPI Acquisition',
  '0020': 'Image',
  '0021': 'SPI Image',
  '0022': 'Ophtalmology',
  '0028': 'Image Presentation',
  '0032': 'Study',
  '0038': 'Visit',
  '003A': 'Waveform',
  '0040': 'Procedure',
  //'0040': ''Modality Worklist',
  '0042': 'Encapsulated Document',
  '0050': 'Device Informations',
  //'0050': 'XRay Angio Device',
  '0054': 'Nuclear Medicine',
  '0060': 'Histogram',
  '0070': 'Presentation State',
  '0072': 'Hanging Protocol',
  '0088': 'Storage',
  //'0088': 'Medicine',
  '0100': 'Authorization',
  '0400': 'Digital Signature',
  '1000': 'Code Table',
  '1010': 'Zonal Map',
  '2000': 'Film Session',
  '2010': 'Film Box',
  '2020': 'Image Box',
  '2030': 'Annotation',
  '2040': 'Overlay Box',
  '2050': 'Presentation LUT',
  '2100': 'Print Job',
  '2110': 'Printer',
  '2120': 'Queue',
  '2130': 'Print Content',
  '2200': 'Media Creation',
  '3002': 'RT Image',
  '3004': 'RT Dose',
  '3006': 'RT StructureSet',
  '3008': 'RT Treatment',
  '300A': 'RT Plan',
  '300C': 'RT Relationship',
  '300E': 'RT Approval',
  '4000': 'Text',
  '4008': 'Results',
  '4FFE': 'MAC Parameters',
  '5000': 'Curve',
  '5002': 'Curve',
  '5004': 'Curve',
  '5006': 'Curve',
  '5008': 'Curve',
  '500A': 'Curve',
  '500C': 'Curve',
  '500E': 'Curve',
  '5400': 'Waveform Data',
  '6000': 'Overlays',
  '6002': 'Overlays',
  '6004': 'Overlays',
  '6008': 'Overlays',
  '600A': 'Overlays',
  '600C': 'Overlays',
  '600E': 'Overlays',
  'FFFC': 'Generic',
  '7FE0': 'Pixel Data',
  'FFFF': 'Unknown'
};

/**
 * List of Value Representation (VR) with 32bit Value Length (VL).
 *
 * Added locally used 'ox'.
 * See {@link http://dicom.nema.org/medical/dicom/2022a/output/chtml/part05/chapter_7.html#table_7.1-1}.
 *
 * @type {Record<string, boolean>}
 */
const vr32bitVL = {
  OB: true,
  OD: true,
  OF: true,
  OL: true,
  OV: true,
  OW: true,
  SQ: true,
  SV: true,
  UC: true,
  UN: true,
  UR: true,
  UT: true,
  UV: true,
  ox: true
};

/**
 * Does the input Value Representation (VR) have a 32bit Value Length (VL).
 *
 * @param {string} vr The data Value Representation (VR).
 * @returns {boolean} True if this VR has a 32-bit VL.
 */
export function is32bitVLVR(vr) {
  return typeof vr32bitVL[vr] !== 'undefined';
}

/**
 * List of string VR with extended or replaced default character repertoire defined in
 *   Specific Character Set (0008,0005).
 *
 * See {@link https://dicom.nema.org/medical/dicom/2022a/output/chtml/part05/chapter_6.html#sect_6.1.2.2}.
 *
 * @type {Record<string, boolean>}
 */
const vrCharSetString = {
  SH: true,
  LO: true,
  UC: true,
  ST: true,
  LT: true,
  UT: true,
  PN: true
};

/**
 * Does the input Value Representation (VR) have an special character repertoire.
 *
 * @param {string} vr The data VR.
 * @returns {boolean} True if this VR has a special char set.
 */
export function isCharSetStringVR(vr) {
  return typeof vrCharSetString[vr] !== 'undefined';
}

/**
 * VR equivalent javascript types.
 *
 * See {@link https://dicom.nema.org/medical/dicom/2022a/output/chtml/part05/sect_6.2.html#table_6.2-1}.
 *
 * @type {Record<string, string>}
 */
export const vrTypes = {
  AE: 'string',
  AS: 'string',
  AT: undefined,
  CS: 'string',
  DA: 'string',
  DS: 'string',
  DT: 'string',
  FL: 'Float32',
  FD: 'Float64',
  IS: 'string',
  LO: 'string',
  LT: 'string',
  OB: 'Uint8',
  OD: 'Uint64',
  OF: 'Uint32',
  OL: 'Uint32',
  OV: 'Uint64',
  OW: 'Uint16',
  PN: 'string',
  SH: 'string',
  SL: 'Int32',
  SQ: undefined,
  SS: 'Int16',
  ST: 'string',
  SV: 'Int64',
  TM: 'string',
  UC: 'string',
  UI: 'string',
  UL: 'Uint32',
  UN: 'Uint8',
  UR: 'string',
  US: 'Uint16',
  UT: 'string',
  UV: 'Uint64'
};

/**
 * Transfer syntaxes.
 *
 * See {@link https://dicom.nema.org/medical/dicom/2022a/output/chtml/part06/chapter_A.html#table_A-1}.
 *
 * @type {Record<string, string>}
 */
export const transferSyntaxes = {
  '1.2.840.10008.1.2': 'Implicit VR Little Endian',
  '1.2.840.10008.1.2.1': 'Explicit VR Little Endian',
  '1.2.840.10008.1.2.1.98': 'Encapsulated Uncompressed Explicit VR Little Endian',
  '1.2.840.10008.1.2.1.99': 'Deflated Explicit VR Little Endian',
  '1.2.840.10008.1.2.2': 'Explicit VR Big Endian (Retired)',
  '1.2.840.10008.1.2.4.50': 'JPEG Baseline (Process 1)',
  '1.2.840.10008.1.2.4.51': 'JPEG Extended (Process 2 & 4)',
  '1.2.840.10008.1.2.4.52': 'JPEG Extended (Process 3 & 5) (Retired)',
  '1.2.840.10008.1.2.4.53': 'JPEG Spectral Selection, Non-Hierarchical (Process 6 & 8) (Retired)',
  '1.2.840.10008.1.2.4.54': 'JPEG Spectral Selection, Non-Hierarchical (Process 7 & 9) (Retired)',
  '1.2.840.10008.1.2.4.55': 'JPEG Full Progression, Non-Hierarchical (Process 10 & 12) (Retired)',
  '1.2.840.10008.1.2.4.56': 'JPEG Full Progression, Non-Hierarchical (Process 11 & 13) (Retired)',
  '1.2.840.10008.1.2.4.57': 'JPEG Lossless, Non-Hierarchical (Process 14)',
  '1.2.840.10008.1.2.4.58': 'JPEG Lossless, Non-Hierarchical (Process 15) (Retired)',
  '1.2.840.10008.1.2.4.59': 'JPEG Extended, Hierarchical (Process 16 & 18) (Retired)',
  '1.2.840.10008.1.2.4.60': 'JPEG Extended, Hierarchical (Process 17 & 19) (Retired)',
  '1.2.840.10008.1.2.4.61': 'JPEG Spectral Selection, Hierarchical (Process 20 & 22) (Retired)',
  '1.2.840.10008.1.2.4.62': 'JPEG Spectral Selection, Hierarchical (Process 21 & 23) (Retired)',
  '1.2.840.10008.1.2.4.63': 'JPEG Full Progression, Hierarchical (Process 24 & 26) (Retired)',
  '1.2.840.10008.1.2.4.64': 'JPEG Full Progression, Hierarchical (Process 25 & 27) (Retired)',
  '1.2.840.10008.1.2.4.65': 'JPEG Lossless, Hierarchical (Process 28) (Retired)',
  '1.2.840.10008.1.2.4.66': 'JPEG Lossless, Hierarchical (Process 29) (Retired)',
  '1.2.840.10008.1.2.4.70': 'JPEG Lossless, Non-Hierarchical, First-Order Prediction (Process 14 [Selection Value 1])',
  '1.2.840.10008.1.2.4.80': 'JPEG-LS Lossless Image Compression',
  '1.2.840.10008.1.2.4.81': 'JPEG-LS Lossy (Near-Lossless) Image Compression',
  '1.2.840.10008.1.2.4.90': 'JPEG 2000 Image Compression (Lossless Only)',
  '1.2.840.10008.1.2.4.91': 'JPEG 2000 Image Compression',
  '1.2.840.10008.1.2.4.92': 'JPEG 2000 Part 2 Multi-component Image Compression (Lossless Only)',
  '1.2.840.10008.1.2.4.93': 'JPEG 2000 Part 2 Multi-component Image Compression',
  '1.2.840.10008.1.2.4.94': 'JPIP Referenced',
  '1.2.840.10008.1.2.4.95': 'JPIP Referenced Deflate',
  '1.2.840.10008.1.2.4.100': 'MPEG2 Main Profile / Main Level',
  '1.2.840.10008.1.2.4.101': 'MPEG2 Main Profile / High Level',
  '1.2.840.10008.1.2.4.102': 'MPEG-4 AVC/H.264 High Profile / Level 4.1',
  '1.2.840.10008.1.2.4.103': 'MPEG-4 AVC/H.264 BD-compatible High Profile / Level 4.1',
  '1.2.840.10008.1.2.4.104': 'MPEG-4 AVC/H.264 High Profile / Level 4.2 For 2D Video',
  '1.2.840.10008.1.2.4.105': 'MPEG-4 AVC/H.264 High Profile / Level 4.2 For 3D Video',
  '1.2.840.10008.1.2.4.106': 'MPEG-4 AVC/H.264 Stereo High Profile / Level 4.2',
  '1.2.840.10008.1.2.4.107': 'HEVC/H.265 Main Profile / Level 5.1',
  '1.2.840.10008.1.2.4.108': 'HEVC/H.265 Main 10 Profile / Level 5.1',
  '1.2.840.10008.1.2.5': 'RLE Lossless',
  '1.2.840.10008.1.2.6.1': 'RFC 2557 MIME encapsulation (Retired)',
  '1.2.840.10008.1.2.6.2': 'XML Encoding (Retired)',
  '1.2.840.10008.1.2.7.1': 'SMPTE ST 2110-20 Uncompressed Progressive Active Video',
  '1.2.840.10008.1.2.7.2': 'SMPTE ST 2110-20 Uncompressed Interlaced Active Video',
  '1.2.840.10008.1.2.7.3': 'SMPTE ST 2110-30 PCM Digital Audio',
  '1.2.840.10008.1.20': 'Papyrus 3 Implicit VR Little Endian (Retired)'
};

/**
 * Transfer syntaxes indexed by keyword.
 *
 * @type {Record<string, string>}
 */
export const transferSyntaxKeywords = {
  ImplicitVRLittleEndian: '1.2.840.10008.1.2',
  ExplicitVRLittleEndian: '1.2.840.10008.1.2.1',
  EncapsulatedUncompressedExplicitVRLittleEndian: '1.2.840.10008.1.2.1.98',
  DeflatedExplicitVRLittleEndian: '1.2.840.10008.1.2.1.99',
  ExplicitVRBigEndian: '1.2.840.10008.1.2.2',
  JPEGBaseline8Bit: '1.2.840.10008.1.2.4.50',
  JPEGExtended12Bit: '1.2.840.10008.1.2.4.51',
  JPEGExtended35: '1.2.840.10008.1.2.4.52',
  JPEGSpectralSelectionNonHierarchical68: '1.2.840.10008.1.2.4.53',
  JPEGSpectralSelectionNonHierarchical79: '1.2.840.10008.1.2.4.54',
  JPEGFullProgressionNonHierarchical1012: '1.2.840.10008.1.2.4.55',
  JPEGFullProgressionNonHierarchical1113: '1.2.840.10008.1.2.4.56',
  JPEGLossless: '1.2.840.10008.1.2.4.57',
  JPEGLosslessNonHierarchical15: '1.2.840.10008.1.2.4.58',
  JPEGExtendedHierarchical1618: '1.2.840.10008.1.2.4.59',
  JPEGExtendedHierarchical1719: '1.2.840.10008.1.2.4.60',
  JPEGSpectralSelectionHierarchical2022: '1.2.840.10008.1.2.4.61',
  JPEGSpectralSelectionHierarchical2123: '1.2.840.10008.1.2.4.62',
  JPEGFullProgressionHierarchical2426: '1.2.840.10008.1.2.4.63',
  JPEGFullProgressionHierarchical2527: '1.2.840.10008.1.2.4.64',
  JPEGLosslessHierarchical28: '1.2.840.10008.1.2.4.65',
  JPEGLosslessHierarchical29: '1.2.840.10008.1.2.4.66',
  JPEGLosslessSV1: '1.2.840.10008.1.2.4.70',
  JPEGLSLossless: '1.2.840.10008.1.2.4.80',
  JPEGLSNearLossless: '1.2.840.10008.1.2.4.81',
  JPEG2000Lossless: '1.2.840.10008.1.2.4.90',
  JPEG2000: '1.2.840.10008.1.2.4.91',
  JPEG2000MCLossless: '1.2.840.10008.1.2.4.92',
  JPEG2000MC: '1.2.840.10008.1.2.4.93',
  JPIPReferenced: '1.2.840.10008.1.2.4.94',
  JPIPReferencedDeflate: '1.2.840.10008.1.2.4.95',
  MPEG2MPML: '1.2.840.10008.1.2.4.100',
  MPEG2MPHL: '1.2.840.10008.1.2.4.101',
  MPEG4HP41: '1.2.840.10008.1.2.4.102',
  MPEG4HP41BD: '1.2.840.10008.1.2.4.103',
  MPEG4HP422D: '1.2.840.10008.1.2.4.104',
  MPEG4HP423D: '1.2.840.10008.1.2.4.105',
  MPEG4HP42STEREO: '1.2.840.10008.1.2.4.106',
  HEVCMP51: '1.2.840.10008.1.2.4.107',
  HEVCM10P51: '1.2.840.10008.1.2.4.108',
  RLELossless: '1.2.840.10008.1.2.5',
  RFC2557MIMEEncapsulation: '1.2.840.10008.1.2.6.1',
  XMLEncoding: '1.2.840.10008.1.2.6.2',
  SMPTEST211020UncompressedProgressiveActiveVideo: '1.2.840.10008.1.2.7.1',
  SMPTEST211020UncompressedInterlacedActiveVideo: '1.2.840.10008.1.2.7.2',
  SMPTEST211030PCMDigitalAudio: '1.2.840.10008.1.2.7.3',
  Papyrus3ImplicitVRLittleEndian: '1.2.840.10008.1.20'
};

/**
 * Standard SOP Class UIDs indexed by keyword. Not comprehensive, just ones needed by DWV.
 *
 * See {@link https://dicom.nema.org/dicom/2013/output/chtml/part04/sect_B.5.html#table_B.5-1}.
 *
 * @type {Record<string, string>}
 */
export const SOPClassUIDs = {
  SecondaryCapture: '1.2.840.10008.5.1.4.1.1.7'
};