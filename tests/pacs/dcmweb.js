// Do not warn if these variables were not defined before.
/* global dwv */

// call setup on DOM loaded
document.addEventListener('DOMContentLoaded', onDOMContentLoaded);

/**
 * Setup.
 */
function onDOMContentLoaded() {
  const stowButton = document.getElementById('stowbutton');
  stowButton.onclick = launchStow;

  const searchButton = document.getElementById('qidobutton');
  searchButton.onclick = launchMainQido;
}

/**
 * Show a message.
 *
 * @param {string} text The text message.
 * @param {string} [type] The message type used as css class.
 */
function showMessage(text, type) {
  const p = document.createElement('p');
  p.className = 'message ' + type;
  p.appendChild(document.createTextNode(text));

  const div = document.getElementById('result');
  div.appendChild(p);
}

/**
 * Check a response event and print error if any.
 *
 * @param {object} event The load event.
 * @param {string} reqName The request name.
 * @returns {boolean} True if response is ok.
 */
function checkResponseEvent(event, reqName) {
  let res = true;

  let message;
  const status = event.currentTarget.status;
  if (status !== 200 && status !== 204) {
    message = 'Bad status for request ' + reqName + ': ' +
      status + ' (' + event.currentTarget.statusText + ').';
    showMessage(message, 'error');
    res = false;
  } else if (status === 204 ||
    !event.target.response ||
    typeof event.target.response === 'undefined') {
    message = 'No content for request ' + reqName;
    showMessage(message);
    res = false;
  }
  return res;
}

/**
 * Get a load error handler.
 *
 * @param {string} reqName The request name.
 * @returns {Function} The error handler.
 */
function getOnLoadError(reqName) {
  // message
  const message = 'Error in request ' + reqName + ', see console for details.';

  return function (event) {
    console.error(message, event);
    showMessage(message, 'error');
  };
}

/**
 * Launch main QIDO query to retrieve series.
 */
function launchMainQido() {
  // clear result div
  const div = document.getElementById('result');
  div.innerHTML = '';
  // launch
  const url = document.getElementById('rooturl').value +
    document.getElementById('qidoArgs').value;
  launchQido(url, onMainQidoLoad, 'QIDO-RS');
}

// local vars...
let _mainJson;
let _loadedInstances;

/**
 * Handle the data loaded by the main QIDO query.
 *
 * @param {Array} json JSON array data.
 */
function onMainQidoLoad(json) {
  // update locals
  _mainJson = json;
  _loadedInstances = 0;
  // get instances
  const rootUrl = document.getElementById('rooturl').value;
  for (let i = 0; i < json.length; ++i) {
    const study = json[i]['0020000D'].Value[0];
    const series = json[i]['0020000E'].Value[0];
    const url = rootUrl +
      'studies/' + study +
      '/series/' + series +
      '/instances?';
    launchQido(url, getOnInstanceLoad(i), 'QIDO-RS[' + i + ']');
  }
}

/**
 * Get an instance load handler.
 *
 * @param {number} i The id of the load.
 * @returns {Function} The hanlder.
 */
function getOnInstanceLoad(i) {
  return function (json) {
    // extract list of instance numbers
    // (carefull, optional tag...)
    const numbers = [];
    for (let i = 0; i < json.length; ++i) {
      const elem = json[i]['00200013']; // instance number
      if (typeof elem !== 'undefined') {
        numbers.push({
          index: i,
          number: elem.Value[0]
        });
      }
    }
    // default middle index
    let thumbIndex = Math.floor(json.length / 2);
    // sort using instance number and get middle index
    if (numbers.length === json.length) {
      numbers.sort(function (a, b) {
        return a.number - b.number;
      });
      thumbIndex = numbers[Math.floor(numbers.length / 2)].index;
    }
    // store thumbnail instance
    _mainJson[i].thumbInstance = json[thumbIndex]['00080018'].Value[0];
    // display table once all loaded
    ++_loadedInstances;
    if (_loadedInstances === _mainJson.length) {
      qidoResponseToTable(_mainJson);
    }
  };
}

/**
 * Launch a QIDO request.
 *
 * @param {string} url The url of the request.
 * @param {Function} loadCallback The load callback.
 * @param {string} reqName The request name.
 */
function launchQido(url, loadCallback, reqName) {
  const qidoReq = new XMLHttpRequest();
  qidoReq.addEventListener('load', function (event) {
    // check
    if (!checkResponseEvent(event, reqName)) {
      return;
    }
    // parse json
    const json = JSON.parse(event.target.response);
    if (json.length === 0) {
      showMessage('Empty result for request ' + reqName);
      return;
    }
    // callback
    loadCallback(json);
  });
  qidoReq.addEventListener('error', getOnLoadError(reqName));

  qidoReq.open('GET', url);
  qidoReq.setRequestHeader('Accept', 'application/dicom+json');
  qidoReq.send();
}

/**
 * Launch a STOW request.
 */
function launchStow() {
  const reqName = 'STOW-RS';
  const stowReq = new XMLHttpRequest();
  let message;
  stowReq.addEventListener('load', function (event) {
    // check
    if (!checkResponseEvent(event, reqName)) {
      return;
    }
    // parse json
    message = 'STOW-RS successful!!';
    showMessage(message, 'success');
  });
  stowReq.addEventListener('error', getOnLoadError(reqName));

  // local files to request
  const urls = [
    '../data/bbmri-53323131.dcm',
    '../data/bbmri-53323275.dcm',
    '../data/bbmri-53323419.dcm'
  ];
  // files' data
  const data = [];

  // load handler: store data and, when all data is received, launch STOW
  const onload = function (event) {
    // store
    if (data.length < urls.length) {
      data.push(event.target.response);
    }

    // if all, launch STOW
    if (data.length === urls.length) {
      // bundle data in multipart
      const parts = [];
      for (let j = 0; j < data.length; ++j) {
        parts.push({
          'Content-Type': 'application/dicom',
          data: new Uint8Array(data[j])
        });
      }
      const boundary = '----dwttestboundary';
      const content = dwv.buildMultipart(parts, boundary);

      // STOW request
      const rootUrl = document.getElementById('rooturl').value;
      stowReq.open('POST', rootUrl + 'studies');
      stowReq.setRequestHeader('Accept', 'application/dicom+json');
      stowReq.setRequestHeader('Content-Type',
        'multipart/related; type="application/dicom"; boundary=' + boundary);
      stowReq.send(content);
    }
  };

  // launch data requests
  for (let i = 0; i < urls.length; ++i) {
    const req = new XMLHttpRequest();
    req.open('GET', urls[i]);
    req.responseType = 'arraybuffer';
    req.addEventListener('load', onload);
    req.send();
  }
}

/**
 * Show the QIDO response as a table.
 *
 * @param {Array} json The qido response as json object.
 */
function qidoResponseToTable(json) {
  const viewerUrl = './viewer.html?input=';

  const hasSeries = typeof json[0]['0020000E'] !== 'undefined';

  const table = document.createElement('table');
  table.id = 'series-table';

  // table header
  const header = table.createTHead();
  const trow = header.insertRow(0);
  const insertTCell = function (text, width) {
    const th = document.createElement('th');
    if (typeof width !== 'undefined') {
      th.width = width;
    }
    th.innerHTML = text;
    trow.appendChild(th);
  };
  insertTCell('#', '40px');
  insertTCell('Study');
  if (hasSeries) {
    insertTCell('Series');
    insertTCell('Modality', '70px');
    insertTCell('Action');
  }

  // table body
  const body = table.createTBody();
  let cell;
  for (let i = 0; i < json.length; ++i) {
    const row = body.insertRow();
    // number
    cell = row.insertCell();
    cell.appendChild(document.createTextNode(i));
    // study
    cell = row.insertCell();
    const studyUid = json[i]['0020000D'].Value[0];
    cell.title = studyUid;
    cell.appendChild(document.createTextNode(studyUid));

    if (hasSeries) {
      // series
      cell = row.insertCell();
      const seriesUid = json[i]['0020000E'].Value[0];
      cell.title = seriesUid;
      cell.appendChild(document.createTextNode(seriesUid));
      // modality
      cell = row.insertCell();
      cell.appendChild(document.createTextNode(json[i]['00080060'].Value[0]));
      // action
      cell = row.insertCell();
      const a = document.createElement('a');
      a.href = viewerUrl + json[i]['00081190'].Value[0];
      a.target = '_blank';
      cell.appendChild(a);

      // add thumbnail to link
      const rootUrl = document.getElementById('rooturl').value;
      const url = rootUrl +
        'studies/' + studyUid +
        '/series/' + seriesUid +
        '/instances/' + json[i].thumbInstance +
        '/rendered?viewport=64,64';
      // no default accept in orthanc (?)
      const options = {
        headers: {
          Accept: 'image/png'
        }
      };
      fetch(url, options)
        .then(res => res.blob())
        .then(blob => {
          const img = document.createElement('img');
          img.src = URL.createObjectURL(blob);
          a.appendChild(img);
        });
    }
  }

  const p = document.createElement('p');
  p.style.fontStyle = 'italic';
  p.appendChild(document.createTextNode(
    '(Click a thumbnail to launch the viewer)'
  ));

  const div = document.getElementById('result');
  div.appendChild(table);
  div.appendChild(p);
}
