'use strict';
const chalk = require('chalk');
const {ESLint} = require('eslint');

module.exports = grunt => {
	grunt.registerMultiTask('eslint', 'Validate files with ESLint', function () {
		const done = this.async();

		(async () => {
			try {
				const {
					format,
					quiet,
					maxWarnings,
					failOnError,
					outputFile,
					...options
				} = this.options({
					outputFile: false,
					quiet: false,
					maxWarnings: -1,
					failOnError: true,
					format: 'stylish'
				});

				if (this.filesSrc.length === 0) {
					grunt.log.writeln(chalk.magenta('Could not find any files to validate'));
					return true;
				}

				const engine = new ESLint(options);

				const formatter = await engine.loadFormatter(format);

				if (!formatter) {
					grunt.warn(`Could not find formatter ${format}`);
					return false;
				}

				let results = await engine.lintFiles(this.filesSrc);

				if (options.fix) {
					await ESLint.outputFixes(results);
				}

				if (quiet) {
					results = ESLint.getErrorResults(results);
				}

				const output = formatter.format(results);

				if (outputFile) {
					grunt.file.write(outputFile, output);
				} else if (output) {
					console.log(output);
				}

				const {warningCount, errorCount} = results.reduce((count, {warningCount, errorCount}) => {
					count.warningCount += warningCount;
					count.errorCount += errorCount;
					return count;
				}, {warningCount: 0, errorCount: 0});

				const tooManyWarnings = maxWarnings >= 0 && warningCount > maxWarnings;

				if (errorCount === 0 && tooManyWarnings) {
					grunt.warn(`ESLint found too many warnings (maximum: ${maxWarnings})`);
				}

				done(failOnError ? errorCount === 0 : 0);
			} catch (error) {
				done(error);
			}
		})();
	});
};
