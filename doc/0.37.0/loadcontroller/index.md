---
title: LoadController
kind: class
longname: LoadController
description: Load controller.
---

# LoadController

<SourceLink href="/source/src/app/loadcontroller-js/#L24" label="loadController.js:24" />

Load controller.

---

## Constructor

<Signature code="new LoadController(defaultCharacterSet: string): LoadController" />

**Parameters**

- `defaultCharacterSet` (string) — The default character set.

---

## Instance Methods

<MemberHeading id="loadfiles" depth="3" name="loadFiles" sig="loadFiles(files: Array.<File>, dataId: string)" />

<MemberMeta sourceHref="/source/src/app/loadcontroller-js/#L54" sourceLabel="loadController.js:54" />

Load a list of image files.

**Parameters**

- `files` (Array.\<File>) — The list of files to load.
- `dataId` (string) — The data Id.

<MemberHeading id="loadurls" depth="3" name="loadURLs" sig="loadURLs(urls: Array.<string>, dataId: string, options?: object)" />

<MemberMeta sourceHref="/source/src/app/loadcontroller-js/#L67" sourceLabel="loadController.js:67" />

Load a list of image URLs.

**Parameters**

- `urls` (Array.\<string>) — The list of urls to load.
- `dataId` (string) — The data Id.
- `options` (object, optional) — The load options:

<MemberHeading id="loadimageobject" depth="3" name="loadImageObject" sig="loadImageObject(data: Array, dataId: string)" />

<MemberMeta sourceHref="/source/src/app/loadcontroller-js/#L78" sourceLabel="loadController.js:78" />

Load a list of ArrayBuffers.

**Parameters**

- `data` (Array) — The list of ArrayBuffers to load in the form of \[{name: '', filename: '', data: data}].
- `dataId` (string) — The data Id.

<MemberHeading id="getloadingdataids" depth="3" name="getLoadingDataIds" sig="getLoadingDataIds(): Array.<string>" />

<MemberMeta sourceHref="/source/src/app/loadcontroller-js/#L90" sourceLabel="loadController.js:90" />

Get the currently loaded data ids.

**Returns**

- `Array.<string>` — The data ids.

<MemberHeading id="abort" depth="3" name="abort" sig="abort(dataId: string)" />

<MemberMeta sourceHref="/source/src/app/loadcontroller-js/#L99" sourceLabel="loadController.js:99" />

Abort an individual current loader.

**Parameters**

- `dataId` (string) — The data to stop loading.
