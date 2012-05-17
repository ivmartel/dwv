
// Implemented from specification given in:
//
//Eric N. Mortensen, William A. Barrett, Interactive Segmentation with
// Intelligent Scissors, Graphical Models and Image Processing, Volume 60,
// Issue 5, September 1998, Pages 349-384, ISSN 1077-3169,
// DOI: 10.1006/gmip.1998.0480.
//(http://www.sciencedirect.com/science/article/B6WG4-45JB8WN-9/2/6fe59d8089fd1892c2bfb82283065579)

// Circular Bucket Queue
//
// Returns input'd points in sorted order. All operations run in roughly O(1)
// time (for input with small cost values), but it has a strict requirement:
//
// If the most recent point had a cost of c, any points added should have a cost
// c' in the range c <= c' <= c + (capacity - 1).

function BucketQueue(bits, cost_functor) {
	this.bucketCount = 1 << bits; // # of buckets = 2^bits
	this.mask = this.bucketCount - 1; // 2^bits - 1 = index mask
	this.size = 0;
	
	this.loc = 0; // Current index in bucket list
	
	// Cost defaults to item value
	this.cost = (typeof(cost_functor) != 'undefined') ? cost_functor : function(item) {
		return item;
	};
	
	this.buckets = this.buildArray(this.bucketCount);
}

BucketQueue.prototype.push = function(item) {
	// Prepend item to the list in the appropriate bucket
	var bucket = this.getBucket(item);
	item.next = this.buckets[bucket];
	this.buckets[bucket] = item;
	
	this.size++;
};

BucketQueue.prototype.pop = function() {
	if ( this.size == 0 ) {
		throw new Error("BucketQueue is empty.");
	}
	
	// Find first empty bucket
	while ( this.buckets[this.loc] == null ) this.loc = (this.loc + 1) % this.bucketCount;
	
	// All items in bucket have same cost, return the first one
	var ret = this.buckets[this.loc];
	this.buckets[this.loc] = ret.next;
	ret.next = null;
	
	this.size--;
	return ret;
};

BucketQueue.prototype.remove = function(item) {
	// Tries to remove item from queue. Returns true on success, false otherwise
	if ( !item ) {
		return false;
	}
	
	// To find node, go to bucket and search through unsorted list.
	var bucket = this.getBucket(item);
	var node = this.buckets[bucket];
	
	while ( node != null && !item.equals(node.next) ) {
		node = node.next;
	}
	
	if ( node == null ) {
		// Item not in list, ergo item not in queue
		return false;
	} else {
		// Found item, do standard list node deletion
		node.next = node.next.next;
		
		this.size--;
		return true;
	}
};

BucketQueue.prototype.isEmpty = function() {
	return this.size == 0;
};

BucketQueue.prototype.getBucket = function(item) {
	// Bucket index is the masked cost
	return this.cost(item) & this.mask;
};

BucketQueue.prototype.buildArray = function(newSize) {
	// Create array and initialze pointers to null
	var buckets = new Array();
	buckets.length = newSize;
	
	for ( var i = 0; i < buckets.length; i++ ) {
		buckets[i] = null;
	}
	
	return buckets;
};