/**
 *  UID.js
 *  Version 0.5
 *  Author: BabuHussain<babuhussain.a@raster.in>
 */
function UID () {
    this.init=function() {       
    };
    /** Private Study Root Query/Retrieve Information Model - FIND - SOP Class */
    this. PrivateStudyRootQueryRetrieveInformationModelFIND = "1.2.40.0.13.1.5.1.4.1.2.2.1";

    /** Private Blocked Study Root Query/Retrieve Information Model - FIND - SOP Class */
    this. PrivateBlockedStudyRootQueryRetrieveInformationModelFIND = "1.2.40.0.13.1.5.1.4.1.2.2.1.1";

    /** Private Virtual Multiframe Study Root Query/Retrieve Information Model - FIND - SOP Class */
    this. PrivateVirtualMultiframeStudyRootQueryRetrieveInformationModelFIND = "1.2.40.0.13.1.5.1.4.1.2.2.1.2";

    /** Verification SOP Class - SOP Class */
    this. VerificationSOPClass = "1.2.840.10008.1.1";

    /** Implicit VR Little Endian - Transfer Syntax */
    this. ImplicitVRLittleEndian = "1.2.840.10008.1.2";

    /** Explicit VR Little Endian - Transfer Syntax */
    this. ExplicitVRLittleEndian = "1.2.840.10008.1.2.1";

    /** Deflated Explicit VR Little Endian - Transfer Syntax */
    this. DeflatedExplicitVRLittleEndian = "1.2.840.10008.1.2.1.99";

    /** Explicit VR Big Endian - Transfer Syntax */
    this. ExplicitVRBigEndian = "1.2.840.10008.1.2.2";

    /** MPEG2 Main Profile @ Main Level - Transfer Syntax */
    this. MPEG2 = "1.2.840.10008.1.2.4.100";

    /** JPEG Baseline (Process 1) - Transfer Syntax */
    this. JPEGBaseline1 = "1.2.840.10008.1.2.4.50";

    /** JPEG Extended (Process 2 & 4) - Transfer Syntax */
    this. JPEGExtended24 = "1.2.840.10008.1.2.4.51";

    /** JPEG Extended (Process 3 & 5) (Retired) - Transfer Syntax */
    this. JPEGExtended35Retired = "1.2.840.10008.1.2.4.52";

    /** JPEG Spectral Selection, Non-Hierarchical (Process 6 & 8) (Retired) - Transfer Syntax */
    this. JPEGSpectralSelectionNonHierarchical68Retired = "1.2.840.10008.1.2.4.53";

    /** JPEG Spectral Selection, Non-Hierarchical (Process 7 & 9) (Retired) - Transfer Syntax */
    this. JPEGSpectralSelectionNonHierarchical79Retired = "1.2.840.10008.1.2.4.54";

    /** JPEG Full Progression, Non-Hierarchical (Process 10 & 12) (Retired) - Transfer Syntax */
    this. JPEGFullProgressionNonHierarchical1012Retired = "1.2.840.10008.1.2.4.55";

    /** JPEG Full Progression, Non-Hierarchical (Process 11 & 13) (Retired) - Transfer Syntax */
    this. JPEGFullProgressionNonHierarchical1113Retired = "1.2.840.10008.1.2.4.56";

    /** JPEG Lossless, Non-Hierarchical (Process 14) - Transfer Syntax */
    this. JPEGLosslessNonHierarchical14 = "1.2.840.10008.1.2.4.57";

    /** JPEG Lossless, Non-Hierarchical (Process 15) (Retired) - Transfer Syntax */
    this. JPEGLosslessNonHierarchical15Retired = "1.2.840.10008.1.2.4.58";

    /** JPEG Extended, Hierarchical (Process 16 & 18) (Retired) - Transfer Syntax */
    this. JPEGExtendedHierarchical1618Retired = "1.2.840.10008.1.2.4.59";

    /** JPEG Extended, Hierarchical (Process 17 & 19) (Retired) - Transfer Syntax */
    this. JPEGExtendedHierarchical1719Retired = "1.2.840.10008.1.2.4.60";

    /** JPEG Spectral Selection, Hierarchical (Process 20 & 22) (Retired) - Transfer Syntax */
    this. JPEGSpectralSelectionHierarchical2022Retired = "1.2.840.10008.1.2.4.61";

    /** JPEG Spectral Selection, Hierarchical (Process 21 & 23) (Retired) - Transfer Syntax */
    this. JPEGSpectralSelectionHierarchical2123Retired = "1.2.840.10008.1.2.4.62";

    /** JPEG Full Progression, Hierarchical (Process 24 & 26) (Retired) - Transfer Syntax */
    this. JPEGFullProgressionHierarchical2426Retired = "1.2.840.10008.1.2.4.63";

    /** JPEG Full Progression, Hierarchical (Process 25 & 27) (Retired) - Transfer Syntax */
    this. JPEGFullProgressionHierarchical2527Retired = "1.2.840.10008.1.2.4.64";

    /** JPEG Lossless, Hierarchical (Process 28) (Retired) - Transfer Syntax */
    this. JPEGLosslessHierarchical28Retired = "1.2.840.10008.1.2.4.65";

    /** JPEG Lossless, Hierarchical (Process 29) (Retired) - Transfer Syntax */
    this. JPEGLosslessHierarchical29Retired = "1.2.840.10008.1.2.4.66";

    /** JPEG Lossless, Non-Hierarchical, First-Order Prediction (Process 14 [Selection Value 1]) - Transfer Syntax */
    this. JPEGLossless = "1.2.840.10008.1.2.4.70";

    /** JPEG-LS Lossless Image Compression - Transfer Syntax */
    this. JPEGLSLossless = "1.2.840.10008.1.2.4.80";

    /** JPEG-LS Lossy (Near-Lossless) Image Compression - Transfer Syntax */
    this. JPEGLSLossyNearLossless = "1.2.840.10008.1.2.4.81";

    /** JPEG 2000 Image Compression (Lossless Only) - Transfer Syntax */
    this. JPEG2000LosslessOnly = "1.2.840.10008.1.2.4.90";

    /** JPEG 2000 Image Compression - Transfer Syntax */
    this. JPEG2000 = "1.2.840.10008.1.2.4.91";

    /** JPEG 2000 Part 2 Multi-component Image Compression (Lossless Only) - Transfer Syntax */
    this. JPEG2000Part2MulticomponentLosslessOnly = "1.2.840.10008.1.2.4.92";

    /** JPEG 2000 Part 2 Multi-component Image Compression - Transfer Syntax */
    this. JPEG2000Part2Multicomponent = "1.2.840.10008.1.2.4.93";

    /** JPIP Referenced - Transfer Syntax */
    this. JPIPReferenced = "1.2.840.10008.1.2.4.94";

    /** JPIP Referenced Deflate - Transfer Syntax */
    this. JPIPReferencedDeflate = "1.2.840.10008.1.2.4.95";

    /** RLE Lossless - Transfer Syntax */
    this. RLELossless = "1.2.840.10008.1.2.5";

    /** RFC 2557 MIME encapsulation - Transfer Syntax */
    this. RFC2557MIMEencapsulation = "1.2.840.10008.1.2.6.1";

    /** XML Encoding - Transfer Syntax */
    this. XMLEncoding = "1.2.840.10008.1.2.6.2";

    /** Storage Commitment Push Model SOP Class - SOP Class */
    this. StorageCommitmentPushModelSOPClass = "1.2.840.10008.1.20.1";

    /** Storage Commitment Push Model SOP Instance - Well-known SOP Instance */
    this. StorageCommitmentPushModelSOPInstance = "1.2.840.10008.1.20.1.1";

    /** Storage Commitment Pull Model SOP Class (Retired) - SOP Class */
    this. StorageCommitmentPullModelSOPClassRetired = "1.2.840.10008.1.20.2";

    /** Storage Commitment Pull Model SOP Instance (Retired) - Well-known SOP Instance */
    this. StorageCommitmentPullModelSOPInstanceRetired = "1.2.840.10008.1.20.2.1";

    /** Media Storage Directory Storage - SOP Class */
    this. MediaStorageDirectoryStorage = "1.2.840.10008.1.3.10";

    /** Talairach Brain Atlas Frame of Reference - Well-known frame of reference */
    this. TalairachBrainAtlasFrameofReference = "1.2.840.10008.1.4.1.1";

    /** SPM2 GRAY Frame of Reference - Well-known frame of reference */
    this. SPM2GRAYFrameofReference = "1.2.840.10008.1.4.1.10";

    /** SPM2 WHITE Frame of Reference - Well-known frame of reference */
    this. SPM2WHITEFrameofReference = "1.2.840.10008.1.4.1.11";

    /** SPM2 CSF Frame of Reference - Well-known frame of reference */
    this. SPM2CSFFrameofReference = "1.2.840.10008.1.4.1.12";

    /** SPM2 BRAINMASK Frame of Reference - Well-known frame of reference */
    this. SPM2BRAINMASKFrameofReference = "1.2.840.10008.1.4.1.13";

    /** SPM2 AVG305T1 Frame of Reference - Well-known frame of reference */
    this. SPM2AVG305T1FrameofReference = "1.2.840.10008.1.4.1.14";

    /** SPM2 AVG152T1 Frame of Reference - Well-known frame of reference */
    this. SPM2AVG152T1FrameofReference = "1.2.840.10008.1.4.1.15";

    /** SPM2 AVG152T2 Frame of Reference - Well-known frame of reference */
    this. SPM2AVG152T2FrameofReference = "1.2.840.10008.1.4.1.16";

    /** SPM2 AVG152PD Frame of Reference - Well-known frame of reference */
    this. SPM2AVG152PDFrameofReference = "1.2.840.10008.1.4.1.17";

    /** SPM2 SINGLESUBJT1 Frame of Reference - Well-known frame of reference */
    this. SPM2SINGLESUBJT1FrameofReference = "1.2.840.10008.1.4.1.18";

    /** SPM2 T1 Frame of Reference - Well-known frame of reference */
    this. SPM2T1FrameofReference = "1.2.840.10008.1.4.1.2";

    /** SPM2 T2 Frame of Reference - Well-known frame of reference */
    this. SPM2T2FrameofReference = "1.2.840.10008.1.4.1.3";

    /** SPM2 PD Frame of Reference - Well-known frame of reference */
    this. SPM2PDFrameofReference = "1.2.840.10008.1.4.1.4";

    /** SPM2 EPI Frame of Reference - Well-known frame of reference */
    this. SPM2EPIFrameofReference = "1.2.840.10008.1.4.1.5";

    /** SPM2 FIL T1 Frame of Reference - Well-known frame of reference */
    this. SPM2FILT1FrameofReference = "1.2.840.10008.1.4.1.6";

    /** SPM2 PET Frame of Reference - Well-known frame of reference */
    this. SPM2PETFrameofReference = "1.2.840.10008.1.4.1.7";

    /** SPM2 TRANSM Frame of Reference - Well-known frame of reference */
    this. SPM2TRANSMFrameofReference = "1.2.840.10008.1.4.1.8";

    /** SPM2 SPECT Frame of Reference - Well-known frame of reference */
    this. SPM2SPECTFrameofReference = "1.2.840.10008.1.4.1.9";

    /** ICBM 452 T1 Frame of Reference - Well-known frame of reference */
    this. ICBM452T1FrameofReference = "1.2.840.10008.1.4.2.1";

    /** ICBM Single Subject MRI Frame of Reference - Well-known frame of reference */
    this. ICBMSingleSubjectMRIFrameofReference = "1.2.840.10008.1.4.2.2";

    /** Procedural Event Logging SOP Class - SOP Class */
    this. ProceduralEventLoggingSOPClass = "1.2.840.10008.1.40";

    /** Procedural Event Logging SOP Instance - Well-known SOP Instance */
    this. ProceduralEventLoggingSOPInstance = "1.2.840.10008.1.40.1";

    /** Basic Study Content Notification SOP Class (Retired) - SOP Class */
    this. BasicStudyContentNotificationSOPClassRetired = "1.2.840.10008.1.9";

    /** dicomDeviceName - LDAP OID */
    this. dicomDeviceName = "1.2.840.10008.15.0.3.1";

    /** dicomAssociationInitiator - LDAP OID */
    this. dicomAssociationInitiator = "1.2.840.10008.15.0.3.10";

    /** dicomAssociationAcceptor - LDAP OID */
    this. dicomAssociationAcceptor = "1.2.840.10008.15.0.3.11";

    /** dicomHostname - LDAP OID */
    this. dicomHostname = "1.2.840.10008.15.0.3.12";

    /** dicomPort - LDAP OID */
    this. dicomPort = "1.2.840.10008.15.0.3.13";

    /** dicomSOPClass - LDAP OID */
    this. dicomSOPClass = "1.2.840.10008.15.0.3.14";

    /** dicomTransferRole - LDAP OID */
    this. dicomTransferRole = "1.2.840.10008.15.0.3.15";

    /** dicomTransferSyntax - LDAP OID */
    this. dicomTransferSyntax = "1.2.840.10008.15.0.3.16";

    /** dicomPrimaryDeviceType - LDAP OID */
    this. dicomPrimaryDeviceType = "1.2.840.10008.15.0.3.17";

    /** dicomRelatedDeviceReference - LDAP OID */
    this. dicomRelatedDeviceReference = "1.2.840.10008.15.0.3.18";

    /** dicomPreferredCalledAETitle - LDAP OID */
    this. dicomPreferredCalledAETitle = "1.2.840.10008.15.0.3.19";

    /** dicomDescription - LDAP OID */
    this. dicomDescription = "1.2.840.10008.15.0.3.2";

    /** dicomTLSCyphersuite - LDAP OID */
    this. dicomTLSCyphersuite = "1.2.840.10008.15.0.3.20";

    /** dicomAuthorizedNodeCertificateReference - LDAP OID */
    this. dicomAuthorizedNodeCertificateReference = "1.2.840.10008.15.0.3.21";

    /** dicomThisNodeCertificateReference - LDAP OID */
    this. dicomThisNodeCertificateReference = "1.2.840.10008.15.0.3.22";

    /** dicomInstalled - LDAP OID */
    this. dicomInstalled = "1.2.840.10008.15.0.3.23";

    /** dicomStationName - LDAP OID */
    this. dicomStationName = "1.2.840.10008.15.0.3.24";

    /** dicomDeviceSerialNumber - LDAP OID */
    this. dicomDeviceSerialNumber = "1.2.840.10008.15.0.3.25";

    /** dicomInstitutionName - LDAP OID */
    this. dicomInstitutionName = "1.2.840.10008.15.0.3.26";

    /** dicomInstitutionAddress - LDAP OID */
    this. dicomInstitutionAddress = "1.2.840.10008.15.0.3.27";

    /** dicomInstitutionDepartmentName - LDAP OID */
    this. dicomInstitutionDepartmentName = "1.2.840.10008.15.0.3.28";

    /** dicomIssuerOfPatientID - LDAP OID */
    this. dicomIssuerOfPatientID = "1.2.840.10008.15.0.3.29";

    /** dicomManufacturer - LDAP OID */
    this. dicomManufacturer = "1.2.840.10008.15.0.3.3";

    /** dicomPreferredCallingAETitle - LDAP OID */
    this. dicomPreferredCallingAETitle = "1.2.840.10008.15.0.3.30";

    /** dicomSupportedCharacterSet - LDAP OID */
    this. dicomSupportedCharacterSet = "1.2.840.10008.15.0.3.31";

    /** dicomManufacturerModelName - LDAP OID */
    this. dicomManufacturerModelName = "1.2.840.10008.15.0.3.4";

    /** dicomSoftwareVersion - LDAP OID */
    this. dicomSoftwareVersion = "1.2.840.10008.15.0.3.5";

    /** dicomVendorData - LDAP OID */
    this. dicomVendorData = "1.2.840.10008.15.0.3.6";

    /** dicomAETitle - LDAP OID */
    this. dicomAETitle = "1.2.840.10008.15.0.3.7";

    /** dicomNetworkConnectionReference - LDAP OID */
    this. dicomNetworkConnectionReference = "1.2.840.10008.15.0.3.8";

    /** dicomApplicationCluster - LDAP OID */
    this. dicomApplicationCluster = "1.2.840.10008.15.0.3.9";

    /** dicomConfigurationRoot - LDAP OID */
    this. dicomConfigurationRoot = "1.2.840.10008.15.0.4.1";

    /** dicomDevicesRoot - LDAP OID */
    this. dicomDevicesRoot = "1.2.840.10008.15.0.4.2";

    /** dicomUniqueAETitlesRegistryRoot - LDAP OID */
    this. dicomUniqueAETitlesRegistryRoot = "1.2.840.10008.15.0.4.3";

    /** dicomDevice - LDAP OID */
    this. dicomDevice = "1.2.840.10008.15.0.4.4";

    /** dicomNetworkAE - LDAP OID */
    this. dicomNetworkAE = "1.2.840.10008.15.0.4.5";

    /** dicomNetworkConnection - LDAP OID */
    this. dicomNetworkConnection = "1.2.840.10008.15.0.4.6";

    /** dicomUniqueAETitle - LDAP OID */
    this. dicomUniqueAETitle = "1.2.840.10008.15.0.4.7";

    /** dicomTransferCapability - LDAP OID */
    this. dicomTransferCapability = "1.2.840.10008.15.0.4.8";

    /** DICOM Controlled Terminology - Coding Scheme */
    this. DICOMControlledTerminology = "1.2.840.10008.2.16.4";

    /** DICOM UID Registry - DICOM UIDs as a Coding Scheme */
    this. DICOMUIDRegistry = "1.2.840.10008.2.6.1";

    /** DICOM Application Context Name - Application Context Name */
    this. DICOMApplicationContextName = "1.2.840.10008.3.1.1.1";

    /** Detached Patient Management SOP Class (Retired) - SOP Class */
    this. DetachedPatientManagementSOPClassRetired = "1.2.840.10008.3.1.2.1.1";

    /** Detached Patient Management Meta SOP Class (Retired) - Meta SOP Class */
    this. DetachedPatientManagementMetaSOPClassRetired = "1.2.840.10008.3.1.2.1.4";

    /** Detached Visit Management SOP Class (Retired) - SOP Class */
    this. DetachedVisitManagementSOPClassRetired = "1.2.840.10008.3.1.2.2.1";

    /** Detached Study Management SOP Class (Retired) - SOP Class */
    this. DetachedStudyManagementSOPClassRetired = "1.2.840.10008.3.1.2.3.1";

    /** Study Component Management SOP Class (Retired) - SOP Class */
    this. StudyComponentManagementSOPClassRetired = "1.2.840.10008.3.1.2.3.2";

    /** Modality Performed Procedure Step SOP Class - SOP Class */
    this. ModalityPerformedProcedureStepSOPClass = "1.2.840.10008.3.1.2.3.3";

    /** Modality Performed Procedure Step Retrieve SOP Class - SOP Class */
    this. ModalityPerformedProcedureStepRetrieveSOPClass = "1.2.840.10008.3.1.2.3.4";

    /** Modality Performed Procedure Step Notification SOP Class - SOP Class */
    this. ModalityPerformedProcedureStepNotificationSOPClass = "1.2.840.10008.3.1.2.3.5";

    /** Detached Results Management SOP Class (Retired) - SOP Class */
    this. DetachedResultsManagementSOPClassRetired = "1.2.840.10008.3.1.2.5.1";

    /** Detached Results Management Meta SOP Class (Retired) - Meta SOP Class */
    this. DetachedResultsManagementMetaSOPClassRetired = "1.2.840.10008.3.1.2.5.4";

    /** Detached Study Management Meta SOP Class (Retired) - Meta SOP Class */
    this. DetachedStudyManagementMetaSOPClassRetired = "1.2.840.10008.3.1.2.5.5";

    /** Detached Interpretation Management SOP Class (Retired) - SOP Class */
    this. DetachedInterpretationManagementSOPClassRetired = "1.2.840.10008.3.1.2.6.1";

    /** Storage Service Class - Service Class */
    this. StorageServiceClass = "1.2.840.10008.4.2";

    /** Basic Film Session SOP Class - SOP Class */
    this. BasicFilmSessionSOPClass = "1.2.840.10008.5.1.1.1";

    /** Print Job SOP Class - SOP Class */
    this. PrintJobSOPClass = "1.2.840.10008.5.1.1.14";

    /** Basic Annotation Box SOP Class - SOP Class */
    this. BasicAnnotationBoxSOPClass = "1.2.840.10008.5.1.1.15";

    /** Printer SOP Class - SOP Class */
    this. PrinterSOPClass = "1.2.840.10008.5.1.1.16";

    /** Printer Configuration Retrieval SOP Class - SOP Class */
    this. PrinterConfigurationRetrievalSOPClass = "1.2.840.10008.5.1.1.16.376";

    /** Printer SOP Instance - Well-known Printer SOP Instance */
    this. PrinterSOPInstance = "1.2.840.10008.5.1.1.17";

    /** Printer Configuration Retrieval SOP Instance - Well-known Printer SOP Instance */
    this. PrinterConfigurationRetrievalSOPInstance = "1.2.840.10008.5.1.1.17.376";

    /** Basic Color Print Management Meta SOP Class - Meta SOP Class */
    this. BasicColorPrintManagementMetaSOPClass = "1.2.840.10008.5.1.1.18";

    /** Referenced Color Print Management Meta SOP Class (Retired) - Meta SOP Class */
    this. ReferencedColorPrintManagementMetaSOPClassRetired = "1.2.840.10008.5.1.1.18.1";

    /** Basic Film Box SOP Class - SOP Class */
    this. BasicFilmBoxSOPClass = "1.2.840.10008.5.1.1.2";

    /** VOI LUT Box SOP Class - SOP Class */
    this. VOILUTBoxSOPClass = "1.2.840.10008.5.1.1.22";

    /** Presentation LUT SOP Class - SOP Class */
    this. PresentationLUTSOPClass = "1.2.840.10008.5.1.1.23";

    /** Image Overlay Box SOP Class (Retired) - SOP Class */
    this. ImageOverlayBoxSOPClassRetired = "1.2.840.10008.5.1.1.24";

    /** Basic Print Image Overlay Box SOP Class (Retired) - SOP Class */
    this. BasicPrintImageOverlayBoxSOPClassRetired = "1.2.840.10008.5.1.1.24.1";

    /** Print Queue SOP Instance (Retired) - Well-known Print Queue SOP Instance */
    this. PrintQueueSOPInstanceRetired = "1.2.840.10008.5.1.1.25";

    /** Print Queue Management SOP Class (Retired) - SOP Class */
    this. PrintQueueManagementSOPClassRetired = "1.2.840.10008.5.1.1.26";

    /** Stored Print Storage SOP Class (Retired) - SOP Class */
    this. StoredPrintStorageSOPClassRetired = "1.2.840.10008.5.1.1.27";

    /** Hardcopy Grayscale Image Storage SOP Class (Retired) - SOP Class */
    this. HardcopyGrayscaleImageStorageSOPClassRetired = "1.2.840.10008.5.1.1.29";

    /** Hardcopy Color Image Storage SOP Class (Retired) - SOP Class */
    this. HardcopyColorImageStorageSOPClassRetired = "1.2.840.10008.5.1.1.30";

    /** Pull Print Request SOP Class (Retired) - SOP Class */
    this. PullPrintRequestSOPClassRetired = "1.2.840.10008.5.1.1.31";

    /** Pull Stored Print Management Meta SOP Class (Retired) - Meta SOP Class */
    this. PullStoredPrintManagementMetaSOPClassRetired = "1.2.840.10008.5.1.1.32";

    /** Media Creation Management SOP Class UID - SOP Class */
    this. MediaCreationManagementSOPClassUID = "1.2.840.10008.5.1.1.33";

    /** Basic Grayscale Image Box SOP Class - SOP Class */
    this. BasicGrayscaleImageBoxSOPClass = "1.2.840.10008.5.1.1.4";

    /** Basic Color Image Box SOP Class - SOP Class */
    this. BasicColorImageBoxSOPClass = "1.2.840.10008.5.1.1.4.1";

    /** Referenced Image Box SOP Class (Retired) - SOP Class */
    this. ReferencedImageBoxSOPClassRetired = "1.2.840.10008.5.1.1.4.2";

    /** Basic Grayscale Print Management Meta SOP Class - Meta SOP Class */
    this. BasicGrayscalePrintManagementMetaSOPClass = "1.2.840.10008.5.1.1.9";

    /** Referenced Grayscale Print Management Meta SOP Class (Retired) - Meta SOP Class */
    this. ReferencedGrayscalePrintManagementMetaSOPClassRetired = "1.2.840.10008.5.1.1.9.1";

    /** Computed Radiography Image Storage - SOP Class */
    this. ComputedRadiographyImageStorage = "1.2.840.10008.5.1.4.1.1.1";

    /** Digital X-Ray Image Storage - For Presentation - SOP Class */
    this. DigitalXRayImageStorageForPresentation = "1.2.840.10008.5.1.4.1.1.1.1";

    /** Digital X-Ray Image Storage - For Processing - SOP Class */
    this. DigitalXRayImageStorageForProcessing = "1.2.840.10008.5.1.4.1.1.1.1.1";

    /** Digital Mammography X-Ray Image Storage - For Presentation - SOP Class */
    this. DigitalMammographyXRayImageStorageForPresentation = "1.2.840.10008.5.1.4.1.1.1.2";

    /** Digital Mammography X-Ray Image Storage - For Processing - SOP Class */
    this. DigitalMammographyXRayImageStorageForProcessing = "1.2.840.10008.5.1.4.1.1.1.2.1";

    /** Digital Intra-oral X-Ray Image Storage - For Presentation - SOP Class */
    this. DigitalIntraoralXRayImageStorageForPresentation = "1.2.840.10008.5.1.4.1.1.1.3";

    /** Digital Intra-oral X-Ray Image Storage - For Processing - SOP Class */
    this. DigitalIntraoralXRayImageStorageForProcessing = "1.2.840.10008.5.1.4.1.1.1.3.1";

    /** Standalone Modality LUT Storage (Retired) - SOP Class */
    this. StandaloneModalityLUTStorageRetired = "1.2.840.10008.5.1.4.1.1.10";

    /** Encapsulated PDF Storage - SOP Class */
    this. EncapsulatedPDFStorage = "1.2.840.10008.5.1.4.1.1.104.1";

    /** Encapsulated CDA Storage - SOP Class */
    this. EncapsulatedCDAStorage = "1.2.840.10008.5.1.4.1.1.104.2";

    /** Standalone VOI LUT Storage (Retired) - SOP Class */
    this. StandaloneVOILUTStorageRetired = "1.2.840.10008.5.1.4.1.1.11";

    /** Grayscale Softcopy Presentation State Storage SOP Class - SOP Class */
    this. GrayscaleSoftcopyPresentationStateStorageSOPClass = "1.2.840.10008.5.1.4.1.1.11.1";

    /** Color Softcopy Presentation State Storage SOP Class - SOP Class */
    this. ColorSoftcopyPresentationStateStorageSOPClass = "1.2.840.10008.5.1.4.1.1.11.2";

    /** Pseudo-Color Softcopy Presentation State Storage SOP Class - SOP Class */
    this. PseudoColorSoftcopyPresentationStateStorageSOPClass = "1.2.840.10008.5.1.4.1.1.11.3";

    /** Blending Softcopy Presentation State Storage SOP Class - SOP Class */
    this. BlendingSoftcopyPresentationStateStorageSOPClass = "1.2.840.10008.5.1.4.1.1.11.4";

    /** X-Ray Angiographic Image Storage - SOP Class */
    this. XRayAngiographicImageStorage = "1.2.840.10008.5.1.4.1.1.12.1";

    /** Enhanced XA Image Storage - SOP Class */
    this. EnhancedXAImageStorage = "1.2.840.10008.5.1.4.1.1.12.1.1";

    /** X-Ray Radiofluoroscopic Image Storage - SOP Class */
    this. XRayRadiofluoroscopicImageStorage = "1.2.840.10008.5.1.4.1.1.12.2";

    /** Enhanced XRF Image Storage - SOP Class */
    this. EnhancedXRFImageStorage = "1.2.840.10008.5.1.4.1.1.12.2.1";

    /** X-Ray Angiographic Bi-Plane Image Storage (Retired) - SOP Class */
    this. XRayAngiographicBiPlaneImageStorageRetired = "1.2.840.10008.5.1.4.1.1.12.3";

    /** Positron Emission Tomography Image Storage - SOP Class */
    this. PositronEmissionTomographyImageStorage = "1.2.840.10008.5.1.4.1.1.128";

    /** Standalone PET Curve Storage (Retired) - SOP Class */
    this. StandalonePETCurveStorageRetired = "1.2.840.10008.5.1.4.1.1.129";

    /** X-Ray 3D Angiographic Image Storage - SOP Class */
    this. XRay3DAngiographicImageStorage = "1.2.840.10008.5.1.4.1.1.13.1.1";

    /** X-Ray 3D Craniofacial Image Storage - SOP Class */
    this. XRay3DCraniofacialImageStorage = "1.2.840.10008.5.1.4.1.1.13.1.2";

    /** CT Image Storage - SOP Class */
    this. CTImageStorage = "1.2.840.10008.5.1.4.1.1.2";

    /** Enhanced CT Image Storage - SOP Class */
    this. EnhancedCTImageStorage = "1.2.840.10008.5.1.4.1.1.2.1";

    /** Nuclear Medicine Image Storage - SOP Class */
    this. NuclearMedicineImageStorage = "1.2.840.10008.5.1.4.1.1.20";

    /** Ultrasound Multi-frame Image Storage (Retired) - SOP Class */
    this. UltrasoundMultiframeImageStorageRetired = "1.2.840.10008.5.1.4.1.1.3";

    /** Ultrasound Multi-frame Image Storage - SOP Class */
    this. UltrasoundMultiframeImageStorage = "1.2.840.10008.5.1.4.1.1.3.1";

    /** MR Image Storage - SOP Class */
    this. MRImageStorage = "1.2.840.10008.5.1.4.1.1.4";

    /** Enhanced MR Image Storage - SOP Class */
    this. EnhancedMRImageStorage = "1.2.840.10008.5.1.4.1.1.4.1";

    /** MR Spectroscopy Storage - SOP Class */
    this. MRSpectroscopyStorage = "1.2.840.10008.5.1.4.1.1.4.2";

    /** RT Image Storage - SOP Class */
    this. RTImageStorage = "1.2.840.10008.5.1.4.1.1.481.1";

    /** RT Dose Storage - SOP Class */
    this. RTDoseStorage = "1.2.840.10008.5.1.4.1.1.481.2";

    /** RT Structure Set Storage - SOP Class */
    this. RTStructureSetStorage = "1.2.840.10008.5.1.4.1.1.481.3";

    /** RT Beams Treatment Record Storage - SOP Class */
    this. RTBeamsTreatmentRecordStorage = "1.2.840.10008.5.1.4.1.1.481.4";

    /** RT Plan Storage - SOP Class */
    this. RTPlanStorage = "1.2.840.10008.5.1.4.1.1.481.5";

    /** RT Brachy Treatment Record Storage - SOP Class */
    this. RTBrachyTreatmentRecordStorage = "1.2.840.10008.5.1.4.1.1.481.6";

    /** RT Treatment Summary Record Storage - SOP Class */
    this. RTTreatmentSummaryRecordStorage = "1.2.840.10008.5.1.4.1.1.481.7";

    /** RT Ion Plan Storage - SOP Class */
    this. RTIonPlanStorage = "1.2.840.10008.5.1.4.1.1.481.8";

    /** RT Ion Beams Treatment Record Storage - SOP Class */
    this. RTIonBeamsTreatmentRecordStorage = "1.2.840.10008.5.1.4.1.1.481.9";

    /** Nuclear Medicine Image Storage (Retired) - SOP Class */
    this. NuclearMedicineImageStorageRetired = "1.2.840.10008.5.1.4.1.1.5";

    /** Ultrasound Image Storage (Retired) - SOP Class */
    this. UltrasoundImageStorageRetired = "1.2.840.10008.5.1.4.1.1.6";

    /** Ultrasound Image Storage - SOP Class */
    this. UltrasoundImageStorage = "1.2.840.10008.5.1.4.1.1.6.1";

    /** Raw Data Storage - SOP Class */
    this. RawDataStorage = "1.2.840.10008.5.1.4.1.1.66";

    /** Spatial Registration Storage - SOP Class */
    this. SpatialRegistrationStorage = "1.2.840.10008.5.1.4.1.1.66.1";

    /** Spatial Fiducials Storage - SOP Class */
    this. SpatialFiducialsStorage = "1.2.840.10008.5.1.4.1.1.66.2";

    /** Deformable Spatial Registration Storage - SOP Class */
    this. DeformableSpatialRegistrationStorage = "1.2.840.10008.5.1.4.1.1.66.3";

    /** Segmentation Storage - SOP Class */
    this. SegmentationStorage = "1.2.840.10008.5.1.4.1.1.66.4";

    /** Real World Value Mapping Storage - SOP Class */
    this. RealWorldValueMappingStorage = "1.2.840.10008.5.1.4.1.1.67";

    /** Secondary Capture Image Storage - SOP Class */
    this. SecondaryCaptureImageStorage = "1.2.840.10008.5.1.4.1.1.7";

    /** Multi-frame Single Bit Secondary Capture Image Storage - SOP Class */
    this. MultiframeSingleBitSecondaryCaptureImageStorage = "1.2.840.10008.5.1.4.1.1.7.1";

    /** Multi-frame Grayscale Byte Secondary Capture Image Storage - SOP Class */
    this. MultiframeGrayscaleByteSecondaryCaptureImageStorage = "1.2.840.10008.5.1.4.1.1.7.2";

    /** Multi-frame Grayscale Word Secondary Capture Image Storage - SOP Class */
    this. MultiframeGrayscaleWordSecondaryCaptureImageStorage = "1.2.840.10008.5.1.4.1.1.7.3";

    /** Multi-frame True Color Secondary Capture Image Storage - SOP Class */
    this. MultiframeTrueColorSecondaryCaptureImageStorage = "1.2.840.10008.5.1.4.1.1.7.4";

    /** VL Image Storage (Retired) -  */
    this. VLImageStorageRetired = "1.2.840.10008.5.1.4.1.1.77.1";

    /** VL Endoscopic Image Storage - SOP Class */
    this. VLEndoscopicImageStorage = "1.2.840.10008.5.1.4.1.1.77.1.1";

    /** Video Endoscopic Image Storage - SOP Class */
    this. VideoEndoscopicImageStorage = "1.2.840.10008.5.1.4.1.1.77.1.1.1";

    /** VL Microscopic Image Storage - SOP Class */
    this. VLMicroscopicImageStorage = "1.2.840.10008.5.1.4.1.1.77.1.2";

    /** Video Microscopic Image Storage - SOP Class */
    this. VideoMicroscopicImageStorage = "1.2.840.10008.5.1.4.1.1.77.1.2.1";

    /** VL Slide-Coordinates Microscopic Image Storage - SOP Class */
    this. VLSlideCoordinatesMicroscopicImageStorage = "1.2.840.10008.5.1.4.1.1.77.1.3";

    /** VL Photographic Image Storage - SOP Class */
    this. VLPhotographicImageStorage = "1.2.840.10008.5.1.4.1.1.77.1.4";

    /** Video Photographic Image Storage - SOP Class */
    this. VideoPhotographicImageStorage = "1.2.840.10008.5.1.4.1.1.77.1.4.1";

    /** Ophthalmic Photography 8 Bit Image Storage - SOP Class */
    this. OphthalmicPhotography8BitImageStorage = "1.2.840.10008.5.1.4.1.1.77.1.5.1";

    /** Ophthalmic Photography 16 Bit Image Storage - SOP Class */
    this. OphthalmicPhotography16BitImageStorage = "1.2.840.10008.5.1.4.1.1.77.1.5.2";

    /** Stereometric Relationship Storage - SOP Class */
    this. StereometricRelationshipStorage = "1.2.840.10008.5.1.4.1.1.77.1.5.3";

    /** VL Multi-frame Image Storage (Retired) -  */
    this. VLMultiframeImageStorageRetired = "1.2.840.10008.5.1.4.1.1.77.2";

    /** Standalone Overlay Storage (Retired) - SOP Class */
    this. StandaloneOverlayStorageRetired = "1.2.840.10008.5.1.4.1.1.8";

    /** Basic Text SR - SOP Class */
    this. BasicTextSR = "1.2.840.10008.5.1.4.1.1.88.11";

    /** Enhanced SR - SOP Class */
    this. EnhancedSR = "1.2.840.10008.5.1.4.1.1.88.22";

    /** Comprehensive SR - SOP Class */
    this. ComprehensiveSR = "1.2.840.10008.5.1.4.1.1.88.33";

    /** Procedure Log Storage - SOP Class */
    this. ProcedureLogStorage = "1.2.840.10008.5.1.4.1.1.88.40";

    /** Mammography CAD SR - SOP Class */
    this. MammographyCADSR = "1.2.840.10008.5.1.4.1.1.88.50";

    /** Key Object Selection Document - SOP Class */
    this. KeyObjectSelectionDocument = "1.2.840.10008.5.1.4.1.1.88.59";

    /** Chest CAD SR - SOP Class */
    this. ChestCADSR = "1.2.840.10008.5.1.4.1.1.88.65";

    /** X-Ray Radiation Dose SR - SOP Class */
    this. XRayRadiationDoseSR = "1.2.840.10008.5.1.4.1.1.88.67";

    /** Standalone Curve Storage (Retired) - SOP Class */
    this. StandaloneCurveStorageRetired = "1.2.840.10008.5.1.4.1.1.9";

    /** 12-lead ECG Waveform Storage - SOP Class */
    this. _12leadECGWaveformStorage = "1.2.840.10008.5.1.4.1.1.9.1.1";

    /** General ECG Waveform Storage - SOP Class */
    this. GeneralECGWaveformStorage = "1.2.840.10008.5.1.4.1.1.9.1.2";

    /** Ambulatory ECG Waveform Storage - SOP Class */
    this. AmbulatoryECGWaveformStorage = "1.2.840.10008.5.1.4.1.1.9.1.3";

    /** Hemodynamic Waveform Storage - SOP Class */
    this. HemodynamicWaveformStorage = "1.2.840.10008.5.1.4.1.1.9.2.1";

    /** Cardiac Electrophysiology Waveform Storage - SOP Class */
    this. CardiacElectrophysiologyWaveformStorage = "1.2.840.10008.5.1.4.1.1.9.3.1";

    /** Basic Voice Audio Waveform Storage - SOP Class */
    this. BasicVoiceAudioWaveformStorage = "1.2.840.10008.5.1.4.1.1.9.4.1";

    /** Patient Root Query/Retrieve Information Model - FIND - SOP Class */
    this. PatientRootQueryRetrieveInformationModelFIND = "1.2.840.10008.5.1.4.1.2.1.1";

    /** Patient Root Query/Retrieve Information Model - MOVE - SOP Class */
    this. PatientRootQueryRetrieveInformationModelMOVE = "1.2.840.10008.5.1.4.1.2.1.2";

    /** Patient Root Query/Retrieve Information Model - GET - SOP Class */
    this. PatientRootQueryRetrieveInformationModelGET = "1.2.840.10008.5.1.4.1.2.1.3";

    /** Study Root Query/Retrieve Information Model - FIND - SOP Class */
    this. StudyRootQueryRetrieveInformationModelFIND = "1.2.840.10008.5.1.4.1.2.2.1";

    /** Study Root Query/Retrieve Information Model - MOVE - SOP Class */
    this. StudyRootQueryRetrieveInformationModelMOVE = "1.2.840.10008.5.1.4.1.2.2.2";

    /** Study Root Query/Retrieve Information Model - GET - SOP Class */
    this. StudyRootQueryRetrieveInformationModelGET = "1.2.840.10008.5.1.4.1.2.2.3";

    /** Patient/Study Only Query/Retrieve Information Model - FIND (Retired) - SOP Class */
    this. PatientStudyOnlyQueryRetrieveInformationModelFINDRetired = "1.2.840.10008.5.1.4.1.2.3.1";

    /** Patient/Study Only Query/Retrieve Information Model - MOVE (Retired) - SOP Class */
    this. PatientStudyOnlyQueryRetrieveInformationModelMOVERetired = "1.2.840.10008.5.1.4.1.2.3.2";

    /** Patient/Study Only Query/Retrieve Information Model - GET (Retired) - SOP Class */
    this. PatientStudyOnlyQueryRetrieveInformationModelGETRetired = "1.2.840.10008.5.1.4.1.2.3.3";

    /** Modality Worklist Information Model - FIND - SOP Class */
    this. ModalityWorklistInformationModelFIND = "1.2.840.10008.5.1.4.31";

    /** General Purpose Worklist Management Meta SOP Class - Meta SOP Class */
    this. GeneralPurposeWorklistManagementMetaSOPClass = "1.2.840.10008.5.1.4.32";

    /** General Purpose Worklist Information Model - FIND - SOP Class */
    this. GeneralPurposeWorklistInformationModelFIND = "1.2.840.10008.5.1.4.32.1";

    /** General Purpose Scheduled Procedure Step SOP Class - SOP Class */
    this. GeneralPurposeScheduledProcedureStepSOPClass = "1.2.840.10008.5.1.4.32.2";

    /** General Purpose Performed Procedure Step SOP Class - SOP Class */
    this. GeneralPurposePerformedProcedureStepSOPClass = "1.2.840.10008.5.1.4.32.3";

    /** Instance Availability Notification SOP Class - SOP Class */
    this. InstanceAvailabilityNotificationSOPClass = "1.2.840.10008.5.1.4.33";

    /** General Relevant Patient Information Query - SOP Class */
    this. GeneralRelevantPatientInformationQuery = "1.2.840.10008.5.1.4.37.1";

    /** Breast Imaging Relevant Patient Information Query - SOP Class */
    this. BreastImagingRelevantPatientInformationQuery = "1.2.840.10008.5.1.4.37.2";

    /** Cardiac Relevant Patient Information Query - SOP Class */
    this. CardiacRelevantPatientInformationQuery = "1.2.840.10008.5.1.4.37.3";

    /** Hanging Protocol Storage - SOP Class */
    this. HangingProtocolStorage = "1.2.840.10008.5.1.4.38.1";

    /** Hanging Protocol Information Model - FIND - SOP Class */
    this. HangingProtocolInformationModelFIND = "1.2.840.10008.5.1.4.38.2";

    /** Hanging Protocol Information Model - MOVE - SOP Class */
    this. HangingProtocolInformationModelMOVE = "1.2.840.10008.5.1.4.38.3";

    /** Siemens CSA Non-Image Storage - SOP Class */
    this. SiemensCSANonImageStorage = "1.3.12.2.1107.5.9.1";

}
