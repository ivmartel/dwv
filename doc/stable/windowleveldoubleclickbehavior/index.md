---
title: WindowLevelDoubleClickBehavior
kind: class
longname: WindowLevelDoubleClickBehavior
description: "Double-click: set window center from the clicked pixel (monochrome only)."
---

# WindowLevelDoubleClickBehavior

<SourceLink href="/source/src/tools/behaviors/doubleclickbehavior-js/#L38" label="doubleClickBehavior.js:38" />

Double-click: set window center from the clicked pixel (monochrome only).

---

## Constructor

<Signature
  code="new WindowLevelDoubleClickBehavior(
	options: object,
): WindowLevelDoubleClickBehavior"
/>

**Parameters**

- `options` (object) — Constructor options.
  - `options.dataController` ([DataController](/datacontroller)) — The data controller.
  - `options.activeViewLayerOnly` (boolean, optional) — Active view layer only.

---

## Instance Methods

<MemberHeading id="setactiveviewlayeronly" depth="3" name="setActiveViewLayerOnly" sig="setActiveViewLayerOnly(activeViewLayerOnly: boolean)" />

<MemberMeta sourceHref="/source/src/tools/behaviors/doubleclickbehavior-js/#L67" sourceLabel="doubleClickBehavior.js:67" />

**Parameters**

- `activeViewLayerOnly` (boolean) — Active view layer only.

<MemberHeading id="ondoubleclick" depth="3" name="onDoubleClick" sig="onDoubleClick(point: Point2D, layerGroup: LayerGroup)" />

<MemberMeta sourceHref="/source/src/tools/behaviors/doubleclickbehavior-js/#L76" sourceLabel="doubleClickBehavior.js:76" />

**Parameters**

- `point` ([Point2D](/point2d)) — The click position in display space.
- `layerGroup` ([LayerGroup](/layergroup)) — The layer group under the pointer.
