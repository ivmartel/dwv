---
title: RTROIContour
kind: class
longname: RTROIContour
description: A single planar contour of an RT ROI.
---

# RTROIContour

<SourceLink href="/source/src/dicom/dicomrtstruct-js/#L40" label="dicomRTStruct.js:40" />

A single planar contour of an RT ROI.

---

## Constructor

<Signature code="new RTROIContour(): RTROIContour" />

---

## Instance Fields

<MemberHeading id="type" depth="3" name="type" sig="type: string" />

<MemberMeta sourceHref="/source/src/dicom/dicomrtstruct-js/#L46" sourceLabel="dicomRTStruct.js:46" />

Contour geometric type (e.g. 'CLOSED\_PLANAR').

<MemberHeading id="points3d" depth="3" name="points3D" sig="points3D: Array.<number>" />

<MemberMeta sourceHref="/source/src/dicom/dicomrtstruct-js/#L54" sourceLabel="dicomRTStruct.js:54" />

Flat array of 3D patient-space coordinates in mm: \[x0,y0,z0, x1,y1,z1, ...].
