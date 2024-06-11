/**
 * Application GUI.
 *
 * Snapshots were created using synedra View Personal ({@link http://www.synedra.com}),
 *  version 14 for Microsoft Windows:
 * - Right click on the thumbnail in the left 'Document tree area',
 * - Choose 'Convert to JPEG'.
 */
// Do not warn if these variables were not defined before.
/* global dwv */

// namespace
// eslint-disable-next-line no-var
var test = test || {};

// initialise dwv
test.initDwv = function () {
  // logger level (optional)
  dwv.logger.level = dwv.logger.levels.DEBUG;
  // image decoders (for web workers)
  dwv.decoderScripts.jpeg2000 =
    '../../decoders/pdfjs/decode-jpeg2000.js';
  dwv.decoderScripts['jpeg-lossless'] =
    '../../decoders/rii-mango/decode-jpegloss.js';
  dwv.decoderScripts['jpeg-baseline'] =
    '../../decoders/pdfjs/decode-jpegbaseline.js';
  dwv.decoderScripts.rle =
    '../../decoders/dwv/decode-rle.js';
};

// test data line
test.addDataLine = function (id, fileroot, doc) {

  const mainDiv = document.getElementById('data-lines');

  // dwv container
  const dwvDiv = document.createElement('div');
  dwvDiv.id = 'dwv' + id;
  dwvDiv.className = 'dwv';
  const layConDiv = document.createElement('div');
  layConDiv.id = 'layerGroup' + id;
  layConDiv.className = 'layerGroup';
  dwvDiv.appendChild(layConDiv);
  mainDiv.appendChild(dwvDiv);

  // dwv application
  const viewConfig0 = new dwv.ViewConfig(layConDiv.id);
  const viewConfigs = {0: [viewConfig0]};
  const options = new dwv.AppOptions(viewConfigs);
  const url = '../data/' + fileroot + '.dcm';
  const app = new dwv.App();
  app.init(options);
  // display loading time
  const listener = function (event) {
    const timerLabel = 'load-data[' + fileroot + ']';
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
  const image = document.createElement('img');
  image.src = './images/' + fileroot + '.jpg';
  image.setAttribute('class', 'snapshot');
  mainDiv.appendChild(image);

  // doc
  const docDiv = document.createElement('div');
  docDiv.setAttribute('class', 'doc');
  const docUl = document.createElement('ul');
  const keys = Object.keys(doc);
  for (let i = 0; i < keys.length; ++i) {
    const li = document.createElement('li');
    const spanKey = document.createElement('span');
    spanKey.setAttribute('class', 'key');
    spanKey.appendChild(document.createTextNode(keys[i]));
    const spanValue = document.createElement('span');
    spanValue.setAttribute('class', 'value');
    spanValue.appendChild(document.createTextNode(doc[keys[i]]));
    if (keys[i] === 'origin') {

      const spanOrig = document.createElement('span');
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
  const sepDiv = document.createElement('div');
  sepDiv.setAttribute('class', 'separator');
  mainDiv.appendChild(sepDiv);
};
