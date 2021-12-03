#!/usr/bin/env node
'use strict';

var _Program = require('../dist/Program');

var _Program2 = _interopRequireDefault(_Program);

var _Gren = require('../dist/Gren');

var _Gren2 = _interopRequireDefault(_Gren);

var _options = require('./_options');

var _chalk = require('chalk');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var changelogCommand = new _Program2.default({
    name: (0, _chalk.green)('gren') + ' changelog',
    description: 'Create a CHANGELOG.md file, based on release notes',
    argv: process.argv,
    cwd: process.cwd(),
    options: _options.changelogOptions.concat(_options.globalOptions),
    events: {
        '--help': function help() {
            console.log('');
            console.log('  Basic Examples:');
            console.log('');
            console.log('    $ gren changelog');
            console.log('');
            console.log('    $ gren changelog --generate');
            console.log('');
        }
    }
});

changelogCommand.init().then(function (options) {
    var changelogAction = new _Gren2.default(options);

    return changelogAction.changelog();
}).catch(function (error) {
    console.error(error);
});