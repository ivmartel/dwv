---
title: DrawTapBehavior
kind: class
longname: DrawTapBehavior
description: Tap-driven placement session for {@link Draw}.
---

# DrawTapBehavior

<SourceLink href="/source/src/tools/behaviors/drawtapbehavior-js/#L24" label="drawTapBehavior.js:24" />

Tap-driven placement session for [Draw](/draw).

---

## Constructor

<Signature
  code="new DrawTapBehavior(
	app: App,
	drawSelect: DrawSelect,
): DrawTapBehavior"
/>

**Parameters**

- `app` ([App](/app)) — The application.
- `drawSelect` ([DrawSelect](/drawselect)) — Hepler for selecting and editing existing shapes.

---

## Instance Methods

<MemberHeading id="setoptions" depth="3" name="setOptions" sig="setOptions(options: object)" />

<MemberMeta sourceHref="/source/src/tools/behaviors/drawtapbehavior-js/#L66" sourceLabel="drawTapBehavior.js:66" />

**Parameters**

- `options` (object) — Shape factory map (name → constructor).

<MemberHeading id="setfeatures" depth="3" name="setFeatures" sig="setFeatures(features: object)" />

<MemberMeta sourceHref="/source/src/tools/behaviors/drawtapbehavior-js/#L73" sourceLabel="drawTapBehavior.js:73" />

**Parameters**

- `features` (object) — Live features (shape, colour, meta, …).

<MemberHeading id="hasshape" depth="3" name="hasShape" sig="hasShape(name: string): boolean" />

<MemberMeta sourceHref="/source/src/tools/behaviors/drawtapbehavior-js/#L82" sourceLabel="drawTapBehavior.js:82" />

**Parameters**

- `name` (string) — Shape id.

**Returns**

- `boolean` — True if registered.

<MemberHeading id="resetplacement" depth="3" name="resetPlacement" sig="resetPlacement()" />

<MemberMeta sourceHref="/source/src/tools/behaviors/drawtapbehavior-js/#L129" sourceLabel="drawTapBehavior.js:129" />

Clear temporary preview and tap session (Escape / cancel).

<MemberHeading id="onupdate" depth="3" name="onUpdate" sig="onUpdate(point: Point2D, layerGroup: LayerGroup)" />

<MemberMeta sourceHref="/source/src/tools/behaviors/drawtapbehavior-js/#L156" sourceLabel="drawTapBehavior.js:156" />

Preview update while pointer moves during sticky placement.

**Parameters**

- `point` ([Point2D](/point2d)) — Display point.
- `layerGroup` ([LayerGroup](/layergroup)) — Layer group.

<MemberHeading id="ontap" depth="3" name="onTap" sig="onTap(point: Point2D, layerGroup: LayerGroup)" />

<MemberMeta sourceHref="/source/src/tools/behaviors/drawtapbehavior-js/#L183" sourceLabel="drawTapBehavior.js:183" />

**Parameters**

- `point` ([Point2D](/point2d)) — Display point.
- `layerGroup` ([LayerGroup](/layergroup)) — Layer group.

<MemberHeading id="onend" depth="3" name="onEnd" sig="onEnd()" />

<MemberMeta sourceHref="/source/src/tools/behaviors/drawtapbehavior-js/#L226" sourceLabel="drawTapBehavior.js:226" />

TapBehavior ends session — finalize fixed-count shapes or clear preview.
