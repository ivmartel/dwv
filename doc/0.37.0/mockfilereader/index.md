---
title: MockFileReader
kind: class
longname: MockFileReader
description: Test double for FileReader used by FilesLoader . It simulates success, error, abort and pending read behaviors.
---

# MockFileReader

<SourceLink href="/source/tests/io/filesloader-test-js/#L11" label="filesLoader.test.js:11" />

Test double for `FileReader` used by `FilesLoader`. It simulates success, error, abort and pending read behaviors.

---

## Constructor

<Signature code="new MockFileReader(): MockFileReader" />

Create a mock file reader and keep track of it.

---

## Instance Methods

<MemberHeading id="readastext" depth="3" name="readAsText" sig="readAsText(file: File)" />

<MemberMeta sourceHref="/source/tests/io/filesloader-test-js/#L35" sourceLabel="filesLoader.test.js:35" />

Simulate `FileReader.readAsText`.

**Parameters**

- `file` (File) — The file to read.

<MemberHeading id="readasdataurl" depth="3" name="readAsDataURL" sig="readAsDataURL(file: File)" />

<MemberMeta sourceHref="/source/tests/io/filesloader-test-js/#L45" sourceLabel="filesLoader.test.js:45" />

Simulate `FileReader.readAsDataURL`.

**Parameters**

- `file` (File) — The file to read.

<MemberHeading id="readasarraybuffer" depth="3" name="readAsArrayBuffer" sig="readAsArrayBuffer(file: File)" />

<MemberMeta sourceHref="/source/tests/io/filesloader-test-js/#L55" sourceLabel="filesLoader.test.js:55" />

Simulate `FileReader.readAsArrayBuffer`.

**Parameters**

- `file` (File) — The file to read.

<MemberHeading id="abort" depth="3" name="abort" sig="abort()" />

<MemberMeta sourceHref="/source/tests/io/filesloader-test-js/#L63" sourceLabel="filesLoader.test.js:63" />

Simulate aborting an in-flight read.
