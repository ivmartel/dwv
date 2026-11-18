---
title: ImageHistogram
kind: class
longname: ImageHistogram
description: Histogram of image values. Raw (stored) values are counted in one {@link Histogram} per rescale slope and intercept (RSI). Values are rescaled when read. An image with a constant RSI only has one histogram.
---

# ImageHistogram

<SourceLink href="/source/src/image/imagehistogram-js/#L16" label="imageHistogram.js:16" />

Histogram of image values.

Raw (stored) values are counted in one [Histogram](/histogram) per rescale slope and intercept (RSI). Values are rescaled when read. An image with a constant RSI only has one histogram.

---

## Constructor

<Signature code="new ImageHistogram(unit?: string): ImageHistogram" />

**Parameters**

- `unit` (string, optional) — The unit of the rescaled values.

---

## Instance Methods

<MemberHeading id="getunit" depth="3" name="getUnit" sig="getUnit(): string | undefined" />

<MemberMeta sourceHref="/source/src/image/imagehistogram-js/#L44" sourceLabel="imageHistogram.js:44" />

Get the unit of the rescaled values.

**Returns**

- `string | undefined` — The unit, undefined if not known.

<MemberHeading id="gethistogram" depth="3" name="getHistogram" sig="getHistogram(rsi: RescaleSlopeAndIntercept): Histogram" />

<MemberMeta sourceHref="/source/src/image/imagehistogram-js/#L54" sourceLabel="imageHistogram.js:54" />

Get the raw value histogram for an RSI, creating it if needed.

**Parameters**

- `rsi` ([RescaleSlopeAndIntercept](/rescaleslopeandintercept)) — The RSI of the raw values.

**Returns**

- [`Histogram`](/histogram) — The raw value histogram.

<MemberHeading id="add" depth="3" name="add" sig="add(rawValue: number, rsi: RescaleSlopeAndIntercept)" />

<MemberMeta sourceHref="/source/src/image/imagehistogram-js/#L69" sourceLabel="imageHistogram.js:69" />

Add one raw value.

**Parameters**

- `rawValue` (number) — The raw value.
- `rsi` ([RescaleSlopeAndIntercept](/rescaleslopeandintercept)) — The RSI of the raw value.

<MemberHeading id="gettotal" depth="3" name="getTotal" sig="getTotal(): number" />

<MemberMeta sourceHref="/source/src/image/imagehistogram-js/#L78" sourceLabel="imageHistogram.js:78" />

Get the total number of counted values.

**Returns**

- `number` — The total count.

<MemberHeading id="getrange" depth="3" name="getRange" sig="getRange(): NumberRange | undefined" />

<MemberMeta sourceHref="/source/src/image/imagehistogram-js/#L91" sourceLabel="imageHistogram.js:91" />

Get the value range (raw values).

**Returns**

- [`NumberRange`](/numberrange)` | undefined` — The range, undefined if empty.

<MemberHeading id="getrescaledhistogram" depth="3" name="getRescaledHistogram" sig="getRescaledHistogram(): Histogram" />

<MemberMeta sourceHref="/source/src/image/imagehistogram-js/#L118" sourceLabel="imageHistogram.js:118" />

Get the histogram of the rescaled values: raw values of each RSI are rescaled and equal rescaled values merged.

**Returns**

- [`Histogram`](/histogram) — The rescaled value histogram.

<MemberHeading id="getrescaledrange" depth="3" name="getRescaledRange" sig="getRescaledRange(): NumberRange | undefined" />

<MemberMeta sourceHref="/source/src/image/imagehistogram-js/#L133" sourceLabel="imageHistogram.js:133" />

Get the rescaled value range.

**Returns**

- [`NumberRange`](/numberrange)` | undefined` — The range, undefined if empty.

<MemberHeading
  id="getintervalpercentages"
  depth="3"
  name="getIntervalPercentages"
  sig="getIntervalPercentages(
	thresholds: Array.<(number|undefined)>,
): Array.<number>"
/>

<MemberMeta sourceHref="/source/src/image/imagehistogram-js/#L148" sourceLabel="imageHistogram.js:148" />

Get the percentage of counts that fall in each interval defined by consecutive rescaled thresholds, see [Histogram#getIntervalPercentages](/histogram#getintervalpercentages).

**Parameters**

- `thresholds` (Array.\<(number|undefined)>) — Rescaled interval bounds in ascending order, the first and last can be undefined.

**Returns**

- `Array.<number>` — The percentages in \[0, 100], one per interval (`thresholds.length - 1` entries), all 0 if no value falls in the intervals.

<MemberHeading id="getstats" depth="3" name="getStats" sig="getStats(): Statistics | undefined" />

<MemberMeta sourceHref="/source/src/image/imagehistogram-js/#L158" sourceLabel="imageHistogram.js:158" />

Get the statistics of the rescaled values, see [Histogram#getStats](/histogram#getstats).

**Returns**

- [`Statistics`](/statistics)` | undefined` — The statistics, undefined if empty.
