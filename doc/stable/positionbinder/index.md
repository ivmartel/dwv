---
title: PositionBinder
kind: class
longname: PositionBinder
description: Position binder.
---

# PositionBinder

<SourceLink href="/source/src/gui/binders-js/#L170" label="binders.js:170" />

Position binder.

---

## Constructor

<Signature code="new PositionBinder(): PositionBinder" />

---

## Instance Fields

<MemberHeading id="geteventtype" depth="3" name="getEventType" sig="getEventType" />

<MemberMeta sourceHref="/source/src/gui/binders-js/#L176" sourceLabel="binders.js:176" />

Get the associated event.

**Returns**

- `string` — The event name.

<MemberHeading id="getcallback" depth="3" name="getCallback" sig="getCallback" />

<MemberMeta sourceHref="/source/src/gui/binders-js/#L188" sourceLabel="binders.js:188" />

Get the event handler. The event must be dispatched by the source layer group: for other data, its target is used to get the source view controller. Without it, the target view keeps its volume.

**Parameters**

- `layerGroup` ([LayerGroup](/layergroup)) — The input lqyer group.

**Returns**

- `EventListener` — The event handler.
