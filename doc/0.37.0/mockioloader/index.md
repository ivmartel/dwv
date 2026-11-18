---
title: MockIoLoader
kind: class
longname: MockIoLoader
description: Shared test double for loaders selected by IO orchestrators. It captures calls and emits a deterministic successful lifecycle.
---

# MockIoLoader

<SourceLink href="/source/tests/io/utils/mockioloader-js/#L5" label="mockIoLoader.js:5" />

Shared test double for loaders selected by IO orchestrators. It captures calls and emits a deterministic successful lifecycle.

---

## Constructor

<Signature code="new MockIoLoader(): MockIoLoader" />

Create a mock loader instance and track it.

---

## Instance Methods

<MemberHeading id="canloadfile" depth="3" name="canLoadFile" sig="canLoadFile(file: File): boolean" />

<MemberMeta sourceHref="/source/tests/io/utils/mockioloader-js/#L40" sourceLabel="mockIoLoader.js:40" />

Check if the file name matches the expected pattern.

**Parameters**

- `file` (File) — The file to check.

**Returns**

- `boolean` — True if the file is loadable.

<MemberHeading id="canloadurl" depth="3" name="canLoadUrl" sig="canLoadUrl(url: string): boolean" />

<MemberMeta sourceHref="/source/tests/io/utils/mockioloader-js/#L50" sourceLabel="mockIoLoader.js:50" />

Check if the URL matches the expected pattern.

**Parameters**

- `url` (string) — The URL to check.

**Returns**

- `boolean` — True if the URL is loadable.

<MemberHeading id="setoptions" depth="3" name="setOptions" sig="setOptions(options: object)" />

<MemberMeta sourceHref="/source/tests/io/utils/mockioloader-js/#L59" sourceLabel="mockIoLoader.js:59" />

Store options passed by the orchestrator.

**Parameters**

- `options` (object) — Loader options.

<MemberHeading id="loadfileas" depth="3" name="loadFileAs" sig="loadFileAs(): number" />

<MemberMeta sourceHref="/source/tests/io/utils/mockioloader-js/#L68" sourceLabel="mockIoLoader.js:68" />

Return the configured file read mode.

**Returns**

- `number` — One of `fileContentTypes`.

<MemberHeading id="loadurlas" depth="3" name="loadUrlAs" sig="loadUrlAs(): number" />

<MemberMeta sourceHref="/source/tests/io/utils/mockioloader-js/#L77" sourceLabel="mockIoLoader.js:77" />

Return the configured URL read mode.

**Returns**

- `number` — One of `urlContentTypes`.

<MemberHeading
  id="load"
  depth="3"
  name="load"
  sig="load(
	data: string | ArrayBuffer,
	origin: File | string,
	index: number,
)"
/>

<MemberMeta sourceHref="/source/tests/io/utils/mockioloader-js/#L88" sourceLabel="mockIoLoader.js:88" />

Simulate a successful loader lifecycle for one source.

**Parameters**

- `data` (string | ArrayBuffer) — Loaded payload.
- `origin` (File | string) — The source element.
- `index` (number) — The source index in the batch.

<MemberHeading id="isloading" depth="3" name="isLoading" sig="isLoading(): boolean" />

<MemberMeta sourceHref="/source/tests/io/utils/mockioloader-js/#L102" sourceLabel="mockIoLoader.js:102" />

Tell if this mock loader is currently loading.

**Returns**

- `boolean` — The loading flag.

<MemberHeading id="abort" depth="3" name="abort" sig="abort()" />

<MemberMeta sourceHref="/source/tests/io/utils/mockioloader-js/#L109" sourceLabel="mockIoLoader.js:109" />

Simulate aborting the current loader run.

## Static Methods

<MemberHeading id="reset" depth="3" name="reset" sig="reset()" />

<MemberMeta badges="static" sourceHref="/source/tests/io/utils/mockioloader-js/#L19" sourceLabel="mockIoLoader.js:19" />

Reset static state between tests.
