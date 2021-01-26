// namespace
var dcmb = dcmb || {};

/**
 * Get an html span with input text.
 *
 * @param {string} text The span text.
 * @returns {object} A DOM span.
 */
dcmb.getDomSpan = function (text) {
  var span = document.createElement('span');
  span.appendChild(document.createTextNode(text));
  return span;
};

/**
 * Get an html span with the difference of the two input values as a percentage.
 *
 * @param {number} base The base number.
 * @param {number} current The number to compare to the base.
 * @returns {object} A DOM span inculding the percentage text.
 */
dcmb.getDiffSpan = function (base, current) {
  var diff = current - base;
  var sign = diff >= 0 ? '+' : '';
  var percent = diff * 100 / base;
  var percentTxt = percent.toFixed(percent < 100 ? 2 : 0);

  var span = dcmb.getDomSpan('(' + sign + percentTxt + '%)');
  span.className = 'stats';
  span.className += diff >= 0 ? ' positive' : ' negative';
  return span;
};

/**
 * Get an html span with input Root Mean Error (RME).
 *
 * @param {number} rme The RME.
 * @returns {object} A DOM span inculding the rme text.
 */
dcmb.getRmeSpan = function (rme) {
  var rmeTxt = rme.toFixed(rme < 100 ? 2 : 0);
  var span = dcmb.getDomSpan('\u00B1' + rmeTxt + '%');
  span.className = 'stats';
  span.className += Math.abs(rme) >= 10 ? ' red' : ' green';
  return span;
};

/**
 * Get the mean values of each columns of the input array.
 *
 * @param {Array} results The value array of arrays.
 * @returns {Array} A vector with each columns mean.
 */
dcmb.getMeans = function (results) {
  var nrows = results.length;
  var ncols = results[0].length;
  // check number of cols
  for (var i = 0; i < nrows; ++i) {
    if (results[i].length !== ncols) {
      throw new Error('Different number of columns...');
    }
  }
  // sum along columns
  var means = [];
  for (var j = 0; j < ncols; ++j) {
    var sum = 0;
    for (var k = 0; k < nrows; ++k) {
      sum += dcmb.parseData(results[k][j]).value;
    }
    means.push(sum / nrows);
  }
  return means;
};

/**
 * Parse result data: if string anything before space is the value.
 *
 * @param {Array} data The data to parse.
 * @returns {object} The data split in {value, extra}.
 */
dcmb.parseData = function (data) {
  var value = data;
  var extra = '';
  if (typeof data === 'string') {
    var split = data.split(' ');
    value = parseFloat(split.splice(0, 1));
    extra = ' ' + split.join(' ');
  }
  return {value: value, extra: extra};
};

/**
 * To fixed for display.
 *
 * @param {number} value The nunmber to format.
 * @returns {number} The formated number.
 */
dcmb.toFixed = function (value) {
  return value.toFixed(value < 100 ? 2 : 0);
};

/**
 * Create a HTML table from result data.
 *
 * @param {Array} colHeader The column header data.
 * @param {Array} dataHeader The data header, ie row header data.
 * @param {Array} bodyData The result 'raw' data.
 * @param {Array} footData Some foot data.
 */

dcmb.createTable = function (colHeader, dataHeader, bodyData, footData) {
  var row;
  var cell;

  var table = document.createElement('table');

  // head
  var tableHead = document.createElement('thead');
  row = document.createElement('tr');
  // empty first cell
  cell = document.createElement('td');
  cell.appendChild(document.createTextNode(''));
  row.appendChild(cell);
  tableHead.appendChild(row);
  // column headers
  for (var k = 0; k < colHeader.length; ++k) {
    cell = document.createElement('td');
    cell.appendChild(document.createTextNode(colHeader[k]));
    row.appendChild(cell);
    tableHead.appendChild(row);
  }

  // body
  var tableBody = document.createElement('tbody');
  for (var i = 0; i < bodyData.length; ++i) {
    row = document.createElement('tr');
    // data header
    cell = document.createElement('td');
    cell.appendChild(document.createTextNode(dataHeader[i]));
    row.appendChild(cell);
    tableBody.appendChild(row);
    // body data
    var rowData = bodyData[i];
    for (var j = 0; j < rowData.length; ++j) {
      cell = document.createElement('td');
      var pData = dcmb.parseData(rowData[j]);
      cell.appendChild(document.createTextNode(dcmb.toFixed(pData.value)));
      cell.appendChild(document.createTextNode(pData.extra));
      if (j > 0) {
        cell.appendChild(document.createTextNode(' '));
        var v0 = dcmb.parseData(rowData[0]).value;
        cell.appendChild(dcmb.getDiffSpan(v0, pData.value));
      }
      row.appendChild(cell);
    }
    tableBody.appendChild(row);
  }

  // head
  var tableFoot = document.createElement('tfoot');
  row = document.createElement('tr');
  // column headers
  for (var l = 0; l < footData.length; ++l) {
    cell = document.createElement('td');
    var value = footData[l];
    if (l !== 0) {
      value = dcmb.toFixed(value);
    }
    cell.appendChild(document.createTextNode(value));
    if (l > 1) {
      cell.appendChild(document.createTextNode(' '));
      cell.appendChild(dcmb.getDiffSpan(footData[1], footData[l]));
    }
    row.appendChild(cell);
    tableFoot.appendChild(row);
  }

  table.appendChild(tableHead);
  table.appendChild(tableBody);
  table.appendChild(tableFoot);
  return table;
};
