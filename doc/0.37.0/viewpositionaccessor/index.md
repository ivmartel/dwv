---
title: ViewPositionAccessor
kind: class
longname: ViewPositionAccessor
description: View position accessor class.
---

# ViewPositionAccessor

<SourceLink href="/source/src/image/positionhelper-js/#L13" label="positionHelper.js:13" />

View position accessor class.

---

## Constructor

<Signature code="new ViewPositionAccessor(view: View): ViewPositionAccessor" />

**Parameters**

- `view` ([View](/view)) — The view.

---

## Instance Methods

<MemberHeading id="getcurrentposition" depth="3" name="getCurrentPosition" sig="getCurrentPosition(): Point" />

<MemberMeta sourceHref="/source/src/image/positionhelper-js/#L29" sourceLabel="positionHelper.js:29" />

Get the current position.

**Returns**

- [`Point`](/point) — The position.

<MemberHeading id="setcurrentposition" depth="3" name="setCurrentPosition" sig="setCurrentPosition(position: Point, silent?: boolean): boolean" />

<MemberMeta sourceHref="/source/src/image/positionhelper-js/#L39" sourceLabel="positionHelper.js:39" />

Set the current position.

**Parameters**

- `position` ([Point](/point)) — The position.
- `silent` (boolean, optional) — Flag to fire event or not.

**Returns**

- `boolean` — True if possible and in bounds.
