### v2.1.0
- add .js for browser import implementation [PR147](https://github.com/i18next/i18next-browser-languageDetector/pull/147)

### v2.0.0
- [BREAKING] options.excludeCacheFor (array of language codes; default ['cimode']): if a language maps a value in that list the language will not be written to cache (eg. localStorage, cookie). If you use lng cimode in your tests and require it to be cached set the option to false or empty array
