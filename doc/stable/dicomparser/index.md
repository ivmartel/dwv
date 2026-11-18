---
title: DicomParser
kind: class
longname: DicomParser
description: DicomParser class.
---

# DicomParser

<SourceLink href="/source/src/dicom/dicomparser-js/#L675" label="dicomParser.js:675" />

DicomParser class.

**Example**

<Playground providers="codepen">
  ```js
  import {DicomParser} from '//esm.sh/dwv';
  // XMLHttpRequest onload callback
  const onload = function (event) {
    // setup the dicom parser
    const dicomParser = new DicomParser();
    // parse the buffer
    dicomParser.parse(event.target.response);
    // get the dicom tags
    const tags = dicomParser.getDicomElements();
    // display the modality
    const div = document.getElementById('dwv');
    div.appendChild(document.createTextNode(
      'Modality: ' + tags['00080060'].value[0]
    ));
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

<Signature code="new DicomParser(): DicomParser" />

---

## Instance Methods

<MemberHeading id="getdefaultcharacterset" depth="3" name="getDefaultCharacterSet" sig="getDefaultCharacterSet(): string" />

<MemberMeta sourceHref="/source/src/dicom/dicomparser-js/#L740" sourceLabel="dicomParser.js:740" />

Get the default character set.

**Returns**

- `string` — The default character set.

<MemberHeading id="setdefaultcharacterset" depth="3" name="setDefaultCharacterSet" sig="setDefaultCharacterSet(characterSet: string)" />

<MemberMeta sourceHref="/source/src/dicom/dicomparser-js/#L749" sourceLabel="dicomParser.js:749" />

Set the default character set.

**Parameters**

- `characterSet` (string) — The input character set.

<MemberHeading id="setdecodercharacterset" depth="3" name="setDecoderCharacterSet" sig="setDecoderCharacterSet(characterSet: string)" />

<MemberMeta sourceHref="/source/src/dicom/dicomparser-js/#L758" sourceLabel="dicomParser.js:758" />

Set the text decoder character set.

**Parameters**

- `characterSet` (string) — The input character set.

<MemberHeading id="getdicomelements" depth="3" name="getDicomElements" sig="getDicomElements(): Record.<string, DataElement>" />

<MemberMeta sourceHref="/source/src/dicom/dicomparser-js/#L776" sourceLabel="dicomParser.js:776" />

Get the DICOM data elements.

**Returns**

- `Record.<string, `[`DataElement`](/dataelement)`>` — The data elements.

<MemberHeading id="safeget" depth="3" name="safeGet" sig="safeGet(key: string): any | undefined" />

<MemberMeta sourceHref="/source/src/dicom/dicomparser-js/#L786" sourceLabel="dicomParser.js:786" />

Safely get an elements' first value from the parsed elements.

**Parameters**

- `key` (string) — The tag key as for example '00100020'.

**Returns**

- `any | undefined` — The elements' value or undefined.

<MemberHeading id="parse" depth="3" name="parse" sig="parse(buffer: ArrayBuffer, untilTag?: Tag)" />

<MemberMeta sourceHref="/source/src/dicom/dicomparser-js/#L1290" sourceLabel="dicomParser.js:1290" />

Parse a DICOM buffer. Fills in the member object 'dataElements'.

**Parameters**

- `buffer` (ArrayBuffer) — The input array buffer.
- `untilTag` ([Tag](/tag), optional) — Optional tag to stop the parsing once reached.
