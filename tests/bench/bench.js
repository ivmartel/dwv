// namespace
var dcmb = dcmb || {};

// default test data
//var githubRaw = 'https://raw.githubusercontent.com/ivmartel/dcmbench/master/data/';
var githubRaw = '../data/';
var defaultTestData = [
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
var parserFunctions = [
  {name: 'dwv-previous', selected: true},
  {name: 'dwv-current', selected: true}
];

// create default runner object
var dataRunner = new dcmb.DataRunner();
dataRunner.setDataList(defaultTestData);
var benchRunner = new dcmb.BenchFunctionRunner();
dataRunner.setFunctionRunner(benchRunner);

// listen to status changes
dataRunner.addEventListener('status-change', function (event) {
  var newStatus = event.value;

  // status text
  var pStatus = document.getElementById('status');
  pStatus.innerHTML = newStatus;
  // main button
  var button = document.getElementById('button');
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
    var div = document.getElementById('results');
    var dataHeader = dataRunner.getDataHeader();
    var results = dataRunner.getResults();
    // use means as table foot
    var means = ['Mean'];
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
  var divParsers = document.getElementById('parsers');
  var fieldsetElem = divParsers.getElementsByTagName('fieldset')[0];

  var parserName = '';
  for (var i = 0; i < parserFunctions.length; ++i) {
    parserName = parserFunctions[i].name;

    var input = document.createElement('input');
    input.type = 'checkbox';
    input.name = 'parsers';
    input.id = parserName;
    input.value = parserName;
    input.onclick = function () {
      onChangeParsers(this);
    };
    input.checked = true;

    var label = document.createElement('label');
    label.htmlFor = parserName;
    label.appendChild(document.createTextNode(parserName));

    fieldsetElem.appendChild(input);
    fieldsetElem.appendChild(label);
  }
}

/**
 * Setup the data.
 */
function setupData() {
  var dataLi = document.getElementById('data');
  var data = null;
  for (var i = 0; i < defaultTestData.length; ++i) {
    data = defaultTestData[i];

    var input = document.createElement('input');
    input.type = 'checkbox';
    input.className = 'data-item';
    input.checked = data.selected;
    input.id = data.name;
    input.value = data.name;

    var label = document.createElement('label');
    label.htmlFor = data.name;
    label.appendChild(document.createTextNode(data.name));

    dataLi.appendChild(input);
    dataLi.appendChild(label);
  }
}

/**
 * Get the selected data.
 *
 * @returns {Array} The selected data.
 */
function getData() {
  var dataItemEls = document.getElementsByClassName('data-item');
  for (var i = 0; i < dataItemEls.length; ++i) {
    var item = defaultTestData.find(o => o.name === dataItemEls[i].id);
    if (item) {
      item.selected = dataItemEls[i].checked;
    }
  }
  return defaultTestData.filter(checkSelected);
}

/**
 * Handle a parser change,
 *
 * @param {object} input The new parser.
 */
function onChangeParsers(input) {
  for (var i = 0; i < parserFunctions.length; ++i) {
    if (parserFunctions[i].name === input.value) {
      parserFunctions[i].selected = input.checked;
      break;
    }
  }
  benchRunner.setFunctions(parserFunctions.filter(checkSelected));
}

/**
 * Handle change in the input file element.
 * - Updates the data list by calling updateDataList.
 *
 * @param {Array} files The new files.
 */
dcmb.onChangeInput = function (files) {
  var inputData = [];
  for (var i = 0; i < files.length; ++i) {
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
  var status = dataRunner.getStatus();
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
  // drag and drop
  //dcmb.setupDragDrop(updateDataList);

  // parsers
  setupParsers();

  setupData();

  // output user agent
  var preAgent = document.createElement('pre');
  preAgent.appendChild(document.createTextNode('User agent: '));
  preAgent.appendChild(document.createTextNode(navigator.userAgent));
  var broDiv = document.getElementById('browser');
  broDiv.appendChild(preAgent);

});

// iframe content is only available at window.onload time
window.onload = function () {
  var ifname = '';
  var func = null;
  for (var i = 0; i < parserFunctions.length; ++i) {
    ifname = 'iframe-' + parserFunctions[i].name;
    func = document.getElementById(ifname).contentWindow.parse;
    if (func) {
      parserFunctions[i].func = func;
    }
  }
  benchRunner.setFunctions(parserFunctions.filter(checkSelected));
};
