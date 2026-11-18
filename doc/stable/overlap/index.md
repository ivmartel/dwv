---
title: Overlap
kind: typedef
longname: Overlap
description: The count of overlapping voxels of a single segment with a set of different segments.
---

# Overlap

<SourceLink href="/source/src/image/masksegmenthelper-js/#L206" label="maskSegmentHelper.js:206" />

The count of overlapping voxels of a single segment with a set of different segments.

**Properties**

- `label` (string) — The segment label.
- `overlap` (Record.\<number, [OverlapCount](/overlapcount)>) — A Dictionary containing the counts. The key is the segment number of the overlapping segment.
- `count` (number) — The voxel volume of this segment.
