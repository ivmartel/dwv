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
  searchButton.onclick = launchQido;
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
  div.innerHTML = '';
  div.appendChild(p);
}

/**
 * Check a response event and print error if any.
 *
 * @param {object} event The load event.
 * @param {string} name The context name.
 * @returns {boolean} True if response is ok.
 */
function checkResponseEvent(event, name) {
  let res = true;

  let message;
  const status = event.currentTarget.status;
  if (status !== 200 && status !== 204) {
    message = 'Bad status in ' + name + ' request: ' +
      status + ' (' + event.currentTarget.statusText + ').';
    showMessage(message, 'error');
    res = false;
  } else if (status === 204 ||
    !event.target.response ||
    typeof event.target.response === 'undefined') {
    message = 'No content for ' + name + ' request.';
    showMessage(message);
    res = false;
  }
  return res;
}

/**
 * Get a load error handler.
 *
 * @param {string} name The context name.
 * @returns {Function} The error handler.
 */
function getOnLoadError(name) {
  // message
  const message = 'Error in ' + name + ' request, see console for details.';

  return function (event) {
    console.error(message, event);
    showMessage(message, 'error');
  };
}

/**
 * Launch a QIDO request.
 */
function launchQido() {
  // qido get list
  const qidoReq = new XMLHttpRequest();
  qidoReq.addEventListener('load', function (event) {
    // check
    if (!checkResponseEvent(event, 'QIDO-RS')) {
      return;
    }
    // parse json
    const json = JSON.parse(event.target.response);
    if (json.length === 0) {
      showMessage('Empty result for QIDO-RS request.');
      return;
    }
    // fill table
    qidoResponseToTable(json);
  });
  qidoReq.addEventListener('error', getOnLoadError('QIDO-RS'));

  const rootUrl = document.getElementById('rooturl').value;
  const qidoArgs = document.getElementById('qidoArgs').value;
  qidoReq.open('GET', rootUrl + qidoArgs);
  qidoReq.setRequestHeader('Accept', 'application/dicom+json');
  qidoReq.send();
}

/**
 * Launch a STOW request.
 */
function launchStow() {
  const stowReq = new XMLHttpRequest();
  let message;
  stowReq.addEventListener('load', function (event) {
    // check
    if (!checkResponseEvent(event, 'STOW-RS')) {
      return;
    }
    // parse json
    message = 'STOW-RS successful!!';
    showMessage(message, 'success');
  });
  stowReq.addEventListener('error', getOnLoadError('STOW-RS'));

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
      const content = dwv.utils.buildMultipart(parts, boundary);

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
 * @param {object} json The qido response as json object.
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
    const studyUid = json[i]['0020000D'].Value;
    cell.title = studyUid;
    cell.appendChild(document.createTextNode(studyUid));

    if (hasSeries) {
      // series
      cell = row.insertCell();
      const seriesUid = json[i]['0020000E'].Value;
      cell.title = seriesUid;
      cell.appendChild(document.createTextNode(seriesUid));
      // modality
      cell = row.insertCell();
      cell.appendChild(document.createTextNode(json[i]['00080060'].Value));
      // action
      cell = row.insertCell();
      const a = document.createElement('a');
      a.href = viewerUrl + json[i]['00081190'].Value;
      a.target = '_blank';
      a.appendChild(document.createTextNode('view'));
      cell.appendChild(a);
    }
  }

  const div = document.getElementById('result');
  div.appendChild(table);
}
