---
title: WindowLut
kind: class
longname: WindowLut
description: "Window LUT class: combines a modality LUT and a VOI LUT."
---

# WindowLut

<SourceLink href="/source/src/image/windowlut-js/#L9" label="windowLut.js:9" />

Window LUT class: combines a modality LUT and a VOI LUT.

---

## Constructor

<Signature
  code="new WindowLut(
	modalityLut: ModalityLut,
	isSigned: boolean,
	isDiscrete: boolean,
): WindowLut"
/>

Construct a window LUT object, VOI LUT is set with the 'setVoiLut' method.

**Parameters**

- `modalityLut` ([ModalityLut](/modalitylut)) — The associated rescale LUT.
- `isSigned` (boolean) — Flag to know if the data is signed or not.
- `isDiscrete` (boolean) — Flag to know if the input data is discrete.

---

## Instance Methods

<MemberHeading id="getvoilut" depth="3" name="getVoiLut" sig="getVoiLut(): VoiLut" />

<MemberMeta sourceHref="/source/src/image/windowlut-js/#L78" sourceLabel="windowLut.js:78" />

Get the VOI LUT.

**Returns**

- [`VoiLut`](/voilut) — The VOI LUT.

<MemberHeading id="getmodalitylut" depth="3" name="getModalityLut" sig="getModalityLut(): ModalityLut" />

<MemberMeta sourceHref="/source/src/image/windowlut-js/#L87" sourceLabel="windowLut.js:87" />

Get the modality LUT.

**Returns**

- [`ModalityLut`](/modalitylut) — The modality LUT.

<MemberHeading id="setvoilut" depth="3" name="setVoiLut" sig="setVoiLut(lut: VoiLut)" />

<MemberMeta sourceHref="/source/src/image/windowlut-js/#L96" sourceLabel="windowLut.js:96" />

Set the VOI LUT.

**Parameters**

- `lut` ([VoiLut](/voilut)) — The VOI LUT.

<MemberHeading id="getvalue" depth="3" name="getValue" sig="getValue(offset: number): number" />

<MemberMeta sourceHref="/source/src/image/windowlut-js/#L125" sourceLabel="windowLut.js:125" />

Get the value of the LUT at the given offset.

**Parameters**

- `offset` (number) — The input offset in \[0,2^bitsStored] range for discrete data or full range for non discrete.

**Returns**

- `number` — The integer value (default \[0,255]) of the LUT at the given offset.
