/**
* DicomImage.js
*/

/**
* DicomImage.
* Immutable (no sets)
*/
function DicomImage(size, spacing){

    // size: [0]=row, [1]=column
    this.size = size;
    // size: [0]=row, [1]=column
    this.spacing = spacing;
}

DicomImage.prototype.getSize = function() {
    return this.size;
};

DicomImage.prototype.getSpacing = function() {
    return this.spacing;
};
	
