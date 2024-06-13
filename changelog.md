# Changelog

## [v0.33.1](https://github.com/ivmartel/dwv/releases/tag/v0.33.1) - 13/06/2024

### Fixed

- Wrong slice spacing for DICOM Seg [#1677](https://github.com/ivmartel/dwv/issues/1677)

## [v0.33.0](https://github.com/ivmartel/dwv/releases/tag/v0.33.0) - 06/06/2024

### Added

- Add set position to zoom tool [#1675](https://github.com/ivmartel/dwv/issues/1675)
- Allow to specify the root html document [#1670](https://github.com/ivmartel/dwv/issues/1670)
- Revise image spacing calculation [#1651](https://github.com/ivmartel/dwv/issues/1651)
- Cast value for UN tag write fix [#1645](https://github.com/ivmartel/dwv/issues/1645)
- Allow to deactivate UN tags fixing [#1642](https://github.com/ivmartel/dwv/issues/1642)
- Add url load 'forceLoader' option [#1629](https://github.com/ivmartel/dwv/issues/1629)
- Check number of frames value before adding dimension [#1615](https://github.com/ivmartel/dwv/issues/1615)
- Relax Accept header test for canLoadUrl methods [#1614](https://github.com/ivmartel/dwv/issues/1614)
- Allow scroll if at least one data of the layerGroup can [#1593](https://github.com/ivmartel/dwv/issues/1593)
- Allow to deactivate draw shortcuts [#1579](https://github.com/ivmartel/dwv/issues/1579)
- Allow to abort individual load [#1572](https://github.com/ivmartel/dwv/issues/1572)
- Allow to add missing tags while writing DICOM [#1561](https://github.com/ivmartel/dwv/issues/1561)
- Remove mouse and touch event position calculation [#1559](https://github.com/ivmartel/dwv/issues/1559)
- Add tags to image meta data [#1557](https://github.com/ivmartel/dwv/issues/1557)
- Rename WindowCenterAndWidth to voiLut [#1554](https://github.com/ivmartel/dwv/issues/1554)
- Rename rescaleLut to modalityLut [#1553](https://github.com/ivmartel/dwv/issues/1553)
- Allow to check image UIDs [#1550](https://github.com/ivmartel/dwv/issues/1550)
- Move label to bellow shape for circle and ellipse [#1539](https://github.com/ivmartel/dwv/issues/1539)
- Change draw colour according to layer [#1537](https://github.com/ivmartel/dwv/issues/1537)
- Add srclayerid to draw events [#1531](https://github.com/ivmartel/dwv/issues/1531)
- Store window/level in data view config [#1526](https://github.com/ivmartel/dwv/issues/1526)
- Change 'loaderror' and 'loadabort' event type [#1524](https://github.com/ivmartel/dwv/issues/1524)
- No loadend event when http requests fails [#1522](https://github.com/ivmartel/dwv/issues/1522)
- Store image smoothing setting for future layers [#1519](https://github.com/ivmartel/dwv/issues/1519)
- Send delete draw events on layer delete [#1518](https://github.com/ivmartel/dwv/issues/1518)
- Store current opacity and colour map in data view config [#1517](https://github.com/ivmartel/dwv/issues/1517)
- Add window level type [#1515](https://github.com/ivmartel/dwv/issues/1515)
- Add a colour map binder [#1508](https://github.com/ivmartel/dwv/issues/1508)
- Do not synchronise opacity if only one layer [#1506](https://github.com/ivmartel/dwv/issues/1506)
- Add support for writing DICOM with unknown VR [#1505](https://github.com/ivmartel/dwv/issues/1505)
- Set colour map by name in ViewConfig [#1499](https://github.com/ivmartel/dwv/issues/1499)
- Add units to draw quantification [#1489](https://github.com/ivmartel/dwv/issues/1489)
- Export draw controller type [#1488](https://github.com/ivmartel/dwv/issues/1488)
- Add opacity to dataViewConfig [#1464](https://github.com/ivmartel/dwv/issues/1464)
- Allow to change image smoothing from the app [#1463](https://github.com/ivmartel/dwv/issues/1463)
- Use string dataid, replace loadid with dataid [#1460](https://github.com/ivmartel/dwv/issues/1460)
- Add data index to draw events [#1457](https://github.com/ivmartel/dwv/issues/1457)
- Make scroll an option of the draw tool [#1456](https://github.com/ivmartel/dwv/issues/1456)
- Allow to set the active layer group [#1455](https://github.com/ivmartel/dwv/issues/1455)
- Make default properties available in shape quant [#1434](https://github.com/ivmartel/dwv/issues/1434)
- Allow to add and remove view configuration [#1431](https://github.com/ivmartel/dwv/issues/1431)
- Allow to override shape label text [#1429](https://github.com/ivmartel/dwv/issues/1429)
- Add support for PET SUV [#1418](https://github.com/ivmartel/dwv/issues/1418)
- Decouple data rescaling and view windowing [#1406](https://github.com/ivmartel/dwv/issues/1406)
- Add API to help with information overlay [#1383](https://github.com/ivmartel/dwv/issues/1383)
- Add support for writing DICOM seg [#1128](https://github.com/ivmartel/dwv/issues/1128)

### Fixed

- Overlay on zoomed layer [#1674](https://github.com/ivmartel/dwv/issues/1674)
- Wrong circle and ellipse quantification values for oriented views [#1662](https://github.com/ivmartel/dwv/issues/1662)
- Fix scroll sensitivity [#1634](https://github.com/ivmartel/dwv/issues/1634)
- Writer replace tags fails for implicit data [#1607](https://github.com/ivmartel/dwv/issues/1607)
- Fix anisotropic DICOM seg support [#1602](https://github.com/ivmartel/dwv/issues/1602)
- Fix abort [#1573](https://github.com/ivmartel/dwv/issues/1573)
- VR=xs breaks data writing [#1567](https://github.com/ivmartel/dwv/issues/1567)
- VR=OB and bitsAllocated=16 breaks data writing [#1566](https://github.com/ivmartel/dwv/issues/1566)
- `getIndexFromStringId` does not handle X only index [#1562](https://github.com/ivmartel/dwv/issues/1562)
- Wrong anchor position on circle edit undo [#1540](https://github.com/ivmartel/dwv/issues/1540)
- View shift on resize of an MPR view [#1535](https://github.com/ivmartel/dwv/issues/1535)
- TypeError: Cannot set property type of [object Event]... [#1523](https://github.com/ivmartel/dwv/issues/1523)
- Crosshair gets out of layer [#1494](https://github.com/ivmartel/dwv/issues/1494)
- Draws move on resize [#1493](https://github.com/ivmartel/dwv/issues/1493)
- Error when moving anchor out of canvas [#1492](https://github.com/ivmartel/dwv/issues/1492)
- Shape does not follow roi anchors  [#1491](https://github.com/ivmartel/dwv/issues/1491)
- Wrong measurements in MPR views [#1473](https://github.com/ivmartel/dwv/issues/1473)
- Draw deletion in MPR [#1468](https://github.com/ivmartel/dwv/issues/1468)
- Image offset and oriented incorrectly [#1459](https://github.com/ivmartel/dwv/issues/1459)
- data change bug in viewer [#1424](https://github.com/ivmartel/dwv/issues/1424)
- drawlayer bug when changing data view [#1423](https://github.com/ivmartel/dwv/issues/1423)
- Bad transfer syntax for data with no DCIM prefix [#1416](https://github.com/ivmartel/dwv/issues/1416)
- Image data range and rescaled range are not correct [#1404](https://github.com/ivmartel/dwv/issues/1404)

---

## [v0.32.6](https://github.com/ivmartel/dwv/releases/tag/v0.32.6) - 17/04/2024

### Fixed

- Fix npm publish [#1656](https://github.com/ivmartel/dwv/issues/1656)

## [v0.32.5](https://github.com/ivmartel/dwv/releases/tag/v0.32.5) - 17/04/2024

### Fixed

- Image does not completely fill div [#1655](https://github.com/ivmartel/dwv/issues/1655)

## [v0.32.4](https://github.com/ivmartel/dwv/releases/tag/v0.32.4) - 18/03/2024

### Fixed

- event.preventDefault for wheel events [#1632](https://github.com/ivmartel/dwv/issues/1632)

## [v0.32.3](https://github.com/ivmartel/dwv/releases/tag/v0.32.3) - 22/09/2023

### Added

- Add support for writing DICOM with unknown VR [#1507](https://github.com/ivmartel/dwv/issues/1481)

## [v0.32.2](https://github.com/ivmartel/dwv/releases/tag/v0.32.2) - 04/09/2023

### Added

- Add app options type  [#1481](https://github.com/ivmartel/dwv/issues/1481)
- Add data element type [#1474](https://github.com/ivmartel/dwv/issues/1474)
- Export luts as plural not singular [#1478](https://github.com/ivmartel/dwv/issues/1478)
- Add data view config type [#1475](https://github.com/ivmartel/dwv/issues/1475)
- Use File[] and not Filelist [#1476](https://github.com/ivmartel/dwv/issues/1476)

## [v0.32.1](https://github.com/ivmartel/dwv/releases/tag/v0.32.1) - 19/06/2023

### Added

- Update API to provide image creation and state apply [#1410](https://github.com/ivmartel/dwv/issues/1410)
- Change babel configuration [#1409](https://github.com/ivmartel/dwv/issues/1409)

### Fixed

- Uncaught TypeError: t.findOne is not a function [#1392](https://github.com/ivmartel/dwv/issues/1392)

---

## [v0.32.0](https://github.com/ivmartel/dwv/releases/tag/v0.32.0) - 02/06/2023

### Added

- Make dwv importable as an es6 module [#399](https://github.com/ivmartel/dwv/issues/399)
- typings [#669](https://github.com/ivmartel/dwv/issues/669)
- Follow DICOM json standard [#1071](https://github.com/ivmartel/dwv/issues/1071)

### Fixed

- Unknown VR breaks code [#1325](https://github.com/ivmartel/dwv/issues/1325)

---

## [v0.31.2](https://github.com/ivmartel/dwv/releases/tag/v0.31.2) - 07/05/2023

### Fixed

- Cannot run thread after stop [#1358](https://github.com/ivmartel/dwv/issues/1358)
- Error in objectToArray [#1354](https://github.com/ivmartel/dwv/issues/1354)

### Added

- Add source to dicom load errors [#1355](https://github.com/ivmartel/dwv/issues/1355)

---

## [v0.31.1](https://github.com/ivmartel/dwv/releases/tag/v0.31.1) - 27/04/2023

### Fixed

- MPR bad offset when loading larger data [#1348](https://github.com/ivmartel/dwv/issues/1348)
- DICOM seg loading failure 'Test distance is increasing' [#1347](https://github.com/ivmartel/dwv/issues/1347)
- Error when accessing modality w/l presets [#1346](https://github.com/ivmartel/dwv/issues/1346)

---

## [v0.31.0](https://github.com/ivmartel/dwv/releases/tag/v0.31.0) - 07/03/2023

### Added

- Add support for MIME multipart content-type [#1084](https://github.com/ivmartel/dwv/issues/1084)
- Add support for reading DICOM Seg [#932](https://github.com/ivmartel/dwv/issues/932)
- Update dictionary to 2022a [#1219](https://github.com/ivmartel/dwv/issues/1219)
- Add crosshair to layer groups [#1286](https://github.com/ivmartel/dwv/issues/1286)
- Add pixel value on mouseover [#1273](https://github.com/ivmartel/dwv/issues/1273)

- Remove i18next [#1320](https://github.com/ivmartel/dwv/issues/1320)
- Allow for mouse wheel scroll in tools that do not use the mouse wheel [#1319](https://github.com/ivmartel/dwv/issues/1319)
- Change draw shape opacity on mouse over [#1318](https://github.com/ivmartel/dwv/issues/1318)
- Make mouse wheel scroll multi frame data [#1316](https://github.com/ivmartel/dwv/issues/1316)
- Use event key property and not keyCode (deprecated) [#1305](https://github.com/ivmartel/dwv/issues/1305)
- Use passive event listeners [#1304](https://github.com/ivmartel/dwv/issues/1304)
- Send draw create/delete events when Draw tool is not selected [#1301](https://github.com/ivmartel/dwv/issues/1301)
- Use lowest image position patient as geometry origin [#1282](https://github.com/ivmartel/dwv/issues/1282)
- Revise layer id creation to avoid collision [#1277](https://github.com/ivmartel/dwv/issues/1277)
- Simplify tool configuration in app.init [#1269](https://github.com/ivmartel/dwv/issues/1269)
- Allow to set the image smoothing [#1247](https://github.com/ivmartel/dwv/issues/1247)
- Recalculate vl at writing time [#1240](https://github.com/ivmartel/dwv/issues/1240)
- Fix reading sequence items [#1231](https://github.com/ivmartel/dwv/issues/1231)
- Remove vr=OW and bitsAllocated=8 warning [#1225](https://github.com/ivmartel/dwv/issues/1225)
- Move to clean-jsdoc-theme [#1212](https://github.com/ivmartel/dwv/issues/1212)
- Simplify Application tool API [#1203](https://github.com/ivmartel/dwv/issues/1203)
- Add index to iterator next returned object [#1202](https://github.com/ivmartel/dwv/issues/1202)
- Allow to override slice sorting [#1185](https://github.com/ivmartel/dwv/issues/1185)
- Make scroll from trackpad less sensitive [#1184](https://github.com/ivmartel/dwv/issues/1184)
- Use same pixel ratio for multiple views [#1182](https://github.com/ivmartel/dwv/issues/1182)
- Add loadid and isfirstitem to 'loaditem' event [#1180](https://github.com/ivmartel/dwv/issues/1180)
- Add intermediates slices when creating mask [#1176](https://github.com/ivmartel/dwv/issues/1176)
- Fix negative index in worldToIndex [#1163](https://github.com/ivmartel/dwv/issues/1163)
- Smaller data disapears in MPR [#1162](https://github.com/ivmartel/dwv/issues/1162)
- Window level tool proportional to data range [#1160](https://github.com/ivmartel/dwv/issues/1160)
- Do not throw error when no data view config [#1155](https://github.com/ivmartel/dwv/issues/1155)
- Improve writer size calculation [#1142](https://github.com/ivmartel/dwv/issues/1142)
- Overlay does not compensate for offset at each slice [#1133](https://github.com/ivmartel/dwv/issues/1133)
- Avoid postion - index conversion in view [#1130](https://github.com/ivmartel/dwv/issues/1130)
- Overlay data freezes when out of range [#1129](https://github.com/ivmartel/dwv/issues/1129)
- Race condition for multiple loadURLs [#1121](https://github.com/ivmartel/dwv/issues/1121)
- Move getElementsFromJSONTags to make it public [#1114](https://github.com/ivmartel/dwv/issues/1114)
- Application fitToContainer should resize all layer groups [#1113](https://github.com/ivmartel/dwv/issues/1113)
- Clip values in ciexyz to srgb conversion [#1112](https://github.com/ivmartel/dwv/issues/1112)
- Replace string substr (deprecated) with substring [#1089](https://github.com/ivmartel/dwv/issues/1089)
- Update CI to use node 16 [#1080](https://github.com/ivmartel/dwv/issues/1080)

### Fixed

- Fix SpecificCharacterSet when writing DICOM data [#1088](https://github.com/ivmartel/dwv/issues/1088)
- Bad normal construction [#1264](https://github.com/ivmartel/dwv/issues/1264)
- An exception was caught when onResize was called [#1233](https://github.com/ivmartel/dwv/issues/1233)
- readUint64Array is not defined [#1220](https://github.com/ivmartel/dwv/issues/1220)
- Fix tag isPrivate method [#1218](https://github.com/ivmartel/dwv/issues/1218)
- Microsoft Edge and Google Drive data [#214](https://github.com/ivmartel/dwv/issues/214)

---

## [v0.30.8](https://github.com/ivmartel/dwv/releases/tag/v0.30.8) - 03/01/2022

### Fixed

- Load state shape does not show on correct slice [#1078](https://github.com/ivmartel/dwv/issues/1078)
- TypeError: point.get is not a function when loading state [#1077](https://github.com/ivmartel/dwv/issues/1077)
- Uncaught TypeError: t.getX is not a function when saving state [#1072](https://github.com/ivmartel/dwv/issues/1072)

---

## [v0.30.7](https://github.com/ivmartel/dwv/releases/tag/v0.30.7) - 28/12/2021

### Fixed

- Pinch zoom is not working [#1070](https://github.com/ivmartel/dwv/issues/1070)

---

## [v0.30.6](https://github.com/ivmartel/dwv/releases/tag/v0.30.6) - 20/12/2021

### Fixed

- Zoom does not stay centred with overlay data [#1066](https://github.com/ivmartel/dwv/issues/1066)
- Image limit for offset overlap [#1065](https://github.com/ivmartel/dwv/issues/1065)

---

## [v0.30.5](https://github.com/ivmartel/dwv/releases/tag/v0.30.5) - 16/12/2021

### Fixed

- Allow to play multi-frame data [#1064](https://github.com/ivmartel/dwv/issues/1064)
- Allow scroll for multi-frame data [#1063](https://github.com/ivmartel/dwv/issues/1063)
- Stop worker if no tasks left [#1062](https://github.com/ivmartel/dwv/issues/1062)

---

## [v0.30.4](https://github.com/ivmartel/dwv/releases/tag/v0.30.4) - 10/12/2021

### Fixed

- Load i18next plugins as modules [#1057](https://github.com/ivmartel/dwv/issues/1057)
- Update overlays after event data change [#1056](https://github.com/ivmartel/dwv/issues/1056)

### Dependencies

- Replace i18next-xhr-backend with i18next-http-backend [#1049](https://github.com/ivmartel/dwv/issues/1049)

---

## [v0.30.3](https://github.com/ivmartel/dwv/releases/tag/v0.30.3) - 09/12/2021

### Fixed

- y.Group is not a constructor [#1055](https://github.com/ivmartel/dwv/issues/1055)

---

## [v0.30.2](https://github.com/ivmartel/dwv/releases/tag/v0.30.2) - 07/12/2021

### Added

- Add browserlist to package.json [#1052](https://github.com/ivmartel/dwv/issues/1052)
- Add engines to package.json [#1050](https://github.com/ivmartel/dwv/issues/1050)

### Fixed

- require() of ES modules is not supported [#1045](https://github.com/ivmartel/dwv/issues/1045)

---

## [v0.30.1](https://github.com/ivmartel/dwv/releases/tag/v0.30.1) - 03/12/2021

### Fixed

- Missing class for Konva [#1044](https://github.com/ivmartel/dwv/issues/1044)

---

## [v0.30.0](https://github.com/ivmartel/dwv/releases/tag/v0.30.0) - 02/12/2021

### Added

- Allow for manual frame add [#1034](https://github.com/ivmartel/dwv/issues/1034)
- Add support for multi-resolution data [#1003](https://github.com/ivmartel/dwv/issues/1003)
- Remove coveralls and use karma coverage check [#1002](https://github.com/ivmartel/dwv/issues/1002)
- Use the same (web) worker for multiple data decode [#993](https://github.com/ivmartel/dwv/issues/993)
- Add text encoding in data writer [#963](https://github.com/ivmartel/dwv/issues/963)
- Support anisotropic pixels [#952](https://github.com/ivmartel/dwv/issues/952)
- Check data allocation size to avoid error [#951](https://github.com/ivmartel/dwv/issues/951)
- Allow to load files based on UID [#949](https://github.com/ivmartel/dwv/issues/949)
- Simplify image class data storage [#905](https://github.com/ivmartel/dwv/issues/905)
- Multi-slice view [#133](https://github.com/ivmartel/dwv/issues/133)
- Add MPR [#4](https://github.com/ivmartel/dwv/issues/4)

### Fixed

- Check var length before accessing it [#1017](https://github.com/ivmartel/dwv/issues/1017)
- Drag&drop of the ruler label causes console errors [#994](https://github.com/ivmartel/dwv/issues/994)

---

## [v0.29.1](https://github.com/ivmartel/dwv/releases/tag/v0.29.1) - 11/06/2021

### Added

- Reduce z-index of draw layers [#945](https://github.com/ivmartel/dwv/issues/945)
- Postpone DOM first access [#944](https://github.com/ivmartel/dwv/issues/944)

---

## [v0.29.0](https://github.com/ivmartel/dwv/releases/tag/v0.29.0) - 03/06/2021

### Breaking

- Allow for multiple image layers [#893](https://github.com/ivmartel/dwv/issues/893)
- Move roi meta data to meta object [#883](https://github.com/ivmartel/dwv/issues/883)

### Added

- Add utilities for CIE lab colour conversion [#940](https://github.com/ivmartel/dwv/issues/940)
- Send draw creation events at state load [#939](https://github.com/ivmartel/dwv/issues/939)
- Recurse in sequences when extracting meta data [#921](https://github.com/ivmartel/dwv/issues/921)
- Add support for binary data [#919](https://github.com/ivmartel/dwv/issues/919)
- Use the wheel event [#917](https://github.com/ivmartel/dwv/issues/917)
- Remove bower configuration [#913](https://github.com/ivmartel/dwv/issues/913)
- Move to Github actions [#912](https://github.com/ivmartel/dwv/issues/912)
- Mouse drag: Lowering WW below 0 Exception [#903](https://github.com/ivmartel/dwv/issues/903)
- Add shadow to text and background to label [#889](https://github.com/ivmartel/dwv/issues/889)
- Fix label text size [#887](https://github.com/ivmartel/dwv/issues/887)
- Allow to change the image layer opacity [#886](https://github.com/ivmartel/dwv/issues/886)
- Add circle draw shape [#885](https://github.com/ivmartel/dwv/issues/885)
- Add median, 25% and 75% percentiles to shape quantification [#877](https://github.com/ivmartel/dwv/issues/877)
- Add pixel quantification for ellipse [#871](https://github.com/ivmartel/dwv/issues/871)
- Out of view text [#151](https://github.com/ivmartel/dwv/issues/151)

---

## [v0.28.2](https://github.com/ivmartel/dwv/releases/tag/v0.28.2) - 20/04/2021

### Fixed

- Do not force i18next dependency [#910](https://github.com/ivmartel/dwv/issues/910)

---

## [v0.28.1](https://github.com/ivmartel/dwv/releases/tag/v0.28.1) - 02/02/2021

### Fixed

- TypeError: i18next.t is not a function [#862](https://github.com/ivmartel/dwv/issues/862)

---

## [v0.28.0](https://github.com/ivmartel/dwv/releases/tag/v0.28.0) - 28/01/2021

### Breaking

- Remove hyphen from event types [#808](https://github.com/ivmartel/dwv/issues/808)

### Added

- Do not use smoothing for image display [#850](https://github.com/ivmartel/dwv/issues/850)
- Add a shortcut to exit draw creation [#849](https://github.com/ivmartel/dwv/issues/849)
- Handle no root case in decodeKeyValueUri [#843](https://github.com/ivmartel/dwv/issues/843)
- Add load benchmark to tests [#840](https://github.com/ivmartel/dwv/issues/840)
- Relax checks for meta data merge [#828](https://github.com/ivmartel/dwv/issues/828)
- Make first render optional [#826](https://github.com/ivmartel/dwv/issues/826)
- Use event name in overlays.json files [#824](https://github.com/ivmartel/dwv/issues/824)
- Send event data in the 'value' property [#813](https://github.com/ivmartel/dwv/issues/813)
- Private sequences with undefined length and explicit VR=UN [#799](https://github.com/ivmartel/dwv/issues/799)
- Add pixel generator from file [#795](https://github.com/ivmartel/dwv/issues/795)
- Move wiki pages to doc [#789](https://github.com/ivmartel/dwv/issues/789)
- Enforce code styling [#782](https://github.com/ivmartel/dwv/issues/782)
- Use a logger class [#781](https://github.com/ivmartel/dwv/issues/781)
- Use image iterators to generate view [#749](https://github.com/ivmartel/dwv/issues/749)
- Stop using PhantomJS [#719](https://github.com/ivmartel/dwv/issues/719)

### Fixed

- Wrong data size calculation for DicomWriter [#809](https://github.com/ivmartel/dwv/issues/809)
- Node deprecation [#614](https://github.com/ivmartel/dwv/issues/614)
- Cannot delete a draw when the cross overlaps with overlays [#552](https://github.com/ivmartel/dwv/issues/552)

### Dependencies

- Update Konva to v7 [#853](https://github.com/ivmartel/dwv/issues/853)
- Update magic-wand [#788](https://github.com/ivmartel/dwv/issues/788)
- Update i18next to v19 [#727](https://github.com/ivmartel/dwv/issues/727)

---

## [v0.27.1](https://github.com/ivmartel/dwv/releases/tag/v0.27.1) - 24/09/2020

### Added

- Merge #767 into v0.27.1 [#773](https://github.com/ivmartel/dwv/issues/773)
- Use image iterators to generate view [#749](https://github.com/ivmartel/dwv/issues/749)
- Stop using PhantomJS [#719](https://github.com/ivmartel/dwv/issues/719)

### Fixed

- Select multiple local Dcm files and report errors. [#755](https://github.com/ivmartel/dwv/issues/755)
- dwv 0.27.0 loadImageObject not work [#739](https://github.com/ivmartel/dwv/issues/739)
- Null first buffer element at image contruction [#712](https://github.com/ivmartel/dwv/issues/712)
- Node deprecation [#614](https://github.com/ivmartel/dwv/issues/614)

### Dependencies

- Update i18next to v19 [#727](https://github.com/ivmartel/dwv/issues/727)
- Update Konva to v4 [#726](https://github.com/ivmartel/dwv/issues/726)

---

## [v0.27.0](https://github.com/ivmartel/dwv/releases/tag/v0.27.0) - 11/03/2020

### Breaking

- Refactor data load events and handlers [#701](https://github.com/ivmartel/dwv/issues/701)

### Added

- Get merged tags for multislice data [#690](https://github.com/ivmartel/dwv/issues/690)
- Remove gui specific code [#679](https://github.com/ivmartel/dwv/issues/679)
- Add support for PALETTE COLOR photometric interpretation [#664](https://github.com/ivmartel/dwv/issues/664)
- Add support for YBR photometric interpretation [#63](https://github.com/ivmartel/dwv/issues/63)

### Fixed

- window.onResize is a memory leak and does not allow multiple dwv app instances at once [#705](https://github.com/ivmartel/dwv/issues/705)
- RLE decompression fails on 16bits data [#670](https://github.com/ivmartel/dwv/issues/670)

---

## [v0.26.0](https://github.com/ivmartel/dwv/releases/tag/v0.26.0) - 12/05/2019

### Added

- More robust url parsing [#650](https://github.com/ivmartel/dwv/issues/650)
- Add support for RLE encoded data [#636](https://github.com/ivmartel/dwv/issues/636)
- Use ImageNumber to sort slice when ImagePosition is not present [#592](https://github.com/ivmartel/dwv/issues/592)
- slow processing speed when loading series with more than 100 Slices [#559](https://github.com/ivmartel/dwv/issues/559)
- Remove a drawing by id [#557](https://github.com/ivmartel/dwv/issues/557)
- Check memory usage for second image load [#397](https://github.com/ivmartel/dwv/issues/397)
- Allow to load DICOM with no DICM preamble [#188](https://github.com/ivmartel/dwv/issues/188)

### Fixed

- Unable to abort RawImageLoader requests [#583](https://github.com/ivmartel/dwv/issues/583)

### Dependencies

- An in-range update of grunt-jsdoc is breaking the build 🚨 [#651](https://github.com/ivmartel/dwv/issues/651)
- An in-range update of i18next-browser-languagedetector is breaking the build 🚨 [#605](https://github.com/ivmartel/dwv/issues/605)
- An in-range update of konva is breaking the build 🚨 [#603](https://github.com/ivmartel/dwv/issues/603)
- An in-range update of grunt-cli is breaking the build 🚨 [#602](https://github.com/ivmartel/dwv/issues/602)

---

## [v0.25.2](https://github.com/ivmartel/dwv/releases/tag/v0.25.2) - 08/10/2018

### Added

- More generic layer container size calculation [#581](https://github.com/ivmartel/dwv/issues/581)

---

## [v0.25.1](https://github.com/ivmartel/dwv/releases/tag/v0.25.1) - 04/10/2018

### Added

- Improve layer container size calculation [#580](https://github.com/ivmartel/dwv/issues/580)

---

## [v0.25.0](https://github.com/ivmartel/dwv/releases/tag/v0.25.0) - 02/10/2018

### Breaking

- Use container size as reference [#579](https://github.com/ivmartel/dwv/issues/579)

---

## [v0.24.1](https://github.com/ivmartel/dwv/releases/tag/v0.24.1) - 25/09/2018

### Added

- Allow to load DICOMDIR with extension [#568](https://github.com/ivmartel/dwv/issues/568)
- Add a width check at window level creation [#567](https://github.com/ivmartel/dwv/issues/567)

---

## [v0.24.0](https://github.com/ivmartel/dwv/releases/tag/v0.24.0) - 24/08/2018

### Added

- image data processing speed is very slow [#540](https://github.com/ivmartel/dwv/issues/540)
- Allow to delete a draw using `Supr` key [#525](https://github.com/ivmartel/dwv/issues/525)
- Add tests for the dwv.image.ImageFactory [#479](https://github.com/ivmartel/dwv/issues/479)
- Add support for DICOMDIR [#425](https://github.com/ivmartel/dwv/issues/425)

### Fixed

- Wado non dicom does not get loaded [#553](https://github.com/ivmartel/dwv/issues/553)
- Cant load state in Microsoft Edge [#551](https://github.com/ivmartel/dwv/issues/551)
- Check for same image orientation when appending slices [#466](https://github.com/ivmartel/dwv/issues/466)

---

## [v0.23.6](https://github.com/ivmartel/dwv/releases/tag/v0.23.6) - 13/06/2018

### Added

- Better placement of the delete draw arrow [#517](https://github.com/ivmartel/dwv/issues/517)
- Adapt shape extras to scale [#516](https://github.com/ivmartel/dwv/issues/516)

### Fixed

- Cannot load state with multiple drawings [#515](https://github.com/ivmartel/dwv/issues/515)
- Freehand anchors do not stick [#505](https://github.com/ivmartel/dwv/issues/505)

---

## [v0.23.5](https://github.com/ivmartel/dwv/releases/tag/v0.23.5) - 07/06/2018

### Added

- Add public access to the DICOM tags [#498](https://github.com/ivmartel/dwv/issues/498)
- Change draw interaction for mouse events [#492](https://github.com/ivmartel/dwv/issues/492)

### Fixed

- Fix module.exports [#491](https://github.com/ivmartel/dwv/issues/491)

---

## [v0.23.4](https://github.com/ivmartel/dwv/releases/tag/v0.23.4) - 18/04/2018

### Added

- Update build process [#480](https://github.com/ivmartel/dwv/issues/480)

---

## [v0.23.3](https://github.com/ivmartel/dwv/releases/tag/v0.23.3) - 25/03/2018

### Fixed

- Running Modernizr tests at startup crashes node [#474](https://github.com/ivmartel/dwv/issues/474)

---

## [v0.23.2](https://github.com/ivmartel/dwv/releases/tag/v0.23.2) - 19/03/2018

### Added

- Use event.currentTarget and not this in handlers [#471](https://github.com/ivmartel/dwv/issues/471)

---

## [v0.23.1](https://github.com/ivmartel/dwv/releases/tag/v0.23.1) - 18/03/2018

### Added

- Include modernizr as part of the code [#467](https://github.com/ivmartel/dwv/issues/467)
- Add Romanian language [#465](https://github.com/ivmartel/dwv/issues/465)

### Fixed

- Fix AMD module wrapping [#468](https://github.com/ivmartel/dwv/issues/468)

---

## [v0.23.0](https://github.com/ivmartel/dwv/releases/tag/v0.23.0) - 11/03/2018

### Added

- Can't set path for resources. [#457](https://github.com/ivmartel/dwv/issues/457)
- DICOM Compliance [#449](https://github.com/ivmartel/dwv/issues/449)
- Reduce Konva layer/canvas usage [#442](https://github.com/ivmartel/dwv/issues/442)
- Consider using ServiceWorker for offline support [#213](https://github.com/ivmartel/dwv/issues/213)

### Fixed

- IE11: Object doesn't support property or method 'startsWith' [#441](https://github.com/ivmartel/dwv/issues/441)

---

## [v0.22.1](https://github.com/ivmartel/dwv/releases/tag/v0.22.1) - 19/12/2017

### Added

- Cannot append a slice with different number of columns [#433](https://github.com/ivmartel/dwv/issues/433)

### Fixed

- Line shapes are difficult to grab [#440](https://github.com/ivmartel/dwv/issues/440)
- Floating shape when dragging [#439](https://github.com/ivmartel/dwv/issues/439)
- MONOCHROME1 photometric interpretation does not display correctly [#435](https://github.com/ivmartel/dwv/issues/435)

---

## [v0.22.0](https://github.com/ivmartel/dwv/releases/tag/v0.22.0) - 30/11/2017

### Added

- Make mouse-wheel and mouse-move coherent for scroll [#427](https://github.com/ivmartel/dwv/issues/427)
- Misprint in label [#426](https://github.com/ivmartel/dwv/issues/426)
- Add folder support on file input [#424](https://github.com/ivmartel/dwv/issues/424)
- Allow to cancel a file download and/or display [#412](https://github.com/ivmartel/dwv/issues/412)
- Update conquest lua scripts [#406](https://github.com/ivmartel/dwv/issues/406)
- DicomWriter transfer syntax limit [#343](https://github.com/ivmartel/dwv/issues/343)

### Fixed

- Listen for init and not loaded before using i18next [#418](https://github.com/ivmartel/dwv/issues/418)

### Dependencies

- An in-range update of i18next is breaking the build 🚨 [#417](https://github.com/ivmartel/dwv/issues/417)

---

## [v0.21.0](https://github.com/ivmartel/dwv/releases/tag/v0.21.0) - 28/09/2017

### Added

- Update jquery-ui to 1.12.1 [#403](https://github.com/ivmartel/dwv/issues/403)
- Add filter execution events [#402](https://github.com/ivmartel/dwv/issues/402)
- More precise window/level and zoom change events [#395](https://github.com/ivmartel/dwv/issues/395)
- Update JPEGLosslessDecoderJS to the latest version [#394](https://github.com/ivmartel/dwv/issues/394)

### Fixed

- The .min version uses " ext/rii-mango/decode-jpeg loss.js" but doesn't exist in this version /ext folder [#383](https://github.com/ivmartel/dwv/issues/383)

### Dependencies

- An in-range update of konva is breaking the build 🚨 [#380](https://github.com/ivmartel/dwv/issues/380)

---

## [v0.20.1](https://github.com/ivmartel/dwv/releases/tag/v0.20.1) - 09/07/2017

### Added

- Only use character set decoding on specific VR [#368](https://github.com/ivmartel/dwv/issues/368)
- Do not create new TextDecoders at each decode [#365](https://github.com/ivmartel/dwv/issues/365)

---

## [v0.20.0](https://github.com/ivmartel/dwv/releases/tag/v0.20.0) - 28/06/2017

### Added

- Allow for easier file loader integration [#337](https://github.com/ivmartel/dwv/issues/337)
- Use a top of page line progress for the mobile viewer [#333](https://github.com/ivmartel/dwv/issues/333)
- Import data from video file [#328](https://github.com/ivmartel/dwv/issues/328)
- Do not show mesures when no pixel spacing is set [#302](https://github.com/ivmartel/dwv/issues/302)

### Fixed

- Touch scroll triggers slice play [#361](https://github.com/ivmartel/dwv/issues/361)
- Keep TypedArray type in image append [#360](https://github.com/ivmartel/dwv/issues/360)
- Dicom writer error: Offset is outside the bounds [#335](https://github.com/ivmartel/dwv/issues/335)
- Input color not available on Safari [#330](https://github.com/ivmartel/dwv/issues/330)

---

## [v0.19.2](https://github.com/ivmartel/dwv/releases/tag/v0.19.2) - 19/04/2017

### Fixed

- Fix MagicWand dependency [#326](https://github.com/ivmartel/dwv/issues/326)

---

## [v0.19.1](https://github.com/ivmartel/dwv/releases/tag/v0.19.1) - 13/04/2017

### Added

- Fix dwv modules [#325](https://github.com/ivmartel/dwv/issues/325)

---

## [v0.19.0](https://github.com/ivmartel/dwv/releases/tag/v0.19.0) - 12/04/2017

### Added

- Investigate using Konvajs [#152](https://github.com/ivmartel/dwv/issues/152)

---

## [v0.18.0](https://github.com/ivmartel/dwv/releases/tag/v0.18.0) - 29/03/2017

### Added

- Add support for different image orientation [#317](https://github.com/ivmartel/dwv/issues/317)
- Add support for per slice window/level [#316](https://github.com/ivmartel/dwv/issues/316)
- Allow for mouse wheel frame navigation [#310](https://github.com/ivmartel/dwv/issues/310)
- Update CI PhantomJs to 2.1 [#287](https://github.com/ivmartel/dwv/issues/287)

### Fixed

- HTTP 403 error when accessing Googe Drive data [#215](https://github.com/ivmartel/dwv/issues/215)

---

## [v0.17.0](https://github.com/ivmartel/dwv/releases/tag/v0.17.0) - 23/12/2016

### Added

- Allow for individual draw display toggle [#293](https://github.com/ivmartel/dwv/issues/293)
- Add a free-hand draw tool [#292](https://github.com/ivmartel/dwv/issues/292)
- Add an annotation draw tool [#291](https://github.com/ivmartel/dwv/issues/291)
- Change the line tool into a ruler [#290](https://github.com/ivmartel/dwv/issues/290)
- Add a play slice/frame [#289](https://github.com/ivmartel/dwv/issues/289)
- Create a DrawController [#284](https://github.com/ivmartel/dwv/issues/284)
- Allow to delete all drawings [#283](https://github.com/ivmartel/dwv/issues/283)
- Avoid race condition in applaunchers [#265](https://github.com/ivmartel/dwv/issues/265)
- Show list of drawings [#5](https://github.com/ivmartel/dwv/issues/5)

### Fixed

- Spaces are lost when in state content [#277](https://github.com/ivmartel/dwv/issues/277)
- Image not Opening (page crashes) [#236](https://github.com/ivmartel/dwv/issues/236)

---

## [v0.16.1](https://github.com/ivmartel/dwv/releases/tag/v0.16.1) - 03/10/2016

### Added

- Add TypedArray slice implementation for signed data [#275](https://github.com/ivmartel/dwv/issues/275)
- Better i18n locale folder initialisation [#274](https://github.com/ivmartel/dwv/issues/274)
- Add GB2312 character set support [#273](https://github.com/ivmartel/dwv/issues/273)
- Suppose same min/max for all frames [#267](https://github.com/ivmartel/dwv/issues/267)
- Initialise Livewire only when displayed [#266](https://github.com/ivmartel/dwv/issues/266)
- Updated jquery-ui to 1.12.0 [#263](https://github.com/ivmartel/dwv/issues/263)
- Add annotation tool [#64](https://github.com/ivmartel/dwv/issues/64)

### Fixed

- Use correct Chinese language code [#272](https://github.com/ivmartel/dwv/issues/272)
- Ellipse surface goes negative [#271](https://github.com/ivmartel/dwv/issues/271)
- PixelData parse error. PixelData VR=OB,TransferSyntax=1.2.840.10008.1.2.1 [#270](https://github.com/ivmartel/dwv/issues/270)
- Uncaught unknown JPEG marker ffff [#262](https://github.com/ivmartel/dwv/issues/262)

---

## [v0.16.0](https://github.com/ivmartel/dwv/releases/tag/v0.16.0) - 23/08/2016

### Added

- Allow multi frame synchronous decoding [#260](https://github.com/ivmartel/dwv/issues/260)
- Add global decoding web workers setting [#259](https://github.com/ivmartel/dwv/issues/259)

---

## [v0.15.0](https://github.com/ivmartel/dwv/releases/tag/v0.15.0) - 21/07/2016

### Added

- Allow to enforce the Character Set [#254](https://github.com/ivmartel/dwv/issues/254)
- Add support for character sets [#248](https://github.com/ivmartel/dwv/issues/248)
- Store frames as array elements [#246](https://github.com/ivmartel/dwv/issues/246)
- Allow for external tool addition [#242](https://github.com/ivmartel/dwv/issues/242)
- Simplify DICOM sequences parsing [#240](https://github.com/ivmartel/dwv/issues/240)
- Add next/previous slice key binding [#234](https://github.com/ivmartel/dwv/issues/234)
- Multi-language support [#220](https://github.com/ivmartel/dwv/issues/220)
- Add support for multi frame data [#132](https://github.com/ivmartel/dwv/issues/132)

### Fixed

- Fix empty sequence tag support [#238](https://github.com/ivmartel/dwv/issues/238)
- Cannot draw on multislice data [#230](https://github.com/ivmartel/dwv/issues/230)

---

## [v0.14.0](https://github.com/ivmartel/dwv/releases/tag/v0.14.0) - 09/03/2016

### Added

- Update demo and test to use https [#216](https://github.com/ivmartel/dwv/issues/216)
- Change app.loadURL to app.loadURLs [#212](https://github.com/ivmartel/dwv/issues/212)
- Change to JSDoc [#210](https://github.com/ivmartel/dwv/issues/210)
- Update jquery dependencies [#209](https://github.com/ivmartel/dwv/issues/209)
- Add dropbox integration [#207](https://github.com/ivmartel/dwv/issues/207)
- Add Google drive integration [#206](https://github.com/ivmartel/dwv/issues/206)
- Allow viewers to add functionality [#205](https://github.com/ivmartel/dwv/issues/205)
- Allow to set RequestHeaders on url load [#204](https://github.com/ivmartel/dwv/issues/204)
- Allow to overload the URI decoding [#203](https://github.com/ivmartel/dwv/issues/203)
- Investigate using web workers [#194](https://github.com/ivmartel/dwv/issues/194)
- src/gui/loader.js - fix class name [#190](https://github.com/ivmartel/dwv/issues/190)
- Input urls via HTTP Post [#130](https://github.com/ivmartel/dwv/issues/130)

### Fixed

- Fix id generator [#201](https://github.com/ivmartel/dwv/issues/201)
- Fix slice order glitch [#200](https://github.com/ivmartel/dwv/issues/200)
- group.id argument for draw listener [#198](https://github.com/ivmartel/dwv/issues/198)
- Uncaught TypeError: Cannot read property 'add' of null [#197](https://github.com/ivmartel/dwv/issues/197)

---

## [v0.13.0](https://github.com/ivmartel/dwv/releases/tag/v0.13.0) - 20/11/2015

### Added

- Add a slice change event [#185](https://github.com/ivmartel/dwv/issues/185)
- Allow for relative uri for manifest file link [#184](https://github.com/ivmartel/dwv/issues/184)

### Fixed

- Fix flicking progress [#186](https://github.com/ivmartel/dwv/issues/186)

---

## [v0.12.0](https://github.com/ivmartel/dwv/releases/tag/v0.12.0) - 20/10/2015

### Added

- Access GUI component per app [#177](https://github.com/ivmartel/dwv/issues/177)

### Fixed

- Cannot type in the DICOM tags search input [#181](https://github.com/ivmartel/dwv/issues/181)
- Error parsing image - nested sequences? [#180](https://github.com/ivmartel/dwv/issues/180)
- setCurrentPosition using getCurrentPosition does not work [#178](https://github.com/ivmartel/dwv/issues/178)

---

## [v0.11.1](https://github.com/ivmartel/dwv/releases/tag/v0.11.1) - 30/09/2015

### Added

- Prevent page scroll when using mouse whell [#175](https://github.com/ivmartel/dwv/issues/175)
- Proper multiframe error [#174](https://github.com/ivmartel/dwv/issues/174)

---

## [v0.11.0](https://github.com/ivmartel/dwv/releases/tag/v0.11.0) - 18/09/2015

### Added

- Add support for JPEG Lossless transfer syntax [#165](https://github.com/ivmartel/dwv/issues/165)
- Update DICOM dictionary [#164](https://github.com/ivmartel/dwv/issues/164)
- Add standard colour maps [#163](https://github.com/ivmartel/dwv/issues/163)
- Restrict use of DICOM dictionary [#160](https://github.com/ivmartel/dwv/issues/160)
- Slips in documentation [#158](https://github.com/ivmartel/dwv/issues/158)
- Add support for JPEG transfer syntax [#61](https://github.com/ivmartel/dwv/issues/61)

### Fixed

- data.info.dumpToTable is not a function [#167](https://github.com/ivmartel/dwv/issues/167)

---

## [v0.10.1](https://github.com/ivmartel/dwv/releases/tag/v0.10.1) - 26/06/2015

### Added

- Remove unnecessary swap [#157](https://github.com/ivmartel/dwv/issues/157)
- Additional Examples of Displaying DICOM [#138](https://github.com/ivmartel/dwv/issues/138)

---

## [v0.10.0](https://github.com/ivmartel/dwv/releases/tag/v0.10.0) - 27/05/2015

### Added

- No data copy in dicomParser [#148](https://github.com/ivmartel/dwv/issues/148)
- Undo doesn't trigger draw-event [#147](https://github.com/ivmartel/dwv/issues/147)
- Export application events [#143](https://github.com/ivmartel/dwv/issues/143)
- Proper support for DICOM tag sequence [#142](https://github.com/ivmartel/dwv/issues/142)
- Proper FileMetaInformationGroupLength tag name [#141](https://github.com/ivmartel/dwv/issues/141)
- Allow for value multiplicity for US and UL VR [#140](https://github.com/ivmartel/dwv/issues/140)
- Save application state [#136](https://github.com/ivmartel/dwv/issues/136)
- Review pdf.js jpeg2000 support [#131](https://github.com/ivmartel/dwv/issues/131)

### Fixed

- URL with hash part is not parsed correctly [#146](https://github.com/ivmartel/dwv/issues/146)
- Fix drawing text [#145](https://github.com/ivmartel/dwv/issues/145)
- Line Endings in src/image/geometry.js [#137](https://github.com/ivmartel/dwv/issues/137)
- version 9 zoom flip the image after extra zoom [#134](https://github.com/ivmartel/dwv/issues/134)

---

## [v0.9.0](https://github.com/ivmartel/dwv/releases/tag/v0.9.0) - 06/03/2015

### Added

- Scroll: default, only when needed and mouse wheel [#129](https://github.com/ivmartel/dwv/issues/129)
- Allow for multiple app instances on the same page [#124](https://github.com/ivmartel/dwv/issues/124)
- Add support for per slice rescale slope and intercept [#80](https://github.com/ivmartel/dwv/issues/80)
- Add tool to measure angles [#8](https://github.com/ivmartel/dwv/issues/8)

### Fixed

- Cannot load data from manifest file [#127](https://github.com/ivmartel/dwv/issues/127)
- Fix OW value representation for 8bit PixelData [#123](https://github.com/ivmartel/dwv/issues/123)

---

## [v0.8.0](https://github.com/ivmartel/dwv/releases/tag/v0.8.0) - 24/11/2014

### Added

- Add support for file(s) drag and drop [#113](https://github.com/ivmartel/dwv/issues/113)
- No exception for zero length value length [#112](https://github.com/ivmartel/dwv/issues/112)
- Use url key as a keyword [#111](https://github.com/ivmartel/dwv/issues/111)
- Integrate with Orthanc [#110](https://github.com/ivmartel/dwv/issues/110)

### Fixed

- Window Width value is going -ve on window/level [#114](https://github.com/ivmartel/dwv/issues/114)
- RGB data missing center in simple viewer [#109](https://github.com/ivmartel/dwv/issues/109)
- Wrong display for signed data with rescale slope different than one [#108](https://github.com/ivmartel/dwv/issues/108)

---

## [v0.7.1](https://github.com/ivmartel/dwv/releases/tag/v0.7.1) - 18/09/2014

### Added

- Add links in help page [#106](https://github.com/ivmartel/dwv/issues/106)
- Update to jquery-mobile 1.4.3 [#105](https://github.com/ivmartel/dwv/issues/105)
- Restore quantification on drawn shapes [#100](https://github.com/ivmartel/dwv/issues/100)
- Add 3D to drawings [#66](https://github.com/ivmartel/dwv/issues/66)

### Fixed

- Fix OX value representation for PixelData [#107](https://github.com/ivmartel/dwv/issues/107)

---

## [v0.7.0](https://github.com/ivmartel/dwv/releases/tag/v0.7.0) - 28/06/2014

### Added

- Read weasis wado manifest files [#89](https://github.com/ivmartel/dwv/issues/89)
- Add iBooks HTML widget resources [#86](https://github.com/ivmartel/dwv/issues/86)
- Allow to move/modify drawings [#6](https://github.com/ivmartel/dwv/issues/6)
- integration dcm4chee [#1](https://github.com/ivmartel/dwv/issues/1)

### Fixed

- Incorrect display of signed data in Internet Explorer [#95](https://github.com/ivmartel/dwv/issues/95)
- Measurments do not adapt to zoom [#27](https://github.com/ivmartel/dwv/issues/27)

---

## [v0.6.0](https://github.com/ivmartel/dwv/releases/tag/v0.6.0) - 24/02/2014

### Added

- Update jquery and related [#84](https://github.com/ivmartel/dwv/issues/84)
- Add central version for viewers [#83](https://github.com/ivmartel/dwv/issues/83)
- Add single interaction tools [#82](https://github.com/ivmartel/dwv/issues/82)
- Can you please update the conquest interface file? [#78](https://github.com/ivmartel/dwv/issues/78)
- Add mutiple file url load [#77](https://github.com/ivmartel/dwv/issues/77)
- Flexible GUI [#73](https://github.com/ivmartel/dwv/issues/73)
- Revise mobile gui [#72](https://github.com/ivmartel/dwv/issues/72)
- Move static version to a demo folder [#71](https://github.com/ivmartel/dwv/issues/71)
- Manual window/level saving [#65](https://github.com/ivmartel/dwv/issues/65)

### Fixed

- Window/level preset for abdomen is inverted [#81](https://github.com/ivmartel/dwv/issues/81)

---

## [v0.5.1](https://github.com/ivmartel/dwv/releases/tag/v0.5.1) - 10/01/2014

### Added

- Update to jquery mobile 1.4 [#70](https://github.com/ivmartel/dwv/issues/70)

### Fixed

- Local data loading progress does not disappear [#69](https://github.com/ivmartel/dwv/issues/69)

---

## [v0.5.0](https://github.com/ivmartel/dwv/releases/tag/v0.5.0) - 18/12/2013

### Added

- Update flot to v0.8.2 [#67](https://github.com/ivmartel/dwv/issues/67)
- Add support for JPEG 2000 transfer syntax [#62](https://github.com/ivmartel/dwv/issues/62)
- Modularise data loaders [#58](https://github.com/ivmartel/dwv/issues/58)
- Use application cache [#52](https://github.com/ivmartel/dwv/issues/52)
- Add help [#51](https://github.com/ivmartel/dwv/issues/51)
- Update to jquery 2 [#50](https://github.com/ivmartel/dwv/issues/50)
- Proper support for RGB images [#29](https://github.com/ivmartel/dwv/issues/29)

---

## [v0.4.1](https://github.com/ivmartel/dwv/releases/tag/v0.4.1) - 26/09/2013

### Added

- Check browser compatibility [#40](https://github.com/ivmartel/dwv/issues/40)

---

## [v0.4.0](https://github.com/ivmartel/dwv/releases/tag/v0.4.0) - 24/09/2013

### Added

- Enable livewire on mobile [#49](https://github.com/ivmartel/dwv/issues/49)
- Clean up documentation [#48](https://github.com/ivmartel/dwv/issues/48)
- Load multiple remote slices [#45](https://github.com/ivmartel/dwv/issues/45)
- Check tag consitency for multiple input [#44](https://github.com/ivmartel/dwv/issues/44)
- Support signed data [#39](https://github.com/ivmartel/dwv/issues/39)
- Use travis continous integration [#38](https://github.com/ivmartel/dwv/issues/38)
- Adapt presets to modality [#37](https://github.com/ivmartel/dwv/issues/37)
- MVC Design [#36](https://github.com/ivmartel/dwv/issues/36)
- Safeguard zoom/pan [#35](https://github.com/ivmartel/dwv/issues/35)
- Use the bits\* DICOM tags [#30](https://github.com/ivmartel/dwv/issues/30)
- Load multiple local slices [#3](https://github.com/ivmartel/dwv/issues/3)

### Fixed

- Conquest interfacing broken [#46](https://github.com/ivmartel/dwv/issues/46)
- Can't load another image without refreshing [#43](https://github.com/ivmartel/dwv/issues/43)
- The response of windowlevel is very slow [#34](https://github.com/ivmartel/dwv/issues/34)
- Two touch zoom goes only one way in one go [#33](https://github.com/ivmartel/dwv/issues/33)
- <!DOCTYPE html> messes up display [#18](https://github.com/ivmartel/dwv/issues/18)

---

## [v0.3.0](https://github.com/ivmartel/dwv/releases/tag/v0.3.0) - 07/05/2013

### Added

- Planar configuration for RGB images [#31](https://github.com/ivmartel/dwv/issues/31)
- Add onmouseout for tools [#26](https://github.com/ivmartel/dwv/issues/26)
- Support for different values of Photometric Interpretation [#24](https://github.com/ivmartel/dwv/issues/24)
- Support jpg and png input [#21](https://github.com/ivmartel/dwv/issues/21)
- FielReader.readAsBinaryString is deprecated [#20](https://github.com/ivmartel/dwv/issues/20)
- Autosize [#19](https://github.com/ivmartel/dwv/issues/19)
- Udpate jquery [#16](https://github.com/ivmartel/dwv/issues/16)
- Integration request with conquest web viewer [#15](https://github.com/ivmartel/dwv/issues/15)
- Enable touch events [#14](https://github.com/ivmartel/dwv/issues/14)
- Check DICOM data support [#10](https://github.com/ivmartel/dwv/issues/10)
- Add zoom/pan tool [#2](https://github.com/ivmartel/dwv/issues/2)

### Fixed

- Missing information in meta tags [#23](https://github.com/ivmartel/dwv/issues/23)
- Read number in scientific notation [#17](https://github.com/ivmartel/dwv/issues/17)

---

## [v0.2.0](https://github.com/ivmartel/dwv/releases/tag/v0.2.0) - 05/11/2012

### Added

- Mobile interface [#13](https://github.com/ivmartel/dwv/issues/13)

### Fixed

- Can't show some images on second load [#12](https://github.com/ivmartel/dwv/issues/12)
- Can't show big size image [#11](https://github.com/ivmartel/dwv/issues/11)

---

## [v0.1.0](https://github.com/ivmartel/dwv/releases/tag/v0.1.0) - 02/04/2012

### Added

- Use dialogs [#9](https://github.com/ivmartel/dwv/issues/9)
- Search dicom tags [#7](https://github.com/ivmartel/dwv/issues/7)
