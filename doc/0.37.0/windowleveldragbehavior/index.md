---
title: WindowLevelDragBehavior
kind: class
longname: WindowLevelDragBehavior
description: "Window/level drag updates. Start: {@link WindowLevelDragBehavior.canStart}."
---

# WindowLevelDragBehavior

<SourceLink href="/source/src/tools/behaviors/dragbehavior-js/#L264" label="dragBehavior.js:264" />

Window/level drag updates. Start: `WindowLevelDragBehavior.canStart`.

---

## Constructor

<Signature
  code="new WindowLevelDragBehavior(
	options: object,
): WindowLevelDragBehavior"
/>

**Parameters**

- `options` (object) — Constructor options.
  - `options.activeViewLayerOnly` (boolean, optional) — Active view layer only.

---

## Instance Methods

<MemberHeading id="setactiveviewlayeronly" depth="3" name="setActiveViewLayerOnly" sig="setActiveViewLayerOnly(activeViewLayerOnly: boolean)" />

<MemberMeta sourceHref="/source/src/tools/behaviors/dragbehavior-js/#L287" sourceLabel="dragBehavior.js:287" />

**Parameters**

- `activeViewLayerOnly` (boolean) — Active view layer only.

<MemberHeading id="canstart" depth="3" name="canStart" sig="canStart(_point: Point2D, layerGroup: LayerGroup): boolean" />

<MemberMeta sourceHref="/source/src/tools/behaviors/dragbehavior-js/#L297" sourceLabel="dragBehavior.js:297" />

**Parameters**

- `_point` ([Point2D](/point2d)) — The pointer position (unused).
- `layerGroup` ([LayerGroup](/layergroup)) — The layer group under the pointer.

**Returns**

- `boolean` — True if W/L adjustment is allowed.

<MemberHeading id="ondrag" depth="3" name="onDrag" sig="onDrag(drag: DragStep, layerGroup: LayerGroup)" />

<MemberMeta sourceHref="/source/src/tools/behaviors/dragbehavior-js/#L315" sourceLabel="dragBehavior.js:315" />

**Parameters**

- `drag` ([DragStep](/dragstep)) — Delta from previous event ([DragStep#delta](/dragstep#delta)).
- `layerGroup` ([LayerGroup](/layergroup)) — The layer group under the pointer.
