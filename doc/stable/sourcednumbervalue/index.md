---
title: SourcedNumberValue
kind: typedef
longname: SourcedNumberValue
description: "Number value and its unit, with its source, for example {value: 4.6, unit: 'unit.ms', source: 'EchoTime', tagKey: '00180081'} ."
---

# SourcedNumberValue

<SourceLink href="/source/src/math/types-js/#L52" label="types.js:52" />

Number value and its unit, with its source, for example `{value: 4.6, unit: 'unit.ms', source: 'EchoTime', tagKey: '00180081'}`.

**Properties**

- `value` (number) — The value.
- `unit` (string, optional) — The value unit, see NumberValue.
- `source` (string, optional) — The name of the value source, for example the volume id candidate that produced it.
- `tagKey` (string, optional) — The key of the DICOM tag the value is read from.

**Type**

`object`
