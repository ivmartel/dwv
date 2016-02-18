/** 
 * Math module.
 * @module math
 */
var dwv = dwv || {};
dwv.math = dwv.math || {};

/**
 * Circular Bucket Queue.
 *
 * Returns input'd points in sorted order. All operations run in roughly O(1)
 * time (for input with small cost values), but it has a strict requirement:
 *
 * If the most recent point had a cost of c, any points added should have a cost
 * c' in the range c <= c' <= c + (capacity - 1).
 *
 * @class BucketQueue
 * @namespace dwv.math
 * @constructor
 * @input bits
 * @input cost_functor
 */
dwv.math.BucketQueue = function(bits, cost_functor)
{
    this.bucketCount = 1 << bits; // # of buckets = 2^bits
    this.mask = this.bucketCount - 1; // 2^bits - 1 = index mask
    this.size = 0;

    this.loc = 0; // Current index in bucket list

    // Cost defaults to item value
    this.cost = (typeof(cost_functor) !== 'undefined') ? cost_functor : function(item) {
        return item;
    };

    this.buckets = this.buildArray(this.bucketCount);
};

dwv.math.BucketQueue.prototype.push = function(item) {
    // Prepend item to the list in the appropriate bucket
    var bucket = this.getBucket(item);
    item.next = this.buckets[bucket];
    this.buckets[bucket] = item;

    this.size++;
};

dwv.math.BucketQueue.prototype.pop = function() {
    if ( this.size === 0 ) {
        throw new Error("Cannot pop, bucketQueue is empty.");
    }

    // Find first empty bucket
    while ( this.buckets[this.loc] === null ) {
        this.loc = (this.loc + 1) % this.bucketCount;
    }

    // All items in bucket have same cost, return the first one
    var ret = this.buckets[this.loc];
    this.buckets[this.loc] = ret.next;
    ret.next = null;

    this.size--;
    return ret;
};

dwv.math.BucketQueue.prototype.remove = function(item) {
    // Tries to remove item from queue. Returns true on success, false otherwise
    if ( !item ) {
        return false;
    }

    // To find node, go to bucket and search through unsorted list.
    var bucket = this.getBucket(item);
    var node = this.buckets[bucket];

    while ( node !== null && !item.equals(node.next) ) {
        node = node.next;
    }

    if ( node === null ) {
        // Item not in list, ergo item not in queue
        return false;
    }
    else {
        // Found item, do standard list node deletion
        node.next = node.next.next;

        this.size--;
        return true;
    }
};

dwv.math.BucketQueue.prototype.isEmpty = function() {
    return this.size === 0;
};

dwv.math.BucketQueue.prototype.getBucket = function(item) {
    // Bucket index is the masked cost
    return this.cost(item) & this.mask;
};

dwv.math.BucketQueue.prototype.buildArray = function(newSize) {
    // Create array and initialze pointers to null
    var buckets = new Array(newSize);

    for ( var i = 0; i < buckets.length; i++ ) {
        buckets[i] = null;
    }

    return buckets;
};
