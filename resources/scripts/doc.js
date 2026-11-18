// Generate the jsdoc site with an overridden site base path, for ex
// to publish it under a sub folder of gh-pages (the default
// resources/doc/jsdoc.conf.json builds for the root '/').
// jsdoc has no command line option for it, so this writes a temporary
// config with the clean-jsdoc-theme 'basePath' option set and runs jsdoc.
// Usage: node resources/scripts/doc.js --base-path /dwv/doc/stable/
//   [--destination build/doc]

import {spawnSync} from 'node:child_process';
import {mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {parseArgs} from 'node:util';

const {values} = parseArgs({
  options: {
    'base-path': {type: 'string'},
    destination: {type: 'string'}
  }
});
if (typeof values['base-path'] === 'undefined') {
  console.error(
    'Usage: node resources/scripts/doc.js --base-path <path>' +
    ' [--destination <dir>]');
  process.exit(1);
}

const config = JSON.parse(
  readFileSync('resources/doc/jsdoc.conf.json', 'utf8'));
config.opts.basePath = values['base-path'];
if (typeof values.destination !== 'undefined') {
  config.opts.destination = values.destination;
}

// relative paths in the config resolve against the working directory,
// not the config file, so the temporary file can live anywhere
const tmpDir = mkdtempSync(join(tmpdir(), 'dwv-doc-'));
const confPath = join(tmpDir, 'jsdoc.conf.json');
writeFileSync(confPath, JSON.stringify(config, null, 2));

const jsdoc = createRequire(import.meta.url).resolve('jsdoc/jsdoc.js');
const result = spawnSync(
  process.execPath, [jsdoc, '-c', confPath], {stdio: 'inherit'});
rmSync(tmpDir, {recursive: true, force: true});
process.exit(result.status ?? 1);
