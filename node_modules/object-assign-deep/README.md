# Object-Assign-Deep
Like [Object.assign()](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Object/assign) but deeper. This module is the holy grail of simple object manipulation in JavaScript and it does not resort to using the JSON functions. If you need more power or fine-grained control please take a look at the [Object-Extender](https://npmjs.org/package/object-extender) module.

## Breaking Changes in v0.3!
* `objectAssignDeep()` now mutates the first argument in the same way `Object.assign()` does.
* By default, arrays are now replaced instead of merged to preserve backwards compatibility with older versions of this module.

## Caution! Danger of Death!
This module is to be used with PLAIN objects that contain primitive values ONLY. Every time you misuse this module a kitten dies.. yes you're a kitten killer.

Do not use this module if:
* Your objects are (or contain) native objects such as Date (nested Array is fine).
* Your objects contain circular references (you'll cause a stack overflow).
* Your objects are instances of some class you've written.
* You are concerned with prototype chains, property descriptors, unenumerable properties, and any other advanced uses.

If you need to do something fancy like the above you'll need to write a custom solution for your use case.

## Quick Start
You can merge plain objects or clone them:

```javascript
const objectAssignDeep = require(`object-assign-deep`);

const mergedObjects = objectAssignDeep(target, object1, object2, ...objectN);

const clonedObject = objectAssignDeep({}, originalObject);
```

Simples!

## Full Example
See the `./examples` directory for a few examples, including one example case that demonstrates why you can't get clever with object cloning.

```javascript
const objectAssignDeep = require(`object-assign-deep`);

const objectA = {
	prop1: `Hello`,
	prop2: `World`,
	nested: {
		bool: true,
		super: 123,
		still: `here!`,
	},
	array1: [1, 2, 3],
	array2: [4, 5, 6],
};

const objectB = {
	prop2: `Universe`,
	name: `Josh`,
	nested: {
		bool: false,
	},
	array1: null,
};

const objectC = {
	location: `United Kingdom`,
	name: `Bob`,
	nested: {
		super: 999,
	},
	array2: [100, 101, 102],
};

const result = objectAssignDeep(objectA, objectB, objectC);

console.log(`Result:`, result);

/*
*   {
*     prop1: 'Hello',
*     prop2: 'Universe',
*     nested: { bool: false, super: 999, still: 'here!' },
*     array1: null,
*     array2: [100, 101, 102],
*     name: 'Bob',
*     location: 'United Kingdom'
*   }
*/
```

## API Overview

### objectAssignDeep(target, object1, object2, ...objectN);
Merges all the objects together mutating the `target` in the process and returning the result.

### objectAssignDeep.noMutate(object1, object2, ...objectN);
Merges all the objects together without mutating any of them and returning the entirely new object.

### objectAssignDeep.withOptions(target, objects, options);
Takes a target, an array of objects to merge in, and an options object which can be used to change the behaviour of the function. The available options are:

| Option         | Default Value | Description |
|----------------|---------------|-------------|
| arrayBehaviour | "replace"     | By default arrays in later objects will overwrite earlier values, but you can set this to "merge" if you want to concatenate the arrays instead. |

If you need more customisation options please take a look at the [Object-Extender](https://npmjs.org/package/object-extender) module which builds upon Object-Assign-Deep.
