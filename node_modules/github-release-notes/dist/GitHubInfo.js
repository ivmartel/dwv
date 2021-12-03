'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _child_process = require('child_process');

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _regexMatchAll = require('regex-match-all');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/** Class retrieving GitHub informations from the folder where .git is initialised. */
var GitHubInfo = function () {
    function GitHubInfo() {
        (0, _classCallCheck3.default)(this, GitHubInfo);
    }

    (0, _createClass3.default)(GitHubInfo, [{
        key: '_executeCommand',


        /**
        * Execute a command in the bash and run a callback
        *
        * @since 0.5.0
        * @private
        *
        * @param  {string}   command The command to execute
        * @param  {Function} callback The callback which returns the stdout
        *
        * @return {Promise}
        */
        value: function _executeCommand(command, callback) {
            return new _promise2.default(function (resolve, reject) {
                (0, _child_process.exec)(command, function (err, stdout, stderr) {
                    if (err || stderr) {
                        reject(err || stderr);
                    } else {
                        resolve(stdout.replace('\n', ''));
                    }
                });
            }).then(callback).catch(function (error) {
                throw new Error(_chalk2.default.red(error) + _chalk2.default.yellow('\nMake sure you\'re running the command from the repo folder, or you using the --username and --repo flags.'));
            });
        }

        /**
        * Get repo informations
        *
        * @since 0.5.0
        * @public
        *
        * @param  {Function} callback
        *
        * @return {Promise} The promise that resolves repo informations ({user: user, name: name})
        */

    }, {
        key: '_repo',
        value: function _repo(callback) {
            return this._executeCommand('git config remote.origin.url', function (repo) {
                var repoPath = (0, _regexMatchAll.matchAll)(/([\w-.]+)\/([\w-.]+?)(\.git)?$/g, repo);

                if (!repoPath[1]) {
                    return _promise2.default.reject('No repo found');
                }

                var user = repoPath[1][0];
                var name = repoPath[1][1];

                return {
                    username: user,
                    repo: name
                };
            }).then(callback);
        }

        /**
        * Get token informations
        *
        * @since 0.5.0
        * @public
        *
        * @param  {Function} callback
        *
        * @return {Promise} The promise that resolves token informations ({token: token})
        */

    }, {
        key: '_token',
        value: function _token() {
            var token = process.env.GREN_GITHUB_TOKEN;

            return token ? _promise2.default.resolve({ token: token }) : _promise2.default.resolve(null);
        }
    }, {
        key: 'options',

        /**
         * Getter for the options
         *
         * @return {Promise.all}
         */
        get: function get() {
            return _promise2.default.all([this._repo(), this._token()]);
        }

        /**
         * Getter for the token
         *
         * @return {Promise}
         */

    }, {
        key: 'token',
        get: function get() {
            return this._token();
        }

        /**
         * Getter for the repo
         *
         * @return {Promise}
         */

    }, {
        key: 'repo',
        get: function get() {
            return this._repo();
        }
    }]);
    return GitHubInfo;
}();

exports.default = GitHubInfo;