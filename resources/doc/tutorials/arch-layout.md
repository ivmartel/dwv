This page is part of the dwv [architecture](/tutorials/architecture) description and
describes the dwv layering mechanism.

Summary:

- [View config](#view-config)
- [Layers](#layers)

## View config

The library uses a `dataId` indexed list of view configurations ({@link ViewConfig}) mainly to provide the `divId` of the HTML element where to generate the canvas associated to dicom data. It also allows to set window/level, colour map, orientation and opacity. The `*` allows to use the same configuration for all data. The `App` class provides various methods to manipulate the 'DataViewConfig'.

## Layers

![classes-layers](classes-layers.png)

The first level is the {@link Stage}, this class handles a list of {@link LayerGroup} for optional synchronisation. A layerGroup is
a group of layers associated to an HTML element, for now of type `View` ({@link ViewLayer}) or `Draw` ({@link DrawLayer}). The configuration of the stage
is done at the creation of the app. See [app::init]{@link App#init} method for details. Each layer class will
create its own HTML div with an id created by {@link getLayerDivId}. Layers
will typically contain a HTML canvas to display its content. Use the {@link getLayerDetailsFromEvent} method to extract the layer details from an event generated from a layer canvas.
You can then access the layer group object via the app `getLayerGroupByDivId` method.

A layer group can also have an optional `InfoLayer` (overlay text, see
`src/gui/infoData.js`). The {@link StageController} owns the stage, it
builds the layers at render time. The binders (`src/gui/binders.js`)
synchronise zoom, pan, window/level... across linked layer groups, for
example the axial, coronal and sagittal MPR views.

![classes-layers-view](classes-layers-view.png)

The View class contains a 2D view of the image that could be 3D + t. Layers follow the [model-view-controller](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller) (MVC) design. In the view case, the model is the View, the view the ViewLayer and the controller the ViewController.

![classes-layers-draw](classes-layers-draw.png)

In the case of the draw, the model is the {@link AnnotationGroup}, the view is the DrawLayer and the controller is the DrawController.
The shape will use the ViewController for quantification when it needs to access the underlying pixel values.
