#!/usr/bin/env node
'use strict';

var _objectWithoutProperties2 = require('babel-runtime/helpers/objectWithoutProperties');

var _objectWithoutProperties3 = _interopRequireDefault(_objectWithoutProperties2);

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _chalk = require('chalk');

var _objectAssignDeep = require('object-assign-deep');

var _objectAssignDeep2 = _interopRequireDefault(_objectAssignDeep);

var _init = require('../dist/_init');

var _init2 = _interopRequireDefault(_init);

var _utils = require('../dist/_utils');

var _utils2 = _interopRequireDefault(_utils);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_commander2.default.name((0, _chalk.green)('gren') + ' release').description('Initialise the module options.').parse(process.argv);

(0, _init2.default)().then(function (_ref) {
    var fileExist = _ref.fileExist,
        apiUrlType = _ref.apiUrlType,
        ignoreCommitsWithConfirm = _ref.ignoreCommitsWithConfirm,
        ignoreLabelsConfirm = _ref.ignoreLabelsConfirm,
        ignoreIssuesWithConfirm = _ref.ignoreIssuesWithConfirm,
        ignoreTagsWithConfirm = _ref.ignoreTagsWithConfirm,
        fileType = _ref.fileType,
        data = (0, _objectWithoutProperties3.default)(_ref, ['fileExist', 'apiUrlType', 'ignoreCommitsWithConfirm', 'ignoreLabelsConfirm', 'ignoreIssuesWithConfirm', 'ignoreTagsWithConfirm', 'fileType']);

    if (fileExist === 'abort') {
        console.log('Command aborted.');
        return;
    }

    if (fileExist === 'override') {
        var _fileContent = _utils2.default.writeConfigToFile(fileType, data);

        _utils2.default.cleanConfig(true);
        _fs2.default.writeFileSync(fileType, _fileContent);

        console.log((0, _chalk.green)('\nGreat news! Your ' + fileType + ' as been created!'));
        return;
    }

    var currentConfig = _utils2.default.getGrenConfig(process.cwd());
    var fileContent = _utils2.default.writeConfigToFile(fileType, (0, _objectAssignDeep2.default)({}, currentConfig, data));

    _fs2.default.writeFileSync(fileType, fileContent);

    console.log((0, _chalk.green)('\nGreat news! Your ' + fileType + ' as been created!'));
}).catch(function (error) {
    console.log(error);
    process.exit(1);
});