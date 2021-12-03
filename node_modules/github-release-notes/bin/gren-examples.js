#!/usr/bin/env node
'use strict';

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _examples = require('./_examples');

var _examples2 = _interopRequireDefault(_examples);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var command = void 0;
var commandList = (0, _keys2.default)(_examples2.default).filter(function (example) {
    return example !== 'default' && example !== 'generateExamples';
});

_commander2.default.name('gren examples').description('See few examples for how to use gren. For more informations (and a bit of UI) check ' + _chalk2.default.blue('https://github-tools.github.io/github-release-notes/examples.html')).usage('<command>').on('--help', function () {
    console.log('');
    console.log('  Commands:');
    console.log('');
    console.log('      $ gren examples gren');
    console.log('      $ gren examples release');
    console.log('      $ gren examples changelog');
    console.log('');
}).action(function (cmd) {
    command = cmd;
}).parse(process.argv);

if (!command || !commandList.includes(command)) {
    console.error(_chalk2.default.red('You must specify one of these commands to output examples') + ' [' + commandList.join('|') + ']');

    process.exit(1);
}

_examples2.default.generateExamples(command, _examples2.default[command]);