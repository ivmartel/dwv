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
  qidoReq.open('GET', rootUrl + 'series?');
  qidoReq.setRequestHeader('Accept', 'application/dicom+json');
  qidoReq.send();
};

/**
 * Show the QIDO response as a table.
 *
 * @param {object} json The qido response as json object.
 */
function qidoResponseToTable(json) {
  var viewerUrl = './viewer.html?input=';

  var table = document.createElement('table');
  table.id = 'series-table';

  // table header
  var header = table.createTHead();
  var trow = header.insertRow(0);
  var insertTCell = function (text) {
    var th = document.createElement('th');
    th.innerHTML = text;
    trow.appendChild(th);
  };
  insertTCell('Study');
  insertTCell('Series');
  insertTCell('Modality');
  insertTCell('Action');

  // table body
  var body = table.createTBody();
  var cell;
  for (var i = 0; i < json.length; ++i) {
    var row = body.insertRow();
    // study
    cell = row.insertCell();
    cell.appendChild(document.createTextNode(json[i]['0020000D'].Value));
    // series
    cell = row.insertCell();
    cell.appendChild(document.createTextNode(json[i]['0020000E'].Value));
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

  var div = document.getElementById('result');
  div.appendChild(table);
}
