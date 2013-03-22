/**
 * @namespace Image related.
 */
dwv.image = dwv.image || {};

/**
 * Get data from an input image using a canvas.
 * @param image The image.
 * @param file The corresponding file.
 */
dwv.image.getDataFromImage = function(image, file)
{
    // draw the image in the canvas in order to get its data
    var canvas = document.getElementById('imageLayer');
    canvas.width = image.width;
    canvas.height = image.height;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0, image.width, image.height);
    // get the image data
    var imageData = ctx.getImageData(0, 0, image.width, image.height);
    // convert RGB data to pixel
    var buffer = [];
    var r, g, b, value;
    var j = 0;
    for( var i = 0; i < imageData.data.length; i+=4 ) {
        r = imageData.data[i];
        g = imageData.data[i+1];
        b = imageData.data[i+2];
        value = 65536 * r + 256 * g + b;
        value = Math.floor(value * 255 / 16777216);
        buffer[j] = value;
        ++j;
    }
    // create dwv Image
    var imageSize = new dwv.image.ImageSize(image.width, image.height);
    // TODO: wrong info...
    var imageSpacing = new dwv.image.ImageSpacing(1,1);
    var dwvImage = new dwv.image.Image(imageSize, imageSpacing, buffer);
    dwvImage.setIdRescaleLut();
    dwvImage.setWindowLevelMinMax();
    // properties
    var info = {};
    info["FileName"] = { "value": file.name };
    info["FileType"] = { "value": file.type };
    info["FileLastModifiedDate"] = { "value": file.lastModifiedDate };
    info["ImageWidth"] = { "value": image.width };
    info["ImageHeight"] = { "value": image.height };
    // return
    return {"image": dwvImage, "info": info};
};

/**
 * Get data from an input buffer using a DICOM parser.
 * @param buffer The input data buffer.
 */
dwv.image.getDataFromDicomBuffer = function(buffer)
{
    // DICOM parser
    var dicomParser = new dwv.dicom.DicomParser();
    // parse the buffer
    dicomParser.parse(buffer);
    // return
    return {'image': dicomParser.getImage(), 'info': dicomParser.dicomElements};
};

