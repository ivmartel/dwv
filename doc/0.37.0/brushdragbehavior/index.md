---
title: BrushDragBehavior
kind: class
longname: BrushDragBehavior
description: Brush painting as a {@link DragBehavior} for {@link LayerGroupPointer}.
---

# BrushDragBehavior

<SourceLink href="/source/src/tools/behaviors/brushdragbehavior-js/#L28" label="brushDragBehavior.js:28" />

Brush painting as a [DragBehavior](/dragbehavior) for [LayerGroupPointer](/layergrouppointer).

---

## Constructor

<Signature code="new BrushDragBehavior(app: App): BrushDragBehavior" />

**Parameters**

- `app` ([App](/app)) — The associated application.

---

## Instance Methods

<MemberHeading id="setfeatures" depth="3" name="setFeatures" sig="setFeatures(features: object)" />

<MemberMeta sourceHref="/source/src/tools/behaviors/brushdragbehavior-js/#L77" sourceLabel="brushDragBehavior.js:77" />

**Parameters**

- `features` (object) — Subset of [Brush#setFeatures](/brush#setfeatures); brush-only `blacklist` is stored here, the rest is forwarded to [BrushMaskPaint#setFeatures](/brushmaskpaint#setfeatures).

<MemberHeading id="canstart" depth="3" name="canStart" sig="canStart(_point: Point2D, layerGroup: LayerGroup): boolean" />

<MemberMeta sourceHref="/source/src/tools/behaviors/brushdragbehavior-js/#L90" sourceLabel="brushDragBehavior.js:90" />

**Parameters**

- `_point` ([Point2D](/point2d)) — The pointer position.
- `layerGroup` ([LayerGroup](/layergroup)) — The layer group under the pointer.

**Returns**

- `boolean` — Whether painting may begin.

<MemberHeading
  id="onstart"
  depth="3"
  name="onStart"
  sig="onStart(
	point: Point2D,
	layerGroup: LayerGroup,
	pointerStart: DragPointerStartContext | undefined,
)"
/>

<MemberMeta sourceHref="/source/src/tools/behaviors/brushdragbehavior-js/#L113" sourceLabel="brushDragBehavior.js:113" />

**Parameters**

- `point` ([Point2D](/point2d)) — The pointer position at drag start.
- `layerGroup` ([LayerGroup](/layergroup)) — The layer group under the pointer.
- `pointerStart` ([DragPointerStartContext](/dragpointerstartcontext) | undefined) — Mouse/touch context from [LayerGroupPointer](/layergrouppointer).

<MemberHeading id="ondrag" depth="3" name="onDrag" sig="onDrag(_drag: DragStep, layerGroup: LayerGroup)" />

<MemberMeta sourceHref="/source/src/tools/behaviors/brushdragbehavior-js/#L136" sourceLabel="brushDragBehavior.js:136" />

**Parameters**

- `_drag` ([DragStep](/dragstep)) — Unused (threshold already applied in [DragBehavior#onUpdate](/dragbehavior#onupdate)).
- `layerGroup` ([LayerGroup](/layergroup)) — The layer group under the pointer.

<MemberHeading id="onend" depth="3" name="onEnd" sig="onEnd()" />

<MemberMeta sourceHref="/source/src/tools/behaviors/brushdragbehavior-js/#L149" sourceLabel="brushDragBehavior.js:149" />

Finalize stroke buffers or delegate reset when the drag never activated.

<MemberHeading id="reset" depth="3" name="reset" sig="reset()" />

<MemberMeta sourceHref="/source/src/tools/behaviors/brushdragbehavior-js/#L162" sourceLabel="brushDragBehavior.js:162" />

Reset: end stroke if active and reset.
