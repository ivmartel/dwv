# User Stories

## Introduction
`dwv` is a DICOM Web Viewer library. Here is an intent at listing its User Stories or Requirements Specification.

## io
Definitions:
- _HTML File_: represents file data typically obtained from the underlying file system. It is provided via an HTML input field with the 'file' type or via drag and drop (see W3C [FileAPI](https://www.w3.org/TR/FileAPI/)).
- _URL_: the data is accessed via a URL which resolves to data published on the same server as the application or on one that allows Cross-Origin Resource Sharing (CORS). A _discrete_ URL is a URL that represents a single file or medium. A _multipart_ URL represents a document that's comprised of multiple component parts (see wikipedia [MIME#Multipart_messages](https://en.wikipedia.org/wiki/MIME#Multipart_messages)).
- _ZIP_: archive file format that supports lossless data compression. A ZIP file may contain one or more files or directories that may have been compressed (see wikipedia [ZIP](<https://en.wikipedia.org/wiki/ZIP_(file_format)>)).

Note: for more details about which parts of the DICOM standard are supported, see the DICOM [conformance](./tutorial-conformance.html) page.

### DWV-REQ-IO-01-001 Load DICOM file(s)
The user can load DICOM data provided as one or multiple HTML File(s) representing DICOM files.

### DWV-REQ-IO-01-002 Load DICOM ZIP file
The user can load DICOM data provided as one HTML file representing a ZIP file containing one or multiple DICOM file(s).

### DWV-REQ-IO-02-001 Load DICOM discrete URL(s)
The user can load DICOM data provided as one or multiple discrete URL(s) representing DICOM files.

### DWV-REQ-IO-02-002 Load DICOM multipart URL
The user can load DICOM data provided as one multipart URL representing one or multiple DICOM file(s).

### DWV-REQ-IO-02-003 Load DICOM ZIP URL
The user can load DICOM data provided as one discrete URL representing a ZIP file containing one or multiple DICOM file(s).

### DWV-REQ-IO-02-004 Load DICOMDIR URL
The user can load DICOM data provided as one discrete URL representing a DICOMDIR file. A DICOMDIR file is a file containing references to one or multiple DICOM file(s).

### DWV-REQ-IO-02-005 Window location URL scheme
The user can load data from the window location using the `input` keyword. The scheme is:

`[dwv root]?input=[data url]`

The data url must be URI encoded if it includes special query parameters such as `&`, `?` and `/`. This can be done with the `encodeURIComponent` javascript function.

Multiple data can be loaded via a key/value pair mechanism on the data URL. The scheme is:

`[url root]?key0=value00&key0=value01&key1=value10`

The `[url root]` part can either be a query (`root?key=value`) or a direct link (`root/file.dcm`). If a key is repeated (`key0` in the example above), the URL will be split and resolve to the following list:
- `[url root]?key0=value00&key1=value10`
- `[url root]?key0=value01&key1=value10`

In the case of local files, the `[url root]` needs to contain the final `/`. The repeated key needs to be named `file` for file links (removes the question mark).

Parameters:
- `dwvReplaceMode`: replacement for the repeated key, the (default) value `key` keeping it. Example: `[dwv root]?input=[multiple urls]&dwvReplaceMode=void`
- `type`: the URL type, for now only `manifest` is accepted (see Data Manifest URL). Example: `[dwv root]?input=[manifest url]&type=manifest`

Note that the current URL size limit of modern browsers is around 2000 characters (see [ref](http://stackoverflow.com/questions/417142/what-is-the-maximum-length-of-a-url-in-different-browsers)).

### DWV-REQ-IO-02-006 Load Data Manifest URL
The user can load multiple data via an XML manifest file passed via the window location URL. The scheme is:

`[dwv root]?input=[manifest file]&type=manifest`

The manifest structure is the one used by the Weasis PACS connector of dcm4chee (see [link](http://www.dcm4che.org/confluence/display/WEA/How+to+launch+Weasis+from+any+environments) and [schema](https://github.com/nroduit/Weasis/blob/master/weasis-dicom/weasis-dicom-explorer/src/main/resources/config/wado_query.xsd)). The minimum information needed is:

```xml
<wado_query wadoURL="http://localhost:8080/wado">
  <Patient PatientID="VafMYPDf">
    <Study StudyInstanceUID="2.16.840.1.113669.632.20.1211.10000322126">
      <Series SeriesInstanceUID="1.3.12.2.1107.5.2.31.30222.6100606325120300005943">
        <Instance SOPInstanceUID="1.3.12.2.1107.5.2.31.30222.6100606325120300006058" />
        <Instance SOPInstanceUID="1.3.12.2.1107.5.2.31.30222.6100606325120300006176" />
      </Series>
    </Study>
  </Patient>
</wado_query>
```

Only the first series of the first study of the first patient will be loaded.

### DWV-REQ-IO-03-001 DICOM data load output
Once loaded, the user can programmatically access the loaded data: the image and its meta data. The meta data will follow the DICOM JSON model defined with the DICOM standard.

### DWV-REQ-IO-04-001 DICOM load start event
The user can listen to `loadstart` events. The event is fired when a load has started.

### DWV-REQ-IO-04-002 DICOM load progress event
The user can listen to `loadprogress` events. The event is fired periodically when a request receives more data.

### DWV-REQ-IO-04-003 DICOM load error event
The user can listen to `error` events. The event is fired when the load encountered an error.

### DWV-REQ-IO-04-004 DICOM load abort event
The user can listen to `abort` events. The event is fired when a load has been aborted.

### DWV-REQ-IO-04-005 DICOM load item event
The user can listen to `loaditem` events. The event is fired when a DICOM file has been successfully loaded.

### DWV-REQ-IO-04-006 DICOM load event
The user can listen to `load` events. The event is fired when all the DICOM files have been successfully loaded.

### DWV-REQ-IO-04-007 DICOM load end event
The user can listen to `loadend` events. The event is fired when a request has completed, whether successfully (after `load`) or unsuccessfully (after `abort` or `error`).

### DWV-REQ-IO-05-001 Write DICOM file
The user can save image and meta data to a DICOM file.

### DWV-REQ-IO-05-002 Write anonymised DICOM file
The user can save image and anonymised meta data to a DICOM file.

## ui

### DWV-REQ-UI-01-001 Integration in web application
The library can be integrated in a web application, a browser without any extensions must be sufficient to run the application. The supported browsers are the last two versions of browsers that have more than 1% audience worldwide (at the time of the dwv package creation).

### DWV-REQ-UI-02-001 Display image
The user can generate a view of the image data according to properties set in the DICOM data. The image will be created in a `<canvas>` HTML element inside an HTML element provided by the user (via its `id`).

### DWV-REQ-UI-02-002 Image reorientation
The user can decide which orientation the displayed image should use: the acquisition orientation, 'axial', 'coronal' or 'sagittal'. Axial uses `z` as main axis, coronal uses `y` and sagittal uses `x`.

### DWV-REQ-UI-02-003 Image overlay
The user can load multiple data in a single HTML div. This will result in multiple HTML `<canvas>` aligned with each other by using the Image Position Patient DICOM tag.

### DWV-REQ-UI-03-001 Change image window/level
The user can change the window/level of the displayed image. On change, a `wlchange` event will be fired containing the changed values.

### DWV-REQ-UI-03-002 Change image position
The user can change the current position of the displayed image. On change, a `positionchange` event will be fired containing the changed values.

### DWV-REQ-UI-03-003 Change image zoom/pan
The user can change the zoom and pan of the displayed image. On zoom change, a `zoomchange` event will be fired containing the changed values. On pan change, an `offsetchange` event will be fired containing the changed values.

### DWV-REQ-UI-03-004 Change image opacity
The user can change the opacity of the displayed image. On change, a `opacitychange` event will be fired containing the changed values.

### DWV-REQ-UI-04-001 Views window/level synchronisation
The user can decide to synchronise or not the window/level between different views of the same data.

### DWV-REQ-UI-04-002 Views position synchronisation
The user can decide to synchronise or not the position between different views.

### DWV-REQ-UI-04-003 Views zoom/pan synchronisation
The user can decide to synchronise or not the window/level between different views.

### DWV-REQ-UI-04-004 Views opacity synchronisation
The user can decide to synchronise or not the opacity between different views of the same data.

### DWV-REQ-UI-05-001 Window/Level tool
The user can change the window/level of the displayed data via specific interaction on the image `<canvas>`:
- `left click drag up/down` or `one touch drag up/down` changes the window,
- `left click drag left/right` or `one touch drag up/down` changes the level,
- `double left click` or `double touch` centre's the window/level on the clicked intensity,
- `left click` or `touch` shows the position and intensity.

The user must be able to reset the window/level to their original values.

### DWV-REQ-UI-05-002 Window/Level presets
Specific window/level data pre-sets must be made available. Only data with CT modality will provide some. They are ['name' (window center, window width)]:
- 'mediastinum' (40, 400),
- 'lung' (-500, 1500),
- 'bone' (500, 2000),
- 'brain' (40, 80),
- 'head' (90, 350).

### DWV-REQ-UI-05-003 Slice scroll tool
The user can change the current position via specific interaction on the image `<canvas>`:
- `left click drag` or `one touch drag` to change the scroll index,
- `mouse wheel` to change the scroll index.

### DWV-REQ-UI-05-004 Zoom/Pan tool
The user can zoom/pan the displayed data via specific interaction on the image `<canvas>`:
- `left click drag` or `one touch drag` for panning,
- `mouse scroll` or `pinch` for zooming.

The user must be able to reset the zoom/pan value to their original values.

### DWV-REQ-UI-05-005 Opacity tool
The user can change the image opacity via specific interaction on the image `<canvas>`:
- `left click drag` or `one touch drag` to change the opacity.

### DWV-REQ-UI-06-001 Image thresholding
The user can filter the input image using a thresholding filter.

### DWV-REQ-UI-06-002 Image contrast enhancement
The user can filter the input image using a contrast enhancement filter.

### DWV-REQ-UI-06-003 Image contour extraction
The user can filter the input image using a contour extraction filter.

### DWV-REQ-UI-07-001 Draw arrow
The user can draw an arrow shape on the displayed data. An arrow is characterised by two modifiable anchor points situated at the extremities of the shape. The shape can be moved in its entirety. A label can be associated to the shape. No measures nor quantifications are provided with the shape.

### DWV-REQ-UI-07-002 Draw circle
The user can draw a circle shape on the displayed data. A circle is characterised by a center point and a radius. The center can be changed when moving the complete shape, the radius via control points on the shape. A label can be associated to the shape. The following measures are provided with the shape: radius and surface. The following quantifications are provided with the shape: minimum, maximum, mean, standard deviation, median, 25th and 75th percentiles of the intensities covered by the shape.

### DWV-REQ-UI-07-003 Draw ellipse
The user can draw an ellipse shape on the displayed data. An ellipse is characterised by a center point and two radiuses. The center can be changed when moving the complete shape, the radiuses via control points on the shape. The following measures are provided with the shape: radius a, radius b and surface. The following quantifications are provided with the shape: minimum, maximum, mean, standard deviation, median, 25th and 75th percentiles of the intensities covered by the shape.

### DWV-REQ-UI-07-004 Draw free hand
The user can draw a free hand shape on the displayed data. A free hand shape is a non closed shape charaterised by multiple modifiable anchor points. The shape can be moved in its entirety. No measures nor quantifications are provided with the shape.

### DWV-REQ-UI-07-005 Draw protractor
The user can draw a protractor shape on the displayed data. A protractor is charaterised by three modifiable anchor points. The shape can be moved in its entirety. The following measure are provided with the shape: the angle between the two lines that form the protractor. No quantifications are provided with the shape.

### DWV-REQ-UI-07-006 Draw rectangle
The user can draw a rectangle shape on the displayed data. A rectangle is charaterised by four modifiable anchor points situated at the extremities of the shape. The shape can be moved in its entirety. The following measures are provided with the shape: width, height and surface. The following quantifications are provided with the shape: minimum, maximum, mean, standard deviation, median, 25th and 75th percentiles of the intensities covered by the shape.

### DWV-REQ-UI-07-007 Draw ruler
The user can draw a ruler shape on the displayed data. An arrow is characterised by two modifiable anchor points situated at the extremities of the shape. The shape can be moved in its entirety. The following measure are provided with the shape: the length of the line. No quantifications are provided with the shape.

### DWV-REQ-UI-07-008 Draw ROI
The user can draw a Region Of Interest (ROI) shape on the displayed data. A ROI is a closed shape characterised by multiple modifiable anchor points. The shape can be moved in its entirety. No measures nor quantifications are provided with the shape.

### DWV-REQ-UI-08-001 Draw delete
The user can delete draws.

### DWV-REQ-UI-08-002 Draw action undo/redo
The user can undo/redo all actions of the draw tool using `CRTL-Z` and `CRTL-Y` or special buttons on touch enabled devices. The actions are: anchor move, shape move, shape creation and shape deletion.

### DWV-REQ-UI-09-001 Livewire
The user can draw a region of interest while guided with a [livewire segmentation technique](https://en.wikipedia.org/wiki/Livewire_Segmentation_Technique).

### DWV-REQ-UI-09-002 Floodfill
The user can draw a region of interest based on [floodfill](https://en.wikipedia.org/wiki/Flood_fill) technique.

