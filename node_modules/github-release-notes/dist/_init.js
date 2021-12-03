'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _inquirer = require('inquirer');

var _inquirer2 = _interopRequireDefault(_inquirer);

var _utils = require('./_utils');

var _utils2 = _interopRequireDefault(_utils);

var _GitHubInfo = require('./GitHubInfo');

var _GitHubInfo2 = _interopRequireDefault(_GitHubInfo);

var _githubApi = require('github-api');

var _githubApi2 = _interopRequireDefault(_githubApi);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _validUrl = require('valid-url');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var githubApi = new _GitHubInfo2.default();
var prompt = _inquirer2.default.createPromptModule();
var GREN_GITHUB_TOKEN = process.env.GREN_GITHUB_TOKEN;


if (!GREN_GITHUB_TOKEN) {
    console.error(_chalk2.default.red('Can\'t find GREN_GITHUB_TOKEN. Please configure your environment') + _chalk2.default.blue('\nSee https://github.com/github-tools/github-release-notes#setup'));

    process.exit(1);
}

var getInfo = function () {
    var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
        var infos;
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.prev = 0;
                        _context.next = 3;
                        return githubApi.repo;

                    case 3:
                        infos = _context.sent;
                        return _context.abrupt('return', infos);

                    case 7:
                        _context.prev = 7;
                        _context.t0 = _context['catch'](0);
                        throw _chalk2.default.red('You have to run this command in a git repo folder');

                    case 10:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, undefined, [[0, 7]]);
    }));

    return function getInfo() {
        return _ref.apply(this, arguments);
    };
}();

var getLabels = function () {
    var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
        var _ref3, username, repo, gitHub, issues, _ref4, labels;

        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        _context2.next = 2;
                        return getInfo();

                    case 2:
                        _ref3 = _context2.sent;
                        username = _ref3.username;
                        repo = _ref3.repo;
                        _context2.prev = 5;
                        gitHub = new _githubApi2.default({
                            GREN_GITHUB_TOKEN: GREN_GITHUB_TOKEN
                        });
                        issues = gitHub.getIssues(username, repo);
                        _context2.next = 10;
                        return issues.listLabels();

                    case 10:
                        _ref4 = _context2.sent;
                        labels = _ref4.data;
                        return _context2.abrupt('return', labels);

                    case 15:
                        _context2.prev = 15;
                        _context2.t0 = _context2['catch'](5);

                        console.warn(_chalk2.default.bgYellow(_chalk2.default.black('I can\'t get your repo labels, make sure you are online to use the complete initialisation')));
                        return _context2.abrupt('return', false);

                    case 19:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, undefined, [[5, 15]]);
    }));

    return function getLabels() {
        return _ref2.apply(this, arguments);
    };
}();

var getQuestions = function () {
    var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
        var labels;
        return _regenerator2.default.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        _context3.next = 2;
                        return getLabels();

                    case 2:
                        labels = _context3.sent;
                        return _context3.abrupt('return', [{
                            name: 'apiUrlType',
                            type: 'list',
                            message: 'What type of APIs do you need?',
                            choices: [{
                                name: 'Normal',
                                value: false
                            }, {
                                name: 'GitHub Enterprise',
                                value: 'ghe'
                            }]
                        }, {
                            name: 'apiUrl',
                            type: 'input',
                            message: 'Write your Enterprise url',
                            suffix: _chalk2.default.blueBright(' e.g. https://MY_ENTERPRISE_DOMAIN/api/v3'),
                            when: function when(_ref6) {
                                var apiUrlType = _ref6.apiUrlType;
                                return apiUrlType === 'ghe';
                            },
                            validate: function validate(value) {
                                return (0, _validUrl.isUri)(value) ? true : 'Please type a valid url';
                            }
                        }, {
                            name: 'dataSource',
                            type: 'list',
                            message: 'Where shall I get the informations from?',
                            choices: [{
                                value: 'issues',
                                name: 'Issues (Time based)'
                            }, {
                                value: 'milestones',
                                name: 'Issues (Milestone based)'
                            }, {
                                value: 'commits',
                                name: 'Commits'
                            }, {
                                value: 'prs',
                                name: 'Pull Requests'
                            }]
                        }, {
                            name: 'prefix',
                            type: 'input',
                            suffix: _chalk2.default.blueBright(' e.g. v'),
                            message: 'Do you want to add a prefix to release titles?'
                        }, {
                            name: 'includeMessages',
                            type: 'list',
                            message: 'Which type of commits do you want to include?',
                            choices: [{
                                value: 'merges',
                                name: 'Merges'
                            }, {
                                value: 'commits',
                                name: 'Commits'
                            }, {
                                value: 'all',
                                name: 'All'
                            }],
                            when: function when(_ref7) {
                                var dataSource = _ref7.dataSource;
                                return dataSource === 'commits';
                            }
                        }, {
                            name: 'ignoreCommitsWithConfirm',
                            type: 'confirm',
                            default: false,
                            message: 'Do you want to ignore commits containing certain words?',
                            when: function when(_ref8) {
                                var dataSource = _ref8.dataSource;
                                return dataSource === 'commits';
                            }
                        }, {
                            name: 'ignoreCommitsWith',
                            type: 'input',
                            message: 'Which ones? Use commas to separate.',
                            suffix: _chalk2.default.blueBright(' e.g. changelog,release'),
                            when: function when(_ref9) {
                                var ignoreCommitsWithConfirm = _ref9.ignoreCommitsWithConfirm,
                                    dataSource = _ref9.dataSource;
                                return dataSource === 'commits' && ignoreCommitsWithConfirm;
                            },
                            filter: function filter(value) {
                                return value.replace(/\s/g).split(',');
                            }
                        }, {
                            name: 'ignoreLabelsConfirm',
                            type: 'confirm',
                            default: false,
                            message: 'Do you want to not output certain labels in the notes?',
                            when: function when(_ref10) {
                                var dataSource = _ref10.dataSource;
                                return Array.isArray(labels) && dataSource !== 'commits';
                            }
                        }, {
                            name: 'ignoreLabels',
                            type: 'checkbox',
                            message: 'Select the labels that should be excluded',
                            when: function when(_ref11) {
                                var ignoreLabelsConfirm = _ref11.ignoreLabelsConfirm;
                                return ignoreLabelsConfirm;
                            },
                            choices: Array.isArray(labels) && labels.map(function (_ref12) {
                                var name = _ref12.name;
                                return name;
                            })
                        }, {
                            name: 'ignoreIssuesWithConfirm',
                            type: 'confirm',
                            message: 'Do you want to ignore issues/prs that have certain labels?',
                            default: false,
                            when: function when(_ref13) {
                                var dataSource = _ref13.dataSource;
                                return Array.isArray(labels) && dataSource !== 'commits';
                            }
                        }, {
                            name: 'ignoreIssuesWith',
                            type: 'checkbox',
                            message: 'Select the labels that should exclude the issue',
                            when: function when(_ref14) {
                                var ignoreIssuesWithConfirm = _ref14.ignoreIssuesWithConfirm;
                                return ignoreIssuesWithConfirm;
                            },
                            choices: Array.isArray(labels) && labels.map(function (_ref15) {
                                var name = _ref15.name;
                                return name;
                            })
                        }, {
                            name: 'onlyMilestones',
                            type: 'confirm',
                            message: 'Do you want to only include issues/prs that belong to a milestone?',
                            default: false,
                            when: function when(_ref16) {
                                var dataSource = _ref16.dataSource;
                                return dataSource === 'issues' || dataSource === 'prs';
                            }
                        }, {
                            name: 'ignoreTagsWithConfirm',
                            type: 'confirm',
                            default: false,
                            message: 'Do you want to ignore tags containing certain words?'
                        }, {
                            name: 'ignoreTagsWith',
                            type: 'input',
                            message: 'Which ones? Use commas to separate',
                            suffix: _chalk2.default.blueBright(' e.g. -rc,-alpha,test'),
                            filter: function filter(value) {
                                return value.replace(/\s/g).split(',');
                            },
                            when: function when(_ref17) {
                                var ignoreTagsWithConfirm = _ref17.ignoreTagsWithConfirm;
                                return ignoreTagsWithConfirm;
                            }
                        }, {
                            name: 'groupBy',
                            type: 'list',
                            message: 'Do you want to group your notes?',
                            when: function when(_ref18) {
                                var dataSource = _ref18.dataSource;
                                return dataSource !== 'commits';
                            },
                            choices: [{
                                value: false,
                                name: 'No'
                            }, {
                                value: 'label',
                                name: 'Use existing labels'
                            }, {
                                value: {},
                                name: 'Use custom configuration'
                            }]
                        }, {
                            name: 'milestoneMatch',
                            type: 'input',
                            default: 'Release {{tag_name}}',
                            message: 'How can I link your tags to Milestone titles?',
                            when: function when(_ref19) {
                                var dataSource = _ref19.dataSource;
                                return dataSource === 'milestones';
                            }
                        }, {
                            name: 'changelogFilename',
                            default: 'CHANGELOG.md',
                            message: 'What file name do you want for your changelog?',
                            vaidate: function vaidate(value) {
                                console.log(_utils2.default.getFileExtension(value));
                                return _utils2.default.getFileExtension(value) === 'md' ? true : 'Has to be a markdown file!';
                            }
                        }, {
                            name: 'fileExist',
                            type: 'list',
                            message: 'Looks like you already have a configuration file. What do you want me to do?',
                            choices: [{
                                value: 'abort',
                                name: 'Oops, stop this'
                            }, {
                                value: 'override',
                                name: 'Override my existing file'
                            }, {
                                value: 'merge',
                                name: 'Merge these settings over existing ones'
                            }],
                            when: function when() {
                                return (0, _keys2.default)(_utils2.default.getGrenConfig(process.cwd())).length > 0;
                            }
                        }, {
                            name: 'fileType',
                            type: 'list',
                            message: 'Which extension would you like for your file?',
                            choices: _utils2.default.getFileTypes(),
                            when: function when(_ref20) {
                                var fileExist = _ref20.fileExist;
                                return fileExist !== 'abort';
                            }
                        }]);

                    case 4:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, undefined);
    }));

    return function getQuestions() {
        return _ref5.apply(this, arguments);
    };
}();

var configure = function () {
    var _ref21 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {
        var questions;
        return _regenerator2.default.wrap(function _callee4$(_context4) {
            while (1) {
                switch (_context4.prev = _context4.next) {
                    case 0:
                        _context4.next = 2;
                        return getQuestions();

                    case 2:
                        questions = _context4.sent;

                        process.stdout.write('\n🤖 : Hello, I\'m going to ask a couple of questions, to set gren up!\n\n');

                        return _context4.abrupt('return', prompt(questions));

                    case 5:
                    case 'end':
                        return _context4.stop();
                }
            }
        }, _callee4, undefined);
    }));

    return function configure() {
        return _ref21.apply(this, arguments);
    };
}();

exports.default = configure;