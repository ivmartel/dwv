---
title: Style
kind: class
longname: Style
description: Style class.
---

# Style

<SourceLink href="/source/src/gui/style-js/#L10" label="style.js:10" />

Style class.

---

## Constructor

<Signature code="new Style(): Style" />

---

## Instance Methods

<MemberHeading id="getfontfamily" depth="3" name="getFontFamily" sig="getFontFamily(): string" />

<MemberMeta sourceHref="/source/src/gui/style-js/#L86" sourceLabel="style.js:86" />

Get the font family.

**Returns**

- `string` — The font family.

<MemberHeading id="getfontsize" depth="3" name="getFontSize" sig="getFontSize(): number" />

<MemberMeta sourceHref="/source/src/gui/style-js/#L95" sourceLabel="style.js:95" />

Get the font size.

**Returns**

- `number` — The font size.

<MemberHeading id="getstrokewidth" depth="3" name="getStrokeWidth" sig="getStrokeWidth(): number" />

<MemberMeta sourceHref="/source/src/gui/style-js/#L104" sourceLabel="style.js:104" />

Get the stroke width.

**Returns**

- `number` — The stroke width.

<MemberHeading id="gettextcolour" depth="3" name="getTextColour" sig="getTextColour(): string" />

<MemberMeta sourceHref="/source/src/gui/style-js/#L113" sourceLabel="style.js:113" />

Get the text colour.

**Returns**

- `string` — The text colour.

<MemberHeading id="getlinecolour" depth="3" name="getLineColour" sig="getLineColour(): string" />

<MemberMeta sourceHref="/source/src/gui/style-js/#L122" sourceLabel="style.js:122" />

Get the line colour.

**Returns**

- `string` — The line colour.

<MemberHeading id="setlinecolour" depth="3" name="setLineColour" sig="setLineColour(colour: string)" />

<MemberMeta sourceHref="/source/src/gui/style-js/#L131" sourceLabel="style.js:131" />

Set the line colour.

**Parameters**

- `colour` (string) — The line colour.

<MemberHeading id="setbasescale" depth="3" name="setBaseScale" sig="setBaseScale(scale: Scalar2D)" />

<MemberMeta sourceHref="/source/src/gui/style-js/#L140" sourceLabel="style.js:140" />

Set the base scale.

**Parameters**

- `scale` ([Scalar2D](/scalar2d)) — The scale as {x,y}.

<MemberHeading id="setzoomscale" depth="3" name="setZoomScale" sig="setZoomScale(scale: Scalar2D)" />

<MemberMeta sourceHref="/source/src/gui/style-js/#L149" sourceLabel="style.js:149" />

Set the zoom scale.

**Parameters**

- `scale` ([Scalar2D](/scalar2d)) — The scale as {x,y}.

<MemberHeading id="getbasescale" depth="3" name="getBaseScale" sig="getBaseScale(): Scalar2D" />

<MemberMeta sourceHref="/source/src/gui/style-js/#L158" sourceLabel="style.js:158" />

Get the base scale.

**Returns**

- [`Scalar2D`](/scalar2d) — The scale as {x,y}.

<MemberHeading id="getzoomscale" depth="3" name="getZoomScale" sig="getZoomScale(): Scalar2D" />

<MemberMeta sourceHref="/source/src/gui/style-js/#L167" sourceLabel="style.js:167" />

Get the zoom scale.

**Returns**

- [`Scalar2D`](/scalar2d) — The scale as {x,y}.

<MemberHeading id="scale" depth="3" name="scale" sig="scale(value: number): number" />

<MemberMeta sourceHref="/source/src/gui/style-js/#L177" sourceLabel="style.js:177" />

Scale an input value using the base scale.

**Parameters**

- `value` (number) — The value to scale.

**Returns**

- `number` — The scaled value.

<MemberHeading id="applyzoomscale" depth="3" name="applyZoomScale" sig="applyZoomScale(value: number): Scalar2D" />

<MemberMeta sourceHref="/source/src/gui/style-js/#L188" sourceLabel="style.js:188" />

Apply zoom scale on an input value.

**Parameters**

- `value` (number) — The value to scale.

**Returns**

- [`Scalar2D`](/scalar2d) — The scaled value as {x,y}.

<MemberHeading id="applyzoomratio" depth="3" name="applyZoomRatio" sig="applyZoomRatio(value: number): number" />

<MemberMeta sourceHref="/source/src/gui/style-js/#L201" sourceLabel="style.js:201" />

Multiply an input value by the zoom ratio (zx/zy).

**Parameters**

- `value` (number) — The value to scale.

**Returns**

- `number` — The scaled value.

<MemberHeading id="getshadowoffset" depth="3" name="getShadowOffset" sig="getShadowOffset(): Scalar2D" />

<MemberMeta sourceHref="/source/src/gui/style-js/#L210" sourceLabel="style.js:210" />

Get the shadow offset.

**Returns**

- [`Scalar2D`](/scalar2d) — The offset as {x,y}.

<MemberHeading id="gettagopacity" depth="3" name="getTagOpacity" sig="getTagOpacity(): number" />

<MemberMeta sourceHref="/source/src/gui/style-js/#L219" sourceLabel="style.js:219" />

Get the tag opacity.

**Returns**

- `number` — The opacity.

<MemberHeading id="gettextpadding" depth="3" name="getTextPadding" sig="getTextPadding(): number" />

<MemberMeta sourceHref="/source/src/gui/style-js/#L228" sourceLabel="style.js:228" />

Get the text padding.

**Returns**

- `number` — The padding.

<MemberHeading id="getfontstr" depth="3" name="getFontStr" sig="getFontStr(): string" />

<MemberMeta sourceHref="/source/src/gui/style-js/#L237" sourceLabel="style.js:237" />

Get the font definition string.

**Returns**

- `string` — The font definition string.

<MemberHeading id="getlineheight" depth="3" name="getLineHeight" sig="getLineHeight(): number" />

<MemberMeta sourceHref="/source/src/gui/style-js/#L246" sourceLabel="style.js:246" />

Get the line height.

**Returns**

- `number` — The line height.

<MemberHeading id="getscaledfontsize" depth="3" name="getScaledFontSize" sig="getScaledFontSize(): number" />

<MemberMeta sourceHref="/source/src/gui/style-js/#L255" sourceLabel="style.js:255" />

Get the font size scaled to the display.

**Returns**

- `number` — The scaled font size.

<MemberHeading id="getscaledstrokewidth" depth="3" name="getScaledStrokeWidth" sig="getScaledStrokeWidth(): number" />

<MemberMeta sourceHref="/source/src/gui/style-js/#L264" sourceLabel="style.js:264" />

Get the stroke width scaled to the display.

**Returns**

- `number` — The scaled stroke width.

<MemberHeading id="getshadowlinecolour" depth="3" name="getShadowLineColour" sig="getShadowLineColour(): string" />

<MemberMeta sourceHref="/source/src/gui/style-js/#L273" sourceLabel="style.js:273" />

Get the shadow line colour.

**Returns**

- `string` — The shadow line colour.
