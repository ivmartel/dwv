# AGENTS.md

This file provides guidance to AI agents when working with code in this repository.

## Project

DWV (DICOM Web Viewer) is a zero-footprint, pure-JavaScript/HTML5 medical image
viewer library. It parses and renders DICOM (and some non-DICOM) data and
provides tools for manipulation (scroll, window/level, zoom, pan, MPR,
annotation, filters). Not certified for diagnostic use. Licensed GPL-3.0.

Package manager is `yarn` (yarn v4, `packageManager` pinned in package.json).
`corepack enable` is enough to get the right yarn version; npm also works for
all scripts. Node >= 14 required (CI uses Node 24). Module type is `"module"`
(ESM throughout `src/`).

## Commands

- `yarn install` — install dependencies.
- `yarn start` — webpack-dev-server (`config/webpack.dev.js`), opens example
  pages, including the `dev/pacs/viewer.html` test viewer.
- `yarn test` — run tests with vitest in watch mode.
- `yarn test-ci` — one-shot vitest run with coverage (v8 provider, thresholds
  50% statements/branches/functions/lines); this is what CI runs.
- Run a single test file: `yarn vitest run tests/image/image.test.js`
- Run tests matching a name: `yarn vitest run -t "some test name"`
- `yarn lint` — eslint over `src/**/*.js`, `tests/**/*.js`, `*.js` using
  `config/eslint.config-full.js` (a superset of the root `eslint.config.js`,
  adds jsdoc rules).
- `yarn build` — `pack` (webpack prod bundle) + `types` (tsc-generated `.d.ts`
  via `resources/api/tsconfig.json`) + `api` (api-extractor, checked against
  `resources/api/dwv.api.md`).
- `yarn build-all` — `build` + `pack-node` (Node-targeted bundle,
  `config/webpack.node.js`).
- `yarn build-demo` — builds the demo pages (`config/webpack.demo.js`), used
  by CI to publish to `gh-pages`.
- `yarn doc` — generates jsdoc site (`resources/doc/jsdoc.conf.json`).

Tests live in `tests/<area>/*.test.js` mirroring `src/<area>/`, using vitest
with `environment: 'node'` (jsdom pulled in as needed) and DICOM/zip/DICOMDIR
fixtures under `tests/data`.

## Requirements traceability

User stories/requirements (`DWV-REQ-<GROUP>-<NN>-<NNN>`) are defined in
`resources/doc/user-stories.json` (`{id, name, group, description}`) — this
JSON is the source of truth, **not**
`resources/doc/tutorials/user-stories.md`, which is a generated file (see
below) and gets overwritten.

Tests opt into traceability by suffixing their name with
`- #<id> <name>`, e.g. in `tests/command/undoStack.test.js`:
`test('UndoStack - #DWV-REQ-UI-08-002 Draw action undo/redo', ...)`. Both the
id and the name after `#` must match a `user-stories.json` entry *verbatim*
(exact string equality) or the reference is reported as unresolved. Not
every test needs a requirement reference — only ones demonstrating a
specific user story.

The link is materialized by a separate sibling tool,
[jsonqa2md](https://github.com/ivmartel/jsonqa2md) (cloned alongside this
repo, not vendored in `src/`/`node_modules`), run manually as part of
`resources/scripts/prep-release.sh` step 5:

1. `yarn test-ci` (vitest `--reporter json`) writes `build/test-results.json`.
2. `node ../jsonqa2md/jsonqa2md` reads that plus `user-stories.json` and
   regenerates both `resources/doc/tutorials/user-stories.md` (with
   `⚠️` warnings for duplicate ids/names within a group) and
   `resources/doc/tutorials/test-results.md` (per-test pass/fail plus a
   traceability matrix of which requirements have tests, and whether they
   pass).

When adding a new requirement or wiring a test to one: edit
`resources/doc/user-stories.json`, not the `.md` files.

## Architecture

Library entry point `src/index.js` re-exports each subsystem's own
`index.js` (`app`, `command`, `dicom`, `gui`, `image`, `math`, `tools`,
`utils`). Everything uses native `EventTarget`/`CustomEvent` for
communication — controllers re-listen to their children's events and
re-dispatch them upward, so most state changes eventually surface as an
event on the top-level `App`.

### App and its controllers (`src/app/`)

`App` (`application.js`) is the public facade and central event bus, but it
does not do the work itself: `App.init()` creates and wires five
controllers, and most of `App`'s own methods are now thin,
**deprecated-since-v0.37** forwarding wrappers — the controllers, reachable
via `app.getLoadController()`/`getDataController()`/etc., are the current
recommended API.

- `LoadController` — picks `FilesLoader`/`UrlsLoader`/`MemoryLoader` based on
  input type, re-dispatches their load events tagged with `{dataid,
  loadtype}`. `loadtype` is `'image'` or `'state'` (legacy `.json` app state).
- `DataController` — owns `#dataList: Record<dataId, DicomData>`. Its
  `#setDataContent` inspects Modality/pixel-data presence to route parsed
  data to `ImageFactory`, `MaskFactory` (Modality `SEG`), `AnnotationGroupFactory`
  (Modality `SR`), or `RtStructFactory` (Modality `RTSTRUCT`, rasterizes
  contours against an already-loaded reference series). Also handles
  multi-volume/4D data via `DicomSliceDataList`, buffering same-origin slices
  until load completes.
- `StageController` — owns the single `Stage` (all `LayerGroup`s/layers).
  Creates `View`s via `ViewFactory` at render time (one `View` per
  layer/layer-group, even for a shared `Image`), builds `ViewLayer`/`DrawLayer`s,
  and keeps each stored `ViewConfig` in sync with user-driven wl/opacity/
  colourmap changes.
- `ToolboxController` — holds `{name: toolInstance}`, tracks the selected
  tool, binds a layer group's pointer/keyboard events to the active tool.
- `UndoController` — thin wrapper around `UndoStack` (`src/command/undoStack.js`).
- `ViewController` (per view layer, wraps one `View` + `PlaneHelper`) and
  `DrawController` (per draw layer, wraps one `AnnotationGroup`, routes edits
  through undoable commands) are created inside `ViewLayer`/`DrawLayer`
  respectively, not by `App` directly.

### Data flow: file/URL → pixels on screen

1. **IO loaders** (`src/io/`): `LoaderBase` (extends `LoadHandlers`, the
   on*-callback contract) is implemented by `DicomDataLoader`, `ZipLoader`,
   `MultipartLoader` (WADO-RS multipart/related), `RawImageLoader`/
   `RawVideoLoader` (non-DICOM), `JSONTextLoader` (legacy state files). Loader
   capability is queried via `canLoadFile`/`canLoadUrl`/`canLoadMemory`
   (extension/media-type based). `getLoaderList()` (`loaderList.js`) is a
   lazily-built singleton list to avoid a circular-import (`MultipartLoader`
   → `MemoryLoader` → `loaderList` → `MultipartLoader`). The orchestrators
   `FilesLoader`/`UrlsLoader`/`MemoryLoader` pick the first matching loader,
   read the raw bytes (`FileReader`/`XMLHttpRequest`), and call `loader.load()`.
   DWV is a DICOMweb User Agent only (WADO-URI, WADO-RS, STOW-RS) — QIDO-RS
   only exists in the `dev/pacs` demo, not core `src/` — and has no DIMSE
   networking (no C-STORE/C-FIND/C-MOVE/PDU/Association handling); it's
   HTTP/DICOMweb only.
2. **DICOM parsing** (`src/dicom/`): `DicomParser.parse()` reads the preamble,
   File Meta group (incl. `TransferSyntaxUID`), then the dataset via
   `DataReader` (endian/VR-aware), using `dictionary.js` for VR/transfer-syntax
   tables, producing `Record<tagKey, DataElement>`.
   `getSyntaxDecompressionName(syntax)` maps the transfer syntax to one of
   `'jpeg2000'` / `'jpeg-baseline'` / `'jpeg-lossless'` / `'rle'` (or
   undefined if uncompressed).
3. **Pixel decompression** (`src/image/decoder.js`, `src/decoders/`): when a
   decompression algo is needed, `DicomBufferToData` (`src/image/
   dicomBufferToData.js`, called by `DicomDataLoader`) builds a
   `PixelBufferDecoder` which dispatches to a `ThreadPool`
   (`src/utils/thread.js`) of web workers — `decoders/pdfjs/` (vendored
   Mozilla pdf.js, patched for 16-bit signed grayscale) handles JPEG
   Baseline/JPEG2000, `decoders/rii-mango/` (vendored
   rii-mango/JPEGLosslessDecoderJS) handles JPEG Lossless, `decoders/dwv/`
   is dwv's own RLE decoder. The same `ThreadPool`/`WorkerTask` machinery is
   reused for image labeling (`image/labelingThread.js`, e.g. flood fill) and
   resampling (`image/resamplingThread.js`).
4. **Image/AnnotationGroup construction** (`src/image/*Factory.js`, invoked
   from `DataController`): `ImageFactory` builds an `Image` (pixel buffer +
   `Geometry`/`Size`/`Spacing`, rescale slope/intercept via `rsi.js`, SUV
   factor for PET, per-frame functional groups); `MaskFactory` builds a
   `MaskImage` (a segmentation-specific subclass of `Image`, see below) from
   DICOM SEG; `AnnotationGroupFactory` parses DICOM SR into an
   `AnnotationGroup` of `Annotation`s; `RtStructFactory` rasterizes RTSTRUCT
   contours into a `MaskImage`.
5. **View construction and rendering** (`src/image/view*.js`,
   `src/gui/`, at render time via `StageController`): `ViewFactory` wraps an
   `Image` in a `View` (orientation/position, `WindowLut`, colour map, window
   presets — DICOM-provided, computed `'minmax'`, or app-supplied via
   `custom.wlPresets`). `View.generateImageData()` dispatches on
   `image.getPhotometricInterpretation()` to one of the pure pixel-fill
   functions `generateImageDataMonochrome`/`Rgb`/`YbrFull`/`PaletteColor`
   (each in its own `view*.js` file), which use `WindowLut` (= `ModalityLut`
   + `VoiLut`, from `rsi.js`/`voiLut.js`) and a `ColourMap` (`luts.js`) to
   produce an `ImageData`. `ViewLayer` (`src/gui/viewLayer.js`) draws that to
   a plain HTML5 `<canvas>` (2D context) — no Konva involved.

`Stage` (`src/gui/stage.js`) → multiple `LayerGroup`s (`layerGroup.js`) →
each owns `ViewLayer`s (canvas pixel rendering), `DrawLayer`s (Konva-based
vector annotation rendering, via `DrawController`), and an optional
`InfoLayer` (overlay text, `infoData.js`). `binders.js` synchronises
zoom/pan/window-level/etc. across multiple linked layer groups (e.g.
axial/coronal/sagittal MPR views).

### Tools (`src/tools/`)

Every concrete tool (`WindowLevel`, `Scroll`, `ZoomAndPan`, `Opacity`, `Draw`,
`Brush`, `Filter`, `Floodfill`, `Livewire` — registered in `toolList.js`)
extends `LayerGroupPointer`, which normalises pointer/touch input into a
drag lifecycle and is *composed* (not subclassed) from pluggable behaviors
under `src/tools/behaviors/` (`dragBehavior`, `wheelBehavior`,
`hoverBehavior`, `doubleClickBehavior`, `tapBehavior`, `twoTouchBehavior`,
plus draw/brush/floodfill/livewire-specific variants). `src/tools/shapes/`
holds the geometric shape classes and Konva renderers used by `Draw`/`Brush`
(rectangle, ellipse, circle, arrow, ruler, protractor, ROI, bidimensional,
plus label/anchor/editor helpers).

Tools never mutate state directly — they create `Command` objects
(`src/command/`: `AddAnnotationCommand`/`RemoveAnnotationCommand`/
`UpdateAnnotationCommand`, `DrawBrushCommand`, `RunFilterCommand`,
`DeleteSegmentCommand`, `ChangeSegmentColourCommand`) and push them through
`UndoController.addToUndoStack()`, so all edits are undoable via
`UndoStack` (`src/command/undoStack.js`).

### Annotations vs. masks

Two parallel models, both stored alongside regular pixel data on `DicomData`:

- **Masks** (DICOM SEG/RTSTRUCT → `DicomData.image`): one label per voxel in
  a `MaskImage` (`src/image/maskImage.js`, extends `Image`, split out from it
  to keep segment-aware behavior — per-segment/per-slice bookkeeping, brush
  offset-editing, per-segment volume/centroid/diameter labeling — off the
  base pixel class), with a segment list (number/colour/name) managed by
  `MaskSegmentHelper` (`src/image/maskSegmentHelper.js`, deliberately does
  *not* touch pixels itself — pixel edits go through undoable commands).
  `MaskImage` owns a `SegmentCollection` (per-segment ROI slice buffers) and
  an `ImageContour` for outline-style rendering.
- **Annotations** (DICOM SR, or drawing tools → `DicomData.annotationGroup`):
  vector/graphic `Annotation` objects grouped in an `AnnotationGroup`,
  rendered by `DrawLayer` (Konva).

### Legacy state persistence

`src/io/state.js` (`State` class) is explicitly `@deprecated since v0.34` in
favor of DICOM SR annotations — it's the old JSON app-state serializer
(window/level, zoom, pan, legacy Konva "drawings"). `App.setDrawings()`
(also deprecated) converts old Konva drawings into the current
`AnnotationGroup` model via `konvaToAnnotation` in `src/gui/drawLayer.js`.
Prefer the `Annotation`/`AnnotationGroup`/DICOM SR path for any new work.

### Extensibility

`src/app/custom.js` exports a single mutable `custom` object (window/level
presets per modality, shape label texts, private b-value rules, volume-id
and pixel-unit getters, ROI dialog override) meant to be overridden by
embedding applications — check it before adding new hardcoded
modality-specific behavior.

### Cross-cutting utilities (`src/utils/`)

- `logger.js` — global mutable `logger` singleton (`TRACE`..`ERROR`,
  default `WARN`), used pervasively including to flag deprecated `App` calls.
- `thread.js` — shared `ThreadPool`/`WorkerTask`/`WorkerThread` web-worker
  infrastructure (see pixel decoding, labeling, resampling above).
- `listen.js` — a manual `ListenerHandler` (non-`EventTarget`) used only by
  `gui/viewLayer.js` and `gui/drawLayer.js`, distinct from the
  `EventTarget`/`CustomEvent` pattern used everywhere else.
- `i18n.js` — minimal translation namespace (currently unit symbols),
  designed for override by the embedding app.
