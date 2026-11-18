---
title: Statistics
kind: class
longname: Statistics
description: Statistics storage class. 'simple' statistics do not include median, p25 nor p75.
---

# Statistics

<SourceLink href="/source/src/math/stats-js/#L5" label="stats.js:5" />

Statistics storage class. 'simple' statistics do not include median, p25 nor p75.

---

## Constructor

<Signature
  code="new Statistics(
	min: number,
	max: number,
	mean: number,
	stdDev: number,
): Statistics"
/>

**Parameters**

- `min` (number) — The minimum.
- `max` (number) — The maximum.
- `mean` (number) — The mean.
- `stdDev` (number) — The standard deviation.

---

## Instance Fields

<MemberHeading id="min" depth="3" name="min" sig="min: number" />

<MemberMeta sourceHref="/source/src/math/stats-js/#L11" sourceLabel="stats.js:11" />

Minimum.

<MemberHeading id="max" depth="3" name="max" sig="max: number" />

<MemberMeta sourceHref="/source/src/math/stats-js/#L17" sourceLabel="stats.js:17" />

Maximum.

<MemberHeading id="mean" depth="3" name="mean" sig="mean: number" />

<MemberMeta sourceHref="/source/src/math/stats-js/#L23" sourceLabel="stats.js:23" />

Mean.

<MemberHeading id="stddev" depth="3" name="stdDev" sig="stdDev: number" />

<MemberMeta sourceHref="/source/src/math/stats-js/#L29" sourceLabel="stats.js:29" />

Standard deviation (population: divided by the number of values).

<MemberHeading id="median" depth="3" name="median" sig="median: number | undefined" />

<MemberMeta sourceHref="/source/src/math/stats-js/#L35" sourceLabel="stats.js:35" />

Median.

<MemberHeading id="p25" depth="3" name="p25" sig="p25: number | undefined" />

<MemberMeta sourceHref="/source/src/math/stats-js/#L41" sourceLabel="stats.js:41" />

25th percentile.

<MemberHeading id="p75" depth="3" name="p75" sig="p75: number | undefined" />

<MemberMeta sourceHref="/source/src/math/stats-js/#L47" sourceLabel="stats.js:47" />

75th percentile.
