---
title: WindowPreset
kind: class
longname: WindowPreset
description: "Window level preset: a named list of window levels. The list holds a single window level unless the preset is 'perslice', in which case it holds one window level per slice."
---

# WindowPreset

<SourceLink href="/source/src/image/windowpreset-js/#L10" label="windowPreset.js:10" />

Window level preset: a named list of window levels. The list holds a single window level unless the preset is 'perslice', in which case it holds one window level per slice.

---

## Constructor

<Signature
  code="new WindowPreset(
	name: string,
	wl?: Array.<WindowLevel>,
	perslice?: boolean,
): WindowPreset"
/>

**Parameters**

- `name` (string) — The preset name.
- `wl` (Array.\<[WindowLevel](/windowlevel)>, optional) — The list of window levels.
- `perslice` (boolean, optional) — Flag for a per-slice window level list.

---

## Instance Fields

<MemberHeading id="name" depth="3" name="name" sig="name: string" />

<MemberMeta sourceHref="/source/src/image/windowpreset-js/#L16" sourceLabel="windowPreset.js:16" />

The preset name.

<MemberHeading id="wl" depth="3" name="wl" sig="wl: Array.<WindowLevel> | undefined" />

<MemberMeta sourceHref="/source/src/image/windowpreset-js/#L23" sourceLabel="windowPreset.js:23" />

The list of window levels.

<MemberHeading id="perslice" depth="3" name="perslice" sig="perslice: boolean | undefined" />

<MemberMeta sourceHref="/source/src/image/windowpreset-js/#L30" sourceLabel="windowPreset.js:30" />

Flag to indicate a per-slice window level list.
