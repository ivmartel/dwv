'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.generate = undefined;

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _entries = require('babel-runtime/core-js/object/entries');

var _entries2 = _interopRequireDefault(_entries);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Generate the templated string based on
 * a placeholders Object
 *
 * @since  0.6.0
 * @private
 *
 * @param  {Object} placeholders All the keys/values to update
 * @param  {string|Function} string The string or the function that needs to be replaced
 *
 * @return {string}
 */
function generate(placeholders, string) {
    if (typeof string === 'function') {
        return string(placeholders);
    }

    return (0, _entries2.default)(placeholders).reduce(function (carry, _ref) {
        var _ref2 = (0, _slicedToArray3.default)(_ref, 2),
            key = _ref2[0],
            placeholder = _ref2[1];

        var placeholderRegExp = new RegExp('{{' + key + '}}', 'g');

        return carry.replace(placeholderRegExp, placeholder);
    }, string);
}

exports.generate = generate;