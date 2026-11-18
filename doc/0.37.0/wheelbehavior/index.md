---
title: WheelBehavior
kind: class
longname: WheelBehavior
description: "Mouse wheel handling: subclasses may override {@link WheelBehavior#onWheel} (every event) and/or {@link WheelBehavior#onWheelTick} (after tick threshold)."
---

# WheelBehavior

<SourceLink href="/source/src/tools/behaviors/wheelbehavior-js/#L16" label="wheelBehavior.js:16" />

Mouse wheel handling: subclasses may override [WheelBehavior#onWheel](/wheelbehavior#onwheel) (every event) and/or [WheelBehavior#onWheelTick](/wheelbehavior#onwheeltick) (after tick threshold).

---

## Constructor

<Signature code="new WheelBehavior(): WheelBehavior" />

---

## Instance Methods

<MemberHeading id="onwheel" depth="3" name="onWheel" sig="onWheel(_event: WheelEvent, _layerGroup: LayerGroup | undefined)" />

<MemberMeta sourceHref="/source/src/tools/behaviors/wheelbehavior-js/#L24" sourceLabel="wheelBehavior.js:24" />

Raw wheel event (every `wheel`); use with continuous effects such as zoom.

**Parameters**

- `_event` (WheelEvent) — The wheel event.
- `_layerGroup` ([LayerGroup](/layergroup) | undefined) — Layer group under the wheel.

<MemberHeading id="onwheeltick" depth="3" name="onWheelTick" sig="onWheelTick(_up: boolean, _layerGroup: LayerGroup)" />

<MemberMeta sourceHref="/source/src/tools/behaviors/wheelbehavior-js/#L35" sourceLabel="wheelBehavior.js:35" />

Discrete wheel tick after accumulation; use for slice scroll and similar stepped actions.

**Parameters**

- `_up` (boolean) — True when spin is in the positive direction.
- `_layerGroup` ([LayerGroup](/layergroup)) — Layer group under the wheel event.
