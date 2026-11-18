---
title: RawImageLoader
kind: class
longname: RawImageLoader
description: Raw image loader.
---

# RawImageLoader

<SourceLink href="/source/src/io/rawimageloader-js/#L9" label="rawImageLoader.js:9" />

Raw image loader.

---

## Constructor

<Signature code="new RawImageLoader(): RawImageLoader" />

---

## Instance Methods

<MemberHeading
  id="load"
  depth="3"
  name="load"
  sig="load(
	buffer: ArrayBuffer | string,
	origin: string | File,
	index: number,
)"
/>

<MemberMeta sourceHref="/source/src/io/rawimageloader-js/#L36" sourceLabel="rawImageLoader.js:36" />

Load data.

**Parameters**

- `buffer` (ArrayBuffer | string) — The read data.
- `origin` (string | File) — The data origin.
- `index` (number) — The data index.

<MemberHeading id="abort" depth="3" name="abort" sig="abort()" />

<MemberMeta sourceHref="/source/src/io/rawimageloader-js/#L83" sourceLabel="rawImageLoader.js:83" />

Abort load.

<MemberHeading id="canloadextension" depth="3" name="canLoadExtension" sig="canLoadExtension(value: string): boolean" />

<MemberMeta sourceHref="/source/src/io/rawimageloader-js/#L95" sourceLabel="rawImageLoader.js:95" />

Check if the loader supports the input extension.

**Parameters**

- `value` (string) — The extensione.

**Returns**

- `boolean` — True if it can be loaded.

<MemberHeading id="isloadername" depth="3" name="isLoaderName" sig="isLoaderName(value: string): boolean" />

<MemberMeta sourceHref="/source/src/io/rawimageloader-js/#L108" sourceLabel="rawImageLoader.js:108" />

Check if the input is the loader name.

**Parameters**

- `value` (string) — The test name.

**Returns**

- `boolean` — True if input is the loader name.

<MemberHeading id="canloadmediatype" depth="3" name="canLoadMediaType" sig="canLoadMediaType(value: string): boolean" />

<MemberMeta sourceHref="/source/src/io/rawimageloader-js/#L118" sourceLabel="rawImageLoader.js:118" />

Check if the loader supports the input media type.

**Parameters**

- `value` (string) — The media type.

**Returns**

- `boolean` — True if it can be loaded.

<MemberHeading id="loadfileas" depth="3" name="loadFileAs" sig="loadFileAs(): number" />

<MemberMeta sourceHref="/source/src/io/rawimageloader-js/#L127" sourceLabel="rawImageLoader.js:127" />

Get the file content type needed by the loader.

**Returns**

- `number` — One of the 'fileContentTypes'.

<MemberHeading id="loadurlas" depth="3" name="loadUrlAs" sig="loadUrlAs(): number" />

<MemberMeta sourceHref="/source/src/io/rawimageloader-js/#L136" sourceLabel="rawImageLoader.js:136" />

Get the url content type needed by the loader.

**Returns**

- `number` — One of the 'urlContentTypes'.
