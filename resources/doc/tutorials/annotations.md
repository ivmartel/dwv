This page is part of the dwv [architecture](./tutorial-architecture.html) description and
describes the dwv annotations.

Summary:

- [DICOM SR](#dicom-sr)

## DICOM SR

The DICOM SR strucutre used to store annotations is based on the 'DICOM SR for communicating planar annotations'
document from David A. Clunie ([ref](https://docs.google.com/document/d/1bR6m7foTCzofoZKeIRN5YreBrkjgMcBfNA7r9wXEGR4/edit?tab=t.0)).

SCOORD items are translated according to their `Graphic Type` ((0070,0023) see [part03/sect_C.18.6](https://dicom.nema.org/medical/dicom/2022a/output/chtml/part03/sect_C.18.6.html#sect_C.18.6.1.2)):
- Point -> [Point2D](./Point2D.html)
- Multipoint: not used
- Polyline ->
  - [Line](./Line.html): if open shape and 2 points
  - [Protractor](./Protractor.html): if open shape and 3 points
  - [Rectangle](./Rectangle.html): if closed shape with 5 points that form 4 perpendicular lines
  - [ROI](./ROI.html): if closed shape and not rectangle
- Circle -> [Circle](./Circle.html)
- Ellipse -> [Ellipse](./Ellipse.html)

Closed shapes are polylines that have the same point as first and last item in their point list.

DWV uses the [Comprehensive 3D SR IOD](https://dicom.nema.org/medical/dicom/current/output/chtml/part03/sect_A.35.13.3.html#table_A.35.13-1) since it allows for the usage of the SCOORD3D value type.

### TID 1500 format

[TID 1500](https://dicom.nema.org/medical/dicom/2022a/output/chtml/part16/chapter_A.html#sect_TID_1500) is the root
template for a "Measurement Report". It consists of one "Imaging Measurements" container including (1-n) "Measurement Group". Measurement Groups can follow [TID 1410](https://dicom.nema.org/medical/dicom/2022a/output/chtml/part16/chapter_A.html#sect_TID_1410) "Planar ROI Measurements and Qualitative Evaluations" or [TID 1501](https://dicom.nema.org/medical/dicom/2022a/output/chtml/part16/chapter_A.html#sect_TID_1501) "Measurement and Qualitative Evaluation Group".

SR documents following TID 1500 include the root tag (0040,A504) "Content Template Sequence" attribute containing an item with (0008,0105) "Mapping Resource": “DCMR” and (0040,DB00) "Template Identifier": “1500”.

```bash
CONTAINER: (126000, DCM, 'Imaging Measurement Report') = SEPARATE
- (CONTAINS) CONTAINER: (126010, DCM, 'Imaging Measurements') = SEPARATE
  - (CONTAINS) CONTAINER: (125007, DCM, 'Measurement Group') = SEPARATE
    - (CONTAINS) SCOORD: (111030, DCM, 'Image Region') = POLYLINE {3.9113924503326416,5.8481011390686035,7.936708927154541,5.8481011390686035}
      - (SELECTED FROM) IMAGE: (121324, DCM, 'Source Image') = 1.2.826.0.1.3680043.9.7278.1.83798073110115.20240516075655.3.6 (class: 1.2.840.10008.5.1.4.1.1.4)
    - (HAS OBS CONTEXT) TEXT: (112039, DCM, 'Tracking Identifier') = clvovj8vyt5
    - (HAS OBS CONTEXT) UIDREF: (112040, DCM, 'Tracking Unique Identifier') = 1.2.826.0.1.3680043.9.7278.1.841149799107105110.20250407161832.1
    - (HAS CONCEPT MOD) TEXT: (125309, DCM, 'Short label') = {length}
    - (HAS CONCEPT MOD) TEXT: (718499004, SCT, 'Color') = #ffff80
    - (CONTAINS) NUM: (410668003, SCT, 'Length') = 4.025316455696 (mm, UCUM, 'Millimeter')
    - (CONTAINS) CODE: (111701, DCM, 'Processing type') = (123109, DCM, 'Manual Processing')
  - (CONTAINS) CONTAINER: (125007, DCM, 'Measurement Group') = SEPARATE
    - (CONTAINS) SCOORD: (111030, DCM, 'Image Region') = POLYLINE {15.98734188079834,5.8481011390686035,20.012659072875977,5.8481011390686035}
      - (SELECTED FROM) IMAGE: (121324, DCM, 'Source Image') = 1.2.826.0.1.3680043.9.7278.1.83798073110115.20240516075655.3.6 (class: 1.2.840.10008.5.1.4.1.1.4)
    - (HAS OBS CONTEXT) TEXT: (112039, DCM, 'Tracking Identifier') = zev6p8rale
    - (HAS OBS CONTEXT) UIDREF: (112040, DCM, 'Tracking Unique Identifier') = 1.2.826.0.1.3680043.9.7278.1.841149799107105110.20250407161846.2
    - (HAS CONCEPT MOD) TEXT: (125309, DCM, 'Short label') = {length}
    - (HAS CONCEPT MOD) TEXT: (718499004, SCT, 'Color') = #ffa348
    - (CONTAINS) NUM: (410668003, SCT, 'Length') = 4.025316455696 (mm, UCUM, 'Millimeter')
    - (CONTAINS) CODE: (111701, DCM, 'Processing type') = (123109, DCM, 'Manual Processing')
  - (CONTAINS) CONTAINER: (125007, DCM, 'Measurement Group') = SEPARATE
    - (CONTAINS) SCOORD: (111030, DCM, 'Image Region') = POLYLINE {15.98734188079834,18,20.012659072875977,18}
      - (SELECTED FROM) IMAGE: (121324, DCM, 'Source Image') = 1.2.826.0.1.3680043.9.7278.1.83798073110115.20240516075655.3.6 (class: 1.2.840.10008.5.1.4.1.1.4)
    - (HAS OBS CONTEXT) TEXT: (112039, DCM, 'Tracking Identifier') = 0kk336h6bglr
    - (HAS OBS CONTEXT) UIDREF: (112040, DCM, 'Tracking Unique Identifier') = 1.2.826.0.1.3680043.9.7278.1.841149799107105110.20250407161900.3
    - (HAS CONCEPT MOD) TEXT: (125309, DCM, 'Short label') = {length}
      - (HAS PROPERTIES) SCOORD: (122438, DCM, 'Reference Points') = POINT {7.101265907287598,20.506328582763672}
        - (SELECTED FROM) IMAGE: (121324, DCM, 'Source Image') = 1.2.826.0.1.3680043.9.7278.1.83798073110115.20240516075655.3.6 (class: 1.2.840.10008.5.1.4.1.1.4)
    - (HAS CONCEPT MOD) TEXT: (718499004, SCT, 'Color') = #ed333b
    - (CONTAINS) NUM: (410668003, SCT, 'Length') = 4.025316455696 (mm, UCUM, 'Millimeter')
    - (CONTAINS) CODE: (111701, DCM, 'Processing type') = (123109, DCM, 'Manual Processing')
```

Example DICOM SR file folowing the TID 1500 format with 3 rulers. Measurement Groups follow TID 1410.

### DWV 0.34 format (deprecated)

```bash
CONTAINER: (125007, DCM, 'Measurement Group') =
- (CONTAINS) SCOORD: (111030, DCM, 'Image Region') = POLYLINE {34.10658264160156,117.9686508178711,34.10658264160156,151.67398071289062,70.21943664550781,151.67398071289062,70.21943664550781,117.9686508178711,34.10658264160156,117.9686508178711}
  - (SELECTED FROM) IMAGE: (121324, DCM, 'Source Image') = 1.3.12.2.1107.5.2.32.35162.2012021516012434416358178 (class: )
  - (HAS PROPERTIES) UIDREF: (112039, DCM, 'Tracking Identifier') = kfszhdxf288
  - (HAS PROPERTIES) TEXT: (125309, DCM, 'Short label') = {surface}
  - (HAS PROPERTIES) TEXT: (718499004, SCT, 'Color') = #ed333b
  - (CONTAINS) NUM: (103355008, SCT, 'Width') = 36.11285266457679 (mm, UCUM, 'Millimeter')
  - (CONTAINS) NUM: (121207, DCM, 'Height') = 33.70532915360501 (mm, UCUM, 'Millimeter')
  - (CONTAINS) NUM: (42798000, SCT, 'Area') = 12.171955857352025 (cm2, UCUM, 'Square centimeter')
  - (CONTAINS) NUM: (113051, DCM, 'Pixel by pixel Minimum') = 5 (1, UCUM, 'No units')
  - (CONTAINS) NUM: (113048, DCM, 'Pixel by pixel Maximum') = 453 (1, UCUM, 'No units')
  - (CONTAINS) NUM: (113049, DCM, 'Pixel by pixel mean') = 196.90849673202615 (1, UCUM, 'No units')
- (CONTAINS) SCOORD: (111030, DCM, 'Image Region') = POLYLINE {63.487998962402344,111.10399627685547,63.487998962402344,158.20799255371094,117.76000213623047,158.20799255371094,117.76000213623047,111.10399627685547,63.487998962402344,111.10399627685547}
  - (SELECTED FROM) IMAGE: (121324, DCM, 'Source Image') = 1.3.12.2.1107.5.2.32.35162.2012021516012434416358178 (class: )
  - (HAS PROPERTIES) UIDREF: (112039, DCM, 'Tracking Identifier') = lldc837468f
  - (HAS PROPERTIES) TEXT: (125309, DCM, 'Short label') = {surface}
  - (HAS PROPERTIES) TEXT: (718499004, SCT, 'Color') = #ff7800
  - (HAS PROPERTIES) SCOORD3D: (128773, DCM, 'Reference Geometry') = MULTIPOINT {52.94638442993164,-73.748046875,108.52542114257812,-1,0,0,0,0,-1}
  - (CONTAINS) NUM: (103355008, SCT, 'Width') = 54.272000000000006 (mm, UCUM, 'Millimeter')
  - (CONTAINS) NUM: (121207, DCM, 'Height') = 47.10400000000001 (mm, UCUM, 'Millimeter')
  - (CONTAINS) NUM: (42798000, SCT, 'Area') = 25.56428288000001 (cm2, UCUM, 'Square centimeter')
  - (CONTAINS) NUM: (113051, DCM, 'Pixel by pixel Minimum') = 4 (1, UCUM, 'No units')
  - (CONTAINS) NUM: (113048, DCM, 'Pixel by pixel Maximum') = 597 (1, UCUM, 'No units')
  - (CONTAINS) NUM: (113049, DCM, 'Pixel by pixel mean') = 166.2642166344294 (1, UCUM, 'No units')
- (CONTAINS) SCOORD: (111030, DCM, 'Image Region') = POLYLINE {66.55999755859375,28.15999984741211,66.55999755859375,70.14399719238281,114.68800354003906,70.14399719238281,114.68800354003906,28.15999984741211,66.55999755859375,28.15999984741211}
  - (SELECTED FROM) IMAGE: (121324, DCM, 'Source Image') = 1.3.12.2.1107.5.2.32.35162.2012021516012434416358178 (class: )
  - (HAS PROPERTIES) UIDREF: (112039, DCM, 'Tracking Identifier') = 1qe1r1zue8o
  - (HAS PROPERTIES) TEXT: (125309, DCM, 'Short label') = {surface}
  - (HAS PROPERTIES) TEXT: (718499004, SCT, 'Color') = #33d17a
  - (HAS PROPERTIES) SCOORD3D: (128773, DCM, 'Reference Geometry') = MULTIPOINT {61.11238098144531,-151.4111328125,-13.127891540527344,-1,0,0,0,1,0}
  - (CONTAINS) NUM: (103355008, SCT, 'Width') = 48.128 (mm, UCUM, 'Millimeter')
  - (CONTAINS) NUM: (121207, DCM, 'Height') = 41.983999999999995 (mm, UCUM, 'Millimeter')
  - (CONTAINS) NUM: (42798000, SCT, 'Area') = 20.206059519999997 (cm2, UCUM, 'Square centimeter')
  - (CONTAINS) NUM: (113051, DCM, 'Pixel by pixel Minimum') = 3 (1, UCUM, 'No units')
  - (CONTAINS) NUM: (113048, DCM, 'Pixel by pixel Maximum') = 477 (1, UCUM, 'No units')
  - (CONTAINS) NUM: (113049, DCM, 'Pixel by pixel mean') = 125.14930555555556 (1, UCUM, 'No units')
```

Example DICOM SR file folowing the DWV 0.34 format with 3 rectangles: 1 on the acquisition plane and 2 on other planes. The `Reference Geometry` code is used to position annotations that are not on the acquisition plane.
