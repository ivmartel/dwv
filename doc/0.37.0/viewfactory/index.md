---
title: ViewFactory
kind: class
longname: ViewFactory
description: "{@link View} factory."
---

# ViewFactory

<SourceLink href="/source/src/image/viewfactory-js/#L29" label="viewFactory.js:29" />

[View](/view) factory.

---

## Constructor

<Signature code="new ViewFactory(): ViewFactory" />

---

## Instance Methods

<MemberHeading
  id="create"
  depth="3"
  name="create"
  sig="create(
	dataElements: Record.<string, DataElement>,
	image: Image,
): View"
/>

<MemberMeta sourceHref="/source/src/image/viewfactory-js/#L38" sourceLabel="viewFactory.js:38" />

Get an View object from the read DICOM file.

**Parameters**

- `dataElements` (Record.\<string, [DataElement](/dataelement)>) — The DICOM tags.
- `image` ([Image](/image)) — The associated image.

**Returns**

- [`View`](/view) — The new View.
