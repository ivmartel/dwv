'use strict';

/*
 * MERGE INTO TEST
 *
 * [Description]
 *   Demonstrates that we can merge objects into a target object with the .info() method.
 *
 * [Expected Output]
 *   {
 *     prop1: 'Hello',
 *     prop2: 'Universe',
 *     location: 'United Kingdom',
 *     addedLater: 'We should see this in result because we have mutated target.',
 *   }
 *
 */

/* eslint no-console: 0 */

const objectAssignDeep = require(`../objectAssignDeep`);

const target = {
	prop1: `Hello`,
	prop2: `World`,
};

const objectA = {
	prop2: `Universe`,
};

const objectB = {
	prop1: `Josh`,
	location: `United Kingdom`,
};

const result = objectAssignDeep.into(target, objectA, objectB);

target.addedLater = `We should see this in result because we have mutated target.`;

console.log(`Result:`, result);
