---
title: DicomData
kind: class
longname: DicomData
description: "DICOM data: meta and possible image."
---

# DicomData

<SourceLink href="/source/src/app/datacontroller-js/#L87" label="dataController.js:87" />

DICOM data: meta and possible image.

---

## Constructor

<Signature code="new DicomData(meta: Record.<string, DataElement>): DicomData" />

**Parameters**

- `meta` (Record.\<string, [DataElement](/dataelement)>) — The DICOM meta data.

---

## Instance Methods

<MemberHeading id="getcomplete" depth="3" name="getComplete" sig="getComplete(): boolean | undefined" />

<MemberMeta sourceHref="/source/src/app/datacontroller-js/#L160" sourceLabel="dataController.js:160" />

Get the image complete flag (for image data).

**Returns**

- `boolean | undefined` — True if the image is complete.

<MemberHeading id="setcomplete" depth="3" name="setComplete" sig="setComplete(flag: boolean)" />

<MemberMeta sourceHref="/source/src/app/datacontroller-js/#L173" sourceLabel="dataController.js:173" />

Set the image complete flag (for image data).

**Parameters**

- `flag` (boolean) — True if the image is complete.

<MemberHeading id="hasduplicateorigin" depth="3" name="hasDuplicateOrigin" sig="hasDuplicateOrigin(): boolean" />

<MemberMeta sourceHref="/source/src/app/datacontroller-js/#L184" sourceLabel="dataController.js:184" />

Get the duplicate origin flag.

**Returns**

- `boolean` — The flag.

<MemberHeading id="appenddata" depth="3" name="appendData" sig="appendData(data: DicomData)" />

<MemberMeta sourceHref="/source/src/app/datacontroller-js/#L193" sourceLabel="dataController.js:193" />

Append data and update meta data.

**Parameters**

- `data` ([DicomData](/dicomdata)) — The data to append.

## Instance Fields

<MemberHeading id="meta" depth="3" name="meta" sig="meta: Record.<string, DataElement>" />

<MemberMeta sourceHref="/source/src/app/datacontroller-js/#L93" sourceLabel="dataController.js:93" />

DICOM meta data.

<MemberHeading id="image" depth="3" name="image" sig="image: Image | undefined" />

<MemberMeta sourceHref="/source/src/app/datacontroller-js/#L100" sourceLabel="dataController.js:100" />

Image extracted from meta data.

<MemberHeading id="annotationgroup" depth="3" name="annotationGroup" sig="annotationGroup: AnnotationGroup | undefined" />

<MemberMeta sourceHref="/source/src/app/datacontroller-js/#L106" sourceLabel="dataController.js:106" />

Annotation group extracted from meta data.

<MemberHeading id="buffer" depth="3" name="buffer" sig="buffer: any | undefined" />

<MemberMeta sourceHref="/source/src/app/datacontroller-js/#L113" sourceLabel="dataController.js:113" />

Image buffer used to build image.

<MemberHeading id="numberofitems" depth="3" name="numberOfItems" sig="numberOfItems: number" />

<MemberMeta sourceHref="/source/src/app/datacontroller-js/#L121" sourceLabel="dataController.js:121" />

Number of load items (files, urls, buffers...) associated to the data.

<MemberHeading id="framenumber" depth="3" name="frameNumber" sig="frameNumber: number | undefined" />

<MemberMeta sourceHref="/source/src/app/datacontroller-js/#L130" sourceLabel="dataController.js:130" />

Frame number, set when the buffer only contains one frame of a multi-frame data: frames are sent one by one and assembled by the image (see Image.appendSlice).

<MemberHeading id="warn" depth="3" name="warn" sig="warn: Array.<string>" />

<MemberMeta sourceHref="/source/src/app/datacontroller-js/#L137" sourceLabel="dataController.js:137" />

List of data creation warning.
