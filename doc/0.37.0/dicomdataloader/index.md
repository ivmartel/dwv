---
title: DicomDataLoader
kind: class
longname: DicomDataLoader
description: DICOM data loader.
---

# DicomDataLoader

<SourceLink href="/source/src/io/dicomdataloader-js/#L9" label="dicomDataLoader.js:9" />

DICOM data loader.

---

## Constructor

<Signature code="new DicomDataLoader(): DicomDataLoader" />

---

## Instance Methods

<MemberHeading id="load" depth="3" name="load" sig="load(buffer: object, origin: string, index: number)" />

<MemberMeta sourceHref="/source/src/io/dicomdataloader-js/#L24" sourceLabel="dicomDataLoader.js:24" />

Load data.

**Parameters**

- `buffer` (object) — The DICOM buffer.
- `origin` (string) — The data origin.
- `index` (number) — The data index.

<MemberHeading id="abort" depth="3" name="abort" sig="abort()" />

<MemberMeta sourceHref="/source/src/io/dicomdataloader-js/#L56" sourceLabel="dicomDataLoader.js:56" />

Abort load.

<MemberHeading id="canloadextension" depth="3" name="canLoadExtension" sig="canLoadExtension(value: string): boolean" />

<MemberMeta sourceHref="/source/src/io/dicomdataloader-js/#L69" sourceLabel="dicomDataLoader.js:69" />

Check if the loader supports the input extension.

**Parameters**

- `value` (string) — The extension.

**Returns**

- `boolean` — True if it can be loaded.

<MemberHeading id="isloadername" depth="3" name="isLoaderName" sig="isLoaderName(value: string): boolean" />

<MemberMeta sourceHref="/source/src/io/dicomdataloader-js/#L80" sourceLabel="dicomDataLoader.js:80" />

Check if the input is the loader name.

**Parameters**

- `value` (string) — The test name.

**Returns**

- `boolean` — True if input is the loader name.

<MemberHeading id="canloadmediatype" depth="3" name="canLoadMediaType" sig="canLoadMediaType(value: string): boolean" />

<MemberMeta sourceHref="/source/src/io/dicomdataloader-js/#L90" sourceLabel="dicomDataLoader.js:90" />

Check if the loader supports the input media type.

**Parameters**

- `value` (string) — The media type.

**Returns**

- `boolean` — True if it can be loaded.

<MemberHeading id="loadfileas" depth="3" name="loadFileAs" sig="loadFileAs(): number" />

<MemberMeta sourceHref="/source/src/io/dicomdataloader-js/#L99" sourceLabel="dicomDataLoader.js:99" />

Get the file content type needed by the loader.

**Returns**

- `number` — One of the 'fileContentTypes'.

<MemberHeading id="loadurlas" depth="3" name="loadUrlAs" sig="loadUrlAs(): number" />

<MemberMeta sourceHref="/source/src/io/dicomdataloader-js/#L108" sourceLabel="dicomDataLoader.js:108" />

Get the url content type needed by the loader.

**Returns**

- `number` — One of the 'urlContentTypes'.
