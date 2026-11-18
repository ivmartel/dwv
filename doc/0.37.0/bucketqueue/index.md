---
title: BucketQueue
kind: class
longname: BucketQueue
description: "Circular Bucket Queue. Returns input'd points in sorted order. All operations run in roughly O(1) time (for input with small cost values), but it has a strict requirement: If the most recent point had a cost of c, any points added should have a cost c' in the range c &lt;= c' &lt;= c + (capacity - 1)."
---

# BucketQueue

<SourceLink href="/source/src/math/bucketqueue-js/#L10" label="bucketQueue.js:10" />

Circular Bucket Queue.

Returns input'd points in sorted order. All operations run in roughly O(1) time (for input with small cost values), but it has a strict requirement:

If the most recent point had a cost of c, any points added should have a cost c' in the range c \<= c' \<= c + (capacity - 1).

---

## Constructor

<Signature
  code="new BucketQueue(
	bits: number,
	cost_functor: function,
): BucketQueue"
/>

**Parameters**

- `bits` (number) — Number of bits.
- `cost_functor` (function) — The cost functor.
