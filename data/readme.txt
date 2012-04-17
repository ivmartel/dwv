DWV test data
--------------
Data sources:
- Osirix: http://pubimage.hcuge.ch:8080/
- Barre: (Sebastien) http://www.barre.nom.fr/medical/samples/
- Gdcm: :pserver:xxx@cvs.creatis.insa-lyon.fr:2402/cvs/public

* cta.dcm:
 origin: (Osirix) TOUTATIX/Cardiac 1CTA_CORONARY_ARTERIES_TESTBOLUS (Adult)/Heart w-o  1.5  B25f  55% /IM-0001-0100.dcm
 details: 512*512, transfer syntax: 1.2.840.10008.1.2.1 (LittleEndianExplicit)

* cta2.dcm:
 origin: (Osirix) GOUDURIX/Specials 1_CORONARY_CTA_COMBI_SMH/70 % 1.0  B30f/IM-0001-0100.dcm
 details: 512*512, transfer syntax: 1.2.840.10008.1.2 (LittleEndianImplicit)
 
* us:
 origin: (Barre through Gdcm) US-RGB-8-epicard
 details: 512*512, transfer syntax: 1.2.840.10008.1.2.2 (BigEndianExplicit)

* mr.dcm:
 origin: (Osirix) CEREBRIX/Neuro Crane/Axial_T1 - 5352/IM-0001-0100.dcm
 details: 512*512, transfer syntax: 1.2.840.10008.1.2.4.91 (JPEG 2000)
