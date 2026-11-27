This page is part of the dwv [architecture](/tutorials/architecture) description and
describes the dwv tools and commands.

Summary:

- [Tools](#tools)
- [Commands](#commands)

## Tools

The concrete tools ({@link WindowLevel}, {@link Scroll}, {@link ZoomAndPan},
{@link Opacity}, {@link Draw}, {@link Brush}, {@link Filter},
{@link Floodfill}, {@link Livewire}) are registered in `src/tools/toolList.js`.
They extend `LayerGroupPointer`, which normalises pointer and touch input
into a drag lifecycle. It is *composed* (not subclassed) from pluggable
behaviors found in `src/tools/behaviors/`: `dragBehavior`, `wheelBehavior`,
`hoverBehavior`, `doubleClickBehavior`, `tapBehavior`, `twoTouchBehavior`, plus
draw, brush, floodfill and livewire specific variants.

The `src/tools/shapes/` folder holds the geometric shape classes and the
[Konva](https://konvajs.org/) renderers used by the `Draw` and `Brush` tools
(rectangle, ellipse, circle, arrow, ruler, protractor, ROI, bidimensional,
plus label, anchor and editor helpers).

The {@link ToolboxController} binds the events of a layer group to the
selected tool.

## Commands

Tools never mutate state directly: they create command objects
(`src/command/`: `AddAnnotationCommand`, `RemoveAnnotationCommand`,
`UpdateAnnotationCommand`, `DrawBrushCommand`, `RunFilterCommand`,
`DeleteSegmentCommand`, `ChangeSegmentColourCommand`) and push them through
[UndoController::addToUndoStack]{@link UndoController#addToUndoStack}, so
all edits can be undone via the {@link UndoStack}.
