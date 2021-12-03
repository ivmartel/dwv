'use strict';

/*
 * BASIC TEST
 *
 * [Description]
 *   Demonstrates that arrays are concatenated without removing duplicates, and are also recursed into to break
 *   references on any objects or arrays that are contained within.
 *
 * [Expected Output]
 *   {
 *     prop1: 'Hello',
 *     prop2: 'Universe',
 *     nested: { bool: false, super: 999, still: 'here!' },
 *     array1: null,
 *     array2: [100, 101, 102],
 *     name: 'Bob',
 *     location: 'United Kingdom'
 *   }
 *
 */

/* eslint no-console: 0 */

const objectAssignDeep = require(`../objectAssignDeep`);

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
