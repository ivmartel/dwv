/**
 *  Dictionary.js
 *  Version 0.5
 *  Author: BabuHussain<babuhussain.a@raster.in>
 */
function Dictionary() {
    this.newDictionary;
    this.init = function() {
        newDictionary = new Array(new Array());
        newDictionary[0x0000][0x0000] = new Array('UL', '1', 'GroupLength');
        newDictionary[0x0000][0x0001] = new Array('UL', '1',
                'CommandLengthToEnd');
        newDictionary[0x0000][0x0002] = new Array('UI', '1',
                'AffectedSOPClassUID');
        newDictionary[0x0000][0x0003] = new Array('UI', '1',
                'RequestedSOPClassUID');
        newDictionary[0x0000][0x0010] = new Array('CS', '1',
                'CommandRecognitionCode');
        newDictionary[0x0000][0x0100] = new Array('US', '1', 'CommandField');
        newDictionary[0x0000][0x0110] = new Array('US', '1', 'MessageID');
        newDictionary[0x0000][0x0120] = new Array('US', '1',
                'MessageIDBeingRespondedTo');
        newDictionary[0x0000][0x0200] = new Array('AE', '1', 'Initiator');
        newDictionary[0x0000][0x0300] = new Array('AE', '1', 'Receiver');
        newDictionary[0x0000][0x0400] = new Array('AE', '1', 'FindLocation');
        newDictionary[0x0000][0x0600] = new Array('AE', '1', 'MoveDestination');
        newDictionary[0x0000][0x0700] = new Array('US', '1', 'Priority');
        newDictionary[0x0000][0x0800] = new Array('US', '1', 'DataSetType');
        newDictionary[0x0000][0x0850] = new Array('US', '1', 'NumberOfMatches');
        newDictionary[0x0000][0x0860] = new Array('US', '1',
                'ResponseSequenceNumber');
        newDictionary[0x0000][0x0900] = new Array('US', '1', 'Status');
        newDictionary[0x0000][0x0901] = new Array('AT', '1-n',
                'OffendingElement');
        newDictionary[0x0000][0x0902] = new Array('LO', '1', 'ErrorComment');
        newDictionary[0x0000][0x0903] = new Array('US', '1', 'ErrorID');
        newDictionary[0x0000][0x0904] = new Array('OT', '1-n',
                'ErrorInformation');
        newDictionary[0x0000][0x1000] = new Array('UI', '1',
                'AffectedSOPInstanceUID');
        newDictionary[0x0000][0x1001] = new Array('UI', '1',
                'RequestedSOPInstanceUID');
        newDictionary[0x0000][0x1002] = new Array('US', '1', 'EventTypeID');
        newDictionary[0x0000][0x1003] = new Array('OT', '1-n',
                'EventInformation');
        newDictionary[0x0000][0x1005] = new Array('AT', '1-n',
                'AttributeIdentifierList');
        newDictionary[0x0000][0x1007] = new Array('AT', '1-n',
                'ModificationList');
        newDictionary[0x0000][0x1008] = new Array('US', '1', 'ActionTypeID');
        newDictionary[0x0000][0x1009] = new Array('OT', '1-n',
                'ActionInformation');
        newDictionary[0x0000][0x1013] = new Array('UI', '1-n',
                'SuccessfulSOPInstanceUIDList');
        newDictionary[0x0000][0x1014] = new Array('UI', '1-n',
                'FailedSOPInstanceUIDList');
        newDictionary[0x0000][0x1015] = new Array('UI', '1-n',
                'WarningSOPInstanceUIDList');
        newDictionary[0x0000][0x1020] = new Array('US', '1',
                'NumberOfRemainingSuboperations');
        newDictionary[0x0000][0x1021] = new Array('US', '1',
                'NumberOfCompletedSuboperations');
        newDictionary[0x0000][0x1022] = new Array('US', '1',
                'NumberOfFailedSuboperations');
        newDictionary[0x0000][0x1023] = new Array('US', '1',
                'NumberOfWarningSuboperations');
        newDictionary[0x0000][0x1030] = new Array('AE', '1',
                'MoveOriginatorApplicationEntityTitle');
        newDictionary[0x0000][0x1031] = new Array('US', '1',
                'MoveOriginatorMessageID');
        newDictionary[0x0000][0x4000] = new Array('AT', '1', 'DialogReceiver');
        newDictionary[0x0000][0x4010] = new Array('AT', '1', 'TerminalType');
        newDictionary[0x0000][0x5010] = new Array('SH', '1', 'MessageSetID');
        newDictionary[0x0000][0x5020] = new Array('SH', '1', 'EndMessageSet');
        newDictionary[0x0000][0x5110] = new Array('AT', '1', 'DisplayFormat');
        newDictionary[0x0000][0x5120] = new Array('AT', '1', 'PagePositionID');
        newDictionary[0x0000][0x5130] = new Array('CS', '1', 'TextFormatID');
        newDictionary[0x0000][0x5140] = new Array('CS', '1', 'NormalReverse');
        newDictionary[0x0000][0x5150] = new Array('CS', '1', 'AddGrayScale');
        newDictionary[0x0000][0x5160] = new Array('CS', '1', 'Borders');
        newDictionary[0x0000][0x5170] = new Array('IS', '1', 'Copies');
        newDictionary[0x0000][0x5180] = new Array('CS', '1',
                'OldMagnificationType');
        newDictionary[0x0000][0x5190] = new Array('CS', '1', 'Erase');
        newDictionary[0x0000][0x51A0] = new Array('CS', '1', 'Print');
        newDictionary[0x0000][0x51B0] = new Array('US', '1-n', 'Overlays');

        newDictionary[0x0002] = new Array();
        newDictionary[0x0002][0x0000] = new Array('UL', '1',
                'MetaElementGroupLength');
        newDictionary[0x0002][0x0001] = new Array('OB', '1',
                'FileMetaInformationVersion');
        newDictionary[0x0002][0x0002] = new Array('UI', '1',
                'MediaStorageSOPClassUID');
        newDictionary[0x0002][0x0003] = new Array('UI', '1',
                'MediaStorageSOPInstanceUID');
        newDictionary[0x0002][0x0010] = new Array('UI', '1',
                'TransferSyntaxUID');
        newDictionary[0x0002][0x0012] = new Array('UI', '1',
                'ImplementationClassUID');
        newDictionary[0x0002][0x0013] = new Array('SH', '1',
                'ImplementationVersionName');
        newDictionary[0x0002][0x0016] = new Array('AE', '1',
                'SourceApplicationEntityTitle');
        newDictionary[0x0002][0x0100] = new Array('UI', '1',
                'PrivateInformationCreatorUID');
        newDictionary[0x0002][0x0102] = new Array('OB', '1',
                'PrivateInformation');

        newDictionary[0x0004] = new Array();
        newDictionary[0x0004][0x0000] = new Array('UL', '1',
                'FileSetGroupLength');
        newDictionary[0x0004][0x1130] = new Array('CS', '1', 'FileSetID');
        newDictionary[0x0004][0x1141] = new Array('CS', '8',
                'FileSetDescriptorFileID');
        newDictionary[0x0004][0x1142] = new Array('CS', '1',
                'FileSetCharacterSet');
        newDictionary[0x0004][0x1200] = new Array('UL', '1',
                'RootDirectoryFirstRecord');
        newDictionary[0x0004][0x1202] = new Array('UL', '1',
                'RootDirectoryLastRecord');
        newDictionary[0x0004][0x1212] = new Array('US', '1',
                'FileSetConsistencyFlag');
        newDictionary[0x0004][0x1220] = new Array('SQ', '1',
                'DirectoryRecordSequence');
        newDictionary[0x0004][0x1400] = new Array('UL', '1',
                'NextDirectoryRecordOffset');
        newDictionary[0x0004][0x1410] = new Array('US', '1', 'RecordInUseFlag');
        newDictionary[0x0004][0x1420] = new Array('UL', '1',
                'LowerLevelDirectoryOffset');
        newDictionary[0x0004][0x1430] = new Array('CS', '1',
                'DirectoryRecordType');
        newDictionary[0x0004][0x1432] = new Array('UI', '1', 'PrivateRecordUID');
        newDictionary[0x0004][0x1500] = new Array('CS', '8', 'ReferencedFileID');
        newDictionary[0x0004][0x1504] = new Array('UL', '1',
                'DirectoryRecordOffset');
        newDictionary[0x0004][0x1510] = new Array('UI', '1',
                'ReferencedSOPClassUIDInFile');
        newDictionary[0x0004][0x1511] = new Array('UI', '1',
                'ReferencedSOPInstanceUIDInFile');
        newDictionary[0x0004][0x1512] = new Array('UI', '1',
                'ReferencedTransferSyntaxUIDInFile');
        newDictionary[0x0004][0x1600] = new Array('UL', '1',
                'NumberOfReferences');

        newDictionary[0x0008] = new Array();
        newDictionary[0x0008][0x0000] = new Array('UL', '1',
                'IdentifyingGroupLength');
        newDictionary[0x0008][0x0001] = new Array('UL', '1', 'LengthToEnd');
        newDictionary[0x0008][0x0005] = new Array('CS', '1',
                'SpecificCharacterSet');
        newDictionary[0x0008][0x0008] = new Array('CS', '1-n', 'ImageType');
        newDictionary[0x0008][0x000A] = new Array('US', '1',
                'SequenceItemNumber');
        newDictionary[0x0008][0x0010] = new Array('CS', '1', 'RecognitionCode');
        newDictionary[0x0008][0x0012] = new Array('DA', '1',
                'InstanceCreationDate');
        newDictionary[0x0008][0x0013] = new Array('TM', '1',
                'InstanceCreationTime');
        newDictionary[0x0008][0x0014] = new Array('UI', '1',
                'InstanceCreatorUID');
        newDictionary[0x0008][0x0016] = new Array('UI', '1', 'SOPClassUID');
        newDictionary[0x0008][0x0018] = new Array('UI', '1', 'SOPInstanceUID');
        newDictionary[0x0008][0x0020] = new Array('DA', '1', 'StudyDate');
        newDictionary[0x0008][0x0021] = new Array('DA', '1', 'SeriesDate');
        newDictionary[0x0008][0x0022] = new Array('DA', '1', 'AcquisitionDate');
        newDictionary[0x0008][0x0023] = new Array('DA', '1', 'ImageDate');
        /* newDictionary[0x0008][0x0023] = new Array('DA','1','ContentDate'); */
        newDictionary[0x0008][0x0024] = new Array('DA', '1', 'OverlayDate');
        newDictionary[0x0008][0x0025] = new Array('DA', '1', 'CurveDate');
        newDictionary[0x0008][0x002A] = new Array('DT', '1',
                'AcquisitionDatetime');
        newDictionary[0x0008][0x0030] = new Array('TM', '1', 'StudyTime');
        newDictionary[0x0008][0x0031] = new Array('TM', '1', 'SeriesTime');
        newDictionary[0x0008][0x0032] = new Array('TM', '1', 'AcquisitionTime');
        newDictionary[0x0008][0x0033] = new Array('TM', '1', 'ImageTime');
        newDictionary[0x0008][0x0034] = new Array('TM', '1', 'OverlayTime');
        newDictionary[0x0008][0x0035] = new Array('TM', '1', 'CurveTime');
        newDictionary[0x0008][0x0040] = new Array('US', '1', 'OldDataSetType');
        newDictionary[0x0008][0x0041] = new Array('LT', '1',
                'OldDataSetSubtype');
        newDictionary[0x0008][0x0042] = new Array('CS', '1',
                'NuclearMedicineSeriesType');
        newDictionary[0x0008][0x0050] = new Array('SH', '1', 'AccessionNumber');
        newDictionary[0x0008][0x0052] = new Array('CS', '1',
                'QueryRetrieveLevel');
        newDictionary[0x0008][0x0054] = new Array('AE', '1-n',
                'RetrieveAETitle');
        newDictionary[0x0008][0x0058] = new Array('UI', '1-n',
                'DataSetFailedSOPInstanceUIDList');
        newDictionary[0x0008][0x0060] = new Array('CS', '1', 'Modality');
        newDictionary[0x0008][0x0061] = new Array('CS', '1-n',
                'ModalitiesInStudy');
        newDictionary[0x0008][0x0064] = new Array('CS', '1', 'ConversionType');
        newDictionary[0x0008][0x0068] = new Array('CS', '1',
                'PresentationIntentType');
        newDictionary[0x0008][0x0070] = new Array('LO', '1', 'Manufacturer');
        newDictionary[0x0008][0x0080] = new Array('LO', '1', 'InstitutionName');
        newDictionary[0x0008][0x0081] = new Array('ST', '1',
                'InstitutionAddress');
        newDictionary[0x0008][0x0082] = new Array('SQ', '1',
                'InstitutionCodeSequence');
        newDictionary[0x0008][0x0090] = new Array('PN', '1',
                'ReferringPhysicianName');
        newDictionary[0x0008][0x0092] = new Array('ST', '1',
                'ReferringPhysicianAddress');
        newDictionary[0x0008][0x0094] = new Array('SH', '1-n',
                'ReferringPhysicianTelephoneNumber');
        newDictionary[0x0008][0x0100] = new Array('SH', '1', 'CodeValue');
        newDictionary[0x0008][0x0102] = new Array('SH', '1',
                'CodingSchemeDesignator');
        newDictionary[0x0008][0x0103] = new Array('SH', '1',
                'CodingSchemeVersion');
        newDictionary[0x0008][0x0104] = new Array('LO', '1', 'CodeMeaning');
        newDictionary[0x0008][0x0105] = new Array('CS', '1', 'MappingResource');
        newDictionary[0x0008][0x0106] = new Array('DT', '1',
                'ContextGroupVersion');
        newDictionary[0x0008][0x0107] = new Array('DT', '1',
                'ContextGroupLocalVersion');
        newDictionary[0x0008][0x010B] = new Array('CS', '1',
                'CodeSetExtensionFlag');
        newDictionary[0x0008][0x010C] = new Array('UI', '1',
                'PrivateCodingSchemeCreatorUID');
        newDictionary[0x0008][0x010D] = new Array('UI', '1',
                'CodeSetExtensionCreatorUID');
        newDictionary[0x0008][0x010F] = new Array('CS', '1',
                'ContextIdentifier');
        newDictionary[0x0008][0x0201] = new Array('SH', '1',
                'TimezoneOffsetFromUTC');
        newDictionary[0x0008][0x1000] = new Array('AE', '1', 'NetworkID');
        newDictionary[0x0008][0x1010] = new Array('SH', '1', 'StationName');
        newDictionary[0x0008][0x1030] = new Array('LO', '1', 'StudyDescription');
        newDictionary[0x0008][0x1032] = new Array('SQ', '1',
                'ProcedureCodeSequence');
        newDictionary[0x0008][0x103E] = new Array('LO', '1',
                'SeriesDescription');
        newDictionary[0x0008][0x1040] = new Array('LO', '1',
                'InstitutionalDepartmentName');
        newDictionary[0x0008][0x1048] = new Array('PN', '1-n',
                'PhysicianOfRecord');
        newDictionary[0x0008][0x1050] = new Array('PN', '1-n',
                'PerformingPhysicianName');
        newDictionary[0x0008][0x1060] = new Array('PN', '1-n',
                'PhysicianReadingStudy');
        newDictionary[0x0008][0x1070] = new Array('PN', '1-n', 'OperatorName');
        newDictionary[0x0008][0x1080] = new Array('LO', '1-n',
                'AdmittingDiagnosisDescription');
        newDictionary[0x0008][0x1084] = new Array('SQ', '1',
                'AdmittingDiagnosisCodeSequence');
        newDictionary[0x0008][0x1090] = new Array('LO', '1',
                'ManufacturerModelName');
        newDictionary[0x0008][0x1100] = new Array('SQ', '1',
                'ReferencedResultsSequence');
        newDictionary[0x0008][0x1110] = new Array('SQ', '1',
                'ReferencedStudySequence');
        newDictionary[0x0008][0x1111] = new Array('SQ', '1',
                'ReferencedStudyComponentSequence');
        newDictionary[0x0008][0x1115] = new Array('SQ', '1',
                'ReferencedSeriesSequence');
        newDictionary[0x0008][0x1120] = new Array('SQ', '1',
                'ReferencedPatientSequence');
        newDictionary[0x0008][0x1125] = new Array('SQ', '1',
                'ReferencedVisitSequence');
        newDictionary[0x0008][0x1130] = new Array('SQ', '1',
                'ReferencedOverlaySequence');
        newDictionary[0x0008][0x1140] = new Array('SQ', '1',
                'ReferencedImageSequence');
        newDictionary[0x0008][0x1145] = new Array('SQ', '1',
                'ReferencedCurveSequence');
        newDictionary[0x0008][0x114A] = new Array('SQ', '1',
                'ReferencedInstanceSequence');
        newDictionary[0x0008][0x114B] = new Array('LO', '1',
                'ReferenceDescription');
        newDictionary[0x0008][0x1150] = new Array('UI', '1',
                'ReferencedSOPClassUID');
        newDictionary[0x0008][0x1155] = new Array('UI', '1',
                'ReferencedSOPInstanceUID');
        newDictionary[0x0008][0x115A] = new Array('UI', '1-n',
                'SOPClassesSupported');
        newDictionary[0x0008][0x1160] = new Array('IS', '1',
                'ReferencedFrameNumber');
        newDictionary[0x0008][0x1195] = new Array('UI', '1', 'TransactionUID');
        newDictionary[0x0008][0x1197] = new Array('US', '1', 'FailureReason');
        newDictionary[0x0008][0x1198] = new Array('SQ', '1',
                'FailedSOPSequence');
        newDictionary[0x0008][0x1199] = new Array('SQ', '1',
                'ReferencedSOPSequence');
        newDictionary[0x0008][0x2110] = new Array('CS', '1',
                'LossyImageCompression');
        newDictionary[0x0008][0x2111] = new Array('ST', '1',
                'DerivationDescription');
        newDictionary[0x0008][0x2112] = new Array('SQ', '1',
                'SourceImageSequence');
        newDictionary[0x0008][0x2120] = new Array('SH', '1', 'StageName');
        newDictionary[0x0008][0x2122] = new Array('IS', '1', 'StageNumber');
        newDictionary[0x0008][0x2124] = new Array('IS', '1', 'NumberOfStages');
        newDictionary[0x0008][0x2128] = new Array('IS', '1', 'ViewNumber');
        newDictionary[0x0008][0x2129] = new Array('IS', '1',
                'NumberOfEventTimers');
        newDictionary[0x0008][0x212A] = new Array('IS', '1',
                'NumberOfViewsInStage');
        newDictionary[0x0008][0x2130] = new Array('DS', '1-n',
                'EventElapsedTime');
        newDictionary[0x0008][0x2132] = new Array('LO', '1-n', 'EventTimerName');
        newDictionary[0x0008][0x2142] = new Array('IS', '1', 'StartTrim');
        newDictionary[0x0008][0x2143] = new Array('IS', '1', 'StopTrim');
        newDictionary[0x0008][0x2144] = new Array('IS', '1',
                'RecommendedDisplayFrameRate');
        newDictionary[0x0008][0x2200] = new Array('CS', '1',
                'TransducerPosition');
        newDictionary[0x0008][0x2204] = new Array('CS', '1',
                'TransducerOrientation');
        newDictionary[0x0008][0x2208] = new Array('CS', '1',
                'AnatomicStructure');
        newDictionary[0x0008][0x2218] = new Array('SQ', '1',
                'AnatomicRegionSequence');
        newDictionary[0x0008][0x2220] = new Array('SQ', '1',
                'AnatomicRegionModifierSequence');
        newDictionary[0x0008][0x2228] = new Array('SQ', '1',
                'PrimaryAnatomicStructureSequence');
        newDictionary[0x0008][0x2229] = new Array('SQ', '1',
                'AnatomicStructureSpaceOrRegionSequence');
        newDictionary[0x0008][0x2230] = new Array('SQ', '1',
                'PrimaryAnatomicStructureModifierSequence');
        newDictionary[0x0008][0x2240] = new Array('SQ', '1',
                'TransducerPositionSequence');
        newDictionary[0x0008][0x2242] = new Array('SQ', '1',
                'TransducerPositionModifierSequence');
        newDictionary[0x0008][0x2244] = new Array('SQ', '1',
                'TransducerOrientationSequence');
        newDictionary[0x0008][0x2246] = new Array('SQ', '1',
                'TransducerOrientationModifierSequence');
        newDictionary[0x0008][0x4000] = new Array('LT', '1-n',
                'IdentifyingComments');

        newDictionary[0x0010] = new Array();
        newDictionary[0x0010][0x0000] = new Array('UL', '1',
                'PatientGroupLength');
        newDictionary[0x0010][0x0010] = new Array('PN', '1', 'PatientName');
        newDictionary[0x0010][0x0020] = new Array('LO', '1', 'PatientID');
        newDictionary[0x0010][0x0021] = new Array('LO', '1',
                'IssuerOfPatientID');
        newDictionary[0x0010][0x0030] = new Array('DA', '1', 'PatientBirthDate');
        newDictionary[0x0010][0x0032] = new Array('TM', '1', 'PatientBirthTime');
        newDictionary[0x0010][0x0040] = new Array('CS', '1', 'PatientSex');
        newDictionary[0x0010][0x0050] = new Array('SQ', '1',
                'PatientInsurancePlanCodeSequence');
        newDictionary[0x0010][0x1000] = new Array('LO', '1-n', 'OtherPatientID');
        newDictionary[0x0010][0x1001] = new Array('PN', '1-n',
                'OtherPatientName');
        newDictionary[0x0010][0x1005] = new Array('PN', '1', 'PatientBirthName');
        newDictionary[0x0010][0x1010] = new Array('AS', '1', 'PatientAge');
        newDictionary[0x0010][0x1020] = new Array('DS', '1', 'PatientSize');
        newDictionary[0x0010][0x1030] = new Array('DS', '1', 'PatientWeight');
        newDictionary[0x0010][0x1040] = new Array('LO', '1', 'PatientAddress');
        newDictionary[0x0010][0x1050] = new Array('LT', '1-n',
                'InsurancePlanIdentification');
        newDictionary[0x0010][0x1060] = new Array('PN', '1',
                'PatientMotherBirthName');
        newDictionary[0x0010][0x1080] = new Array('LO', '1', 'MilitaryRank');
        newDictionary[0x0010][0x1081] = new Array('LO', '1', 'BranchOfService');
        newDictionary[0x0010][0x1090] = new Array('LO', '1',
                'MedicalRecordLocator');
        newDictionary[0x0010][0x2000] = new Array('LO', '1-n', 'MedicalAlerts');
        newDictionary[0x0010][0x2110] = new Array('LO', '1-n',
                'ContrastAllergies');
        newDictionary[0x0010][0x2150] = new Array('LO', '1',
                'CountryOfResidence');
        newDictionary[0x0010][0x2152] = new Array('LO', '1',
                'RegionOfResidence');
        newDictionary[0x0010][0x2154] = new Array('SH', '1-n',
                'PatientTelephoneNumber');
        newDictionary[0x0010][0x2160] = new Array('SH', '1', 'EthnicGroup');
        newDictionary[0x0010][0x2180] = new Array('SH', '1', 'Occupation');
        newDictionary[0x0010][0x21A0] = new Array('CS', '1', 'SmokingStatus');
        newDictionary[0x0010][0x21B0] = new Array('LT', '1',
                'AdditionalPatientHistory');
        newDictionary[0x0010][0x21C0] = new Array('US', '1', 'PregnancyStatus');
        newDictionary[0x0010][0x21D0] = new Array('DA', '1',
                'LastMenstrualDate');
        newDictionary[0x0010][0x21F0] = new Array('LO', '1',
                'PatientReligiousPreference');
        newDictionary[0x0010][0x4000] = new Array('LT', '1', 'PatientComments');

        newDictionary[0x0018] = new Array();
        newDictionary[0x0018][0x0000] = new Array('UL', '1',
                'AcquisitionGroupLength');
        newDictionary[0x0018][0x0010] = new Array('LO', '1',
                'ContrastBolusAgent');
        newDictionary[0x0018][0x0012] = new Array('SQ', '1',
                'ContrastBolusAgentSequence');
        newDictionary[0x0018][0x0014] = new Array('SQ', '1',
                'ContrastBolusAdministrationRouteSequence');
        newDictionary[0x0018][0x0015] = new Array('CS', '1', 'BodyPartExamined');
        newDictionary[0x0018][0x0020] = new Array('CS', '1-n',
                'ScanningSequence');
        newDictionary[0x0018][0x0021] = new Array('CS', '1-n',
                'SequenceVariant');
        newDictionary[0x0018][0x0022] = new Array('CS', '1-n', 'ScanOptions');
        newDictionary[0x0018][0x0023] = new Array('CS', '1',
                'MRAcquisitionType');
        newDictionary[0x0018][0x0024] = new Array('SH', '1', 'SequenceName');
        newDictionary[0x0018][0x0025] = new Array('CS', '1', 'AngioFlag');
        newDictionary[0x0018][0x0026] = new Array('SQ', '1',
                'InterventionDrugInformationSequence');
        newDictionary[0x0018][0x0027] = new Array('TM', '1',
                'InterventionDrugStopTime');
        newDictionary[0x0018][0x0028] = new Array('DS', '1',
                'InterventionDrugDose');
        newDictionary[0x0018][0x0029] = new Array('SQ', '1',
                'InterventionalDrugSequence');
        newDictionary[0x0018][0x002A] = new Array('SQ', '1',
                'AdditionalDrugSequence');
        newDictionary[0x0018][0x0030] = new Array('LO', '1-n', 'Radionuclide');
        newDictionary[0x0018][0x0031] = new Array('LO', '1-n',
                'Radiopharmaceutical');
        newDictionary[0x0018][0x0032] = new Array('DS', '1',
                'EnergyWindowCenterline');
        newDictionary[0x0018][0x0033] = new Array('DS', '1-n',
                'EnergyWindowTotalWidth');
        newDictionary[0x0018][0x0034] = new Array('LO', '1',
                'InterventionalDrugName');
        newDictionary[0x0018][0x0035] = new Array('TM', '1',
                'InterventionalDrugStartTime');
        newDictionary[0x0018][0x0036] = new Array('SQ', '1',
                'InterventionalTherapySequence');
        newDictionary[0x0018][0x0037] = new Array('CS', '1', 'TherapyType');
        newDictionary[0x0018][0x0038] = new Array('CS', '1',
                'InterventionalStatus');
        newDictionary[0x0018][0x0039] = new Array('CS', '1',
                'TherapyDescription');
        newDictionary[0x0018][0x0040] = new Array('IS', '1', 'CineRate');
        newDictionary[0x0018][0x0050] = new Array('DS', '1', 'SliceThickness');
        newDictionary[0x0018][0x0060] = new Array('DS', '1', 'KVP');
        newDictionary[0x0018][0x0070] = new Array('IS', '1',
                'CountsAccumulated');
        newDictionary[0x0018][0x0071] = new Array('CS', '1',
                'AcquisitionTerminationCondition');
        newDictionary[0x0018][0x0072] = new Array('DS', '1',
                'EffectiveSeriesDuration');
        newDictionary[0x0018][0x0073] = new Array('CS', '1',
                'AcquisitionStartCondition');
        newDictionary[0x0018][0x0074] = new Array('IS', '1',
                'AcquisitionStartConditionData');
        newDictionary[0x0018][0x0075] = new Array('IS', '1',
                'AcquisitionTerminationConditionData');
        newDictionary[0x0018][0x0080] = new Array('DS', '1', 'RepetitionTime');
        newDictionary[0x0018][0x0081] = new Array('DS', '1', 'EchoTime');
        newDictionary[0x0018][0x0082] = new Array('DS', '1', 'InversionTime');
        newDictionary[0x0018][0x0083] = new Array('DS', '1', 'NumberOfAverages');
        newDictionary[0x0018][0x0084] = new Array('DS', '1', 'ImagingFrequency');
        newDictionary[0x0018][0x0085] = new Array('SH', '1', 'ImagedNucleus');
        newDictionary[0x0018][0x0086] = new Array('IS', '1-n', 'EchoNumber');
        newDictionary[0x0018][0x0087] = new Array('DS', '1',
                'MagneticFieldStrength');
        newDictionary[0x0018][0x0088] = new Array('DS', '1',
                'SpacingBetweenSlices');
        newDictionary[0x0018][0x0089] = new Array('IS', '1',
                'NumberOfPhaseEncodingSteps');
        newDictionary[0x0018][0x0090] = new Array('DS', '1',
                'DataCollectionDiameter');
        newDictionary[0x0018][0x0091] = new Array('IS', '1', 'EchoTrainLength');
        newDictionary[0x0018][0x0093] = new Array('DS', '1', 'PercentSampling');
        newDictionary[0x0018][0x0094] = new Array('DS', '1',
                'PercentPhaseFieldOfView');
        newDictionary[0x0018][0x0095] = new Array('DS', '1', 'PixelBandwidth');
        newDictionary[0x0018][0x1000] = new Array('LO', '1',
                'DeviceSerialNumber');
        newDictionary[0x0018][0x1002] = new Array('UI', '1', 'DeviceUID');
        newDictionary[0x0018][0x1003] = new Array('LO', '1', 'DeviceID');
        newDictionary[0x0018][0x1004] = new Array('LO', '1', 'PlateID');
        newDictionary[0x0018][0x1005] = new Array('LO', '1', 'GeneratorID');
        newDictionary[0x0018][0x1006] = new Array('LO', '1', 'GridID');
        newDictionary[0x0018][0x1007] = new Array('LO', '1', 'CassetteID');
        newDictionary[0x0018][0x1008] = new Array('LO', '1', 'GantryID');
        newDictionary[0x0018][0x1010] = new Array('LO', '1',
                'SecondaryCaptureDeviceID');
        newDictionary[0x0018][0x1011] = new Array('LO', '1',
                'HardcopyCreationDeviceID');
        newDictionary[0x0018][0x1012] = new Array('DA', '1',
                'DateOfSecondaryCapture');
        newDictionary[0x0018][0x1014] = new Array('TM', '1',
                'TimeOfSecondaryCapture');
        newDictionary[0x0018][0x1016] = new Array('LO', '1',
                'SecondaryCaptureDeviceManufacturer');
        newDictionary[0x0018][0x1017] = new Array('LO', '1',
                'HardcopyDeviceManufacturer');
        newDictionary[0x0018][0x1018] = new Array('LO', '1',
                'SecondaryCaptureDeviceManufacturerModelName');
        newDictionary[0x0018][0x1019] = new Array('LO', '1-n',
                'SecondaryCaptureDeviceSoftwareVersion');
        newDictionary[0x0018][0x101A] = new Array('LO', '1-n',
                'HardcopyDeviceSoftwareVersion');
        newDictionary[0x0018][0x101B] = new Array('LO', '1',
                'HardcopyDeviceManfuacturersModelName');
        newDictionary[0x0018][0x1020] = new Array('LO', '1-n',
                'SoftwareVersion');
        newDictionary[0x0018][0x1022] = new Array('SH', '1',
                'VideoImageFormatAcquired');
        newDictionary[0x0018][0x1023] = new Array('LO', '1',
                'DigitalImageFormatAcquired');
        newDictionary[0x0018][0x1030] = new Array('LO', '1', 'ProtocolName');
        newDictionary[0x0018][0x1040] = new Array('LO', '1',
                'ContrastBolusRoute');
        newDictionary[0x0018][0x1041] = new Array('DS', '1',
                'ContrastBolusVolume');
        newDictionary[0x0018][0x1042] = new Array('TM', '1',
                'ContrastBolusStartTime');
        newDictionary[0x0018][0x1043] = new Array('TM', '1',
                'ContrastBolusStopTime');
        newDictionary[0x0018][0x1044] = new Array('DS', '1',
                'ContrastBolusTotalDose');
        newDictionary[0x0018][0x1045] = new Array('IS', '1-n', 'SyringeCounts');
        newDictionary[0x0018][0x1046] = new Array('DS', '1-n',
                'ContrastFlowRate');
        newDictionary[0x0018][0x1047] = new Array('DS', '1-n',
                'ContrastFlowDuration');
        newDictionary[0x0018][0x1048] = new Array('CS', '1',
                'ContrastBolusIngredient');
        newDictionary[0x0018][0x1049] = new Array('DS', '1',
                'ContrastBolusIngredientConcentration');
        newDictionary[0x0018][0x1050] = new Array('DS', '1',
                'SpatialResolution');
        newDictionary[0x0018][0x1060] = new Array('DS', '1', 'TriggerTime');
        newDictionary[0x0018][0x1061] = new Array('LO', '1',
                'TriggerSourceOrType');
        newDictionary[0x0018][0x1062] = new Array('IS', '1', 'NominalInterval');
        newDictionary[0x0018][0x1063] = new Array('DS', '1', 'FrameTime');
        newDictionary[0x0018][0x1064] = new Array('LO', '1', 'FramingType');
        newDictionary[0x0018][0x1065] = new Array('DS', '1-n',
                'FrameTimeVector');
        newDictionary[0x0018][0x1066] = new Array('DS', '1', 'FrameDelay');
        newDictionary[0x0018][0x1067] = new Array('DS', '1',
                'ImageTriggerDelay');
        newDictionary[0x0018][0x1068] = new Array('DS', '1',
                'MultiplexGroupTimeOffset');
        newDictionary[0x0018][0x1069] = new Array('DS', '1',
                'TriggerTimeOffset');
        newDictionary[0x0018][0x106A] = new Array('CS', '1',
                'SynchronizationTrigger');
        newDictionary[0x0018][0x106C] = new Array('US', '2',
                'SynchronizationChannel');
        newDictionary[0x0018][0x106E] = new Array('UL', '1',
                'TriggerSamplePosition');
        newDictionary[0x0018][0x1070] = new Array('LO', '1-n',
                'RadionuclideRoute');
        newDictionary[0x0018][0x1071] = new Array('DS', '1-n',
                'RadionuclideVolume');
        newDictionary[0x0018][0x1072] = new Array('TM', '1-n',
                'RadionuclideStartTime');
        newDictionary[0x0018][0x1073] = new Array('TM', '1-n',
                'RadionuclideStopTime');
        newDictionary[0x0018][0x1074] = new Array('DS', '1-n',
                'RadionuclideTotalDose');
        newDictionary[0x0018][0x1075] = new Array('DS', '1',
                'RadionuclideHalfLife');
        newDictionary[0x0018][0x1076] = new Array('DS', '1',
                'RadionuclidePositronFraction');
        newDictionary[0x0018][0x1077] = new Array('DS', '1',
                'RadiopharmaceuticalSpecificActivity');
        newDictionary[0x0018][0x1080] = new Array('CS', '1',
                'BeatRejectionFlag');
        newDictionary[0x0018][0x1081] = new Array('IS', '1', 'LowRRValue');
        newDictionary[0x0018][0x1082] = new Array('IS', '1', 'HighRRValue');
        newDictionary[0x0018][0x1083] = new Array('IS', '1',
                'IntervalsAcquired');
        newDictionary[0x0018][0x1084] = new Array('IS', '1',
                'IntervalsRejected');
        newDictionary[0x0018][0x1085] = new Array('LO', '1', 'PVCRejection');
        newDictionary[0x0018][0x1086] = new Array('IS', '1', 'SkipBeats');
        newDictionary[0x0018][0x1088] = new Array('IS', '1', 'HeartRate');
        newDictionary[0x0018][0x1090] = new Array('IS', '1',
                'CardiacNumberOfImages');
        newDictionary[0x0018][0x1094] = new Array('IS', '1', 'TriggerWindow');
        newDictionary[0x0018][0x1100] = new Array('DS', '1',
                'ReconstructionDiameter');
        newDictionary[0x0018][0x1110] = new Array('DS', '1',
                'DistanceSourceToDetector');
        newDictionary[0x0018][0x1111] = new Array('DS', '1',
                'DistanceSourceToPatient');
        newDictionary[0x0018][0x1114] = new Array('DS', '1',
                'EstimatedRadiographicMagnificationFactor');
        newDictionary[0x0018][0x1120] = new Array('DS', '1',
                'GantryDetectorTilt');
        newDictionary[0x0018][0x1121] = new Array('DS', '1',
                'GantryDetectorSlew');
        newDictionary[0x0018][0x1130] = new Array('DS', '1', 'TableHeight');
        newDictionary[0x0018][0x1131] = new Array('DS', '1', 'TableTraverse');
        newDictionary[0x0018][0x1134] = new Array('DS', '1', 'TableMotion');
        newDictionary[0x0018][0x1135] = new Array('DS', '1-n',
                'TableVerticalIncrement');
        newDictionary[0x0018][0x1136] = new Array('DS', '1-n',
                'TableLateralIncrement');
        newDictionary[0x0018][0x1137] = new Array('DS', '1-n',
                'TableLongitudinalIncrement');
        newDictionary[0x0018][0x1138] = new Array('DS', '1', 'TableAngle');
        newDictionary[0x0018][0x113A] = new Array('CS', '1', 'TableType');
        newDictionary[0x0018][0x1140] = new Array('CS', '1',
                'RotationDirection');
        newDictionary[0x0018][0x1141] = new Array('DS', '1', 'AngularPosition');
        newDictionary[0x0018][0x1142] = new Array('DS', '1-n', 'RadialPosition');
        newDictionary[0x0018][0x1143] = new Array('DS', '1', 'ScanArc');
        newDictionary[0x0018][0x1144] = new Array('DS', '1', 'AngularStep');
        newDictionary[0x0018][0x1145] = new Array('DS', '1',
                'CenterOfRotationOffset');
        newDictionary[0x0018][0x1146] = new Array('DS', '1-n', 'RotationOffset');
        newDictionary[0x0018][0x1147] = new Array('CS', '1', 'FieldOfViewShape');
        newDictionary[0x0018][0x1149] = new Array('IS', '2',
                'FieldOfViewDimension');
        newDictionary[0x0018][0x1150] = new Array('IS', '1', 'ExposureTime');
        newDictionary[0x0018][0x1151] = new Array('IS', '1', 'XrayTubeCurrent');
        newDictionary[0x0018][0x1152] = new Array('IS', '1', 'Exposure');
        newDictionary[0x0018][0x1153] = new Array('IS', '1', 'ExposureinuAs');
        newDictionary[0x0018][0x1154] = new Array('DS', '1',
                'AveragePulseWidth');
        newDictionary[0x0018][0x1155] = new Array('CS', '1', 'RadiationSetting');
        newDictionary[0x0018][0x1156] = new Array('CS', '1',
                'RectificationType');
        newDictionary[0x0018][0x115A] = new Array('CS', '1', 'RadiationMode');
        newDictionary[0x0018][0x115E] = new Array('DS', '1',
                'ImageAreaDoseProduct');
        newDictionary[0x0018][0x1160] = new Array('SH', '1', 'FilterType');
        newDictionary[0x0018][0x1161] = new Array('LO', '1-n', 'TypeOfFilters');
        newDictionary[0x0018][0x1162] = new Array('DS', '1', 'IntensifierSize');
        newDictionary[0x0018][0x1164] = new Array('DS', '2',
                'ImagerPixelSpacing');
        newDictionary[0x0018][0x1166] = new Array('CS', '1', 'Grid');
        newDictionary[0x0018][0x1170] = new Array('IS', '1', 'GeneratorPower');
        newDictionary[0x0018][0x1180] = new Array('SH', '1',
                'CollimatorGridName');
        newDictionary[0x0018][0x1181] = new Array('CS', '1', 'CollimatorType');
        newDictionary[0x0018][0x1182] = new Array('IS', '1', 'FocalDistance');
        newDictionary[0x0018][0x1183] = new Array('DS', '1', 'XFocusCenter');
        newDictionary[0x0018][0x1184] = new Array('DS', '1', 'YFocusCenter');
        newDictionary[0x0018][0x1190] = new Array('DS', '1-n', 'FocalSpot');
        newDictionary[0x0018][0x1191] = new Array('CS', '1',
                'AnodeTargetMaterial');
        newDictionary[0x0018][0x11A0] = new Array('DS', '1',
                'BodyPartThickness');
        newDictionary[0x0018][0x11A2] = new Array('DS', '1', 'CompressionForce');
        newDictionary[0x0018][0x1200] = new Array('DA', '1-n',
                'DateOfLastCalibration');
        newDictionary[0x0018][0x1201] = new Array('TM', '1-n',
                'TimeOfLastCalibration');
        newDictionary[0x0018][0x1210] = new Array('SH', '1-n',
                'ConvolutionKernel');
        newDictionary[0x0018][0x1240] = new Array('IS', '1-n',
                'UpperLowerPixelValues');
        newDictionary[0x0018][0x1242] = new Array('IS', '1',
                'ActualFrameDuration');
        newDictionary[0x0018][0x1243] = new Array('IS', '1', 'CountRate');
        newDictionary[0x0018][0x1244] = new Array('US', '1',
                'PreferredPlaybackSequencing');
        newDictionary[0x0018][0x1250] = new Array('SH', '1', 'ReceivingCoil');
        newDictionary[0x0018][0x1251] = new Array('SH', '1', 'TransmittingCoil');
        newDictionary[0x0018][0x1260] = new Array('SH', '1', 'PlateType');
        newDictionary[0x0018][0x1261] = new Array('LO', '1', 'PhosphorType');
        newDictionary[0x0018][0x1300] = new Array('IS', '1', 'ScanVelocity');
        newDictionary[0x0018][0x1301] = new Array('CS', '1-n',
                'WholeBodyTechnique');
        newDictionary[0x0018][0x1302] = new Array('IS', '1', 'ScanLength');
        newDictionary[0x0018][0x1310] = new Array('US', '4',
                'AcquisitionMatrix');
        newDictionary[0x0018][0x1312] = new Array('CS', '1',
                'PhaseEncodingDirection');
        newDictionary[0x0018][0x1314] = new Array('DS', '1', 'FlipAngle');
        newDictionary[0x0018][0x1315] = new Array('CS', '1',
                'VariableFlipAngleFlag');
        newDictionary[0x0018][0x1316] = new Array('DS', '1', 'SAR');
        newDictionary[0x0018][0x1318] = new Array('DS', '1', 'dBdt');
        newDictionary[0x0018][0x1400] = new Array('LO', '1',
                'AcquisitionDeviceProcessingDescription');
        newDictionary[0x0018][0x1401] = new Array('LO', '1',
                'AcquisitionDeviceProcessingCode');
        newDictionary[0x0018][0x1402] = new Array('CS', '1',
                'CassetteOrientation');
        newDictionary[0x0018][0x1403] = new Array('CS', '1', 'CassetteSize');
        newDictionary[0x0018][0x1404] = new Array('US', '1', 'ExposuresOnPlate');
        newDictionary[0x0018][0x1405] = new Array('IS', '1',
                'RelativeXrayExposure');
        newDictionary[0x0018][0x1450] = new Array('DS', '1', 'ColumnAngulation');
        newDictionary[0x0018][0x1460] = new Array('DS', '1', 'TomoLayerHeight');
        newDictionary[0x0018][0x1470] = new Array('DS', '1', 'TomoAngle');
        newDictionary[0x0018][0x1480] = new Array('DS', '1', 'TomoTime');
        newDictionary[0x0018][0x1490] = new Array('CS', '1', 'TomoType');
        newDictionary[0x0018][0x1491] = new Array('CS', '1', 'TomoClass');
        newDictionary[0x0018][0x1495] = new Array('IS', '1',
                'NumberofTomosynthesisSourceImages');
        newDictionary[0x0018][0x1500] = new Array('CS', '1', 'PositionerMotion');
        newDictionary[0x0018][0x1508] = new Array('CS', '1', 'PositionerType');
        newDictionary[0x0018][0x1510] = new Array('DS', '1',
                'PositionerPrimaryAngle');
        newDictionary[0x0018][0x1511] = new Array('DS', '1',
                'PositionerSecondaryAngle');
        newDictionary[0x0018][0x1520] = new Array('DS', '1-n',
                'PositionerPrimaryAngleIncrement');
        newDictionary[0x0018][0x1521] = new Array('DS', '1-n',
                'PositionerSecondaryAngleIncrement');
        newDictionary[0x0018][0x1530] = new Array('DS', '1',
                'DetectorPrimaryAngle');
        newDictionary[0x0018][0x1531] = new Array('DS', '1',
                'DetectorSecondaryAngle');
        newDictionary[0x0018][0x1600] = new Array('CS', '3', 'ShutterShape');
        newDictionary[0x0018][0x1602] = new Array('IS', '1',
                'ShutterLeftVerticalEdge');
        newDictionary[0x0018][0x1604] = new Array('IS', '1',
                'ShutterRightVerticalEdge');
        newDictionary[0x0018][0x1606] = new Array('IS', '1',
                'ShutterUpperHorizontalEdge');
        newDictionary[0x0018][0x1608] = new Array('IS', '1',
                'ShutterLowerHorizontalEdge');
        newDictionary[0x0018][0x1610] = new Array('IS', '1',
                'CenterOfCircularShutter');
        newDictionary[0x0018][0x1612] = new Array('IS', '1',
                'RadiusOfCircularShutter');
        newDictionary[0x0018][0x1620] = new Array('IS', '1-n',
                'VerticesOfPolygonalShutter');
        newDictionary[0x0018][0x1622] = new Array('US', '1',
                'ShutterPresentationValue');
        newDictionary[0x0018][0x1623] = new Array('US', '1',
                'ShutterOverlayGroup');
        newDictionary[0x0018][0x1700] = new Array('CS', '3', 'CollimatorShape');
        newDictionary[0x0018][0x1702] = new Array('IS', '1',
                'CollimatorLeftVerticalEdge');
        newDictionary[0x0018][0x1704] = new Array('IS', '1',
                'CollimatorRightVerticalEdge');
        newDictionary[0x0018][0x1706] = new Array('IS', '1',
                'CollimatorUpperHorizontalEdge');
        newDictionary[0x0018][0x1708] = new Array('IS', '1',
                'CollimatorLowerHorizontalEdge');
        newDictionary[0x0018][0x1710] = new Array('IS', '1',
                'CenterOfCircularCollimator');
        newDictionary[0x0018][0x1712] = new Array('IS', '1',
                'RadiusOfCircularCollimator');
        newDictionary[0x0018][0x1720] = new Array('IS', '1-n',
                'VerticesOfPolygonalCollimator');
        newDictionary[0x0018][0x1800] = new Array('CS', '1',
                'AcquisitionTimeSynchronized');
        newDictionary[0x0018][0x1801] = new Array('SH', '1', 'TimeSource');
        newDictionary[0x0018][0x1802] = new Array('CS', '1',
                'TimeDistributionProtocol');
        newDictionary[0x0018][0x1810] = new Array('DT', '1',
                'AcquisitionTimestamp');
        newDictionary[0x0018][0x4000] = new Array('LT', '1-n',
                'AcquisitionComments');
        newDictionary[0x0018][0x5000] = new Array('SH', '1-n', 'OutputPower');
        newDictionary[0x0018][0x5010] = new Array('LO', '3', 'TransducerData');
        newDictionary[0x0018][0x5012] = new Array('DS', '1', 'FocusDepth');
        newDictionary[0x0018][0x5020] = new Array('LO', '1',
                'PreprocessingFunction');
        newDictionary[0x0018][0x5021] = new Array('LO', '1',
                'PostprocessingFunction');
        newDictionary[0x0018][0x5022] = new Array('DS', '1', 'MechanicalIndex');
        newDictionary[0x0018][0x5024] = new Array('DS', '1', 'ThermalIndex');
        newDictionary[0x0018][0x5026] = new Array('DS', '1',
                'CranialThermalIndex');
        newDictionary[0x0018][0x5027] = new Array('DS', '1',
                'SoftTissueThermalIndex');
        newDictionary[0x0018][0x5028] = new Array('DS', '1',
                'SoftTissueFocusThermalIndex');
        newDictionary[0x0018][0x5029] = new Array('DS', '1',
                'SoftTissueSurfaceThermalIndex');
        newDictionary[0x0018][0x5030] = new Array('DS', '1', 'DynamicRange');
        newDictionary[0x0018][0x5040] = new Array('DS', '1', 'TotalGain');
        newDictionary[0x0018][0x5050] = new Array('IS', '1', 'DepthOfScanField');
        newDictionary[0x0018][0x5100] = new Array('CS', '1', 'PatientPosition');
        newDictionary[0x0018][0x5101] = new Array('CS', '1', 'ViewPosition');
        newDictionary[0x0018][0x5104] = new Array('SQ', '1',
                'ProjectionEponymousNameCodeSequence');
        newDictionary[0x0018][0x5210] = new Array('DS', '6',
                'ImageTransformationMatrix');
        newDictionary[0x0018][0x5212] = new Array('DS', '3',
                'ImageTranslationVector');
        newDictionary[0x0018][0x6000] = new Array('DS', '1', 'Sensitivity');
        newDictionary[0x0018][0x6011] = new Array('SQ', '1',
                'SequenceOfUltrasoundRegions');
        newDictionary[0x0018][0x6012] = new Array('US', '1',
                'RegionSpatialFormat');
        newDictionary[0x0018][0x6014] = new Array('US', '1', 'RegionDataType');
        newDictionary[0x0018][0x6016] = new Array('UL', '1', 'RegionFlags');
        newDictionary[0x0018][0x6018] = new Array('UL', '1',
                'RegionLocationMinX0');
        newDictionary[0x0018][0x601A] = new Array('UL', '1',
                'RegionLocationMinY0');
        newDictionary[0x0018][0x601C] = new Array('UL', '1',
                'RegionLocationMaxX1');
        newDictionary[0x0018][0x601E] = new Array('UL', '1',
                'RegionLocationMaxY1');
        newDictionary[0x0018][0x6020] = new Array('SL', '1', 'ReferencePixelX0');
        newDictionary[0x0018][0x6022] = new Array('SL', '1', 'ReferencePixelY0');
        newDictionary[0x0018][0x6024] = new Array('US', '1',
                'PhysicalUnitsXDirection');
        newDictionary[0x0018][0x6026] = new Array('US', '1',
                'PhysicalUnitsYDirection');
        newDictionary[0x0018][0x6028] = new Array('FD', '1',
                'ReferencePixelPhysicalValueX');
        newDictionary[0x0018][0x602A] = new Array('FD', '1',
                'ReferencePixelPhysicalValueY');
        newDictionary[0x0018][0x602C] = new Array('FD', '1', 'PhysicalDeltaX');
        newDictionary[0x0018][0x602E] = new Array('FD', '1', 'PhysicalDeltaY');
        newDictionary[0x0018][0x6030] = new Array('UL', '1',
                'TransducerFrequency');
        newDictionary[0x0018][0x6031] = new Array('CS', '1', 'TransducerType');
        newDictionary[0x0018][0x6032] = new Array('UL', '1',
                'PulseRepetitionFrequency');
        newDictionary[0x0018][0x6034] = new Array('FD', '1',
                'DopplerCorrectionAngle');
        newDictionary[0x0018][0x6036] = new Array('FD', '1', 'SteeringAngle');
        newDictionary[0x0018][0x6038] = new Array('UL', '1',
                'DopplerSampleVolumeXPosition');
        newDictionary[0x0018][0x603A] = new Array('UL', '1',
                'DopplerSampleVolumeYPosition');
        newDictionary[0x0018][0x603C] = new Array('UL', '1', 'TMLinePositionX0');
        newDictionary[0x0018][0x603E] = new Array('UL', '1', 'TMLinePositionY0');
        newDictionary[0x0018][0x6040] = new Array('UL', '1', 'TMLinePositionX1');
        newDictionary[0x0018][0x6042] = new Array('UL', '1', 'TMLinePositionY1');
        newDictionary[0x0018][0x6044] = new Array('US', '1',
                'PixelComponentOrganization');
        newDictionary[0x0018][0x6046] = new Array('UL', '1',
                'PixelComponentMask');
        newDictionary[0x0018][0x6048] = new Array('UL', '1',
                'PixelComponentRangeStart');
        newDictionary[0x0018][0x604A] = new Array('UL', '1',
                'PixelComponentRangeStop');
        newDictionary[0x0018][0x604C] = new Array('US', '1',
                'PixelComponentPhysicalUnits');
        newDictionary[0x0018][0x604E] = new Array('US', '1',
                'PixelComponentDataType');
        newDictionary[0x0018][0x6050] = new Array('UL', '1',
                'NumberOfTableBreakPoints');
        newDictionary[0x0018][0x6052] = new Array('UL', '1-n',
                'TableOfXBreakPoints');
        newDictionary[0x0018][0x6054] = new Array('FD', '1-n',
                'TableOfYBreakPoints');
        newDictionary[0x0018][0x6056] = new Array('UL', '1',
                'NumberOfTableEntries');
        newDictionary[0x0018][0x6058] = new Array('UL', '1-n',
                'TableOfPixelValues');
        newDictionary[0x0018][0x605A] = new Array('FL', '1-n',
                'TableOfParameterValues');
        newDictionary[0x0018][0x7000] = new Array('CS', '1',
                'DetectorConditionsNominalFlag');
        newDictionary[0x0018][0x7001] = new Array('DS', '1',
                'DetectorTemperature');
        newDictionary[0x0018][0x7004] = new Array('CS', '1', 'DetectorType');
        newDictionary[0x0018][0x7005] = new Array('CS', '1',
                'DetectorConfiguration');
        newDictionary[0x0018][0x7006] = new Array('LT', '1',
                'DetectorDescription');
        newDictionary[0x0018][0x7008] = new Array('LT', '1', 'DetectorMode');
        newDictionary[0x0018][0x700A] = new Array('SH', '1', 'DetectorID');
        newDictionary[0x0018][0x700C] = new Array('DA', '1',
                'DateofLastDetectorCalibration');
        newDictionary[0x0018][0x700E] = new Array('TM', '1',
                'TimeofLastDetectorCalibration');
        newDictionary[0x0018][0x7010] = new Array('IS', '1',
                'ExposuresOnDetectorSinceLastCalibration');
        newDictionary[0x0018][0x7011] = new Array('IS', '1',
                'ExposuresOnDetectorSinceManufactured');
        newDictionary[0x0018][0x7012] = new Array('DS', '1',
                'DetectorTimeSinceLastExposure');
        newDictionary[0x0018][0x7014] = new Array('DS', '1',
                'DetectorActiveTime');
        newDictionary[0x0018][0x7016] = new Array('DS', '1',
                'DetectorActivationOffsetFromExposure');
        newDictionary[0x0018][0x701A] = new Array('DS', '2', 'DetectorBinning');
        newDictionary[0x0018][0x7020] = new Array('DS', '2',
                'DetectorElementPhysicalSize');
        newDictionary[0x0018][0x7022] = new Array('DS', '2',
                'DetectorElementSpacing');
        newDictionary[0x0018][0x7024] = new Array('CS', '1',
                'DetectorActiveShape');
        newDictionary[0x0018][0x7026] = new Array('DS', '1-2',
                'DetectorActiveDimensions');
        newDictionary[0x0018][0x7028] = new Array('DS', '2',
                'DetectorActiveOrigin');
        newDictionary[0x0018][0x7030] = new Array('DS', '2',
                'FieldofViewOrigin');
        newDictionary[0x0018][0x7032] = new Array('DS', '1',
                'FieldofViewRotation');
        newDictionary[0x0018][0x7034] = new Array('CS', '1',
                'FieldofViewHorizontalFlip');
        newDictionary[0x0018][0x7040] = new Array('LT', '1',
                'GridAbsorbingMaterial');
        newDictionary[0x0018][0x7041] = new Array('LT', '1',
                'GridSpacingMaterial');
        newDictionary[0x0018][0x7042] = new Array('DS', '1', 'GridThickness');
        newDictionary[0x0018][0x7044] = new Array('DS', '1', 'GridPitch');
        newDictionary[0x0018][0x7046] = new Array('IS', '2', 'GridAspectRatio');
        newDictionary[0x0018][0x7048] = new Array('DS', '1', 'GridPeriod');
        newDictionary[0x0018][0x704C] = new Array('DS', '1',
                'GridFocalDistance');
        newDictionary[0x0018][0x7050] = new Array('LT', '1-n', 'FilterMaterial');
        newDictionary[0x0018][0x7052] = new Array('DS', '1-n',
                'FilterThicknessMinimum');
        newDictionary[0x0018][0x7054] = new Array('DS', '1-n',
                'FilterThicknessMaximum');
        newDictionary[0x0018][0x7060] = new Array('CS', '1',
                'ExposureControlMode');
        newDictionary[0x0018][0x7062] = new Array('LT', '1',
                'ExposureControlModeDescription');
        newDictionary[0x0018][0x7064] = new Array('CS', '1', 'ExposureStatus');
        newDictionary[0x0018][0x7065] = new Array('DS', '1',
                'PhototimerSetting');

        newDictionary[0x0020] = new Array();
        newDictionary[0x0020][0x0000] = new Array('UL', '1', 'ImageGroupLength');
        newDictionary[0x0020][0x000D] = new Array('UI', '1', 'StudyInstanceUID');
        newDictionary[0x0020][0x000E] = new Array('UI', '1',
                'SeriesInstanceUID');
        newDictionary[0x0020][0x0010] = new Array('SH', '1', 'StudyID');
        newDictionary[0x0020][0x0011] = new Array('IS', '1', 'SeriesNumber');
        newDictionary[0x0020][0x0012] = new Array('IS', '1',
                'AcquisitionNumber');
        newDictionary[0x0020][0x0013] = new Array('IS', '1', 'ImageNumber');
        newDictionary[0x0020][0x0014] = new Array('IS', '1', 'IsotopeNumber');
        newDictionary[0x0020][0x0015] = new Array('IS', '1', 'PhaseNumber');
        newDictionary[0x0020][0x0016] = new Array('IS', '1', 'IntervalNumber');
        newDictionary[0x0020][0x0017] = new Array('IS', '1', 'TimeSlotNumber');
        newDictionary[0x0020][0x0018] = new Array('IS', '1', 'AngleNumber');
        newDictionary[0x0020][0x0019] = new Array('IS', '1', 'ItemNumber');
        newDictionary[0x0020][0x0020] = new Array('CS', '2',
                'PatientOrientation');
        newDictionary[0x0020][0x0022] = new Array('IS', '1', 'OverlayNumber');
        newDictionary[0x0020][0x0024] = new Array('IS', '1', 'CurveNumber');
        newDictionary[0x0020][0x0026] = new Array('IS', '1', 'LUTNumber');
        newDictionary[0x0020][0x0030] = new Array('DS', '3', 'ImagePosition');
        newDictionary[0x0020][0x0032] = new Array('DS', '3',
                'ImagePositionPatient');
        newDictionary[0x0020][0x0035] = new Array('DS', '6', 'ImageOrientation');
        newDictionary[0x0020][0x0037] = new Array('DS', '6',
                'ImageOrientationPatient');
        newDictionary[0x0020][0x0050] = new Array('DS', '1', 'Location');
        newDictionary[0x0020][0x0052] = new Array('UI', '1',
                'FrameOfReferenceUID');
        newDictionary[0x0020][0x0060] = new Array('CS', '1', 'Laterality');
        newDictionary[0x0020][0x0062] = new Array('CS', '1', 'ImageLaterality');
        newDictionary[0x0020][0x0070] = new Array('LT', '1',
                'ImageGeometryType');
        newDictionary[0x0020][0x0080] = new Array('CS', '1-n', 'MaskingImage');
        newDictionary[0x0020][0x0100] = new Array('IS', '1',
                'TemporalPositionIdentifier');
        newDictionary[0x0020][0x0105] = new Array('IS', '1',
                'NumberOfTemporalPositions');
        newDictionary[0x0020][0x0110] = new Array('DS', '1',
                'TemporalResolution');
        newDictionary[0x0020][0x0200] = new Array('UI', '1',
                'SynchronizationFrameofReferenceUID');
        newDictionary[0x0020][0x1000] = new Array('IS', '1', 'SeriesInStudy');
        newDictionary[0x0020][0x1001] = new Array('IS', '1',
                'AcquisitionsInSeries');
        newDictionary[0x0020][0x1002] = new Array('IS', '1',
                'ImagesInAcquisition');
        newDictionary[0x0020][0x1003] = new Array('IS', '1', 'ImagesInSeries');
        newDictionary[0x0020][0x1004] = new Array('IS', '1',
                'AcquisitionsInStudy');
        newDictionary[0x0020][0x1005] = new Array('IS', '1', 'ImagesInStudy');
        newDictionary[0x0020][0x1020] = new Array('CS', '1-n', 'Reference');
        newDictionary[0x0020][0x1040] = new Array('LO', '1',
                'PositionReferenceIndicator');
        newDictionary[0x0020][0x1041] = new Array('DS', '1', 'SliceLocation');
        newDictionary[0x0020][0x1070] = new Array('IS', '1-n',
                'OtherStudyNumbers');
        newDictionary[0x0020][0x1200] = new Array('IS', '1',
                'NumberOfPatientRelatedStudies');
        newDictionary[0x0020][0x1202] = new Array('IS', '1',
                'NumberOfPatientRelatedSeries');
        newDictionary[0x0020][0x1204] = new Array('IS', '1',
                'NumberOfPatientRelatedImages');
        newDictionary[0x0020][0x1206] = new Array('IS', '1',
                'NumberOfStudyRelatedSeries');
        newDictionary[0x0020][0x1208] = new Array('IS', '1',
                'NumberOfStudyRelatedImages');
        newDictionary[0x0020][0x1209] = new Array('IS', '1',
                'NumberOfSeriesRelatedInstances');
        newDictionary[0x0020][0x3100] = new Array('CS', '1-n', 'SourceImageID');
        newDictionary[0x0020][0x3401] = new Array('CS', '1',
                'ModifyingDeviceID');
        newDictionary[0x0020][0x3402] = new Array('CS', '1', 'ModifiedImageID');
        newDictionary[0x0020][0x3403] = new Array('DA', '1',
                'ModifiedImageDate');
        newDictionary[0x0020][0x3404] = new Array('LO', '1',
                'ModifyingDeviceManufacturer');
        newDictionary[0x0020][0x3405] = new Array('TM', '1',
                'ModifiedImageTime');
        newDictionary[0x0020][0x3406] = new Array('LT', '1',
                'ModifiedImageDescription');
        newDictionary[0x0020][0x4000] = new Array('LT', '1', 'ImageComments');
        newDictionary[0x0020][0x5000] = new Array('AT', '1-n',
                'OriginalImageIdentification');
        newDictionary[0x0020][0x5002] = new Array('CS', '1-n',
                'OriginalImageIdentificationNomenclature');

        newDictionary[0x0028] = new Array();
        newDictionary[0x0028][0x0000] = new Array('UL', '1',
                'ImagePresentationGroupLength');
        newDictionary[0x0028][0x0002] = new Array('US', '1', 'SamplesPerPixel');
        newDictionary[0x0028][0x0004] = new Array('CS', '1',
                'PhotometricInterpretation');
        newDictionary[0x0028][0x0005] = new Array('US', '1', 'ImageDimensions');
        newDictionary[0x0028][0x0006] = new Array('US', '1',
                'PlanarConfiguration');
        newDictionary[0x0028][0x0008] = new Array('IS', '1', 'NumberOfFrames');
        newDictionary[0x0028][0x0009] = new Array('AT', '1',
                'FrameIncrementPointer');
        newDictionary[0x0028][0x0010] = new Array('US', '1', 'Rows');
        newDictionary[0x0028][0x0011] = new Array('US', '1', 'Columns');
        newDictionary[0x0028][0x0012] = new Array('US', '1', 'Planes');
        newDictionary[0x0028][0x0014] = new Array('US', '1',
                'UltrasoundColorDataPresent');
        newDictionary[0x0028][0x0030] = new Array('DS', '2', 'PixelSpacing');
        newDictionary[0x0028][0x0031] = new Array('DS', '2', 'ZoomFactor');
        newDictionary[0x0028][0x0032] = new Array('DS', '2', 'ZoomCenter');
        newDictionary[0x0028][0x0034] = new Array('IS', '2', 'PixelAspectRatio');
        newDictionary[0x0028][0x0040] = new Array('CS', '1', 'ImageFormat');
        newDictionary[0x0028][0x0050] = new Array('LT', '1-n',
                'ManipulatedImage');
        newDictionary[0x0028][0x0051] = new Array('CS', '1', 'CorrectedImage');
        newDictionary[0x0028][0x005F] = new Array('CS', '1',
                'CompressionRecognitionCode');
        newDictionary[0x0028][0x0060] = new Array('CS', '1', 'CompressionCode');
        newDictionary[0x0028][0x0061] = new Array('SH', '1',
                'CompressionOriginator');
        newDictionary[0x0028][0x0062] = new Array('SH', '1', 'CompressionLabel');
        newDictionary[0x0028][0x0063] = new Array('SH', '1',
                'CompressionDescription');
        newDictionary[0x0028][0x0065] = new Array('CS', '1-n',
                'CompressionSequence');
        newDictionary[0x0028][0x0066] = new Array('AT', '1-n',
                'CompressionStepPointers');
        newDictionary[0x0028][0x0068] = new Array('US', '1', 'RepeatInterval');
        newDictionary[0x0028][0x0069] = new Array('US', '1', 'BitsGrouped');
        newDictionary[0x0028][0x0070] = new Array('US', '1-n', 'PerimeterTable');
        newDictionary[0x0028][0x0071] = new Array('XS', '1', 'PerimeterValue');
        newDictionary[0x0028][0x0080] = new Array('US', '1', 'PredictorRows');
        newDictionary[0x0028][0x0081] = new Array('US', '1', 'PredictorColumns');
        newDictionary[0x0028][0x0082] = new Array('US', '1-n',
                'PredictorConstants');
        newDictionary[0x0028][0x0090] = new Array('CS', '1', 'BlockedPixels');
        newDictionary[0x0028][0x0091] = new Array('US', '1', 'BlockRows');
        newDictionary[0x0028][0x0092] = new Array('US', '1', 'BlockColumns');
        newDictionary[0x0028][0x0093] = new Array('US', '1', 'RowOverlap');
        newDictionary[0x0028][0x0094] = new Array('US', '1', 'ColumnOverlap');
        newDictionary[0x0028][0x0100] = new Array('US', '1', 'BitsAllocated');
        newDictionary[0x0028][0x0101] = new Array('US', '1', 'BitsStored');
        newDictionary[0x0028][0x0102] = new Array('US', '1', 'HighBit');
        newDictionary[0x0028][0x0103] = new Array('US', '1',
                'PixelRepresentation');
        newDictionary[0x0028][0x0104] = new Array('XS', '1',
                'SmallestValidPixelValue');
        newDictionary[0x0028][0x0105] = new Array('XS', '1',
                'LargestValidPixelValue');
        newDictionary[0x0028][0x0106] = new Array('XS', '1',
                'SmallestImagePixelValue');
        newDictionary[0x0028][0x0107] = new Array('XS', '1',
                'LargestImagePixelValue');
        newDictionary[0x0028][0x0108] = new Array('XS', '1',
                'SmallestPixelValueInSeries');
        newDictionary[0x0028][0x0109] = new Array('XS', '1',
                'LargestPixelValueInSeries');
        newDictionary[0x0028][0x0110] = new Array('XS', '1',
                'SmallestPixelValueInPlane');
        newDictionary[0x0028][0x0111] = new Array('XS', '1',
                'LargestPixelValueInPlane');
        newDictionary[0x0028][0x0120] = new Array('XS', '1',
                'PixelPaddingValue');
        newDictionary[0x0028][0x0200] = new Array('US', '1', 'ImageLocation');
        newDictionary[0x0028][0x0300] = new Array('CS', '1',
                'QualityControlImage');
        newDictionary[0x0028][0x0301] = new Array('CS', '1',
                'BurnedInAnnotation');
        newDictionary[0x0028][0x0400] = new Array('CS', '1', 'TransformLabel');
        newDictionary[0x0028][0x0401] = new Array('CS', '1',
                'TransformVersionNumber');
        newDictionary[0x0028][0x0402] = new Array('US', '1',
                'NumberOfTransformSteps');
        newDictionary[0x0028][0x0403] = new Array('CS', '1-n',
                'SequenceOfCompressedData');
        newDictionary[0x0028][0x0404] = new Array('AT', '1-n',
                'DetailsOfCoefficients');
        newDictionary[0x0028][0x0410] = new Array('US', '1',
                'RowsForNthOrderCoefficients');
        newDictionary[0x0028][0x0411] = new Array('US', '1',
                'ColumnsForNthOrderCoefficients');
        newDictionary[0x0028][0x0412] = new Array('CS', '1-n',
                'CoefficientCoding');
        newDictionary[0x0028][0x0413] = new Array('AT', '1-n',
                'CoefficientCodingPointers');
        newDictionary[0x0028][0x0700] = new Array('CS', '1', 'DCTLabel');
        newDictionary[0x0028][0x0701] = new Array('CS', '1-n',
                'DataBlockDescription');
        newDictionary[0x0028][0x0702] = new Array('AT', '1-n', 'DataBlock');
        newDictionary[0x0028][0x0710] = new Array('US', '1',
                'NormalizationFactorFormat');
        newDictionary[0x0028][0x0720] = new Array('US', '1',
                'ZonalMapNumberFormat');
        newDictionary[0x0028][0x0721] = new Array('AT', '1-n',
                'ZonalMapLocation');
        newDictionary[0x0028][0x0722] = new Array('US', '1', 'ZonalMapFormat');
        newDictionary[0x0028][0x0730] = new Array('US', '1',
                'AdaptiveMapFormat');
        newDictionary[0x0028][0x0740] = new Array('US', '1', 'CodeNumberFormat');
        newDictionary[0x0028][0x0800] = new Array('CS', '1-n', 'CodeLabel');
        newDictionary[0x0028][0x0802] = new Array('US', '1', 'NumberOfTables');
        newDictionary[0x0028][0x0803] = new Array('AT', '1-n',
                'CodeTableLocation');
        newDictionary[0x0028][0x0804] = new Array('US', '1', 'BitsForCodeWord');
        newDictionary[0x0028][0x0808] = new Array('AT', '1-n',
                'ImageDataLocation');
        newDictionary[0x0028][0x1040] = new Array('CS', '1',
                'PixelIntensityRelationship');
        newDictionary[0x0028][0x1041] = new Array('SS', '1',
                'PixelIntensityRelationshipSign');
        newDictionary[0x0028][0x1050] = new Array('DS', '1-n', 'WindowCenter');
        newDictionary[0x0028][0x1051] = new Array('DS', '1-n', 'WindowWidth');
        newDictionary[0x0028][0x1052] = new Array('DS', '1', 'RescaleIntercept');
        newDictionary[0x0028][0x1053] = new Array('DS', '1', 'RescaleSlope');
        newDictionary[0x0028][0x1054] = new Array('LO', '1', 'RescaleType');
        newDictionary[0x0028][0x1055] = new Array('LO', '1-n',
                'WindowCenterWidthExplanation');
        newDictionary[0x0028][0x1080] = new Array('CS', '1', 'GrayScale');
        newDictionary[0x0028][0x1090] = new Array('CS', '1',
                'RecommendedViewingMode');
        newDictionary[0x0028][0x1100] = new Array('XS', '3',
                'GrayLookupTableDescriptor');
        newDictionary[0x0028][0x1101] = new Array('XS', '3',
                'RedPaletteColorLookupTableDescriptor');
        newDictionary[0x0028][0x1102] = new Array('XS', '3',
                'GreenPaletteColorLookupTableDescriptor');
        newDictionary[0x0028][0x1103] = new Array('XS', '3',
                'BluePaletteColorLookupTableDescriptor');
        newDictionary[0x0028][0x1111] = new Array('US', '4',
                'LargeRedPaletteColorLookupTableDescriptor');
        newDictionary[0x0028][0x1112] = new Array('US', '4',
                'LargeGreenPaletteColorLookupTabe');
        newDictionary[0x0028][0x1113] = new Array('US', '4',
                'LargeBluePaletteColorLookupTabl');
        newDictionary[0x0028][0x1199] = new Array('UI', '1',
                'PaletteColorLookupTableUID');
        newDictionary[0x0028][0x1200] = new Array('XS', '1-n',
                'GrayLookupTableData');
        newDictionary[0x0028][0x1201] = new Array('XS', '1-n',
                'RedPaletteColorLookupTableData');
        newDictionary[0x0028][0x1202] = new Array('XS', '1-n',
                'GreenPaletteColorLookupTableData');
        newDictionary[0x0028][0x1203] = new Array('XS', '1-n',
                'BluePaletteColorLookupTableData');
        newDictionary[0x0028][0x1211] = new Array('OW', '1',
                'LargeRedPaletteColorLookupTableData');
        newDictionary[0x0028][0x1212] = new Array('OW', '1',
                'LargeGreenPaletteColorLookupTableData');
        newDictionary[0x0028][0x1213] = new Array('OW', '1',
                'LargeBluePaletteColorLookupTableData');
        newDictionary[0x0028][0x1214] = new Array('UI', '1',
                'LargePaletteColorLookupTableUID');
        newDictionary[0x0028][0x1221] = new Array('OW', '1',
                'SegmentedRedPaletteColorLookupTableData');
        newDictionary[0x0028][0x1222] = new Array('OW', '1',
                'SegmentedGreenPaletteColorLookupTableData');
        newDictionary[0x0028][0x1223] = new Array('OW', '1',
                'SegmentedBluePaletteColorLookupTableData');
        newDictionary[0x0028][0x1300] = new Array('CS', '1', 'ImplantPresent');
        newDictionary[0x0028][0x2110] = new Array('CS', '1',
                'LossyImageCompression');
        newDictionary[0x0028][0x2112] = new Array('DS', '1-n',
                'LossyImageCompressionRatio');
        newDictionary[0x0028][0x3000] = new Array('SQ', '1',
                'ModalityLUTSequence');
        newDictionary[0x0028][0x3002] = new Array('XS', '3', 'LUTDescriptor');
        newDictionary[0x0028][0x3003] = new Array('LO', '1', 'LUTExplanation');
        newDictionary[0x0028][0x3004] = new Array('LO', '1', 'ModalityLUTType');
        newDictionary[0x0028][0x3006] = new Array('XS', '1-n', 'LUTData');
        newDictionary[0x0028][0x3010] = new Array('SQ', '1', 'VOILUTSequence');
        newDictionary[0x0028][0x3110] = new Array('SQ', '1',
                'SoftcopyVOILUTSequence');
        newDictionary[0x0028][0x4000] = new Array('LT', '1-n',
                'ImagePresentationComments');
        newDictionary[0x0028][0x5000] = new Array('SQ', '1',
                'BiPlaneAcquisitionSequence');
        newDictionary[0x0028][0x6010] = new Array('US', '1',
                'RepresentativeFrameNumber');
        newDictionary[0x0028][0x6020] = new Array('US', '1-n',
                'FrameNumbersOfInterest');
        newDictionary[0x0028][0x6022] = new Array('LO', '1-n',
                'FrameOfInterestDescription');
        newDictionary[0x0028][0x6030] = new Array('US', '1-n', 'MaskPointer');
        newDictionary[0x0028][0x6040] = new Array('US', '1-n', 'RWavePointer');
        newDictionary[0x0028][0x6100] = new Array('SQ', '1',
                'MaskSubtractionSequence');
        newDictionary[0x0028][0x6101] = new Array('CS', '1', 'MaskOperation');
        newDictionary[0x0028][0x6102] = new Array('US', '1-n',
                'ApplicableFrameRange');
        newDictionary[0x0028][0x6110] = new Array('US', '1-n',
                'MaskFrameNumbers');
        newDictionary[0x0028][0x6112] = new Array('US', '1',
                'ContrastFrameAveraging');
        newDictionary[0x0028][0x6114] = new Array('FL', '2',
                'MaskSubPixelShift');
        newDictionary[0x0028][0x6120] = new Array('SS', '1', 'TIDOffset');
        newDictionary[0x0028][0x6190] = new Array('ST', '1',
                'MaskOperationExplanation');

        newDictionary[0x0032] = new Array();
        newDictionary[0x0032][0x0000] = new Array('UL', '1', 'StudyGroupLength');
        newDictionary[0x0032][0x000A] = new Array('CS', '1', 'StudyStatusID');
        newDictionary[0x0032][0x000C] = new Array('CS', '1', 'StudyPriorityID');
        newDictionary[0x0032][0x0012] = new Array('LO', '1', 'StudyIDIssuer');
        newDictionary[0x0032][0x0032] = new Array('DA', '1',
                'StudyVerifiedDate');
        newDictionary[0x0032][0x0033] = new Array('TM', '1',
                'StudyVerifiedTime');
        newDictionary[0x0032][0x0034] = new Array('DA', '1', 'StudyReadDate');
        newDictionary[0x0032][0x0035] = new Array('TM', '1', 'StudyReadTime');
        newDictionary[0x0032][0x1000] = new Array('DA', '1',
                'ScheduledStudyStartDate');
        newDictionary[0x0032][0x1001] = new Array('TM', '1',
                'ScheduledStudyStartTime');
        newDictionary[0x0032][0x1010] = new Array('DA', '1',
                'ScheduledStudyStopDate');
        newDictionary[0x0032][0x1011] = new Array('TM', '1',
                'ScheduledStudyStopTime');
        newDictionary[0x0032][0x1020] = new Array('LO', '1',
                'ScheduledStudyLocation');
        newDictionary[0x0032][0x1021] = new Array('AE', '1-n',
                'ScheduledStudyLocationAETitle');
        newDictionary[0x0032][0x1030] = new Array('LO', '1', 'ReasonForStudy');
        newDictionary[0x0032][0x1032] = new Array('PN', '1',
                'RequestingPhysician');
        newDictionary[0x0032][0x1033] = new Array('LO', '1',
                'RequestingService');
        newDictionary[0x0032][0x1040] = new Array('DA', '1', 'StudyArrivalDate');
        newDictionary[0x0032][0x1041] = new Array('TM', '1', 'StudyArrivalTime');
        newDictionary[0x0032][0x1050] = new Array('DA', '1',
                'StudyCompletionDate');
        newDictionary[0x0032][0x1051] = new Array('TM', '1',
                'StudyCompletionTime');
        newDictionary[0x0032][0x1055] = new Array('CS', '1',
                'StudyComponentStatusID');
        newDictionary[0x0032][0x1060] = new Array('LO', '1',
                'RequestedProcedureDescription');
        newDictionary[0x0032][0x1064] = new Array('SQ', '1',
                'RequestedProcedureCodeSequence');
        newDictionary[0x0032][0x1070] = new Array('LO', '1',
                'RequestedContrastAgent');
        newDictionary[0x0032][0x4000] = new Array('LT', '1', 'StudyComments');

        newDictionary[0x0038] = new Array();
        newDictionary[0x0038][0x0000] = new Array('UL', '1', 'VisitGroupLength');
        newDictionary[0x0038][0x0004] = new Array('SQ', '1',
                'ReferencedPatientAliasSequence');
        newDictionary[0x0038][0x0008] = new Array('CS', '1', 'VisitStatusID');
        newDictionary[0x0038][0x0010] = new Array('LO', '1', 'AdmissionID');
        newDictionary[0x0038][0x0011] = new Array('LO', '1',
                'IssuerOfAdmissionID');
        newDictionary[0x0038][0x0016] = new Array('LO', '1',
                'RouteOfAdmissions');
        newDictionary[0x0038][0x001A] = new Array('DA', '1',
                'ScheduledAdmissionDate');
        newDictionary[0x0038][0x001B] = new Array('TM', '1',
                'ScheduledAdmissionTime');
        newDictionary[0x0038][0x001C] = new Array('DA', '1',
                'ScheduledDischargeDate');
        newDictionary[0x0038][0x001D] = new Array('TM', '1',
                'ScheduledDischargeTime');
        newDictionary[0x0038][0x001E] = new Array('LO', '1',
                'ScheduledPatientInstitutionResidence');
        newDictionary[0x0038][0x0020] = new Array('DA', '1', 'AdmittingDate');
        newDictionary[0x0038][0x0021] = new Array('TM', '1', 'AdmittingTime');
        newDictionary[0x0038][0x0030] = new Array('DA', '1', 'DischargeDate');
        newDictionary[0x0038][0x0032] = new Array('TM', '1', 'DischargeTime');
        newDictionary[0x0038][0x0040] = new Array('LO', '1',
                'DischargeDiagnosisDescription');
        newDictionary[0x0038][0x0044] = new Array('SQ', '1',
                'DischargeDiagnosisCodeSequence');
        newDictionary[0x0038][0x0050] = new Array('LO', '1', 'SpecialNeeds');
        newDictionary[0x0038][0x0300] = new Array('LO', '1',
                'CurrentPatientLocation');
        newDictionary[0x0038][0x0400] = new Array('LO', '1',
                'PatientInstitutionResidence');
        newDictionary[0x0038][0x0500] = new Array('LO', '1', 'PatientState');
        newDictionary[0x0038][0x4000] = new Array('LT', '1', 'VisitComments');

        newDictionary[0x003A] = new Array();
        newDictionary[0x003A][0x0004] = new Array('CS', '1',
                'WaveformOriginality');
        newDictionary[0x003A][0x0005] = new Array('US', '1', 'NumberofChannels');
        newDictionary[0x003A][0x0010] = new Array('UL', '1', 'NumberofSamples');
        newDictionary[0x003A][0x001A] = new Array('DS', '1',
                'SamplingFrequency');
        newDictionary[0x003A][0x0020] = new Array('SH', '1',
                'MultiplexGroupLabel');
        newDictionary[0x003A][0x0200] = new Array('SQ', '1',
                'ChannelDefinitionSequence');
        newDictionary[0x003A][0x0202] = new Array('IS', '1', 'WVChannelNumber');
        newDictionary[0x003A][0x0203] = new Array('SH', '1', 'ChannelLabel');
        newDictionary[0x003A][0x0205] = new Array('CS', '1-n', 'ChannelStatus');
        newDictionary[0x003A][0x0208] = new Array('SQ', '1',
                'ChannelSourceSequence');
        newDictionary[0x003A][0x0209] = new Array('SQ', '1',
                'ChannelSourceModifiersSequence');
        newDictionary[0x003A][0x020A] = new Array('SQ', '1',
                'SourceWaveformSequence');
        newDictionary[0x003A][0x020C] = new Array('LO', '1',
                'ChannelDerivationDescription');
        newDictionary[0x003A][0x0210] = new Array('DS', '1',
                'ChannelSensitivity');
        newDictionary[0x003A][0x0211] = new Array('SQ', '1',
                'ChannelSensitivityUnits');
        newDictionary[0x003A][0x0212] = new Array('DS', '1',
                'ChannelSensitivityCorrectionFactor');
        newDictionary[0x003A][0x0213] = new Array('DS', '1', 'ChannelBaseline');
        newDictionary[0x003A][0x0214] = new Array('DS', '1', 'ChannelTimeSkew');
        newDictionary[0x003A][0x0215] = new Array('DS', '1',
                'ChannelSampleSkew');
        newDictionary[0x003A][0x0218] = new Array('DS', '1', 'ChannelOffset');
        newDictionary[0x003A][0x021A] = new Array('US', '1',
                'WaveformBitsStored');
        newDictionary[0x003A][0x0220] = new Array('DS', '1',
                'FilterLowFrequency');
        newDictionary[0x003A][0x0221] = new Array('DS', '1',
                'FilterHighFrequency');
        newDictionary[0x003A][0x0222] = new Array('DS', '1',
                'NotchFilterFrequency');
        newDictionary[0x003A][0x0223] = new Array('DS', '1',
                'NotchFilterBandwidth');

        newDictionary[0x0040] = new Array();
        newDictionary[0x0040][0x0000] = new Array('UL', '1',
                'ModalityWorklistGroupLength');
        newDictionary[0x0040][0x0001] = new Array('AE', '1',
                'ScheduledStationAETitle');
        newDictionary[0x0040][0x0002] = new Array('DA', '1',
                'ScheduledProcedureStepStartDate');
        newDictionary[0x0040][0x0003] = new Array('TM', '1',
                'ScheduledProcedureStepStartTime');
        newDictionary[0x0040][0x0004] = new Array('DA', '1',
                'ScheduledProcedureStepEndDate');
        newDictionary[0x0040][0x0005] = new Array('TM', '1',
                'ScheduledProcedureStepEndTime');
        newDictionary[0x0040][0x0006] = new Array('PN', '1',
                'ScheduledPerformingPhysicianName');
        newDictionary[0x0040][0x0007] = new Array('LO', '1',
                'ScheduledProcedureStepDescription');
        newDictionary[0x0040][0x0008] = new Array('SQ', '1',
                'ScheduledProcedureStepCodeSequence');
        newDictionary[0x0040][0x0009] = new Array('SH', '1',
                'ScheduledProcedureStepID');
        newDictionary[0x0040][0x0010] = new Array('SH', '1',
                'ScheduledStationName');
        newDictionary[0x0040][0x0011] = new Array('SH', '1',
                'ScheduledProcedureStepLocation');
        newDictionary[0x0040][0x0012] = new Array('LO', '1',
                'ScheduledPreOrderOfMedication');
        newDictionary[0x0040][0x0020] = new Array('CS', '1',
                'ScheduledProcedureStepStatus');
        newDictionary[0x0040][0x0100] = new Array('SQ', '1-n',
                'ScheduledProcedureStepSequence');
        newDictionary[0x0040][0x0220] = new Array('SQ', '1',
                'ReferencedStandaloneSOPInstanceSequence');
        newDictionary[0x0040][0x0241] = new Array('AE', '1',
                'PerformedStationAETitle');
        newDictionary[0x0040][0x0242] = new Array('SH', '1',
                'PerformedStationName');
        newDictionary[0x0040][0x0243] = new Array('SH', '1',
                'PerformedLocation');
        newDictionary[0x0040][0x0244] = new Array('DA', '1',
                'PerformedProcedureStepStartDate');
        newDictionary[0x0040][0x0245] = new Array('TM', '1',
                'PerformedProcedureStepStartTime');
        newDictionary[0x0040][0x0250] = new Array('DA', '1',
                'PerformedProcedureStepEndDate');
        newDictionary[0x0040][0x0251] = new Array('TM', '1',
                'PerformedProcedureStepEndTime');
        newDictionary[0x0040][0x0252] = new Array('CS', '1',
                'PerformedProcedureStepStatus');
        newDictionary[0x0040][0x0253] = new Array('CS', '1',
                'PerformedProcedureStepID');
        newDictionary[0x0040][0x0254] = new Array('LO', '1',
                'PerformedProcedureStepDescription');
        newDictionary[0x0040][0x0255] = new Array('LO', '1',
                'PerformedProcedureTypeDescription');
        newDictionary[0x0040][0x0260] = new Array('SQ', '1',
                'PerformedActionItemSequence');
        newDictionary[0x0040][0x0270] = new Array('SQ', '1',
                'ScheduledStepAttributesSequence');
        newDictionary[0x0040][0x0275] = new Array('SQ', '1',
                'RequestAttributesSequence');
        newDictionary[0x0040][0x0280] = new Array('ST', '1',
                'CommentsOnThePerformedProcedureSteps');
        newDictionary[0x0040][0x0293] = new Array('SQ', '1', 'QuantitySequence');
        newDictionary[0x0040][0x0294] = new Array('DS', '1', 'Quantity');
        newDictionary[0x0040][0x0295] = new Array('SQ', '1',
                'MeasuringUnitsSequence');
        newDictionary[0x0040][0x0296] = new Array('SQ', '1',
                'BillingItemSequence');
        newDictionary[0x0040][0x0300] = new Array('US', '1',
                'TotalTimeOfFluoroscopy');
        newDictionary[0x0040][0x0301] = new Array('US', '1',
                'TotalNumberOfExposures');
        newDictionary[0x0040][0x0302] = new Array('US', '1', 'EntranceDose');
        newDictionary[0x0040][0x0303] = new Array('US', '1-2', 'ExposedArea');
        newDictionary[0x0040][0x0306] = new Array('DS', '1',
                'DistanceSourceToEntrance');
        newDictionary[0x0040][0x0307] = new Array('DS', '1',
                'DistanceSourceToSupport');
        newDictionary[0x0040][0x0310] = new Array('ST', '1',
                'CommentsOnRadiationDose');
        newDictionary[0x0040][0x0312] = new Array('DS', '1', 'XRayOutput');
        newDictionary[0x0040][0x0314] = new Array('DS', '1', 'HalfValueLayer');
        newDictionary[0x0040][0x0316] = new Array('DS', '1', 'OrganDose');
        newDictionary[0x0040][0x0318] = new Array('CS', '1', 'OrganExposed');
        newDictionary[0x0040][0x0320] = new Array('SQ', '1',
                'BillingProcedureStepSequence');
        newDictionary[0x0040][0x0321] = new Array('SQ', '1',
                'FilmConsumptionSequence');
        newDictionary[0x0040][0x0324] = new Array('SQ', '1',
                'BillingSuppliesAndDevicesSequence');
        newDictionary[0x0040][0x0330] = new Array('SQ', '1',
                'ReferencedProcedureStepSequence');
        newDictionary[0x0040][0x0340] = new Array('SQ', '1',
                'PerformedSeriesSequence');
        newDictionary[0x0040][0x0400] = new Array('LT', '1',
                'CommentsOnScheduledProcedureStep');
        newDictionary[0x0040][0x050A] = new Array('LO', '1',
                'SpecimenAccessionNumber');
        newDictionary[0x0040][0x0550] = new Array('SQ', '1', 'SpecimenSequence');
        newDictionary[0x0040][0x0551] = new Array('LO', '1',
                'SpecimenIdentifier');
        newDictionary[0x0040][0x0555] = new Array('SQ', '1',
                'AcquisitionContextSequence');
        newDictionary[0x0040][0x0556] = new Array('ST', '1',
                'AcquisitionContextDescription');
        newDictionary[0x0040][0x059A] = new Array('SQ', '1',
                'SpecimenTypeCodeSequence');
        newDictionary[0x0040][0x06FA] = new Array('LO', '1', 'SlideIdentifier');
        newDictionary[0x0040][0x071A] = new Array('SQ', '1',
                'ImageCenterPointCoordinatesSequence');
        newDictionary[0x0040][0x072A] = new Array('DS', '1',
                'XOffsetInSlideCoordinateSystem');
        newDictionary[0x0040][0x073A] = new Array('DS', '1',
                'YOffsetInSlideCoordinateSystem');
        newDictionary[0x0040][0x074A] = new Array('DS', '1',
                'ZOffsetInSlideCoordinateSystem');
        newDictionary[0x0040][0x08D8] = new Array('SQ', '1',
                'PixelSpacingSequence');
        newDictionary[0x0040][0x08DA] = new Array('SQ', '1',
                'CoordinateSystemAxisCodeSequence');
        newDictionary[0x0040][0x08EA] = new Array('SQ', '1',
                'MeasurementUnitsCodeSequence');
        newDictionary[0x0040][0x1001] = new Array('SH', '1',
                'RequestedProcedureID');
        newDictionary[0x0040][0x1002] = new Array('LO', '1',
                'ReasonForRequestedProcedure');
        newDictionary[0x0040][0x1003] = new Array('SH', '1',
                'RequestedProcedurePriority');
        newDictionary[0x0040][0x1004] = new Array('LO', '1',
                'PatientTransportArrangements');
        newDictionary[0x0040][0x1005] = new Array('LO', '1',
                'RequestedProcedureLocation');
        newDictionary[0x0040][0x1006] = new Array('SH', '1',
                'PlacerOrderNumberOfProcedure');
        newDictionary[0x0040][0x1007] = new Array('SH', '1',
                'FillerOrderNumberOfProcedure');
        newDictionary[0x0040][0x1008] = new Array('LO', '1',
                'ConfidentialityCode');
        newDictionary[0x0040][0x1009] = new Array('SH', '1',
                'ReportingPriority');
        newDictionary[0x0040][0x1010] = new Array('PN', '1-n',
                'NamesOfIntendedRecipientsOfResults');
        newDictionary[0x0040][0x1400] = new Array('LT', '1',
                'RequestedProcedureComments');
        newDictionary[0x0040][0x2001] = new Array('LO', '1',
                'ReasonForTheImagingServiceRequest');
        newDictionary[0x0040][0x2002] = new Array('LO', '1',
                'ImagingServiceRequestDescription');
        newDictionary[0x0040][0x2004] = new Array('DA', '1',
                'IssueDateOfImagingServiceRequest');
        newDictionary[0x0040][0x2005] = new Array('TM', '1',
                'IssueTimeOfImagingServiceRequest');
        newDictionary[0x0040][0x2006] = new Array('SH', '1',
                'PlacerOrderNumberOfImagingServiceRequest');
        newDictionary[0x0040][0x2007] = new Array('SH', '0',
                'FillerOrderNumberOfImagingServiceRequest');
        newDictionary[0x0040][0x2008] = new Array('PN', '1', 'OrderEnteredBy');
        newDictionary[0x0040][0x2009] = new Array('SH', '1',
                'OrderEntererLocation');
        newDictionary[0x0040][0x2010] = new Array('SH', '1',
                'OrderCallbackPhoneNumber');
        newDictionary[0x0040][0x2016] = new Array('LO', '1',
                'PlacerOrderNumberImagingServiceRequest');
        newDictionary[0x0040][0x2017] = new Array('LO', '1',
                'FillerOrderNumberImagingServiceRequest');
        newDictionary[0x0040][0x2400] = new Array('LT', '1',
                'ImagingServiceRequestComments');
        newDictionary[0x0040][0x3001] = new Array('LT', '1',
                'ConfidentialityConstraint');
        newDictionary[0x0040][0xA010] = new Array('CS', '1', 'RelationshipType');
        newDictionary[0x0040][0xA027] = new Array('LO', '1',
                'VerifyingOrganization');
        newDictionary[0x0040][0xA030] = new Array('DT', '1',
                'VerificationDateTime');
        newDictionary[0x0040][0xA032] = new Array('DT', '1',
                'ObservationDateTime');
        newDictionary[0x0040][0xA040] = new Array('CS', '1', 'ValueType');
        newDictionary[0x0040][0xA043] = new Array('SQ', '1',
                'ConceptNameCodeSequence');
        newDictionary[0x0040][0xA050] = new Array('CS', '1',
                'ContinuityOfContent');
        newDictionary[0x0040][0xA073] = new Array('SQ', '1',
                'VerifyingObserverSequence');
        newDictionary[0x0040][0xA075] = new Array('PN', '1',
                'VerifyingObserverName');
        newDictionary[0x0040][0xA088] = new Array('SQ', '1',
                'VerifyingObserverIdentificationCodeSeque');
        newDictionary[0x0040][0xA0B0] = new Array('US', '2-2n',
                'ReferencedWaveformChannels');
        newDictionary[0x0040][0xA120] = new Array('DT', '1', 'DateTime');
        newDictionary[0x0040][0xA121] = new Array('DA', '1', 'Date');
        newDictionary[0x0040][0xA122] = new Array('TM', '1', 'Time');
        newDictionary[0x0040][0xA123] = new Array('PN', '1', 'PersonName');
        newDictionary[0x0040][0xA124] = new Array('UI', '1', 'UID');
        newDictionary[0x0040][0xA130] = new Array('CS', '1',
                'TemporalRangeType');
        newDictionary[0x0040][0xA132] = new Array('UL', '1-n',
                'ReferencedSamplePositionsU');
        newDictionary[0x0040][0xA136] = new Array('US', '1-n',
                'ReferencedFrameNumbers');
        newDictionary[0x0040][0xA138] = new Array('DS', '1-n',
                'ReferencedTimeOffsets');
        newDictionary[0x0040][0xA13A] = new Array('DT', '1-n',
                'ReferencedDatetime');
        newDictionary[0x0040][0xA160] = new Array('UT', '1', 'TextValue');
        newDictionary[0x0040][0xA168] = new Array('SQ', '1',
                'ConceptCodeSequence');
        newDictionary[0x0040][0xA180] = new Array('US', '1',
                'AnnotationGroupNumber');
        newDictionary[0x0040][0xA195] = new Array('SQ', '1',
                'ConceptNameCodeSequenceModifier');
        newDictionary[0x0040][0xA300] = new Array('SQ', '1',
                'MeasuredValueSequence');
        newDictionary[0x0040][0xA30A] = new Array('DS', '1-n', 'NumericValue');
        newDictionary[0x0040][0xA360] = new Array('SQ', '1',
                'PredecessorDocumentsSequence');
        newDictionary[0x0040][0xA370] = new Array('SQ', '1',
                'ReferencedRequestSequence');
        newDictionary[0x0040][0xA372] = new Array('SQ', '1',
                'PerformedProcedureCodeSequence');
        newDictionary[0x0040][0xA375] = new Array('SQ', '1',
                'CurrentRequestedProcedureEvidenceSequenSequence');
        newDictionary[0x0040][0xA385] = new Array('SQ', '1',
                'PertinentOtherEvidenceSequence');
        newDictionary[0x0040][0xA491] = new Array('CS', '1', 'CompletionFlag');
        newDictionary[0x0040][0xA492] = new Array('LO', '1',
                'CompletionFlagDescription');
        newDictionary[0x0040][0xA493] = new Array('CS', '1', 'VerificationFlag');
        newDictionary[0x0040][0xA504] = new Array('SQ', '1',
                'ContentTemplateSequence');
        newDictionary[0x0040][0xA525] = new Array('SQ', '1',
                'IdenticalDocumentsSequence');
        newDictionary[0x0040][0xA730] = new Array('SQ', '1', 'ContentSequence');
        newDictionary[0x0040][0xB020] = new Array('SQ', '1',
                'AnnotationSequence');
        newDictionary[0x0040][0xDB00] = new Array('CS', '1',
                'TemplateIdentifier');
        newDictionary[0x0040][0xDB06] = new Array('DT', '1', 'TemplateVersion');
        newDictionary[0x0040][0xDB07] = new Array('DT', '1',
                'TemplateLocalVersion');
        newDictionary[0x0040][0xDB0B] = new Array('CS', '1',
                'TemplateExtensionFlag');
        newDictionary[0x0040][0xDB0C] = new Array('UI', '1',
                'TemplateExtensionOrganizationUID');
        newDictionary[0x0040][0xDB0D] = new Array('UI', '1',
                'TemplateExtensionCreatorUID');
        newDictionary[0x0040][0xDB73] = new Array('UL', '1-n',
                'ReferencedContentItemIdentifier');

        newDictionary[0x0050] = new Array();
        newDictionary[0x0050][0x0000] = new Array('UL', '1',
                'XRayAngioDeviceGroupLength');
        newDictionary[0x0050][0x0004] = new Array('CS', '1',
                'CalibrationObject');
        newDictionary[0x0050][0x0010] = new Array('SQ', '1', 'DeviceSequence');
        newDictionary[0x0050][0x0012] = new Array('CS', '1', 'DeviceType');
        newDictionary[0x0050][0x0014] = new Array('DS', '1', 'DeviceLength');
        newDictionary[0x0050][0x0016] = new Array('DS', '1', 'DeviceDiameter');
        newDictionary[0x0050][0x0017] = new Array('CS', '1',
                'DeviceDiameterUnits');
        newDictionary[0x0050][0x0018] = new Array('DS', '1', 'DeviceVolume');
        newDictionary[0x0050][0x0019] = new Array('DS', '1',
                'InterMarkerDistance');
        newDictionary[0x0050][0x0020] = new Array('LO', '1',
                'DeviceDescription');
        newDictionary[0x0050][0x0030] = new Array('SQ', '1',
                'CodedInterventionalDeviceSequence');

        newDictionary[0x0054] = new Array();
        newDictionary[0x0054][0x0000] = new Array('UL', '1',
                'NuclearMedicineGroupLength');
        newDictionary[0x0054][0x0010] = new Array('US', '1-n',
                'EnergyWindowVector');
        newDictionary[0x0054][0x0011] = new Array('US', '1',
                'NumberOfEnergyWindows');
        newDictionary[0x0054][0x0012] = new Array('SQ', '1',
                'EnergyWindowInformationSequence');
        newDictionary[0x0054][0x0013] = new Array('SQ', '1',
                'EnergyWindowRangeSequence');
        newDictionary[0x0054][0x0014] = new Array('DS', '1',
                'EnergyWindowLowerLimit');
        newDictionary[0x0054][0x0015] = new Array('DS', '1',
                'EnergyWindowUpperLimit');
        newDictionary[0x0054][0x0016] = new Array('SQ', '1',
                'RadiopharmaceuticalInformationSequence');
        newDictionary[0x0054][0x0017] = new Array('IS', '1',
                'ResidualSyringeCounts');
        newDictionary[0x0054][0x0018] = new Array('SH', '1', 'EnergyWindowName');
        newDictionary[0x0054][0x0020] = new Array('US', '1-n', 'DetectorVector');
        newDictionary[0x0054][0x0021] = new Array('US', '1',
                'NumberOfDetectors');
        newDictionary[0x0054][0x0022] = new Array('SQ', '1',
                'DetectorInformationSequence');
        newDictionary[0x0054][0x0030] = new Array('US', '1-n', 'PhaseVector');
        newDictionary[0x0054][0x0031] = new Array('US', '1', 'NumberOfPhases');
        newDictionary[0x0054][0x0032] = new Array('SQ', '1',
                'PhaseInformationSequence');
        newDictionary[0x0054][0x0033] = new Array('US', '1',
                'NumberOfFramesInPhase');
        newDictionary[0x0054][0x0036] = new Array('IS', '1', 'PhaseDelay');
        newDictionary[0x0054][0x0038] = new Array('IS', '1',
                'PauseBetweenFrames');
        newDictionary[0x0054][0x0050] = new Array('US', '1-n', 'RotationVector');
        newDictionary[0x0054][0x0051] = new Array('US', '1',
                'NumberOfRotations');
        newDictionary[0x0054][0x0052] = new Array('SQ', '1',
                'RotationInformationSequence');
        newDictionary[0x0054][0x0053] = new Array('US', '1',
                'NumberOfFramesInRotation');
        newDictionary[0x0054][0x0060] = new Array('US', '1-n',
                'RRIntervalVector');
        newDictionary[0x0054][0x0061] = new Array('US', '1',
                'NumberOfRRIntervals');
        newDictionary[0x0054][0x0062] = new Array('SQ', '1',
                'GatedInformationSequence');
        newDictionary[0x0054][0x0063] = new Array('SQ', '1',
                'DataInformationSequence');
        newDictionary[0x0054][0x0070] = new Array('US', '1-n', 'TimeSlotVector');
        newDictionary[0x0054][0x0071] = new Array('US', '1',
                'NumberOfTimeSlots');
        newDictionary[0x0054][0x0072] = new Array('SQ', '1',
                'TimeSlotInformationSequence');
        newDictionary[0x0054][0x0073] = new Array('DS', '1', 'TimeSlotTime');
        newDictionary[0x0054][0x0080] = new Array('US', '1-n', 'SliceVector');
        newDictionary[0x0054][0x0081] = new Array('US', '1', 'NumberOfSlices');
        newDictionary[0x0054][0x0090] = new Array('US', '1-n',
                'AngularViewVector');
        newDictionary[0x0054][0x0100] = new Array('US', '1-n',
                'TimeSliceVector');
        newDictionary[0x0054][0x0101] = new Array('US', '1',
                'NumberOfTimeSlices');
        newDictionary[0x0054][0x0200] = new Array('DS', '1', 'StartAngle');
        newDictionary[0x0054][0x0202] = new Array('CS', '1',
                'TypeOfDetectorMotion');
        newDictionary[0x0054][0x0210] = new Array('IS', '1-n', 'TriggerVector');
        newDictionary[0x0054][0x0211] = new Array('US', '1',
                'NumberOfTriggersInPhase');
        newDictionary[0x0054][0x0220] = new Array('SQ', '1', 'ViewCodeSequence');
        newDictionary[0x0054][0x0222] = new Array('SQ', '1',
                'ViewAngulationModifierCodeSequence');
        newDictionary[0x0054][0x0300] = new Array('SQ', '1',
                'RadionuclideCodeSequence');
        newDictionary[0x0054][0x0302] = new Array('SQ', '1',
                'AdministrationRouteCodeSequence');
        newDictionary[0x0054][0x0304] = new Array('SQ', '1',
                'RadiopharmaceuticalCodeSequence');
        newDictionary[0x0054][0x0306] = new Array('SQ', '1',
                'CalibrationDataSequence');
        newDictionary[0x0054][0x0308] = new Array('US', '1',
                'EnergyWindowNumber');
        newDictionary[0x0054][0x0400] = new Array('SH', '1', 'ImageID');
        newDictionary[0x0054][0x0410] = new Array('SQ', '1',
                'PatientOrientationCodeSequence');
        newDictionary[0x0054][0x0412] = new Array('SQ', '1',
                'PatientOrientationModifierCodeSequence');
        newDictionary[0x0054][0x0414] = new Array('SQ', '1',
                'PatientGantryRelationshipCodeSequence');
        newDictionary[0x0054][0x1000] = new Array('CS', '2', 'SeriesType');
        newDictionary[0x0054][0x1001] = new Array('CS', '1', 'Units');
        newDictionary[0x0054][0x1002] = new Array('CS', '1', 'CountsSource');
        newDictionary[0x0054][0x1004] = new Array('CS', '1',
                'ReprojectionMethod');
        newDictionary[0x0054][0x1100] = new Array('CS', '1',
                'RandomsCorrectionMethod');
        newDictionary[0x0054][0x1101] = new Array('LO', '1',
                'AttenuationCorrectionMethod');
        newDictionary[0x0054][0x1102] = new Array('CS', '1', 'DecayCorrection');
        newDictionary[0x0054][0x1103] = new Array('LO', '1',
                'ReconstructionMethod');
        newDictionary[0x0054][0x1104] = new Array('LO', '1',
                'DetectorLinesOfResponseUsed');
        newDictionary[0x0054][0x1105] = new Array('LO', '1',
                'ScatterCorrectionMethod');
        newDictionary[0x0054][0x1200] = new Array('DS', '1', 'AxialAcceptance');
        newDictionary[0x0054][0x1201] = new Array('IS', '2', 'AxialMash');
        newDictionary[0x0054][0x1202] = new Array('IS', '1', 'TransverseMash');
        newDictionary[0x0054][0x1203] = new Array('DS', '2',
                'DetectorElementSize');
        newDictionary[0x0054][0x1210] = new Array('DS', '1',
                'CoincidenceWindowWidth');
        newDictionary[0x0054][0x1220] = new Array('CS', '1-n',
                'SecondaryCountsType');
        newDictionary[0x0054][0x1300] = new Array('DS', '1',
                'FrameReferenceTime');
        newDictionary[0x0054][0x1310] = new Array('IS', '1',
                'PrimaryPromptsCountsAccumulated');
        newDictionary[0x0054][0x1311] = new Array('IS', '1-n',
                'SecondaryCountsAccumulated');
        newDictionary[0x0054][0x1320] = new Array('DS', '1',
                'SliceSensitivityFactor');
        newDictionary[0x0054][0x1321] = new Array('DS', '1', 'DecayFactor');
        newDictionary[0x0054][0x1322] = new Array('DS', '1',
                'DoseCalibrationFactor');
        newDictionary[0x0054][0x1323] = new Array('DS', '1',
                'ScatterFractionFactor');
        newDictionary[0x0054][0x1324] = new Array('DS', '1', 'DeadTimeFactor');
        newDictionary[0x0054][0x1330] = new Array('US', '1', 'ImageIndex');
        newDictionary[0x0054][0x1400] = new Array('CS', '1-n', 'CountsIncluded');
        newDictionary[0x0054][0x1401] = new Array('CS', '1',
                'DeadTimeCorrectionFlag');

        newDictionary[0x0060] = new Array();
        newDictionary[0x0060][0x0000] = new Array('UL', '1',
                'HistogramGroupLength');
        newDictionary[0x0060][0x3000] = new Array('SQ', '1',
                'HistogramSequence');
        newDictionary[0x0060][0x3002] = new Array('US', '1',
                'HistogramNumberofBins');
        newDictionary[0x0060][0x3004] = new Array('US/SS', '1',
                'HistogramFirstBinValue');
        newDictionary[0x0060][0x3006] = new Array('US/SS', '1',
                'HistogramLastBinValue');
        newDictionary[0x0060][0x3008] = new Array('US', '1',
                'HistogramBinWidth');
        newDictionary[0x0060][0x3010] = new Array('LO', '1',
                'HistogramExplanation');
        newDictionary[0x0060][0x3020] = new Array('UL', '1-n', 'HistogramData');

        newDictionary[0x0070] = new Array();
        newDictionary[0x0070][0x0001] = new Array('SQ', '1',
                'GraphicAnnotationSequence');
        newDictionary[0x0070][0x0002] = new Array('CS', '1', 'GraphicLayer');
        newDictionary[0x0070][0x0003] = new Array('CS', '1',
                'BoundingBoxAnnotationUnits');
        newDictionary[0x0070][0x0004] = new Array('CS', '1',
                'AnchorPointAnnotationUnits');
        newDictionary[0x0070][0x0005] = new Array('CS', '1',
                'GraphicAnnotationUnits');
        newDictionary[0x0070][0x0006] = new Array('ST', '1',
                'UnformattedTextValue');
        newDictionary[0x0070][0x0008] = new Array('SQ', '1',
                'TextObjectSequence');
        newDictionary[0x0070][0x0009] = new Array('SQ', '1',
                'GraphicObjectSequence');
        newDictionary[0x0070][0x0010] = new Array('FL', '2',
                'BoundingBoxTopLeftHandCorner');
        newDictionary[0x0070][0x0011] = new Array('FL', '2',
                'BoundingBoxBottomRightHandCorner');
        newDictionary[0x0070][0x0012] = new Array('CS', '1',
                'BoundingBoxTextHorizontalJustification');
        newDictionary[0x0070][0x0014] = new Array('FL', '2', 'AnchorPoint');
        newDictionary[0x0070][0x0015] = new Array('CS', '1',
                'AnchorPointVisibility');
        newDictionary[0x0070][0x0020] = new Array('US', '1',
                'GraphicDimensions');
        newDictionary[0x0070][0x0021] = new Array('US', '1',
                'NumberOfGraphicPoints');
        newDictionary[0x0070][0x0022] = new Array('FL', '2-n', 'GraphicData');
        newDictionary[0x0070][0x0023] = new Array('CS', '1', 'GraphicType');
        newDictionary[0x0070][0x0024] = new Array('CS', '1', 'GraphicFilled');
        newDictionary[0x0070][0x0040] = new Array('IS', '1',
                'ImageRotationFrozenDraftRetired');
        newDictionary[0x0070][0x0041] = new Array('CS', '1',
                'ImageHorizontalFlip');
        newDictionary[0x0070][0x0042] = new Array('US', '1', 'ImageRotation');
        newDictionary[0x0070][0x0050] = new Array('US', '2',
                'DisplayedAreaTLHCFrozenDraftRetired');
        newDictionary[0x0070][0x0051] = new Array('US', '2',
                'DisplayedAreaBRHCFrozenDraftRetired');
        newDictionary[0x0070][0x0052] = new Array('SL', '2',
                'DisplayedAreaTopLeftHandCorner');
        newDictionary[0x0070][0x0053] = new Array('SL', '2',
                'DisplayedAreaBottomRightHandCorner');
        newDictionary[0x0070][0x005A] = new Array('SQ', '1',
                'DisplayedAreaSelectionSequence');
        newDictionary[0x0070][0x0060] = new Array('SQ', '1',
                'GraphicLayerSequence');
        newDictionary[0x0070][0x0062] = new Array('IS', '1',
                'GraphicLayerOrder');
        newDictionary[0x0070][0x0066] = new Array('US', '1',
                'GraphicLayerRecommendedDisplayGrayscaleValue');
        newDictionary[0x0070][0x0067] = new Array('US', '3',
                'GraphicLayerRecommendedDisplayRGBValue');
        newDictionary[0x0070][0x0068] = new Array('LO', '1',
                'GraphicLayerDescription');
        newDictionary[0x0070][0x0080] = new Array('CS', '1',
                'PresentationLabel');
        newDictionary[0x0070][0x0081] = new Array('LO', '1',
                'PresentationDescription');
        newDictionary[0x0070][0x0082] = new Array('DA', '1',
                'PresentationCreationDate');
        newDictionary[0x0070][0x0083] = new Array('TM', '1',
                'PresentationCreationTime');
        newDictionary[0x0070][0x0084] = new Array('PN', '1',
                'PresentationCreatorsName');
        newDictionary[0x0070][0x0100] = new Array('CS', '1',
                'PresentationSizeMode');
        newDictionary[0x0070][0x0101] = new Array('DS', '2',
                'PresentationPixelSpacing');
        newDictionary[0x0070][0x0102] = new Array('IS', '2',
                'PresentationPixelAspectRatio');
        newDictionary[0x0070][0x0103] = new Array('FL', '1',
                'PresentationPixelMagnificationRatio');

        newDictionary[0x0088] = new Array();
        newDictionary[0x0088][0x0000] = new Array('UL', '1',
                'StorageGroupLength');
        newDictionary[0x0088][0x0130] = new Array('SH', '1',
                'StorageMediaFilesetID');
        newDictionary[0x0088][0x0140] = new Array('UI', '1',
                'StorageMediaFilesetUID');
        newDictionary[0x0088][0x0200] = new Array('SQ', '1', 'IconImage');
        newDictionary[0x0088][0x0904] = new Array('LO', '1', 'TopicTitle');
        newDictionary[0x0088][0x0906] = new Array('ST', '1', 'TopicSubject');
        newDictionary[0x0088][0x0910] = new Array('LO', '1', 'TopicAuthor');
        newDictionary[0x0088][0x0912] = new Array('LO', '3', 'TopicKeyWords');

        newDictionary[0x1000] = new Array();
        newDictionary[0x1000][0x0000] = new Array('UL', '1',
                'CodeTableGroupLength');
        newDictionary[0x1000][0x0010] = new Array('US', '3', 'EscapeTriplet');
        newDictionary[0x1000][0x0011] = new Array('US', '3', 'RunLengthTriplet');
        newDictionary[0x1000][0x0012] = new Array('US', '1', 'HuffmanTableSize');
        newDictionary[0x1000][0x0013] = new Array('US', '3',
                'HuffmanTableTriplet');
        newDictionary[0x1000][0x0014] = new Array('US', '1', 'ShiftTableSize');
        newDictionary[0x1000][0x0015] = new Array('US', '3',
                'ShiftTableTriplet');

        newDictionary[0x1010] = new Array();
        newDictionary[0x1010][0x0000] = new Array('UL', '1',
                'ZonalMapGroupLength');
        newDictionary[0x1010][0x0004] = new Array('US', '1-n', 'ZonalMap');

        newDictionary[0x2000] = new Array();
        newDictionary[0x2000][0x0000] = new Array('UL', '1',
                'FilmSessionGroupLength');
        newDictionary[0x2000][0x0010] = new Array('IS', '1', 'NumberOfCopies');
        newDictionary[0x2000][0x001E] = new Array('SQ', '1',
                'PrinterConfigurationSequence');
        newDictionary[0x2000][0x0020] = new Array('CS', '1', 'PrintPriority');
        newDictionary[0x2000][0x0030] = new Array('CS', '1', 'MediumType');
        newDictionary[0x2000][0x0040] = new Array('CS', '1', 'FilmDestination');
        newDictionary[0x2000][0x0050] = new Array('LO', '1', 'FilmSessionLabel');
        newDictionary[0x2000][0x0060] = new Array('IS', '1', 'MemoryAllocation');
        newDictionary[0x2000][0x0061] = new Array('IS', '1',
                'MaximumMemoryAllocation');
        newDictionary[0x2000][0x0062] = new Array('CS', '1',
                'ColorImagePrintingFlag');
        newDictionary[0x2000][0x0063] = new Array('CS', '1', 'CollationFlag');
        newDictionary[0x2000][0x0065] = new Array('CS', '1', 'AnnotationFlag');
        newDictionary[0x2000][0x0067] = new Array('CS', '1', 'ImageOverlayFlag');
        newDictionary[0x2000][0x0069] = new Array('CS', '1',
                'PresentationLUTFlag');
        newDictionary[0x2000][0x006A] = new Array('CS', '1',
                'ImageBoxPresentationLUTFlag');
        newDictionary[0x2000][0x00A0] = new Array('US', '1', 'MemoryBitDepth');
        newDictionary[0x2000][0x00A1] = new Array('US', '1', 'PrintingBitDepth');
        newDictionary[0x2000][0x00A2] = new Array('SQ', '1',
                'MediaInstalledSequence');
        newDictionary[0x2000][0x00A4] = new Array('SQ', '1',
                'OtherMediaAvailableSequence');
        newDictionary[0x2000][0x00A8] = new Array('SQ', '1',
                'SupportedImageDisplayFormatsSequence');
        newDictionary[0x2000][0x0500] = new Array('SQ', '1',
                'ReferencedFilmBoxSequence');
        newDictionary[0x2000][0x0510] = new Array('SQ', '1',
                'ReferencedStoredPrintSequence');

        newDictionary[0x2010] = new Array();
        newDictionary[0x2010][0x0000] = new Array('UL', '1',
                'FilmBoxGroupLength');
        newDictionary[0x2010][0x0010] = new Array('ST', '1',
                'ImageDisplayFormat');
        newDictionary[0x2010][0x0030] = new Array('CS', '1',
                'AnnotationDisplayFormatID');
        newDictionary[0x2010][0x0040] = new Array('CS', '1', 'FilmOrientation');
        newDictionary[0x2010][0x0050] = new Array('CS', '1', 'FilmSizeID');
        newDictionary[0x2010][0x0052] = new Array('CS', '1',
                'PrinterResolutionID');
        newDictionary[0x2010][0x0054] = new Array('CS', '1',
                'DefaultPrinterResolutionID');
        newDictionary[0x2010][0x0060] = new Array('CS', '1',
                'MagnificationType');
        newDictionary[0x2010][0x0080] = new Array('CS', '1', 'SmoothingType');
        newDictionary[0x2010][0x00A6] = new Array('CS', '1',
                'DefaultMagnificationType');
        newDictionary[0x2010][0x00A7] = new Array('CS', '1-n',
                'OtherMagnificationTypesAvailable');
        newDictionary[0x2010][0x00A8] = new Array('CS', '1',
                'DefaultSmoothingType');
        newDictionary[0x2010][0x00A9] = new Array('CS', '1-n',
                'OtherSmoothingTypesAvailable');
        newDictionary[0x2010][0x0100] = new Array('CS', '1', 'BorderDensity');
        newDictionary[0x2010][0x0110] = new Array('CS', '1',
                'EmptyImageDensity');
        newDictionary[0x2010][0x0120] = new Array('US', '1', 'MinDensity');
        newDictionary[0x2010][0x0130] = new Array('US', '1', 'MaxDensity');
        newDictionary[0x2010][0x0140] = new Array('CS', '1', 'Trim');
        newDictionary[0x2010][0x0150] = new Array('ST', '1',
                'ConfigurationInformation');
        newDictionary[0x2010][0x0152] = new Array('LT', '1',
                'ConfigurationInformationDescription');
        newDictionary[0x2010][0x0154] = new Array('IS', '1',
                'MaximumCollatedFilms');
        newDictionary[0x2010][0x015E] = new Array('US', '1', 'Illumination');
        newDictionary[0x2010][0x0160] = new Array('US', '1',
                'ReflectedAmbientLight');
        newDictionary[0x2010][0x0376] = new Array('DS', '2',
                'PrinterPixelSpacing');
        newDictionary[0x2010][0x0500] = new Array('SQ', '1',
                'ReferencedFilmSessionSequence');
        newDictionary[0x2010][0x0510] = new Array('SQ', '1',
                'ReferencedImageBoxSequence');
        newDictionary[0x2010][0x0520] = new Array('SQ', '1',
                'ReferencedBasicAnnotationBoxSequence');

        newDictionary[0x2020] = new Array();
        newDictionary[0x2020][0x0000] = new Array('UL', '1',
                'ImageBoxGroupLength');
        newDictionary[0x2020][0x0010] = new Array('US', '1', 'ImageBoxPosition');
        newDictionary[0x2020][0x0020] = new Array('CS', '1', 'Polarity');
        newDictionary[0x2020][0x0030] = new Array('DS', '1',
                'RequestedImageSize');
        newDictionary[0x2020][0x0040] = new Array('CS', '1',
                'RequestedDecimateCropBehavior');
        newDictionary[0x2020][0x0050] = new Array('CS', '1',
                'RequestedResolutionID');
        newDictionary[0x2020][0x00A0] = new Array('CS', '1',
                'RequestedImageSizeFlag');
        newDictionary[0x2020][0x00A2] = new Array('CS', '1',
                'DecimateCropResult');
        newDictionary[0x2020][0x0110] = new Array('SQ', '1',
                'PreformattedGrayscaleImageSequence');
        newDictionary[0x2020][0x0111] = new Array('SQ', '1',
                'PreformattedColorImageSequence');
        newDictionary[0x2020][0x0130] = new Array('SQ', '1',
                'ReferencedImageOverlayBoxSequence');
        newDictionary[0x2020][0x0140] = new Array('SQ', '1',
                'ReferencedVOILUTBoxSequence');

        newDictionary[0x2030] = new Array();
        newDictionary[0x2030][0x0000] = new Array('UL', '1',
                'AnnotationGroupLength');
        newDictionary[0x2030][0x0010] = new Array('US', '1',
                'AnnotationPosition');
        newDictionary[0x2030][0x0020] = new Array('LO', '1', 'TextString');

        newDictionary[0x2040] = new Array();
        newDictionary[0x2040][0x0000] = new Array('UL', '1',
                'OverlayBoxGroupLength');
        newDictionary[0x2040][0x0010] = new Array('SQ', '1',
                'ReferencedOverlayPlaneSequence');
        newDictionary[0x2040][0x0011] = new Array('US', '9',
                'ReferencedOverlayPlaneGroups');
        newDictionary[0x2040][0x0020] = new Array('SQ', '1',
                'OverlayPixelDataSequence');
        newDictionary[0x2040][0x0060] = new Array('CS', '1',
                'OverlayMagnificationType');
        newDictionary[0x2040][0x0070] = new Array('CS', '1',
                'OverlaySmoothingType');
        newDictionary[0x2040][0x0072] = new Array('CS', '1',
                'OverlayOrImageMagnification');
        newDictionary[0x2040][0x0074] = new Array('US', '1',
                'MagnifyToNumberOfColumns');
        newDictionary[0x2040][0x0080] = new Array('CS', '1',
                'OverlayForegroundDensity');
        newDictionary[0x2040][0x0082] = new Array('CS', '1',
                'OverlayBackgroundDensity');
        newDictionary[0x2040][0x0090] = new Array('CS', '1', 'OverlayMode');
        newDictionary[0x2040][0x0100] = new Array('CS', '1', 'ThresholdDensity');
        newDictionary[0x2040][0x0500] = new Array('SQ', '1',
                'ReferencedOverlayImageBoxSequence');

        newDictionary[0x2050] = new Array();
        newDictionary[0x2050][0x0000] = new Array('UL', '1',
                'PresentationLUTGroupLength');
        newDictionary[0x2050][0x0010] = new Array('SQ', '1',
                'PresentationLUTSequence');
        newDictionary[0x2050][0x0020] = new Array('CS', '1',
                'PresentationLUTShape');
        newDictionary[0x2050][0x0500] = new Array('SQ', '1',
                'ReferencedPresentationLUTSequence');

        newDictionary[0x2100] = new Array();
        newDictionary[0x2100][0x0000] = new Array('UL', '1',
                'PrintJobGroupLength');
        newDictionary[0x2100][0x0010] = new Array('SH', '1', 'PrintJobID');
        newDictionary[0x2100][0x0020] = new Array('CS', '1', 'ExecutionStatus');
        newDictionary[0x2100][0x0030] = new Array('CS', '1',
                'ExecutionStatusInfo');
        newDictionary[0x2100][0x0040] = new Array('DA', '1', 'CreationDate');
        newDictionary[0x2100][0x0050] = new Array('TM', '1', 'CreationTime');
        newDictionary[0x2100][0x0070] = new Array('AE', '1', 'Originator');
        newDictionary[0x2100][0x0140] = new Array('AE', '1', 'DestinationAE');
        newDictionary[0x2100][0x0160] = new Array('SH', '1', 'OwnerID');
        newDictionary[0x2100][0x0170] = new Array('IS', '1', 'NumberOfFilms');
        newDictionary[0x2100][0x0500] = new Array('SQ', '1',
                'ReferencedPrintJobSequence');

        newDictionary[0x2110] = new Array();
        newDictionary[0x2110][0x0000] = new Array('UL', '1',
                'PrinterGroupLength');
        newDictionary[0x2110][0x0010] = new Array('CS', '1', 'PrinterStatus');
        newDictionary[0x2110][0x0020] = new Array('CS', '1',
                'PrinterStatusInfo');
        newDictionary[0x2110][0x0030] = new Array('LO', '1', 'PrinterName');
        newDictionary[0x2110][0x0099] = new Array('SH', '1', 'PrintQueueID');

        newDictionary[0x2120] = new Array();
        newDictionary[0x2120][0x0000] = new Array('UL', '1', 'QueueGroupLength');
        newDictionary[0x2120][0x0010] = new Array('CS', '1', 'QueueStatus');
        newDictionary[0x2120][0x0050] = new Array('SQ', '1',
                'PrintJobDescriptionSequence');
        newDictionary[0x2120][0x0070] = new Array('SQ', '1',
                'QueueReferencedPrintJobSequence');

        newDictionary[0x2130] = new Array();
        newDictionary[0x2130][0x0000] = new Array('UL', '1',
                'PrintContentGroupLength');
        newDictionary[0x2130][0x0010] = new Array('SQ', '1',
                'PrintManagementCapabilitiesSequence');
        newDictionary[0x2130][0x0015] = new Array('SQ', '1',
                'PrinterCharacteristicsSequence');
        newDictionary[0x2130][0x0030] = new Array('SQ', '1',
                'FilmBoxContentSequence');
        newDictionary[0x2130][0x0040] = new Array('SQ', '1',
                'ImageBoxContentSequence');
        newDictionary[0x2130][0x0050] = new Array('SQ', '1',
                'AnnotationContentSequence');
        newDictionary[0x2130][0x0060] = new Array('SQ', '1',
                'ImageOverlayBoxContentSequence');
        newDictionary[0x2130][0x0080] = new Array('SQ', '1',
                'PresentationLUTContentSequence');
        newDictionary[0x2130][0x00A0] = new Array('SQ', '1',
                'ProposedStudySequence');
        newDictionary[0x2130][0x00C0] = new Array('SQ', '1',
                'OriginalImageSequence');

        newDictionary[0x3002] = new Array();
        newDictionary[0x3002][0x0000] = new Array('UL', '1',
                'RTImageGroupLength');
        newDictionary[0x3002][0x0002] = new Array('SH', '1', 'RTImageLabel');
        newDictionary[0x3002][0x0003] = new Array('LO', '1', 'RTImageName');
        newDictionary[0x3002][0x0004] = new Array('ST', '1',
                'RTImageDescription');
        newDictionary[0x3002][0x000A] = new Array('CS', '1',
                'ReportedValuesOrigin');
        newDictionary[0x3002][0x000C] = new Array('CS', '1', 'RTImagePlane');
        newDictionary[0x3002][0x000D] = new Array('DS', '3',
                'XRayImageReceptorTranslation');
        newDictionary[0x3002][0x000E] = new Array('DS', '1',
                'XRayImageReceptorAngle');
        newDictionary[0x3002][0x0010] = new Array('DS', '6',
                'RTImageOrientation');
        newDictionary[0x3002][0x0011] = new Array('DS', '2',
                'ImagePlanePixelSpacing');
        newDictionary[0x3002][0x0012] = new Array('DS', '2', 'RTImagePosition');
        newDictionary[0x3002][0x0020] = new Array('SH', '1',
                'RadiationMachineName');
        newDictionary[0x3002][0x0022] = new Array('DS', '1',
                'RadiationMachineSAD');
        newDictionary[0x3002][0x0024] = new Array('DS', '1',
                'RadiationMachineSSD');
        newDictionary[0x3002][0x0026] = new Array('DS', '1', 'RTImageSID');
        newDictionary[0x3002][0x0028] = new Array('DS', '1',
                'SourceToReferenceObjectDistance');
        newDictionary[0x3002][0x0029] = new Array('IS', '1', 'FractionNumber');
        newDictionary[0x3002][0x0030] = new Array('SQ', '1', 'ExposureSequence');
        newDictionary[0x3002][0x0032] = new Array('DS', '1', 'MetersetExposure');
        newDictionary[0x3002][0x0034] = new Array('DS', '4',
                'DiaphragmPosition');

        newDictionary[0x3004] = new Array();
        newDictionary[0x3004][0x0000] = new Array('UL', '1',
                'RTDoseGroupLength');
        newDictionary[0x3004][0x0001] = new Array('CS', '1', 'DVHType');
        newDictionary[0x3004][0x0002] = new Array('CS', '1', 'DoseUnits');
        newDictionary[0x3004][0x0004] = new Array('CS', '1', 'DoseType');
        newDictionary[0x3004][0x0006] = new Array('LO', '1', 'DoseComment');
        newDictionary[0x3004][0x0008] = new Array('DS', '3',
                'NormalizationPoint');
        newDictionary[0x3004][0x000A] = new Array('CS', '1',
                'DoseSummationType');
        newDictionary[0x3004][0x000C] = new Array('DS', '2-n',
                'GridFrameOffsetVector');
        newDictionary[0x3004][0x000E] = new Array('DS', '1', 'DoseGridScaling');
        newDictionary[0x3004][0x0010] = new Array('SQ', '1',
                'RTDoseROISequence');
        newDictionary[0x3004][0x0012] = new Array('DS', '1', 'DoseValue');
        newDictionary[0x3004][0x0040] = new Array('DS', '3',
                'DVHNormalizationPoint');
        newDictionary[0x3004][0x0042] = new Array('DS', '1',
                'DVHNormalizationDoseValue');
        newDictionary[0x3004][0x0050] = new Array('SQ', '1', 'DVHSequence');
        newDictionary[0x3004][0x0052] = new Array('DS', '1', 'DVHDoseScaling');
        newDictionary[0x3004][0x0054] = new Array('CS', '1', 'DVHVolumeUnits');
        newDictionary[0x3004][0x0056] = new Array('IS', '1', 'DVHNumberOfBins');
        newDictionary[0x3004][0x0058] = new Array('DS', '2-2n', 'DVHData');
        newDictionary[0x3004][0x0060] = new Array('SQ', '1',
                'DVHReferencedROISequence');
        newDictionary[0x3004][0x0062] = new Array('CS', '1',
                'DVHROIContributionType');
        newDictionary[0x3004][0x0070] = new Array('DS', '1', 'DVHMinimumDose');
        newDictionary[0x3004][0x0072] = new Array('DS', '1', 'DVHMaximumDose');
        newDictionary[0x3004][0x0074] = new Array('DS', '1', 'DVHMeanDose');

        newDictionary[0x3006] = new Array();
        newDictionary[0x3006][0x0000] = new Array('UL', '1',
                'RTStructureSetGroupLength');
        newDictionary[0x3006][0x0002] = new Array('SH', '1',
                'StructureSetLabel');
        newDictionary[0x3006][0x0004] = new Array('LO', '1', 'StructureSetName');
        newDictionary[0x3006][0x0006] = new Array('ST', '1',
                'StructureSetDescription');
        newDictionary[0x3006][0x0008] = new Array('DA', '1', 'StructureSetDate');
        newDictionary[0x3006][0x0009] = new Array('TM', '1', 'StructureSetTime');
        newDictionary[0x3006][0x0010] = new Array('SQ', '1',
                'ReferencedFrameOfReferenceSequence');
        newDictionary[0x3006][0x0012] = new Array('SQ', '1',
                'RTReferencedStudySequence');
        newDictionary[0x3006][0x0014] = new Array('SQ', '1',
                'RTReferencedSeriesSequence');
        newDictionary[0x3006][0x0016] = new Array('SQ', '1',
                'ContourImageSequence');
        newDictionary[0x3006][0x0020] = new Array('SQ', '1',
                'StructureSetROISequence');
        newDictionary[0x3006][0x0022] = new Array('IS', '1', 'ROINumber');
        newDictionary[0x3006][0x0024] = new Array('UI', '1',
                'ReferencedFrameOfReferenceUID');
        newDictionary[0x3006][0x0026] = new Array('LO', '1', 'ROIName');
        newDictionary[0x3006][0x0028] = new Array('ST', '1', 'ROIDescription');
        newDictionary[0x3006][0x002A] = new Array('IS', '3', 'ROIDisplayColor');
        newDictionary[0x3006][0x002C] = new Array('DS', '1', 'ROIVolume');
        newDictionary[0x3006][0x0030] = new Array('SQ', '1',
                'RTRelatedROISequence');
        newDictionary[0x3006][0x0033] = new Array('CS', '1',
                'RTROIRelationship');
        newDictionary[0x3006][0x0036] = new Array('CS', '1',
                'ROIGenerationAlgorithm');
        newDictionary[0x3006][0x0038] = new Array('LO', '1',
                'ROIGenerationDescription');
        newDictionary[0x3006][0x0039] = new Array('SQ', '1',
                'ROIContourSequence');
        newDictionary[0x3006][0x0040] = new Array('SQ', '1', 'ContourSequence');
        newDictionary[0x3006][0x0042] = new Array('CS', '1',
                'ContourGeometricType');
        newDictionary[0x3006][0x0044] = new Array('DS', '1',
                'ContourSlabThickness');
        newDictionary[0x3006][0x0045] = new Array('DS', '3',
                'ContourOffsetVector');
        newDictionary[0x3006][0x0046] = new Array('IS', '1',
                'NumberOfContourPoints');
        newDictionary[0x3006][0x0048] = new Array('IS', '1', 'ContourNumber');
        newDictionary[0x3006][0x0049] = new Array('IS', '1-n',
                'AttachedContours');
        newDictionary[0x3006][0x0050] = new Array('DS', '3-3n', 'ContourData');
        newDictionary[0x3006][0x0080] = new Array('SQ', '1',
                'RTROIObservationsSequence');
        newDictionary[0x3006][0x0082] = new Array('IS', '1',
                'ObservationNumber');
        newDictionary[0x3006][0x0084] = new Array('IS', '1',
                'ReferencedROINumber');
        newDictionary[0x3006][0x0085] = new Array('SH', '1',
                'ROIObservationLabel');
        newDictionary[0x3006][0x0086] = new Array('SQ', '1',
                'RTROIIdentificationCodeSequence');
        newDictionary[0x3006][0x0088] = new Array('ST', '1',
                'ROIObservationDescription');
        newDictionary[0x3006][0x00A0] = new Array('SQ', '1',
                'RelatedRTROIObservationsSequence');
        newDictionary[0x3006][0x00A4] = new Array('CS', '1',
                'RTROIInterpretedType');
        newDictionary[0x3006][0x00A6] = new Array('PN', '1', 'ROIInterpreter');
        newDictionary[0x3006][0x00B0] = new Array('SQ', '1',
                'ROIPhysicalPropertiesSequence');
        newDictionary[0x3006][0x00B2] = new Array('CS', '1',
                'ROIPhysicalProperty');
        newDictionary[0x3006][0x00B4] = new Array('DS', '1',
                'ROIPhysicalPropertyValue');
        newDictionary[0x3006][0x00C0] = new Array('SQ', '1',
                'FrameOfReferenceRelationshipSequence');
        newDictionary[0x3006][0x00C2] = new Array('UI', '1',
                'RelatedFrameOfReferenceUID');
        newDictionary[0x3006][0x00C4] = new Array('CS', '1',
                'FrameOfReferenceTransformationType');
        newDictionary[0x3006][0x00C6] = new Array('DS', '16',
                'FrameOfReferenceTransformationMatrix');
        newDictionary[0x3006][0x00C8] = new Array('LO', '1',
                'FrameOfReferenceTransformationComment');

        newDictionary[0x3008] = new Array();
        newDictionary[0x3008][0x0010] = new Array('SQ', '1',
                'MeasuredDoseReferenceSequence');
        newDictionary[0x3008][0x0012] = new Array('ST', '1',
                'MeasuredDoseDescription');
        newDictionary[0x3008][0x0014] = new Array('CS', '1', 'MeasuredDoseType');
        newDictionary[0x3008][0x0016] = new Array('DS', '1',
                'MeasuredDoseValue');
        newDictionary[0x3008][0x0020] = new Array('SQ', '1',
                'TreatmentSessionBeamSequence');
        newDictionary[0x3008][0x0022] = new Array('IS', '1',
                'CurrentFractionNumber');
        newDictionary[0x3008][0x0024] = new Array('DA', '1',
                'TreatmentControlPointDate');
        newDictionary[0x3008][0x0025] = new Array('TM', '1',
                'TreatmentControlPointTime');
        newDictionary[0x3008][0x002A] = new Array('CS', '1',
                'TreatmentTerminationStatus');
        newDictionary[0x3008][0x002B] = new Array('SH', '1',
                'TreatmentTerminationCode');
        newDictionary[0x3008][0x002C] = new Array('CS', '1',
                'TreatmentVerificationStatus');
        newDictionary[0x3008][0x0030] = new Array('SQ', '1',
                'ReferencedTreatmentRecordSequence');
        newDictionary[0x3008][0x0032] = new Array('DS', '1',
                'SpecifiedPrimaryMeterset');
        newDictionary[0x3008][0x0033] = new Array('DS', '1',
                'SpecifiedSecondaryMeterset');
        newDictionary[0x3008][0x0036] = new Array('DS', '1',
                'DeliveredPrimaryMeterset');
        newDictionary[0x3008][0x0037] = new Array('DS', '1',
                'DeliveredSecondaryMeterset');
        newDictionary[0x3008][0x003A] = new Array('DS', '1',
                'SpecifiedTreatmentTime');
        newDictionary[0x3008][0x003B] = new Array('DS', '1',
                'DeliveredTreatmentTime');
        newDictionary[0x3008][0x0040] = new Array('SQ', '1',
                'ControlPointDeliverySequence');
        newDictionary[0x3008][0x0042] = new Array('DS', '1',
                'SpecifiedMeterset');
        newDictionary[0x3008][0x0044] = new Array('DS', '1',
                'DeliveredMeterset');
        newDictionary[0x3008][0x0048] = new Array('DS', '1',
                'DoseRateDelivered');
        newDictionary[0x3008][0x0050] = new Array('SQ', '1',
                'TreatmentSummaryCalculatedDoseReferenceSequence');
        newDictionary[0x3008][0x0052] = new Array('DS', '1',
                'CumulativeDosetoDoseReference');
        newDictionary[0x3008][0x0054] = new Array('DA', '1',
                'FirstTreatmentDate');
        newDictionary[0x3008][0x0056] = new Array('DA', '1',
                'MostRecentTreatmentDate');
        newDictionary[0x3008][0x005A] = new Array('IS', '1',
                'NumberofFractionsDelivered');
        newDictionary[0x3008][0x0060] = new Array('SQ', '1', 'OverrideSequence');
        newDictionary[0x3008][0x0062] = new Array('AT', '1',
                'OverrideParameterPointer');
        newDictionary[0x3008][0x0064] = new Array('IS', '1',
                'MeasuredDoseReferenceNumber');
        newDictionary[0x3008][0x0066] = new Array('ST', '1', 'OverrideReason');
        newDictionary[0x3008][0x0070] = new Array('SQ', '1',
                'CalculatedDoseReferenceSequence');
        newDictionary[0x3008][0x0072] = new Array('IS', '1',
                'CalculatedDoseReferenceNumber');
        newDictionary[0x3008][0x0074] = new Array('ST', '1',
                'CalculatedDoseReferenceDescription');
        newDictionary[0x3008][0x0076] = new Array('DS', '1',
                'CalculatedDoseReferenceDoseValue');
        newDictionary[0x3008][0x0078] = new Array('DS', '1', 'StartMeterset');
        newDictionary[0x3008][0x007A] = new Array('DS', '1', 'EndMeterset');
        newDictionary[0x3008][0x0080] = new Array('SQ', '1',
                'ReferencedMeasuredDoseReferenceSequence');
        newDictionary[0x3008][0x0082] = new Array('IS', '1',
                'ReferencedMeasuredDoseReferenceNumber');
        newDictionary[0x3008][0x0090] = new Array('SQ', '1',
                'ReferencedCalculatedDoseReferenceSequence');
        newDictionary[0x3008][0x0092] = new Array('IS', '1',
                'ReferencedCalculatedDoseReferenceNumber');
        newDictionary[0x3008][0x00A0] = new Array('SQ', '1',
                'BeamLimitingDeviceLeafPairsSequence');
        newDictionary[0x3008][0x00B0] = new Array('SQ', '1',
                'RecordedWedgeSequence');
        newDictionary[0x3008][0x00C0] = new Array('SQ', '1',
                'RecordedCompensatorSequence');
        newDictionary[0x3008][0x00D0] = new Array('SQ', '1',
                'RecordedBlockSequence');
        newDictionary[0x3008][0x00E0] = new Array('SQ', '1',
                'TreatmentSummaryMeasuredDoseReferenceSequence');
        newDictionary[0x3008][0x0100] = new Array('SQ', '1',
                'RecordedSourceSequence');
        newDictionary[0x3008][0x0105] = new Array('LO', '1',
                'SourceSerialNumber');
        newDictionary[0x3008][0x0110] = new Array('SQ', '1',
                'TreatmentSessionApplicationSetupSequence');
        newDictionary[0x3008][0x0116] = new Array('CS', '1',
                'ApplicationSetupCheck');
        newDictionary[0x3008][0x0120] = new Array('SQ', '1',
                'RecordedBrachyAccessoryDeviceSequence');
        newDictionary[0x3008][0x0122] = new Array('IS', '1',
                'ReferencedBrachyAccessoryDeviceNumber');
        newDictionary[0x3008][0x0130] = new Array('SQ', '1',
                'RecordedChannelSequence');
        newDictionary[0x3008][0x0132] = new Array('DS', '1',
                'SpecifiedChannelTotalTime');
        newDictionary[0x3008][0x0134] = new Array('DS', '1',
                'DeliveredChannelTotalTime');
        newDictionary[0x3008][0x0136] = new Array('IS', '1',
                'SpecifiedNumberofPulses');
        newDictionary[0x3008][0x0138] = new Array('IS', '1',
                'DeliveredNumberofPulses');
        newDictionary[0x3008][0x013A] = new Array('DS', '1',
                'SpecifiedPulseRepetitionInterval');
        newDictionary[0x3008][0x013C] = new Array('DS', '1',
                'DeliveredPulseRepetitionInterval');
        newDictionary[0x3008][0x0140] = new Array('SQ', '1',
                'RecordedSourceApplicatorSequence');
        newDictionary[0x3008][0x0142] = new Array('IS', '1',
                'ReferencedSourceApplicatorNumber');
        newDictionary[0x3008][0x0150] = new Array('SQ', '1',
                'RecordedChannelShieldSequence');
        newDictionary[0x3008][0x0152] = new Array('IS', '1',
                'ReferencedChannelShieldNumber');
        newDictionary[0x3008][0x0160] = new Array('SQ', '1',
                'BrachyControlPointDeliveredSequence');
        newDictionary[0x3008][0x0162] = new Array('DA', '1',
                'SafePositionExitDate');
        newDictionary[0x3008][0x0164] = new Array('TM', '1',
                'SafePositionExitTime');
        newDictionary[0x3008][0x0166] = new Array('DA', '1',
                'SafePositionReturnDate');
        newDictionary[0x3008][0x0168] = new Array('TM', '1',
                'SafePositionReturnTime');
        newDictionary[0x3008][0x0200] = new Array('CS', '1',
                'CurrentTreatmentStatus');
        newDictionary[0x3008][0x0202] = new Array('ST', '1',
                'TreatmentStatusComment');
        newDictionary[0x3008][0x0220] = new Array('SQ', '1',
                'FractionGroupSummarySequence');
        newDictionary[0x3008][0x0223] = new Array('IS', '1',
                'ReferencedFractionNumber');
        newDictionary[0x3008][0x0224] = new Array('CS', '1',
                'FractionGroupType');
        newDictionary[0x3008][0x0230] = new Array('CS', '1',
                'BeamStopperPosition');
        newDictionary[0x3008][0x0240] = new Array('SQ', '1',
                'FractionStatusSummarySequence');
        newDictionary[0x3008][0x0250] = new Array('DA', '1', 'TreatmentDate');
        newDictionary[0x3008][0x0251] = new Array('TM', '1', 'TreatmentTime');

        newDictionary[0x300A] = new Array();
        newDictionary[0x300A][0x0000] = new Array('UL', '1',
                'RTPlanGroupLength');
        newDictionary[0x300A][0x0002] = new Array('SH', '1', 'RTPlanLabel');
        newDictionary[0x300A][0x0003] = new Array('LO', '1', 'RTPlanName');
        newDictionary[0x300A][0x0004] = new Array('ST', '1',
                'RTPlanDescription');
        newDictionary[0x300A][0x0006] = new Array('DA', '1', 'RTPlanDate');
        newDictionary[0x300A][0x0007] = new Array('TM', '1', 'RTPlanTime');
        newDictionary[0x300A][0x0009] = new Array('LO', '1-n',
                'TreatmentProtocols');
        newDictionary[0x300A][0x000A] = new Array('CS', '1', 'TreatmentIntent');
        newDictionary[0x300A][0x000B] = new Array('LO', '1-n', 'TreatmentSites');
        newDictionary[0x300A][0x000C] = new Array('CS', '1', 'RTPlanGeometry');
        newDictionary[0x300A][0x000E] = new Array('ST', '1',
                'PrescriptionDescription');
        newDictionary[0x300A][0x0010] = new Array('SQ', '1',
                'DoseReferenceSequence');
        newDictionary[0x300A][0x0012] = new Array('IS', '1',
                'DoseReferenceNumber');
        newDictionary[0x300A][0x0014] = new Array('CS', '1',
                'DoseReferenceStructureType');
        newDictionary[0x300A][0x0015] = new Array('CS', '1',
                'NominalBeamEnergyUnit');
        newDictionary[0x300A][0x0016] = new Array('LO', '1',
                'DoseReferenceDescription');
        newDictionary[0x300A][0x0018] = new Array('DS', '3',
                'DoseReferencePointCoordinates');
        newDictionary[0x300A][0x001A] = new Array('DS', '1', 'NominalPriorDose');
        newDictionary[0x300A][0x0020] = new Array('CS', '1',
                'DoseReferenceType');
        newDictionary[0x300A][0x0021] = new Array('DS', '1', 'ConstraintWeight');
        newDictionary[0x300A][0x0022] = new Array('DS', '1',
                'DeliveryWarningDose');
        newDictionary[0x300A][0x0023] = new Array('DS', '1',
                'DeliveryMaximumDose');
        newDictionary[0x300A][0x0025] = new Array('DS', '1',
                'TargetMinimumDose');
        newDictionary[0x300A][0x0026] = new Array('DS', '1',
                'TargetPrescriptionDose');
        newDictionary[0x300A][0x0027] = new Array('DS', '1',
                'TargetMaximumDose');
        newDictionary[0x300A][0x0028] = new Array('DS', '1',
                'TargetUnderdoseVolumeFraction');
        newDictionary[0x300A][0x002A] = new Array('DS', '1',
                'OrganAtRiskFullVolumeDose');
        newDictionary[0x300A][0x002B] = new Array('DS', '1',
                'OrganAtRiskLimitDose');
        newDictionary[0x300A][0x002C] = new Array('DS', '1',
                'OrganAtRiskMaximumDose');
        newDictionary[0x300A][0x002D] = new Array('DS', '1',
                'OrganAtRiskOverdoseVolumeFraction');
        newDictionary[0x300A][0x0040] = new Array('SQ', '1',
                'ToleranceTableSequence');
        newDictionary[0x300A][0x0042] = new Array('IS', '1',
                'ToleranceTableNumber');
        newDictionary[0x300A][0x0043] = new Array('SH', '1',
                'ToleranceTableLabel');
        newDictionary[0x300A][0x0044] = new Array('DS', '1',
                'GantryAngleTolerance');
        newDictionary[0x300A][0x0046] = new Array('DS', '1',
                'BeamLimitingDeviceAngleTolerance');
        newDictionary[0x300A][0x0048] = new Array('SQ', '1',
                'BeamLimitingDeviceToleranceSequence');
        newDictionary[0x300A][0x004A] = new Array('DS', '1',
                'BeamLimitingDevicePositionTolerance');
        newDictionary[0x300A][0x004C] = new Array('DS', '1',
                'PatientSupportAngleTolerance');
        newDictionary[0x300A][0x004E] = new Array('DS', '1',
                'TableTopEccentricAngleTolerance');
        newDictionary[0x300A][0x0051] = new Array('DS', '1',
                'TableTopVerticalPositionTolerance');
        newDictionary[0x300A][0x0052] = new Array('DS', '1',
                'TableTopLongitudinalPositionTolerance');
        newDictionary[0x300A][0x0053] = new Array('DS', '1',
                'TableTopLateralPositionTolerance');
        newDictionary[0x300A][0x0055] = new Array('CS', '1',
                'RTPlanRelationship');
        newDictionary[0x300A][0x0070] = new Array('SQ', '1',
                'FractionGroupSequence');
        newDictionary[0x300A][0x0071] = new Array('IS', '1',
                'FractionGroupNumber');
        newDictionary[0x300A][0x0078] = new Array('IS', '1',
                'NumberOfFractionsPlanned');
        // newDictionary[0x300A][0x0079] = new
        // Array('IS','1','NumberOfFractionsPerDay'); /// Changed
        newDictionary[0x300A][0x0079] = new Array('IS', '1',
                'NumberOfFractionsPatternDigistsPerDay');
        newDictionary[0x300A][0x007A] = new Array('IS', '1',
                'RepeatFractionCycleLength');
        newDictionary[0x300A][0x007B] = new Array('LT', '1', 'FractionPattern');
        newDictionary[0x300A][0x0080] = new Array('IS', '1', 'NumberOfBeams');
        newDictionary[0x300A][0x0082] = new Array('DS', '3',
                'BeamDoseSpecificationPoint');
        newDictionary[0x300A][0x0084] = new Array('DS', '1', 'BeamDose');
        newDictionary[0x300A][0x0086] = new Array('DS', '1', 'BeamMeterset');
        newDictionary[0x300A][0x00A0] = new Array('IS', '1',
                'NumberOfBrachyApplicationSetups');
        newDictionary[0x300A][0x00A2] = new Array('DS', '3',
                'BrachyApplicationSetupDoseSpecificationPoint');
        newDictionary[0x300A][0x00A4] = new Array('DS', '1',
                'BrachyApplicationSetupDose');
        newDictionary[0x300A][0x00B0] = new Array('SQ', '1', 'BeamSequence');
        newDictionary[0x300A][0x00B2] = new Array('SH', '1',
                'TreatmentMachineName');
        newDictionary[0x300A][0x00B3] = new Array('CS', '1',
                'PrimaryDosimeterUnit');
        newDictionary[0x300A][0x00B4] = new Array('DS', '1',
                'SourceAxisDistance');
        newDictionary[0x300A][0x00B6] = new Array('SQ', '1',
                'BeamLimitingDeviceSequence');
        newDictionary[0x300A][0x00B8] = new Array('CS', '1',
                'RTBeamLimitingDeviceType');
        newDictionary[0x300A][0x00BA] = new Array('DS', '1',
                'SourceToBeamLimitingDeviceDistance');
        newDictionary[0x300A][0x00BC] = new Array('IS', '1',
                'NumberOfLeafJawPairs');
        newDictionary[0x300A][0x00BE] = new Array('DS', '3-n',
                'LeafPositionBoundaries');
        newDictionary[0x300A][0x00C0] = new Array('IS', '1', 'BeamNumber');
        newDictionary[0x300A][0x00C2] = new Array('LO', '1', 'BeamName');
        newDictionary[0x300A][0x00C3] = new Array('ST', '1', 'BeamDescription');
        newDictionary[0x300A][0x00C4] = new Array('CS', '1', 'BeamType');
        newDictionary[0x300A][0x00C6] = new Array('CS', '1', 'RadiationType');
        newDictionary[0x300A][0x00C8] = new Array('IS', '1',
                'ReferenceImageNumber');
        newDictionary[0x300A][0x00CA] = new Array('SQ', '1',
                'PlannedVerificationImageSequence');
        newDictionary[0x300A][0x00CC] = new Array('LO', '1-n',
                'ImagingDeviceSpecificAcquisitionParameters');
        newDictionary[0x300A][0x00CE] = new Array('CS', '1',
                'TreatmentDeliveryType');
        newDictionary[0x300A][0x00D0] = new Array('IS', '1', 'NumberOfWedges');
        newDictionary[0x300A][0x00D1] = new Array('SQ', '1', 'WedgeSequence');
        newDictionary[0x300A][0x00D2] = new Array('IS', '1', 'WedgeNumber');
        newDictionary[0x300A][0x00D3] = new Array('CS', '1', 'WedgeType');
        newDictionary[0x300A][0x00D4] = new Array('SH', '1', 'WedgeID');
        newDictionary[0x300A][0x00D5] = new Array('IS', '1', 'WedgeAngle');
        newDictionary[0x300A][0x00D6] = new Array('DS', '1', 'WedgeFactor');
        newDictionary[0x300A][0x00D8] = new Array('DS', '1', 'WedgeOrientation');
        newDictionary[0x300A][0x00DA] = new Array('DS', '1',
                'SourceToWedgeTrayDistance');
        newDictionary[0x300A][0x00E0] = new Array('IS', '1',
                'NumberOfCompensators');
        newDictionary[0x300A][0x00E1] = new Array('SH', '1', 'MaterialID');
        newDictionary[0x300A][0x00E2] = new Array('DS', '1',
                'TotalCompensatorTrayFactor');
        newDictionary[0x300A][0x00E3] = new Array('SQ', '1',
                'CompensatorSequence');
        newDictionary[0x300A][0x00E4] = new Array('IS', '1',
                'CompensatorNumber');
        newDictionary[0x300A][0x00E5] = new Array('SH', '1', 'CompensatorID');
        newDictionary[0x300A][0x00E6] = new Array('DS', '1',
                'SourceToCompensatorTrayDistance');
        newDictionary[0x300A][0x00E7] = new Array('IS', '1', 'CompensatorRows');
        newDictionary[0x300A][0x00E8] = new Array('IS', '1',
                'CompensatorColumns');
        newDictionary[0x300A][0x00E9] = new Array('DS', '2',
                'CompensatorPixelSpacing');
        newDictionary[0x300A][0x00EA] = new Array('DS', '2',
                'CompensatorPosition');
        newDictionary[0x300A][0x00EB] = new Array('DS', '1-n',
                'CompensatorTransmissionData');
        newDictionary[0x300A][0x00EC] = new Array('DS', '1-n',
                'CompensatorThicknessData');
        newDictionary[0x300A][0x00ED] = new Array('IS', '1', 'NumberOfBoli');
        newDictionary[0x300A][0x00EE] = new Array('CS', '1', 'CompensatorType');
        newDictionary[0x300A][0x00F0] = new Array('IS', '1', 'NumberOfBlocks');
        newDictionary[0x300A][0x00F2] = new Array('DS', '1',
                'TotalBlockTrayFactor');
        newDictionary[0x300A][0x00F4] = new Array('SQ', '1', 'BlockSequence');
        newDictionary[0x300A][0x00F5] = new Array('SH', '1', 'BlockTrayID');
        newDictionary[0x300A][0x00F6] = new Array('DS', '1',
                'SourceToBlockTrayDistance');
        newDictionary[0x300A][0x00F8] = new Array('CS', '1', 'BlockType');
        newDictionary[0x300A][0x00FA] = new Array('CS', '1', 'BlockDivergence');
        newDictionary[0x300A][0x00FC] = new Array('IS', '1', 'BlockNumber');
        newDictionary[0x300A][0x00FE] = new Array('LO', '1', 'BlockName');
        newDictionary[0x300A][0x0100] = new Array('DS', '1', 'BlockThickness');
        newDictionary[0x300A][0x0102] = new Array('DS', '1',
                'BlockTransmission');
        newDictionary[0x300A][0x0104] = new Array('IS', '1',
                'BlockNumberOfPoints');
        newDictionary[0x300A][0x0106] = new Array('DS', '2-2n', 'BlockData');
        newDictionary[0x300A][0x0107] = new Array('SQ', '1',
                'ApplicatorSequence');
        newDictionary[0x300A][0x0108] = new Array('SH', '1', 'ApplicatorID');
        newDictionary[0x300A][0x0109] = new Array('CS', '1', 'ApplicatorType');
        newDictionary[0x300A][0x010A] = new Array('LO', '1',
                'ApplicatorDescription');
        newDictionary[0x300A][0x010C] = new Array('DS', '1',
                'CumulativeDoseReferenceCoefficient');
        newDictionary[0x300A][0x010E] = new Array('DS', '1',
                'FinalCumulativeMetersetWeight');
        newDictionary[0x300A][0x0110] = new Array('IS', '1',
                'NumberOfControlPoints');
        newDictionary[0x300A][0x0111] = new Array('SQ', '1',
                'ControlPointSequence');
        newDictionary[0x300A][0x0112] = new Array('IS', '1',
                'ControlPointIndex');
        newDictionary[0x300A][0x0114] = new Array('DS', '1',
                'NominalBeamEnergy');
        newDictionary[0x300A][0x0115] = new Array('DS', '1', 'DoseRateSet');
        newDictionary[0x300A][0x0116] = new Array('SQ', '1',
                'WedgePositionSequence');
        newDictionary[0x300A][0x0118] = new Array('CS', '1', 'WedgePosition');
        newDictionary[0x300A][0x011A] = new Array('SQ', '1',
                'BeamLimitingDevicePositionSequence');
        newDictionary[0x300A][0x011C] = new Array('DS', '2-2n',
                'LeafJawPositions');
        newDictionary[0x300A][0x011E] = new Array('DS', '1', 'GantryAngle');
        newDictionary[0x300A][0x011F] = new Array('CS', '1',
                'GantryRotationDirection');
        newDictionary[0x300A][0x0120] = new Array('DS', '1',
                'BeamLimitingDeviceAngle');
        newDictionary[0x300A][0x0121] = new Array('CS', '1',
                'BeamLimitingDeviceRotationDirection');
        newDictionary[0x300A][0x0122] = new Array('DS', '1',
                'PatientSupportAngle');
        newDictionary[0x300A][0x0123] = new Array('CS', '1',
                'PatientSupportRotationDirection');
        newDictionary[0x300A][0x0124] = new Array('DS', '1',
                'TableTopEccentricAxisDistance');
        newDictionary[0x300A][0x0125] = new Array('DS', '1',
                'TableTopEccentricAngle');
        newDictionary[0x300A][0x0126] = new Array('CS', '1',
                'TableTopEccentricRotationDirection');
        newDictionary[0x300A][0x0128] = new Array('DS', '1',
                'TableTopVerticalPosition');
        newDictionary[0x300A][0x0129] = new Array('DS', '1',
                'TableTopLongitudinalPosition');
        newDictionary[0x300A][0x012A] = new Array('DS', '1',
                'TableTopLateralPosition');
        newDictionary[0x300A][0x012C] = new Array('DS', '3',
                'IsocenterPosition');
        newDictionary[0x300A][0x012E] = new Array('DS', '3',
                'SurfaceEntryPoint');
        newDictionary[0x300A][0x0130] = new Array('DS', '1',
                'SourceToSurfaceDistance');
        newDictionary[0x300A][0x0134] = new Array('DS', '1',
                'CumulativeMetersetWeight');
        newDictionary[0x300A][0x0140] = new Array('FL', '1',
                'TableTopPitchAngle');
        newDictionary[0x300A][0x0142] = new Array('CS', '1',
                'TableTopPitchRotationDirection');
        newDictionary[0x300A][0x0144] = new Array('FL', '1',
                'TableTopRollAngle');
        newDictionary[0x300A][0x0146] = new Array('CS', '1',
                'TableTopRollRotationDirection');
        newDictionary[0x300A][0x0148] = new Array('FL', '1',
                'HeadFixationAngle');
        newDictionary[0x300A][0x014A] = new Array('FL', '1', 'GantryPitchAngle');
        newDictionary[0x300A][0x014C] = new Array('CS', '1',
                'GantryPitchRotationDirection');
        newDictionary[0x300A][0x014E] = new Array('FL', '1',
                'GantryPitchAngleTolerance');
        newDictionary[0x300A][0x0180] = new Array('SQ', '1',
                'PatientSetupSequence');
        newDictionary[0x300A][0x0182] = new Array('IS', '1',
                'PatientSetupNumber');
        newDictionary[0x300A][0x0184] = new Array('LO', '1',
                'PatientAdditionalPosition');
        newDictionary[0x300A][0x0190] = new Array('SQ', '1',
                'FixationDeviceSequence');
        newDictionary[0x300A][0x0192] = new Array('CS', '1',
                'FixationDeviceType');
        newDictionary[0x300A][0x0194] = new Array('SH', '1',
                'FixationDeviceLabel');
        newDictionary[0x300A][0x0196] = new Array('ST', '1',
                'FixationDeviceDescription');
        newDictionary[0x300A][0x0198] = new Array('SH', '1',
                'FixationDevicePosition');
        newDictionary[0x300A][0x01A0] = new Array('SQ', '1',
                'ShieldingDeviceSequence');
        newDictionary[0x300A][0x01A2] = new Array('CS', '1',
                'ShieldingDeviceType');
        newDictionary[0x300A][0x01A4] = new Array('SH', '1',
                'ShieldingDeviceLabel');
        newDictionary[0x300A][0x01A6] = new Array('ST', '1',
                'ShieldingDeviceDescription');
        newDictionary[0x300A][0x01A8] = new Array('SH', '1',
                'ShieldingDevicePosition');
        newDictionary[0x300A][0x01B0] = new Array('CS', '1', 'SetupTechnique');
        newDictionary[0x300A][0x01B2] = new Array('ST', '1',
                'SetupTechniqueDescription');
        newDictionary[0x300A][0x01B4] = new Array('SQ', '1',
                'SetupDeviceSequence');
        newDictionary[0x300A][0x01B6] = new Array('CS', '1', 'SetupDeviceType');
        newDictionary[0x300A][0x01B8] = new Array('SH', '1', 'SetupDeviceLabel');
        newDictionary[0x300A][0x01BA] = new Array('ST', '1',
                'SetupDeviceDescription');
        newDictionary[0x300A][0x01BC] = new Array('DS', '1',
                'SetupDeviceParameter');
        newDictionary[0x300A][0x01D0] = new Array('ST', '1',
                'SetupReferenceDescription');
        newDictionary[0x300A][0x01D2] = new Array('DS', '1',
                'TableTopVerticalSetupDisplacement');
        newDictionary[0x300A][0x01D4] = new Array('DS', '1',
                'TableTopLongitudinalSetupDisplacement');
        newDictionary[0x300A][0x01D6] = new Array('DS', '1',
                'TableTopLateralSetupDisplacement');
        newDictionary[0x300A][0x0200] = new Array('CS', '1',
                'BrachyTreatmentTechnique');
        newDictionary[0x300A][0x0202] = new Array('CS', '1',
                'BrachyTreatmentType');
        newDictionary[0x300A][0x0206] = new Array('SQ', '1',
                'TreatmentMachineSequence');
        newDictionary[0x300A][0x0210] = new Array('SQ', '1', 'SourceSequence');
        newDictionary[0x300A][0x0212] = new Array('IS', '1', 'SourceNumber');
        newDictionary[0x300A][0x0214] = new Array('CS', '1', 'SourceType');
        newDictionary[0x300A][0x0216] = new Array('LO', '1',
                'SourceManufacturer');
        newDictionary[0x300A][0x0218] = new Array('DS', '1',
                'ActiveSourceDiameter');
        newDictionary[0x300A][0x021A] = new Array('DS', '1',
                'ActiveSourceLength');
        newDictionary[0x300A][0x0222] = new Array('DS', '1',
                'SourceEncapsulationNominalThickness');
        newDictionary[0x300A][0x0224] = new Array('DS', '1',
                'SourceEncapsulationNominalTransmission');
        newDictionary[0x300A][0x0226] = new Array('LO', '1',
                'SourceIsotopeName');
        newDictionary[0x300A][0x0228] = new Array('DS', '1',
                'SourceIsotopeHalfLife');
        newDictionary[0x300A][0x022A] = new Array('DS', '1',
                'ReferenceAirKermaRate');
        newDictionary[0x300A][0x022C] = new Array('DA', '1',
                'AirKermaRateReferenceDate');
        newDictionary[0x300A][0x022E] = new Array('TM', '1',
                'AirKermaRateReferenceTime');
        newDictionary[0x300A][0x0230] = new Array('SQ', '1',
                'ApplicationSetupSequence');
        newDictionary[0x300A][0x0232] = new Array('CS', '1',
                'ApplicationSetupType');
        newDictionary[0x300A][0x0234] = new Array('IS', '1',
                'ApplicationSetupNumber');
        newDictionary[0x300A][0x0236] = new Array('LO', '1',
                'ApplicationSetupName');
        newDictionary[0x300A][0x0238] = new Array('LO', '1',
                'ApplicationSetupManufacturer');
        newDictionary[0x300A][0x0240] = new Array('IS', '1', 'TemplateNumber');
        newDictionary[0x300A][0x0242] = new Array('SH', '1', 'TemplateType');
        newDictionary[0x300A][0x0244] = new Array('LO', '1', 'TemplateName');
        newDictionary[0x300A][0x0250] = new Array('DS', '1',
                'TotalReferenceAirKerma');
        newDictionary[0x300A][0x0260] = new Array('SQ', '1',
                'BrachyAccessoryDeviceSequence');
        newDictionary[0x300A][0x0262] = new Array('IS', '1',
                'BrachyAccessoryDeviceNumber');
        newDictionary[0x300A][0x0263] = new Array('SH', '1',
                'BrachyAccessoryDeviceID');
        newDictionary[0x300A][0x0264] = new Array('CS', '1',
                'BrachyAccessoryDeviceType');
        newDictionary[0x300A][0x0266] = new Array('LO', '1',
                'BrachyAccessoryDeviceName');
        newDictionary[0x300A][0x026A] = new Array('DS', '1',
                'BrachyAccessoryDeviceNominalThickness');
        newDictionary[0x300A][0x026C] = new Array('DS', '1',
                'BrachyAccessoryDeviceNominalTransmission');
        newDictionary[0x300A][0x0280] = new Array('SQ', '1', 'ChannelSequence');
        newDictionary[0x300A][0x0282] = new Array('IS', '1', 'ChannelNumber');
        newDictionary[0x300A][0x0284] = new Array('DS', '1', 'ChannelLength');
        newDictionary[0x300A][0x0286] = new Array('DS', '1', 'ChannelTotalTime');
        newDictionary[0x300A][0x0288] = new Array('CS', '1',
                'SourceMovementType');
        newDictionary[0x300A][0x028A] = new Array('IS', '1', 'NumberOfPulses');
        newDictionary[0x300A][0x028C] = new Array('DS', '1',
                'PulseRepetitionInterval');
        newDictionary[0x300A][0x0290] = new Array('IS', '1',
                'SourceApplicatorNumber');
        newDictionary[0x300A][0x0291] = new Array('SH', '1',
                'SourceApplicatorID');
        newDictionary[0x300A][0x0292] = new Array('CS', '1',
                'SourceApplicatorType');
        newDictionary[0x300A][0x0294] = new Array('LO', '1',
                'SourceApplicatorName');
        newDictionary[0x300A][0x0296] = new Array('DS', '1',
                'SourceApplicatorLength');
        newDictionary[0x300A][0x0298] = new Array('LO', '1',
                'SourceApplicatorManufacturer');
        newDictionary[0x300A][0x029C] = new Array('DS', '1',
                'SourceApplicatorWallNominalThickness');
        newDictionary[0x300A][0x029E] = new Array('DS', '1',
                'SourceApplicatorWallNominalTransmission');
        newDictionary[0x300A][0x02A0] = new Array('DS', '1',
                'SourceApplicatorStepSize');
        newDictionary[0x300A][0x02A2] = new Array('IS', '1',
                'TransferTubeNumber');
        newDictionary[0x300A][0x02A4] = new Array('DS', '1',
                'TransferTubeLength');
        newDictionary[0x300A][0x02B0] = new Array('SQ', '1',
                'ChannelShieldSequence');
        newDictionary[0x300A][0x02B2] = new Array('IS', '1',
                'ChannelShieldNumber');
        newDictionary[0x300A][0x02B3] = new Array('SH', '1', 'ChannelShieldID');
        newDictionary[0x300A][0x02B4] = new Array('LO', '1',
                'ChannelShieldName');
        newDictionary[0x300A][0x02B8] = new Array('DS', '1',
                'ChannelShieldNominalThickness');
        newDictionary[0x300A][0x02BA] = new Array('DS', '1',
                'ChannelShieldNominalTransmission');
        newDictionary[0x300A][0x02C8] = new Array('DS', '1',
                'FinalCumulativeTimeWeight');
        newDictionary[0x300A][0x02D0] = new Array('SQ', '1',
                'BrachyControlPointSequence');
        newDictionary[0x300A][0x02D2] = new Array('DS', '1',
                'ControlPointRelativePosition');
        newDictionary[0x300A][0x02D4] = new Array('DS', '3',
                'ControlPointDPosition');
        newDictionary[0x300A][0x02D6] = new Array('DS', '1',
                'CumulativeTimeWeight');

        newDictionary[0x300C] = new Array();
        newDictionary[0x300C][0x0000] = new Array('UL', '1',
                'RTRelationshipGroupLength');
        newDictionary[0x300C][0x0002] = new Array('SQ', '1',
                'ReferencedRTPlanSequence');
        newDictionary[0x300C][0x0004] = new Array('SQ', '1',
                'ReferencedBeamSequence');
        newDictionary[0x300C][0x0006] = new Array('IS', '1',
                'ReferencedBeamNumber');
        newDictionary[0x300C][0x0007] = new Array('IS', '1',
                'ReferencedReferenceImageNumber');
        newDictionary[0x300C][0x0008] = new Array('DS', '1',
                'StartCumulativeMetersetWeight');
        newDictionary[0x300C][0x0009] = new Array('DS', '1',
                'EndCumulativeMetersetWeight');
        newDictionary[0x300C][0x000A] = new Array('SQ', '1',
                'ReferencedBrachyApplicationSetupSequence');
        newDictionary[0x300C][0x000C] = new Array('IS', '1',
                'ReferencedBrachyApplicationSetupNumber');
        newDictionary[0x300C][0x000E] = new Array('IS', '1',
                'ReferencedSourceNumber');
        newDictionary[0x300C][0x0020] = new Array('SQ', '1',
                'ReferencedFractionGroupSequence');
        newDictionary[0x300C][0x0022] = new Array('IS', '1',
                'ReferencedFractionGroupNumber');
        newDictionary[0x300C][0x0040] = new Array('SQ', '1',
                'ReferencedVerificationImageSequence');
        newDictionary[0x300C][0x0042] = new Array('SQ', '1',
                'ReferencedReferenceImageSequence');
        newDictionary[0x300C][0x0050] = new Array('SQ', '1',
                'ReferencedDoseReferenceSequence');
        newDictionary[0x300C][0x0051] = new Array('IS', '1',
                'ReferencedDoseReferenceNumber');
        newDictionary[0x300C][0x0055] = new Array('SQ', '1',
                'BrachyReferencedDoseReferenceSequence');
        newDictionary[0x300C][0x0060] = new Array('SQ', '1',
                'ReferencedStructureSetSequence');
        newDictionary[0x300C][0x006A] = new Array('IS', '1',
                'ReferencedPatientSetupNumber');
        newDictionary[0x300C][0x0080] = new Array('SQ', '1',
                'ReferencedDoseSequence');
        newDictionary[0x300C][0x00A0] = new Array('IS', '1',
                'ReferencedToleranceTableNumber');
        newDictionary[0x300C][0x00B0] = new Array('SQ', '1',
                'ReferencedBolusSequence');
        newDictionary[0x300C][0x00C0] = new Array('IS', '1',
                'ReferencedWedgeNumber');
        newDictionary[0x300C][0x00D0] = new Array('IS', '1',
                'ReferencedCompensatorNumber');
        newDictionary[0x300C][0x00E0] = new Array('IS', '1',
                'ReferencedBlockNumber');
        newDictionary[0x300C][0x00F0] = new Array('IS', '1',
                'ReferencedControlPointIndex');

        newDictionary[0x300E] = new Array();
        newDictionary[0x300E][0x0000] = new Array('UL', '1',
                'RTApprovalGroupLength');
        newDictionary[0x300E][0x0002] = new Array('CS', '1', 'ApprovalStatus');
        newDictionary[0x300E][0x0004] = new Array('DA', '1', 'ReviewDate');
        newDictionary[0x300E][0x0005] = new Array('TM', '1', 'ReviewTime');
        newDictionary[0x300E][0x0008] = new Array('PN', '1', 'ReviewerName');

        newDictionary[0x4000] = new Array();
        newDictionary[0x4000][0x0000] = new Array('UL', '1', 'TextGroupLength');
        newDictionary[0x4000][0x0010] = new Array('LT', '1-n', 'TextArbitrary');
        newDictionary[0x4000][0x4000] = new Array('LT', '1-n', 'TextComments');

        newDictionary[0x4008] = new Array();
        newDictionary[0x4008][0x0000] = new Array('UL', '1',
                'ResultsGroupLength');
        newDictionary[0x4008][0x0040] = new Array('SH', '1', 'ResultsID');
        newDictionary[0x4008][0x0042] = new Array('LO', '1', 'ResultsIDIssuer');
        newDictionary[0x4008][0x0050] = new Array('SQ', '1',
                'ReferencedInterpretationSequence');
        newDictionary[0x4008][0x0100] = new Array('DA', '1',
                'InterpretationRecordedDate');
        newDictionary[0x4008][0x0101] = new Array('TM', '1',
                'InterpretationRecordedTime');
        newDictionary[0x4008][0x0102] = new Array('PN', '1',
                'InterpretationRecorder');
        newDictionary[0x4008][0x0103] = new Array('LO', '1',
                'ReferenceToRecordedSound');
        newDictionary[0x4008][0x0108] = new Array('DA', '1',
                'InterpretationTranscriptionDate');
        newDictionary[0x4008][0x0109] = new Array('TM', '1',
                'InterpretationTranscriptionTime');
        newDictionary[0x4008][0x010A] = new Array('PN', '1',
                'InterpretationTranscriber');
        newDictionary[0x4008][0x010B] = new Array('ST', '1',
                'InterpretationText');
        newDictionary[0x4008][0x010C] = new Array('PN', '1',
                'InterpretationAuthor');
        newDictionary[0x4008][0x0111] = new Array('SQ', '1',
                'InterpretationApproverSequence');
        newDictionary[0x4008][0x0112] = new Array('DA', '1',
                'InterpretationApprovalDate');
        newDictionary[0x4008][0x0113] = new Array('TM', '1',
                'InterpretationApprovalTime');
        newDictionary[0x4008][0x0114] = new Array('PN', '1',
                'PhysicianApprovingInterpretation');
        newDictionary[0x4008][0x0115] = new Array('LT', '1',
                'InterpretationDiagnosisDescription');
        newDictionary[0x4008][0x0117] = new Array('SQ', '1',
                'DiagnosisCodeSequence');
        newDictionary[0x4008][0x0118] = new Array('SQ', '1',
                'ResultsDistributionListSequence');
        newDictionary[0x4008][0x0119] = new Array('PN', '1', 'DistributionName');
        newDictionary[0x4008][0x011A] = new Array('LO', '1',
                'DistributionAddress');
        newDictionary[0x4008][0x0200] = new Array('SH', '1', 'InterpretationID');
        newDictionary[0x4008][0x0202] = new Array('LO', '1',
                'InterpretationIDIssuer');
        newDictionary[0x4008][0x0210] = new Array('CS', '1',
                'InterpretationTypeID');
        newDictionary[0x4008][0x0212] = new Array('CS', '1',
                'InterpretationStatusID');
        newDictionary[0x4008][0x0300] = new Array('ST', '1', 'Impressions');
        newDictionary[0x4008][0x4000] = new Array('ST', '1', 'ResultsComments');

        newDictionary[0x5000] = new Array();
        newDictionary[0x5000][0x0000] = new Array('UL', '1', 'CurveGroupLength');
        newDictionary[0x5000][0x0005] = new Array('US', '1', 'CurveDimensions');
        newDictionary[0x5000][0x0010] = new Array('US', '1', 'NumberOfPoints');
        newDictionary[0x5000][0x0020] = new Array('CS', '1', 'TypeOfData');
        newDictionary[0x5000][0x0022] = new Array('LO', '1', 'CurveDescription');
        newDictionary[0x5000][0x0030] = new Array('SH', '1-n', 'AxisUnits');
        newDictionary[0x5000][0x0040] = new Array('SH', '1-n', 'AxisLabels');
        newDictionary[0x5000][0x0103] = new Array('US', '1',
                'DataValueRepresentation');
        newDictionary[0x5000][0x0104] = new Array('US', '1-n',
                'MinimumCoordinateValue');
        newDictionary[0x5000][0x0105] = new Array('US', '1-n',
                'MaximumCoordinateValue');
        newDictionary[0x5000][0x0106] = new Array('SH', '1-n', 'CurveRange');
        newDictionary[0x5000][0x0110] = new Array('US', '1',
                'CurveDataDescriptor');
        newDictionary[0x5000][0x0112] = new Array('US', '1',
                'CoordinateStartValue');
        newDictionary[0x5000][0x0114] = new Array('US', '1',
                'CoordinateStepValue');
        newDictionary[0x5000][0x2000] = new Array('US', '1', 'AudioType');
        newDictionary[0x5000][0x2002] = new Array('US', '1',
                'AudioSampleFormat');
        newDictionary[0x5000][0x2004] = new Array('US', '1', 'NumberOfChannels');
        newDictionary[0x5000][0x2006] = new Array('UL', '1', 'NumberOfSamples');
        newDictionary[0x5000][0x2008] = new Array('UL', '1', 'SampleRate');
        newDictionary[0x5000][0x200A] = new Array('UL', '1', 'TotalTime');
        newDictionary[0x5000][0x200C] = new Array('OX', '1', 'AudioSampleData');
        newDictionary[0x5000][0x200E] = new Array('LT', '1', 'AudioComments');
        newDictionary[0x5000][0x3000] = new Array('OX', '1', 'CurveData');

        newDictionary[0x5400] = new Array();
        newDictionary[0x5400][0x0100] = new Array('SQ', '1', 'WaveformSequence');
        newDictionary[0x5400][0x0110] = new Array('OW/OB', '1',
                'ChannelMinimumValue');
        newDictionary[0x5400][0x0112] = new Array('OW/OB', '1',
                'ChannelMaximumValue');
        newDictionary[0x5400][0x1004] = new Array('US', '1',
                'WaveformBitsAllocated');
        newDictionary[0x5400][0x1006] = new Array('CS', '1',
                'WaveformSampleInterpretation');
        newDictionary[0x5400][0x100A] = new Array('OW/OB', '1',
                'WaveformPaddingValue');
        newDictionary[0x5400][0x1010] = new Array('OW/OB', '1', 'WaveformData');

        newDictionary[0x6000] = new Array();
        newDictionary[0x6000][0x0000] = new Array('UL', '1',
                'OverlayGroupLength');
        newDictionary[0x6000][0x0010] = new Array('US', '1', 'OverlayRows');
        newDictionary[0x6000][0x0011] = new Array('US', '1', 'OverlayColumns');
        newDictionary[0x6000][0x0012] = new Array('US', '1', 'OverlayPlanes');
        newDictionary[0x6000][0x0015] = new Array('IS', '1',
                'OverlayNumberOfFrames');
        newDictionary[0x6000][0x0040] = new Array('CS', '1', 'OverlayType');
        newDictionary[0x6000][0x0050] = new Array('SS', '2', 'OverlayOrigin');
        newDictionary[0x6000][0x0051] = new Array('US', '1',
                'OverlayImageFrameOrigin');
        newDictionary[0x6000][0x0052] = new Array('US', '1',
                'OverlayPlaneOrigin');
        newDictionary[0x6000][0x0060] = new Array('CS', '1',
                'OverlayCompressionCode');
        newDictionary[0x6000][0x0061] = new Array('SH', '1',
                'OverlayCompressionOriginator');
        newDictionary[0x6000][0x0062] = new Array('SH', '1',
                'OverlayCompressionLabel');
        newDictionary[0x6000][0x0063] = new Array('SH', '1',
                'OverlayCompressionDescription');
        newDictionary[0x6000][0x0066] = new Array('AT', '1-n',
                'OverlayCompressionStepPointers');
        newDictionary[0x6000][0x0068] = new Array('US', '1',
                'OverlayRepeatInterval');
        newDictionary[0x6000][0x0069] = new Array('US', '1',
                'OverlayBitsGrouped');
        newDictionary[0x6000][0x0100] = new Array('US', '1',
                'OverlayBitsAllocated');
        newDictionary[0x6000][0x0102] = new Array('US', '1',
                'OverlayBitPosition');
        newDictionary[0x6000][0x0110] = new Array('CS', '1', 'OverlayFormat');
        newDictionary[0x6000][0x0200] = new Array('US', '1', 'OverlayLocation');
        newDictionary[0x6000][0x0800] = new Array('CS', '1-n',
                'OverlayCodeLabel');
        newDictionary[0x6000][0x0802] = new Array('US', '1',
                'OverlayNumberOfTables');
        newDictionary[0x6000][0x0803] = new Array('AT', '1-n',
                'OverlayCodeTableLocation');
        newDictionary[0x6000][0x0804] = new Array('US', '1',
                'OverlayBitsForCodeWord');
        newDictionary[0x6000][0x1100] = new Array('US', '1',
                'OverlayDescriptorGray');
        newDictionary[0x6000][0x1101] = new Array('US', '1',
                'OverlayDescriptorRed');
        newDictionary[0x6000][0x1102] = new Array('US', '1',
                'OverlayDescriptorGreen');
        newDictionary[0x6000][0x1103] = new Array('US', '1',
                'OverlayDescriptorBlue');
        newDictionary[0x6000][0x1200] = new Array('US', '1-n', 'OverlayGray');
        newDictionary[0x6000][0x1201] = new Array('US', '1-n', 'OverlayRed');
        newDictionary[0x6000][0x1202] = new Array('US', '1-n', 'OverlayGreen');
        newDictionary[0x6000][0x1203] = new Array('US', '1-n', 'OverlayBlue');
        newDictionary[0x6000][0x1301] = new Array('IS', '1', 'ROIArea');
        newDictionary[0x6000][0x1302] = new Array('DS', '1', 'ROIMean');
        newDictionary[0x6000][0x1303] = new Array('DS', '1',
                'ROIStandardDeviation');
        newDictionary[0x6000][0x3000] = new Array('OW', '1', 'OverlayData');
        newDictionary[0x6000][0x4000] = new Array('LT', '1-n',
                'OverlayComments');

        newDictionary[0x7F00] = new Array();
        newDictionary[0x7F00][0x0000] = new Array('UL', '1',
                'VariablePixelDataGroupLength');
        newDictionary[0x7F00][0x0010] = new Array('OX', '1',
                'VariablePixelData');
        newDictionary[0x7F00][0x0011] = new Array('AT', '1',
                'VariableNextDataGroup');
        newDictionary[0x7F00][0x0020] = new Array('OW', '1-n',
                'VariableCoefficientsSDVN');
        newDictionary[0x7F00][0x0030] = new Array('OW', '1-n',
                'VariableCoefficientsSDHN');
        newDictionary[0x7F00][0x0040] = new Array('OW', '1-n',
                'VariableCoefficientsSDDN');

        newDictionary[0x7FE0] = new Array();
        newDictionary[0x7FE0][0x0000] = new Array('UL', '1',
                'PixelDataGroupLength');
        newDictionary[0x7FE0][0x0010] = new Array('OX', '1', 'PixelData');
        newDictionary[0x7FE0][0x0020] = new Array('OW', '1-n',
                'CoefficientsSDVN');
        newDictionary[0x7FE0][0x0030] = new Array('OW', '1-n',
                'CoefficientsSDHN');
        newDictionary[0x7FE0][0x0040] = new Array('OW', '1-n',
                'CoefficientsSDDN');

        newDictionary[0xFFFC] = new Array();
        newDictionary[0xFFFC][0xFFFC] = new Array('OB', '1',
                'DataSetTrailingPadding');

        newDictionary[0xFFFE] = new Array();
        newDictionary[0xFFFE][0xE000] = new Array('NONE', '1', 'Item');
        newDictionary[0xFFFE][0xE00D] = new Array('NONE', '1',
                'ItemDelimitationItem');
        newDictionary[0xFFFE][0xE0DD] = new Array('NONE', '1',
                'SequenceDelimitationItem');
    }
}

