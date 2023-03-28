/**
 * Application GUI.
 *
 * Snapshots were created using synedra View Personal (http://www.synedra.com),
 *  version 14 for Microsoft Windows:
 * - Right click on the thumbnail in the left 'Document tree area',
 * - Choose 'Convert to JPEG'.
 */
// Do not warn if these variables were not defined before.
/* global dwv */
var test = test || {};

// initialise dwv
test.initDwv = function () {
  // logger level (optional)
  dwv.logger.level = dwv.logger.levels.DEBUG;
  // image decoders (for web workers)
  dwv.image.decoderScripts.jpeg2000 =
    '../../decoders/pdfjs/decode-jpeg2000.js';
  dwv.image.decoderScripts['jpeg-lossless'] =
    '../../decoders/rii-mango/decode-jpegloss.js';
  dwv.image.decoderScripts['jpeg-baseline'] =
    '../../decoders/pdfjs/decode-jpegbaseline.js';
  dwv.image.decoderScripts.rle =
    '../../decoders/dwv/decode-rle.js';
};

// test data line
test.addDataLine = function (id, fileroot, doc) {

  var mainDiv = document.getElementById('data-lines');

  // dwv container
  var dwvDiv = document.createElement('div');
  dwvDiv.id = 'dwv' + id;
  dwvDiv.className = 'dwv';
  var layConDiv = document.createElement('div');
  layConDiv.id = 'layerGroup' + id;
  layConDiv.className = 'layerGroup';
  dwvDiv.appendChild(layConDiv);
  mainDiv.appendChild(dwvDiv);

  // dwv application
  var config = {
    dataViewConfigs: {0: [{divId: layConDiv.id}]},
  };
  var url = '../data/' + fileroot + '.dcm';
  var app = new dwv.App();
  app.init(config);
  // display loading time
  var listener = function (event) {
    var timerLabel = 'load-data[' + fileroot + ']';
    if (event.type === 'loadstart') {
      console.time(timerLabel);
    } else if (event.type === 'loadend') {
      console.timeEnd(timerLabel);
    }
  };
  app.addEventListener('loadstart', listener);
  app.addEventListener('loadend', listener);
  // load data
  app.loadURLs([url]);

  // image
  var image = document.createElement('img');
  image.src = './images/' + fileroot + '.jpg';
  image.setAttribute('class', 'snapshot');
  mainDiv.appendChild(image);

  // doc
  var docDiv = document.createElement('div');
  docDiv.setAttribute('class', 'doc');
  var docUl = document.createElement('ul');
  var keys = Object.keys(doc);
  for (var i = 0; i < keys.length; ++i) {
    var li = document.createElement('li');
    var spanKey = document.createElement('span');
    spanKey.setAttribute('class', 'key');
    spanKey.appendChild(document.createTextNode(keys[i]));
    var spanValue = document.createElement('span');
    spanValue.setAttribute('class', 'value');
    spanValue.appendChild(document.createTextNode(doc[keys[i]]));
    if (keys[i] === 'origin') {

      var spanOrig = document.createElement('span');
      spanOrig.setAttribute('class', 'path');
      spanOrig.setAttribute('title', doc.path);
      spanOrig.appendChild(document.createTextNode(doc[keys[i]]));
      li.appendChild(spanKey);
      li.appendChild(document.createTextNode(': '));
      li.appendChild(spanOrig);
      docUl.appendChild(li);
    } else if (keys[i] === 'path') {
      // nothing to do
    } else {
      li.appendChild(spanKey);
      li.appendChild(document.createTextNode(': '));
      li.appendChild(spanValue);
      docUl.appendChild(li);
    }
  }
  docDiv.appendChild(docUl);
  mainDiv.appendChild(docDiv);

  // separator
  var sepDiv = document.createElement('div');
  sepDiv.setAttribute('class', 'separator');
  mainDiv.appendChild(sepDiv);
};
