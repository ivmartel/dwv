# Changelog

## v0.17.1 (12/12/2019)

#### Enhancements:

- [#217](https://github.com/github-tools/github-release-notes/issues/217) [feature request] sharing config or online config

#### Bug Fixes:

- [#229](https://github.com/github-tools/github-release-notes/issues/229) The number of  commits will be reduced by one when "--data-source=commits"
- [#162](https://github.com/github-tools/github-release-notes/issues/162) Change in artifact name - Gren no longer creates release notes!
- [#134](https://github.com/github-tools/github-release-notes/issues/134) Sort tags by date before fetching release notes

---

## v0.17.0 (14/10/2018)

#### Bug Fixes:

- [#186](https://github.com/github-tools/github-release-notes/issues/186) Missing version numbers in generated changelog
- [#158](https://github.com/github-tools/github-release-notes/issues/158) Commit author's name link is incorrect

---

## v0.16.0 (28/05/2018)

#### Enhancements:

- [#165](https://github.com/github-tools/github-release-notes/issues/165) Avoid paginating over all pull requests
- [#161](https://github.com/github-tools/github-release-notes/issues/161) Pass issue descriptions into templates
- [#152](https://github.com/github-tools/github-release-notes/issues/152) Add configuration-file option
- [#144](https://github.com/github-tools/github-release-notes/issues/144) Feature to be able to specify limit on tags for the changelog
- [#131](https://github.com/github-tools/github-release-notes/issues/131) Template: PR branch name?

#### Bug Fixes:

- [#140](https://github.com/github-tools/github-release-notes/issues/140) html_url and url are both pointing to 'https://api.github.com..'
- [#133](https://github.com/github-tools/github-release-notes/issues/133) PRs that didn't merge to the master are shown in 
- [#132](https://github.com/github-tools/github-release-notes/issues/132) Tags not found

---

## v0.15.0 (19/01/2018)
#### Enhancements:

- [#98](https://github.com/github-tools/github-release-notes/issues/98) Manage issues with multiple labels

---

## v0.14.1 (08/12/2017)
*No changelog for this release.*

---

## v0.14.0 (08/12/2017)

#### Enhancements:

- [#108](https://github.com/github-tools/github-release-notes/issues/108) Create a silent mode
- [#83](https://github.com/github-tools/github-release-notes/issues/83) Create module initialisation panel

#### Bug Fixes:

- [#122](https://github.com/github-tools/github-release-notes/issues/122) Fix git configuration from `https`
- [#119](https://github.com/github-tools/github-release-notes/issues/119) Tags `all` takes a lot to exit the task

---

## v0.13.1 (06/12/2017)

#### Bug Fixes:

- [#110](https://github.com/github-tools/github-release-notes/issues/110) Configuration file not used with "gren release", but works with "gren changelog"

---

## v0.13.0 (26/10/2017)

#### Enhancements:

- [#102](https://github.com/github-tools/github-release-notes/issues/102) Create a better log
- [#96](https://github.com/github-tools/github-release-notes/issues/96) Translate Promises to async, await
- [#93](https://github.com/github-tools/github-release-notes/issues/93) Add Pull Requests as data-source option
- [#92](https://github.com/github-tools/github-release-notes/issues/92) Ignore tags with a certain string
- [#84](https://github.com/github-tools/github-release-notes/issues/84) Ignore commits with keywords

#### Bug Fixes:

- [#109](https://github.com/github-tools/github-release-notes/issues/109) Babel Runtime is missing

---

## v0.12.1 (14/10/2017)
*No changelog for this release.*

---

## v0.12.0 (14/10/2017)

#### Bug Fixes:

- [#99](https://github.com/github-tools/github-release-notes/issues/99) Use Babel transform runtime
- [#95](https://github.com/github-tools/github-release-notes/issues/95) Extend limit option to include pagination 

---

## v0.11.0 (13/10/2017)

#### Enhancements:

- [#69](https://github.com/github-tools/github-release-notes/issues/69) Remove the releases limit

#### Bug Fixes:

- [#69](https://github.com/github-tools/github-release-notes/issues/69) Remove the releases limit

---

## v0.10.1 (12/10/2017)

#### Bug Fixes:

- [#90](https://github.com/github-tools/github-release-notes/issues/90) Fix the token option

---

## v0.10.0 (08/10/2017)

#### Enhancements:

- [#81](https://github.com/github-tools/github-release-notes/issues/81) Swap Grunt with Gulp
- [#80](https://github.com/github-tools/github-release-notes/issues/80) `gren --help` quietly does stuff
- [#78](https://github.com/github-tools/github-release-notes/issues/78) README doesn't explain what gren does
- [#72](https://github.com/github-tools/github-release-notes/issues/72) Expanded options for commit template variables
- [#68](https://github.com/github-tools/github-release-notes/issues/68) Migrate to ES2015
- [#66](https://github.com/github-tools/github-release-notes/issues/66) Create a --help section
- [#37](https://github.com/github-tools/github-release-notes/issues/37) Introduce unit test

#### Bug Fixes:

- [#77](https://github.com/github-tools/github-release-notes/issues/77) Check if there are no tags

---

## v0.9.0 (17/05/2017)

#### Enhancements:

- [#74](https://github.com/github-tools/github-release-notes/issues/74) Support GitHub Enterprise
- [#67](https://github.com/github-tools/github-release-notes/issues/67) Use milestones to create release notes

---

## v0.8.1 (13/04/2017)

#### Bug Fixes:

- [#70](https://github.com/github-tools/github-release-notes/issues/70) Options don't get converted to camelCase from bash

---

## v0.8.0 (11/04/2017)

#### Enhancements:

- [#64](https://github.com/github-tools/github-release-notes/issues/64) Get the options with an external npm tool
- [#61](https://github.com/github-tools/github-release-notes/issues/61) Rework the Changelog generator function
- [#55](https://github.com/github-tools/github-release-notes/issues/55) Create a group-by-label option 

---

## v0.7.2 (17/03/2017)

#### Bug Fixes:

- [#59](https://github.com/github-tools/github-release-notes/issues/59) Changelog action doesn't work in the grunt task

---

## v0.7.1 (16/03/2017)

#### Bug Fixes:

- [#57](https://github.com/github-tools/github-release-notes/issues/57) Fix object-deep-assign bug

---

## v0.7.0 (16/03/2017)

#### Enhancements:

- [#53](https://github.com/github-tools/github-release-notes/issues/53) Allow functions as template values
- [#50](https://github.com/github-tools/github-release-notes/issues/50) Add GIF in readme.md file
- [#27](https://github.com/github-tools/github-release-notes/issues/27) Add possibility to change date format

---

## v0.3.3 (14/03/2017)
*No changelog for this release.*

---

## v0.5.0 (14/03/2017)

#### Enhancements:

- [#20](https://github.com/github-tools/github-release-notes/issues/20) Specify which tag to build
- [#18](https://github.com/github-tools/github-release-notes/issues/18) Create global version of the module
- [#16](https://github.com/github-tools/github-release-notes/issues/16) Update the documentation
- [#14](https://github.com/github-tools/github-release-notes/issues/14) Add the chance to override the latest release body
- [#13](https://github.com/github-tools/github-release-notes/issues/13) Check the network
- [#11](https://github.com/github-tools/github-release-notes/issues/11) Add tests
- [#10](https://github.com/github-tools/github-release-notes/issues/10) Use the issues as data source
- [#9](https://github.com/github-tools/github-release-notes/issues/9) Get the information from the local git config
- [#7](https://github.com/github-tools/github-release-notes/issues/7) Add the possibility to create a CHANGELOG file

#### Bug Fixes:

- [#15](https://github.com/github-tools/github-release-notes/issues/15) Manage the scenario where there is only one tag

---

## v0.6.1 (14/03/2017)

#### Enhancements:

- [#39](https://github.com/github-tools/github-release-notes/issues/39) Use different files type for configuration

#### Bug Fixes:

- [#43](https://github.com/github-tools/github-release-notes/issues/43) Error when there is only one tag

---

## v0.6.2 (14/03/2017)

#### Bug Fixes:

- [#45](https://github.com/github-tools/github-release-notes/issues/45) Remove unused option user.name

---

## v0.6.3 (14/03/2017)

#### Bug Fixes:

- [#48](https://github.com/github-tools/github-release-notes/issues/48) Fix multiple repo information

---

## v0.4.0 (14/03/2017)

#### Enhancements:

- [#5](https://github.com/github-tools/github-release-notes/issues/5) Include various types of commit messages

---

## v0.6.0 (14/03/2017)

#### Enhancements:

- [#32](https://github.com/github-tools/github-release-notes/issues/32) Unwrap github-api promises
- [#26](https://github.com/github-tools/github-release-notes/issues/26) Use external config file
- [#23](https://github.com/github-tools/github-release-notes/issues/23) Introduce templates for the issues
- [#19](https://github.com/github-tools/github-release-notes/issues/19) Add an "ignore label" flag
- [#12](https://github.com/github-tools/github-release-notes/issues/12) Add the chance to rebuild the history of release notes

#### Bug Fixes:

- [#29](https://github.com/github-tools/github-release-notes/issues/29) Remove escaping character on regex
- [#24](https://github.com/github-tools/github-release-notes/issues/24) The changelog action doesn't compile latest release

---

## v0.2.2 (10/03/2017)
*No changelog for this release.*

---

## v0.3.0 (10/03/2017)
*No changelog for this release.*

---

## v0.3.1 (10/03/2017)
*No changelog for this release.*

---

## v0.3.2 (10/03/2017)
*No changelog for this release.*
