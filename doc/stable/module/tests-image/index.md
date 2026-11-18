---
title: tests/image
kind: module
longname: module:tests/image
---

# tests/image

<SourceLink href="/source/tests/image/geometry-test-js/#L20" label="geometry.test.js:20" />

---

## Instance Methods

<MemberHeading id="annotationconstructor" depth="3" name="annotationConstructor" sig="annotationConstructor()" />

<MemberMeta sourceHref="/source/tests/image/annotation-test-js/#L125" sourceLabel="annotation.test.js:125" />

Tests for [Annotation](/annotation) constructor defaults.

<MemberHeading id="annotationuniqueids" depth="3" name="annotationUniqueIds" sig="annotationUniqueIds()" />

<MemberMeta sourceHref="/source/tests/image/annotation-test-js/#L147" sourceLabel="annotation.test.js:147" />

Tests that each Annotation instance receives unique ids.

<MemberHeading id="annotationmetaaddget" depth="3" name="annotationMetaAddGet" sig="annotationMetaAddGet()" />

<MemberMeta sourceHref="/source/tests/image/annotation-test-js/#L163" sourceLabel="annotation.test.js:163" />

Tests for [Annotation](/annotation) meta data add/get/list operations.

<MemberHeading id="annotationmetaoverwrite" depth="3" name="annotationMetaOverwrite" sig="annotationMetaOverwrite()" />

<MemberMeta sourceHref="/source/tests/image/annotation-test-js/#L195" sourceLabel="annotation.test.js:195" />

Tests that [Annotation#addMetaItem](/annotation#addmetaitem) warns when overwriting.

<MemberHeading id="annotationmetaremove" depth="3" name="annotationMetaRemove" sig="annotationMetaRemove()" />

<MemberMeta sourceHref="/source/tests/image/annotation-test-js/#L216" sourceLabel="annotation.test.js:216" />

Tests for [Annotation#removeMetaItem](/annotation#removemetaitem).

<MemberHeading id="annotationcanview" depth="3" name="annotationCanView" sig="annotationCanView()" />

<MemberMeta sourceHref="/source/tests/image/annotation-test-js/#L239" sourceLabel="annotation.test.js:239" />

Tests for [Annotation#canView](/annotation#canview) initial state.

<MemberHeading id="annotationgettextplain" depth="3" name="annotationGetTextPlain" sig="annotationGetTextPlain()" />

<MemberMeta sourceHref="/source/tests/image/annotation-test-js/#L253" sourceLabel="annotation.test.js:253" />

Tests for [Annotation#getText](/annotation#gettext) with no quantification.

<MemberHeading id="annotationgettextflags" depth="3" name="annotationGetTextFlags" sig="annotationGetTextFlags()" />

<MemberMeta sourceHref="/source/tests/image/annotation-test-js/#L265" sourceLabel="annotation.test.js:265" />

Tests for [Annotation#getText](/annotation#gettext) with flag substitution.

<MemberHeading id="annotationgettextempty" depth="3" name="annotationGetTextEmpty" sig="annotationGetTextEmpty()" />

<MemberMeta sourceHref="/source/tests/image/annotation-test-js/#L279" sourceLabel="annotation.test.js:279" />

Tests for [Annotation#getText](/annotation#gettext) with empty textExpr.

<MemberHeading id="annotationcompatibleviewnoplane" depth="3" name="annotationCompatibleViewNoPlane" sig="annotationCompatibleViewNoPlane()" />

<MemberMeta sourceHref="/source/tests/image/annotation-test-js/#L293" sourceLabel="annotation.test.js:293" />

Tests for [Annotation#isCompatibleView](/annotation#iscompatibleview) without planePoints.

<MemberHeading id="annotationcompatibleviewplane" depth="3" name="annotationCompatibleViewPlane" sig="annotationCompatibleViewPlane()" />

<MemberMeta sourceHref="/source/tests/image/annotation-test-js/#L315" sourceLabel="annotation.test.js:315" />

Tests for [Annotation#isCompatibleView](/annotation#iscompatibleview) with planePoints set.

<MemberHeading id="annotationorientationundefined" depth="3" name="annotationOrientationUndefined" sig="annotationOrientationUndefined()" />

<MemberMeta sourceHref="/source/tests/image/annotation-test-js/#L356" sourceLabel="annotation.test.js:356" />

Tests for [Annotation#getOrientationName](/annotation#getorientationname) without planePoints.

<MemberHeading id="annotationorientationaxial" depth="3" name="annotationOrientationAxial" sig="annotationOrientationAxial()" />

<MemberMeta sourceHref="/source/tests/image/annotation-test-js/#L368" sourceLabel="annotation.test.js:368" />

Tests for [Annotation#getOrientationName](/annotation#getorientationname) with axial planePoints.

<MemberHeading id="annotationinit" depth="3" name="annotationInit" sig="annotationInit()" />

<MemberMeta sourceHref="/source/tests/image/annotation-test-js/#L392" sourceLabel="annotation.test.js:392" />

Tests for [Annotation#init](/annotation#init) setting annotation fields.

<MemberHeading id="annotationinitframenumber" depth="3" name="annotationInitFrameNumber" sig="annotationInitFrameNumber()" />

<MemberMeta sourceHref="/source/tests/image/annotation-test-js/#L412" sourceLabel="annotation.test.js:412" />

Tests that [Annotation#init](/annotation#init) sets a 1-based frame number from the position time index.

<MemberHeading id="annotationcentroidvolumeid" depth="3" name="annotationCentroidVolumeId" sig="annotationCentroidVolumeId()" />

<MemberMeta sourceHref="/source/tests/image/annotation-test-js/#L436" sourceLabel="annotation.test.js:436" />

Tests that [Annotation#getCentroid](/annotation#getcentroid) uses the volume id of the referenced frame.

<MemberHeading id="annotationinittwice" depth="3" name="annotationInitTwice" sig="annotationInitTwice()" />

<MemberMeta sourceHref="/source/tests/image/annotation-test-js/#L475" sourceLabel="annotation.test.js:475" />

Tests that a second [Annotation#init](/annotation#init) call is a no-op.

<MemberHeading id="annotationinitoriented" depth="3" name="annotationInitOriented" sig="annotationInitOriented()" />

<MemberMeta sourceHref="/source/tests/image/annotation-test-js/#L495" sourceLabel="annotation.test.js:495" />

Tests that init stores planePoints for non-acquisition orientation.

<MemberHeading id="annotationsetvcunknownuid" depth="3" name="annotationSetVcUnknownUid" sig="annotationSetVcUnknownUid()" />

<MemberMeta sourceHref="/source/tests/image/annotation-test-js/#L514" sourceLabel="annotation.test.js:514" />

Tests that [Annotation#setViewController](/annotation#setviewcontroller) warns on unknown UID.

<MemberHeading id="annotationsetvcincompatible" depth="3" name="annotationSetVcIncompatible" sig="annotationSetVcIncompatible()" />

<MemberMeta sourceHref="/source/tests/image/annotation-test-js/#L533" sourceLabel="annotation.test.js:533" />

Tests that [Annotation#setViewController](/annotation#setviewcontroller) is rejected for incompatible views.

<MemberHeading id="annotationsetvccompatible" depth="3" name="annotationSetVcCompatible" sig="annotationSetVcCompatible()" />

<MemberMeta sourceHref="/source/tests/image/annotation-test-js/#L562" sourceLabel="annotation.test.js:562" />

Tests that [Annotation#setViewController](/annotation#setviewcontroller) succeeds for a compatible view.

<MemberHeading id="annotationsetvclegacycosines" depth="3" name="annotationSetVcLegacyCosines" sig="annotationSetVcLegacyCosines()" />

<MemberMeta sourceHref="/source/tests/image/annotation-test-js/#L582" sourceLabel="annotation.test.js:582" />

Tests that [Annotation#setViewController](/annotation#setviewcontroller) replaces legacy plane cosines.

<MemberHeading id="annotationsettextnovc" depth="3" name="annotationSetTextNoVc" sig="annotationSetTextNoVc()" />

<MemberMeta sourceHref="/source/tests/image/annotation-test-js/#L618" sourceLabel="annotation.test.js:618" />

Tests for [Annotation#setTextExpr](/annotation#settextexpr) without a view controller.

<MemberHeading id="annotationsettextmodality" depth="3" name="annotationSetTextModality" sig="annotationSetTextModality()" />

<MemberMeta sourceHref="/source/tests/image/annotation-test-js/#L633" sourceLabel="annotation.test.js:633" />

Tests for [Annotation#setTextExpr](/annotation#settextexpr) using modality-specific text.

<MemberHeading id="annotationsettextfallback" depth="3" name="annotationSetTextFallback" sig="annotationSetTextFallback()" />

<MemberMeta sourceHref="/source/tests/image/annotation-test-js/#L649" sourceLabel="annotation.test.js:649" />

Tests for [Annotation#setTextExpr](/annotation#settextexpr) falling back to '\*'.

<MemberHeading id="annotationgetfactorynoshape" depth="3" name="annotationGetFactoryNoShape" sig="annotationGetFactoryNoShape()" />

<MemberMeta sourceHref="/source/tests/image/annotation-test-js/#L669" sourceLabel="annotation.test.js:669" />

Tests for [Annotation#getFactory](/annotation#getfactory) when no mathShape is set.

<MemberHeading id="annotationgetfactorynomatch" depth="3" name="annotationGetFactoryNoMatch" sig="annotationGetFactoryNoMatch()" />

<MemberMeta sourceHref="/source/tests/image/annotation-test-js/#L682" sourceLabel="annotation.test.js:682" />

Tests for [Annotation#getFactory](/annotation#getfactory) when no factory supports the given shape.

<MemberHeading id="annotationgroupeventnames" depth="3" name="annotationGroupEventNames" sig="annotationGroupEventNames()" />

<MemberMeta sourceHref="/source/tests/image/annotationgroup-test-js/#L53" sourceLabel="annotationGroup.test.js:53" />

Tests that [annotationGroupEventNames](/global#annotationgroupeventnames) exports the expected events.

<MemberHeading id="annotationgroupctorempty" depth="3" name="annotationGroupCtorEmpty" sig="annotationGroupCtorEmpty()" />

<MemberMeta sourceHref="/source/tests/image/annotationgroup-test-js/#L71" sourceLabel="annotationGroup.test.js:71" />

Tests for [AnnotationGroup](/annotationgroup) constructor with no arguments.

<MemberHeading id="annotationgroupctorlist" depth="3" name="annotationGroupCtorList" sig="annotationGroupCtorList()" />

<MemberMeta sourceHref="/source/tests/image/annotationgroup-test-js/#L84" sourceLabel="annotationGroup.test.js:84" />

Tests for [AnnotationGroup](/annotationgroup) constructor with an initial list.

<MemberHeading id="annotationgroupeditable" depth="3" name="annotationGroupEditable" sig="annotationGroupEditable()" />

<MemberMeta sourceHref="/source/tests/image/annotationgroup-test-js/#L101" sourceLabel="annotationGroup.test.js:101" />

Tests for [AnnotationGroup#setEditable](/annotationgroup#seteditable) toggling and event firing.

<MemberHeading id="annotationgroupcolour" depth="3" name="annotationGroupColour" sig="annotationGroupColour()" />

<MemberMeta sourceHref="/source/tests/image/annotationgroup-test-js/#L129" sourceLabel="annotationGroup.test.js:129" />

Tests for [AnnotationGroup#setColour](/annotationgroup#setcolour) / getColour.

<MemberHeading id="annotationgroupadd" depth="3" name="annotationGroupAdd" sig="annotationGroupAdd()" />

<MemberMeta sourceHref="/source/tests/image/annotationgroup-test-js/#L145" sourceLabel="annotationGroup.test.js:145" />

Tests for [AnnotationGroup#add](/annotationgroup#add) updating the list and firing events.

<MemberHeading id="annotationgroupaddpropagate" depth="3" name="annotationGroupAddPropagate" sig="annotationGroupAddPropagate()" />

<MemberMeta sourceHref="/source/tests/image/annotationgroup-test-js/#L165" sourceLabel="annotationGroup.test.js:165" />

Tests that [AnnotationGroup#add](/annotationgroup#add) forwards the propagate flag.

<MemberHeading id="annotationgroupfind" depth="3" name="annotationGroupFind" sig="annotationGroupFind()" />

<MemberMeta sourceHref="/source/tests/image/annotationgroup-test-js/#L186" sourceLabel="annotationGroup.test.js:186" />

Tests for [AnnotationGroup#find](/annotationgroup#find) by tracking UID.

<MemberHeading id="annotationgroupupdate" depth="3" name="annotationGroupUpdate" sig="annotationGroupUpdate()" />

<MemberMeta sourceHref="/source/tests/image/annotationgroup-test-js/#L205" sourceLabel="annotationGroup.test.js:205" />

Tests for [AnnotationGroup#update](/annotationgroup#update) replacing the entry and firing annotationupdate.

<MemberHeading id="annotationgroupupdatequantification" depth="3" name="annotationGroupUpdateQuantification" sig="annotationGroupUpdateQuantification()" />

<MemberMeta sourceHref="/source/tests/image/annotationgroup-test-js/#L228" sourceLabel="annotationGroup.test.js:228" />

Tests that update calls updateQuantification when mathShape changes.

<MemberHeading id="annotationgroupupdatetextexpr" depth="3" name="annotationGroupUpdateTextExpr" sig="annotationGroupUpdateTextExpr()" />

<MemberMeta sourceHref="/source/tests/image/annotationgroup-test-js/#L245" sourceLabel="annotationGroup.test.js:245" />

Tests that update calls updateQuantification when textExpr changes.

<MemberHeading id="annotationgroupupdatenoquantification" depth="3" name="annotationGroupUpdateNoQuantification" sig="annotationGroupUpdateNoQuantification()" />

<MemberMeta sourceHref="/source/tests/image/annotationgroup-test-js/#L262" sourceLabel="annotationGroup.test.js:262" />

Tests that update does NOT call updateQuantification for unrelated keys.

<MemberHeading id="annotationgroupupdatenotfound" depth="3" name="annotationGroupUpdateNotFound" sig="annotationGroupUpdateNotFound()" />

<MemberMeta sourceHref="/source/tests/image/annotationgroup-test-js/#L279" sourceLabel="annotationGroup.test.js:279" />

Tests that update warns when the annotation is not found.

<MemberHeading id="annotationgroupremove" depth="3" name="annotationGroupRemove" sig="annotationGroupRemove()" />

<MemberMeta sourceHref="/source/tests/image/annotationgroup-test-js/#L296" sourceLabel="annotationGroup.test.js:296" />

Tests for [AnnotationGroup#remove](/annotationgroup#remove) by UID.

<MemberHeading id="annotationgroupremovenotfound" depth="3" name="annotationGroupRemoveNotFound" sig="annotationGroupRemoveNotFound()" />

<MemberMeta sourceHref="/source/tests/image/annotationgroup-test-js/#L317" sourceLabel="annotationGroup.test.js:317" />

Tests that remove warns when the annotation is not found.

<MemberHeading id="annotationgroupremoveselective" depth="3" name="annotationGroupRemoveSelective" sig="annotationGroupRemoveSelective()" />

<MemberMeta sourceHref="/source/tests/image/annotationgroup-test-js/#L330" sourceLabel="annotationGroup.test.js:330" />

Tests that remove only removes the targeted annotation, preserving others.

<MemberHeading id="annotationgroupsetviewcontroller" depth="3" name="annotationGroupSetViewController" sig="annotationGroupSetViewController()" />

<MemberMeta sourceHref="/source/tests/image/annotationgroup-test-js/#L356" sourceLabel="annotationGroup.test.js:356" />

Tests that [AnnotationGroup#setViewController](/annotationgroup#setviewcontroller) delegates to each annotation and triggers quantification updates.

<MemberHeading id="annotationgroupmeta" depth="3" name="annotationGroupMeta" sig="annotationGroupMeta()" />

<MemberMeta sourceHref="/source/tests/image/annotationgroup-test-js/#L384" sourceLabel="annotationGroup.test.js:384" />

Tests for [AnnotationGroup](/annotationgroup) meta data CRUD.

<MemberHeading id="annotationgroupremovelistener" depth="3" name="annotationGroupRemoveListener" sig="annotationGroupRemoveListener()" />

<MemberMeta sourceHref="/source/tests/image/annotationgroup-test-js/#L411" sourceLabel="annotationGroup.test.js:411" />

Tests for `AnnotationGroup#removeEventListener`.

<MemberHeading id="decoderconstructor" depth="3" name="decoderConstructor" sig="decoderConstructor()" />

<MemberMeta sourceHref="/source/tests/image/decoder-test-js/#L80" sourceLabel="decoder.test.js:80" />

Tests for [PixelBufferDecoder](/pixelbufferdecoder) constructor.

<MemberHeading id="decoderdefaulthandlers" depth="3" name="decoderDefaultHandlers" sig="decoderDefaultHandlers()" />

<MemberMeta sourceHref="/source/tests/image/decoder-test-js/#L99" sourceLabel="decoder.test.js:99" />

Tests that all default event handlers are no-ops.

<MemberHeading id="decodercallbackwiring" depth="3" name="decoderCallbackWiring" sig="decoderCallbackWiring()" />

<MemberMeta sourceHref="/source/tests/image/decoder-test-js/#L121" sourceLabel="decoder.test.js:121" />

Tests that the first decode() call wires the decoder's event handlers onto the pool.

<MemberHeading id="decodercallbackwiringonce" depth="3" name="decoderCallbackWiringOnce" sig="decoderCallbackWiringOnce()" />

<MemberMeta sourceHref="/source/tests/image/decoder-test-js/#L143" sourceLabel="decoder.test.js:143" />

Tests that pool callbacks are assigned only once across multiple decode calls.

<MemberHeading id="decoderroutejpegbaseline" depth="3" name="decoderRouteJpegBaseline" sig="decoderRouteJpegBaseline()" />

<MemberMeta sourceHref="/source/tests/image/decoder-test-js/#L168" sourceLabel="decoder.test.js:168" />

Tests that decode() routes 'jpeg-baseline' to the correct worker task.

<MemberHeading id="decoderroutejpeglossless" depth="3" name="decoderRouteJpegLossless" sig="decoderRouteJpegLossless()" />

<MemberMeta sourceHref="/source/tests/image/decoder-test-js/#L183" sourceLabel="decoder.test.js:183" />

Tests that decode() routes 'jpeg-lossless' to the correct worker task.

<MemberHeading id="decoderroutejpeg2000" depth="3" name="decoderRouteJpeg2000" sig="decoderRouteJpeg2000()" />

<MemberMeta sourceHref="/source/tests/image/decoder-test-js/#L199" sourceLabel="decoder.test.js:199" />

Tests that decode() routes 'jpeg2000' to the correct worker task.

<MemberHeading id="decoderrouterle" depth="3" name="decoderRouteRle" sig="decoderRouteRle()" />

<MemberMeta sourceHref="/source/tests/image/decoder-test-js/#L213" sourceLabel="decoder.test.js:213" />

Tests that decode() routes 'rle' to the correct worker task.

<MemberHeading id="decodertaskpayload" depth="3" name="decoderTaskPayload" sig="decoderTaskPayload()" />

<MemberMeta sourceHref="/source/tests/image/decoder-test-js/#L231" sourceLabel="decoder.test.js:231" />

Tests that the worker task receives the correct buffer, meta and info.

<MemberHeading id="decodertaskstartmessage" depth="3" name="decoderTaskStartMessage" sig="decoderTaskStartMessage()" />

<MemberMeta sourceHref="/source/tests/image/decoder-test-js/#L252" sourceLabel="decoder.test.js:252" />

Tests that the decoder task start message holds a compact copy of the input buffer and transfers it.

<MemberHeading id="decoderunknownalgo" depth="3" name="decoderUnknownAlgo" sig="decoderUnknownAlgo()" />

<MemberMeta sourceHref="/source/tests/image/decoder-test-js/#L284" sourceLabel="decoder.test.js:284" />

Tests that decode() does not add a task for an unrecognised algorithm.

<MemberHeading id="decoderabort" depth="3" name="decoderAbort" sig="decoderAbort()" />

<MemberMeta sourceHref="/source/tests/image/decoder-test-js/#L302" sourceLabel="decoder.test.js:302" />

Tests that abort() delegates to the underlying thread pool.

<MemberHeading id="domreaderimagesource" depth="3" name="domReaderImageSource" sig="domReaderImageSource()" />

<MemberMeta sourceHref="/source/tests/image/domreader-test-js/#L172" sourceLabel="domReader.test.js:172" />

Tests that getViewFromDOMImage returns data and preserves origin as source.

<MemberHeading id="domreaderimageurlinfo" depth="3" name="domReaderImageUrlInfo" sig="domReaderImageUrlInfo()" />

<MemberMeta sourceHref="/source/tests/image/domreader-test-js/#L185" sourceLabel="domReader.test.js:185" />

Tests that meta info fields are populated correctly for a URL origin.

<MemberHeading id="domreaderimagefileinfo" depth="3" name="domReaderImageFileInfo" sig="domReaderImageFileInfo()" />

<MemberMeta sourceHref="/source/tests/image/domreader-test-js/#L204" sourceLabel="domReader.test.js:204" />

Tests that meta info fields are populated correctly for a File origin.

<MemberHeading id="domreaderimagedefaultindex" depth="3" name="domReaderImageDefaultIndex" sig="domReaderImageDefaultIndex()" />

<MemberMeta sourceHref="/source/tests/image/domreader-test-js/#L225" sourceLabel="domReader.test.js:225" />

Tests that index defaults to 0 when not supplied.

<MemberHeading id="domreaderimagephotometric" depth="3" name="domReaderImagePhotometric" sig="domReaderImagePhotometric()" />

<MemberMeta sourceHref="/source/tests/image/domreader-test-js/#L237" sourceLabel="domReader.test.js:237" />

Tests that the created image has RGB photometric interpretation.

<MemberHeading id="domreaderimagestripalpha" depth="3" name="domReaderImageStripAlpha" sig="domReaderImageStripAlpha()" />

<MemberMeta sourceHref="/source/tests/image/domreader-test-js/#L251" sourceLabel="domReader.test.js:251" />

Tests that alpha is stripped: the image buffer holds only RGB bytes.

<MemberHeading id="domreaderimageseriesuid" depth="3" name="domReaderImageSeriesUid" sig="domReaderImageSeriesUid()" />

<MemberMeta sourceHref="/source/tests/image/domreader-test-js/#L270" sourceLabel="domReader.test.js:270" />

Tests that SeriesInstanceUID is set in the image meta.

<MemberHeading id="domreadervideoloaditemurl" depth="3" name="domReaderVideoLoaditemUrl" sig="domReaderVideoLoaditemUrl()" />

<MemberMeta sourceHref="/source/tests/image/domreader-test-js/#L290" sourceLabel="domReader.test.js:290" />

Tests that onloaditem fires on the first seeked event (URL origin).

<MemberHeading id="domreadervideoloaditemfile" depth="3" name="domReaderVideoLoaditemFile" sig="domReaderVideoLoaditemFile()" />

<MemberMeta sourceHref="/source/tests/image/domreader-test-js/#L319" sourceLabel="domReader.test.js:319" />

Tests that onloaditem fires on the first seeked event (File origin).

<MemberHeading id="domreadervideoprogress" depth="3" name="domReaderVideoProgress" sig="domReaderVideoProgress()" />

<MemberMeta sourceHref="/source/tests/image/domreader-test-js/#L343" sourceLabel="domReader.test.js:343" />

Tests that onprogress fires for every frame.

<MemberHeading id="domreadervideoloadend" depth="3" name="domReaderVideoLoadEnd" sig="domReaderVideoLoadEnd()" />

<MemberMeta sourceHref="/source/tests/image/domreader-test-js/#L369" sourceLabel="domReader.test.js:369" />

Tests that onload and onloadend fire after the last frame.

<MemberHeading id="domreadervideomultiframe" depth="3" name="domReaderVideoMultiframe" sig="domReaderVideoMultiframe()" />

<MemberMeta sourceHref="/source/tests/image/domreader-test-js/#L393" sourceLabel="domReader.test.js:393" />

Tests multi-frame: appendFrameBuffer called and listener removed at end.

<MemberHeading id="thresholdfiltername" depth="3" name="thresholdFilterName" sig="thresholdFilterName()" />

<MemberMeta sourceHref="/source/tests/image/filter-test-js/#L50" sourceLabel="filter.test.js:50" />

Tests for [ThresholdFilter](/thresholdfilter) getName.

<MemberHeading id="thresholdfilteraccessors" depth="3" name="thresholdFilterAccessors" sig="thresholdFilterAccessors()" />

<MemberMeta sourceHref="/source/tests/image/filter-test-js/#L59" sourceLabel="filter.test.js:59" />

Tests for [ThresholdFilter](/thresholdfilter) min/max accessors.

<MemberHeading id="thresholdfilterimageaccessor" depth="3" name="thresholdFilterImageAccessor" sig="thresholdFilterImageAccessor()" />

<MemberMeta sourceHref="/source/tests/image/filter-test-js/#L72" sourceLabel="filter.test.js:72" />

Tests for [ThresholdFilter](/thresholdfilter) image accessor.

<MemberHeading id="thresholdfilternewimage" depth="3" name="thresholdFilterNewImage" sig="thresholdFilterNewImage()" />

<MemberMeta sourceHref="/source/tests/image/filter-test-js/#L84" sourceLabel="filter.test.js:84" />

Tests that update returns a new image, leaving the original unchanged.

<MemberHeading id="thresholdfilterinsiderange" depth="3" name="thresholdFilterInsideRange" sig="thresholdFilterInsideRange()" />

<MemberMeta sourceHref="/source/tests/image/filter-test-js/#L100" sourceLabel="filter.test.js:100" />

Tests that values inside \[min, max] are preserved.

<MemberHeading id="thresholdfilteroutsiderange" depth="3" name="thresholdFilterOutsideRange" sig="thresholdFilterOutsideRange()" />

<MemberMeta sourceHref="/source/tests/image/filter-test-js/#L117" sourceLabel="filter.test.js:117" />

Tests that values outside \[min, max] are replaced with imageMin.

<MemberHeading id="sharpenfiltername" depth="3" name="sharpenFilterName" sig="sharpenFilterName()" />

<MemberMeta sourceHref="/source/tests/image/filter-test-js/#L146" sourceLabel="filter.test.js:146" />

Tests for [SharpenFilter](/sharpenfilter) getName.

<MemberHeading id="sharpenfilterimageaccessor" depth="3" name="sharpenFilterImageAccessor" sig="sharpenFilterImageAccessor()" />

<MemberMeta sourceHref="/source/tests/image/filter-test-js/#L155" sourceLabel="filter.test.js:155" />

Tests for [SharpenFilter](/sharpenfilter) image accessor.

<MemberHeading id="sharpenfilternewimage" depth="3" name="sharpenFilterNewImage" sig="sharpenFilterNewImage()" />

<MemberMeta sourceHref="/source/tests/image/filter-test-js/#L167" sourceLabel="filter.test.js:167" />

Tests that update returns a new image.

<MemberHeading id="sharpenfilteruniform" depth="3" name="sharpenFilterUniform" sig="sharpenFilterUniform()" />

<MemberMeta sourceHref="/source/tests/image/filter-test-js/#L180" sourceLabel="filter.test.js:180" />

Tests that a uniform image is preserved by the sharpen kernel. For a flat region: 5v - 4v = v at every interior pixel.

<MemberHeading id="sharpenfiltercenterpixel" depth="3" name="sharpenFilterCenterPixel" sig="sharpenFilterCenterPixel()" />

<MemberMeta sourceHref="/source/tests/image/filter-test-js/#L196" sourceLabel="filter.test.js:196" />

Tests the sharpen kernel coefficient at the centre pixel. With all neighbours = 0 and centre = 100, the centre output = 5 × 100.

<MemberHeading id="sobelfiltername" depth="3" name="sobelFilterName" sig="sobelFilterName()" />

<MemberMeta sourceHref="/source/tests/image/filter-test-js/#L218" sourceLabel="filter.test.js:218" />

Tests for [SobelFilter](/sobelfilter) getName.

<MemberHeading id="sobelfilterimageaccessor" depth="3" name="sobelFilterImageAccessor" sig="sobelFilterImageAccessor()" />

<MemberMeta sourceHref="/source/tests/image/filter-test-js/#L227" sourceLabel="filter.test.js:227" />

Tests for [SobelFilter](/sobelfilter) image accessor.

<MemberHeading id="sobelfilternewimage" depth="3" name="sobelFilterNewImage" sig="sobelFilterNewImage()" />

<MemberMeta sourceHref="/source/tests/image/filter-test-js/#L239" sourceLabel="filter.test.js:239" />

Tests that update returns a new image.

<MemberHeading id="sobelfilteruniform" depth="3" name="sobelFilterUniform" sig="sobelFilterUniform()" />

<MemberMeta sourceHref="/source/tests/image/filter-test-js/#L252" sourceLabel="filter.test.js:252" />

Tests that a uniform image produces zero gradient everywhere. GradX = gradY = 0 on a flat field → sqrt(0² + 0²) = 0.

<MemberHeading id="sobelfilterstepedge" depth="3" name="sobelFilterStepEdge" sig="sobelFilterStepEdge()" />

<MemberMeta sourceHref="/source/tests/image/filter-test-js/#L268" sourceLabel="filter.test.js:268" />

Tests that the Sobel output is floor(sqrt(gradX² + gradY²)). A vertical step edge gives a known horizontal gradient.

<MemberHeading id="geometryclass" depth="3" name="geometryClass" sig="geometryClass()" />

<MemberMeta sourceHref="/source/tests/image/geometry-test-js/#L27" sourceLabel="geometry.test.js:27" />

Tests for [Geometry](/geometry).

<MemberHeading id="geometryissimilar" depth="3" name="geometryIsSimilar" sig="geometryIsSimilar()" />

<MemberMeta sourceHref="/source/tests/image/geometry-test-js/#L110" sourceLabel="geometry.test.js:110" />

Tests for [Geometry#isSimilar](/geometry#issimilar).

<MemberHeading id="geometryworldtoindexirregularspacing" depth="3" name="geometryWorldToIndexIrregularSpacing" sig="geometryWorldToIndexIrregularSpacing()" />

<MemberMeta sourceHref="/source/tests/image/geometry-test-js/#L173" sourceLabel="geometry.test.js:173" />

Test that [Geometry#worldToIndex](/geometry#worldtoindex) resolves the correct slice for an irregularly spaced grid, instead of naively extrapolating from origin #0 with a single rounded spacing value (which gives an out-of-range index for this data).

<MemberHeading id="geometryworldtoindexoutofrange" depth="3" name="geometryWorldToIndexOutOfRange" sig="geometryWorldToIndexOutOfRange()" />

<MemberMeta sourceHref="/source/tests/image/geometry-test-js/#L202" sourceLabel="geometry.test.js:202" />

Test that [Geometry#worldToIndex](/geometry#worldtoindex) falls back to the naive arithmetic result (and so stays correctly out of range) for a position that isn't actually close to any real origin, instead of spuriously snapping to whichever origin happens to be closest.

<MemberHeading id="geometryworldtoindexgantrytilt" depth="3" name="geometryWorldToIndexGantryTilt" sig="geometryWorldToIndexGantryTilt()" />

<MemberMeta sourceHref="/source/tests/image/geometry-test-js/#L240" sourceLabel="geometry.test.js:240" />

Regression test for a real gantry-tilted CT geometry (tilted ImageOrientationPatient, so consecutive origins shift in Y as well as Z): [Geometry#worldToIndex](/geometry#worldtoindex) and [Geometry#getSliceIndex](/geometry#getsliceindex) must both resolve every real slice's own position back to its own index - including for points away from the slice corner (eg. A click anywhere else in the image), since the in-plane offset must not leak into the slice decision. The naive uniform-grid formula worldToIndex used to fall back on gets this systematically wrong for this data (verified separately: it returned \[0,0,-1]..\[0,0,-11] for slices 1..10, not merely off-by-one)..

<MemberHeading id="geometryworldtoindexnoboundaryduplicate" depth="3" name="geometryWorldToIndexNoBoundaryDuplicate" sig="geometryWorldToIndexNoBoundaryDuplicate()" />

<MemberMeta sourceHref="/source/tests/image/geometry-test-js/#L329" sourceLabel="geometry.test.js:329" />

Regression test for a real DICOM SEG-on-reference-series scenario (mask geometry covers only a few slices out of a larger, tilted reference series): [Geometry#worldToIndex](/geometry#worldtoindex) must not duplicate the mask's last real slice onto the reference slice just past it. The queried position isn't a stored origin, it's reconstructed via the reference geometry's own indexToWorld (origin + spacing\*index), same as App/ViewController do when syncing a scroll position across layers of different geometries - that reconstruction carries a few 1e-6 mm of float drift for a tilted (multi-matrix-multiply) orientation, which used to land just under the exact slice boundary and get floored down one slice too far, right back into the mask's valid range.

<MemberHeading id="geometrygetsliceindex" depth="3" name="geometryGetSliceIndex" sig="geometryGetSliceIndex()" />

<MemberMeta sourceHref="/source/tests/image/geometry-test-js/#L400" sourceLabel="geometry.test.js:400" />

Tests for [Geometry#getSliceIndex](/geometry#getsliceindex).

<MemberHeading id="geometrygetsliceindextime" depth="3" name="geometryGetSliceIndexTime" sig="geometryGetSliceIndexTime()" />

<MemberMeta sourceHref="/source/tests/image/geometry-test-js/#L453" sourceLabel="geometry.test.js:453" />

Test [Geometry#getSliceIndex](/geometry#getsliceindex) with the optional time argument.

<MemberHeading id="geometrychecktimeorigins" depth="3" name="geometryCheckTimeOrigins" sig="geometryCheckTimeOrigins()" />

<MemberMeta sourceHref="/source/tests/image/geometry-test-js/#L481" sourceLabel="geometry.test.js:481" />

Tests for [Geometry#checkTimeOrigins](/geometry#checktimeorigins).

<MemberHeading id="geometrynonintegertimes" depth="3" name="geometryNonIntegerTimes" sig="geometryNonIntegerTimes()" />

<MemberMeta sourceHref="/source/tests/image/geometry-test-js/#L550" sourceLabel="geometry.test.js:550" />

Tests for [Geometry](/geometry) times that are not positive integers.

<MemberHeading id="geometryvolumeidposition" depth="3" name="geometryVolumeIdPosition" sig="geometryVolumeIdPosition()" />

<MemberMeta sourceHref="/source/tests/image/geometry-test-js/#L596" sourceLabel="geometry.test.js:596" />

Tests for [Geometry#indexToWorld](/geometry#indextoworld) and [Geometry#worldToIndex](/geometry#worldtoindex) with volume ids.

<MemberHeading id="geometrylargevolumeids" depth="3" name="geometryLargeVolumeIds" sig="geometryLargeVolumeIds()" />

<MemberMeta sourceHref="/source/tests/image/geometry-test-js/#L666" sourceLabel="geometry.test.js:666" />

Tests for [Geometry](/geometry) volume ids with large values.

<MemberHeading id="geometrycansyncvolume" depth="3" name="geometryCanSyncVolume" sig="geometryCanSyncVolume()" />

<MemberMeta sourceHref="/source/tests/image/geometry-test-js/#L697" sourceLabel="geometry.test.js:697" />

Tests for [Geometry#canSyncVolume](/geometry#cansyncvolume).

<MemberHeading id="geometrytimeupdates" depth="3" name="geometryTimeUpdates" sig="geometryTimeUpdates()" />

<MemberMeta sourceHref="/source/tests/image/geometry-test-js/#L725" sourceLabel="geometry.test.js:725" />

Tests for [Geometry](/geometry) time checks and volume ids updates.

<MemberHeading id="geometrysetvolumevalues" depth="3" name="geometrySetVolumeValues" sig="geometrySetVolumeValues()" />

<MemberMeta sourceHref="/source/tests/image/geometry-test-js/#L764" sourceLabel="geometry.test.js:764" />

Tests for [Geometry#setVolumeValues](/geometry#setvolumevalues).

<MemberHeading id="geometrysortorigins" depth="3" name="geometrySortOrigins" sig="geometrySortOrigins()" />

<MemberMeta sourceHref="/source/tests/image/geometry-test-js/#L799" sourceLabel="geometry.test.js:799" />

Tests for [Geometry#sortOrigins](/geometry#sortorigins).

<MemberHeading id="geometrysortoriginstilted" depth="3" name="geometrySortOriginsTilted" sig="geometrySortOriginsTilted()" />

<MemberMeta sourceHref="/source/tests/image/geometry-test-js/#L821" sourceLabel="geometry.test.js:821" />

Test that [Geometry#sortOrigins](/geometry#sortorigins) sorts along the orientation's normal, not raw world Z, for a tilted geometry.

<MemberHeading id="geometrycanappendslice" depth="3" name="geometryCanAppendSlice" sig="geometryCanAppendSlice()" />

<MemberMeta sourceHref="/source/tests/image/geometry-test-js/#L864" sourceLabel="geometry.test.js:864" />

Test that [Geometry#canAppendSlice](/geometry#canappendslice) tolerates orientation rounding differences between slices of the same series.

<MemberHeading id="imagegetvalue" depth="3" name="imageGetvalue" sig="imageGetvalue()" />

<MemberMeta sourceHref="/source/tests/image/image-test-js/#L97" sourceLabel="image.test.js:97" />

Tests for [Image](/image) getValue.

<MemberHeading id="imagehistogram" depth="3" name="imageHistogram" sig="imageHistogram()" />

<MemberMeta sourceHref="/source/tests/image/image-test-js/#L174" sourceLabel="image.test.js:174" />

Tests for [Image](/image) histogram.

<MemberHeading id="imageappendslice" depth="3" name="imageAppendSlice" sig="imageAppendSlice()" />

<MemberMeta sourceHref="/source/tests/image/image-test-js/#L229" sourceLabel="image.test.js:229" />

Tests for [Image](/image) append.

<MemberHeading id="imageappendslicewindowpresets" depth="3" name="imageAppendSliceWindowPresets" sig="imageAppendSliceWindowPresets()" />

<MemberMeta sourceHref="/source/tests/image/image-test-js/#L371" sourceLabel="image.test.js:371" />

Tests for [Image](/image) append slice window presets merge.

<MemberHeading id="imageconvolute2d" depth="3" name="imageConvolute2d" sig="imageConvolute2d()" />

<MemberMeta sourceHref="/source/tests/image/image-test-js/#L435" sourceLabel="image.test.js:435" />

Tests for [Image](/image) convolute2D.

<MemberHeading id="imagetransform" depth="3" name="imageTransform" sig="imageTransform()" />

<MemberMeta sourceHref="/source/tests/image/image-test-js/#L477" sourceLabel="image.test.js:477" />

Tests for [Image](/image) transform.

<MemberHeading id="imagecompose" depth="3" name="imageCompose" sig="imageCompose()" />

<MemberMeta sourceHref="/source/tests/image/image-test-js/#L532" sourceLabel="image.test.js:532" />

Tests for [Image](/image) compose.

<MemberHeading id="imagefactory" depth="3" name="imagefactory" sig="imagefactory()" />

<MemberMeta sourceHref="/source/tests/image/image-test-js/#L571" sourceLabel="image.test.js:571" />

Tests for [ImageFactory](/imagefactory).

<MemberHeading id="hasvaluesgetoffsets" depth="3" name="hasvaluesGetoffsets" sig="hasvaluesGetoffsets()" />

<MemberMeta sourceHref="/source/tests/image/image-test-js/#L627" sourceLabel="image.test.js:627" />

Tests for [Image](/image) hasValues and getOffsets.

<MemberHeading id="clone" depth="3" name="clone" sig="clone()" />

<MemberMeta sourceHref="/source/tests/image/image-test-js/#L685" sourceLabel="image.test.js:685" />

Tests for [Image](/image) clone.

<MemberHeading id="imageresamplevolumeids" depth="3" name="imageResampleVolumeIds" sig="imageResampleVolumeIds()" />

<MemberMeta sourceHref="/source/tests/image/image-test-js/#L745" sourceLabel="image.test.js:745" />

Tests for [Image#resample](/image#resample) of an image with volume ids.

<MemberHeading id="getrescaledvaluesatposition" depth="3" name="getRescaledValuesAtPosition" sig="getRescaledValuesAtPosition()" />

<MemberMeta sourceHref="/source/tests/image/image-test-js/#L813" sourceLabel="image.test.js:813" />

Tests for [Image#getRescaledValuesAtPosition](/image#getrescaledvaluesatposition).

<MemberHeading id="imagecontourgetdistance" depth="3" name="imageContourGetdistance" sig="imageContourGetdistance()" />

<MemberMeta sourceHref="/source/tests/image/imagecontour-test-js/#L17" sourceLabel="imageContour.test.js:17" />

Tests for [ImageContour](/imagecontour) getDistance.

<MemberHeading id="simplerangeiterator" depth="3" name="simplerangeIterator" sig="simplerangeIterator()" />

<MemberMeta sourceHref="/source/tests/image/iterator-test-js/#L201" sourceLabel="iterator.test.js:201" />

Tests for [simpleRange](/global#simplerange).

<MemberHeading id="rangeiteratoraxial" depth="3" name="rangeIteratorAxial" sig="rangeIteratorAxial()" />

<MemberMeta sourceHref="/source/tests/image/iterator-test-js/#L239" sourceLabel="iterator.test.js:239" />

Tests for [range](/global#range).

<MemberHeading id="rangeiteratorcoronal" depth="3" name="rangeIteratorCoronal" sig="rangeIteratorCoronal()" />

<MemberMeta sourceHref="/source/tests/image/iterator-test-js/#L290" sourceLabel="iterator.test.js:290" />

Tests for [range](/global#range).

<MemberHeading id="rangeiteratorsagittal" depth="3" name="rangeIteratorSagittal" sig="rangeIteratorSagittal()" />

<MemberMeta sourceHref="/source/tests/image/iterator-test-js/#L346" sourceLabel="iterator.test.js:346" />

Tests for [range](/global#range).

<MemberHeading id="rgbiterator" depth="3" name="rgbIterator" sig="rgbIterator()" />

<MemberMeta sourceHref="/source/tests/image/iterator-test-js/#L401" sourceLabel="iterator.test.js:401" />

Tests for [simpleRange3d](/global#simplerange3d).

<MemberHeading id="getsliceiterator" depth="3" name="getsliceiterator" sig="getsliceiterator()" />

<MemberMeta sourceHref="/source/tests/image/iterator-test-js/#L483" sourceLabel="iterator.test.js:483" />

Tests for [getSliceIterator](/global#getsliceiterator).

<MemberHeading id="regioniterator" depth="3" name="regionIterator" sig="regionIterator()" />

<MemberMeta sourceHref="/source/tests/image/iterator-test-js/#L576" sourceLabel="iterator.test.js:576" />

Tests for [rangeRegion](/global#rangeregion).

<MemberHeading id="labelingfilterclass" depth="3" name="labelingfilterClass" sig="labelingfilterClass()" />

<MemberMeta sourceHref="/source/tests/image/labeling-test-js/#L32" sourceLabel="labeling.test.js:32" />

Tests for [LabelingFilter](/labelingfilter).

<MemberHeading id="masksegmenthelperconstructorexisting" depth="3" name="maskSegmentHelperConstructorExisting" sig="maskSegmentHelperConstructorExisting()" />

<MemberMeta sourceHref="/source/tests/image/masksegmenthelper-test-js/#L90" sourceLabel="maskSegmentHelper.test.js:90" />

Tests that the constructor reads segments from an existing meta object.

<MemberHeading id="masksegmenthelperconstructornocustom" depth="3" name="maskSegmentHelperConstructorNoCustom" sig="maskSegmentHelperConstructorNoCustom()" />

<MemberMeta sourceHref="/source/tests/image/masksegmenthelper-test-js/#L103" sourceLabel="maskSegmentHelper.test.js:103" />

Tests that the constructor initialises meta.custom when absent.

<MemberHeading id="masksegmenthelperconstructornosegments" depth="3" name="maskSegmentHelperConstructorNoSegments" sig="maskSegmentHelperConstructorNoSegments()" />

<MemberMeta sourceHref="/source/tests/image/masksegmenthelper-test-js/#L123" sourceLabel="maskSegmentHelper.test.js:123" />

Tests that the constructor adds a segments array when meta.custom exists but has no segments property.

<MemberHeading id="masksegmenthelpergetmask" depth="3" name="maskSegmentHelperGetMask" sig="maskSegmentHelperGetMask()" />

<MemberMeta sourceHref="/source/tests/image/masksegmenthelper-test-js/#L143" sourceLabel="maskSegmentHelper.test.js:143" />

Tests that getMask returns the mask passed to the constructor.

<MemberHeading id="masksegmenthelperhasgetsegment" depth="3" name="maskSegmentHelperHasGetSegment" sig="maskSegmentHelperHasGetSegment()" />

<MemberMeta sourceHref="/source/tests/image/masksegmenthelper-test-js/#L168" sourceLabel="maskSegmentHelper.test.js:168" />

Tests hasSegment and getSegment for present and absent segments.

<MemberHeading id="masksegmenthelpercount" depth="3" name="maskSegmentHelperCount" sig="maskSegmentHelperCount()" />

<MemberMeta sourceHref="/source/tests/image/masksegmenthelper-test-js/#L185" sourceLabel="maskSegmentHelper.test.js:185" />

Tests that getNumberOfSegments tracks additions and removals.

<MemberHeading id="masksegmenthelperaddrgb" depth="3" name="maskSegmentHelperAddRgb" sig="maskSegmentHelperAddRgb()" />

<MemberMeta sourceHref="/source/tests/image/masksegmenthelper-test-js/#L204" sourceLabel="maskSegmentHelper.test.js:204" />

Tests that addSegment calls updatePaletteColourMap when displayRGBValue is set.

<MemberHeading id="masksegmenthelperaddduplicate" depth="3" name="maskSegmentHelperAddDuplicate" sig="maskSegmentHelperAddDuplicate()" />

<MemberMeta sourceHref="/source/tests/image/masksegmenthelper-test-js/#L230" sourceLabel="maskSegmentHelper.test.js:230" />

Tests that addSegment does not add a segment with a duplicate number.

<MemberHeading id="masksegmenthelperremove" depth="3" name="maskSegmentHelperRemove" sig="maskSegmentHelperRemove()" />

<MemberMeta sourceHref="/source/tests/image/masksegmenthelper-test-js/#L254" sourceLabel="maskSegmentHelper.test.js:254" />

Tests that removeSegment removes an existing segment.

<MemberHeading id="masksegmenthelperremoveunknown" depth="3" name="maskSegmentHelperRemoveUnknown" sig="maskSegmentHelperRemoveUnknown()" />

<MemberMeta sourceHref="/source/tests/image/masksegmenthelper-test-js/#L267" sourceLabel="maskSegmentHelper.test.js:267" />

Tests that removeSegment is a no-op for an unknown segment number.

<MemberHeading id="masksegmenthelperupdate" depth="3" name="maskSegmentHelperUpdate" sig="maskSegmentHelperUpdate()" />

<MemberMeta sourceHref="/source/tests/image/masksegmenthelper-test-js/#L289" sourceLabel="maskSegmentHelper.test.js:289" />

Tests that updateSegment replaces an existing segment in-place.

<MemberHeading id="masksegmenthelperupdateunknown" depth="3" name="maskSegmentHelperUpdateUnknown" sig="maskSegmentHelperUpdateUnknown()" />

<MemberMeta sourceHref="/source/tests/image/masksegmenthelper-test-js/#L302" sourceLabel="maskSegmentHelper.test.js:302" />

Tests that updateSegment is a no-op for an unknown segment number.

<MemberHeading id="masksegmenthelpermaskhassegmentsdisplay" depth="3" name="maskSegmentHelperMaskHasSegmentsDisplay" sig="maskSegmentHelperMaskHasSegmentsDisplay()" />

<MemberMeta sourceHref="/source/tests/image/masksegmenthelper-test-js/#L324" sourceLabel="maskSegmentHelper.test.js:324" />

Tests that maskHasSegments passes displayValue to hasValues.

<MemberHeading id="masksegmenthelpermaskhassegmentsnumber" depth="3" name="maskSegmentHelperMaskHasSegmentsNumber" sig="maskSegmentHelperMaskHasSegmentsNumber()" />

<MemberMeta sourceHref="/source/tests/image/masksegmenthelper-test-js/#L353" sourceLabel="maskSegmentHelper.test.js:353" />

Tests that maskHasSegments falls back to segment.number when displayValue is absent.

<MemberHeading id="masksegmenthelpermaskhassegmentsunknown" depth="3" name="maskSegmentHelperMaskHasSegmentsUnknown" sig="maskSegmentHelperMaskHasSegmentsUnknown()" />

<MemberMeta sourceHref="/source/tests/image/masksegmenthelper-test-js/#L374" sourceLabel="maskSegmentHelper.test.js:374" />

Tests that maskHasSegments inserts false for unknown segment numbers.

<MemberHeading id="masksegmenthelperfindoverlapempty" depth="3" name="maskSegmentHelperFindOverlapEmpty" sig="maskSegmentHelperFindOverlapEmpty()" />

<MemberMeta sourceHref="/source/tests/image/masksegmenthelper-test-js/#L406" sourceLabel="maskSegmentHelper.test.js:406" />

Tests that findOverlap returns empty when neither mask has labelled voxels.

<MemberHeading id="masksegmenthelperfindoverlapidentical" depth="3" name="maskSegmentHelperFindOverlapIdentical" sig="maskSegmentHelperFindOverlapIdentical()" />

<MemberMeta sourceHref="/source/tests/image/masksegmenthelper-test-js/#L420" sourceLabel="maskSegmentHelper.test.js:420" />

Tests findOverlap when two masks share the same geometry and identical pixel values — every labelled voxel overlaps 100%.

<MemberHeading id="masksegmenthelperfindoverlapnone" depth="3" name="maskSegmentHelperFindOverlapNone" sig="maskSegmentHelperFindOverlapNone()" />

<MemberMeta sourceHref="/source/tests/image/masksegmenthelper-test-js/#L456" sourceLabel="maskSegmentHelper.test.js:456" />

Tests findOverlap when the two masks have no overlapping labelled voxels.

<MemberHeading id="masksegmenthelperfindoverlappartial" depth="3" name="maskSegmentHelperFindOverlapPartial" sig="maskSegmentHelperFindOverlapPartial()" />

<MemberMeta sourceHref="/source/tests/image/masksegmenthelper-test-js/#L476" sourceLabel="maskSegmentHelper.test.js:476" />

Tests findOverlap with partial overlap between segments.

<MemberHeading id="masksegmenthelperfindoverlap" depth="3" name="maskSegmentHelperFindOverlap" sig="maskSegmentHelperFindOverlap()" />

<MemberMeta sourceHref="/source/tests/image/masksegmenthelper-test-js/#L505" sourceLabel="maskSegmentHelper.test.js:505" />

Tests for [MaskSegmentHelper](/masksegmenthelper) findOverlap.

<MemberHeading id="masksegmentviewhelperishiddeninitial" depth="3" name="maskSegmentViewHelperIsHiddenInitial" sig="maskSegmentViewHelperIsHiddenInitial()" />

<MemberMeta sourceHref="/source/tests/image/masksegmentviewhelper-test-js/#L28" sourceLabel="maskSegmentViewHelper.test.js:28" />

Tests that isHidden returns false for a segment never added.

<MemberHeading id="masksegmentviewhelperaddtohidden" depth="3" name="maskSegmentViewHelperAddToHidden" sig="maskSegmentViewHelperAddToHidden()" />

<MemberMeta sourceHref="/source/tests/image/masksegmentviewhelper-test-js/#L38" sourceLabel="maskSegmentViewHelper.test.js:38" />

Tests that a segment is hidden after addToHidden.

<MemberHeading id="masksegmentviewhelperaddduplicate" depth="3" name="maskSegmentViewHelperAddDuplicate" sig="maskSegmentViewHelperAddDuplicate()" />

<MemberMeta sourceHref="/source/tests/image/masksegmentviewhelper-test-js/#L52" sourceLabel="maskSegmentViewHelper.test.js:52" />

Tests that addToHidden is a no-op for an already-hidden segment.

<MemberHeading id="masksegmentviewhelperremovefromhidden" depth="3" name="maskSegmentViewHelperRemoveFromHidden" sig="maskSegmentViewHelperRemoveFromHidden()" />

<MemberMeta sourceHref="/source/tests/image/masksegmentviewhelper-test-js/#L71" sourceLabel="maskSegmentViewHelper.test.js:71" />

Tests that removeFromHidden unhides a hidden segment.

<MemberHeading id="masksegmentviewhelperremoveunknown" depth="3" name="maskSegmentViewHelperRemoveUnknown" sig="maskSegmentViewHelperRemoveUnknown()" />

<MemberMeta sourceHref="/source/tests/image/masksegmentviewhelper-test-js/#L87" sourceLabel="maskSegmentViewHelper.test.js:87" />

Tests that removeFromHidden is a no-op for a segment not in the list.

<MemberHeading id="masksegmentviewhelpermultiple" depth="3" name="maskSegmentViewHelperMultiple" sig="maskSegmentViewHelperMultiple()" />

<MemberMeta sourceHref="/source/tests/image/masksegmentviewhelper-test-js/#L105" sourceLabel="maskSegmentViewHelper.test.js:105" />

Tests that multiple segments can be independently hidden and shown.

<MemberHeading id="islutbitsstored" depth="3" name="isLutBitsStored" sig="isLutBitsStored()" />

<MemberMeta sourceHref="/source/tests/image/modalitylut-test-js/#L19" sourceLabel="modalityLut.test.js:19" />

Tests for [isLutBitsStored](/global#islutbitsstored).

<MemberHeading id="modalitylutclass" depth="3" name="modalityLutClass" sig="modalityLutClass()" />

<MemberMeta sourceHref="/source/tests/image/modalitylut-test-js/#L33" sourceLabel="modalityLut.test.js:33" />

Tests for [ModalityLut](/modalitylut).

<MemberHeading id="positionhelpergetgeometry" depth="3" name="positionHelperGetGeometry" sig="positionHelperGetGeometry()" />

<MemberMeta sourceHref="/source/tests/image/positionhelper-test-js/#L108" sourceLabel="positionHelper.test.js:108" />

Tests that getGeometry returns the image geometry.

<MemberHeading id="positionhelpergetscrolldim" depth="3" name="positionHelperGetScrollDim" sig="positionHelperGetScrollDim()" />

<MemberMeta sourceHref="/source/tests/image/positionhelper-test-js/#L117" sourceLabel="positionHelper.test.js:117" />

Tests that getScrollDimIndex returns the view scroll dim.

<MemberHeading id="positionhelpergetmaxdimvalue" depth="3" name="positionHelperGetMaxDimValue" sig="positionHelperGetMaxDimValue()" />

<MemberMeta sourceHref="/source/tests/image/positionhelper-test-js/#L126" sourceLabel="positionHelper.test.js:126" />

Tests getMaximumDimValue for each axis.

<MemberHeading id="positionhelpergetmaxscrollvalue" depth="3" name="positionHelperGetMaxScrollValue" sig="positionHelperGetMaxScrollValue()" />

<MemberMeta sourceHref="/source/tests/image/positionhelper-test-js/#L137" sourceLabel="positionHelper.test.js:137" />

Tests that getMaximumScrollValue returns the max along the scroll dim.

<MemberHeading id="positionhelpergetcurrentposition" depth="3" name="positionHelperGetCurrentPosition" sig="positionHelperGetCurrentPosition()" />

<MemberMeta sourceHref="/source/tests/image/positionhelper-test-js/#L150" sourceLabel="positionHelper.test.js:150" />

Tests that getCurrentPosition matches the initial position.

<MemberHeading id="positionhelpergetcurrentindex" depth="3" name="positionHelperGetCurrentIndex" sig="positionHelperGetCurrentIndex()" />

<MemberMeta sourceHref="/source/tests/image/positionhelper-test-js/#L163" sourceLabel="positionHelper.test.js:163" />

Tests that getCurrentIndex matches the initial index.

<MemberHeading id="positionhelpergetcurrentdimvalue" depth="3" name="positionHelperGetCurrentDimValue" sig="positionHelperGetCurrentDimValue()" />

<MemberMeta sourceHref="/source/tests/image/positionhelper-test-js/#L175" sourceLabel="positionHelper.test.js:175" />

Tests getCurrentPositionDimValue for each axis.

<MemberHeading id="positionhelpergetcurrentscrollvalue" depth="3" name="positionHelperGetCurrentScrollValue" sig="positionHelperGetCurrentScrollValue()" />

<MemberMeta sourceHref="/source/tests/image/positionhelper-test-js/#L189" sourceLabel="positionHelper.test.js:189" />

Tests that getCurrentPositionScrollValue returns the scroll-axis index.

<MemberHeading id="positionhelpergetcurrentatdimvalue" depth="3" name="positionHelperGetCurrentAtDimValue" sig="positionHelperGetCurrentAtDimValue()" />

<MemberMeta sourceHref="/source/tests/image/positionhelper-test-js/#L198" sourceLabel="positionHelper.test.js:198" />

Tests getCurrentPositionAtDimValue: modifies one dim, keeps others.

<MemberHeading id="positionhelpergetcurrentatscrollvalue" depth="3" name="positionHelperGetCurrentAtScrollValue" sig="positionHelperGetCurrentAtScrollValue()" />

<MemberMeta sourceHref="/source/tests/image/positionhelper-test-js/#L213" sourceLabel="positionHelper.test.js:213" />

Tests getCurrentPositionAtScrollValue: modifies the scroll axis.

<MemberHeading id="positionhelpersetposition" depth="3" name="positionHelperSetPosition" sig="positionHelperSetPosition()" />

<MemberMeta sourceHref="/source/tests/image/positionhelper-test-js/#L230" sourceLabel="positionHelper.test.js:230" />

Tests that setCurrentPosition updates the current position.

<MemberHeading id="positionhelpersetpositionundefined" depth="3" name="positionHelperSetPositionUndefined" sig="positionHelperSetPositionUndefined()" />

<MemberMeta sourceHref="/source/tests/image/positionhelper-test-js/#L242" sourceLabel="positionHelper.test.js:242" />

Tests that setCurrentPosition with undefined returns false without update.

<MemberHeading id="positionhelperinbounds" depth="3" name="positionHelperInBounds" sig="positionHelperInBounds()" />

<MemberMeta sourceHref="/source/tests/image/positionhelper-test-js/#L259" sourceLabel="positionHelper.test.js:259" />

Tests isPositionInBounds for positions inside and outside the geometry.

<MemberHeading id="positionhelpersetsafe" depth="3" name="positionHelperSetSafe" sig="positionHelperSetSafe()" />

<MemberMeta sourceHref="/source/tests/image/positionhelper-test-js/#L272" sourceLabel="positionHelper.test.js:272" />

Tests setCurrentPositionSafe rejects an out-of-bounds position.

<MemberHeading id="positionhelpergetincdec" depth="3" name="positionHelperGetIncDec" sig="positionHelperGetIncDec()" />

<MemberMeta sourceHref="/source/tests/image/positionhelper-test-js/#L291" sourceLabel="positionHelper.test.js:291" />

Tests getIncrementPosition and getDecrementPosition return the neighbouring world points without moving.

<MemberHeading id="positionhelperincrement" depth="3" name="positionHelperIncrement" sig="positionHelperIncrement()" />

<MemberMeta sourceHref="/source/tests/image/positionhelper-test-js/#L310" sourceLabel="positionHelper.test.js:310" />

Tests that incrementPosition moves when in bounds and fails at the max.

<MemberHeading id="positionhelperdecrement" depth="3" name="positionHelperDecrement" sig="positionHelperDecrement()" />

<MemberMeta sourceHref="/source/tests/image/positionhelper-test-js/#L327" sourceLabel="positionHelper.test.js:327" />

Tests that decrementPosition moves when in bounds and fails at zero.

<MemberHeading id="positionhelperscrollincdec" depth="3" name="positionHelperScrollIncDec" sig="positionHelperScrollIncDec()" />

<MemberMeta sourceHref="/source/tests/image/positionhelper-test-js/#L342" sourceLabel="positionHelper.test.js:342" />

Tests incrementPositionAlongScroll and decrementPositionAlongScroll.

<MemberHeading id="positionhelpermergeincompatible" depth="3" name="positionHelperMergeIncompatible" sig="positionHelperMergeIncompatible()" />

<MemberMeta sourceHref="/source/tests/image/positionhelper-test-js/#L358" sourceLabel="positionHelper.test.js:358" />

Tests that merge throws when the two helpers have different scroll dims.

<MemberHeading id="positionhelpermergecompatible" depth="3" name="positionHelperMergeCompatible" sig="positionHelperMergeCompatible()" />

<MemberMeta sourceHref="/source/tests/image/positionhelper-test-js/#L369" sourceLabel="positionHelper.test.js:369" />

Tests that merge extends the geometry along the scroll dimension.

<MemberHeading id="resamplingfilterclass" depth="3" name="resamplingfilterClass" sig="resamplingfilterClass()" />

<MemberMeta sourceHref="/source/tests/image/resampling-test-js/#L26" sourceLabel="resampling.test.js:26" />

Tests for [ResamplingFilter](/resamplingfilter).

<MemberHeading id="generateworkermessages4d" depth="3" name="generateWorkerMessages4D" sig="generateWorkerMessages4D()" />

<MemberMeta sourceHref="/source/tests/image/resampling-test-js/#L408" sourceLabel="resampling.test.js:408" />

Tests that [generateWorkerMessages](/global#generateworkermessages) passes a view on each frame data for 4D data.

<MemberHeading id="resamplingtaskstartmessage" depth="3" name="resamplingTaskStartMessage" sig="resamplingTaskStartMessage()" />

<MemberMeta sourceHref="/source/tests/image/resampling-test-js/#L434" sourceLabel="resampling.test.js:434" />

Tests that the resampling task start message holds a compact copy of the frame data and transfers it.

<MemberHeading id="sizeclass" depth="3" name="sizeClass" sig="sizeClass()" />

<MemberMeta sourceHref="/source/tests/image/size-test-js/#L17" sourceLabel="size.test.js:17" />

Tests for [Size](/size).

<MemberHeading id="indextoandfromoffset" depth="3" name="indexToAndFromOffset" sig="indexToAndFromOffset()" />

<MemberMeta sourceHref="/source/tests/image/size-test-js/#L128" sourceLabel="size.test.js:128" />

Tests for `Size.indexToOffset`.

<MemberHeading id="indexnormalisepoint" depth="3" name="indexNormalisePoint" sig="indexNormalisePoint()" />

<MemberMeta sourceHref="/source/tests/image/size-test-js/#L230" sourceLabel="size.test.js:230" />

Tests for `Size.normalisePoint`.

<MemberHeading id="sizenormaliseindex" depth="3" name="sizeNormaliseIndex" sig="sizeNormaliseIndex()" />

<MemberMeta sourceHref="/source/tests/image/size-test-js/#L289" sourceLabel="size.test.js:289" />

Tests for `Size.normaliseIndex`.

<MemberHeading id="spacingclass" depth="3" name="spacingClass" sig="spacingClass()" />

<MemberMeta sourceHref="/source/tests/image/spacing-test-js/#L15" sourceLabel="spacing.test.js:15" />

Tests for [Spacing](/spacing).

<MemberHeading id="viewwlchangeevent" depth="3" name="viewWlchangeEvent" sig="viewWlchangeEvent()" />

<MemberMeta sourceHref="/source/tests/image/view-test-js/#L23" sourceLabel="view.test.js:23" />

Tests for [View](/view) listeners.

<MemberHeading id="playbackmilliseconds" depth="3" name="playbackMilliseconds" sig="playbackMilliseconds()" />

<MemberMeta sourceHref="/source/tests/image/view-test-js/#L65" sourceLabel="view.test.js:65" />

Tests for [View](/view) getImage meta.

<MemberHeading id="generatedatamono" depth="3" name="generateDataMono" sig="generateDataMono()" />

<MemberMeta sourceHref="/source/tests/image/view-test-js/#L107" sourceLabel="view.test.js:107" />

Tests for [View](/view) generateImageData MONO.

<MemberHeading id="generatedatamonowithrsi" depth="3" name="generateDataMonoWithRsi" sig="generateDataMonoWithRsi()" />

<MemberMeta sourceHref="/source/tests/image/view-test-js/#L167" sourceLabel="view.test.js:167" />

Tests for [View](/view) generateImageData MONO with RSI.

<MemberHeading id="generatedatamonofloat" depth="3" name="generateDataMonoFloat" sig="generateDataMonoFloat()" />

<MemberMeta sourceHref="/source/tests/image/view-test-js/#L229" sourceLabel="view.test.js:229" />

Tests for [View](/view) generateImageData MONO with float data.

<MemberHeading id="generatedatamonoint32" depth="3" name="generateDataMonoInt32" sig="generateDataMonoInt32()" />

<MemberMeta sourceHref="/source/tests/image/view-test-js/#L287" sourceLabel="view.test.js:287" />

Tests for [View](/view) generateImageData MONO with 32 bits integer data.

<MemberHeading id="generatedatamononobitsstored" depth="3" name="generateDataMonoNoBitsStored" sig="generateDataMonoNoBitsStored()" />

<MemberMeta sourceHref="/source/tests/image/view-test-js/#L346" sourceLabel="view.test.js:346" />

Tests for [View](/view) generateImageData MONO with integer data and no bits stored.

<MemberHeading id="generatedatargb" depth="3" name="generateDataRgb" sig="generateDataRgb()" />

<MemberMeta sourceHref="/source/tests/image/view-test-js/#L414" sourceLabel="view.test.js:414" />

Tests for [View](/view) generateImageData RGB.

<MemberHeading id="generatedatatiming" depth="3" name="generateDataTiming" sig="generateDataTiming()" />

<MemberMeta sourceHref="/source/tests/image/view-test-js/#L514" sourceLabel="view.test.js:514" />

Tests for [View](/view) generateImageData timing.

<MemberHeading id="viewinitialindex" depth="3" name="viewInitialIndex" sig="viewInitialIndex()" />

<MemberMeta sourceHref="/source/tests/image/view-test-js/#L568" sourceLabel="view.test.js:568" />

Tests for [View](/view) initial index.

<MemberHeading id="viewmonochromebasic" depth="3" name="viewMonochromeBasic" sig="viewMonochromeBasic()" />

<MemberMeta sourceHref="/source/tests/image/viewmonochrome-test-js/#L28" sourceLabel="viewMonochrome.test.js:28" />

Tests for [generateImageDataMonochrome](/global#generateimagedatamonochrome) basic RGBA mapping.

<MemberHeading id="viewmonochromewindowing" depth="3" name="viewMonochromeWindowing" sig="viewMonochromeWindowing()" />

<MemberMeta sourceHref="/source/tests/image/viewmonochrome-test-js/#L58" sourceLabel="viewMonochrome.test.js:58" />

Tests that the window LUT mapping is applied before colour-map lookup.

<MemberHeading id="viewmonochromealphaargs" depth="3" name="viewMonochromeAlphaArgs" sig="viewMonochromeAlphaArgs()" />

<MemberMeta sourceHref="/source/tests/image/viewmonochrome-test-js/#L88" sourceLabel="viewMonochrome.test.js:88" />

Tests that the alpha function receives the raw pixel value (not the windowed one) together with its position index.

<MemberHeading id="viewmonochromeempty" depth="3" name="viewMonochromeEmpty" sig="viewMonochromeEmpty()" />

<MemberMeta sourceHref="/source/tests/image/viewmonochrome-test-js/#L121" sourceLabel="viewMonochrome.test.js:121" />

Tests for [generateImageDataMonochrome](/global#generateimagedatamonochrome) with an empty iterator.

<MemberHeading id="viewpalettecolor8bit" depth="3" name="viewPaletteColor8bit" sig="viewPaletteColor8bit()" />

<MemberMeta sourceHref="/source/tests/image/viewpalettecolor-test-js/#L24" sourceLabel="viewPaletteColor.test.js:24" />

Tests for [generateImageDataPaletteColor](/global#generateimagedatapalettecolor) with 8-bit data.

<MemberHeading id="viewpalettecolor16bit" depth="3" name="viewPaletteColor16bit" sig="viewPaletteColor16bit()" />

<MemberMeta sourceHref="/source/tests/image/viewpalettecolor-test-js/#L54" sourceLabel="viewPaletteColor.test.js:54" />

Tests for [generateImageDataPaletteColor](/global#generateimagedatapalettecolor) with 16-bit stored data.

<MemberHeading id="viewpalettecoloralpha" depth="3" name="viewPaletteColorAlpha" sig="viewPaletteColorAlpha()" />

<MemberMeta sourceHref="/source/tests/image/viewpalettecolor-test-js/#L84" sourceLabel="viewPaletteColor.test.js:84" />

Tests for [generateImageDataPaletteColor](/global#generateimagedatapalettecolor) alpha function.

<MemberHeading id="viewpalettecolorempty" depth="3" name="viewPaletteColorEmpty" sig="viewPaletteColorEmpty()" />

<MemberMeta sourceHref="/source/tests/image/viewpalettecolor-test-js/#L114" sourceLabel="viewPaletteColor.test.js:114" />

Tests for [generateImageDataPaletteColor](/global#generateimagedatapalettecolor) empty iterator.

<MemberHeading id="viewpalettecolor16bitlog" depth="3" name="viewPaletteColor16bitLog" sig="viewPaletteColor16bitLog()" />

<MemberMeta sourceHref="/source/tests/image/viewpalettecolor-test-js/#L132" sourceLabel="viewPaletteColor.test.js:132" />

Tests for [generateImageDataPaletteColor](/global#generateimagedatapalettecolor) 16-bit logging.

<MemberHeading id="viewrgbbasic" depth="3" name="viewRgbBasic" sig="viewRgbBasic()" />

<MemberMeta sourceHref="/source/tests/image/viewrgb-test-js/#L16" sourceLabel="viewRgb.test.js:16" />

Tests for [generateImageDataRgb](/global#generateimagedatargb) basic RGBA mapping.

<MemberHeading id="viewrgbalphaargs" depth="3" name="viewRgbAlphaArgs" sig="viewRgbAlphaArgs()" />

<MemberMeta sourceHref="/source/tests/image/viewrgb-test-js/#L45" sourceLabel="viewRgb.test.js:45" />

Tests that the alpha function receives the full RGB triplet and the position index, and that the returned value is stored in the alpha byte.

<MemberHeading id="viewrgbempty" depth="3" name="viewRgbEmpty" sig="viewRgbEmpty()" />

<MemberMeta sourceHref="/source/tests/image/viewrgb-test-js/#L72" sourceLabel="viewRgb.test.js:72" />

Tests for [generateImageDataRgb](/global#generateimagedatargb) with an empty iterator.

<MemberHeading id="viewrgbnoconversion" depth="3" name="viewRgbNoConversion" sig="viewRgbNoConversion()" />

<MemberMeta sourceHref="/source/tests/image/viewrgb-test-js/#L88" sourceLabel="viewRgb.test.js:88" />

Tests that no colour conversion is applied — values are copied as-is. Verifies the function does not mix up channels.

<MemberHeading id="viewybrfullbasic" depth="3" name="viewYbrFullBasic" sig="viewYbrFullBasic()" />

<MemberMeta sourceHref="/source/tests/image/viewybrfull-test-js/#L19" sourceLabel="viewYbrFull.test.js:19" />

Tests for [generateImageDataYbrFull](/global#generateimagedataybrfull) basic RGBA mapping.

<MemberHeading id="viewybrfullneutralchroma" depth="3" name="viewYbrFullNeutralChroma" sig="viewYbrFullNeutralChroma()" />

<MemberMeta sourceHref="/source/tests/image/viewybrfull-test-js/#L51" sourceLabel="viewYbrFull.test.js:51" />

Tests that neutral chroma (Cb = Cr = 128) produces R = G = B = Y.

<MemberHeading id="viewybrfullalphaargs" depth="3" name="viewYbrFullAlphaArgs" sig="viewYbrFullAlphaArgs()" />

<MemberMeta sourceHref="/source/tests/image/viewybrfull-test-js/#L70" sourceLabel="viewYbrFull.test.js:70" />

Tests that the alpha function receives the full YBR triplet and index.

<MemberHeading id="viewybrfullempty" depth="3" name="viewYbrFullEmpty" sig="viewYbrFullEmpty()" />

<MemberMeta sourceHref="/source/tests/image/viewybrfull-test-js/#L97" sourceLabel="viewYbrFull.test.js:97" />

Tests for [generateImageDataYbrFull](/global#generateimagedataybrfull) with an empty iterator.

<MemberHeading id="viewybrfullclamping" depth="3" name="viewYbrFullClamping" sig="viewYbrFullClamping()" />

<MemberMeta sourceHref="/source/tests/image/viewybrfull-test-js/#L112" sourceLabel="viewYbrFull.test.js:112" />

Tests that out-of-range floating-point RGB results are clamped to \[0,255].

<MemberHeading id="voilutlinearfunctionclass" depth="3" name="voiLutLinearFunctionClass" sig="voiLutLinearFunctionClass()" />

<MemberMeta sourceHref="/source/tests/image/voilut-test-js/#L18" sourceLabel="voiLut.test.js:18" />

Tests for [VoiLutLinearFunction](/voilutlinearfunction).

<MemberHeading id="voilutsigmoidfunctionclass" depth="3" name="voiLutSigmoidFunctionClass" sig="voiLutSigmoidFunctionClass()" />

<MemberMeta sourceHref="/source/tests/image/voilut-test-js/#L56" sourceLabel="voiLut.test.js:56" />

Tests for [VoiLutSigmoidFunction](/voilutsigmoidfunction).

<MemberHeading id="windowlevelclass" depth="3" name="windowLevelClass" sig="windowLevelClass()" />

<MemberMeta sourceHref="/source/tests/image/windowlevel-test-js/#L19" sourceLabel="windowLevel.test.js:19" />

Tests for [WindowLevel](/windowlevel).

<MemberHeading id="validatewindowlevel" depth="3" name="validateWindowLevel" sig="validateWindowLevel()" />

<MemberMeta sourceHref="/source/tests/image/windowlevel-test-js/#L35" sourceLabel="windowLevel.test.js:35" />

Tests for validateWindowLevel.

<MemberHeading id="getminwindowwidth" depth="3" name="getMinWindowWidth" sig="getMinWindowWidth()" />

<MemberMeta sourceHref="/source/tests/image/windowlevel-test-js/#L77" sourceLabel="windowLevel.test.js:77" />

Tests for getMinWindowWidth.

<MemberHeading id="windowlutclass" depth="3" name="windowLutClass" sig="windowLutClass()" />

<MemberMeta sourceHref="/source/tests/image/windowlut-test-js/#L17" sourceLabel="windowLut.test.js:17" />

Tests for [WindowLut](/windowlut).
