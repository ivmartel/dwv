---
title: DragStep
kind: class
longname: DragStep
description: "One pointer move while dragging: display-space delta from the previous event as {@link Scalar2D} ( x = point1.x - point0.x , y = point1.y - point0.y )."
---

# DragStep

<SourceLink href="/source/src/tools/behaviors/dragbehavior-js/#L47" label="dragBehavior.js:47" />

One pointer move while dragging: display-space delta from the previous event as [Scalar2D](/scalar2d) (`x` = `point1.x - point0.x`, `y` = `point1.y - point0.y`).

---

## Constructor

<Signature
  code="new DragStep(
	point0: Point2D,
	point1: Point2D,
	options?: object,
): DragStep"
/>

**Parameters**

- `point0` ([Point2D](/point2d)) — Position at the previous move (or down).
- `point1` ([Point2D](/point2d)) — Current pointer position (display space).
- `options` (object, optional) — Options.
  - `options.threshold` ([Scalar2D](/scalar2d), optional) — Per-axis thresholds (see [DragBehaviorOptions](/dragbehavioroptions)).

---

## Instance Methods

<MemberHeading id="passesthresholdx" depth="3" name="passesThresholdX" sig="passesThresholdX(): boolean" />

<MemberMeta sourceHref="/source/src/tools/behaviors/dragbehavior-js/#L88" sourceLabel="dragBehavior.js:88" />

**Returns**

- `boolean` — True when `threshold.x` is `<= 0` (no minimum on X), or when `|delta.x| >= threshold.x`.

<MemberHeading id="passesthresholdy" depth="3" name="passesThresholdY" sig="passesThresholdY(): boolean" />

<MemberMeta sourceHref="/source/src/tools/behaviors/dragbehavior-js/#L100" sourceLabel="dragBehavior.js:100" />

**Returns**

- `boolean` — True when `threshold.y` is `<= 0` (no minimum on Y), or when `|delta.y| >= threshold.y`.

<MemberHeading id="passesthreshold" depth="3" name="passesThreshold" sig="passesThreshold(): boolean" />

<MemberMeta sourceHref="/source/src/tools/behaviors/dragbehavior-js/#L111" sourceLabel="dragBehavior.js:111" />

**Returns**

- `boolean` — [passesThresholdX](/dragstep#passesthresholdx) `||` [passesThresholdY](/dragstep#passesthresholdy).

## Instance Fields

<MemberHeading id="delta" depth="3" name="delta" sig="delta" />

<MemberMeta sourceHref="/source/src/tools/behaviors/dragbehavior-js/#L80" sourceLabel="dragBehavior.js:80" />

**Returns**

- [`Scalar2D`](/scalar2d) — Display delta (`point1 - point0`); mutable — treat as read-only from outside [DragStep](/dragstep).
