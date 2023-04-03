/**
 * Circular Bucket Queue.
 *
 * Returns input'd points in sorted order. All operations run in roughly O(1)
 * time (for input with small cost values), but it has a strict requirement:
 *
 * If the most recent point had a cost of c, any points added should have a cost
 * c' in the range c <= c' <= c + (capacity - 1).
 */
export class BucketQueue {

  /**
   * @param {number} bits Number of bits.
   * @param {Function} cost_functor The cost functor.
   */
  constructor(bits, cost_functor) {
    this.bucketCount = 1 << bits; // # of buckets = 2^bits
    this.mask = this.bucketCount - 1; // 2^bits - 1 = index mask
    this.size = 0;

    this.loc = 0; // Current index in bucket list
    // Cost defaults to item value
    this.cost = (typeof (cost_functor) !== 'undefined')
      ? cost_functor : function (item) {
        return item;
      };
    this.buckets = this.buildArray(this.bucketCount);
  }

  push(item) {
    // Prepend item to the list in the appropriate bucket
    const bucket = this.getBucket(item);
    item.next = this.buckets[bucket];
    this.buckets[bucket] = item;

    this.size++;
  }

  pop() {
    if (this.size === 0) {
      throw new Error('Cannot pop, bucketQueue is empty.');
    }

    // Find first empty bucket
    while (this.buckets[this.loc] === null) {
      this.loc = (this.loc + 1) % this.bucketCount;
    }

    // All items in bucket have same cost, return the first one
    const ret = this.buckets[this.loc];
    this.buckets[this.loc] = ret.next;
    ret.next = null;

    this.size--;
    return ret;
  }

  // TODO: needs at least two items...
  remove(item) {
    // Tries to remove item from queue. Returns true on success, false otherwise
    if (!item) {
      return false;
    }

    // To find node, go to bucket and search through unsorted list.
    const bucket = this.getBucket(item);
    let node = this.buckets[bucket];

    while (node !== null &&
      !(node.next !== null &&
      item.x === node.next.x &&
      item.y === node.next.y)) {
      node = node.next;
    }

    if (node === null) {
      // Item not in list, ergo item not in queue
      return false;
    } else {
      // Found item, do standard list node deletion
      node.next = node.next.next;

      this.size--;
      return true;
    }
  }

  isEmpty() {
    return this.size === 0;
  }

  getBucket(item) {
    // Bucket index is the masked cost
    return this.cost(item) & this.mask;
  }

  buildArray(newSize) {
    // Create array and initialze pointers to null
    const buckets = new Array(newSize);

    for (let i = 0; i < buckets.length; i++) {
      buckets[i] = null;
    }

    return buckets;
  }

} // class BucketQueue
