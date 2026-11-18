---
title: LoaderBase
kind: class
longname: LoaderBase
description: Base class for single data loaders. Provides shared state (#options, #isLoading) and the seven event-handler stubs that the orchestrators (FilesLoader, UrlsLoader) assign per-instance before calling load().
---

# LoaderBase

<SourceLink href="/source/src/io/loaderbase-js/#L12" label="loaderBase.js:12" />

Base class for single data loaders.

Provides shared state (#options, #isLoading) and the seven event-handler stubs that the orchestrators (FilesLoader, UrlsLoader) assign per-instance before calling load().

---

## Constructor

<Signature code="new LoaderBase(): LoaderBase" />

---

## Instance Methods

<MemberHeading id="getoptions" depth="3" name="getOptions" sig="getOptions(): object" />

<MemberMeta sourceHref="/source/src/io/loaderbase-js/#L33" sourceLabel="loaderBase.js:33" />

Get the loader options.

**Returns**

- `object` — The loader options.

<MemberHeading id="setoptions" depth="3" name="setOptions" sig="setOptions(opt: object)" />

<MemberMeta sourceHref="/source/src/io/loaderbase-js/#L42" sourceLabel="loaderBase.js:42" />

Set the loader options.

**Parameters**

- `opt` (object) — The input options.

<MemberHeading id="isloading" depth="3" name="isLoading" sig="isLoading(): boolean" />

<MemberMeta sourceHref="/source/src/io/loaderbase-js/#L51" sourceLabel="loaderBase.js:51" />

Is the load ongoing?

**Returns**

- `boolean` — True if loading.

<MemberHeading id="setloading" depth="3" name="setLoading" sig="setLoading(flag: boolean)" />

<MemberMeta sourceHref="/source/src/io/loaderbase-js/#L60" sourceLabel="loaderBase.js:60" />

Set the loading flag.

**Parameters**

- `flag` (boolean) — The loading flag value.

<MemberHeading id="canloadfile" depth="3" name="canLoadFile" sig="canLoadFile(file: File): boolean" />

<MemberMeta sourceHref="/source/src/io/loaderbase-js/#L73" sourceLabel="loaderBase.js:73" />

Check if the loader can load the provided file. True if one of the folowing conditions is true:

- the file.type is a supported media type,
- the file.name extension is a supported extension.

**Parameters**

- `file` (File) — The file to check.

**Returns**

- `boolean` — True if the file can be loaded.

<MemberHeading id="canloadurl" depth="3" name="canLoadUrl" sig="canLoadUrl(url: string, options?: object): boolean" />

<MemberMeta sourceHref="/source/src/io/loaderbase-js/#L99" sourceLabel="loaderBase.js:99" />

Check if the loader can load the provided url. True if one of the folowing conditions is true:

- the `options.forceLoader` is the name of the loader,
- the `options.requestHeaders` contains a 'Accept' with a compatible MIME type,
- the url has a 'contentType' and it is a compatible MIME type (as in wado urls),
- the url has no 'contentType' and it has a compatible file extention.

**Parameters**

- `url` (string) — The url to check.
- `options` (object, optional) — Optional url request options.

**Returns**

- `boolean` — True if the url can be loaded.

<MemberHeading id="canloadmemory" depth="3" name="canLoadMemory" sig="canLoadMemory(mem: object): boolean" />

<MemberMeta sourceHref="/source/src/io/loaderbase-js/#L151" sourceLabel="loaderBase.js:151" />

Check if the loader can load the provided memory object. Default checks content type or filename.

**Parameters**

- `mem` (object) — The memory object.

**Returns**

- `boolean` — True if the object can be loaded.

<MemberHeading id="isloadername" depth="3" name="isLoaderName" sig="isLoaderName(_value: string): boolean" />

<MemberMeta sourceHref="/source/src/io/loaderbase-js/#L176" sourceLabel="loaderBase.js:176" />

Check if the input is the loader name. Default returns false.

**Parameters**

- `_value` (string) — The test name.

**Returns**

- `boolean` — True if input is the loader name.

<MemberHeading id="canloadextension" depth="3" name="canLoadExtension" sig="canLoadExtension(_value: string): boolean" />

<MemberMeta sourceHref="/source/src/io/loaderbase-js/#L187" sourceLabel="loaderBase.js:187" />

Check if the loader supports the input extension. Default returns false.

**Parameters**

- `_value` (string) — The extensione.

**Returns**

- `boolean` — True if it can be loaded.

<MemberHeading id="canloadmediatype" depth="3" name="canLoadMediaType" sig="canLoadMediaType(_value: string): boolean" />

<MemberMeta sourceHref="/source/src/io/loaderbase-js/#L200" sourceLabel="loaderBase.js:200" />

Check if the loader supports the input media type. Called for both the Accept request header and the Content-Type of the response (or memory object), after parameters have been stripped. Default returns false.

**Parameters**

- `_value` (string) — The media type (e.g. 'application/dicom').

**Returns**

- `boolean` — True if it can be loaded.
