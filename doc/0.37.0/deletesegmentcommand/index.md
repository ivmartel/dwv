---
title: DeleteSegmentCommand
kind: class
longname: DeleteSegmentCommand
description: Delete segment command.
---

# DeleteSegmentCommand

<SourceLink href="/source/src/command/deletesegmentcommand-js/#L12" label="deleteSegmentCommand.js:12" />

Delete segment command.

---

## Constructor

<Signature
  code="new DeleteSegmentCommand(
	mask: MaskImage,
	segment: MaskSegment,
	silent?: boolean,
): DeleteSegmentCommand"
/>

**Parameters**

- `mask` ([MaskImage](/maskimage)) — The mask image.
- `segment` ([MaskSegment](/masksegment)) — The segment to remove.
- `silent` (boolean, optional) — Whether to send a creation event or not.

---

## Instance Methods

<MemberHeading id="getname" depth="3" name="getName" sig="getName(): string" />

<MemberMeta sourceHref="/source/src/command/deletesegmentcommand-js/#L65" sourceLabel="deleteSegmentCommand.js:65" />

Get the command name.

**Returns**

- `string` — The command name.

<MemberHeading id="isvalid" depth="3" name="isValid" sig="isValid(): boolean" />

<MemberMeta sourceHref="/source/src/command/deletesegmentcommand-js/#L74" sourceLabel="deleteSegmentCommand.js:74" />

Check if a command is valid and can be executed.

**Returns**

- `boolean` — True if the command is valid.

<MemberHeading id="execute" depth="3" name="execute" sig="execute()" />

<MemberMeta sourceHref="/source/src/command/deletesegmentcommand-js/#L87" sourceLabel="deleteSegmentCommand.js:87" />

Execute the command.

**Fires**

- `DeleteSegmentCommand#event:masksegmentdelete`

<MemberHeading id="undo" depth="3" name="undo" sig="undo()" />

<MemberMeta sourceHref="/source/src/command/deletesegmentcommand-js/#L124" sourceLabel="deleteSegmentCommand.js:124" />

Undo the command.

**Fires**

- `DeleteSegmentCommand#event:masksegmentredraw`

<MemberHeading id="onexecute" depth="3" name="onExecute" sig="onExecute(_event: object)" />

<MemberMeta sourceHref="/source/src/command/deletesegmentcommand-js/#L156" sourceLabel="deleteSegmentCommand.js:156" />

Handle an execute event.

**Parameters**

- `_event` (object) — The execute event with type and id.

<MemberHeading id="onundo" depth="3" name="onUndo" sig="onUndo(_event: object)" />

<MemberMeta sourceHref="/source/src/command/deletesegmentcommand-js/#L165" sourceLabel="deleteSegmentCommand.js:165" />

Handle an undo event.

**Parameters**

- `_event` (object) — The undo event with type and id.

## Events

<MemberHeading id="masksegmentdelete" depth="3" name="masksegmentdelete" sig="masksegmentdelete: object" />

<MemberMeta badges="event" sourceHref="/source/src/command/deletesegmentcommand-js/#L112" sourceLabel="deleteSegmentCommand.js:112" />

Segment delete event.

**Properties**

- `segmentnumber` (number) — The segment number.

<MemberHeading id="masksegmentredraw" depth="3" name="masksegmentredraw" sig="masksegmentredraw: object" />

<MemberMeta badges="event" sourceHref="/source/src/command/deletesegmentcommand-js/#L145" sourceLabel="deleteSegmentCommand.js:145" />

Segment redraw event.

**Properties**

- `segmentnumber` (number) — The segment number.
