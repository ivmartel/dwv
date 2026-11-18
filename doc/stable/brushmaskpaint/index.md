---
title: BrushMaskPaint
kind: class
longname: BrushMaskPaint
description: Mask offset computation and dab painting (moved from {@link Brush}).
---

# BrushMaskPaint

<SourceLink href="/source/src/tools/behaviors/brushmaskpaint-js/#L189" label="brushMaskPaint.js:189" />

Mask offset computation and dab painting (moved from [Brush](/brush)).

---

## Constructor

<Signature code="new BrushMaskPaint(options: object): BrushMaskPaint" />

**Parameters**

- `options` (object) — Options.
  - `options.app` ([App](/app)) — Application.

---

## Instance Methods

<MemberHeading id="getbrushsize" depth="3" name="getBrushSize" sig="getBrushSize(): number" />

<MemberMeta sourceHref="/source/src/tools/behaviors/brushmaskpaint-js/#L278" sourceLabel="brushMaskPaint.js:278" />

**Returns**

- `number` — Current brush size in display pixels.

<MemberHeading id="getbrushmode" depth="3" name="getBrushMode" sig="getBrushMode(): string" />

<MemberMeta sourceHref="/source/src/tools/behaviors/brushmaskpaint-js/#L285" sourceLabel="brushMaskPaint.js:285" />

**Returns**

- `string` — Current add vs delete painting mode.

<MemberHeading id="getselectedsegmentnumber" depth="3" name="getSelectedSegmentNumber" sig="getSelectedSegmentNumber(): number | undefined" />

<MemberMeta sourceHref="/source/src/tools/behaviors/brushmaskpaint-js/#L292" sourceLabel="brushMaskPaint.js:292" />

**Returns**

- `number | undefined` — Active DICOM segment index.

<MemberHeading id="setbrushmode" depth="3" name="setBrushMode" sig="setBrushMode(mode: string)" />

<MemberMeta sourceHref="/source/src/tools/behaviors/brushmaskpaint-js/#L299" sourceLabel="brushMaskPaint.js:299" />

**Parameters**

- `mode` (string) — Add vs delete painting mode (`'add'` | `'del'`).

<MemberHeading id="setfeatures" depth="3" name="setFeatures" sig="setFeatures(features: object)" />

<MemberMeta sourceHref="/source/src/tools/behaviors/brushmaskpaint-js/#L308" sourceLabel="brushMaskPaint.js:308" />

**Parameters**

- `features` (object) — Fields from [Brush#setFeatures](/brush#setfeatures): mask (`createMask`, `maskDataId`) and live brush (`brushSize`, `brushMode`, `selectedSegmentNumber`, `brushSizeRange`).

<MemberHeading id="beginstroke" depth="3" name="beginStroke" sig="beginStroke(point: Point2D, layerGroup: LayerGroup): boolean" />

<MemberMeta sourceHref="/source/src/tools/behaviors/brushmaskpaint-js/#L873" sourceLabel="brushMaskPaint.js:873" />

**Parameters**

- `point` ([Point2D](/point2d)) — Pointer position at stroke start.
- `layerGroup` ([LayerGroup](/layergroup)) — The layer group.

**Returns**

- `boolean` — False when first dab produced no offsets (drag aborted).

<MemberHeading id="paintstep" depth="3" name="paintStep" sig="paintStep(point: Point2D, layerGroup: LayerGroup)" />

<MemberMeta sourceHref="/source/src/tools/behaviors/brushmaskpaint-js/#L893" sourceLabel="brushMaskPaint.js:893" />

**Parameters**

- `point` ([Point2D](/point2d)) — Current pointer position.
- `layerGroup` ([LayerGroup](/layergroup)) — The layer group under the pointer.

<MemberHeading id="finalizestroke" depth="3" name="finalizeStroke" sig="finalizeStroke()" />

<MemberMeta sourceHref="/source/src/tools/behaviors/brushmaskpaint-js/#L907" sourceLabel="brushMaskPaint.js:907" />

Commit the stroke: undo command, labels, and brush events.

<MemberHeading id="setfeatures" depth="3" name="setFeatures" sig="setFeatures(features: object)" />

<MemberMeta sourceHref="/source/tests/tools/behaviors/brushdragbehavior-test-js/#L31" sourceLabel="brushDragBehavior.test.js:31" />

**Parameters**

- `features` (object) — Brush feature fields (segment, mode).

<MemberHeading id="setbrushmode" depth="3" name="setBrushMode" sig="setBrushMode(mode: string)" />

<MemberMeta sourceHref="/source/tests/tools/behaviors/brushdragbehavior-test-js/#L63" sourceLabel="brushDragBehavior.test.js:63" />

**Parameters**

- `mode` (string) — Add vs delete brush mode (`add` / `del`).
