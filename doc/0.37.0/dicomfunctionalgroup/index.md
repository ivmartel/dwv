---
title: DicomFunctionalGroup
kind: class
longname: DicomFunctionalGroup
description: "DICOM functional group: item of a SharedFunctionalGroupsSequence (5200,9229) or PerframeFunctionalGroupsSequence (5200,9230). Ref: {@link https://dicom.nema.org/medical/dicom/2024a/output/chtml/part03/sect_C.7.6.16.html}."
---

# DicomFunctionalGroup

<SourceLink href="/source/src/dicom/dicomfunctionalgroup-js/#L119" label="dicomFunctionalGroup.js:119" />

DICOM functional group: item of a SharedFunctionalGroupsSequence (5200,9229) or PerframeFunctionalGroupsSequence (5200,9230).

Ref: [https://dicom.nema.org/medical/dicom/2024a/output/chtml/part03/sect\_C.7.6.16.html](https://dicom.nema.org/medical/dicom/2024a/output/chtml/part03/sect_C.7.6.16.html).

---

## Constructor

<Signature
  code="new DicomFunctionalGroup(
	dimIndex: Array.<number>,
	imagePosPat: Array.<number>,
	derivationImages: Array,
	refSegmentNumber: number,
): DicomFunctionalGroup"
/>

**Parameters**

- `dimIndex` (Array.\<number>) — The dimension index.
- `imagePosPat` (Array.\<number>) — The frame image position patient.
- `derivationImages` (Array) — List of derivation images.
- `refSegmentNumber` (number) — The reference segment number.

---

## Instance Fields

<MemberHeading id="dimindex" depth="3" name="dimIndex" sig="dimIndex: Array.<number>" />

<MemberMeta sourceHref="/source/src/dicom/dicomfunctionalgroup-js/#L125" sourceLabel="dicomFunctionalGroup.js:125" />

The dimension index.

<MemberHeading id="imagepospat" depth="3" name="imagePosPat" sig="imagePosPat: Array.<number>" />

<MemberMeta sourceHref="/source/src/dicom/dicomfunctionalgroup-js/#L131" sourceLabel="dicomFunctionalGroup.js:131" />

The frame image position patient.

<MemberHeading id="derivationimages" depth="3" name="derivationImages" sig="derivationImages: Array" />

<MemberMeta sourceHref="/source/src/dicom/dicomfunctionalgroup-js/#L137" sourceLabel="dicomFunctionalGroup.js:137" />

List of derivation images.

<MemberHeading id="refsegmentnumber" depth="3" name="refSegmentNumber" sig="refSegmentNumber: number" />

<MemberMeta sourceHref="/source/src/dicom/dicomfunctionalgroup-js/#L143" sourceLabel="dicomFunctionalGroup.js:143" />

The reference segment number.

<MemberHeading id="imageorientationpatient" depth="3" name="imageOrientationPatient" sig="imageOrientationPatient: Array.<number> | undefined" />

<MemberMeta sourceHref="/source/src/dicom/dicomfunctionalgroup-js/#L150" sourceLabel="dicomFunctionalGroup.js:150" />

The frame image orientation.

<MemberHeading id="spacing" depth="3" name="spacing" sig="spacing: Spacing | undefined" />

<MemberMeta sourceHref="/source/src/dicom/dicomfunctionalgroup-js/#L156" sourceLabel="dicomFunctionalGroup.js:156" />

The frame spacing.
