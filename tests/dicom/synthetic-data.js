var dwv = dwv || {};
dwv.test = dwv.test || {};

/**
 * Create an object url from (JSON) tags.
 *
 * @param {object} tags The DICOM tags as JSON.
 * @returns {string} The object URL.
 */
function getObjectUrlFromTags(tags) {
  // convert JSON to DICOM element object
  var res = dwv.dicom.getElementsFromJSONTags(tags);
  var dicomElements = res.elements;
  // pixels: small gradient square
  dicomElements.x7FE00010 =
    dwv.dicom.generatePixelDataFromJSONTags(tags, res.offset);

  // create DICOM buffer
  var writer = new dwv.dicom.DicomWriter();
  var dicomBuffer = null;
  try {
    dicomBuffer = writer.getBuffer(dicomElements);
  } catch (error) {
    console.error(error);
    return;
  }

  // blob and then url
  var blob = new Blob([dicomBuffer], {type: 'application/dicom'});
  return URL.createObjectURL(blob);
}

// create list from configs
var getConfigsHtmlList = function (configs) {
  var ul = document.createElement('ul');
  for (var i = 0; i < configs.length; ++i) {
    // download link
    var link = document.createElement('a');
    link.href = getObjectUrlFromTags(configs[i].tags);
    var fileName = 'dwv-generated-' + configs[i].name + '.dcm';
    link.download = fileName;
    link.appendChild(document.createTextNode(fileName));
    // list element
    var li = document.createElement('li');
    li.append(link);
    li.appendChild(document.createTextNode(': ' + configs[i].description));
    // append to list
    ul.append(li);
  }
  return ul;
};

/**
 * Get the list of configs and display them with a download link.
 *
 * @param {string} fileName The input file name.
 */
function getFileConfigsHtmlList(fileName) {
  var urlRoot = 'https://raw.githubusercontent.com/ivmartel/dwv/master';
  var url = urlRoot + '/tests/dicom/' + fileName + '.json';
  var request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.onerror = function (event) {
    console.error(event);
  };
  request.onload = function (/*event*/) {
    var content = document.getElementById('content');
    var title = document.createElement('h2');
    title.appendChild(document.createTextNode(fileName));
    content.append(title);
    var configs = JSON.parse(this.responseText);
    content.append(getConfigsHtmlList(configs));
  };
  request.send(null);
}

/**
 * Last minute.
 */
dwv.test.onDOMContentLoadedSynthData = function (/*event*/) {
  // create lists
  getFileConfigsHtmlList('synthetic-data_explicit');
  getFileConfigsHtmlList('synthetic-data_implicit');
  getFileConfigsHtmlList('synthetic-data_explicit_big-endian');
};
