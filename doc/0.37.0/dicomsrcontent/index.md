---
title: DicomSRContent
kind: class
longname: DicomSRContent
description: "DICOM SR content: item of a SR content sequence. Ref: {@link https://dicom.nema.org/medical/dicom/2024a/output/chtml/part03/sect_C.17.3.html}."
---

# DicomSRContent

<SourceLink href="/source/src/dicom/dicomsrcontent-js/#L150" label="dicomSRContent.js:150" />

DICOM SR content: item of a SR content sequence.

Ref: [https://dicom.nema.org/medical/dicom/2024a/output/chtml/part03/sect\_C.17.3.html](https://dicom.nema.org/medical/dicom/2024a/output/chtml/part03/sect_C.17.3.html).

---

## Constructor

<Signature code="new DicomSRContent(valueType: string): DicomSRContent" />

**Parameters**

- `valueType` (string) — The content item value type.

---

## Instance Methods

<MemberHeading id="tostring" depth="3" name="toString" sig="toString(prefix?: string): string" />

<MemberMeta sourceHref="/source/src/dicom/dicomsrcontent-js/#L197" sourceLabel="dicomSRContent.js:197" />

Get a string representation of this object.

**Parameters**

- `prefix` (string, optional) — An optional prefix for recursive content.

**Returns**

- `string` — The object as string.

<MemberHeading
  id="hasheader"
  depth="3"
  name="hasHeader"
  sig="hasHeader(
	valueType: string,
	conceptNameCode: DicomCode,
	relationshipType: string,
): boolean"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomsrcontent-js/#L231" sourceLabel="dicomSRContent.js:231" />

Check if this content has input header values.

**Parameters**

- `valueType` (string) — The value type.
- `conceptNameCode` ([DicomCode](/dicomcode)) — The concept name code.
- `relationshipType` (string) — The relationship type.

**Returns**

- `boolean` — True if equal.

## Instance Fields

<MemberHeading id="valuetype" depth="3" name="valueType" sig="valueType: string" />

<MemberMeta sourceHref="/source/src/dicom/dicomsrcontent-js/#L156" sourceLabel="dicomSRContent.js:156" />

Value type.

<MemberHeading id="conceptnamecode" depth="3" name="conceptNameCode" sig="conceptNameCode: DicomCode | undefined" />

<MemberMeta sourceHref="/source/src/dicom/dicomsrcontent-js/#L162" sourceLabel="dicomSRContent.js:162" />

Concept name code.

<MemberHeading id="relationshiptype" depth="3" name="relationshipType" sig="relationshipType: string" />

<MemberMeta sourceHref="/source/src/dicom/dicomsrcontent-js/#L168" sourceLabel="dicomSRContent.js:168" />

Relationship Type.

<MemberHeading id="contentsequence" depth="3" name="contentSequence" sig="contentSequence: Array.<DicomSRContent>" />

<MemberMeta sourceHref="/source/src/dicom/dicomsrcontent-js/#L175" sourceLabel="dicomSRContent.js:175" />

Content sequence.

<MemberHeading id="value" depth="3" name="value" sig="value: object" />

<MemberMeta sourceHref="/source/src/dicom/dicomsrcontent-js/#L182" sourceLabel="dicomSRContent.js:182" />

Value.
