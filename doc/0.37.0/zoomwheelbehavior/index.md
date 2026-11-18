---
title: ZoomWheelBehavior
kind: class
longname: ZoomWheelBehavior
description: Continuous wheel zoom around the cursor (not tick-thresholded). Overrides {@link WheelBehavior#onWheel} to apply zoom. The default {@link WheelBehavior#onWheelTick} is left as-is.
---

# ZoomWheelBehavior

<SourceLink href="/source/src/tools/behaviors/wheelbehavior-js/#L76" label="wheelBehavior.js:76" />

Continuous wheel zoom around the cursor (not tick-thresholded). Overrides [WheelBehavior#onWheel](/wheelbehavior#onwheel) to apply zoom. The default [WheelBehavior#onWheelTick](/wheelbehavior#onwheeltick) is left as-is.

---

## Constructor

<Signature code="new ZoomWheelBehavior(): ZoomWheelBehavior" />

---

## Instance Methods

<MemberHeading id="onwheel" depth="3" name="onWheel" sig="onWheel(event: WheelEvent, layerGroup: LayerGroup | undefined)" />

<MemberMeta sourceHref="/source/src/tools/behaviors/wheelbehavior-js/#L83" sourceLabel="wheelBehavior.js:83" />

**Parameters**

- `event` (WheelEvent) — The wheel event.
- `layerGroup` ([LayerGroup](/layergroup) | undefined) — The layer group under the wheel.
