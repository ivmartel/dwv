---
title: TooltipHoverBehavior
kind: class
longname: TooltipHoverBehavior
description: "Hover-only tooltip: shows a layer-group tooltip on move when enabled."
---

# TooltipHoverBehavior

<SourceLink href="/source/src/tools/behaviors/hoverbehavior-js/#L40" label="hoverBehavior.js:40" />

Hover-only tooltip: shows a layer-group tooltip on move when enabled.

---

## Constructor

<Signature code="new TooltipHoverBehavior(options?: object): TooltipHoverBehavior" />

**Parameters**

- `options` (object, optional) — Constructor options.
  - `options.tooltipEnabled` (boolean, optional) — Whether to show tooltip on hover.

---

## Instance Methods

<MemberHeading id="settooltipenabled" depth="3" name="setTooltipEnabled" sig="setTooltipEnabled(tooltipEnabled: boolean)" />

<MemberMeta sourceHref="/source/src/tools/behaviors/hoverbehavior-js/#L64" sourceLabel="hoverBehavior.js:64" />

**Parameters**

- `tooltipEnabled` (boolean) — Whether to show tooltip on hover.

<MemberHeading id="reset" depth="3" name="reset" sig="reset()" />

<MemberMeta sourceHref="/source/src/tools/behaviors/hoverbehavior-js/#L73" sourceLabel="hoverBehavior.js:73" />

Remove any visible tooltip DOM from the last hovered layer group.

<MemberHeading id="onupdate" depth="3" name="onUpdate" sig="onUpdate(point: Point2D, layerGroup: LayerGroup)" />

<MemberMeta sourceHref="/source/src/tools/behaviors/hoverbehavior-js/#L85" sourceLabel="hoverBehavior.js:85" />

**Parameters**

- `point` ([Point2D](/point2d)) — The update point.
- `layerGroup` ([LayerGroup](/layergroup)) — The layer group.
