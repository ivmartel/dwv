---
title: InfoData
kind: class
longname: InfoData
description: DICOM Header info data.
---

# InfoData

<SourceLink href="/source/src/gui/infodata-js/#L102" label="infoData.js:102" />

DICOM Header info data.

---

## Constructor

<Signature
  code="new InfoData(
	app: App,
	dataId: string,
	configs: Record.<string, Array.<InfoDataItem>>,
): InfoData"
/>

**Parameters**

- `app` ([App](/app)) — The associated application.
- `dataId` (string) — The associated data id.
- `configs` (Record.\<string, Array.\<[InfoDataItem](/infodataitem)>>) — The info data config.

---

## Instance Methods

<MemberHeading id="reset" depth="3" name="reset" sig="reset()" />

<MemberMeta sourceHref="/source/src/gui/infodata-js/#L184" sourceLabel="infoData.js:184" />

Reset the data.

<MemberHeading id="additemmeta" depth="3" name="addItemMeta" sig="addItemMeta(data: Record.<string, DataElement>)" />

<MemberMeta sourceHref="/source/src/gui/infodata-js/#L194" sourceLabel="infoData.js:194" />

Handle a new loaded item event.

**Parameters**

- `data` (Record.\<string, [DataElement](/dataelement)>) — The item meta data.

<MemberHeading id="islistening" depth="3" name="isListening" sig="isListening(): boolean" />

<MemberMeta sourceHref="/source/src/gui/infodata-js/#L329" sourceLabel="infoData.js:329" />

Is this class listening to app events.

**Returns**

- `boolean` — True is listening to app events.

<MemberHeading id="addapplisteners" depth="3" name="addAppListeners" sig="addAppListeners()" />

<MemberMeta sourceHref="/source/src/gui/infodata-js/#L336" sourceLabel="infoData.js:336" />

Toggle info listeners.

<MemberHeading id="removeapplisteners" depth="3" name="removeAppListeners" sig="removeAppListeners()" />

<MemberMeta sourceHref="/source/src/gui/infodata-js/#L353" sourceLabel="infoData.js:353" />

Toggle info listeners.

## Instance Fields

<MemberHeading id="onslicechange" depth="3" name="onSliceChange" sig="onSliceChange" />

<MemberMeta badges="deprecated" sourceHref="/source/src/gui/infodata-js/#L228" sourceLabel="infoData.js:228" />

Handle a changed slice event.

<Callout type="error">
  &#x20;Since v0.37, please use onPositionChange.
</Callout>

**Parameters**

- `event` (CustomEvent) — The slicechange event.

<MemberHeading id="onpositionchange" depth="3" name="onPositionChange" sig="onPositionChange" />

<MemberMeta sourceHref="/source/src/gui/infodata-js/#L242" sourceLabel="infoData.js:242" />

Handle a changed position event: updates the tags on slice change and the position event items.

**Parameters**

- `event` (CustomEvent) — The positionchange event.

## Events

<MemberHeading id="valuechange" depth="3" name="valuechange" sig="valuechange: CustomEvent" />

<MemberMeta badges="event" sourceHref="/source/src/gui/infodata-js/#L319" sourceLabel="infoData.js:319" />

Value change event.

**Properties**

- `detail` (object) — The event detail.
  - `detail.data` (Array.\<[InfoDataItem](/infodataitem)>) — The value of the info data.
