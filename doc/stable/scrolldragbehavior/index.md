---
title: ScrollDragBehavior
kind: class
longname: ScrollDragBehavior
description: "Slice scroll drag updates. Start: {@link ScrollDragBehavior.canStart}. Uses a fixed 15×15 display-pixel {@link DragBehaviorOptions} drag step threshold; each {@link onDrag} step is one such qualifying move — no separate step anchor."
---

# ScrollDragBehavior

<SourceLink href="/source/src/tools/behaviors/dragbehavior-js/#L345" label="dragBehavior.js:345" />

Slice scroll drag updates. Start: `ScrollDragBehavior.canStart`. Uses a fixed 15×15 display-pixel [DragBehaviorOptions](/dragbehavioroptions) drag step threshold; each `onDrag` step is one such qualifying move — no separate step anchor.

---

## Constructor

<Signature code="new ScrollDragBehavior(): ScrollDragBehavior" />

Uses a 15×15 display-pixel move threshold on both axes.

---

## Instance Methods

<MemberHeading id="canstart" depth="3" name="canStart" sig="canStart(_point: Point2D, layerGroup: LayerGroup): boolean" />

<MemberMeta sourceHref="/source/src/tools/behaviors/dragbehavior-js/#L362" sourceLabel="dragBehavior.js:362" />

**Parameters**

- `_point` ([Point2D](/point2d)) — The pointer position (unused).
- `layerGroup` ([LayerGroup](/layergroup)) — The layer group under the pointer.

**Returns**

- `boolean` — True if scrolling is possible.

<MemberHeading id="ondrag" depth="3" name="onDrag" sig="onDrag(drag: DragStep, layerGroup: LayerGroup)" />

<MemberMeta sourceHref="/source/src/tools/behaviors/dragbehavior-js/#L376" sourceLabel="dragBehavior.js:376" />

**Parameters**

- `drag` ([DragStep](/dragstep)) — Step with 15×15 thresholds from this behavior.
- `layerGroup` ([LayerGroup](/layergroup)) — The layer group under the pointer.
