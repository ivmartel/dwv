---
title: PrivateBValueRule
kind: typedef
longname: PrivateBValueRule
description: "Private diffusion b-value tag rule: either {manufacturer, key} or {uidPrefix, key} ."
---

# PrivateBValueRule

<SourceLink href="/source/src/dicom/types-js/#L46" label="types.js:46" />

Private diffusion b-value tag rule: either `{manufacturer, key}` or `{uidPrefix, key}`.

**Properties**

- `manufacturer` (string, optional) — The normalised manufacturer.
- `uidPrefix` (string, optional) — The SOP instance UID prefix.
- `key` (string) — The private tag key.

**Type**

`object`
