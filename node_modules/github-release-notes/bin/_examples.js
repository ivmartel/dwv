'use strict';

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var chalk = require('chalk');

/**
 * Generate examples based on an Array
 *
 * @param  {Array} examples
 */ // istanbul ignore next
function generateExamples(title, examples) {
    process.stdout.write('\n  Examples for ' + title + ':');
    var spaceify = function spaceify(number) {
        return new Array(!number || number < 0 ? 0 : number + 1).join(' ');
    };
    var spaces = spaceify(6);
    var descriptionPlaceholder = spaceify(Math.max.apply(Math, (0, _toConsumableArray3.default)(examples.map(function (_ref) {
        var description = _ref.description;
        return description ? description.length : 0;
    }))));

    examples.forEach(function (_ref2) {
        var name = _ref2.name,
            description = _ref2.description,
            code = _ref2.code;

        var tabs = spaceify(descriptionPlaceholder.length - (description ? description.length : 0));

        if (name) {
            process.stdout.write('\n\n    ' + chalk.blue(name) + ':\n');
        }

        if (description) {
            process.stdout.write('\n' + spaces + description);
        } else {
            process.stdout.write(spaces);
        }

        if (code) {
            process.stdout.write('' + tabs + spaces + chalk.green('$ ' + code) + '\n');
        }
    });
}

module.exports = {
    generateExamples: generateExamples,
    gren: [{
        name: 'Help',
        description: 'Show the general help of the gren tool',
        code: 'gren'
    }, {
        code: 'gren --help'
    }, {
        code: 'gren -h'
    }, {
        name: 'Version',
        description: 'Show the using version',
        code: 'gren --version'
    }, {
        code: 'gren -v'
    }, {
        description: 'Get help for the release options',
        code: 'gren help release'
    }],
    release: [{
        name: 'Manual repo infos',
        description: 'Run gren outside of the project folder.',
        code: 'gren release --username=REPO_USER --repo=REPO_NAME'
    }, {
        name: 'Override an existing release',
        description: 'By default, `gren` won\'t override an existing release and it will flag `Skipping 4.0.0 (use --override to replace it)`. If you want to override, as it suggests, use:',
        code: 'gren release --override'
    }, {
        name: 'Create release notes for a specific tag',
        description: 'Create release notes from the commits or issues closed for the specified tag and the one before.',
        code: 'gren release --tags=4.0.0'
    }, {
        description: 'Create release notes from the commits or the issues between two specified tags.',
        code: 'gren release --tags=4.0.0..3.0.0'
    }, {
        name: 'Create release notes for all the tags',
        description: 'Create release notes for all the tags in the repository.',
        code: 'gren release --tags=all'
    }, {
        description: 'Ignore the tags including an Array of strings',
        code: 'gren release --tags=all --ignore-tags-with="-rc","-alpha","-beta"'
    }, {
        name: 'Work with milestones',
        description: 'Create release notes for a tag using the belonging to a milestone that matches the name of the tag. e.g. If the tag is 4.0.0, `gren` is going to match the milestone _"Release 4.0.0"_.',
        code: 'gren release --data-source=milestones --milestone-match="Release {{tag_name}}"'
    }, {
        description: 'Otherwise, you can just filter the issues that belong to _a_ milestone',
        code: 'gren release --only-milestones'
    }, {
        name: 'Use commit messages',
        description: 'Generate release notes based on commit messages',
        code: 'gren release --data-source=commits'
    }],
    changelog: [{
        name: 'Custom changelog',
        description: 'Create a changelog with a custom filename',
        code: 'gren changelog --generate --override --changelog-filename=RELEASE_NOTES.md'
    }]
};