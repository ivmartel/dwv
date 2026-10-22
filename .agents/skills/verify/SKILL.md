---
name: verify
description: Verify a dwv change the way CI does (lint, vitest with coverage, webpack + tsc types + api-extractor build) plus repo-specific checks (API report drift, deprecation hygiene). Use after editing src/ or tests/, before committing, or when asked to "verify", "check", or "make sure CI passes".
---

# Verify a dwv change

Goal: show that the current working tree would pass `.github/workflows/nodejs-ci.yml`,
and that the change follows the repo conventions CI does not enforce. Report
results faithfully: quote failing output; don't call a step passed if it was skipped.

## 0. Scope the change

```bash
git status --short
git diff --stat HEAD
```

Note which areas changed (`src/<area>/`, `tests/<area>/`, `package.json`).
This picks the fast checks in step 1
and the extra checks in step 3.

## 1. Fast checks (iterate here first)

Run only on what changed, fix, repeat:

```bash
# lint only the touched files (same config as CI)
yarn eslint -c config/eslint.config-full.js <changed .js files>

# tests mirroring the touched area, e.g. src/image/ -> tests/image/
yarn vitest run tests/<area>
# or a single file / test name
yarn vitest run tests/image/image.test.js
yarn vitest run -t "some test name"
```

Lint errors fail CI; jsdoc warnings don't, but keep them at **zero** anyway.
The rules that most often bite are `jsdoc/tag-lines` (exactly one blank line
before the first `@tag`) and `jsdoc/require-description-complete-sentence`
(descriptions start with a capital letter and end with a period).

## 2. Full CI pipeline (required before saying "done")

Run the CI steps in CI order and stop at the first failure:

```bash
yarn install --immutable   # only if package.json / yarn.lock changed
yarn lint
yarn test-ci
rm -rf ./build && yarn build
```

Each step has its own pass criteria:

- **install**: `--immutable` fails if `yarn.lock` doesn't match `package.json`.
  Run `yarn install` and include the lockfile in the change.
- **lint**: exit code 0, and the warnings count printed at the end is 0.
- **test-ci**: all tests pass, and the coverage `text-summary` shows statements,
  branches, functions and lines all at or above 50% (vitest exits non-zero
  if not). It also writes `build/test-results.json`.
- **build**: three sub-steps, and any of them can fail:
  - `pack`: webpack prod bundle.
  - `types`: `tsc -p resources/api/tsconfig.json`. The jsdoc types must
    type-check, so a wrong `@param {Type}`, a missing import typedef or a bad
    `@returns` fails here even when lint passes.
  - `api`: api-extractor `--local`. It doesn't fail on API changes, it
    rewrites `resources/api/dwv.api.md` (see step 3). CI runs `yarn build-ci`
    instead, whose `api-ci` step fails on API changes that aren't in the
    committed `dwv.api.md`, and on any api-extractor warning.

The suite takes a few minutes. Run it in the background and wait for the
notification instead of polling.

## 3. Repo-specific checks

### API report drift

```bash
git diff --stat resources/api/dwv.api.md
```

If the build changed it, the public API changed. Report what changed (new or
removed exports, signature changes) so the user knows it's intentional, and
**keep the file in the change**: CI fails if `dwv.api.md` doesn't match the
public API. Then run `yarn api-ci` (needs the `build/types` from the build)
to check that it passes the way it will in CI, warnings included.
`AGENTS.md` is only updated at release time, not per change.

### Convention review of the diff

Read `git diff HEAD` and look for:

- **Undoable edits**: tools change annotations or masks through `Command`
  objects pushed with `UndoController.addToUndoStack()`, never by mutating
  state directly.
- **Controllers vs `App`**: new behaviour goes on the controllers
  (`getLoadController()`, `getDataController()`, ...). `App` methods stay thin
  forwarding wrappers. A deprecated wrapper logs through `logger.warn` and
  has a `@deprecated` jsdoc tag.
- **Customisation**: new modality-specific constants belong in
  `src/app/custom.js` or extend the exported defaults
  (`defaultVolumeIdCandidates`, `defaultPrivateBValueRules`). Don't hardcode them.
- **Exports**: a new public symbol is re-exported from its area's `index.js`,
  so that it reaches `src/index.js` and therefore the API report.
- **Tests**: new `src/<area>/x.js` logic gets tests in `tests/<area>/`, using
  fixtures from `tests/data` rather than new large binaries where possible.
- **No stray changes**: `tmp/`, `build/`, `coverage/` and debug `console.log`
  calls stay out of the change.

## 4. Optional: see it running

For rendering, tool or loading changes that unit tests can't show, run
`yarn start` (webpack-dev-server) and load data in `dev/pacs/viewer.html` or
the example pages under `dev/`. Say in the report whether this was done; if
not, say that visual behaviour was not checked.

## 5. Report

End with a short table, one row per step: `install` / `lint` / `test-ci`
(with the 4 coverage numbers) / `build` / `api drift` /
`conventions` / `manual`, each marked pass, fail or skipped, with a reason
for anything not a pass. Include the first error of any failing step verbatim.
