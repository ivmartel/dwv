# connectivity [![travis][travis-image]][travis-url] [![npm][npm-image]][npm-url] [![downloads][downloads-image]][downloads-url] [![javascript style guide][standard-image]][standard-url]

[travis-image]: https://img.shields.io/travis/feross/connectivity/master.svg
[travis-url]: https://travis-ci.org/feross/connectivity
[npm-image]: https://img.shields.io/npm/v/connectivity.svg
[npm-url]: https://npmjs.org/package/connectivity
[downloads-image]: https://img.shields.io/npm/dm/connectivity.svg
[downloads-url]: https://npmjs.org/package/connectivity
[standard-image]: https://img.shields.io/badge/code_style-standard-brightgreen.svg
[standard-url]: https://standardjs.com

#### Detect if the network is up (do we have connectivity?)

![internet!](https://raw.githubusercontent.com/feross/connectivity/master/img.jpg)

The module answers the most important question: is the cat-picture delivery system working?

### usage

```js
var connectivity = require('connectivity')

connectivity(function (online) {
  if (online) {
    console.log('connected to the internet!')
  } else {
    console.error('sorry, not connected!')
  }
})
```

Also works in the browser with [browserify](http://browserify.org/)!

### license

MIT. Copyright [Feross Aboukhadijeh](https://www.twitter.com/feross).
