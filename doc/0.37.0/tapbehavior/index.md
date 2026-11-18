---
title: TapBehavior
kind: class
longname: TapBehavior
description: "Tap (no drag move): subclasses implement {@link TapBehavior#onTap}. Extends {@link EventTarget} so tap-driven tools can emit and forward events."
---

# TapBehavior

<SourceLink href="/source/src/tools/behaviors/tapbehavior-js/#L20" label="tapBehavior.js:20" />

Tap (no drag move): subclasses implement [TapBehavior#onTap](/tapbehavior#ontap). Extends `EventTarget` so tap-driven tools can emit and forward events.

---

## Constructor

<Signature code="new TapBehavior(): TapBehavior" />

---

## Instance Methods

<MemberHeading id="setnumberoftaps" depth="3" name="setNumberOfTaps" sig="setNumberOfTaps(numberOfTaps: number)" />

<MemberMeta sourceHref="/source/src/tools/behaviors/tapbehavior-js/#L40" sourceLabel="tapBehavior.js:40" />

Set how many taps complete a session; clears any in-progress points.

**Parameters**

- `numberOfTaps` (number) — The number of taps.

<MemberHeading id="isactive" depth="3" name="isActive" sig="isActive(): boolean" />

<MemberMeta sourceHref="/source/src/tools/behaviors/tapbehavior-js/#L49" sourceLabel="tapBehavior.js:49" />

**Returns**

- `boolean` — True when at least one tap point has been recorded and the session is not yet complete.

<MemberHeading id="reset" depth="3" name="reset" sig="reset()" />

<MemberMeta sourceHref="/source/src/tools/behaviors/tapbehavior-js/#L56" sourceLabel="tapBehavior.js:56" />

Clear tap session state (committed points).

<MemberHeading id="getpointlist" depth="3" name="getPointList" sig="getPointList(): Array.<Point2D>" />

<MemberMeta sourceHref="/source/src/tools/behaviors/tapbehavior-js/#L65" sourceLabel="tapBehavior.js:65" />

Committed tap points (copy).

**Returns**

- `Array.<`[`Point2D`](/point2d)`>` — Display-space points accumulated for this tap session.

<MemberHeading id="onupdate" depth="3" name="onUpdate" sig="onUpdate(_point: Point2D, _layerGroup: LayerGroup)" />

<MemberMeta sourceHref="/source/src/tools/behaviors/tapbehavior-js/#L76" sourceLabel="tapBehavior.js:76" />

Pointer move while a tap session may be active; default implementation does nothing.

**Parameters**

- `_point` ([Point2D](/point2d)) — Display position.
- `_layerGroup` ([LayerGroup](/layergroup)) — The layer group.

<MemberHeading id="ontap" depth="3" name="onTap" sig="onTap(point: Point2D, _layerGroup: LayerGroup)" />

<MemberMeta sourceHref="/source/src/tools/behaviors/tapbehavior-js/#L87" sourceLabel="tapBehavior.js:87" />

Record one tap; ends the session when [setNumberOfTaps](/tapbehavior#setnumberoftaps) is reached by calling [TapBehavior#onEnd](/tapbehavior#onend).

**Parameters**

- `point` ([Point2D](/point2d)) — Display position under the pointer.
- `_layerGroup` ([LayerGroup](/layergroup)) — Layer group under the pointer.

<MemberHeading id="onend" depth="3" name="onEnd" sig="onEnd()" />

<MemberMeta sourceHref="/source/src/tools/behaviors/tapbehavior-js/#L99" sourceLabel="tapBehavior.js:99" />

End the tap session and reset.
