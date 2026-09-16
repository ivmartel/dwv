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
 * @param {number} [numberOfFrames] The number of frames.
 * @returns {ArrayBuffer[]} The list of buffers.
 */
function getBuffersFromTags(config, numberOfSlices = 1, numberOfFrames = 1) {
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
    segmentSquares: config.segmentSquares,
    frames3D: config.frames3D
  };
  if (numberOfSlices !== 1) {
    genOptions.numberOfSlices = numberOfSlices;
  }
  if (numberOfFrames !== 1) {
    genOptions.numberOfFrames = numberOfFrames;
  }
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
  link.appendChild(document.createTextNode('mf.dcm'));
  return link;
}

/**
 * Get a single-frame multi-slice link.
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
  const fileName = `dwv-generated-${config.name}-sfms.dcm`;
  link.download = fileName;
  link.appendChild(document.createTextNode('sfms.dcm'));
  return link;
}

/**
 * Get a multiple since slice link.
 *
 * @param {object} config The data configuration.
 * @returns {HTMLLinkElement} The link.
 */
function getMultipleSingleSliceLink(config) {
  const link = document.createElement('a');
  const fileName = `dwv-generated-${config.name}-mss.zip`;

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
  link.appendChild(document.createTextNode('mss.zip'));
  return link;
}

/**
 * Get a multiple single frame link.
 *
 * @param {object} config The data configuration.
 * @returns {HTMLLinkElement} The link.
 */
function getMultipleFrameLink(config) {
  const link = document.createElement('a');
  const fileName = `dwv-generated-${config.name}-msf.zip`;

  const zipCallback = function (zipBlob) {
    link.download = fileName;
    link.href = URL.createObjectURL(zipBlob);
  };

  try {
    const buffers = getBuffersFromTags(config, 1, 3);
    zipBuffers(buffers, zipCallback);
  } catch (error) {
    console.log('data:', config.name);
    console.error(error);
  }
  link.appendChild(document.createTextNode('msf.zip'));
  return link;
}

/**
 * Create list from configs.
 *
 * @param {Array} configs An array of data cofiguration.
 * @returns {HTMLUListElement} The html list element.
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
      li.append(getMultipleSingleSliceLink(config));
      li.appendChild(document.createTextNode(', '));
      li.append(getMultipleFrameLink(config));
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
 * Rename and set the transfer syntax of a clone of the input configs
 * for a given data group, then create their html list.
 *
 * @param {object} configs Synthetic data configuration.
 * @param {object} dataGroup The data group (name, short, syntax).
 * @returns {HTMLUListElement} The html list element.
 */
function renderDataGroup(configs, dataGroup) {
  const groupConfigs = structuredClone(configs);
  for (const config of groupConfigs) {
    // name in json is 'test-img-##', replace test
    //   with the short string of the group
    config.name = dataGroup.short +
      config.name.substring(4);
    // set transfer syntax
    config.tags.TransferSyntaxUID = dataGroup.syntax;
  }
  return getConfigsHtmlList(groupConfigs);
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

  for (let index = 0; index < dataGroups.length; ++index) {
    const dataGroup = dataGroups[index];

    const content = document.getElementById('content');
    const title = document.createElement('h2');
    title.appendChild(document.createTextNode(dataGroup.name));
    content.append(title);

    if (index === 0) {
      // generate the first group right away
      content.append(renderDataGroup(configs, dataGroup));
    } else {
      // defer the other groups: only generate them on demand,
      // triggered by a button, to avoid the upfront cost of
      // creating data that may not be needed
      const button = document.createElement('button');
      button.appendChild(
        document.createTextNode('Generate'));
      button.addEventListener('click', function onClick() {
        // replace the button in place so the list appears where the
        // button was, not appended at the end of the shared content
        button.replaceWith(renderDataGroup(configs, dataGroup));
      });
      content.append(button);
    }
  }
}

// ---------------------------------------------

// launch
setup();
