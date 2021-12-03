# grunt-eslint

> Validate files with [ESLint](https://eslint.org)

![](screenshot.png)

## Install

```sh
npm install --save-dev grunt-eslint
```

## Usage

```js
require('load-grunt-tasks')(grunt);

grunt.initConfig({
	eslint: {
		target: ['file.js']
	}
});

grunt.registerTask('default', ['eslint']);
```

## Examples

### Custom config and rules

```js
grunt.initConfig({
	eslint: {
		options: {
			overrideConfigFile: 'conf/eslint.json',
			rulePaths: ['conf/rules']
		},
		target: ['file.js']
	}
});
```

### Custom formatter

```js
grunt.initConfig({
	eslint: {
		options: {
			format: require('eslint-tap')
		},
		target: ['file.js']
	}
});
```

## Options

See the [ESLint options](https://eslint.org/docs/developer-guide/nodejs-api#-new-eslintoptions).

In addition the following options are supported:

### format

Type: `string`\
Default: `'stylish'`

The name of a [built-in formatter](https://github.com/eslint/eslint/tree/master/lib/cli-engine/formatters) or path to a custom one.

Some formatters you might find useful: [eslint-json](https://github.com/sindresorhus/eslint-json), [eslint-tap](https://github.com/sindresorhus/eslint-tap).

### outputFile

Type: `string`\
Default: `''`

Output the report to a file.

### quiet

Type: `boolean`\
Default: `false`

Report errors only.

### maxWarnings

Type: `number`\
Default: `-1` *(Means no limit)*

The nmber of warnings to trigger non-zero exit code.

### failOnError

Type: `boolean`\
Default: `true`

Fail the build if ESLint found any errors.
