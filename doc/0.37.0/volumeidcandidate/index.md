---
title: VolumeIdCandidate
kind: typedef
longname: VolumeIdCandidate
description: Volume id candidate getter.
---

# VolumeIdCandidate

<SourceLink href="/source/src/dicom/types-js/#L64" label="types.js:64" />

Volume id candidate getter.

**Properties**

- `name` (string) — The candidate name.
- `getter` (function) — The volume id getter: `(elements) => SourcedNumberValue|undefined`, the returned id does not need a source (the candidate name is used), for example `{value: 4.6, unit: 'unit.ms', tagKey: '00180081'}`. An id without unit is an index: its associated value is guessed once all data is loaded.
- `preLoad` (boolean, optional) — Flag to also use the candidate while loading.
- `relative` (boolean, optional) — Flag to display the ids relative to the smallest one, for example to get times since the first acquisition instead of timestamps. Not applied to the ids.

**Type**

`object`
