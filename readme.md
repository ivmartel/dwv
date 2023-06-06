DWV
===

DWV (DICOM Web Viewer) is an open source zero footprint medical image viewer library. It uses _only_ javascript and HTML5 technologies, meaning that it can be run on any platform that provides a modern browser (laptop, tablet, phone and even modern TVs). It can load local or remote data in DICOM format (the standard for medical imaging data such as MR, CT, Echo, Mammo, NM...) and  provides standard tools for its manipulation such as contrast, zoom, drag, possibility to draw regions on top of the image and imaging filters such as threshold and sharpening.

[![Node.js CI](https://github.com/ivmartel/dwv/actions/workflows/nodejs-ci.yml/badge.svg)](https://github.com/ivmartel/dwv/actions/workflows/nodejs-ci.yml) [![npm](https://img.shields.io/npm/v/dwv.svg)](https://www.npmjs.com/package/dwv)
[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=VQWYY8ZS75H3E&currency_code=EUR&bn=PP%2dDonationsBF%3abtn_donateCC_LG%2egif%3aNonHosted)

Try a [live demo](https://ivmartel.github.io/dwv/) and read a lot more information on the [docs](https://ivmartel.github.io/dwv/doc/stable/index.html) (such as [examples](https://ivmartel.github.io/dwv/doc/stable/tutorial-examples.html), [dicom conformance](https://ivmartel.github.io/dwv/doc/stable/tutorial-conformance.html), [pacs integrations](https://ivmartel.github.io/dwv/doc/stable/tutorial-integrations.html)). You can also check out the [wiki](https://github.com/ivmartel/dwv/wiki).

 - All coding/implementation contributions and comments are welcome.
 - DWV is not certified for diagnostic use.<sup>[1](#footnote1)</sup>
 - Released under GNU GPL-3.0 license (see [license.txt](license.txt)).

If you have questions, please [open an issue](https://www.github.com/ivmartel/dwv/issues).

## Available Scripts

 - `ìnstall`: install dependencies
 - `lint`: run code linting
 - `test`: opens a web page with test pages and karmas' results (with live reload)
 - `test-ci`: one shot test run
 - `build`: create release files
 - `doc`: create documentation

I'm using `yarn` as the main package manager. Best to use it to install since
the lock file (that contains the exact dependency tree) is a yarn file.
All scripts also work with `npm`.

## Steps to run the viewer from scratch

``` bash
# get the code
git clone https://github.com/ivmartel/dwv.git

# move to its folder
cd dwv

# install dependencies
yarn install

# launch: will open a browser with example pages
yarn run start
```

This will open your default browser with the different example pages, check the 'viewer' link for a simple test viewer.

## Notes

<a name="footnote1">1</a>: Certification refers to official medical software certification that are issued by the FDA or EU Notified Bodies. The sentence here serves as a reminder that the Dicom Web Viewer is not ceritifed, and comes with no warranties (and no possible liability of its authors) as stated in the [license](license.txt). To learn more about standards used in certification, see the [wikipedia Medical software](https://en.wikipedia.org/wiki/Medical_software) page.
