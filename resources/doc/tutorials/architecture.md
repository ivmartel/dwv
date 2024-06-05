This page lists details about the dwv architecture.

- [Data load](#data-load)
- [View config](#view-config)
- [View creation](#view-creation)
- [Layers](#layers)

## Data load

![classes-io](classes-io.png)

Data can come from 3 types of source: url (via a [XMLHttpRequest](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest)), file (via a [FileReader](https://developer.mozilla.org/en-US/docs/Web/API/FileReader)) or directly as a memory buffer. The 3 'meta' loaders responsible for each source are: [UrlsLoader](./UrlsLoader.html), [FilesLoader](./FilesLoader.html) and [MemoryLoader](./MemoryLoader.html).

Each 'meta' loader will then delegate the individual data load to a specialised loader according
to its answer to the `canLoadUrl` or `canLoadFile` call. The current specialised loaders are:

1. [DicomDataLoader](./DicomDataLoader.html): for DICOM data
1. [JSONTextLoader](./JSONTextLoader.html): for JSON data
1. [RawImageLoader](./RawImageLoader.html): for image formats supported by the browser
1. [RawVideoLoader](./RawVideoLoader.html): for video formats supported by the browser
1. [ZipLoader](./ZipLoader.html): for data compressed in a ZIP file

Here are the events triggered during the load process (meaning the load of all the items):

- `loadstart`: the load started!
- `loaditem`: an item finished loading,
- `load`: all items were loaded successfully,
- `loadprogress`: the progress of the complete load (all items),
- `error`: an error has occured during load,
- `abort`: the load process has been aborted,
- `loadend`: the process has completed, whether successfully (after `load`) or unsuccessfully (after `abort` or `error`).

Once the load is started a unique `dataId` (string) is associated to the data being loaded.

## View config

The library uses a `dataId` indexed list of view configurations ([ViewConfig](./ViewConfig.html)) mainly to provide the `divId` of the HTML element where to generate the canvas associated to dicom data. It also allows to set window/level, colour map, orientation and opacity. The `*` allows to use the same configuration for all data. The `App` class provides various methods to manipulate the 'DataViewConfig'.

## View creation

The view creation is triggered when the app receives a `loaditem` event if the application options contain a true `viewOnFirstLoadItem` or from an `app.render`.

![sequence-view-creation](sequence-view-creation.png)

The library will use a series of steps and LookUp Tables (LUT) to convert the file data into the
canvas array data:

1. Extract the data from the recreated 3D volume using position and orientation
   and abstracted folowing the [iterator pattern](https://en.wikipedia.org/wiki/Iterator_pattern)
   (see [image/iterator.js](./global.html#range))
1. From stored type range to physical range using a [Modality LUT](http://dicom.nema.org/medical/dicom/2022a/output/chtml/part03/sect_C.11.html): rescale slope and intercept are used
   in the conversion equation: `y = slope * x + intercept`
   (see [image/modalityLut.js](./ModalityLut.html))
1. Select part of the range using a [VOI LUT](http://dicom.nema.org/medical/dicom/2022a/output/chtml/part03/sect_C.11.2.html#table_C.11-2) (Value Of Interest): window width and level (or centre)
   allow to focus on a specific range (especially useful for normed data such
   as in CT)
   (see [image/windowLut.js](./WindowLut.html))
1. Assign a colour to each values using a colour map
   (see [image/luts.js](./global.html#luts))
1. You now have the canvas data!

All this is materialised in the `generateImageData*` functions.

## Layers

![classes-layers](classes-layers.png)

The first level is the [Stage](./Stage.html), this class handles a list of [LayerGroup](./LayerGroup.html) for optional synchronisation. A layerGroup is
a group of layers associated to an HTML element, for now of type `View` ([ViewLayer](./ViewLayer.html)) or `Draw` ([DrawLayer](./DrawLayer.html)). The configuration of the stage
is done at the creation of the app. See [app::init](./App.html#init) method for details. Each layer class will
create its own HTML div with an id created by [getLayerDivId](./global.html#getLayerDivId). Layers
will typically contain a HTML canvas to display its content. Use the [getLayerDetailsFromEvent](./global.html#getLayerDetailsFromEvent) method to extract the layer details from an event generated from a layer canvas.
You can then access the layer group object via the app `getLayerGroupByDivId` method.

![classes-layers-view](classes-layers-view.png)

The View class contains a 2D view of the image that could be 3D + t. Layers follow the [model-view-controller](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller) (MVC) design. In the view case, the model is the View, the view the ViewLayer and the controller the ViewController.

![classes-layers-draw](classes-layers-draw.png)

In the case of the draw, the model is the KonvaShape, the view is the DrawLayer and the controller is the DrawController.
The shape will use the ViewController for quantification when it needs to access the underlying pixel values.
