var dwv = dwv || {};
dwv.test = dwv.test || {};

/**
 * Get a message paragraph.
 *
 * @param {string} text The text message.
 * @param {string} type The message type used as css class.
 * @returns {object} The paragraph element.
 */
dwv.test.getMessagePara = function (text, type) {
  var p = document.createElement('p');
  p.className = 'message ' + type;
  p.appendChild(document.createTextNode(text));
  return p;
};

/**
 * Launch a QIDO search on series.
 */
dwv.test.qidoSearch = function () {
  // clear page
  var div = document.getElementById('result');
  div.innerHTML = '';

  // qido get list
  var qidoReq = new XMLHttpRequest();
  var message;
  qidoReq.addEventListener('load', function (event) {
    var status = event.currentTarget.status;
    // bad status
    if (status !== 200 && status !== 204) {
      message = 'Bad status in QIDO-RS request: ' +
        status + ' (' + event.currentTarget.statusText + ').';
      div.appendChild(dwv.test.getMessagePara(message, 'error'));
      return;
    }
    // no content
    if (status === 204 ||
      !event.target.response ||
      typeof event.target.response === 'undefined') {
      message = 'No content.';
      div.appendChild(dwv.test.getMessagePara(message));
      return;
    }
    // parse json
    var json = JSON.parse(event.target.response);
    if (json.length === 0) {
      message = 'Empty result.';
      div.appendChild(dwv.test.getMessagePara(message));
      return;
    }
    // fill table
    qidoResponseToTable(json);
  });
  qidoReq.addEventListener('error', function (error) {
    message = 'Error in QIDO-RS request';
    console.error(message, error);
    message += ', see console for details.';
    div.appendChild(dwv.test.getMessagePara(message, 'error'));
  });

  var rootUrl = document.getElementById('rooturl').value;
  var qidoArgs = document.getElementById('qidoArgs').value;
  qidoReq.open('GET', rootUrl + qidoArgs);
  qidoReq.setRequestHeader('Accept', 'application/dicom+json');
  qidoReq.send();
};

/**
 * Launch a STOW request.
 */
dwv.test.stow = function () {
  var div = document.getElementById('result');

  var stowReq = new XMLHttpRequest();
  var message;
  stowReq.addEventListener('load', function (event) {
    var status = event.currentTarget.status;
    // bad status
    if (status !== 200 && status !== 204) {
      message = 'Bad status in STOW-RS request: ' +
        status + ' (' + event.currentTarget.statusText + ').';
      div.appendChild(dwv.test.getMessagePara(message, 'error'));
      return;
    }
    // no content
    if (status === 204 ||
      !event.target.response ||
      typeof event.target.response === 'undefined') {
      message = 'No content.';
      div.appendChild(dwv.test.getMessagePara(message));
      return;
    }
    // parse json
    message = 'STOW-RS successful!!';
    div.appendChild(dwv.test.getMessagePara(message, 'success'));
  });
  stowReq.addEventListener('error', function (error) {
    message = 'Error in STOW-RS request';
    console.error(message, error);
    message += ', see console for details.';
    div.appendChild(dwv.test.getMessagePara(message, 'error'));
  });

  // local files to request
  var urls = [
    '../data/bbmri-53323131.dcm',
    '../data/bbmri-53323275.dcm',
    '../data/bbmri-53323419.dcm'
  ];
  // files' data
  var data = [];

  // load handler: store data and, when all data is received, launch STOW
  var onload = function (event) {
    // store
    if (data.length < urls.length) {
      data.push(event.target.response);
    }

    // if all, launch STOW
    if (data.length === urls.length) {
      // bundle data in multipart
      var parts = [];
      for (var j = 0; j < data.length; ++j) {
        parts.push({
          'Content-Type': 'application/dicom',
          data: new Uint8Array(data[j])
        });
      }
      var boundary = '----dwttestboundary';
      var content = dwv.utils.buildMultipart(parts, boundary);

      // STOW request
      var rootUrl = document.getElementById('rooturl').value;
      stowReq.open('POST', rootUrl + 'studies');
      stowReq.setRequestHeader('Accept', 'application/dicom+json');
      stowReq.setRequestHeader('Content-Type',
        'multipart/related; type="application/dicom"; boundary=' + boundary);
      stowReq.send(content);
    }
  };

  // launch data requests
  for (var i = 0; i < urls.length; ++i) {
    var req = new XMLHttpRequest();
    req.open('GET', urls[i]);
    req.responseType = 'arraybuffer';
    req.addEventListener('load', onload);
    req.send();
  }
};

/**
 * Show the QIDO response as a table.
 *
 * @param {object} json The qido response as json object.
 */
function qidoResponseToTable(json) {
  var viewerUrl = './viewer.html?input=';

  var hasSeries = typeof json[0]['0020000E'] !== 'undefined';

  var table = document.createElement('table');
  table.id = 'series-table';

  // table header
  var header = table.createTHead();
  var trow = header.insertRow(0);
  var insertTCell = function (text, width) {
    var th = document.createElement('th');
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
  var body = table.createTBody();
  var cell;
  for (var i = 0; i < json.length; ++i) {
    var row = body.insertRow();
    // number
    cell = row.insertCell();
    cell.appendChild(document.createTextNode(i));
    // study
    cell = row.insertCell();
    var studyUid = json[i]['0020000D'].Value;
    cell.title = studyUid;
    cell.appendChild(document.createTextNode(studyUid));

    if (hasSeries) {
      // series
      cell = row.insertCell();
      var seriesUid = json[i]['0020000E'].Value;
      cell.title = seriesUid;
      cell.appendChild(document.createTextNode(seriesUid));
      // modality
      cell = row.insertCell();
      cell.appendChild(document.createTextNode(json[i]['00080060'].Value));
      // action
      cell = row.insertCell();
      var a = document.createElement('a');
      a.href = viewerUrl + json[i]['00081190'].Value;
      a.target = '_blank';
      a.appendChild(document.createTextNode('view'));
      cell.appendChild(a);
    }
  }

  var div = document.getElementById('result');
  div.appendChild(table);
}
