#!/usr/bin/env node
'use strict';

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _package = require('../package.json');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var argvWithVersion = function argvWithVersion(argvs) {
    var vPos = argvs.indexOf('-v');

    if (vPos > -1) {
        argvs[vPos] = '-V';
    }

    return argvs;
};

_commander2.default.version(_package.version).description('gren (\uD83E\uDD16 ) ' + _package.description).usage('<command> [options]').command('init', 'Initialise the module options').alias('i').command('release', 'Generate release notes and attach them to a tag').alias('r').command('changelog', 'Create a CHANGELOG.md file, based on release notes').alias('c').command('examples', 'Show few examples of stuff that you can do <cmd>').parse(argvWithVersion(process.argv));