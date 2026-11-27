# AGENTS.md

This file provides guidance to AI agents when working with code in this repository.

## Project

DWV (DICOM Web Viewer) is a zero-footprint, pure-JavaScript/HTML5 medical image
viewer library. It parses and renders DICOM (and some non-DICOM) data and
provides tools for manipulation (scroll, window/level, zoom, pan, MPR,
annotation, filters). Not certified for diagnostic use. Licensed GPL-3.0;
contributions follow the guidelines and license terms in
`.github/contributing.md`.

DWV is an embeddable library, not an application: it runs inside a host page
or framework it does not control, possibly inside a shadow DOM or an iframe,
with several `App` instances on the same page, or under Node (see
`pack-node`). Code in `src/` must not rely on or use global objects such as
`window` (or the global `document`): no global event listeners, no lookups
in the global document, no state kept on globals. Use the `rootDocument` app
option (`AppOptions.rootDocument`, defaults to `document`) to find elements
and register document-level events (for ex keyboard events in
`ToolboxController`), and attach other listeners to the app's own elements.

DWV is focused on image display and manipulation. Network interactions with
remote servers (for ex DICOMweb QIDO-RS search or STOW-RS storage, DIMSE
services) are not part of the library and must be kept separate: they belong
to the embedding application (see the `dev/pacs` demo for an example). The
library only retrieves the data to display, through its URL loaders
(WADO-URI, WADO-RS), and takes already-loaded data as files or memory
buffers.

Package manager is `yarn` (yarn v4, `packageManager` pinned in package.json).
Run `corepack enable` to install `yarn`
shims that read the `packageManager` field and download and run that exact
yarn version. Without enabling it, `corepack yarn <script>` (for ex
`corepack yarn test-ci`) does the same for a single command. Corepack is
bundled with Node up to v24 only; from Node 25 install it first with
`npm install -g corepack`. npm also works
for all scripts. Node >= 18 required (CI uses Node 26). Module type is `"module"`
(ESM throughout `src/`).

## DICOM standard

For any question about the DICOM standard itself (tags, VRs, IODs, transfer
syntaxes, DICOMweb...), use the `dicom` skill (`.agents/skills/dicom/SKILL.md`):
look the answer up in the standard on dicom.nema.org and cite the section,
rather than answering from memory.

The code targets the DICOM standard **2024a** edition: the tag dictionary
(`src/dicom/dictionary.js`) is loaded from
`dcmstdtojs/dist/assets/2024a/dicom_tags.json`, and the links to the standard
in the docs point to `/medical/dicom/2024a/`. The skill answers from that
edition, compares it with the current one and reports significant changes (for
ex a tag or VR added or changed since).

When upgrading to a newer edition, update together:

- the `dcmstdtojs` asset path in `src/dicom/dictionary.js` (and its jsdoc);
- the `EDITION` in the `dicom` skill;
- the dated dicom.nema.org links in the docs: the jsdoc in `src/` (and a few
  in `tests/`) and the tutorials in `resources/doc/tutorials/`. Check each
  linked section still has the same number and content in the new edition.

## Commands

- `yarn install` — install dependencies.
- `yarn start` — webpack-dev-server (`config/webpack.dev.js`), opens the
  `dev` pages, including the `dev/viewer/viewer.html` test viewer. They are
  described in `resources/doc/tutorials/dev-pages.md`: keep it up to date
  when adding, removing or changing a dev page.
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
  `config/webpack.node.js`, output `dist/dwv.node.min.js`, the package's
  `node` export). The Node bundle is limited, mainly for DICOM parsing
  (`DicomParser`, tags, dictionary) and writing (`DicomWriter`): no URL or
  file loading (the loaders rely on browser `XMLHttpRequest`/`FileReader`),
  so pass the raw bytes (`ArrayBuffer`) yourself; no web-worker based
  decompression of compressed pixel data, and no rendering (canvas, Konva).
- `yarn build-demo` — builds the demo pages (`config/webpack.demo.js`), used
  by CI to publish to `gh-pages`.
- `yarn doc` — generates jsdoc site (`resources/doc/jsdoc.conf.json`).

Tests live in `tests/<area>/*.test.js` mirroring `src/<area>/`, using vitest
with `environment: 'node'` (jsdom pulled in as needed) and DICOM/zip/DICOMDIR
fixtures under `tests/data`. Tests must run without printing logs: silence
expected console or `logger` output with a spy.

### What CI checks

`.github/workflows/nodejs-ci.yml` runs on every push, pull request and
merge-group, on Node 26 with yarn through corepack. A change passes when
these steps all succeed, in this order:

1. `yarn install --immutable` — `yarn.lock` must already match
   `package.json`; commit the lockfile with any dependency change.
2. `yarn lint` — no eslint errors. The jsdoc plugin's recommended rules
   (missing jsdoc, params, returns...) are only warnings and don't fail
   the step (there is no `--max-warnings`); the errors are the base
   `eslint.config.js` rules plus `jsdoc/tag-lines` (one blank line before
   the tags) and `jsdoc/require-description-complete-sentence`. Keep
   warnings at zero anyway.
3. `yarn test-ci` — all vitest tests pass and coverage stays at or above
   50% for statements, branches, functions and lines (`vitest.config.js`).
4. `yarn build-ci` — the webpack bundle, the `tsc` type generation (so the
   jsdoc types must type-check) and api-extractor must all succeed. Its
   `api-ci` step runs api-extractor without `--local`: it fails on any
   api-extractor warning, and when the public API no longer matches the
   committed `resources/api/dwv.api.md`. The local `yarn build` runs `api`
   with `--local`, which rewrites `dwv.api.md` instead; commit that update
   with the change that caused it.

On pushes to `develop` or `master` CI also runs `yarn build-demo` and
publishes the demo to `gh-pages` (`demo/trunk` or `demo/stable`). To
reproduce CI locally, run `yarn lint && yarn test-ci && yarn build-ci`.

The `verify` skill (`.agents/skills/verify/SKILL.md`) wraps these steps with
the repo-specific checks CI does not do: clean test output (no logs),
reporting `dwv.api.md` changes and reviewing the diff against the
conventions below. Use it before reporting a change as done.

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

The architecture is described in the jsdoc tutorials: start at
`resources/doc/tutorials/architecture.md` (overview, extensibility,
utilities) and follow its links to the `arch-*.md` pages: `arch-app`
(App and controllers), `arch-data-load` (loaders, DICOM parsing, pixel
decompression, image construction, multi-volume data), `arch-layout`
(stage, layer groups, layers), `arch-view-create` (LUTs and rendering),
`arch-tools` (tools and commands), `arch-annotations` (annotations vs
masks, DICOM SR). Read the relevant page before changing a subsystem, and
update it when a change makes it outdated.

Conventions to follow when changing code:

- Communication uses native `EventTarget`/`CustomEvent`: controllers
  re-dispatch their children's events upward to the `App`.
- `App` methods are deprecated thin wrappers (since v0.37): put new
  behaviour in the controllers (`app.getLoadController()`...).
- Public typedefs go in the folder's `types.js`, which stays type only
  (typedefs and JSDoc `@import`, no runtime import or code).
- Tools never mutate state directly: they push `Command` objects through
  `UndoController.addToUndoStack()` so every edit is undoable.
- `MaskSegmentHelper` does not touch pixels: pixel edits go through
  commands.
- Check the `custom` object (`src/app/custom.js`) before adding hardcoded
  modality-specific behaviour; extend the exported defaults
  (`defaultVolumeIdCandidates`, `defaultPrivateBValueRules`) rather than
  rewriting them.
- The legacy JSON app state (`src/io/state.js`, `.json` loading,
  `App.applyJsonState()`...) was removed in v0.37: use the
  `Annotation`/`AnnotationGroup`/DICOM SR path.
