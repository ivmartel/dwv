// call setup on DOM loaded
document.addEventListener('DOMContentLoaded', onDOMContentLoaded);

/**
 * Setup.
 */
function onDOMContentLoaded() {
  createAndPutHtml(_dataDicom, 'datadicom');
  createAndPutHtml(_dataImg, 'dataimg');

  // checkbox local data
  const localChk = document.getElementById('islocal');
  localChk.addEventListener('change', onLocalChkChange);

  // view button for github hosted
  const viewGithubHosted = document.getElementById('viewGithubHosted');
  viewGithubHosted.addEventListener('click', onViewGithubHosted);

  // fill gituhb hosted with example 0
  const example0 = document.getElementById('example0');
  example0.addEventListener('click', function () {
    fillGithubHostedWithExample(
      'https://github.com/ivmartel/dwv/blob/develop/tests/data/',
      'bbmri-53323131.dcm, bbmri-53323275.dcm, bbmri-53323419.dcm, ' +
      'bbmri-53323563.dcm, bbmri-53323707.dcm, bbmri-53323851.dcm'
    );
  });
}

const _githubRaw = 'https://raw.githubusercontent.com/ivmartel/dwv/master/tests/';
const _dataDicom = [
  {
    title: 'Baby MRI',
    uri: {
      type: 'dwvtest',
      file: '?file=bbmri-53323851.dcm&file=bbmri-53323707.dcm' +
      '&file=bbmri-53323563.dcm&file=bbmri-53323419.dcm' +
      '&file=bbmri-53323275.dcm&file=bbmri-53323131.dcm',
      args: '&dwvReplaceMode=void'
    },
    img: 'babymri.png',
    desc: 'Brain MR, 256*256*5, ' +
      'LittleEndianExplicit [1.2.840.10008.1.2.1], bits: 16-12-11'
  },
  {
    title: 'Baby MRI (DICOMDIR)',
    uri: {
      type: 'dwvtest',
      file: 'bbmri.dcmdir'
    },
    img: 'babymri-dcmdir.png',
    desc: 'Brain MR, 256*256*4, ' +
      'LittleEndianExplicit [1.2.840.10008.1.2.1], bits: 16-12-11'
  },
  {
    title: 'Baby MRI (zip)',
    uri: {
      type: 'dwvtest',
      file: 'bbmri.zip'
    },
    img: 'babymri-zip.png',
    desc: 'Brain MR, 256*256*2 ' +
      'LittleEndianExplicit [1.2.840.10008.1.2.1], bits: 16-12-11'
  },
  {
    title: 'Baby MRI (with state)',
    uri: {
      type: 'dwvtest',
      file: 'bbmri-53323851.dcm',
      args: '&state=../state/v0.5/state-rectangle.json'
    },
    img: 'babymri-rect.png',
    desc: 'Brain MR, 256*256*1, ' +
      'LittleEndianExplicit [1.2.840.10008.1.2.1], bits: 16-12-11'
  },
  {
    title: 'Toutatix',
    uri: {
      type: 'dwvtest',
      file: '?file=osirix-toutatix-100.dcm&file=osirix-toutatix-101.dcm',
      args: '&dwvReplaceMode=void'
    },
    img: 'toutatix.png',
    desc: 'Chest CT(A), 512*512*1, LittleEndianExplicit' +
      ' [1.2.840.10008.1.2.1], bits: 16-12-11,' +
      ' from the Osirix examples, hosted on the dwv github.'
  },
  {
    title: 'Goudurix',
    uri: {
      type: 'dwvtest',
      file: 'osirix-goudurix.dcm'
    },
    img: 'goudurix.png',
    desc: 'Chest CT(A), 512*512*1, LittleEndianImplicit' +
      ' [1.2.840.10008.1.2], bits: 16-12-11,' +
      ' from the Osirix examples, hosted on the dwv github.',
  },
  {
    title: 'US',
    uri: {
      type: 'dwvtest',
      file: 'gdcm-US-RGB-8-epicard.dcm'
    },
    img: 'us.png',
    desc: 'US, 640*480*1, BigEndianExplicit' +
      ' [1.2.840.10008.1.2.2], bits: 8-8-7,' +
      ' from the GDCM examples, hosted on the dwv github.',
  },
  {
    title: 'Cerebrix',
    uri: {
      type: 'dwvtest',
      file: 'osirix-cerebrix.dcm'
    },
    img: 'cerebrix.png',
    desc: 'Brain SC (Secondary Capture), 176*224*1,' +
      ' JPEG2000 [1.2.840.10008.1.2.4.91], bits: 16-16-15,' +
      ' from the Osirix examples, hosted on the dwv github.',
  },
  {
    title: 'Multiframe',
    uri: {
      type: 'dwvtest',
      file: 'multiframe-test1.dcm'
    },
    img: 'multiframe-test1.png',
    desc: 'Heart MR, 256*256*1*16, LittleEndianExplicit' +
      ' [1.2.840.10008.1.2.1], bits: 8-8-7,' +
      ' contributed by @yulia-tue, hosted on the dwv github.',
  }
];

const _dataImg = [
  {
    title: 'JPEG',
    uri: 'https://upload.wikimedia.org/wikipedia/commons/c/c6/PET-image.jpg',
    img: 'brainpet-jpg.png',
    desc: 'Brain PET from wikipedia' +
      ' (https://en.wikipedia.org/wiki/File:PET-image.jpg), 531*600*1.'
  },
  {
    title: 'PNG',
    uri: 'https://upload.wikimedia.org/wikipedia/commons/7/7f/Brain_MRI_112010_rgbca.png',
    img: 'brainmri-png.png',
    desc: 'Brain MRI from wikipedia' +
      ' (https://en.wikipedia.org/wiki/File:Brain_MRI_112010_rgbca.png), 389*504*1.'
  },
  {
    title: 'JPG',
    uri: 'https://upload.wikimedia.org/wikipedia/commons/0/0e/Acute_leukemia-ALL.jpg',
    img: 'acute_leukemia.png',
    desc: 'Acute Leukimia from wikipedia' +
      ' (https://en.wikipedia.org/wiki/File:Acute_leukemia-ALL.jpg), 347*395*1.'
  }
];

/**
 * Get the dwv url from a data input uri.
 *
 * @param {*} uri The dwv input uri.
 * @returns {string} The full dwv url.
 */
function getDwvUrl(uri) {
  let uricomp = null;
  if (typeof uri.type !== 'undefined') {
    uricomp = uri.file;
    if (uri.type === 'dwvtest') {
      const localChk = document.getElementById('islocal');
      const islocal = localChk ? localChk.checked : true;
      let uriroot = '';
      if (islocal) {
        uriroot = '../';
      } else {
        uriroot = _githubRaw;
      }
      uricomp = uriroot + 'data/' + uri.file;
    }
  } else {
    uricomp = uri;
  }

  let uriargs = '';
  if (typeof uri.args !== 'undefined') {
    uriargs = uri.args;
  }

  let url = 'viewer.html';
  if (typeof uri !== 'undefined') {
    url += '?input=' + encodeURIComponent(uricomp) + uriargs;
  }
  return url;
}

/**
 * Create and append html.
 *
 * @param {object} data Data configuration object.
 * @param {string} id The html list element.
 */
function createAndPutHtml(data, id) {
  for (let i = 0; i < data.length; ++i) {
    // image
    const image = document.createElement('img');
    image.src = './images/' + data[i].img;
    // title
    const title = document.createElement('h2');
    title.appendChild(document.createTextNode(data[i].title));
    // description
    const desc = document.createElement('p');
    desc.appendChild(document.createTextNode(data[i].desc));
    if (data[i].comment) {
      const comment = document.createElement('b');
      comment.appendChild(document.createTextNode(' ' + data[i].comment));
      desc.appendChild(comment);
    }

    // link
    const link = document.createElement('a');
    link.href = getDwvUrl(data[i].uri);
    link.id = i;
    link.className = 'dwvlink ' + id;
    link.appendChild(image);

    // list item
    const li = document.createElement('li');
    li.appendChild(link);
    li.appendChild(title);
    li.appendChild(desc);
    const ul = document.getElementById('ul_' + id);
    ul.appendChild(li);
  }
}

/**
 * Update dicom links on checkbox change.
 */
function onLocalChkChange() {
  const links = document.getElementsByClassName('datadicom');
  for (let i = 0; i < links.length; ++i) {
    links[i].href = getDwvUrl(_dataDicom[links[i].id].uri);
  }
}

/**
 * Handle click on the view github hosted button.
 */
function onViewGithubHosted() {
  // root url: https://github.com/ivmartel/dwv/blob/develop/tests/data
  // -> https://raw.githubusercontent.com/ivmartel/dwv/develop/tests/data
  const baseUrlInput = document.getElementById('baseUrl');
  const url = new URL(baseUrlInput.value);
  url.host = 'raw.githubusercontent.com';
  url.pathname = url.pathname.replace('blob/', '');
  url.pathname = url.pathname.replace('tree/', '');

  // file list
  const fileList = document.getElementById('fileList');
  const value = fileList.value;
  const separator = ',';
  let files = value.split(separator);
  // trim spaces
  files = files.map(element => {
    return element.trim();
  });
  // remove empty elements
  files = files.filter(element => {
    return element !== '';
  });
  const filesStr = '?file=' + files.join('&file=');

  // dwv args
  const args = '&dwvReplaceMode=void';

  // final full uri
  const uriStr = url.href + filesStr;
  // add args since we pass an uri string and not object as
  // for dwvtest
  const fullUri = getDwvUrl(uriStr) + args;

  // open test viewer
  window.open(fullUri);
}

/**
 * Fill github hosted inputs with preset strings.
 *
 * @param {string} base The base url href.
 * @param {string} files The coma separated list of files.
 */
function fillGithubHostedWithExample(base, files) {
  // base
  const baseUrlInput = document.getElementById('baseUrl');
  baseUrlInput.value = base;
  // files
  const fileList = document.getElementById('fileList');
  fileList.value = files;
}