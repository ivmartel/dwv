---
title: VoiLutSigmoidFunction
kind: class
longname: VoiLutSigmoidFunction
description: "VOI LUT sigmoid function. y = (ymax − ymin) / (1 + exp(−4 * (x − c) / w)) + ymin Ref: {@link https://dicom.nema.org/medical/dicom/2024a/output/chtml/part03/sect_C.11.2.html#sect_C.11.2.1.2}."
---

# VoiLutSigmoidFunction

<SourceLink href="/source/src/image/voilut-js/#L127" label="voiLut.js:127" />

VOI LUT sigmoid function.

```
y = (ymax − ymin) / (1 + exp(−4 * (x − c) / w)) + ymin
```

Ref: [https://dicom.nema.org/medical/dicom/2024a/output/chtml/part03/sect\_C.11.2.html#sect\_C.11.2.1.2](https://dicom.nema.org/medical/dicom/2024a/output/chtml/part03/sect_C.11.2.html#sect_C.11.2.1.2).

---

## Constructor

<Signature
  code="new VoiLutSigmoidFunction(
	center: number,
	width: number,
): VoiLutSigmoidFunction"
/>

**Parameters**

- `center` (number) — The window level center.
- `width` (number) — The window level width.

---

## Instance Methods

<MemberHeading id="gety" depth="3" name="getY" sig="getY(x: number): number" />

<MemberMeta sourceHref="/source/src/image/voilut-js/#L171" sourceLabel="voiLut.js:171" />

Get the value of the function at a given number.

**Parameters**

- `x` (number) — The input value.

**Returns**

- `number` — The value of the function at x.
