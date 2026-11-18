---
title: CanvasSizeChecker
kind: class
longname: CanvasSizeChecker
description: "Canvas size checker: calls canCreateCanvas and caches its results. The browser canvas size limits do not change during a session, a size smaller than a valid one is valid and a size larger than an invalid one is invalid. Meant to be shared by the view layers of a stage."
---

# CanvasSizeChecker

<SourceLink href="/source/src/gui/generic-js/#L180" label="generic.js:180" />

Canvas size checker: calls `canCreateCanvas` and caches its results. The browser canvas size limits do not change during a session, a size smaller than a valid one is valid and a size larger than an invalid one is invalid.

Meant to be shared by the view layers of a stage.

---

## Constructor

<Signature code="new CanvasSizeChecker(): CanvasSizeChecker" />

---

## Instance Methods

<MemberHeading id="cancreate" depth="3" name="canCreate" sig="canCreate(size: Scalar2D, doc: Document): boolean" />

<MemberMeta sourceHref="/source/src/gui/generic-js/#L202" sourceLabel="generic.js:202" />

Test if a canvas with the input size can be created.

**Parameters**

- `size` ([Scalar2D](/scalar2d)) — The canvas size as {x,y}.
- `doc` (Document) — The document used to create the test canvases.

**Returns**

- `boolean` — True if the canvas can be created.
