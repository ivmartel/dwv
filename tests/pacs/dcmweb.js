// Do not warn if these variables were not defined before.
/* global dwv */

// call setup on DOM loaded
document.addEventListener('DOMContentLoaded', onDOMContentLoaded);

/**
 * Setup.
 */
function onDOMContentLoaded() {
  const stowButton = document.getElementById('stowb');
  stowButton.onclick = stow;

  const searchButton = document.getElementById('searchb');
  searchButton.onclick = qidoSearch;
}

/**
 * Get a message paragraph.
 *
 * @param {string} text The text message.
 * @param {string} type The message type used as css class.
 * @returns {object} The paragraph element.
 */
function getMessagePara(text, type) {
  const p = document.createElement('p');
  p.className = 'message ' + type;
  p.appendChild(document.createTextNode(text));
  return p;
}

/**
 * Launch a QIDO search on series.
 */
function qidoSearch() {
  // clear page
  const div = document.getElementById('result');
  div.innerHTML = '';

  // qido get list
  const qidoReq = new XMLHttpRequest();
  let message;
  qidoReq.addEventListener('load', function (event) {
    const status = event.currentTarget.status;
    // bad status
    if (status !== 200 && status !== 204) {
      message = 'Bad status in QIDO-RS request: ' +
        status + ' (' + event.currentTarget.statusText + ').';
      div.appendChild(getMessagePara(message, 'error'));
      return;
    }
    // no content
    if (status === 204 ||
      !event.target.response ||
      typeof event.target.response === 'undefined') {
      message = 'No content.';
      div.appendChild(getMessagePara(message));
      return;
    }
    // parse json
    const json = JSON.parse(event.target.response);
    if (json.length === 0) {
      message = 'Empty result.';
      div.appendChild(getMessagePara(message));
      return;
    }
    // fill table
    qidoResponseToTable(json);
  });
  qidoReq.addEventListener('error', function (error) {
    message = 'Error in QIDO-RS request';
    console.error(message, error);
    message += ', see console for details.';
    div.appendChild(getMessagePara(message, 'error'));
  });

  const rootUrl = document.getElementById('rooturl').value;
  const qidoArgs = document.getElementById('qidoArgs').value;
  qidoReq.open('GET', rootUrl + qidoArgs);
  qidoReq.setRequestHeader('Accept', 'application/dicom+json');
  qidoReq.send();
}

/**
 * Launch a STOW request.
 */
function stow() {
  const div = document.getElementById('result');

  const stowReq = new XMLHttpRequest();
  let message;
  stowReq.addEventListener('load', function (event) {
    const status = event.currentTarget.status;
    // bad status
    if (status !== 200 && status !== 204) {
      message = 'Bad status in STOW-RS request: ' +
        status + ' (' + event.currentTarget.statusText + ').';
      div.appendChild(getMessagePara(message, 'error'));
      return;
    }
    // no content
    if (status === 204 ||
      !event.target.response ||
      typeof event.target.response === 'undefined') {
      message = 'No content.';
      div.appendChild(getMessagePara(message));
      return;
    }
    // parse json
    message = 'STOW-RS successful!!';
    div.appendChild(getMessagePara(message, 'success'));
  });
  stowReq.addEventListener('error', function (error) {
    message = 'Error in STOW-RS request';
    console.error(message, error);
    message += ', see console for details.';
    div.appendChild(getMessagePara(message, 'error'));
  });

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
