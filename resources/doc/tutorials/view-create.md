This page is part of the dwv [architecture](./tutorial-architecture.html) description and
describes the dwv view creation.

Summary:

- [View creation](#view-creation)

## View creation

The view creation is triggered when calling the `app.render` method. It can also be triggered
when the app receives a `loaditem` event if the application options contain a true `viewOnFirstLoadItem`.
The process consists in taking an image slice and creating an HTML [canvas](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/canvas) that represents it.

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
1. You now have the [canvas](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/canvas) data!

![sequence-view-creation](sequence-view-creation.png)

*View generation sequence.*

All this is materialised in the `generateImageData*` functions called from the [View](./View.html) class.