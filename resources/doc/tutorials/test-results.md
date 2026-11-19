# Tests Results

## Context

Commit: [a4e7982](https://github.com/ivmartel/dwv/commit/a4e7982a9d6a385964da0053f0af2cf277ccf21e)

Date: Wed Nov 18 2026 16:01:51 GMT+0100 (Central European Standard Time)

Environement: jsdom ^30.0.1

## Summary
Results: 100% (1705) ✅ - 0% (0) ❌

Total tests: 1705 (skipped: 0, total time: 16555ms)

5% (80) tests with requirement(s), 95% (1625) tests with no requirement

62% (37 / 60) tested requirements

## Tests details

### annotation

| Test | Result | Requirement | Code |
| --- | :---: | --- | --- |
| Read dwv034 arrow | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-annotation#read-dwv034-arrow) |
| Read dwv034 circle | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-annotation#read-dwv034-circle) |
| Read dwv034 ellipse | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-annotation#read-dwv034-ellipse) |
| Read dwv034 protractor | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-annotation#read-dwv034-protractor) |
| Read dwv034 rectangle | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-annotation#read-dwv034-rectangle) |
| Read dwv034 roi | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-annotation#read-dwv034-roi) |
| Read dwv034 ruler | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-annotation#read-dwv034-ruler) |
| Read tid1500 v0 arrow | ✅ | URS [#DWV-REQ-IO-06-003 (Load DICOM SR annotations)](/tutorials/user-stories#dwv-req-io-06-003-load-dicom-sr-annotations) | [jsdoc](/module/tests-annotation#read-tid1500-v0-arrow) |
| Read tid1500 v0 circle | ✅ | URS [#DWV-REQ-IO-06-003 (Load DICOM SR annotations)](/tutorials/user-stories#dwv-req-io-06-003-load-dicom-sr-annotations) | [jsdoc](/module/tests-annotation#read-tid1500-v0-circle) |
| Read tid1500 v0 ellipse | ✅ | URS [#DWV-REQ-IO-06-003 (Load DICOM SR annotations)](/tutorials/user-stories#dwv-req-io-06-003-load-dicom-sr-annotations) | [jsdoc](/module/tests-annotation#read-tid1500-v0-ellipse) |
| Read tid1500 v0 protractor | ✅ | URS [#DWV-REQ-IO-06-003 (Load DICOM SR annotations)](/tutorials/user-stories#dwv-req-io-06-003-load-dicom-sr-annotations) | [jsdoc](/module/tests-annotation#read-tid1500-v0-protractor) |
| Read tid1500 v0 rectangle | ✅ | URS [#DWV-REQ-IO-06-003 (Load DICOM SR annotations)](/tutorials/user-stories#dwv-req-io-06-003-load-dicom-sr-annotations) | [jsdoc](/module/tests-annotation#read-tid1500-v0-rectangle) |
| Read tid1500 v0 roi | ✅ | URS [#DWV-REQ-IO-06-003 (Load DICOM SR annotations)](/tutorials/user-stories#dwv-req-io-06-003-load-dicom-sr-annotations) | [jsdoc](/module/tests-annotation#read-tid1500-v0-roi) |
| Read tid1500 v0 ruler | ✅ | URS [#DWV-REQ-IO-06-003 (Load DICOM SR annotations)](/tutorials/user-stories#dwv-req-io-06-003-load-dicom-sr-annotations) | [jsdoc](/module/tests-annotation#read-tid1500-v0-ruler) |
| BidimensionalLine DICOM SR import/export roundtrip | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-annotation#bidimensionalline-dicom-sr-importexport-roundtrip) |
| Read referenced frame number | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-annotation#read-referenced-frame-number) |
| Read tid1500 v0 bidimensional | ✅ | URS [#DWV-REQ-IO-06-003 (Load DICOM SR annotations)](/tutorials/user-stories#dwv-req-io-06-003-load-dicom-sr-annotations) | [jsdoc](/module/tests-annotation#read-tid1500-v0-bidimensional) |

### app

| Test | Result | Requirement | Code |
| --- | :---: | --- | --- |
| App load stops at data creation error | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-app#app-load-stops-at-data-creation-error) |
| DataController class | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-app#datacontroller-class) |
| DataController builds multi-frame files with shared origins | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-app#datacontroller-builds-multi-frame-files-with-shared-origins) |
| DataController builds multi-frame files with multiple volumes | ✅ | URS [#DWV-REQ-IO-07-001 (Load multi-volume data)](/tutorials/user-stories#dwv-req-io-07-001-load-multi-volume-data) | [jsdoc](/module/tests-app#datacontroller-builds-multi-frame-files-with-multiple-volumes) |
| DicomSliceDataList buildData guesses volume id tag | ✅ | URS [#DWV-REQ-IO-07-001 (Load multi-volume data)](/tutorials/user-stories#dwv-req-io-07-001-load-multi-volume-data) | [jsdoc](/module/tests-app#dicomslicedatalist-builddata-guesses-volume-id-tag) |
| DicomSliceDataList buildData uses volume id values | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-app#dicomslicedatalist-builddata-uses-volume-id-values) |
| DataController sets volume values once loaded | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-app#datacontroller-sets-volume-values-once-loaded) |
| DicomSliceDataList buildData merges meta with correct ids | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-app#dicomslicedatalist-builddata-merges-meta-with-correct-ids) |
| DicomSliceDataList buildData falls back to AcquisitionTime | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-app#dicomslicedatalist-builddata-falls-back-to-acquisitiontime) |
| DicomSliceDataList buildData respects custom override | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-app#dicomslicedatalist-builddata-respects-custom-override) |
| DicomSliceDataList buildData throws with no valid candidate | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-app#dicomslicedatalist-builddata-throws-with-no-valid-candidate) |
| DrawController group constructor without group creates an empty one | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-app#drawcontroller-group-constructor-without-group-creates-an-empty-one) |
| DrawController group constructor with group uses it | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-app#drawcontroller-group-constructor-with-group-uses-it) |
| DrawController group editable flag | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-app#drawcontroller-group-editable-flag) |
| DrawController group meta data | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-app#drawcontroller-group-meta-data) |
| DrawController annotations add, update and remove | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-app#drawcontroller-annotations-add-update-and-remove) |
| DrawController commands removeAnnotationWithCommand | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-app#drawcontroller-commands-removeannotationwithcommand) |
| DrawController commands removeAnnotationWithCommand unknown uid | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-app#drawcontroller-commands-removeannotationwithcommand-unknown-uid) |
| DrawController commands updateAnnotationWithCommand | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-app#drawcontroller-commands-updateannotationwithcommand) |
| DrawController commands updateAnnotationWithCommand unknown uid | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-app#drawcontroller-commands-updateannotationwithcommand-unknown-uid) |
| DrawController commands removeAllAnnotationsWithCommand | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-app#drawcontroller-commands-removeallannotationswithcommand) |
| DrawController commands removeAllAnnotationsWithCommand empty group | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-app#drawcontroller-commands-removeallannotationswithcommand-empty-group) |
| LoadController loaders loadFiles - uses FilesLoader with charset | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-app#loadcontroller-loaders-loadfiles-uses-filesloader-with-charset) |
| LoadController loaders loadURLs - uses UrlsLoader with charset and options | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-app#loadcontroller-loaders-loadurls-uses-urlsloader-with-charset-and-options) |
| LoadController loaders loadImageObject - uses MemoryLoader | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-app#loadcontroller-loaders-loadimageobject-uses-memoryloader) |
| LoadController loaders each load creates a new loader | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-app#loadcontroller-loaders-each-load-creates-a-new-loader) |
| LoadController events loadEventNames | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-app#loadcontroller-events-loadeventnames) |
| LoadController events forwards loader callbacks as tagged events | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-app#loadcontroller-events-forwards-loader-callbacks-as-tagged-events) |
| LoadController events local info overrides loader event info | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-app#loadcontroller-events-local-info-overrides-loader-event-info) |
| LoadController events no timeout callback if loader does not support it | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-app#loadcontroller-events-no-timeout-callback-if-loader-does-not-support-it) |
| LoadController events loaditem isfirstitem flag | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-app#loadcontroller-events-loaditem-isfirstitem-flag) |
| LoadController events isfirstitem is per data id | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-app#loadcontroller-events-isfirstitem-is-per-data-id) |
| LoadController events load throw sends error and loadend | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-app#loadcontroller-events-load-throw-sends-error-and-loadend) |
| LoadController loading state getLoadingDataIds | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-app#loadcontroller-loading-state-getloadingdataids) |
| LoadController loading state abort | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-app#loadcontroller-loading-state-abort) |
| LoadController loading state abort unknown or finished data id | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-app#loadcontroller-loading-state-abort-unknown-or-finished-data-id) |
| ToolboxController tools tool list | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-app#toolboxcontroller-tools-tool-list) |
| ToolboxController tools init initialises all tools | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-app#toolboxcontroller-tools-init-initialises-all-tools) |
| ToolboxController tools setSelectedTool | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-app#toolboxcontroller-tools-setselectedtool) |
| ToolboxController tools setSelectedTool unknown tool | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-app#toolboxcontroller-tools-setselectedtool-unknown-tool) |
| ToolboxController tools getSelectedToolEventHandler | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-app#toolboxcontroller-tools-getselectedtooleventhandler) |
| ToolboxController tools setToolFeatures | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-app#toolboxcontroller-tools-settoolfeatures) |
| ToolboxController shortcuts init enables keydown forwarding to the selected tool | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-app#toolboxcontroller-shortcuts-init-enables-keydown-forwarding-to-the-selected-tool) |
| ToolboxController shortcuts no keydown forwarding before init | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-app#toolboxcontroller-shortcuts-no-keydown-forwarding-before-init) |
| ToolboxController shortcuts default to document | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-app#toolboxcontroller-shortcuts-default-to-document) |
| ToolboxController shortcuts no document: no shortcuts | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-app#toolboxcontroller-shortcuts-no-document-no-shortcuts) |
| ToolboxController shortcuts keydown from editable elements is ignored | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-app#toolboxcontroller-shortcuts-keydown-from-editable-elements-is-ignored) |
| ToolboxController shortcuts default prevented keydown is ignored | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-app#toolboxcontroller-shortcuts-default-prevented-keydown-is-ignored) |
| ToolboxController shortcuts enableShortcuts(false) stops keydown forwarding | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-app#toolboxcontroller-shortcuts-enableshortcutsfalse-stops-keydown-forwarding) |
| ToolboxController layers bindLayerGroup forwards interaction events | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-app#toolboxcontroller-layers-bindlayergroup-forwards-interaction-events) |
| ToolboxController layers tool without handler for an event is skipped | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-app#toolboxcontroller-layers-tool-without-handler-for-an-event-is-skipped) |
| ToolboxController layers non interaction events are not forwarded | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-app#toolboxcontroller-layers-non-interaction-events-are-not-forwarded) |
| ToolboxController layers active layer change rebinds the layer group | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-app#toolboxcontroller-layers-active-layer-change-rebinds-the-layer-group) |
| ToolboxController layers active layer change during a touch keeps the previous layer bound until the touch ends | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-app#toolboxcontroller-layers-active-layer-change-during-a-touch-keeps-the-previous-layer-bound-until-the-touch-ends) |
| ToolboxController layers active layer change from the tool touchstart keeps the previous layer bound | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-app#toolboxcontroller-layers-active-layer-change-from-the-tool-touchstart-keeps-the-previous-layer-bound) |
| ToolboxController layers previous layer stays bound while fingers remain | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-app#toolboxcontroller-layers-previous-layer-stays-bound-while-fingers-remain) |
| ToolboxController layers previous layer is unbound when its own touches end | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-app#toolboxcontroller-layers-previous-layer-is-unbound-when-its-own-touches-end) |
| ToolboxController layers reactivating the touched layer during the touch keeps it bound | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-app#toolboxcontroller-layers-reactivating-the-touched-layer-during-the-touch-keeps-it-bound) |
| ToolboxController layers active layer change without layer is ignored | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-app#toolboxcontroller-layers-active-layer-change-without-layer-is-ignored) |
| ToolboxController layers layer groups are bound independently | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-app#toolboxcontroller-layers-layer-groups-are-bound-independently) |
| UndoController undoEventNames | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-app#undocontroller-undoeventnames) |
| UndoController initial state | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-app#undocontroller-initial-state) |
| UndoController addToUndoStack | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-app#undocontroller-addtoundostack) |
| UndoController undo and redo | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-app#undocontroller-undo-and-redo) |
| UndoController undo/redo at stack limits are no-ops | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-app#undocontroller-undoredo-at-stack-limits-are-no-ops) |
| UndoController add after undo drops redo history | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-app#undocontroller-add-after-undo-drops-redo-history) |
| UndoController removeFromUndoStack | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-app#undocontroller-removefromundostack) |
| UndoController removeFromUndoStack unknown name | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-app#undocontroller-removefromundostack-unknown-name) |
| UndoController forwarded events are CustomEvents from the controller | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-app#undocontroller-forwarded-events-are-customevents-from-the-controller) |
| UndoController reset | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-app#undocontroller-reset) |

### DeleteSegmentCommand

| Test | Result | Requirement | Code |
| --- | :---: | --- | --- |
| makeOverlappingMask logs a warning about the overlap | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-DeleteSegmentCommand#makeoverlappingmask-logs-a-warning-about-the-overlap) |
| execute removes a non-overlapping segment | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-DeleteSegmentCommand#execute-removes-a-non-overlapping-segment) |
| execute restores the overlapping segment instead of zeroing it | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-DeleteSegmentCommand#execute-restores-the-overlapping-segment-instead-of-zeroing-it) |
| execute keeps segment 2 fully exportable after seg 1 is deleted | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-DeleteSegmentCommand#execute-keeps-segment-2-fully-exportable-after-seg-1-is-deleted) |
| undo restores the deleted segment | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-DeleteSegmentCommand#undo-restores-the-deleted-segment) |

### utils

| Test | Result | Requirement | Code |
| --- | :---: | --- | --- |
| UndoStack | ✅ | URS [#DWV-REQ-UI-08-002 (Draw action undo/redo)](/tutorials/user-stories#dwv-req-ui-08-002-draw-action-undoredo) | [jsdoc](/module/tests-utils#undostack) |
| toStringId | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-utils#tostringid) |
| arrayMap | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-utils#arraymap) |
| arrayContains | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-utils#arraycontains) |
| arraySortEquals | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-utils#arraysortequals) |
| Parse multipart | ✅ | URS [#DWV-REQ-IO-02-002 (Load DICOM multipart URL)](/tutorials/user-stories#dwv-req-io-02-002-load-dicom-multipart-url) | [jsdoc](/module/tests-utils#parse-multipart) |
| isEqualRgb | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-utils#isequalrgb) |
| ybrToRgb | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-utils#ybrtorgb) |
| hexToRgb | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-utils#hextorgb) |
| isDarkColour | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-utils#isdarkcolour) |
| cielab to ciexyz | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-utils#cielab-to-ciexyz) |
| ciexyz to cielab | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-utils#ciexyz-to-cielab) |
| ciexyz to srgb | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-utils#ciexyz-to-srgb) |
| srgb to ciexyz | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-utils#srgb-to-ciexyz) |
| cielab to rgb | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-utils#cielab-to-rgb) |
| srgb to cielab | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-utils#srgb-to-cielab) |
| i18n | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-utils#i18n) |
| logging | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-utils#logging) |
| Merge objects | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-utils#merge-objects) |
| CapitaliseFirstLetter | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-utils#capitalisefirstletter) |
| StartsWith | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-utils#startswith) |
| EndsWith | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-utils#endswith) |
| getFlags | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-utils#getflags) |
| ReplaceFlags | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-utils#replaceflags) |
| getFileExtension | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-utils#getfileextension) |
| WorkerTask constructor stores startMessage and info | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-utils#workertask-constructor-stores-startmessage-and-info) |
| WorkerTask getStartMessage default | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-utils#workertask-getstartmessage-default) |
| WorkerTask getWorker returns undefined by default | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-utils#workertask-getworker-returns-undefined-by-default) |
| getDefaultPoolSize | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-utils#getdefaultpoolsize) |
| ThreadPool constructor validates the pool size | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-utils#threadpool-constructor-validates-the-pool-size) |
| clampPoolSize | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-utils#clamppoolsize) |
| ThreadPool default event handlers exist and do not throw | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-utils#threadpool-default-event-handlers-exist-and-do-not-throw) |
| ThreadPool addWorkerTask fires onworkstart only for the first task | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-utils#threadpool-addworkertask-fires-onworkstart-only-for-the-first-task) |
| ThreadPool addWorkerTask dispatches task immediately when thread free | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-utils#threadpool-addworkertask-dispatches-task-immediately-when-thread-free) |
| ThreadPool posts the task start message with its transfer list | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-utils#threadpool-posts-the-task-start-message-with-its-transfer-list) |
| ThreadPool addWorkerTask queues task when all threads are busy | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-utils#threadpool-addworkertask-queues-task-when-all-threads-are-busy) |
| ThreadPool fires onworkitem with augmented event on worker reply | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-utils#threadpool-fires-onworkitem-with-augmented-event-on-worker-reply) |
| ThreadPool fires onwork and onworkend when all tasks complete | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-utils#threadpool-fires-onwork-and-onworkend-when-all-tasks-complete) |
| ThreadPool runs next queued task when a thread is freed | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-utils#threadpool-runs-next-queued-task-when-a-thread-is-freed) |
| ThreadPool handles concurrent tasks on multiple threads | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-utils#threadpool-handles-concurrent-tasks-on-multiple-threads) |
| ThreadPool abort stops workers, clears queue, fires onabort | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-utils#threadpool-abort-stops-workers-clears-queue-fires-onabort) |
| ThreadPool is reusable after abort | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-utils#threadpool-is-reusable-after-abort) |
| ThreadPool handles worker error: stops pool and fires onerror | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-utils#threadpool-handles-worker-error-stops-pool-and-fires-onerror) |
| getUrlFromUri | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-utils#geturlfromuri) |
| splitUri | ✅ | URS [#DWV-REQ-IO-02-005 (Window location URL scheme)](/tutorials/user-stories#dwv-req-io-02-005-window-location-url-scheme) | [jsdoc](/module/tests-utils#splituri) |
| getURIQuery | ✅ | URS [#DWV-REQ-IO-02-005 (Window location URL scheme)](/tutorials/user-stories#dwv-req-io-02-005-window-location-url-scheme) | [jsdoc](/module/tests-utils#geturiquery) |
| Parse Manifest | ✅ | URS [#DWV-REQ-IO-02-006 (Load Data Manifest URL)](/tutorials/user-stories#dwv-req-io-02-006-load-data-manifest-url) | [jsdoc](/module/tests-utils#parse-manifest) |

### dicom

| Test | Result | Requirement | Code |
| --- | :---: | --- | --- |
| Data element class | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#data-element-class) |
| DICOM code class | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#dicom-code-class) |
| dictionary | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#dictionary) |
| getSegmentationCode | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getsegmentationcode) |
| getConceptNameCode | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getconceptnamecode) |
| getMeasurementUnitsCode | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getmeasurementunitscode) |
| getDateObj | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getdateobj) |
| getTimeObj | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#gettimeobj) |
| getTimeInSeconds | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#gettimeinseconds) |
| getDate | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getdate) |
| getDatetimeObj | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getdatetimeobj) |
| dateToDateObj | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#datetodateobj) |
| dateToTimeObj | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#datetotimeobj) |
| getDicomDate | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getdicomdate) |
| getDicomTime | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getdicomtime) |
| getDicomDateTime | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getdicomdatetime) |
| dump | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#dump) |
| dump sequence | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#dump-sequence) |
| dump pixel sequence | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#dump-pixel-sequence) |
| dump does not change input | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#dump-does-not-change-input) |
| DICOM segment functional group class | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#dicom-segment-functional-group-class) |
| getPixelSpacing | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getpixelspacing) |
| isMonochrome | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#ismonochrome) |
| getImage2DSize | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getimage2dsize) |
| getPixelAspectRatio | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getpixelaspectratio) |
| getSpacingFromMeasure | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getspacingfrommeasure) |
| getTagPixelUnit | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#gettagpixelunit) |
| getOrientationMatrix | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getorientationmatrix) |
| getDicomMeasureItem | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getdicommeasureitem) |
| getDicomPlaneOrientationItem | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getdicomplaneorientationitem) |
| getPhotometricInterpretation | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getphotometricinterpretation) |
| isSecondatyCapture | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#issecondatycapture) |
| getReferencedSeriesUID | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getreferencedseriesuid) |
| ImageReference with undefined | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#imagereference-with-undefined) |
| ImageReference class | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#imagereference-class) |
| ImageReference round trip | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#imagereference-round-trip) |
| getImageReference good input | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getimagereference-good-input) |
| getImageReference incomplete input | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getimagereference-incomplete-input) |
| getImageReference empty input | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getimagereference-empty-input) |
| getDicomImageReferenceItem good input | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getdicomimagereferenceitem-good-input) |
| getDicomImageReferenceItem undefined input | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getdicomimagereferenceitem-undefined-input) |
| getManufacturer good input | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getmanufacturer-good-input) |
| getManufacturer returns first | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getmanufacturer-returns-first) |
| getManufacturer no tag | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getmanufacturer-no-tag) |
| getManufacturer no value | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getmanufacturer-no-value) |
| getManufacturer undefined value | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getmanufacturer-undefined-value) |
| getManufacturer undefined tag | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getmanufacturer-undefined-tag) |
| getNormalisedManufacturer GE | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getnormalisedmanufacturer-ge) |
| getNormalisedManufacturer Siemens | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getnormalisedmanufacturer-siemens) |
| getNormalisedManufacturer Philips | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getnormalisedmanufacturer-philips) |
| getNormalisedManufacturer Hitachi | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getnormalisedmanufacturer-hitachi) |
| getNormalisedManufacturer unknown | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getnormalisedmanufacturer-unknown) |
| getNormalisedManufacturer empty | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getnormalisedmanufacturer-empty) |
| getNormalisedManufacturer no value | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getnormalisedmanufacturer-no-value) |
| getNormalisedManufacturer returns first | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getnormalisedmanufacturer-returns-first) |
| MeasuredValue empty | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#measuredvalue-empty) |
| MeasuredValue toString | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#measuredvalue-tostring) |
| MeasuredValue round trip | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#measuredvalue-round-trip) |
| getMeasuredValue numeric | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getmeasuredvalue-numeric) |
| getMeasuredValue float | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getmeasuredvalue-float) |
| getMeasuredValue rational | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getmeasuredvalue-rational) |
| getMeasuredValue code | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getmeasuredvalue-code) |
| getMeasuredValue all | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getmeasuredvalue-all) |
| getMeasuredValue no tag | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getmeasuredvalue-no-tag) |
| getDicomMeasuredValueItem numeric | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getdicommeasuredvalueitem-numeric) |
| getDicomMeasuredValueItem float | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getdicommeasuredvalueitem-float) |
| getDicomMeasuredValueItem rational | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getdicommeasuredvalueitem-rational) |
| getDicomMeasuredValueItem code | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getdicommeasuredvalueitem-code) |
| getDicomMeasuredValueItem all | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getdicommeasuredvalueitem-all) |
| getDicomMeasuredValueItem undefined | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getdicommeasuredvalueitem-undefined) |
| getDicomMeasuredValueItem empty | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getdicommeasuredvalueitem-empty) |
| NumericMeasurement undefined | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#numericmeasurement-undefined) |
| NumericMeasurement toString | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#numericmeasurement-tostring) |
| NumericMeasurement toString | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#numericmeasurement-tostring) |
| NumericMeasurement code toString | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#numericmeasurement-code-tostring) |
| NumericMeasurement undefined toString | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#numericmeasurement-undefined-tostring) |
| NumericMeasurement round trip | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#numericmeasurement-round-trip) |
| getNumericMeasurement value | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getnumericmeasurement-value) |
| getNumericMeasurement code | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getnumericmeasurement-code) |
| getNumericMeasurement good input | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getnumericmeasurement-good-input) |
| getNumericMeasurement undefined | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getnumericmeasurement-undefined) |
| getDicomNumericMeasurementItem value | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getdicomnumericmeasurementitem-value) |
| getDicomNumericMeasurementItem code | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getdicomnumericmeasurementitem-code) |
| getDicomNumericMeasurementItem good input | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getdicomnumericmeasurementitem-good-input) |
| getDicomNumericMeasurementItem undefined | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getdicomnumericmeasurementitem-undefined) |
| getImplementationClassUID | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getimplementationclassuid) |
| compareVersions | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#compareversions) |
| isVersionInBounds | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#isversioninbounds) |
| Simple DICOM parsing | ✅ | URS [#DWV-REQ-IO-01-001 (Load DICOM file(s))](/tutorials/user-stories#dwv-req-io-01-001-load-dicom-files) | [jsdoc](/module/tests-dicom#simple-dicom-parsing) |
| Simple DICOM parsing until tag | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#simple-dicom-parsing-until-tag) |
| DICOM sequence parsing | ✅ | URS [#DWV-REQ-IO-01-001 (Load DICOM file(s))](/tutorials/user-stories#dwv-req-io-01-001-load-dicom-files) | [jsdoc](/module/tests-dicom#dicom-sequence-parsing) |
| SpecificCharacterSet ISO 2022 IR 149 with code extensions | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#specificcharacterset-iso-2022-ir-149-with-code-extensions) |
| cleanString | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#cleanstring) |
| DICOMDIR parsing | ✅ | URS [#DWV-REQ-IO-02-004 (Load DICOMDIR URL)](/tutorials/user-stories#dwv-req-io-02-004-load-dicomdir-url) | [jsdoc](/module/tests-dicom#dicomdir-parsing) |
| 32 bits integer pixel data parsing | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#32-bits-integer-pixel-data-parsing) |
| Float pixel data parsing | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#float-pixel-data-parsing) |
| getTypedArrayLike | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#gettypedarraylike) |
| transferSyntax | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#transfersyntax) |
| dictionary | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#dictionary) |
| getSuvFactor no corrected | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getsuvfactor-no-corrected) |
| getSuvFactor no decay | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getsuvfactor-no-decay) |
| getSuvFactor no units | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getsuvfactor-no-units) |
| getSuvFactor no weight | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getsuvfactor-no-weight) |
| getSuvFactor no radio | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getsuvfactor-no-radio) |
| getSuvFactor no total dose | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getsuvfactor-no-total-dose) |
| getSuvFactor no half life | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getsuvfactor-no-half-life) |
| getSuvFactor good input | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getsuvfactor-good-input) |
| getSuvFactor radio start date | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getsuvfactor-radio-start-date) |
| getSuvFactor invalid weight | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getsuvfactor-invalid-weight) |
| getSuvFactor correct | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getsuvfactor-correct) |
| getContentTemplate | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getcontenttemplate) |
| DicomSRContent toString hasHeader | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#dicomsrcontent-tostring-hasheader) |
| isEqualContentItem | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#isequalcontentitem) |
| getSRContent | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getsrcontent) |
| getDicomSRContentItem | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getdicomsrcontentitem) |
| getSRContent CODE | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getsrcontent-code) |
| DICOM segment class | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#dicom-segment-class) |
| SopInstanceReference good input | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#sopinstancereference-good-input) |
| SopInstanceReference toString | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#sopinstancereference-tostring) |
| SopInstanceReference toString SOPinstance | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#sopinstancereference-tostring-sopinstance) |
| SopInstanceReference toString SOPClass | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#sopinstancereference-tostring-sopclass) |
| SopInstanceReference undefined toString | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#sopinstancereference-undefined-tostring) |
| SopInstanceReference round trip | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#sopinstancereference-round-trip) |
| getSopInstanceReference good input | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getsopinstancereference-good-input) |
| getSopInstanceReference SOPClass | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getsopinstancereference-sopclass) |
| getSopInstanceReference SOPInstance | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getsopinstancereference-sopinstance) |
| getSopInstanceReference empty | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getsopinstancereference-empty) |
| getSopInstanceReference other tag | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getsopinstancereference-other-tag) |
| getSopInstanceReference multiple | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getsopinstancereference-multiple) |
| getDicomSopInstanceReferenceItem good input | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getdicomsopinstancereferenceitem-good-input) |
| getDicomSopInstanceReferenceItem SOPClass | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getdicomsopinstancereferenceitem-sopclass) |
| getDicomSopInstanceReferenceItem SOPInstance | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getdicomsopinstancereferenceitem-sopinstance) |
| getDicomSopInstanceReferenceItem undefined | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getdicomsopinstancereferenceitem-undefined) |
| getDicomSopInstanceReferenceItem mapping | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getdicomsopinstancereferenceitem-mapping) |
| SpatialCoordinate undefined | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#spatialcoordinate-undefined) |
| SpatialCoordinate toString POINT | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#spatialcoordinate-tostring-point) |
| SpatialCoordinate toString POLYLINE | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#spatialcoordinate-tostring-polyline) |
| SpatialCoordinate round trip | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#spatialcoordinate-round-trip) |
| getSpatialCoordinate good input | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getspatialcoordinate-good-input) |
| getSpatialCoordinate minimum input | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getspatialcoordinate-minimum-input) |
| getSpatialCoordinate empty input | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getspatialcoordinate-empty-input) |
| getSpatialCoordinate multiple input | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getspatialcoordinate-multiple-input) |
| getDicomSpatialCoordinateItem good input | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getdicomspatialcoordinateitem-good-input) |
| getDicomSpatialCoordinateItem incomplete | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getdicomspatialcoordinateitem-incomplete) |
| getDicomSpatialCoordinateItem undefined | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getdicomspatialcoordinateitem-undefined) |
| getScoordFromShape Point2D | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getscoordfromshape-point2d) |
| getScoordFromShape Line | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getscoordfromshape-line) |
| getScoordFromShape Circle | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getscoordfromshape-circle) |
| getScoordFromShape Protractor | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getscoordfromshape-protractor) |
| getScoordFromShape ROI | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getscoordfromshape-roi) |
| getScoordFromShape Ellipse | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getscoordfromshape-ellipse) |
| getScoordFromShape Rectangle | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getscoordfromshape-rectangle) |
| getScoordFromShape BidimensionalLine | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getscoordfromshape-bidimensionalline) |
| getShapeFromScoord BidimensionalLine polyline | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getshapefromscoord-bidimensionalline-polyline) |
| getShapeFromScoord no data | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getshapefromscoord-no-data) |
| getShapeFromScoord no coord | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getshapefromscoord-no-coord) |
| getShapeFromScoord odd coord | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getshapefromscoord-odd-coord) |
| getShapeFromScoord point | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getshapefromscoord-point) |
| getShapeFromScoord polyline 2 points | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getshapefromscoord-polyline-2-points) |
| getShapeFromScoord circle | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getshapefromscoord-circle) |
| getShapeFromScoord bad circle | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getshapefromscoord-bad-circle) |
| getShapeFromScoord ellipse | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getshapefromscoord-ellipse) |
| getShapeFromScoord bad ellipse | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getshapefromscoord-bad-ellipse) |
| getShapeFromScoord polyline 3 points | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getshapefromscoord-polyline-3-points) |
| getShapeFromScoord polyline 4 points | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getshapefromscoord-polyline-4-points) |
| getShapeFromScoord polyline 6 points | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getshapefromscoord-polyline-6-points) |
| getShapeFromScoord multipoint | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getshapefromscoord-multipoint) |
| SpatialCoordinate3D undefined | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#spatialcoordinate3d-undefined) |
| SpatialCoordinate3D toString | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#spatialcoordinate3d-tostring) |
| SpatialCoordinate3D toString multiple | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#spatialcoordinate3d-tostring-multiple) |
| SpatialCoordinate3D toString empty | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#spatialcoordinate3d-tostring-empty) |
| SpatialCoordinate3D round trip | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#spatialcoordinate3d-round-trip) |
| getSpatialCoordinate3D good input | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getspatialcoordinate3d-good-input) |
| getSpatialCoordinate3D only graphic | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getspatialcoordinate3d-only-graphic) |
| getSpatialCoordinate3D multiple | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getspatialcoordinate3d-multiple) |
| getSpatialCoordinate3D only frame | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getspatialcoordinate3d-only-frame) |
| getSpatialCoordinate3D only fiducial | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getspatialcoordinate3d-only-fiducial) |
| getSpatialCoordinate3D empty | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getspatialcoordinate3d-empty) |
| getSpatialCoordinate3D first graphic | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getspatialcoordinate3d-first-graphic) |
| getDicomSpatialCoordinate3DItem good | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getdicomspatialcoordinate3ditem-good) |
| getDicomSpatialCoordinate3DItem only graphic | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getdicomspatialcoordinate3ditem-only-graphic) |
| getDicomSpatialCoordinate3DItem undefined | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getdicomspatialcoordinate3ditem-undefined) |
| getDicomSpatialCoordinate3DItem empty | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getdicomspatialcoordinate3ditem-empty) |
| getDicomSpatialCoordinate3DItem graphic arr | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getdicomspatialcoordinate3ditem-graphic-arr) |
| DICOM tag class | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#dicom-tag-class) |
| getTagFromDictionary | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#gettagfromdictionary) |
| defaultVolumeIdCandidates has AcquisitionTime last | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#defaultvolumeidcandidates-has-acquisitiontime-last) |
| defaultVolumeIdCandidates TemporalPositionIdentifier getter | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#defaultvolumeidcandidates-temporalpositionidentifier-getter) |
| defaultVolumeIdCandidates TemporalPositionIdentifier getter is an index | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#defaultvolumeidcandidates-temporalpositionidentifier-getter-is-an-index) |
| defaultVolumeIdCandidates TemporalPositionIdentifier getter with no tag | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#defaultvolumeidcandidates-temporalpositionidentifier-getter-with-no-tag) |
| defaultVolumeIdCandidates EchoTime getter | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#defaultvolumeidcandidates-echotime-getter) |
| defaultVolumeIdCandidates EchoTime getter with no tag | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#defaultvolumeidcandidates-echotime-getter-with-no-tag) |
| defaultVolumeIdCandidates EchoTime getter with non numeric value | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#defaultvolumeidcandidates-echotime-getter-with-non-numeric-value) |
| defaultVolumeIdCandidates TemporalPositionIdentifier getter with non numeric value | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#defaultvolumeidcandidates-temporalpositionidentifier-getter-with-non-numeric-value) |
| defaultVolumeIdCandidates TriggerTime getter | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#defaultvolumeidcandidates-triggertime-getter) |
| defaultVolumeIdCandidates InversionTime getter | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#defaultvolumeidcandidates-inversiontime-getter) |
| defaultVolumeIdCandidates AcquisitionTime getter | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#defaultvolumeidcandidates-acquisitiontime-getter) |
| defaultVolumeIdCandidates AcquisitionTime getter orders across midnight | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#defaultvolumeidcandidates-acquisitiontime-getter-orders-across-midnight) |
| defaultVolumeIdCandidates DiffusionBValue getter uses root level tag for MR | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#defaultvolumeidcandidates-diffusionbvalue-getter-uses-root-level-tag-for-mr) |
| defaultVolumeIdCandidates DiffusionBValue getter returns undefined for non MR | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#defaultvolumeidcandidates-diffusionbvalue-getter-returns-undefined-for-non-mr) |
| defaultVolumeIdCandidates TemporalPositionIndex getter | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#defaultvolumeidcandidates-temporalpositionindex-getter) |
| defaultVolumeIdCandidates TemporalPositionIndex getter with no tag | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#defaultvolumeidcandidates-temporalpositionindex-getter-with-no-tag) |
| defaultVolumeIdCandidates TemporalPositionIndex getter with varying value | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#defaultvolumeidcandidates-temporalpositionindex-getter-with-varying-value) |
| defaultVolumeIdCandidates TemporalPositionIndex getter with non numeric value | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#defaultvolumeidcandidates-temporalpositionindex-getter-with-non-numeric-value) |
| defaultVolumeIdCandidates TemporalPositionIndex getter ignores non numeric frame | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#defaultvolumeidcandidates-temporalpositionindex-getter-ignores-non-numeric-frame) |
| defaultVolumeIdCandidates DiffusionBValue getter with per-frame enhanced MR value | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#defaultvolumeidcandidates-diffusionbvalue-getter-with-per-frame-enhanced-mr-value) |
| defaultVolumeIdCandidates DiffusionBValue getter with varying per-frame value | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#defaultvolumeidcandidates-diffusionbvalue-getter-with-varying-per-frame-value) |
| defaultVolumeIdCandidates DiffusionBValue getter keeps fractional value | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#defaultvolumeidcandidates-diffusionbvalue-getter-keeps-fractional-value) |
| defaultVolumeIdCandidates DiffusionBValue getter with small exponent value | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#defaultvolumeidcandidates-diffusionbvalue-getter-with-small-exponent-value) |
| defaultVolumeIdCandidates DiffusionBValue getter with non numeric value | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#defaultvolumeidcandidates-diffusionbvalue-getter-with-non-numeric-value) |
| getVolumeIdTagValue uses TemporalPositionIdentifier if present | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getvolumeidtagvalue-uses-temporalpositionidentifier-if-present) |
| getVolumeIdTagValue prefers TemporalPositionIdentifier over TemporalPositionIndex | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getvolumeidtagvalue-prefers-temporalpositionidentifier-over-temporalpositionindex) |
| getVolumeIdTagValue uses TemporalPositionIndex for multi-frame files | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getvolumeidtagvalue-uses-temporalpositionindex-for-multi-frame-files) |
| getVolumeIdTagValue falls back to MR diffusion b-value with no frame tag | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getvolumeidtagvalue-falls-back-to-mr-diffusion-b-value-with-no-frame-tag) |
| getVolumeIdTagValue uses explicit VR private b-value | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getvolumeidtagvalue-uses-explicit-vr-private-b-value) |
| getVolumeIdTagValue decodes implicit VR (UN) private b-value | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getvolumeidtagvalue-decodes-implicit-vr-un-private-b-value) |
| getVolumeIdTagValue decodes multi-valued padded UN private b-value | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getvolumeidtagvalue-decodes-multi-valued-padded-un-private-b-value) |
| getVolumeIdTagValue uses Hitachi private b-value | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getvolumeidtagvalue-uses-hitachi-private-b-value) |
| getVolumeIdTagValue falls back to standard b-value on invalid private one | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getvolumeidtagvalue-falls-back-to-standard-b-value-on-invalid-private-one) |
| getVolumeIdTagValue reads padded UN private b-value from generated data | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getvolumeidtagvalue-reads-padded-un-private-b-value-from-generated-data) |
| getVolumeIdTagValue returns undefined with no usable tag | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getvolumeidtagvalue-returns-undefined-with-no-usable-tag) |
| getVolumeIdTagValue pre load candidates flags the explicit candidates | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getvolumeidtagvalue-pre-load-candidates-flags-the-explicit-candidates) |
| getVolumeIdTagValue pre load candidates ignores non pre load candidates | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getvolumeidtagvalue-pre-load-candidates-ignores-non-pre-load-candidates) |
| getVolumeIdTagValue pre load candidates uses custom pre load candidates | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getvolumeidtagvalue-pre-load-candidates-uses-custom-pre-load-candidates) |
| getVolumeIndices volume-major items | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getvolumeindices-volume-major-items) |
| getVolumeIndices slice-major items | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getvolumeindices-slice-major-items) |
| getVolumeIndices scrambled items | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getvolumeindices-scrambled-items) |
| getVolumeIndices sorts values as numbers | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getvolumeindices-sorts-values-as-numbers) |
| getVolumeIndices accepts fractional values | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getvolumeindices-accepts-fractional-values) |
| getVolumeIndices undefined for invalid groupings | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getvolumeindices-undefined-for-invalid-groupings) |
| getVolumeId returns the volume id of the pre load candidates | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getvolumeid-returns-the-volume-id-of-the-pre-load-candidates) |
| getVolumeId returns undefined with no usable tag | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getvolumeid-returns-undefined-with-no-usable-tag) |
| getVolumeId uses custom candidates volume id | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getvolumeid-uses-custom-candidates-volume-id) |
| getVolumeId ignores custom candidates without number id | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getvolumeid-ignores-custom-candidates-without-number-id) |
| getVolumeValues relative candidate: id relative to the first one | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getvolumevalues-relative-candidate-id-relative-to-the-first-one) |
| getVolumeValues guesses the associated value of indices | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getvolumevalues-guesses-the-associated-value-of-indices) |
| getVolumeValues rejects overlapping or unordered values | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getvolumevalues-rejects-overlapping-or-unordered-values) |
| getVolumeValues falls back to the next candidate | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getvolumevalues-falls-back-to-the-next-candidate) |
| getVolumeValues uses the temporal position time offset of frames | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getvolumevalues-uses-the-temporal-position-time-offset-of-frames) |
| getVolumeValues undefined for values and unknown sources | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getvolumevalues-undefined-for-values-and-unknown-sources) |
| guessVolumeIndices on frames uses varying TemporalPositionIndex first | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#guessvolumeindices-on-frames-uses-varying-temporalpositionindex-first) |
| guessVolumeIndices on frames falls back to b-value with constant TemporalPositionIndex | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#guessvolumeindices-on-frames-falls-back-to-b-value-with-constant-temporalpositionindex) |
| guessVolumeIndices on frames uses Philips dimension index b-value | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#guessvolumeindices-on-frames-uses-philips-dimension-index-b-value) |
| guessVolumeIndices on frames undefined without a valid candidate | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#guessvolumeindices-on-frames-undefined-without-a-valid-candidate) |
| guessVolumeIndices on frames uses custom candidates | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#guessvolumeindices-on-frames-uses-custom-candidates) |
| guessVolumeIndices on frames uses custom candidates only | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#guessvolumeindices-on-frames-uses-custom-candidates-only) |
| deprecated custom getters getVolumeIdTagValue warns once | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#deprecated-custom-getters-getvolumeidtagvalue-warns-once) |
| deprecated custom getters getPostLoadVolumeIdTagValue warns once | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#deprecated-custom-getters-getpostloadvolumeidtagvalue-warns-once) |
| getUID | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#getuid) |
| Write multiframe | ✅ | URS [#DWV-REQ-IO-05-001 (Write DICOM file)](/tutorials/user-stories#dwv-req-io-05-001-write-dicom-file) | [jsdoc](/module/tests-dicom#write-multiframe) |
| Write anonymised | ✅ | URS [#DWV-REQ-IO-05-002 (Write anonymised DICOM file)](/tutorials/user-stories#dwv-req-io-05-002-write-anonymised-dicom-file) | [jsdoc](/module/tests-dicom#write-anonymised) |
| Write remove private tags | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#write-remove-private-tags) |
| setRules name based rules warning | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#setrules-name-based-rules-warning) |
| setRules unknown action warning | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#setrules-unknown-action-warning) |
| Write unknown action rules fallback | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#write-unknown-action-rules-fallback) |
| Write range rules | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#write-range-rules) |
| translateWriterRules | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#translatewriterrules) |
| Write rules with sequence value reuse | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#write-rules-with-sequence-value-reuse) |
| Write replace rules with multiple values | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#write-replace-rules-with-multiple-values) |
| Write rules in sequence | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-dicom#write-rules-in-sequence) |
| Write anonymised and add tags | ✅ | URS [#DWV-REQ-IO-05-002 (Write anonymised DICOM file)](/tutorials/user-stories#dwv-req-io-05-002-write-anonymised-dicom-file) | [jsdoc](/module/tests-dicom#write-anonymised-and-add-tags) |
| Read-write synthetic explicit | ✅ | URS [#DWV-REQ-IO-01-001 (Load DICOM file(s))](/tutorials/user-stories#dwv-req-io-01-001-load-dicom-files) | [jsdoc](/module/tests-dicom#read-write-synthetic-explicit) |
| Read-write synthetic explicit with rules | ✅ | URS [#DWV-REQ-IO-01-001 (Load DICOM file(s))](/tutorials/user-stories#dwv-req-io-01-001-load-dicom-files) | [jsdoc](/module/tests-dicom#read-write-synthetic-explicit-with-rules) |
| Read-write synthetic implicit | ✅ | URS [#DWV-REQ-IO-01-001 (Load DICOM file(s))](/tutorials/user-stories#dwv-req-io-01-001-load-dicom-files) | [jsdoc](/module/tests-dicom#read-write-synthetic-implicit) |
| Read-write synthetic implicit with rules | ✅ | URS [#DWV-REQ-IO-01-001 (Load DICOM file(s))](/tutorials/user-stories#dwv-req-io-01-001-load-dicom-files) | [jsdoc](/module/tests-dicom#read-write-synthetic-implicit-with-rules) |
| Read-write synthetic explicit big endian | ✅ | URS [#DWV-REQ-IO-01-001 (Load DICOM file(s))](/tutorials/user-stories#dwv-req-io-01-001-load-dicom-files) | [jsdoc](/module/tests-dicom#read-write-synthetic-explicit-big-endian) |
| Read-write synthetic explicit BE with rules | ✅ | URS [#DWV-REQ-IO-01-001 (Load DICOM file(s))](/tutorials/user-stories#dwv-req-io-01-001-load-dicom-files) | [jsdoc](/module/tests-dicom#read-write-synthetic-explicit-be-with-rules) |

### getFramesGeometry

| Test | Result | Requirement | Code |
| --- | :---: | --- | --- |
| gap-fills correctly when frames are in ascending order (sanity check) | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-getFramesGeometry#gap-fills-correctly-when-frames-are-in-ascending-order-sanity-check) |
| gap-fills correctly when frames are in descending order (e.g. MaskFactory#toDicom's frame write order) | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-getFramesGeometry#gap-fills-correctly-when-frames-are-in-descending-order-eg-maskfactorytodicoms-frame-write-order) |
| handles more than two out-of-order frames with multiple gaps | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-getFramesGeometry#handles-more-than-two-out-of-order-frames-with-multiple-gaps) |
| geometric spacing computed on sorted frame origins | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-getFramesGeometry#geometric-spacing-computed-on-sorted-frame-origins) |

### getSortedFramesGeometry

| Test | Result | Requirement | Code |
| --- | :---: | --- | --- |
| undefined without per-frame functional groups | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-getSortedFramesGeometry#undefined-without-per-frame-functional-groups) |
| undefined with duplicate origins without volume ids | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-getSortedFramesGeometry#undefined-with-duplicate-origins-without-volume-ids) |
| undefined with duplicate origins and inconsistent volume ids | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-getSortedFramesGeometry#undefined-with-duplicate-origins-and-inconsistent-volume-ids) |
| multi-volume frame geometries | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-getSortedFramesGeometry#multi-volume-frame-geometries) |
| frame geometries | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-getSortedFramesGeometry#frame-geometries) |

### gui

| Test | Result | Requirement | Code |
| --- | :---: | --- | --- |
| DrawLayer highlightAnnotation unknown id | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui#drawlayer-highlightannotation-unknown-id) |
| DrawLayer highlightAnnotation dim and reset | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui#drawlayer-highlightannotation-dim-and-reset) |
| DrawLayer highlightAnnotation one at a time | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui#drawlayer-highlightannotation-one-at-a-time) |
| DrawLayer highlightAnnotation custom | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui#drawlayer-highlightannotation-custom) |
| canCreateCanvas | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui#cancreatecanvas) |
| CanvasSizeChecker | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui#canvassizechecker) |
| InfoLayer creates and updates items without ids | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui#infolayer-creates-and-updates-items-without-ids) |
| InfoLayer only updates from its own layer group | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui#infolayer-only-updates-from-its-own-layer-group) |
| LayerGroup string id | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui#layergroup-string-id) |
| LayerGroup creation | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui#layergroup-creation) |
| LayerGroup add remove view layer | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui#layergroup-add-remove-view-layer) |
| LayerGroup add remove draw layer | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui#layergroup-add-remove-draw-layer) |
| getLayerDetailsFromEvent returns null when no .layer ancestor | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui#getlayerdetailsfromevent-returns-null-when-no-layer-ancestor) |
| getLayerDetailsFromEvent extracts details from .layer | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui#getlayerdetailsfromevent-extracts-details-from-layer) |
| getScaledOffset keeps the center fixed under a new scale | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui#getscaledoffset-keeps-the-center-fixed-under-a-new-scale) |
| LayerGroup constructor with info layer creates info layer div | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui#layergroup-constructor-with-info-layer-creates-info-layer-div) |
| LayerGroup getDivId returns the container div id | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui#layergroup-getdivid-returns-the-container-div-id) |
| LayerGroup initial scale is {x:1,y:1,z:1} | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui#layergroup-initial-scale-is-x1y1z1) |
| LayerGroup initial offset is {x:0,y:0,z:0} | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui#layergroup-initial-offset-is-x0y0z0) |
| setScale updates the scale and fires zoomchange | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui#setscale-updates-the-scale-and-fires-zoomchange) |
| setOffset updates the offset and fires offsetchange | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui#setoffset-updates-the-offset-and-fires-offsetchange) |
| addTranslation shifts the offset in the opposite direction | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui#addtranslation-shifts-the-offset-in-the-opposite-direction) |
| flipScaleZ negates the base scale z and updates scale | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui#flipscalez-negates-the-base-scale-z-and-updates-scale) |
| addScale multiplies scale by (1 + step) | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui#addscale-multiplies-scale-by-1-step) |
| resetZoomPan restores base scale and zero offset | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui#resetzoompan-restores-base-scale-and-zero-offset) |
| getAddedScale reflects scale relative to baseScale | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui#getaddedscale-reflects-scale-relative-to-basescale) |
| shouldBind returns false with no view layers | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui#shouldbind-returns-false-with-no-view-layers) |
| getMaxWorldSize returns undefined with no layers | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui#getmaxworldsize-returns-undefined-with-no-layers) |
| includes returns false for undefined id | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui#includes-returns-false-for-undefined-id) |
| includes returns true after addViewLayer | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui#includes-returns-true-after-addviewlayer) |
| getNumberOfViewLayers counts only view layers | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui#getnumberofviewlayers-counts-only-view-layers) |
| getViewLayers returns only view layers | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui#getviewlayers-returns-only-view-layers) |
| getViewLayers filters with callback | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui#getviewlayers-filters-with-callback) |
| getDrawLayers returns only draw layers | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui#getdrawlayers-returns-only-draw-layers) |
| getDrawLayers filters with callback | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui#getdrawlayers-filters-with-callback) |
| getActiveViewLayer returns view layer after addViewLayer | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui#getactiveviewlayer-returns-view-layer-after-addviewlayer) |
| getActiveViewLayer returns undefined for active draw layer | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui#getactiveviewlayer-returns-undefined-for-active-draw-layer) |
| getActiveDrawLayer returns draw layer after addDrawLayer | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui#getactivedrawlayer-returns-draw-layer-after-adddrawlayer) |
| getBaseViewLayer returns the first view layer | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui#getbaseviewlayer-returns-the-first-view-layer) |
| getBaseViewLayer returns undefined with no view layers | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui#getbaseviewlayer-returns-undefined-with-no-view-layers) |
| setActiveLayer fires activelayerchange event | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui#setactivelayer-fires-activelayerchange-event) |
| setActiveLayerById sets the active layer by id | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui#setactivelayerbyid-sets-the-active-layer-by-id) |
| setActiveLayerByDataId sets the active layer by data id | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui#setactivelayerbydataid-sets-the-active-layer-by-data-id) |
| getViewLayersByDataId returns matching view layers | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui#getviewlayersbydataid-returns-matching-view-layers) |
| getDrawLayersByDataId returns matching draw layers | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui#getdrawlayersbydataid-returns-matching-draw-layers) |
| getViewDataIndices returns data ids of all view layers | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui#getviewdataindices-returns-data-ids-of-all-view-layers) |
| setImageSmoothing propagates to view layers only | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui#setimagesmoothing-propagates-to-view-layers-only) |
| draw delegates to all layers | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui#draw-delegates-to-all-layers) |
| display delegates flag to all layers | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui#display-delegates-flag-to-all-layers) |
| removeLayer fires layerremove event | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui#removelayer-fires-layerremove-event) |
| removeLayer throws when the layer is not in the group | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui#removelayer-throws-when-the-layer-is-not-in-the-group) |
| empty clears all layers and fires layerremove for each | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui#empty-clears-all-layers-and-fires-layerremove-for-each) |
| removeLayersByDataId removes layers matching the data id | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui#removelayersbydataid-removes-layers-matching-the-data-id) |
| setShowCrosshair get/set round-trips correctly | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui#setshowcrosshair-getset-round-trips-correctly) |
| PositionBinder binds the full position of the same data | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui#positionbinder-binds-the-full-position-of-the-same-data) |
| PositionBinder follows the volume id of the same origin | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui#positionbinder-follows-the-volume-id-of-the-same-origin) |
| PositionBinder keeps the volume without a matching id | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui#positionbinder-keeps-the-volume-without-a-matching-id) |
| PositionBinder keeps the target slice on a volume only move | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui#positionbinder-keeps-the-target-slice-on-a-volume-only-move) |
| PositionBinder follows the in-plane position of a single slice target | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui#positionbinder-follows-the-in-plane-position-of-a-single-slice-target) |
| PositionBinder keeps the in-plane position of a single slice target on a volume only move | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui#positionbinder-keeps-the-in-plane-position-of-a-single-slice-target-on-a-volume-only-move) |
| PositionBinder ignores an unchanged position | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui#positionbinder-ignores-an-unchanged-position) |
| PositionBinder follows an unchanged index of other data | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui#positionbinder-follows-an-unchanged-index-of-other-data) |
| PositionBinder ignores a target still loading | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui#positionbinder-ignores-a-target-still-loading) |
| PositionBinder does not modify the event value | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui#positionbinder-does-not-modify-the-event-value) |
| ViewController canSyncVolume | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui#viewcontroller-cansyncvolume) |
| PositionBinder syncs the volume id of stage layer groups | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui#positionbinder-syncs-the-volume-id-of-stage-layer-groups) |
| WindowLevelBinder ignores an event from different data | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui#windowlevelbinder-ignores-an-event-from-different-data) |
| WindowLevelBinder sets the window level values when no preset name is given | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui#windowlevelbinder-sets-the-window-level-values-when-no-preset-name-is-given) |
| WindowLevelBinder sets the window level values for a 'manual' preset name | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui#windowlevelbinder-sets-the-window-level-values-for-a-manual-preset-name) |
| WindowLevelBinder sets the preset when the name is known | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui#windowlevelbinder-sets-the-preset-when-the-name-is-known) |
| WindowLevelBinder sets the window level values for an unknown preset name | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui#windowlevelbinder-sets-the-window-level-values-for-an-unknown-preset-name) |
| ViewLayer highlightSegment not a mask | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui#viewlayer-highlightsegment-not-a-mask) |
| ViewLayer highlightSegment dim and reset | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui#viewlayer-highlightsegment-dim-and-reset) |
| ViewLayer highlightSegment one at a time | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui#viewlayer-highlightsegment-one-at-a-time) |
| ViewLayer highlightSegment custom | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui#viewlayer-highlightsegment-custom) |
| ViewLayer shares canvas size checks | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui#viewlayer-shares-canvas-size-checks) |
| ViewLayer onimagegeometrychange fires basesizechange | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui#viewlayer-onimagegeometrychange-fires-basesizechange) |

### gui DrawLayer getAnnotationAt

| Test | Result | Requirement | Code |
| --- | :---: | --- | --- |
| returns the top most annotation containing the point | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui DrawLayer getAnnotationAt#returns-the-top-most-annotation-containing-the-point) |
| skips hidden annotations | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui DrawLayer getAnnotationAt#skips-hidden-annotations) |
| undefined without current position | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui DrawLayer getAnnotationAt#undefined-without-current-position) |

### gui DrawLayer setCurrentPosition

| Test | Result | Requirement | Code |
| --- | :---: | --- | --- |
| keeps the time index of a position without one | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui DrawLayer setCurrentPosition#keeps-the-time-index-of-a-position-without-one) |

### gui/Stage

| Test | Result | Requirement | Code |
| --- | :---: | --- | --- |
| initial state: no layer groups, undefined active | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui/Stage#initial-state-no-layer-groups-undefined-active) |
| addLayerGroup creates a layer group and marks it active | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui/Stage#addlayergroup-creates-a-layer-group-and-marks-it-active) |
| addLayerGroup: each new group becomes the active one | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui/Stage#addlayergroup-each-new-group-becomes-the-active-one) |
| setActiveLayerGroup changes the active layer group | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui/Stage#setactivelayergroup-changes-the-active-layer-group) |
| setActiveLayerGroup ignores an invalid index | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui/Stage#setactivelayergroup-ignores-an-invalid-index) |
| getLayerGroupByDivId returns the correct group or undefined | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui/Stage#getlayergroupbydivid-returns-the-correct-group-or-undefined) |
| getViewLayersByDataId aggregates results from all layer groups | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui/Stage#getviewlayersbydataid-aggregates-results-from-all-layer-groups) |
| getViewLayers aggregates results from all layer groups | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui/Stage#getviewlayers-aggregates-results-from-all-layer-groups) |
| getViewLayers forwards the callback to each layer group | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui/Stage#getviewlayers-forwards-the-callback-to-each-layer-group) |
| getDrawLayersByDataId aggregates results from all layer groups | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui/Stage#getdrawlayersbydataid-aggregates-results-from-all-layer-groups) |
| getDrawLayers aggregates results from all layer groups | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui/Stage#getdrawlayers-aggregates-results-from-all-layer-groups) |
| getDrawLayers forwards the callback to each layer group | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui/Stage#getdrawlayers-forwards-the-callback-to-each-layer-group) |
| setBinders throws on null input | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui/Stage#setbinders-throws-on-null-input) |
| setBinders throws on undefined input | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui/Stage#setbinders-throws-on-undefined-input) |
| setBinders accepts an empty list without throwing | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui/Stage#setbinders-accepts-an-empty-list-without-throwing) |
| empty clears all layer groups and resets the active index | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui/Stage#empty-clears-all-layer-groups-and-resets-the-active-index) |
| removeLayersByDataId delegates to every layer group | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui/Stage#removelayersbydataid-delegates-to-every-layer-group) |
| removeLayerGroup removes the group and updates the count | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui/Stage#removelayergroup-removes-the-group-and-updates-the-count) |
| removeLayerGroup clears active index when active group removed | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui/Stage#removelayergroup-clears-active-index-when-active-group-removed) |
| removeLayerGroup throws when the group is not found | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui/Stage#removelayergroup-throws-when-the-group-is-not-found) |
| resetZoomPan delegates to every layer group | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui/Stage#resetzoompan-delegates-to-every-layer-group) |
| resetViews delegates to every layer group | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui/Stage#resetviews-delegates-to-every-layer-group) |
| draw delegates to every layer group | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui/Stage#draw-delegates-to-every-layer-group) |
| setImageSmoothing propagates to existing layer groups | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui/Stage#setimagesmoothing-propagates-to-existing-layer-groups) |
| fitToContainer calls fitToContainer on each layer group | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui/Stage#fittocontainer-calls-fittocontainer-on-each-layer-group) |
| fitToContainer uses minimum ratio across bound groups | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-gui/Stage#fittocontainer-uses-minimum-ratio-across-bound-groups) |

### image

| Test | Result | Requirement | Code |
| --- | :---: | --- | --- |
| Annotation constructor sets unique non-empty ids and default values | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#annotation-constructor-sets-unique-non-empty-ids-and-default-values) |
| Annotation instances have unique tracking ids | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#annotation-instances-have-unique-tracking-ids) |
| Annotation addMetaItem / getMetaItem / getMetaConceptIds | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#annotation-addmetaitem-getmetaitem-getmetaconceptids) |
| Annotation addMetaItem warns on duplicate concept id | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#annotation-addmetaitem-warns-on-duplicate-concept-id) |
| Annotation removeMetaItem deletes an existing entry silently | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#annotation-removemetaitem-deletes-an-existing-entry-silently) |
| Annotation canView returns false before init | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#annotation-canview-returns-false-before-init) |
| Annotation getText returns plain textExpr when no quantification | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#annotation-gettext-returns-plain-textexpr-when-no-quantification) |
| Annotation getText replaces {flags} from quantification | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#annotation-gettext-replaces-flags-from-quantification) |
| Annotation getText returns empty string for default textExpr | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#annotation-gettext-returns-empty-string-for-default-textexpr) |
| Annotation isCompatibleView delegates to planeHelper when no planePoints | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#annotation-iscompatibleview-delegates-to-planehelper-when-no-planepoints) |
| Annotation isCompatibleView compares cosines when planePoints set | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#annotation-iscompatibleview-compares-cosines-when-planepoints-set) |
| Annotation getOrientationName returns undefined without planePoints | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#annotation-getorientationname-returns-undefined-without-planepoints) |
| Annotation getOrientationName returns a string when planePoints set | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#annotation-getorientationname-returns-a-string-when-planepoints-set) |
| Annotation init sets referencedSopInstanceUID and enables canView | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#annotation-init-sets-referencedsopinstanceuid-and-enables-canview) |
| Annotation init sets a 1-based referencedFrameNumber | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#annotation-init-sets-a-1-based-referencedframenumber) |
| Annotation getCentroid with volume ids | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#annotation-getcentroid-with-volume-ids) |
| Annotation init is a no-op when called a second time | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#annotation-init-is-a-no-op-when-called-a-second-time) |
| Annotation init stores planePoints for oblique orientation | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#annotation-init-stores-planepoints-for-oblique-orientation) |
| Annotation setViewController warns when UID does not match | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#annotation-setviewcontroller-warns-when-uid-does-not-match) |
| Annotation setViewController is ignored for incompatible view | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#annotation-setviewcontroller-is-ignored-for-incompatible-view) |
| Annotation setViewController enables canView for compatible view | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#annotation-setviewcontroller-enables-canview-for-compatible-view) |
| Annotation setViewController replaces legacy plane cosines | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#annotation-setviewcontroller-replaces-legacy-plane-cosines) |
| Annotation setTextExpr warns when no view controller is set | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#annotation-settextexpr-warns-when-no-view-controller-is-set) |
| Annotation setTextExpr uses modality-specific text when available | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#annotation-settextexpr-uses-modality-specific-text-when-available) |
| Annotation setTextExpr falls back to "*" key for unknown modality | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#annotation-settextexpr-falls-back-to-key-for-unknown-modality) |
| Annotation getFactory returns undefined when mathShape is not set | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#annotation-getfactory-returns-undefined-when-mathshape-is-not-set) |
| Annotation getFactory warns and returns undefined for unsupported shape | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#annotation-getfactory-warns-and-returns-undefined-for-unsupported-shape) |
| annotationGroupEventNames contains expected event strings | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#annotationgroupeventnames-contains-expected-event-strings) |
| AnnotationGroup constructor creates an empty editable group | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#annotationgroup-constructor-creates-an-empty-editable-group) |
| AnnotationGroup constructor accepts a pre-built list | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#annotationgroup-constructor-accepts-a-pre-built-list) |
| AnnotationGroup setEditable updates flag and fires event | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#annotationgroup-seteditable-updates-flag-and-fires-event) |
| AnnotationGroup setColour / getColour round-trip | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#annotationgroup-setcolour-getcolour-round-trip) |
| AnnotationGroup add appends annotation and fires annotationadd | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#annotationgroup-add-appends-annotation-and-fires-annotationadd) |
| AnnotationGroup add forwards propagate flag in event | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#annotationgroup-add-forwards-propagate-flag-in-event) |
| AnnotationGroup find returns annotation by UID or undefined | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#annotationgroup-find-returns-annotation-by-uid-or-undefined) |
| AnnotationGroup update replaces annotation and fires event | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#annotationgroup-update-replaces-annotation-and-fires-event) |
| AnnotationGroup update triggers quantification for mathShape key | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#annotationgroup-update-triggers-quantification-for-mathshape-key) |
| AnnotationGroup update triggers quantification for textExpr key | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#annotationgroup-update-triggers-quantification-for-textexpr-key) |
| AnnotationGroup update skips quantification for unrelated keys | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#annotationgroup-update-skips-quantification-for-unrelated-keys) |
| AnnotationGroup update warns when annotation UID is not found | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#annotationgroup-update-warns-when-annotation-uid-is-not-found) |
| AnnotationGroup remove deletes annotation and fires event | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#annotationgroup-remove-deletes-annotation-and-fires-event) |
| AnnotationGroup remove warns when annotation UID is not found | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#annotationgroup-remove-warns-when-annotation-uid-is-not-found) |
| AnnotationGroup remove only removes the targeted annotation | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#annotationgroup-remove-only-removes-the-targeted-annotation) |
| AnnotationGroup setViewController delegates to all annotations | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#annotationgroup-setviewcontroller-delegates-to-all-annotations) |
| AnnotationGroup meta data set / get / has round-trip | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#annotationgroup-meta-data-set-get-has-round-trip) |
| AnnotationGroup removeEventListener stops callback from firing | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#annotationgroup-removeeventlistener-stops-callback-from-firing) |
| PixelBufferDecoder constructor creates a ThreadPool with the default size | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#pixelbufferdecoder-constructor-creates-a-threadpool-with-the-default-size) |
| PixelBufferDecoder default event handlers exist and do not throw | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#pixelbufferdecoder-default-event-handlers-exist-and-do-not-throw) |
| PixelBufferDecoder decode wires event handlers to pool on first call | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#pixelbufferdecoder-decode-wires-event-handlers-to-pool-on-first-call) |
| PixelBufferDecoder decode wires callbacks only on the first call | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#pixelbufferdecoder-decode-wires-callbacks-only-on-the-first-call) |
| PixelBufferDecoder decode routes jpeg-baseline to correct task | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#pixelbufferdecoder-decode-routes-jpeg-baseline-to-correct-task) |
| PixelBufferDecoder decode routes jpeg-lossless to correct task | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#pixelbufferdecoder-decode-routes-jpeg-lossless-to-correct-task) |
| PixelBufferDecoder decode routes jpeg2000 to correct task | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#pixelbufferdecoder-decode-routes-jpeg2000-to-correct-task) |
| PixelBufferDecoder decode routes rle to correct task | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#pixelbufferdecoder-decode-routes-rle-to-correct-task) |
| PixelBufferDecoder decode passes buffer, meta and info to task | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#pixelbufferdecoder-decode-passes-buffer-meta-and-info-to-task) |
| PixelBufferDecoder task posts a compact transferred copy | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#pixelbufferdecoder-task-posts-a-compact-transferred-copy) |
| PixelBufferDecoder decode ignores unknown algorithm names | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#pixelbufferdecoder-decode-ignores-unknown-algorithm-names) |
| PixelBufferDecoder abort delegates to pool.abort | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#pixelbufferdecoder-abort-delegates-to-poolabort) |
| DicomBufferToData uncompressed event sequence | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#dicombuffertodata-uncompressed-event-sequence) |
| DicomBufferToData uncompressed data meta and buffer | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#dicombuffertodata-uncompressed-data-meta-and-buffer) |
| DicomBufferToData non image data: no buffer | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#dicombuffertodata-non-image-data-no-buffer) |
| DicomBufferToData parse error | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#dicombuffertodata-parse-error) |
| DicomBufferToData abort without decoder | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#dicombuffertodata-abort-without-decoder) |
| DicomBufferToData multi frame: abort at first loaded item, uncompressed no more item nor load | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#dicombuffertodata-multi-frame-abort-at-first-loaded-item-uncompressed-no-more-item-nor-load) |
| DicomBufferToData multi frame: abort at first loaded item, RLE no more item nor load | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#dicombuffertodata-multi-frame-abort-at-first-loaded-item-rle-no-more-item-nor-load) |
| DicomBufferToData RLE test-img-00 single frame: decoded buffer | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#dicombuffertodata-rle-test-img-00-single-frame-decoded-buffer) |
| DicomBufferToData RLE test-img-00 multi frame: one data per frame | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#dicombuffertodata-rle-test-img-00-multi-frame-one-data-per-frame) |
| DicomBufferToData RLE test-img-02 single frame: decoded buffer | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#dicombuffertodata-rle-test-img-02-single-frame-decoded-buffer) |
| DicomBufferToData RLE test-img-02 multi frame: one data per frame | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#dicombuffertodata-rle-test-img-02-multi-frame-one-data-per-frame) |
| DicomBufferToData uncompressed structure: multiframe one load per file, one data per frame, no error | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#dicombuffertodata-uncompressed-structure-multiframe-one-load-per-file-one-data-per-frame-no-error) |
| DicomBufferToData uncompressed structure: multiframe each data has its file meta and frame buffer | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#dicombuffertodata-uncompressed-structure-multiframe-each-data-has-its-file-meta-and-frame-buffer) |
| DicomBufferToData uncompressed structure: multiframe multi-slice one load per file, one data per frame, no error | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#dicombuffertodata-uncompressed-structure-multiframe-multi-slice-one-load-per-file-one-data-per-frame-no-error) |
| DicomBufferToData uncompressed structure: multiframe multi-slice each data has its file meta and frame buffer | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#dicombuffertodata-uncompressed-structure-multiframe-multi-slice-each-data-has-its-file-meta-and-frame-buffer) |
| DicomBufferToData uncompressed structure: multiframe multi-volume one load per file, one data per frame, no error | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#dicombuffertodata-uncompressed-structure-multiframe-multi-volume-one-load-per-file-one-data-per-frame-no-error) |
| DicomBufferToData uncompressed structure: multiframe multi-volume each data has its file meta and frame buffer | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#dicombuffertodata-uncompressed-structure-multiframe-multi-volume-each-data-has-its-file-meta-and-frame-buffer) |
| DicomBufferToData uncompressed structure: multiple single-slice one load per file, one data per frame, no error | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#dicombuffertodata-uncompressed-structure-multiple-single-slice-one-load-per-file-one-data-per-frame-no-error) |
| DicomBufferToData uncompressed structure: multiple single-slice each data has its file meta and frame buffer | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#dicombuffertodata-uncompressed-structure-multiple-single-slice-each-data-has-its-file-meta-and-frame-buffer) |
| DicomBufferToData uncompressed structure: multiple single-frame one load per file, one data per frame, no error | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#dicombuffertodata-uncompressed-structure-multiple-single-frame-one-load-per-file-one-data-per-frame-no-error) |
| DicomBufferToData uncompressed structure: multiple single-frame each data has its file meta and frame buffer | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#dicombuffertodata-uncompressed-structure-multiple-single-frame-each-data-has-its-file-meta-and-frame-buffer) |
| DicomBufferToData uncompressed structure: multiple multiframe multi-slice one load per file, one data per frame, no error | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#dicombuffertodata-uncompressed-structure-multiple-multiframe-multi-slice-one-load-per-file-one-data-per-frame-no-error) |
| DicomBufferToData uncompressed structure: multiple multiframe multi-slice each data has its file meta and frame buffer | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#dicombuffertodata-uncompressed-structure-multiple-multiframe-multi-slice-each-data-has-its-file-meta-and-frame-buffer) |
| DicomBufferToData uncompressed assembled structure: multiframe no error | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#dicombuffertodata-uncompressed-assembled-structure-multiframe-no-error) |
| DicomBufferToData uncompressed assembled structure: multiframe same size and origins | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#dicombuffertodata-uncompressed-assembled-structure-multiframe-same-size-and-origins) |
| DicomBufferToData uncompressed assembled structure: multiframe same buffer | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#dicombuffertodata-uncompressed-assembled-structure-multiframe-same-buffer) |
| DicomBufferToData uncompressed assembled structure: multiframe multi-slice no error | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#dicombuffertodata-uncompressed-assembled-structure-multiframe-multi-slice-no-error) |
| DicomBufferToData uncompressed assembled structure: multiframe multi-slice same size and origins | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#dicombuffertodata-uncompressed-assembled-structure-multiframe-multi-slice-same-size-and-origins) |
| DicomBufferToData uncompressed assembled structure: multiframe multi-slice same buffer | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#dicombuffertodata-uncompressed-assembled-structure-multiframe-multi-slice-same-buffer) |
| DicomBufferToData uncompressed assembled structure: multiframe multi-volume no error | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#dicombuffertodata-uncompressed-assembled-structure-multiframe-multi-volume-no-error) |
| DicomBufferToData uncompressed assembled structure: multiframe multi-volume same size and origins | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#dicombuffertodata-uncompressed-assembled-structure-multiframe-multi-volume-same-size-and-origins) |
| DicomBufferToData uncompressed assembled structure: multiframe multi-volume same buffer | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#dicombuffertodata-uncompressed-assembled-structure-multiframe-multi-volume-same-buffer) |
| DicomBufferToData uncompressed assembled structure: multiple single-slice no error | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#dicombuffertodata-uncompressed-assembled-structure-multiple-single-slice-no-error) |
| DicomBufferToData uncompressed assembled structure: multiple single-slice same size and origins | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#dicombuffertodata-uncompressed-assembled-structure-multiple-single-slice-same-size-and-origins) |
| DicomBufferToData uncompressed assembled structure: multiple single-slice same buffer | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#dicombuffertodata-uncompressed-assembled-structure-multiple-single-slice-same-buffer) |
| DicomBufferToData uncompressed assembled structure: multiple single-frame no error | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#dicombuffertodata-uncompressed-assembled-structure-multiple-single-frame-no-error) |
| DicomBufferToData uncompressed assembled structure: multiple single-frame same size and origins | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#dicombuffertodata-uncompressed-assembled-structure-multiple-single-frame-same-size-and-origins) |
| DicomBufferToData uncompressed assembled structure: multiple single-frame same buffer | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#dicombuffertodata-uncompressed-assembled-structure-multiple-single-frame-same-buffer) |
| DicomBufferToData uncompressed assembled structure: multiple multiframe multi-slice no error | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#dicombuffertodata-uncompressed-assembled-structure-multiple-multiframe-multi-slice-no-error) |
| DicomBufferToData uncompressed assembled structure: multiple multiframe multi-slice same size and origins | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#dicombuffertodata-uncompressed-assembled-structure-multiple-multiframe-multi-slice-same-size-and-origins) |
| DicomBufferToData uncompressed assembled structure: multiple multiframe multi-slice same buffer | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#dicombuffertodata-uncompressed-assembled-structure-multiple-multiframe-multi-slice-same-buffer) |
| DicomBufferToData uncompressed assembled structure: unsorted multiframe multi-slice no error | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#dicombuffertodata-uncompressed-assembled-structure-unsorted-multiframe-multi-slice-no-error) |
| DicomBufferToData uncompressed assembled structure: unsorted multiframe multi-slice same size and origins | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#dicombuffertodata-uncompressed-assembled-structure-unsorted-multiframe-multi-slice-same-size-and-origins) |
| DicomBufferToData uncompressed assembled structure: unsorted multiframe multi-slice same buffer | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#dicombuffertodata-uncompressed-assembled-structure-unsorted-multiframe-multi-slice-same-buffer) |
| DicomBufferToData RLE structure: multiframe one load per file, one data per frame, no error | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#dicombuffertodata-rle-structure-multiframe-one-load-per-file-one-data-per-frame-no-error) |
| DicomBufferToData RLE structure: multiframe each data has its file meta and frame buffer | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#dicombuffertodata-rle-structure-multiframe-each-data-has-its-file-meta-and-frame-buffer) |
| DicomBufferToData RLE structure: multiframe multi-slice one load per file, one data per frame, no error | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#dicombuffertodata-rle-structure-multiframe-multi-slice-one-load-per-file-one-data-per-frame-no-error) |
| DicomBufferToData RLE structure: multiframe multi-slice each data has its file meta and frame buffer | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#dicombuffertodata-rle-structure-multiframe-multi-slice-each-data-has-its-file-meta-and-frame-buffer) |
| DicomBufferToData RLE structure: multiframe multi-volume one load per file, one data per frame, no error | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#dicombuffertodata-rle-structure-multiframe-multi-volume-one-load-per-file-one-data-per-frame-no-error) |
| DicomBufferToData RLE structure: multiframe multi-volume each data has its file meta and frame buffer | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#dicombuffertodata-rle-structure-multiframe-multi-volume-each-data-has-its-file-meta-and-frame-buffer) |
| DicomBufferToData RLE structure: multiple single-slice one load per file, one data per frame, no error | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#dicombuffertodata-rle-structure-multiple-single-slice-one-load-per-file-one-data-per-frame-no-error) |
| DicomBufferToData RLE structure: multiple single-slice each data has its file meta and frame buffer | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#dicombuffertodata-rle-structure-multiple-single-slice-each-data-has-its-file-meta-and-frame-buffer) |
| DicomBufferToData RLE structure: multiple single-frame one load per file, one data per frame, no error | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#dicombuffertodata-rle-structure-multiple-single-frame-one-load-per-file-one-data-per-frame-no-error) |
| DicomBufferToData RLE structure: multiple single-frame each data has its file meta and frame buffer | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#dicombuffertodata-rle-structure-multiple-single-frame-each-data-has-its-file-meta-and-frame-buffer) |
| DicomBufferToData RLE structure: multiple multiframe multi-slice one load per file, one data per frame, no error | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#dicombuffertodata-rle-structure-multiple-multiframe-multi-slice-one-load-per-file-one-data-per-frame-no-error) |
| DicomBufferToData RLE structure: multiple multiframe multi-slice each data has its file meta and frame buffer | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#dicombuffertodata-rle-structure-multiple-multiframe-multi-slice-each-data-has-its-file-meta-and-frame-buffer) |
| DicomBufferToData RLE assembled structure: multiframe no error | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#dicombuffertodata-rle-assembled-structure-multiframe-no-error) |
| DicomBufferToData RLE assembled structure: multiframe same size and origins | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#dicombuffertodata-rle-assembled-structure-multiframe-same-size-and-origins) |
| DicomBufferToData RLE assembled structure: multiframe same buffer | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#dicombuffertodata-rle-assembled-structure-multiframe-same-buffer) |
| DicomBufferToData RLE assembled structure: multiframe multi-slice no error | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#dicombuffertodata-rle-assembled-structure-multiframe-multi-slice-no-error) |
| DicomBufferToData RLE assembled structure: multiframe multi-slice same size and origins | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#dicombuffertodata-rle-assembled-structure-multiframe-multi-slice-same-size-and-origins) |
| DicomBufferToData RLE assembled structure: multiframe multi-slice same buffer | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#dicombuffertodata-rle-assembled-structure-multiframe-multi-slice-same-buffer) |
| DicomBufferToData RLE assembled structure: multiframe multi-volume no error | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#dicombuffertodata-rle-assembled-structure-multiframe-multi-volume-no-error) |
| DicomBufferToData RLE assembled structure: multiframe multi-volume same size and origins | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#dicombuffertodata-rle-assembled-structure-multiframe-multi-volume-same-size-and-origins) |
| DicomBufferToData RLE assembled structure: multiframe multi-volume same buffer | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#dicombuffertodata-rle-assembled-structure-multiframe-multi-volume-same-buffer) |
| DicomBufferToData RLE assembled structure: multiple single-slice no error | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#dicombuffertodata-rle-assembled-structure-multiple-single-slice-no-error) |
| DicomBufferToData RLE assembled structure: multiple single-slice same size and origins | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#dicombuffertodata-rle-assembled-structure-multiple-single-slice-same-size-and-origins) |
| DicomBufferToData RLE assembled structure: multiple single-slice same buffer | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#dicombuffertodata-rle-assembled-structure-multiple-single-slice-same-buffer) |
| DicomBufferToData RLE assembled structure: multiple single-frame no error | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#dicombuffertodata-rle-assembled-structure-multiple-single-frame-no-error) |
| DicomBufferToData RLE assembled structure: multiple single-frame same size and origins | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#dicombuffertodata-rle-assembled-structure-multiple-single-frame-same-size-and-origins) |
| DicomBufferToData RLE assembled structure: multiple single-frame same buffer | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#dicombuffertodata-rle-assembled-structure-multiple-single-frame-same-buffer) |
| DicomBufferToData RLE assembled structure: multiple multiframe multi-slice no error | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#dicombuffertodata-rle-assembled-structure-multiple-multiframe-multi-slice-no-error) |
| DicomBufferToData RLE assembled structure: multiple multiframe multi-slice same size and origins | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#dicombuffertodata-rle-assembled-structure-multiple-multiframe-multi-slice-same-size-and-origins) |
| DicomBufferToData RLE assembled structure: multiple multiframe multi-slice same buffer | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#dicombuffertodata-rle-assembled-structure-multiple-multiframe-multi-slice-same-buffer) |
| DicomBufferToData RLE assembled structure: unsorted multiframe multi-slice no error | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#dicombuffertodata-rle-assembled-structure-unsorted-multiframe-multi-slice-no-error) |
| DicomBufferToData RLE assembled structure: unsorted multiframe multi-slice same size and origins | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#dicombuffertodata-rle-assembled-structure-unsorted-multiframe-multi-slice-same-size-and-origins) |
| DicomBufferToData RLE assembled structure: unsorted multiframe multi-slice same buffer | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#dicombuffertodata-rle-assembled-structure-unsorted-multiframe-multi-slice-same-buffer) |
| DicomBufferToData RLE: several data indices on one converter | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#dicombuffertodata-rle-several-data-indices-on-one-converter) |
| DicomBufferToData RLE: items decoded in any order reverse order: data per frame, load after the last item | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#dicombuffertodata-rle-items-decoded-in-any-order-reverse-order-data-per-frame-load-after-the-last-item) |
| DicomBufferToData RLE: items decoded in any order interleaved data indices | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#dicombuffertodata-rle-items-decoded-in-any-order-interleaved-data-indices) |
| DicomBufferToData RLE: missing BitsAllocated for decompression error event naming the missing tags | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#dicombuffertodata-rle-missing-bitsallocated-for-decompression-error-event-naming-the-missing-tags) |
| DicomBufferToData RLE: missing Rows for decompression error event naming the missing tags | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#dicombuffertodata-rle-missing-rows-for-decompression-error-event-naming-the-missing-tags) |
| DicomBufferToData RLE: missing Columns for decompression error event naming the missing tags | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#dicombuffertodata-rle-missing-columns-for-decompression-error-event-naming-the-missing-tags) |
| DicomBufferToData RLE: missing Rows and Columns for decompression error event naming the missing tags | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#dicombuffertodata-rle-missing-rows-and-columns-for-decompression-error-event-naming-the-missing-tags) |
| getViewFromDOMImage returns data and source | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#getviewfromdomimage-returns-data-and-source) |
| getViewFromDOMImage with URL origin sets info fields | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#getviewfromdomimage-with-url-origin-sets-info-fields) |
| getViewFromDOMImage with File origin sets info fields | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#getviewfromdomimage-with-file-origin-sets-info-fields) |
| getViewFromDOMImage defaults imageUid to 0 when index is falsy | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#getviewfromdomimage-defaults-imageuid-to-0-when-index-is-falsy) |
| getViewFromDOMImage creates RGB image | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#getviewfromdomimage-creates-rgb-image) |
| getViewFromDOMImage strips alpha channel from pixel data | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#getviewfromdomimage-strips-alpha-channel-from-pixel-data) |
| getViewFromDOMImage sets SeriesInstanceUID in image meta | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#getviewfromdomimage-sets-seriesinstanceuid-in-image-meta) |
| getViewFromDOMVideo calls onloaditem on first seek (URL origin) | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#getviewfromdomvideo-calls-onloaditem-on-first-seek-url-origin) |
| getViewFromDOMVideo calls onloaditem on first seek (File origin) | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#getviewfromdomvideo-calls-onloaditem-on-first-seek-file-origin) |
| getViewFromDOMVideo calls onprogress for each frame | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#getviewfromdomvideo-calls-onprogress-for-each-frame) |
| getViewFromDOMVideo fires onload and onloadend after last frame | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#getviewfromdomvideo-fires-onload-and-onloadend-after-last-frame) |
| getViewFromDOMVideo appends frames and removes listener when done | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#getviewfromdomvideo-appends-frames-and-removes-listener-when-done) |
| ThresholdFilter getName returns Threshold | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#thresholdfilter-getname-returns-threshold) |
| ThresholdFilter min/max accessors round-trip | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#thresholdfilter-minmax-accessors-round-trip) |
| ThresholdFilter setOriginalImage/getOriginalImage round-trip | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#thresholdfilter-setoriginalimagegetoriginalimage-round-trip) |
| ThresholdFilter update returns a new image | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#thresholdfilter-update-returns-a-new-image) |
| ThresholdFilter keeps values inside [min, max] | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#thresholdfilter-keeps-values-inside-min-max) |
| ThresholdFilter replaces out-of-range values with imageMin | ✅ | URS [#DWV-REQ-UI-06-001 (Image thresholding)](/tutorials/user-stories#dwv-req-ui-06-001-image-thresholding) | [jsdoc](/module/tests-image#thresholdfilter-replaces-out-of-range-values-with-imagemin) |
| SharpenFilter getName returns Sharpen | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#sharpenfilter-getname-returns-sharpen) |
| SharpenFilter setOriginalImage/getOriginalImage round-trip | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#sharpenfilter-setoriginalimagegetoriginalimage-round-trip) |
| SharpenFilter update returns a new image | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#sharpenfilter-update-returns-a-new-image) |
| SharpenFilter preserves a uniform image | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#sharpenfilter-preserves-a-uniform-image) |
| SharpenFilter amplifies isolated centre pixel by factor 5 | ✅ | URS [#DWV-REQ-UI-06-002 (Image contrast enhancement)](/tutorials/user-stories#dwv-req-ui-06-002-image-contrast-enhancement) | [jsdoc](/module/tests-image#sharpenfilter-amplifies-isolated-centre-pixel-by-factor-5) |
| SobelFilter getName returns Sobel | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#sobelfilter-getname-returns-sobel) |
| SobelFilter setOriginalImage/getOriginalImage round-trip | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#sobelfilter-setoriginalimagegetoriginalimage-round-trip) |
| SobelFilter update returns a new image | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#sobelfilter-update-returns-a-new-image) |
| SobelFilter produces zero gradient for a uniform image | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#sobelfilter-produces-zero-gradient-for-a-uniform-image) |
| SobelFilter detects a vertical step edge | ✅ | URS [#DWV-REQ-UI-06-003 (Image contour extraction)](/tutorials/user-stories#dwv-req-ui-06-003-image-contour-extraction) | [jsdoc](/module/tests-image#sobelfilter-detects-a-vertical-step-edge) |
| Geometry class | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#geometry-class) |
| Geometry isSimilar | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#geometry-issimilar) |
| Geometry worldToIndex resolves the correct slice for irregular spacing | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#geometry-worldtoindex-resolves-the-correct-slice-for-irregular-spacing) |
| Geometry worldToIndex falls back to arithmetic for out-of-range positions | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#geometry-worldtoindex-falls-back-to-arithmetic-for-out-of-range-positions) |
| Geometry worldToIndex and getSliceIndex resolve the correct slice for a real gantry-tilted geometry | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#geometry-worldtoindex-and-getsliceindex-resolve-the-correct-slice-for-a-real-gantry-tilted-geometry) |
| Geometry worldToIndex does not duplicate the mask's last slice at the reference slice just past it | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#geometry-worldtoindex-does-not-duplicate-the-masks-last-slice-at-the-reference-slice-just-past-it) |
| Geometry getSliceIndex | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#geometry-getsliceindex) |
| Geometry getSliceIndex with time | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#geometry-getsliceindex-with-time) |
| Geometry checkTimeOrigins | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#geometry-checktimeorigins) |
| Geometry non integer times | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#geometry-non-integer-times) |
| Geometry volume id position | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#geometry-volume-id-position) |
| Geometry large volume ids | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#geometry-large-volume-ids) |
| Geometry canSyncVolume | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#geometry-cansyncvolume) |
| Geometry time checks and updates | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#geometry-time-checks-and-updates) |
| Geometry setVolumeValues | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#geometry-setvolumevalues) |
| Geometry sortOrigins | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#geometry-sortorigins) |
| Geometry sortOrigins orders origins along a tilted normal | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#geometry-sortorigins-orders-origins-along-a-tilted-normal) |
| Geometry canAppendSlice orientation tolerance | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#geometry-canappendslice-orientation-tolerance) |
| Image getValue | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#image-getvalue) |
| Image histogram | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#image-histogram) |
| Image append slice | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#image-append-slice) |
| Image append slice window presets | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#image-append-slice-window-presets) |
| Image convolute2D | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#image-convolute2d) |
| Image transform | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#image-transform) |
| Image compose | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#image-compose) |
| ImageFactory | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#imagefactory) |
| hasValues | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#hasvalues) |
| clone | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#clone) |
| Image resample keeps volume ids | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#image-resample-keeps-volume-ids) |
| Image getRescaledValuesAtPosition | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#image-getrescaledvaluesatposition) |
| ImageHistogram identity RSI | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#imagehistogram-identity-rsi) |
| ImageHistogram rescales non integer values | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#imagehistogram-rescales-non-integer-values) |
| ImageHistogram merges equal values from different RSI | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#imagehistogram-merges-equal-values-from-different-rsi) |
| ImageHistogram sorts entries with negative slope | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#imagehistogram-sorts-entries-with-negative-slope) |
| ImageHistogram unit | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#imagehistogram-unit) |
| ImageHistogram empty | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#imagehistogram-empty) |
| ImageHistogram getIntervalPercentages uses rescaled values | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#imagehistogram-getintervalpercentages-uses-rescaled-values) |
| ImageHistogram getStats matches getStats on values | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#imagehistogram-getstats-matches-getstats-on-values) |
| simpleRange iterator | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#simplerange-iterator) |
| Range iterator axial | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#range-iterator-axial) |
| Range iterator coronal | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#range-iterator-coronal) |
| Range iterator sagittal | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#range-iterator-sagittal) |
| RGB iterator | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#rgb-iterator) |
| getSliceIterator | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#getsliceiterator) |
| Region iterator | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#region-iterator) |
| LabelingFilter class | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#labelingfilter-class) |
| MaskSegmentHelper constructor reads pre-existing segments | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#masksegmenthelper-constructor-reads-pre-existing-segments) |
| MaskSegmentHelper constructor initialises meta.custom when absent | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#masksegmenthelper-constructor-initialises-metacustom-when-absent) |
| MaskSegmentHelper constructor adds segments array when missing | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#masksegmenthelper-constructor-adds-segments-array-when-missing) |
| MaskSegmentHelper getMask returns the mask image | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#masksegmenthelper-getmask-returns-the-mask-image) |
| MaskSegmentHelper hasSegment and getSegment | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#masksegmenthelper-hassegment-and-getsegment) |
| MaskSegmentHelper getNumberOfSegments tracks add/remove | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#masksegmenthelper-getnumberofsegments-tracks-addremove) |
| MaskSegmentHelper addSegment calls updatePaletteColourMap | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#masksegmenthelper-addsegment-calls-updatepalettecolourmap) |
| MaskSegmentHelper addSegment ignores duplicate segment number | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#masksegmenthelper-addsegment-ignores-duplicate-segment-number) |
| MaskSegmentHelper removeSegment removes the correct segment | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#masksegmenthelper-removesegment-removes-the-correct-segment) |
| MaskSegmentHelper removeSegment is a no-op for unknown number | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#masksegmenthelper-removesegment-is-a-no-op-for-unknown-number) |
| MaskSegmentHelper updateSegment replaces an existing segment | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#masksegmenthelper-updatesegment-replaces-an-existing-segment) |
| MaskSegmentHelper updateSegment is a no-op for unknown number | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#masksegmenthelper-updatesegment-is-a-no-op-for-unknown-number) |
| MaskSegmentHelper maskHasSegments uses displayValue when available | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#masksegmenthelper-maskhassegments-uses-displayvalue-when-available) |
| MaskSegmentHelper maskHasSegments falls back to segment.number | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#masksegmenthelper-maskhassegments-falls-back-to-segmentnumber) |
| MaskSegmentHelper maskHasSegments returns false for unknown segments | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#masksegmenthelper-maskhassegments-returns-false-for-unknown-segments) |
| MaskSegmentHelper findOverlap returns empty for blank masks | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#masksegmenthelper-findoverlap-returns-empty-for-blank-masks) |
| MaskSegmentHelper findOverlap: identical masks give 100% overlap | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#masksegmenthelper-findoverlap-identical-masks-give-100-overlap) |
| MaskSegmentHelper findOverlap: non-overlapping masks | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#masksegmenthelper-findoverlap-non-overlapping-masks) |
| MaskSegmentHelper findOverlap: partial overlap gives correct % | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#masksegmenthelper-findoverlap-partial-overlap-gives-correct) |
| MaskSegmentHelper findOverlap | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#masksegmenthelper-findoverlap) |
| MaskSegmentViewHelper isHidden returns false initially | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#masksegmentviewhelper-ishidden-returns-false-initially) |
| MaskSegmentViewHelper addToHidden makes segment hidden | ✅ | URS [#DWV-REQ-UI-02-004 (Display segmentation)](/tutorials/user-stories#dwv-req-ui-02-004-display-segmentation) | [jsdoc](/module/tests-image#masksegmentviewhelper-addtohidden-makes-segment-hidden) |
| MaskSegmentViewHelper addToHidden ignores duplicate | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#masksegmentviewhelper-addtohidden-ignores-duplicate) |
| MaskSegmentViewHelper removeFromHidden unhides a segment | ✅ | URS [#DWV-REQ-UI-02-004 (Display segmentation)](/tutorials/user-stories#dwv-req-ui-02-004-display-segmentation) | [jsdoc](/module/tests-image#masksegmentviewhelper-removefromhidden-unhides-a-segment) |
| MaskSegmentViewHelper removeFromHidden is a no-op for unknown | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#masksegmentviewhelper-removefromhidden-is-a-no-op-for-unknown) |
| MaskSegmentViewHelper manages multiple segments independently | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#masksegmentviewhelper-manages-multiple-segments-independently) |
| isLutBitsStored | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#islutbitsstored) |
| ModalityLut class | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#modalitylut-class) |
| PositionHelper getGeometry returns the image geometry | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#positionhelper-getgeometry-returns-the-image-geometry) |
| PositionHelper getScrollDimIndex returns scroll dim from view | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#positionhelper-getscrolldimindex-returns-scroll-dim-from-view) |
| PositionHelper getMaximumDimValue returns size - 1 | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#positionhelper-getmaximumdimvalue-returns-size-1) |
| PositionHelper getMaximumScrollValue returns max scroll index | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#positionhelper-getmaximumscrollvalue-returns-max-scroll-index) |
| PositionHelper getCurrentPosition reflects initial index | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#positionhelper-getcurrentposition-reflects-initial-index) |
| PositionHelper getCurrentIndex matches initial index | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#positionhelper-getcurrentindex-matches-initial-index) |
| PositionHelper getCurrentPositionDimValue returns index per axis | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#positionhelper-getcurrentpositiondimvalue-returns-index-per-axis) |
| PositionHelper getCurrentPositionScrollValue returns z index | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#positionhelper-getcurrentpositionscrollvalue-returns-z-index) |
| PositionHelper getCurrentPositionAtDimValue replaces one axis | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#positionhelper-getcurrentpositionatdimvalue-replaces-one-axis) |
| PositionHelper getCurrentPositionAtScrollValue replaces scroll axis | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#positionhelper-getcurrentpositionatscrollvalue-replaces-scroll-axis) |
| PositionHelper setCurrentPosition updates position | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#positionhelper-setcurrentposition-updates-position) |
| PositionHelper setCurrentPosition with undefined returns false | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#positionhelper-setcurrentposition-with-undefined-returns-false) |
| PositionHelper isPositionInBounds returns true/false correctly | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#positionhelper-ispositioninbounds-returns-truefalse-correctly) |
| PositionHelper setCurrentPositionSafe rejects out-of-bounds | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#positionhelper-setcurrentpositionsafe-rejects-out-of-bounds) |
| PositionHelper getIncrementPosition and getDecrementPosition | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#positionhelper-getincrementposition-and-getdecrementposition) |
| PositionHelper incrementPosition: moves in bounds, fails at max | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#positionhelper-incrementposition-moves-in-bounds-fails-at-max) |
| PositionHelper decrementPosition: moves in bounds, fails at 0 | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#positionhelper-decrementposition-moves-in-bounds-fails-at-0) |
| PositionHelper increment/decrementPositionAlongScroll | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#positionhelper-incrementdecrementpositionalongscroll) |
| PositionHelper merge throws on incompatible scroll dims | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#positionhelper-merge-throws-on-incompatible-scroll-dims) |
| PositionHelper merge extends the scroll size | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#positionhelper-merge-extends-the-scroll-size) |
| PositionHelper merge scrolls a 4D underlay with a 3D overlay at volume > 0 | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#positionhelper-merge-scrolls-a-4d-underlay-with-a-3d-overlay-at-volume-0) |
| ResamplingFilter class | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#resamplingfilter-class) |
| generateWorkerMessages passes frame views for 4D data | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#generateworkermessages-passes-frame-views-for-4d-data) |
| ResamplingThread task posts a compact transferred copy | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#resamplingthread-task-posts-a-compact-transferred-copy) |
| Size class | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#size-class) |
| Index to and from offset | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#index-to-and-from-offset) |
| Index normalise Point | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#index-normalise-point) |
| Size normalise Index | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#size-normalise-index) |
| Spacing class | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#spacing-class) |
| View wlchange event | ✅ | URS [#DWV-REQ-UI-03-001 (Change image window/level)](/tutorials/user-stories#dwv-req-ui-03-001-change-image-windowlevel) | [jsdoc](/module/tests-image#view-wlchange-event) |
| Playback milliseconds | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#playback-milliseconds) |
| Generate data MONO | ✅ | URS [#DWV-REQ-UI-02-001 (Display image)](/tutorials/user-stories#dwv-req-ui-02-001-display-image) | [jsdoc](/module/tests-image#generate-data-mono) |
| Generate data MONO with RSI | ✅ | URS [#DWV-REQ-UI-02-001 (Display image)](/tutorials/user-stories#dwv-req-ui-02-001-display-image) | [jsdoc](/module/tests-image#generate-data-mono-with-rsi) |
| Generate data MONO float | ✅ | URS [#DWV-REQ-UI-02-001 (Display image)](/tutorials/user-stories#dwv-req-ui-02-001-display-image) | [jsdoc](/module/tests-image#generate-data-mono-float) |
| Generate data MONO int32 | ✅ | URS [#DWV-REQ-UI-02-001 (Display image)](/tutorials/user-stories#dwv-req-ui-02-001-display-image) | [jsdoc](/module/tests-image#generate-data-mono-int32) |
| Generate data MONO no bits stored | ✅ | URS [#DWV-REQ-UI-02-001 (Display image)](/tutorials/user-stories#dwv-req-ui-02-001-display-image) | [jsdoc](/module/tests-image#generate-data-mono-no-bits-stored) |
| Generate data RGB | ✅ | URS [#DWV-REQ-UI-02-001 (Display image)](/tutorials/user-stories#dwv-req-ui-02-001-display-image) | [jsdoc](/module/tests-image#generate-data-rgb) |
| Generate data timing | ✅ | URS [#DWV-REQ-UI-02-001 (Display image)](/tutorials/user-stories#dwv-req-ui-02-001-display-image) | [jsdoc](/module/tests-image#generate-data-timing) |
| View initial index | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#view-initial-index) |
| View segment highlight | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#view-segment-highlight) |
| generateImageDataMonochrome writes correct RGBA values | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#generateimagedatamonochrome-writes-correct-rgba-values) |
| generateImageDataMonochrome applies windowLut before colour-map lookup | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#generateimagedatamonochrome-applies-windowlut-before-colour-map-lookup) |
| generateImageDataMonochrome alpha check | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#generateimagedatamonochrome-alpha-check) |
| generateImageDataMonochrome does nothing for an empty iterator | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#generateimagedatamonochrome-does-nothing-for-an-empty-iterator) |
| generateImageDataPaletteColor writes correct RGBA for 8-bit data | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#generateimagedatapalettecolor-writes-correct-rgba-for-8-bit-data) |
| generateImageDataPaletteColor right-shifts lut values for 16-bit data | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#generateimagedatapalettecolor-right-shifts-lut-values-for-16-bit-data) |
| generateImageDataPaletteColor passes pixel value and index to alpha | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#generateimagedatapalettecolor-passes-pixel-value-and-index-to-alpha) |
| generateImageDataPaletteColor does nothing for empty iterator | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#generateimagedatapalettecolor-does-nothing-for-empty-iterator) |
| generateImageDataPaletteColor logs info for 16-bit data | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#generateimagedatapalettecolor-logs-info-for-16-bit-data) |
| generateImageDataRgb writes RGB triplets verbatim into the buffer | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#generateimagedatargb-writes-rgb-triplets-verbatim-into-the-buffer) |
| generateImageDataRgb passes RGB triplet and index to alpha | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#generateimagedatargb-passes-rgb-triplet-and-index-to-alpha) |
| generateImageDataRgb does nothing for an empty iterator | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#generateimagedatargb-does-nothing-for-an-empty-iterator) |
| generateImageDataRgb does not alter channel values | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#generateimagedatargb-does-not-alter-channel-values) |
| generateImageDataYbrFull converts YBR to RGB correctly | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#generateimagedataybrfull-converts-ybr-to-rgb-correctly) |
| generateImageDataYbrFull with neutral chroma yields R=G=B=Y | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#generateimagedataybrfull-with-neutral-chroma-yields-rgby) |
| generateImageDataYbrFull passes YBR triplet and index to alpha | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#generateimagedataybrfull-passes-ybr-triplet-and-index-to-alpha) |
| generateImageDataYbrFull does nothing for an empty iterator | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#generateimagedataybrfull-does-nothing-for-an-empty-iterator) |
| generateImageDataYbrFull clamps out-of-range RGB values | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#generateimagedataybrfull-clamps-out-of-range-rgb-values) |
| VoiLutLinearFunction class | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#voilutlinearfunction-class) |
| VoiLutSigmoidFunction class | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#voilutsigmoidfunction-class) |
| WindowLevel class | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#windowlevel-class) |
| validateWindowLevel | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#validatewindowlevel) |
| getMinWindowWidth | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#getminwindowwidth) |
| WindowLut class | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-image#windowlut-class) |

### Annotation contains

| Test | Result | Requirement | Code |
| --- | :---: | --- | --- |
| delegates to the math shape | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-Annotation contains#delegates-to-the-math-shape) |
| arrow uses the tip to tail segment | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-Annotation contains#arrow-uses-the-tip-to-tail-segment) |
| false without a math shape contains | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-Annotation contains#false-without-a-math-shape-contains) |

### getSliceGeometrySpacing

| Test | Result | Requirement | Code |
| --- | :---: | --- | --- |
| undefined for less than two origins | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-getSliceGeometrySpacing#undefined-for-less-than-two-origins) |
| throws for zero slice spacing | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-getSliceGeometrySpacing#throws-for-zero-slice-spacing) |
| constant spacing, no warning | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-getSliceGeometrySpacing#constant-spacing-no-warning) |
| varying spacing: rounded mean and warning | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-getSliceGeometrySpacing#varying-spacing-rounded-mean-and-warning) |

### mergeGeometries

| Test | Result | Requirement | Code |
| --- | :---: | --- | --- |
| rounded orientation | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-mergeGeometries#rounded-orientation) |
| different orientation | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-mergeGeometries#different-orientation) |
| 4D volume ids survive a merge with a 3D geometry | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-mergeGeometries#4d-volume-ids-survive-a-merge-with-a-3d-geometry) |

### ImageContour

| Test | Result | Requirement | Code |
| --- | :---: | --- | --- |
| ImageContour getDistance | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageContour#imagecontour-getdistance) |

### ImageFactory

| Test | Result | Requirement | Code |
| --- | :---: | --- | --- |
| test-img-00 checkElements: returns no warning | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-00-checkelements-returns-no-warning) |
| test-img-00 create: geometry matches tags | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-00-create-geometry-matches-tags) |
| test-img-00 create: meta tags match tags | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-00-create-meta-tags-match-tags) |
| test-img-00 create: length unit is mm when PixelSpacing is present | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-00-create-length-unit-is-mm-when-pixelspacing-is-present) |
| test-img-00 create: default RSI (slope=1, intercept=0) when no rescale tags | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-00-create-default-rsi-slope1-intercept0-when-no-rescale-tags) |
| test-img-00 create: no window presets when no window tags | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-00-create-no-window-presets-when-no-window-tags) |
| test-img-00 create: pixel buffer values are preserved | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-00-create-pixel-buffer-values-are-preserved) |
| test-img-00 create: SOPInstanceUID used as frame UID | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-00-create-sopinstanceuid-used-as-frame-uid) |
| test-img-01 checkElements: returns no warning | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-01-checkelements-returns-no-warning) |
| test-img-01 create: geometry matches tags | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-01-create-geometry-matches-tags) |
| test-img-01 create: meta tags match tags | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-01-create-meta-tags-match-tags) |
| test-img-01 create: length unit is mm when PixelSpacing is present | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-01-create-length-unit-is-mm-when-pixelspacing-is-present) |
| test-img-01 create: default RSI (slope=1, intercept=0) when no rescale tags | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-01-create-default-rsi-slope1-intercept0-when-no-rescale-tags) |
| test-img-01 create: no window presets when no window tags | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-01-create-no-window-presets-when-no-window-tags) |
| test-img-01 create: pixel buffer values are preserved | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-01-create-pixel-buffer-values-are-preserved) |
| test-img-01 create: SOPInstanceUID used as frame UID | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-01-create-sopinstanceuid-used-as-frame-uid) |
| test-img-02 checkElements: returns no warning | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-02-checkelements-returns-no-warning) |
| test-img-02 create: geometry matches tags | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-02-create-geometry-matches-tags) |
| test-img-02 create: meta tags match tags | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-02-create-meta-tags-match-tags) |
| test-img-02 create: length unit is mm when PixelSpacing is present | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-02-create-length-unit-is-mm-when-pixelspacing-is-present) |
| test-img-02 create: default RSI (slope=1, intercept=0) when no rescale tags | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-02-create-default-rsi-slope1-intercept0-when-no-rescale-tags) |
| test-img-02 create: no window presets when no window tags | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-02-create-no-window-presets-when-no-window-tags) |
| test-img-02 create: pixel buffer values are preserved | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-02-create-pixel-buffer-values-are-preserved) |
| test-img-02 create: SOPInstanceUID used as frame UID | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-02-create-sopinstanceuid-used-as-frame-uid) |
| test-img-03 checkElements: returns no warning | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-03-checkelements-returns-no-warning) |
| test-img-03 create: geometry matches tags | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-03-create-geometry-matches-tags) |
| test-img-03 create: meta tags match tags | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-03-create-meta-tags-match-tags) |
| test-img-03 create: length unit is mm when PixelSpacing is present | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-03-create-length-unit-is-mm-when-pixelspacing-is-present) |
| test-img-03 create: default RSI (slope=1, intercept=0) when no rescale tags | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-03-create-default-rsi-slope1-intercept0-when-no-rescale-tags) |
| test-img-03 create: no window presets when no window tags | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-03-create-no-window-presets-when-no-window-tags) |
| test-img-03 create: pixel buffer values are preserved | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-03-create-pixel-buffer-values-are-preserved) |
| test-img-03 create: SOPInstanceUID used as frame UID | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-03-create-sopinstanceuid-used-as-frame-uid) |
| test-img-04 checkElements: returns no warning | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-04-checkelements-returns-no-warning) |
| test-img-04 create: geometry matches tags | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-04-create-geometry-matches-tags) |
| test-img-04 create: meta tags match tags | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-04-create-meta-tags-match-tags) |
| test-img-04 create: length unit is mm when PixelSpacing is present | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-04-create-length-unit-is-mm-when-pixelspacing-is-present) |
| test-img-04 create: default RSI (slope=1, intercept=0) when no rescale tags | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-04-create-default-rsi-slope1-intercept0-when-no-rescale-tags) |
| test-img-04 create: no window presets when no window tags | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-04-create-no-window-presets-when-no-window-tags) |
| test-img-04 create: pixel buffer values are preserved | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-04-create-pixel-buffer-values-are-preserved) |
| test-img-04 create: SOPInstanceUID used as frame UID | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-04-create-sopinstanceuid-used-as-frame-uid) |
| test-img-05 checkElements: returns no warning | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-05-checkelements-returns-no-warning) |
| test-img-05 create: geometry matches tags | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-05-create-geometry-matches-tags) |
| test-img-05 create: meta tags match tags | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-05-create-meta-tags-match-tags) |
| test-img-05 create: length unit is mm when PixelSpacing is present | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-05-create-length-unit-is-mm-when-pixelspacing-is-present) |
| test-img-05 create: default RSI (slope=1, intercept=0) when no rescale tags | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-05-create-default-rsi-slope1-intercept0-when-no-rescale-tags) |
| test-img-05 create: no window presets when no window tags | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-05-create-no-window-presets-when-no-window-tags) |
| test-img-05 create: pixel buffer values are preserved | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-05-create-pixel-buffer-values-are-preserved) |
| test-img-05 create: SOPInstanceUID used as frame UID | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-05-create-sopinstanceuid-used-as-frame-uid) |
| test-img-06 checkElements: returns no warning | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-06-checkelements-returns-no-warning) |
| test-img-06 create: geometry matches tags | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-06-create-geometry-matches-tags) |
| test-img-06 create: meta tags match tags | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-06-create-meta-tags-match-tags) |
| test-img-06 create: length unit is mm when PixelSpacing is present | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-06-create-length-unit-is-mm-when-pixelspacing-is-present) |
| test-img-06 create: default RSI (slope=1, intercept=0) when no rescale tags | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-06-create-default-rsi-slope1-intercept0-when-no-rescale-tags) |
| test-img-06 create: no window presets when no window tags | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-06-create-no-window-presets-when-no-window-tags) |
| test-img-06 create: pixel buffer values are preserved | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-06-create-pixel-buffer-values-are-preserved) |
| test-img-06 create: SOPInstanceUID used as frame UID | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-06-create-sopinstanceuid-used-as-frame-uid) |
| test-img-07 checkElements: returns no warning | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-07-checkelements-returns-no-warning) |
| test-img-07 create: geometry matches tags | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-07-create-geometry-matches-tags) |
| test-img-07 create: meta tags match tags | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-07-create-meta-tags-match-tags) |
| test-img-07 create: length unit is mm when PixelSpacing is present | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-07-create-length-unit-is-mm-when-pixelspacing-is-present) |
| test-img-07 create: default RSI (slope=1, intercept=0) when no rescale tags | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-07-create-default-rsi-slope1-intercept0-when-no-rescale-tags) |
| test-img-07 create: no window presets when no window tags | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-07-create-no-window-presets-when-no-window-tags) |
| test-img-07 create: pixel buffer values are preserved | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-07-create-pixel-buffer-values-are-preserved) |
| test-img-07 create: SOPInstanceUID used as frame UID | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-07-create-sopinstanceuid-used-as-frame-uid) |
| test-img-08 checkElements: returns no warning | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-08-checkelements-returns-no-warning) |
| test-img-08 create: geometry matches tags | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-08-create-geometry-matches-tags) |
| test-img-08 create: meta tags match tags | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-08-create-meta-tags-match-tags) |
| test-img-08 create: length unit is mm when PixelSpacing is present | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-08-create-length-unit-is-mm-when-pixelspacing-is-present) |
| test-img-08 create: default RSI (slope=1, intercept=0) when no rescale tags | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-08-create-default-rsi-slope1-intercept0-when-no-rescale-tags) |
| test-img-08 create: no window presets when no window tags | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-08-create-no-window-presets-when-no-window-tags) |
| test-img-08 create: pixel buffer values are preserved | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-08-create-pixel-buffer-values-are-preserved) |
| test-img-08 create: SOPInstanceUID used as frame UID | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-08-create-sopinstanceuid-used-as-frame-uid) |
| test-img-09 checkElements: returns no warning | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-09-checkelements-returns-no-warning) |
| test-img-09 create: geometry matches tags | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-09-create-geometry-matches-tags) |
| test-img-09 create: meta tags match tags | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-09-create-meta-tags-match-tags) |
| test-img-09 create: length unit is mm when PixelSpacing is present | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-09-create-length-unit-is-mm-when-pixelspacing-is-present) |
| test-img-09 create: default RSI (slope=1, intercept=0) when no rescale tags | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-09-create-default-rsi-slope1-intercept0-when-no-rescale-tags) |
| test-img-09 create: no window presets when no window tags | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-09-create-no-window-presets-when-no-window-tags) |
| test-img-09 create: pixel buffer values are preserved | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-09-create-pixel-buffer-values-are-preserved) |
| test-img-09 create: SOPInstanceUID used as frame UID | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-09-create-sopinstanceuid-used-as-frame-uid) |
| test-img-10 checkElements: returns no warning | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-10-checkelements-returns-no-warning) |
| test-img-10 create: geometry matches tags | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-10-create-geometry-matches-tags) |
| test-img-10 create: meta tags match tags | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-10-create-meta-tags-match-tags) |
| test-img-10 create: length unit is mm when PixelSpacing is present | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-10-create-length-unit-is-mm-when-pixelspacing-is-present) |
| test-img-10 create: default RSI (slope=1, intercept=0) when no rescale tags | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-10-create-default-rsi-slope1-intercept0-when-no-rescale-tags) |
| test-img-10 create: no window presets when no window tags | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-10-create-no-window-presets-when-no-window-tags) |
| test-img-10 create: pixel buffer values are preserved | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-10-create-pixel-buffer-values-are-preserved) |
| test-img-10 create: SOPInstanceUID used as frame UID | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-10-create-sopinstanceuid-used-as-frame-uid) |
| test-img-11 checkElements: returns no warning | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-11-checkelements-returns-no-warning) |
| test-img-11 create: geometry matches tags | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-11-create-geometry-matches-tags) |
| test-img-11 create: meta tags match tags | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-11-create-meta-tags-match-tags) |
| test-img-11 create: length unit is mm when PixelSpacing is present | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-11-create-length-unit-is-mm-when-pixelspacing-is-present) |
| test-img-11 create: default RSI (slope=1, intercept=0) when no rescale tags | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-11-create-default-rsi-slope1-intercept0-when-no-rescale-tags) |
| test-img-11 create: no window presets when no window tags | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-11-create-no-window-presets-when-no-window-tags) |
| test-img-11 create: pixel buffer values are preserved | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-11-create-pixel-buffer-values-are-preserved) |
| test-img-11 create: SOPInstanceUID used as frame UID | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#test-img-11-create-sopinstanceuid-used-as-frame-uid) |
| multiframe - test-img-00 1.2.840.10008.… generates the structure number of files | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#multiframe-test-img-00-1284010008-generates-the-structure-number-of-files) |
| multiframe - test-img-00 1.2.840.10008.… geometry size | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#multiframe-test-img-00-1284010008-geometry-size) |
| multiframe - test-img-00 1.2.840.10008.… origins are ordered along z with expected spacing | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#multiframe-test-img-00-1284010008-origins-are-ordered-along-z-with-expected-spacing) |
| multiframe - test-img-00 1.2.840.10008.… meta sliceCapacity is the total number of frames | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#multiframe-test-img-00-1284010008-meta-slicecapacity-is-the-total-number-of-frames) |
| multiframe - test-img-00 1.2.840.10008.… pixel buffer holds every file with distinct content | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#multiframe-test-img-00-1284010008-pixel-buffer-holds-every-file-with-distinct-content) |
| multiframe - test-img-00 1.2.840.10008.… each file SOPInstanceUID is included as an image UID | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#multiframe-test-img-00-1284010008-each-file-sopinstanceuid-is-included-as-an-image-uid) |
| multiframe multi-slice - test-img-00 1.… generates the structure number of files | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#multiframe-multi-slice-test-img-00-1-generates-the-structure-number-of-files) |
| multiframe multi-slice - test-img-00 1.… geometry size | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#multiframe-multi-slice-test-img-00-1-geometry-size) |
| multiframe multi-slice - test-img-00 1.… origins are ordered along z with expected spacing | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#multiframe-multi-slice-test-img-00-1-origins-are-ordered-along-z-with-expected-spacing) |
| multiframe multi-slice - test-img-00 1.… meta sliceCapacity is the total number of frames | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#multiframe-multi-slice-test-img-00-1-meta-slicecapacity-is-the-total-number-of-frames) |
| multiframe multi-slice - test-img-00 1.… pixel buffer holds every file with distinct content | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#multiframe-multi-slice-test-img-00-1-pixel-buffer-holds-every-file-with-distinct-content) |
| multiframe multi-slice - test-img-00 1.… each file SOPInstanceUID is included as an image UID | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#multiframe-multi-slice-test-img-00-1-each-file-sopinstanceuid-is-included-as-an-image-uid) |
| multiframe multi-volume - test-img-00 1… generates the structure number of files | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#multiframe-multi-volume-test-img-00-1-generates-the-structure-number-of-files) |
| multiframe multi-volume - test-img-00 1… geometry size | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#multiframe-multi-volume-test-img-00-1-geometry-size) |
| multiframe multi-volume - test-img-00 1… origins are ordered along z with expected spacing | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#multiframe-multi-volume-test-img-00-1-origins-are-ordered-along-z-with-expected-spacing) |
| multiframe multi-volume - test-img-00 1… meta sliceCapacity is the total number of frames | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#multiframe-multi-volume-test-img-00-1-meta-slicecapacity-is-the-total-number-of-frames) |
| multiframe multi-volume - test-img-00 1… pixel buffer holds every file with distinct content | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#multiframe-multi-volume-test-img-00-1-pixel-buffer-holds-every-file-with-distinct-content) |
| multiframe multi-volume - test-img-00 1… each file SOPInstanceUID is included as an image UID | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#multiframe-multi-volume-test-img-00-1-each-file-sopinstanceuid-is-included-as-an-image-uid) |
| multiple single-slice - test-img-00 1.2… generates the structure number of files | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#multiple-single-slice-test-img-00-12-generates-the-structure-number-of-files) |
| multiple single-slice - test-img-00 1.2… geometry size | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#multiple-single-slice-test-img-00-12-geometry-size) |
| multiple single-slice - test-img-00 1.2… origins are ordered along z with expected spacing | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#multiple-single-slice-test-img-00-12-origins-are-ordered-along-z-with-expected-spacing) |
| multiple single-slice - test-img-00 1.2… meta sliceCapacity is the total number of frames | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#multiple-single-slice-test-img-00-12-meta-slicecapacity-is-the-total-number-of-frames) |
| multiple single-slice - test-img-00 1.2… pixel buffer holds every file with distinct content | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#multiple-single-slice-test-img-00-12-pixel-buffer-holds-every-file-with-distinct-content) |
| multiple single-slice - test-img-00 1.2… each file SOPInstanceUID is included as an image UID | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#multiple-single-slice-test-img-00-12-each-file-sopinstanceuid-is-included-as-an-image-uid) |
| multiple single-frame - test-img-00 1.2… generates the structure number of files | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#multiple-single-frame-test-img-00-12-generates-the-structure-number-of-files) |
| multiple single-frame - test-img-00 1.2… geometry size | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#multiple-single-frame-test-img-00-12-geometry-size) |
| multiple single-frame - test-img-00 1.2… origins are ordered along z with expected spacing | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#multiple-single-frame-test-img-00-12-origins-are-ordered-along-z-with-expected-spacing) |
| multiple single-frame - test-img-00 1.2… meta sliceCapacity is the total number of frames | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#multiple-single-frame-test-img-00-12-meta-slicecapacity-is-the-total-number-of-frames) |
| multiple single-frame - test-img-00 1.2… pixel buffer holds every file with distinct content | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#multiple-single-frame-test-img-00-12-pixel-buffer-holds-every-file-with-distinct-content) |
| multiple single-frame - test-img-00 1.2… each file SOPInstanceUID is included as an image UID | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#multiple-single-frame-test-img-00-12-each-file-sopinstanceuid-is-included-as-an-image-uid) |
| multiple multiframe multi-slice - test-… generates the structure number of files | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#multiple-multiframe-multi-slice-test-generates-the-structure-number-of-files) |
| multiple multiframe multi-slice - test-… geometry size | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#multiple-multiframe-multi-slice-test-geometry-size) |
| multiple multiframe multi-slice - test-… origins are ordered along z with expected spacing | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#multiple-multiframe-multi-slice-test-origins-are-ordered-along-z-with-expected-spacing) |
| multiple multiframe multi-slice - test-… meta sliceCapacity is the total number of frames | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#multiple-multiframe-multi-slice-test-meta-slicecapacity-is-the-total-number-of-frames) |
| multiple multiframe multi-slice - test-… pixel buffer holds every file with distinct content | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#multiple-multiframe-multi-slice-test-pixel-buffer-holds-every-file-with-distinct-content) |
| multiple multiframe multi-slice - test-… each file SOPInstanceUID is included as an image UID | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#multiple-multiframe-multi-slice-test-each-file-sopinstanceuid-is-included-as-an-image-uid) |
| time frames frame image: one slice with the frame number as time | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#time-frames-frame-image-one-slice-with-the-frame-number-as-time) |
| unsorted frames frames image: origins are sorted | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#unsorted-frames-frames-image-origins-are-sorted) |
| unsorted frames frames image: buffer in spatial order | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#unsorted-frames-frames-image-buffer-in-spatial-order) |
| unsorted frames frame image: one slice at the frame position | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#unsorted-frames-frame-image-one-slice-at-the-frame-position) |
| multi-volume frames: unsorted multiframe multi-volume frame image: frame position and volume id as time | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#multi-volume-frames-unsorted-multiframe-multi-volume-frame-image-frame-position-and-volume-id-as-time) |
| multi-volume frames: unsorted multiframe multi-volume frames image: slices and volumes | ✅ | URS [#DWV-REQ-IO-07-001 (Load multi-volume data)](/tutorials/user-stories#dwv-req-io-07-001-load-multi-volume-data) | [jsdoc](/module/tests-ImageFactory#multi-volume-frames-unsorted-multiframe-multi-volume-frames-image-slices-and-volumes) |
| multi-volume frames: unsorted multiframe multi-volume frames image: append order does not matter | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#multi-volume-frames-unsorted-multiframe-multi-volume-frames-image-append-order-does-not-matter) |
| multi-volume frames: unsorted multiframe multi-volume b-value frame image: frame position and volume id as time | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#multi-volume-frames-unsorted-multiframe-multi-volume-b-value-frame-image-frame-position-and-volume-id-as-time) |
| multi-volume frames: unsorted multiframe multi-volume b-value frames image: slices and volumes | ✅ | URS [#DWV-REQ-IO-07-001 (Load multi-volume data)](/tutorials/user-stories#dwv-req-io-07-001-load-multi-volume-data) | [jsdoc](/module/tests-ImageFactory#multi-volume-frames-unsorted-multiframe-multi-volume-b-value-frames-image-slices-and-volumes) |
| multi-volume frames: unsorted multiframe multi-volume b-value frames image: append order does not matter | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#multi-volume-frames-unsorted-multiframe-multi-volume-b-value-frames-image-append-order-does-not-matter) |
| duplicate frame positions without volume ids | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ImageFactory#duplicate-frame-positions-without-volume-ids) |

### MaskFactory

| Test | Result | Requirement | Code |
| --- | :---: | --- | --- |
| create: non-overlapping squares, no overlap flag | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-MaskFactory#create-non-overlapping-squares-no-overlap-flag) |
| create: throws for incomplete per-frame functional groups | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-MaskFactory#create-throws-for-incomplete-per-frame-functional-groups) |
| create: non-overlapping squares pixel values in label map | ✅ | URS [#DWV-REQ-IO-06-001 (Load DICOM SEG)](/tutorials/user-stories#dwv-req-io-06-001-load-dicom-seg) | [jsdoc](/module/tests-MaskFactory#create-non-overlapping-squares-pixel-values-in-label-map) |
| create: non-overlapping squares segment collection | ✅ | URS [#DWV-REQ-IO-06-001 (Load DICOM SEG)](/tutorials/user-stories#dwv-req-io-06-001-load-dicom-seg) | [jsdoc](/module/tests-MaskFactory#create-non-overlapping-squares-segment-collection) |
| toDicom: non-overlapping squares round-trip | ✅ | URS [#DWV-REQ-IO-05-003 (Write DICOM SEG)](/tutorials/user-stories#dwv-req-io-05-003-write-dicom-seg) | [jsdoc](/module/tests-MaskFactory#todicom-non-overlapping-squares-round-trip) |
| create: overlapping squares, overlap flag detected | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-MaskFactory#create-overlapping-squares-overlap-flag-detected) |
| create: overlapping squares pixel values in label map | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-MaskFactory#create-overlapping-squares-pixel-values-in-label-map) |
| create: overlapping squares segment collection | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-MaskFactory#create-overlapping-squares-segment-collection) |
| toDicom: overlapping squares round-trip | ✅ | URS [#DWV-REQ-IO-05-003 (Write DICOM SEG)](/tutorials/user-stories#dwv-req-io-05-003-write-dicom-seg) | [jsdoc](/module/tests-MaskFactory#todicom-overlapping-squares-round-trip) |

### mergeMaskImages

| Test | Result | Requirement | Code |
| --- | :---: | --- | --- |
| merge: segments from both masks appear in merged metadata | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-mergeMaskImages#merge-segments-from-both-masks-appear-in-merged-metadata) |
| merge: pixel data from both masks present in label map | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-mergeMaskImages#merge-pixel-data-from-both-masks-present-in-label-map) |
| merge: conflicting segment number in mask2 is remapped | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-mergeMaskImages#merge-conflicting-segment-number-in-mask2-is-remapped) |
| merge: segment collection contains both segments | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-mergeMaskImages#merge-segment-collection-contains-both-segments) |
| merge round-trip via toDicom: NumberOfFrames matches combined input | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-mergeMaskImages#merge-round-trip-via-todicom-numberofframes-matches-combined-input) |
| merge: brush mask (no #segments) as mask2 pixel data is preserved | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-mergeMaskImages#merge-brush-mask-no-segments-as-mask2-pixel-data-is-preserved) |
| merge: brush mask (no #segments) as mask1 pixel data is preserved | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-mergeMaskImages#merge-brush-mask-no-segments-as-mask1-pixel-data-is-preserved) |
| merge: mask2 local slice index is remapped to mask1 slice position | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-mergeMaskImages#merge-mask2-local-slice-index-is-remapped-to-mask1-slice-position) |
| merge: wider mask2 geometry is used as merged geometry, mask1 not clipped | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-mergeMaskImages#merge-wider-mask2-geometry-is-used-as-merged-geometry-mask1-not-clipped) |
| merge: result geometry is the same regardless of input order | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-mergeMaskImages#merge-result-geometry-is-the-same-regardless-of-input-order) |

### MaskImage

| Test | Result | Requirement | Code |
| --- | :---: | --- | --- |
| isMask/getHasOverlap defaults differ from a plain Image | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-MaskImage#ismaskgethasoverlap-defaults-differ-from-a-plain-image) |
| constructing without a SegmentCollection creates one aliased to the buffer (brush path) | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-MaskImage#constructing-without-a-segmentcollection-creates-one-aliased-to-the-buffer-brush-path) |
| constructing with a SegmentCollection uses it as-is (loaded-mask path) | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-MaskImage#constructing-with-a-segmentcollection-uses-it-as-is-loaded-mask-path) |
| segment collection label map follows the buffer after a realloc | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-MaskImage#segment-collection-label-map-follows-the-buffer-after-a-realloc) |
| setAtOffsets keeps the segment collection in sync (e.g. DeleteSegmentCommand / ChangeSegmentColourCommand) | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-MaskImage#setatoffsets-keeps-the-segment-collection-in-sync-eg-deletesegmentcommand-changesegmentcolourcommand) |
| getOffsets returns offsets matching a value | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-MaskImage#getoffsets-returns-offsets-matching-a-value) |
| clone copies the segment collection, not just the buffer | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-MaskImage#clone-copies-the-segment-collection-not-just-the-buffer) |
| initializeContour/getContour | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-MaskImage#initializecontourgetcontour) |
| appendSlice shifts the contour buffer in step with the image buffer | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-MaskImage#appendslice-shifts-the-contour-buffer-in-step-with-the-image-buffer) |
| appendSlice + brush-add on the new slice keeps segments on distinct, correctly-indexed slices (export round-trip) | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-MaskImage#appendslice-brush-add-on-the-new-slice-keeps-segments-on-distinct-correctly-indexed-slices-export-round-trip) |
| getHistogramBySegment returns one volume histogram for 3D data | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-MaskImage#gethistogrambysegment-returns-one-volume-histogram-for-3d-data) |
| getHistogramBySegment resolves segment by trackingUid | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-MaskImage#gethistogrambysegment-resolves-segment-by-trackinguid) |
| getHistogramBySegment returns empty array for unknown segment | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-MaskImage#gethistogrambysegment-returns-empty-array-for-unknown-segment) |
| getHistogramBySegment returns a histogram per 4D volume using a 3D mask | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-MaskImage#gethistogrambysegment-returns-a-histogram-per-4d-volume-using-a-3d-mask) |
| getHistogramBySegment maps mask slices to image slices by origin | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-MaskImage#gethistogrambysegment-maps-mask-slices-to-image-slices-by-origin) |
| getHistogramBySegment rescales with a constant RSI | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-MaskImage#gethistogrambysegment-rescales-with-a-constant-rsi) |
| getHistogramBySegment rescales each slice with its own RSI | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-MaskImage#gethistogrambysegment-rescales-each-slice-with-its-own-rsi) |
| getHistogramBySegment throws when spatial sizes differ | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-MaskImage#gethistogrambysegment-throws-when-spatial-sizes-differ) |
| getHistogramBySegment throws when orientations differ | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-MaskImage#gethistogrambysegment-throws-when-orientations-differ) |
| getHistogramBySegment throws when origins differ | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-MaskImage#gethistogrambysegment-throws-when-origins-differ) |
| getLabels is undefined before labeling | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-MaskImage#getlabels-is-undefined-before-labeling) |
| getHistogramBySegment adds a histogram per label after labeling | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-MaskImage#gethistogrambysegment-adds-a-histogram-per-label-after-labeling) |
| getHistogramBySegment has no label histograms if labels share slices | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-MaskImage#gethistogrambysegment-has-no-label-histograms-if-labels-share-slices) |

### MaskImage getSegmentNumbersAtIndex

| Test | Result | Requirement | Code |
| --- | :---: | --- | --- |
| without overlap | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-MaskImage getSegmentNumbersAtIndex#without-overlap) |
| with overlap | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-MaskImage getSegmentNumbersAtIndex#with-overlap) |

### PlaneHelper identity geo, identity view

| Test | Result | Requirement | Code |
| --- | :---: | --- | --- |
| isAquisitionOrientation | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-PlaneHelper identity geo, identity view#isaquisitionorientation) |
| getScrollDimIndex | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-PlaneHelper identity geo, identity view#getscrolldimindex) |
| getNativeScrollDimIndex | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-PlaneHelper identity geo, identity view#getnativescrolldimindex) |
| getTargetOrientedVector3D applies T⁻¹ | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-PlaneHelper identity geo, identity view#gettargetorientedvector3d-applies-t1) |
| getTargetDeOrientedVector3D applies T | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-PlaneHelper identity geo, identity view#gettargetdeorientedvector3d-applies-t) |
| getTargetDeOrientedPoint3D applies T | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-PlaneHelper identity geo, identity view#gettargetdeorientedpoint3d-applies-t) |
| getImageOrientedVector3D applies V | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-PlaneHelper identity geo, identity view#getimageorientedvector3d-applies-v) |
| getImageDeOrientedVector3D applies V⁻¹ | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-PlaneHelper identity geo, identity view#getimagedeorientedvector3d-applies-v1) |
| getImageOrientedPoint3D applies V | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-PlaneHelper identity geo, identity view#getimageorientedpoint3d-applies-v) |
| getImageDeOrientedPoint3D applies V⁻¹ | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-PlaneHelper identity geo, identity view#getimagedeorientedpoint3d-applies-v1) |
| getOffset3DFromPlaneOffset maps {x:2,y:3} via T | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-PlaneHelper identity geo, identity view#getoffset3dfromplaneoffset-maps-x2y3-via-t) |
| getPlaneOffsetFromOffset3D inverts getOffset3DFromPlaneOffset | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-PlaneHelper identity geo, identity view#getplaneoffsetfromoffset3d-inverts-getoffset3dfromplaneoffset) |
| offset round-trip: 2D → 3D → 2D | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-PlaneHelper identity geo, identity view#offset-round-trip-2d-3d-2d) |
| getPositionFromPlanePoint: plane (0,1) k=0 → world | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-PlaneHelper identity geo, identity view#getpositionfromplanepoint-plane-01-k0-world) |
| getPlanePointFromPosition: world (0,0,1) → plane | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-PlaneHelper identity geo, identity view#getplanepointfromposition-world-001-plane) |
| position round-trip | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-PlaneHelper identity geo, identity view#position-round-trip) |
| getCosines returns first two columns of T | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-PlaneHelper identity geo, identity view#getcosines-returns-first-two-columns-of-t) |
| getLegacyCosines returns first two columns of L | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-PlaneHelper identity geo, identity view#getlegacycosines-returns-first-two-columns-of-l) |
| getTargetOrientedPositiveXYZ applies T⁻¹ | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-PlaneHelper identity geo, identity view#gettargetorientedpositivexyz-applies-t1) |

### PlaneHelper identity geo, coronal view

| Test | Result | Requirement | Code |
| --- | :---: | --- | --- |
| isAquisitionOrientation | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-PlaneHelper identity geo, coronal view#isaquisitionorientation) |
| getScrollDimIndex | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-PlaneHelper identity geo, coronal view#getscrolldimindex) |
| getNativeScrollDimIndex | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-PlaneHelper identity geo, coronal view#getnativescrolldimindex) |
| getTargetOrientedVector3D applies T⁻¹ | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-PlaneHelper identity geo, coronal view#gettargetorientedvector3d-applies-t1) |
| getTargetDeOrientedVector3D applies T | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-PlaneHelper identity geo, coronal view#gettargetdeorientedvector3d-applies-t) |
| getTargetDeOrientedPoint3D applies T | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-PlaneHelper identity geo, coronal view#gettargetdeorientedpoint3d-applies-t) |
| getImageOrientedVector3D applies V | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-PlaneHelper identity geo, coronal view#getimageorientedvector3d-applies-v) |
| getImageDeOrientedVector3D applies V⁻¹ | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-PlaneHelper identity geo, coronal view#getimagedeorientedvector3d-applies-v1) |
| getImageOrientedPoint3D applies V | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-PlaneHelper identity geo, coronal view#getimageorientedpoint3d-applies-v) |
| getImageDeOrientedPoint3D applies V⁻¹ | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-PlaneHelper identity geo, coronal view#getimagedeorientedpoint3d-applies-v1) |
| getOffset3DFromPlaneOffset maps {x:2,y:3} via T | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-PlaneHelper identity geo, coronal view#getoffset3dfromplaneoffset-maps-x2y3-via-t) |
| getPlaneOffsetFromOffset3D inverts getOffset3DFromPlaneOffset | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-PlaneHelper identity geo, coronal view#getplaneoffsetfromoffset3d-inverts-getoffset3dfromplaneoffset) |
| offset round-trip: 2D → 3D → 2D | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-PlaneHelper identity geo, coronal view#offset-round-trip-2d-3d-2d) |
| getPositionFromPlanePoint: plane (0,1) k=0 → world | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-PlaneHelper identity geo, coronal view#getpositionfromplanepoint-plane-01-k0-world) |
| getPlanePointFromPosition: world (0,0,1) → plane | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-PlaneHelper identity geo, coronal view#getplanepointfromposition-world-001-plane) |
| position round-trip | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-PlaneHelper identity geo, coronal view#position-round-trip) |
| getCosines returns first two columns of T | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-PlaneHelper identity geo, coronal view#getcosines-returns-first-two-columns-of-t) |
| getLegacyCosines returns first two columns of L | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-PlaneHelper identity geo, coronal view#getlegacycosines-returns-first-two-columns-of-l) |
| getTargetOrientedPositiveXYZ applies T⁻¹ | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-PlaneHelper identity geo, coronal view#gettargetorientedpositivexyz-applies-t1) |

### PlaneHelper coronal geo, identity view

| Test | Result | Requirement | Code |
| --- | :---: | --- | --- |
| isAquisitionOrientation | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-PlaneHelper coronal geo, identity view#isaquisitionorientation) |
| getScrollDimIndex | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-PlaneHelper coronal geo, identity view#getscrolldimindex) |
| getNativeScrollDimIndex | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-PlaneHelper coronal geo, identity view#getnativescrolldimindex) |
| getTargetOrientedVector3D applies T⁻¹ | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-PlaneHelper coronal geo, identity view#gettargetorientedvector3d-applies-t1) |
| getTargetDeOrientedVector3D applies T | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-PlaneHelper coronal geo, identity view#gettargetdeorientedvector3d-applies-t) |
| getTargetDeOrientedPoint3D applies T | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-PlaneHelper coronal geo, identity view#gettargetdeorientedpoint3d-applies-t) |
| getImageOrientedVector3D applies V | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-PlaneHelper coronal geo, identity view#getimageorientedvector3d-applies-v) |
| getImageDeOrientedVector3D applies V⁻¹ | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-PlaneHelper coronal geo, identity view#getimagedeorientedvector3d-applies-v1) |
| getImageOrientedPoint3D applies V | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-PlaneHelper coronal geo, identity view#getimageorientedpoint3d-applies-v) |
| getImageDeOrientedPoint3D applies V⁻¹ | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-PlaneHelper coronal geo, identity view#getimagedeorientedpoint3d-applies-v1) |
| getOffset3DFromPlaneOffset maps {x:2,y:3} via T | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-PlaneHelper coronal geo, identity view#getoffset3dfromplaneoffset-maps-x2y3-via-t) |
| getPlaneOffsetFromOffset3D inverts getOffset3DFromPlaneOffset | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-PlaneHelper coronal geo, identity view#getplaneoffsetfromoffset3d-inverts-getoffset3dfromplaneoffset) |
| offset round-trip: 2D → 3D → 2D | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-PlaneHelper coronal geo, identity view#offset-round-trip-2d-3d-2d) |
| getPositionFromPlanePoint: plane (0,1) k=0 → world | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-PlaneHelper coronal geo, identity view#getpositionfromplanepoint-plane-01-k0-world) |
| getPlanePointFromPosition: world (0,0,1) → plane | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-PlaneHelper coronal geo, identity view#getplanepointfromposition-world-001-plane) |
| position round-trip | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-PlaneHelper coronal geo, identity view#position-round-trip) |
| getCosines returns first two columns of T | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-PlaneHelper coronal geo, identity view#getcosines-returns-first-two-columns-of-t) |
| getLegacyCosines returns first two columns of L | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-PlaneHelper coronal geo, identity view#getlegacycosines-returns-first-two-columns-of-l) |
| getTargetOrientedPositiveXYZ applies T⁻¹ | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-PlaneHelper coronal geo, identity view#gettargetorientedpositivexyz-applies-t1) |

### PlaneHelper orientation-independent

| Test | Result | Requirement | Code |
| --- | :---: | --- | --- |
| getViewOrientation returns the constructor argument | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-PlaneHelper orientation-independent#getvieworientation-returns-the-constructor-argument) |
| getTargetOrientation returns a Matrix33 | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-PlaneHelper orientation-independent#gettargetorientation-returns-a-matrix33) |
| worldToIndex/indexToWorld round-trip | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-PlaneHelper orientation-independent#worldtoindexindextoworld-round-trip) |
| getOffset3DFromPlaneOffset scales by spacing | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-PlaneHelper orientation-independent#getoffset3dfromplaneoffset-scales-by-spacing) |

### PlaneHelper non-zero origin

| Test | Result | Requirement | Code |
| --- | :---: | --- | --- |
| getPositionFromPlanePoint adds origin | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-PlaneHelper non-zero origin#getpositionfromplanepoint-adds-origin) |
| getPlanePointFromPosition subtracts origin | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-PlaneHelper non-zero origin#getplanepointfromposition-subtracts-origin) |
| position round-trip with non-zero origin | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-PlaneHelper non-zero origin#position-round-trip-with-non-zero-origin) |

### RtStructFactory

| Test | Result | Requirement | Code |
| --- | :---: | --- | --- |
| create: non-overlapping squares, no overlap flag | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-RtStructFactory#create-non-overlapping-squares-no-overlap-flag) |
| create: frame of reference UID | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-RtStructFactory#create-frame-of-reference-uid) |
| create: non-overlapping squares pixel values in label map | ✅ | URS [#DWV-REQ-IO-06-002 (Load DICOM RTSTRUCT)](/tutorials/user-stories#dwv-req-io-06-002-load-dicom-rtstruct) | [jsdoc](/module/tests-RtStructFactory#create-non-overlapping-squares-pixel-values-in-label-map) |
| create: non-overlapping squares segment collection | ✅ | URS [#DWV-REQ-IO-06-002 (Load DICOM RTSTRUCT)](/tutorials/user-stories#dwv-req-io-06-002-load-dicom-rtstruct) | [jsdoc](/module/tests-RtStructFactory#create-non-overlapping-squares-segment-collection) |
| toDicom: non-overlapping squares round-trip | ✅ | URS [#DWV-REQ-IO-05-004 (Write DICOM RTSTRUCT)](/tutorials/user-stories#dwv-req-io-05-004-write-dicom-rtstruct) | [jsdoc](/module/tests-RtStructFactory#todicom-non-overlapping-squares-round-trip) |
| create: overlapping squares, overlap flag detected | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-RtStructFactory#create-overlapping-squares-overlap-flag-detected) |
| create: overlapping squares pixel values in label map | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-RtStructFactory#create-overlapping-squares-pixel-values-in-label-map) |
| create: overlapping squares segment collection | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-RtStructFactory#create-overlapping-squares-segment-collection) |
| toDicom: overlapping squares round-trip | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-RtStructFactory#todicom-overlapping-squares-round-trip) |
| create: square with hole punches out the hole | ✅ | URS [#DWV-REQ-IO-06-002 (Load DICOM RTSTRUCT)](/tutorials/user-stories#dwv-req-io-06-002-load-dicom-rtstruct) | [jsdoc](/module/tests-RtStructFactory#create-square-with-hole-punches-out-the-hole) |
| toDicom: square with hole round-trip preserves the hole | ✅ | URS [#DWV-REQ-IO-05-004 (Write DICOM RTSTRUCT)](/tutorials/user-stories#dwv-req-io-05-004-write-dicom-rtstruct) | [jsdoc](/module/tests-RtStructFactory#todicom-square-with-hole-round-trip-preserves-the-hole) |
| create: accepts CLOSEDPLANAR_XOR contours and punches out the hole | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-RtStructFactory#create-accepts-closedplanarxor-contours-and-punches-out-the-hole) |
| create: keyhole-style single contour with bridge produces correct hole | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-RtStructFactory#create-keyhole-style-single-contour-with-bridge-produces-correct-hole) |

### SegmentCollection

| Test | Result | Requirement | Code |
| --- | :---: | --- | --- |
| getLabelMap returns a zero-filled buffer when no frames are added | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-SegmentCollection#getlabelmap-returns-a-zero-filled-buffer-when-no-frames-are-added) |
| getLabelMap writes correct pixels for a single segment | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-SegmentCollection#getlabelmap-writes-correct-pixels-for-a-single-segment) |
| getLabelMap handles multiple segments on different slices | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-SegmentCollection#getlabelmap-handles-multiple-segments-on-different-slices) |
| getLabelMap is lazily cached: returns the same object on re-call | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-SegmentCollection#getlabelmap-is-lazily-cached-returns-the-same-object-on-re-call) |
| getHasOverlap is false when segments share no voxels | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-SegmentCollection#gethasoverlap-is-false-when-segments-share-no-voxels) |
| getHasOverlap is true when two segments share a voxel | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-SegmentCollection#gethasoverlap-is-true-when-two-segments-share-a-voxel) |
| getLabelMap first-wins: lower segment number keeps overlap voxel | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-SegmentCollection#getlabelmap-first-wins-lower-segment-number-keeps-overlap-voxel) |
| getHasOverlap works correctly before getLabelMap is called explicitly | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-SegmentCollection#gethasoverlap-works-correctly-before-getlabelmap-is-called-explicitly) |
| setLabelMap stores the buffer and getHasOverlap stays false | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-SegmentCollection#setlabelmap-stores-the-buffer-and-gethasoverlap-stays-false) |
| addFrame merges a second frame into the same (segment, slice) | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-SegmentCollection#addframe-merges-a-second-frame-into-the-same-segment-slice) |
| getSegmentBuffers (MaskFactory path) preserves overlap pixels per segment | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-SegmentCollection#getsegmentbuffers-maskfactory-path-preserves-overlap-pixels-per-segment) |
| getSegmentBuffers (brush path) reconstructs from label map | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-SegmentCollection#getsegmentbuffers-brush-path-reconstructs-from-label-map) |
| updateAtOffset is a no-op when there is no per-segment data | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-SegmentCollection#updateatoffset-is-a-no-op-when-there-is-no-per-segment-data) |
| updateAtOffset reflects a brush edit into an existing segment (loaded-mask path) | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-SegmentCollection#updateatoffset-reflects-a-brush-edit-into-an-existing-segment-loaded-mask-path) |
| updateAtOffset removes a pixel from a segment when erased | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-SegmentCollection#updateatoffset-removes-a-pixel-from-a-segment-when-erased) |
| updateAtOffset moves a pixel from one existing segment to another | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-SegmentCollection#updateatoffset-moves-a-pixel-from-one-existing-segment-to-another) |
| getSegmentBuffers (MaskFactory path) skips slices emptied by edits | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-SegmentCollection#getsegmentbuffers-maskfactory-path-skips-slices-emptied-by-edits) |
| getOtherValueAtOffset returns the overlapping segment's value | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-SegmentCollection#getothervalueatoffset-returns-the-overlapping-segments-value) |
| getOtherValueAtOffset returns 0 for a brush-created mask | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-SegmentCollection#getothervalueatoffset-returns-0-for-a-brush-created-mask) |
| shiftSlices moves entries at or after the threshold, leaves earlier ones alone | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-SegmentCollection#shiftslices-moves-entries-at-or-after-the-threshold-leaves-earlier-ones-alone) |
| shiftSlices is a no-op for a brush-created mask (no #segments) | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-SegmentCollection#shiftslices-is-a-no-op-for-a-brush-created-mask-no-segments) |
| shiftSlices invalidates the cached union contour | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-SegmentCollection#shiftslices-invalidates-the-cached-union-contour) |
| getOrBuildUnionContour returns same object when visibility is unchanged | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-SegmentCollection#getorbuildunioncontour-returns-same-object-when-visibility-is-unchanged) |
| getOrBuildUnionContour rebuilds when hidden-segment set changes | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-SegmentCollection#getorbuildunioncontour-rebuilds-when-hidden-segment-set-changes) |

### io

| Test | Result | Requirement | Code |
| --- | :---: | --- | --- |
| DICOM data loader canloadurl | ✅ | URS [#DWV-REQ-IO-02-001 (Load DICOM discrete URL(s))](/tutorials/user-stories#dwv-req-io-02-001-load-dicom-discrete-urls) | [jsdoc](/module/tests-io#dicom-data-loader-canloadurl) |
| load returns early for empty input | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-io#load-returns-early-for-empty-input) |
| load throws when no matching loader is found | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-io#load-throws-when-no-matching-loader-is-found) |
| load reads files and fires aggregate events | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-io#load-reads-files-and-fires-aggregate-events) |
| load picks file reader mode from loader type | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-io#load-picks-file-reader-mode-from-loader-type) |
| reader error triggers error callback with file source | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-io#reader-error-triggers-error-callback-with-file-source) |
| load throws for mixed file types | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-io#load-throws-for-mixed-file-types) |
| abort aborts active readers and running loader | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-io#abort-aborts-active-readers-and-running-loader) |
| MemoryLoader events single frame | ✅ | URS [#DWV-REQ-IO-04-001 (DICOM load start event)](/tutorials/user-stories#dwv-req-io-04-001-dicom-load-start-event) | [jsdoc](/module/tests-io#memoryloader-events-single-frame) |
| MemoryLoader events multi frame | ✅ | URS [#DWV-REQ-IO-04-001 (DICOM load start event)](/tutorials/user-stories#dwv-req-io-04-001-dicom-load-start-event) | [jsdoc](/module/tests-io#memoryloader-events-multi-frame) |
| MemoryLoader events zip | ✅ | URS [#DWV-REQ-IO-04-001 (DICOM load start event)](/tutorials/user-stories#dwv-req-io-04-001-dicom-load-start-event) | [jsdoc](/module/tests-io#memoryloader-events-zip) |
| MultipartLoader load - two DICOM parts end-to-end | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-io#multipartloader-load-two-dicom-parts-end-to-end) |
| MultipartLoader canLoadMediaType | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-io#multipartloader-canloadmediatype) |
| MultipartLoader isLoaderName | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-io#multipartloader-isloadername) |
| MultipartLoader loadFileAs | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-io#multipartloader-loadfileas) |
| MultipartLoader loadUrlAs | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-io#multipartloader-loadurlas) |
| MultipartLoader canLoadFile | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-io#multipartloader-canloadfile) |
| MultipartLoader canLoadUrl | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-io#multipartloader-canloadurl) |
| MultipartLoader canLoadMemory | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-io#multipartloader-canloadmemory) |
| MultipartLoader load fires onloadstart and calls parseMultipart | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-io#multipartloader-load-fires-onloadstart-and-calls-parsemultipart) |
| MultipartLoader load transforms progress: loaded = 50 + inner / 2, index forwarded | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-io#multipartloader-load-transforms-progress-loaded-50-inner-2-index-forwarded) |
| MultipartLoader load: onloaditem by reference; onload fires once per URL | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-io#multipartloader-load-onloaditem-by-reference-onload-fires-once-per-url) |
| MultipartLoader load: onloadend resets isLoading then fires | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-io#multipartloader-load-onloadend-resets-isloading-then-fires) |
| MultipartLoader load assigns onerror and onabort by reference | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-io#multipartloader-load-assigns-onerror-and-onabort-by-reference) |
| MultipartLoader load with 2 URLs: accumulates parts, fires MemoryLoader once | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-io#multipartloader-load-with-2-urls-accumulates-parts-fires-memoryloader-once) |
| MultipartLoader abort resets isLoading and fires onabort and onloadend | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-io#multipartloader-abort-resets-isloading-and-fires-onabort-and-onloadend) |
| RAW image loader canloadurl | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-io#raw-image-loader-canloadurl) |
| RAW image loader canloadfile | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-io#raw-image-loader-canloadfile) |
| RAW image loader canloadmemory | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-io#raw-image-loader-canloadmemory) |
| RAW image loader content and state helpers | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-io#raw-image-loader-content-and-state-helpers) |
| RAW image loader load file data and fires callbacks | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-io#raw-image-loader-load-file-data-and-fires-callbacks) |
| RAW image loader load url data creates object url | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-io#raw-image-loader-load-url-data-creates-object-url) |
| RAW image loader forwards view conversion errors | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-io#raw-image-loader-forwards-view-conversion-errors) |
| RAW image loader abort fires abort and loadend | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-io#raw-image-loader-abort-fires-abort-and-loadend) |
| RAW video loader canloadurl | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-io#raw-video-loader-canloadurl) |
| RAW video loader canloadfile | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-io#raw-video-loader-canloadfile) |
| RAW video loader canloadmemory | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-io#raw-video-loader-canloadmemory) |
| RAW video loader content and state helpers | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-io#raw-video-loader-content-and-state-helpers) |
| RAW video loader load url converts ArrayBuffer to data uri | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-io#raw-video-loader-load-url-converts-arraybuffer-to-data-uri) |
| RAW video loader load file uses source buffer directly | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-io#raw-video-loader-load-file-uses-source-buffer-directly) |
| RAW video loader delegates metadata event to DOM reader | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-io#raw-video-loader-delegates-metadata-event-to-dom-reader) |
| RAW video loader forwards metadata processing errors | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-io#raw-video-loader-forwards-metadata-processing-errors) |
| RAW video loader abort fires abort and loadend | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-io#raw-video-loader-abort-fires-abort-and-loadend) |
| load throws when no matching loader is found | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-io#load-throws-when-no-matching-loader-is-found) |
| load requests urls and fires aggregate events | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-io#load-requests-urls-and-fires-aggregate-events) |
| load applies request options and arraybuffer response type | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-io#load-applies-request-options-and-arraybuffer-response-type) |
| http status error triggers onerror with formatted message | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-io#http-status-error-triggers-onerror-with-formatted-message) |
| load throws for mixed url types | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-io#load-throws-for-mixed-url-types) |
| abort aborts pending requests and running loader | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-io#abort-aborts-pending-requests-and-running-loader) |
| DICOMDIR request error forwards source and ends load | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-io#dicomdir-request-error-forwards-source-and-ends-load) |
| ZIP loader canloadurl | ✅ | URS [#DWV-REQ-IO-02-003 (Load DICOM ZIP URL)](/tutorials/user-stories#dwv-req-io-02-003-load-dicom-zip-url) | [jsdoc](/module/tests-io#zip-loader-canloadurl) |

### BidimensionalLine

| Test | Result | Requirement | Code |
| --- | :---: | --- | --- |
| constructor and getters | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-BidimensionalLine#constructor-and-getters) |
| getCentroid returns midpoint | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-BidimensionalLine#getcentroid-returns-midpoint) |
| getLength returns correct value | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-BidimensionalLine#getlength-returns-correct-value) |
| getSlope returns correct value | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-BidimensionalLine#getslope-returns-correct-value) |
| getDeltaX and getDeltaY | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-BidimensionalLine#getdeltax-and-getdeltay) |
| quantify returns correct axes (default spacing, no short axis) | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-BidimensionalLine#quantify-returns-correct-axes-default-spacing-no-short-axis) |
| quantify returns correct axes (with short axis, spacing) | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-BidimensionalLine#quantify-returns-correct-axes-with-short-axis-spacing) |
| quantify throws if getLengthUnit missing | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-BidimensionalLine#quantify-throws-if-getlengthunit-missing) |

### BidimensionalLine contains

| Test | Result | Requirement | Code |
| --- | :---: | --- | --- |
| main axis only | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-BidimensionalLine contains#main-axis-only) |
| main and short axis | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-BidimensionalLine contains#main-and-short-axis) |

### math

| Test | Result | Requirement | Code |
| --- | :---: | --- | --- |
| BucketQueue class | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-math#bucketqueue-class) |
| Circle class | ✅ | URS [#DWV-REQ-UI-07-002 (Draw circle)](/tutorials/user-stories#dwv-req-ui-07-002-draw-circle) | [jsdoc](/module/tests-math#circle-class) |
| Circle quantification | ✅ | URS [#DWV-REQ-UI-07-002 (Draw circle)](/tutorials/user-stories#dwv-req-ui-07-002-draw-circle) | [jsdoc](/module/tests-math#circle-quantification) |
| Ellipse class | ✅ | URS [#DWV-REQ-UI-07-003 (Draw ellipse)](/tutorials/user-stories#dwv-req-ui-07-003-draw-ellipse) | [jsdoc](/module/tests-math#ellipse-class) |
| Ellipse quantification | ✅ | URS [#DWV-REQ-UI-07-003 (Draw ellipse)](/tutorials/user-stories#dwv-req-ui-07-003-draw-ellipse) | [jsdoc](/module/tests-math#ellipse-quantification) |
| getEllipseIndices | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-math#getellipseindices) |
| Histogram add | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-math#histogram-add) |
| Histogram keeps negative values | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-math#histogram-keeps-negative-values) |
| Histogram empty | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-math#histogram-empty) |
| Histogram getCountInRange | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-math#histogram-getcountinrange) |
| Histogram getIntervalPercentages | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-math#histogram-getintervalpercentages) |
| Histogram getIntervalPercentages returns 0 when empty | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-math#histogram-getintervalpercentages-returns-0-when-empty) |
| Histogram getIntervalPercentages uses semi-open bounds | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-math#histogram-getintervalpercentages-uses-semi-open-bounds) |
| Histogram getIntervalPercentages relative to intervals total | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-math#histogram-getintervalpercentages-relative-to-intervals-total) |
| Histogram getIntervalPercentages with unbounded ends | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-math#histogram-getintervalpercentages-with-unbounded-ends) |
| Histogram getIntervalPercentages with less than 2 thresholds | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-math#histogram-getintervalpercentages-with-less-than-2-thresholds) |
| Histogram getStats matches getStats on values | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-math#histogram-getstats-matches-getstats-on-values) |
| Histogram getStats interpolates median | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-math#histogram-getstats-interpolates-median) |
| Histogram getStats single value | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-math#histogram-getstats-single-value) |
| Index class | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-math#index-class) |
| Index getZeroIndex | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-math#index-getzeroindex) |
| Line class | ✅ | URS [#DWV-REQ-UI-07-007 (Draw ruler)](/tutorials/user-stories#dwv-req-ui-07-007-draw-ruler) | [jsdoc](/module/tests-math#line-class) |
| Angle between lines | ✅ | URS [#DWV-REQ-UI-07-005 (Draw protractor)](/tutorials/user-stories#dwv-req-ui-07-005-draw-protractor) | [jsdoc](/module/tests-math#angle-between-lines) |
| areOrthogonal | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-math#areorthogonal) |
| Perpendicular line | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-math#perpendicular-line) |
| Line getPerpendicularLineAtDistance | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-math#line-getperpendicularlineatdistance) |
| Line isPointInLineRange | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-math#line-ispointinlinerange) |
| Matrix33 class | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-math#matrix33-class) |
| Matrix33 tostring | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-math#matrix33-tostring) |
| Matrix33 multiply vector | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-math#matrix33-multiply-vector) |
| Matrix33 multiply | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-math#matrix33-multiply) |
| Matrix33 inverse | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-math#matrix33-inverse) |
| Matrix33 abs | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-math#matrix33-abs) |
| Matrix33 asOneAndZeros | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-math#matrix33-asoneandzeros) |
| Matrix33 factories | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-math#matrix33-factories) |
| isSimilar | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-math#issimilar) |
| isAboveEpsilon | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-math#isaboveepsilon) |
| precisionRound | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-math#precisionround) |
| orientation matrix factories | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-math#orientation-matrix-factories) |
| getOrientationFromCosines | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-math#getorientationfromcosines) |
| getOrientationStringLPS | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-math#getorientationstringlps) |
| getOrientationName | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-math#getorientationname) |
| getOrientationStringLPS all codes | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-math#getorientationstringlps-all-codes) |
| getDisplayOrientation | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-math#getdisplayorientation) |
| getViewFlips previous table | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-math#getviewflips-previous-table) |
| getViewFlips all codes | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-math#getviewflips-all-codes) |
| Path class | ✅ | URS [#DWV-REQ-UI-07-004 (Draw free hand)](/tutorials/user-stories#dwv-req-ui-07-004-draw-free-hand) | [jsdoc](/module/tests-math#path-class) |
| Point2D class | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-math#point2d-class) |
| Point3D class | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-math#point3d-class) |
| Point class | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-math#point-class) |
| Protractor class | ✅ | URS [#DWV-REQ-UI-07-005 (Draw protractor)](/tutorials/user-stories#dwv-req-ui-07-005-draw-protractor) | [jsdoc](/module/tests-math#protractor-class) |
| Protractor quantification | ✅ | URS [#DWV-REQ-UI-07-005 (Draw protractor)](/tutorials/user-stories#dwv-req-ui-07-005-draw-protractor) | [jsdoc](/module/tests-math#protractor-quantification) |
| Rectangle class | ✅ | URS [#DWV-REQ-UI-07-006 (Draw rectangle)](/tutorials/user-stories#dwv-req-ui-07-006-draw-rectangle) | [jsdoc](/module/tests-math#rectangle-class) |
| Rectangle quantification | ✅ | URS [#DWV-REQ-UI-07-006 (Draw rectangle)](/tutorials/user-stories#dwv-req-ui-07-006-draw-rectangle) | [jsdoc](/module/tests-math#rectangle-quantification) |
| Rectangle getRectangleIndices | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-math#rectangle-getrectangleindices) |
| ROI class | ✅ | URS [#DWV-REQ-UI-07-008 (Draw ROI)](/tutorials/user-stories#dwv-req-ui-07-008-draw-roi) | [jsdoc](/module/tests-math#roi-class) |
| getBasicStats | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-math#getbasicstats) |
| getFullStats | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-math#getfullstats) |
| GUID | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-math#guid) |
| Vector3D class | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-math#vector3d-class) |
| Vector3D crossProduct | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-math#vector3d-crossproduct) |
| Vector3D dotProduct | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-math#vector3d-dotproduct) |

### math circle contains

| Test | Result | Requirement | Code |
| --- | :---: | --- | --- |
| Circle contains | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-math circle contains#circle-contains) |

### math ellipse contains

| Test | Result | Requirement | Code |
| --- | :---: | --- | --- |
| Ellipse contains | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-math ellipse contains#ellipse-contains) |

### math line contains

| Test | Result | Requirement | Code |
| --- | :---: | --- | --- |
| getDistanceToSegment | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-math line contains#getdistancetosegment) |
| Line contains | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-math line contains#line-contains) |

### math point contains

| Test | Result | Requirement | Code |
| --- | :---: | --- | --- |
| Point2D contains | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-math point contains#point2d-contains) |

### math protractor contains

| Test | Result | Requirement | Code |
| --- | :---: | --- | --- |
| Protractor contains | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-math protractor contains#protractor-contains) |

### math rectangle contains

| Test | Result | Requirement | Code |
| --- | :---: | --- | --- |
| Rectangle contains | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-math rectangle contains#rectangle-contains) |

### math roi contains

| Test | Result | Requirement | Code |
| --- | :---: | --- | --- |
| ROI contains | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-math roi contains#roi-contains) |

### Brush

| Test | Result | Requirement | Code |
| --- | :---: | --- | --- |
| exposes expected tool events, help, and init | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-Brush#exposes-expected-tool-events-help-and-init) |
| keydown forwards to app with Brush context | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-Brush#keydown-forwards-to-app-with-brush-context) |
| keydown adjusts brush size and mode via BrushDragBehavior | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-Brush#keydown-adjusts-brush-size-and-mode-via-brushdragbehavior) |
| contextmenu prevents the default browser menu | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-Brush#contextmenu-prevents-the-default-browser-menu) |
| activate(false) cancels the current brush action | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-Brush#activatefalse-cancels-the-current-brush-action) |
| setFeatures forwards to brush drag behavior | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-Brush#setfeatures-forwards-to-brush-drag-behavior) |

### tools/draw

| Test | Result | Requirement | Code |
| --- | :---: | --- | --- |
| Draw extends LayerGroupPointer and EventTarget | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/draw#draw-extends-layergrouppointer-and-eventtarget) |
| getEventNames, getOptionsType, init | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/draw#geteventnames-getoptionstype-init) |
| setOptions forwards to drag and tap behaviors | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/draw#setoptions-forwards-to-drag-and-tap-behaviors) |
| hasShape reflects options on tap behavior | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/draw#hasshape-reflects-options-on-tap-behavior) |
| setFeatures forwards mouseOverCursor to shape handler | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/draw#setfeatures-forwards-mouseovercursor-to-shape-handler) |
| Escape calls resetPlacement on drag and tap behaviors | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/draw#escape-calls-resetplacement-on-drag-and-tap-behaviors) |
| cancel calls resetPlacement on drag and tap behaviors | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/draw#cancel-calls-resetplacement-on-drag-and-tap-behaviors) |
| keydown forwards to app when tap inactive | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/draw#keydown-forwards-to-app-when-tap-inactive) |
| keydown does not forward to app when tap placement is active | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/draw#keydown-does-not-forward-to-app-when-tap-placement-is-active) |
| activate wires draw layers for shape handler and position listener | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/draw#activate-wires-draw-layers-for-shape-handler-and-position-listener) |
| activate(false) removes position listener and calls shape mouse out | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/draw#activatefalse-removes-position-listener-and-calls-shape-mouse-out) |
| Delete removes annotation via undo stack | ✅ | URS [#DWV-REQ-UI-08-001 (Draw delete)](/tutorials/user-stories#dwv-req-ui-08-001-draw-delete) | [jsdoc](/module/tests-tools/draw#delete-removes-annotation-via-undo-stack) |

### tools/filter

| Test | Result | Requirement | Code |
| --- | :---: | --- | --- |
| Filter getOptionsType returns instance | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/filter#filter-getoptionstype-returns-instance) |
| Filter getEventNames lists filterrun and filterundo | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/filter#filter-geteventnames-lists-filterrun-and-filterundo) |
| Filter setOptions builds filter instances | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/filter#filter-setoptions-builds-filter-instances) |
| Filter hasFilter returns entry when defined | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/filter#filter-hasfilter-returns-entry-when-defined) |
| Filter setFeatures throws for unknown filter name | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/filter#filter-setfeatures-throws-for-unknown-filter-name) |
| Filter keydown forwards to app with Filter context | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/filter#filter-keydown-forwards-to-app-with-filter-context) |
| Filter activate wires filterrun/filterundo to Filter listeners | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/filter#filter-activate-wires-filterrunfilterundo-to-filter-listeners) |
| Filter setFeatures selects filter and optional run dispatches command | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/filter#filter-setfeatures-selects-filter-and-optional-run-dispatches-command) |
| Threshold run throws without dataId | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/filter#threshold-run-throws-without-dataid) |
| Threshold run executes filter command and pushes undo | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/filter#threshold-run-executes-filter-command-and-pushes-undo) |
| Sharpen run throws without dataId | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/filter#sharpen-run-throws-without-dataid) |
| Sharpen run executes filter command and pushes undo | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/filter#sharpen-run-executes-filter-command-and-pushes-undo) |
| Sobel run throws without dataId | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/filter#sobel-run-throws-without-dataid) |
| Sobel run executes filter command and pushes undo | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/filter#sobel-run-executes-filter-command-and-pushes-undo) |

### Floodfill

| Test | Result | Requirement | Code |
| --- | :---: | --- | --- |
| constructs as Floodfill / LayerGroupPointer / EventTarget | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-Floodfill#constructs-as-floodfill-layergrouppointer-eventtarget) |
| drag + wheel stack handles lifecycle without throwing | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-Floodfill#drag-wheel-stack-handles-lifecycle-without-throwing) |
| keydown sets tool context and forwards to app | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-Floodfill#keydown-sets-tool-context-and-forwards-to-app) |

### tools/layerGroupPointer

| Test | Result | Requirement | Code |
| --- | :---: | --- | --- |
| LayerGroupPointer extends EventTarget | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/layerGroupPointer#layergrouppointer-extends-eventtarget) |
| mousedown starts drag when canStart; mousemove updates drag | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/layerGroupPointer#mousedown-starts-drag-when-canstart-mousemove-updates-drag) |
| mouseout ends active drag and calls hoverBehavior.onEnd | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/layerGroupPointer#mouseout-ends-active-drag-and-calls-hoverbehavioronend) |
| mouseout calls hoverBehavior.onEnd when drag is inactive | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/layerGroupPointer#mouseout-calls-hoverbehavioronend-when-drag-is-inactive) |
| mouseout clears pressed-button state so hover moves resume | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/layerGroupPointer#mouseout-clears-pressed-button-state-so-hover-moves-resume) |
| mouseout calls tapBehavior.onEnd when tap is active | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/layerGroupPointer#mouseout-calls-tapbehavioronend-when-tap-is-active) |
| touchstart, touchmove, touchend drive drag lifecycle | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/layerGroupPointer#touchstart-touchmove-touchend-drive-drag-lifecycle) |
| touchstart with two touches ends active one-finger drag | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/layerGroupPointer#touchstart-with-two-touches-ends-active-one-finger-drag) |
| two-touch events drive TwoTouchBehavior lifecycle | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/layerGroupPointer#two-touch-events-drive-twotouchbehavior-lifecycle) |
| cancel ends active TwoTouchBehavior | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/layerGroupPointer#cancel-ends-active-twotouchbehavior) |
| mousedown does not start drag when canStart returns false | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/layerGroupPointer#mousedown-does-not-start-drag-when-canstart-returns-false) |
| undefined dragBehavior skips drag; hover and tap still work | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/layerGroupPointer#undefined-dragbehavior-skips-drag-hover-and-tap-still-work) |
| mousemove calls hoverBehavior.onUpdate when drag is inactive | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/layerGroupPointer#mousemove-calls-hoverbehavioronupdate-when-drag-is-inactive) |
| wheel calls onWheel, preventDefault, and onWheelTick on tick | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/layerGroupPointer#wheel-calls-onwheel-preventdefault-and-onwheeltick-on-tick) |
| wheel without wheelBehavior does not prevent default | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/layerGroupPointer#wheel-without-wheelbehavior-does-not-prevent-default) |
| wheel onWheel each move; onWheelTick when tick threshold met | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/layerGroupPointer#wheel-onwheel-each-move-onwheeltick-when-tick-threshold-met) |
| mouseup invokes tap when there was no move | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/layerGroupPointer#mouseup-invokes-tap-when-there-was-no-move) |
| mouseup does reset active drag if pointer did not move | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/layerGroupPointer#mouseup-does-reset-active-drag-if-pointer-did-not-move) |
| mouseup does not tap after mousemove past tolerance | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/layerGroupPointer#mouseup-does-not-tap-after-mousemove-past-tolerance) |
| mouseup still taps after a small mousemove within tolerance | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/layerGroupPointer#mouseup-still-taps-after-a-small-mousemove-within-tolerance) |
| mouseup taps on a live tolerance check: a move far from the down point that returns within tolerance still taps | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/layerGroupPointer#mouseup-taps-on-a-live-tolerance-check-a-move-far-from-the-down-point-that-returns-within-tolerance-still-taps) |
| mouseup invokes tap when tap is active even after mousemove | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/layerGroupPointer#mouseup-invokes-tap-when-tap-is-active-even-after-mousemove) |
| cancel clears long-touch timer | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/layerGroupPointer#cancel-clears-long-touch-timer) |
| touchstart schedules dblclick after default delay | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/layerGroupPointer#touchstart-schedules-dblclick-after-default-delay) |
| touchmove clears long-touch dblclick timer | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/layerGroupPointer#touchmove-clears-long-touch-dblclick-timer) |
| touchstart prevents default without long-touch delay | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/layerGroupPointer#touchstart-prevents-default-without-long-touch-delay) |
| touchstart prevents default with two touches | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/layerGroupPointer#touchstart-prevents-default-with-two-touches) |
| preventDefault is only called on non passive interaction events | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/layerGroupPointer#preventdefault-is-only-called-on-non-passive-interaction-events) |
| touchcancel clears long-touch timer and resets drag | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/layerGroupPointer#touchcancel-clears-long-touch-timer-and-resets-drag) |

### Livewire

| Test | Result | Requirement | Code |
| --- | :---: | --- | --- |
| constructs as Livewire / LayerGroupPointer / EventTarget | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-Livewire#constructs-as-livewire-layergrouppointer-eventtarget) |
| tap + wheel stack handles lifecycle without throwing | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-Livewire#tap-wheel-stack-handles-lifecycle-without-throwing) |
| keydown sets tool context and forwards to app | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-Livewire#keydown-sets-tool-context-and-forwards-to-app) |

### Opacity

| Test | Result | Requirement | Code |
| --- | :---: | --- | --- |
| should instantiate with app and be a LayerGroupPointer | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-Opacity#should-instantiate-with-app-and-be-a-layergrouppointer) |
| behavior combination should handle lifecycle methods | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-Opacity#behavior-combination-should-handle-lifecycle-methods) |
| should handle keydown events with behavior context | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-Opacity#should-handle-keydown-events-with-behavior-context) |

### Scroll

| Test | Result | Requirement | Code |
| --- | :---: | --- | --- |
| should instantiate with app and be a LayerGroupPointer | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-Scroll#should-instantiate-with-app-and-be-a-layergrouppointer) |
| behavior combination should handle lifecycle methods | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-Scroll#behavior-combination-should-handle-lifecycle-methods) |
| should handle keydown events with behavior context | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-Scroll#should-handle-keydown-events-with-behavior-context) |
| forwards the tap behavior events | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-Scroll#forwards-the-tap-behavior-events) |

### WindowLevel

| Test | Result | Requirement | Code |
| --- | :---: | --- | --- |
| should instantiate with app and be a LayerGroupPointer | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-WindowLevel#should-instantiate-with-app-and-be-a-layergrouppointer) |
| behavior combination should handle lifecycle methods | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-WindowLevel#behavior-combination-should-handle-lifecycle-methods) |
| should handle keydown events with behavior context | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-WindowLevel#should-handle-keydown-events-with-behavior-context) |
| should handle activeViewLayerOnly feature | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-WindowLevel#should-handle-activeviewlayeronly-feature) |

### ZoomAndPan

| Test | Result | Requirement | Code |
| --- | :---: | --- | --- |
| should instantiate with app and be a LayerGroupPointer | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ZoomAndPan#should-instantiate-with-app-and-be-a-layergrouppointer) |
| behavior combination should handle lifecycle methods | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ZoomAndPan#behavior-combination-should-handle-lifecycle-methods) |
| should handle keydown events with behavior context | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ZoomAndPan#should-handle-keydown-events-with-behavior-context) |
| should call cancel when deactivated | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ZoomAndPan#should-call-cancel-when-deactivated) |
| forwards the tap behavior events | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-ZoomAndPan#forwards-the-tap-behavior-events) |

### decoders

| Test | Result | Requirement | Code |
| --- | :---: | --- | --- |
| RleDecoder runs literal run | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-decoders#rledecoder-runs-literal-run) |
| RleDecoder runs replicate run | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-decoders#rledecoder-runs-replicate-run) |
| RleDecoder runs mixed runs | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-decoders#rledecoder-runs-mixed-runs) |
| RleDecoder runs -128 is a no-op | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-decoders#rledecoder-runs-128-is-a-no-op) |
| RleDecoder runs odd segment padded with zero | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-decoders#rledecoder-runs-odd-segment-padded-with-zero) |
| RleDecoder runs fragment not at the start of its buffer | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-decoders#rledecoder-runs-fragment-not-at-the-start-of-its-buffer) |
| RleDecoder 8 bits unsigned | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-decoders#rledecoder-8-bits-unsigned) |
| RleDecoder 8 bits signed | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-decoders#rledecoder-8-bits-signed) |
| RleDecoder 16 bits unsigned | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-decoders#rledecoder-16-bits-unsigned) |
| RleDecoder 16 bits signed | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-decoders#rledecoder-16-bits-signed) |
| RleDecoder RGB planar configuration 0: interleaved | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-decoders#rledecoder-rgb-planar-configuration-0-interleaved) |
| RleDecoder RGB planar configuration 1: by plane | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-decoders#rledecoder-rgb-planar-configuration-1-by-plane) |

### BrushDragBehavior

| Test | Result | Requirement | Code |
| --- | :---: | --- | --- |
| canStart is false when active layer is not a ViewLayer | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-BrushDragBehavior#canstart-is-false-when-active-layer-is-not-a-viewlayer) |
| canStart is false when selected segment is undefined | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-BrushDragBehavior#canstart-is-false-when-selected-segment-is-undefined) |
| canStart is false when series is blacklisted | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-BrushDragBehavior#canstart-is-false-when-series-is-blacklisted) |
| canStart is true with ViewLayer, segment, not blacklisted | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-BrushDragBehavior#canstart-is-true-with-viewlayer-segment-not-blacklisted) |
| setFeatures forwards blacklist used by canStart | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-BrushDragBehavior#setfeatures-forwards-blacklist-used-by-canstart) |
| onStart with right button fires erasingactivated | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-BrushDragBehavior#onstart-with-right-button-fires-erasingactivated) |
| onEnd after right-button stroke fires erasingdeactivated | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-BrushDragBehavior#onend-after-right-button-stroke-fires-erasingdeactivated) |

### BrushMaskPaint

| Test | Result | Requirement | Code |
| --- | :---: | --- | --- |
| defaults: brush size 10, mode del, no segment | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-BrushMaskPaint#defaults-brush-size-10-mode-del-no-segment) |
| setFeatures clamps brush size to range | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-BrushMaskPaint#setfeatures-clamps-brush-size-to-range) |
| brushSizeAdd dispatches brushsizechange when size changes | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-BrushMaskPaint#brushsizeadd-dispatches-brushsizechange-when-size-changes) |
| brushSizeAdd does not dispatch when clamped unchanged | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-BrushMaskPaint#brushsizeadd-does-not-dispatch-when-clamped-unchanged) |
| setBrushMode delegates to setFeatures | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-BrushMaskPaint#setbrushmode-delegates-to-setfeatures) |
| setFeatures updates selected segment number | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-BrushMaskPaint#setfeatures-updates-selected-segment-number) |

### brushPaintMessages

| Test | Result | Requirement | Code |
| --- | :---: | --- | --- |
| formatString replaces {0} with first value | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-brushPaintMessages#formatstring-replaces-0-with-first-value) |
| formatString replaces multiple placeholders in order | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-brushPaintMessages#formatstring-replaces-multiple-placeholders-in-order) |
| formatString uses empty string for missing values | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-brushPaintMessages#formatstring-uses-empty-string-for-missing-values) |
| ERROR_MESSAGES.brush contains expected stable keys used by brush tooling | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-brushPaintMessages#errormessagesbrush-contains-expected-stable-keys-used-by-brush-tooling) |

### tools/behaviors

| Test | Result | Requirement | Code |
| --- | :---: | --- | --- |
| DoubleClickBehavior onDoubleClick is a no-op by default | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#doubleclickbehavior-ondoubleclick-is-a-no-op-by-default) |
| WindowLevelDoubleClickBehavior initializes with dataController and default activeViewLayerOnly=true | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#windowleveldoubleclickbehavior-initializes-with-datacontroller-and-default-activeviewlayeronlytrue) |
| WindowLevelDoubleClickBehavior setActiveViewLayerOnly changes configuration | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#windowleveldoubleclickbehavior-setactiveviewlayeronly-changes-configuration) |
| WindowLevelDoubleClickBehavior onDoubleClick sets window center from clicked pixel | ✅ | URS [#DWV-REQ-UI-05-001 (Window/Level tool)](/tutorials/user-stories#dwv-req-ui-05-001-windowlevel-tool) | [jsdoc](/module/tests-tools/behaviors#windowleveldoubleclickbehavior-ondoubleclick-sets-window-center-from-clicked-pixel) |
| WindowLevelDoubleClickBehavior onDoubleClick does nothing when no view layer | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#windowleveldoubleclickbehavior-ondoubleclick-does-nothing-when-no-view-layer) |
| WindowLevelDoubleClickBehavior onDoubleClick does nothing when layer is not monochrome | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#windowleveldoubleclickbehavior-ondoubleclick-does-nothing-when-layer-is-not-monochrome) |
| WindowLevelDoubleClickBehavior onDoubleClick creates WindowLevel from pixel intensity | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#windowleveldoubleclickbehavior-ondoubleclick-creates-windowlevel-from-pixel-intensity) |
| PlayDoubleClickBehavior onDoubleClick calls play() on the view controller | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#playdoubleclickbehavior-ondoubleclick-calls-play-on-the-view-controller) |
| PlayDoubleClickBehavior onDoubleClick does nothing when no view layer | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#playdoubleclickbehavior-ondoubleclick-does-nothing-when-no-view-layer) |
| DragStep stores points and computes delta Scalar2D | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#dragstep-stores-points-and-computes-delta-scalar2d) |
| DragStep computes negative deltas | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#dragstep-computes-negative-deltas) |
| DragStep passesThresholdX returns true when no threshold | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#dragstep-passesthresholdx-returns-true-when-no-threshold) |
| DragStep passesThresholdX returns true when abs(dx) >= threshold | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#dragstep-passesthresholdx-returns-true-when-absdx-threshold) |
| DragStep passesThresholdX returns false when abs(dx) < threshold | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#dragstep-passesthresholdx-returns-false-when-absdx-threshold) |
| DragStep passesThresholdY returns true when no threshold | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#dragstep-passesthresholdy-returns-true-when-no-threshold) |
| DragStep passesThresholdY returns true when abs(dy) >= threshold | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#dragstep-passesthresholdy-returns-true-when-absdy-threshold) |
| DragStep passesThreshold returns true when either X or Y passes | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#dragstep-passesthreshold-returns-true-when-either-x-or-y-passes) |
| DragStep passesThreshold returns false when neither X nor Y passes | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#dragstep-passesthreshold-returns-false-when-neither-x-nor-y-passes) |
| DragStep handles negative thresholds as no threshold | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#dragstep-handles-negative-thresholds-as-no-threshold) |
| DragStep omitted threshold options default both axes to zero | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#dragstep-omitted-threshold-options-default-both-axes-to-zero) |
| DragStep partial threshold treats missing axis as zero (no minimum) | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#dragstep-partial-threshold-treats-missing-axis-as-zero-no-minimum) |
| DragBehavior DragBehavior extends EventTarget | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#dragbehavior-dragbehavior-extends-eventtarget) |
| DragBehavior is not active initially | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#dragbehavior-is-not-active-initially) |
| DragBehavior canStart returns true by default | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#dragbehavior-canstart-returns-true-by-default) |
| DragBehavior onStart makes behavior active | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#dragbehavior-onstart-makes-behavior-active) |
| DragBehavior onStart accepts optional layerGroup and pointerStart context | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#dragbehavior-onstart-accepts-optional-layergroup-and-pointerstart-context) |
| DragBehavior onUpdate before onStart throws (no anchor point) | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#dragbehavior-onupdate-before-onstart-throws-no-anchor-point) |
| DragBehavior prevPoint getter matches onStart and null after onEnd | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#dragbehavior-prevpoint-getter-matches-onstart-and-null-after-onend) |
| DragBehavior during onDrag prevPoint is current move endpoint | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#dragbehavior-during-ondrag-prevpoint-is-current-move-endpoint) |
| DragBehavior onEnd makes behavior inactive | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#dragbehavior-onend-makes-behavior-inactive) |
| DragBehavior reset clears drag state like onEnd | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#dragbehavior-reset-clears-drag-state-like-onend) |
| DragBehavior onUpdate passes layerGroup through to onDrag | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#dragbehavior-onupdate-passes-layergroup-through-to-ondrag) |
| DragBehavior onUpdate calls onDrag when threshold passes | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#dragbehavior-onupdate-calls-ondrag-when-threshold-passes) |
| DragBehavior onUpdate does not call onDrag when threshold fails | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#dragbehavior-onupdate-does-not-call-ondrag-when-threshold-fails) |
| DragBehavior onUpdate advances prevPoint before onDrag for next step | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#dragbehavior-onupdate-advances-prevpoint-before-ondrag-for-next-step) |
| DragBehavior setDragThreshold changes drag sensitivity | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#dragbehavior-setdragthreshold-changes-drag-sensitivity) |
| DragBehavior constructor defaults threshold to zero on both axes | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#dragbehavior-constructor-defaults-threshold-to-zero-on-both-axes) |
| WindowLevelDragBehavior initializes with default activeViewLayerOnly=true | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#windowleveldragbehavior-initializes-with-default-activeviewlayeronlytrue) |
| WindowLevelDragBehavior setActiveViewLayerOnly changes the configuration | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#windowleveldragbehavior-setactiveviewlayeronly-changes-the-configuration) |
| WindowLevelDragBehavior canStart returns false when no monochrome layer | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#windowleveldragbehavior-canstart-returns-false-when-no-monochrome-layer) |
| WindowLevelDragBehavior canStart returns true when monochrome layer available | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#windowleveldragbehavior-canstart-returns-true-when-monochrome-layer-available) |
| WindowLevelDragBehavior activeViewLayerOnly false: first monochrome active layer | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#windowleveldragbehavior-activeviewlayeronly-false-first-monochrome-active-layer) |
| WindowLevelDragBehavior onDrag updates window level with dy delta | ✅ | URS [#DWV-REQ-UI-05-001 (Window/Level tool)](/tutorials/user-stories#dwv-req-ui-05-001-windowlevel-tool) | [jsdoc](/module/tests-tools/behaviors#windowleveldragbehavior-ondrag-updates-window-level-with-dy-delta) |
| ScrollDragBehavior initializes with 15px threshold | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#scrolldragbehavior-initializes-with-15px-threshold) |
| ScrollDragBehavior canStart returns false when no view layer | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#scrolldragbehavior-canstart-returns-false-when-no-view-layer) |
| ScrollDragBehavior canStart returns true when view layer exists | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#scrolldragbehavior-canstart-returns-true-when-view-layer-exists) |
| ScrollDragBehavior canStart true when draw layer references view layer | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#scrolldragbehavior-canstart-true-when-draw-layer-references-view-layer) |
| ScrollDragBehavior onDrag decrements scroll when dy > 0 and canScroll | ✅ | URS [#DWV-REQ-UI-05-003 (Slice scroll tool)](/tutorials/user-stories#dwv-req-ui-05-003-slice-scroll-tool) | [jsdoc](/module/tests-tools/behaviors#scrolldragbehavior-ondrag-decrements-scroll-when-dy-0-and-canscroll) |
| ScrollDragBehavior onDrag increments scroll when dy < 0 and canScroll | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#scrolldragbehavior-ondrag-increments-scroll-when-dy-0-and-canscroll) |
| ScrollDragBehavior onDrag increments dimension 3 when dx > 0 and moreThanOne(3) | ✅ | URS [#DWV-REQ-UI-03-005 (Change image volume)](/tutorials/user-stories#dwv-req-ui-03-005-change-image-volume) | [jsdoc](/module/tests-tools/behaviors#scrolldragbehavior-ondrag-increments-dimension-3-when-dx-0-and-morethanone3) |
| OpacityDragBehavior canStart returns false when no active layer | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#opacitydragbehavior-canstart-returns-false-when-no-active-layer) |
| OpacityDragBehavior canStart returns true when active layer exists | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#opacitydragbehavior-canstart-returns-true-when-active-layer-exists) |
| OpacityDragBehavior onDrag updates opacity when thresholdX passes | ✅ | URS [#DWV-REQ-UI-05-005 (Opacity tool)](/tutorials/user-stories#dwv-req-ui-05-005-opacity-tool) | [jsdoc](/module/tests-tools/behaviors#opacitydragbehavior-ondrag-updates-opacity-when-thresholdx-passes) |
| OpacityDragBehavior onDrag does not update opacity when thresholdX fails | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#opacitydragbehavior-ondrag-does-not-update-opacity-when-thresholdx-fails) |
| PanDragBehavior onDrag translates using display deltas in plane space | ✅ | URS [#DWV-REQ-UI-05-004 (Zoom/Pan tool)](/tutorials/user-stories#dwv-req-ui-05-004-zoompan-tool) | [jsdoc](/module/tests-tools/behaviors#pandragbehavior-ondrag-translates-using-display-deltas-in-plane-space) |
| PanDragBehavior onDrag does nothing when no view layer and no draw reference | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#pandragbehavior-ondrag-does-nothing-when-no-view-layer-and-no-draw-reference) |
| PanDragBehavior onDrag uses view layer resolved from active draw layer | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#pandragbehavior-ondrag-uses-view-layer-resolved-from-active-draw-layer) |
| HoverBehavior onUpdate is a no-op by default | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#hoverbehavior-onupdate-is-a-no-op-by-default) |
| HoverBehavior onEnd is a no-op by default | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#hoverbehavior-onend-is-a-no-op-by-default) |
| TooltipHoverBehavior initializes with tooltipEnabled=false by default | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#tooltiphoverbehavior-initializes-with-tooltipenabledfalse-by-default) |
| TooltipHoverBehavior setTooltipEnabled changes configuration | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#tooltiphoverbehavior-settooltipenabled-changes-configuration) |
| TooltipHoverBehavior onUpdate shows tooltip when enabled | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#tooltiphoverbehavior-onupdate-shows-tooltip-when-enabled) |
| TooltipHoverBehavior onUpdate does not show tooltip when disabled | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#tooltiphoverbehavior-onupdate-does-not-show-tooltip-when-disabled) |
| TooltipHoverBehavior onEnd removes tooltip | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#tooltiphoverbehavior-onend-removes-tooltip) |
| TooltipHoverBehavior onEnd does nothing before any hover | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#tooltiphoverbehavior-onend-does-nothing-before-any-hover) |
| TooltipHoverBehavior onUpdate with enabled=true tracks current layer group | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#tooltiphoverbehavior-onupdate-with-enabledtrue-tracks-current-layer-group) |
| TapBehavior TapBehavior extends EventTarget | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#tapbehavior-tapbehavior-extends-eventtarget) |
| TapBehavior default onTap does not set active | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#tapbehavior-default-ontap-does-not-set-active) |
| TapBehavior reset clears an in-progress multi-tap session | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#tapbehavior-reset-clears-an-in-progress-multi-tap-session) |
| TapBehavior sticky onTap does set active | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#tapbehavior-sticky-ontap-does-set-active) |
| PositionSetTapBehavior onTap sets current position from tap point | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#positionsettapbehavior-ontap-sets-current-position-from-tap-point) |
| PositionSetTapBehavior onTap does nothing when no view layer | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#positionsettapbehavior-ontap-does-nothing-when-no-view-layer) |
| PositionSetTapBehavior onTap converts display coords to plane coords | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#positionsettapbehavior-ontap-converts-display-coords-to-plane-coords) |
| PositionSetTapBehavior onTap on an annotation fires tap with the annotation | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#positionsettapbehavior-ontap-on-an-annotation-fires-tap-with-the-annotation) |
| PositionSetTapBehavior onTap on a segment fires tap with the segments | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#positionsettapbehavior-ontap-on-a-segment-fires-tap-with-the-segments) |
| PositionSetTapBehavior onTap on empty space fires tap with empty hits | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#positionsettapbehavior-ontap-on-empty-space-fires-tap-with-empty-hits) |
| PositionSetTapBehavior onTap fires no tap when no view layer | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#positionsettapbehavior-ontap-fires-no-tap-when-no-view-layer) |
| TwoTouchBehavior isActive returns false by default | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#twotouchbehavior-isactive-returns-false-by-default) |
| TwoTouchBehavior onStart is a no-op by default | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#twotouchbehavior-onstart-is-a-no-op-by-default) |
| TwoTouchBehavior onUpdate returns false by default | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#twotouchbehavior-onupdate-returns-false-by-default) |
| TwoTouchBehavior onEnd is a no-op by default | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#twotouchbehavior-onend-is-a-no-op-by-default) |
| ZoomScrollTwoTouchBehavior isActive returns false initially | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#zoomscrolltwotouchbehavior-isactive-returns-false-initially) |
| ZoomScrollTwoTouchBehavior isActive returns true after onStart | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#zoomscrolltwotouchbehavior-isactive-returns-true-after-onstart) |
| ZoomScrollTwoTouchBehavior onStart stores the initial touch line | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#zoomscrolltwotouchbehavior-onstart-stores-the-initial-touch-line) |
| ZoomScrollTwoTouchBehavior onUpdate returns true when points move (zoom) | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#zoomscrolltwotouchbehavior-onupdate-returns-true-when-points-move-zoom) |
| ZoomScrollTwoTouchBehavior onUpdate returns false when not active | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#zoomscrolltwotouchbehavior-onupdate-returns-false-when-not-active) |
| ZoomScrollTwoTouchBehavior onUpdate zooms when line length ratio != 1 | ✅ | URS [#DWV-REQ-UI-05-004 (Zoom/Pan tool)](/tutorials/user-stories#dwv-req-ui-05-004-zoompan-tool) | [jsdoc](/module/tests-tools/behaviors#zoomscrolltwotouchbehavior-onupdate-zooms-when-line-length-ratio-1) |
| ZoomScrollTwoTouchBehavior onUpdate scrolls when points move vertically with ratio=1 | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#zoomscrolltwotouchbehavior-onupdate-scrolls-when-points-move-vertically-with-ratio1) |
| ZoomScrollTwoTouchBehavior onEnd clears the active state | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#zoomscrolltwotouchbehavior-onend-clears-the-active-state) |
| ZoomScrollTwoTouchBehavior can be restarted after onEnd | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#zoomscrolltwotouchbehavior-can-be-restarted-after-onend) |
| ZoomScrollTwoTouchBehavior handles zoom in correctly | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#zoomscrolltwotouchbehavior-handles-zoom-in-correctly) |
| ZoomScrollTwoTouchBehavior handles zoom out correctly | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#zoomscrolltwotouchbehavior-handles-zoom-out-correctly) |
| WheelBehavior onWheel is a no-op by default | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#wheelbehavior-onwheel-is-a-no-op-by-default) |
| WheelBehavior onWheelTick is a no-op by default | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#wheelbehavior-onwheeltick-is-a-no-op-by-default) |
| ScrollWheelBehavior onWheelTick increments scroll when up=true and canScroll | ✅ | URS [#DWV-REQ-UI-05-003 (Slice scroll tool)](/tutorials/user-stories#dwv-req-ui-05-003-slice-scroll-tool) | [jsdoc](/module/tests-tools/behaviors#scrollwheelbehavior-onwheeltick-increments-scroll-when-uptrue-and-canscroll) |
| ScrollWheelBehavior onWheelTick decrements scroll when up=false and canScroll | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#scrollwheelbehavior-onwheeltick-decrements-scroll-when-upfalse-and-canscroll) |
| ScrollWheelBehavior onWheelTick increments dimension 3 when up=true and moreThanOne(3) | ✅ | URS [#DWV-REQ-UI-03-005 (Change image volume)](/tutorials/user-stories#dwv-req-ui-03-005-change-image-volume) | [jsdoc](/module/tests-tools/behaviors#scrollwheelbehavior-onwheeltick-increments-dimension-3-when-uptrue-and-morethanone3) |
| ScrollWheelBehavior onWheelTick decrements dimension 3 when up=false and moreThanOne(3) | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#scrollwheelbehavior-onwheeltick-decrements-dimension-3-when-upfalse-and-morethanone3) |
| ZoomWheelBehavior onWheel zooms when layerGroup is defined | ✅ | URS [#DWV-REQ-UI-05-004 (Zoom/Pan tool)](/tutorials/user-stories#dwv-req-ui-05-004-zoompan-tool) | [jsdoc](/module/tests-tools/behaviors#zoomwheelbehavior-onwheel-zooms-when-layergroup-is-defined) |
| ZoomWheelBehavior onWheel does nothing when layerGroup is undefined | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#zoomwheelbehavior-onwheel-does-nothing-when-layergroup-is-undefined) |
| ZoomWheelBehavior onWheel computes correct zoom step | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#zoomwheelbehavior-onwheel-computes-correct-zoom-step) |
| WheelTick initializes with sum=0 | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#wheeltick-initializes-with-sum0) |
| WheelTick isTick returns false initially | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#wheeltick-istick-returns-false-initially) |
| WheelTick getSum returns accumulated spin | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#wheeltick-getsum-returns-accumulated-spin) |
| WheelTick add accumulates spin from wheel events | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#wheeltick-add-accumulates-spin-from-wheel-events) |
| WheelTick add handles negative deltaY | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#wheeltick-add-handles-negative-deltay) |
| WheelTick isTick returns true when abs(sum) >= 1 | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#wheeltick-istick-returns-true-when-abssum-1) |
| WheelTick isTick returns false when abs(sum) < 1 | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#wheeltick-istick-returns-false-when-abssum-1) |
| WheelTick clear resets accumulation | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#wheeltick-clear-resets-accumulation) |
| WheelTick isTick returns true for negative threshold | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#wheeltick-istick-returns-true-for-negative-threshold) |
| WheelTick multiple events can reach tick threshold | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#wheeltick-multiple-events-can-reach-tick-threshold) |
| WheelTick can accumulate multiple ticks | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#wheeltick-can-accumulate-multiple-ticks) |
| WheelTick clear works after multiple events | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#wheeltick-clear-works-after-multiple-events) |
| WheelTick handles trackpad small delta values | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#wheeltick-handles-trackpad-small-delta-values) |
| WheelTick handles mouse wheel large delta values | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#wheeltick-handles-mouse-wheel-large-delta-values) |
| WheelTick wheelDeltaY undefined falls back to deltaY normalization | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#wheeltick-wheeldeltay-undefined-falls-back-to-deltay-normalization) |
| WheelTick normalizes positive wheelDeltaY to 1 | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#wheeltick-normalizes-positive-wheeldeltay-to-1) |
| WheelTick normalizes negative wheelDeltaY to -1 | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#wheeltick-normalizes-negative-wheeldeltay-to-1) |
| WheelTick handles wheelDeltaY below threshold as trackpad | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#wheeltick-handles-wheeldeltay-below-threshold-as-trackpad) |
| WheelTick isTick boundary at exactly 1 | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors#wheeltick-istick-boundary-at-exactly-1) |

### tools/behaviors/drawDragBehavior

| Test | Result | Requirement | Code |
| --- | :---: | --- | --- |
| DrawDragBehavior extends DragBehavior / EventTarget | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors/drawDragBehavior#drawdragbehavior-extends-dragbehavior-eventtarget) |
| canStart is false until a two-point shape is configured | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors/drawDragBehavior#canstart-is-false-until-a-two-point-shape-is-configured) |
| setOptions / setFeatures forward to preview | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors/drawDragBehavior#setoptions-setfeatures-forward-to-preview) |
| onStart dispatches warn when placement cannot begin | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors/drawDragBehavior#onstart-dispatches-warn-when-placement-cannot-begin) |
| onStart calls shapeHandler and activates drag when placement begins | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors/drawDragBehavior#onstart-calls-shapehandler-and-activates-drag-when-placement-begins) |
| resetPlacement clears drag active state | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors/drawDragBehavior#resetplacement-clears-drag-active-state) |
| onDrag skips preview when plane point is invalid | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors/drawDragBehavior#ondrag-skips-preview-when-plane-point-is-invalid) |
| drag session creates a valid rectangle after start, move, end | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors/drawDragBehavior#drag-session-creates-a-valid-rectangle-after-start-move-end) |

### tools/behaviors/drawPreview

| Test | Result | Requirement | Code |
| --- | :---: | --- | --- |
| hasShape is false before setOptions | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors/drawPreview#hasshape-is-false-before-setoptions) |
| setOptions and setFeatures register shape and getNPoints | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors/drawPreview#setoptions-and-setfeatures-register-shape-and-getnpoints) |
| setFeatures throws for unknown shape name | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors/drawPreview#setfeatures-throws-for-unknown-shape-name) |
| tryBeginPlacement returns false when shape is not configured | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors/drawPreview#trybeginplacement-returns-false-when-shape-is-not-configured) |
| tryBeginPlacement returns true when draw layer exists and shape is set | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors/drawPreview#trybeginplacement-returns-true-when-draw-layer-exists-and-shape-is-set) |
| getCannotCreateReason mentions base data when base image is resampled | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors/drawPreview#getcannotcreatereason-mentions-base-data-when-base-image-is-resampled) |
| getCannotCreateReason mentions reference when ref validator fails | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors/drawPreview#getcannotcreatereason-mentions-reference-when-ref-validator-fails) |
| resetPlacement does not throw when no preview exists | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors/drawPreview#resetplacement-does-not-throw-when-no-preview-exists) |
| RectangleFactory registers via setOptions | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors/drawPreview#rectanglefactory-registers-via-setoptions) |
| onFinalPoints creates a valid rectangle annotation end-to-end | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors/drawPreview#onfinalpoints-creates-a-valid-rectangle-annotation-end-to-end) |

### tools/behaviors/drawTapBehavior

| Test | Result | Requirement | Code |
| --- | :---: | --- | --- |
| DrawTapBehavior extends TapBehavior / EventTarget | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors/drawTapBehavior#drawtapbehavior-extends-tapbehavior-eventtarget) |
| hasShape reflects DrawPreview options | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors/drawTapBehavior#hasshape-reflects-drawpreview-options) |
| onTap dispatches warn when draw layer cannot be created | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors/drawTapBehavior#ontap-dispatches-warn-when-draw-layer-cannot-be-created) |
| onTap begins placement and disableAndResetEditor when allowed | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors/drawTapBehavior#ontap-begins-placement-and-disableandreseteditor-when-allowed) |
| resetPlacement clears tap session | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors/drawTapBehavior#resetplacement-clears-tap-session) |
| onUpdate skips preview when plane point is invalid | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors/drawTapBehavior#onupdate-skips-preview-when-plane-point-is-invalid) |
| second tap at same coordinates does not duplicate point | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors/drawTapBehavior#second-tap-at-same-coordinates-does-not-duplicate-point) |
| two taps create a valid rectangle annotation end-to-end | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/behaviors/drawTapBehavior#two-taps-create-a-valid-rectangle-annotation-end-to-end) |

### tools/shapes/arrow

| Test | Result | Requirement | Code |
| --- | :---: | --- | --- |
| ArrowFactory.supports matches ArrowAnnotator.supports | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/shapes/arrow#arrowfactorysupports-matches-arrowannotatorsupports) |
| metadata | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/shapes/arrow#metadata) |
| setAnnotationMathShape sets tip and tail like annotator | ✅ | URS [#DWV-REQ-UI-07-001 (Draw arrow)](/tutorials/user-stories#dwv-req-ui-07-001-draw-arrow) | [jsdoc](/module/tests-tools/shapes/arrow#setannotationmathshape-sets-tip-and-tail-like-annotator) |
| updateAnnotationOnTranslation delegates to annotator | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/shapes/arrow#updateannotationontranslation-delegates-to-annotator) |

### tools

| Test | Result | Requirement | Code |
| --- | :---: | --- | --- |
| BidimensionalFactory Tier 1 - annotation logic supports returns true only for BidimensionalLine | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#bidimensionalfactory-tier-1-annotation-logic-supports-returns-true-only-for-bidimensionalline) |
| BidimensionalFactory Tier 1 - annotation logic getName, getGroupName, getNPoints | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#bidimensionalfactory-tier-1-annotation-logic-getname-getgroupname-getnpoints) |
| BidimensionalFactory Tier 1 - annotation logic setAnnotationMathShape stores a BidimensionalLine | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#bidimensionalfactory-tier-1-annotation-logic-setannotationmathshape-stores-a-bidimensionalline) |
| BidimensionalFactory Tier 1 - annotation logic setAnnotationMathShape initialises short axis to half length | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#bidimensionalfactory-tier-1-annotation-logic-setannotationmathshape-initialises-short-axis-to-half-length) |
| BidimensionalFactory Tier 1 - annotation logic setAnnotationMathShape sets shortAxisT = 0.5 | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#bidimensionalfactory-tier-1-annotation-logic-setannotationmathshape-sets-shortaxist-05) |
| BidimensionalFactory Tier 1 - annotation logic setAnnotationMathShape sets shortAxisCenter to midpoint | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#bidimensionalfactory-tier-1-annotation-logic-setannotationmathshape-sets-shortaxiscenter-to-midpoint) |
| BidimensionalFactory Tier 1 - annotation logic setAnnotationMathShape calls setTextExpr and updateQuantification | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#bidimensionalfactory-tier-1-annotation-logic-setannotationmathshape-calls-settextexpr-and-updatequantification) |
| BidimensionalFactory Tier 1 - annotation logic getPointAlongLine: t=0 returns begin, t=1 returns end | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#bidimensionalfactory-tier-1-annotation-logic-getpointalongline-t0-returns-begin-t1-returns-end) |
| BidimensionalFactory Tier 1 - annotation logic getPointAlongLine: t=0.5 returns midpoint | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#bidimensionalfactory-tier-1-annotation-logic-getpointalongline-t05-returns-midpoint) |
| BidimensionalFactory Tier 1 - annotation logic getShortAxisEndpoints: symmetric perpendicular endpoints | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#bidimensionalfactory-tier-1-annotation-logic-getshortaxisendpoints-symmetric-perpendicular-endpoints) |
| BidimensionalFactory Tier 1 - annotation logic getShortAxisEndpoints: asymmetric L1/L2 | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#bidimensionalfactory-tier-1-annotation-logic-getshortaxisendpoints-asymmetric-l1l2) |
| BidimensionalFactory Tier 1 - annotation logic getShortAxisEndpoints: zero-length line returns mid,mid | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#bidimensionalfactory-tier-1-annotation-logic-getshortaxisendpoints-zero-length-line-returns-midmid) |
| BidimensionalFactory Tier 1 - annotation logic updateAnnotationOnTranslation shifts begin, end and center | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#bidimensionalfactory-tier-1-annotation-logic-updateannotationontranslation-shifts-begin-end-and-center) |
| BidimensionalFactory Tier 1 - annotation logic updateAnnotationOnTranslation preserves short axis scalars | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#bidimensionalfactory-tier-1-annotation-logic-updateannotationontranslation-preserves-short-axis-scalars) |
| BidimensionalFactory Tier 2 - Konva rendering createShapeGroup has correct name, id and visibility | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#bidimensionalfactory-tier-2-konva-rendering-createshapegroup-has-correct-name-id-and-visibility) |
| BidimensionalFactory Tier 2 - Konva rendering createShapeGroup has 8 children | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#bidimensionalfactory-tier-2-konva-rendering-createshapegroup-has-8-children) |
| BidimensionalFactory Tier 2 - Konva rendering createShapeGroup contains all named child shapes | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#bidimensionalfactory-tier-2-konva-rendering-createshapegroup-contains-all-named-child-shapes) |
| BidimensionalFactory Tier 2 - Konva rendering createShapeGroup main axis has correct points | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#bidimensionalfactory-tier-2-konva-rendering-createshapegroup-main-axis-has-correct-points) |
| BidimensionalFactory Tier 2 - Konva rendering createShapeGroup short axis has correct initial points | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#bidimensionalfactory-tier-2-konva-rendering-createshapegroup-short-axis-has-correct-initial-points) |
| BidimensionalFactory Tier 2 - Konva rendering short axis is dashed before any interaction | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#bidimensionalfactory-tier-2-konva-rendering-short-axis-is-dashed-before-any-interaction) |
| BidimensionalFactory Tier 2 - Konva rendering short axis is solid after hasShortAxisInteraction is true | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#bidimensionalfactory-tier-2-konva-rendering-short-axis-is-solid-after-hasshortaxisinteraction-is-true) |
| BidimensionalFactory Tier 2 - Konva rendering getAnchors returns 4 anchors | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#bidimensionalfactory-tier-2-konva-rendering-getanchors-returns-4-anchors) |
| BidimensionalFactory Tier 2 - Konva rendering getAnchors anchor0/anchor1 are at long axis endpoints | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#bidimensionalfactory-tier-2-konva-rendering-getanchors-anchor0anchor1-are-at-long-axis-endpoints) |
| BidimensionalFactory Tier 2 - Konva rendering getAnchors anchor2/anchor3 are at short axis endpoints | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#bidimensionalfactory-tier-2-konva-rendering-getanchors-anchor2anchor3-are-at-short-axis-endpoints) |
| BidimensionalFactory Tier 2 - Konva rendering constrainAnchorMove is no-op for long axis anchors | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#bidimensionalfactory-tier-2-konva-rendering-constrainanchormove-is-no-op-for-long-axis-anchors) |
| BidimensionalFactory Tier 2 - Konva rendering constrainAnchorMove updates shortAxisT and L1 for anchor2 | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#bidimensionalfactory-tier-2-konva-rendering-constrainanchormove-updates-shortaxist-and-l1-for-anchor2) |
| BidimensionalFactory Tier 2 - Konva rendering constrainAnchorMove updates L2 for anchor3 | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#bidimensionalfactory-tier-2-konva-rendering-constrainanchormove-updates-l2-for-anchor3) |
| BidimensionalFactory Tier 2 - Konva rendering updateAnnotationOnAnchorMove updates long axis from anchors | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#bidimensionalfactory-tier-2-konva-rendering-updateannotationonanchormove-updates-long-axis-from-anchors) |
| BidimensionalFactory Tier 2 - Konva rendering updateAnnotationOnAnchorMove preserves short axis L1/L2 | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#bidimensionalfactory-tier-2-konva-rendering-updateannotationonanchormove-preserves-short-axis-l1l2) |
| BidimensionalFactory Tier 2 - Konva rendering updateAnnotationOnAnchorMove ignores orphaned anchor | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#bidimensionalfactory-tier-2-konva-rendering-updateannotationonanchormove-ignores-orphaned-anchor) |
| BidimensionalFactory Tier 2 - Konva rendering updateShapeGroupOnAnchorMove updates main axis after anchor0 move | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#bidimensionalfactory-tier-2-konva-rendering-updateshapegrouponanchormove-updates-main-axis-after-anchor0-move) |
| BidimensionalFactory Tier 2 - Konva rendering updateShortAxisToSolid removes the dash from short axis | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#bidimensionalfactory-tier-2-konva-rendering-updateshortaxistosolid-removes-the-dash-from-short-axis) |
| BidimensionalFactory Tier 2 - Konva rendering updateLabelContent delegates to labelFactory | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#bidimensionalfactory-tier-2-konva-rendering-updatelabelcontent-delegates-to-labelfactory) |
| BidimensionalFactory Tier 2 - Konva rendering updateConnector updates the connector line | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#bidimensionalfactory-tier-2-konva-rendering-updateconnector-updates-the-connector-line) |
| RectangleAnnotator supports: true for Rectangle, false for others | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#rectangleannotator-supports-true-for-rectangle-false-for-others) |
| RectangleAnnotator metadata | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#rectangleannotator-metadata) |
| RectangleAnnotator isComplete always true | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#rectangleannotator-iscomplete-always-true) |
| RectangleAnnotator setAnnotationMathShape creates Rectangle from 2 points | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#rectangleannotator-setannotationmathshape-creates-rectangle-from-2-points) |
| RectangleAnnotator setAnnotationMathShape normalises flipped coords | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#rectangleannotator-setannotationmathshape-normalises-flipped-coords) |
| RectangleAnnotator setAnnotationMathShape calls hooks | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#rectangleannotator-setannotationmathshape-calls-hooks) |
| RectangleAnnotator setAnnotationMathShape sets default label {surface} | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#rectangleannotator-setannotationmathshape-sets-default-label-surface) |
| RectangleAnnotator updateAnnotationOnTranslation shifts both corners | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#rectangleannotator-updateannotationontranslation-shifts-both-corners) |
| RectangleAnnotator constrainAnchorMove is a no-op | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#rectangleannotator-constrainanchormove-is-a-no-op) |
| RectangleAnnotator updateAnnotationOnAnchorMove rebuilds Rectangle from corners | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#rectangleannotator-updateannotationonanchormove-rebuilds-rectangle-from-corners) |
| RectangleAnnotator getAnchors returns 4 corners | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#rectangleannotator-getanchors-returns-4-corners) |
| CircleAnnotator supports: true for Circle, false for others | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#circleannotator-supports-true-for-circle-false-for-others) |
| CircleAnnotator metadata | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#circleannotator-metadata) |
| CircleAnnotator setAnnotationMathShape from center + edge point | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#circleannotator-setannotationmathshape-from-center-edge-point) |
| CircleAnnotator setAnnotationMathShape radius is Euclidean distance (3-4-5) | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#circleannotator-setannotationmathshape-radius-is-euclidean-distance-3-4-5) |
| CircleAnnotator setAnnotationMathShape calls hooks | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#circleannotator-setannotationmathshape-calls-hooks) |
| CircleAnnotator setAnnotationMathShape sets default label {surface} | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#circleannotator-setannotationmathshape-sets-default-label-surface) |
| CircleAnnotator updateAnnotationOnTranslation shifts center, keeps radius | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#circleannotator-updateannotationontranslation-shifts-center-keeps-radius) |
| CircleAnnotator constrainAnchorMove locks horizontal anchors to same y | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#circleannotator-constrainanchormove-locks-horizontal-anchors-to-same-y) |
| CircleAnnotator constrainAnchorMove locks vertical anchors to same x | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#circleannotator-constrainanchormove-locks-vertical-anchors-to-same-x) |
| CircleAnnotator updateAnnotationOnAnchorMove updates radius | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#circleannotator-updateannotationonanchormove-updates-radius) |
| CircleAnnotator getAnchors returns 4 cardinal points | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#circleannotator-getanchors-returns-4-cardinal-points) |
| EllipseAnnotator supports: true for Ellipse, false for others | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#ellipseannotator-supports-true-for-ellipse-false-for-others) |
| EllipseAnnotator metadata | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#ellipseannotator-metadata) |
| EllipseAnnotator setAnnotationMathShape computes a and b from two points | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#ellipseannotator-setannotationmathshape-computes-a-and-b-from-two-points) |
| EllipseAnnotator setAnnotationMathShape calls hooks | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#ellipseannotator-setannotationmathshape-calls-hooks) |
| EllipseAnnotator setAnnotationMathShape sets default label {surface} | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#ellipseannotator-setannotationmathshape-sets-default-label-surface) |
| EllipseAnnotator updateAnnotationOnTranslation shifts center, keeps radii | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#ellipseannotator-updateannotationontranslation-shifts-center-keeps-radii) |
| EllipseAnnotator constrainAnchorMove locks horizontal anchors | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#ellipseannotator-constrainanchormove-locks-horizontal-anchors) |
| EllipseAnnotator constrainAnchorMove locks vertical anchors | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#ellipseannotator-constrainanchormove-locks-vertical-anchors) |
| EllipseAnnotator updateAnnotationOnAnchorMove anchor0 updates radiusX | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#ellipseannotator-updateannotationonanchormove-anchor0-updates-radiusx) |
| EllipseAnnotator updateAnnotationOnAnchorMove anchor2 updates radiusY | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#ellipseannotator-updateannotationonanchormove-anchor2-updates-radiusy) |
| EllipseAnnotator getAnchors returns 4 cardinal points | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#ellipseannotator-getanchors-returns-4-cardinal-points) |
| RulerAnnotator supports: true for Line, false for others | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#rulerannotator-supports-true-for-line-false-for-others) |
| RulerAnnotator metadata | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#rulerannotator-metadata) |
| RulerAnnotator setAnnotationMathShape stores a Line from 2 points | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#rulerannotator-setannotationmathshape-stores-a-line-from-2-points) |
| RulerAnnotator setAnnotationMathShape sets default label {length} | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#rulerannotator-setannotationmathshape-sets-default-label-length) |
| RulerAnnotator constrainAnchorMove is a no-op | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#rulerannotator-constrainanchormove-is-a-no-op) |
| RulerAnnotator updateAnnotationOnTranslation shifts both endpoints | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#rulerannotator-updateannotationontranslation-shifts-both-endpoints) |
| RulerAnnotator updateAnnotationOnAnchorMove: anchor1 updates end | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#rulerannotator-updateannotationonanchormove-anchor1-updates-end) |
| RulerAnnotator updateAnnotationOnAnchorMove: anchor0 updates begin | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#rulerannotator-updateannotationonanchormove-anchor0-updates-begin) |
| RulerAnnotator getAnchors returns [begin, end] | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#rulerannotator-getanchors-returns-begin-end) |
| ArrowAnnotator supports: true for Point2D, false for others | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#arrowannotator-supports-true-for-point2d-false-for-others) |
| ArrowAnnotator metadata | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#arrowannotator-metadata) |
| ArrowAnnotator setAnnotationMathShape sets mathShape and referencePoints | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#arrowannotator-setannotationmathshape-sets-mathshape-and-referencepoints) |
| ArrowAnnotator setAnnotationMathShape sets default label empty string | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#arrowannotator-setannotationmathshape-sets-default-label-empty-string) |
| ArrowAnnotator constrainAnchorMove is a no-op | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#arrowannotator-constrainanchormove-is-a-no-op) |
| ArrowAnnotator updateAnnotationOnTranslation shifts both endpoints | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#arrowannotator-updateannotationontranslation-shifts-both-endpoints) |
| ArrowAnnotator updateAnnotationOnAnchorMove: anchor0 updates tip | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#arrowannotator-updateannotationonanchormove-anchor0-updates-tip) |
| ArrowAnnotator updateAnnotationOnAnchorMove: anchor1 updates tail | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#arrowannotator-updateannotationonanchormove-anchor1-updates-tail) |
| ArrowAnnotator getAnchors returns [tip, tail] | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#arrowannotator-getanchors-returns-tip-tail) |
| RoiAnnotator supports: true for ROI, false for others | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#roiannotator-supports-true-for-roi-false-for-others) |
| RoiAnnotator metadata | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#roiannotator-metadata) |
| RoiAnnotator setAnnotationMathShape stores all points as ROI | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#roiannotator-setannotationmathshape-stores-all-points-as-roi) |
| RoiAnnotator setAnnotationMathShape sets default label empty string | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#roiannotator-setannotationmathshape-sets-default-label-empty-string) |
| RoiAnnotator constrainAnchorMove is a no-op | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#roiannotator-constrainanchormove-is-a-no-op) |
| RoiAnnotator updateAnnotationOnTranslation shifts all points | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#roiannotator-updateannotationontranslation-shifts-all-points) |
| RoiAnnotator updateAnnotationOnAnchorMove updates only the moved vertex | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#roiannotator-updateannotationonanchormove-updates-only-the-moved-vertex) |
| RoiAnnotator getAnchors returns one position per vertex | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#roiannotator-getanchors-returns-one-position-per-vertex) |
| ProtractorAnnotator supports: true for Protractor, false for others | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#protractorannotator-supports-true-for-protractor-false-for-others) |
| ProtractorAnnotator metadata | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#protractorannotator-metadata) |
| ProtractorAnnotator isComplete: true for 3 points, false for 2 | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#protractorannotator-iscomplete-true-for-3-points-false-for-2) |
| ProtractorAnnotator setAnnotationMathShape stores all 3 points | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#protractorannotator-setannotationmathshape-stores-all-3-points) |
| ProtractorAnnotator setAnnotationMathShape sets default label {angle} | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#protractorannotator-setannotationmathshape-sets-default-label-angle) |
| ProtractorAnnotator constrainAnchorMove is a no-op | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#protractorannotator-constrainanchormove-is-a-no-op) |
| ProtractorAnnotator updateAnnotationOnTranslation shifts all 3 points | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#protractorannotator-updateannotationontranslation-shifts-all-3-points) |
| ProtractorAnnotator updateAnnotationOnAnchorMove: anchor0 updates point 0 | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#protractorannotator-updateannotationonanchormove-anchor0-updates-point-0) |
| ProtractorAnnotator getAnchors returns 3 points | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#protractorannotator-getanchors-returns-3-points) |
| shapePainters RectanglePainter createShape returns Konva.Rect with geometry | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#shapepainters-rectanglepainter-createshape-returns-konvarect-with-geometry) |
| shapePainters RectanglePainter updateShape updates position and size | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#shapepainters-rectanglepainter-updateshape-updates-position-and-size) |
| shapePainters RectanglePainter createExtras returns empty array | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#shapepainters-rectanglepainter-createextras-returns-empty-array) |
| shapePainters CirclePainter createShape returns Konva.Circle with center/radius | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#shapepainters-circlepainter-createshape-returns-konvacircle-with-centerradius) |
| shapePainters CirclePainter updateShape updates radius (center is immutable) | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#shapepainters-circlepainter-updateshape-updates-radius-center-is-immutable) |
| shapePainters CirclePainter createExtras returns empty array | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#shapepainters-circlepainter-createextras-returns-empty-array) |
| shapePainters EllipsePainter createShape returns Konva.Ellipse with radii | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#shapepainters-ellipsepainter-createshape-returns-konvaellipse-with-radii) |
| shapePainters EllipsePainter updateShape updates radii | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#shapepainters-ellipsepainter-updateshape-updates-radii) |
| shapePainters EllipsePainter createExtras returns empty array | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#shapepainters-ellipsepainter-createextras-returns-empty-array) |
| shapePainters RulerPainter createShape returns Konva.Line with 4 flat point values | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#shapepainters-rulerpainter-createshape-returns-konvaline-with-4-flat-point-values) |
| shapePainters RulerPainter updateShape updates line points | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#shapepainters-rulerpainter-updateshape-updates-line-points) |
| shapePainters RulerPainter createExtras returns 2 tick Konva.Lines | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#shapepainters-rulerpainter-createextras-returns-2-tick-konvalines) |
| shapePainters RulerPainter updateExtras repositions ticks in group | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#shapepainters-rulerpainter-updateextras-repositions-ticks-in-group) |
| shapePainters ArrowPainter createShape returns Konva.Line with tip and tail | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#shapepainters-arrowpainter-createshape-returns-konvaline-with-tip-and-tail) |
| shapePainters ArrowPainter updateShape updates line points | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#shapepainters-arrowpainter-updateshape-updates-line-points) |
| shapePainters ArrowPainter createExtras returns 1 triangle Konva.Line | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#shapepainters-arrowpainter-createextras-returns-1-triangle-konvaline) |
| shapePainters RoiPainter createShape returns closed Konva.Line with vertex coords | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#shapepainters-roipainter-createshape-returns-closed-konvaline-with-vertex-coords) |
| shapePainters RoiPainter updateShape updates points | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#shapepainters-roipainter-updateshape-updates-points) |
| shapePainters RoiPainter createExtras returns empty array | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#shapepainters-roipainter-createextras-returns-empty-array) |
| shapePainters ProtractorPainter createShape with 2 points returns Konva.Line (partial) | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#shapepainters-protractorpainter-createshape-with-2-points-returns-konvaline-partial) |
| shapePainters ProtractorPainter createShape with 3 points returns 6-coord Konva.Line | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#shapepainters-protractorpainter-createshape-with-3-points-returns-6-coord-konvaline) |
| shapePainters ProtractorPainter updateShape updates line points | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#shapepainters-protractorpainter-updateshape-updates-line-points) |
| shapePainters ProtractorPainter createExtras with 2-point protractor returns empty array | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#shapepainters-protractorpainter-createextras-with-2-point-protractor-returns-empty-array) |
| shapePainters ProtractorPainter createExtras with 3-point protractor returns arc | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#shapepainters-protractorpainter-createextras-with-3-point-protractor-returns-arc) |
| ShapeRenderer (via factory) Rectangle createShapeGroup returns Konva.Group with name and id | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#shaperenderer-via-factory-rectangle-createshapegroup-returns-konvagroup-with-name-and-id) |
| ShapeRenderer (via factory) Rectangle createShapeGroup has shape, label, connector | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#shaperenderer-via-factory-rectangle-createshapegroup-has-shape-label-connector) |
| ShapeRenderer (via factory) Rectangle createShapeGroup shape is Konva.Rect with correct geometry | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#shaperenderer-via-factory-rectangle-createshapegroup-shape-is-konvarect-with-correct-geometry) |
| ShapeRenderer (via factory) Rectangle getAnchors returns 4 corner Ellipses in order | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#shaperenderer-via-factory-rectangle-getanchors-returns-4-corner-ellipses-in-order) |
| ShapeRenderer (via factory) Rectangle updateShapeGroupOnAnchorMove: anchor0 updates rect | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#shaperenderer-via-factory-rectangle-updateshapegrouponanchormove-anchor0-updates-rect) |
| ShapeRenderer (via factory) Rectangle updateLabelContent updates label text | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#shaperenderer-via-factory-rectangle-updatelabelcontent-updates-label-text) |
| ShapeRenderer (via factory) Rectangle updateConnector does not throw | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#shaperenderer-via-factory-rectangle-updateconnector-does-not-throw) |
| ShapeRenderer (via factory) Circle createShapeGroup shape is Konva.Circle with center/radius | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#shaperenderer-via-factory-circle-createshapegroup-shape-is-konvacircle-with-centerradius) |
| ShapeRenderer (via factory) Circle getAnchors returns 4 cardinal Ellipses | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#shaperenderer-via-factory-circle-getanchors-returns-4-cardinal-ellipses) |
| ShapeRenderer (via factory) Circle updateShapeGroupOnAnchorMove: anchor1 updates radius | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#shaperenderer-via-factory-circle-updateshapegrouponanchormove-anchor1-updates-radius) |
| ShapeRenderer (via factory) Circle updateLabelContent updates label text | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#shaperenderer-via-factory-circle-updatelabelcontent-updates-label-text) |
| ShapeRenderer (via factory) Ellipse createShapeGroup shape is Konva.Ellipse with radii | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#shaperenderer-via-factory-ellipse-createshapegroup-shape-is-konvaellipse-with-radii) |
| ShapeRenderer (via factory) Ellipse getAnchors returns 4 cardinal Ellipses | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#shaperenderer-via-factory-ellipse-getanchors-returns-4-cardinal-ellipses) |
| ShapeRenderer (via factory) Ellipse updateShapeGroupOnAnchorMove: anchor2 (bottom) updates b | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#shaperenderer-via-factory-ellipse-updateshapegrouponanchormove-anchor2-bottom-updates-b) |
| ShapeRenderer (via factory) Ruler createShapeGroup has shape, tick0, tick1, label, connector | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#shaperenderer-via-factory-ruler-createshapegroup-has-shape-tick0-tick1-label-connector) |
| ShapeRenderer (via factory) Ruler createShapeGroup shape is Konva.Line with 4 flat coords | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#shaperenderer-via-factory-ruler-createshapegroup-shape-is-konvaline-with-4-flat-coords) |
| ShapeRenderer (via factory) Ruler getAnchors returns 2 Ellipses at begin and end | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#shaperenderer-via-factory-ruler-getanchors-returns-2-ellipses-at-begin-and-end) |
| ShapeRenderer (via factory) Ruler updateShapeGroupOnAnchorMove updates shape points | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#shaperenderer-via-factory-ruler-updateshapegrouponanchormove-updates-shape-points) |
| ShapeRenderer (via factory) Ruler updateShapeGroupOnAnchorMove updates tick positions | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#shaperenderer-via-factory-ruler-updateshapegrouponanchormove-updates-tick-positions) |
| ShapeRenderer (via factory) Ruler updateLabelContent updates label text | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#shaperenderer-via-factory-ruler-updatelabelcontent-updates-label-text) |
| ShapeRenderer (via factory) Arrow createShapeGroup has shape, triangle, label, connector | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#shaperenderer-via-factory-arrow-createshapegroup-has-shape-triangle-label-connector) |
| ShapeRenderer (via factory) Arrow createShapeGroup shape is Konva.Line with 4 flat coords | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#shaperenderer-via-factory-arrow-createshapegroup-shape-is-konvaline-with-4-flat-coords) |
| ShapeRenderer (via factory) Arrow getAnchors returns 2 Ellipses at tip and tail | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#shaperenderer-via-factory-arrow-getanchors-returns-2-ellipses-at-tip-and-tail) |
| ShapeRenderer (via factory) Arrow updateShapeGroupOnAnchorMove updates shape points | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#shaperenderer-via-factory-arrow-updateshapegrouponanchormove-updates-shape-points) |
| ShapeRenderer (via factory) ROI createShapeGroup shape is closed Konva.Line | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#shaperenderer-via-factory-roi-createshapegroup-shape-is-closed-konvaline) |
| ShapeRenderer (via factory) ROI getAnchors returns one Ellipse per vertex | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#shaperenderer-via-factory-roi-getanchors-returns-one-ellipse-per-vertex) |
| ShapeRenderer (via factory) ROI updateShapeGroupOnAnchorMove updates vertex | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#shaperenderer-via-factory-roi-updateshapegrouponanchormove-updates-vertex) |
| ShapeRenderer (via factory) Protractor createShapeGroup with 3 pts: shape, arc, label, connector | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#shaperenderer-via-factory-protractor-createshapegroup-with-3-pts-shape-arc-label-connector) |
| ShapeRenderer (via factory) Protractor createShapeGroup with 2 pts has only shape child | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#shaperenderer-via-factory-protractor-createshapegroup-with-2-pts-has-only-shape-child) |
| ShapeRenderer (via factory) Protractor createShapeGroup shape has 6 flat point coords | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#shaperenderer-via-factory-protractor-createshapegroup-shape-has-6-flat-point-coords) |
| ShapeRenderer (via factory) Protractor getAnchors returns 3 Ellipses at the 3 points | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#shaperenderer-via-factory-protractor-getanchors-returns-3-ellipses-at-the-3-points) |
| ShapeRenderer (via factory) Protractor updateShapeGroupOnAnchorMove updates shape line | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#shaperenderer-via-factory-protractor-updateshapegrouponanchormove-updates-shape-line) |
| ShapeRenderer (via factory) Protractor updateLabelContent updates label text | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools#shaperenderer-via-factory-protractor-updatelabelcontent-updates-label-text) |

### tools/shapes/circle

| Test | Result | Requirement | Code |
| --- | :---: | --- | --- |
| CircleFactory.supports matches CircleAnnotator.supports | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/shapes/circle#circlefactorysupports-matches-circleannotatorsupports) |
| metadata | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/shapes/circle#metadata) |
| setAnnotationMathShape sets circle from two points like annotator | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/shapes/circle#setannotationmathshape-sets-circle-from-two-points-like-annotator) |
| updateAnnotationOnTranslation delegates to annotator | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/shapes/circle#updateannotationontranslation-delegates-to-annotator) |

### tools/shapes/ellipse

| Test | Result | Requirement | Code |
| --- | :---: | --- | --- |
| EllipseFactory.supports matches EllipseAnnotator.supports | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/shapes/ellipse#ellipsefactorysupports-matches-ellipseannotatorsupports) |
| metadata | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/shapes/ellipse#metadata) |
| setAnnotationMathShape sets ellipse from two points like annotator | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/shapes/ellipse#setannotationmathshape-sets-ellipse-from-two-points-like-annotator) |
| updateAnnotationOnTranslation delegates to annotator | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/shapes/ellipse#updateannotationontranslation-delegates-to-annotator) |

### tools/shapes/protractor

| Test | Result | Requirement | Code |
| --- | :---: | --- | --- |
| ProtractorFactory.supports matches ProtractorAnnotator.supports | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/shapes/protractor#protractorfactorysupports-matches-protractorannotatorsupports) |
| metadata | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/shapes/protractor#metadata) |
| setAnnotationMathShape sets protractor from points like annotator | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/shapes/protractor#setannotationmathshape-sets-protractor-from-points-like-annotator) |
| updateAnnotationOnTranslation delegates to annotator | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/shapes/protractor#updateannotationontranslation-delegates-to-annotator) |

### tools/shapes/rectangle

| Test | Result | Requirement | Code |
| --- | :---: | --- | --- |
| RectangleFactory.supports matches RectangleAnnotator.supports | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/shapes/rectangle#rectanglefactorysupports-matches-rectangleannotatorsupports) |
| metadata | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/shapes/rectangle#metadata) |
| setAnnotationMathShape sets rectangle from two corners like annotator | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/shapes/rectangle#setannotationmathshape-sets-rectangle-from-two-corners-like-annotator) |
| updateAnnotationOnTranslation delegates to annotator | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/shapes/rectangle#updateannotationontranslation-delegates-to-annotator) |

### tools/shapes/roi

| Test | Result | Requirement | Code |
| --- | :---: | --- | --- |
| RoiFactory.supports matches RoiAnnotator.supports | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/shapes/roi#roifactorysupports-matches-roiannotatorsupports) |
| metadata | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/shapes/roi#metadata) |
| setAnnotationMathShape sets ROI from points like annotator | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/shapes/roi#setannotationmathshape-sets-roi-from-points-like-annotator) |
| updateAnnotationOnTranslation delegates to annotator | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/shapes/roi#updateannotationontranslation-delegates-to-annotator) |

### tools/shapes/ruler

| Test | Result | Requirement | Code |
| --- | :---: | --- | --- |
| RulerFactory.supports matches RulerAnnotator.supports | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/shapes/ruler#rulerfactorysupports-matches-rulerannotatorsupports) |
| metadata | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/shapes/ruler#metadata) |
| setAnnotationMathShape sets line from two points like annotator | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/shapes/ruler#setannotationmathshape-sets-line-from-two-points-like-annotator) |
| updateAnnotationOnTranslation delegates to annotator | ✅ | ⚠️ No requirement reference | [jsdoc](/module/tests-tools/shapes/ruler#updateannotationontranslation-delegates-to-annotator) |

## Traceability

### io

| Requirement | Test | Result |
| --- | --- | :---: |
| URS [#DWV-REQ-IO-01-001 (Load DICOM file(s))](/tutorials/user-stories#dwv-req-io-01-001-load-dicom-files) | Simple DICOM parsing | ✅ |
|  | DICOM sequence parsing | ✅ |
|  | Read-write synthetic explicit | ✅ |
|  | Read-write synthetic explicit with rules | ✅ |
|  | Read-write synthetic implicit | ✅ |
|  | Read-write synthetic implicit with rules | ✅ |
|  | Read-write synthetic explicit big endian | ✅ |
|  | Read-write synthetic explicit BE with rules | ✅ |
| URS [#DWV-REQ-IO-01-002 (Load DICOM ZIP file)](/tutorials/user-stories#dwv-req-io-01-002-load-dicom-zip-file) | ⚠️ No tests |  |
| URS [#DWV-REQ-IO-02-001 (Load DICOM discrete URL(s))](/tutorials/user-stories#dwv-req-io-02-001-load-dicom-discrete-urls) | DICOM data loader canloadurl | ✅ |
| URS [#DWV-REQ-IO-02-002 (Load DICOM multipart URL)](/tutorials/user-stories#dwv-req-io-02-002-load-dicom-multipart-url) | Parse multipart | ✅ |
| URS [#DWV-REQ-IO-02-003 (Load DICOM ZIP URL)](/tutorials/user-stories#dwv-req-io-02-003-load-dicom-zip-url) | ZIP loader canloadurl | ✅ |
| URS [#DWV-REQ-IO-02-004 (Load DICOMDIR URL)](/tutorials/user-stories#dwv-req-io-02-004-load-dicomdir-url) | DICOMDIR parsing | ✅ |
| URS [#DWV-REQ-IO-02-005 (Window location URL scheme)](/tutorials/user-stories#dwv-req-io-02-005-window-location-url-scheme) | splitUri | ✅ |
|  | getURIQuery | ✅ |
| URS [#DWV-REQ-IO-02-006 (Load Data Manifest URL)](/tutorials/user-stories#dwv-req-io-02-006-load-data-manifest-url) | Parse Manifest | ✅ |
| URS [#DWV-REQ-IO-03-001 (DICOM data load output)](/tutorials/user-stories#dwv-req-io-03-001-dicom-data-load-output) | ⚠️ No tests |  |
| URS [#DWV-REQ-IO-04-001 (DICOM load start event)](/tutorials/user-stories#dwv-req-io-04-001-dicom-load-start-event) | MemoryLoader events single frame | ✅ |
|  | MemoryLoader events multi frame | ✅ |
|  | MemoryLoader events zip | ✅ |
| URS [#DWV-REQ-IO-04-002 (DICOM load progress event)](/tutorials/user-stories#dwv-req-io-04-002-dicom-load-progress-event) | ⚠️ No tests |  |
| URS [#DWV-REQ-IO-04-003 (DICOM load error event)](/tutorials/user-stories#dwv-req-io-04-003-dicom-load-error-event) | ⚠️ No tests |  |
| URS [#DWV-REQ-IO-04-004 (DICOM load abort event)](/tutorials/user-stories#dwv-req-io-04-004-dicom-load-abort-event) | ⚠️ No tests |  |
| URS [#DWV-REQ-IO-04-005 (DICOM load item event)](/tutorials/user-stories#dwv-req-io-04-005-dicom-load-item-event) | ⚠️ No tests |  |
| URS [#DWV-REQ-IO-04-006 (DICOM load event)](/tutorials/user-stories#dwv-req-io-04-006-dicom-load-event) | ⚠️ No tests |  |
| URS [#DWV-REQ-IO-04-007 (DICOM load end event)](/tutorials/user-stories#dwv-req-io-04-007-dicom-load-end-event) | ⚠️ No tests |  |
| URS [#DWV-REQ-IO-05-001 (Write DICOM file)](/tutorials/user-stories#dwv-req-io-05-001-write-dicom-file) | Write multiframe | ✅ |
| URS [#DWV-REQ-IO-05-002 (Write anonymised DICOM file)](/tutorials/user-stories#dwv-req-io-05-002-write-anonymised-dicom-file) | Write anonymised | ✅ |
|  | Write anonymised and add tags | ✅ |
| URS [#DWV-REQ-IO-05-003 (Write DICOM SEG)](/tutorials/user-stories#dwv-req-io-05-003-write-dicom-seg) | toDicom: non-overlapping squares round-trip | ✅ |
|  | toDicom: overlapping squares round-trip | ✅ |
| URS [#DWV-REQ-IO-05-004 (Write DICOM RTSTRUCT)](/tutorials/user-stories#dwv-req-io-05-004-write-dicom-rtstruct) | toDicom: non-overlapping squares round-trip | ✅ |
|  | toDicom: square with hole round-trip preserves the hole | ✅ |
| URS [#DWV-REQ-IO-05-005 (Write DICOM SR annotations)](/tutorials/user-stories#dwv-req-io-05-005-write-dicom-sr-annotations) | ⚠️ No tests |  |
| URS [#DWV-REQ-IO-06-001 (Load DICOM SEG)](/tutorials/user-stories#dwv-req-io-06-001-load-dicom-seg) | create: non-overlapping squares pixel values in label map | ✅ |
|  | create: non-overlapping squares segment collection | ✅ |
| URS [#DWV-REQ-IO-06-002 (Load DICOM RTSTRUCT)](/tutorials/user-stories#dwv-req-io-06-002-load-dicom-rtstruct) | create: non-overlapping squares pixel values in label map | ✅ |
|  | create: non-overlapping squares segment collection | ✅ |
|  | create: square with hole punches out the hole | ✅ |
| URS [#DWV-REQ-IO-06-003 (Load DICOM SR annotations)](/tutorials/user-stories#dwv-req-io-06-003-load-dicom-sr-annotations) | Read tid1500 v0 arrow | ✅ |
|  | Read tid1500 v0 circle | ✅ |
|  | Read tid1500 v0 ellipse | ✅ |
|  | Read tid1500 v0 protractor | ✅ |
|  | Read tid1500 v0 rectangle | ✅ |
|  | Read tid1500 v0 roi | ✅ |
|  | Read tid1500 v0 ruler | ✅ |
|  | Read tid1500 v0 bidimensional | ✅ |
| URS [#DWV-REQ-IO-07-001 (Load multi-volume data)](/tutorials/user-stories#dwv-req-io-07-001-load-multi-volume-data) | DataController builds multi-frame files with multiple volumes | ✅ |
|  | DicomSliceDataList buildData guesses volume id tag | ✅ |
|  | multi-volume frames: unsorted multiframe multi-volume frames image: slices and volumes | ✅ |
|  | multi-volume frames: unsorted multiframe multi-volume b-value frames image: slices and volumes | ✅ |

### ui

| Requirement | Test | Result |
| --- | --- | :---: |
| URS [#DWV-REQ-UI-01-001 (Integration in web application)](/tutorials/user-stories#dwv-req-ui-01-001-integration-in-web-application) | ⚠️ No tests |  |
| URS [#DWV-REQ-UI-02-001 (Display image)](/tutorials/user-stories#dwv-req-ui-02-001-display-image) | Generate data MONO | ✅ |
|  | Generate data MONO with RSI | ✅ |
|  | Generate data MONO float | ✅ |
|  | Generate data MONO int32 | ✅ |
|  | Generate data MONO no bits stored | ✅ |
|  | Generate data RGB | ✅ |
|  | Generate data timing | ✅ |
| URS [#DWV-REQ-UI-02-002 (Image reorientation)](/tutorials/user-stories#dwv-req-ui-02-002-image-reorientation) | ⚠️ No tests |  |
| URS [#DWV-REQ-UI-02-003 (Image overlay)](/tutorials/user-stories#dwv-req-ui-02-003-image-overlay) | ⚠️ No tests |  |
| URS [#DWV-REQ-UI-02-004 (Display segmentation)](/tutorials/user-stories#dwv-req-ui-02-004-display-segmentation) | MaskSegmentViewHelper addToHidden makes segment hidden | ✅ |
|  | MaskSegmentViewHelper removeFromHidden unhides a segment | ✅ |
| URS [#DWV-REQ-UI-02-005 (Display annotations)](/tutorials/user-stories#dwv-req-ui-02-005-display-annotations) | ⚠️ No tests |  |
| URS [#DWV-REQ-UI-03-001 (Change image window/level)](/tutorials/user-stories#dwv-req-ui-03-001-change-image-windowlevel) | View wlchange event | ✅ |
| URS [#DWV-REQ-UI-03-002 (Change image position)](/tutorials/user-stories#dwv-req-ui-03-002-change-image-position) | ⚠️ No tests |  |
| URS [#DWV-REQ-UI-03-003 (Change image zoom/pan)](/tutorials/user-stories#dwv-req-ui-03-003-change-image-zoompan) | ⚠️ No tests |  |
| URS [#DWV-REQ-UI-03-004 (Change image opacity)](/tutorials/user-stories#dwv-req-ui-03-004-change-image-opacity) | ⚠️ No tests |  |
| URS [#DWV-REQ-UI-03-005 (Change image volume)](/tutorials/user-stories#dwv-req-ui-03-005-change-image-volume) | ScrollDragBehavior onDrag increments dimension 3 when dx > 0 and moreThanOne(3) | ✅ |
|  | ScrollWheelBehavior onWheelTick increments dimension 3 when up=true and moreThanOne(3) | ✅ |
| URS [#DWV-REQ-UI-04-001 (Views window/level synchronisation)](/tutorials/user-stories#dwv-req-ui-04-001-views-windowlevel-synchronisation) | ⚠️ No tests |  |
| URS [#DWV-REQ-UI-04-002 (Views position synchronisation)](/tutorials/user-stories#dwv-req-ui-04-002-views-position-synchronisation) | ⚠️ No tests |  |
| URS [#DWV-REQ-UI-04-003 (Views zoom/pan synchronisation)](/tutorials/user-stories#dwv-req-ui-04-003-views-zoompan-synchronisation) | ⚠️ No tests |  |
| URS [#DWV-REQ-UI-04-004 (Views opacity synchronisation)](/tutorials/user-stories#dwv-req-ui-04-004-views-opacity-synchronisation) | ⚠️ No tests |  |
| URS [#DWV-REQ-UI-05-001 (Window/Level tool)](/tutorials/user-stories#dwv-req-ui-05-001-windowlevel-tool) | WindowLevelDoubleClickBehavior onDoubleClick sets window center from clicked pixel | ✅ |
|  | WindowLevelDragBehavior onDrag updates window level with dy delta | ✅ |
| URS [#DWV-REQ-UI-05-002 (Window/Level presets)](/tutorials/user-stories#dwv-req-ui-05-002-windowlevel-presets) | ⚠️ No tests |  |
| URS [#DWV-REQ-UI-05-003 (Slice scroll tool)](/tutorials/user-stories#dwv-req-ui-05-003-slice-scroll-tool) | ScrollDragBehavior onDrag decrements scroll when dy > 0 and canScroll | ✅ |
|  | ScrollWheelBehavior onWheelTick increments scroll when up=true and canScroll | ✅ |
| URS [#DWV-REQ-UI-05-004 (Zoom/Pan tool)](/tutorials/user-stories#dwv-req-ui-05-004-zoompan-tool) | PanDragBehavior onDrag translates using display deltas in plane space | ✅ |
|  | ZoomScrollTwoTouchBehavior onUpdate zooms when line length ratio != 1 | ✅ |
|  | ZoomWheelBehavior onWheel zooms when layerGroup is defined | ✅ |
| URS [#DWV-REQ-UI-05-005 (Opacity tool)](/tutorials/user-stories#dwv-req-ui-05-005-opacity-tool) | OpacityDragBehavior onDrag updates opacity when thresholdX passes | ✅ |
| URS [#DWV-REQ-UI-06-001 (Image thresholding)](/tutorials/user-stories#dwv-req-ui-06-001-image-thresholding) | ThresholdFilter replaces out-of-range values with imageMin | ✅ |
| URS [#DWV-REQ-UI-06-002 (Image contrast enhancement)](/tutorials/user-stories#dwv-req-ui-06-002-image-contrast-enhancement) | SharpenFilter amplifies isolated centre pixel by factor 5 | ✅ |
| URS [#DWV-REQ-UI-06-003 (Image contour extraction)](/tutorials/user-stories#dwv-req-ui-06-003-image-contour-extraction) | SobelFilter detects a vertical step edge | ✅ |
| URS [#DWV-REQ-UI-07-001 (Draw arrow)](/tutorials/user-stories#dwv-req-ui-07-001-draw-arrow) | setAnnotationMathShape sets tip and tail like annotator | ✅ |
| URS [#DWV-REQ-UI-07-002 (Draw circle)](/tutorials/user-stories#dwv-req-ui-07-002-draw-circle) | Circle class | ✅ |
|  | Circle quantification | ✅ |
| URS [#DWV-REQ-UI-07-003 (Draw ellipse)](/tutorials/user-stories#dwv-req-ui-07-003-draw-ellipse) | Ellipse class | ✅ |
|  | Ellipse quantification | ✅ |
| URS [#DWV-REQ-UI-07-004 (Draw free hand)](/tutorials/user-stories#dwv-req-ui-07-004-draw-free-hand) | Path class | ✅ |
| URS [#DWV-REQ-UI-07-005 (Draw protractor)](/tutorials/user-stories#dwv-req-ui-07-005-draw-protractor) | Angle between lines | ✅ |
|  | Protractor class | ✅ |
|  | Protractor quantification | ✅ |
| URS [#DWV-REQ-UI-07-006 (Draw rectangle)](/tutorials/user-stories#dwv-req-ui-07-006-draw-rectangle) | Rectangle class | ✅ |
|  | Rectangle quantification | ✅ |
| URS [#DWV-REQ-UI-07-007 (Draw ruler)](/tutorials/user-stories#dwv-req-ui-07-007-draw-ruler) | Line class | ✅ |
| URS [#DWV-REQ-UI-07-008 (Draw ROI)](/tutorials/user-stories#dwv-req-ui-07-008-draw-roi) | ROI class | ✅ |
| URS [#DWV-REQ-UI-08-001 (Draw delete)](/tutorials/user-stories#dwv-req-ui-08-001-draw-delete) | Delete removes annotation via undo stack | ✅ |
| URS [#DWV-REQ-UI-08-002 (Draw action undo/redo)](/tutorials/user-stories#dwv-req-ui-08-002-draw-action-undoredo) | UndoStack | ✅ |
| URS [#DWV-REQ-UI-09-001 (Livewire)](/tutorials/user-stories#dwv-req-ui-09-001-livewire) | ⚠️ No tests |  |
| URS [#DWV-REQ-UI-09-002 (Floodfill)](/tutorials/user-stories#dwv-req-ui-09-002-floodfill) | ⚠️ No tests |  |

