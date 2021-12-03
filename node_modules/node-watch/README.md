# node-watch [![Status](https://travis-ci.org/yuanchuan/node-watch.svg?branch=master)](https://travis-ci.org/yuanchuan/node-watch "See test builds")

A wrapper and enhancements for [fs.watch](http://nodejs.org/api/fs.html#fs_fs_watch_filename_options_listener).

[![NPM](https://nodei.co/npm/node-watch.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/node-watch.png/)


## Installation

```bash
npm install node-watch
```

## Example

```js
var watch = require('node-watch');

watch('file_or_dir', { recursive: true }, function(evt, name) {
  console.log('%s changed.', name);
});
```

Now it's fast to watch **deep** directories on macOS and Windows, since the `recursive` option is natively supported except on Linux.

```js
// watch the whole disk
watch('/', { recursive: true }, console.log);
```


## Why?

* Some editors will generate temporary files which will cause the callback function to be triggered multiple times.
* The callback function will only be triggered once on watching a single file.
* <del>Missing an option to watch a directory recursively.</del>
* Recursive watch is not supported on Linux or in older versions of nodejs.
* Keep it simple, stupid.


## Options

The usage and options of `node-watch` are compatible with [fs.watch](https://nodejs.org/dist/latest-v7.x/docs/api/fs.html#fs_fs_watch_filename_options_listener).
* `persistent: Boolean` (default **true**)
* `recursive: Boolean` (default **false**)
* `encoding: String` (default **'utf8'**)

**Extra options**

* `filter: RegExp | Function`

   Return that matches the filter expression.

    ```js
    // filter with regular expression
    watch('./', { filter: /\.json$/ });

    // filter with custom function
    watch('./', { filter: f => !/node_modules/.test(f) });

    ```

   Each file and directory will be passed to the filter to determine whether
   it will then be passed to the callback function. Like `Array.filter` does in `JavaScript`.
   There are three kinds of return values for filter function:

     * **`true`**: Will be passed to callback.
     * **`false`**: Will not be passed to callback.
     * **`skip`**: Same with `false`, and skip to watch all its subdirectories.

   On Linux, where the `recursive` option is not natively supported,
   it is more efficient to skip ignored directories by returning the `skip` flag:

    ```js
    watch('./', {
      recursive: true,
      filter(f, skip) {
        // skip node_modules
        if (/\/node_modules/.test(f)) return skip;
        // skip .git folder
        if (/\.git/.test(f)) return skip;
        // only watch for js files
        return /\.js$/.test(f);
      }
    });

    ```

    If you prefer glob patterns you can use [minimatch](https://www.npmjs.com/package/minimatch) or [picomatch](https://www.npmjs.com/package/picomatch)
    together with filter:

     ```js
     const pm = require('picomatch');
     let isMatch = pm('*.js');

     watch('./', {
       filter: f => isMatch(f)
     });
     ```

* `delay: Number` (in ms, default **200**)

   Delay time of the callback function.

    ```js
    // log after 5 seconds
    watch('./', { delay: 5000 }, console.log);
    ```

## Events

The events provided by the callback function is either `update` or `remove`, which is less confusing to `fs.watch`'s `rename` or `change`.

```js
watch('./', function(evt, name) {

  if (evt == 'update') {
    // on create or modify
  }

  if (evt == 'remove') {
    // on delete
  }

});
```


## Watcher object

The watch function returns a [fs.FSWatcher](https://nodejs.org/api/fs.html#fs_class_fs_fswatcher) like object as the same as `fs.watch` (>= v0.4.0).

#### Watcher events

```js
let watcher = watch('./', { recursive: true });

watcher.on('change', function(evt, name) {
  // callback
});

watcher.on('error', function(err) {
  // handle error
});

watcher.on('ready', function() {
  // the watcher is ready to respond to changes
});
```

#### Close

```js
// close
watcher.close();

// is closed?
watcher.isClosed()
```

#### List of methods

* `.on`
* `.once`
* `.emit`
* `.close`
* `.listeners`
* `.setMaxListeners`
* `.getMaxListeners`

##### Extra methods
* `.isClosed` detect if the watcher is closed
* `.getWatchedPaths` get all the watched paths


## Known issues

**Windows, node < v4.2.5**

  * Failed to detect `remove` event
  * Failed to get deleted filename or directory name

**MacOS, node 0.10.x**
  * Will emit double event if the directory name is of one single character.


## Misc

#### 1. Watch multiple files or directories in one place
```js
watch(['file1', 'file2'], console.log);
```

#### 2. Customize watch command line tool
```js
#!/usr/bin/env node

// https://github.com/nodejs/node-v0.x-archive/issues/3211
require('epipebomb')();

let watcher = require('node-watch')(
  process.argv[2] || './', { recursive: true }, console.log
);

process.on('SIGINT', watcher.close);
```
Monitoring chrome from disk:
```bash
$ watch / | grep -i chrome
```

#### 3. Got ENOSPC error?

If you get ENOSPC error, but you actually have free disk space - it means that your OS watcher limit is too low and you probably want to recursively watch a big tree of files.

Follow this description to increase the limit:
[https://confluence.jetbrains.com/display/IDEADEV/Inotify+Watches+Limit](https://confluence.jetbrains.com/display/IDEADEV/Inotify+Watches+Limit)


## Alternatives

* [chokidar](https://github.com/paulmillr/chokidar)
* [gaze](https://github.com/shama/gaze)
* [mikeal/watch](https://github.com/mikeal/watch)

## Contributors

Thanks goes to [all wonderful people](https://github.com/yuanchuan/node-watch/graphs/contributors) who have helped this project.

## License
MIT

Copyright (c) 2012-2021 [yuanchuan](https://github.com/yuanchuan)
