---
title: PixelBufferDecoder
kind: class
longname: PixelBufferDecoder
description: Pixel buffer decoder.
---

# PixelBufferDecoder

<SourceLink href="/source/src/image/decoder-js/#L83" label="decoder.js:83" />

Pixel buffer decoder.

---

## Constructor

<Signature code="new PixelBufferDecoder(algoName: string): PixelBufferDecoder" />

**Parameters**

- `algoName` (string) — The compression algorithm name.

---

## Instance Methods

<MemberHeading id="decode" depth="3" name="decode" sig="decode(pixelBuffer: TypedArray, pixelMeta: object, info: object)" />

<MemberMeta sourceHref="/source/src/image/decoder-js/#L122" sourceLabel="decoder.js:122" />

Decode a pixel buffer.

**Parameters**

- `pixelBuffer` ([TypedArray](/typedarray)) — The pixel buffer.
- `pixelMeta` (object) — The input meta data.
- `info` (object) — Information object about the input data.

<MemberHeading id="abort" depth="3" name="abort" sig="abort()" />

<MemberMeta sourceHref="/source/src/image/decoder-js/#L160" sourceLabel="decoder.js:160" />

Abort decoding.

<MemberHeading id="ondecodestart" depth="3" name="ondecodestart" sig="ondecodestart(_event: object)" />

<MemberMeta sourceHref="/source/src/image/decoder-js/#L171" sourceLabel="decoder.js:171" />

Handle a decode start event. Default does nothing.

**Parameters**

- `_event` (object) — The decode start event.

<MemberHeading id="ondecodeditem" depth="3" name="ondecodeditem" sig="ondecodeditem(_event: object)" />

<MemberMeta sourceHref="/source/src/image/decoder-js/#L180" sourceLabel="decoder.js:180" />

Handle a decode item event. Default does nothing.

**Parameters**

- `_event` (object) — The decode item event fired when a decode item ended successfully.

<MemberHeading id="ondecoded" depth="3" name="ondecoded" sig="ondecoded(_event: object)" />

<MemberMeta sourceHref="/source/src/image/decoder-js/#L189" sourceLabel="decoder.js:189" />

Handle a decode event. Default does nothing.

**Parameters**

- `_event` (object) — The decode event fired when a file has been decoded successfully.

<MemberHeading id="ondecodeend" depth="3" name="ondecodeend" sig="ondecodeend(_event: object)" />

<MemberMeta sourceHref="/source/src/image/decoder-js/#L198" sourceLabel="decoder.js:198" />

Handle a decode end event. Default does nothing.

**Parameters**

- `_event` (object) — The decode end event fired when a file decoding has completed, successfully or not.

<MemberHeading id="onerror" depth="3" name="onerror" sig="onerror(_event: object)" />

<MemberMeta sourceHref="/source/src/image/decoder-js/#L206" sourceLabel="decoder.js:206" />

Handle an error event. Default does nothing.

**Parameters**

- `_event` (object) — The error event.

<MemberHeading id="onabort" depth="3" name="onabort" sig="onabort(_event: object)" />

<MemberMeta sourceHref="/source/src/image/decoder-js/#L214" sourceLabel="decoder.js:214" />

Handle an abort event. Default does nothing.

**Parameters**

- `_event` (object) — The abort event.
