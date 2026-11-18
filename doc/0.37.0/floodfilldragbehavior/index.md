---
title: FloodfillDragBehavior
kind: class
longname: FloodfillDragBehavior
description: Floodfill drag behavior.
---

# FloodfillDragBehavior

<SourceLink href="/source/src/tools/behaviors/floodfilldragbehavior-js/#L30" label="floodfillDragBehavior.js:30" />

Floodfill drag behavior.

---

## Constructor

<Signature
  code="new FloodfillDragBehavior(
	app: object,
	style: object,
	drawSelect: DrawSelect,
): FloodfillDragBehavior"
/>

**Parameters**

- `app` (object) — The associated application.
- `style` (object) — The floodfill style.
- `drawSelect` ([DrawSelect](/drawselect)) — Hepler for selecting and editing existing shapes.

---

## Instance Methods

<MemberHeading id="setfeatures" depth="3" name="setFeatures" sig="setFeatures(features: object)" />

<MemberMeta sourceHref="/source/src/tools/behaviors/floodfilldragbehavior-js/#L139" sourceLabel="floodfillDragBehavior.js:139" />

**Parameters**

- `features` (object) — Live features (shape, colour, meta, …).

<MemberHeading id="canstart" depth="3" name="canStart" sig="canStart(_point: Point2D, _layerGroup: LayerGroup): boolean" />

<MemberMeta sourceHref="/source/src/tools/behaviors/floodfilldragbehavior-js/#L381" sourceLabel="floodfillDragBehavior.js:381" />

**Parameters**

- `_point` ([Point2D](/point2d)) — The pointer position.
- `_layerGroup` ([LayerGroup](/layergroup)) — The layer group under the pointer.

**Returns**

- `boolean` — Whether a drag may begin.

<MemberHeading
  id="onstart"
  depth="3"
  name="onStart"
  sig="onStart(
	point: Point2D,
	layerGroup: LayerGroup,
	_pointerStart?: object,
)"
/>

<MemberMeta sourceHref="/source/src/tools/behaviors/floodfilldragbehavior-js/#L392" sourceLabel="floodfillDragBehavior.js:392" />

**Parameters**

- `point` ([Point2D](/point2d)) — The pointer position at drag start.
- `layerGroup` ([LayerGroup](/layergroup)) — The layer group under the pointer.
- `_pointerStart` (object, optional) — Drag start context (unused).

<MemberHeading id="onupdate" depth="3" name="onUpdate" sig="onUpdate(point: Point2D, layerGroup: LayerGroup)" />

<MemberMeta sourceHref="/source/src/tools/behaviors/floodfilldragbehavior-js/#L457" sourceLabel="floodfillDragBehavior.js:457" />

Resize threshold from drag distance instead of incremental [DragBehavior#onDrag](/dragbehavior#ondrag).

**Parameters**

- `point` ([Point2D](/point2d)) — The pointer position.
- `layerGroup` ([LayerGroup](/layergroup)) — The layer group under the pointer.
