---
title: VolumeValue
kind: typedef
longname: VolumeValue
description: Pixel value of one volume.
---

# VolumeValue

<SourceLink href="/source/src/dicom/types-js/#L74" label="types.js:74" />

Pixel value of one volume.

**Properties**

- `volumeId` ([VolumeId](/volumeid)) — The volume id: with source and possible associated value if the image has volume ids, else just the volume index as id.
- `pixValue` ([NumberValue](/numbervalue)) — The rescaled pixel value and its unit.

**Type**

`object`
