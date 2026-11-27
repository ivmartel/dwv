This page is part of the dwv [architecture](/tutorials/architecture) description and
describes the dwv application and its controllers.

Summary:

- [App](#app)
- [Controllers](#controllers)

## App

The {@link App} class (`src/app/application.js`) is the public facade and
central event bus, but it does not do the work itself: [App::init]{@link App#init}
creates and wires five controllers. Most of the `App` own methods are thin
forwarding wrappers, deprecated since v0.37: the controllers, reachable via
`app.getLoadController()`, `app.getDataController()`... are the recommended API.

## Controllers

- `LoadController`: picks a {@link FilesLoader}, {@link UrlsLoader} or
  {@link MemoryLoader} based on the input type and re-dispatches their load
  events tagged with the `loadid`. The `App` then adds the items to the
  data controller, adds the data ids to the events and fires `loaddata`
  for each new data. See [data load](/tutorials/arch-data-load#load-sequence).
- {@link DataController}: owns the `dataId` indexed list of {@link DicomData}.
  It inspects the Modality and pixel data presence to route parsed data to
  the `ImageFactory`, the {@link MaskFactory} (Modality `SEG`), the
  {@link AnnotationGroupFactory} (Modality `SR`) or the {@link RtStructFactory}
  (Modality `RTSTRUCT`, rasterizes contours against an already loaded
  reference series). It also handles
  [multi-volume / 4D data](/tutorials/arch-data-load#multi-volume-data),
  buffering same-origin slices until the load completes.
- {@link StageController}: owns the single {@link Stage} (all layer groups
  and layers). It creates the {@link View}s via the {@link ViewFactory} at
  render time (one `View` per layer, even for a shared {@link Image}), builds
  the {@link ViewLayer}s and {@link DrawLayer}s, and keeps each stored
  {@link ViewConfig} in sync with user-driven window/level, opacity and
  colour map changes. See [layout](/tutorials/arch-layout).
- {@link ToolboxController}: holds the tool instances, tracks the selected
  tool and binds a layer group's pointer and keyboard events to the active
  tool. See [tools](/tutorials/arch-tools).
- {@link UndoController}: a thin wrapper around the {@link UndoStack}.

The {@link ViewController} (per view layer, wraps one {@link View} and a
{@link PlaneHelper}) and the {@link DrawController} (per draw layer, wraps one
{@link AnnotationGroup} and routes edits through undoable commands) are
created inside the {@link ViewLayer} and {@link DrawLayer} respectively, not
by the `App` directly.
