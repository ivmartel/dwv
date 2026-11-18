---
title: DataController
kind: class
longname: DataController
description: DicomData controller.
---

# DataController

<SourceLink href="/source/src/app/datacontroller-js/#L483" label="dataController.js:483" />

DicomData controller.

---

## Constructor

<Signature code="new DataController(): DataController" />

---

## Instance Methods

<MemberHeading id="getnextdataid" depth="3" name="getNextDataId" sig="getNextDataId(): string" />

<MemberMeta sourceHref="/source/src/app/datacontroller-js/#L519" sourceLabel="dataController.js:519" />

Get the next data id.

**Returns**

- `string` — The data id.

<MemberHeading id="getdataids" depth="3" name="getDataIds" sig="getDataIds(): Array.<string>" />

<MemberMeta sourceHref="/source/src/app/datacontroller-js/#L529" sourceLabel="dataController.js:529" />

Get the list of ids in the data storage.

**Returns**

- `Array.<string>` — The list of data ids.

<MemberHeading id="reset" depth="3" name="reset" sig="reset()" />

<MemberMeta sourceHref="/source/src/app/datacontroller-js/#L536" sourceLabel="dataController.js:536" />

Reset the class: empty the data storage.

<MemberHeading id="get" depth="3" name="get" sig="get(dataId: string): DicomData | undefined" />

<MemberMeta sourceHref="/source/src/app/datacontroller-js/#L548" sourceLabel="dataController.js:548" />

Get a data at a given index.

**Parameters**

- `dataId` (string) — The data id.

**Returns**

- [`DicomData`](/dicomdata)` | undefined` — The DICOM data.

<MemberHeading id="getdataidsfromsopuids" depth="3" name="getDataIdsFromSopUids" sig="getDataIdsFromSopUids(uids: Array.<string>): Array.<string>" />

<MemberMeta sourceHref="/source/src/app/datacontroller-js/#L558" sourceLabel="dataController.js:558" />

Get the list of dataIds that contain the input UIDs.

**Parameters**

- `uids` (Array.\<string>) — A list of UIDs.

**Returns**

- `Array.<string>` — The list of dataIds that contain the UIDs.

<MemberHeading id="getdataidfromseriesuid" depth="3" name="getDataIdFromSeriesUid" sig="getDataIdFromSeriesUid(uid: string): string" />

<MemberMeta sourceHref="/source/src/app/datacontroller-js/#L581" sourceLabel="dataController.js:581" />

Get the first data id with the given SeriesInstanceUID.

**Parameters**

- `uid` (string) — The SeriesInstanceUID.

**Returns**

- `string` — The data id.

<MemberHeading id="setimage" depth="3" name="setImage" sig="setImage(dataId: string, image: Image)" />

<MemberMeta sourceHref="/source/src/app/datacontroller-js/#L603" sourceLabel="dataController.js:603" />

Set the image at a given index.

**Parameters**

- `dataId` (string) — The data id.
- `image` ([Image](/image)) — The image to set.

<MemberHeading id="add" depth="3" name="add" sig="add(dataId: string, data: DicomData): boolean" />

<MemberMeta sourceHref="/source/src/app/datacontroller-js/#L709" sourceLabel="dataController.js:709" />

Add a new data.

**Parameters**

- `dataId` (string) — The data id.
- `data` ([DicomData](/dicomdata)) — The data.

**Returns**

- `boolean` — False if the data cannot be added.

<MemberHeading id="remove" depth="3" name="remove" sig="remove(dataId: string)" />

<MemberMeta sourceHref="/source/src/app/datacontroller-js/#L768" sourceLabel="dataController.js:768" />

Remove a data from the list.

**Parameters**

- `dataId` (string) — The data id.

<MemberHeading id="stash" depth="3" name="stash" sig="stash(dataId: string)" />

<MemberMeta sourceHref="/source/src/app/datacontroller-js/#L807" sourceLabel="dataController.js:807" />

Stash a data from the list.

**Parameters**

- `dataId` (string) — The data id.

<MemberHeading id="unstash" depth="3" name="unstash" sig="unstash(dataId: string)" />

<MemberMeta sourceHref="/source/src/app/datacontroller-js/#L819" sourceLabel="dataController.js:819" />

Unstash a data from the list.

**Parameters**

- `dataId` (string) — The data id.

<MemberHeading id="getstasheddataids" depth="3" name="getStashedDataIds" sig="getStashedDataIds(): Array.<string>" />

<MemberMeta sourceHref="/source/src/app/datacontroller-js/#L831" sourceLabel="dataController.js:831" />

Get the list of ids in the stashed data storage.

**Returns**

- `Array.<string>` — The list of data ids.

<MemberHeading id="getstashed" depth="3" name="getStashed" sig="getStashed(dataId: string): DicomData | undefined" />

<MemberMeta sourceHref="/source/src/app/datacontroller-js/#L841" sourceLabel="dataController.js:841" />

Get a stashed data at a given index.

**Parameters**

- `dataId` (string) — The data id.

**Returns**

- [`DicomData`](/dicomdata)` | undefined` — The DICOM data.

<MemberHeading id="update" depth="3" name="update" sig="update(dataId: string, data: DicomData)" />

<MemberMeta sourceHref="/source/src/app/datacontroller-js/#L851" sourceLabel="dataController.js:851" />

Update the current data.

**Parameters**

- `dataId` (string) — The data id.
- `data` ([DicomData](/dicomdata)) — The data.

<MemberHeading id="markdataascomplete" depth="3" name="markDataAsComplete" sig="markDataAsComplete(dataId: string): Object" />

<MemberMeta sourceHref="/source/src/app/datacontroller-js/#L891" sourceLabel="dataController.js:891" />

Mark a data a complete (fully loaded).

**Parameters**

- `dataId` (string) — The data id.

**Returns**

- `Object` — An object with an imageHasChanged property.

## Events

<MemberHeading id="dataimageset" depth="3" name="dataimageset" sig="dataimageset: CustomEvent" />

<MemberMeta badges="event" sourceHref="/source/src/app/datacontroller-js/#L621" sourceLabel="dataController.js:621" />

Data image set event.

**Properties**

- `detail` (object) — The event detail.
  - `detail.value` (Array) — The event value, first element is the image.
  - `detail.dataid` (string) — The data id.

<MemberHeading id="dataadd" depth="3" name="dataadd" sig="dataadd: CustomEvent" />

<MemberMeta badges="event" sourceHref="/source/src/app/datacontroller-js/#L756" sourceLabel="dataController.js:756" />

Data add event.

**Properties**

- `detail` (object) — The event detail.
  - `detail.dataid` (string) — The data id.

<MemberHeading id="dataremove" depth="3" name="dataremove" sig="dataremove: CustomEvent" />

<MemberMeta badges="event" sourceHref="/source/src/app/datacontroller-js/#L796" sourceLabel="dataController.js:796" />

Data remove event.

**Properties**

- `detail` (object) — The event detail.
  - `detail.dataid` (string) — The data id.

<MemberHeading id="dataupdate" depth="3" name="dataupdate" sig="dataupdate: CustomEvent" />

<MemberMeta badges="event" sourceHref="/source/src/app/datacontroller-js/#L880" sourceLabel="dataController.js:880" />

Data update event.

**Properties**

- `detail` (object) — The event detail.
  - `detail.dataid` (string) — The data id.
