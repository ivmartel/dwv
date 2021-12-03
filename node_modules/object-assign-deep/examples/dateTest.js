'use strict';

/*
 * DATE TEST
 *
 * [Description]
 *   Demonstrates that you can ONLY use this module with PLAIN objects and arrays. You might expect 'someDate' to equal
 *   "2009-03-19T00:50:53.484Z" but it won't. You'll get a black hole instead.
 *
 * [Expected Output]
 *   {
 *     prop1: 'Josh',
 *     prop2: 'World',
 *     someDate: {},  // <-- Some black hole.
 *   }
 *
 */

/* eslint no-console: 0 */

const objectAssignDeep = require(`../objectAssignDeep`);

const objectA = {
	prop1: `Hello`,
	prop2: `World`,
};

const objectB = {
	prop1: `Josh`,
	prop2: `World`,
	someDate: new Date(1237423853484),  // 2009-03-19T00:50:53.484Z
};

const result = objectAssignDeep(objectA, objectB);

console.log(`Result:`, result);
