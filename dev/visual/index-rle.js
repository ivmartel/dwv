import {
  initDwv,
  addDataLines
} from './appgui.js';

const _data = [
  {
    fileroot: 'leadtools-flowers-8-mono2-rle',
    origin: 'leadtools',
    path: 'leadtools-flowers-8-mono2-rle.dcm',
    't-syntax': '1.2.840.10008.1.2.5 (rle)',
    modality: 'OT',
    photo: 'MONOCHROME2',
    bits: '8-8-7',
    'pixel-vr': 'OW',
  },
  {
    fileroot: 'leadtools-flowers-16-mono2-rle',
    origin: 'leadtools',
    path: 'leadtools-flowers-16-mono2-rle.dcm',
    't-syntax': '1.2.840.10008.1.2.5 (rle)',
    modality: 'OT',
    photo: 'MONOCHROME2',
    bits: '16-16-15',
    'pixel-vr': 'OW',
  }
];

/**
 * Add footer.
 */
function addFooter() {
  const pMissing = document.createElement('p');
  pMissing.innerHTML = '<b>Missing data</b>: ' +
    'RGB data, multi frame..';

  const pSources = document.createElement('p');
  pSources.innerHTML = 'Data sources:';

  const ulSources = document.createElement('ul');
  const li0 = document.createElement('li');
  li0.innerHTML = 'Leadtools datasets hosted at ' +
    '<a href="http://www.creatis.insa-lyon.fr/~jpr/PUBLIC/gdcm/gdcmSampleData/ColorDataSetLeadTool/">creatis</a>';
  ulSources.appendChild(li0);

  const pCreated = document.createElement('p');
  pCreated.innerHTML = 'The left image is created with DWV,' +
    'the right one is a snapshot generated using' +
    ' <a href="https://www.synedra.com">Synedra</a> View Personnal.';

  const div = document.getElementById('footer');
  div.appendChild(pMissing);
  div.appendChild(pSources);
  div.appendChild(ulSources);
  div.appendChild(pCreated);
}

/**
 * Setup.
 */
function setup() {
  initDwv();
  addDataLines(_data);
  addFooter();
}

// ---------------------------------------------

// launch
setup();
