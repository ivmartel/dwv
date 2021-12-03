#!/usr/bin/env node
'use strict';

var _Program = require('../dist/Program');

var _Program2 = _interopRequireDefault(_Program);

var _Gren = require('../dist/Gren');

var _Gren2 = _interopRequireDefault(_Gren);

var _options = require('./_options');

var _chalk = require('chalk');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var releaseCommand = new _Program2.default({
    name: (0, _chalk.green)('gren') + ' release',
    description: 'Generate release notes and attach them to a tag',
    argv: process.argv,
    cwd: process.cwd(),
    options: _options.releaseOptions.concat(_options.globalOptions)
});

releaseCommand.init().then(function (options) {
    var releaseAction = new _Gren2.default(options);

    return releaseAction.release();
}).catch(function (error) {
    console.error(error);
    process.exit(1);
});