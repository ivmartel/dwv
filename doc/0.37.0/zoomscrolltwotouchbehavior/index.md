---
title: ZoomScrollTwoTouchBehavior
kind: class
longname: ZoomScrollTwoTouchBehavior
description: Two-finger pinch zoom and vertical scroll on the stack (zoom/pan tool). Gesture move state is owned by the layer group pointer.
---

# ZoomScrollTwoTouchBehavior

<SourceLink href="/source/src/tools/behaviors/twotouchbehavior-js/#L66" label="twoTouchBehavior.js:66" />

Two-finger pinch zoom and vertical scroll on the stack (zoom/pan tool). Gesture move state is owned by the layer group pointer.

---

## Constructor

<Signature code="new ZoomScrollTwoTouchBehavior(): ZoomScrollTwoTouchBehavior" />

---

## Instance Methods

<MemberHeading id="isactive" depth="3" name="isActive" sig="isActive(): boolean" />

<MemberMeta sourceHref="/source/src/tools/behaviors/twotouchbehavior-js/#L82" sourceLabel="twoTouchBehavior.js:82" />

**Returns**

- `boolean` — True after [ZoomScrollTwoTouchBehavior#onStart](/zoomscrolltwotouchbehavior#onstart).

<MemberHeading id="reset" depth="3" name="reset" sig="reset()" />

<MemberMeta sourceHref="/source/src/tools/behaviors/twotouchbehavior-js/#L91" sourceLabel="twoTouchBehavior.js:91" />

Clear pinch/scroll tracking lines and midpoint.

<MemberHeading id="onstart" depth="3" name="onStart" sig="onStart(points: Array.<Point2D>)" />

<MemberMeta sourceHref="/source/src/tools/behaviors/twotouchbehavior-js/#L102" sourceLabel="twoTouchBehavior.js:102" />

Begin or reset two-finger tracking.

**Parameters**

- `points` (Array.\<[Point2D](/point2d)>) — Two touch points.

<MemberHeading
  id="onupdate"
  depth="3"
  name="onUpdate"
  sig="onUpdate(
	points: Array.<Point2D>,
	layerGroup: LayerGroup,
): boolean"
/>

<MemberMeta sourceHref="/source/src/tools/behaviors/twotouchbehavior-js/#L114" sourceLabel="twoTouchBehavior.js:114" />

**Parameters**

- `points` (Array.\<[Point2D](/point2d)>) — Two touch points.
- `layerGroup` ([LayerGroup](/layergroup)) — The layer group under the touch.

**Returns**

- `boolean` — False when tracking is inactive; true after an update that counts as gesture movement (for tap detection).

<MemberHeading id="onend" depth="3" name="onEnd" sig="onEnd()" />

<MemberMeta sourceHref="/source/src/tools/behaviors/twotouchbehavior-js/#L160" sourceLabel="twoTouchBehavior.js:160" />

End two-touch tracking (touch end or pointer cancel).
