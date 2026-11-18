---
title: UrlsLoader
kind: class
longname: UrlsLoader
description: Urls loader.
---

# UrlsLoader

<SourceLink href="/source/src/io/urlsloader-js/#L16" label="urlsLoader.js:16" />

Urls loader.

---

## Constructor

<Signature code="new UrlsLoader(): UrlsLoader" />

---

## Instance Methods

<MemberHeading id="getdefaultcharacterset" depth="3" name="getDefaultCharacterSet" sig="getDefaultCharacterSet(): string" />

<MemberMeta sourceHref="/source/src/io/urlsloader-js/#L72" sourceLabel="urlsLoader.js:72" />

Get the default character set.

**Returns**

- `string` — The default character set.

<MemberHeading id="setdefaultcharacterset" depth="3" name="setDefaultCharacterSet" sig="setDefaultCharacterSet(characterSet: string)" />

<MemberMeta sourceHref="/source/src/io/urlsloader-js/#L81" sourceLabel="urlsLoader.js:81" />

Set the default character set.

**Parameters**

- `characterSet` (string) — The character set.

<MemberHeading id="load" depth="3" name="load" sig="load(data: Array.<string>, options?: object)" />

<MemberMeta sourceHref="/source/src/io/urlsloader-js/#L197" sourceLabel="urlsLoader.js:197" />

Load a list of URLs or a DICOMDIR.

**Parameters**

- `data` (Array.\<string>) — The list of urls to load.
- `options` (object, optional) — Load options.

<MemberHeading id="abort" depth="3" name="abort" sig="abort()" />

<MemberMeta sourceHref="/source/src/io/urlsloader-js/#L457" sourceLabel="urlsLoader.js:457" />

Abort a load.

<MemberHeading id="ontimeout" depth="3" name="ontimeout" sig="ontimeout(_event: object)" />

<MemberMeta sourceHref="/source/src/io/urlsloader-js/#L479" sourceLabel="urlsLoader.js:479" />

Handle a timeout event. Default does nothing.

**Parameters**

- `_event` (object) — The timeout event.
