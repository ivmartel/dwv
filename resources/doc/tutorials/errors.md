This page lists the possible error thrown by the application with some explanation and a possible quick fix.

## Not a valid DICOM file 

Message: `Not a valid DICOM file (no magic DICM word found)`

Context: Loading a DICOM file.

All DICOM files should start with the DICOM prefix `DICM` (see [DICOM File Meta Information](http://dicom.nema.org/dicom/2013/output/chtml/part10/chapter_7.html#sect_7.1)). If not, it is not a valid DICOM. 

To fix the data you can use tolerant conversion tools such as [gdcm](http://gdcm.sourceforge.net/wiki/index.php/Main_Page). Convert the data to raw with `gdcmconv --raw -i {in-dcm_file_path} -o {out-dcm_file_path}`.

## RequestError

Message: `RequestError: An error occurred while reading 'file.dcm' (http status: 0) [DicomDataLoader].`

Context: Loading a DICOM file.

The data cannot be accessed, either because it does not exist, there has been a problem while transmitting it or because you do not have access permission to it. 

The debug window of your browser should give you more info of the reason why the request did not succeed.

One possible reason for permission denial can be related to [Same origin policy](http://en.wikipedia.org/wiki/Same-origin_policy). It forbids pages on different domains to access each others' data. Check your browser log for: 'Cross-Origin Request Blocked' in Firefox or 'No Access-Control-Allow-Origin' in Chrome. DWV should be hosted on the same server as the data or you need to enable Cross-Origin Resource Sharing (CORS), see [enable-cors.org](http://enable-cors.org/) for details.

The same happens when accessing local file(s) from the dwv url. For development purposes, check this page: [How-to-run-things-locally](https://threejs.org/docs/#manual/introduction/How-to-run-things-locally) on the three.js wiki. I recommend using a local web server such as node's [http-server](https://www.npmjs.com/package/http-server).

## XMLHttpRequest cannot load file (non DICOM)

Console error message (Google Chrome): `XMLHttpRequest cannot load file:///G:/devel/src/local/dwv/devel/dwv/locales/fr/translation.json. Cross origin requests are only supported for protocol schemes: http, data, chrome, chrome-extension, https.`

Console error message (Mozilla Firefox): `Failed to execute ‘postMessage’ on ‘DOMWindow’: The target origin provided (‘null’) does not match the recipient window’s origin (‘null’).`

Context: Loading a viewer `index.html` file directly in a browser.

The default viewers use external files to translate strings and for the configuration of the overlay information. It is recommended to run dwv from a local web server. The other solution is to deactivate translation and configurable overlays.

## Cannot append a slice

Message: `Cannot append a slice with different ...` (number of columns, number of rows, photometric interpretation...).

Context: Loading multiple DICOM files.

Before appending a slice to a volume, dwv checks their compatibility by comparing some of their tags. If not equal, dwv will send this error. It is most often because more than one study were mixed in one folder. The tags that are checked are: number of columns, number of rows, photometric interpretation, modality, study instance UID, series instance UID, bits stored and pixel representation.