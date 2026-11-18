---
title: RTROI
kind: class
longname: RTROI
description: An RT Region of Interest with its display colour and contours.
---

# RTROI

<SourceLink href="/source/src/dicom/dicomrtstruct-js/#L60" label="dicomRTStruct.js:60" />

An RT Region of Interest with its display colour and contours.

---

## Constructor

<Signature code="new RTROI(): RTROI" />

---

## Instance Fields

<MemberHeading id="number" depth="3" name="number" sig="number: number" />

<MemberMeta sourceHref="/source/src/dicom/dicomrtstruct-js/#L66" sourceLabel="dicomRTStruct.js:66" />

ROI number as stored in the DICOM file.

<MemberHeading id="name" depth="3" name="name" sig="name: string" />

<MemberMeta sourceHref="/source/src/dicom/dicomrtstruct-js/#L73" sourceLabel="dicomRTStruct.js:73" />

ROI name.

<MemberHeading id="colour" depth="3" name="colour" sig="colour: Object" />

<MemberMeta sourceHref="/source/src/dicom/dicomrtstruct-js/#L80" sourceLabel="dicomRTStruct.js:80" />

Display colour as {r, g, b} values in \[0, 255].

<MemberHeading id="generationalgorithm" depth="3" name="generationAlgorithm" sig="generationAlgorithm: string | undefined" />

<MemberMeta sourceHref="/source/src/dicom/dicomrtstruct-js/#L87" sourceLabel="dicomRTStruct.js:87" />

ROI generation algorithm (e.g. 'MANUAL', 'SEMIAUTOMATIC', 'AUTOMATIC').

<MemberHeading id="interpretedtype" depth="3" name="interpretedType" sig="interpretedType: string | undefined" />

<MemberMeta sourceHref="/source/src/dicom/dicomrtstruct-js/#L94" sourceLabel="dicomRTStruct.js:94" />

RT ROI interpreted type (e.g. 'GTV', 'CTV', 'PTV', 'ORGAN').

<MemberHeading id="roiinterpreter" depth="3" name="roiInterpreter" sig="roiInterpreter: string | undefined" />

<MemberMeta sourceHref="/source/src/dicom/dicomrtstruct-js/#L101" sourceLabel="dicomRTStruct.js:101" />

Name of the person who interpreted the ROI.

<MemberHeading id="contours" depth="3" name="contours" sig="contours: Array.<RTROIContour>" />

<MemberMeta sourceHref="/source/src/dicom/dicomrtstruct-js/#L108" sourceLabel="dicomRTStruct.js:108" />

List of contours belonging to this ROI.
