---
title: VolumeId
kind: typedef
longname: VolumeId
description: "Volume id: the id of a volume (fourth dimension index) and an optional associated value, for example {id: {value: 2, source: 'TemporalPositionIdentifier', tagKey: '00200100'}, value: {value: 10, unit: 'unit.s', source: 'AcquisitionTime', tagKey: '00080032'}} . Only the id is reliable: it groups, orders and locates the volumes (it is the fourth dimension world coordinate). The associated value is informative, for example the acquisition time of the volumes of a temporal position identifier. Ids that are values (for example an echo time) usually do not have one. Without source, the id is a frame index (for example {id: {value: 2}} )."
---

# VolumeId

<SourceLink href="/source/src/image/types-js/#L49" label="types.js:49" />

Volume id: the id of a volume (fourth dimension index) and an optional associated value, for example `{id: {value: 2, source: 'TemporalPositionIdentifier', tagKey: '00200100'}, value: {value: 10, unit: 'unit.s', source: 'AcquisitionTime', tagKey: '00080032'}}`. Only the id is reliable: it groups, orders and locates the volumes (it is the fourth dimension world coordinate). The associated value is informative, for example the acquisition time of the volumes of a temporal position identifier. Ids that are values (for example an echo time) usually do not have one. Without source, the id is a frame index (for example `{id: {value: 2}}`).

**Properties**

- `id` ([SourcedNumberValue](/sourcednumbervalue)) — The volume id.
- `value` ([SourcedNumberValue](/sourcednumbervalue), optional) — The associated value.

**Type**

`object`
