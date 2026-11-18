---
title: HoverBehavior
kind: class
longname: HoverBehavior
description: Hover-only behaviour while the pointer is not dragging.
---

# HoverBehavior

<SourceLink href="/source/src/tools/behaviors/hoverbehavior-js/#L9" label="hoverBehavior.js:9" />

Hover-only behaviour while the pointer is not dragging.

---

## Constructor

<Signature code="new HoverBehavior(): HoverBehavior" />

---

## Instance Methods

<MemberHeading id="reset" depth="3" name="reset" sig="reset()" />

<MemberMeta sourceHref="/source/src/tools/behaviors/hoverbehavior-js/#L14" sourceLabel="hoverBehavior.js:14" />

Clear hover-specific state; default is a no-op.

<MemberHeading id="onupdate" depth="3" name="onUpdate" sig="onUpdate(_point: Point2D, _layerGroup: LayerGroup)" />

<MemberMeta sourceHref="/source/src/tools/behaviors/hoverbehavior-js/#L24" sourceLabel="hoverBehavior.js:24" />

Pointer move while hovering (not dragging); override in subclasses.

**Parameters**

- `_point` ([Point2D](/point2d)) — The pointer position.
- `_layerGroup` ([LayerGroup](/layergroup)) — The layer group under the pointer.

<MemberHeading id="onend" depth="3" name="onEnd" sig="onEnd()" />

<MemberMeta sourceHref="/source/src/tools/behaviors/hoverbehavior-js/#L31" sourceLabel="hoverBehavior.js:31" />

End hover session and reset.
