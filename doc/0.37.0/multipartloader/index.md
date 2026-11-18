---
title: MultipartLoader
kind: class
longname: MultipartLoader
description: Multipart data loader. Accumulates parsed parts from every load() call (one per URL) and hands them all to a single {@link MemoryLoader} once the last expected URL has arrived. This lets N multipart URLs – each containing M DICOM slices – be assembled correctly with numberOfItems = N × M .
---

# MultipartLoader

<SourceLink href="/source/src/io/multipartloader-js/#L15" label="multipartLoader.js:15" />

Multipart data loader.

Accumulates parsed parts from every `load()` call (one per URL) and hands them all to a single [MemoryLoader](/memoryloader) once the last expected URL has arrived. This lets N multipart URLs – each containing M DICOM slices – be assembled correctly with `numberOfItems = N × M`.

---

## Constructor

<Signature code="new MultipartLoader(): MultipartLoader" />

---

## Instance Methods

<MemberHeading id="load" depth="3" name="load" sig="load(buffer: object, origin: string, index: number)" />

<MemberMeta sourceHref="/source/src/io/multipartloader-js/#L46" sourceLabel="multipartLoader.js:46" />

Load data.

**Parameters**

- `buffer` (object) — The DICOM buffer.
- `origin` (string) — The data origin.
- `index` (number) — The data index.

<MemberHeading id="abort" depth="3" name="abort" sig="abort()" />

<MemberMeta sourceHref="/source/src/io/multipartloader-js/#L107" sourceLabel="multipartLoader.js:107" />

Abort load: pass to listeners.

<MemberHeading id="isloadername" depth="3" name="isLoaderName" sig="isLoaderName(value: string): boolean" />

<MemberMeta sourceHref="/source/src/io/multipartloader-js/#L122" sourceLabel="multipartLoader.js:122" />

Check if the input is the loader name.

**Parameters**

- `value` (string) — The test name.

**Returns**

- `boolean` — True if input is the loader name.

<MemberHeading id="canloadmediatype" depth="3" name="canLoadMediaType" sig="canLoadMediaType(value: string): boolean" />

<MemberMeta sourceHref="/source/src/io/multipartloader-js/#L132" sourceLabel="multipartLoader.js:132" />

Check if the loader supports the input media type.

**Parameters**

- `value` (string) — The media type.

**Returns**

- `boolean` — True if it can be loaded.

<MemberHeading id="loadfileas" depth="3" name="loadFileAs" sig="loadFileAs(): number" />

<MemberMeta sourceHref="/source/src/io/multipartloader-js/#L141" sourceLabel="multipartLoader.js:141" />

Get the file content type needed by the loader.

**Returns**

- `number` — One of the 'fileContentTypes'.

<MemberHeading id="loadurlas" depth="3" name="loadUrlAs" sig="loadUrlAs(): number" />

<MemberMeta sourceHref="/source/src/io/multipartloader-js/#L150" sourceLabel="multipartLoader.js:150" />

Get the url content type needed by the loader.

**Returns**

- `number` — One of the 'urlContentTypes'.
