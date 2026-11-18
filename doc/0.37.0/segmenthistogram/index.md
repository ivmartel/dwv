---
title: SegmentHistogram
kind: typedef
longname: SegmentHistogram
description: Histogram of the voxels of a segment for one volume.
---

# SegmentHistogram

<SourceLink href="/source/src/image/types-js/#L31" label="types.js:31" />

Histogram of the voxels of a segment for one volume.

**Properties**

- `volume` (number) — The volume index.
- `histogram` ([ImageHistogram](/imagehistogram)) — The segment histogram.
- `labelHistograms` (Array.\<[LabelHistogram](/labelhistogram)>, optional) — One histogram per label of the segment, if available.

**Type**

`object`
