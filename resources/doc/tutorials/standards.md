These are the standards that should be used when coding for this project.

 * Code:  
   * Check with [ESlint](https://eslint.org/)
   * Follow [google](https://google.github.io/styleguide/jsguide.html) guide,
   * No variables or functions should be defined in the global namespace, all should be in the `dwv` var,
   * Favour function expression (`a=function()`) rather than function declaration (`function a()`), see [link](http://javascriptweblog.wordpress.com/2010/07/06/function-declarations-vs-function-expressions/). It allows to put them in the global `dwv` object,
   * Use design patterns from [dofactory](https://www.dofactory.com/javascript/design-patterns) and [addyosmani](http://www.addyosmani.com/resources/essentialjsdesignpatterns/book/)
 * Test: use of [QUnit](https://qunitjs.com/) via [Karma](https://karma-runner.github.io),
 * Documentation: use of [jsdoc](https://jsdoc.app/),
 * Versioning: [Semantic Versioning](http://semver.org/)
 * Branch: try to follow some kind of [branching model](http://nvie.com/posts/a-successful-git-branching-model/) 

These standards are enforced using Continuous Integration with [github-actions](https://github.com/features/actions): builds using [node](http://nodejs.org/) (see `.github/workflows/nodejs-ci.yml`) and [yarn](https://classic.yarnpkg.com). The CI basically executes `yarn install` that reads the `package.json` file and then runs `yarn run test`. This test target is configured to run a task runner called [Grunt](http://gruntjs.com/) which is configured with the `Gruntfile.js` file. The `package.json` file contains shortcuts to grunt scripts:
  * `yarn run test` -> [grunt-karma](https://www.npmjs.org/package/grunt-karma) that allows to run qunit tests using a headless browser such a Google Chrome
  * `yarn run lint` -> [grunt-eslint](https://www.npmjs.org/package/grunt-eslint) that lints the code
  * `yarn run build` -> [grunt-contrib-concat](https://www.npmjs.org/package/grunt-contrib-concat) that concatenates a list of files together and [grunt-contrib-uglify](https://www.npmjs.org/package/grunt-contrib-uglify) that minifies the code

Others
 * Icons: firefox-os [styleguide](http://www.mozilla.org/en-US/styleguide/products/firefox-os/icons/)

## Services
 * Github ([status](https://status.github.com/)), [build status](https://github.com/ivmartel/dwv/actions)
 * [Code Climate](https://codeclimate.com) ([status](http://status.codeclimate.com/)): code review + test coverage + lint, [dwv page](https://codeclimate.com/github/ivmartel/dwv)
 * [David-dm](https://david-dm.org/): dependency up to date checker, [dwv page](https://david-dm.org/ivmartel/dwv)
 * [Coveralls](https://coveralls.io/) ([status](http://status.coveralls.io/)): test coverage, [dwv page](https://coveralls.io/github/ivmartel/dwv)
 * [Transifex](https://www.transifex.com): translations, [dwv page](https://www.transifex.com/ivmartel/dwv/)
 * [Dependabot](https://github.com/dependabot): dependency up to date bot checker

## Generic
 * Certification: [Europe](http://ec.europa.eu/growth/sectors/medical-devices/), [US](https://www.fda.gov/MedicalDevices) (FDA) -> [IEC_62304](https://en.wikipedia.org/wiki/IEC_62304)
 * Dicom Conformance Statement: [dicomiseasy post](http://dicomiseasy.blogspot.com.es/2016/01/dicom-conformance-statement.html)
 * Health Insurance Portability and Accountability Act (HIPAA): [official](https://www.hhs.gov/hipaa/index.html/), [wikipedia](https://en.wikipedia.org/wiki/Health_Insurance_Portability_and_Accountability_Act)
   * [Methods for De-identification of PHI](https://www.hhs.gov/hipaa/for-professionals/privacy/special-topics/de-identification/index.html) (protected health information). See related [DICOM Supplement 142](http://dicom.nema.org/dicom/2013/output/chtml/part15/chapter_E.html) (and this [presentation](http://www.dclunie.com/papers/D2_1045_Clunie_Deidentification.pdf))
