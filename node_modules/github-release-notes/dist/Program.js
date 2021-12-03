'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _entries = require('babel-runtime/core-js/object/entries');

var _entries2 = _interopRequireDefault(_entries);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _GitHubInfo = require('./GitHubInfo');

var _GitHubInfo2 = _interopRequireDefault(_GitHubInfo);

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _utils = require('./_utils.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/** Class creating a Commander program, managing the options passed via bash and config file. */
var Program = function () {
    function Program(props) {
        (0, _classCallCheck3.default)(this, Program);

        var _consumeOptions2 = this._consumeOptions(props.options),
            programOptions = _consumeOptions2.programOptions,
            defaults = _consumeOptions2.defaults;

        this.name = props.name;
        this.description = props.description;
        this.examples = props.examples;
        this.defaults = defaults;
        this.program = this._programWithEvents(this._programWithOptions(_commander2.default, programOptions), props.events).name(this.name).description(this.description).parse(props.argv);

        this.options = (0, _assign2.default)({}, (0, _utils.getGrenConfig)(props.cwd, _commander2.default.config), this._getOptionsFromObject(this.program, this.defaults));
    }

    /**
     * Initialise the module
     *
     * @since 0.10.0
     * @public
     *
     * @return {Promise}
     */


    (0, _createClass3.default)(Program, [{
        key: 'init',
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
                var options;
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                _context.next = 2;
                                return this._getEnvOptions();

                            case 2:
                                options = _context.sent;

                                this.options = this._filterObject(this._camelCaseObjectKeys((0, _assign2.default)({}, this.defaults, _assign2.default.apply(Object, [{}].concat((0, _toConsumableArray3.default)([].concat(options)))), this.options)));

                                return _context.abrupt('return', this.options);

                            case 5:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function init() {
                return _ref.apply(this, arguments);
            }

            return init;
        }()

        /**
         * Get informations from the local folder
         *
         * @since 0.10.0
         * @private
         *
         * @return {Promise}
         */

    }, {
        key: '_getEnvOptions',
        value: function _getEnvOptions() {
            var githubInfo = new _GitHubInfo2.default();
            var _options = this.options,
                username = _options.username,
                repo = _options.repo;


            if (username && repo) {
                return githubInfo.token;
            }

            return githubInfo.options;
        }

        /**
         * Remove all the properties that have undefined values from an object
         *
         * @since  0.10.0
         * @private
         *
         * @param  {Object} object
         *
         * @return {Object}
         */

    }, {
        key: '_filterObject',
        value: function _filterObject(object) {
            return (0, _entries2.default)(object).filter(function (_ref2) {
                var _ref3 = (0, _slicedToArray3.default)(_ref2, 2),
                    key = _ref3[0],
                    value = _ref3[1];

                return value !== undefined;
            }).reduce(function (carry, _ref4) {
                var _ref5 = (0, _slicedToArray3.default)(_ref4, 2),
                    key = _ref5[0],
                    value = _ref5[1];

                carry[key] = value;
                return carry;
            }, {});
        }

        /**
         * Add all the given events to a program
         *
         * @since  0.10.0
         * @private
         *
         * @param  {Commander} program
         * @param  {Object} events
         *
         * @return {Commander}
         */

    }, {
        key: '_programWithEvents',
        value: function _programWithEvents(program, events) {
            if (!events || !events.length) {
                return program;
            }

            (0, _entries2.default)(events).forEach(function (_ref6) {
                var _ref7 = (0, _slicedToArray3.default)(_ref6, 2),
                    event = _ref7[0],
                    action = _ref7[1];

                program.on(event, action);
            });

            return program;
        }

        /**
         * Add all the given options to a program
         *
         * @since 0.10.0
         * @private
         *
         * @param  {Commander} program
         * @param  {Array} options
         *
         * @return {Commander}
         */

    }, {
        key: '_programWithOptions',
        value: function _programWithOptions(program, options) {
            options.forEach(function (_ref8) {
                var name = _ref8.name,
                    description = _ref8.description,
                    action = _ref8.action,
                    defaultValue = _ref8.defaultValue;
                return program.option.apply(program, (0, _toConsumableArray3.default)([name, description, action, defaultValue].filter(Boolean)));
            });
            return program;
        }

        /**
         * Consume the options from the properties and provide get the defaults and the programOptions
         *
         * @since  0.10.0
         * @private
         *
         * @param  {Array} opts
         *
         * @return {Object}
         */

    }, {
        key: '_consumeOptions',
        value: function _consumeOptions() {
            var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

            if (!Array.isArray(opts)) {
                return {
                    programOptions: [],
                    defaults: {}
                };
            }

            var programOptions = opts.map(function (_ref9) {
                var short = _ref9.short,
                    name = _ref9.name,
                    valueType = _ref9.valueType,
                    description = _ref9.description,
                    defaultValue = _ref9.defaultValue,
                    action = _ref9.action;
                return {
                    name: short && name ? short + ', --' + name + ' ' + (valueType || '') : ' ',
                    description: description,
                    defaultValue: defaultValue,
                    action: action
                };
            });

            var defaults = this._camelCaseObjectKeys(opts.reduce(function (carry, opt) {
                carry[opt.name] = opt.defaultValue;
                return carry;
            }, {}));

            return {
                programOptions: programOptions,
                defaults: defaults
            };
        }

        /**
         * Extrapulate the options from a program
         *
         * @since  0.10.0
         * @private
         *
         * @param  {Object} defaults
         *
         * @return {Object}
         */

    }, {
        key: '_getOptionsFromObject',
        value: function _getOptionsFromObject() {
            var object = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
            var defaults = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            if ((typeof object === 'undefined' ? 'undefined' : (0, _typeof3.default)(object)) !== 'object' || Array.isArray(object)) {
                return {};
            }

            return (0, _keys2.default)(defaults).reduce(function (carry, option) {
                if (object[option] && object[option] !== defaults[option]) {
                    carry[option] = object[option];
                }

                return carry;
            }, {});
        }

        /**
         * Converts all Object values to camel case
         *
         * @param  {Object} object
         *
         * @return {Object}
         */

    }, {
        key: '_camelCaseObjectKeys',
        value: function _camelCaseObjectKeys() {
            var _this = this;

            var object = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            if ((typeof object === 'undefined' ? 'undefined' : (0, _typeof3.default)(object)) !== 'object' || Array.isArray(object)) {
                return {};
            }

            return (0, _entries2.default)(object).reduce(function (carry, _ref10) {
                var _ref11 = (0, _slicedToArray3.default)(_ref10, 2),
                    key = _ref11[0],
                    value = _ref11[1];

                carry[_this._dashToCamelCase(key)] = value;
                return carry;
            }, {});
        }

        /**
        * Transforms a dasherize string into a camel case one.
        *
        * @since 0.3.2
        * @private
        *
        * @param  {string} value The dasherize string
        *
        * @return {string}       The camel case string
        */

    }, {
        key: '_dashToCamelCase',
        value: function _dashToCamelCase() {
            var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

            if (typeof value !== 'string') {
                return '';
            }

            return value.replace(/-([a-z])/g, function (match) {
                return match[1].toUpperCase();
            });
        }
    }]);
    return Program;
}();

exports.default = Program;