---
title: LoadHandlers
kind: class
longname: LoadHandlers
description: Mixin class that provides the seven standard load-event handler stubs. Extend this class (or include it in an inheritance chain) to get no-op default implementations for all load-lifecycle callbacks. Consumers assign real functions to these properties before calling load().
---

# LoadHandlers

<SourceLink href="/source/src/io/loadhandlers-js/#L8" label="loadHandlers.js:8" />

Mixin class that provides the seven standard load-event handler stubs.

Extend this class (or include it in an inheritance chain) to get no-op default implementations for all load-lifecycle callbacks. Consumers assign real functions to these properties before calling load().

---

## Constructor

<Signature code="new LoadHandlers(): LoadHandlers" />

---

## Instance Methods

<MemberHeading id="onloadstart" depth="3" name="onloadstart" sig="onloadstart(_event: object)" />

<MemberMeta sourceHref="/source/src/io/loadhandlers-js/#L16" sourceLabel="loadHandlers.js:16" />

Handle a load start event. Default does nothing.

**Parameters**

- `_event` (object) — The load start event.

<MemberHeading id="onprogress" depth="3" name="onprogress" sig="onprogress(_event: object)" />

<MemberMeta sourceHref="/source/src/io/loadhandlers-js/#L24" sourceLabel="loadHandlers.js:24" />

Handle a load progress event. Default does nothing.

**Parameters**

- `_event` (object) — The progress event.

<MemberHeading id="onloaditem" depth="3" name="onloaditem" sig="onloaditem(_event: object)" />

<MemberMeta sourceHref="/source/src/io/loadhandlers-js/#L33" sourceLabel="loadHandlers.js:33" />

Handle a load item event. Default does nothing.

**Parameters**

- `_event` (object) — The load item event fired when a file item has been loaded successfully.

<MemberHeading id="onload" depth="3" name="onload" sig="onload(_event: object)" />

<MemberMeta sourceHref="/source/src/io/loadhandlers-js/#L42" sourceLabel="loadHandlers.js:42" />

Handle a load event. Default does nothing.

**Parameters**

- `_event` (object) — The load event fired when a file has been loaded successfully.

<MemberHeading id="onloadend" depth="3" name="onloadend" sig="onloadend(_event: object)" />

<MemberMeta sourceHref="/source/src/io/loadhandlers-js/#L51" sourceLabel="loadHandlers.js:51" />

Handle a load end event. Default does nothing.

**Parameters**

- `_event` (object) — The load end event fired when a file load has completed, successfully or not.

<MemberHeading id="onerror" depth="3" name="onerror" sig="onerror(_event: object)" />

<MemberMeta sourceHref="/source/src/io/loadhandlers-js/#L59" sourceLabel="loadHandlers.js:59" />

Handle an error event. Default does nothing.

**Parameters**

- `_event` (object) — The error event.

<MemberHeading id="onabort" depth="3" name="onabort" sig="onabort(_event: object)" />

<MemberMeta sourceHref="/source/src/io/loadhandlers-js/#L67" sourceLabel="loadHandlers.js:67" />

Handle an abort event. Default does nothing.

**Parameters**

- `_event` (object) — The abort event.
