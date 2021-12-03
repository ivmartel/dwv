'use strict';

var chalk = require('chalk');

module.exports = {
    changelogOptions: [{
        short: false,
        name: false,
        description: '\n' + chalk.yellow('Changelog options') + '\n\n'
    }, {
        short: '-G',
        name: 'generate',
        description: 'Generate the changelog with gren rather than using the repo releases'
    }, {
        short: '-f',
        name: 'changelog-filename',
        valueType: '<filename.md>',
        description: 'The name of the changelog file. [CHANGELOG.md]',
        defaultValue: 'CHANGELOG.md'
    }, {
        short: false,
        name: false,
        description: '\n\n' + chalk.yellow('Release options') + ' \n' + chalk.blue('(only applicable with the --generate option).') + '\n\n'
    }],
    globalOptions: [{
        short: '-u',
        name: 'username',
        valueType: '<repo owner>',
        description: 'The username of the repo e.g. github-tools'
    }, {
        short: '-r',
        name: 'repo',
        valueType: '<repository name>',
        description: 'The repository name e.g. github-release-notes'
    }, {
        short: '-T',
        name: 'token',
        valueType: '<github token>',
        description: 'The token generated with repo access'
    }, {
        short: '-a',
        name: 'api-url',
        valueType: '<url>',
        description: 'Override the GitHub API URL, allows gren to connect to a private GHE installation'
    }, {
        short: '-o',
        name: 'override',
        description: 'Override the release notes if exist'
    }, {
        short: '-B',
        name: 'debug',
        description: 'Run the command in debugging mode'
    }, {
        short: '-t',
        name: 'tags',
        valueType: '<new-tag>..<old-tag>',
        description: 'Write release notes for <new-tag> using data collected until <old-tag>. If only one tag is specified, will use data until the previous tag. To run gren for all the tags, use --tags=all',
        action: function action(value) {
            return value.split('..');
        }
    }, {
        short: '-l',
        name: 'limit',
        valueType: '<number>',
        description: 'Just produce release notes for the <number> last releases.'
    }, {
        short: '-D',
        name: 'data-source',
        valueType: '<issues|commits|milestones|prs|prs-with-issues>',
        description: 'The informations you want to use to build release notes. [issues]',
        action: /^(issues|commits|milestones|prs|prs-with-issues)$/i,
        defaultValue: 'issues'
    }, {
        short: '-N',
        name: 'include-messages',
        valueType: '<merge|commits|all>',
        description: 'Filter the messages added to the release notes. Only used when --data-source used is commits [commits]',
        action: /^(merge|commits|all)$/i,
        defaultValue: 'commits'
    }, {
        short: '-i',
        name: 'ignore-tags-with',
        valueType: '<string1>,<string2>',
        description: 'Ignore tags that contain one of the specified strings.',
        action: function action(value) {
            return value.split(',');
        }
    }, {
        short: '-C',
        name: 'ignore-commits-with',
        valueType: '<string1>,<string2>',
        description: 'Ignore commits that contain one of the specified strings.',
        action: function action(value) {
            return value.split(',');
        }
    }, {
        short: '-p',
        name: 'prefix',
        valueType: '<name prefix>',
        description: 'Add a prefix to the tag version. e.g. \'v\''
    }, {
        short: '-g',
        name: 'group-by',
        valueType: '<label>',
        description: 'Group the issues using the labels as group headings. You can set custom headings for groups of labels from a configuration file.'
    }, {
        short: '-L',
        name: 'ignore-labels',
        valueType: '<label1>,<label2>',
        description: 'Ignore the specified labels.',
        action: function action(value) {
            return value.split(',');
        }
    }, {
        short: '-I',
        name: 'ignore-issues-with',
        valueType: '<label1>,<label2>',
        description: 'Ignore issues that contains one of the specified labels.',
        action: function action(value) {
            return value.split(',');
        }
    }, {
        short: '-M',
        name: 'milestone-match',
        valueType: '<prefix>',
        description: 'The title that the script needs to match to link the release to the milestone. e.g. v will match v0.1.0 [Release {{tag_name}}]',
        defaultValue: 'Release {{tag_name}}'
    }, {
        short: '-m',
        name: 'only-milestones',
        description: 'Add to the release bodies only the issues that have a milestone'
    }, {
        short: '-q',
        name: 'quiet',
        description: 'Run command without console logs.'
    }, {
        short: '-c',
        name: 'config',
        valueType: '<string>',
        description: 'Specify a custom config filename'
    }],
    releaseOptions: [{
        short: '-d',
        name: 'draft',
        description: 'Set the release notes as a draft.'
    }, {
        short: '-P',
        name: 'prerelease',
        description: 'Set the release as a prerelease.'
    }]
};