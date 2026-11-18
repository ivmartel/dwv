---
title: DrawDragBehavior
kind: class
longname: DrawDragBehavior
description: Drag-driven placement session for {@link Draw}.
---

# DrawDragBehavior

<SourceLink href="/source/src/tools/behaviors/drawdragbehavior-js/#L25" label="drawDragBehavior.js:25" />

Drag-driven placement session for [Draw](/draw).

---

## Constructor

<Signature
  code="new DrawDragBehavior(
	app: App,
	drawSelect: DrawSelect,
): DrawDragBehavior"
/>

**Parameters**

- `app` ([App](/app)) — The application.
- `drawSelect` ([DrawSelect](/drawselect)) — Hepler for selecting and editing existing shapes.

---

## Instance Methods

<MemberHeading id="setoptions" depth="3" name="setOptions" sig="setOptions(options: object)" />

<MemberMeta sourceHref="/source/src/tools/behaviors/drawdragbehavior-js/#L65" sourceLabel="drawDragBehavior.js:65" />

**Parameters**

- `options` (object) — Shape factory map (name → constructor).

<MemberHeading id="setfeatures" depth="3" name="setFeatures" sig="setFeatures(features: object)" />

<MemberMeta sourceHref="/source/src/tools/behaviors/drawdragbehavior-js/#L72" sourceLabel="drawDragBehavior.js:72" />

**Parameters**

- `features` (object) — Live features (shape, colour, meta, …).

<MemberHeading id="resetplacement" depth="3" name="resetPlacement" sig="resetPlacement()" />

<MemberMeta sourceHref="/source/src/tools/behaviors/drawdragbehavior-js/#L79" sourceLabel="drawDragBehavior.js:79" />

Clear temporary preview and tap session (Escape / cancel).

<MemberHeading id="canstart" depth="3" name="canStart" sig="canStart(_point: Point2D, _layerGroup: LayerGroup): boolean" />

<MemberMeta sourceHref="/source/src/tools/behaviors/drawdragbehavior-js/#L119" sourceLabel="drawDragBehavior.js:119" />

Gate drag placement to two-point shapes only (line-like placement).

**Parameters**

- `_point` ([Point2D](/point2d)) — Display point (unused).
- `_layerGroup` ([LayerGroup](/layergroup)) — Layer group (unused).

**Returns**

- `boolean` — True only when the active shape factory expects two points.

<MemberHeading
  id="onstart"
  depth="3"
  name="onStart"
  sig="onStart(
	point: Point2D,
	layerGroup: LayerGroup,
	_pointerStart?: DragPointerStartContext | undefined,
)"
/>

<MemberMeta sourceHref="/source/src/tools/behaviors/drawdragbehavior-js/#L130" sourceLabel="drawDragBehavior.js:130" />

**Parameters**

- `point` ([Point2D](/point2d)) — Display point.
- `layerGroup` ([LayerGroup](/layergroup)) — Layer group.
- `_pointerStart` ([DragPointerStartContext](/dragpointerstartcontext) | undefined, optional) — Mouse/touch context from [LayerGroupPointer](/layergrouppointer).

<MemberHeading id="ondrag" depth="3" name="onDrag" sig="onDrag(_drag: DragStep, layerGroup: LayerGroup)" />

<MemberMeta sourceHref="/source/src/tools/behaviors/drawdragbehavior-js/#L166" sourceLabel="drawDragBehavior.js:166" />

Preview update while pointer moves during sticky placement.

**Parameters**

- `_drag` ([DragStep](/dragstep)) — Step with [DragStep#delta](/dragstep#delta).
- `layerGroup` ([LayerGroup](/layergroup)) — Layer group.

<MemberHeading id="onend" depth="3" name="onEnd" sig="onEnd()" />

<MemberMeta sourceHref="/source/src/tools/behaviors/drawdragbehavior-js/#L191" sourceLabel="drawDragBehavior.js:191" />

DragBehavior ends session — finalize shape.
