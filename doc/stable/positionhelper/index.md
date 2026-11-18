---
title: PositionHelper
kind: class
longname: PositionHelper
description: Position helper.
---

# PositionHelper

<SourceLink href="/source/src/image/positionhelper-js/#L51" label="positionHelper.js:51" />

Position helper.

---

## Constructor

<Signature code="new PositionHelper(view: View): PositionHelper" />

**Parameters**

- `view` ([View](/view)) — The associated view.

---

## Instance Methods

<MemberHeading id="getgeometry" depth="3" name="getGeometry" sig="getGeometry(): Geometry" />

<MemberMeta sourceHref="/source/src/image/positionhelper-js/#L88" sourceLabel="positionHelper.js:88" />

Get the geometry.

**Returns**

- [`Geometry`](/geometry) — The geometry.

<MemberHeading id="getscrolldimindex" depth="3" name="getScrollDimIndex" sig="getScrollDimIndex(): number" />

<MemberMeta sourceHref="/source/src/image/positionhelper-js/#L97" sourceLabel="positionHelper.js:97" />

Get the scroll index.

**Returns**

- `number` — The scroll index.

<MemberHeading id="getmaximumdimvalue" depth="3" name="getMaximumDimValue" sig="getMaximumDimValue(dim: number): number" />

<MemberMeta sourceHref="/source/src/image/positionhelper-js/#L107" sourceLabel="positionHelper.js:107" />

Get the maximum dimension value.

**Parameters**

- `dim` (number) — The dimension.

**Returns**

- `number` — The maximum value.

<MemberHeading id="getmaximumscrollvalue" depth="3" name="getMaximumScrollValue" sig="getMaximumScrollValue(): number" />

<MemberMeta sourceHref="/source/src/image/positionhelper-js/#L116" sourceLabel="positionHelper.js:116" />

Get the maximum scroll value.

**Returns**

- `number` — The maximum value.

<MemberHeading id="getcurrentposition" depth="3" name="getCurrentPosition" sig="getCurrentPosition(): Point" />

<MemberMeta sourceHref="/source/src/image/positionhelper-js/#L125" sourceLabel="positionHelper.js:125" />

Get the current position.

**Returns**

- [`Point`](/point) — The current position.

<MemberHeading id="getcurrentpositiondimvalue" depth="3" name="getCurrentPositionDimValue" sig="getCurrentPositionDimValue(dim: number): number" />

<MemberMeta sourceHref="/source/src/image/positionhelper-js/#L138" sourceLabel="positionHelper.js:138" />

Get the value at dimension index for the current position.

**Parameters**

- `dim` (number) — The dimension.

**Returns**

- `number` — The value.

<MemberHeading id="getcurrentpositionscrollvalue" depth="3" name="getCurrentPositionScrollValue" sig="getCurrentPositionScrollValue(): number" />

<MemberMeta sourceHref="/source/src/image/positionhelper-js/#L147" sourceLabel="positionHelper.js:147" />

Get the value at scroll index for the current position.

**Returns**

- `number` — The value.

<MemberHeading id="getcurrentpositionatdimvalue" depth="3" name="getCurrentPositionAtDimValue" sig="getCurrentPositionAtDimValue(dim: number, value: number): Point" />

<MemberMeta sourceHref="/source/src/image/positionhelper-js/#L159" sourceLabel="positionHelper.js:159" />

Get the current position updated at the provided dimension index with the input value.

**Parameters**

- `dim` (number) — The dimension.
- `value` (number) — The value to use at dimension index.

**Returns**

- [`Point`](/point) — The position.

<MemberHeading id="getcurrentpositionatscrollvalue" depth="3" name="getCurrentPositionAtScrollValue" sig="getCurrentPositionAtScrollValue(value: number): Point" />

<MemberMeta sourceHref="/source/src/image/positionhelper-js/#L171" sourceLabel="positionHelper.js:171" />

Get the current position updated at scroll index with the input value.

**Parameters**

- `value` (number) — The value to use at scroll index.

**Returns**

- [`Point`](/point) — The position.

<MemberHeading id="getcurrentindex" depth="3" name="getCurrentIndex" sig="getCurrentIndex(): Index" />

<MemberMeta sourceHref="/source/src/image/positionhelper-js/#L180" sourceLabel="positionHelper.js:180" />

Get the current index.

**Returns**

- [`Index`](/index) — The current index.

<MemberHeading id="setcurrentposition" depth="3" name="setCurrentPosition" sig="setCurrentPosition(position: Point, silent?: boolean): boolean" />

<MemberMeta sourceHref="/source/src/image/positionhelper-js/#L191" sourceLabel="positionHelper.js:191" />

Set the current position.

**Parameters**

- `position` ([Point](/point)) — The position.
- `silent` (boolean, optional) — Flag to fire event or not.

**Returns**

- `boolean` — True if possible and in bounds.

<MemberHeading
  id="setcurrentpositionsafe"
  depth="3"
  name="setCurrentPositionSafe"
  sig="setCurrentPositionSafe(
	position: Point,
	silent?: boolean,
): boolean"
/>

<MemberMeta sourceHref="/source/src/image/positionhelper-js/#L210" sourceLabel="positionHelper.js:210" />

Set the current position only if it is in the geometry bounds.

**Parameters**

- `position` ([Point](/point)) — The position.
- `silent` (boolean, optional) — Flag to fire event or not.

**Returns**

- `boolean` — True if possible and in bounds.

<MemberHeading id="merge" depth="3" name="merge" sig="merge(rhs: PositionHelper)" />

<MemberMeta sourceHref="/source/src/image/positionhelper-js/#L223" sourceLabel="positionHelper.js:223" />

Merge with another helper.

**Parameters**

- `rhs` ([PositionHelper](/positionhelper)) — The helper to merge with this one.

<MemberHeading id="ispositioninbounds" depth="3" name="isPositionInBounds" sig="isPositionInBounds(position: Point): boolean" />

<MemberMeta sourceHref="/source/src/image/positionhelper-js/#L247" sourceLabel="positionHelper.js:247" />

Check if the current position (default) or the provided position is in bounds.

**Parameters**

- `position` ([Point](/point)) — Optional position.

**Returns**

- `boolean` — True is the position is in bounds.

<MemberHeading id="getincrementposition" depth="3" name="getIncrementPosition" sig="getIncrementPosition(dim: number): Point" />

<MemberMeta sourceHref="/source/src/image/positionhelper-js/#L262" sourceLabel="positionHelper.js:262" />

Get the current position incremented in the input direction.

**Parameters**

- `dim` (number) — The direction in which to increment.

**Returns**

- [`Point`](/point) — The resulting point.

<MemberHeading id="getdecrementposition" depth="3" name="getDecrementPosition" sig="getDecrementPosition(dim: number): Point" />

<MemberMeta sourceHref="/source/src/image/positionhelper-js/#L273" sourceLabel="positionHelper.js:273" />

Get the current position decremented in the input direction.

**Parameters**

- `dim` (number) — The direction in which to decrement.

**Returns**

- [`Point`](/point) — The resulting point.

<MemberHeading id="incrementposition" depth="3" name="incrementPosition" sig="incrementPosition(dim: number): boolean" />

<MemberMeta sourceHref="/source/src/image/positionhelper-js/#L284" sourceLabel="positionHelper.js:284" />

Increment the current position along the provided dim.

**Parameters**

- `dim` (number) — The direction in which to increment.

**Returns**

- `boolean` — True if possible and in bounds.

<MemberHeading id="decrementposition" depth="3" name="decrementPosition" sig="decrementPosition(dim: number): boolean" />

<MemberMeta sourceHref="/source/src/image/positionhelper-js/#L294" sourceLabel="positionHelper.js:294" />

Decrement the current position along the provided dim.

**Parameters**

- `dim` (number) — The direction in which to decrement.

**Returns**

- `boolean` — True if possible and in bounds.

<MemberHeading id="incrementpositionalongscroll" depth="3" name="incrementPositionAlongScroll" sig="incrementPositionAlongScroll(): boolean" />

<MemberMeta sourceHref="/source/src/image/positionhelper-js/#L303" sourceLabel="positionHelper.js:303" />

Increment the current position along the scroll dimension.

**Returns**

- `boolean` — True if possible and in bounds.

<MemberHeading id="decrementpositionalongscroll" depth="3" name="decrementPositionAlongScroll" sig="decrementPositionAlongScroll(): boolean" />

<MemberMeta sourceHref="/source/src/image/positionhelper-js/#L312" sourceLabel="positionHelper.js:312" />

Decrement the current position along the scroll dimension.

**Returns**

- `boolean` — True if possible and in bounds.
