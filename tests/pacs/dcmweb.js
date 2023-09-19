// Do not warn if these variables were not defined before.
/* global dwv */

// call setup on DOM loaded
document.addEventListener('DOMContentLoaded', onDOMContentLoaded);

/**
 * Setup.
 */
function onDOMContentLoaded() {
  const fileinput = document.getElementById('fileinput');
  fileinput.addEventListener('change', launchStow);

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
 * Get the optional token.
 *
 * @returns {string|undefined} The token
 */
function getToken() {
  let token = document.getElementById('token').value;
  if (typeof token !== 'undefined' && token.length === 0) {
    token = undefined;
  }
  return token;
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
      status + ' (' + event.currentTarget.statusText + ') "' +
      event.currentTarget.responseText + '"';
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
  launchQido(url, onSeriesLoad, 'QIDO-RS');
}

// local vars...
const _studiesJson = {};
let _seriesJson = {};
let _loadedSeries;

/**
 * Handle a series QIDO query load.
 *
 * @param {Array} json JSON array data.
 */
function onSeriesLoad(json) {
  // reset locals
  _seriesJson = {};
  _loadedSeries = 0;
  // get instances
  const rootUrl = document.getElementById('rooturl').value;
  for (let i = 0; i < json.length; ++i) {
    const studyUID = json[i]['0020000D'].Value[0];
    const seriesUID = json[i]['0020000E'].Value[0];
    // store
    if (typeof _studiesJson[studyUID] === 'undefined') {
      _studiesJson[studyUID] = [];
    }
    _studiesJson[studyUID].push(json[i]);
    // load instances
    const url = rootUrl +
      '/studies/' + studyUID +
      '/series/' + seriesUID +
      '/instances?';
    launchQido(
      url,
      getOnInstancesLoad(seriesUID, json.length),
      'QIDO-RS[' + i + ']'
    );
  }
}

/**
 * Get an instances QIDO query load handler.
 *
 * @param {string} seriesUID The series UID.
 * @param {number} numberOfSeries The number of series.
 * @returns {Function} The hanlder.
 */
function getOnInstancesLoad(seriesUID, numberOfSeries) {
  return function (json) {
    // store
    if (typeof _seriesJson[seriesUID] !== 'undefined') {
      console.warn('Overwrite series json for ' + seriesUID);
    }
    _seriesJson[seriesUID] = json;
    // display table once all loaded
    ++_loadedSeries;
    if (_loadedSeries === numberOfSeries) {
      qidoResponseToTable(_studiesJson);
    }
  };
}

/**
 * Get the SOPInstanceUID of the thumbnail instance.
 *
 * @param {object} json An instances QIDO query result.
 * @returns {string} The SOPInstanceUID.
 */
function getThumbInstanceUID(json) {
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
  // return SOPInstanceUID
  return json[thumbIndex]['00080018'].Value[0];
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
  const token = getToken();
  if (typeof token !== 'undefined') {
    qidoReq.setRequestHeader('Authorization', 'Bearer ' + token);
  }
  qidoReq.send();
}

/**
 * Launch a STOW request.
 *
 * @type {object} The file input change event.
 */
function launchStow(event) {
  const files = event.target.files;

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

  // files' data
  const data = [];

  // load handler: store data and, when all data is received, launch STOW
  const onload = function (event) {
    // store
    if (data.length < files.length) {
      data.push(event.target.result);
    }
    // if all, launch STOW
    if (data.length === files.length) {
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
      stowReq.open('POST', rootUrl + '/studies');
      stowReq.setRequestHeader('Accept', 'application/dicom+json');
      stowReq.setRequestHeader('Content-Type',
        'multipart/related; type="application/dicom"; boundary=' + boundary);
      const token = getToken();
      if (typeof token !== 'undefined') {
        stowReq.setRequestHeader('Authorization', 'Bearer ' + token);
      }
      stowReq.send(content);
    }
  };

  // launch data requests
  for (let i = 0; i < files.length; ++i) {
    const reader = new FileReader();
    reader.addEventListener('load', onload);
    reader.readAsArrayBuffer(files[i]);
  }
}

/**
 * Show the QIDO response as a table.
 */
function qidoResponseToTable() {
  const viewerUrl = './viewer.html?input=';

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
  insertTCell('Series');
  insertTCell('Modality', '70px');
  insertTCell('Action');

  // table body
  const body = table.createTBody();
  let cell;
  const keys = Object.keys(_studiesJson);
  for (let i = 0; i < keys.length; ++i) {
    const seriesJson = _studiesJson[keys[i]];
    for (let j = 0; j < seriesJson.length; ++j) {
      const serieJson = seriesJson[j];
      const row = body.insertRow();
      // number
      cell = row.insertCell();
      cell.appendChild(document.createTextNode(i + '-' + j));
      // study
      cell = row.insertCell();
      const studyUID = serieJson['0020000D'].Value[0];
      cell.title = studyUID;
      cell.appendChild(document.createTextNode(studyUID));

      // series
      cell = row.insertCell();
      const seriesUID = serieJson['0020000E'].Value[0];
      cell.title = seriesUID;
      cell.appendChild(document.createTextNode(seriesUID));
      // modality
      cell = row.insertCell();
      const modality = serieJson['00080060'].Value[0];
      cell.appendChild(document.createTextNode(modality));
      // action
      cell = row.insertCell();

      const rootUrl = document.getElementById('rooturl').value;
      const seriesUrl = rootUrl +
      '/studies/' + studyUID +
      '/series/' + seriesUID;
      const thumbInstanceUID = getThumbInstanceUID(_seriesJson[seriesUID]);
      const thumbUrl = seriesUrl +
        '/instances/' + thumbInstanceUID +
        '/rendered?viewport=64,64';

      const multipartLink = document.createElement('a');
      multipartLink.href = viewerUrl + seriesUrl;
      multipartLink.target = '_blank';
      cell.appendChild(multipartLink);

      // add thumbnail to link

      // no default accept in orthanc (?)
      const options = {
        headers: {
          Accept: 'image/png'
        }
      };
      const token = getToken();
      if (typeof token !== 'undefined') {
        options.headers['Authorization'] = 'Bearer ' + token;
      }
      // store a cookie with accept and token to allow opening in viewer
      // (should be deleted in viewer.js...)
      multipartLink.onclick = function () {
        document.cookie = 'accept=' +
          encodeURIComponent(
            'multipart/related; type="application/dicom"; transfer-syntax=*;'
          ) + '; ';
        if (typeof token !== 'undefined') {
          document.cookie = 'access_token=' + token + '; ';
        }
        document.cookie = 'samesite=strict; ';
      };

      fetch(thumbUrl, options)
        .then(res => res.blob())
        .then(blob => {
          const img = document.createElement('img');
          img.src = URL.createObjectURL(blob);
          // force width in case viewport option is not supported
          img.width = 64;
          multipartLink.appendChild(img);
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
