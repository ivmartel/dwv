This page is the entry point for the dwv architecture description. See:

- [App and controllers](/tutorials/arch-app)
- [Data load](/tutorials/arch-data-load)
- [Layout](/tutorials/arch-layout)
- [View creation](/tutorials/arch-view-create)
- [Tools](/tutorials/arch-tools)
- [Annotations](/tutorials/arch-annotations)

Summary:

- [Overview](#overview)
- [Extensibility](#extensibility)
- [Cross-cutting utilities](#cross-cutting-utilities)

## Overview

The library entry point `src/index.js` re-exports each subsystem's own
`index.js`: `app`, `command`, `dicom`, `gui`, `image`, `math`, `tools` and
`utils`.

Everything uses the native [EventTarget](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget)/[CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent)
for communication: controllers listen to their children's events and
re-dispatch them upward, so most state changes eventually surface as an
event on the top-level {@link App}.

Public typedefs (the ones that are part of the API) live in a single
`<folder>/types.js` per source folder (currently `dicom`, `image`, `math`),
re-exported by the folder's `index.js`. Typedefs only used inside one module
stay in that module. The `types.js` files are type only (typedefs and JSDoc
`@import`, no runtime code) so that they stay leaves of the module graph and
cannot create circular dependencies.

## Extensibility

`src/app/custom.js` exports a single mutable `custom` object meant to be
overridden by embedding applications. It holds:

- window/level presets per modality,
- shape label texts,
- private b-value rules and volume-id candidates (see
  [multi-volume data](/tutorials/arch-data-load#multi-volume-data)),
- the pixel-unit getter,
- the ROI dialog override.

`custom.volumeIdCandidates` and `custom.privateBValueRules` replace the
defaults: extend the exported `defaultVolumeIdCandidates` and
`defaultPrivateBValueRules` rather than rewriting them.
`custom.getVolumeIdTagValue` and `custom.getPostLoadVolumeIdTagValue` are
deprecated since v0.37.

## Cross-cutting utilities

The `src/utils/` folder contains:

- `logger.js`: a global mutable `logger` singleton (levels `TRACE` to `ERROR`,
  default `WARN`), used throughout the library, including to flag deprecated
  calls.
- `thread.js`: the shared `ThreadPool`/`WorkerTask`/`WorkerThread` web worker
  infrastructure, used for pixel decoding, labeling and resampling.
- `listen.js`: a manual `ListenerHandler` (not an `EventTarget`) used only by
  {@link ViewLayer} and {@link DrawLayer}, distinct from the
  `EventTarget`/`CustomEvent` pattern used everywhere else.
- `i18n.js`: a minimal translation namespace (currently unit symbols),
  designed to be overridden by the embedding application.
