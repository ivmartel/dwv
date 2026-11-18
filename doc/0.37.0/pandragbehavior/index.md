---
title: PanDragBehavior
kind: class
longname: PanDragBehavior
description: "Single-pointer pan drag: translates using display deltas in plane space. No drag thresholds; runs on every move."
---

# PanDragBehavior

<SourceLink href="/source/src/tools/behaviors/dragbehavior-js/#L449" label="dragBehavior.js:449" />

Single-pointer pan drag: translates using display deltas in plane space. No drag thresholds; runs on every move.

---

## Constructor

<Signature code="new PanDragBehavior(): PanDragBehavior" />

---

## Instance Methods

<MemberHeading id="ondrag" depth="3" name="onDrag" sig="onDrag(drag: DragStep, layerGroup: LayerGroup)" />

<MemberMeta sourceHref="/source/src/tools/behaviors/dragbehavior-js/#L456" sourceLabel="dragBehavior.js:456" />

**Parameters**

- `drag` ([DragStep](/dragstep)) — Step with [DragStep#delta](/dragstep#delta).
- `layerGroup` ([LayerGroup](/layergroup)) — The layer group under the pointer.
