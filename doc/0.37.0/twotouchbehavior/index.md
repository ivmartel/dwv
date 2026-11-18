---
title: TwoTouchBehavior
kind: class
longname: TwoTouchBehavior
description: Two-finger gesture handling for tools that forward into {@link LayerGroupPointer} two-touch paths.
---

# TwoTouchBehavior

<SourceLink href="/source/src/tools/behaviors/twotouchbehavior-js/#L15" label="twoTouchBehavior.js:15" />

Two-finger gesture handling for tools that forward into [LayerGroupPointer](/layergrouppointer) two-touch paths.

---

## Constructor

<Signature code="new TwoTouchBehavior(): TwoTouchBehavior" />

---

## Instance Methods

<MemberHeading id="isactive" depth="3" name="isActive" sig="isActive(): boolean" />

<MemberMeta sourceHref="/source/src/tools/behaviors/twotouchbehavior-js/#L22" sourceLabel="twoTouchBehavior.js:22" />

Whether two-touch tracking is active (subclasses track gesture state).

**Returns**

- `boolean` — True when a two-finger gesture is in progress.

<MemberHeading id="reset" depth="3" name="reset" sig="reset()" />

<MemberMeta sourceHref="/source/src/tools/behaviors/twotouchbehavior-js/#L29" sourceLabel="twoTouchBehavior.js:29" />

Clear two-touch session state; default is a no-op.

<MemberHeading id="onstart" depth="3" name="onStart" sig="onStart(_points: Array.<Point2D>)" />

<MemberMeta sourceHref="/source/src/tools/behaviors/twotouchbehavior-js/#L38" sourceLabel="twoTouchBehavior.js:38" />

First frame with two simultaneous touches (or equivalent pointers).

**Parameters**

- `_points` (Array.\<[Point2D](/point2d)>) — Two touch points.

<MemberHeading
  id="onupdate"
  depth="3"
  name="onUpdate"
  sig="onUpdate(
	_points: Array.<Point2D>,
	_layerGroup: LayerGroup,
): boolean"
/>

<MemberMeta sourceHref="/source/src/tools/behaviors/twotouchbehavior-js/#L49" sourceLabel="twoTouchBehavior.js:49" />

Two-touch move; return value is used for tap vs gesture disambiguation.

**Parameters**

- `_points` (Array.\<[Point2D](/point2d)>) — Two touch points.
- `_layerGroup` ([LayerGroup](/layergroup)) — The layer group under the touch.

**Returns**

- `boolean` — True when the gesture counts as movement (for tap).

<MemberHeading id="onend" depth="3" name="onEnd" sig="onEnd()" />

<MemberMeta sourceHref="/source/src/tools/behaviors/twotouchbehavior-js/#L56" sourceLabel="twoTouchBehavior.js:56" />

End two-touch session and reset.
