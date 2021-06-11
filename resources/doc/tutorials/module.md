## Node

Node allows to run javascript without a browser. It could be useful for some none graphical functionality such as the DICOM parsing. To install dwv and its dependencies, run:

```
npm install dwv
```

Once installed you can create a `main.js` file such as:

```javascript
var dwv = require('dwv');
var fs = require('fs');

// read DICOM file
var data = fs.readFileSync('dwv-test-simple.dcm');
// convert data to array buffer
var arrayBuffer = new Uint8Array(data).buffer;
// parse
var dicomParser = new dwv.dicom.DicomParser();
dicomParser.parse(arrayBuffer);
// wrapped tags
var tags = dicomParser.getDicomElements();
// log
console.log(tags.getFromName('PatientName'));
```

To execute it, run:

```
node main.js
```

You can create a test packages by running `npm pack` in a folder containing a `package.json` file. Install it 
by running `npm install my-package.tgz`.

Note: I've not tested all the classes of dwv in node, it is possible some of them use browser provided methods that node does not have. For example dwv.App uses the HTML 'canvas' which can be added by installing a 'node-canvas' (see [help](https://github.com/konvajs/konva#5-nodejs) from Konva). Konva is disabled in the module `intro.js` file. Another one could be the 'XMLHttpRequest'...

Links:
 * [NPM](https://www.npmjs.com/)
 * `package.json` [standard](https://docs.npmjs.com/files/package.json)

For development purposes, you can create your own npm package by calling `npm pack` in the root folder. You can then install it in your project folder using `npm install dwv-#.tgz`.

## AMD

AMD is an Asynchronous Module Definition, modules are loaded only when they are needed. The [requirejs](http://requirejs.org) library defines the function needed to use AMD (see its [API](http://requirejs.org/docs/api.html)). This [repo](https://github.com/volojs/create-template) gives a good example. Dwv can be 'required' by using its file name or directly if it is in the config `baseUrl` :

```javascript
var dwv = require('dwv');
```
