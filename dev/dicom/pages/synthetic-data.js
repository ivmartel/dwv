import {addTagsToDictionary} from '../../../src/dicom/dictionary.js';
import {
  generateDataElements,
  generateSliceBuffers,
  isMultiSliceModality,
  zipBuffers
} from '../dicomGenerator.js';

/**
 * Setup.
 */
function setup() {
  // create lists
  getFileConfigsHtmlList([
    'synthetic-img',
    'synthetic-seg',
    'synthetic-rtss',
    'synthetic-kos'
  ]);
}

/**
 * Create DICOM buffers from (JSON) tags.
 *
 * @param {object} config The data configuration.
 * @param {number} [numberOfSlices] The number of slices.
 * @returns {ArrayBuffer[]} The list of buffers.
 */
function getBuffersFromTags(config, numberOfSlices = 1) {
  // add private tags to dict if present
  let useUnVrForPrivateSq = false;
  if (typeof config.privateDictionary !== 'undefined') {
    const keys = Object.keys(config.privateDictionary);
    for (let i = 0; i < keys.length; ++i) {
      const group = keys[i];
      const tags = config.privateDictionary[group];
      addTagsToDictionary(group, tags);
    }
    if (typeof config.useUnVrForPrivateSq !== 'undefined') {
      useUnVrForPrivateSq = config.useUnVrForPrivateSq;
    }
  }

  // generate data elements
  const genOptions = {
    pixelGeneratorName: 'string',
    numberOfSlices,
    segmentSquares: config.segmentSquares,
    frames3D: config.frames3D
  };
  const dataElementsList = generateDataElements(config.tags, genOptions);
  // generate buffers
  const writerOptions = {useUnVrForPrivateSq};
  return generateSliceBuffers(dataElementsList, writerOptions);
}

/**
 * Get a single file link.
 *
 * @param {object} config The data configuration.
 * @returns {HTMLLinkElement} The link.
 */
function getSingleFileLink(config) {
  const link = document.createElement('a');
  try {
    const buffer = getBuffersFromTags(config)[0];
    const blob = new Blob([buffer], {type: 'application/dicom'});
    link.href = URL.createObjectURL(blob);
  } catch (error) {
    console.log('data:', config.name);
    console.error(error);
  }
  const fileName = `dwv-generated-${config.name}.dcm`;
  link.download = fileName;
  link.appendChild(document.createTextNode('dcm'));
  return link;
}

/**
 * Get a single multi-frame link.
 *
 * @param {object} config0 The data configuration.
 * @returns {HTMLLinkElement} The link.
 */
function getSingleMultiFrameLink(config0) {
  const config = structuredClone(config0);
  const link = document.createElement('a');
  try {
    config.tags.NumberOfFrames = 3;
    const buffer = getBuffersFromTags(config)[0];
    const blob = new Blob([buffer], {type: 'application/dicom'});
    link.href = URL.createObjectURL(blob);
  } catch (error) {
    console.log('data:', config.name);
    console.error(error);
  }
  const fileName = `dwv-generated-${config.name}-mf.dcm`;
  link.download = fileName;
  link.appendChild(document.createTextNode('mf-dcm'));
  return link;
}

/**
 * Get a single multi-frame multi-slice link.
 *
 * @param {object} config0 The data configuration.
 * @returns {HTMLLinkElement} The link.
 */
function getSingleMultiFrameMultiSliceLink(config0) {
  const config = structuredClone(config0);
  const link = document.createElement('a');
  try {
    config.frames3D = true;
    config.tags.NumberOfFrames = 5;
    const buffer = getBuffersFromTags(config)[0];
    const blob = new Blob([buffer], {type: 'application/dicom'});
    link.href = URL.createObjectURL(blob);
  } catch (error) {
    console.log('data:', config.name);
    console.error(error);
  }
  const fileName = `dwv-generated-${config.name}-mfms.dcm`;
  link.download = fileName;
  link.appendChild(document.createTextNode('mfms-dcm'));
  return link;
}

/**
 * Get a multi-slice link.
 *
 * @param {object} config The data configuration.
 * @returns {HTMLLinkElement} The link.
 */
function getMultipleSliceLink(config) {
  const link = document.createElement('a');
  const fileName = `dwv-generated-${config.name}-ms.zip`;

  const zipCallback = function (zipBlob) {
    link.download = fileName;
    link.href = URL.createObjectURL(zipBlob);
  };

  try {
    const buffers = getBuffersFromTags(config, 5);
    zipBuffers(buffers, zipCallback);
  } catch (error) {
    console.log('data:', config.name);
    console.error(error);
  }
  link.appendChild(document.createTextNode('ms-zip'));
  return link;
}

/**
 * Create list from configs.
 *
 * @param {Array} configs An array of data cofiguration.
 * @returns {object} The html list element.
 */
function getConfigsHtmlList(configs) {
  const ul = document.createElement('ul');
  for (const config of configs) {
    // list element
    const li = document.createElement('li');
    li.appendChild(document.createTextNode(
      `${config.name}: ${config.tags.SeriesDescription}: `));
    li.append(getSingleFileLink(config));
    if (isMultiSliceModality(config.tags.Modality)) {
      li.appendChild(document.createTextNode(', '));
      li.append(getSingleMultiFrameLink(config));
      li.appendChild(document.createTextNode(', '));
      li.append(getSingleMultiFrameMultiSliceLink(config));
      li.appendChild(document.createTextNode(', '));
      li.append(getMultipleSliceLink(config));
    }
    // append to list
    ul.append(li);
  }
  return ul;
}

/**
 * Fetch a single JSON config file.
 *
 * @param {string} fileName The input file name (without extension).
 * @returns {Promise<Array>} The parsed configs.
 */
function fetchFileConfigs(fileName) {
  const url = `/tests/data/${fileName}.json`;
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.onerror = function (event) {
      reject(event);
    };
    request.onload = function (/*event*/) {
      resolve(JSON.parse(this.responseText));
    };
    request.send(null);
  });
}

/**
 * Get the list of configs from several files and display them
 * with a download link.
 *
 * @param {string[]} fileNames The input file names (without extension).
 */
function getFileConfigsHtmlList(fileNames) {
  Promise.all(fileNames.map(fetchFileConfigs))
    .then(function (configsPerFile) {
      displayConfigs(configsPerFile.flat());
    })
    .catch(function (error) {
      console.error(error);
    });
}

/**
 * @param {object} configs Synthetic data configuration.
 */
function displayConfigs(configs) {
  const dataGroups = [
    {
      name: 'Synthetic data Implicit VR Little Endian (SILE)',
      short: 'sile',
      syntax: '1.2.840.10008.1.2'
    },
    {
      name: 'Synthetic data Explicit VR Little Endian (SELE)',
      short: 'sele',
      syntax: '1.2.840.10008.1.2.1'
    },
    {
      name: 'Synthetic data Explicit VR Big Endian (SEBE)',
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
      // name in json is 'test-img-##', replace test
      //   with the short string of the group
      config.name = dataGroup.short +
        config.name.substring(4);
      // set transfer syntax
      config.tags.TransferSyntaxUID = dataGroup.syntax;
    }

    content.append(getConfigsHtmlList(configs));
  }
}

// ---------------------------------------------

// launch
setup();
