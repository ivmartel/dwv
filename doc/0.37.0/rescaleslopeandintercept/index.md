---
title: RescaleSlopeAndIntercept
kind: class
longname: RescaleSlopeAndIntercept
description: Rescale Slope and Intercept.
---

# RescaleSlopeAndIntercept

<SourceLink href="/source/src/image/rsi-js/#L4" label="rsi.js:4" />

Rescale Slope and Intercept.

---

## Constructor

<Signature
  code="new RescaleSlopeAndIntercept(
	slope: number,
	intercept: number,
): RescaleSlopeAndIntercept"
/>

**Parameters**

- `slope` (number) — The slope of the RSI.
- `intercept` (number) — The intercept of the RSI.

---

## Instance Methods

<MemberHeading id="getslope" depth="3" name="getSlope" sig="getSlope(): number" />

<MemberMeta sourceHref="/source/src/image/rsi-js/#L42" sourceLabel="rsi.js:42" />

Get the slope of the RSI.

**Returns**

- `number` — The slope of the RSI.

<MemberHeading id="getintercept" depth="3" name="getIntercept" sig="getIntercept(): number" />

<MemberMeta sourceHref="/source/src/image/rsi-js/#L51" sourceLabel="rsi.js:51" />

Get the intercept of the RSI.

**Returns**

- `number` — The intercept of the RSI.

<MemberHeading id="apply" depth="3" name="apply" sig="apply(value: number): number" />

<MemberMeta sourceHref="/source/src/image/rsi-js/#L61" sourceLabel="rsi.js:61" />

Apply the RSI on an input value.

**Parameters**

- `value` (number) — The input value.

**Returns**

- `number` — The value to rescale.

<MemberHeading id="equals" depth="3" name="equals" sig="equals(rhs: RescaleSlopeAndIntercept): boolean" />

<MemberMeta sourceHref="/source/src/image/rsi-js/#L71" sourceLabel="rsi.js:71" />

Check for RSI equality.

**Parameters**

- `rhs` ([RescaleSlopeAndIntercept](/rescaleslopeandintercept)) — The other RSI to compare to.

**Returns**

- `boolean` — True if both RSI are equal.

<MemberHeading id="isid" depth="3" name="isID" sig="isID(): boolean" />

<MemberMeta sourceHref="/source/src/image/rsi-js/#L83" sourceLabel="rsi.js:83" />

Is this RSI an ID RSI.

**Returns**

- `boolean` — True if the RSI has a slope of 1 and no intercept.
