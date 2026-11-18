---
title: ChangeSegmentColourCommand
kind: class
longname: ChangeSegmentColourCommand
description: Change segment colour command.
---

# ChangeSegmentColourCommand

<SourceLink href="/source/src/command/changesegmentcolourcommand-js/#L12" label="changeSegmentColourCommand.js:12" />

Change segment colour command.

---

## Constructor

<Signature
  code="new ChangeSegmentColourCommand(
	mask: MaskImage,
	segment: MaskSegment,
	newColour: RGB | number,
	silent?: boolean,
): ChangeSegmentColourCommand"
/>

**Parameters**

- `mask` ([MaskImage](/maskimage)) — The mask image.
- `segment` ([MaskSegment](/masksegment)) — The segment to modify.
- `newColour` ([RGB](/rgb) | number) — The new segment colour.
- `silent` (boolean, optional) — Whether to send a creation event or not.

---

## Instance Methods

<MemberHeading id="getname" depth="3" name="getName" sig="getName(): string" />

<MemberMeta sourceHref="/source/src/command/changesegmentcolourcommand-js/#L83" sourceLabel="changeSegmentColourCommand.js:83" />

Get the command name.

**Returns**

- `string` — The command name.

<MemberHeading id="isvalid" depth="3" name="isValid" sig="isValid(): boolean" />

<MemberMeta sourceHref="/source/src/command/changesegmentcolourcommand-js/#L92" sourceLabel="changeSegmentColourCommand.js:92" />

Check if a command is valid and can be executed.

**Returns**

- `boolean` — True if the command is valid.

<MemberHeading id="execute" depth="3" name="execute" sig="execute()" />

<MemberMeta sourceHref="/source/src/command/changesegmentcolourcommand-js/#L105" sourceLabel="changeSegmentColourCommand.js:105" />

Execute the command.

**Fires**

- `ChangeSegmentColourCommand#event:changemasksegmentcolour`

<MemberHeading id="undo" depth="3" name="undo" sig="undo()" />

<MemberMeta sourceHref="/source/src/command/changesegmentcolourcommand-js/#L144" sourceLabel="changeSegmentColourCommand.js:144" />

Undo the command.

**Fires**

- `ChangeSegmentColourCommand#event:changemasksegmentcolour`

<MemberHeading id="onexecute" depth="3" name="onExecute" sig="onExecute(_event: object)" />

<MemberMeta sourceHref="/source/src/command/changesegmentcolourcommand-js/#L181" sourceLabel="changeSegmentColourCommand.js:181" />

Handle an execute event.

**Parameters**

- `_event` (object) — The execute event with type and id.

<MemberHeading id="onundo" depth="3" name="onUndo" sig="onUndo(_event: object)" />

<MemberMeta sourceHref="/source/src/command/changesegmentcolourcommand-js/#L190" sourceLabel="changeSegmentColourCommand.js:190" />

Handle an undo event.

**Parameters**

- `_event` (object) — The undo event with type and id.

## Events

<MemberHeading id="changemasksegmentcolour" depth="3" name="changemasksegmentcolour" sig="changemasksegmentcolour: object" />

<MemberMeta badges="event" sourceHref="/source/src/command/changesegmentcolourcommand-js/#L131" sourceLabel="changeSegmentColourCommand.js:131" />

Segment delete event.

**Properties**

- `segmentnumber` (number) — The segment number.

<MemberHeading id="changemasksegmentcolour" depth="3" name="changemasksegmentcolour" sig="changemasksegmentcolour: object" />

<MemberMeta badges="event" sourceHref="/source/src/command/changesegmentcolourcommand-js/#L169" sourceLabel="changeSegmentColourCommand.js:169" />

Segment redraw event.

**Properties**

- `segmentnumber` (number) — The segment number.
