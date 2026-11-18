---
title: Histogram
kind: class
longname: Histogram
description: "Histogram of values: number of occurrences per distinct value."
---

# Histogram

<SourceLink href="/source/src/math/histogram-js/#L18" label="histogram.js:18" />

Histogram of values: number of occurrences per distinct value.

---

## Constructor

<Signature code="new Histogram(): Histogram" />

---

## Instance Methods

<MemberHeading id="add" depth="3" name="add" sig="add(value: number, count?: number)" />

<MemberMeta sourceHref="/source/src/math/histogram-js/#L33" sourceLabel="histogram.js:33" />

Add occurrences of a value.

**Parameters**

- `value` (number) — The value.
- `count` (number, optional, default: 1) — The number of occurrences, defaults to 1.

<MemberHeading id="gettotal" depth="3" name="getTotal" sig="getTotal(): number" />

<MemberMeta sourceHref="/source/src/math/histogram-js/#L42" sourceLabel="histogram.js:42" />

Get the total number of counted values.

**Returns**

- `number` — The total count.

<MemberHeading id="getentries" depth="3" name="getEntries" sig="getEntries(): Array.<HistogramEntry>" />

<MemberMeta sourceHref="/source/src/math/histogram-js/#L55" sourceLabel="histogram.js:55" />

Get the histogram entries sorted by ascending value.

**Returns**

- `Array.<`[`HistogramEntry`](/histogramentry)`>` — The entries.

<MemberHeading id="getrange" depth="3" name="getRange" sig="getRange(): NumberRange | undefined" />

<MemberMeta sourceHref="/source/src/math/histogram-js/#L65" sourceLabel="histogram.js:65" />

Get the value range.

**Returns**

- [`NumberRange`](/numberrange)` | undefined` — The range, undefined if empty.

<MemberHeading id="getcountinrange" depth="3" name="getCountInRange" sig="getCountInRange(min?: number, max?: number): number" />

<MemberMeta sourceHref="/source/src/math/histogram-js/#L89" sourceLabel="histogram.js:89" />

Get the number of values in \[min, max).

**Parameters**

- `min` (number, optional) — Inclusive lower bound, unbounded if undefined.
- `max` (number, optional) — Exclusive upper bound, unbounded if undefined.

**Returns**

- `number` — The count.

<MemberHeading
  id="getintervalpercentages"
  depth="3"
  name="getIntervalPercentages"
  sig="getIntervalPercentages(
	thresholds: Array.<(number|undefined)>,
): Array.<number>"
/>

<MemberMeta sourceHref="/source/src/math/histogram-js/#L116" sourceLabel="histogram.js:116" />

Get the percentage of counts that fall in each interval defined by consecutive thresholds, relative to the total count in the intervals (values outside all intervals are not taken into account).

For thresholds `[1, 5, 10]`, the intervals are `[1, 5)` and `[5, 10)`. An undefined first or last threshold makes the interval unbounded: for `[undefined, 5, undefined]`, the intervals are `[min, 5)` and `[5, max]`, where `min` / `max` are the histogram range.

**Parameters**

- `thresholds` (Array.\<(number|undefined)>) — Interval bounds in ascending order, the first and last can be undefined.

**Returns**

- `Array.<number>` — The percentages in \[0, 100], one per interval (`thresholds.length - 1` entries), all 0 if no value falls in the intervals.

<MemberHeading id="getstats" depth="3" name="getStats" sig="getStats(): Statistics | undefined" />

<MemberMeta sourceHref="/source/src/math/histogram-js/#L133" sourceLabel="histogram.js:133" />

Get the statistics of the values: minimum, maximum, mean, standard deviation, median, 25th and 75th percentiles. Gives the same results as `getStats` (`math/stats.js`) on the full list of values.

**Returns**

- [`Statistics`](/statistics)` | undefined` — The statistics, undefined if empty.
