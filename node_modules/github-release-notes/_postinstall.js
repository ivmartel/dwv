const chalk = require('chalk');

process.stdout.write(chalk.white(`
                    ${chalk.yellow('| ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ |')}
                          ${chalk.blue(`🙏  Thanks for downloading ${chalk.green('gren')}`)}
                    ${chalk.yellow('| ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ |')}

Before you start:

    1. Generate a token with ${chalk.yellow('repo scope')} at this link: ${chalk.blue('https://github.com/settings/tokens/new')}
    2. For every project, run ${chalk.green('gren init')} to create a config file (optional)
    3. Run ${chalk.green('gren help')} for more help or see ${chalk.blue('https://github-tools.github.io/github-release-notes/')}

For any questions/issues, go here: ${chalk.blue('https://github.com/github-tools/github-release-notes/issues')}

If you like ${chalk.green('gren')}, feel free to ⭐  it!


${chalk.yellow('.:| ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ |:.')}


`));
