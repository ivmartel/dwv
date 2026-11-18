---
title: WindowLevelBinder
kind: class
longname: WindowLevelBinder
description: Window/level binder.
---

# WindowLevelBinder

<SourceLink href="/source/src/gui/binders-js/#L13" label="binders.js:13" />

Window/level binder.

---

## Constructor

<Signature code="new WindowLevelBinder(): WindowLevelBinder" />

---

## Instance Fields

<MemberHeading id="geteventtype" depth="3" name="getEventType" sig="getEventType" />

<MemberMeta sourceHref="/source/src/gui/binders-js/#L19" sourceLabel="binders.js:19" />

Get the associated event.

**Returns**

- `string` — The event name.

<MemberHeading id="getcallback" depth="3" name="getCallback" sig="getCallback" />

<MemberMeta sourceHref="/source/src/gui/binders-js/#L28" sourceLabel="binders.js:28" />

Get the event handler.

**Parameters**

- `layerGroup` ([LayerGroup](/layergroup)) — The input lqyer group.

**Returns**

- `EventListener` — The event handler.
