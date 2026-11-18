---
title: VoiLutLinearFunction
kind: class
longname: VoiLutLinearFunction
description: "VOI LUT linear function. Can be default linear or linear exact. if (x &lt;= c - 0.5 - (w-1)/2) then y = ymin else if (x > c - 0.5 + (w-1)/2) then y = ymax else y = ((x - (c - 0.5)) / (w-1) + 0.5) * (ymax - ymin) + ymin if (x &lt;= c - w/2), then y = ymin else if (x > c + w/2), then y = ymax else y = ((x - c) / w + 0.5) * (ymax- ymin) + ymin Ref: {@link https://dicom.nema.org/medical/dicom/2024a/output/chtml/part03/sect_C.11.2.html#sect_C.11.2.1.2}."
---

# VoiLutLinearFunction

<SourceLink href="/source/src/image/voilut-js/#L32" label="voiLut.js:32" />

VOI LUT linear function.

Can be default linear or linear exact.

```
if (x <= c - 0.5 - (w-1)/2) then y = ymin
else if (x > c - 0.5 + (w-1)/2) then y = ymax
else y = ((x - (c - 0.5)) / (w-1) + 0.5) * (ymax - ymin) + ymin
```

```
if (x <= c - w/2), then y = ymin
else if (x > c + w/2), then y = ymax
else y = ((x - c) / w + 0.5) * (ymax- ymin) + ymin
```

Ref: [https://dicom.nema.org/medical/dicom/2024a/output/chtml/part03/sect\_C.11.2.html#sect\_C.11.2.1.2](https://dicom.nema.org/medical/dicom/2024a/output/chtml/part03/sect_C.11.2.html#sect_C.11.2.1.2).

---

## Constructor

<Signature
  code="new VoiLutLinearFunction(
	center: number,
	width: number,
	isExact?: boolean,
): VoiLutLinearFunction"
/>

**Parameters**

- `center` (number) — The window level center.
- `width` (number) — The window level width.
- `isExact` (boolean, optional) — Is exact flag, defaults to false.

---

## Instance Methods

<MemberHeading id="gety" depth="3" name="getY" sig="getY(x: number): number" />

<MemberMeta sourceHref="/source/src/image/voilut-js/#L105" sourceLabel="voiLut.js:105" />

Get the value of the function at a given number.

**Parameters**

- `x` (number) — The input value.

**Returns**

- `number` — The value of the function at x.
