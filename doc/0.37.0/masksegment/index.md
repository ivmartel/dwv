---
title: MaskSegment
kind: class
longname: MaskSegment
description: "DICOM (mask) segment: item of a SegmentSequence (0062,0002). Ref: {@link https://dicom.nema.org/medical/dicom/2024a/output/chtml/part03/sect_C.8.20.4.html}."
---

# MaskSegment

<SourceLink href="/source/src/dicom/dicomsegment-js/#L43" label="dicomSegment.js:43" />

DICOM (mask) segment: item of a SegmentSequence (0062,0002).

Ref: [https://dicom.nema.org/medical/dicom/2024a/output/chtml/part03/sect\_C.8.20.4.html](https://dicom.nema.org/medical/dicom/2024a/output/chtml/part03/sect_C.8.20.4.html).

---

## Constructor

<Signature
  code="new MaskSegment(
	number: number,
	label: string,
	algorithmType: string,
): MaskSegment"
/>

**Parameters**

- `number` (number) — The segment number.
- `label` (string) — The segment label.
- `algorithmType` (string) — The segment number.

---

## Instance Fields

<MemberHeading id="number" depth="3" name="number" sig="number: number" />

<MemberMeta sourceHref="/source/src/dicom/dicomsegment-js/#L49" sourceLabel="dicomSegment.js:49" />

Segment number (0062,0004).

<MemberHeading id="label" depth="3" name="label" sig="label: string" />

<MemberMeta sourceHref="/source/src/dicom/dicomsegment-js/#L55" sourceLabel="dicomSegment.js:55" />

Segment label (0062,0005).

<MemberHeading id="algorithmtype" depth="3" name="algorithmType" sig="algorithmType: string" />

<MemberMeta sourceHref="/source/src/dicom/dicomsegment-js/#L61" sourceLabel="dicomSegment.js:61" />

Segment algorithm type (0062,0008).

<MemberHeading id="algorithmname" depth="3" name="algorithmName" sig="algorithmName: string | undefined" />

<MemberMeta sourceHref="/source/src/dicom/dicomsegment-js/#L67" sourceLabel="dicomSegment.js:67" />

Segment algorithm name (0062,0009).

<MemberHeading id="displayvalue" depth="3" name="displayValue" sig="displayValue: number | undefined" />

<MemberMeta sourceHref="/source/src/dicom/dicomsegment-js/#L73" sourceLabel="dicomSegment.js:73" />

Segment display value as simple value.

<MemberHeading id="displayrgbvalue" depth="3" name="displayRGBValue" sig="displayRGBValue: RGB | undefined" />

<MemberMeta sourceHref="/source/src/dicom/dicomsegment-js/#L79" sourceLabel="dicomSegment.js:79" />

Segment display value as RGB colour ({r,g,b}).

<MemberHeading id="propertytypecode" depth="3" name="propertyTypeCode" sig="propertyTypeCode: DicomCode | undefined" />

<MemberMeta sourceHref="/source/src/dicom/dicomsegment-js/#L86" sourceLabel="dicomSegment.js:86" />

Segment property code: specific property the segment represents (0062,000F).

<MemberHeading id="propertycategorycode" depth="3" name="propertyCategoryCode" sig="propertyCategoryCode: DicomCode | undefined" />

<MemberMeta sourceHref="/source/src/dicom/dicomsegment-js/#L93" sourceLabel="dicomSegment.js:93" />

Segment property category code: general category of the property the segment represents (0062,0003).

<MemberHeading id="trackinguid" depth="3" name="trackingUid" sig="trackingUid: string | undefined" />

<MemberMeta sourceHref="/source/src/dicom/dicomsegment-js/#L99" sourceLabel="dicomSegment.js:99" />

Segment tracking UID (0062,0021).

<MemberHeading id="trackingid" depth="3" name="trackingId" sig="trackingId: string | undefined" />

<MemberMeta sourceHref="/source/src/dicom/dicomsegment-js/#L105" sourceLabel="dicomSegment.js:105" />

Segment tracking id: text label for the UID (0062,0020).

<MemberHeading id="interpretedtype" depth="3" name="interpretedType" sig="interpretedType: string | undefined" />

<MemberMeta sourceHref="/source/src/dicom/dicomsegment-js/#L111" sourceLabel="dicomSegment.js:111" />

RT ROI interpreted type (3006,00A4), only used for RTSTRUCT segments.

<MemberHeading id="roiinterpreter" depth="3" name="roiInterpreter" sig="roiInterpreter: string | undefined" />

<MemberMeta sourceHref="/source/src/dicom/dicomsegment-js/#L117" sourceLabel="dicomSegment.js:117" />

RT ROI interpreter name (3006,00A6), only used for RTSTRUCT segments.
