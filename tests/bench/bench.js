// namespace
// eslint-disable-next-line no-var
var dcmb = dcmb || {};

// default test data
//const githubRaw = 'https://raw.githubusercontent.com/ivmartel/dcmbench/master/data/';
const githubRaw = '../data/';
const defaultTestData = [
  {
    name: 'bbmri',
    url: githubRaw + 'bbmri-53323131.dcm',
    selected: true
  },
  {
    name: 'osirix-toutatix-100',
    url: githubRaw + 'osirix-toutatix-100.dcm',
    selected: false
  },
  {
    name: 'osirix-goudurix',
    url: githubRaw + 'osirix-goudurix.dcm',
    selected: false
  },
  {
    name: 'dicompyler-ct.0',
    url: githubRaw + 'dicompyler-ct.0.dcm',
    selected: false
  },
  {
    name: 'gdcm-CR-MONO1-10-chest',
    url: githubRaw + 'gdcm-CR-MONO1-10-chest.dcm',
    selected: false
  },
  {
    name: 'gdcm-CT-MONO2-8-abdo',
    url: githubRaw + 'gdcm-CT-MONO2-8-abdo.dcm',
    selected: false
  },
  {
    name: 'gdcm-US-RGB-8-epicard',
    url: githubRaw + 'gdcm-US-RGB-8-epicard.dcm',
    selected: false
  },
  {
    name: 'gdcm-US-RGB-8-esopecho',
    url: githubRaw + 'gdcm-US-RGB-8-esopecho.dcm',
    selected: false
  }
];
const parserFunctions = [
  {name: 'dwv-previous', selected: true},
  {name: 'dwv-current', selected: true}
];
const numberOfTests = 2;

// create default runner object
const dataRunner = new dcmb.DataRunner();
dataRunner.setDataList(defaultTestData);
const benchRunner = new dcmb.BenchFunctionRunner();
dataRunner.setFunctionRunner(benchRunner);

// listen to status changes
dataRunner.addEventListener('status-change', function (event) {
  const newStatus = event.value;

  // status text
  const pStatus = document.getElementById('status');
  pStatus.innerHTML = newStatus;
  // main button
  const button = document.getElementById('button');
  button.disabled = false;
  if (newStatus === 'ready' ||
    newStatus === 'done' ||
    newStatus === 'cancelled') {
    // update button
    button.innerHTML = 'Launch';
  } else if (newStatus === 'running') {
    // update button
    button.innerHTML = 'Cancel';
  } else if (newStatus === 'cancelling') {
    // disable button
    button.disabled = true;
  }

  if (newStatus === 'done') {
    const div = document.getElementById('results');
    const dataHeader = dataRunner.getDataHeader();
    const results = dataRunner.getResults();
    // use means as table foot
    let means = ['Mean'];
    means = means.concat(dcmb.getMeans(results));
    // add to result div
    div.appendChild(dcmb.createTable(
      benchRunner.getFunctionHeader(), dataHeader, results, means
    ));
  }
});

/**
 * Update the data list of the data runner.
 *
 * @param {Array} datalist The new data list.
 */
function updateDataList(datalist) {
  dataRunner.setDataList(datalist);
}

/**
 * Check if a parser is checked.
 *
 * @param {object} parser The parser to check.
 * @returns {boolean} True isf selected.
 */
function checkSelected(parser) {
  return parser.selected === true;
}

/**
 * Setup the parsers.
 */
function setupParsers() {
  const divParsers = document.getElementById('parsers');
  const fieldsetElem = divParsers.getElementsByTagName('fieldset')[0];

  let parserName = '';
  for (let i = 0; i < parserFunctions.length; ++i) {
    parserName = parserFunctions[i].name;

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.name = 'parsers';
    input.id = parserName;
    input.value = parserName;
    input.onclick = function () {
      onChangeParsers(this);
    };
    input.checked = true;

    const label = document.createElement('label');
    label.htmlFor = parserName;
    label.appendChild(document.createTextNode(parserName));

    fieldsetElem.appendChild(input);
    fieldsetElem.appendChild(label);
  }
}

/**
 * Setup the tests.
 */
function setupTests() {
  const divTests = document.getElementById('tests');
  const fieldsetElem = divTests.getElementsByTagName('fieldset')[0];
  const names = ['parser', 'render'];

  for (let i = 0; i < numberOfTests; ++i) {
    const testId = 'test-' + i;
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'tests';
    input.id = testId;
    input.value = i;
    input.onclick = function () {
      onChangeTests(this);
    };
    if (i === 0) {
      input.checked = true;
    }

    const label = document.createElement('label');
    label.htmlFor = testId;
    label.appendChild(document.createTextNode(names[i]));

    fieldsetElem.appendChild(input);
    fieldsetElem.appendChild(label);
  }
}

/**
 * Setup the data.
 */
function setupData() {
  const dataLi = document.getElementById('data');
  let data = null;
  for (let i = 0; i < defaultTestData.length; ++i) {
    data = defaultTestData[i];

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.className = 'data-item-input';
    input.checked = data.selected;
    input.id = data.name;
    input.value = data.name;

    const label = document.createElement('label');
    label.htmlFor = data.name;
    label.className = 'data-item-label';
    label.appendChild(document.createTextNode(data.name));

    const div = document.createElement('div');
    div.className = 'data-item';
    div.appendChild(input);
    div.appendChild(label);

    dataLi.appendChild(div);
  }
}

/**
 * Get the selected data.
 *
 * @returns {Array} The selected data.
 */
function getData() {
  const dataItemEls = document.getElementsByClassName('data-item-input');
  for (let i = 0; i < dataItemEls.length; ++i) {
    const item = defaultTestData.find(o => o.name === dataItemEls[i].id);
    if (item) {
      item.selected = dataItemEls[i].checked;
    }
  }
  return defaultTestData.filter(checkSelected);
}

/**
 * Handle a parser change.
 *
 * @param {object} input The new parser.
 */
function onChangeParsers(input) {
  for (let i = 0; i < parserFunctions.length; ++i) {
    if (parserFunctions[i].name === input.value) {
      parserFunctions[i].selected = input.checked;
      break;
    }
  }
  benchRunner.setFunctions(parserFunctions.filter(checkSelected));
}

/**
 * Handle a parser test change.
 *
 * @param {object} input The new test.
 */
function onChangeTests(input) {
  const selectedTest = input.value;
  for (let i = 0; i < parserFunctions.length; ++i) {
    parserFunctions[i].test = parserFunctions[i].tests[selectedTest];
  }
  benchRunner.setFunctions(parserFunctions.filter(checkSelected));
}

/**
 * Handle change in the input file element.
 * - Updates the data list by calling updateDataList.
 *
 * @param {File[]} files The new files.
 */
dcmb.onChangeInput = function (files) {
  const inputData = [];
  for (let i = 0; i < files.length; ++i) {
    inputData.push({name: files[i].name,
      file: files[i]});
  }
  // call external function
  updateDataList(inputData);
};

/**
 * Handle launch.
 */
dcmb.onLaunchButton = function () {
  // action according to status
  const status = dataRunner.getStatus();
  if (status === 'ready' ||
    status === 'done' ||
    status === 'cancelled') {
    dataRunner.setDataList(getData());
    // run
    dataRunner.run();
  } else if (status === 'running') {
    // cancel
    dataRunner.cancel();
  }
};

// last minute
document.addEventListener('DOMContentLoaded', function (/*event*/) {
  // setup
  setupParsers();
  setupData();
  setupTests();

  // output user agent
  const preAgent = document.createElement('pre');
  preAgent.appendChild(document.createTextNode('User agent: '));
  preAgent.appendChild(document.createTextNode(navigator.userAgent));
  const broDiv = document.getElementById('browser');
  broDiv.appendChild(preAgent);

});

// iframe content is only available at window.onload time
window.onload = function () {
  let ifname = '';
  let tests = null;
  for (let i = 0; i < parserFunctions.length; ++i) {
    ifname = 'iframe-' + parserFunctions[i].name;
    tests = document.getElementById(ifname).contentWindow.tests;
    if (typeof tests !== 'undefined') {
      if (tests.length !== numberOfTests) {
        throw new Error('Wrong number of tests for parser ' +
          parserFunctions[i].name);
      }
      parserFunctions[i].tests = tests;
      parserFunctions[i].test = tests[0];
    }
  }
  benchRunner.setFunctions(parserFunctions.filter(checkSelected));
};
