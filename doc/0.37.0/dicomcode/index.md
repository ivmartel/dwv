---
title: DicomCode
kind: class
longname: DicomCode
description: "DICOM code: item of a basic code sequence. Ref: {@link https://dicom.nema.org/medical/dicom/2024a/output/chtml/part03/sect_8.8.html}."
---

# DicomCode

<SourceLink href="/source/src/dicom/dicomcode-js/#L22" label="dicomCode.js:22" />

DICOM code: item of a basic code sequence.

Ref: [https://dicom.nema.org/medical/dicom/2024a/output/chtml/part03/sect\_8.8.html](https://dicom.nema.org/medical/dicom/2024a/output/chtml/part03/sect_8.8.html).

---

## Constructor

<Signature code="new DicomCode(meaning: string): DicomCode" />

**Parameters**

- `meaning` (string) — The code meaning.

---

## Instance Methods

<MemberHeading id="tostring" depth="3" name="toString" sig="toString(): string" />

<MemberMeta sourceHref="/source/src/dicom/dicomcode-js/#L66" sourceLabel="dicomCode.js:66" />

Get a string representation of this object.

**Returns**

- `string` — The code as string.

## Instance Fields

<MemberHeading id="meaning" depth="3" name="meaning" sig="meaning: string" />

<MemberMeta sourceHref="/source/src/dicom/dicomcode-js/#L28" sourceLabel="dicomCode.js:28" />

Code meaning.

<MemberHeading id="value" depth="3" name="value" sig="value: string | undefined" />

<MemberMeta sourceHref="/source/src/dicom/dicomcode-js/#L34" sourceLabel="dicomCode.js:34" />

Code value.

<MemberHeading id="longvalue" depth="3" name="longValue" sig="longValue: string | undefined" />

<MemberMeta sourceHref="/source/src/dicom/dicomcode-js/#L40" sourceLabel="dicomCode.js:40" />

Long code value.

<MemberHeading id="urnvalue" depth="3" name="urnValue" sig="urnValue: string | undefined" />

<MemberMeta sourceHref="/source/src/dicom/dicomcode-js/#L46" sourceLabel="dicomCode.js:46" />

URN code value.

<MemberHeading id="schemedesignator" depth="3" name="schemeDesignator" sig="schemeDesignator: string | undefined" />

<MemberMeta sourceHref="/source/src/dicom/dicomcode-js/#L52" sourceLabel="dicomCode.js:52" />

Coding scheme designator.
