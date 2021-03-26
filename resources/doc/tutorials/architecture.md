This page lists details about the dwv architecture.

## Overview
![archi](architecture-overview.png)

- `App`: main class
- `LoadController`: handles I/O, the first layer handles the source being
  `File`, `Url`, `Memory` and the second one handles data type, `Dicom`, `Zip`
  `rawImage`, `rawVideo` and `json`
- `LayerController`: the layers follow a
  [model-view-controller](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller)
  (MVC) design for the different kinds of layers, 
for now `View` and `Draw`.
- `ToolboxController`: handles tools and dispatches interaction events to the selected
  one
