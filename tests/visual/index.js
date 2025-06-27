import {
  initDwv,
  addDataLines
} from './appgui.js';

const _data = [
  {
    fileroot: 'osirix-toutatix-100',
    origin: 'Osirix',
    path: 'TOUTATIX/Cardiac 1CTA_CORONARY_ARTERIES_TESTBOLUS' +
      '(Adult)/Heart w-o 1.5  B25f  55% /IM-0001-0100.dcm',
    't-syntax': '1.2.840.10008.1.2.1',
    modality: 'CT',
    photo: 'Monochrome2',
    bits: '16-12-11',
    'pixel-vr': 'OW',
  },
  {
    fileroot: 'osirix-goudurix',
    origin: 'Osirix',
    path: 'GOUDURIX/Specials 1_CORONARY_CTA_COMBI_SMH/70 % 1.0' +
      'B30f/IM-0001-0100.dcm',
    't-syntax': '1.2.840.10008.1.2',
    modality: 'CT',
    photo: 'Monochrome2',
    bits: '16-12-11',
    'pixel-vr': 'OX',
  },
  {
    fileroot: 'dicompyler-ct.0',
    origin: 'dicompyler',
    path: 'dicompyler/ct/ct.0.dcm',
    't-syntax': '1.2.840.10008.1.2',
    modality: 'CT',
    photo: 'Monochrome2',
    bits: '16-16-15',
    'pixel-vr': 'OX',
  },
  {
    fileroot: 'gdcm-CR-MONO1-10-chest',
    origin: 'GDCM (+ DCIM prefix)',
    path: 'CR-MONO1-10-chest.dcm',
    't-syntax': '1.2.840.10008.1.2.1',
    modality: 'CR',
    photo: 'Monochrome1',
    bits: '16-10-9',
    'pixel-vr': 'OW',
  },
  {
    fileroot: 'gdcm-CT-MONO2-8-abdo',
    origin: 'GDCM',
    path: 'CT-MONO2-8-abdo.dcm',
    't-syntax': '1.2.840.10008.1.2',
    modality: 'CT',
    photo: 'Monochrome2',
    bits: '8-8-7',
    'pixel-vr': 'OX',
  },
  {
    fileroot: 'gdcm-US-RGB-8-esopecho',
    origin: 'GDCM',
    path: 'US-RGB-8-epicard.dcm',
    't-syntax': '1.2.840.10008.1.2.2',
    modality: 'US',
    photo: 'RGB (planar=1)',
    bits: '8-8-7',
    'pixel-vr': 'OB',
  },
  {
    fileroot: 'gdcm-US-RGB-8-esopecho',
    origin: 'GDCM',
    path: 'US-RGB-8-esopecho.dcm',
    't-syntax': '1.2.840.10008.1.2.1',
    modality: 'US',
    photo: 'RGB (planar=0)',
    bits: '8-8-7',
    'pixel-vr': 'OB',
  }
];

/**
 * Add footer.
 */
function addFooter() {
  const pMissing = document.createElement('p');
  pMissing.innerHTML = '<b>Missing data</b>: 8 bits with pixel VR OW';

  const pSources = document.createElement('p');
  pSources.innerHTML = 'Data sources:';

  const ulSources = document.createElement('ul');
  const li0 = document.createElement('li');
  li0.innerHTML = 'Osirix <a href="http://www.osirix-viewer.com/datasets/">datasets</a>';
  ulSources.appendChild(li0);
  const li1 = document.createElement('li');
  li1.innerHTML = 'Gdcm: :pserver:xxx@cvs.creatis.insa-lyon.fr:2402/cvs/public';
  ulSources.appendChild(li1);

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
