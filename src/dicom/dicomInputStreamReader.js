// dicom namespace
dwv.dicom = dwv.dicom || {};

dwv.dicom.readDicom = function(url)
{
    //this.inputStreamReader = new dwv.reader.BinFileReader(url);
    this.inputStreamReader = new dwv.reader.LocalFileReader(url);                
    this.inputBuffer = new Array(this.inputStreamReader.getFileSize()); 
    this.inputBuffer = this.inputStreamReader.readBytes();    
};

dwv.dicom.getInputBuffer = function()
{
    return this.inputBuffer;    
};

dwv.dicom.getReader = function()
{
    return this.inputStreamReader;
};

/**
 * DicomInputStreamReader class.
 */
dwv.dicom.DicomInputStreamReader = function()
{    
    this.readDicom = dwv.dicom.readDicom;
    this.getInputBuffer = dwv.dicom.getInputBuffer;
    this.getReader = dwv.dicom.getReader;
};
