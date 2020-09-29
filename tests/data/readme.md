DICOM Test data
===============

Generated data
----------------
* dwv-test-simple: simple data with basic tags
* dwv-test-sequence: trying to list all possible sequences...
* DICOMDIR: generated locally using the 'dicomdir.json' file to allow for non standard files
    (with extension, not upper case and in the same folder)...
    Note: the generator does not produce proper DICOMDIRs even when respecting standard files names...
    The official way to generate DICOMDIRs is to use [dcmmkdir](https://support.dcmtk.org/docs/dcmmkdir.html) from dcmtk.
    For ex you can run: 'dcmmkdir +r +I -Pgp IMAGES' on an 'IMAGES' folder containing the DICOM files.

External sources
-----------------
* Babymri: http://www.babymri.org/
* Dicompyler: http://www.dicompyler.com/
* Gdcm: https://sourceforge.net/projects/gdcm/files/gdcmData/gdcmData/
* Leadtools: (from Creatis) http://www.creatis.insa-lyon.fr/~jpr/PUBLIC/gdcm/gdcmSampleData/ColorDataSetLeadTool/
* Nema WG04 (jpeg): ftp://medical.nema.org/MEDICAL/Dicom/DataSets/WG04/
* Osirix: http://www.osirix-viewer.com/datasets/
