'use strict';

/*
 * ARRAY TEST
 *
 * [Description]
 *   Demonstrates that arrays are concatenated without removing duplicates, and are also recursed into to break
 *   references on any objects or arrays that are contained within.
 *
 * [Expected Output]
 *   {
 *     shallowArray: [ 'z', 'G', 'a' ],
 *     deepArray: [ 1, 2, 3, 10, 11, 12, 1, 2, 3, { deep: 'yes' }, 4, 5, 6 ] },
 *   }
 *
 */

/* eslint no-console: 0 */

const objectAssignDeep = require(`../objectAssignDeep`);

const deeplyNestedObject = { deep: `yes` };

const objectA = {
	shallowArray: [`a`, `x`, `y`, `y`, `y`],
	deepArray: [1, 2, 3, 10, 11, 12],
};

const objectB = {
	shallowArray: null,
	deepArray: [1, 2, 3, deeplyNestedObject, 4, 5, 6],
};

const objectC = {
	shallowArray: [`z`, `G`, `a`],
};

const resultWithArrayReplace = objectAssignDeep({}, objectA, objectB, objectC);
const resultWithArrayMerge = objectAssignDeep.withOptions({}, [objectA, objectB, objectC], { arrayBehaviour: `merge` });

deeplyNestedObject.hello = `This value should not be in the result because it was added to the object after cloning.`;

console.log(`Result with array REPLACE:`, resultWithArrayReplace);
console.log(``);
console.log(`Result with array MERGE:`, resultWithArrayMerge);
