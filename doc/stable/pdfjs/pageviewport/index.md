---
title: PageViewport
kind: class
longname: PDFJS.PageViewport
description: PDF page viewport created based on scale, rotation and offset.
---

# PageViewport

<SourceLink href="/source/src/decoders/pdfjs/util-js/#L800" label="util.js:800" />

PDF page viewport created based on scale, rotation and offset.

**Alias:** `PDFJS.PageViewport`

---

## Constructor

<Signature code="new PageViewport(): PageViewport" />

---

## Instance Methods

<MemberHeading id="clone" depth="3" name="clone" sig="clone(args: Object): PDFJS.PageViewport" />

<MemberMeta sourceHref="/source/src/decoders/pdfjs/util-js/#L882" sourceLabel="util.js:882" />

Clones viewport with additional properties.

**Parameters**

- `args` (Object) — (optional) If specified, may contain the 'scale' or 'rotation' properties to override the corresponding properties in the cloned viewport.

**Returns**

- [`PDFJS.PageViewport`](/pdfjs/pageviewport) — Cloned viewport.

<MemberHeading id="converttoviewportpoint" depth="3" name="convertToViewportPoint" sig="convertToViewportPoint(x: number, y: number): Object" />

<MemberMeta sourceHref="/source/src/decoders/pdfjs/util-js/#L899" sourceLabel="util.js:899" />

Converts PDF point to the viewport coordinates. For examples, useful for converting PDF location into canvas pixel coordinates.

**Parameters**

- `x` (number) — X coordinate.
- `y` (number) — Y coordinate.

**Returns**

- `Object` — Object that contains 'x' and 'y' properties of the point in the viewport coordinate space.

* **See:**
  - [convertToPdfPoint](/pdfjs/pageviewport#converttopdfpoint)
  - [convertToViewportRectangle](/pdfjs/pageviewport#converttoviewportrectangle)

<MemberHeading id="converttoviewportrectangle" depth="3" name="convertToViewportRectangle" sig="convertToViewportRectangle(rect: Array): Array" />

<MemberMeta sourceHref="/source/src/decoders/pdfjs/util-js/#L909" sourceLabel="util.js:909" />

Converts PDF rectangle to the viewport coordinates.

**Parameters**

- `rect` (Array) — xMin, yMin, xMax and yMax coordinates.

**Returns**

- `Array` — Contains corresponding coordinates of the rectangle in the viewport coordinate space.

* **See:**
  - [convertToViewportPoint](/pdfjs/pageviewport#converttoviewportpoint)

<MemberHeading id="converttopdfpoint" depth="3" name="convertToPdfPoint" sig="convertToPdfPoint(x: number, y: number): Object" />

<MemberMeta sourceHref="/source/src/decoders/pdfjs/util-js/#L924" sourceLabel="util.js:924" />

Converts viewport coordinates to the PDF location. For examples, useful for converting canvas pixel location into PDF one.

**Parameters**

- `x` (number) — X coordinate.
- `y` (number) — Y coordinate.

**Returns**

- `Object` — Object that contains 'x' and 'y' properties of the point in the PDF coordinate space.

* **See:**
  - [convertToViewportPoint](/pdfjs/pageviewport#converttoviewportpoint)
