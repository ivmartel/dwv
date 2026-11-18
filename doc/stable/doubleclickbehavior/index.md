---
title: DoubleClickBehavior
kind: class
longname: DoubleClickBehavior
description: Optional double-click handling for tools that forward dblclick into LayerGroupPointer.dblclick .
---

# DoubleClickBehavior

<SourceLink href="/source/src/tools/behaviors/doubleclickbehavior-js/#L20" label="doubleClickBehavior.js:20" />

Optional double-click handling for tools that forward `dblclick` into `LayerGroupPointer.dblclick`.

---

## Constructor

<Signature code="new DoubleClickBehavior(): DoubleClickBehavior" />

---

## Instance Methods

<MemberHeading id="ondoubleclick" depth="3" name="onDoubleClick" sig="onDoubleClick(_point: Point2D, _layerGroup: LayerGroup)" />

<MemberMeta sourceHref="/source/src/tools/behaviors/doubleclickbehavior-js/#L29" sourceLabel="doubleClickBehavior.js:29" />

Handle a double-click at the given display position; override in subclasses.

**Parameters**

- `_point` ([Point2D](/point2d)) — The click position in display space.
- `_layerGroup` ([LayerGroup](/layergroup)) — The layer group under the pointer.
