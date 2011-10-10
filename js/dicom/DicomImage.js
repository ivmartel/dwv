/**
* DicomImage.js
*/

/**
* DicomImage.
* Immutable (no sets)
*/
function DicomImage(size, spacing){

	var self = this;
	// size: [0]=row, [1]=column
    this.size = size;
    // size: [0]=row, [1]=column
    this.spacing = spacing;

    this.getSize = function() {
        return self.size;
    };

    this.getSpacing = function() {
        return self.spacing;
    };
}



