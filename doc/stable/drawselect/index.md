---
title: DrawSelect
kind: class
longname: DrawSelect
description: Draw select class.
---

# DrawSelect

<SourceLink href="/source/src/tools/behaviors/drawselect-js/#L14" label="drawSelect.js:14" />

Draw select class.

---

## Constructor

<Signature
  code="new DrawSelect(
	app: App,
	shapeHandler: DrawShapeHandler,
): DrawSelect"
/>

**Parameters**

- `app` ([App](/app)) — The application.
- `shapeHandler` ([DrawShapeHandler](/drawshapehandler)) — Handler for selecting and editing existing shapes.

---

## Instance Methods

<MemberHeading id="setfeatures" depth="3" name="setFeatures" sig="setFeatures(features: object)" />

<MemberMeta sourceHref="/source/src/tools/behaviors/drawselect-js/#L58" sourceLabel="drawSelect.js:58" />

**Parameters**

- `features` (object) — Live features (validator, …).

<MemberHeading id="checkcanedit" depth="3" name="checkCanEdit" sig="checkCanEdit(drawLayer: DrawLayer): boolean" />

<MemberMeta sourceHref="/source/src/tools/behaviors/drawselect-js/#L74" sourceLabel="drawSelect.js:74" />

Check if the draw data can be edited.

**Parameters**

- `drawLayer` ([DrawLayer](/drawlayer)) — The draw layer.

**Returns**

- `boolean` — True if the data is editable.

<MemberHeading
  id="tryselectshapegroup"
  depth="3"
  name="trySelectShapeGroup"
  sig="trySelectShapeGroup(
	point: Point2D,
	drawLayer: DrawLayer,
): boolean"
/>

<MemberMeta sourceHref="/source/src/tools/behaviors/drawselect-js/#L153" sourceLabel="drawSelect.js:153" />

Try to select an existing shape at the pointer.

**Parameters**

- `point` ([Point2D](/point2d)) — Display point.
- `drawLayer` ([DrawLayer](/drawlayer)) — Layer group.

**Returns**

- `boolean` — True if successful.

<MemberHeading id="activate" depth="3" name="activate" sig="activate(flag: boolean)" />

<MemberMeta sourceHref="/source/src/tools/behaviors/drawselect-js/#L242" sourceLabel="drawSelect.js:242" />

**Parameters**

- `flag` (boolean) — True to activate.
