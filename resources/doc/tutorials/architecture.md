This page lists details about the dwv architecture.

## Layers
![layers](layers.png)

- `App`: main class
- `LoadController`: handles I/O, the first layer handles the source being
  `File`, `Url`, `Memory` and the second one handles data type, `Dicom`, `Zip`
  `rawImage`, `rawVideo` and `json`
- `LayerGroup`: a group of layers associated to an HTML element,
  for now of type `View` and `Draw`. Layers follow the [model-view-controller](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller) (MVC) design.
- `Stage`: the class that handles a list of LayerGroups for optional synchronisation

## Data load
Data can come from 3 types of source: url (via a [HttpRequest](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest)), file (via a [FileReader](https://developer.mozilla.org/en-US/docs/Web/API/FileReader)) or directly as a memory buffer. The 3 'meta' loaders responsible for each source are: [UrlsLoader](./dwv.io.UrlsLoader.html), [FilesLoader](./dwv.io.FilesLoader.html) and [MemoryLoader](./dwv.io.MemoryLoader.html).

Each 'meta' loader will then delegate the individual data load to a specialised loader according
to its answer to the `canLoadUrl` or `canLoadFile` call. The current specialised loaders are:
1. [DicomDataLoader](./dwv.io.DicomDataLoader.html): reads DICOM dataIndex
1. [JSONTextLoader](./dwv.io.JSONTextLoader.html): for JSON data
1. [RawImageLoader](./dwv.io.RawImageLoader.html): for image formats supported by the browser
1. [RawVideoLoader](./dwv.io.RawVideoLoader.html): for video formats supported by the browser
1. [ZipLoader](./dwv.io.ZipLoader.html): for data compressed in a ZIP file

## View creation
The library will use a series of steps and LookUp Tables (LUT) to convert the file data into the
canvas array data:
1. Extract the data from the recreated 3D volume using position and orientation
  and abstracted as an [iterator](https://en.wikipedia.org/wiki/Iterator_pattern)
   - See [image/iterator.js](./dwv.image.html#.range)
1. From stored type range to physical range using a [Modality LUT](http://dicom.nema.org/medical/dicom/current/output/chtml/part03/sect_C.11.html): rescale slope and intercept are used
   in the conversion equation: `y = slope * x + intercept`
   - See [image/rescaleLut.js](./dwv.image.RescaleLut.html)
1. Select part of the range using a [VOI LUT](http://dicom.nema.org/medical/dicom/current/output/chtml/part03/sect_C.11.2.html#table_C.11-2) (Value Of Interest): window width and level (or centre)
   allow to focus on a specific range (especially useful for normed data such
   as in CT)
   - See [image/windowLut.js](./dwv.image.WindowLut.html)
1. Assign a colour to each values using a colour map
   - See [image/lut.js](./dwv.image.lut.html)
1. You now have the canvas data!

All this is materialised in the `dwv.image.generateImageData*` functions.
