'use strict';

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var chalk = require('chalk');
var fs = require('fs');
var ora = require('ora');
var YAML = require('json2yaml');
var Path = require('path');

var _require = require('js-beautify'),
    beautify = _require.js_beautify;

var requireFromUrl = require('require-from-url/sync');
require('require-yaml');

/**
 * Sort an object by its keys
 *
 * @since 0.8.0
 * @public
 *
 * @param  {Object} object
 * @return {Object}
 */
function sortObject(object) {
    return (0, _keys2.default)(object).sort().reduce(function (result, key) {
        result[key] = object[key];

        return result;
    }, {});
}

/**
* Print a task name in a custom format
*
* @since 0.5.0
* @public
*
* @param  {string} name The name of the task
*/ // istanbul ignore next
function printTask(isQuiet, name) {
    if (isQuiet) {
        return;
    }

    process.stdout.write(chalk.blue('\n\uD83E\uDD16  - ' + name + ':\n===================================\n'));
}

/**
* Outputs the task status
*
* @since 0.5.0
* @public
*
* @param  {string} taskName The task name
*
* @return {Function}          The function to be fired when is loaded
*/ // istanbul ignore next
function task(gren, taskName) {
    if (gren.options.quiet) {
        gren.tasks[taskName] = {};

        return noop;
    }
    var spinner = ora(taskName);
    gren.tasks[taskName] = spinner;

    spinner.start();

    return function (message) {
        spinner.succeed(message);
    };
}

/**
 * Clears all the tasks that are still running
 *
 * @since 0.6.0
 * @public
 *
 * @param  {GithubReleaseNotes} gren
 */ // istanbul ignore next
function clearTasks(gren) {
    if (!(0, _keys2.default)(gren.tasks.length)) {
        return;
    }

    (0, _keys2.default)(gren.tasks).forEach(function (taskName) {
        gren.tasks[taskName].stop();
    });

    process.stdout.write(chalk.red('\nTask(s) stopped because of the following error:\n'));

    gren.tasks = [];
}

/**
* Check if e value is between a min and a max
*
* @since 0.5.0
* @public
*
* @param  {number}  value
* @param  {number}  min
* @param  {number}  max
*
* @return {Boolean}
*/
function isInRange(value, min, max) {
    return !Math.floor((value - min) / (max - min));
}

/**
* Transforms a dasherize string into a camel case one.
*
* @since 0.3.2
* @public
*
* @param  {string} value The dasherize string
*
* @return {string}       The camel case string
*/
function dashToCamelCase(value) {
    return value.toLowerCase().replace(/-([a-z])/g, function (match) {
        return match[1].toUpperCase();
    });
}

/**
 * Converts an array like string to an actual Array,
 * converting also underscores to spaces
 *
 * @since 0.6.0
 * @public
 *
 * @param  {string} arrayLike The string of items
 * e.g.
 * "wont_fix, duplicate, bug"
 *
 * @return {Array}  The items with spaces instead of underscores.
 */
function convertStringToArray(arrayLike) {
    if (!arrayLike) {
        return [];
    }

    if ((typeof arrayLike === 'undefined' ? 'undefined' : (0, _typeof3.default)(arrayLike)) === 'object') {
        return (0, _keys2.default)(arrayLike).map(function (itemKey) {
            return arrayLike[itemKey];
        });
    }

    return arrayLike.replace(/\s/g, '').split(',').map(function (itemName) {
        return itemName.replace(/_/g, ' ', itemName);
    });
}

/**
* Format a date into a string
*
* @since 0.5.0
* @public
*
* @param  {Date} date
* @return {string}
*/
function formatDate(date) {
    return ('0' + date.getDate()).slice(-2) + '/' + ('0' + (date.getMonth() + 1)).slice(-2) + '/' + date.getFullYear();
}

/**
 * Gets the content from a filepath a returns an object
 *
 * @since  0.6.0
 * @public
 *
 * @param  {string} filepath
 * @return {Object|boolean}
 */
function requireConfig(filepath) {
    if (!fs.existsSync(filepath)) {
        return false;
    }

    process.stdout.write(chalk.cyan('Getting gren config from local file ' + filepath + '\n'));

    if (getFileNameFromPath(filepath).match(/\./g).length === 1) {
        return JSON.parse(fs.readFileSync(filepath, 'utf8'));
    }

    return require(filepath);
}

/**
 * Get configuration from the one of the config files
 *
 * @since 0.6.0
 * @private
 *
 * @param  {string} path Path where to look for config files
 * @return {Object} The configuration from the first found file or empty object
 */
function getConfigFromFile(path) {
    var customFilename = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

    if (customFilename) {
        var config = requireConfig(Path.join(path, customFilename));
        if (!config) {
            throw chalk.red('Could not find custom config file: ' + customFilename);
        }
        return config;
    }

    return getFileTypes().reduce(function (carry, filename) {
        return carry || requireConfig(Path.join(path, filename));
    }, false) || {};
}

/**
 * Return the extension of a filename
 *
 * @param  {string} filename
 *
 * @return {string}
 */
function getFileExtension(filename) {
    return filename.slice((Math.max(0, filename.lastIndexOf('.')) || Infinity) + 1);
}

/**
 * Create the content for a configuratio file, based on extension and data
 *
 * @param  {string} path
 * @param  {Object} data
 *
 * @return {string} File content
 */ // istanbul ignore next
function writeConfigToFile(path, data) {
    var extension = getFileExtension(getFileNameFromPath(path));
    var dataType = {
        yml: function yml(content) {
            return YAML.stringify(content);
        },
        yaml: function yaml(content) {
            return YAML.stringify(content);
        },
        json: function json(content) {
            return beautify((0, _stringify2.default)(content));
        },
        none: function none(content) {
            return beautify((0, _stringify2.default)(content));
        },
        js: function js(content) {
            return beautify('module.exports = ' + (0, _stringify2.default)(content));
        }
    };

    return dataType[extension || 'none'](data);
}

/**
 * Get the filename from a path
 *
 * @since  0.10.0
 * @private
 *
 * @param  {string} path
 *
 * @return {string}
 */
function getFileNameFromPath() {
    var path = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

    return path.replace(/^.*[\\/]/, '');
}

/**
 * Get the file types for the configuration
 *
 * @since  0.13.0
 *
 * @return {Array}
 */
function getFileTypes() {
    return ['.grenrc.yml', '.grenrc.json', '.grenrc.yaml', '.grenrc.js', '.grenrc'];
}

/**
 * Remove all the configuration files
 *
 * @since  0.13.0
 *
 * @param {Boolean} confirm     Necessary to force the function.
 */
function cleanConfig(confirm) {
    var path = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : process.cwd();

    if (confirm !== true) {
        return;
    }

    getFileTypes().forEach(function (fileName) {
        var file = path + '/' + fileName;
        if (!fs.existsSync(file)) {
            return false;
        }

        fs.unlinkSync(file);

        return file;
    });
}

/**
 * judge whether to get config from remote uri
 * @since  0.18.0
 * @private
 *
 * @param {string} path
 *
 * @returns {string}
 */
function getRemoteUrl(path) {
    var pkgPath = Path.join(path, 'package.json');
    var pkgExist = fs.existsSync(pkgPath);

    var _ref = pkgExist ? require(pkgPath) : {},
        _ref$gren = _ref.gren,
        gren = _ref$gren === undefined ? '' : _ref$gren;

    return gren;
}

/**
 * get config from remote
 * @since 0.18.0
 * @private
 *
 * @param  {string} path Path where to look for config files
 * @return {Object} The configuration from the first found file or empty object
*/
function getConfigFromRemote(url) {
    if (!url) return null;

    process.stdout.write(chalk.cyan('Fetching gren config from remote: ' + url + '\n'));

    var config = null;
    try {
        config = requireFromUrl(url);
    } catch (error) {
        // console.error(error);
        process.stdout.write(chalk.cyan('Fetched remote config fail: ' + url + '\n'));
        throw new Error(error);
    }

    process.stdout.write(chalk.cyan('Fetched remote config succeed'));

    return config;
}

/**
 * combine getConfigFromRemote & getGrenConfig
 * @since 0.18.0
 * @public
 *
 * @param  {string} path Path where to look for config files
 * @return {Object} The configuration from the first found file or empty object
*/
function getGrenConfig(path) {
    var remoteUrl = getRemoteUrl(path);
    var config = void 0;
    if (remoteUrl) {
        config = getConfigFromRemote(remoteUrl);
    }

    if (!config) {
        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            args[_key - 1] = arguments[_key];
        }

        config = getConfigFromFile.apply(undefined, [path].concat(args));
    }

    return config;
}

/**
 * Just a noop function
 */
function noop() {}

// Allow nodeunit to work. Has to be fixed.
module.exports = {
    cleanConfig: cleanConfig,
    clearTasks: clearTasks,
    convertStringToArray: convertStringToArray,
    dashToCamelCase: dashToCamelCase,
    formatDate: formatDate,
    getConfigFromFile: getConfigFromFile,
    getRemoteUrl: getRemoteUrl,
    getConfigFromRemote: getConfigFromRemote,
    getGrenConfig: getGrenConfig,
    getFileExtension: getFileExtension,
    getFileNameFromPath: getFileNameFromPath,
    getFileTypes: getFileTypes,
    isInRange: isInRange,
    noop: noop,
    printTask: printTask,
    requireConfig: requireConfig,
    sortObject: sortObject,
    task: task,
    writeConfigToFile: writeConfigToFile
};