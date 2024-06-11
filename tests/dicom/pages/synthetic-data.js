// Do not warn if these variables were not defined before.
/* global dwv */

// namespace
// eslint-disable-next-line no-var
var test = test || {};

// call setup on DOM loaded
document.addEventListener('DOMContentLoaded', onDOMContentLoaded);

/**
 * Setup.
 */
function onDOMContentLoaded() {
  // create lists
  getFileConfigsHtmlList('synthetic-data');
}

/**
 * Create an object url from (JSON) tags.
 *
 * @param {object} config The data configuration.
 * @returns {string} The object URL.
 */
function getObjectUrlFromTags(config) {
  // add private tags to dict if present
  let useUnVrForPrivateSq = false;
  if (typeof config.privateDictionary !== 'undefined') {
    const keys = Object.keys(config.privateDictionary);
    for (let i = 0; i < keys.length; ++i) {
      const group = keys[i];
      const tags = config.privateDictionary[group];
      dwv.addTagsToDictionary(group, tags);
    }
    if (typeof config.useUnVrForPrivateSq !== 'undefined') {
      useUnVrForPrivateSq = config.useUnVrForPrivateSq;
    }
  }
  // convert JSON to DICOM element object
  const dicomElements = dwv.getElementsFromJSONTags(config.tags);
  // pixels
  if (config.tags.Modality !== 'KO') {
    if (config.tags.Modality === 'SEG') {
      // simple binary
      dicomElements['7FE00010'] =
        test.generatePixelDataFromJSONTags(config.tags, 'binary');
    } else {
      // default to grad square
      dicomElements['7FE00010'] =
        test.generatePixelDataFromJSONTags(config.tags);
    }
  }

  // create DICOM buffer
  const writer = new dwv.DicomWriter();
  writer.setUseUnVrForPrivateSq(useUnVrForPrivateSq);
  const dicomBuffer = writer.getBuffer(dicomElements);

  // blob and then url
  const blob = new Blob([dicomBuffer], {type: 'application/dicom'});
  return URL.createObjectURL(blob);
}

/**
 * Create list from configs.
 *
 * @param {Array} configs An array of data cofiguration.
 * @returns {object} The html list element.
 */
function getConfigsHtmlList(configs) {
  const ul = document.createElement('ul');
  for (let i = 0; i < configs.length; ++i) {
    // download link
    const link = document.createElement('a');
    try {
      link.href = getObjectUrlFromTags(configs[i]);
    } catch (error) {
      console.log('data:', configs[i].name);
      console.error(error);
    }
    const fileName = 'dwv-generated-' + configs[i].name + '.dcm';
    link.download = fileName;
    link.appendChild(document.createTextNode(fileName));
    // list element
    const li = document.createElement('li');
    li.append(link);
    li.appendChild(document.createTextNode(': ' + configs[i].description));
    // append to list
    ul.append(li);
  }
  return ul;
}

/**
 * Get the list of configs and display them with a download link.
 *
 * @param {string} fileName The input file name.
 */
function getFileConfigsHtmlList(fileName) {
  const url = '/tests/dicom/' + fileName + '.json';
  const request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.onerror = function (event) {
    console.error(event);
  };
  request.onload = function (/*event*/) {
    const configs = JSON.parse(this.responseText);

    const dataGroups = [
      {
        name: 'Synthetic data Implicit VR Little Endian',
        short: 'sile',
        syntax: '1.2.840.10008.1.2'
      },
      {
        name: 'Synthetic data Explicit VR Little Endian',
        short: 'sele',
        syntax: '1.2.840.10008.1.2.1'
      },
      {
        name: 'Synthetic data Explicit VR Big Endian',
        short: 'sebe',
        syntax: '1.2.840.10008.1.2.2'
      }
    ];

    for (const dataGroup of dataGroups) {
      const content = document.getElementById('content');
      const title = document.createElement('h2');
      title.appendChild(document.createTextNode(dataGroup.name));
      content.append(title);

      for (const config of configs) {
        // name in json is 'test-##', replace test
        //   with the short string of the group
        config.name = dataGroup.short +
          config.name.substring(config.name.length - 3);
        // set transfer syntax
        config.tags.TransferSyntaxUID = dataGroup.syntax;
      }

      content.append(getConfigsHtmlList(configs));
    }
  };
  request.send(null);
}
