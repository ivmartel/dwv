---
title: LabelingFilter
kind: class
longname: LabelingFilter
description: "Filter for calculating labels. Labels a buffer using the Hoshen–Kopelman algorithm to first label all of the connected components, then does a second pass to count the number of voxels in each unique label. The Hoshen–Kopelman labelling is slightly modified to work with non-binary 3D data, but is otherwise structured the same way. Ref: {@link https://en.wikipedia.org/wiki/Hoshen%E2%80%93Kopelman_algorithm}."
---

# LabelingFilter

<SourceLink href="/source/src/image/labelingfilter-js/#L20" label="labelingFilter.js:20" />

Filter for calculating labels.

Labels a buffer using the Hoshen–Kopelman algorithm to first label all of the connected components, then does a second pass to count the number of voxels in each unique label.

The Hoshen–Kopelman labelling is slightly modified to work with non-binary 3D data, but is otherwise structured the same way.

Ref: [https://en.wikipedia.org/wiki/Hoshen%E2%80%93Kopelman\_algorithm](https://en.wikipedia.org/wiki/Hoshen%E2%80%93Kopelman_algorithm).

---

## Constructor

<Signature code="new LabelingFilter(): LabelingFilter" />

---

## Instance Methods

<MemberHeading id="run" depth="3" name="run" sig="run(data: object): object" />

<MemberMeta sourceHref="/source/src/image/labelingfilter-js/#L605" sourceLabel="labelingFilter.js:605" />

Run the filter.

**Parameters**

- `data` (object) — The input data.

**Returns**

- `object` — The list of quantified labels.
