// namespaces
var dwv = dwv || {};
dwv.image = dwv.image || {};

/**
 * {@link dwv.image.Image} factory.
 * @constructor
 */
dwv.image.ImageFactory = function () {};

/**
 * Get an {@link dwv.image.Image} object from the read DICOM file.
 * @param {Object} dicomElements The DICOM tags.
 * @param {Array} pixelBuffer The pixel buffer.
 * @return {View} A new Image.
 */
dwv.image.ImageFactory.prototype.create = function (dicomElements, pixelBuffer)
{
    // columns
    var columns = dicomElements.getFromKey("x00280011");
    if ( !columns ) {
        throw new Error("Missing or empty DICOM image number of columns");
    }
    // rows
    var rows = dicomElements.getFromKey("x00280010");
    if ( !rows ) {
        throw new Error("Missing or empty DICOM image number of rows");
    }
    // image size
    var size = new dwv.image.Size( columns, rows );

    // spacing
    var rowSpacing = null;
    var columnSpacing = null;
    // PixelSpacing
    var pixelSpacing = dicomElements.getFromKey("x00280030");
    // ImagerPixelSpacing
    var imagerPixelSpacing = dicomElements.getFromKey("x00181164");
    if ( pixelSpacing && pixelSpacing[0] && pixelSpacing[1] ) {
        rowSpacing = parseFloat( pixelSpacing[0] );
        columnSpacing = parseFloat( pixelSpacing[1] );
    }
    else if ( imagerPixelSpacing && imagerPixelSpacing[0] && imagerPixelSpacing[1] ) {
        rowSpacing = parseFloat( imagerPixelSpacing[0] );
        columnSpacing = parseFloat( imagerPixelSpacing[1] );
    }
    // image spacing
    var spacing = new dwv.image.Spacing( columnSpacing, rowSpacing );

    // TransferSyntaxUID
    var transferSyntaxUID = dicomElements.getFromKey("x00020010");
    var syntax = dwv.dicom.cleanString( transferSyntaxUID );
    var jpeg2000 = dwv.dicom.isJpeg2000TransferSyntax( syntax );
    var jpegBase = dwv.dicom.isJpegBaselineTransferSyntax( syntax );
    var jpegLoss = dwv.dicom.isJpegLosslessTransferSyntax( syntax );

    // ImagePositionPatient
    var imagePositionPatient = dicomElements.getFromKey("x00200032");
    // InstanceNumber
    var instanceNumber = dicomElements.getFromKey("x00200013");

    // slice position
    var slicePosition = new Array(0,0,0);
    if ( imagePositionPatient ) {
        slicePosition = [ parseFloat( imagePositionPatient[0] ),
            parseFloat( imagePositionPatient[1] ),
            parseFloat( imagePositionPatient[2] ) ];
    } else if (instanceNumber) {
        // use instanceNumber as slice index if no imagePositionPatient was provided
        console.warn("Using instanceNumber as imagePositionPatient.");
        slicePosition[2] = parseInt(instanceNumber, 10);
    }

    // slice orientation
    var imageOrientationPatient = dicomElements.getFromKey("x00200037");
    var orientationMatrix;
    if ( imageOrientationPatient ) {
        var rowCosines = new dwv.math.Vector3D( parseFloat( imageOrientationPatient[0] ),
            parseFloat( imageOrientationPatient[1] ),
            parseFloat( imageOrientationPatient[2] ) );
        var colCosines = new dwv.math.Vector3D( parseFloat( imageOrientationPatient[3] ),
            parseFloat( imageOrientationPatient[4] ),
            parseFloat( imageOrientationPatient[5] ) );
        var normal = rowCosines.crossProduct(colCosines);
        orientationMatrix = new dwv.math.Matrix33(
            rowCosines.getX(), rowCosines.getY(), rowCosines.getZ(),
            colCosines.getX(), colCosines.getY(), colCosines.getZ(),
            normal.getX(), normal.getY(), normal.getZ() );
    }

    // geometry
    var origin = new dwv.math.Point3D(slicePosition[0], slicePosition[1], slicePosition[2]);
    var geometry = new dwv.image.Geometry( origin, size, spacing, orientationMatrix );

    // sop instance UID
    var sopInstanceUid = dwv.dicom.cleanString(
        dicomElements.getFromKey("x00080018"));

    // image
    var image = new dwv.image.Image(
        geometry, pixelBuffer, pixelBuffer.length, [sopInstanceUid] );
    // PhotometricInterpretation
    var photometricInterpretation = dicomElements.getFromKey("x00280004");
    if ( photometricInterpretation ) {
        var photo = dwv.dicom.cleanString(photometricInterpretation).toUpperCase();
        // jpeg decoders output RGB data
        if ( (jpeg2000 || jpegBase || jpegLoss) &&
        	(photo !== "MONOCHROME1" && photo !== "MONOCHROME2") ) {
            photo = "RGB";
        }
        // check samples per pixels
        var samplesPerPixel = parseInt(dicomElements.getFromKey("x00280002"), 10);
        if (photo === "RGB" && samplesPerPixel === 1) {
            photo = "PALETTE COLOR";
        }
        image.setPhotometricInterpretation( photo );
    }
    // PlanarConfiguration
    var planarConfiguration = dicomElements.getFromKey("x00280006");
    if ( planarConfiguration ) {
        image.setPlanarConfiguration( planarConfiguration );
    }

    // rescale slope and intercept
    var slope = 1;
    // RescaleSlope
    var rescaleSlope = dicomElements.getFromKey("x00281053");
    if ( rescaleSlope ) {
        slope = parseFloat(rescaleSlope);
    }
    var intercept = 0;
    // RescaleIntercept
    var rescaleIntercept = dicomElements.getFromKey("x00281052");
    if ( rescaleIntercept ) {
        intercept = parseFloat(rescaleIntercept);
    }
    var rsi = new dwv.image.RescaleSlopeAndIntercept(slope, intercept);
    image.setRescaleSlopeAndIntercept( rsi );

    // meta information
    var meta = {};
    // Modality
    var modality = dicomElements.getFromKey("x00080060");
    if ( modality ) {
        meta.Modality = modality;
    }
    // StudyInstanceUID
    var studyInstanceUID = dicomElements.getFromKey("x0020000D");
    if ( studyInstanceUID ) {
        meta.StudyInstanceUID = studyInstanceUID;
    }
    // SeriesInstanceUID
    var seriesInstanceUID = dicomElements.getFromKey("x0020000E");
    if ( seriesInstanceUID ) {
        meta.SeriesInstanceUID = seriesInstanceUID;
    }
    // BitsStored
    var bitsStored = dicomElements.getFromKey("x00280101");
    if ( bitsStored ) {
        meta.BitsStored = parseInt(bitsStored, 10);
    }
    // PixelRepresentation -> is signed
    var pixelRepresentation = dicomElements.getFromKey("x00280103");
    meta.IsSigned = false;
    if ( pixelRepresentation ) {
        meta.IsSigned = (pixelRepresentation === 1);
    }

    // PALETTE COLOR luts
    if (image.getPhotometricInterpretation() === "PALETTE COLOR") {
        var redLut = dicomElements.getFromKey("x00281201");
        var greenLut = dicomElements.getFromKey("x00281202");
        var blueLut = dicomElements.getFromKey("x00281203");
        // check red palette descriptor (should all be equal)
        var descriptor = dicomElements.getFromKey("x00281101");
        if (typeof descriptor !== "undefined" &&
            descriptor.length === 3 ) {
            if (descriptor[2] === 16) {
                var doScale = false;
                // (C.7.6.3.1.5 Palette Color Lookup Table Descriptor)
                // Some implementations have encoded 8 bit entries with 16 bits
                // allocated, padding the high bits;
                var descSize = descriptor[0];
                // (C.7.6.3.1.5 Palette Color Lookup Table Descriptor)
                // The first Palette Color Lookup Table Descriptor value is the
                // number of entries in the lookup table. When the number of table
                // entries is equal to 216 then this value shall be 0.
                if (descSize === 0) {
                    descSize = 65536;
                }
                // red palette VL
                var redLutDE = dicomElements.getDEFromKey("x00281201");
                var vlSize = redLutDE.vl;
                // check double size
                if (vlSize !== 2 * descSize) {
                    doScale = true;
                    console.log('16bits lut but size is not double. desc: ', descSize, " vl: ", vlSize);
                }
                // (C.7.6.3.1.6 Palette Color Lookup Table Data)
                // Palette color values must always be scaled across the full
                // range of available intensities
                var bitsAllocated = parseInt(dicomElements.getFromKey("x00280100"), 10);
                if (bitsAllocated === 8) {
                    doScale = true;
                    console.log('Scaling 16bits color lut since bits allocated is 8.');
                }

                if (doScale) {
                    var scaleTo8 = function (value) {
                        return value >> 8;
                    };

                    redLut = redLut.map(scaleTo8);
                    greenLut = greenLut.map(scaleTo8);
                    blueLut = blueLut.map(scaleTo8);
                }
            } else if (descriptor[2] === 8) {
                // lut with vr=OW was read as Uint16, convert it to Uint8
                console.log('Scaling 16bits color lut since the lut descriptor is 8.');
                var clone = redLut.slice(0);
                redLut = new Uint8Array(clone.buffer);
                clone = greenLut.slice(0);
                greenLut = new Uint8Array(clone.buffer);
                clone = blueLut.slice(0);
                blueLut = new Uint8Array(clone.buffer);
            }
        }
        // set the palette
        meta.paletteLut = {
            "red": redLut,
            "green": greenLut,
            "blue": blueLut
        };
    }

    // RecommendedDisplayFrameRate
    var recommendedDisplayFrameRate = dicomElements.getFromKey("x00082144");
    if ( recommendedDisplayFrameRate ) {
        meta.RecommendedDisplayFrameRate = parseInt(recommendedDisplayFrameRate, 10);
    }

    // store the meta data
    image.setMeta(meta);

    return image;
};
