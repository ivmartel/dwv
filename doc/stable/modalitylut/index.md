---
title: ModalityLut
kind: class
longname: ModalityLut
description: "Modality LUT class: compensates for any modality-specific presentation. Typically consists of a rescale slope and intercept to rescale the data range. Ref: {@link https://dicom.nema.org/medical/dicom/2024a/output/chtml/part03/sect_C.11.html}."
---

# ModalityLut

<SourceLink href="/source/src/image/modalitylut-js/#L31" label="modalityLut.js:31" />

Modality LUT class: compensates for any modality-specific presentation. Typically consists of a rescale slope and intercept to rescale the data range.

Ref: [https://dicom.nema.org/medical/dicom/2024a/output/chtml/part03/sect\_C.11.html](https://dicom.nema.org/medical/dicom/2024a/output/chtml/part03/sect_C.11.html).

---

## Constructor

<Signature
  code="new ModalityLut(
	rsi: RescaleSlopeAndIntercept,
	bitsStored?: number,
): ModalityLut"
/>

**Parameters**

- `rsi` ([RescaleSlopeAndIntercept](/rescaleslopeandintercept)) — The rescale slope and intercept.
- `bitsStored` (number, optional) — The number of bits used to store the data. No LUT length is set (see `getLength`) if undefined or larger than the maximum LUT bits stored (16).

---

## Instance Methods

<MemberHeading id="getrsi" depth="3" name="getRSI" sig="getRSI(): RescaleSlopeAndIntercept" />

<MemberMeta sourceHref="/source/src/image/modalitylut-js/#L94" sourceLabel="modalityLut.js:94" />

Get the Rescale Slope and Intercept (RSI).

**Returns**

- [`RescaleSlopeAndIntercept`](/rescaleslopeandintercept) — The rescale slope and intercept object.

<MemberHeading id="getlength" depth="3" name="getLength" sig="getLength(): number | undefined" />

<MemberMeta sourceHref="/source/src/image/modalitylut-js/#L104" sourceLabel="modalityLut.js:104" />

Get the length of the LUT array.

**Returns**

- `number | undefined` — The length of the LUT array, undefined if the bits stored do not allow to create a LUT.

<MemberHeading id="getvalue" depth="3" name="getValue" sig="getValue(offset: number): number" />

<MemberMeta sourceHref="/source/src/image/modalitylut-js/#L115" sourceLabel="modalityLut.js:115" />

Get the value of the LUT at the given offset.

**Parameters**

- `offset` (number) — The input offset in \[0,2^bitsStored] range or full range for ID rescale.

**Returns**

- `number` — The float32 value of the LUT at the given offset.
