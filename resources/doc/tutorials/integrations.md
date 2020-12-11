This page details some integrations of dwv. PACS integrations will use Web Access to Dicom Object (WADO) protocol (see [conformance](./tutorial-conformance.html#wado)). By integrated, I mean that the PACS would handle the searching and once the data is found would allow the user to launch the viewer. 

Quick summary: [Conquest](#conquest) &#x2705;, [dcm4chee](#dcm4chee) &#x2705;, [Orthanc](#orthanc) &#x2705;, [ClearCanvas](#clearcanvas) &#x274C;, [Google](#google) &#x2705;, [WordPress](#wordpress) &#x2705;

## Conquest 
[Conquest](http://ingenium.home.xs4all.nl/dicom.html): _"a full featured DICOM server based on the public domain UCDMC DICOM code"_ ([entry](http://www.idoimaging.com/program/183) on idoimaging). License: Public Domain (see [medfloss](http://www.medfloss.org/node/93)).

Tested version: [1.4.17](http://forum.image-systems.biz/viewtopic.php?f=33&t=18892). See this [thread](http://85.214.110.44/forum/forum/index.php?thread/17196-conquest-and-html5-js-dicom-viewer-dwv-dwv016-below/) on the Conquest forum and the issue [#15](https://github.com/ivmartel/dwv/issues/15). Operational since dwv `v0.3.0`, available in the [dwv-jqmobile](https://github.com/ivmartel/dwv-jqmobile), [dwv-jqui](https://github.com/ivmartel/dwv-jqui) and [dwv-simplistic](https://github.com/ivmartel/dwv-simplistic) demos.

To setup DWV, follow the instructions written in the lua files of the respective demos `resources/scripts` folder.

Conquest installation details:
  * Under Fedora 18: [install under ubuntu linux](http://blog.kyodium.net/2010/10/install-conquest-on-ubuntu-1004.html) after [installing apache](http://www.howtoforge.com/installing-apache2-with-php5-and-mysql-support-on-fedora-17-lamp)
    * the g++ fedora package is called `gcc-c++`
    * the cgi-bin folder is in `/var/www` 
    * launching services is done using `systemctl`: for example `systemctl start httpd.service` and `systemctl start mysqld.service`
  * Under Windows7: 
    * using [wamp5](http://www.wampserver.com/) (install as admin, see [forum](http://forum.wampserver.com/read.php?1,88043)), the cgi bin folder is in `wamp/bin/apache/apache##/cgi-bin`
    * to launch the PACS: start the wamp service and run the `ConquestDICOMServer.exe`, you can then access the web interface at http://127.0.0.1/cgi-bin/dgate.exe?mode=top.

## Dcm4chee
[dcm4che](http://www.dcm4che.org/): _"DICOM archive and image manager, forming the server side of a PACS system"_ ([entry](http://www.idoimaging.com/program/360) on idoimaging). License: GPL (see [license](http://www.dcm4che.org/confluence/display/proj/license)).

Follow the steps described on the [dwv-dcm4chee-web](https://github.com/ivmartel/dwv-dcm4chee-web) page.

Operational since dwv `v0.7.0` and issue [#1](https://github.com/ivmartel/dwv/issues/1).

## Orthanc
[Orthanc](http://www.orthanc-server.com/): _"Orthanc aims at providing a simple, yet powerful standalone DICOM server. Orthanc can turn any computer running Windows or Linux into a DICOM store (in other words, a mini-PACS system). Its architecture is lightweight, meaning that no complex database administration is required, nor the installation of third-party dependencies."_ ([entry](http://www.idoimaging.com/program/409) on idoimaging). License: GPL (see Licensing on the [download](http://www.orthanc-server.com/download.php) page).

Follow the steps described on the [dwv-orthanc-plugin](https://github.com/ivmartel/dwv-orthanc-plugin) page.

Operational since dwv `v0.8.0beta` and issue [#110](https://github.com/ivmartel/dwv/issues/110).

## ClearCanvas
[ClearCanvas](http://www.clearcanvas.ca): _"...dedicated to making medical imaging and informatics accessible to all by offering both free open source solutions as well as easy-to-use, affordable clinical solutions approved by regulatory agencies worldwide."_ ([entry](http://www.idoimaging.com/program/357) on idoimaging). The code is available on [github](https://github.com/ClearCanvas/ClearCanvas). License: GPL (see [license](https://github.com/ClearCanvas/ClearCanvas/blob/master/LICENSE.TXT)).

In very slow progress: see issue [#22](https://github.com/ivmartel/dwv/issues/22).

## Google
Available via the [dwv-jqmobile](https://github.com/ivmartel/dwv-jqmobile) project.

* Google [Drive web](http://drive.google.com/): right click on a DICOM file and choose `Open with`. DWV should appear in the `Suggested apps`, if not, choose `Connect more apps`, search for 'dwv' and connect it (see [managing drive apps](https://support.google.com/drive/answer/2523073) for details)
* Google Chrome store: [dwv app](https://chrome.google.com/webstore/detail/dwv/elkmgopbfeoimigdmekflnapemieceja) (see the [chrome apps help](https://support.google.com/chrome/answer/3060053) for details)

## WordPress
See [dicom-support](https://wordpress.org/plugins/dicom-support/) plugin and a [demo](https://tyarcaouen.synology.me/wordpress/dwvblog/).
