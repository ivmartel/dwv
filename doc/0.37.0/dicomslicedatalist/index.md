---
title: DicomSliceDataList
kind: class
longname: DicomSliceDataList
description: DICOM slice data list.
---

# DicomSliceDataList

<SourceLink href="/source/src/app/datacontroller-js/#L257" label="dataController.js:257" />

DICOM slice data list.

---

## Constructor

<Signature code="new DicomSliceDataList(): DicomSliceDataList" />

---

## Instance Methods

<MemberHeading id="addclone" depth="3" name="addClone" sig="addClone(data: DicomData)" />

<MemberMeta sourceHref="/source/src/app/datacontroller-js/#L271" sourceLabel="dataController.js:271" />

Add a clone of the input data to the local list. The pixel data is not cloned: the image is already created and the meta of frames includes the pixel data of the full file.

**Parameters**

- `data` ([DicomData](/dicomdata)) — The data to clone and add.

<MemberHeading id="add" depth="3" name="add" sig="add(data: DicomData)" />

<MemberMeta sourceHref="/source/src/app/datacontroller-js/#L291" sourceLabel="dataController.js:291" />

Add data to the local list.

**Parameters**

- `data` ([DicomData](/dicomdata)) — The data to add.

<MemberHeading id="getelementslist" depth="3" name="getElementsList" sig="getElementsList(): Array.<Record.<string, DataElement>>" />

<MemberMeta sourceHref="/source/src/app/datacontroller-js/#L302" sourceLabel="dataController.js:302" />

Get the DICOM tags of each stored data. Frames share their file meta: the frame tags are used so that per-frame getters return the frame value.

**Returns**

- `Array.<Record.<string, `[`DataElement`](/dataelement)`>>` — The DICOM tags.

<MemberHeading id="builddata" depth="3" name="buildData" sig="buildData(): Object" />

<MemberMeta sourceHref="/source/src/app/datacontroller-js/#L315" sourceLabel="dataController.js:315" />

Build a data from the stored slice data. The items can be single frame files or frames of multi-frame files.

**Returns**

- `Object` — The result data.
