These are the standards that should be used when coding for this project.

- Code:
  - Check with [ESlint](https://eslint.org/)
  - Follow [google](https://google.github.io/styleguide/jsguide.html) guide,
  - Use design patterns from [dofactory](https://www.dofactory.com/javascript/design-patterns) and [addyosmani](http://www.addyosmani.com/resources/essentialjsdesignpatterns/book/)
- Test: use of [QUnit](https://qunitjs.com/) via [Karma](https://karma-runner.github.io),
- Documentation: use of [jsdoc](https://jsdoc.app/),
- Versioning: [Semantic Versioning](http://semver.org/)
- Branch: try to follow some kind of [branching model](http://nvie.com/posts/a-successful-git-branching-model/)

These standards are enforced using Continuous Integration with [github-actions](https://github.com/features/actions): builds using [node](http://nodejs.org/) (see `.github/workflows/nodejs-ci.yml`) and [yarn](https://classic.yarnpkg.com). The CI executes the lint and test scripts.

Others

- Icons: firefox-os [styleguide](http://www.mozilla.org/en-US/styleguide/products/firefox-os/icons/)

## Services

- Github ([status](https://status.github.com/)), [build status](https://github.com/ivmartel/dwv/actions)
- [Transifex](https://www.transifex.com): translations, [dwv page](https://www.transifex.com/ivmartel/dwv/)
- [Dependabot](https://github.com/dependabot): dependency up to date bot checker, [dwv page](https://github.com/ivmartel/dwv/security/dependabot)

Others:

- [Code Climate](https://codeclimate.com) ([status](http://status.codeclimate.com/)): code review + test coverage + lint, [dwv page](https://codeclimate.com/github/ivmartel/dwv)
- [Fossa](https://fossa.com/): license check, [dwv page](https://app.fossa.io/projects/git%2Bgithub.com%2Fivmartel%2Fdwv)

## Generic

- Certification: [Europe](http://ec.europa.eu/growth/sectors/medical-devices/), [US](https://www.fda.gov/MedicalDevices) (FDA) -> [IEC_62304](https://en.wikipedia.org/wiki/IEC_62304)
- Dicom Conformance Statement: [dicomiseasy post](http://dicomiseasy.blogspot.com.es/2016/01/dicom-conformance-statement.html)
- Health Insurance Portability and Accountability Act (HIPAA): [official](https://www.hhs.gov/hipaa/index.html/), [wikipedia](https://en.wikipedia.org/wiki/Health_Insurance_Portability_and_Accountability_Act)
  - [Methods for De-identification of PHI](https://www.hhs.gov/hipaa/for-professionals/privacy/special-topics/de-identification/index.html) (protected health information). See related [DICOM Supplement 142](http://dicom.nema.org/medical/dicom/2022a/output/chtml/part15/chapter_E.html) (and this [presentation](http://www.dclunie.com/papers/D2_1045_Clunie_Deidentification.pdf))
