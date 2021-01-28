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

## Bower

Bower is a package manager for web components: it downloads them and puts them in a `bower_components` folder that you can then reference in your web page. To install dwv and its dependencies run:

    bower install dwv

The dwv distribution files are then available from the `bower_components/dwv/dist` folder (`dwv.min.js` and `dwv.js`).

During development, you can use local folders. Publicise a folder containing a `bower.json` by calling `bower link` in it (remove it by calling `bower uninstall dwv`). You can then reference it in you project by calling `bower link dwv`.

Links:
 * [Bower](https://bower.io/)
 * `bower.json` [standard](https://github.com/bower/spec/blob/master/json.md)

For development purposes, you can link bower to the dwv source folder, run `bower link` in the root folder. Then call `bower link dwv` in your project folder.

## AMD

AMD is an Asynchronous Module Definition, modules are loaded only when they are needed. The [requirejs](http://requirejs.org) library defines the function needed to use AMD (see its [API](http://requirejs.org/docs/api.html)). This [repo](https://github.com/volojs/create-template) gives a good example. Dwv can be 'required' by using its file name or directly if it is in the config `baseUrl` :

```javascript
var dwv = require('dwv');
```