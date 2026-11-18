---
title: RawVideoLoader
kind: class
longname: RawVideoLoader
description: "Raw video loader. Url example (cors enabled): {@link https://raw.githubusercontent.com/clappr/clappr/master/test/fixtures/SampleVideo_360x240_1mb.mp4}."
---

# RawVideoLoader

<SourceLink href="/source/src/io/rawvideoloader-js/#L12" label="rawVideoLoader.js:12" />

Raw video loader.

Url example (cors enabled): [https://raw.githubusercontent.com/clappr/clappr/master/test/fixtures/SampleVideo\_360x240\_1mb.mp4](https://raw.githubusercontent.com/clappr/clappr/master/test/fixtures/SampleVideo_360x240_1mb.mp4).

---

## Constructor

<Signature code="new RawVideoLoader(): RawVideoLoader" />

---

## Instance Methods

<MemberHeading id="load" depth="3" name="load" sig="load(buffer: object, origin: string, index: number)" />

<MemberMeta sourceHref="/source/src/io/rawvideoloader-js/#L41" sourceLabel="rawVideoLoader.js:41" />

Internal Data URI load.

**Parameters**

- `buffer` (object) — The read data.
- `origin` (string) — The data origin.
- `index` (number) — The data index.

<MemberHeading id="abort" depth="3" name="abort" sig="abort()" />

<MemberMeta sourceHref="/source/src/io/rawvideoloader-js/#L77" sourceLabel="rawVideoLoader.js:77" />

Abort load.

<MemberHeading id="canloadextension" depth="3" name="canLoadExtension" sig="canLoadExtension(value: string): boolean" />

<MemberMeta sourceHref="/source/src/io/rawvideoloader-js/#L89" sourceLabel="rawVideoLoader.js:89" />

Check if the loader supports the input extension.

**Parameters**

- `value` (string) — The extensione.

**Returns**

- `boolean` — True if it can be loaded.

<MemberHeading id="isloadername" depth="3" name="isLoaderName" sig="isLoaderName(value: string): boolean" />

<MemberMeta sourceHref="/source/src/io/rawvideoloader-js/#L101" sourceLabel="rawVideoLoader.js:101" />

Check if the input is the loader name.

**Parameters**

- `value` (string) — The test name.

**Returns**

- `boolean` — True if input is the loader name.

<MemberHeading id="canloadmediatype" depth="3" name="canLoadMediaType" sig="canLoadMediaType(value: string): boolean" />

<MemberMeta sourceHref="/source/src/io/rawvideoloader-js/#L111" sourceLabel="rawVideoLoader.js:111" />

Check if the loader supports the input media type.

**Parameters**

- `value` (string) — The media type.

**Returns**

- `boolean` — True if it can be loaded.

<MemberHeading id="loadfileas" depth="3" name="loadFileAs" sig="loadFileAs(): number" />

<MemberMeta sourceHref="/source/src/io/rawvideoloader-js/#L120" sourceLabel="rawVideoLoader.js:120" />

Get the file content type needed by the loader.

**Returns**

- `number` — One of the 'fileContentTypes'.

<MemberHeading id="loadurlas" depth="3" name="loadUrlAs" sig="loadUrlAs(): number" />

<MemberMeta sourceHref="/source/src/io/rawvideoloader-js/#L129" sourceLabel="rawVideoLoader.js:129" />

Get the url content type needed by the loader.

**Returns**

- `number` — One of the 'urlContentTypes'.
