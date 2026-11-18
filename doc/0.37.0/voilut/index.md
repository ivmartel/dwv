---
title: VoiLut
kind: class
longname: VoiLut
description: "VOI (Values of Interest) LUT class: apply window centre and width using a VOI LUT function."
---

# VoiLut

<SourceLink href="/source/src/image/voilut-js/#L182" label="voiLut.js:182" />

VOI (Values of Interest) LUT class: apply window centre and width using a VOI LUT function.

---

## Constructor

<Signature code="new VoiLut(wl: WindowLevel, voiLutFunctionName?: string): VoiLut" />

**Parameters**

- `wl` ([WindowLevel](/windowlevel)) — The window center and width.
- `voiLutFunctionName` (string, optional) — The name of the VOI LUT function, defaults to 'LINEAR'.

---

## Instance Methods

<MemberHeading id="getwindowlevel" depth="3" name="getWindowLevel" sig="getWindowLevel(): WindowLevel" />

<MemberMeta sourceHref="/source/src/image/voilut-js/#L241" sourceLabel="voiLut.js:241" />

Get the window and level.

**Returns**

- [`WindowLevel`](/windowlevel) — The window center and width.

<MemberHeading id="setsignedoffset" depth="3" name="setSignedOffset" sig="setSignedOffset(offset: number)" />

<MemberMeta sourceHref="/source/src/image/voilut-js/#L269" sourceLabel="voiLut.js:269" />

Set the signed offset.

**Parameters**

- `offset` (number) — The signed data offset, typically: slope \* ( size / 2).

<MemberHeading id="apply" depth="3" name="apply" sig="apply(value: number): number" />

<MemberMeta sourceHref="/source/src/image/voilut-js/#L281" sourceLabel="voiLut.js:281" />

Apply the window level on an input value.

**Parameters**

- `value` (number) — The value to rescale as an integer.

**Returns**

- `number` — The leveled value, in the \[0,255] range.
