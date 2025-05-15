import {
  logger,
  ViewConfig,
  AppOptions,
  App
} from 'dwv';

/**
 * Application GUI.
 *
 * Snapshots were created using synedra View Personal ({@link http://www.synedra.com}),
 *  version 14 for Microsoft Windows:
 * - Right click on the thumbnail in the left 'Document tree area',
 * - Choose 'Convert to JPEG'.
 */

/**
 * Initialise dwv.
 */
export function initDwv() {
  // logger level (optional)
  logger.level = logger.levels.DEBUG;
};

/**
 * Add one data line.
 *
 * @param {number} id The line id.
 * @param {object} doc Individual data.
 */
function addDataLine(id, doc) {
  const fileroot = doc.fileroot;

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
  const viewConfig0 = new ViewConfig(layConDiv.id);
  const viewConfigs = {0: [viewConfig0]};
  const options = new AppOptions(viewConfigs);
  const url = '../data/' + fileroot + '.dcm';
  const app = new App();
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
  for (const key of keys) {
    if (key === 'fileroot') {
      continue;
    }
    const li = document.createElement('li');
    const spanKey = document.createElement('span');
    spanKey.setAttribute('class', 'key');
    spanKey.appendChild(document.createTextNode(key));
    const spanValue = document.createElement('span');
    spanValue.setAttribute('class', 'value');
    spanValue.appendChild(document.createTextNode(doc[key]));
    if (key === 'origin') {
      const spanOrig = document.createElement('span');
      spanOrig.setAttribute('class', 'path');
      spanOrig.setAttribute('title', doc.path);
      spanOrig.appendChild(document.createTextNode(doc[key]));
      li.appendChild(spanKey);
      li.appendChild(document.createTextNode(': '));
      li.appendChild(spanOrig);
      docUl.appendChild(li);
    } else if (key === 'path') {
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

/**
 * Add all data lines.
 *
 * @param {object} data Full demo data.
 */
export function addDataLines(data) {
  for (let i = 0; i < data.length; ++i) {
    addDataLine(i, data[i]);
  }
}
