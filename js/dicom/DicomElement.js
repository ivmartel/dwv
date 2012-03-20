/**
 *  DicomElement.js
 *  Version 0.5
 *  Author: BabuHussain<babuhussain.a@raster.in>
 */
function DicomElement(name,vr,vl,group,element,value,offset) {
    this.vr_type=vr;
    // Element Value
    this.value=value;
    // Element code
    this.length=vl;
    this.group=group;
    this.element=element;
    this.offset=offset;
    this.name=name;
}

