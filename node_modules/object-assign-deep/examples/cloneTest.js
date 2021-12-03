'use strict';

/*
 * CLONE TEST
 *
 * [Description]
 *   Demonstrates that you can clone an object, breaking all references, by passing in just a single parameter.
 *
 * [Expected Output]
 *   {
 *     prop1: 'Josh',
 *     prop2: 'World',
 *   }
 *
 */

/* eslint no-console: 0 */

const objectAssignDeep = require(`../objectAssignDeep`);

const originalObject = {
	prop1: `Hello`,
	prop2: `World`,
};

const clonedObject = objectAssignDeep(originalObject);

originalObject.hello = `Josh`;

console.log(`Result:`, clonedObject);
