import {
  isMultiSliceModality,
  zipBuffers
} from '../dicomGenerator.js';
import {
  dataStructures,
  getStructureBuffers,
  getStructureNumberOfFiles,
  singleSliceStructure
} from '../dataStructures.js';

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
 * Get a single-slice link (dcm file).
 *
 * @param {object} config The data configuration.
 * @returns {HTMLLinkElement} The link.
 */
function getSingleSliceLink(config) {
  const link = document.createElement('a');
  try {
    const buffer = getStructureBuffers(
      config, config.tags.TransferSyntaxUID, singleSliceStructure)[0];
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
 * Get a data structure link: dcm file for single file structures,
 * zip file otherwise.
 *
 * @param {object} config The data configuration.
 * @param {object} structure The data structure,
 *   see {@link dataStructures}.
 * @returns {HTMLLinkElement} The link.
 */
function getStructureLink(config, structure) {
  const link = document.createElement('a');
  const isZip = getStructureNumberOfFiles(structure) !== 1;
  const linkText = `${structure.short}.${isZip ? 'zip' : 'dcm'}`;
  const fileName = `dwv-generated-${config.name}-${linkText}`;

  try {
    const buffers = getStructureBuffers(
      config, config.tags.TransferSyntaxUID, structure);
    if (isZip) {
      zipBuffers(buffers, function (zipBlob) {
        link.download = fileName;
        link.href = URL.createObjectURL(zipBlob);
      });
    } else {
      const blob = new Blob([buffers[0]], {type: 'application/dicom'});
      link.download = fileName;
      link.href = URL.createObjectURL(blob);
    }
  } catch (error) {
    console.log('data:', config.name);
    console.error(error);
  }
  link.appendChild(document.createTextNode(linkText));
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
    li.append(getSingleSliceLink(config));
    if (isMultiSliceModality(config.tags.Modality)) {
      for (const structure of Object.values(dataStructures)) {
        li.appendChild(document.createTextNode(', '));
        li.append(getStructureLink(config, structure));
      }
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
 * @param {object} dataGroup The data group (name, short, syntax,
 *   optional filter).
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
  // optional group filter
  let finalConfigs = groupConfigs;
  if (typeof dataGroup.filter !== 'undefined') {
    finalConfigs = groupConfigs.filter(dataGroup.filter);
  }
  return getConfigsHtmlList(finalConfigs);
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
    },
    {
      name: 'Synthetic data RLE Lossless (SRLE)',
      short: 'srle',
      syntax: '1.2.840.10008.1.2.5',
      // RLE encoder only supports 8 and 16 bits allocated
      filter(config) {
        return isMultiSliceModality(config.tags.Modality) && (
          config.tags.BitsAllocated === 8 ||
          config.tags.BitsAllocated === 16);
      }
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
