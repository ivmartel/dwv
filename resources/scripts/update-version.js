// Update the library version number in the files that hold it.
// Usage: node resources/scripts/update-version.js <version> [--dry-run]
// With version either:
// - an explicit version: 'm.n.p' or 'm.n.p-(beta|rc).b',
// - 'current': keep the current version (useful with '--dry-run'),
// - 'pre': increment the pre-release number (0.38.0-beta.1 -> 0.38.0-beta.2),
// - 'release': drop the pre-release part (0.38.0-beta.1 -> 0.38.0).
// The new version is computed from the one in package.json and
// printed on stdout (logs go to stderr). With '--dry-run',
// only print the new version, do not update the files.

import {readFileSync, writeFileSync} from 'node:fs';

// version pattern (without anchors)
const versionPattern = '[0-9]+\\.[0-9]+\\.[0-9]+(?:-(?:beta|rc)\\.[0-9]+)?';
// version parts pattern
const versionPartsRegex =
  /^([0-9]+)\.([0-9]+)\.([0-9]+)(?:-(beta|rc)\.([0-9]+))?$/;

// files to update: path and line regex, the version
// being the content of its second group
// (the first one is the reference to compute the new version)
const targets = [
  {
    path: 'package.json',
    regex: new RegExp(`^(  "version": ")(${versionPattern})(",)$`, 'm')
  },
  {
    path: 'src/dicom/dicomParser.js',
    regex: new RegExp(`^(  return ')(${versionPattern})(';)$`, 'm')
  }
];

/**
 * Exit with an error message.
 *
 * @param {string} message The error message.
 */
function fail(message) {
  console.error(message);
  process.exit(1);
}

/**
 * Compute the new version.
 *
 * @param {string} current The current version.
 * @param {string} input The input version or increment keyword.
 * @returns {string} The new version.
 */
function getNewVersion(current, input) {
  const [, major, minor, patch, preType, preNumber] =
    versionPartsRegex.exec(current);
  const base = `${major}.${minor}.${patch}`;
  switch (input) {
    case 'current':
      return current;
    case 'pre':
      if (!preType) {
        fail(`Cannot increment pre-release of a release version: ${current}`);
      }
      return `${base}-${preType}.${Number(preNumber) + 1}`;
    case 'release':
      return base;
    default:
      if (!versionPartsRegex.test(input)) {
        fail(`Bad version format: '${input}'`);
      }
      return input;
  }
}

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const input = args.find((arg) => !arg.startsWith('--'));
if (!input) {
  fail('Usage: node update-version.js ' +
    '<m.n.p | m.n.p-(beta|rc).b | current | pre | release> [--dry-run]');
}

// read and check all files before writing any
const files = targets.map((target) => {
  const content = readFileSync(target.path, 'utf8');
  const match = target.regex.exec(content);
  if (!match) {
    fail(`No version found in '${target.path}'`);
  }
  return {...target, content, current: match[2]};
});

const version = getNewVersion(files[0].current, input);

if (!dryRun) {
  for (const file of files) {
    writeFileSync(file.path,
      file.content.replace(file.regex, `$1${version}$3`));
    console.error(`${file.path}: ${file.current} -> ${version}`);
  }
}

console.log(version);
