---
title: DragBehavior
kind: class
longname: DragBehavior
description: "Base drag behaviour: optional start gate and drag lifecycle hooks. Concrete tools extend this (e.g. {@link WindowLevelDragBehavior}). Pointer tracking for incremental {@link DragStep} deltas lives here ({@link DragBehavior#onUpdate}); {@link LayerGroupPointer} only forwards positions during an active drag."
---

# DragBehavior

<SourceLink href="/source/src/tools/behaviors/dragbehavior-js/#L125" label="dragBehavior.js:125" />

Base drag behaviour: optional start gate and drag lifecycle hooks. Concrete tools extend this (e.g. [WindowLevelDragBehavior](/windowleveldragbehavior)).

Pointer tracking for incremental [DragStep](/dragstep) deltas lives here ([DragBehavior#onUpdate](/dragbehavior#onupdate)); [LayerGroupPointer](/layergrouppointer) only forwards positions during an active drag.

---

## Constructor

<Signature code="new DragBehavior(options?: DragBehaviorOptions): DragBehavior" />

**Parameters**

- `options` ([DragBehaviorOptions](/dragbehavioroptions), optional) — Constructor options.

---

## Instance Methods

<MemberHeading id="setdragthreshold" depth="3" name="setDragThreshold" sig="setDragThreshold(threshold: Scalar2D)" />

<MemberMeta sourceHref="/source/src/tools/behaviors/dragbehavior-js/#L175" sourceLabel="dragBehavior.js:175" />

**Parameters**

- `threshold` ([Scalar2D](/scalar2d)) — New per-axis minimum move in display pixels before [DragBehavior#onDrag](/dragbehavior#ondrag) runs.

<MemberHeading id="isactive" depth="3" name="isActive" sig="isActive(): boolean" />

<MemberMeta sourceHref="/source/src/tools/behaviors/dragbehavior-js/#L182" sourceLabel="dragBehavior.js:182" />

**Returns**

- `boolean` — True after `onStart` until `onEnd`.

<MemberHeading id="canstart" depth="3" name="canStart" sig="canStart(_point: Point2D, _layerGroup: LayerGroup): boolean" />

<MemberMeta sourceHref="/source/src/tools/behaviors/dragbehavior-js/#L193" sourceLabel="dragBehavior.js:193" />

Whether a drag may start at the given pointer (tool-specific gate).

**Parameters**

- `_point` ([Point2D](/point2d)) — The pointer position.
- `_layerGroup` ([LayerGroup](/layergroup)) — The layer group under the pointer.

**Returns**

- `boolean` — Whether a drag may begin.

<MemberHeading id="reset" depth="3" name="reset" sig="reset()" />

<MemberMeta sourceHref="/source/src/tools/behaviors/dragbehavior-js/#L201" sourceLabel="dragBehavior.js:201" />

Clear drag anchors ([DragBehavior#startPoint](/dragbehavior#startpoint), [DragBehavior#prevPoint](/dragbehavior#prevpoint)).

<MemberHeading
  id="onstart"
  depth="3"
  name="onStart"
  sig="onStart(
	point: Point2D,
	_layerGroup: LayerGroup,
	_pointerStart?: DragPointerStartContext | undefined,
)"
/>

<MemberMeta sourceHref="/source/src/tools/behaviors/dragbehavior-js/#L215" sourceLabel="dragBehavior.js:215" />

Begin tracking: records start and previous pointer for [DragBehavior#onUpdate](/dragbehavior#onupdate).

**Parameters**

- `point` ([Point2D](/point2d)) — The pointer position at drag start.
- `_layerGroup` ([LayerGroup](/layergroup)) — The layer group under the pointer.
- `_pointerStart` ([DragPointerStartContext](/dragpointerstartcontext) | undefined, optional) — Mouse/touch context from [LayerGroupPointer](/layergrouppointer).

<MemberHeading id="onupdate" depth="3" name="onUpdate" sig="onUpdate(point: Point2D, layerGroup: LayerGroup)" />

<MemberMeta sourceHref="/source/src/tools/behaviors/dragbehavior-js/#L229" sourceLabel="dragBehavior.js:229" />

Advance the drag with a new pointer position. Builds a [DragStep](/dragstep) with `point0` = previous position, `point1` = current, and this behavior's `threshold`; when [DragStep#passesThreshold](/dragstep#passesthreshold) is true, assigns the current point as [DragBehavior#prevPoint](/dragbehavior#prevpoint), then calls `onDrag`.

**Parameters**

- `point` ([Point2D](/point2d)) — Current pointer position in display space.
- `layerGroup` ([LayerGroup](/layergroup)) — The layer group under the pointer.

<MemberHeading id="ondrag" depth="3" name="onDrag" sig="onDrag(_drag: DragStep, _layerGroup: LayerGroup)" />

<MemberMeta sourceHref="/source/src/tools/behaviors/dragbehavior-js/#L245" sourceLabel="dragBehavior.js:245" />

Qualifying move step after threshold checks; override in subclasses.

**Parameters**

- `_drag` ([DragStep](/dragstep)) — Step with [DragStep#delta](/dragstep#delta).
- `_layerGroup` ([LayerGroup](/layergroup)) — The layer group under the pointer.

<MemberHeading id="onend" depth="3" name="onEnd" sig="onEnd()" />

<MemberMeta sourceHref="/source/src/tools/behaviors/dragbehavior-js/#L252" sourceLabel="dragBehavior.js:252" />

End the drag session and reset.

## Instance Fields

<MemberHeading id="startpoint" depth="3" name="startPoint" sig="startPoint" />

<MemberMeta sourceHref="/source/src/tools/behaviors/dragbehavior-js/#L158" sourceLabel="dragBehavior.js:158" />

**Returns**

- [`Point2D`](/point2d)` | undefined` — The start point.

<MemberHeading id="prevpoint" depth="3" name="prevPoint" sig="prevPoint" />

<MemberMeta sourceHref="/source/src/tools/behaviors/dragbehavior-js/#L167" sourceLabel="dragBehavior.js:167" />

**Returns**

- [`Point2D`](/point2d)` | undefined` — Last accepted pointer for the next step. When [DragBehavior#onDrag](/dragbehavior#ondrag) runs, already updated to this move's endpoint (the `point` passed to [DragBehavior#onUpdate](/dragbehavior#onupdate)).
