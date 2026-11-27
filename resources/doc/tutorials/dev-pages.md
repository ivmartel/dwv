The `dev` folder holds extra web pages used to develop and evaluate dwv:
a test viewer, visual checks, DICOM tools and a benchmark. They are not part
of the library and are not published in the package.

## Running the pages

Launch the webpack dev server with:

```sh
yarn start
```

It serves the pages at `http://localhost:8080/dev` (the browser opens on the
`dev/index.html` page that links to all of them) and reloads them when the
code changes. The test data folder `tests/data` is served at `/tests/data`.

## Test viewer

`dev/viewer/viewer.html` is a viewer used to try most of the library
features: loading (files, folders, urls), layouts (one view, side by side,
MPR), position, tools (scroll, window/level, zoom and pan, opacity, draw,
brush, floodfill, livewire, filter), annotations and segmentations lists,
resampling, render tests...

It can load data from its url with the `input` query parameter, for example:
`viewer.html?input=https%3A%2F%2Fexample.com%2Fdata.dcm`. The other dev pages
use this to open their data in the viewer.

The viewer is also built by `yarn build-demo` and published by the CI on the
`gh-pages` branch (`demo/trunk` for `develop`, `demo/stable` for `master`).

## PACS pages

- `dev/pacs/index.html`: a "fake" PACS, a list of example data (DICOM, non
  DICOM, zip, DICOMDIR...) that open in the test viewer, as they could be in
  a web interface to a PACS.
- `dev/pacs/dcmweb.html`: a simple DICOMweb browser: search with QIDO-RS,
  store with STOW-RS and view the results with WADO in the test viewer. The
  dev server proxies `/dicom-web` to a local [Orthanc](https://www.orthanc-server.com/)
  (`http://localhost:8042`, `orthanc:orthanc` credentials), so the default
  root url `http://localhost:8080/dicom-web` works out of the box with it.

These pages are an example of the separation between the library and the
network interactions: search and storage are done by the page, dwv only
retrieves the data to display.

## Visual checks

These pages display data next to a reference image to check the rendering
by eye:

- `dev/visual/index.html`: uncompressed DICOM data,
- `dev/visual/index-jpeg.html`: JPEG compressed data,
- `dev/visual/index-jpeg2000.html`: JPEG 2000 compressed data,
- `dev/visual/index-rle.html`: RLE compressed data.

Each line shows the data characteristics (transfer syntax, modality,
photometric interpretation, bits...), the dwv display of the file from
`tests/data` and the expected result stored in `dev/visual/images`.

`dev/visual/orientation.html` checks the orientation handling: the same
synthetic volume is written with all the 24 axis aligned Image Orientation
(Patient) values and each one is displayed without target orientation and
with an axial, coronal and sagittal one. The page describes what a correct
display looks like.

## DICOM tools

- `dev/dicom/pages/anonymiser.html`: a simple DICOM "anonymisation" tool,
  applies JSON rules (`copy`, `remove`, `clear`, `replace(value)`) per tag or
  tag group to a DICOM file.
- `dev/dicom/pages/generator.html`: generates DICOM files from JSON tags,
  mainly used to create test data.
- `dev/dicom/pages/synthetic-data.html`: lists generated synthetic data
  (images in different structures: single-slice, multi-frame,
  multi-volume..., SEG, RTSTRUCT, KOS) to open in an embedded test viewer
  or to download.
- `dev/dicom/pages/diff.html`: dumps the tags of two DICOM files as text and
  compares them side by side.

## Benchmark

`dev/bench/bench.html` measures the DICOM parsing speed (operations per
second, with [benchmark.js](https://benchmarkjs.com/)) on a selection of
data. It compares the current code (`dwv-current`) with the last published
version (`dwv-previous`, loaded from unpkg). The current one uses the
`dist/dwv.min.js` bundle: run `yarn pack` before launching it.

## Colour maps

`dev/image/pages/colourmaps.html` displays the dwv colour maps (plain,
inverse plain, rainbow, hot, hot iron, pet, hot metal blue, pet 20 step).
