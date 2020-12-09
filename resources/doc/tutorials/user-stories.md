The dwv is a DICOM Web Viewer. Here is an intent at listing User Stories or Requirements Specification.

# I/O
Definitions:
* _DICOM data_: a single or multiple DICOM files.
* _Image data_: a single or multiple image files in JPG or PNG format.
* _File_: represents file data typically obtained from the underlying file system. It is provided via an HTML input field with the 'file' type or via drag and drop. See the HTML5 [FileAPI](https://www.w3.org/TR/FileAPI/) for more details.
* _Url_: the data is accessed via a url which resolves to data published on the same server as the application or on one that allows Cross-Origin Resource Sharing (CORS). 

#### DWV-URS-IO-001: Load DICOM file(s)
The user can load DICOM data provided as one or multiple HTML File(s).

#### DWV-URS-IO-002: Load Image file(s)
The user can load image data provided as one or multiple HTML File(s).

#### DWV-URS-IO-003 Load DICOM url(s)
The user can load DICOM data provided as one or multiple url(s).

#### DWV-URS-IO-004 Load Image url(s)
The user can load image data provided as one or multiple url(s).

#### DWV-URS-IO-005 Data URL scheme
The single data url scheme is:

`[dwv root]?input=[data url]`

The user can load multiple data via a key/value pair mechanism on the url. The scheme is:

`[dwv root]?input=encodeURIComponent('[dicom root]?key0=value00&key0=value01&key1=value10')`

The `[dicom root]` part can either be a query (`root?key=value`) or a direct link (`root/file.png`). If a key is repeated (`key0` in the example above), the url will be split and resolve to the following list:

 * `[dicom root]?key0=value00&key1=value10`
 * `[dicom root]?key0=value01&key1=value10`

In the case of local files, the `[dicom root]` needs to contain the final `/`. As of v0.8.0, the repeated key needs to be named `file` for file links (removes the question mark). An optional replace mode (`dwvReplaceMode`) allows to replace the repeated key, the (default) value `key` keeping it.

Note that the current URL size limit of modern browsers is around 2000 characters (see [ref](http://stackoverflow.com/questions/417142/what-is-the-maximum-length-of-a-url-in-different-browsers)).

#### DWV-URS-IO-006 Data Manifest
The user can load multiple data via an XML manifest file passed via the url. The scheme is:

`[dwv root]?input=encodeURIComponent('[manifest file]')&type=manifest`

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

# UI
#### DWV-URS-UI-001 Web Application
The application is a web application, a browser without any extensions must be sufficient to run the application. Supported browsers are listed in the [Platform-support](https://github.com/ivmartel/dwv/wiki/Platform-support) wiki page.

#### DWV-URS-UI-002 Display
The user can view the image data in an optimised way according to the browser window properties. 

#### DWV-URS-UI-003 Interaction
The user can control the application with a computer mouse or with a finger on touch enabled devices. 

#### DWV-URS-UI-004 Overlay information
The user can view the current window and level, the zoom level, the X and Y coordinates and the pixel intensity overlayed on the image.

#### DWV-URS-UI-005 Histogram
The user can view the histogram of the image data.

#### DWV-URS-UI-006 DICOM information
The user can choose to view a table of the full DICOM information except the pixel data.

#### DWV-URS-UI-007 Window/Level
The user can change the window/level of the displayed data.  The window/level values must be displayed to the user. The default interaction are:
 * `left click drag up/down` or `one touch drag up/down` changes the window,
 * `left click drag left/right` or `one touch drag up/down` changes the level,
 * `double left click` or `double touch` centre's the window/level on the clicked intensity,
 * `left click` or `touch` shows the position and intensity.

#### DWV-URS-UI-008 Window/Level presets
Specific window/level data pre-sets must be made available. They are modality specific. For examples see: [radiantviewer](http://www.radiantviewer.com/dicom-viewer-manual/change_brightness_contrast.htm) or this [thread](http://forum.dicom-cd.de/viewtopic.php?p=9998&sid=28bfed23e680aae327c66d5ab7d28396).

#### DWV-URS-UI-009 Slice scroll
The user can scroll the different slices of a multi-slice data using `left click drag` or `one touch drag`. 

#### DWV-URS-UI-010 Zoom/Pan
The user can zoom/pan the displayed data. The zoom value must be displayed to the user. The user must be able to reset the zoom/pan value to their original values. The default interaction are:
 * `left click drag` or `one touch drag` for panning,
 * `mouse scroll` or `pinch` for zooming.

#### DWV-URS-UI-011 Drawing
The user can draw shapes on the displayed data. Possible shapes are: rectangle, circle, free hand region of interest and line. The user must be able to change the colour of the drawing.

#### DWV-URS-UI-012 Livewire
The user can draw a region of interest while guided with a [livewire segmentation technique](http://en.wikipedia.org/wiki/Livewire_Segmentation_Technique).

#### DWV-URS-UI-013 Image filtering
The user can filter the input image using thresholding, contrast enhancement and contour extraction filters.

#### DWV-URS-UI-014 Undo/Redo
The user can undo/redo all effects of tools using `CRTL-Z` and `CRTL-Y` or special buttons on touch enabled devices.

## Epics

Following are requirements relevant to the usage of DICOM data produced by an image acquisition machine.

### Patient access/share DICOM
> As a patient, I want to have access to my DICOM files and share them.

Examples:
 * patient shares DICOM with doctor for (second) opinion
 * patient shares DICOM anonymously with hospital/group/company for clinical trial, AI training...

### Doctor access/share DICOM
> As a doctor, I want to have access to a patient DICOM files (with his agreement), have the possibility to annotate them and optionally share them.

Examples:
 * doctor views and annotates DICOM to give opinion
 * doctor shares DICOM with other doctor for (second) opinion
 * doctor shares DICOM anonymously with hospital/group/company for image analysis
 * doctor shares annotated DICOM anonymously with hospital/group/company for clinical trial, AI training...
 * doctor shares (annotated) DICOM anonymously with public for educational purposes (web, blog, special app...)

### Solution
The DICOM data could be uploaded to a private cloud storage with the patient owning it. The storage could be a generic one (for example Google Drive) or a specific medical one (for example a hospital HIS with external access). A storage system that wants to meet the previous requirements would need to implement the following:
 * a DICOM Web Viewer to view data
 * a DICOM Web Annotator to add annotations to data
 * a DICOM Web Anonymiser to view/download anonymous data 

Each functionality being accessible via access rights such as view, annotate and download decided at the moment of sharing the data. View and annotate could be done live between multiple users. Download can only be done anonymously to avoid a data breach.

## Reference
 * [numbering](http://scietec.blogspot.com.es/2011/11/automatic-requirements-numbering.html), [numbering traps](http://www.smartmatix.com/Resources/RQMTipsTraps/NumberingTraps.aspx)
