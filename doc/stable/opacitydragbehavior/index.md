---
title: OpacityDragBehavior
kind: class
longname: OpacityDragBehavior
description: Horizontal drag adjusts the active layer opacity ( dx / 200 per qualifying horizontal step). Uses a fixed 15×15 display-pixel {@link DragBehaviorOptions} drag step threshold; opacity updates only when {@link DragStep#passesThresholdX} is true for that step.
---

# OpacityDragBehavior

<SourceLink href="/source/src/tools/behaviors/dragbehavior-js/#L402" label="dragBehavior.js:402" />

Horizontal drag adjusts the active layer opacity (`dx` / 200 per qualifying horizontal step). Uses a fixed 15×15 display-pixel [DragBehaviorOptions](/dragbehavioroptions) drag step threshold; opacity updates only when [DragStep#passesThresholdX](/dragstep#passesthresholdx) is true for that step.

---

## Constructor

<Signature code="new OpacityDragBehavior(): OpacityDragBehavior" />

Uses a 15×15 display-pixel move threshold on both axes.

---

## Instance Methods

<MemberHeading id="canstart" depth="3" name="canStart" sig="canStart(_point: Point2D, layerGroup: LayerGroup): boolean" />

<MemberMeta sourceHref="/source/src/tools/behaviors/dragbehavior-js/#L419" sourceLabel="dragBehavior.js:419" />

**Parameters**

- `_point` ([Point2D](/point2d)) — The pointer position (unused).
- `layerGroup` ([LayerGroup](/layergroup)) — The layer group under the pointer.

**Returns**

- `boolean` — True when an active layer exists.

<MemberHeading id="ondrag" depth="3" name="onDrag" sig="onDrag(drag: DragStep, layerGroup: LayerGroup)" />

<MemberMeta sourceHref="/source/src/tools/behaviors/dragbehavior-js/#L430" sourceLabel="dragBehavior.js:430" />

**Parameters**

- `drag` ([DragStep](/dragstep)) — Step; uses horizontal delta ([DragStep#delta](/dragstep#delta) `x`) when [DragStep#passesThresholdX](/dragstep#passesthresholdx).
- `layerGroup` ([LayerGroup](/layergroup)) — The layer group under the pointer.
