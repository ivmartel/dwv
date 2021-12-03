# `gren` 🤖

> Github release notes and changelog generator

[![npm version](https://badge.fury.io/js/github-release-notes.svg)](https://badge.fury.io/js/github-release-notes)
[![Build Status](https://travis-ci.org/github-tools/github-release-notes.svg?branch=master)](https://travis-ci.org/github-tools/github-release-notes)
[![Join the chat at https://gitter.im/github-release-notes/Lobby](https://badges.gitter.im/github-release-notes/Lobby.svg)](https://gitter.im/github-release-notes/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Codecov](https://codecov.io/gh/github-tools/github-release-notes/branch/master/graph/badge.svg)](https://codecov.io/gh/github-tools/github-release-notes/branch/master)
[![npm downloads](https://img.shields.io/npm/dm/github-release-notes.svg)](https://www.npmjs.com/package/github-release-notes)
[![Automated Release Notes by gren](https://img.shields.io/badge/%F0%9F%A4%96-release%20notes-00B2EE.svg)](https://github-tools.github.io/github-release-notes/)
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-20-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

## OK, what can `gren` do for me?

`gren` is a small helpful robot that will do for you just create a release from a tag and compile the release notes using issues or commits.

It also can generate a `CHANGELOG.md` file based on the release notes (or generate a brand new).

- [The Motivation and Concept](#the-motivation-and-concept)
- [Feed 🤖](#feed-gren-)
- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Configuration file](#configuration-file)
- [Full Documentation](https://github-tools.github.io/github-release-notes)

## The Motivation and Concept

Everyone loves neat, transparent, informative release notes.
Everyone would also rather avoid maintaining them. What a hassle to have to evaluate what issues have been solved between two points in project's timeline, what types of problems they were, are they important to inform the users about, what issues solved them, etc.

Wouldn't it be great to get fantastic release notes compiled for you automatically based on all the hard work you put into your GitHub issues and pull requests?

The main motivation for bringing `gren` to life was the need for auto-generating release notes for every tag in a project.
The process, [as explained here](https://help.github.com/articles/creating-releases/), requires the tagger to go to your project's releases page in GitHub, draft that tag as a new release and manually add what has changed.

Let `gren` take care of that for you. It automates this process and also writes release notes for you, creating something like this:

> ## v0.6.0 (14/03/2017)
> 
> #### Framework Enhancements:
> 
> - [#32](https://github.com/github-tools/github-release-notes/issues/32) Unwrap github-api promises
> - [#26](https://github.com/github-tools/github-release-notes/issues/26) Use external config file
> - [#23](https://github.com/github-tools/github-release-notes/issues/23) Introduce templates for the issues
> - [#19](https://github.com/github-tools/github-release-notes/issues/19) Add an "ignore label" flag
> - [#12](https://github.com/github-tools/github-release-notes/issues/12) Add the chance to rebuild the history of release notes
> 
> #### Bug Fixes:
> 
> - [#29](https://github.com/github-tools/github-release-notes/issues/29) Remove escaping character on regex
> - [#24](https://github.com/github-tools/github-release-notes/issues/24) The changelog action doesn't compile latest release

_(yes, this is one of_ 🤖 _'s actual releases)_

## Feed `gren` 🤖

Where is the data coming from? There are two options:

### `issues` (⭐)

If you manage your project with issues, that's where all the information about a change are.
Issue labels increase the level of depth of what the release notes should show, helping `gren` to group the notes.

_e.g. if you see the example above, the issues are grouped by the two labels `enhancement` and `bug`, then customised via a config file._

`gren` generates those notes by collecting all the issues closed between a tag (defaults to latest) and the tag before it (or a tag that you specify).
If you want to be more accurate on the issues that belong to a release, you can group them in [milestones](https://github-tools.github.io/github-release-notes/examples.html#milestones) and use only the issues that belong to that Milestone.

> The output above is a result of release notes built from issues.

#### Help 🤖 to write wonderful stuff (issues)

In order to have splendidly generated release notes, we recommend to follow these conventions:

1. Start the title with a verb (e.g. Change header styles)
2. Use the imperative mood in the title (e.g. Fix, not Fixed or Fixes header styles)
3. Use labels wisely and assign one label per issue. `gren` has the [option to ignore issues](https://github-tools.github.io/github-release-notes/options.html#ignore-issues-with) that have one of the specified labels.

### `commits`

The simplest way of getting data is from the commits you write.
Even though it doesn't require a machine-readable commit, it is still better to have them in a nice format.

The output then uses commit messages (title + description) to look something like:

> ## v0.9.0 (17/05/2017)
> 
> - Filter milestones (#75)
>     * Create milestones data-source option
>     * Add documentation for the milestones option
> - Support GitHub enterprise (#73)
>     * Support GitHub enterprise
>     * Add api-url to options documentation
> - Update CHANGELOG.md

#### Help 🤖 to write wonderful stuff (commits)

In order to have splendidly generated release notes, we recommend to follow these conventions:

1. Start the subject line with a verb (e.g. Change header styles)
2. Use the imperative mood in the subject line (e.g. Fix, not Fixed or Fixes header styles)
3. Limit the subject line to about 50 characters
4. Do not end the subject line with a period
5. Separate subject from body with a blank line
6. Wrap the body at 72 characters
7. Use the body to explain _what_ and _why_ not _how_

## Installation

Install `github-release-notes` via npm:

```shell
npm install github-release-notes -g
```

### Setup

First, generate a `GitHub token`, _with **repo** scope_, at [this link](https://help.github.com/articles/creating-a-personal-access-token-for-the-command-line/).
Then add this line to  `~/.bash_profile` (or `~/.zshrc`):

```shell
export GREN_GITHUB_TOKEN=your_token_here
```

Show the internet that you use gren for automating your release notes -> [![Automated Release Notes by gren](https://img.shields.io/badge/%F0%9F%A4%96-release%20notes-00B2EE.svg)](https://github-tools.github.io/github-release-notes/)

```
[![Automated Release Notes by gren](https://img.shields.io/badge/%F0%9F%A4%96-release%20notes-00B2EE.svg)](https://github-tools.github.io/github-release-notes/)
```

## Basic Usage

`gren` gets the repo information directly from the folder where `git` is initialised.

```shell
# Navigate to your project directory
cd ~/Path/to/repo
# Run the task (see below)
gren release
```

Otherwise, you can run it _anywhere_ passing the repo information:

```shell
gren release --username=[username] --repo=[repo name]
```

If you don't want to save the token, you can specify one as an option:

```shell
gren release --token=[your token]
```

### [See all the options here](https://github-tools.github.io/github-release-notes/options.html)

### Commands

There are two main commands that can be ran with 🤖:

#### `gren release`

`gren` will look for the latest tag, draft a new release using the issues closed between when that tag and the one before were created and publish that release in your **release** panel in your GitHub repo. ([@see how to feed 🤖](#feed-gren-)).

#### `gren changelog`

Create a `CHANGELOG.md` file using all the release notes of the repo _(like the ones generated by_ 🤖 _)._
If the file exists already, use the `--override` option to proceed.

```shell
gren changelog --override
```

To generate a brand new release notes, using the same approach as per the releases, you have to run the command with the `--generate` option.

```shell
gren changelog --generate
```

### Help! 🆘

`gren` is using [Commander.js](https://github.com/tj/commander.js) which generates the `--help` section.
To trigger the help of a command, run:

```shell
# General usage
gren --help
# Command usage
gren help release # or gren release --help
```

It's also possible to see all the examples [here](https://github-tools.github.io/github-release-notes/examples.html) or directly in the terminal:

```shell
gren examples release
```

## Configuration file

You can create a configuration file where the task will be run to specify your options. [See how to set up the config file](https://github-tools.github.io/github-release-notes/options.html#configuration-file)
The accepted file extensions are the following:

- `.grenrc`
- `.grenrc.json`
- `.grenrc.yml`
- `.grenrc.yaml`
- `.grenrc.js`

### Init

If you need help to create the configuration file, you can run the following command and follow the instructions

```
gren init
```

### [See full documentation here](https://github-tools.github.io/github-release-notes)

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/wellDan28"><img src="https://avatars1.githubusercontent.com/u/2083539?v=4" width="100px;" alt=""/><br /><sub><b>Dan Klausner</b></sub></a><br /><a href="https://github.com/github-tools/github-release-notes/issues?q=author%3AwellDan28" title="Bug reports">🐛</a> <a href="https://github.com/github-tools/github-release-notes/commits?author=wellDan28" title="Code">💻</a></td>
    <td align="center"><a href="https://datitisev.me"><img src="https://avatars2.githubusercontent.com/u/6401250?v=4" width="100px;" alt=""/><br /><sub><b>David Sevilla Martín</b></sub></a><br /><a href="https://github.com/github-tools/github-release-notes/commits?author=datitisev" title="Documentation">📖</a></td>
    <td align="center"><a href="http://phun-ky.net"><img src="https://avatars1.githubusercontent.com/u/1714029?v=4" width="100px;" alt=""/><br /><sub><b>Alexander Vassbotn Røyne-Helgesen</b></sub></a><br /><a href="https://github.com/github-tools/github-release-notes/issues?q=author%3Aphun-ky" title="Bug reports">🐛</a> <a href="https://github.com/github-tools/github-release-notes/commits?author=phun-ky" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/joaquin-corchero"><img src="https://avatars2.githubusercontent.com/u/6892214?v=4" width="100px;" alt=""/><br /><sub><b>Joaquin Corchero</b></sub></a><br /><a href="https://github.com/github-tools/github-release-notes/commits?author=joaquin-corchero" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/durera"><img src="https://avatars1.githubusercontent.com/u/4400618?v=4" width="100px;" alt=""/><br /><sub><b>David Parker</b></sub></a><br /><a href="https://github.com/github-tools/github-release-notes/commits?author=durera" title="Code">💻</a></td>
    <td align="center"><a href="https://www.mariotacke.io"><img src="https://avatars2.githubusercontent.com/u/4942019?v=4" width="100px;" alt=""/><br /><sub><b>Mario Tacke</b></sub></a><br /><a href="https://github.com/github-tools/github-release-notes/commits?author=mariotacke" title="Code">💻</a></td>
    <td align="center"><a href="http://kyeh.me"><img src="https://avatars1.githubusercontent.com/u/2308368?v=4" width="100px;" alt=""/><br /><sub><b>Kevin Yeh</b></sub></a><br /><a href="https://github.com/github-tools/github-release-notes/commits?author=kyeah" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://jackocnr.com"><img src="https://avatars0.githubusercontent.com/u/1186883?v=4" width="100px;" alt=""/><br /><sub><b>Jack O'Connor</b></sub></a><br /><a href="https://github.com/github-tools/github-release-notes/commits?author=jackocnr" title="Code">💻</a></td>
    <td align="center"><a href="https://keithstolte.io"><img src="https://avatars0.githubusercontent.com/u/20091146?v=4" width="100px;" alt=""/><br /><sub><b>Keith Stolte</b></sub></a><br /><a href="https://github.com/github-tools/github-release-notes/commits?author=kstolte" title="Documentation">📖</a> <a href="#design-kstolte" title="Design">🎨</a></td>
    <td align="center"><a href="http://www.nvisionative.com"><img src="https://avatars2.githubusercontent.com/u/4568451?v=4" width="100px;" alt=""/><br /><sub><b>David Poindexter</b></sub></a><br /><a href="https://github.com/github-tools/github-release-notes/commits?author=david-poindexter" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/fthomas"><img src="https://avatars1.githubusercontent.com/u/141252?v=4" width="100px;" alt=""/><br /><sub><b>Frank S. Thomas</b></sub></a><br /><a href="https://github.com/github-tools/github-release-notes/commits?author=fthomas" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/pawk"><img src="https://avatars1.githubusercontent.com/u/27773225?v=4" width="100px;" alt=""/><br /><sub><b>pawk</b></sub></a><br /><a href="https://github.com/github-tools/github-release-notes/commits?author=pawk" title="Code">💻</a></td>
    <td align="center"><a href="https://www.yang-bo.com/"><img src="https://avatars3.githubusercontent.com/u/601530?v=4" width="100px;" alt=""/><br /><sub><b>Yang, Bo</b></sub></a><br /><a href="https://github.com/github-tools/github-release-notes/commits?author=Atry" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/v1v"><img src="https://avatars2.githubusercontent.com/u/2871786?v=4" width="100px;" alt=""/><br /><sub><b>Victor Martinez</b></sub></a><br /><a href="https://github.com/github-tools/github-release-notes/commits?author=v1v" title="Documentation">📖</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/Tybot204"><img src="https://avatars3.githubusercontent.com/u/7002601?v=4" width="100px;" alt=""/><br /><sub><b>Tyler Hogan</b></sub></a><br /><a href="https://github.com/github-tools/github-release-notes/commits?author=Tybot204" title="Code">💻</a></td>
    <td align="center"><a href="http://blairgemmer.com"><img src="https://avatars0.githubusercontent.com/u/6225764?v=4" width="100px;" alt=""/><br /><sub><b>Blair Gemmer</b></sub></a><br /><a href="https://github.com/github-tools/github-release-notes/commits?author=blairg23" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/lianghx-319"><img src="https://avatars2.githubusercontent.com/u/27187946?v=4" width="100px;" alt=""/><br /><sub><b>Han</b></sub></a><br /><a href="https://github.com/github-tools/github-release-notes/commits?author=lianghx-319" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/donmahallem"><img src="https://avatars2.githubusercontent.com/u/4698322?v=4" width="100px;" alt=""/><br /><sub><b>donmahallem</b></sub></a><br /><a href="https://github.com/github-tools/github-release-notes/commits?author=donmahallem" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/aelbozie"><img src="https://avatars3.githubusercontent.com/u/36151122?v=4" width="100px;" alt=""/><br /><sub><b>Ahmed</b></sub></a><br /><a href="https://github.com/github-tools/github-release-notes/commits?author=aelbozie" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/monicarib"><img src="https://avatars0.githubusercontent.com/u/7025960?v=4" width="100px;" alt=""/><br /><sub><b>Mônica Ribeiro</b></sub></a><br /><a href="https://github.com/github-tools/github-release-notes/commits?author=monicarib" title="Code">💻</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
