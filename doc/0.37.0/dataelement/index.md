---
title: DataElement
kind: class
longname: DataElement
description: DICOM data element.
---

# DataElement

<SourceLink href="/source/src/dicom/dataelement-js/#L8" label="dataElement.js:8" />

DICOM data element.

---

## Constructor

<Signature code="new DataElement(vr: string): DataElement" />

**Parameters**

- `vr` (string) — The element VR (Value Representation).

---

## Instance Fields

<MemberHeading id="vr" depth="3" name="vr" sig="vr: string" />

<MemberMeta sourceHref="/source/src/dicom/dataelement-js/#L14" sourceLabel="dataElement.js:14" />

The element Value Representation.

<MemberHeading id="value" depth="3" name="value" sig="value: Array" />

<MemberMeta sourceHref="/source/src/dicom/dataelement-js/#L20" sourceLabel="dataElement.js:20" />

The element value.

<MemberHeading id="tag" depth="3" name="tag" sig="tag: Tag" />

<MemberMeta sourceHref="/source/src/dicom/dataelement-js/#L30" sourceLabel="dataElement.js:30" />

The element dicom tag.

<MemberHeading id="vl" depth="3" name="vl" sig="vl: number" />

<MemberMeta sourceHref="/source/src/dicom/dataelement-js/#L37" sourceLabel="dataElement.js:37" />

The element Value Length.

<MemberHeading id="undefinedlength" depth="3" name="undefinedLength" sig="undefinedLength: boolean" />

<MemberMeta sourceHref="/source/src/dicom/dataelement-js/#L44" sourceLabel="dataElement.js:44" />

Flag to know if defined or undefined sequence length.

<MemberHeading id="startoffset" depth="3" name="startOffset" sig="startOffset: number" />

<MemberMeta sourceHref="/source/src/dicom/dataelement-js/#L51" sourceLabel="dataElement.js:51" />

The element start offset.

<MemberHeading id="endoffset" depth="3" name="endOffset" sig="endOffset: number" />

<MemberMeta sourceHref="/source/src/dicom/dataelement-js/#L58" sourceLabel="dataElement.js:58" />

The element end offset.

<MemberHeading id="items" depth="3" name="items" sig="items: Array" />

<MemberMeta sourceHref="/source/src/dicom/dataelement-js/#L65" sourceLabel="dataElement.js:65" />

The sequence items.
