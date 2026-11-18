---
title: ZipLoader
kind: class
longname: ZipLoader
description: ZIP data loader.
---

# ZipLoader

<SourceLink href="/source/src/io/ziploader-js/#L18" label="zipLoader.js:18" />

ZIP data loader.

---

## Constructor

<Signature code="new ZipLoader(): ZipLoader" />

---

## Instance Methods

<MemberHeading id="load" depth="3" name="load" sig="load(buffer: object, origin: string, index: number)" />

<MemberMeta sourceHref="/source/src/io/ziploader-js/#L109" sourceLabel="zipLoader.js:109" />

Load data.

**Parameters**

- `buffer` (object) — The DICOM buffer.
- `origin` (string) — The data origin.
- `index` (number) — The data index.

<MemberHeading id="abort" depth="3" name="abort" sig="abort()" />

<MemberMeta sourceHref="/source/src/io/ziploader-js/#L147" sourceLabel="zipLoader.js:147" />

Abort load: pass to listeners.

<MemberHeading id="canloadextension" depth="3" name="canLoadExtension" sig="canLoadExtension(value: string): boolean" />

<MemberMeta sourceHref="/source/src/io/ziploader-js/#L161" sourceLabel="zipLoader.js:161" />

Check if the loader supports the input extension.

**Parameters**

- `value` (string) — The extensione.

**Returns**

- `boolean` — True if it can be loaded.

<MemberHeading id="isloadername" depth="3" name="isLoaderName" sig="isLoaderName(value: string): boolean" />

<MemberMeta sourceHref="/source/src/io/ziploader-js/#L171" sourceLabel="zipLoader.js:171" />

Check if the input is the loader name.

**Parameters**

- `value` (string) — The test name.

**Returns**

- `boolean` — True if input is the loader name.

<MemberHeading id="canloadmediatype" depth="3" name="canLoadMediaType" sig="canLoadMediaType(value: string): boolean" />

<MemberMeta sourceHref="/source/src/io/ziploader-js/#L181" sourceLabel="zipLoader.js:181" />

Check if the loader supports the input media type.

**Parameters**

- `value` (string) — The media type.

**Returns**

- `boolean` — True if it can be loaded.

<MemberHeading id="loadfileas" depth="3" name="loadFileAs" sig="loadFileAs(): number" />

<MemberMeta sourceHref="/source/src/io/ziploader-js/#L190" sourceLabel="zipLoader.js:190" />

Get the file content type needed by the loader.

**Returns**

- `number` — One of the 'fileContentTypes'.

<MemberHeading id="loadurlas" depth="3" name="loadUrlAs" sig="loadUrlAs(): number" />

<MemberMeta sourceHref="/source/src/io/ziploader-js/#L199" sourceLabel="zipLoader.js:199" />

Get the url content type needed by the loader.

**Returns**

- `number` — One of the 'urlContentTypes'.
