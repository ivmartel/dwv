---
title: DicomBufferToData
kind: class
longname: DicomBufferToData
description: "Create a DicomData from a DICOM buffer: parses it, stores the meta data and the image buffer if pixel data is present. Buffer is decoded if needed, only necessary tags for decompression are checked."
---

# DicomBufferToData

<SourceLink href="/source/src/image/dicombuffertodata-js/#L37" label="dicomBufferToData.js:37" />

Create a DicomData from a DICOM buffer: parses it, stores the meta data and the image buffer if pixel data is present. Buffer is decoded if needed, only necessary tags for decompression are checked.

---

## Constructor

<Signature code="new DicomBufferToData(): DicomBufferToData" />

---

## Instance Methods

<MemberHeading id="setoptions" depth="3" name="setOptions" sig="setOptions(opt: object)" />

<MemberMeta sourceHref="/source/src/image/dicombuffertodata-js/#L51" sourceLabel="dicomBufferToData.js:51" />

Set the converter options.

**Parameters**

- `opt` (object) — The input options.

<MemberHeading id="convert" depth="3" name="convert" sig="convert(buffer: TypedArray, origin: string, dataIndex: number)" />

<MemberMeta sourceHref="/source/src/image/dicombuffertodata-js/#L377" sourceLabel="dicomBufferToData.js:377" />

Convert an input buffer into DicomData using a DICOM parser. Asynchronous method in case of possible buffer decompression. Get the data from the 'onload' event.

**Parameters**

- `buffer` ([TypedArray](/typedarray)) — The input data buffer.
- `origin` (string) — The data origin.
- `dataIndex` (number) — The data index.

<MemberHeading id="abort" depth="3" name="abort" sig="abort()" />

<MemberMeta sourceHref="/source/src/image/dicombuffertodata-js/#L459" sourceLabel="dicomBufferToData.js:459" />

Abort a conversion.

<MemberHeading id="onloadstart" depth="3" name="onloadstart" sig="onloadstart(_event: object)" />

<MemberMeta sourceHref="/source/src/image/dicombuffertodata-js/#L475" sourceLabel="dicomBufferToData.js:475" />

Handle a load start event. Default does nothing.

**Parameters**

- `_event` (object) — The load start event.

<MemberHeading id="onloaditem" depth="3" name="onloaditem" sig="onloaditem(_event: object)" />

<MemberMeta sourceHref="/source/src/image/dicombuffertodata-js/#L483" sourceLabel="dicomBufferToData.js:483" />

Handle a load item event. Default does nothing.

**Parameters**

- `_event` (object) — The load item event.

<MemberHeading id="onprogress" depth="3" name="onprogress" sig="onprogress(_event: object)" />

<MemberMeta sourceHref="/source/src/image/dicombuffertodata-js/#L491" sourceLabel="dicomBufferToData.js:491" />

Handle a load progress event. Default does nothing.

**Parameters**

- `_event` (object) — The progress event.

<MemberHeading id="onload" depth="3" name="onload" sig="onload(_event: object)" />

<MemberMeta sourceHref="/source/src/image/dicombuffertodata-js/#L500" sourceLabel="dicomBufferToData.js:500" />

Handle a load event. Default does nothing.

**Parameters**

- `_event` (object) — The load event fired when a file has been loaded successfully.

<MemberHeading id="onloadend" depth="3" name="onloadend" sig="onloadend(_event: object)" />

<MemberMeta sourceHref="/source/src/image/dicombuffertodata-js/#L508" sourceLabel="dicomBufferToData.js:508" />

Handle a load end event. Default does nothing.

**Parameters**

- `_event` (object) — The load end event fired when a file load has completed, successfully or not.

<MemberHeading id="onerror" depth="3" name="onerror" sig="onerror(_event: object)" />

<MemberMeta sourceHref="/source/src/image/dicombuffertodata-js/#L516" sourceLabel="dicomBufferToData.js:516" />

Handle an error event. Default does nothing.

**Parameters**

- `_event` (object) — The error event.

<MemberHeading id="onabort" depth="3" name="onabort" sig="onabort(_event: object)" />

<MemberMeta sourceHref="/source/src/image/dicombuffertodata-js/#L524" sourceLabel="dicomBufferToData.js:524" />

Handle an abort event. Default does nothing.

**Parameters**

- `_event` (object) — The abort event.
