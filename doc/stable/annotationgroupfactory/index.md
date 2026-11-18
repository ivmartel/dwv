---
title: AnnotationGroupFactory
kind: class
longname: AnnotationGroupFactory
description: "{@link AnnotationGroup} factory."
---

# AnnotationGroupFactory

<SourceLink href="/source/src/image/annotationgroupfactory-js/#L117" label="annotationGroupFactory.js:117" />

[AnnotationGroup](/annotationgroup) factory.

---

## Constructor

<Signature code="new AnnotationGroupFactory(): AnnotationGroupFactory" />

---

## Instance Methods

<MemberHeading id="getwarning" depth="3" name="getWarning" sig="getWarning(): string | undefined" />

<MemberMeta sourceHref="/source/src/image/annotationgroupfactory-js/#L140" sourceLabel="annotationGroupFactory.js:140" />

Get a warning string if elements are not as expected. Created by checkElements.

**Returns**

- `string | undefined` — The warning.

<MemberHeading
  id="checkelements"
  depth="3"
  name="checkElements"
  sig="checkElements(
	dataElements: Record.<string, DataElement>,
): string | undefined"
/>

<MemberMeta sourceHref="/source/src/image/annotationgroupfactory-js/#L263" sourceLabel="annotationGroupFactory.js:263" />

Check dicom elements.

**Parameters**

- `dataElements` (Record.\<string, [DataElement](/dataelement)>) — The DICOM data elements.

**Returns**

- `string | undefined` — A possible warning.

<MemberHeading
  id="create"
  depth="3"
  name="create"
  sig="create(
	dataElements: Record.<string, DataElement>,
): AnnotationGroup"
/>

<MemberMeta sourceHref="/source/src/image/annotationgroupfactory-js/#L1105" sourceLabel="annotationGroupFactory.js:1105" />

Get an [AnnotationGroup](/annotationgroup) object from the read DICOM file.

**Parameters**

- `dataElements` (Record.\<string, [DataElement](/dataelement)>) — The DICOM tags.

**Returns**

- [`AnnotationGroup`](/annotationgroup) — A new annotation group.

**Throws**

- `Error` — Error for missing or wrong data.

<MemberHeading
  id="createcadreport"
  depth="3"
  name="createCADReport"
  sig="createCADReport(
	dataElements: Record.<string, DataElement>,
): CADReport | undefined"
/>

<MemberMeta sourceHref="/source/src/image/annotationgroupfactory-js/#L1149" sourceLabel="annotationGroupFactory.js:1149" />

Get an [CADReport](/cadreport) object from the read DICOM file.

**Parameters**

- `dataElements` (Record.\<string, [DataElement](/dataelement)>) — The DICOM tags.

**Returns**

- [`CADReport`](/cadreport)` | undefined` — A new CAD report.

<MemberHeading
  id="todicom"
  depth="3"
  name="toDicom"
  sig="toDicom(
	annotationGroup: AnnotationGroup,
	extraTags?: SimpleTagValues,
): Record.<string, DataElement>"
/>

<MemberMeta sourceHref="/source/src/image/annotationgroupfactory-js/#L1435" sourceLabel="annotationGroupFactory.js:1435" />

Convert an annotation group into a DICOM SR object using the TID 1500 template.

**Parameters**

- `annotationGroup` ([AnnotationGroup](/annotationgroup)) — The annotation group.
- `extraTags` ([SimpleTagValues](/simpletagvalues), optional) — Optional list of extra tags.

**Returns**

- `Record.<string, `[`DataElement`](/dataelement)`>` — A list of dicom elements.

<MemberHeading
  id="todicomcadreport"
  depth="3"
  name="toDicomCADReport"
  sig="toDicomCADReport(
	report: CADReport,
	extraTags?: SimpleTagValues,
): Record.<string, DataElement>"
/>

<MemberMeta sourceHref="/source/src/image/annotationgroupfactory-js/#L1691" sourceLabel="annotationGroupFactory.js:1691" />

Convert a CAD report into a DICOM CAD report SR object using the TID 4100 template.

**Parameters**

- `report` ([CADReport](/cadreport)) — The CAD report.
- `extraTags` ([SimpleTagValues](/simpletagvalues), optional) — Optional list of extra tags.

**Returns**

- `Record.<string, `[`DataElement`](/dataelement)`>` — A list of dicom elements.
