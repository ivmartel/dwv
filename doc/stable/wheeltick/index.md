---
title: WheelTick
kind: class
longname: WheelTick
description: Accumulates wheel spin and reports when it crosses a full tick threshold (used with {@link WheelBehavior#onWheelTick}).
---

# WheelTick

<SourceLink href="/source/src/tools/behaviors/wheeltick-js/#L46" label="wheelTick.js:46" />

Accumulates wheel spin and reports when it crosses a full tick threshold (used with [WheelBehavior#onWheelTick](/wheelbehavior#onwheeltick)).

---

## Constructor

<Signature code="new WheelTick(): WheelTick" />

---

## Instance Methods

<MemberHeading id="add" depth="3" name="add" sig="add(event: WheelEvent)" />

<MemberMeta sourceHref="/source/src/tools/behaviors/wheeltick-js/#L58" sourceLabel="wheelTick.js:58" />

Add normalized spin from a wheel event to the accumulator.

**Parameters**

- `event` (WheelEvent) — The wheel event.

<MemberHeading id="getsum" depth="3" name="getSum" sig="getSum(): number" />

<MemberMeta sourceHref="/source/src/tools/behaviors/wheeltick-js/#L66" sourceLabel="wheelTick.js:66" />

**Returns**

- `number` — Accumulated spin since last [WheelTick#clear](/wheeltick#clear) (sign = direction).

<MemberHeading id="istick" depth="3" name="isTick" sig="isTick(): boolean" />

<MemberMeta sourceHref="/source/src/tools/behaviors/wheeltick-js/#L74" sourceLabel="wheelTick.js:74" />

**Returns**

- `boolean` — True when accumulated spin crosses a discrete tick threshold.

<MemberHeading id="clear" depth="3" name="clear" sig="clear()" />

<MemberMeta sourceHref="/source/src/tools/behaviors/wheeltick-js/#L81" sourceLabel="wheelTick.js:81" />

Reset accumulated spin (typically after handling a tick).
