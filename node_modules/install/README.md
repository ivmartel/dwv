# install [![Build Status](https://travis-ci.org/benjamn/install.svg?branch=master)](https://travis-ci.org/benjamn/install) [![Greenkeeper badge](https://badges.greenkeeper.io/benjamn/install.svg)](https://greenkeeper.io/)

The [CommonJS module syntax](http://wiki.commonjs.org/wiki/Modules/1.1) is one of the most widely accepted conventions in the JavaScript ecosystem. Everyone seems to agree that `require` and `exports` are a reasonable way of expressing module dependencies and interfaces, and the tools for managing modular code are getting better all the time.

Much less of a consensus has developed around the best way to deliver CommonJS modules to a web browser, where the synchronous semantics of `require` pose a non-trivial implementation challenge. This module loader contributes to that confusion, yet also demonstrates that an amply-featured module loader need not stretch into the hundreds or thousands of lines.

Installation
---
From NPM:

    npm install install

From GitHub:

    cd path/to/node_modules
    git clone git://github.com/benjamn/install.git
    cd install
    npm install .

Usage
---

The first step is to create an `install` function by calling the
`makeInstaller` method. Note that all of the options described below are
optional:

```js
var install = require("install").makeInstaller({
  // Optional list of file extensions to be appended to required module
  // identifiers if they do not exactly match an installed module.
  extensions: [".js", ".json"],

  // If defined, the options.onInstall function will be called any time
  // new modules are installed.
  onInstall,

  // If defined, the options.override function will be called before
  // looking up any top-level package identifiers in node_modules
  // directories. It can return either a string to provide an alternate
  // package identifier or a non-string value to prevent the lookup from
  // proceeding.
  override,

  // If defined, the options.fallback function will be called when no
  // installed module is found for a required module identifier. Often
  // options.fallback will be implemented in terms of the native Node
  // require function, which has the ability to load binary modules.
  fallback
});
```

The second step is to install some modules by passing a nested tree of
objects and functions to the `install` function:

```js
var require = install({
  "main.js"(require, exports, module) {
    // On the client, the "assert" module should be install-ed just like
    // any other module. On the server, since "assert" is a built-in Node
    // module, it may make sense to let the options.fallback function
    // handle such requirements. Both ways work equally well.
    var assert = require("assert");

    assert.strictEqual(
      // This require function uses the same lookup rules as Node, so it
      // will find "package" in the "node_modules" directory below.
      require("package").name,
      "/node_modules/package/entry.js"
    );

    exports.name = module.id;
  },

  node_modules: {
    package: {
      // If package.json is not defined, a module called "index.js" will
      // be used as the main entry point for the package. Otherwise the
      // exports.main property will identify the entry point.
      "package.json"(require, exports, module) {
        exports.name = "package";
        exports.version = "0.1.0";
        exports.main = "entry.js";
      },

      "entry.js"(require, exports, module) {
        exports.name = module.id;
      }
    }
  }
});
```

Note that the `install` function merely installs modules without
evaluating them, so the third and final step is to `require` any entry
point modules that you wish to evaluate:

```js
console.log(require("./main").name);
// => "/main.js"
```

This is the "root" `require` function returned by the `install`
function. If you're using the `install` package in a CommonJS environment
like Node, be careful that you don't overwrite the `require` function
provided by that system.

Many more examples of how to use the `install` package can be found in the
[tests](https://github.com/benjamn/install/blob/master/test/run.js).
