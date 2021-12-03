'use strict';

module.exports = {
    // NOTE: check if author is present as might be returned as null.
    commit: function commit(_ref) {
        var message = _ref.message,
            url = _ref.url,
            author = _ref.author,
            name = _ref.name;
        return '- [' + message + '](' + url + ') - ' + (author ? '@' + author : name);
    },
    issue: '- {{labels}} {{name}} [{{text}}]({{url}})',
    label: '[**{{label}}**]',
    noLabel: 'closed',
    group: '\n#### {{heading}}\n',
    changelogTitle: '# Changelog\n\n',
    release: '## {{release}} ({{date}})\n{{body}}',
    releaseSeparator: '\n---\n\n'
};