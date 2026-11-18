---
title: LayerGroupPointerOptions
kind: typedef
longname: LayerGroupPointerOptions
---

# LayerGroupPointerOptions

<SourceLink href="/source/src/tools/layergrouppointer-js/#L70" label="layerGroupPointer.js:70" />

**Properties**

- `stageController` ([StageController](/stagecontroller)) — The stage controller.
- `dragBehavior` ([DragBehavior](/dragbehavior), optional) — Drag behaviour: mouse down / touch start + move + end (mouse or touch).
- `hoverBehavior` ([HoverBehavior](/hoverbehavior), optional) — Hover behaviour: mouse move without click (only mouse).
- `wheelBehavior` ([WheelBehavior](/wheelbehavior), optional) — Mouse wheel handling (only mouse).
- `doubleClickBehavior` ([DoubleClickBehavior](/doubleclickbehavior), optional) — Double-click behaviour, also triggered by long touch.
- `twoTouchBehavior` ([TwoTouchBehavior](/twotouchbehavior), optional) — Two-finger behaviour (only touch).
- `tapBehavior` ([TapBehavior](/tapbehavior), optional) — Tap behaviour: can be one tap or sticky tap for multiple taps (finite or finished with double click). For mouse or touch.
- `longTouchToDblClickMs` (number | null, optional) — After a touchstart on the single-touch path, schedule [LayerGroupPointer#dblclick](/layergrouppointer#dblclick) after this many milliseconds (defaults to 500).

**Type**

`object`
