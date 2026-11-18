---
title: OpacityBinder
kind: class
longname: OpacityBinder
description: Opacity binder. Only propagates to view layers of the same data.
---

# OpacityBinder

<SourceLink href="/source/src/gui/binders-js/#L300" label="binders.js:300" />

Opacity binder. Only propagates to view layers of the same data.

---

## Constructor

<Signature code="new OpacityBinder(): OpacityBinder" />

---

## Instance Fields

<MemberHeading id="geteventtype" depth="3" name="getEventType" sig="getEventType" />

<MemberMeta sourceHref="/source/src/gui/binders-js/#L306" sourceLabel="binders.js:306" />

Get the associated event.

**Returns**

- `string` — The event name.

<MemberHeading id="getcallback" depth="3" name="getCallback" sig="getCallback" />

<MemberMeta sourceHref="/source/src/gui/binders-js/#L315" sourceLabel="binders.js:315" />

Get the event handler.

**Parameters**

- `layerGroup` ([LayerGroup](/layergroup)) — The input lqyer group.

**Returns**

- `EventListener` — The event handler.
