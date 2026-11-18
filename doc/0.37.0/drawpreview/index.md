---
title: DrawPreview
kind: class
longname: DrawPreview
description: Draw preview class.
---

# DrawPreview

<SourceLink href="/source/src/tools/behaviors/drawpreview-js/#L51" label="drawPreview.js:51" />

Draw preview class.

---

## Constructor

<Signature code="new DrawPreview(app: App): DrawPreview" />

**Parameters**

- `app` ([App](/app)) — The application.

---

## Instance Methods

<MemberHeading id="setoptions" depth="3" name="setOptions" sig="setOptions(options: object)" />

<MemberMeta sourceHref="/source/src/tools/behaviors/drawpreview-js/#L124" sourceLabel="drawPreview.js:124" />

**Parameters**

- `options` (object) — Shape factory map (name → constructor).

<MemberHeading id="setfeatures" depth="3" name="setFeatures" sig="setFeatures(features: object)" />

<MemberMeta sourceHref="/source/src/tools/behaviors/drawpreview-js/#L131" sourceLabel="drawPreview.js:131" />

**Parameters**

- `features` (object) — Live features (shape, colour, meta, …).

<MemberHeading id="hasshape" depth="3" name="hasShape" sig="hasShape(name: string): boolean" />

<MemberMeta sourceHref="/source/src/tools/behaviors/drawpreview-js/#L163" sourceLabel="drawPreview.js:163" />

**Parameters**

- `name` (string) — Shape id.

**Returns**

- `boolean` — True if registered.

<MemberHeading id="trybeginplacement" depth="3" name="tryBeginPlacement" sig="tryBeginPlacement(layerGroup: LayerGroup): boolean" />

<MemberMeta sourceHref="/source/src/tools/behaviors/drawpreview-js/#L173" sourceLabel="drawPreview.js:173" />

Create draw layer if needed and start factory placement (no vertex yet).

**Parameters**

- `layerGroup` ([LayerGroup](/layergroup)) — Layer group.

**Returns**

- `boolean` — True if placement can proceed (layer ready).

<MemberHeading id="getnpoints" depth="3" name="getNPoints" sig="getNPoints(): number | undefined" />

<MemberMeta sourceHref="/source/src/tools/behaviors/drawpreview-js/#L207" sourceLabel="drawPreview.js:207" />

Get the current shape number of points.

**Returns**

- `number | undefined` — The number of points or undefined.

<MemberHeading id="resetplacement" depth="3" name="resetPlacement" sig="resetPlacement()" />

<MemberMeta sourceHref="/source/src/tools/behaviors/drawpreview-js/#L218" sourceLabel="drawPreview.js:218" />

Clear temporary preview and tap session (Escape / cancel).

<MemberHeading id="getcannotcreatereason" depth="3" name="getCannotCreateReason" sig="getCannotCreateReason(layerGroup: LayerGroup): string" />

<MemberMeta sourceHref="/source/src/tools/behaviors/drawpreview-js/#L271" sourceLabel="drawPreview.js:271" />

Get the reason why a shape cannot be created.

**Parameters**

- `layerGroup` ([LayerGroup](/layergroup)) — The layer group.

**Returns**

- `string` — The reason.

<MemberHeading id="onnewpoints" depth="3" name="onNewPoints" sig="onNewPoints(tmpPoints: Array.<Point2D>, layerGroup: LayerGroup)" />

<MemberMeta sourceHref="/source/src/tools/behaviors/drawpreview-js/#L379" sourceLabel="drawPreview.js:379" />

Handle new points.

**Parameters**

- `tmpPoints` (Array.\<[Point2D](/point2d)>) — Display points.
- `layerGroup` ([LayerGroup](/layergroup)) — Layer group.

<MemberHeading
  id="onfinalpoints"
  depth="3"
  name="onFinalPoints"
  sig="onFinalPoints(
	finalPoints: Array.<Point2D>,
	layerGroup: LayerGroup,
)"
/>

<MemberMeta sourceHref="/source/src/tools/behaviors/drawpreview-js/#L416" sourceLabel="drawPreview.js:416" />

Handle final points.

**Parameters**

- `finalPoints` (Array.\<[Point2D](/point2d)>) — Display points.
- `layerGroup` ([LayerGroup](/layergroup)) — Layer group.
