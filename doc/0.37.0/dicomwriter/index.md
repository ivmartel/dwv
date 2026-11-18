---
title: DicomWriter
kind: class
longname: DicomWriter
description: DICOM writer.
---

# DicomWriter

<SourceLink href="/source/src/dicom/dicomwriter-js/#L526" label="dicomWriter.js:526" />

DICOM writer.

**Example**

<Playground providers="codepen">
  ```js
  import {DicomParser, DicomWriter} from '//esm.sh/dwv';
  // add link to html
  const link = document.createElement("a");
  link.appendChild(document.createTextNode("download"));
  const div = document.getElementById("dwv");
  div.appendChild(link);
  // XMLHttpRequest onload callback
  const onload = function (event) {
    const parser = new DicomParser();
    parser.parse(event.target.response);
    // create writer
    const writer = new DicomWriter();
    // get buffer using default rules
    const dicomBuffer = writer.getBuffer(parser.getDicomElements());
    // create blob
    const blob = new Blob([dicomBuffer], {type: 'application/dicom'});
    // add blob to download link
    link.href = URL.createObjectURL(blob);
    link.download = "anonym.dcm";
  };
  // DICOM file request
  const request = new XMLHttpRequest();
  const url = 'https://raw.githubusercontent.com/ivmartel/dwv/master/tests/data/bbmri-53323851.dcm';
  request.open('GET', url);
  request.responseType = 'arraybuffer';
  request.onload = onload;
  request.send();
  ```
</Playground>

---

## Constructor

<Signature code="new DicomWriter(): DicomWriter" />

---

## Instance Methods

<MemberHeading id="setuseunvrforprivatesq" depth="3" name="setUseUnVrForPrivateSq" sig="setUseUnVrForPrivateSq(flag: boolean)" />

<MemberMeta sourceHref="/source/src/dicom/dicomwriter-js/#L610" sourceLabel="dicomWriter.js:610" />

Set the use UN VR for private sequence flag.

**Parameters**

- `flag` (boolean) — True to use UN VR.

<MemberHeading id="setfixunknownvr" depth="3" name="setFixUnknownVR" sig="setFixUnknownVR(flag: boolean)" />

<MemberMeta sourceHref="/source/src/dicom/dicomwriter-js/#L619" sourceLabel="dicomWriter.js:619" />

Set the vr=UN check and fix flag.

**Parameters**

- `flag` (boolean) — True to activate the check and fix.

<MemberHeading id="setprivatetagswhitelist" depth="3" name="setPrivateTagsWhitelist" sig="setPrivateTagsWhitelist(keys: Array.<string> | undefined)" />

<MemberMeta sourceHref="/source/src/dicom/dicomwriter-js/#L636" sourceLabel="dicomWriter.js:636" />

Set the list of private tags (odd group number) to write. All other private tags are not written, including the ones in sequence items. Takes precedence over the writing rules, whitelisted tags still go through them. The private creator of each whitelisted tag is also kept: for example, whitelisting '0019100C' also keeps '00190010'. Use an empty list to remove all private tags and undefined to keep them all (default).

**Parameters**

- `keys` (Array.\<string> | undefined) — The list of private tag keys (as '########').

<MemberHeading
  id="setrules"
  depth="3"
  name="setRules"
  sig="setRules(
	rules: Record.<string, WriterRule>,
	addMissingTags?: boolean,
)"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomwriter-js/#L679" sourceLabel="dicomWriter.js:679" />

Set the writing rules. List of writer rules indexed by either `default`, tag key (for example '00100010') or group key (for example '0010'). Keys can be ranges using 'x' as any hex digit, as in the DICOM standard repeating groups notation: for example '60xx3000' (tag range) or '50xx' (group range). Note that 'x' matches any hex digit: '60xx' also matches odd (private) groups. Each DICOM element will be checked to see if a rule is applicable. First checked by tag key, tag range, group key and then group range, if nothing is found the default rule is applied. If several ranges match, the most specific one (with less 'x') is used, and, for same specificity, the first one in the rules order. Rules are also applied to the elements of sequence items. Use `translateWriterRules` to convert tag or group name based rules. Rules with an unknown action are ignored (with a warning), the next matching rule is then used. If there is no valid default rule, the default is to copy.

**Parameters**

- `rules` (Record.\<string, [WriterRule](/writerrule)>) — The input rules.
- `addMissingTags` (boolean, optional) — If true, explicit tags that have replace rule and a value will be added if missing. Defaults to false.

<MemberHeading id="usespecialtextencoder" depth="3" name="useSpecialTextEncoder" sig="useSpecialTextEncoder()" />

<MemberMeta sourceHref="/source/src/dicom/dicomwriter-js/#L759" sourceLabel="dicomWriter.js:759" />

Use a TextEncoder instead of the default text decoder.

<MemberHeading id="getelementtowrite" depth="3" name="getElementToWrite" sig="getElementToWrite(element: DataElement): DataElement | null" />

<MemberMeta sourceHref="/source/src/dicom/dicomwriter-js/#L780" sourceLabel="dicomWriter.js:780" />

Get the element to write according to the class rules. Priority order: tag key, tag range, group key, group range, default. Non whitelisted private tags are removed if a whitelist is set, whatever the rules. For sequences, rules are also applied to the item elements.

**Parameters**

- `element` ([DataElement](/dataelement)) — The element to check.

**Returns**

- [`DataElement`](/dataelement)` | null` — The element to write, can be null.

<MemberHeading
  id="getbuffer"
  depth="3"
  name="getBuffer"
  sig="getBuffer(
	dataElements: Record.<string, DataElement>,
): ArrayBuffer"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomwriter-js/#L1183" sourceLabel="dicomWriter.js:1183" />

Get the ArrayBuffer corresponding to input DICOM elements.

**Parameters**

- `dataElements` (Record.\<string, [DataElement](/dataelement)>) — The elements to write.

**Returns**

- `ArrayBuffer` — The elements as a buffer.
